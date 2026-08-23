/**
 * Varredura final de completude contratual, operacional e técnica.
 *
 * Camada SOMENTE-LEITURA: consolida itens pendentes, parciais, não
 * localizados, bloqueados, conflitantes, sem implementação ou sem teste.
 * Nenhuma função aqui cria, altera, aprova, assina, envia, publica,
 * cobra, integra, migra ou exclui dado, documento ou configuração.
 */

export const VARREDURA_COMPLETUDE_VERSAO = "CA-VARREDURA-COMPLETUDE-v1.0";
export const VARREDURA_COMPLETUDE_DATA = "2026-08-22";

export const FONTES_VARREDURA: string[] = [
  "Devolutivas e relatórios do Lovable (thread de implementação)",
  "CA-EVO-03_Motor_Contratual_Modular",
  "CA-EVO-04_Dados_Vivos_e_Integracoes",
  "CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza",
  "CA-EVO-05B",
  "CA-10A1_Pre_Onboarding_Deduplicado",
  "Auditoria Mãe (docs/auditoria/*)",
  "Relatório de varredura administrativa (src/lib/varredura-administracao.ts)",
  "Catálogo / Planilha Mestre (product_catalog, Top 30 Pareto)",
  "Testes e build atuais do repositório",
];

/* ------------------------------------------------------------------ */
/* 1. Anexos I–V                                                       */
/* ------------------------------------------------------------------ */

export const ESTADOS_ANEXO_VARREDURA = [
  "pronto",
  "parcial",
  "nao_localizado",
  "invalido",
  "substituido",
  "requer_materializacao",
] as const;
export type EstadoAnexoVarredura = (typeof ESTADOS_ANEXO_VARREDURA)[number];

export const ROTULO_ESTADO_ANEXO_VARREDURA: Record<EstadoAnexoVarredura, string> = {
  pronto: "Pronto",
  parcial: "Parcial",
  nao_localizado: "Não localizado",
  invalido: "Inválido",
  substituido: "Substituído",
  requer_materializacao: "Requer materialização no sistema",
};

export type VerificacaoAnexo = "verificado_diretamente" | "apenas_citado_em_relatorio";

export type LinhaAnexoVarredura = {
  codigo: string;
  nome: string;
  existe: boolean;
  localizacao: string;
  id: string;
  versao: string | null;
  estado: EstadoAnexoVarredura;
  verificacao: VerificacaoAnexo;
  integridade: string;
  relacaoContratoBase: string;
  gatilhoUso: string;
  dependencias: string[];
  impactoAusencia: string;
  permitePreviaInterna: boolean;
  acaoInternaProprietaria: string;
  acaoExternaComConfirmacao: string;
  fonteBusca: string;
  dataBusca: string;
};

