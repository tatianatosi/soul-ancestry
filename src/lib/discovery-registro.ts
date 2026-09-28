/**
 * Mesa Discovery como camada viva do CRM (autorização explícita da
 * Proprietária, 27/09/2026).
 *
 * Tudo o que antes vivia só na memória da tela e sumia ao recarregar passa a
 * ter um registro estruturado no próprio lead canônico
 * (`leads.discovery_registro`, migration `20260927140000`):
 *   - blocos SPIN: nota opcional e dispensa com motivo;
 *   - decisões sobre sugestões da varredura/transcrição (aceita, rejeitada,
 *     hipótese), sempre com a origem (fonte, autor, trecho, data).
 * A conversa inteira nunca é gravada. Nada aqui cria caso, pesquisa,
 * hipótese jurídica, produto/SKU, preço, contrato, cobrança ou acesso ao App.
 */
import type { LeadDesk } from "@/lib/crm-desk";
import { ETAPAS_SPIN, perguntaRespondida, perguntasDaEtapa, type EtapaSpin } from "@/lib/discovery-roteiro";
import {
  CAMPOS_POS_CALL,
  CONSENTIMENTOS,
  ORIGENS_RESPOSTA,
  RESPOSTAS_CONSENTIMENTO,
  type PosCall,
  type TipoConsentimento,
} from "@/lib/discovery-roteiro-mestre";

export type RegistroBloco = {
  nota: string | null;
  dispensado: boolean;
  motivo_dispensa: string | null;
  em: string;
  por: string | null;
};

export type DecisaoSugestao = "aceita" | "rejeitada" | "hipotese";
export const DECISOES_SUGESTAO: readonly DecisaoSugestao[] = ["aceita", "rejeitada", "hipotese"];

export type FonteSugestao = "whatsapp" | "transcricao";

export type OrigemSugestao = {
  fonte: FonteSugestao;
  autor: string | null;
  trecho: string | null;
  data: string | null;
};

export type SugestaoRegistrada = {
  /** `${campo}:${valor}` — a mesma sugestão decidida de novo substitui a anterior. */
  id: string;
  campo: string;
  valor: string;
  decisao: DecisaoSugestao;
  origem: OrigemSugestao;
  em: string;
  por: string | null;
};

export type RespostaRegistrada = {
  texto: string | null;
  origem: string;
  nao_sabe: boolean;
  em: string;
  por: string | null;
};

export type RegistroDiscovery = {
  blocos: Partial<Record<EtapaSpin, RegistroBloco>>;
  sugestoes: SugestaoRegistrada[];
  /** Resposta narrativa por pergunta (SPIN ou extensão de país), com origem. */
  respostas: Record<string, RespostaRegistrada>;
  /** Pós-call em níveis (roteiro mestre). */
  pos_call: Partial<PosCall>;
  /** Consentimentos separados; gravação espelha `leads.consentimento_status`. */
  consentimentos: Partial<Record<TipoConsentimento, string | null>>;
};

export const MOTIVO_DISPENSA_MINIMO = 5;
const LIMITE_TRECHO = 280;
const LIMITE_NOTA = 2000;

const texto = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));

