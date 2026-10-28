/**
 * Peça A do laudo "nada persiste" (#189) — inventário de portões por caso.
 *
 * "Um leitor único que responde: 'o que o banco vai recusar neste caso agora,
 * e por quê'." (reviews/laudo-nada-persiste-2026-10-24.md, seção 4). Fonte
 * única, usada por qualquer tela que precise desse estado — não só o Caso
 * 360 (27/10/2026, decisão da Proprietária: "deve ser construída todas as
 * peças não só no caso 360" — mesmo princípio de etapas-caso.ts para Caso
 * 360/lista/Radar/Painel).
 *
 * Sem inventar tabela nem vocabulário: reaproveita `case_ativacao_bloqueios_reais`
 * (RPC já existente, única fonte de "o que falta" para checklist/consentimento/
 * onboarding_checklist/quality_issues) e soma `piloto_bloqueios`, com o mesmo
 * WHERE que o trigger `fn_piloto_caso_guard` de fato verifica.
 *
 * Correção de premissa (27/10/2026, ver audit-plan-full.md): a Peça A
 * original teria somado piloto_bloqueios ao Caso 360 como se ele ainda
 * bloqueasse a ativação. Desde 25/10, `fn_piloto_caso_guard` e
 * `fn_guard_ativacao` cedem a `fn_proprietaria_operando()` — então
 * `bloqueiaAtivacaoHoje` é calculado por ator (quem está logado agora),
 * não um booleano fixo por portão.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { proprietariaOperando } from "@/lib/autoridade.server";

export type PortaoCaso = {
  /** Regra/chave do portão — aponta para o trigger ou RPC real, nunca um rótulo inventado. */
  portao: string;
  dominio: string;
  /** Tabela e coluna que o banco de fato lê para decidir. */
  tabela: string;
  /** O que o portão protege — texto já em linguagem de equipe (vem da RPC/tabela real). */
  protege: string;
  /** Rota que resolve a pendência, quando existe uma. */
  comoAbrir: string | null;
  /**
   * Verdadeiro/falso só quando a correspondência com o guard real do banco
   * foi verificada (ver histórico do arquivo); null quando o portão é
   * informativo (nenhum guard de ativação o lê) ou a correspondência exata
   * entre a leitura e o guard não foi confirmada — nunca adivinhado.
   */
  bloqueiaAtivacaoHoje: boolean | null;
};

type Supa = { from: (t: string) => any; rpc: (fn: string, args: Record<string, unknown>) => any };

/**
 * `case_ativacao_bloqueios_reais` cobre 4 fontes (checklist de ativação via
 * `case_activation_gates`, consentimento, `onboarding_checklist`,
 * `quality_issues`). Nenhuma delas é lida por `fn_guard_ativacao` — que só
 * testa `case_activation_pendencias` (mais estreita: só
 * `case_activation_checks`, sem o LEFT JOIN de `case_activation_gates`
 * contra requisitos nunca instanciados). As duas podem divergir — por isso
 * `bloqueiaAtivacaoHoje` fica `null` aqui: a leitura é real e confiável como
 * PENDÊNCIA, mas afirmar que ela trava o clique de ativação exigiria provar
 * a equivalência exata com `case_activation_pendencias`, o que este arquivo
 * não faz sem medir caso a caso.
 */
async function portoesDeAtivacao(supabase: Supa, caseId: string): Promise<PortaoCaso[]> {
  const { data } = await supabase.rpc("case_ativacao_bloqueios_reais", { _case: caseId });
  return (
    (data ?? []) as {
      regra: string;
      dominio: string;
      motivo: string;
      tabela_campo: string;
      valor_atual: string;
      cta_tela: string | null;
    }[]
  ).map((b) => ({
    portao: b.regra,
    dominio: b.dominio,
    tabela: b.tabela_campo,
    protege: b.motivo,
    comoAbrir: b.cta_tela,
    bloqueiaAtivacaoHoje: null,
  }));
}

/**
 * `piloto_bloqueios` com status='aberto' e criticidade='critico' é
 * EXATAMENTE o que `fn_piloto_caso_guard` soma em `v_abertos` antes de
 * recusar — mesmo WHERE, linha por linha. Desde 25/10 esse guard cede a
 * `fn_proprietaria_operando()`, então `bloqueiaAtivacaoHoje` é
 * `!souProprietariaOperando` — verdadeiro para qualquer outro papel, falso
 * para quem está logado como admin ativo agora.
 */
export async function portoesDoPilotoDoCaso(
  supabase: Supa,
  caseId: string,
  souProprietariaOperando: boolean,
): Promise<PortaoCaso[]> {
  const { data: caso } = await supabase
    .from("crm_casos")
    .select("piloto")
    .eq("id", caseId)
    .maybeSingle();
  if (!caso?.piloto) return [];

  const { data } = await supabase
    .from("piloto_bloqueios")
    .select("chave,descricao,criticidade")
    .eq("case_id", caseId)
    .eq("status", "aberto")
    .eq("criticidade", "critico")
    .is("archived_at", null);

  return ((data ?? []) as { chave: string; descricao: string; criticidade: string }[]).map((b) => ({
    portao: `piloto_bloqueios.${b.chave}`,
    dominio: "piloto",
    tabela: "piloto_bloqueios",
    protege: b.descricao,
    comoAbrir: null,
    bloqueiaAtivacaoHoje: !souProprietariaOperando,
  }));
}

/** Leitor único: o que o banco vai recusar neste caso agora, e por quê. */
export async function inventarioDePortoesDoCaso(
  supabase: Supa,
  caseId: string,
  userId: string,
): Promise<PortaoCaso[]> {
  const souProprietariaOperando = await proprietariaOperando(supabase, userId);
  const [ativacao, piloto] = await Promise.all([
    portoesDeAtivacao(supabase, caseId),
    portoesDoPilotoDoCaso(supabase, caseId, souProprietariaOperando),
  ]);
  return [...ativacao, ...piloto];
}
