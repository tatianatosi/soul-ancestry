/**
 * Varredura final — Administração, contingência e poder da proprietária.
 *
 * Camada de AUDITORIA e PREPARAÇÃO. Nada aqui altera papéis, envia convites,
 * rotaciona segredos, aplica migration ou executa integração: as estruturas
 * apenas descrevem bloqueios remanescentes, autonomia interna, confirmações
 * externas obrigatórias, o mapa de administradoras proposto e o pacote único
 * de aprovações pendentes.
 */

export type NaturezaBloqueio = "interno" | "externo_irreversivel";

export type BloqueioMapeado = {
  id: string;
  modulo: string;
  rota: string;
  entidade: string;
  acao: string;
  /** Regra, gate, policy ou função responsável pelo bloqueio. */
  regra: string;
  natureza: NaturezaBloqueio;
  /** Pode ser superado por decisão auditada da proprietária? */
  superavelPorDecisao: boolean;
  /** Estado máximo que a proprietária alcança sozinha, internamente. */
  estadoMaximoInterno: string;
  /** Confirmação externa necessária, quando aplicável. */
  confirmacaoExterna: string | null;
  arquivo: string;
  risco: string;
  teste: string;
};

export const BLOQUEIOS_REMANESCENTES: BloqueioMapeado[] = [
  {
    id: "BLQ-01",
    modulo: "Formalização — assinatura",
    rota: "/casos/$caseId/contrato/preparar",
    entidade: "contracts / contract_versions",
    acao: "Registrar assinatura do contrato",
    regra: "fn_contracts_signature_guard + gate `assinatura` (AVANCO_INTERNO_MAXIMO)",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "pronto_para_confirmacao_externa",
    confirmacaoExterna: "Enviar contrato / solicitar assinatura / registrar assinatura externa",
    arquivo: "src/lib/gates-override.ts · src/lib/contratos.server.ts",
    risco: "Assinatura registrada sem ato real do cliente.",
    teste: "src/lib/__tests__/gates-override.test.ts (cobre bloqueio de avanço externo)",
  },
  {
    id: "BLQ-02",
    modulo: "Formalização — aprovação interna",
    rota: "/casos/$caseId/contrato/preparar",
    entidade: "contract_versions",
    acao: "Aprovar prévia com pendências de escopo/SKU",
    regra: "gates de formalização + validação de completude",
    natureza: "interno",
    superavelPorDecisao: true,
    estadoMaximoInterno: "aprovado_internamente",
    confirmacaoExterna: null,
    arquivo: "src/lib/gates-formalizacao.ts · src/lib/modo-proprietaria.functions.ts",
    risco: "Aprovação com escopo divergente — mitigada por motivo, fonte e auditoria.",
    teste: "src/lib/__tests__/estados-edicao.test.ts",
  },
  {
    id: "BLQ-03",
    modulo: "Comercial e catálogo",
    rota: "/catalogo",
    entidade: "product_catalog",
    acao: "Usar SKU não homologado ou condição comercial fora da fonte mestre",
    regra: "fn_catalogo_homologacao_guard + camada de referência de catálogo",
    natureza: "interno",
    superavelPorDecisao: true,
    estadoMaximoInterno: "sku_homologado_por_decisao_auditada",
    confirmacaoExterna: null,
    arquivo: "src/lib/catalogo-referencia.ts · src/lib/catalogo-homologacao.ts",
    risco: "Preço divergente da planilha mestre; divergência permanece visível.",
    teste: "src/lib/__tests__/catalogo-referencia.test.ts",
  },
  {
    id: "BLQ-04",
    modulo: "Financeiro",
    rota: "/financeiro",
    entidade: "invoices / payments",
    acao: "Criar cobrança, alterar link Asaas ou registrar pagamento externo",
    regra: "can_write_financeiro + ACOES_EXTERNAS",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "cobranca_preparada_internamente",
    confirmacaoExterna: "Emitir/enviar cobrança, alterar Asaas, registrar pagamento",
    arquivo: "src/lib/modo-proprietaria.ts · src/lib/financeiro.functions.ts",
    risco: "Cobrança indevida ao cliente.",
    teste: "src/lib/__tests__/modo-proprietaria.test.ts",
  },
  {
    id: "BLQ-05",
    modulo: "App Cliente",
    rota: "/portal",
    entidade: "app_projections / client_deliverables",
    acao: "Publicar micro-entrega ou alterar visibilidade externa",
    regra: "fn_app_projection_guard + fn_deliverable_publicacao_guard",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "projecao_aprovada_em_rascunho",
    confirmacaoExterna: "Publicar para cliente / alterar visibilidade externa",
    arquivo: "src/lib/app-cliente-gate.ts · src/lib/modo-proprietaria-cobertura.ts",
    risco: "Exposição de conteúdo não revisado ou de dado TESTE ao cliente.",
    teste: "src/lib/__tests__/modo-proprietaria-cobertura.test.ts",
  },
  {
    id: "BLQ-06",
    modulo: "Pesquisa e operação",
    rota: "/pesquisa",
    entidade: "research_action_plan_items / document_requests",
    acao: "Pesquisar externamente, requisitar documento ou contatar instituição",
    regra: "Gate Anexo III (autorização de pesquisa) + ACOES_EXTERNAS",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "plano_de_pesquisa_pronto_para_confirmacao_externa",
    confirmacaoExterna: "Pesquisa externa, pedido institucional, uso de procuração",
    arquivo: "src/lib/anexos-i-v.ts · src/lib/pesquisa.server.ts",
    risco: "Ato em nome do cliente sem autorização vigente.",
    teste: "ausente para procuração — cobrir em teste de gate do Anexo IV",
  },
  {
    id: "BLQ-07",
    modulo: "Comunicação",
    rota: "/biblioteca-mensagens",
    entidade: "communication_queue / message_templates",
    acao: "Enviar e-mail, WhatsApp, convite ou mensagem",
    regra: "Fila de comunicação sem disparo automático + ACOES_EXTERNAS",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "mensagem_preparada_na_fila",
    confirmacaoExterna: "Envio de mensagem/convite ao destinatário real",
    arquivo: "src/lib/fila-comunicacao.ts",
    risco: "Contato indevido com cliente ou lead.",
    teste: "ausente — cobrir fila de comunicação sem disparo",
  },
  {
    id: "BLQ-08",
    modulo: "Administração de acessos",
    rota: "/equipe",
    entidade: "user_roles / staff_access / organization_members",
    acao: "Alterar papel, suspender ou revogar administradora",
    regra: "RLS por organização + regra das duas proprietárias ativas (a aplicar)",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "alteracao_de_acesso_preparada",
    confirmacaoExterna: "Convite, revogação ou remoção de administradora",
    arquivo: "src/lib/equipe.server.ts · src/lib/varredura-administracao.ts",
    risco: "Perda total de acesso administrativo à organização.",
    teste: "src/lib/__tests__/varredura-administracao.test.ts",
  },
  {
    id: "BLQ-09",
    modulo: "Infraestrutura e dados",
    rota: "/configuracoes",
    entidade: "migrations / secrets / backups",
    acao: "Aplicar migration em produção, rotacionar segredo, restaurar backup, excluir definitivamente",
    regra: "Nenhuma execução automática; exige confirmação humana final",
    natureza: "externo_irreversivel",
    superavelPorDecisao: false,
    estadoMaximoInterno: "plano_de_aplicacao_preparado",
    confirmacaoExterna: "Migration, rotação de segredo, restauração de backup, exclusão definitiva",
    arquivo: "src/lib/varredura-administracao.ts (plano) · docs de governança",
    risco: "Sobrescrita ou perda irreversível de dados reais.",
    teste: "ausente — validar apenas em ambiente de homologação",
  },
  {
    id: "BLQ-10",
    modulo: "Painel Hoje e fila",
    rota: "/painel",
    entidade: "crm_casos / tarefas / leads",
    acao: "Definir dono, prazo, próxima ação e assumir pendência",
    regra: "Override auditado (registrarOverrideProprietaria)",
    natureza: "interno",
    superavelPorDecisao: true,
    estadoMaximoInterno: "fila_corrigida_com_auditoria",
    confirmacaoExterna: null,
    arquivo: "src/lib/modo-proprietaria.functions.ts · src/components/painel/acoes-rapidas.tsx",
    risco: "Baixo: alteração interna reversível e auditada.",
    teste: "src/lib/__tests__/gates-override.test.ts",
  },
];

