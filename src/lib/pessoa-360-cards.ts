/**
 * Mapa da Pessoa 360 — classifica o que já existe, sem tabela nova.
 *
 * A ficha de uma pessoa precisa mostrar, em cards, o núcleo, a pesquisa,
 * os achados, a proposta, o contrato, a Discovery, o lead de WhatsApp e a
 * linha do tempo do cliente. Nada disso é entidade paralela: são leituras
 * de `nucleos_familiares`, `nucleo_membros`, `research_people`,
 * `genealogical_findings`, `evidences`, `proposals`, `contracts`, `leads`
 * e `touchpoints`, reunidas na mesma pessoa.
 */

import type { EventoDePessoa, LinhaDoTempoDaPessoa } from "@/lib/pessoa-identidade";
import { montarLinhaDoTempoDaPessoa } from "@/lib/pessoa-identidade";
import { rotulo } from "@/lib/crm-desk";

export const ROTULO_PAPEL_NUCLEO: Record<string, string> = {
  contratante_signatario: "Contratante signatário",
  requerente: "Requerente",
  dependente: "Dependente",
  referencia_genealogica: "Referência genealógica",
  participante: "Participante",
};

export type LeadDaPessoa = {
  id: string;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  origem?: string | null;
  estagio?: string | null;
  created_at?: string | null;
  case_id?: string | null;
  call_realizada_em?: string | null;
  call_agendada_em?: string | null;
  discovery_resultado?: string | null;
  resumo_call?: string | null;
  narrativa_familiar?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  status_call?: string | null;
  consentimento_canal?: string | null;
  nacionalidades_interesse?: string[] | null;
  geracao_ascendente?: string | null;
  linha_transmissao?: string | null;
  documentos_chave?: string[] | null;
  nucleo_id?: string | null;
  codigo?: string | null;
};

export type NucleoDaPessoa = {
  id: string;
  nome?: string | null;
  case_id?: string | null;
  dossie_mae?: string | null;
  status?: string | null;
  contratante_nome?: string | null;
};

export type MembroDaFamilia = {
  id: string;
  nucleo_id: string;
  nome?: string | null;
  papel?: string | null;
  vinculo?: string | null;
  processo?: string | null;
  cliente_id?: string | null;
  representacao_necessaria?: boolean | null;
  status_cadastral?: string | null;
};

export type AchadoDaPessoa = {
  id: string;
  case_id?: string | null;
  title?: string | null;
  finding_type?: string | null;
  validation_status?: string | null;
  confidence?: string | null;
  client_projection_status?: string | null;
  internal_summary?: string | null;
  found_at?: string | null;
  updated_at?: string | null;
  locality?: string | null;
  generation?: string | null;
};

export type EvidenciaDaPessoa = {
  id: string;
  case_id?: string | null;
  title_internal?: string | null;
  evidence_type?: string | null;
  workflow_status?: string | null;
  confidence_level?: string | null;
  created_at?: string | null;
};

export type TouchpointWhatsapp = {
  id: string;
  caso_id?: string | null;
  canal?: string | null;
  resumo?: string | null;
  ocorrido_em?: string | null;
  direcao?: string | null;
};

export type PropostaDaPessoa = {
  id: string;
  case_id?: string | null;
  status?: string | null;
  valor?: number | string | null;
  moeda?: string | null;
  created_at?: string | null;
  enviada_em?: string | null;
  aprovada_em?: string | null;
  validade?: string | null;
};

export type ContratoDaPessoa = {
  id: string;
  case_id?: string | null;
  status?: string | null;
  signed_at?: string | null;
  created_at?: string | null;
};

/** Origem canônica do catálogo de leads — não sinônimo inventado. */
export function leadEhWhatsApp(lead: Pick<LeadDaPessoa, "origem" | "consentimento_canal">): boolean {
  return String(lead.origem ?? "").toLowerCase() === "whatsapp"
    || String(lead.consentimento_canal ?? "").toLowerCase() === "whatsapp";
}

/**
 * Discovery é a Mesa: call agendada/feita ou resultado gravado.
 * SPIN não conta como checkbox — a Mesa pergunta; o resultado vive em
 * `discovery_resultado` / `resumo_call`.
 */
