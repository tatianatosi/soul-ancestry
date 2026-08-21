/**
 * Fluxo comercial canônico do CRM Vivo.
 *
 * Regra soberana: aceite verbal e confirmação formal são estados distintos e
 * nenhum deles cria contrato, cobrança, assinatura, onboarding, pesquisa
 * externa ou App Cliente. Esta entrega registra apenas fatos internos.
 */

export const ETAPAS_COMERCIAIS = [
  { id: "contato_inicial", rotulo: "Contato inicial" },
  { id: "qualificacao", rotulo: "Qualificação" },
  { id: "discovery_agendada", rotulo: "Discovery agendada" },
  { id: "discovery_realizada", rotulo: "Discovery realizada" },
  { id: "proposta_em_preparacao", rotulo: "Proposta em preparação" },
  { id: "proposta_enviada", rotulo: "Proposta enviada" },
  { id: "aceite_verbal", rotulo: "Aceite verbal" },
  { id: "confirmacao_formal_pendente", rotulo: "Confirmação formal pendente" },
  { id: "confirmacao_formal_recebida", rotulo: "Confirmação formal recebida" },
  { id: "formalizacao_em_preparacao", rotulo: "Formalização em preparação" },
  { id: "caso_ativo", rotulo: "Caso ativo" },
  { id: "perdido", rotulo: "Perdido" },
  { id: "arquivada", rotulo: "Arquivada" },
] as const;

export type EtapaComercial = (typeof ETAPAS_COMERCIAIS)[number]["id"];

/** Etapas em que a oportunidade é considerada ativa para efeito de disciplina. */
export const ETAPAS_ENCERRADAS: readonly string[] = ["perdido", "arquivada"];

