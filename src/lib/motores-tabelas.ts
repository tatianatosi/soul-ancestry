/**
 * Motores primordiais P0–P11 (PROMPT-MESTRE-MOTORES-A-IMPLANTAR) e
 * arquitetura das PRs #30–#84 → tabelas que já existem.
 *
 * Não cria `onboarding_runs`, `cadence_runs`, `citizenship_cases`,
 * `case_participants` nem vocabulário CHECK novo. A série CA02–CA24 em
 * `main` ligou pedaços; não substitui os prompts #30–#84 que ainda não
 * rodaram como motor. P1 unifica núcleos com colunas já existentes
 * (archived_at / status arquivado).
 *
 * `rotaDesk` é a tela que executa o motor — a Biblioteca não é o produto.
 */

/*
 * 24/09/2026 — Corte E ("Motores Pessoa Unificada, Núcleos e Dossiê"):
 * classificação honesta. O vocabulário anterior (operando / parcial /
 * planta) misturava código, teste, rota com dado e fluxo real. Agora:
 *
 * - IMPLEMENTADO_EM_FLUXO_REAL: só com os 7 elementos verificáveis —
 *   writer, tabela, reader, releitura, permissão, rota oficial e teste —
 *   E prova autenticada da Proprietária registrada em docs/provas/
 *   (`provaAutenticada`). Teste de disco, fixture ou build não promovem
 *   (decisão de 24/09/2026). Hoje nenhum item tem prova: os que têm os 7
 *   elos técnicos ficam em CODIGO_E_TESTE_SEM_HOMOLOGACAO até o roteiro
 *   docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md
 *   ser executado com login real.
 * - IMPLEMENTADO_SOMENTE_LEITURA: lê dado real, não grava.
 * - CODIGO_E_TESTE_SEM_HOMOLOGACAO: código e teste existem; falta a prova
 *   autenticada (e, em alguns, também um elo técnico, ex.: releitura).
 * - REFERENCIA_LEGADA: ponteiro/tela antiga só como fallback rotulado.
 * - NAO_IMPLEMENTADO: não existe no código.
 *
 * Nenhum motor tem homologação da Proprietária (prints autenticados:
 * inicial, ação, confirmação, releitura, integração). Por isso
 * `homologacaoProprietaria` é "pendente" e `provaAutenticada` é null em
 * todos.
 */
export type EstadoMotor =
  | "IMPLEMENTADO_EM_FLUXO_REAL"
  | "IMPLEMENTADO_SOMENTE_LEITURA"
  | "CODIGO_E_TESTE_SEM_HOMOLOGACAO"
  | "REFERENCIA_LEGADA"
  | "NAO_IMPLEMENTADO";

/**
 * Evidência verificável. `writer`/`reader` = "src/lib/arquivo.ts#funcao";
 * `rota` = rota oficial do Desk; `teste` = arquivo de teste de comportamento.
 * null = elo ausente (declarado, não escondido).
 */
export type EvidenciaMotor = {
  writer: string | null;
  tabela: string | null;
  reader: string | null;
  releitura: string | null;
  permissao: string | null;
  rota: string | null;
  teste: string | null;
};

const PERMISSAO_ORG = "organization_id na escrita e na leitura + RLS por organização";
const HOMOLOGACAO_PENDENTE = "pendente" as const;
const LACUNA_SEM_PROVA =
  "Sem prova autenticada da Proprietária (inicial, ação, confirmação, releitura, integração) — ver roteiro de homologação.";

