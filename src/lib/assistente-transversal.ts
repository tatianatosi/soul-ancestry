/**
 * CA-UX-03 — Adendo v1.0: Assistente transversal do Desk Intelligence.
 *
 * Registro puro de regras. Não cria rota, não cria oitava aba, não é fonte de
 * verdade de dado operacional e não concede permissão adicional: apenas
 * declara, por tela do mockup, qual contexto o Assistente pode ler e qual
 * resultado pode produzir, respeitando papel, organização e RLS já existentes.
 *
 * Sidebar canônica (2026-09-11): 7 telas do mockup. Eixos internos
 * (Comercial, Formalização, Governança…) são contexto — não grupos de menu.
 */

import { GRUPOS_DESK, MENU_CONTA } from "@/lib/navegacao-desk";

export const SELO_DEMO_ASSISTENTE = "DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO";
export const EVENTO_BLOQUEIO_ASSISTENTE = "analysis_blocked_insufficient_case_data";

export type PapelAssistente =
  | "admin"
  | "operacoes"
  | "pesquisador"
  | "comercial"
  | "financeiro"
  | "leitura";

/** IDs alinhados a `GRUPOS_DESK` + menu da conta (contexto admin). */
export type GrupoAssistenteId =
  | "visao-geral"
  | "casos-360"
  | "checklist"
  | "validacao-juridica"
  | "radar-interno"
  | "alertas"
  | "biblioteca-mestre"
  | "conta";

export type RegraAssistente = {
  grupo: GrupoAssistenteId;
  label: string;
  /** Contexto que o Assistente pode ler nesta superfície. */
  contexto: string;
  /** Resultado que ele pode produzir nesta superfície. */
  resultado: string;
  /** Papéis autorizados a ver o Assistente neste grupo. */
  papeis: readonly PapelAssistente[];
  /** Verdadeiro quando a tela admite análise vinculada a um caso confirmado. */
  analisaCaso: boolean;
};

const TODOS: readonly PapelAssistente[] = [
  "admin",
  "operacoes",
  "pesquisador",
  "comercial",
  "financeiro",
  "leitura",
];

