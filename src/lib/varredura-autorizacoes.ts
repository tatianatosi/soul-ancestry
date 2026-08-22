/**
 * Varredura de autorizações da Proprietária Administradora.
 *
 * Regras puras, sem efeito colateral: descrevem, área por área canônica,
 * o que é operação interna (liberada por decisão humana auditada) e o que é
 * ação externa (só ocorre após confirmação final explícita).
 *
 * Nada aqui executa, envia, publica, cobra, assina ou integra.
 */

import { ACOES_EXTERNAS, type AcaoExterna } from "@/lib/modo-proprietaria";

export type Natureza = "interna" | "externa";

export type AcaoArea = {
  chave: string;
  rotulo: string;
  natureza: Natureza;
  /** Quem autoriza a execução. */
  autorizacao: string;
  /** Onde o ato fica registrado. */
  registro: string;
  /** Pendências continuam visíveis, mas não travam o avanço interno. */
  bloqueiaInterno: false;
};

export type AreaCanonica = {
  chave: string;
  rotulo: string;
  rota: string;
  /** Estado interno máximo que a proprietária alcança sem ato externo. */
  estadoMaximoInterno: string;
  acoes: AcaoArea[];
};

/** Estado interno terminal: tudo pronto, aguardando confirmação manual. */
export const ESTADO_MAXIMO_INTERNO = "pronto_para_confirmacao_externa";

const interna = (
  chave: string,
  rotulo: string,
  registro = "audit_logs + owner_override_events",
  autorizacao = "Proprietária administradora (decisão humana auditada)",
): AcaoArea => ({ chave, rotulo, natureza: "interna", autorizacao, registro, bloqueiaInterno: false });

const externa = (chave: AcaoExterna, rotulo: string, registro = "Confirmação final + audit_logs"): AcaoArea => ({
  chave,
  rotulo,
  natureza: "externa",
  autorizacao: "Confirmação final explícita da proprietária (nunca automática)",
  registro,
  bloqueiaInterno: false,
});

