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
  { numero: 1, codigo: "a_governanca", nome: "A — Governança e identidade canônica", objetivo: "Um único case_id canônico decidido por humano; o ID não escolhido vira alias/histórico." },
  { numero: 2, codigo: "b_cadastro", nome: "B — Cadastro, consentimento e núcleo familiar", objetivo: "Cadastro da contratante, consentimento registrado e participantes qualificados com evidência documental." },
  { numero: 3, codigo: "c_oferta", nome: "C — Proposta, SKU, preço, escopo, parcelamento e vencimento", objetivo: "Reconciliação com catálogo homologado e proposta aprovada; nenhum código ou preço criado no Desk." },
  { numero: 4, codigo: "d_juridico", nome: "D — Jurídico, partes, anexos e assinatura", objetivo: "Partes qualificadas, revisão jurídica, método de assinatura e registro externo da assinatura." },
  { numero: 5, codigo: "e_contrato", nome: "E — Contrato específico e Ordem de Serviço", objetivo: "MODELO ESTUDO com base genérica v2 e Anexo I/OS preparados para revisão interna." },
  { numero: 6, codigo: "f_financeiro", nome: "F — Financeiro", objetivo: "Condição financeira aprovada e cobrança autorizada manualmente após contrato assinado." },
  { numero: 7, codigo: "g_pesquisa", nome: "G — Pesquisa externa, despesas e diligências", objetivo: "Autorização registrada antes de qualquer pesquisa externa ou solicitação institucional." },
  { numero: 8, codigo: "h_operacao", nome: "H — Operação, portal e conteúdo client-facing", objetivo: "Dossiê mínimo validado e aprovação interna antes de ativação, portal ou conteúdo ao cliente." },
];

export type RequisitoBloqueio = {
  gate: string;
  responsavel: string;
  evidencia: string;
  origem: string;
};

