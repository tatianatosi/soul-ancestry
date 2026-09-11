/**
 * CA-UX-03 — Adendo v1.0: Assistente transversal do Desk Intelligence.
 *
 * Registro puro de regras. Não cria rota, não cria nona aba, não é fonte de
 * verdade de dado operacional e não concede permissão adicional: apenas
 * declara, por grupo, qual contexto o Assistente pode ler e qual resultado
 * pode produzir, respeitando papel, organização e RLS já existentes.
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

export type GrupoAssistenteId =
  | "hoje"
  | "comercial"
  | "casos"
  | "pesquisa"
  | "contratos"
  | "governanca";

export type RegraAssistente = {
  grupo: GrupoAssistenteId;
  label: string;
  /** Contexto que o Assistente pode ler nesta superfície. */
  contexto: string;
  /** Resultado que ele pode produzir nesta superfície. */
  resultado: string;
  /** Papéis autorizados a ver o Assistente neste grupo. */
  papeis: readonly PapelAssistente[];
  /** Verdadeiro quando o grupo admite análise vinculada a um caso confirmado. */
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
    grupo: "hoje",
    label: "Hoje",
    contexto: "KPIs vivos, fila do dia, alertas e bloqueios",
    resultado: "Explicar prioridades, resumir bloqueios e sugerir navegação interna",
    papeis: TODOS,
    analisaCaso: false,
  },
  {
    grupo: "comercial",
    label: "Comercial",
    contexto: "Leads, Calls, Discovery, proposta e conversão — CRM Vivo",
    resultado: "Explicar o funil e o próximo passo comercial, sem inventar origem",
    papeis: ["admin", "operacoes", "comercial", "leitura"],
    analisaCaso: false,
  },
  {
    grupo: "casos",
    label: "Casos & Pessoas",
    contexto: "Caso confirmado, núcleo, checklist, radar e portal",
    resultado: "Sintetizar estado do caso e próximos passos internos",
    papeis: ["admin", "operacoes", "pesquisador", "comercial", "financeiro", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "pesquisa",
    label: "Pesquisa",
    contexto: "Biblioteca Mestre, evidências, dossiê do Legado e Validação Jurídica",
    resultado:
      "Organizar evidências existentes e formular hipóteses marcadas como não confirmadas",
    papeis: ["admin", "operacoes", "pesquisador", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "contratos",
    label: "Formalização",
    contexto: "Contrato vivo, catálogo homologado, OS e financeiro interno",
    resultado: "Explicar pendência de formalização sem emitir parecer automático",
    papeis: ["admin", "operacoes", "financeiro", "leitura"],
    analisaCaso: true,
  },
  {
    grupo: "governanca",
    label: "Governança",
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
 * Descobre o grupo a partir da rota usando o registro canônico de navegação
 * (`GRUPOS_DESK`), por prefixo mais longo. Sem segunda fonte de verdade.
 */
export function grupoDaRota(rota: string): GrupoAssistenteId {
  for (const item of MENU_CONTA.itens) {
    if (!("to" in item)) continue;
    if (rota === item.to || rota.startsWith(`${item.to}/`)) return "governanca";
  }
  let melhor: { id: string; tamanho: number } = { id: "hoje", tamanho: -1 };
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

/** Atalhos internos do grupo — abrem rota existente, não executam mudança. */
export function atalhosDoGrupo(grupo: GrupoAssistenteId): readonly { to: string; label: string }[] {
  const registro = GRUPOS_DESK.find((g) => g.id === grupo);
  if (!registro) return [];
  const itens = registro.sub.flatMap((s) => ("to" in s ? [{ to: s.to, label: s.label }] : []));
  const vistos = new Set<string>();
  return itens.filter((i) => (vistos.has(i.to + i.label) ? false : vistos.add(i.to + i.label)));
}