/** Áreas canônicas varridas. Toda área tem operação interna liberada. */
export const AREAS_CANONICAS: AreaCanonica[] = [
  {
    chave: "leads_discovery",
    rotulo: "Leads e Discovery",
    rota: "/leads",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("criar_editar_lead", "Criar, editar e reclassificar lead"),
      interna("avancar_discovery", "Avançar Discovery mesmo com triagem incompleta"),
      externa("enviar_whatsapp", "Contato por WhatsApp com o lead"),
    ],
  },
  {
    chave: "proposta_comercial",
    rotulo: "Proposta e condição comercial",
    rota: "/propostas",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("corrigir_proposta_escopo_preco", "Corrigir escopo, preço e SKU da proposta"),
      interna("aprovar_proposta_incompleta", "Aprovar proposta com campos pendentes assumidos"),
      interna("homologar_condicao_comercial", "Homologar condição comercial"),
      externa("enviar_email", "Enviar proposta ao cliente"),
    ],
  },
  {
    chave: "catalogo_sku",
    rotulo: "Catálogo e SKUs",
    rota: "/catalogo",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("homologar_sku", "Homologar SKU por decisão humana"),
      interna("resolver_divergencia", "Resolver divergência de fonte de preço"),
    ],
  },
  {
    chave: "contrato",
    rotulo: "Contrato, versões e Anexos I–V",
    rota: "/contratos",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("gerar_versao_final", "Gerar versão final mesmo com parâmetros pendentes"),
      interna("previa_interna", "Abrir prévia interna com campos ausentes sinalizados"),
      externa("enviar_contrato", "Enviar contrato ao cliente"),
      externa("solicitar_assinatura", "Solicitar assinatura"),
    ],
  },
  {
    chave: "ordens_servico",
    rotulo: "Ordens de serviço",
    rota: "/ordens-servico",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("corrigir_os_anexos_previa", "Criar e corrigir OS, anexos e prévia"),
      interna("aprovar_os", "Aprovar OS assumindo pendências visíveis"),
    ],
  },
  {
    chave: "onboarding",
    rotulo: "Onboarding e gates de ativação",
    rota: "/casos",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("liberar_onboarding", "Liberar onboarding com gates pendentes assumidos"),
      interna("registrar_excecao", "Registrar exceção operacional com prazo"),
    ],
  },
  {
    chave: "casos_tarefas",
    rotulo: "Casos, planejador e tarefas",
    rota: "/tarefas",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("avancar_caso_planejador_tarefa", "Avançar caso, planejador e tarefas"),
      interna("editar_fila_responsavel_prazo", "Editar fila, responsáveis e prazos"),
    ],
  },
  {
    chave: "pesquisa",
    rotulo: "Pesquisa genealógica e evidências",
    rota: "/pesquisa",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("avancar_pesquisa_evidencia_microentrega", "Avançar pesquisa, evidências e microentregas"),
      externa("pesquisar_externamente", "Pesquisa externa"),
      externa("enviar_pedido_instituicao", "Pedido a instituição"),
    ],
  },
  {
    chave: "documentos",
    rotulo: "Documentos e acervo",
    rota: "/evidencias",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("criar_documento_sem_arquivo", "Criar registro de documento antes do arquivo"),
      interna("anexar_documento_posterior", "Anexar ou substituir documento em etapa posterior"),
      interna("reclassificar_documento", "Reclassificar categoria, sensibilidade e visibilidade"),
      externa("publicar_no_app_cliente", "Liberar documento ao cliente"),
    ],
  },
  {
    chave: "financeiro",
    rotulo: "Financeiro",
    rota: "/financeiro",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("corrigir_condicao_comercial", "Corrigir parcelas, valores e vencimentos internos"),
      externa("emitir_cobranca", "Emitir cobrança"),
      externa("registrar_pagamento", "Registrar pagamento"),
      externa("criar_ou_alterar_link_asaas", "Criar ou alterar link de pagamento"),
    ],
  },
  {
    chave: "app_cliente",
    rotulo: "App Cliente e projeções",
    rota: "/acessos-portal",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("aprovar_projecao_app_cliente", "Aprovar projeção interna"),
      externa("publicar_no_app_cliente", "Publicar no App Cliente"),
    ],
  },
  {
    chave: "governanca",
    rotulo: "Governança, auditoria e arquivamento",
    rota: "/auditoria",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("ver_todos_estados_da_organizacao", "Ver todos os estados e pendências"),
      interna("consultar_arquivados", "Consultar arquivados e histórico"),
      externa("excluir_registro_ou_versao", "Excluir registro ou versão"),
    ],
  },
  {
    chave: "planejador",
    rotulo: "Planejador diário",
    rota: "/planner",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("criar_editar_item_planejador", "Criar, editar, reordenar e concluir item do planejador"),
      interna("editar_fila_responsavel_prazo", "Definir responsável, prazo e próxima ação"),
    ],
  },
  {
    chave: "pessoas_familias",
    rotulo: "Pessoas, núcleos, dependentes e representação",
    rota: "/pessoas",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("corrigir_pessoas_dependentes_representacao", "Criar e corrigir pessoas, núcleos, dependentes e participação"),
      interna("registrar_representacao_pendente", "Registrar representação pendente como exceção com prazo"),
      externa("criar_procuracao", "Emitir procuração"),
      externa("agir_em_nome_do_cliente", "Agir em nome do cliente"),
    ],
  },
  {
    chave: "painel_hoje",
    rotulo: "Painel Hoje, fila, sinais e exceções",
    rota: "/painel",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("assumir_decisao_e_avancar", "Assumir decisão e avançar item da fila"),
      interna("registrar_excecao", "Abrir, renovar, regularizar ou revogar exceção operacional"),
      interna("editar_fila_responsavel_prazo", "Reordenar fila, atribuir responsável e prazo"),
    ],
  },
  {
    chave: "administracao",
    rotulo: "Administração, usuários, papéis, RLS, storage e integrações",
    rota: "/administracao",
    estadoMaximoInterno: ESTADO_MAXIMO_INTERNO,
    acoes: [
      interna("gerir_usuarios_e_papeis", "Convidar internamente, alterar papel e suspender acesso"),
      interna("consultar_auditoria_e_rls", "Consultar auditoria, políticas e histórico"),
      interna("preparar_migracao_ou_backup", "Preparar pacote de migração ou restauração"),
      externa("aplicar_migration_producao", "Aplicar migration em produção"),
      externa("restaurar_backup", "Restaurar backup sobrescrevendo dados"),
      externa("excluir_registro_ou_versao", "Exclusão definitiva"),
    ],
  },
];

