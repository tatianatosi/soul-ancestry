/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Leitor e cálculo do orçamento por produto-pai × país (v3.0, 04/10/2026).
 *
 * Fonte de preço: `price_catalog_rescued` com `price_status = 'VIGENTE'` — a
 * tabela que a Proprietária declarou vigente hoje. Nunca `product_catalog`,
 * nunca Planilha Mestre, nunca SKU em runtime: o SKU legado sobrevive só como
 * de-para em `legacy_sku_mappings`, que esta camada lê para saber o valor do
 * módulo, sempre pelo produto-pai.
 *
 * Nada aqui envia, assina, cobra, parcela de verdade nem cria link.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import {
  calcularOrcamentoProdutoPai,
  type ModuloEscolhido,
  type ProcessoDoPais,
} from "@/lib/orcamento-produtos-pai";

const COMPONENTE_PARA_CAMPO: Record<string, keyof ProcessoDoPais> = {
  honorarios: "honorarios",
  despesas: "despesas_terceiros",
  taxas: "taxas_oficiais",
  outros: "outros",
  parcelas_padrao: "parcelas",
};

/** Processo completo por país, montado dos componentes vigentes. */
async function precosVigentes(supabase: any, organizationId: string): Promise<ProcessoDoPais[]> {
  const { data, error } = await supabase
    .from("price_catalog_rescued")
    .select("country_code,price_component,amount,item_id,price_status")
    .eq("organization_id", organizationId)
    .eq("price_status", "VIGENTE")
    .is("archived_at", null);
  if (error) throw new Error(error.message);

  const porPais = new Map<string, ProcessoDoPais>();
  for (const l of (data ?? []) as any[]) {
    const pais = String(l.country_code ?? "").trim();
    // Linha sem país é módulo transversal (assinaturas, memória): não é processo.
    if (!pais) continue;
    // Só o processo completo do país: módulo por item entra pelo de-para.
    if (l.item_id && !["CA-PROT-001", "PROCESSO_COMPLETO"].includes(String(l.item_id))) continue;
    const campo = COMPONENTE_PARA_CAMPO[String(l.price_component)];
    if (!campo) continue;
    if (!porPais.has(pais)) {
      porPais.set(pais, { pais, honorarios: null, despesas_terceiros: null, taxas_oficiais: null, outros: 0, parcelas: null });
    }
    const atual = porPais.get(pais)!;
    const valor = l.amount === null || l.amount === undefined ? null : Number(l.amount);
    (atual as any)[campo] = valor;
  }
  return [...porPais.values()].sort((a, b) => a.pais.localeCompare(b.pais));
}

/** Módulos disponíveis por produto-pai, pelo de-para do SKU legado. */
async function modulosDisponiveis(supabase: any, organizationId: string) {
  const { data, error } = await supabase
    .from("legacy_sku_mappings")
    .select("legacy_sku,produto_pai_codigo,modulo_nome,country_code,amount")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("produto_pai_codigo", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((m) => ({
    skuLegado: String(m.legacy_sku),
    produtoPai: String(m.produto_pai_codigo),
    nome: (m.modulo_nome as string) ?? String(m.legacy_sku),
    pais: (m.country_code as string | null) ?? null,
    valor: m.amount === null || m.amount === undefined ? null : Number(m.amount),
  }));
}

/** Tabela vigente + módulos + produto-pai e país do caso. */
export const tabelaPrecosDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data?: { caseId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    let produtoPaiDoCaso: string | null = null;
    let rotaDoCaso: string | null = null;
    if (data?.caseId) {
      const { data: plano } = await supabase
        .from("case_plans")
        .select("produto_pai_id,rota_confirmada")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      produtoPaiDoCaso = (plano?.produto_pai_id as string | null) ?? null;
      rotaDoCaso = (plano?.rota_confirmada as string | null) ?? null;
    }

    const [paises, modulos] = await Promise.all([
      precosVigentes(supabase, organizationId),
      modulosDisponiveis(supabase, organizationId),
    ]);
    return { produtoPaiDoCaso, rotaDoCaso, paises, modulos };
  });

type EntradaCalculoPai = {
  caseId: string;
  produtoPaiPrincipal: string;
  pais: string;
  paisesAdicionais?: { pais: string; reducaoBaseCompartilhada?: number; reducaoAprovadaPor?: string }[];
  modulos?: { skuLegado: string; quantidade: number }[];
  participantesAdicionais?: number;
  descontoAprovado?: number;
  descontoMotivo?: string;
  condicaoParticular?: { valor: number; moeda: string; motivo: string };
  parcelas?: number | null;
};

/** Calcula sem gravar — a conta é do servidor, não do navegador. */
export const calcularOrcamentoPorProdutoPai = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EntradaCalculoPai) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    if (!data?.pais) throw new Error("Informe o país principal da trilha.");
    if (!data?.produtoPaiPrincipal) throw new Error("Informe o produto-pai que rege o orçamento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const [paises, modulos] = await Promise.all([
      precosVigentes(supabase, organizationId),
      modulosDisponiveis(supabase, organizationId),
    ]);

    const achar = (pais: string) =>
      paises.find((p) => p.pais === pais) ?? {
        pais,
        honorarios: null,
        despesas_terceiros: null,
        taxas_oficiais: null,
        outros: null,
        parcelas: null,
      };

    const escolhidos: ModuloEscolhido[] = (data.modulos ?? []).map((m) => {
      const ref = modulos.find((x) => x.skuLegado === m.skuLegado);
      return {
        produtoPai: ref?.produtoPai ?? "desconhecido",
        nome: ref?.nome ?? m.skuLegado,
        pais: ref?.pais ?? null,
        valor: ref?.valor ?? null,
        quantidade: m.quantidade,
      };
    });

    const participante = modulos.find((m) => m.produtoPai === "CA-PROT-003");
    const orcamento = calcularOrcamentoProdutoPai({
      produtoPaiPrincipal: data.produtoPaiPrincipal,
      principal: achar(data.pais),
      trilhasAdicionais: (data.paisesAdicionais ?? []).map((t) => ({
        processo: achar(t.pais),
        reducaoBaseCompartilhada: t.reducaoBaseCompartilhada,
        reducaoAprovadaPor: t.reducaoAprovadaPor ?? null,
      })),
      modulos: escolhidos,
      participantesAdicionais:
        data.participantesAdicionais && data.participantesAdicionais > 0
          ? { valor: participante?.valor ?? null, quantidade: data.participantesAdicionais }
          : null,
      descontoAprovado: data.descontoAprovado,
      descontoMotivo: data.descontoMotivo,
      condicaoParticular: data.condicaoParticular ?? null,
      parcelas: data.parcelas ?? null,
    });

    return { orcamento };
  });