/** Regra de autonomia interna da proprietária administradora. */
export const REGRA_AUTONOMIA = {
  enunciado:
    "A Proprietária Administradora pode autorizar e executar toda ação interna; nenhum gate interno impede o avanço após override auditado.",
  acoesInternas: [
    "criar, editar, corrigir, versionar, derivar, consolidar",
    "arquivar logicamente e restaurar",
    "atribuir responsáveis e avançar estados internos",
    "configurar fluxos, catálogo, contratos internos e financeiro interno",
    "operar pesquisa interna e App Cliente em rascunho",
    "configurar usuários, permissões, backup e plano de migração",
    "preparar qualquer ação externa até pronto_para_confirmacao_externa",
  ],
  camposObrigatoriosDoOverride: [
    "motivo",
    "fonte",
    "valor_anterior",
    "valor_novo",
    "autora",
    "data_hora",
    "evento append-only",
  ],
  estadoPreparatorio: "pronto_para_confirmacao_externa",
} as const;

/** Atos que sempre exigem tela final e confirmação explícita. */
export const CONFIRMACOES_EXTERNAS: { id: string; rotulo: string }[] = [
  { id: "comunicacao", rotulo: "Enviar convites, e-mails, WhatsApp ou mensagens" },
  { id: "contrato", rotulo: "Enviar contrato, solicitar ou registrar assinatura externa" },
  { id: "cobranca", rotulo: "Criar/enviar cobrança, alterar Asaas ou registrar pagamento externo" },
  { id: "publicacao", rotulo: "Publicar para cliente ou alterar visibilidade externa" },
  { id: "pesquisa_externa", rotulo: "Requisitar documento, contatar instituição, pesquisar externamente ou usar procuração" },
  { id: "migration", rotulo: "Aplicar migration em produção" },
  { id: "segredos", rotulo: "Rotacionar ou revogar segredos e credenciais" },
  { id: "backup", rotulo: "Restaurar backup que sobrescreva dados" },
  { id: "exclusao", rotulo: "Excluir definitivamente dados ou remover a última proprietária ativa" },
];