/** Toda ação externa mapeada pertence ao catálogo canônico de ações externas. */
export function acoesExternasMapeadas(): string[] {
  const chaves = new Set<string>();
  for (const a of AREAS_CANONICAS) {
    for (const ac of a.acoes) if (ac.natureza === "externa") chaves.add(ac.chave);
  }
  return [...chaves].filter((c) => (ACOES_EXTERNAS as readonly string[]).includes(c));
}

export function acoesInternas(): AcaoArea[] {
  return AREAS_CANONICAS.flatMap((a) => a.acoes).filter((a) => a.natureza === "interna");
}

/* ------------------------------------------------------------------ */
/* Exceções operacionais                                               */
/* ------------------------------------------------------------------ */

export type TipoExcecao = {
  chave: string;
  rotulo: string;
  quando: string;
  /** Quem pode autorizar. */
  autoriza: string;
  /** Validade sugerida em dias; null = sem prazo, exige revisão manual. */
  validadeDias: number | null;
  /** O que precisa acontecer para regularizar. */
  regularizacao: string;
  /** Consequência enquanto pendente — nunca bloqueio interno. */
  impacto: string;
};

export const CATALOGO_EXCECOES: TipoExcecao[] = [
  {
    chave: "microentrega_caso_pausado",
    rotulo: "Micro-entrega em caso pausado",
    quando: "Entrega precisa avançar com o caso pausado.",
    autoriza: "Proprietária administradora",
    validadeDias: 30,
    regularizacao: "Reativar o caso ou concluir a entrega pendente.",
    impacto: "Item permanece na fila com selo de exceção até regularizar.",
  },
  {
    chave: "reabertura_caso",
    rotulo: "Reabertura de caso encerrado",
    quando: "Caso encerrado precisa voltar a operar.",
    autoriza: "Proprietária administradora",
    validadeDias: null,
    regularizacao: "Encerrar novamente com registro de motivo.",
    impacto: "Histórico anterior preservado; novo ciclo auditado.",
  },
  {
    chave: "desbloqueio_tarefa",
    rotulo: "Desbloqueio excepcional de tarefa",
    quando: "Tarefa bloqueada por dependência que não se resolverá a tempo.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Resolver a dependência original.",
    impacto: "Bloqueio segue visível como pendência assumida.",
  },
  {
    chave: "prazo_excedido",
    rotulo: "Prazo excedido com autorização",
    quando: "SLA estourado por decisão consciente.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Repactuar prazo e concluir a etapa.",
    impacto: "Indicador de atraso continua contabilizado.",
  },
  {
    chave: "documento_pendente",
    rotulo: "Documento pendente em etapa posterior",
    quando: "Etapa avança antes do documento existir ou ser legível.",
    autoriza: "Proprietária administradora",
    validadeDias: 30,
    regularizacao: "Anexar ou substituir o documento e revisar.",
    impacto: "Documento fica como pendente; nenhuma etapa interna trava.",
  },
  {
    chave: "dado_cadastral_incompleto",
    rotulo: "Dado cadastral incompleto",
    quando: "Pessoa, dependente ou representação sem campo obrigatório.",
    autoriza: "Proprietária administradora",
    validadeDias: 30,
    regularizacao: "Completar o cadastro na entidade canônica.",
    impacto: "Campo ausente sinalizado em prévias e fichas.",
  },
  {
    chave: "proposta_incompleta",
    rotulo: "Proposta incompleta aprovada",
    quando: "Aprovação necessária antes da completude das páginas 1–7.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Completar a proposta e revalidar a conferência de escopo.",
    impacto: "Conferência de escopo permanece em aberto.",
  },
  {
    chave: "sku_nao_homologado",
    rotulo: "SKU ou preço ainda não homologado",
    quando: "Escopo usa item fora da base homologada.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Homologar o SKU na fonte mestre do catálogo.",
    impacto: "Item entra na fila de saneamento do catálogo.",
  },
  {
    chave: "condicao_comercial_fora_padrao",
    rotulo: "Condição comercial fora do padrão",
    quando: "Desconto, parcelamento ou vencimento fora da matriz.",
    autoriza: "Proprietária administradora",
    validadeDias: 30,
    regularizacao: "Homologar a condição ou ajustar ao padrão.",
    impacto: "Sinal comercial permanece no Painel Hoje.",
  },
  {
    chave: "consentimento_pendente",
    rotulo: "Consentimento pendente",
    quando: "Operação interna precisa avançar antes do aceite formal.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Coletar o consentimento ou registrar dispensa fundamentada.",
    impacto: "Nenhuma liberação ao cliente ocorre enquanto pendente.",
  },
  {
    chave: "contrato_sem_anexo",
    rotulo: "Contrato sem anexo aplicável",
    quando: "Versão gerada antes de todos os anexos estarem prontos.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Vincular o anexo e gerar nova versão.",
    impacto: "Prévia interna exibe o anexo faltante em destaque.",
  },
  {
    chave: "escopo_divergente",
    rotulo: "Divergência de escopo entre proposta e OS",
    quando: "Proposta e ordem de serviço não coincidem.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Reconciliar escopo na fonte canônica e reconferir.",
    impacto: "Divergência listada na conferência de escopo.",
  },
  {
    chave: "contrato_assinatura_pendente",
    rotulo: "Contrato ou assinatura pendente",
    quando: "Etapa interna avança antes do contrato assinado.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Concluir assinatura ou registrar desistência.",
    impacto: "Nenhuma execução externa ocorre; assinatura nunca é presumida.",
  },
  {
    chave: "pesquisa_recheque_pendente",
    rotulo: "Pesquisa, evidência ou rechecagem pendente",
    quando: "Achado precisa avançar antes da validação da evidência.",
    autoriza: "Proprietária administradora",
    validadeDias: 30,
    regularizacao: "Rechecar a fonte e validar ou descartar a evidência.",
    impacto: "Achado permanece como hipótese; nunca vira evidência validada.",
  },
  {
    chave: "responsavel_prazo_ausente",
    rotulo: "Responsável, prazo ou próxima ação ausente",
    quando: "Item entra na fila sem dono ou sem data definida.",
    autoriza: "Proprietária administradora",
    validadeDias: 7,
    regularizacao: "Atribuir responsável, prazo e próxima ação.",
    impacto: "Item aparece na fila com sinal de indefinição.",
  },
  {
    chave: "onboarding_acesso_pendente",
    rotulo: "Onboarding ou acesso externo pendente",
    quando: "Caso opera antes do acesso do cliente estar ativo.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Concluir onboarding e ativar o acesso com confirmação.",
    impacto: "Cliente não recebe nada; trabalho interno segue.",
  },
  {
    chave: "integracao_indisponivel",
    rotulo: "Integração indisponível",
    quando: "Serviço externo (pagamento, storage, e-mail) fora do ar ou não conectado.",
    autoriza: "Proprietária administradora",
    validadeDias: 7,
    regularizacao: "Restabelecer a integração e reprocessar manualmente.",
    impacto: "Ato externo permanece em pronto_para_confirmacao_externa.",
  },
  {
    chave: "dado_teste_demo",
    rotulo: "Dado TESTE/DEMO/fixture em uso",
    quando: "Registro de fixture é usado em fluxo operacional.",
    autoriza: "Proprietária administradora",
    validadeDias: 30,
    regularizacao: "Substituir por dado real ou arquivar o registro de teste.",
    impacto: "Selo de fixture permanece visível e fora das métricas reais.",
  },
  {
    chave: "conflito_ou_falta_de_fonte",
    rotulo: "Conflito ou falta de fonte canônica",
    quando: "Duas fontes divergem ou a fonte homologada não existe.",
    autoriza: "Proprietária administradora",
    validadeDias: 15,
    regularizacao: "Eleger a fonte canônica e registrar a decisão.",
    impacto: "Valor exibido fica marcado como não homologado.",
  },
];