export function leadTemDiscovery(
  lead: Pick<
    LeadDaPessoa,
    "call_realizada_em" | "call_agendada_em" | "discovery_resultado" | "status_call" | "resumo_call"
  >,
): boolean {
  if (lead.call_realizada_em || lead.call_agendada_em || lead.discovery_resultado || lead.status_call) {
    return true;
  }
  return typeof lead.resumo_call === "string" && lead.resumo_call.trim().length > 0;
}

export function rotuloPapelNucleo(papel: string | null | undefined): string {
  if (!papel) return "Papel não informado";
  return ROTULO_PAPEL_NUCLEO[papel] ?? papel;
}

export function agruparFamiliaPorNucleo(
  nucleos: NucleoDaPessoa[],
  membros: MembroDaFamilia[],
): { nucleo: NucleoDaPessoa; membros: MembroDaFamilia[] }[] {
  const porId = new Map(nucleos.map((n) => [n.id, n]));
  const grupos = new Map<string, MembroDaFamilia[]>();
  for (const m of membros) {
    const lista = grupos.get(m.nucleo_id) ?? [];
    lista.push(m);
    grupos.set(m.nucleo_id, lista);
  }
  const ids = [...new Set([...nucleos.map((n) => n.id), ...membros.map((m) => m.nucleo_id)])];
  return ids.map((id) => ({
    nucleo: porId.get(id) ?? { id, nome: "Núcleo sem ficha" },
    membros: grupos.get(id) ?? [],
  }));
}

export function formatarValorProposta(valor: number | string | null | undefined, moeda?: string | null): string | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return String(valor);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda && moeda.length === 3 ? moeda : "BRL",
  }).format(n);
}

export function resumoDiscovery(lead: LeadDaPessoa): string {
  const partes = [
    lead.discovery_resultado ? rotulo("discovery_resultado", lead.discovery_resultado) : null,
    lead.status_call ? `call ${rotulo("status_call", lead.status_call)}` : null,
    lead.geracao_ascendente ? `geração ${lead.geracao_ascendente}` : null,
    lead.linha_transmissao ? `linha ${lead.linha_transmissao}` : null,
    Array.isArray(lead.nacionalidades_interesse) && lead.nacionalidades_interesse.length
      ? lead.nacionalidades_interesse.join(", ")
      : null,
  ].filter(Boolean);
  return partes.join(" · ") || "Discovery registrada, sem resultado classificado.";
}