/* ------------------------------------------------------------------ */
/* Mapa de administradoras (proposto, não aplicado)                     */
/* ------------------------------------------------------------------ */

export type TipoAdministradora = "principal" | "contingencia_operacional" | "recuperacao";

export type AdministradoraProposta = {
  email: string;
  papel: "proprietaria_administradora";
  tipo: TipoAdministradora;
  escopo: string;
  descricao: string;
  estado: "proposta" | "pendente_de_email" | "ativa";
  podeRemoverPrincipal: boolean;
};

export const MAPA_ADMINISTRADORAS: AdministradoraProposta[] = [
  {
    email: "tati@pluggedresearch.com",
    papel: "proprietaria_administradora",
    tipo: "principal",
    escopo: "Organização Clube Ancestral",
    descricao:
      "Administradora principal. Aprova decisões internas e inicia confirmações externas. Conta principal de Drive e governança documental.",
    estado: "proposta",
    podeRemoverPrincipal: false,
  },
  {
    email: "atendimento@clubeancestral.com.br",
    papel: "proprietaria_administradora",
    tipo: "contingencia_operacional",
    escopo: "Organização Clube Ancestral",
    descricao: "Administradora operacional de contingência. Opera internamente, sem remover a administradora principal.",
    estado: "proposta",
    podeRemoverPrincipal: false,
  },
  {
    email: "EMAIL_GMAIL_BACKUP_A_CONFIRMAR",
    papel: "proprietaria_administradora",
    tipo: "recuperacao",
    escopo: "Organização Clube Ancestral",
    descricao: "Conta de recuperação/contingência. Pendente de e-mail explícito e confirmação da proprietária.",
    estado: "pendente_de_email",
    podeRemoverPrincipal: false,
  },
];