export const TIPOS_EXCECAO_ROTULOS: Record<string, string> = Object.fromEntries(
  CATALOGO_EXCECOES.map((e) => [e.chave, e.rotulo]),
);

export function excecaoPorChave(chave: string): TipoExcecao | undefined {
  return CATALOGO_EXCECOES.find((e) => e.chave === chave);
}

/** Vencida = passou da validade e ainda não foi regularizada. */
export function excecaoVencida(
  excecao: { valido_ate?: string | null; regularizado_em?: string | null },
  agora: Date = new Date(),
): boolean {
  if (excecao.regularizado_em) return false;
  if (!excecao.valido_ate) return false;
  const limite = new Date(excecao.valido_ate);
  return !Number.isNaN(limite.getTime()) && limite.getTime() < agora.getTime();
}

export function validadeSugerida(chave: string, base: Date = new Date()): string | null {
  const tipo = excecaoPorChave(chave);
  if (!tipo?.validadeDias) return null;
  const d = new Date(base);
  d.setDate(d.getDate() + tipo.validadeDias);
  return d.toISOString();
}

/* ------------------------------------------------------------------ */
/* Documentos ao longo do ciclo                                        */
/* ------------------------------------------------------------------ */


/** Campos obrigatórios de todo registro de exceção operacional. */
export const CAMPOS_EXCECAO = [
  "entidade",
  "entidade_id",
  "tipo",
  "regra_afetada",
  "estado_original",
  "decisao",
  "motivo",
  "fonte_evidencia",
  "valor_anterior",
  "valor_novo",
  "autora",
  "criado_em",
  "responsavel_regularizacao",
  "valido_ate",
  "impacto",
  "status",
] as const;

