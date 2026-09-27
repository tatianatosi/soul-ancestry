/**
 * Handoff Discovery → pessoa + caso (puro).
 *
 * Compõe o que já existe: evidência de mesma pessoa, vocabulário de serviço
 * operacional e gates do Painel de Calls. Não inventa tabela nem CRM paralelo.
 * Persistência vive em handoff-discovery.functions.ts.
 */

import { SERVICOS_CASO_OPERACIONAL } from "@/lib/abrir-caso-operacional";
import type { LeadDesk } from "@/lib/crm-desk";
import { avaliarHandoffCall } from "@/lib/painel-calls";
import {
  evidenciaDeMesmaPessoa,
  podeTratarComoMesmaPessoa,
  type EvidenciaDeElo,
  type RegistroDePessoa,
} from "@/lib/pessoa-identidade";

export type CandidatoCliente = RegistroDePessoa & { id: string };

export type DecisaoClienteHandoff =
  | { acao: "reusar"; clienteId: string; evidencia: EvidenciaDeElo }
  | { acao: "criar" }
  | {
      acao: "confirmar";
      candidatos: Array<{ id: string; nome: string; evidencia: EvidenciaDeElo }>;
    };

/** Só e-mail confirmado reusa sozinho; telefone/nome pedem confirmação humana. */
export function decidirClienteDoHandoff(
  lead: RegistroDePessoa,
  clientes: CandidatoCliente[],
  clienteIdConfirmado?: string | null,
): DecisaoClienteHandoff {
  if (clienteIdConfirmado) {
    const escolhido = clientes.find((c) => c.id === clienteIdConfirmado);
    if (!escolhido) return { acao: "criar" };
    const evidencia =
      evidenciaDeMesmaPessoa(lead, escolhido) ??
      ({
        forca: "apenas_indicio" as const,
        motivo: "cliente confirmado manualmente no handoff",
      });
    return { acao: "reusar", clienteId: escolhido.id, evidencia };
  }

  const comElo = clientes
    .map((c) => ({ cliente: c, evidencia: evidenciaDeMesmaPessoa(lead, c) }))
    .filter((x): x is { cliente: CandidatoCliente; evidencia: EvidenciaDeElo } => x.evidencia !== null);

  const confirmados = comElo.filter((x) => podeTratarComoMesmaPessoa(x.evidencia));
  if (confirmados.length === 1) {
    return {
      acao: "reusar",
      clienteId: confirmados[0].cliente.id,
      evidencia: confirmados[0].evidencia,
    };
  }
  if (confirmados.length > 1) {
    return {
      acao: "confirmar",
      candidatos: confirmados.map((x) => ({
        id: x.cliente.id,
        nome: String(x.cliente.nome ?? x.cliente.id),
        evidencia: x.evidencia,
      })),
    };
  }

  const provaveis = comElo.filter((x) => x.evidencia.forca === "provavel");
  if (provaveis.length > 0) {
    return {
      acao: "confirmar",
      candidatos: provaveis.map((x) => ({
        id: x.cliente.id,
        nome: String(x.cliente.nome ?? x.cliente.id),
        evidencia: x.evidencia,
      })),
    };
  }

  return { acao: "criar" };
}