export const REGRAS_ADMINISTRACAO: string[] = [
  "Não remover, rebaixar, suspender ou alterar a última proprietária ativa.",
  "Exigir pelo menos duas proprietárias ativas antes de qualquer alteração crítica de acesso.",
  "Trilha append-only de convite, aceite, alteração, revogação, recuperação e tentativa negada.",
  "Nunca expor tokens, hashes, segredos ou dados de autenticação.",
  "RLS por organização preservada em todas as leituras e escritas.",
  "Exibir no perfil qual organização e papel estão efetivamente ativos.",
  "tati@pluggedresearch.com é a conta principal de Drive e governança documental; nenhum outro Gmail é presumido com acesso.",
];

export type AlteracaoAcesso = {
  alvoEmail: string;
  operacao: "remover" | "rebaixar" | "suspender" | "alterar_papel" | "convidar";
};

/**
 * Valida, sem aplicar, uma alteração crítica de acesso contra as regras de
 * contingência. Retorna a lista de impedimentos (vazia = pode ser proposta
 * para confirmação externa).
 */
export function validarAlteracaoAcesso(
  alteracao: AlteracaoAcesso,
  proprietariasAtivas: { email: string; tipo: TipoAdministradora }[],
): string[] {
  const erros: string[] = [];
  const criticas: AlteracaoAcesso["operacao"][] = ["remover", "rebaixar", "suspender", "alterar_papel"];
  const ehCritica = criticas.includes(alteracao.operacao);
  const alvoAtivo = proprietariasAtivas.some((p) => p.email === alteracao.alvoEmail);

  if (ehCritica && proprietariasAtivas.length <= 1) {
    erros.push("Alteração crítica bloqueada: é necessária pelo menos uma outra proprietária ativa.");
  }
  if (ehCritica && alvoAtivo && proprietariasAtivas.length < 2) {
    erros.push("Não é permitido remover, rebaixar ou suspender a última proprietária ativa.");
  }
  if (
    ehCritica &&
    proprietariasAtivas.find((p) => p.email === alteracao.alvoEmail)?.tipo === "principal" &&
    proprietariasAtivas.filter((p) => p.tipo === "principal").length <= 1
  ) {
    erros.push("A administradora principal só pode ser alterada após outra principal ativa ser designada.");
  }
  return erros;
}

/* ------------------------------------------------------------------ */
/* Pacote único de aprovações pendentes                                 */
/* ------------------------------------------------------------------ */

export const GRUPOS_APROVACAO = [
  "saneamento_dados",
  "atribuicao_administradores",
  "convites_comunicacoes",
  "alteracoes_integracao",
  "migration_deploy",
  "backup_rollback",
  "acoes_externas_preparadas",
] as const;

export type GrupoAprovacao = (typeof GRUPOS_APROVACAO)[number];

export const ROTULO_GRUPO_APROVACAO: Record<GrupoAprovacao, string> = {
  saneamento_dados: "Saneamento de dados",
  atribuicao_administradores: "Atribuição das três administradoras",
  convites_comunicacoes: "Convites e comunicações",
  alteracoes_integracao: "Alterações de integração",
  migration_deploy: "Migration e deploy",
  backup_rollback: "Backup e rollback",
  acoes_externas_preparadas: "Ações externas preparadas",
};

export type Reversibilidade = "reversivel" | "parcialmente_reversivel" | "irreversivel";

export type LinhaAprovacao = {
  id: string;
  grupo: GrupoAprovacao;
  alvo: string;
  impacto: string;
  dadosEnvolvidos: string;
  reversibilidade: Reversibilidade;
  previa: string;
  motivo: string;
  confirmacao: string;
};