export const STATUS_EXCECAO = ["aberta", "regularizada", "expirada", "revogada"] as const;
export type StatusExcecao = (typeof STATUS_EXCECAO)[number];

/** O que uma exceção jamais pode simular. */
export const EXCECAO_NUNCA_FALSIFICA = [
  "pagamento",
  "assinatura",
  "elegibilidade",
  "evidencia_validada",
  "contrato_executado",
  "acesso_externo",
] as const;

/** Exceção reaparece na fila antes de expirar (janela de reaviso em dias). */
export const DIAS_REAVISO_EXCECAO = 3;

export function excecaoDeveReaparecerNaFila(
  excecao: { valido_ate?: string | null; regularizado_em?: string | null },
  agora: Date = new Date(),
): boolean {
  if (excecao.regularizado_em) return false;
  if (!excecao.valido_ate) return true;
  const limite = new Date(excecao.valido_ate).getTime();
  if (Number.isNaN(limite)) return true;
  return limite - agora.getTime() <= DIAS_REAVISO_EXCECAO * 86_400_000;
}

/* ------------------------------------------------------------------ */
/* Documentos: classes, estados e fluxo por etapa                      */
/* ------------------------------------------------------------------ */

export const CLASSES_DOCUMENTO = [
  "interno",
  "recebido_do_cliente",
  "evidencia_pesquisa",
  "minuta",
  "contrato",
  "anexo",
  "financeiro",
  "entrega",
  "publicacao",
] as const;
export type ClasseDocumento = (typeof CLASSES_DOCUMENTO)[number];

export const ESTADOS_DOCUMENTO = [
  "estruturado_sem_arquivo",
  "recebido",
  "em_revisao",
  "quarentena",
  "ausente",
  "dispensado",
  "ilegivel",
  "em_rechecagem",
  "aguardando_cliente",
  "aguardando_instituicao",
  "aprovado_interno",
  "pronto_para_confirmacao_externa",
] as const;
export type EstadoDocumento = (typeof ESTADOS_DOCUMENTO)[number];

export const METADADOS_DOCUMENTO = [
  "origem",
  "titular",
  "vinculo_canonico",
  "data",
  "responsavel",
  "confidencialidade",
  "status",
  "pendencia",
] as const;

