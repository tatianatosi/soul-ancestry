/**
 * JORNADA DO CLIENTE — camada operacional do Desk (função pura, sem I/O).
 *
 * Cobre:
 *  - fases padronizadas da jornada;
 *  - checklist obrigatório de formalização (caso Ana Luiza e demais);
 *  - cadência e saúde do caso (touchpoints, espera institucional externa);
 *  - micro-entregas ao cliente (somente "publicado" chega ao App Cliente);
 *  - interações internas (imutáveis, nunca projetadas automaticamente).
 *
 * Nada aqui declara elegibilidade, prazo ou resultado jurídico.
 */

/* ----------------------------- Fases ----------------------------- */

export const FASES_JORNADA = [
  "aceite_formalizacao",
  "onboarding",
  "pesquisa_inicial",
  "pesquisa_validacao",
  "preparacao_documental",
  "protocolo_acompanhamento",
  "reconhecimento",
  "pos_reconhecimento",
] as const;
export type FaseJornada = (typeof FASES_JORNADA)[number];

export const ROTULO_FASE: Record<FaseJornada, string> = {
  aceite_formalizacao: "Aceite e formalização",
  onboarding: "Onboarding",
  pesquisa_inicial: "Pesquisa inicial",
  pesquisa_validacao: "Pesquisa e validação",
  preparacao_documental: "Preparação documental",
  protocolo_acompanhamento: "Protocolo e acompanhamento",
  reconhecimento: "Reconhecimento",
  pos_reconhecimento: "Pós-reconhecimento",
};

/* ------------------------- Micro-entregas ------------------------- */

export const TIPOS_ENTREGA = [
  "boas_vindas",
  "plano_de_acao",
  "checklist_documental",
  "documento_recebido",
  "documento_localizado",
  "documento_validado",
  "pendencia_contextualizada",
  "ascendente_identificado",
  "ramo_familiar_incluido",
  "arvore_inicial",
  "arvore_evoluida",
  "linha_do_tempo_atualizada",
  "relatorio_parcial",
  "relatorio_consolidado",
  "prontidao_documental",
  "marco_de_protocolo",
  "atualizacao_de_fase",
  "devolutiva_de_reconhecimento",
  "roteiro_pos_reconhecimento",
  "atualizacao_sem_acao_necessaria",
  "outro_aprovado",
] as const;
export type TipoEntrega = (typeof TIPOS_ENTREGA)[number];

export const ROTULO_TIPO_ENTREGA: Record<TipoEntrega, string> = {
  boas_vindas: "Boas-vindas",
  plano_de_acao: "Plano de ação",
  checklist_documental: "Checklist documental",
  documento_recebido: "Documento recebido",
  documento_localizado: "Documento localizado",
  documento_validado: "Documento validado",
  pendencia_contextualizada: "Pendência contextualizada",
  ascendente_identificado: "Ascendente identificado",
  ramo_familiar_incluido: "Ramo familiar incluído",
  arvore_inicial: "Árvore inicial",
  arvore_evoluida: "Árvore evoluída",
  linha_do_tempo_atualizada: "Linha do tempo atualizada",
  relatorio_parcial: "Relatório parcial",
  relatorio_consolidado: "Relatório consolidado",
  prontidao_documental: "Prontidão documental",
  marco_de_protocolo: "Marco de protocolo",
  atualizacao_de_fase: "Atualização de fase",
  devolutiva_de_reconhecimento: "Devolutiva de reconhecimento",
  roteiro_pos_reconhecimento: "Roteiro pós-reconhecimento",
  atualizacao_sem_acao_necessaria: "Atualização sem ação necessária",
  outro_aprovado: "Outro (aprovado)",
};

export const STATUS_APROVACAO = ["rascunho", "em_revisao", "aprovado", "publicado", "arquivado"] as const;
export type StatusAprovacao = (typeof STATUS_APROVACAO)[number];

export type MicroentregaBruta = {
  id: string;
  deliverable_type?: string | null;
  journey_phase?: string | null;
  title_client?: string | null;
  summary_approved?: string | null;
  approval_status?: string | null;
  deep_link?: string | null;
  available_at?: string | null;
  viewed_at?: string | null;
  internal_reference?: string | null;
  priority?: string | null;
};