export const PACOTE_APROVACOES: LinhaAprovacao[] = [
  {
    id: "APR-01",
    grupo: "saneamento_dados",
    alvo: "Registros demo/TESTE (is_demo, dados_teste)",
    impacto: "Manter isolamento de KPIs, financeiro e App Cliente",
    dadosEnvolvidos: "leads, crm_casos, invoices, app_projections marcados como demo",
    reversibilidade: "reversivel",
    previa: "Lista de registros marcados e contagem por entidade",
    motivo: "Evitar contaminação de métricas reais no go-live",
    confirmacao: "Aprovação interna da proprietária",
  },
  {
    id: "APR-02",
    grupo: "saneamento_dados",
    alvo: "Casos bloqueados por SKU não homologado",
    impacto: "Libera formalização com preço da fonte mestre",
    dadosEnvolvidos: "product_catalog, proposals, commercial_conditions",
    reversibilidade: "reversivel",
    previa: "Divergências listadas em /catalogo",
    motivo: "Escopo e preço precisam vir de fonte homologada",
    confirmacao: "Aprovação interna com motivo auditado",
  },
  {
    id: "APR-03",
    grupo: "atribuicao_administradores",
    alvo: "tati@pluggedresearch.com — proprietária administradora principal",
    impacto: "Concede poder total interno e início de confirmações externas",
    dadosEnvolvidos: "user_roles, organization_members, staff_access",
    reversibilidade: "parcialmente_reversivel",
    previa: "Mapa de administradoras nesta tela",
    motivo: "Titular da organização e da governança documental",
    confirmacao: "Confirmação externa explícita (alteração de acesso)",
  },
  {
    id: "APR-04",
    grupo: "atribuicao_administradores",
    alvo: "atendimento@clubeancestral.com.br — contingência operacional",
    impacto: "Segunda proprietária ativa; habilita alterações críticas de acesso",
    dadosEnvolvidos: "user_roles, organization_members",
    reversibilidade: "parcialmente_reversivel",
    previa: "Mapa de administradoras nesta tela",
    motivo: "Continuidade operacional sem depender de conta única",
    confirmacao: "Confirmação externa explícita",
  },
  {
    id: "APR-05",
    grupo: "atribuicao_administradores",
    alvo: "EMAIL_GMAIL_BACKUP_A_CONFIRMAR — recuperação",
    impacto: "Conta de recuperação de acesso",
    dadosEnvolvidos: "user_roles (pendente)",
    reversibilidade: "parcialmente_reversivel",
    previa: "Bloqueado: e-mail ainda não informado",
    motivo: "Recuperação em caso de perda das duas contas principais",
    confirmacao: "E-mail explícito + confirmação da proprietária",
  },
  {
    id: "APR-06",
    grupo: "convites_comunicacoes",
    alvo: "Convites das administradoras e comunicações a clientes/leads",
    impacto: "Envio real de e-mail/WhatsApp a destinatários",
    dadosEnvolvidos: "communication_queue, authorized_portal_emails",
    reversibilidade: "irreversivel",
    previa: "Destinatário, conteúdo e anexos na janela de confirmação",
    motivo: "Nenhum envio é automático",
    confirmacao: "Confirmação final explícita por envio",
  },
  {
    id: "APR-07",
    grupo: "alteracoes_integracao",
    alvo: "Asaas, Drive e provedores externos",
    impacto: "Cobranças, links e provisionamento externo",
    dadosEnvolvidos: "integrations, catalog_payment_link_refs",
    reversibilidade: "parcialmente_reversivel",
    previa: "Configuração atual versus proposta",
    motivo: "Operação financeira e documental real",
    confirmacao: "Confirmação externa explícita",
  },
  {
    id: "APR-08",
    grupo: "migration_deploy",
    alvo: "Migrations pendentes e publicação em produção",
    impacto: "Altera estrutura e ambiente ativo",
    dadosEnvolvidos: "esquema do banco, build publicado",
    reversibilidade: "parcialmente_reversivel",
    previa: "SQL aditivo revisado antes da aplicação",
    motivo: "Go-live controlado",
    confirmacao: "Confirmação externa explícita",
  },
  {
    id: "APR-09",
    grupo: "backup_rollback",
    alvo: "Backup completo antes do go-live e política de restauração",
    impacto: "Restauração pode sobrescrever dados reais",
    dadosEnvolvidos: "todas as tabelas da organização",
    reversibilidade: "irreversivel",
    previa: "Escopo, data e destino do backup",
    motivo: "Proteção de dados reais de Ana, João e demais clientes",
    confirmacao: "Confirmação externa explícita antes de qualquer restauração",
  },
  {
    id: "APR-10",
    grupo: "acoes_externas_preparadas",
    alvo: "Contratos, cobranças, publicações e pedidos institucionais preparados",
    impacto: "Efeito externo sobre cliente e instituições",
    dadosEnvolvidos: "contracts, invoices, app_projections, document_requests",
    reversibilidade: "irreversivel",
    previa: "Janela final com ação, destinatário, valor, caso e anexos",
    motivo: "Cadeia interna concluída até pronto_para_confirmacao_externa",
    confirmacao: "Confirmação final explícita, uma a uma",
  },
];