export type FluxoDocumento = {
  etapa: string;
  rotulo: string;
  permiteEstrutura: boolean;
  permiteAnexoPosterior: boolean;
  bloqueiaInterno: false;
  regra: string;
};

export const FLUXO_DOCUMENTOS: FluxoDocumento[] = [
  {
    etapa: "pre_caso_discovery",
    rotulo: "A. Pré-caso e Discovery",
    permiteEstrutura: true,
    permiteAnexoPosterior: true,
    bloqueiaInterno: false,
    regra: "Estrutura e anexos internos livres; nenhum acesso externo automático.",
  },
  {
    etapa: "proposta_contrato",
    rotulo: "B. Proposta e contrato",
    permiteEstrutura: true,
    permiteAnexoPosterior: true,
    bloqueiaInterno: false,
    regra: "Minutas e anexos podem chegar depois; pendência é visível e não trava versão nem avanço auditado.",
  },
  {
    etapa: "pre_onboarding",
    rotulo: "C. Pré-onboarding",
    permiteEstrutura: true,
    permiteAnexoPosterior: true,
    bloqueiaInterno: false,
    regra: "Canal controlado de recebimento com registro de pendência; nada é solicitado sem confirmação.",
  },
  {
    etapa: "caso_ativo",
    rotulo: "D. Caso ativo",
    permiteEstrutura: true,
    permiteAnexoPosterior: true,
    bloqueiaInterno: false,
    regra: "Documento interno pode ser criado ou substituído a qualquer momento, com versão preservada.",
  },
  {
    etapa: "app_cliente",
    rotulo: "E. App Cliente",
    permiteEstrutura: true,
    permiteAnexoPosterior: true,
    bloqueiaInterno: false,
    regra: "Upload só para pessoas/casos elegíveis; recebido entra em quarentena para revisão rastreada.",
  },
  {
    etapa: "publicacao",
    rotulo: "F. Publicação ao cliente",
    permiteEstrutura: true,
    permiteAnexoPosterior: true,
    bloqueiaInterno: false,
    regra: "Exige sanitização e confirmação final explícita; conteúdo interno nunca é exposto.",
  },
];

export function fluxoDocumentoPorEtapa(etapa: string): FluxoDocumento | undefined {
  return FLUXO_DOCUMENTOS.find((f) => f.etapa === etapa);
}

export const ETAPAS_ACEITAM_DOCUMENTO = [
  "lead",
  "discovery",
  "proposta",
  "contrato",
  "ordem_servico",
  "onboarding",
  "pesquisa",
  "entrega",
  "pos_entrega",
] as const;

export type EtapaDocumento = (typeof ETAPAS_ACEITAM_DOCUMENTO)[number];

export const REGRAS_DOCUMENTO = {
  criarSemArquivo: true,
  anexarDepois: true,
  substituirComVersao: true,
  reclassificar: true,
  exclusaoFisica: false,
  quarentenaParaRecebidoDoCliente: true,
  projecaoSanitizadaSemConteudoInterno: true,
  liberacaoAoCliente: "externa",
} as const;

export function documentoPodeSerAdicionadoEm(etapa: string): etapa is EtapaDocumento {
  return (ETAPAS_ACEITAM_DOCUMENTO as readonly string[]).includes(etapa);
}

/** Resumo textual da varredura, usado na tela e nos relatórios. */
export function resumoVarredura() {
  const acoes = AREAS_CANONICAS.flatMap((a) => a.acoes);
  return {
    areas: AREAS_CANONICAS.length,
    acoesInternas: acoes.filter((a) => a.natureza === "interna").length,
    acoesExternas: acoes.filter((a) => a.natureza === "externa").length,
    excecoes: CATALOGO_EXCECOES.length,
    etapasFluxoDocumento: FLUXO_DOCUMENTOS.length,
    etapasComDocumento: ETAPAS_ACEITAM_DOCUMENTO.length,
    bloqueiosInternos: acoes.filter((a) => a.bloqueiaInterno).length,
  };
}