export const ANEXOS_VARREDURA: LinhaAnexoVarredura[] = [
  {
    codigo: "ANEXO_I",
    nome: "Anexo I — Ordem de Serviço",
    existe: true,
    localizacao: "src/lib/anexos-i-v.ts (motor) + contract_annexes (instância versionada)",
    id: "ANEXO_I_ORDEM_SERVICO",
    versao: "ANEXO-I-ORDEM-DE-SERVICO-v1.0",
    estado: "parcial",
    verificacao: "verificado_diretamente",
    integridade:
      "Motor, regras e campos existem; a OS da Ana Luiza ainda não foi preparada a partir da proposta aprovada.",
    relacaoContratoBase: "Deriva escopo e entregáveis do contrato-base v2, sem alterar o corpo fixo.",
    gatilhoUso: "Proposta/OS aprovada vinculada ao caso.",
    dependencias: ["Proposta aprovada", "SKU homologado", "Condição comercial vigente"],
    impactoAusencia: "Sem OS não há escopo executável nem gate de pesquisa/entrega.",
    permitePreviaInterna: true,
    acaoInternaProprietaria: "Editar, salvar rascunho, gerar prévia interna e assumir decisão auditada de avanço.",
    acaoExternaComConfirmacao: "Envio da OS ao cliente e coleta de aceite.",
    fonteBusca: "Repositório + contract_annexes",
    dataBusca: VARREDURA_COMPLETUDE_DATA,
  },
  {
    codigo: "ANEXO_II",
    nome: "Anexo II — Autorização de despesas externas",
    existe: false,
    localizacao:
      "Estrutura de dados existe (DespesaExternaAnexo, POLITICAS_DESPESA); texto jurídico já revisado, ainda não materializado no repositório canônico.",
    id: "ANEXO_II_DESPESAS_EXTERNAS",
    versao: null,
    estado: "nao_localizado",
    verificacao: "apenas_citado_em_relatorio",
    integridade:
      "Texto jurídico já revisado e aprovado; falta localizar o arquivo aprovado e materializá-lo em docs/contratos com versão canônica.",
    relacaoContratoBase: "Cláusula de despesas do contrato-base exige anexo específico por teto e destino.",
    gatilhoUso: "Qualquer despesa externa reembolsável (cartórios, tradutores, taxas).",
    dependencias: ["Teto por destino", "Política de reembolso homologada", "Materialização do texto aprovado no repositório"],
    impactoAusencia: "Despesa externa não pode ser autorizada nem reembolsada com respaldo contratual.",
    permitePreviaInterna: true,
    acaoInternaProprietaria:
      "Registrar 'modelo ausente' com motivo, anexar posteriormente versão aprovada e visualizar prévia com estado explícito.",
    acaoExternaComConfirmacao: "Autorizar despesa externa real e efetuar/reembolsar pagamento.",
    fonteBusca: "docs/contratos/, contract_annexes, devolutivas CA-EVO-03",
    dataBusca: VARREDURA_COMPLETUDE_DATA,
  },
  {
    codigo: "ANEXO_III",
    nome: "Anexo III — Autorização de pesquisa",
    existe: true,
    localizacao: "src/lib/anexos-i-v.ts + gate server em src/lib/anexos-persistidos.server.ts",
    id: "ANEXO_III_AUTORIZACAO_PESQUISA",
    versao: "ANEXO-III-AUTORIZACAO-PESQUISA-v1.0",
    estado: "parcial",
    verificacao: "verificado_diretamente",
    integridade: "Regras do motor, tetos e ações bloqueadas verificadas; instância aprovada por caso ainda ausente.",
    relacaoContratoBase: "Autorização específica exigida pela cláusula de pesquisa do contrato-base v2.",
    gatilhoUso: "Pesquisa externa ou pedido institucional.",
    dependencias: ["Contrato assinado", "Escopo de pesquisa definido", "Teto de despesa"],
    impactoAusencia: "Pesquisa externa e pedido institucional permanecem bloqueados no servidor.",
    permitePreviaInterna: true,
    acaoInternaProprietaria: "Preencher, salvar, gerar prévia e registrar exceção operacional auditada.",
    acaoExternaComConfirmacao: "Execução de pesquisa externa e pedido a autoridade/cartório.",
    fonteBusca: "Repositório + contract_annexes",
    dataBusca: VARREDURA_COMPLETUDE_DATA,
  },
  {
    codigo: "ANEXO_IV",
    nome: "Anexo IV — Procuração específica",
    existe: false,
    localizacao: "Motor paramétrico em src/lib/procuracao-europeia.ts; instrumento assinado não localizado.",
    id: "ANEXO_IV_PROCURACAO",
    versao: "ANEXO-IV-PROCURACAO-ESPECIFICA-v1.0 (modelo do motor, sem texto homologado)",
    estado: "nao_localizado",
    verificacao: "apenas_citado_em_relatorio",
    integridade:
      "Parâmetros de poderes existem; o texto jurídico já revisado ainda não foi materializado/versionado no repositório e não há procuração assinada para nenhum caso.",
    relacaoContratoBase: "Complementa a cláusula de representação; não substitui o contrato-base.",
    gatilhoUso: "Ato externo praticado em nome do cliente.",
    dependencias: ["Qualificação completa das partes", "Materialização do texto aprovado no repositório", "Reconhecimento/apostila quando exigido"],
    impactoAusencia: "Nenhum ato externo em nome do cliente pode ser praticado (bloqueio server-side).",
    permitePreviaInterna: true,
    acaoInternaProprietaria: "Registrar 'modelo ausente', preparar minuta interna e gerar prévia marcada como rascunho.",
    acaoExternaComConfirmacao: "Assinatura, reconhecimento e uso da procuração perante terceiros.",
    fonteBusca: "docs/contratos/, contract_annexes, CA-EVO-03",
    dataBusca: VARREDURA_COMPLETUDE_DATA,
  },
  {
    codigo: "ANEXO_V",
    nome: "Anexo V — Alteração contratual / aditivo",
    existe: false,
    localizacao: "Motor de impactos controlados em src/lib/anexos-i-v.ts; modelo de aditivo não localizado.",
    id: "ANEXO_V_ALTERACAO_ESCOPO",
    versao: null,
    estado: "nao_localizado",
    verificacao: "apenas_citado_em_relatorio",
    integridade: "Regras de impacto (prazo, valor, despesa) verificadas; texto de aditivo já revisado juridicamente, pendente de materialização e versionamento canônico.",
    relacaoContratoBase: "Único instrumento que pode alterar escopo/valor sem reescrever o corpo fixo.",
    gatilhoUso: "Mudança de escopo, prazo ou valor após assinatura.",
    dependencias: ["Contrato assinado vigente", "Justificativa de impacto", "Materialização do texto aprovado no repositório"],
    impactoAusencia: "Alterações de escopo ficam sem instrumento válido e travam a formalização.",
    permitePreviaInterna: true,
    acaoInternaProprietaria: "Registrar 'modelo ausente', versionar rascunho derivado e assumir decisão auditada.",
    acaoExternaComConfirmacao: "Assinatura do aditivo e comunicação ao cliente.",
    fonteBusca: "docs/contratos/, contract_annexes, CA-EVO-03",
    dataBusca: VARREDURA_COMPLETUDE_DATA,
  },
];

