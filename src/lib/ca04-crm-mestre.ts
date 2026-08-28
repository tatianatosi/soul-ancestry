/**
 * CA-04 — CRM MESTRE, DISCOVERY E HANDOFF (artefato consolidado v1.0.1, 13/08/2026)
 *
 * Registro canônico executável do artefato CA 04. É biblioteca pura:
 * - não cria, altera ou apaga dado;
 * - não dispara pesquisa, cobrança, envio ou qualquer ação externa;
 * - não substitui as fontes de verdade (Planilha Mestre, Asaas, Desk, ambiente documental).
 *
 * Serve para validar listas controladas, avaliar bloqueios de dependência,
 * derivar o Resultado comercial e expor as matrizes de handoff e privacidade
 * em superfície interna somente leitura.
 */

/* ------------------------------------------------------------------ */
/* 1. Fontes de verdade                                                */
/* ------------------------------------------------------------------ */

export type FonteVerdade = {
  camada: string;
  responsabilidade: string;
  naoUsarComo: string;
};

export const FONTES_VERDADE_CA04: readonly FonteVerdade[] = [
  {
    camada: "Painel de Calls",
    responsabilidade:
      "Entrada, preparação de call, registro inicial, consentimento inicial, SPIN, resultado da Discovery, handoff e próxima ação.",
    naoUsarComo:
      "CRM Mestre, catálogo de preços, repositório documental, fonte de evidência, parecer jurídico ou fonte transacional.",
  },
  {
    camada: "Planilha Mestre",
    responsabilidade: "SKU, status de produto, escopo, preço homologado, condição e link de cobrança.",
    naoUsarComo: "Dossiê de cliente ou agenda de pesquisa.",
  },
  {
    camada: "Asaas",
    responsabilidade: "Evento e status transacional de cobrança e pagamento.",
    naoUsarComo: "Fonte de escopo, evidência ou elegibilidade.",
  },
  {
    camada: "Desk / dossiê autorizado",
    responsabilidade: "Caso, pesquisa, evidência, documento, pendência e histórico operacional.",
    naoUsarComo: "Catálogo comercial público.",
  },
  {
    camada: "App Cliente / one-page",
    responsabilidade: "Conteúdo aprovado, jornada, entrega, progresso e próximo passo.",
    naoUsarComo:
      "Campo interno, preço provisório, SKU técnico, gravação, transcrição ou documento restrito.",
  },
  {
    camada: "CRM legado",
    responsabilidade: "Histórico consultável.",
    naoUsarComo: "Fonte canônica de dados novos.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* 2. LISTAS_BASE v1.1 (listas controladas)                            */
/* ------------------------------------------------------------------ */

export const LISTAS_BASE_CA04 = {
  "Área responsável": ["Comercial", "Pesquisa", "Operações", "Financeiro", "Jurídico/parceiro", "A definir"],
  "Origem do lead": [
    "Diagnóstico rápido site",
    "Diagnóstico profundo site",
    "WhatsApp orgânico",
    "Instagram",
    "Indicação",
    "Google orgânico",
    "Google Ads",
    "Evento",
    "Parceiro",
    "Base antiga",
    "Outro",
  ],
  "Objetivo principal": [
    "Cidadania",
    "Pesquisa de origem",
    "Genealogia/árvore",
    "Memória familiar",
    "Pós-cidadania",
    "Documento específico",
    "Outro",
  ],
  "Nacionalidade de interesse": [
    "Italiana",
    "Portuguesa",
    "Espanhola",
    "Alemã",
    "Austríaca",
    "Polonesa",
    "Húngara",
    "Luxemburguesa",
    "Croata",
    "Romena",
    "Europeia geral",
    "Em investigação",
    "Outra UE — validar antes de ofertar",
  ],
  "País/linha prioritária": [
    "Itália",
    "Portugal",
    "Espanha",
    "Alemanha",
    "Áustria",
    "Polônia",
    "Hungria",
    "Luxemburgo",
    "Croácia",
    "Romênia",
    "Multipaís",
    "A definir",
  ],
  "Status da call": [
    "Agendada",
    "Confirmada",
    "Realizada",
    "Remarcada",
    "No-show",
    "Cancelada pelo lead",
    "Cancelada pelo Clube",
  ],
  "Consentimento de gravação": ["Concedido", "Recusado", "Não aplicável", "Não solicitado"],
  "Canal do consentimento": ["WhatsApp", "Formulário", "Call gravada", "E-mail", "Outro"],
  "Status SPIN": ["Não iniciado", "Em andamento", "Concluído", "Não aplicável"],
  "Sinal de aderência preliminar": [
    "Forte",
    "Provável",
    "Possível com pesquisa",
    "Baixa",
    "Inconclusiva",
    "Sem aderência atual",
  ],
  "Confiança da triagem": [
    "Alta — documentos-chave vistos",
    "Média — narrativa + parte documental",
    "Baixa — apenas relato inicial",
  ],
  "Via jurídica preliminar": [
    "Descendência/jus sanguinis",
    "Reparação histórica",
    "Linha materna judicial",
    "Memória Democrática",
    "Descendência direta",
    "Recuperação de nacionalidade",
    "Naturalização/residência",
    "Via familiar",
    "Via a confirmar",
    "Sem via identificada",
  ],
  "Status da via": [
    "Aberta",
    "Aberta com requisito específico",
    "Aberta com prazo",
    "Restrita",
    "Encerrada para novos pedidos",
    "Em confirmação jurídica",
    "Não aplicável",
  ],
  "Status de atualização do marco": ["Atualizado", "A revisar", "Desatualizado", "Não aplicável"],
  "Revisão humana/jurídica": ["Obrigatória", "Dispensa homologada", "A definir"],
  "Autorização para pesquisa prévia": [
    "Não solicitada",
    "Pendente",
    "Registrada",
    "Não autorizada",
    "Não aplicável",
  ],
  "Escopo autorizado": ["Triagem pública", "Documentos fornecidos", "Pesquisa genealógica", "Outro"],
  "Geração do ascendente": [
    "Pai/mãe",
    "Avô/avó",
    "Bisavô/bisavó",
    "Trisavô/trisavó",
    "Tetravô/tetravó ou anterior",
    "Ainda não identificado",
  ],
  "Linha de transmissão": ["Paterna", "Materna", "Mista", "Linha única ainda não confirmada"],
  "Risco de ruptura": [
    "Nenhum identificado",
    "Naturalização estrangeira",
    "Divergência de nomes/datas",
    "Casamento/estado civil",
    "Linha materna pré-1948",
    "Adoção/reconhecimento",
    "Falta de certidão",
    "Perseguição/prova histórica",
    "Outro",
    "Em investigação",
  ],
  "Complexidade documental": ["Baixa", "Média", "Alta", "Muito alta"],
  "Estado documental inicial": [
    "Documentos-chave disponíveis",
    "Documentos parciais",
    "Só informações orais",
    "Árvore/nomes sem certidões",
    "Sem dados suficientes",
  ],
  "Exige idioma/entrevista": ["Não", "Sim — idioma", "Sim — entrevista", "Sim — ambos", "A confirmar"],
  // 27/08/2026 — sincronizado com o que /leads grava de verdade
  // (crm-desk.ts EIXO_COMERCIAL/EIXO_FORMALIZACAO, já unificado com
  // caso-ficha.ts). Este registro se declara "canônico executável", não
  // espelho histórico — por isso é atualizado junto do motor, não deixado
  // pra trás. "Aceite verbal" e "Confirmação formal recebida" entraram no
  // Eixo Comercial; "Formalização em preparação" entrou no Eixo
  // Formalização. As transições correspondentes em EIXO_COMERCIAL_TRANSICOES
  // e EIXO_FORMALIZACAO_TRANSICOES abaixo ainda não cobrem esses estados —
  // gatilho, responsável e bloqueio exatos dependem de decisão da
  // Proprietária, não foram inventados aqui.
  "Eixo Comercial": [
    "Novo lead",
    "Triagem",
    "Discovery agendada",
    "Discovery realizada",
    "Diagnóstico em elaboração",
    "Proposta enviada",
    "Negociação",
    "Aceite verbal",
    "Confirmação formal recebida",
    "Nutrição",
    "Perdido",
    "Encerrado sem aderência",
  ],
  "Eixo Formalização/Operação": [
    "Não iniciado",
    "Formalização em preparação",
    "Contrato enviado",
    "Contrato assinado",
    "Pagamento inicial confirmado",
    "Cliente ativo",
    "Onboarding iniciado",
    "Caso ativo",
    "Arquivado",
  ],
  "Resultado comercial": [
    "Em aberto",
    "Em negociação",
    "Convertido",
    "Nutrição",
    "Perdido — preço",
    "Perdido — elegibilidade",
    "Perdido — documentos",
    "Perdido — timing",
    "Perdido — sem retorno",
    "Perdido — concorrente",
  ],
  "Motivo de perda": [
    "Preço",
    "Elegibilidade",
    "Documentação",
    "Prazo",
    "Sem resposta",
    "Escolheu concorrente",
    "Mudança de prioridade",
    "Falta de decisor",
    "Outro",
  ],
  "Status de despesas de terceiros": [
    "Não aplicável",
    "Estimativa pendente",
    "Estimadas e comunicadas",
    "Aguardando aprovação",
    "Aprovadas",
    "Pagas diretamente pelo cliente",
    "Parcialmente pagas",
    "Pendência do cliente",
  ],
  "Despesa vinculada à proposta?": ["Sim", "Não"],
  "Aprovação do cliente registrada?": ["Sim", "Não", "Pendente", "Não aplicável"],
  "Responsável pagador": ["Cliente", "Família/núcleo", "Outro autorizado"],
  "Regra de despesas": [
    "Cliente paga diretamente ao terceiro",
    "Cliente antecipa valor aprovado",
    "Clube não antecipa nem reembolsa despesas de terceiros",
  ],
  "Ambiente autorizado": ["Drive compartilhado", "Desk", "Ambiente operacional aprovado", "Outro autorizado"],
  "Nível de acesso do dossiê": ["Restrito", "Equipe do caso", "Cliente autorizado"],
  "Status do dossiê": ["Não criado", "Em preparação", "Ativo", "Arquivado"],
  "Próxima ação": [
    "Confirmar call",
    "Enviar checklist",
    "Solicitar documentos",
    "Revisar documentos",
    "Preparar diagnóstico",
    "Enviar proposta",
    "Cobrar retorno",
    "Enviar contrato",
    "Confirmar pagamento",
    "Iniciar onboarding",
    "Encerrar",
    "Outro",
  ],
} as const;

export type NomeListaCA04 = keyof typeof LISTAS_BASE_CA04;

/** Campo classificatório só aceita valor da lista controlada correspondente. */
export function valorPermitido(lista: NomeListaCA04, valor: string | null | undefined): boolean {
  const opcoes = LISTAS_BASE_CA04[lista] as readonly string[];
  return typeof valor === "string" && opcoes.includes(valor);
}

/* ------------------------------------------------------------------ */
/* 3. Registro CRM e regras de dependência/bloqueio (§6)               */
/* ------------------------------------------------------------------ */

export type RegistroCrmCA04 = {
  leadAtivo?: boolean;
  areaResponsavel?: string | null;
  responsavelNominal?: string | null;
  proximaAcao?: string | null;
  dataProximaAcao?: string | null;

  statusCall?: string | null;
  resumoValidadoCall?: string | null;
  consentimentoGravacao?: string | null;
  dataHoraConsentimento?: string | null;
  canalConsentimento?: string | null;
  versaoAvisoAplicado?: string | null;
  linkGravacao?: string | null;

  spinConcluido?: boolean;
  registroSpinCorrespondente?: boolean;

  sinalAderencia?: string | null;
  confiancaTriagem?: string | null;
  viaJuridica?: string | null;
  statusVia?: string | null;
  geracaoAscendente?: string | null;
  estadoDocumentalInicial?: string | null;

  marcoAplicavel?: boolean;
  fonteOficialMarco?: string | null;
  ultimaVerificacaoMarco?: string | null;
  revisaoHumanaJuridica?: string | null;
  statusAtualizacaoMarco?: string | null;

  pesquisaAplicavel?: boolean;
  autorizacaoPesquisaPrevia?: string | null;

  despesaTerceiroAprovada?: boolean;
  despesaVinculadaProposta?: string | null;
  aprovacaoClienteRegistrada?: string | null;
  responsavelPagador?: string | null;

  eixoComercial?: string | null;
  eixoFormalizacao?: string | null;
  linkProposta?: string | null;
  linkContrato?: string | null;
  referenciaTransacional?: string | null;
  motivoPerda?: string | null;

  dossieAtivo?: boolean;
  dossieMae?: string | null;
  ambienteAutorizado?: string | null;
  linkInternoDossie?: string | null;
  nivelAcessoDossie?: string | null;
  responsavelDossie?: string | null;
};

export type Bloqueio = {
  /** Número da regra em §6 do artefato. */
  regra: number;
  titulo: string;
  detalhe: string;
};

const preenchido = (v: unknown) => typeof v === "string" && v.trim().length > 0;

/**
 * Avalia as regras de dependência e bloqueio §6 do artefato.
 * Não corrige nem persiste nada: apenas devolve o que impede avanço.
 */
export function avaliarBloqueiosCA04(r: RegistroCrmCA04): Bloqueio[] {
  const b: Bloqueio[] = [];
  const add = (regra: number, titulo: string, detalhe: string) => b.push({ regra, titulo, detalhe });

  if (r.leadAtivo && !(preenchido(r.areaResponsavel) && preenchido(r.responsavelNominal) && preenchido(r.proximaAcao) && preenchido(r.dataProximaAcao))) {
    add(1, "Lead ativo incompleto", "Área responsável, responsável nominal e próxima ação datada são obrigatórios.");
  }

  if (r.statusCall === "Realizada" && !(preenchido(r.resumoValidadoCall) && preenchido(r.proximaAcao) && preenchido(r.dataProximaAcao))) {
    add(2, "Call realizada sem registro", "Exige resultado da Discovery, resumo validado da call e próxima ação datada.");
  }

  if (r.consentimentoGravacao === "Recusado" && preenchido(r.linkGravacao)) {
    add(3, "Consentimento recusado", "Gravação, transcrição e link de gravação ficam bloqueados.");
  }

  if (r.consentimentoGravacao === "Não solicitado" && preenchido(r.linkGravacao)) {
    add(4, "Consentimento não solicitado", "Sem solicitação registrada não há ativação de gravação nem link.");
  }

  if (r.consentimentoGravacao === "Concedido" && !(preenchido(r.dataHoraConsentimento) && preenchido(r.canalConsentimento) && preenchido(r.versaoAvisoAplicado))) {
    add(5, "Consentimento concedido incompleto", "Exige data/hora, canal e versão do aviso aplicado.");
  }

  if (r.spinConcluido && !r.registroSpinCorrespondente) {
    add(6, "SPIN concluído sem evidência", "Exige registro correspondente no resumo validado ou no Brief de Discovery.");
  }

  if ((r.sinalAderencia === "Forte" || r.sinalAderencia === "Provável") && !(preenchido(r.confiancaTriagem) && preenchido(r.viaJuridica) && preenchido(r.geracaoAscendente) && preenchido(r.estadoDocumentalInicial))) {
    add(7, "Sinal de aderência sem sustentação", "Forte/Provável exige confiança da triagem, via jurídica preliminar, geração do ascendente e estado documental inicial.");
  }

  if (r.marcoAplicavel && !(preenchido(r.fonteOficialMarco) && preenchido(r.ultimaVerificacaoMarco) && preenchido(r.revisaoHumanaJuridica) && preenchido(r.statusAtualizacaoMarco))) {
    add(8, "Marco jurídico incompleto", "Exige fonte oficial, última verificação, revisão humana/jurídica e status de atualização.");
  }

  if (r.statusAtualizacaoMarco === "Desatualizado" || r.statusAtualizacaoMarco === "A revisar") {
    add(9, "Marco não confiável para comunicação", "Bloqueia comunicação externa que apresente o marco como atual sem revisão humana.");
  }

  if (r.pesquisaAplicavel && r.autorizacaoPesquisaPrevia !== "Registrada") {
    add(10, "Pesquisa sem autorização registrada", "Bloqueia pesquisa nominal externa, pedido institucional, contato com órgão e solicitação em nome da pessoa.");
  }

  if (r.despesaTerceiroAprovada && !(preenchido(r.despesaVinculadaProposta) && preenchido(r.aprovacaoClienteRegistrada) && preenchido(r.responsavelPagador))) {
    add(11, "Despesa de terceiro sem lastro", "Exige vínculo com a proposta, aprovação do cliente registrada e responsável pagador. Nunca é desembolso ou reembolso do Clube.");
  }

  if (r.eixoComercial === "Proposta enviada" && !(preenchido(r.linkProposta) && preenchido(r.responsavelNominal))) {
    add(12, "Proposta enviada sem link", "Exige link da proposta e responsável nominal.");
  }

  if (r.eixoFormalizacao === "Contrato assinado" && !preenchido(r.linkContrato)) {
    add(13, "Contrato assinado sem link", "Exige link do contrato assinado no ambiente documental autorizado.");
  }

  if (r.eixoFormalizacao === "Pagamento inicial confirmado" && !preenchido(r.referenciaTransacional)) {
    add(14, "Pagamento sem referência transacional", "O CRM só espelha a fonte transacional autorizada; não confirma pagamento por conta própria.");
  }

  if (r.eixoComercial === "Perdido" && !preenchido(r.motivoPerda)) {
    add(16, "Perda sem motivo", "Resultado comercial Perdido exige motivo de perda registrado.");
  }

  if (r.statusVia === "Encerrada para novos pedidos") {
    add(17, "Via encerrada para novos pedidos", "Bloqueia proposta de protocolo; permite diagnóstico, pesquisa de alternativa, nutrição ou encerramento por decisão humana.");
  }

  if (r.dossieAtivo && !(preenchido(r.dossieMae) && preenchido(r.ambienteAutorizado) && preenchido(r.linkInternoDossie) && preenchido(r.nivelAcessoDossie) && preenchido(r.responsavelDossie))) {
    add(18, "Dossiê ativo incompleto", "Exige dossiê-mãe, ambiente autorizado, link interno, nível de acesso e responsável pelo dossiê.");
  }

  return b;
}

/** §6.19 — campos que jamais podem ser projetados para App Cliente/one-page. */
export const CAMPOS_PROIBIDOS_CLIENTE_CA04 = [
  "sinal de aderência",
  "confiança da triagem",
  "risco de ruptura",
  "consentimento",
  "gravação",
  "transcrição",
  "link interno",
  "documento restrito",
  "despesa interna",
  "SKU técnico",
  "preço provisório",
  "ranking",
] as const;

/* ------------------------------------------------------------------ */
/* 4. Máquinas de estado (§D)                                          */
/* ------------------------------------------------------------------ */

export type Transicao = {
  de: string;
  para: string;
  gatilho: string;
  responsavel: string;
  dadosMinimos: string;
  bloqueio: string;
  fonteVerdade: string;
};

export const EIXO_COMERCIAL_TRANSICOES: readonly Transicao[] = [
  { de: "Novo lead", para: "Triagem", gatilho: "Primeiro contato qualificado", responsavel: "SDR", dadosMinimos: "Origem do lead, objetivo declarado", bloqueio: "Área responsável e responsável nominal não podem estar vazios", fonteVerdade: "Painel de Calls" },
  { de: "Triagem", para: "Discovery agendada", gatilho: "Agendamento de call", responsavel: "SDR/Closer", dadosMinimos: "Data/hora da call, responsável", bloqueio: "Consentimento Recusado sem alternativa sem gravação definida", fonteVerdade: "Painel de Calls" },
  { de: "Discovery agendada", para: "Discovery realizada", gatilho: "Call realizada", responsavel: "Closer", dadosMinimos: "Status da call = Realizada, resumo validado", bloqueio: "SPIN Concluído sem registro correspondente", fonteVerdade: "Painel de Calls → CRM Mestre" },
  { de: "Discovery realizada", para: "Diagnóstico em elaboração", gatilho: "Brief registrado", responsavel: "Responsável nominal", dadosMinimos: "Brief de Discovery preenchido", bloqueio: "Autorização de pesquisa prévia indefinida antes de pesquisa nominal", fonteVerdade: "Brief/CRM" },
  { de: "Diagnóstico em elaboração", para: "Proposta enviada", gatilho: "Diagnóstico concluído + decisão de avançar", responsavel: "Responsável nominal", dadosMinimos: "SKU recomendado válido, produtos/serviços recomendados", bloqueio: "SKU precisa estar ativo na Planilha Mestre", fonteVerdade: "Diagnóstico/CRM" },
  { de: "Proposta enviada", para: "Negociação", gatilho: "Contato de retorno/ajuste", responsavel: "Closer", dadosMinimos: "Objeção registrada", bloqueio: "Nenhum", fonteVerdade: "CRM" },
  { de: "Negociação", para: "Nutrição", gatilho: "Decisão de adiar sem perder o lead", responsavel: "Closer/Responsável", dadosMinimos: "Motivo/observação", bloqueio: "Nenhum", fonteVerdade: "CRM" },
  { de: "Negociação", para: "Perdido", gatilho: "Recusa definitiva", responsavel: "Closer/Responsável", dadosMinimos: "Motivo de perda", bloqueio: "Nenhum", fonteVerdade: "CRM" },
  { de: "*", para: "Encerrado sem aderência", gatilho: "Sinal de aderência = Sem aderência atual confirmado", responsavel: "Responsável nominal", dadosMinimos: "Justificativa registrada", bloqueio: "Exige diagnóstico mínimo registrado", fonteVerdade: "CRM" },
] as const;

export const EIXO_FORMALIZACAO_TRANSICOES: readonly Transicao[] = [
  { de: "Não iniciado", para: "Contrato enviado", gatilho: "Proposta aceita", responsavel: "Closer/Jurídico-parceiro", dadosMinimos: "Link da proposta aceita", bloqueio: "Eixo Comercial precisa estar em Proposta enviada ou Negociação", fonteVerdade: "CRM" },
  { de: "Contrato enviado", para: "Contrato assinado", gatilho: "Assinatura confirmada", responsavel: "Jurídico-parceiro/Operações", dadosMinimos: "Link do contrato assinado", bloqueio: "Nenhum campo de contrato vazio", fonteVerdade: "Ambiente documental" },
  { de: "Contrato assinado", para: "Pagamento inicial confirmado", gatilho: "Conciliação na fonte transacional", responsavel: "Financeiro", dadosMinimos: "Referência ao evento transacional", bloqueio: "CRM não confirma sem espelhar a fonte transacional", fonteVerdade: "Asaas" },
  { de: "Pagamento inicial confirmado", para: "Cliente ativo", gatilho: "Ativação formal", responsavel: "Operações", dadosMinimos: "Data de ativação", bloqueio: "Nenhum", fonteVerdade: "CRM" },
  { de: "Cliente ativo", para: "Onboarding iniciado", gatilho: "Início do checklist", responsavel: "Operações", dadosMinimos: "Checklist criado", bloqueio: "Nenhum", fonteVerdade: "CRM/Desk" },
  { de: "Onboarding iniciado", para: "Caso ativo", gatilho: "Condição operacional atendida (decisão humana pendente)", responsavel: "Pesquisa/Operações", dadosMinimos: "Dossiê-mãe vinculado, responsável do caso definido", bloqueio: "Onboarding incompleto — critério exato depende de decisão humana", fonteVerdade: "Desk" },
  { de: "Caso ativo", para: "Arquivado", gatilho: "Conclusão ou interrupção definitiva", responsavel: "Responsável do caso", dadosMinimos: "Motivo de arquivamento", bloqueio: "Nenhum", fonteVerdade: "Desk" },
] as const;

export function transicoesPermitidas(
  eixo: "comercial" | "formalizacao",
  estadoAtual: string,
): Transicao[] {
  const base = eixo === "comercial" ? EIXO_COMERCIAL_TRANSICOES : EIXO_FORMALIZACAO_TRANSICOES;
  return base.filter((t) => t.de === estadoAtual || t.de === "*");
}

/* ------------------------------------------------------------------ */
/* 5. Derivação do Resultado comercial (§D.3)                          */
/* ------------------------------------------------------------------ */

const MOTIVO_PARA_RESULTADO: Record<string, string> = {
  "Preço": "Perdido — preço",
  Elegibilidade: "Perdido — elegibilidade",
  "Documentação": "Perdido — documentos",
  Prazo: "Perdido — timing",
  "Sem resposta": "Perdido — sem retorno",
  "Escolheu concorrente": "Perdido — concorrente",
};

export type ResultadoDerivado = {
  resultado: string;
  /** Verdadeiro quando a derivação depende de decisão humana ainda pendente. */
  dependeDecisaoHumana: boolean;
  justificativa: string;
};

/**
 * Resultado comercial é SEMPRE derivado dos dois eixos — nunca definido à mão.
 * "Convertido" depende da condição operacional ainda não decidida (Decisão 1),
 * portanto nunca é afirmado aqui.
 */
export function derivarResultadoComercial(r: RegistroCrmCA04): ResultadoDerivado {
  const comercial = r.eixoComercial ?? "Novo lead";
  const formalizacao = r.eixoFormalizacao ?? "Não iniciado";

  if (comercial === "Nutrição") {
    return { resultado: "Nutrição", dependeDecisaoHumana: false, justificativa: "Eixo Comercial = Nutrição." };
  }

  if (comercial === "Perdido") {
    const motivo = r.motivoPerda ? MOTIVO_PARA_RESULTADO[r.motivoPerda] : undefined;
    return {
      resultado: motivo ?? "Perdido — sem retorno",
      dependeDecisaoHumana: false,
      justificativa: motivo
        ? `Eixo Comercial = Perdido, desdobrado pelo motivo "${r.motivoPerda}".`
        : "Eixo Comercial = Perdido sem motivo mapeado; registrar motivo de perda (regra 16).",
    };
  }

  if (formalizacao !== "Não iniciado" && formalizacao !== "Contrato enviado") {
    return {
      resultado: "Em negociação",
      dependeDecisaoHumana: true,
      justificativa:
        "Formalização avançou, mas o estado exato que marca “Convertido” depende de decisão humana pendente (Decisão 1). Nada é derivado como Convertido sem essa definição.",
    };
  }

  if (
    (comercial === "Proposta enviada" || comercial === "Negociação") &&
    (formalizacao === "Não iniciado" || formalizacao === "Contrato enviado")
  ) {
    return {
      resultado: "Em negociação",
      dependeDecisaoHumana: false,
      justificativa: "Comercial em proposta/negociação com formalização ainda não concluída.",
    };
  }

  return {
    resultado: "Em aberto",
    dependeDecisaoHumana: false,
    justificativa: "Comercial anterior a Proposta enviada e formalização não iniciada.",
  };
}

/* ------------------------------------------------------------------ */
/* 6. Roteiro Mestre de Discovery v2 (§E) e Brief (§F)                 */
/* ------------------------------------------------------------------ */

export const ROTEIRO_DISCOVERY_V2: readonly string[] = [
  "Identificação e contexto da call — ID da oportunidade, responsável, data/hora, canal.",
  "Aviso e registro de consentimento de gravação — ler o aviso vigente antes de qualquer gravação.",
  "Abertura consultiva — enquadrar o propósito da call, sem promessa de resultado.",
  "Confirmação do que a pessoa já informou — não repetir perguntas já respondidas.",
  "Estrutura familiar mínima — identificar o núcleo, sem aprofundar prova documental.",
  "Objetivo principal — o que a pessoa busca.",
  "SPIN — Situação, Problema, Implicação e Necessidade/valor.",
  "Nacionalidade/linha prioritária — a partir da lista controlada.",
  "Estado documental inicial — nível de documentação já disponível.",
  "Lacunas prioritárias — o que falta para avançar a triagem.",
  "Triagem comercial/técnica preliminar — aplicar sinal de aderência preliminar.",
  "Perguntas de aprofundamento — apenas as necessárias para reduzir a maior lacuna.",
  "Objeções e contexto de decisão — preço, prazo, decisor familiar, confiança, concorrência.",
  "Próxima ação — sempre datada e com responsável nominal.",
  "Registro pós-call — resumo validado, sem transcrição bruta.",
  "Handoff para CRM, dossiê e Desk — apenas com autorização aplicável de pesquisa prévia.",
] as const;

/** Linguagem proibida no roteiro e em qualquer registro derivado dele. */
export const TERMOS_PROIBIDOS_DISCOVERY = [
  "elegibilidade confirmada",
  "direito adquirido",
  "cidadania reconhecida",
  "rota jurídica definida",
] as const;

export function roteiroSemLinguagemConclusiva(linhas: readonly string[] = ROTEIRO_DISCOVERY_V2): boolean {
  const texto = linhas.join(" ").toLowerCase();
  return TERMOS_PROIBIDOS_DISCOVERY.every((t) => !texto.includes(t));
}

export type CampoBrief = { campo: string; origem: "automático" | "manual" | "misto"; retornaAoCrm: boolean };

export const BRIEF_DISCOVERY: readonly CampoBrief[] = [
  { campo: "ID da oportunidade", origem: "automático", retornaAoCrm: true },
  { campo: "Nome do lead", origem: "automático", retornaAoCrm: true },
  { campo: "Data/hora da call", origem: "automático", retornaAoCrm: true },
  { campo: "Responsável nominal", origem: "automático", retornaAoCrm: true },
  { campo: "Roteiro-base utilizado", origem: "manual", retornaAoCrm: false },
  { campo: "Origem do lead", origem: "automático", retornaAoCrm: true },
  { campo: "País/linha prioritária", origem: "misto", retornaAoCrm: true },
  { campo: "Objetivo declarado", origem: "misto", retornaAoCrm: true },
  { campo: "Dados recebidos antes da call", origem: "manual", retornaAoCrm: false },
  { campo: "Materiais e documentos mencionados", origem: "manual", retornaAoCrm: true },
  { campo: "Materiais ainda não localizados", origem: "manual", retornaAoCrm: true },
  { campo: "SPIN registrado", origem: "manual", retornaAoCrm: true },
  { campo: "Lacunas prioritárias", origem: "manual", retornaAoCrm: true },
  { campo: "Objeções registradas", origem: "manual", retornaAoCrm: true },
  { campo: "Sinal de aderência preliminar", origem: "manual", retornaAoCrm: true },
  { campo: "Próxima ação datada", origem: "manual", retornaAoCrm: true },
] as const;

/* ------------------------------------------------------------------ */
/* 7. Matriz de handoff (§G)                                           */
/* ------------------------------------------------------------------ */

export type EtapaHandoff = {
  etapa: string;
  dadoRecebido: string;
  dadoCriado: string;
  responsavel: string;
  condicaoAprovacao: string;
  visibilidade: string;
  bloqueio: string;
};

export const MATRIZ_HANDOFF_CA04: readonly EtapaHandoff[] = [
  {
    etapa: "Painel de Calls → Brief",
    dadoRecebido: "Identificação, SPIN, resultado da call",
    dadoCriado: "Registro de Discovery",
    responsavel: "SDR/Closer",
    condicaoAprovacao: "Call realizada e resumo validado",
    visibilidade: "Interna: Comercial",
    bloqueio: "SPIN “Concluído” sem evidência correspondente",
  },
  {
    etapa: "Brief → CRM Mestre",
    dadoRecebido: "Campos estruturados (país, objetivo, autorização de pesquisa, próxima ação)",
    dadoCriado: "Diagnóstico",
    responsavel: "Responsável nominal",
    condicaoAprovacao: "Brief revisado",
    visibilidade: "Interna: Comercial/Pesquisa",
    bloqueio: "Autorização de pesquisa ausente bloqueia pesquisa nominal externa",
  },
  {
    etapa: "CRM Mestre → Dossiê-mãe",
    dadoRecebido: "Vínculo de núcleo/família, referência de caso",
    dadoCriado: "Dossiê-mãe (somente com todos os requisitos canônicos)",
    responsavel: "Responsável pelo dossiê",
    condicaoAprovacao:
      "Cliente ativo + autorização de pesquisa + responsável + ambiente + nível de acesso + núcleo identificado",
    visibilidade: "Restrito / Equipe do caso",
    bloqueio: "Sem cliente ativo ou sem autorização de pesquisa, o dossiê não é criado",
  },
  {
    etapa: "Dossiê-mãe → Desk Intelligence",
    dadoRecebido: "Documentos, evidências e fontes recebidas",
    dadoCriado: "Evidência, Fonte, Documento",
    responsavel: "Pesquisa",
    condicaoAprovacao: "Revisão humana em cada elevação de estado",
    visibilidade: "Restrita: equipe autorizada",
    bloqueio: "Elevação de estado inicial direto para alto é proibida",
  },
  {
    etapa: "Desk Intelligence → App Cliente / one-page",
    dadoRecebido: "Síntese aprovada, estado sintetizado, próximo passo",
    dadoCriado: "Entrega com conteúdo aprovado",
    responsavel: "Responsável pela aprovação",
    condicaoAprovacao: "Revisão humana obrigatória, sempre",
    visibilidade: "Cliente autorizado",
    bloqueio: "Nenhum dado bruto passa sem aprovação explícita",
  },
] as const;

export const BLOQUEIOS_EXEMPLARES_HANDOFF: readonly string[] = [
  "Transcrição bruta fica em ambiente restrito; nunca chega ao App Cliente ou one-page.",
  "Documento recebido vai para Dossiê/Desk; nunca é anexado no Painel de Calls nem exibido cru ao cliente.",
  "SKU, preço e link de cobrança vivem na Planilha Mestre/Asaas; o CRM apenas referencia.",
  "Evidência e fonte vivem no Desk; nunca servem como prova no CRM nem aparecem cruas ao cliente.",
  "Conteúdo cliente-facing só existe após aprovação humana da entrega correspondente.",
] as const;

/* ------------------------------------------------------------------ */
/* 8. Decisões humanas pendentes (§L)                                  */
/* ------------------------------------------------------------------ */

export type DecisaoPendenteCA04 = { numero: number; titulo: string; responsavel: string };

export const DECISOES_PENDENTES_CA04: readonly DecisaoPendenteCA04[] = [
  { numero: 1, titulo: "Estado do eixo Formalização/Operação que marca “Convertido”", responsavel: "Proprietária + Comercial/Financeiro" },
  { numero: 2, titulo: "Condição operacional para passar de Onboarding iniciado a Caso ativo", responsavel: "Operações + Pesquisa" },
  { numero: 3, titulo: "Responsável de catálogo da Planilha Mestre", responsavel: "Proprietária" },
  { numero: 4, titulo: "Critério que define Onboarding completo", responsavel: "Operações" },
  { numero: 5, titulo: "Campos de Entrega aprovados por padrão vs. caso a caso", responsavel: "Proprietária" },
  { numero: 6, titulo: "Critério padrão de arquivamento de Caso", responsavel: "Operações" },
  { numero: 7, titulo: "Regras de “Dispensa homologada” para revisão jurídica", responsavel: "Jurídico/parceiro + Proprietária" },
  { numero: 8, titulo: "Preenchimento da matriz de marcos jurídicos por país", responsavel: "Jurídico/parceiro" },
  { numero: 9, titulo: "Texto que registra cada escopo de autorização para pesquisa prévia", responsavel: "Jurídico/parceiro + Comercial" },
  { numero: 10, titulo: "Política de retenção de gravações e transcrições", responsavel: "Proprietária" },
  { numero: 11, titulo: "Listas com dependência por país, via jurídica ou etapa", responsavel: "Comercial + Pesquisa" },
  { numero: 12, titulo: "Validação do vocabulário de objeção, motivo de perda e próxima ação", responsavel: "Comercial" },
  { numero: 13, titulo: "Quem aprova elevação de fonte M3-CANDIDATA → M3-APROVADA e M4", responsavel: "Pesquisa + Proprietária" },
] as const;