function soData(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  const d = new Date(valor.length <= 10 ? `${valor}T12:00:00Z` : valor);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function fato(parcial: {
  quando: string | null;
  titulo: string;
  origem: string;
  casoCodigo?: string | null;
  status?: string | null;
  resumoInterno?: string | null;
}): EventoDePessoa | { semData: true } {
  if (!parcial.quando) return { semData: true };
  return {
    quando: parcial.quando,
    titulo: parcial.titulo,
    casoCodigo: parcial.casoCodigo ?? null,
    casoTitulo: null,
    fase: null,
    status: parcial.status ?? null,
    resumoInterno: parcial.resumoInterno ?? null,
    responsavel: null,
    bloqueio: false,
    alerta: null,
    origem: parcial.origem,
  };
}

export function fatosComerciaisDaPessoa(entrada: {
  leads: LeadDaPessoa[];
  propostas: PropostaDaPessoa[];
  contratos: ContratoDaPessoa[];
  achados: AchadoDaPessoa[];
  touchpointsWhatsapp: TouchpointWhatsapp[];
  codigoPorCaso?: Map<string, string>;
}): { eventos: EventoDePessoa[]; semData: number } {
  const codigo = (caseId?: string | null) =>
    caseId ? (entrada.codigoPorCaso?.get(caseId) ?? null) : null;
  const eventos: EventoDePessoa[] = [];
  let semData = 0;

  const push = (e: EventoDePessoa | { semData: true }) => {
    if ("semData" in e) {
      semData += 1;
      return;
    }
    eventos.push(e);
  };

  for (const l of entrada.leads) {
    push(
      fato({
        quando: soData(l.created_at),
        titulo: leadEhWhatsApp(l)
          ? `Lead WhatsApp${l.codigo ? ` ${l.codigo}` : ""}`
          : `Lead${l.codigo ? ` ${l.codigo}` : ""}`,
        origem: "leads",
        casoCodigo: codigo(l.case_id),
        status: l.estagio ?? null,
        resumoInterno: l.origem ? `origem ${rotulo("origem", l.origem)}` : null,
      }),
    );
    if (l.call_realizada_em) {
      push(
        fato({
          quando: soData(l.call_realizada_em),
          titulo: "Discovery realizada",
          origem: "leads",
          casoCodigo: codigo(l.case_id),
          status: l.discovery_resultado ?? null,
          resumoInterno: l.resumo_call?.trim() || resumoDiscovery(l),
        }),
      );
    } else if (l.call_agendada_em) {
      push(
        fato({
          quando: soData(l.call_agendada_em),
          titulo: "Discovery agendada",
          origem: "leads",
          casoCodigo: codigo(l.case_id),
          status: l.status_call ?? null,
        }),
      );
    }
  }

  for (const p of entrada.propostas) {
    push(
      fato({
        quando: soData(p.enviada_em) ?? soData(p.created_at),
        titulo: p.enviada_em ? "Proposta enviada" : "Proposta registrada",
        origem: "proposals",
        casoCodigo: codigo(p.case_id),
        status: p.status ?? null,
        resumoInterno: formatarValorProposta(p.valor, p.moeda),
      }),
    );
    if (p.aprovada_em) {
      push(
        fato({
          quando: soData(p.aprovada_em),
          titulo: "Proposta aprovada",
          origem: "proposals",
          casoCodigo: codigo(p.case_id),
          status: p.status ?? null,
        }),
      );
    }
  }

  for (const c of entrada.contratos) {
    push(
      fato({
        quando: soData(c.signed_at) ?? soData(c.created_at),
        titulo: c.signed_at ? "Contrato assinado" : "Contrato registrado",
        origem: "contracts",
        casoCodigo: codigo(c.case_id),
        status: c.status ?? null,
      }),
    );
  }

  for (const a of entrada.achados) {
    push(
      fato({
        quando: soData(a.found_at) ?? soData(a.updated_at),
        titulo: a.title?.trim() || "Achado genealógico",
        origem: "genealogical_findings",
        casoCodigo: codigo(a.case_id),
        status: a.validation_status ?? null,
        resumoInterno: a.internal_summary ?? a.finding_type ?? null,
      }),
    );
  }

  for (const t of entrada.touchpointsWhatsapp) {
    push(
      fato({
        quando: soData(t.ocorrido_em),
        titulo: "WhatsApp",
        origem: "touchpoints",
        casoCodigo: codigo(t.caso_id),
        status: t.direcao ?? null,
        resumoInterno: t.resumo ?? null,
      }),
    );
  }

  eventos.sort((a, b) => a.quando.localeCompare(b.quando));
  return { eventos, semData };
}

export function montarLinhaDoTempoDoCliente(entrada: {
  casos: {
    id?: string | null;
    casoCodigo: string | null;
    casoTitulo: string | null;
    eventos: Parameters<typeof montarLinhaDoTempoDaPessoa>[0][number]["eventos"];
  }[];
  leads: LeadDaPessoa[];
  propostas: PropostaDaPessoa[];
  contratos: ContratoDaPessoa[];
  achados: AchadoDaPessoa[];
  touchpointsWhatsapp: TouchpointWhatsapp[];
}): LinhaDoTempoDaPessoa {
  const base = montarLinhaDoTempoDaPessoa(entrada.casos);
  const codigoPorCaso = new Map<string, string>();
  for (const c of entrada.casos) {
    if (c.id && c.casoCodigo) codigoPorCaso.set(String(c.id), c.casoCodigo);
  }
  const extra = fatosComerciaisDaPessoa({
    leads: entrada.leads,
    propostas: entrada.propostas,
    contratos: entrada.contratos,
    achados: entrada.achados,
    touchpointsWhatsapp: entrada.touchpointsWhatsapp,
    codigoPorCaso,
  });
  const eventos = [...base.eventos, ...extra.eventos].sort((a, b) => a.quando.localeCompare(b.quando));
  return {
    eventos,
    de: eventos[0]?.quando ?? null,
    ate: eventos[eventos.length - 1]?.quando ?? null,
    casos: base.casos,
    semData: base.semData + extra.semData,
  };
}

export const ORIGEM_FATO_ROTULO: Record<string, string> = {
  case_timeline_events: "caso",
  leads: "lead",
  proposals: "proposta",
  contracts: "contrato",
  genealogical_findings: "achado",
  touchpoints: "WhatsApp",
};