export const REGRA_ANEXOS_NAO_LOCALIZADOS =
  "Anexos II, IV e V já passaram por revisão jurídica; a pendência é de materialização, versionamento e vínculo ao caso. Nenhum texto jurídico substituto é criado: apenas o conteúdo aprovado é registrado, sem sobrescrever.";

export function anexosNaoLocalizados(): LinhaAnexoVarredura[] {
  return ANEXOS_VARREDURA.filter((a) => a.estado === "nao_localizado");
}

/* ------------------------------------------------------------------ */
/* 2. Matriz única de pendências                                       */
/* ------------------------------------------------------------------ */

export const AREAS_PENDENCIA = [
  "identidade_dados_caso",
  "pessoas_familia_representacao",
  "proposta_escopo_sku_preco",
  "contrato_os_anexos",
  "assinatura",
  "financeiro_asaas",
  "documentos_drive",
  "planejador_crm_tarefas",
  "pesquisa_externa_despesas",
  "app_cliente_publicacao",
  "integracoes_seguranca_infra",
  "administracao_rls_auditoria_testes",
] as const;
export type AreaPendencia = (typeof AREAS_PENDENCIA)[number];

export const ROTULO_AREA_PENDENCIA: Record<AreaPendencia, string> = {
  identidade_dados_caso: "Identidade e dados do caso",
  pessoas_familia_representacao: "Pessoas, família e representação",
  proposta_escopo_sku_preco: "Proposta, escopo, SKU, preço e condição",
  contrato_os_anexos: "Contrato, OS e Anexos I–V",
  assinatura: "Assinatura",
  financeiro_asaas: "Financeiro / Asaas",
  documentos_drive: "Documentos e Drive",
  planejador_crm_tarefas: "Planejador, CRM, tarefas e calendário",
  pesquisa_externa_despesas: "Pesquisa externa e despesas",
  app_cliente_publicacao: "App Cliente, sanitização e publicação",
  integracoes_seguranca_infra: "Integrações, automação, segurança e infraestrutura",
  administracao_rls_auditoria_testes: "Administração, RLS, auditoria e testes",
};

export const STATUS_PENDENCIA = [
  "PENDENTE",
  "PARCIAL",
  "NAO_LOCALIZADO",
  "BLOQUEADO",
  "CONFLITANTE",
  "SEM_IMPLEMENTACAO",
  "SEM_TESTE",
  "AGUARDA_CONFIRMACAO",
  "RESOLVIDO_POR_DECISAO_DA_PROPRIETARIA",
] as const;
export type StatusPendencia = (typeof STATUS_PENDENCIA)[number];