/** Normaliza o jsonb lido do banco (qualquer formato antigo vira registro vazio). */
export function normalizarRegistro(bruto: unknown): RegistroDiscovery {
  const o = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? (bruto as Record<string, any>) : {};
  const blocos: RegistroDiscovery["blocos"] = {};
  for (const e of ETAPAS_SPIN) {
    const b = o.blocos?.[e.chave];
    if (b && typeof b === "object") {
      blocos[e.chave] = {
        nota: texto(b.nota).trim() || null,
        dispensado: b.dispensado === true,
        motivo_dispensa: texto(b.motivo_dispensa).trim() || null,
        em: texto(b.em),
        por: texto(b.por) || null,
      };
    }
  }
  const sugestoes = Array.isArray(o.sugestoes)
    ? (o.sugestoes as any[])
        .filter((s) => s && DECISOES_SUGESTAO.includes(s.decisao) && texto(s.campo) && texto(s.valor))
        .map((s) => ({
          id: texto(s.id) || `${s.campo}:${s.valor}`,
          campo: texto(s.campo),
          valor: texto(s.valor),
          decisao: s.decisao as DecisaoSugestao,
          origem: {
            fonte: s.origem?.fonte === "transcricao" ? "transcricao" : "whatsapp",
            autor: texto(s.origem?.autor) || null,
            trecho: texto(s.origem?.trecho) || null,
            data: texto(s.origem?.data) || null,
          } as OrigemSugestao,
          em: texto(s.em),
          por: texto(s.por) || null,
        }))
    : [];
  const respostas: Record<string, RespostaRegistrada> = {};
  if (o.respostas && typeof o.respostas === "object") {
    for (const [id, r] of Object.entries(o.respostas as Record<string, any>)) {
      if (!r || typeof r !== "object") continue;
      respostas[id] = {
        texto: texto(r.texto).trim() || null,
        origem: ORIGENS_RESPOSTA.some((x) => x.valor === r.origem) ? r.origem : "relato_call",
        nao_sabe: r.nao_sabe === true,
        em: texto(r.em),
        por: texto(r.por) || null,
      };
    }
  }
  const pos_call: Partial<PosCall> = {};
  if (o.pos_call && typeof o.pos_call === "object") {
    for (const c of CAMPOS_POS_CALL) if (o.pos_call[c] != null) pos_call[c] = texto(o.pos_call[c]) || null;
  }
  const consentimentos: RegistroDiscovery["consentimentos"] = {};
  if (o.consentimentos && typeof o.consentimentos === "object") {
    for (const c of CONSENTIMENTOS) {
      const v = texto(o.consentimentos[c.tipo]);
      if (RESPOSTAS_CONSENTIMENTO.some((x) => x.valor === v)) consentimentos[c.tipo] = v;
    }
  }
  return { blocos, sugestoes, respostas, pos_call, consentimentos };
}

/** Resposta narrativa de uma pergunta. "Não sabe / não tem agora" é lacuna registrada, não falha. */
export function registrarResposta(
  atual: RegistroDiscovery,
  perguntaId: string,
  entrada: { texto?: string | null; origem?: string | null; naoSabe?: boolean },
  meta: { em: string; por: string | null },
): { ok: true; registro: RegistroDiscovery } | { ok: false; erro: string } {
  const id = texto(perguntaId).trim();
  if (!id || id.length > 80) return { ok: false, erro: "Pergunta inválida." };
  const origem = texto(entrada.origem) || "relato_call";
  if (!ORIGENS_RESPOSTA.some((x) => x.valor === origem)) return { ok: false, erro: "Origem da resposta fora da lista." };
  const t = texto(entrada.texto).trim().slice(0, LIMITE_NOTA);
  const naoSabe = entrada.naoSabe === true;
  if (!t && !naoSabe) {
    const { [id]: _removida, ...resto } = atual.respostas;
    return { ok: true, registro: { ...atual, respostas: resto } };
  }
  return {
    ok: true,
    registro: {
      ...atual,
      respostas: { ...atual.respostas, [id]: { texto: t || null, origem, nao_sabe: naoSabe, em: meta.em, por: meta.por } },
    },
  };
}

/** Grava nota e/ou dispensa de um bloco SPIN. Dispensar exige motivo. */
export function registrarBloco(
  atual: RegistroDiscovery,
  etapa: EtapaSpin,
  entrada: { nota?: string | null; dispensado?: boolean; motivo?: string | null },
  meta: { em: string; por: string | null },
): { ok: true; registro: RegistroDiscovery } | { ok: false; erro: string } {
  if (!ETAPAS_SPIN.some((e) => e.chave === etapa)) return { ok: false, erro: "Bloco SPIN desconhecido." };
  const anterior = atual.blocos[etapa];
  const dispensado = entrada.dispensado ?? anterior?.dispensado ?? false;
  const motivo = (entrada.motivo ?? (dispensado ? anterior?.motivo_dispensa : null) ?? "").trim();
  if (dispensado && motivo.length < MOTIVO_DISPENSA_MINIMO) {
    return { ok: false, erro: "Dispensar um bloco exige o motivo (ao menos 5 caracteres)." };
  }
  const nota = (entrada.nota !== undefined ? texto(entrada.nota) : texto(anterior?.nota)).trim().slice(0, LIMITE_NOTA);
  return {
    ok: true,
    registro: {
      ...atual,
      blocos: {
        ...atual.blocos,
        [etapa]: {
          nota: nota || null,
          dispensado,
          motivo_dispensa: dispensado ? motivo : null,
          em: meta.em,
          por: meta.por,
        },
      },
    },
  };
}