export const EVENTOS_CONVERSAO = [
  { id: "lead_criado", rotulo: "Lead criado" },
  { id: "lead_qualificado", rotulo: "Lead qualificado" },
  { id: "discovery_agendada", rotulo: "Discovery agendada" },
  { id: "discovery_realizada", rotulo: "Discovery realizada" },
  { id: "proposta_em_preparacao", rotulo: "Proposta em preparação" },
  { id: "proposta_enviada", rotulo: "Proposta enviada" },
  { id: "aceite_verbal_confirmado", rotulo: "Aceite verbal confirmado" },
  { id: "confirmacao_formal_pendente", rotulo: "Confirmação formal pendente" },
  { id: "confirmacao_formal_recebida", rotulo: "Confirmação formal recebida" },
  { id: "formalizacao_em_preparacao", rotulo: "Formalização em preparação" },
  { id: "contrato_enviado", rotulo: "Contrato enviado" },
  { id: "contrato_assinado", rotulo: "Contrato assinado" },
  { id: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado" },
  { id: "onboarding_iniciado", rotulo: "Onboarding iniciado" },
  { id: "caso_ativo", rotulo: "Caso ativo" },
  { id: "perdido", rotulo: "Perdido" },
] as const;

export type EventoConversao = (typeof EVENTOS_CONVERSAO)[number]["id"];

export const TIPOS_INTERACAO = [
  { id: "call", rotulo: "Call" },
  { id: "reuniao", rotulo: "Reunião" },
  { id: "whatsapp_registrado", rotulo: "WhatsApp registrado" },
  { id: "email_registrado", rotulo: "E-mail registrado" },
  { id: "nota_interna", rotulo: "Nota interna" },
  { id: "proposta", rotulo: "Proposta" },
] as const;

export const DIRECOES_INTERACAO = [
  { id: "inbound", rotulo: "Entrada" },
  { id: "outbound", rotulo: "Saída" },
  { id: "internal", rotulo: "Interna" },
] as const;

export const ORIGENS_CONTATO = [
  { id: "nao_informada", rotulo: "Não informada" },
  { id: "indicacao", rotulo: "Indicação" },
  { id: "instagram", rotulo: "Instagram" },
  { id: "site", rotulo: "Site" },
  { id: "evento", rotulo: "Evento" },
  { id: "parceiro", rotulo: "Parceiro" },
  { id: "importacao_placego", rotulo: "Importação Placego (histórico)" },
  { id: "outra", rotulo: "Outra" },
] as const;

export const STATUS_CONTATO = [
  { id: "novo", rotulo: "Novo" },
  { id: "em_conversa", rotulo: "Em conversa" },
  { id: "qualificado", rotulo: "Qualificado" },
  { id: "sem_resposta", rotulo: "Sem resposta" },
  { id: "descartado", rotulo: "Descartado" },
] as const;

export function rotuloDe(lista: readonly { id: string; rotulo: string }[], id?: string | null): string {
  return lista.find((x) => x.id === id)?.rotulo ?? id ?? "—";
}

export type Oportunidade = {
  id?: string;
  contact_id?: string | null;
  etapa_comercial?: string | null;
  responsavel_user_id?: string | null;
  responsavel_nome?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
  objetivo_declarado?: string | null;
  archived_at?: string | null;
};

export type Pendencia = { campo: string; mensagem: string };

/** Nenhuma oportunidade ativa fica sem responsável, próxima ação e prazo. */
export function validarOportunidade(o: Oportunidade): Pendencia[] {
  const p: Pendencia[] = [];
  if (!o.objetivo_declarado?.trim()) p.push({ campo: "objetivo_declarado", mensagem: "Objetivo declarado é obrigatório." });
  if (!o.contact_id) p.push({ campo: "contact_id", mensagem: "Vincule um contato." });
  const encerrada = ETAPAS_ENCERRADAS.includes(String(o.etapa_comercial)) || Boolean(o.archived_at);
  if (encerrada) return p;
  if (!o.responsavel_user_id && !o.responsavel_nome?.trim()) {
    p.push({ campo: "responsavel", mensagem: "Oportunidade ativa exige responsável nominal." });
  }
  if (!o.proxima_acao?.trim()) p.push({ campo: "proxima_acao", mensagem: "Defina a próxima ação." });
  if (!o.prazo_proxima_acao) p.push({ campo: "prazo_proxima_acao", mensagem: "Defina o prazo da próxima ação." });
  return p;
}

export function acaoVencida(prazo?: string | null, hoje = new Date()): boolean {
  if (!prazo) return false;
  const d = new Date(`${String(prazo).slice(0, 10)}T23:59:59`);
  return d.getTime() < hoje.getTime();
}

/** O que o aceite verbal NÃO libera. Lista normativa usada na interface e nos testes. */
export const ACEITE_VERBAL_NAO_LIBERA = [
  "cliente_ativo",
  "contrato",
  "cobranca",
  "assinatura",
  "onboarding",
  "pesquisa_externa",
  "app_cliente",
] as const;

export const PROXIMA_ACAO_PADRAO_ACEITE_VERBAL = "Solicitar confirmação formal por escrito";

export function aceiteVerbalLibera(alvo: string): boolean {
  return !ACEITE_VERBAL_NAO_LIBERA.includes(alvo as (typeof ACEITE_VERBAL_NAO_LIBERA)[number]);
}

/** Confirmação formal exige referência interna verificável e só libera preparação interna. */
export function validarConfirmacaoFormal(referenciaInterna?: string | null): { ok: boolean; erro?: string } {
  if (!referenciaInterna || referenciaInterna.trim().length < 5) {
    return {
      ok: false,
      erro: "Informe a referência interna verificável (WhatsApp, e-mail, print ou registro equivalente).",
    };
  }
  return { ok: true };
}

export function confirmacaoFormalLibera(alvo: string): boolean {
  return alvo === "preparacao_interna_formalizacao";
}

/** Produto/preço só entram em proposta quando homologados e vigentes. */
export function produtoSelecionavel(p: {
  homologado?: boolean | null;
  status?: string | null;
  vigencia_fim?: string | null;
}, hoje = new Date()): boolean {
  if (p.homologado === false) return false;
  if (p.status && !["homologado", "vigente", "ativo"].includes(p.status)) return false;
  if (p.vigencia_fim && new Date(`${String(p.vigencia_fim).slice(0, 10)}T23:59:59`).getTime() < hoje.getTime()) return false;
  return true;
}

export function precoSomenteLeitura(origem?: string | null): boolean {
  return origem === "catalogo_homologado" || origem === "sku_catalog" || origem === "product_catalog";
}

export function excecaoComercialValida(e: {
  justificativa?: string | null;
  responsavel?: string | null;
  validade?: string | null;
  aprovada?: boolean | null;
}): { ok: boolean; erro?: string } {
  if (!e.justificativa?.trim()) return { ok: false, erro: "Exceção exige justificativa." };
  if (!e.responsavel?.trim()) return { ok: false, erro: "Exceção exige responsável." };
  if (!e.validade) return { ok: false, erro: "Exceção exige validade." };
  if (!e.aprovada) return { ok: false, erro: "Exceção exige aprovação." };
  return { ok: true };
}

const CPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;

/** Auditoria e listagens nunca carregam CPF completo ou conteúdo de documento. */
export function sanitizarParaAuditoria(texto?: string | null): string {
  if (!texto) return "";
  return texto.replace(CPF, (m) => `***.***.${m.replace(/\D/g, "").slice(-2)}`).slice(0, 500);
}

export function mascararDocumento(doc?: string | null): string {
  const d = String(doc ?? "").replace(/\D/g, "");
  if (!d) return "—";
  return `•••${d.slice(-2)}`;
}

/** Etapa comercial correspondente a cada evento, quando houver. */
export const EVENTO_PARA_ETAPA: Record<string, EtapaComercial | undefined> = {
  lead_criado: "contato_inicial",
  lead_qualificado: "qualificacao",
  discovery_agendada: "discovery_agendada",
  discovery_realizada: "discovery_realizada",
  proposta_em_preparacao: "proposta_em_preparacao",
  proposta_enviada: "proposta_enviada",
  aceite_verbal_confirmado: "aceite_verbal",
  confirmacao_formal_pendente: "confirmacao_formal_pendente",
  confirmacao_formal_recebida: "confirmacao_formal_recebida",
  formalizacao_em_preparacao: "formalizacao_em_preparacao",
  caso_ativo: "caso_ativo",
  perdido: "perdido",
};

export function eventoPermitido(id: string): boolean {
  return EVENTOS_CONVERSAO.some((e) => e.id === id);
}