/** Deriva tipo_servico do vocabulário operacional a partir do lead. */
export function tipoServicoDoLead(
  lead: Pick<
    LeadDesk,
    "objetivo" | "via_juridica_preliminar" | "nacionalidades_interesse" | "pais_linha_prioritaria"
  >,
): string {
  const texto = [
    lead.objetivo,
    lead.via_juridica_preliminar,
    lead.pais_linha_prioritaria,
    ...(lead.nacionalidades_interesse ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/cidadania|nacionalidade|passaporte|jus sanguinis|reconhec/.test(texto)) return "cidadania";
  if (/pesquisa|genealog|ascend|árvore|arvore|linhagem/.test(texto)) return "pesquisa";
  if (/documento|certid|apostila|traduç|traduc/.test(texto)) return "documentacao";
  if (/consultoria|orientação|orientacao|dúvida|duvida/.test(texto)) return "consultoria";
  return SERVICOS_CASO_OPERACIONAL.some((s) => s.valor === "cidadania")
    ? "cidadania"
    : SERVICOS_CASO_OPERACIONAL[0].valor;
}

export function tituloCasoDoLead(
  lead: Pick<LeadDesk, "nome" | "objetivo" | "pais_linha_prioritaria">,
): string {
  const nome = String(lead.nome ?? "").trim() || "Lead sem nome";
  const pais = String(lead.pais_linha_prioritaria ?? "").trim();
  const objetivo = String(lead.objetivo ?? "").trim();
  if (pais && objetivo) return `${nome} — ${pais} · ${objetivo}`;
  if (pais) return `${nome} — ${pais}`;
  if (objetivo) return `${nome} — ${objetivo}`;
  return `Caso · ${nome}`;
}

/** Pacote de contexto aprovado na Discovery — vai no resumo do caso, sem redigitar. */
export function resumoHandoffDoLead(lead: LeadDesk): string {
  const linhas: string[] = [];
  if (lead.resumo_call) linhas.push(`Resumo da call: ${lead.resumo_call}`);
  if (lead.discovery_resultado) linhas.push(`Resultado Discovery: ${lead.discovery_resultado}`);
  if (lead.elegibilidade_preliminar) {
    linhas.push(`Elegibilidade preliminar: ${lead.elegibilidade_preliminar}`);
  }
  if (lead.via_juridica_preliminar) linhas.push(`Via preliminar: ${lead.via_juridica_preliminar}`);
  if (lead.nacionalidades_interesse?.length) {
    linhas.push(`Nacionalidades: ${lead.nacionalidades_interesse.join(", ")}`);
  }
  if (lead.pais_linha_prioritaria) linhas.push(`País/linha: ${lead.pais_linha_prioritaria}`);
  if (lead.proxima_acao) {
    const prazo = lead.proxima_acao_em ? ` até ${String(lead.proxima_acao_em).slice(0, 10)}` : "";
    linhas.push(`Próxima ação: ${lead.proxima_acao}${prazo}`);
  }
  if (lead.responsavel_nome) linhas.push(`Responsável: ${lead.responsavel_nome}`);
  return linhas.join("\n") || "Handoff Discovery — contexto registrado no lead.";
}

export function entradaCasoDoLead(
  lead: LeadDesk,
  clienteId: string,
  tipoServico?: string | null,
): { cliente_id: string; titulo: string; tipo_servico: string; resumo: string } {
  return {
    cliente_id: clienteId,
    titulo: tituloCasoDoLead(lead),
    tipo_servico: (tipoServico && String(tipoServico).trim()) || tipoServicoDoLead(lead),
    resumo: resumoHandoffDoLead(lead),
  };
}

/** Gates do Painel de Calls: só libera handoff operacional com destino proposta. */
export function podeExecutarHandoffDiscovery(lead: LeadDesk): { ok: boolean; motivo?: string } {
  if (lead.case_id) {
    return { ok: true };
  }
  const av = avaliarHandoffCall(lead);
  if (!av.liberado) {
    return {
      ok: false,
      motivo: av.bloqueios[0]?.motivo ?? "Handoff ainda bloqueado — complete registro e qualificação.",
    };
  }
  if (av.destino !== "proposta") {
    return {
      ok: false,
      motivo: `Destino atual é «${av.destino}» — handoff para pessoa/caso só com destino proposta.`,
    };
  }
  return { ok: true };
}

export type PayloadClienteDoLead = {
  nome: string;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  indicado_por: string | null;
  pais_interesse: string | null;
  classificacao: "pre_cliente";
  status: "pre_onboarding";
  observacoes: string | null;
};

export function payloadClienteDoLead(lead: LeadDesk): PayloadClienteDoLead {
  // P32 (26/09/2026) — achado real (auditoria "cadastro único que só ganha
  // campos"): `clientes` não tem coluna para múltiplos países de interesse
  // (só `pais_interesse`, singular) — `leads.nacionalidades_interesse` (array)
  // já ia para o resumo do CASO (`resumoHandoffDoLead` → `crm_casos.resumo`),
  // mas nunca para o registro da PESSOA. Não é dado perdido (está no caso),
  // mas não aparecia em Pessoa 360. Acrescenta aqui, sem coluna nova.
  const nacionalidades = (lead.nacionalidades_interesse ?? []).filter(Boolean);
  const observacoes = [
    lead.resumo_call?.trim() || null,
    nacionalidades.length > 1 ? `Nacionalidades de interesse (Discovery): ${nacionalidades.join(", ")}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    nome: String(lead.nome ?? "").trim(),
    email: lead.email?.trim() || null,
    telefone: lead.telefone?.trim() || null,
    origem: lead.origem?.trim() || null,
    // Fase B (27/09/2026) — "cadeia canônica executável": indicado_por
    // faltava na lista de campos copiados uma vez no handoff.
    indicado_por: lead.indicado_por?.trim() || null,
    pais_interesse: lead.pais_linha_prioritaria?.trim() || lead.nacionalidade?.trim() || null,
    classificacao: "pre_cliente",
    status: "pre_onboarding",
    observacoes: observacoes || null,
  };
}