export const MOTORES_TABELAS = [
  {
    id: "P0",
    motor: "P0 — Autoridade operacional e persistência",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#31", "#34", "#39", "#44"],
    tabelas: ["crm_casos", "clientes", "tarefas", "contracts", "proposals"] as const,
    naoCriar: [] as const,
    rotaDesk: "/casos" as const,
    oQueJaEscreve: "Toda escrita operacional passa por gravarComVerificacao / inserirComVerificacao.",
    evidencia: {
      writer: "src/lib/pessoa.functions.ts#atualizarPessoa",
      tabela: "clientes",
      reader: "src/lib/pessoa.functions.ts#carregarPessoa",
      releitura: "gravarComVerificacao (grava, relê e compara campo a campo)",
      permissao: PERMISSAO_ORG,
      rota: "/pessoas/$clienteId",
      teste: "src/lib/__tests__/persistencia-aba-casos.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P1",
    motor: "P1 — Caso canônico, núcleo e participantes",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#30", "#32", "#36", "#51", "#64"],
    tabelas: [
      "crm_casos",
      "clientes",
      "nucleos_familiares",
      "nucleo_membros",
      "case_members",
      "case_dependents",
    ] as const,
    naoCriar: ["case_participants", "citizenship_cases"] as const,
    rotaDesk: "/nucleos" as const,
    oQueJaEscreve:
      "Núcleo com membros (adicionarMembroNucleo), dossiê-mãe único por núcleo (salvarDossieNucleo), CPF dos membros conferido contra o cadastro canônico com confirmação humana (R2). Unificação de núcleos arquiva a origem (archived_at, archive_motivo) sem coluna nova.",
    evidencia: {
      writer: "src/lib/nucleos-desk.functions.ts#adicionarMembroNucleo",
      tabela: "nucleo_membros",
      reader: "src/lib/nucleos-desk.functions.ts#listarNucleos",
      releitura: "inserirComVerificacao (grava e relê a linha)",
      permissao: PERMISSAO_ORG,
      rota: "/nucleos",
      teste: "src/lib/__tests__/nucleo-dossie-mae-canonico-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [
      LACUNA_SEM_PROVA,
      "Fusão de pessoas duplicadas continua decisão humana em /nucleos-duplicidades — nunca automática.",
      "crm_casos.dossie_mae_referencia segue como ponteiro legado (fallback rotulado).",
    ] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P2",
    motor: "P2 — Contrato, proposta e Ordem de Serviço",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#35", "#40", "#41", "#53"],
    tabelas: [
      "contracts",
      "proposals",
      "service_orders",
      "contract_case_parameters",
      "contract_parameter_values",
    ] as const,
    naoCriar: [] as const,
    rotaDesk: "/contratos" as const,
    oQueJaEscreve:
      "Ficha de parâmetros do contrato grava e relê; prévia, envio e registro de assinatura; OS com responsável e prazo.",
    evidencia: {
      writer: "src/lib/contrato-parametros.functions.ts#salvarParametro",
      tabela: "contract_parameter_values",
      reader: "src/lib/contrato-parametros.functions.ts#painelParametros",
      releitura: "gravarComVerificacao",
      permissao: PERMISSAO_ORG,
      rota: "/casos/$caseId/contrato/preparar",
      teste: "src/lib/__tests__/motor-lote2-batch8-contratos.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA, "Dependências entre OS sem campo estruturado (declarado, sem migration)."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P3",
    motor: "P3 — Tarefa, próxima ação e cadência",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#32", "#75", "#76", "#80"],
    tabelas: ["tarefas", "crm_casos", "case_plans", "case_alerts"] as const,
    naoCriar: ["cadence_runs"] as const,
    rotaDesk: "/tarefas" as const,
    oQueJaEscreve:
      "Tarefa grava e relê; próxima ação vem da RPC proxima_acao_prioritaria(_lote) em todas as superfícies. Cadência D7/D10/D14 é alerta interno.",
    evidencia: {
      writer: "src/lib/ops.functions.ts#salvarTarefa",
      tabela: "tarefas",
      reader: "src/lib/ops.functions.ts#listarFilaOps",
      releitura: "gravarComVerificacao / inserirComVerificacao",
      permissao: PERMISSAO_ORG,
      rota: "/tarefas",
      teste: "src/lib/__tests__/ca18-proxima-acao-canonica.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA, "Cadência só alerta (somente leitura); nenhum envio automático, por decisão."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P4",
    motor: "P4 — Onboarding real",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#75", "#81"],
    tabelas: ["onboarding_planos", "crm_casos", "tarefas", "client_deliverables", "ops_microentregas"] as const,
    naoCriar: ["onboarding_runs"] as const,
    rotaDesk: "/casos" as const,
    oQueJaEscreve:
      "Preparar plano grava checklist (dossiê-mãe e primeira micro-entrega derivados do dado real), plano de ação e tarefas dos gates. CTA cria ops_microentregas. Não ativa cliente.",
    evidencia: {
      writer: "src/lib/onboarding-plano.functions.ts#recalcularPlanoOnboarding",
      tabela: "onboarding_planos",
      reader: "src/lib/onboarding-plano.functions.ts#carregarPlanoOnboarding",
      releitura: "gravarComVerificacao (grava, relê e compara checklist, plano de ação e motivos)",
      permissao: PERMISSAO_ORG,
      rota: "/casos/$caseId",
      teste: "src/lib/__tests__/d7-microentrega-real-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [
      LACUNA_SEM_PROVA,
      "Migration 20260924190000 aplicada em 24/09/2026 (autorização da Proprietária); espelho de motivos_bloqueio em case_plans ainda depende do backfill pela tela /governanca/migracao-onboarding-gate.",
    ] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P5",
    motor: "P5 — Pesquisa, documentos e evidências",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#84"],
    tabelas: [
      "research_cases",
      "research_people",
      "research_sources",
      "document_requests",
      "evidencias",
      "evidences",
      "genealogical_findings",
      "genealogical_person_profiles",
      "case_source_documents",
    ] as const,
    naoCriar: [] as const,
    rotaDesk: "/pesquisa-modulo" as const,
    oQueJaEscreve:
      "Achados gravam e relêem; achado elegível vira micro-entrega vinculada; perfil genealógico se liga à pessoa só por escolha humana.",
    evidencia: {
      writer: "src/lib/achados-genealogicos.functions.ts#salvarAchado",
      tabela: "genealogical_findings",
      reader: "src/lib/achados-genealogicos.functions.ts#painelAchados",
      releitura: "gravarComVerificacao / inserirComVerificacao",
      permissao: PERMISSAO_ORG,
      rota: "/achados/$caseId",
      teste: "src/lib/__tests__/achado-microentrega-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [
      LACUNA_SEM_PROVA,
      "/pesquisa legado segue desconectado (referência legada, não reativar).",
      "Fontes concorrentes com responsabilidade definida (fontes-pesquisa-canonicas.ts); ponte de relações/eventos para a ficha genealógica aguarda execução na tela de migrações; papel de evidences aguarda decisão.",
      "Varredura em Drive/Dropbox bloqueada por decisão — sem integração contratada.",
    ] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P6",
    motor: "P6 — Micro-entregas, App Cliente e portal",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#66", "#72", "#73", "#76", "#78", "#81"],
    tabelas: ["client_deliverables", "ops_microentregas", "app_projections"] as const,
    naoCriar: ["micro_deliveries"] as const,
    rotaDesk: "/ops" as const,
    oQueJaEscreve: "Micro-entregas em Ops; App Cliente só vê o que foi sanitizado e publicado.",
    evidencia: {
      writer: "src/lib/jornada-cliente.functions.ts#criarMicroentregaCliente",
      tabela: "client_deliverables",
      reader: "src/lib/jornada-cliente.functions.ts#carregarJornadaCaso",
      releitura: "inserirComVerificacao (insere, relê e compara)",
      permissao: PERMISSAO_ORG,
      rota: "/ops",
      teste: "src/lib/__tests__/ca05-cadencia-microentregas.test.ts",
    } as EvidenciaMotor,
    lacunas: [
      LACUNA_SEM_PROVA,
      "Isolamento cliente A × cliente B: RLS estrutural conferida (docs/auditorias/2026-09-24_rls-estrutural-app-cliente.md); prova com dois logins reais pendente.",
    ] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P7",
    motor: "P7 — Comercial, financeiro e catálogo",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#50", "#59", "#61", "#62", "#63", "#68", "#79", "#82"],
    tabelas: [
      "product_catalog",
      "planner_catalog_feed",
      "planner_tarefas",
      "case_plans",
      "citizenship_tracks",
      "invoices",
      "payments",
    ] as const,
    naoCriar: ["catalog_product", "journey_instance"] as const,
    rotaDesk: "/financeiro" as const,
    oQueJaEscreve:
      "Conciliação de pagamento grava e relê a fatura, o caso e o gate financeiro do contrato assinado. SKU só entra se product_catalog estiver homologado.",
    evidencia: {
      writer: "src/lib/comercial.functions.ts#conciliarPagamento",
      tabela: "invoices",
      reader: "src/lib/comercial.functions.ts#listarComercial",
      releitura: "gravarComVerificacao",
      permissao: PERMISSAO_ORG,
      rota: "/financeiro",
      teste: "src/lib/__tests__/gate-financeiro-os-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA, "Nenhuma integração Asaas aprovada — conciliação é manual."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P8",
    motor: "P8 — Marketing, conteúdos e conversão",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#48", "#54", "#56", "#58"],
    tabelas: ["leads", "crm_casos"] as const,
    naoCriar: [] as const,
    rotaDesk: "/calls" as const,
    oQueJaEscreve: "Mesa Discovery: varredura de conversa, SPIN, próxima ação e trilha jurídica gravam no lead.",
    evidencia: {
      writer: "src/lib/crm-desk.functions.ts#salvarLeadDesk",
      tabela: "leads",
      reader: "src/lib/crm-desk.functions.ts#listarLeadsDesk",
      releitura: "gravarComVerificacao",
      permissao: PERMISSAO_ORG,
      rota: "/calls",
      teste: "src/lib/__tests__/painel-calls-roteiro-vivo.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P9",
    motor: "P9 — Cockpit de indicadores e alertas",
    estado: "IMPLEMENTADO_SOMENTE_LEITURA" as EstadoMotor,
    prs: ["#55", "#84"],
    tabelas: ["case_alerts", "crm_casos"] as const,
    naoCriar: [] as const,
    rotaDesk: "/alertas" as const,
    oQueJaEscreve: "Alertas e indicadores leem crm_casos / case_alerts; tratar o alerta grava no motor de origem.",
    evidencia: {
      writer: null,
      tabela: "case_alerts",
      reader: "src/lib/alertas.functions.ts#listarAlertasCentrais",
      releitura: null,
      permissao: PERMISSAO_ORG,
      rota: "/alertas",
      teste: "src/lib/__tests__/motor-universal-lote1-alertas.test.ts",
    } as EvidenciaMotor,
    lacunas: ["Cockpit é leitura por desenho; a escrita mora nos motores de origem."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P10",
    motor: "P10 — Integrações externas e escala",
    estado: "NAO_IMPLEMENTADO" as EstadoMotor,
    prs: [] as string[],
    tabelas: ["communication_queue", "invoices", "payments"] as const,
    naoCriar: [] as const,
    rotaDesk: "/integracoes" as const,
    oQueJaEscreve: "Fila de comunicação existe; envio continua gatilho humano. Sem integração externa (Asaas, Drive, Dropbox) nem escala automática.",
    evidencia: {
      writer: null,
      tabela: null,
      reader: null,
      releitura: null,
      permissao: null,
      rota: "/integracoes",
      teste: null,
    } as EvidenciaMotor,
    lacunas: ["Integração externa depende de decisão e contratação (credenciais, escopo)."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "P11",
    motor: "P11 — Revisão visual e marca",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    prs: ["#91"] as string[],
    tabelas: [] as const,
    naoCriar: [] as const,
    rotaDesk: "/biblioteca" as const,
    oQueJaEscreve: "Marca e navegação do Desk (6 grupos, GRUPOS_DESK). Não é motor de dado.",
    evidencia: {
      writer: null,
      tabela: null,
      reader: null,
      releitura: null,
      permissao: null,
      rota: "/biblioteca",
      teste: "src/lib/__tests__/dsa8-pessoa360-cacard.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA, "Fidelidade ao mockup de 17 páginas só se prova com print autenticado."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
] as const;

/**
 * Fluxos da cadeia Pessoa canônica → Núcleo → Dossiê-mãe → Caso → Perfil →
 * D7 (aprovação de 24/09/2026). Não são motores novos: cada um mora num P.
 */
export const FLUXOS_PESSOA_UNIFICADA = [
  {
    id: "R2-CPF",
    roteiroHomologacao: "docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md#r2",
    motor: "P1",
    fluxo: "CPF dos membros do caso conferido contra o cadastro canônico",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    evidencia: {
      writer: "src/lib/caso-canonico.functions.ts#conferirDivergenciaCpfMembrosCaso",
      tabela: "case_members",
      reader: "src/lib/pessoa-vinculo.ts#sinalCpfDaPessoaPorCaso",
      releitura: "gravarComVerificacao; conflito só membro a membro, com motivo",
      permissao: PERMISSAO_ORG,
      rota: "/casos/$caseId",
      teste: "src/lib/__tests__/r2-cpf-canonico-comportamento-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "NUCLEO-DOSSIE",
    roteiroHomologacao: "docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md#nucleo",
    motor: "P1",
    fluxo: "Núcleo com membros e um dossiê-mãe ativo por núcleo",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    evidencia: {
      writer: "src/lib/nucleos-desk.functions.ts#salvarDossieNucleo",
      tabela: "nucleos_familiares",
      reader: "src/lib/nucleo-completude.ts#dossieMaeDoCaso",
      releitura: "update … select e comparação campo a campo",
      permissao: PERMISSAO_ORG,
      rota: "/nucleos",
      teste: "src/lib/__tests__/nucleo-dossie-mae-canonico-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "DOSSIE-LEGADO-CASO",
    motor: "P1",
    fluxo: "Ponteiro de dossiê em crm_casos.dossie_mae_referencia",
    estado: "REFERENCIA_LEGADA" as EstadoMotor,
    evidencia: {
      writer: null,
      tabela: "crm_casos",
      reader: "src/lib/nucleo-completude.ts#dossieMaeDoCaso",
      releitura: null,
      permissao: PERMISSAO_ORG,
      rota: null,
      teste: "src/lib/__tests__/nucleo-dossie-mae-canonico-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: ["Só lido como fallback rotulado \"legado\"; nunca ativa o gate de dossiê-mãe."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "INVENTARIO-PESSOA",
    motor: "P5",
    fluxo: "Inventário documental da pessoa (Pessoa 360)",
    estado: "IMPLEMENTADO_SOMENTE_LEITURA" as EstadoMotor,
    evidencia: {
      writer: null,
      tabela: "case_source_documents",
      reader: "src/lib/pessoa-identidade.ts#inventarioDocumentalDaPessoa",
      releitura: null,
      permissao: PERMISSAO_ORG,
      rota: "/pessoas/$clienteId",
      teste: "src/lib/__tests__/pessoa-360-inventario-documental-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: ["Documentos são catalogados em /pesquisa-evidencias/$caseId; Pessoa 360 só agrega."] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "PERFIL-VINCULADO",
    roteiroHomologacao: "docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md#perfil",
    motor: "P5",
    fluxo: "Perfil genealógico vinculado à pessoa por escolha humana",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    evidencia: {
      writer: "src/lib/pessoas-linhagens.functions.ts#salvarRegistroG02",
      tabela: "genealogical_person_profiles",
      reader: "src/lib/pessoa.functions.ts#carregarPessoa",
      releitura: "gravarComVerificacao / inserirComVerificacao; vínculo e desvínculo auditados",
      permissao: PERMISSAO_ORG,
      rota: "/pessoas-linhagens/$caseId",
      teste: "src/lib/__tests__/perfil-genealogico-vinculo-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
  {
    id: "D7",
    roteiroHomologacao: "docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md#d7",
    motor: "P4",
    fluxo: "Primeira micro-entrega D7 derivada de ops_microentregas",
    estado: "CODIGO_E_TESTE_SEM_HOMOLOGACAO" as EstadoMotor,
    evidencia: {
      writer: "src/lib/onboarding-plano.functions.ts#criarPrimeiraMicroentregaOnboarding",
      tabela: "ops_microentregas",
      reader: "src/lib/onboarding-jornada.functions.ts#obterPainelJornada",
      releitura: "inserirComVerificacao na micro-entrega; gravarComVerificacao no checklist do plano",
      permissao: PERMISSAO_ORG,
      rota: "/casos/$caseId",
      teste: "src/lib/__tests__/d7-microentrega-real-2026-09-24.test.ts",
    } as EvidenciaMotor,
    lacunas: [LACUNA_SEM_PROVA] as string[],
    homologacaoProprietaria: HOMOLOGACAO_PENDENTE,
    provaAutenticada: null as string | null,
  },
] as const;

export type MotorTabela = (typeof MOTORES_TABELAS)[number];

/** Ordem obrigatória do prompt-mestre: não pular fase. */
export const ORDEM_MOTORES_PRIMORDIAIS = [
  "P0",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "P6",
  "P7",
  "P8",
  "P9",
  "P10",
  "P11",
] as const;

export const ROTULO_ESTADO_MOTOR: Record<EstadoMotor, string> = {
  IMPLEMENTADO_EM_FLUXO_REAL: "Fluxo real homologado",
  IMPLEMENTADO_SOMENTE_LEITURA: "Somente leitura",
  CODIGO_E_TESTE_SEM_HOMOLOGACAO: "Código e teste, sem homologação",
  REFERENCIA_LEGADA: "Referência legada",
  NAO_IMPLEMENTADO: "Não implementado",
};

/** Os 7 elementos exigidos para IMPLEMENTADO_EM_FLUXO_REAL. */
export const ELOS_FLUXO_REAL = ["writer", "tabela", "reader", "releitura", "permissao", "rota", "teste"] as const;

/** Elos ausentes na evidência. FLUXO_REAL só vale com lista vazia. */
export function elosAusentes(e: EvidenciaMotor): string[] {
  return ELOS_FLUXO_REAL.filter((k) => !e[k] || !String(e[k]).trim());
}

/** O Planejador de Cidadania 0–8 não é um 13º P: mora em P7, nas tabelas já existentes. */
export const MOTOR_CIDADANIA_SOB = "P7";