export type MicroentregaPublicada = {
  id: string;
  tipo: string;
  fase: string;
  titulo: string;
  resumo: string;
  deep_link: string;
  disponivel_em: string;
  visualizada_em: string;
};

const TERMOS_PROIBIDOS =
  /(hip[óo]tese|sku|score|risco|elegibilidade|evid[êe]ncia|fonte interna|transcri[çc][ãa]o|grava[çc][ãa]o|nota interna|asaas|pre[çc]o provis[óo]rio)/i;

/** Somente entregas publicadas, sanitizadas, sem referência interna. */
export function entregasParaAppCliente(itens: MicroentregaBruta[]): MicroentregaPublicada[] {
  return itens
    .filter((i) => i.approval_status === "publicado")
    .filter((i) => !!(i.title_client ?? "").trim() && !!(i.summary_approved ?? "").trim())
    .filter((i) => !TERMOS_PROIBIDOS.test(`${i.title_client ?? ""} ${i.summary_approved ?? ""}`))
    .map((i) => ({
      id: i.id,
      tipo: i.deliverable_type ?? "outro_aprovado",
      fase: i.journey_phase ?? "",
      titulo: (i.title_client ?? "").trim(),
      resumo: (i.summary_approved ?? "").trim(),
      deep_link: (i.deep_link ?? "").trim(),
      disponivel_em: i.available_at ?? "",
      visualizada_em: i.viewed_at ?? "",
    }));
}

/** Transições permitidas do fluxo de aprovação de micro-entrega. */
export const TRANSICOES_ENTREGA: Record<StatusAprovacao, StatusAprovacao[]> = {
  rascunho: ["em_revisao", "arquivado"],
  em_revisao: ["rascunho", "aprovado", "arquivado"],
  aprovado: ["publicado", "em_revisao", "arquivado"],
  publicado: ["arquivado"],
  arquivado: [],
};

export function podeTransicionarEntrega(de: StatusAprovacao, para: StatusAprovacao): boolean {
  return TRANSICOES_ENTREGA[de]?.includes(para) ?? false;
}

/* --------------------------- Cadência ---------------------------- */

export type StatusCadencia = "regular" | "atencao" | "critico";

export type EntradaCadencia = {
  hoje: string;
  ultimoTouchpointEm?: string | null;
  aguardandoInstituicaoExterna?: boolean;
  motivoEsperaExterna?: string | null;
};

export type SaudeCadencia = {
  diasSemTouchpoint: number;
  status: StatusCadencia;
  motivo: string;
};

const DIA = 86_400_000;

export function calcularCadencia(e: EntradaCadencia): SaudeCadencia {
  if (!e.ultimoTouchpointEm) {
    return { diasSemTouchpoint: 0, status: "critico", motivo: "Nenhum touchpoint registrado com o cliente." };
  }
  const dias = Math.max(0, Math.floor((Date.parse(e.hoje) - Date.parse(e.ultimoTouchpointEm)) / DIA));
  const esperaComunicada = !!e.aguardandoInstituicaoExterna && !!(e.motivoEsperaExterna ?? "").trim();
  if (esperaComunicada) {
    return { diasSemTouchpoint: dias, status: "regular", motivo: "Espera institucional externa previamente comunicada." };
  }
  if (dias >= 14) return { diasSemTouchpoint: dias, status: "critico", motivo: "14 dias ou mais sem atualização contextualizada." };
  if (dias >= 10) return { diasSemTouchpoint: dias, status: "atencao", motivo: "10 dias ou mais sem atualização contextualizada." };
  return { diasSemTouchpoint: dias, status: "regular", motivo: "Cadência dentro do limite de 14 dias." };
}

/** Um touchpoint só é válido se responder às quatro perguntas obrigatórias. */
export type TouchpointConteudo = {
  oQueFoiFeito?: string | null;
  oQueEstaAguardando?: string | null;
  oQueNaoDependeDoCliente?: string | null;
  proximoMarcoVerificavel?: string | null;
};

