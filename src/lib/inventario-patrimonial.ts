/**
 * Inventário patrimonial do Clube Ancestral — 2025 até 22/08/2026.
 *
 * Camada SOMENTE-LEITURA. Nenhuma função deste módulo cria, altera, homologa,
 * aprova, arquiva, envia, assina, publica, cobra, migra, integra, move ou
 * exclui qualquer item. Nenhuma ação externa é executada.
 *
 * Evidência: consulta direta ao banco em 2026-08-22 e leitura do repositório.
 * Contagens observadas: product_catalog 113 (13 homologado / 84 bloqueado /
 * 16 em revisão), proposals 4, contracts 6, contract_versions 1,
 * contract_annexes 9, case_plans 0, crm_casos 4, leads 7 (1 real / 6 teste),
 * clientes 6, case_members 7, nucleos_familiares 1, documents 3, evidencias 3,
 * research_cases 3, microentregas 6, invoices 1, payments 0,
 * eventos_financeiros 0, crm_interactions 0, app_projections 1 (draft,
 * equipe_interna), audit_logs 676, owner_override_events 2, integrations 14
 * (todas desligadas em modo simulado), contract_templates 2,
 * master_library_items 6, sku_catalog 0, tarefas 8.
 */

export const INVENTARIO_VERSAO = "CA-INVENTARIO-PATRIMONIAL-v1.0";
export const INVENTARIO_DATA = "2026-08-22";
export const INVENTARIO_RESPONSAVEL = "Proprietária Administradora (Tati Tosi)";

export const CASO_ANA_CODIGO_CANONICO = "CA-CID-AT-FAM-2026-001";
export const CASO_ANA_REFERENCIA_LEGADA = "CA-AUT-ANALUIZA-FAM-2026-001";

export const CONFIRMACAO_LITERAL =
  "O inventário patrimonial distinguiu legado, fonte documental, conteúdo homologado, estrutura no aplicativo, instância de caso e validação autenticada. Nenhum item foi declarado completo apenas por existir virtualmente. Nenhum dado, documento, integração ou ação externa foi alterado.";

/* ------------------------------------------------------------------ */
/* Vocabulário                                                         */
/* ------------------------------------------------------------------ */

export const DOMINIOS = [
  "contrato_base",
  "anexos",
  "propostas_escopo",
  "planejador",
  "catalogo_comercial",
  "pessoas_familias",
  "casos_documentos",
  "pesquisa",
  "financeiro",
  "crm_vivo",
  "app_cliente",
  "governanca",
  "integracoes",
] as const;
export type Dominio = (typeof DOMINIOS)[number];

export const ROTULO_DOMINIO: Record<Dominio, string> = {
  contrato_base: "Contrato-base e versões",
  anexos: "Anexos I, II, III, IV e V",
  propostas_escopo: "Propostas, escopo e fontes Canva",
  planejador: "Planejador, fases, marcos e dependências",
  catalogo_comercial: "Catálogo comercial, SKUs, preços e vigências",
  pessoas_familias: "Pessoas, famílias, dependentes e representação",
  casos_documentos: "Casos, dossiês, documentos e entregas",
  pesquisa: "Pesquisa, fontes, evidências, hipóteses e microentregas",
  financeiro: "Financeiro, condições, faturas, cobrança e conciliação",
  crm_vivo: "CRM Vivo, Leads, interações, Painel Hoje e relatórios",
  app_cliente: "App Cliente, projeções, sanitização e publicação",
  governanca: "Governança, RLS, auditoria, overrides, papéis e migração",
  integracoes: "Integrações ativas e fora do escopo",
};

export const ORIGENS = [
  "legado_2025_2026",
  "drive",
  "dropbox",
  "canva",
  "conversa",
  "documento",
  "app",
  "banco",
  "github",
  "outro",
] as const;
export type Origem = (typeof ORIGENS)[number];

export const STATUS_INVENTARIO = [
  "COMPLETO",
  "PARCIAL",
  "LEGADO",
  "NAO_LOCALIZADO",
  "PLACEHOLDER",
  "SEM_HOMOLOGACAO",
  "SEM_INSTANCIA",
  "SEM_VALIDACAO_AUTENTICADA",
  "FORA_DO_ESCOPO",
] as const;
export type StatusInventario = (typeof STATUS_INVENTARIO)[number];

export const SEVERIDADES = ["critica", "alta", "media", "baixa"] as const;
export type Severidade = (typeof SEVERIDADES)[number];

/** Cinco camadas de estado — nenhuma pode ser inferida das outras. */
export type CincoCamadas = {
  /** 1. fonte documental existe */
  fonteDocumental: boolean;
  /** 2. conteúdo/modelo homologado existe */
  conteudoHomologado: boolean;
  /** 3. estrutura técnica no app existe */
  estruturaNoApp: boolean;
  /** 4. instância preenchida de caso existe */
  instanciaDeCaso: boolean;
  /** 5. preview e fluxo autenticado validados */
  validacaoAutenticada: boolean;
};