/** chave do bloqueio → gate, responsável, evidência mínima e origem permitida. */
export const REQUISITOS_BLOQUEIO: Record<string, RequisitoBloqueio> = {
  id_canonico_resolvido: {
    gate: "a_governanca",
    responsavel: "Governança / Operações",
    evidencia:
      "Decisão registrada: CA-CID-AT-FAM-2026-001 é o canônico; CA-AUT-ANALUIZA-FAM-2026-001 permanece como referência legada resolvida.",
    origem: "Decisão interna registrada",
  },
  alice_nome_completo: {
    gate: "b_cadastro",
    responsavel: "Cadastro / Operações",
    evidencia: "Documento de identificação com nome civil completo.",
    origem: "Documento",
  },
  felipe_representacao_legal: {
    gate: "b_cadastro",
    responsavel: "Jurídico interno",
    evidencia: "Comprovação de representação legal do menor e vínculo com a contratante.",
    origem: "Documento",
  },
  cadastro_contratante_pendente: {
    gate: "b_cadastro",
    responsavel: "Cadastro / Operações",
    evidencia: "Ficha cadastral completa da contratante com origem em documento.",
    origem: "Documento ou formulário validado",
  },
  pacote_familiar_sem_sku: {
    gate: "c_oferta",
    responsavel: "Comercial + Catálogo",
    evidencia: "SKU homologado no catálogo para o pacote familiar, sem criação de código no Desk.",
    origem: "Catálogo homologado",
  },
  reconciliacao_comercial_pendente: {
    gate: "c_oferta",
    responsavel: "Comercial",
    evidencia: "SKU, preço, escopo, parcelamento e vencimento conferidos contra a fonte homologada.",
    origem: "Catálogo homologado + proposta aprovada",
  },
  dados_contratada_pendentes: {
    gate: "c_oferta",
    responsavel: "Administrativo",
    evidencia: "Perfil institucional versionado e aprovado da contratada.",
    origem: "Registro institucional",
  },
  anexo_os_pendente: {
    gate: "e_contrato",
    responsavel: "Operações",
    evidencia: "Anexo I / Ordem de Serviço com escopo idêntico à proposta aceita.",
    origem: "Proposta aprovada",
  },
  partes_qualificadas: {
    gate: "d_juridico",
    responsavel: "Jurídico interno",
    evidencia: "Qualificação completa das partes validada por revisão humana.",
    origem: "Documento",
  },
  contrato_especifico_pendente: {
    gate: "e_contrato",
    responsavel: "Operações",
    evidencia: "Versão específica do caso gerada a partir do MODELO ESTUDO / base genérica v2.",
    origem: "Preparação interna",
  },
  revisao_juridica_pendente: {
    gate: "d_juridico",
    responsavel: "Jurídico interno",
    evidencia: "Parecer interno de revisão da minuta, com data e responsável.",
    origem: "Revisão humana",
  },
  metodo_assinatura_pendente: {
    gate: "d_juridico",
    responsavel: "Operações",
    evidencia: "Método de assinatura definido e homologado.",
    origem: "Decisão interna registrada",
  },
  contrato_assinado_externo: {
    gate: "d_juridico",
    responsavel: "Operações + Jurídico",
    evidencia: "Registro externo de assinatura com data, referência e partes qualificadas.",
    origem: "Registro externo de assinatura",
  },
  condicao_financeira: {
    gate: "f_financeiro",
    responsavel: "Financeiro",
    evidencia: "Condição financeira aplicável confirmada por responsável humano.",
    origem: "Aprovação humana registrada",
  },
  asaas_bloqueado: {
    gate: "f_financeiro",
    responsavel: "Financeiro",
    evidencia: "Autorização humana de cobrança após contrato assinado e reconciliação concluída.",
    origem: "Fonte transacional homologada",
  },
  consentimento_registrado: {
    gate: "b_cadastro",
    responsavel: "Operações",
    evidencia: "Consentimento explícito e rastreável do titular.",
    origem: "Registro de consentimento",
  },
  dossie_minimo_conferido: {
    gate: "h_operacao",
    responsavel: "Pesquisa / Operações",
    evidencia: "Dossiê mínimo conferido com origem declarada em todos os campos obrigatórios.",
    origem: "Documento",
  },
  dossie_pre_onboarding: {
    gate: "h_operacao",
    responsavel: "Pesquisa",
    evidencia: "Validação humana do dossiê pré-onboarding e do checklist aplicável.",
    origem: "Revisão humana",
  },
  autorizacao_pesquisa_externa: {
    gate: "g_pesquisa",
    responsavel: "Operações + Jurídico",
    evidencia: "Autorização registrada para pesquisa externa e solicitações institucionais.",
    origem: "Autorização registrada",
  },
};

const REQUISITO_PADRAO: RequisitoBloqueio = {
  gate: "h_operacao",
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

/** Fontes brutas: subsidiam captura, mas nunca validam por si só. */
export const FONTES_BRUTAS = ["whatsapp_confirmado", "reuniao_transcricao"];

export type EstadoCampo = "sem_dado" | "capturado" | "em_revisao" | "verificado";

export function estadoDoCampo(campo: Record<string, any>): {
  estado: EstadoCampo;
  rotulo: string;
  tom: "ok" | "alerta" | "erro";
  nota: string | null;
} {
  if (!campo["valor"]) {
    return { estado: "sem_dado", rotulo: "Sem dado", tom: "erro", nota: null };
  }
  if (campo["verificado"]) {
    return { estado: "verificado", rotulo: "Verificado", tom: "ok", nota: null };
  }
  const bruta = FONTES_BRUTAS.includes(String(campo["origem"]));
  return bruta
    ? {
        estado: "capturado",
        rotulo: "Capturado — fonte bruta",
        tom: "erro",
        nota: "WhatsApp, reunião e transcrição são insumos: não validam parentesco, elegibilidade, rota jurídica, valor final ou condição contratual.",
      }
    : { estado: "em_revisao", rotulo: "Em revisão", tom: "alerta", nota: null };
}

/** Primeiro gate com bloqueio aberto, na ordem canônica. */
export function primeiroGatePendente<T extends Record<string, any>>(
  agrupados: BloqueioAgrupado<T>[],
): BloqueioAgrupado<T> | null {
  return agrupados.find((g) => g.abertos > 0) ?? null;
}