export function aprovacoesPorGrupo(): Record<GrupoAprovacao, LinhaAprovacao[]> {
  const base = Object.fromEntries(GRUPOS_APROVACAO.map((g) => [g, [] as LinhaAprovacao[]])) as Record<
    GrupoAprovacao,
    LinhaAprovacao[]
  >;
  for (const l of PACOTE_APROVACOES) base[l.grupo].push(l);
  return base;
}

export function bloqueiosPorNatureza(natureza: NaturezaBloqueio): BloqueioMapeado[] {
  return BLOQUEIOS_REMANESCENTES.filter((b) => b.natureza === natureza);
}

/* ------------------------------------------------------------------ */
/* Helpers de apresentação e decisão do pacote de aprovações            */
/* ------------------------------------------------------------------ */

export const ROTULO_REVERSIBILIDADE: Record<Reversibilidade, string> = {
  reversivel: "Reversível",
  parcialmente_reversivel: "Parcialmente reversível",
  irreversivel: "Irreversível",
};

export function confirmacaoExternaObrigatoria(linha: LinhaAprovacao): boolean {
  return (
    linha.reversibilidade === "irreversivel" ||
    linha.reversibilidade === "parcialmente_reversivel" ||
    /confirmação externa/i.test(linha.confirmacao)
  );
}

export type AcaoPacote = {
  acao: string;
  entidade: string;
  modulo: string;
  irreversivel: boolean;
  rotulo: string;
};

export function derivarAcaoPacote(linha: LinhaAprovacao): AcaoPacote {
  const externa = confirmacaoExternaObrigatoria(linha);
  const base: Record<GrupoAprovacao, { entidade: string; modulo: string }> = {
    saneamento_dados: { entidade: "pacote_saneamento_dados", modulo: "governanca" },
    atribuicao_administradores: { entidade: "user_roles", modulo: "administracao_acesso" },
    convites_comunicacoes: { entidade: "communication_queue", modulo: "comunicacao" },
    alteracoes_integracao: { entidade: "integrations", modulo: "integracao" },
    migration_deploy: { entidade: "migrations", modulo: "infraestrutura" },
    backup_rollback: { entidade: "backups", modulo: "infraestrutura" },
    acoes_externas_preparadas: { entidade: "acoes_externas_preparadas", modulo: "operacao" },
  };
  const { entidade, modulo } = base[linha.grupo];
  return {
    acao: externa ? "confirmar_acao_externa_pacote" : "aprovar_item_pacote",
    entidade,
    modulo,
    irreversivel: externa,
    rotulo: externa ? "Confirmar aprovação (externa/irreversível)" : "Assumir aprovação interna",
  };
}

export function resumoConfirmacaoPacote(linha: LinhaAprovacao, motivo: string) {
  const { acao, entidade, modulo, irreversivel } = derivarAcaoPacote(linha);
  return {
    acao,
    entidade,
    entidade_id: linha.id,
    modulo,
    impacto: linha.impacto,
    destinatario: linha.alvo,
    conteudo: `${linha.previa}. Motivo canônico: ${linha.motivo}`,
    caso: "Pacote de governança — não vinculado a um caso individual",
    anexos: [] as string[],
    dados_enviados: {
      grupo: linha.grupo,
      alvo: linha.alvo,
      previa: linha.previa,
      reversibilidade: linha.reversibilidade,
      motivo_canonico: linha.motivo,
      motivo_decisao: motivo,
    },
    irreversivel,
    dados_teste: false,
  };
}
