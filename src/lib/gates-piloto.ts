/**
 * Organização dos bloqueios críticos do piloto real em gates sequenciais.
 * Leitura/estruturação apenas: nada aqui altera status, cria cobrança,
 * assinatura, pesquisa externa ou comunicação.
 */

export type GatePiloto = {
  numero: number;
  codigo: string;
  nome: string;
  objetivo: string;
};

export const GATES_PILOTO: GatePiloto[] = [
  {
    numero: 1,
    codigo: "identidade",
    nome: "Identidade e participantes",
    objetivo: "Um único identificador canônico e núcleo familiar descrito com evidência documental.",
  },
  {
    numero: 2,
    codigo: "oferta",
    nome: "Oferta e escopo",
    objetivo: "Proposta aprovada reconciliada com catálogo homologado, escopo e participantes.",
  },
  {
    numero: 3,
    codigo: "contrato",
    nome: "Contrato e assinatura",
    objetivo: "Partes qualificadas, contrato preparado, revisado e assinado com registro externo.",
  },
  {
    numero: 4,
    codigo: "financeiro",
    nome: "Financeiro",
    objetivo: "Condição financeira aprovada por responsável humano e cobrança autorizada manualmente.",
  },
  {
    numero: 5,
    codigo: "ativacao",
    nome: "Ativação e consentimento",
    objetivo: "Consentimento, dossiê mínimo e autorização registrados antes de qualquer ativação.",
  },
];

export type RequisitoBloqueio = {
  gate: string;
  responsavel: string;
  evidencia: string;
  origem: string;
};

/** chave do bloqueio → gate, responsável, evidência mínima e origem permitida. */
export const REQUISITOS_BLOQUEIO: Record<string, RequisitoBloqueio> = {
  id_canonico_pendente: {
    gate: "identidade",
    responsavel: "Governança / Operações",
    evidencia: "Decisão humana registrada do case_id canônico; o outro ID permanece como alias.",
    origem: "Decisão interna registrada",
  },
  alice_nome_completo: {
    gate: "identidade",
    responsavel: "Cadastro / Operações",
    evidencia: "Documento de identificação com nome civil completo.",
    origem: "Documento",
  },
  felipe_representacao_legal: {
    gate: "identidade",
    responsavel: "Jurídico interno",
    evidencia: "Comprovação de representação legal do menor e vínculo com a contratante.",
    origem: "Documento",
  },
  cadastro_contratante_pendente: {
    gate: "identidade",
    responsavel: "Cadastro / Operações",
    evidencia: "Ficha cadastral completa da contratante com origem em documento.",
    origem: "Documento ou formulário validado",
  },
  pacote_familiar_sem_sku: {
    gate: "oferta",
    responsavel: "Comercial + Catálogo",
    evidencia: "SKU homologado no catálogo para o pacote familiar, sem criação de código no Desk.",
    origem: "Catálogo homologado",
  },
  reconciliacao_comercial_pendente: {
    gate: "oferta",
    responsavel: "Comercial",
    evidencia: "SKU, preço, escopo, parcelamento e vencimento conferidos contra a fonte homologada.",
    origem: "Catálogo homologado + proposta aprovada",
  },
  dados_contratada_pendentes: {
    gate: "oferta",
    responsavel: "Administrativo",
    evidencia: "Perfil institucional versionado e aprovado da contratada.",
    origem: "Registro institucional",
  },
  anexo_os_pendente: {
    gate: "oferta",
    responsavel: "Operações",
    evidencia: "Anexo I / Ordem de Serviço com escopo idêntico à proposta aceita.",
    origem: "Proposta aprovada",
  },
  partes_qualificadas: {
    gate: "contrato",
    responsavel: "Jurídico interno",
    evidencia: "Qualificação completa das partes validada por revisão humana.",
    origem: "Documento",
  },
  contrato_especifico_pendente: {
    gate: "contrato",
    responsavel: "Operações",
    evidencia: "Versão específica do caso gerada a partir do MODELO ESTUDO / base genérica v2.",
    origem: "Preparação interna",
  },
  revisao_juridica_pendente: {
    gate: "contrato",
    responsavel: "Jurídico interno",
    evidencia: "Parecer interno de revisão da minuta, com data e responsável.",
    origem: "Revisão humana",
  },
  metodo_assinatura_pendente: {
    gate: "contrato",
    responsavel: "Operações",
    evidencia: "Método de assinatura definido e homologado.",
    origem: "Decisão interna registrada",
  },
  contrato_assinado_externo: {
    gate: "contrato",
    responsavel: "Operações + Jurídico",
    evidencia: "Registro externo de assinatura com data, referência e partes qualificadas.",
    origem: "Registro externo de assinatura",
  },
  condicao_financeira: {
    gate: "financeiro",
    responsavel: "Financeiro",
    evidencia: "Condição financeira aplicável confirmada por responsável humano.",
    origem: "Aprovação humana registrada",
  },
  asaas_bloqueado: {
    gate: "financeiro",
    responsavel: "Financeiro",
    evidencia: "Autorização humana de cobrança após contrato assinado e reconciliação concluída.",
    origem: "Fonte transacional homologada",
  },
  consentimento_registrado: {
    gate: "ativacao",
    responsavel: "Operações",
    evidencia: "Consentimento explícito e rastreável do titular.",
    origem: "Registro de consentimento",
  },
  dossie_minimo_conferido: {
    gate: "ativacao",
    responsavel: "Pesquisa / Operações",
    evidencia: "Dossiê mínimo conferido com origem declarada em todos os campos obrigatórios.",
    origem: "Documento",
  },
  dossie_pre_onboarding: {
    gate: "ativacao",
    responsavel: "Pesquisa",
    evidencia: "Validação humana do dossiê pré-onboarding e do checklist aplicável.",
    origem: "Revisão humana",
  },
  autorizacao_pesquisa_externa: {
    gate: "ativacao",
    responsavel: "Operações + Jurídico",
    evidencia: "Autorização registrada para pesquisa externa e solicitações institucionais.",
    origem: "Autorização registrada",
  },
};

const REQUISITO_PADRAO: RequisitoBloqueio = {
  gate: "ativacao",
  responsavel: "Operações",
  evidencia: "Evidência documental ou decisão humana registrada.",
  origem: "Revisão humana",
};

export function requisitoDoBloqueio(chave: string): RequisitoBloqueio {
  return REQUISITOS_BLOQUEIO[chave] ?? REQUISITO_PADRAO;
}

export type BloqueioAgrupado<T> = {
  gate: GatePiloto;
  itens: { bloqueio: T; requisito: RequisitoBloqueio }[];
  abertos: number;
  total: number;
  liberado: boolean;
};

/** Agrupa bloqueios por gate, na ordem canônica, marcando dependência sequencial. */
export function agruparBloqueiosPorGate<T extends Record<string, any>>(
  bloqueios: T[],
): BloqueioAgrupado<T>[] {
  let anteriorConcluido = true;
  return GATES_PILOTO.map((gate) => {
    const itens = bloqueios
      .filter((b) => requisitoDoBloqueio(String(b["chave"])).gate === gate.codigo)
      .map((b) => ({ bloqueio: b, requisito: requisitoDoBloqueio(String(b["chave"])) }));
    const abertos = itens.filter((i) => i.bloqueio["status"] === "aberto").length;
    const liberado = anteriorConcluido;
    anteriorConcluido = anteriorConcluido && abertos === 0;
    return { gate, itens, abertos, total: itens.length, liberado };
  });
}