export type ItemInventario = {
  id: string;
  dominio: Dominio;
  nomeCanonico: string;
  finalidade: string;
  origem: Origem[];
  fonteDeVerdadeAtual: string;
  localizacao: string;
  camadas: CincoCamadas;
  versao: string;
  data: string;
  responsavel: string;
  status: StatusInventario;
  vinculos: string[];
  dependencias: string[];
  risco: string;
  severidade: Severidade;
  acaoNecessaria: string | null;
  proprietariaPodeAgirInternamente: boolean;
  dependeDe: Array<"fonte_aprovada" | "advogado" | "dado_do_cliente" | "confirmacao_externa" | "nenhum">;
};

const OWNER = INVENTARIO_RESPONSAVEL;

const c = (
  fonteDocumental: boolean,
  conteudoHomologado: boolean,
  estruturaNoApp: boolean,
  instanciaDeCaso: boolean,
  validacaoAutenticada: boolean,
): CincoCamadas => ({ fonteDocumental, conteudoHomologado, estruturaNoApp, instanciaDeCaso, validacaoAutenticada });

/* ------------------------------------------------------------------ */
/* Inventário único (sem duplicação)                                   */
/* ------------------------------------------------------------------ */

export const INVENTARIO: ItemInventario[] = [
  {
    id: "INV-001",
    dominio: "contrato_base",
    nomeCanonico: "Contrato-base — Estudo Genealógico v2 (14 cláusulas)",
    finalidade: "Corpo contratual fixo, versionado e não editável por caso.",
    origem: ["legado_2025_2026", "documento", "github"],
    fonteDeVerdadeAtual: "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md",
    localizacao: "GitHub: docs/contratos + src/lib/corpo-contratual.ts, src/lib/contrato-base-leitor.ts",
    camadas: c(true, true, true, false, true),
    versao: "v2.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-002", "INV-005", "INV-010"],
    dependencias: ["Perfil institucional versionado", "Ficha de parâmetros por caso"],
    risco: "Texto homologado existe, mas nenhum contrato de caso está assinado; leitura pode ser confundida com contrato pronto.",
    severidade: "media",
    acaoNecessaria: "Manter como leitura; instanciar por caso apenas quando a ficha estiver completa.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-002",
    dominio: "contrato_base",
    nomeCanonico: "Motor contratual paramétrico (contracts / contract_versions)",
    finalidade: "Gerar versão do contrato a partir de parâmetros com hash de conteúdo e gates de assinatura.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "Banco: public.contracts, public.contract_versions, public.contract_parameter_values",
    localizacao: "Banco (6 contratos, 1 versão) + src/lib/contrato-parametros.*, contratos.functions.ts",
    camadas: c(true, true, true, true, true),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-001", "INV-003"],
    dependencias: ["Parâmetros completos do caso", "Anexos homologados"],
    risco: "Instâncias existem em estado pending_data; assinatura e formalização não exercitadas.",
    severidade: "alta",
    acaoNecessaria: "Completar ficha de parâmetros do caso canônico antes de qualquer geração definitiva.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["dado_do_cliente"],
  },
  {
    id: "INV-003",
    dominio: "contrato_base",
    nomeCanonico: "Perfil institucional versionado (qualificação da contratada)",
    finalidade: "Bloco fixo de qualificação usado no contrato e procurações.",
    origem: ["documento", "app"],
    fonteDeVerdadeAtual: "src/lib/perfil-institucional.ts + public.institutional_profiles",
    localizacao: "GitHub + banco",
    camadas: c(true, false, true, true, true),
    versao: "v1.0 (em revisão)",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_HOMOLOGACAO",
    vinculos: ["INV-001"],
    dependencias: ["Dados cadastrais oficiais da empresa"],
    risco: "Perfil marcado como referência/em revisão; uso em documento externo exigiria homologação.",
    severidade: "alta",
    acaoNecessaria: "Homologar o perfil com dados cadastrais oficiais.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["fonte_aprovada"],
  },
  {
    id: "INV-004",
    dominio: "anexos",
    nomeCanonico: "Anexo I — Ordem de Serviço",
    finalidade: "Definir escopo executável e entregáveis do serviço contratado.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.contract_annexes (annex_code ANEXO_I_ORDEM_SERVICO)",
    localizacao: "Banco: instância vinculada ao caso técnico CA-TESTE-VAL-2026-001 (266 caracteres, descritivo)",
    camadas: c(true, false, true, false, false),
    versao: "v1.0",
    data: "2026-08-22",
    responsavel: OWNER,
    status: "PLACEHOLDER",
    vinculos: ["INV-002", "INV-016"],
    dependencias: ["Minuta jurídica homologada", "Escopo aprovado da proposta"],
    risco: "Estrutura técnica existe sem minuta jurídica; não existe instância para o caso canônico de Ana.",
    severidade: "critica",
    acaoNecessaria: "Obter minuta jurídica homologada antes de instanciar por caso.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["advogado", "fonte_aprovada"],
  },
  {
    id: "INV-005",
    dominio: "anexos",
    nomeCanonico: "Anexo II — Despesas Externas",
    finalidade: "Registrar despesas de terceiros repassáveis ao cliente.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.contract_annexes (ANEXO_II_DESPESAS_EXTERNAS)",
    localizacao: "Banco: instância no caso técnico de validação (277 caracteres, descritivo)",
    camadas: c(true, false, true, false, false),
    versao: "v1.0",
    data: "2026-08-22",
    responsavel: OWNER,
    status: "PLACEHOLDER",
    vinculos: ["INV-019"],
    dependencias: ["Tabela de despesas homologada"],
    risco: "Sem minuta e sem instância de caso; risco de cobrança indevida se usado como está.",
    severidade: "critica",
    acaoNecessaria: "Homologar minuta e tabela de despesas.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["advogado", "fonte_aprovada"],
  },
  {
    id: "INV-006",
    dominio: "anexos",
    nomeCanonico: "Anexo III — Autorização de Pesquisa",
    finalidade: "Autorizar pesquisa genealógica em nome do cliente.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.contract_annexes (ANEXO_III_AUTORIZACAO_PESQUISA)",
    localizacao: "Banco: estrutura presente, status not_applicable no caso de validação",
    camadas: c(true, false, true, false, false),
    versao: "v1.0",
    data: "2026-08-22",
    responsavel: OWNER,
    status: "PLACEHOLDER",
    vinculos: ["INV-017"],
    dependencias: ["Minuta jurídica", "Consentimento do cliente"],
    risco: "Sem este anexo homologado, pesquisa externa permanece bloqueada por regra.",
    severidade: "critica",
    acaoNecessaria: "Homologar minuta e coletar consentimento no caso real.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["advogado", "dado_do_cliente"],
  },
  {
    id: "INV-007",
    dominio: "anexos",
    nomeCanonico: "Anexo IV — Procuração",
    finalidade: "Instrumento de representação para atos junto a órgãos e cartórios.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.contract_annexes (ANEXO_IV_PROCURACAO)",
    localizacao: "Banco: estrutura presente (239 caracteres, descritivo)",
    camadas: c(true, false, true, false, false),
    versao: "v1.0",
    data: "2026-08-22",
    responsavel: OWNER,
    status: "PLACEHOLDER",
    vinculos: ["INV-003", "INV-014"],
    dependencias: ["Minuta jurídica", "Qualificação completa do outorgante"],
    risco: "Documento de efeito externo sem minuta homologada.",
    severidade: "critica",
    acaoNecessaria: "Homologar minuta com advogado.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["advogado", "dado_do_cliente"],
  },
  {
    id: "INV-008",
    dominio: "anexos",
    nomeCanonico: "Anexo V — Alteração de Escopo",
    finalidade: "Formalizar aditivos de escopo e preço.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.contract_annexes (ANEXO_V_ALTERACAO_ESCOPO)",
    localizacao: "Banco: estrutura presente (261 caracteres, descritivo)",
    camadas: c(true, false, true, false, false),
    versao: "v1.0",
    data: "2026-08-22",
    responsavel: OWNER,
    status: "PLACEHOLDER",
    vinculos: ["INV-010", "INV-011"],
    dependencias: ["Minuta jurídica", "Catálogo com preço homologado"],
    risco: "Aditivos hoje não têm instrumento válido.",
    severidade: "alta",
    acaoNecessaria: "Homologar minuta.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["advogado"],
  },
  {
    id: "INV-009",
    dominio: "anexos",
    nomeCanonico: "Registros legados de anexo (ANEXO-I vazio, ANX-ESCOPO, ANX-COMERCIAL, ANX-PRIVACIDADE)",
    finalidade: "Rascunhos anteriores ao vocabulário canônico de anexos.",
    origem: ["legado_2025_2026", "banco"],
    fonteDeVerdadeAtual: "public.contract_annexes (4 registros em drafting/arquivado)",
    localizacao: "Banco",
    camadas: c(false, false, true, true, false),
    versao: "legado",
    data: "2026",
    responsavel: OWNER,
    status: "LEGADO",
    vinculos: ["INV-004"],
    dependencias: [],
    risco: "Podem ser lidos como anexos válidos em relatórios antigos.",
    severidade: "media",
    acaoNecessaria: "Manter apenas como histórico; não usar como fonte.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-010",
    dominio: "propostas_escopo",
    nomeCanonico: "Proposta Canva — páginas 1 a 7 (escopo canônico)",
    finalidade: "Fonte única do escopo comercial apresentado ao cliente.",
    origem: ["canva", "legado_2025_2026", "banco"],
    fonteDeVerdadeAtual: "public.proposals + public.proposal_canva_pages",
    localizacao: "Banco (4 propostas) + arquivos originais no Canva (externo)",
    camadas: c(true, true, true, true, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_VALIDACAO_AUTENTICADA",
    vinculos: ["INV-011", "INV-016"],
    dependencias: ["Arquivo Canva original preservado"],
    risco: "Fonte original vive fora do app; perda do Canva quebra rastreabilidade do escopo.",
    severidade: "alta",
    acaoNecessaria: "Exportar e preservar cópia imutável das páginas 1–7.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["fonte_aprovada"],
  },
  {
    id: "INV-011",
    dominio: "catalogo_comercial",
    nomeCanonico: "Catálogo canônico de SKUs (Base Top 30 + importações)",
    finalidade: "Fonte homologada de produtos, preços, condições e vigências.",
    origem: ["legado_2025_2026", "documento", "banco"],
    fonteDeVerdadeAtual: "public.product_catalog",
    localizacao: "Banco: 113 SKUs — 13 homologados, 84 bloqueados, 16 em revisão; sku_catalog vazio",
    camadas: c(true, true, true, true, true),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-010", "INV-019"],
    dependencias: ["Tabela de preços homologada pela proprietária"],
    risco: "Maioria dos SKUs bloqueada ou sem preço; usar catálogo hoje como 'ativo' seria falso.",
    severidade: "critica",
    acaoNecessaria: "Sanear fila de homologação de preço e vigência (84 bloqueados, 16 em revisão).",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["fonte_aprovada"],
  },
  {
    id: "INV-012",
    dominio: "planejador",
    nomeCanonico: "Planejador de fases, marcos e dependências (case_plans)",
    finalidade: "Plano operacional por caso com fases, marcos e gates.",
    origem: ["documento", "app", "banco"],
    fonteDeVerdadeAtual: "public.case_plans + src/lib/cadeia-operacional.ts",
    localizacao: "Banco: 0 registros; motor e regras existem no código",
    camadas: c(true, true, true, false, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_INSTANCIA",
    vinculos: ["INV-016", "INV-018"],
    dependencias: ["Caso ativado com escopo aprovado"],
    risco: "Não há planejador operacional em uso: modelo sem dados canônicos.",
    severidade: "alta",
    acaoNecessaria: "Instanciar o plano do caso canônico quando o escopo estiver conferido.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-013",
    dominio: "pessoas_familias",
    nomeCanonico: "Pessoas, núcleos familiares e dependentes",
    finalidade: "Modelar requerentes, dependentes e representação por caso.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.clientes, case_members, nucleos_familiares, case_dependents",
    localizacao: "Banco: 6 clientes, 7 membros, 1 núcleo familiar",
    camadas: c(true, true, true, true, true),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-016"],
    dependencias: ["Documentos civis do cliente"],
    risco: "Qualificação incompleta impede emitir contrato e procuração.",
    severidade: "media",
    acaoNecessaria: "Completar qualificação do núcleo do caso canônico.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["dado_do_cliente"],
  },
  {
    id: "INV-014",
    dominio: "pessoas_familias",
    nomeCanonico: "Representação e atos (procuração, consentimento)",
    finalidade: "Registrar quem representa quem e sob qual instrumento.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.consent_records, atos de representação",
    localizacao: "Banco + src/lib/atos-representacao.functions.ts",
    camadas: c(true, false, true, false, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_INSTANCIA",
    vinculos: ["INV-007"],
    dependencias: ["Anexo IV homologado"],
    risco: "Sem instrumento válido não há representação formal.",
    severidade: "alta",
    acaoNecessaria: null,
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["advogado", "dado_do_cliente"],
  },
  {
    id: "INV-015",
    dominio: "casos_documentos",
    nomeCanonico: "Caso canônico CA-CID-AT-FAM-2026-001 — Projeto familiar Ana Luiza",
    finalidade: "Piloto real do ciclo completo.",
    origem: ["conversa", "app", "banco"],
    fonteDeVerdadeAtual: "public.crm_casos (codigo CA-CID-AT-FAM-2026-001)",
    localizacao: `Banco; referências legadas ${CASO_ANA_REFERENCIA_LEGADA} e CA-2026-ANA-001 resolvem para o mesmo caso`,
    camadas: c(true, true, true, true, true),
    versao: "decisão canônica v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-004", "INV-012", "INV-020"],
    dependencias: ["Contrato instanciado", "Anexos homologados"],
    risco: "Baixo quanto à identidade; alto quanto à formalização pendente.",
    severidade: "media",
    acaoNecessaria: "Não reabrir a decisão de identificador.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-016",
    dominio: "casos_documentos",
    nomeCanonico: "Dossiês, documentos e entregas do cliente",
    finalidade: "Guarda de documentos com URL assinada, auditoria e entregas.",
    origem: ["app", "banco", "drive"],
    fonteDeVerdadeAtual: "public.documents, case_source_documents, client_deliverables",
    localizacao: "Banco: documents 3, case_source_documents 0, client_deliverables 0",
    camadas: c(true, true, true, false, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_INSTANCIA",
    vinculos: ["INV-015", "INV-021"],
    dependencias: ["Documentos enviados pelo cliente"],
    risco: "Documentos históricos ainda vivem em Drive/Dropbox fora do app.",
    severidade: "alta",
    acaoNecessaria: "Mapear e importar o acervo documental legado.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["dado_do_cliente"],
  },
  {
    id: "INV-017",
    dominio: "pesquisa",
    nomeCanonico: "Ficha Piloto Genealógica (13 módulos históricos)",
    finalidade: "Estrutura canônica de fontes, evidências, hipóteses e achados.",
    origem: ["documento", "app", "banco"],
    fonteDeVerdadeAtual: "public.research_cases, evidencias, genealogical_findings + src/lib/achados-genealogicos.ts",
    localizacao: "Banco: research_cases 3, evidencias 3",
    camadas: c(true, true, true, true, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-006", "INV-018"],
    dependencias: ["Autorização de pesquisa (Anexo III)"],
    risco: "Volume de evidências é de fixture/validação, não de pesquisa real.",
    severidade: "media",
    acaoNecessaria: "Manter achados como hipóteses até validação.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["confirmacao_externa"],
  },
  {
    id: "INV-018",
    dominio: "pesquisa",
    nomeCanonico: "Microentregas e publicação de progresso",
    finalidade: "Entregar progresso ao cliente em blocos auditáveis.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.microentregas (6) e ops_microentregas (0)",
    localizacao: "Banco",
    camadas: c(true, true, true, true, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_VALIDACAO_AUTENTICADA",
    vinculos: ["INV-021"],
    dependencias: ["Sanitização validada"],
    risco: "Duas tabelas concorrentes de microentrega podem divergir.",
    severidade: "media",
    acaoNecessaria: "Declarar tabela canônica de microentrega antes de publicar.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-019",
    dominio: "financeiro",
    nomeCanonico: "Financeiro: condições comerciais, faturas e conciliação",
    finalidade: "Registrar condição comercial, fatura, pagamento e conciliação em regime de caixa.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.commercial_conditions, invoices, payments, eventos_financeiros",
    localizacao: "Banco: invoices 1, payments 0, eventos_financeiros 0",
    camadas: c(true, true, true, false, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_INSTANCIA",
    vinculos: ["INV-011", "INV-022"],
    dependencias: ["Contrato assinado", "Preço homologado"],
    risco: "Nenhum ciclo financeiro real percorrido ponta a ponta.",
    severidade: "alta",
    acaoNecessaria: "Não emitir cobrança antes de contrato assinado e preço homologado.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["confirmacao_externa"],
  },
  {
    id: "INV-020",
    dominio: "crm_vivo",
    nomeCanonico: "CRM Vivo, Leads e Painel Hoje",
    finalidade: "Operação diária: fila única, sinais derivados e ações rápidas auditadas.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.leads, crm_casos, tarefas + PainelHoje",
    localizacao: "Banco: leads 7 (1 real, 6 teste), crm_casos 4, tarefas 8, crm_interactions 0",
    camadas: c(true, true, true, true, true),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-015"],
    dependencias: ["Uso diário real"],
    risco: "Base ainda majoritariamente de teste; zero interações registradas.",
    severidade: "media",
    acaoNecessaria: "Registrar interações reais para o CRM deixar de ser majoritariamente fixture.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-021",
    dominio: "app_cliente",
    nomeCanonico: "App Cliente — projeções autorizadas e sanitização",
    finalidade: "Projetar ao cliente apenas conteúdo sanitizado e aprovado.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.app_projections + src/lib/canvas-sanitize.ts, app-visibilidade.ts",
    localizacao: "Banco: 1 projeção (resumo_caso, draft, equipe_interna)",
    camadas: c(true, true, true, true, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_VALIDACAO_AUTENTICADA",
    vinculos: ["INV-018", "INV-015"],
    dependencias: ["Aprovação da projeção", "Fluxo de magic link validado"],
    risco: "Nada publicado ao cliente; declarar App Cliente pronto seria falso.",
    severidade: "alta",
    acaoNecessaria: "Validar prévia autenticada da projeção antes de qualquer publicação.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-022",
    dominio: "governanca",
    nomeCanonico: "Governança: RLS, auditoria, overrides e papéis",
    finalidade: "Isolamento por organização, trilha de auditoria e override auditado da proprietária.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "Políticas RLS + public.audit_logs, owner_override_events, user_roles",
    localizacao: "Banco: audit_logs 676, owner_override_events 2",
    camadas: c(true, true, true, true, true),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "COMPLETO",
    vinculos: ["INV-023"],
    dependencias: [],
    risco: "Baixo; manter cobertura ao criar novas tabelas.",
    severidade: "baixa",
    acaoNecessaria: null,
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-023",
    dominio: "governanca",
    nomeCanonico: "Backup e migração permanente",
    finalidade: "Preservar banco, repositório e fontes externas do patrimônio.",
    origem: ["github", "banco", "documento"],
    fonteDeVerdadeAtual: "docs/migracao + docs/governanca",
    localizacao: "GitHub",
    camadas: c(true, true, false, false, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-010", "INV-016"],
    dependencias: ["Exportação de Canva, Drive e Dropbox"],
    risco: "Fontes externas não versionadas são o maior risco de perda.",
    severidade: "critica",
    acaoNecessaria: "Executar checklist de preservação das fontes externas.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["fonte_aprovada"],
  },
  {
    id: "INV-024",
    dominio: "integracoes",
    nomeCanonico: "Integrações registradas (7 chaves, 14 registros)",
    finalidade: "WhatsApp Meta, gateway financeiro, armazenamento, CRM externo, calls, formulários.",
    origem: ["app", "banco"],
    fonteDeVerdadeAtual: "public.integrations",
    localizacao: "Banco: todas com status desligada e modo_simulado = true",
    camadas: c(true, true, true, false, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "SEM_INSTANCIA",
    vinculos: ["INV-025"],
    dependencias: ["Credenciais e confirmação externa"],
    risco: "Duplicidade de registros por chave pode confundir ativação futura.",
    severidade: "media",
    acaoNecessaria: "Nenhuma integração deve ser ativada nesta etapa.",
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["confirmacao_externa"],
  },
  {
    id: "INV-025",
    dominio: "integracoes",
    nomeCanonico: "Asaas (cobrança) — fora do escopo desta etapa",
    finalidade: "Emissão de cobrança e conciliação bancária.",
    origem: ["conversa", "outro"],
    fonteDeVerdadeAtual: "Referência apenas em campos status_link_asaas do catálogo",
    localizacao: "Banco (campo de status), sem integração ativa",
    camadas: c(false, false, false, false, false),
    versao: "—",
    data: "2026-08",
    responsavel: OWNER,
    status: "FORA_DO_ESCOPO",
    vinculos: ["INV-019"],
    dependencias: ["Contrato assinado", "Decisão comercial"],
    risco: "Campos de link podem sugerir integração inexistente.",
    severidade: "media",
    acaoNecessaria: null,
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["confirmacao_externa"],
  },
  {
    id: "INV-026",
    dominio: "integracoes",
    nomeCanonico: "Tasks e Calendar externos",
    finalidade: "Gestão de tarefas e agenda fora do Desk.",
    origem: ["conversa"],
    fonteDeVerdadeAtual: "Decisão canônica: CRM Vivo e Painel Hoje são os sistemas canônicos",
    localizacao: "—",
    camadas: c(false, false, false, false, false),
    versao: "—",
    data: "2026-08",
    responsavel: OWNER,
    status: "FORA_DO_ESCOPO",
    vinculos: ["INV-020"],
    dependencias: [],
    risco: "Nenhum; decisão fechada.",
    severidade: "baixa",
    acaoNecessaria: null,
    proprietariaPodeAgirInternamente: false,
    dependeDe: ["nenhum"],
  },
  {
    id: "INV-027",
    dominio: "governanca",
    nomeCanonico: "Biblioteca mestre e modelos de mensagem",
    finalidade: "Conteúdo institucional versionado com estados de vigência.",
    origem: ["legado_2025_2026", "banco"],
    fonteDeVerdadeAtual: "public.master_library_items (6), message_templates",
    localizacao: "Banco",
    camadas: c(true, true, true, true, false),
    versao: "v1.0",
    data: "2026-08",
    responsavel: OWNER,
    status: "PARCIAL",
    vinculos: ["INV-021"],
    dependencias: ["Homologação de vigência"],
    risco: "Uso de item não vigente em comunicação com cliente.",
    severidade: "media",
    acaoNecessaria: "Revisar estado de vigência antes de qualquer uso externo.",
    proprietariaPodeAgirInternamente: true,
    dependeDe: ["nenhum"],
  },
];

/* ------------------------------------------------------------------ */
/* 2. Mapa de-para 2025 → 18/08/2026 → estado atual                     */
/* ------------------------------------------------------------------ */

export type LinhaDePara = {
  origemLegado: string;
  ondeVivia: string;
  destinoAtual: string;
  itemInventario: string;
  observacao: string;
};

export const MAPA_DE_PARA: LinhaDePara[] = [
  {
    origemLegado: "Contrato de estudo genealógico (versões 2025)",
    ondeVivia: "Drive / documento Word",
    destinoAtual: "docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md + motor contratual",
    itemInventario: "INV-001",
    observacao: "Texto consolidado em 14 cláusulas; instância por caso ainda não assinada.",
  },
  {
    origemLegado: "Anexos avulsos do contrato",
    ondeVivia: "Documento / conversa",
    destinoAtual: "public.contract_annexes (estrutura técnica)",
    itemInventario: "INV-004 a INV-008",
    observacao: "Estrutura migrada; minuta jurídica não migrada.",
  },
  {
    origemLegado: "Proposta comercial Canva (páginas 1–7)",
    ondeVivia: "Canva",
    destinoAtual: "public.proposals + proposal_canva_pages",
    itemInventario: "INV-010",
    observacao: "Arquivo original permanece no Canva; exportação imutável pendente.",
  },
  {
    origemLegado: "Planilha de preços e serviços",
    ondeVivia: "Drive / planilha",
    destinoAtual: "public.product_catalog (113 SKUs)",
    itemInventario: "INV-011",
    observacao: "Importado; 84 bloqueados e 16 em revisão.",
  },
  {
    origemLegado: "Planejador de fases (modelo em planilha)",
    ondeVivia: "Drive",
    destinoAtual: "src/lib/cadeia-operacional.ts + public.case_plans (vazio)",
    itemInventario: "INV-012",
    observacao: "Regras migradas; nenhum plano instanciado.",
  },
  {
    origemLegado: "Ficha da família Ana Luiza",
    ondeVivia: "Conversa / documento",
    destinoAtual: `public.crm_casos ${CASO_ANA_CODIGO_CANONICO}`,
    itemInventario: "INV-015",
    observacao: "Referências legadas preservadas como alias.",
  },
  {
    origemLegado: "Pastas de documentos de clientes",
    ondeVivia: "Drive / Dropbox",
    destinoAtual: "public.documents (3 registros)",
    itemInventario: "INV-016",
    observacao: "Acervo legado majoritariamente não importado.",
  },
  {
    origemLegado: "Controles financeiros manuais",
    ondeVivia: "Planilha",
    destinoAtual: "public.invoices / payments / eventos_financeiros",
    itemInventario: "INV-019",
    observacao: "Estrutura pronta, histórico não importado.",
  },
];

/* ------------------------------------------------------------------ */
/* 3–7. Matrizes e listas fechadas                                      */
/* ------------------------------------------------------------------ */

export type Lacuna = {
  severidade: Severidade;
  item: string;
  camadaAusente: string;
  impacto: string;
};

export const MATRIZ_LACUNAS: Lacuna[] = [
  {
    severidade: "critica",
    item: "Anexos I, II, III e IV",
    camadaAusente: "Conteúdo jurídico homologado e instância de caso",
    impacto: "Impede formalização, autorização de pesquisa e representação.",
  },
  {
    severidade: "critica",
    item: "Catálogo comercial",
    camadaAusente: "Homologação de preço e vigência (84 bloqueados, 16 em revisão)",
    impacto: "Impede proposta e contrato com preço válido.",
  },
  {
    severidade: "critica",
    item: "Fontes externas (Canva, Drive, Dropbox)",
    camadaAusente: "Preservação versionada",
    impacto: "Risco de perda irreversível do patrimônio documental.",
  },
  {
    severidade: "alta",
    item: "Perfil institucional",
    camadaAusente: "Homologação",
    impacto: "Qualificação da contratada em revisão bloqueia documento externo.",
  },
  {
    severidade: "alta",
    item: "Planejador operacional",
    camadaAusente: "Instância de caso",
    impacto: "Nenhum plano canônico em execução.",
  },
  {
    severidade: "alta",
    item: "App Cliente",
    camadaAusente: "Validação autenticada de prévia e publicação",
    impacto: "Não é possível afirmar que o App Cliente está pronto.",
  },
  {
    severidade: "alta",
    item: "Ciclo financeiro",
    camadaAusente: "Instância real (0 pagamentos, 0 eventos)",
    impacto: "Conciliação nunca exercitada ponta a ponta.",
  },
  {
    severidade: "media",
    item: "CRM Vivo",
    camadaAusente: "Uso real (0 interações, 6 de 7 leads de teste)",
    impacto: "Base ainda predominantemente fixture.",
  },
  {
    severidade: "media",
    item: "Microentregas",
    camadaAusente: "Definição de tabela canônica única",
    impacto: "Risco de divergência entre microentregas e ops_microentregas.",
  },
  {
    severidade: "baixa",
    item: "Registros legados de anexo",
    camadaAusente: "—",
    impacto: "Ruído histórico em relatórios antigos.",
  },
];

export type FontePreservar = {
  fonte: string;
  ondeEsta: string;
  acao: "preservar" | "importar";
  prioridade: Severidade;
};

export const MATRIZ_FONTES: FontePreservar[] = [
  { fonte: "Proposta Canva páginas 1–7", ondeEsta: "Canva", acao: "preservar", prioridade: "critica" },
  { fonte: "Minutas jurídicas dos Anexos I–V", ondeEsta: "Advogado / não localizado", acao: "importar", prioridade: "critica" },
  { fonte: "Planilha de preços e condições", ondeEsta: "Drive", acao: "preservar", prioridade: "critica" },
  { fonte: "Acervo documental de clientes", ondeEsta: "Drive / Dropbox", acao: "importar", prioridade: "alta" },
  { fonte: "Histórico financeiro manual", ondeEsta: "Planilha", acao: "importar", prioridade: "alta" },
  { fonte: "Contrato-base v2 consolidado", ondeEsta: "GitHub (docs/contratos)", acao: "preservar", prioridade: "media" },
  { fonte: "Banco de dados do app", ondeEsta: "Lovable Cloud", acao: "preservar", prioridade: "critica" },
  { fonte: "Repositório do aplicativo", ondeEsta: "GitHub", acao: "preservar", prioridade: "critica" },
];

export const CHECKLIST_MIGRACAO_BACKUP: string[] = [
  "Exportar dump completo do banco e guardar cópia datada fora do ambiente do app.",
  "Garantir espelho do repositório no GitHub com a tag do inventário v1.0.",
  "Exportar as páginas 1–7 da proposta Canva em PDF imutável e anexar como fonte.",
  "Inventariar pastas de Drive e Dropbox por cliente antes de qualquer importação.",
  "Guardar cópia dos documentos em docs/contratos e docs/governanca com hash.",
  "Registrar a lista de SKUs e preços homologados em arquivo versionado.",
  "Exportar audit_logs e owner_override_events como evidência de trilha.",
  "Documentar as chaves de integração existentes sem expor credenciais.",
  "Revalidar restauração do backup em ambiente separado antes de qualquer migração.",
];

export const ACOES_SO_DA_PROPRIETARIA: string[] = [
  "Homologar preços, condições e vigências dos SKUs bloqueados e em revisão.",
  "Homologar o perfil institucional com os dados cadastrais oficiais.",
  "Declarar a tabela canônica única de microentregas.",
  "Instanciar o plano operacional do caso canônico de Ana Luiza.",
  "Aprovar internamente a projeção de App Cliente ainda em rascunho.",
  "Exportar e preservar as fontes externas (Canva, Drive, Dropbox).",
  "Manter a decisão canônica de identificador de Ana sem reabertura.",
  "Registrar interações reais no CRM Vivo para sair do estado de fixture.",
];

export const ACOES_DEPENDENTES_DE_TERCEIROS: Array<{ acao: string; dependeDe: string }> = [
  { acao: "Homologar as minutas dos Anexos I, II, III, IV e V", dependeDe: "Advogado" },
  { acao: "Emitir procuração válida", dependeDe: "Advogado e dados civis do cliente" },
  { acao: "Coletar consentimento e autorização de pesquisa", dependeDe: "Dado e assinatura do cliente" },
  { acao: "Completar a qualificação do núcleo familiar", dependeDe: "Documentos do cliente" },
  { acao: "Assinar o contrato do caso canônico", dependeDe: "Confirmação externa do cliente" },
  { acao: "Emitir cobrança ou ativar gateway financeiro", dependeDe: "Confirmação externa e contrato assinado" },
  { acao: "Ativar qualquer integração hoje desligada", dependeDe: "Credenciais e confirmação externa" },
  { acao: "Publicar conteúdo no App Cliente", dependeDe: "Confirmação externa explícita da proprietária" },
];

/* ------------------------------------------------------------------ */
/* Derivações de leitura                                               */
/* ------------------------------------------------------------------ */

export function itensPorDominio(dominio: Dominio): ItemInventario[] {
  return INVENTARIO.filter((i) => i.dominio === dominio);
}

export function contarPorStatus(): Record<StatusInventario, number> {
  const base = Object.fromEntries(STATUS_INVENTARIO.map((s) => [s, 0])) as Record<StatusInventario, number>;
  for (const item of INVENTARIO) base[item.status] += 1;
  return base;
}

/** Um item só é "completo" quando as cinco camadas existem. */
export function estaCompleto(item: ItemInventario): boolean {
  const k = item.camadas;
  return k.fonteDocumental && k.conteudoHomologado && k.estruturaNoApp && k.instanciaDeCaso && k.validacaoAutenticada;
}

export function camadasFaltantes(item: ItemInventario): string[] {
  const k = item.camadas;
  const faltas: string[] = [];
  if (!k.fonteDocumental) faltas.push("1. fonte documental");
  if (!k.conteudoHomologado) faltas.push("2. conteúdo homologado");
  if (!k.estruturaNoApp) faltas.push("3. estrutura no app");
  if (!k.instanciaDeCaso) faltas.push("4. instância de caso");
  if (!k.validacaoAutenticada) faltas.push("5. validação autenticada");
  return faltas;
}

export function idsDuplicados(): string[] {
  const vistos = new Set<string>();
  const dup: string[] = [];
  for (const item of INVENTARIO) {
    if (vistos.has(item.id)) dup.push(item.id);
    vistos.add(item.id);
  }
  return dup;
}
