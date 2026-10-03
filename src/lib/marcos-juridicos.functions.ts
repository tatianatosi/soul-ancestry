/**
 * Marcos jurídicos por país — leitor e promoção país a país (03/10/2026).
 *
 * Autorização literal da Proprietária: "promova os 43 marcos juridicos".
 * Regra dela, de 02/10, que continua valendo: a promoção é **país a país,
 * com responsável**, e só marco com fonte oficial vira `vigente`.
 *
 * Antes deste módulo não existia escritor nenhum para
 * `legal_reference_milestones`: o radar (`radar-marcos-juridicos.functions.ts`)
 * só lia, e os 43 marcos ficavam em `a_revisar`/`em_revisao` para sempre. A
 * única forma de promover era SQL manual — que o AGENTS.md proíbe como
 * substituto de fluxo.
 *
 * Vocabulário: só os valores dos CHECKs reais (`vigente`, `homologado`).
 * Nada de `CHECK-*`, nada de sinônimo novo.
 */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { RESPONSAVEL_VALIDACAO_PADRAO } from "@/lib/decisoes-da-proprietaria";
import {
  avaliarPromocao,
  DOCUMENTO_DE_REFERENCIAS,
  fonteOficialDoPais,
  LIFECYCLE_MARCO_HOMOLOGADO,
  notaDePromocao,
  PAISES_SEM_FONTE_DOCUMENTADA,
  STATUS_MARCO_VIGENTE,
  type MarcoParaPromover,
} from "@/lib/marcos-fontes-oficiais";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type MarcoDoPainel = {
  id: string;
  pais: string;
  trilhaCode: string;
  label: string;
  tipo: string;
  status: string;
  lifecycle: string;
  fonteUrl: string | null;
  fonteDocumentada: string | null;
  autoridade: string | null;
  verificadoEm: string | null;
  podePromover: boolean;
  motivoRecusa: string | null;
};

export type PaisDoPainel = {
  pais: string;
  marcos: MarcoDoPainel[];
  comFonte: number;
  vigentes: number;
  promoveis: number;
  fonteDocumentada: boolean;
};

/** Leitor do painel de marcos jurídicos por país. Nenhuma escrita. */
export const painelMarcosJuridicos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa os marcos jurídicos.");

    const [marcos, trilhas] = await Promise.all([
      (supabase as any)
        .from("legal_reference_milestones")
        .select("id,track_id,label,reference_type,status,lifecycle_status,official_source_url,verified_at,notes")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      (supabase as any)
        .from("citizenship_tracks")
        .select("id,pais,code")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
    ]);

    const trilhaPorId = new Map(
      ((trilhas.data ?? []) as { id: string; pais: string | null; code: string | null }[]).map((t) => [t.id, t]),
    );

    const porPais = new Map<string, MarcoDoPainel[]>();
    for (const m of (marcos.data ?? []) as Record<string, any>[]) {
      const trilha = trilhaPorId.get(m.track_id as string);
      const pais = trilha?.pais?.trim() || "País não registrado";
      const fonte = fonteOficialDoPais(pais);
      const avaliacao = avaliarPromocao(m as MarcoParaPromover, pais);
      const linha: MarcoDoPainel = {
        id: m.id as string,
        pais,
        trilhaCode: trilha?.code ?? "—",
        label: (m.label as string) ?? "Marco sem título",
        tipo: (m.reference_type as string) ?? "lei",
        status: (m.status as string) ?? "—",
        lifecycle: (m.lifecycle_status as string) ?? "—",
        fonteUrl: (m.official_source_url as string) ?? null,
        fonteDocumentada: fonte ? fonte.url : null,
        autoridade: fonte ? fonte.autoridade : null,
        verificadoEm: (m.verified_at as string) ?? null,
        podePromover: avaliacao.pode,
        motivoRecusa: avaliacao.pode ? null : avaliacao.explicacao,
      };
      const lista = porPais.get(pais) ?? [];
      lista.push(linha);
      porPais.set(pais, lista);
    }

    const paises: PaisDoPainel[] = [...porPais.entries()]
      .map(([pais, lista]) => ({
        pais,
        marcos: lista.sort((a, b) => a.label.localeCompare(b.label)),
        comFonte: lista.filter((m) => m.fonteUrl).length,
        vigentes: lista.filter((m) => m.status === STATUS_MARCO_VIGENTE).length,
        promoveis: lista.filter((m) => m.podePromover).length,
        fonteDocumentada: Boolean(fonteOficialDoPais(pais)),
      }))
      .sort((a, b) => b.promoveis - a.promoveis || a.pais.localeCompare(b.pais));

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      responsavelPadrao: RESPONSAVEL_VALIDACAO_PADRAO,
      documentoDeReferencias: DOCUMENTO_DE_REFERENCIAS,
      paisesSemFonteDocumentada: PAISES_SEM_FONTE_DOCUMENTADA,
      paises,
      total: paises.reduce((s, p) => s + p.marcos.length, 0),
      totalComFonte: paises.reduce((s, p) => s + p.comFonte, 0),
      totalVigentes: paises.reduce((s, p) => s + p.vigentes, 0),
    };
  });