/** Registra a decisão humana sobre uma sugestão, com a origem. A mesma sugestão decidida de novo substitui a anterior. */
export function registrarSugestao(
  atual: RegistroDiscovery,
  s: { campo: string; valor: string; decisao: DecisaoSugestao; origem: OrigemSugestao },
  meta: { em: string; por: string | null },
): { ok: true; registro: RegistroDiscovery; sugestao: SugestaoRegistrada } | { ok: false; erro: string } {
  const campo = texto(s.campo).trim();
  const valor = texto(s.valor).trim();
  if (!campo || !valor) return { ok: false, erro: "Sugestão sem campo ou valor." };
  if (!DECISOES_SUGESTAO.includes(s.decisao)) return { ok: false, erro: "Decisão inválida." };
  const sugestao: SugestaoRegistrada = {
    id: `${campo}:${valor}`,
    campo,
    valor,
    decisao: s.decisao,
    origem: {
      fonte: s.origem.fonte === "transcricao" ? "transcricao" : "whatsapp",
      autor: texto(s.origem.autor).trim().slice(0, 120) || null,
      trecho: texto(s.origem.trecho).trim().slice(0, LIMITE_TRECHO) || null,
      data: texto(s.origem.data).trim().slice(0, 40) || null,
    },
    em: meta.em,
    por: meta.por,
  };
  return {
    ok: true,
    sugestao,
    registro: { ...atual, sugestoes: [...atual.sugestoes.filter((x) => x.id !== sugestao.id), sugestao] },
  };
}

export type EstadoBloco = "completo" | "dispensado" | "em_andamento" | "pendente";

export type SituacaoBloco = {
  etapa: EtapaSpin;
  rotulo: string;
  estado: EstadoBloco;
  respondidas: number;
  total: number;
  nota: string | null;
  motivoDispensa: string | null;
};

/** Estado de cada um dos 4 blocos SPIN: respostas reais do lead + nota/dispensa registradas. */
export function situacaoBlocos(lead: LeadDesk, registro: RegistroDiscovery): SituacaoBloco[] {
  return ETAPAS_SPIN.map((e) => {
    const perguntas = perguntasDaEtapa(e.chave);
    const respondidas = perguntas.filter((p) => perguntaRespondida(lead, p)).length;
    const r = registro.blocos[e.chave];
    const estado: EstadoBloco = r?.dispensado
      ? "dispensado"
      : perguntas.length > 0 && respondidas === perguntas.length
        ? "completo"
        : respondidas > 0
          ? "em_andamento"
          : "pendente";
    return {
      etapa: e.chave,
      rotulo: e.rotulo,
      estado,
      respondidas,
      total: perguntas.length,
      nota: r?.nota ?? null,
      motivoDispensa: r?.dispensado ? (r.motivo_dispensa ?? null) : null,
    };
  });
}

/** Os 4 blocos fecham quando cada um está completo ou dispensado com motivo. */
export function blocosSpinFechados(lead: LeadDesk, registro: RegistroDiscovery): boolean {
  return situacaoBlocos(lead, registro).every((b) => b.estado === "completo" || b.estado === "dispensado");
}

/** Decisão já registrada para uma sugestão (para a tela reler após recarregar). */
export function decisaoRegistrada(registro: RegistroDiscovery, campo: string, valor: string): SugestaoRegistrada | null {
  return registro.sugestoes.find((s) => s.campo === campo && s.valor === valor) ?? null;
}

/**
 * Consentimento para gravação/transcrição: separado e obrigatório antes de
 * usar a varredura. Vale o registro do próprio lead, nunca uma inferência.
 */
export function consentimentoTranscricao(lead: Pick<LeadDesk, "consentimento_gravacao" | "consentimento_status"> | null): {
  liberado: boolean;
  motivo: string | null;
} {
  if (!lead) return { liberado: false, motivo: "Escolha um lead antes de colar a conversa." };
  const l = lead as unknown as { consentimento_gravacao?: boolean | null; consentimento_status?: string | null };
  if (l.consentimento_status === "concedido") return { liberado: true, motivo: null };
  if (l.consentimento_status === "recusado") {
    return { liberado: false, motivo: "O lead recusou gravação/transcrição. A conversa não pode ser varrida." };
  }
  return {
    liberado: false,
    motivo: "Registre o consentimento de gravação/transcrição (concedido) antes de usar a varredura.",
  };
}