export const CRITICIDADES = ["critico", "alto", "medio", "baixo"] as const;
export type Criticidade = (typeof CRITICIDADES)[number];

export const ROTULO_CRITICIDADE: Record<Criticidade, string> = {
  critico: "Crítico",
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export type LinhaPendencia = {
  id: string;
  area: AreaPendencia;
  entidade: string;
  caso: string | null;
  status: StatusPendencia;
  criticidade: Criticidade;
  evidencia: string;
  risco: string;
  efeitoInterno: string;
  efeitoExterno: string;
  responsavel: string;
  proximaAcao: string;
  superavelPorDecisaoAuditada: boolean;
  prazo: string | null;
  dependencias: string[];
  criterioEncerramento: string;
};

export const MATRIZ_PENDENCIAS: LinhaPendencia[] = [
  {
    id: "PEND-01",
    area: "identidade_dados_caso",
    entidade: "crm_casos / case_registry",
    caso: "Ana Luiza",
    status: "RESOLVIDO_POR_DECISAO_DA_PROPRIETARIA",
    criticidade: "baixo",
    evidencia:
      "Decisão da Proprietária Administradora em 22/08/2026: CA-CID-AT-FAM-2026-001 é o único identificador canônico; CA-AUT-ANALUIZA-FAM-2026-001 permanece como referência legada resolvida para o mesmo caso.",
    risco: "Nenhum. Não há segundo caso, e a referência legada resolve para o caso canônico.",
    efeitoInterno: "Telas exibem apenas o código canônico, com 'Piloto real' como selo.",
    efeitoExterno: "Nenhum ato externo executado ou pendente por este item.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Nenhuma. Item encerrado por decisão registrada; não entra em go-live, Painel Hoje nem aprovações.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: [],
    criterioEncerramento: "Encerrado: identificador canônico já definido na operação.",
  },
  {
    id: "PEND-02",
    area: "pessoas_familia_representacao",
    entidade: "case_people / representacoes",
    caso: "Ana Luiza",
    status: "PENDENTE",
    criticidade: "alto",
    evidencia: "Cadastro de Alice incompleto e representação legal de Felipe sem instrumento vinculado.",
    risco: "Assinatura inválida por representação não comprovada de menor/dependente.",
    efeitoInterno: "Composição familiar fica parcial no Planejador e na prévia contratual.",
    efeitoExterno: "Bloqueia assinatura e emissão de procuração.",
    responsavel: "Operações",
    proximaAcao: "Completar cadastro e registrar estado de representação com fonte documental.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: ["Documentos de identidade", "Anexo IV"],
    criterioEncerramento: "Todas as pessoas com estado de representação explícito e documento vinculado.",
  },
  {
    id: "PEND-03",
    area: "proposta_escopo_sku_preco",
    entidade: "proposals / product_catalog",
    caso: "Ana Luiza",
    status: "CONFLITANTE",
    criticidade: "critico",
    evidencia: "Divergência entre preço da proposta Canva e preço vigente da Planilha Mestre para o SKU do caso.",
    risco: "Cobrar valor não homologado ou contratar escopo divergente.",
    efeitoInterno: "Condição comercial não pode ser derivada automaticamente.",
    efeitoExterno: "Bloqueia emissão de cobrança e assinatura.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Conferir escopo/preço na fonte mestre e registrar decisão auditada de qual prevalece.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: ["Catálogo homologado", "Proposta aprovada"],
    criterioEncerramento: "Preço, escopo e SKU idênticos entre proposta, condição comercial e catálogo.",
  },
  {
    id: "PEND-04",
    area: "contrato_os_anexos",
    entidade: "contracts",
    caso: "Ana Luiza",
    status: "PARCIAL",
    criticidade: "critico",
    evidencia: "Contrato do caso permanece como placeholder derivado do corpo fixo, sem parâmetros completos.",
    risco: "Prévia enviada com campos pendentes.",
    efeitoInterno: "Prévia abre com marca de rascunho interno.",
    efeitoExterno: "Impede envio para assinatura.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Completar ficha de parâmetros e gerar prévia final para revisão humana.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: ["PEND-02", "PEND-03"],
    criterioEncerramento: "Prévia final sem campos pendentes e revisão humana registrada.",
  },
  {
    id: "PEND-05",
    area: "contrato_os_anexos",
    entidade: "contract_annexes",
    caso: null,
    status: "NAO_LOCALIZADO",
    criticidade: "critico",
    evidencia: "Anexos II, IV e V já revisados juridicamente, porém sem registro canônico localizado (arquivo, versão e vínculo).",
    risco: "Despesa externa, representação e aditivo sem instrumento válido.",
    efeitoInterno: "Instâncias ficam em estado 'modelo ausente' com prévia marcada.",
    efeitoExterno: "Bloqueia despesa externa, ato em nome do cliente e alteração de escopo.",
    responsavel: "Proprietária administradora / Operações",
    proximaAcao: "Localizar os arquivos aprovados, registrá-los no repositório canônico com versão e vinculá-los ao caso.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["Localização do arquivo aprovado", "Registro canônico com versão e vínculo"],
    criterioEncerramento: "Modelo aprovado anexado, versionado e com prévia íntegra.",
  },
  {
    id: "PEND-06",
    area: "contrato_os_anexos",
    entidade: "service_orders / ANEXO_I",
    caso: "Ana Luiza",
    status: "PENDENTE",
    criticidade: "alto",
    evidencia: "OS não preparada a partir da proposta aprovada.",
    risco: "Execução sem escopo formal.",
    efeitoInterno: "Cadeia operacional trava na etapa OS/Anexo I.",
    efeitoExterno: "Sem OS não há aceite formal de escopo.",
    responsavel: "Operações",
    proximaAcao: "Preparar OS derivada da proposta e revisar internamente.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: ["PEND-03"],
    criterioEncerramento: "OS versionada, revisada e vinculada ao contrato.",
  },
  {
    id: "PEND-07",
    area: "assinatura",
    entidade: "contract_signatures",
    caso: "Ana Luiza",
    status: "BLOQUEADO",
    criticidade: "critico",
    evidencia: "Assinatura desabilitada por decisão de produto e por pendências de parâmetros.",
    risco: "Assinar documento incompleto.",
    efeitoInterno: "Preparação avança até 'pronto para confirmação externa'.",
    efeitoExterno: "Ato externo exige confirmação final explícita.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Manter bloqueio até prévia final aprovada; preparar confirmação externa.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["PEND-04", "PEND-05"],
    criterioEncerramento: "Prévia final aprovada e confirmação externa registrada manualmente.",
  },
  {
    id: "PEND-08",
    area: "financeiro_asaas",
    entidade: "invoices / integrations",
    caso: "Ana Luiza",
    status: "AGUARDA_CONFIRMACAO",
    criticidade: "alto",
    evidencia: "Primeira cobrança e integração Asaas preparadas, nunca executadas.",
    risco: "Cobrança indevida ou duplicada.",
    efeitoInterno: "Condição comercial pode ser registrada sem emitir cobrança.",
    efeitoExterno: "Emissão exige confirmação final irreversível.",
    responsavel: "Financeiro",
    proximaAcao: "Manter em fila preparada; confirmar apenas após contrato assinado.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["PEND-07"],
    criterioEncerramento: "Cobrança emitida após confirmação manual e conciliada.",
  },
  {
    id: "PEND-09",
    area: "documentos_drive",
    entidade: "case_documents",
    caso: "Ana Luiza",
    status: "PARCIAL",
    criticidade: "medio",
    evidencia: "Documentos com URL assinada implementada; espelho em Drive não integrado.",
    risco: "Perda de rastreabilidade de documentos externos.",
    efeitoInterno: "Upload e leitura interna funcionam.",
    efeitoExterno: "Compartilhamento externo não habilitado.",
    responsavel: "Operações",
    proximaAcao: "Registrar pendência de integração e manter documentos no repositório canônico.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: ["Integração de backup (ADR 0006)"],
    criterioEncerramento: "Política de espelho definida e auditada.",
  },
  {
    id: "PEND-10",
    area: "planejador_crm_tarefas",
    entidade: "tarefas / case_plans",
    caso: null,
    status: "PARCIAL",
    criticidade: "medio",
    evidencia: "Exceções sem dono e sem prazo aparecem no Painel Hoje.",
    risco: "Trabalho sem responsável.",
    efeitoInterno: "Fila diária mostra falha de qualidade.",
    efeitoExterno: "Nenhum.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Atribuir dono e prazo pela ação rápida do Painel Hoje.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: [],
    criterioEncerramento: "Zero itens sem dono ou prazo na fila priorizada.",
  },
  {
    id: "PEND-11",
    area: "pesquisa_externa_despesas",
    entidade: "research_requests / despesas",
    caso: "Ana Luiza",
    status: "BLOQUEADO",
    criticidade: "alto",
    evidencia: "Gate server-side exige Anexo III aprovado; Anexo II inexistente para despesas.",
    risco: "Pesquisa e despesa sem autorização.",
    efeitoInterno: "Planejamento de pesquisa pode ser rascunhado.",
    efeitoExterno: "Execução e pagamento bloqueados.",
    responsavel: "Pesquisa",
    proximaAcao: "Preparar Anexo III do caso e registrar ausência do Anexo II.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["PEND-05"],
    criterioEncerramento: "Anexo III aprovado e teto de despesa autorizado.",
  },
  {
    id: "PEND-12",
    area: "app_cliente_publicacao",
    entidade: "app_projections",
    caso: "Ana Luiza",
    status: "PENDENTE",
    criticidade: "medio",
    evidencia: "Projeção do App Cliente não publicada; sanitização de mérito ativa.",
    risco: "Exposição de juízo de mérito se publicada sem sanitização.",
    efeitoInterno: "Prévia interna disponível.",
    efeitoExterno: "Publicação exige confirmação e dados não-teste.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Revisar projeção sanitizada e preparar publicação.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["PEND-04"],
    criterioEncerramento: "Projeção aprovada, sanitizada e publicada com auditoria.",
  },
  {
    id: "PEND-13",
    area: "integracoes_seguranca_infra",
    entidade: "integrations / secrets",
    caso: null,
    status: "SEM_IMPLEMENTACAO",
    criticidade: "alto",
    evidencia: "Asaas, e-mail transacional e backup permanecem como intenção preparada.",
    risco: "Go-live sem canal de cobrança e comunicação.",
    efeitoInterno: "Filas gravam intenções sem executar.",
    efeitoExterno: "Toda execução exige confirmação externa.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Aprovar item a item pelo pacote único de aprovações.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["Segredos e credenciais"],
    criterioEncerramento: "Integração configurada, testada em sandbox e auditada.",
  },
  {
    id: "PEND-14",
    area: "administracao_rls_auditoria_testes",
    entidade: "user_roles / owner_override_events",
    caso: null,
    status: "PENDENTE",
    criticidade: "alto",
    evidencia: "Mapa de administradoras (principal, contingência, recuperação) proposto e não atribuído.",
    risco: "Perda de acesso administrativo sem contingência.",
    efeitoInterno: "Override auditado disponível apenas para a proprietária atual.",
    efeitoExterno: "Convite de contingência exige confirmação externa.",
    responsavel: "Proprietária administradora",
    proximaAcao: "Aprovar atribuição das três administradoras no pacote único.",
    superavelPorDecisaoAuditada: false,
    prazo: null,
    dependencias: ["E-mail de contingência"],
    criterioEncerramento: "Duas administradoras ativas e regra de último admin validada.",
  },
  {
    id: "PEND-15",
    area: "administracao_rls_auditoria_testes",
    entidade: "suíte de testes",
    caso: null,
    status: "SEM_TESTE",
    criticidade: "medio",
    evidencia: "Sem cobertura direta para Anexo II, Anexo V, filas de comunicação e infraestrutura.",
    risco: "Regressão silenciosa em gates de ação externa.",
    efeitoInterno: "Nenhum bloqueio.",
    efeitoExterno: "Nenhum.",
    responsavel: "Engenharia",
    proximaAcao: "Cobrir estados de ausência de modelo e bloqueio de ação externa sem confirmação.",
    superavelPorDecisaoAuditada: true,
    prazo: null,
    dependencias: [],
    criterioEncerramento: "Testes existentes e verdes para cada gate externo.",
  },
];

export function pendenciasPorArea(): Record<AreaPendencia, LinhaPendencia[]> {
  const base = Object.fromEntries(AREAS_PENDENCIA.map((a) => [a, [] as LinhaPendencia[]])) as Record<
    AreaPendencia,
    LinhaPendencia[]
  >;
  for (const l of MATRIZ_PENDENCIAS) base[l.area].push(l);
  return base;
}

export function pendenciasPorCriticidade(c: Criticidade): LinhaPendencia[] {
  return MATRIZ_PENDENCIAS.filter((l) => l.criticidade === c);
}

export function pendenciasSuperaveis(): LinhaPendencia[] {
  return MATRIZ_PENDENCIAS.filter((l) => l.superavelPorDecisaoAuditada);
}

export function aguardandoConfirmacaoExterna(): LinhaPendencia[] {
  return MATRIZ_PENDENCIAS.filter((l) => !l.superavelPorDecisaoAuditada);
}

/* ------------------------------------------------------------------ */
/* 3. Caso Ana Luiza                                                   */
/* ------------------------------------------------------------------ */

export const CONSOLIDADO_ANA = {
  idCanonicoRecomendado: "CA-CID-AT-FAM-2026-001",
  idAlternativo: "CA-AUT-ANALUIZA-FAM-2026-001",
  justificativaId:
    "Decisão aplicada: CA-CID-AT-FAM-2026-001 é o identificador canônico único; CA-AUT-ANALUIZA-FAM-2026-001 fica exclusivamente como referência legada, resolvida para o mesmo caso.",
  itens: [
    { rotulo: "Identificador canônico", situacao: "Resolvido por decisão da proprietária: CA-CID-AT-FAM-2026-001 (Projeto familiar — Ana Luiza, Piloto real)." },
    { rotulo: "Pessoa, núcleo e participantes", situacao: "Núcleo familiar registrado; Alice com cadastro incompleto." },
    { rotulo: "Representação de Felipe", situacao: "Sem instrumento vinculado; estado de representação pendente." },
    { rotulo: "Preço, escopo, SKU e condição", situacao: "Divergência entre proposta Canva e Planilha Mestre." },
    { rotulo: "Contrato", situacao: "Placeholder derivado do corpo fixo, sem parâmetros completos." },
    { rotulo: "Ordem de Serviço", situacao: "Não preparada." },
    { rotulo: "Anexos II, IV e V", situacao: "Não localizados; registrados como modelo ausente." },
    { rotulo: "Assinatura", situacao: "Bloqueada; preparação permitida até confirmação externa." },
    { rotulo: "Asaas e primeira cobrança", situacao: "Preparadas, não executadas." },
    { rotulo: "Pesquisa e despesas", situacao: "Bloqueadas por Anexo III pendente e Anexo II ausente." },
    { rotulo: "App Cliente", situacao: "Projeção sanitizada não publicada." },
    { rotulo: "Prévias", situacao: "Abrem mesmo com campos pendentes, sempre com marca de rascunho interno." },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 4. Ação da proprietária                                             */
/* ------------------------------------------------------------------ */

export const ACOES_PROPRIETARIA = [
  "editar",
  "salvar",
  "registrar_pendencia",
  "criar_versao_derivada",
  "registrar_excecao_operacional",
  "assumir_decisao_e_avancar",
  "gerar_previa_interna",
  "preparar_confirmacao_externa",
] as const;
export type AcaoProprietaria = (typeof ACOES_PROPRIETARIA)[number];

export const ROTULO_ACAO_PROPRIETARIA: Record<AcaoProprietaria, string> = {
  editar: "Editar",
  salvar: "Salvar",
  registrar_pendencia: "Registrar pendência",
  criar_versao_derivada: "Criar versão derivada",
  registrar_excecao_operacional: "Registrar exceção operacional",
  assumir_decisao_e_avancar: "Assumir decisão e avançar internamente",
  gerar_previa_interna: "Gerar prévia interna",
  preparar_confirmacao_externa: "Preparar confirmação externa",
};

/** Toda pendência tem ação interna acessível; avanço externo nunca é automático. */
export function acoesDisponiveis(l: LinhaPendencia): AcaoProprietaria[] {
  const base: AcaoProprietaria[] = [
    "editar",
    "salvar",
    "registrar_pendencia",
    "criar_versao_derivada",
    "registrar_excecao_operacional",
    "gerar_previa_interna",
  ];
  if (l.superavelPorDecisaoAuditada) base.push("assumir_decisao_e_avancar");
  base.push("preparar_confirmacao_externa");
  return base;
}

/* ------------------------------------------------------------------ */
/* 5. Cobertura de testes                                              */
/* ------------------------------------------------------------------ */

export const CLASSES_TESTE = ["existe_passa", "existe_falha", "ausente", "dispensado"] as const;
export type ClasseTeste = (typeof CLASSES_TESTE)[number];

export const ROTULO_CLASSE_TESTE: Record<ClasseTeste, string> = {
  existe_passa: "Existente e passa",
  existe_falha: "Existente e falha",
  ausente: "Ausente",
  dispensado: "Dispensado",
};

export type LinhaTeste = {
  tema: string;
  arquivo: string | null;
  classe: ClasseTeste;
  observacao: string;
};

export const COBERTURA_TESTES: LinhaTeste[] = [
  {
    tema: "Procuração / Anexo IV",
    arquivo: "src/lib/__tests__/anexos-i-v.test.ts",
    classe: "existe_passa",
    observacao: "Cobre regras do motor e bloqueio de ato externo; não cobre o texto aprovado ainda não materializado.",
  },
  {
    tema: "Despesas / Anexo II",
    arquivo: null,
    classe: "ausente",
    observacao: "Texto aprovado ainda não materializado; falta teste de estado 'modelo não materializado' e bloqueio de despesa.",
  },
  {
    tema: "Alteração contratual / Anexo V",
    arquivo: null,
    classe: "ausente",
    observacao: "Impactos controlados existem no motor, sem teste dedicado do aditivo.",
  },
  {
    tema: "Filas de comunicação",
    arquivo: null,
    classe: "ausente",
    observacao: "Fila grava intenção; falta teste de não execução automática.",
  },
  {
    tema: "Infraestrutura e integrações",
    arquivo: null,
    classe: "dispensado",
    observacao: "Dispensado nesta etapa: nenhuma integração está ativa; teste depende de sandbox real.",
  },
  {
    tema: "Preview de documentos incompletos",
    arquivo: "src/lib/__tests__/estados-edicao.test.ts",
    classe: "existe_passa",
    observacao: "Prévia com marca de rascunho validada.",
  },
  {
    tema: "RLS e auditoria",
    arquivo: "src/lib/__tests__/modo-proprietaria-cobertura.test.ts",
    classe: "existe_passa",
    observacao: "Override auditado e isolamento de dados de teste cobertos.",
  },
  {
    tema: "Bloqueio de ação externa sem confirmação",
    arquivo: "src/lib/__tests__/varredura-administracao.test.ts",
    classe: "existe_passa",
    observacao: "Confirmação externa obrigatória por reversibilidade validada.",
  },
];

export const LACUNAS_DEPENDENTES_DE_TERCEIROS: string[] = [
  "Arquivos aprovados dos Anexos II, IV e V a localizar e materializar (proprietária/repositório) — sem nova revisão jurídica.",
  "Preço e escopo definitivos do caso Ana Luiza (fonte mestre homologada).",
  "Credenciais e política de cobrança Asaas (proprietária).",
  "E-mail de contingência para a segunda administradora (proprietária).",
  "Documentos de identidade e representação de Alice e Felipe (cliente).",
];

export const CONFIRMACAO_VARREDURA_COMPLETUDE =
  "A varredura consolidou os itens pendentes, parciais e não localizados, incluindo os Anexos II, IV e V. Nenhum modelo, documento, dado, pagamento, assinatura, comunicação, integração ou publicação foi criado ou alterado. A Proprietária Administradora pode tratar internamente cada pendência, registrar exceções auditadas e preparar atos externos para confirmação final.";
