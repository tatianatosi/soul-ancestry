/**
 * Superfície de go-live — leitura enxuta do caso canônico.
 *
 * 14/09/2026 — decisão da Proprietária: em vez de remendar o Desk histórico,
 * existe um shell novo que carrega SOMENTE o caso canônico
 * `CA-CID-AT-FAM-2026-001` (Projeto familiar — Ana Luiza).
 *
 * Regras desta leitura:
 * - nada é apagado: registros de demonstração, teste, QA, homologação e
 *   fixtures simplesmente não são carregados aqui;
 * - nenhuma tabela nova, nenhuma migration, nenhum cliente administrativo;
 * - a RLS da organização continua sendo quem decide o que o usuário enxerga;
 * - ausência de dado vira estado vazio declarado, nunca número estimado.
 */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { ehRegistroDeTeste } from "@/lib/registros-teste";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

/** Código do único caso carregado pela superfície de go-live. */
export const CODIGO_CASO_GO_LIVE = "CA-CID-AT-FAM-2026-001";

async function organizacaoDo(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/** Leitura tolerante: tabela ausente, coluna diferente ou sem permissão vira lista vazia. */
async function lista(
  supabase: any,
  tabela: string,
  coluna: string,
  valor: string,
  campos = "*",
): Promise<Linha[]> {
  try {
    const { data, error } = await supabase
      .from(tabela)
      .select(campos)
      .eq(coluna, valor)
      .is("archived_at", null)
      .limit(50);
    if (error) return [];
    return (data ?? []) as Linha[];
  } catch {
    return [];
  }
}

export type DadosGoLive = Awaited<ReturnType<typeof carregarGoLive>>;

export const carregarGoLive = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: caso, error } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("codigo", CODIGO_CASO_GO_LIVE)
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!caso) {
      return {
        encontrado: false as const,
        codigo: CODIGO_CASO_GO_LIVE,
      };
    }

    const casoId = String(caso.id);
    const [membros, documentos, microentregas, projecoes, contratos, faturas, planos, equipe] =
      await Promise.all([
        lista(supabase, "case_members", "case_id", casoId),
        lista(supabase, "documents", "case_id", casoId),
        lista(supabase, "ops_microentregas", "caso_id", casoId),
        lista(supabase, "app_projections", "case_id", casoId),
        lista(supabase, "contracts", "case_id", casoId),
        lista(supabase, "invoices", "case_id", casoId),
        lista(supabase, "case_plans", "case_id", casoId),
        lista(supabase, "organization_members", "organization_id", organizationId),
      ]);

    const limpar = (linhas: Linha[]) =>
      linhas.filter(
        (l) =>
          !ehRegistroDeTeste({
            codigo: l["codigo"] ?? l["contract_number"] ?? l["numero"],
            titulo: l["titulo"] ?? l["title"] ?? l["title_client"] ?? l["nome"],
            demo: l["demo"],
            is_demo: l["dados_teste"],
          }),
      );

    const plano = planos[0] ?? null;

    /* ------------------------------------------------------------------
     * Consolidação de referência da pessoa canônica (14/09/2026).
     * Só leitura: nenhuma tabela nova, nenhuma mesclagem automática,
     * nenhum registro apagado. Duplicidades ficam marcadas como legado
     * fora do shell, e conflito vira "revisar identidade" para a
     * Proprietária decidir — nunca escolha por inferência.
     * ---------------------------------------------------------------- */
    const normaliza = (v: unknown) =>
      String(v ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const clienteCanonico = caso.cliente_id
      ? (await supabase.from("clientes").select("id,nome,email,telefone").eq("id", caso.cliente_id).maybeSingle()).data
      : null;

    const membrosVivos = limpar(membros);
    const contratante =
      membrosVivos.find((m) => m["contratante"] === true || normaliza(m["papel_no_caso"]) === "contratante") ?? null;

    const nomeCanonico =
      (clienteCanonico?.nome as string) ?? (contratante?.["nome"] as string) ?? null;

    // Candidatos com o mesmo nome em outros cadastros (não são carregados no shell).
    const [outrosClientes, outrosMembros, outrosContatos, aliases] = await Promise.all([
      nomeCanonico
        ? supabase.from("clientes").select("id,nome,email").ilike("nome", `%${nomeCanonico.split(" ")[0]}%`).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      nomeCanonico
        ? supabase.from("case_members").select("id,case_id,nome").ilike("nome", `%${nomeCanonico.split(" ")[0]}%`).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      nomeCanonico
        ? supabase.from("contacts").select("id,nome").ilike("nome", `%${nomeCanonico.split(" ")[0]}%`).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      supabase.from("case_aliases").select("id,alias,alias_type").eq("case_id", casoId),
    ]);

    const alvo = normaliza(nomeCanonico);
    const legado: { id: string; origem: string; rotulo: string; motivo: string }[] = [];

    for (const c of ((outrosClientes as any)?.data ?? []) as Linha[]) {
      if (String(c["id"]) === String(clienteCanonico?.id ?? "")) continue;
      if (normaliza(c["nome"]) !== alvo) continue;
      legado.push({ id: String(c["id"]), origem: "Cadastro de cliente", rotulo: String(c["nome"]), motivo: "Duplicidade mantida fora do piloto" });
    }
    for (const m of ((outrosMembros as any)?.data ?? []) as Linha[]) {
      if (String(m["case_id"]) === casoId) continue;
      if (normaliza(m["nome"]) !== alvo) continue;
      legado.push({ id: String(m["id"]), origem: "Pessoa em outro caso", rotulo: String(m["nome"]), motivo: "Caso fora do piloto" });
    }
    for (const c of ((outrosContatos as any)?.data ?? []) as Linha[]) {
      if (normaliza(c["nome"]) !== alvo) continue;
      legado.push({ id: String(c["id"]), origem: "Contato", rotulo: String(c["nome"]), motivo: "Registro histórico" });
    }
    for (const a of (((aliases as any)?.data ?? []) as Linha[])) {
      legado.push({
        id: String(a["id"]),
        origem: "Referência antiga do caso",
        rotulo: String(a["alias"]),
        motivo: "Resolve para o código canônico",
      });
    }

    // Pessoas do caso com nome equivalente ao canônico, além da própria.
    const duplicadasNoCaso = membrosVivos.filter(
      (m) => normaliza(m["nome"]) === alvo && String(m["id"]) !== String(contratante?.["id"] ?? ""),
    );

    const motivosConflito: string[] = [];
    if (!clienteCanonico && !contratante) motivosConflito.push("Nenhuma pessoa principal identificada no caso.");
    if (clienteCanonico && contratante && normaliza(clienteCanonico.nome) !== normaliza(contratante["nome"]))
      motivosConflito.push("Cliente do cadastro e contratante do caso têm nomes diferentes.");
    if (duplicadasNoCaso.length > 0) motivosConflito.push("Há mais de uma pessoa com o mesmo nome dentro do caso.");

    const nucleos = await lista(supabase, "nucleos_familiares", "case_id", casoId);
    const nucleo = nucleos[0] ?? null;
    const nucleoMembros = nucleo
      ? await lista(supabase, "nucleo_membros", "nucleo_id", String(nucleo["id"]), "id,nome,papel,vinculo")
      : [];

    return {
      encontrado: true as const,
      codigo: CODIGO_CASO_GO_LIVE,
      caso: {
        id: casoId,
        codigo: String(caso.codigo ?? CODIGO_CASO_GO_LIVE),
        titulo: (caso.titulo as string) ?? "Projeto familiar — Ana Luiza",
        cliente: (caso.cliente_nome as string) ?? null,
        status: (caso.status as string) ?? null,
        fase: (caso.fase as string) ?? null,
        pais: (caso.pais as string) ?? null,
        proximaAcao: (caso.proxima_acao as string) ?? null,
        responsavel: (caso.proxima_acao_responsavel as string) ?? (caso.responsavel_principal as string) ?? null,
        prazo: (caso.prazo_proxima_acao as string) ?? null,
        contratoAssinado: caso.contrato_assinado === true,
        pagamentoConfirmado: caso.pagamento_confirmado === true,
        documentosMinimosOk: caso.documentos_minimos_ok === true,
      },
      plano: plano
        ? {
            fase: (plano["fase_jornada"] as string) ?? null,
            marco: (plano["marco_atual"] as string) ?? null,
            proximaAcao: (plano["proxima_acao"] as string) ?? null,
            prazo: (plano["prazo_proxima_acao"] as string) ?? null,
            proximaMicroentrega: (plano["proxima_microentrega"] as string) ?? null,
          }
        : null,
      pessoas: limpar(membros).map((m) => ({
        id: String(m["id"]),
        nome: (m["nome"] as string) ?? "Pessoa sem nome registrado",
        papel: (m["papel_no_caso"] as string) ?? (m["parentesco"] as string) ?? null,
      })),
      documentos: limpar(documentos).map((d) => ({
        id: String(d["id"]),
        titulo: (d["titulo"] as string) ?? (d["nome_arquivo"] as string) ?? "Documento sem título",
        status: (d["status"] as string) ?? null,
        liberadoCliente: d["liberado_cliente"] === true,
      })),
      microentregas: limpar(microentregas).map((m) => ({
        id: String(m["id"]),
        titulo: (m["titulo"] as string) ?? "Microentrega sem título",
        status: (m["status"] as string) ?? null,
        fase: (m["fase"] as string) ?? null,
        prazo: (m["prazo"] as string) ?? null,
      })),
      publicados: limpar(projecoes)
        .filter((p) => ["published", "publicada", "aprovada", "approved"].includes(String(p["approval_status"])))
        .map((p) => ({
          id: String(p["id"]),
          tipo: (p["projection_type"] as string) ?? "conteúdo",
          resumo: (p["content_sanitized"] as string) ?? null,
          em: (p["approved_at"] as string) ?? (p["effective_from"] as string) ?? null,
        })),
      contratos: limpar(contratos).map((c) => ({
        id: String(c["id"]),
        numero: (c["contract_number"] as string) ?? null,
        titulo: (c["title"] as string) ?? "Instrumento sem título",
        status: (c["status"] as string) ?? null,
        assinadoEm: (c["signed_at"] as string) ?? null,
      })),
      faturas: limpar(faturas).map((f) => ({
        id: String(f["id"]),
        numero: (f["numero"] as string) ?? null,
        valor: (f["valor"] as number) ?? null,
        status: (f["status"] as string) ?? null,
        vencimento: (f["vencimento"] as string) ?? null,
      })),
      equipeTotal: equipe.length,
    };
  });