export function validarTouchpoint(t: TouchpointConteudo): { valido: boolean; faltando: string[] } {
  const faltando: string[] = [];
  if (!(t.oQueFoiFeito ?? "").trim()) faltando.push("o que foi feito");
  if (!(t.oQueEstaAguardando ?? "").trim()) faltando.push("o que está sendo aguardado");
  if (!(t.oQueNaoDependeDoCliente ?? "").trim()) faltando.push("o que não depende do cliente");
  if (!(t.proximoMarcoVerificavel ?? "").trim()) faltando.push("próximo marco verificável");
  return { valido: faltando.length === 0, faltando };
}

/* ------------------- Checklist de formalização -------------------- */

export const CHECKLIST_FORMALIZACAO = [
  { ordem: 1, chave: "cadastro", rotulo: "Completar/validar cadastro", fase: "aceite_formalizacao" },
  { ordem: 2, chave: "contrato_preparar", rotulo: "Preparar contrato específico", fase: "aceite_formalizacao" },
  { ordem: 3, chave: "contrato_enviar", rotulo: "Enviar contrato", fase: "aceite_formalizacao" },
  { ordem: 4, chave: "contrato_assinatura", rotulo: "Confirmar assinatura do contrato", fase: "aceite_formalizacao" },
  { ordem: 5, chave: "cobranca", rotulo: "Criar ou validar cobrança conforme SKU/condição canônicos", fase: "aceite_formalizacao" },
  { ordem: 6, chave: "pagamento_inicial", rotulo: "Confirmar pagamento inicial pela referência transacional", fase: "aceite_formalizacao" },
  { ordem: 7, chave: "dossie_mae", rotulo: "Validar ou criar dossiê-mãe", fase: "onboarding" },
  { ordem: 8, chave: "nucleo_familiar", rotulo: "Criar núcleo familiar", fase: "onboarding" },
  { ordem: 9, chave: "requerentes", rotulo: "Criar registros individuais de requerentes vinculados ao núcleo", fase: "onboarding" },
  { ordem: 10, chave: "ambiente_dossie", rotulo: "Registrar ambiente, link interno, nível de acesso e responsável do dossiê", fase: "onboarding" },
  { ordem: 11, chave: "autorizacao_pesquisa", rotulo: "Registrar autorização para pesquisa prévia e escopo", fase: "onboarding" },
  { ordem: 12, chave: "abrir_onboarding", rotulo: "Abrir onboarding (exige contrato assinado + pagamento inicial)", fase: "onboarding" },
  { ordem: 13, chave: "plano_call", rotulo: "Criar plano de ação, checklist documental e call de onboarding", fase: "onboarding" },
  { ordem: 14, chave: "caso_ativo", rotulo: "Abrir caso ativo (exige onboarding mínimo)", fase: "pesquisa_inicial" },
] as const;

export type ChaveChecklist = (typeof CHECKLIST_FORMALIZACAO)[number]["chave"];

export type EstadoCaso = {
  aceiteComercial: boolean;
  cadastroCompleto: boolean;
  contratoPreparado: boolean;
  contratoEnviado: boolean;
  contratoAssinado: boolean;
  cobrancaCriada: boolean;
  pagamentoInicialConfirmado: boolean;
  dossieMae: boolean;
  ambienteDossie: boolean;
  nucleoFamiliar: boolean;
  requerentes: boolean;
  autorizacaoPesquisa: boolean;
  despesasTerceirosAprovadas: boolean;
  onboardingIniciado: boolean;
  onboardingMinimoConcluido: boolean;
};

export type Bloqueio = { codigo: string; descricao: string };

export type SituacaoCaso = {
  rotuloCard: string;
  eixoComercial: string;
  eixoFormalizacao: string;
  estadoCaso: string;
  bloqueios: Bloqueio[];
  permite: { onboarding: boolean; casoAtivo: boolean; dossieAtivo: boolean; pesquisaExterna: boolean };
  proximaAcao: string;
};