export type ResultadoPromocao = {
  pais: string;
  responsavel: string;
  promovidos: { id: string; label: string; fonte: string }[];
  recusados: { id: string; label: string; motivo: string }[];
};

/**
 * Promove os marcos de UM país a `vigente`/`homologado`.
 *
 * O que ela faz, e só isso:
 * - preenche `official_source_url` quando está vazio **e** o país tem fonte
 *   oficial documentada no repositório (nunca inventa endereço);
 * - grava `status = 'vigente'`, `lifecycle_status = 'homologado'`,
 *   `verified_at`/`verified_by` com a sessão autenticada;
 * - preserva `review_required` como está (a revisão humana não se dispensa
 *   por promoção);
 * - só escreve em `notes` quando o campo está vazio — nota de outro humano
 *   nunca é sobrescrita.
 *
 * Recusa, com motivo legível, marco "Não aplicável", marco já vigente e
 * país sem fonte oficial documentada. Nunca promove em massa todos os
 * países: um por chamada, com responsável — regra da Proprietária.
 */
export const promoverMarcosDoPais = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pais: string; responsavel?: string }) => d)
  .handler(async ({ data, context }): Promise<ResultadoPromocao> => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode promover marco jurídico.");

    const pais = (data.pais ?? "").trim();
    if (!pais) throw new Error("Informe o país cujos marcos serão promovidos.");
    const responsavel = (data.responsavel ?? "").trim() || RESPONSAVEL_VALIDACAO_PADRAO;

    const trilhas = await (supabase as any)
      .from("citizenship_tracks")
      .select("id,pais")
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    const ids = ((trilhas.data ?? []) as { id: string; pais: string | null }[])
      .filter((t) => (t.pais ?? "").trim() === pais)
      .map((t) => t.id);
    if (ids.length === 0) throw new Error(`Nenhuma trilha jurídica registrada para "${pais}".`);

    const marcos = await (supabase as any)
      .from("legal_reference_milestones")
      .select("id,label,status,lifecycle_status,official_source_url,notes")
      .eq("organization_id", organizationId)
      .in("track_id", ids)
      .is("archived_at", null);

    const fonte = fonteOficialDoPais(pais);
    const agora = new Date().toISOString();
    const promovidos: ResultadoPromocao["promovidos"] = [];
    const recusados: ResultadoPromocao["recusados"] = [];

    for (const m of (marcos.data ?? []) as MarcoParaPromover[]) {
      const avaliacao = avaliarPromocao(m, pais);
      if (!avaliacao.pode) {
        recusados.push({ id: m.id, label: m.label ?? "—", motivo: avaliacao.explicacao });
        continue;
      }
      const payload: Record<string, unknown> = {
        status: STATUS_MARCO_VIGENTE,
        lifecycle_status: LIFECYCLE_MARCO_HOMOLOGADO,
      };
      if (avaliacao.urlAAplicar) payload.official_source_url = avaliacao.urlAAplicar;
      if (!(m.notes ?? "").trim() && fonte) payload.notes = notaDePromocao(pais, fonte, responsavel, agora.slice(0, 10));

      const r = await gravarComVerificacao({
        supabase: supabase as any,
        tabela: "legal_reference_milestones",
        id: m.id,
        organizationId,
        userId,
        payload,
        derivados: { verified_at: agora, verified_by: userId },
      });

      promovidos.push({
        id: m.id,
        label: m.label ?? "—",
        fonte: String((r.registro as Record<string, unknown>).official_source_url ?? ""),
      });

      await (supabase as any).from("audit_logs").insert({
        organization_id: organizationId,
        entidade: "legal_reference_milestones",
        entidade_id: m.id,
        acao: "marco_juridico_promovido_a_vigente",
        user_id: userId,
        valores_anteriores: { status: m.status, lifecycle_status: m.lifecycle_status, official_source_url: m.official_source_url },
        valores_posteriores: payload,
        metadados: { pais, responsavel, documento_de_referencias: DOCUMENTO_DE_REFERENCIAS },
      });
    }

    return { pais, responsavel, promovidos, recusados };
  });