export const REGRAS_ASSISTENTE: readonly RegraAssistente[] = [
  {
    grupo: "visao-geral",
    label: "Visão Geral",
    contexto: "Prioridades do dia, alertas, Mesa de Discovery e contexto comercial/marketing",
    resultado: "Explicar prioridades, resumir bloqueios e sugerir navegação interna",
    papeis: TODOS,
    analisaCaso: false,
  },
  {
    grupo: "casos-360",
    label: "Casos 360",
    contexto: "Caso confirmado, pessoas, núcleo, formalização e portal",
    resultado: "Sintetizar estado do caso e próximos passos internos",
    papeis: ["admin", "operacoes", "pesquisador", "comercial", "financeiro", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "checklist",
    label: "Checklist",
    contexto: "Tarefas, prazos, operação e exceções",
    resultado: "Orientar a fila de trabalho sem inventar status",
    papeis: ["admin", "operacoes", "pesquisador", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "validacao-juridica",
    label: "Validação Jurídica",
    contexto: "Elegibilidade, requisito legal e parecer humano por caso",
    resultado: "Explicar pendência jurídica sem emitir parecer automático",
    papeis: ["admin", "operacoes", "pesquisador", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "radar-interno",
    label: "Radar Interno",
    contexto: "Riscos, prioridades e saúde da carteira",
    resultado: "Resumir riscos e apontar o caso que precisa de atenção",
    papeis: ["admin", "operacoes", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "alertas",
    label: "Alertas",
    contexto: "Achados e notificações acionáveis",
    resultado: "Explicar o alerta e o destino da ação",
    papeis: TODOS,
    analisaCaso: true,
  },
  {
    grupo: "biblioteca-mestre",
    label: "Biblioteca Mestre",
    contexto: "Conteúdo, pesquisa, fontes e modelos reutilizáveis",
    resultado:
      "Organizar evidências existentes e formular hipóteses marcadas como não confirmadas",
    papeis: ["admin", "operacoes", "pesquisador", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "conta",
    label: "Conta e administração",
    contexto: "Papéis, legado arquivado, integrações e configurações",
    resultado: "Orientar administração sem misturar com a fila do dia",
    papeis: TODOS,
    analisaCaso: false,
  },
];

export function regraDoGrupo(grupo: GrupoAssistenteId): RegraAssistente {
  return REGRAS_ASSISTENTE.find((r) => r.grupo === grupo) ?? REGRAS_ASSISTENTE[0]!;
}

/**
 * Descobre a tela a partir da rota usando o registro canônico de navegação
 * (`GRUPOS_DESK`), por prefixo mais longo. Sem segunda fonte de verdade.
 */
export function grupoDaRota(rota: string): GrupoAssistenteId {
  for (const item of MENU_CONTA.itens) {
    if (!("to" in item)) continue;
    if (rota === item.to || rota.startsWith(`${item.to}/`)) return "conta";
  }
  let melhor: { id: string; tamanho: number } = { id: "visao-geral", tamanho: -1 };
  for (const grupo of GRUPOS_DESK) {
    const rotas = [grupo.to, ...grupo.sub.flatMap((s) => ("to" in s ? [s.to] : []))];
    for (const alvo of rotas) {
      const casa = rota === alvo || rota.startsWith(`${alvo}/`);
      if (casa && alvo.length > melhor.tamanho) melhor = { id: grupo.id, tamanho: alvo.length };
    }
  }
  return melhor.id as GrupoAssistenteId;
}

/** Presença do Assistente: papel autorizado + superfície interna. Nunca no App Cliente. */
export function assistenteVisivel(entrada: {
  superficieInterna: boolean;
  papeis: readonly string[];
  rota: string;
}): boolean {
  if (!entrada.superficieInterna) return false;
  if (entrada.rota.startsWith("/portal") || entrada.rota.startsWith("/acesso")) return false;
  if (entrada.papeis.length === 0) return false;
  const itensAdmin = [...MENU_CONTA.itens, ...GRUPOS_DESK.flatMap((g) => g.sub)];
  const restritaAdmin = itensAdmin.some(
    (i) =>
      "to" in i &&
      i.adminOnly === true &&
      (entrada.rota === i.to || entrada.rota.startsWith(`${i.to}/`)),
  );
  if (restritaAdmin && !entrada.papeis.includes("admin")) return false;
  const regra = regraDoGrupo(grupoDaRota(entrada.rota));
  return entrada.papeis.some((p) => regra.papeis.includes(p as PapelAssistente));
}

/** Candidato a caso presente na URL — sugestão, jamais seleção efetiva. */
export function casoCandidatoDaRota(rota: string): string | null {
  const partes = rota.split("/").filter(Boolean);
  const uuid = partes.find((p) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p),
  );
  return uuid ?? null;
}

export type EstadoAssistente = {
  grupo: GrupoAssistenteId;
  regra: RegraAssistente;
  rota: string;
  /** Caso sugerido pela URL, ainda não confirmado por pessoa. */
  casoCandidato: string | null;
  /** Caso efetivamente confirmado pela pessoa usuária. */
  casoConfirmado: string | null;
  /** Só há análise por caso quando o grupo admite E houve confirmação explícita. */
  podeAnalisarCaso: boolean;
  /** Sem caso confirmado o Assistente é orientador de navegação. */
  modo: "analise" | "orientacao";
};

/**
 * Estado declarado do Assistente. Trocar URL/aba muda o candidato, nunca o caso
 * confirmado: se a rota mudar de caso, a confirmação anterior é descartada e o
 * Assistente volta a exigir confirmação explícita.
 */
export function estadoAssistente(entrada: {
  rota: string;
  confirmado?: { casoId: string; rota: string } | null;
}): EstadoAssistente {
  const grupo = grupoDaRota(entrada.rota);
  const regra = regraDoGrupo(grupo);
  const candidato = casoCandidatoDaRota(entrada.rota);
  const confirmado =
    entrada.confirmado && entrada.confirmado.casoId === candidato ? entrada.confirmado.casoId : null;
  const podeAnalisarCaso = regra.analisaCaso && Boolean(confirmado);
  return {
    grupo,
    regra,
    rota: entrada.rota,
    casoCandidato: candidato,
    casoConfirmado: confirmado,
    podeAnalisarCaso,
    modo: podeAnalisarCaso ? "analise" : "orientacao",
  };
}

/** Atalhos internos da tela — abrem rota existente, não executam mudança. */
export function atalhosDoGrupo(grupo: GrupoAssistenteId): readonly { to: string; label: string }[] {
  if (grupo === "conta") {
    return MENU_CONTA.itens.flatMap((s) => ("to" in s ? [{ to: s.to, label: s.label }] : []));
  }
  const registro = GRUPOS_DESK.find((g) => g.id === grupo);
  if (!registro) return [];
  const itens = registro.sub.flatMap((s) => ("to" in s ? [{ to: s.to, label: s.label }] : []));
  const vistos = new Set<string>();
  return itens.filter((i) => (vistos.has(i.to + i.label) ? false : (vistos.add(i.to + i.label), true)));
}