export function avaliarSituacaoCaso(e: EstadoCaso): SituacaoCaso {
  const bloqueios: Bloqueio[] = [];
  if (!e.contratoAssinado)
    bloqueios.push({ codigo: "CONTRATO_NAO_ASSINADO", descricao: "Contrato específico inexistente ou ainda não assinado." });
  if (!e.cadastroCompleto) bloqueios.push({ codigo: "CADASTRO_PENDENTE", descricao: "Dados cadastrais pendentes." });
  if (!e.pagamentoInicialConfirmado)
    bloqueios.push({ codigo: "PAGAMENTO_NAO_CONFIRMADO", descricao: "Cobrança/pagamento inicial não confirmados." });
  if (!e.autorizacaoPesquisa)
    bloqueios.push({ codigo: "AUTORIZACAO_PESQUISA_AUSENTE", descricao: "Autorização e escopo de pesquisa não registrados." });
  if (!e.despesasTerceirosAprovadas)
    bloqueios.push({ codigo: "DESPESAS_TERCEIROS_PENDENTES", descricao: "Despesas de terceiros não ativadas/aprovadas." });
  if (!e.dossieMae || !e.ambienteDossie)
    bloqueios.push({ codigo: "DOSSIE_MAE_NAO_VALIDADO", descricao: "Pasta de pré-onboarding pendente de validação como dossiê-mãe canônico." });
  if (!e.nucleoFamiliar) bloqueios.push({ codigo: "NUCLEO_FAMILIAR_AUSENTE", descricao: "Núcleo familiar não definido." });

  const permiteOnboarding = e.contratoAssinado && e.pagamentoInicialConfirmado;
  const permiteCasoAtivo = permiteOnboarding && e.onboardingMinimoConcluido;
  const dossieAtivo = e.dossieMae && e.ambienteDossie && e.nucleoFamiliar;
  const pesquisaExterna = permiteOnboarding && e.autorizacaoPesquisa;

  const proximaAcao = !e.cadastroCompleto
    ? "Completar cadastro dos signatários"
    : !e.contratoPreparado
      ? "Preparar contrato específico"
      : !e.contratoEnviado
        ? "Enviar contrato para assinatura"
        : !e.contratoAssinado
          ? "Confirmar assinatura do contrato"
          : !e.cobrancaCriada
            ? "Validar cobrança conforme SKU/condição canônicos"
            : !e.pagamentoInicialConfirmado
              ? "Confirmar pagamento inicial"
              : !e.onboardingIniciado
                ? "Abrir onboarding"
                : !e.onboardingMinimoConcluido
                  ? "Concluir onboarding mínimo"
                  : "Operar caso ativo";

  return {
    rotuloCard: e.aceiteComercial && !e.contratoAssinado ? "Aceite confirmado — formalização pendente" : "Formalização concluída",
    eixoComercial: e.aceiteComercial ? "Proposta aceita / formalização" : "Em negociação",
    eixoFormalizacao: e.contratoAssinado ? (e.pagamentoInicialConfirmado ? "Pagamento confirmado" : "Contrato assinado") : "Contrato pendente",
    estadoCaso: permiteCasoAtivo ? "Caso ativo" : permiteOnboarding ? "Onboarding" : "Pendências de pré-onboarding",
    bloqueios,
    permite: { onboarding: permiteOnboarding, casoAtivo: permiteCasoAtivo, dossieAtivo, pesquisaExterna },
    proximaAcao,
  };
}

export function checklistComEstado(e: EstadoCaso) {
  const feito: Record<ChaveChecklist, boolean> = {
    cadastro: e.cadastroCompleto,
    contrato_preparar: e.contratoPreparado,
    contrato_enviar: e.contratoEnviado,
    contrato_assinatura: e.contratoAssinado,
    cobranca: e.cobrancaCriada,
    pagamento_inicial: e.pagamentoInicialConfirmado,
    dossie_mae: e.dossieMae,
    nucleo_familiar: e.nucleoFamiliar,
    requerentes: e.requerentes,
    ambiente_dossie: e.ambienteDossie,
    autorizacao_pesquisa: e.autorizacaoPesquisa,
    abrir_onboarding: e.onboardingIniciado && e.contratoAssinado && e.pagamentoInicialConfirmado,
    plano_call: e.onboardingMinimoConcluido,
    caso_ativo: e.onboardingMinimoConcluido && e.contratoAssinado && e.pagamentoInicialConfirmado,
  };
  return CHECKLIST_FORMALIZACAO.map((i) => ({ ...i, feito: feito[i.chave] }));
}
