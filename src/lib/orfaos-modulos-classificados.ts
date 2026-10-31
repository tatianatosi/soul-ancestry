import type { VeredictoOrfa } from "@/lib/orfaos-classificados";

/**
 * Inventário classificado dos MÓDULOS e componentes sem importador (31/10/2026).
 *
 * O registro de `orfaos-classificados.ts` só cobre `createServerFn`. A varredura
 * de 31/10 achou outra classe de órfã: componente ou módulo em `src/components`
 * e `src/lib` que nenhum arquivo de produção importa (importar só em teste não
 * conta). Cada um recebeu veredicto com o substituto nomeado, medido por nome
 * exportado e não pelo nome do arquivo (skill `classificar-orfao`).
 *
 * Regra do AGENTS.md: órfã é religada com prova de uso ou aposentada com
 * classificação, nunca apagada em silêncio. Este arquivo não apaga nada: diz,
 * por escrito, o que cada módulo é. `riscoVazamento` marca o que carrega dado
 * de família ou pessoa e não deve ser religado sem revisão de privacidade.
 *
 * Fora do inventário, de propósito: os primitivos shadcn de `components/ui`,
 * os `*.functions.ts` (cobertos pelo registro de createServerFn) e os próprios
 * registros de órfãs.
 */
export type OrfaModulo = {
  /** Caminho a partir de `src/`. */
  modulo: string;
  veredicto: VeredictoOrfa;
  /** Por que, em uma frase, citando o substituto ou a decisão. */
  motivo: string;
  /** Para RELIGAR: onde ligar. Para o resto: quem faz o trabalho hoje. Para AGUARDA_DECISAO: "Decisão: ...". */
  destino: string;
  riscoVazamento?: true;
};

export const MODULOS_ORFAOS: OrfaModulo[] = [
  {
    modulo: "lib/useActiveCase.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O hook resolve o caso pelo diretório estático de src/data; seu último consumidor era o Kit Contratual, que passou a receber o caso real por caseId, e nenhuma tela do Desk deve voltar a ler caso fixo.",
    destino:
      "lib/kit-contratual-do-caso.ts e lib/kit-contratual.functions.ts (caso lido do banco pelo caseId da rota)",
  },
  {
    modulo: "components/biblioteca/motores-primordiais.tsx",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Índice de motores sem nenhuma tela que o monte; MOTORES_TABELAS só alimenta motor-caso.ts e o backfill, e nenhuma rota do Desk mostra o estado dos motores.",
    destino:
      "Decisão: o índice dos motores P0–P11 ganha aba em Governança do Desk ou fica só no código (src/lib/motores-tabelas.ts)",
  },
  {
    modulo: "components/caso/descobertas-alertas.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Comunicação externa já chega como rascunho em communication_queue com requires_human_approval por registrarAcaoCadastro; religar este envio direto criaria um segundo caminho vivo.",
    destino:
      "src/lib/cadastro-checklist.functions.ts#registrarAcaoCadastro (rascunho com aprovação humana) e golive.aprovacoes.tsx#aprovarAchadoGoLive",
  },
  {
    modulo: "components/clube-ancestral-kit/kit-consolidado.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O próprio cabeçalho declara @deprecated e 'mantido apenas por compatibilidade visual'; o barrel index.ts não o exporta e KitBadge, KitCard, KitField, KitTable e KitEmptyState vivem em base.tsx, em uso real.",
    destino:
      "components/clube-ancestral-kit/base.tsx (componentes) e tokens.css (tokens), via barrel index.ts",
  },
  {
    modulo: "components/clube-ancestral-kit/preview-fixtures.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Sem importador e sem página de prévia do kit que a use; o próprio comentário proíbe import em rota operacional, então só faria sentido numa prévia que hoje não existe.",
    destino:
      "Decisão: criar uma página de prévia do kit que use esta fixture ou aposentá-la, já que o kit é exercitado por telas reais",
  },
  {
    modulo: "components/contrato/painel-instrumentos.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "A diretriz de 04/10/2026 trocou o excesso de auditorias por uma leitura rápida: TrilhoProntidaoContrato (lib/contrato-prontidao) é montado na preparar:727 e os cartões de proposta, família, condição, critérios e matriz jurídica cobrem os requisitos.",
    destino:
      "components/contrato/trilho-prontidao.tsx na tela casos.$caseId.contrato.preparar; lerPreparacaoInstrumentos fica sem consumidor real",
  },
  {
    modulo: "components/contrato/painel-preparacao.tsx",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "É a única interface de painelPreparacaoContratual, conferirEscopoProposta, registrarRevalidacaoProposta e registrarOverrideGateInterno; o motor de gates segue vivo em cards-fluxo-contrato e coerencia-caso, mas a decisão de validade e o override interno não têm tela.",
    destino:
      "Decisão: montar o painel de conferência (validade comercial e override de gate interno) na tela de preparar do contrato ou aposentá-lo em favor de cards-fluxo-contrato e OverrideComercial",
  },
  {
    modulo: "components/contratos/painel-estado-contratual.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "JuridicoContratoV4, montado em contratos.index.tsx:157, lê o mesmo painelContratual e mostra as mesmas contagens (bloqueios, pendências, revisão, anexos ausentes, OS impedidas, exceções) na casca V4.",
    destino: "components/contratos/juridico-contrato-v4.tsx em /contratos",
  },
  {
    modulo: "components/desk-go-live.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Versão estática alimentada por dado fixo foi substituída pelo GoLive vivo por caso (golive.index.tsx, golive.caso.tsx), que lê o banco; religar exporia nomes de clientes do registro.",
    destino:
      "src/routes/_authenticated/golive.index.tsx e golive.caso.tsx, com dados de src/lib/golive.functions.ts#carregarGoLive",
    riscoVazamento: true,
  },
  {
    modulo: "components/desk/kanban-tarefas.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "tarefas.tsx define e monta o seu próprio KanbanTarefas (linhas 68 e 165) sobre listarFilaOps; este componente separado repete a mesma visão e nunca foi importado.",
    destino: "src/routes/_authenticated/tarefas.tsx#KanbanTarefas (função local, já montada)",
  },
  {
    modulo: "components/desk/modulos-contextuais.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "O assistente já é montado no SaasShell por AssistenteTransversal, e a lista de módulos por tela duplicaria a navegação de SETORES_DESK, que o AGENTS.md define como única.",
    destino:
      "src/components/saas/shell.tsx (AssistenteTransversal) e src/lib/navegacao-desk.ts#SETORES_DESK",
  },
  {
    modulo: "components/entrega-consultiva.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "A entrega por fase hoje vem do banco real em relatorios-fase.$caseId.tsx (relatorios-fase.functions.ts); este componente lê só src/data, que classificacao-dados.ts rotula como modelo/demo.",
    destino: "routes/_authenticated/relatorios-fase.$caseId.tsx e studio-devolutivas.tsx",
    riscoVazamento: true,
  },
  {
    modulo: "components/entrega-modelo.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O modelo de entrega por fase vive hoje em relatorios-fase.$caseId.tsx sobre dado real; este componente só renderiza o caso modelo Sophia de src/data/caso-sophia, sem leitura de banco.",
    destino: "routes/_authenticated/relatorios-fase.$caseId.tsx; caso-sophia fica como modelo",
    riscoVazamento: true,
  },
  {
    modulo: "components/governanca/anexos-tres-camadas.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "AnexosIaV e InstanciaDocumental, montados na preparar (linha ~934), mostram os anexos reais do caso a partir de anexos-instancia; este painel é um retrato estático datado em lib/anexos-tres-camadas, que só ele consome.",
    destino:
      "components/contrato/anexos-i-v.tsx e instancia-documental.tsx na tela de preparar do contrato",
    riscoVazamento: true,
  },
  {
    modulo: "components/painel/botao-testar-cliente.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "A regra do AGENTS.md é ver o App só por /app-cliente-como-pessoa?casoId=; este botão aponta para um id fixo de cliente real e para uma rota fora das 7 abas.",
    destino:
      "src/routes/_authenticated/app-cliente-como-pessoa.tsx (preview administrativo por casoId), já ligado em casos.$caseId.index.tsx",
    riscoVazamento: true,
  },
  {
    modulo: "components/painel/cards-alertas-centrais.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "A central de alertas já mostra os mesmos alertas em /alertas, que chama listarAlertasCentrais; o cartão no Hoje foi retirado quando o Painel Hoje virou a grade da Prancha V4.",
    destino: "src/routes/_authenticated/alertas.tsx (usa listarAlertasCentrais)",
  },
  {
    modulo: "components/painel/faixa-historica.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Servia aos painéis aposentados visualmente na CA-UX-03 Fase B; os painéis que a exibiam saíram de rota e o destino do link, /painel, é hoje a superfície canônica do Hoje.",
    destino: "src/routes/_authenticated/painel.tsx (Painel Hoje, destino único)",
  },
  {
    modulo: "components/painel/metricas-jornada.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "CA-UX-03 deixou uma superfície só em /ops, PainelOnboardingJornada, e declara que MetricasJornada e PainelCadencia não montam; religar repetiria a mesma leitura de jornada.",
    destino:
      "src/components/painel/painel-onboarding-jornada.tsx#PainelOnboardingJornada, montado em routes/_authenticated/ops.tsx",
  },
  {
    modulo: "components/painel/painel-cadencia.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Mesma dedup da CA-UX-03: a cadência é lida pela superfície única de /ops, e fontes-canonicas-indicadores.ts proíbe montar PainelCadencia na mesma rota.",
    destino:
      "src/components/painel/painel-onboarding-jornada.tsx#PainelOnboardingJornada, montado em routes/_authenticated/ops.tsx",
  },
  {
    modulo: "components/painel/painel-desk-hoje.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O corte radical de 17/10/2026 fez do /painel a grade da Prancha V4 (kpisHoje, prioridadeDaCarteira em golive-operacao); este painel antigo parou de ser montado.",
    destino: "src/routes/_authenticated/painel.tsx (Painel Hoje da Prancha V4)",
  },
  {
    modulo: "components/painel/painel-dia.tsx",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "O AGENTS.md mantém painel-dia.tsx aguardando decisão e proíbe tocá-lo; /painel já é a grade da Prancha V4, mas a Proprietária ainda não declarou qual é a fonte viva do Hoje.",
    destino: "Decisão: painel-dia.tsx × /painel: qual é a fonte viva do Painel Hoje",
  },
  {
    modulo: "components/painel/painel-hoje.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Substituído pelo Painel Hoje da Prancha V4 em /painel; a leitura de conversão que ele mostrava vive em /conversao (carregarConversao), então não há lacuna de operação.",
    destino:
      "src/routes/_authenticated/painel.tsx (Hoje) e src/routes/_authenticated/conversao.tsx#carregarConversao (conversão)",
  },
  {
    modulo: "components/painel/painel-top30.tsx",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "A Biblioteca já lista o catálogo Top 30 (listarCatalogoTop30), mas nenhuma tela cruza catálogo com case_plans como este painel faz; não prova que o trabalho esteja coberto.",
    destino:
      "Decisão: o cruzamento Top 30 × planos de caso ganha lugar no Desk (Comercial ou Caso 360) ou o catálogo fica só na Biblioteca",
  },
  {
    modulo: "components/pesquisa/plano-acao-demo.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O plano de ação real vive em plano-acao.$caseId.tsx sobre research_action_plan_items; esta versão tem família, instituições e prazos escritos no código e não lê banco.",
    destino: "routes/_authenticated/plano-acao.$caseId.tsx",
    riscoVazamento: true,
  },
  {
    modulo: "components/portal/bloco-exemplo-visual.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "A regra do App é vazio honesto e nada inferido: sem dado publicado a aba mostra PortalVazio/EstadoDados, nunca exemplo; os blocos exibem estados como Validado e Recebido que, religados, poderiam passar por dado real.",
    destino:
      "PortalVazio em components/portal/portal-shell.tsx e os estados de EstadoDados nas 7 abas",
  },
  {
    modulo: "components/relatorio-fase02.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O relatório por fase vem do banco em relatorios-fase.$caseId.tsx; este componente lê relatorio-fase02 e case-registry de src/data, classificados como demo em classificacao-dados.ts.",
    destino: "routes/_authenticated/relatorios-fase.$caseId.tsx",
    riscoVazamento: true,
  },
  {
    modulo: "components/relatorio-visual.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O relatório visual por fase é gerado hoje do banco em relatorios-fase.$caseId.tsx; este componente depende de src/data/relatorio-visual e src/data/casos, ambos classificados como demo.",
    destino: "routes/_authenticated/relatorios-fase.$caseId.tsx",
    riscoVazamento: true,
  },
  {
    modulo: "components/timeline-contratual.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "A linha do tempo do caso vive em historico-por-fase.tsx e visao-geral.tsx no Caso 360, e o cliente a vê na Conta por case_timeline_events aprovados (conta.tsx:541); este componente depende de CaseData de src/data.",
    destino: "components/caso/historico-por-fase.tsx (Desk) e routes/portal/conta.tsx (cliente)",
  },
  {
    modulo: "components/ui/ca-badge.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Selo (comercial/base.tsx) e KitBadge (clube-ancestral-kit/base.tsx) já fazem o mesmo trabalho em dezenas de telas; religar CaBadge criaria um terceiro selo concorrente.",
    destino: "components/comercial/base.tsx#Selo e clube-ancestral-kit/base.tsx#KitBadge",
  },
  {
    modulo: "components/ui/ca-empty-state.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "O arquivo é um alias de PortalVazio, como diz o próprio comentário; no Desk o estado vazio já é EstadoVazio (saas/shell.tsx) e KitEmptyState, em uso em dezenas de telas.",
    destino: "PortalVazio (App) e EstadoVazio em components/saas/shell.tsx (Desk)",
  },
  {
    modulo: "components/ui/ca-progress.tsx",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Nenhuma tela usa barra de porcentagem hoje: o progresso do caso é mostrado por etapas em ReguaEtapas (portal e prancha V4), derivadas de dado real; o shadcn ui/progress também não tem uso.",
    destino:
      "Decisão: manter CaProgress como primitivo de porcentagem real ou aposentá-lo em favor de ReguaEtapas, que mostra progresso por etapa",
  },
  {
    modulo: "components/ui/ca-table.tsx",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "KitTable (kit-exportavel, kit-app-cliente) e a Tabela local de desk/ui-desk.tsx já cobrem tabelas simples; religar CaTable seria um terceiro caminho para a mesma função.",
    destino: "clube-ancestral-kit/base.tsx#KitTable e desk/ui-desk.tsx#Tabela",
  },
  {
    modulo: "lib/aceite-e2e-passos.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Sem importador em src: quem lê o arquivo é o harness scripts/aceite-operacional-e2e.py (ROTEIRO_TS) e o teste aceite-e2e-passos.test.ts; não é código morto, mas o registro de órfãs não tem veredicto para 'lido só por script externo'.",
    destino:
      "Decisão: manter como roteiro lido pelo script de aceite (isento do inventário de órfãs) ou aposentar o harness de aceite E2E",
  },
  {
    modulo: "lib/agenda-assistida.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Símbolos usados só por agenda-assistida.test.ts; a fila de follow-up da Proprietária cobre parte do trabalho (follow-up) mas não a sugestão de reunião com confirmação, então não é casca duplicada nem religável sem decisão.",
    destino:
      "Decisão: a agenda assistida (sugestão de reunião com confirmação da Proprietária) ganha tela ou fica só como especificação testada",
  },
  {
    modulo: "lib/app-cliente-gate.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Já classificado em 27/10 por app-cliente-gate-casca-duplicada-2026-10-27.test.ts: a decisão de visibilidade viva é de portal-visibilidade.tsx; religar o gate paralelo trocaria o mecanismo que decide o que a família vê.",
    destino:
      "components/portal/portal-visibilidade.tsx#useVisibilidade (mecanismo vivo em 8 rotas); não religar",
  },
  {
    modulo: "lib/app-visibilidade-registro.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "O escopo vivo vem do servidor por escopoDoPortal, com o caso real do cliente; escopoDoRegistro deriva o mesmo EscopoCliente de um registro estático de demonstração e não tem nenhum chamador, nem teste.",
    destino:
      "lib/portal-jornada.functions.ts#escopoDoPortal, consumido por useEscopoPortal; não religar (fixture estática)",
    riscoVazamento: true,
  },
  {
    modulo: "lib/arvore-cliente-projecao.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "A árvore do App lê pessoasDaArvore (arvore-publicacao) e já cumpre a regra do genograma único; projetarArvoreCliente só é chamada por arvore-cliente-projecao.test.ts. CAMPOS_INTERNOS_BLOQUEADOS aparece em pesquisa-cadeia.ts e achados-genealogicos.ts por definição própria, não por import.",
    destino:
      "lib/arvore-publicacao.ts#pessoasDaArvore (usado por ficha-master.server.ts e pelo portal); não religar",
  },
  {
    modulo: "lib/campos-obrigatorios.server.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "A regra 'pendência informa, não impede' roda por autoridade.server.ts, usada em casos-ativacao, caso-ficha, crm-desk e contratos; exigirCamposDeConteudo não tem importador (os 'faltando' vistos em outros arquivos são variáveis locais homônimas).",
    destino:
      "lib/autoridade.server.ts#assumirOuRecusarComUsuario, em uso nos escritores do Desk; não religar",
  },
  {
    modulo: "lib/canvas-audit.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Nenhum chamador em src nem em scripts; depende de src/data/casos (ilha de dados de planilha) e instala um hook em console.error no import, então religar teria efeito colateral global sem decisão de quem verifica contraste hoje.",
    destino:
      "Decisão: manter a auditoria de fonte/contraste do Canvas como ferramenta de desenvolvimento (e quem a roda) ou aposentá-la",
  },
  {
    modulo: "lib/classificacao-dados.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "O corte de dado de demonstração no App vive em fixtures.ts#ehFixtureLinha e nos filtros do portal; as demais menções a filtrarParaCliente/CLASSIFICACOES em src são comentários ou definições próprias, e este módulo só é exercitado por classificacao-dados.test.ts.",
    destino:
      "lib/fixtures.ts#ehFixtureLinha mais os filtros do portal em portal-cliente.functions.ts; INVENTARIO_FONTES segue verificado só por teste",
  },
  {
    modulo: "lib/corte-vertical.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Nenhum símbolo é usado em src, scripts ou testes; o 'estado real do piloto' é uma foto estática (bloqueios, valores de pagamento) que o banco já responde ao vivo, e religá-la mostraria número desatualizado numa tela.",
    destino:
      "Estado vivo no banco e lib/fontes-canonicas-indicadores.ts#INDICADORES_CANONICOS; manter o arquivo como registro histórico, sem apagar",
    riscoVazamento: true,
  },
  {
    modulo: "lib/criterios-aceite.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Sem importador em src nem em testes; CriterioAceite/contarPorEstado/criteriosPendentes vistos em matriz-aceite.ts, matriz-conformidade.ts e crm-desk.functions.ts são tipos e variáveis locais homônimos. O estado por critério é uma foto que envelhece.",
    destino:
      "Decisão: o registro de critérios de aceite vira tela de Governança com estado vivo ou é aposentado em favor do dicionário de calls e da matriz de aceite",
  },
  {
    modulo: "lib/debug-cliente-access.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "O mecanismo oficial para o admin ver o App do cliente é app-cliente-como-pessoa (por casoId, com preview isolado); este link aponta para /portal/casos/$id, rota fora das 7 abas, e só é citado num TODO de botao-testar-cliente.tsx.",
    destino:
      "lib/app-cliente-como-pessoa.functions.ts#dadosVivosDoPortalComoAdmin; não religar (expõe dado real de cliente fora do preview)",
    riscoVazamento: true,
  },
  {
    modulo: "lib/decisao-ana-canonica.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "A resolução de códigos legados vive hoje nos aliases do banco, lidos por carregarCanonico; os símbolos deste módulo só aparecem em decisao-ana-canonica.test.ts, e as menções a CA-AUT-ANALUIZA em src são constantes próprias.",
    destino:
      "Tabela case_aliases via lib/caso-canonico.functions.ts#carregarCanonico; arquivo fica como registro da decisão, sem apagar",
    riscoVazamento: true,
  },
  {
    modulo: "lib/demo-cliente-helper.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "A rota /app-cliente-demo que o helper descreve já existe e funciona sozinha; telasClientePortalAtivas devolve três true fixos e não lê estado real, então religá-la só criaria um segundo retrato do demo.",
    destino: "src/routes/_authenticated/app-cliente-demo.tsx (a própria rota do demo)",
  },
  {
    modulo: "lib/design-tokens.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "As mesmas cores já vivem em src/styles.css (--navy: #13294B e o comentário da paleta Pantone) e em brand.tsx; ninguém importa DESIGN_TOKENS_*, então a declaração de 'fonte única' não é a que as telas leem.",
    destino: "src/styles.css (variáveis CSS) e src/components/brand.tsx",
  },
  {
    modulo: "lib/desk-arvore-canonica.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Descreve 14 abas ligadas a src/components/desk-app.tsx, arquivo que não existe mais; a lateral hoje é derivada de GRUPOS_DESK/SETORES_DESK (AGENTS.md) e só biblioteca-mestre.test lê ABAS_DESK_CANONICAS.",
    destino: "src/lib/navegacao-desk.ts (GRUPOS_DESK → SETORES_DESK, lista única do menu)",
  },
  {
    modulo: "lib/estados-edicao.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Só estados-edicao.test importa o módulo. O motor real trata apenas rascunho_editavel/congelado (previa-vigente.ts) e a coerência por exigirCoerencia; adotar decidirEdicao como regra única mudaria o gate do contrato.",
    destino:
      "Decisão: o motor do contrato adota decidirEdicao/pendenciasPorGate como regra única de edição × avanço, ou o módulo fica só como especificação testada",
  },
  {
    modulo: "lib/fontes-documentos-rls.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "É um espelho de teste por desenho: só fontes-documentos-rls.test o usa e a autorização real vive nas policies do banco. Manter o espelho exige mantê-lo igual ao SQL à mão; trocar por teste contra o banco muda a estratégia de prova.",
    destino:
      "Decisão: manter o espelho TypeScript como especificação testada da RLS ou substituí-lo por teste contra as policies reais do banco",
  },
  {
    modulo: "lib/gates-piloto.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Nenhum arquivo, nem teste, importa o módulo. Pertence à superfície do piloto 5A.1, que já aguarda decisão em piloto.functions.ts, e os bloqueios abertos do piloto caíram para zero em 30/10, então os gates não têm onde aparecer.",
    destino:
      "Decisão: o piloto 5A.1 vira tela própria ou é absorvido pelo Caso 360; os gates A–H só voltam se a tela existir",
  },
  {
    modulo: "lib/indicadores-governanca.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Só três testes (ca22, ca23, p1) leem INDICADORES; existe um segundo registro paralelo, INDICADORES_CANONICOS, importado apenas por painel/faixa-historica.tsx, que também é órfão. Escolher qual vale precisa de decisão.",
    destino:
      "Decisão: qual dos dois registros de indicadores é o canônico e se ele ganha tela em Governança ou fica verificado só por teste",
  },
  {
    modulo: "lib/inventario-campos-abas.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "É a tabela de campos e rotas do Corte G, concluída em 31/10 e verificada por inventario-campos-abas-2026-10-04.test; nenhuma tela a mostra. Não deve ser apagada, só falta decidir onde ela aparece.",
    destino:
      "Decisão: a tabela de campos ganha tela (ex.: Governança → Inventário de campos) ou fica como inventário verificado só por teste",
  },
  {
    modulo: "lib/inventario-csv.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "A fonte INVENTARIO está viva em contratos.index.tsx, mas nenhuma tela chama baixarCsvInventario ou previaCsvInventario; só inventario-csv.test usa o exportador. Religar adiciona um botão de exportação que ninguém pediu.",
    destino:
      "Decisão: o inventário patrimonial em /contratos ganha botão de exportar CSV ou o exportador fica só como utilitário testado",
  },
  {
    modulo: "lib/inventario-recuperacao.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Nenhum arquivo importa o módulo, mas desk-modulos.ts:445 anuncia a rota /governanca/inventario-recuperacao, que não existe no routeTree. Há também um inventário mais novo (22/08) já em uso, e o snapshot traz dados reais do caso da Ana.",
    destino:
      "Decisão: criar a rota /governanca/inventario-recuperacao que desk-modulos.ts já anuncia, ou aposentar o snapshot de 16/08 em favor do inventário de 22/08",
    riscoVazamento: true,
  },
  {
    modulo: "lib/legado-visibilidade.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "A aba Legado já sanitiza por legadoSanitizado (portal-dados-vivos.ts:223, usado em portal/legado.tsx:11) com contemConteudoInterno e só publicações autorizadas; legado-visibilidade só tem teste próprio e duplicaria a regra.",
    destino:
      "src/lib/portal-dados-vivos.ts#legadoSanitizado, montado em src/routes/portal/legado.tsx",
  },
  {
    modulo: "lib/matriz-capacidades-jornada.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Nenhuma tela importa o módulo; só ca-ops-02-matriz-capacidades.test.ts lê CAPACIDADES, MATRIZ_CAPACIDADES, capacidadesDoElo e elosSemCobertura. Rotas e menu vivem em navegacao-desk.ts, mas guardas e elos só existem aqui.",
    destino:
      "Decisão: manter a matriz de capacidades CA-OPS-02 como inventário verificado só por teste, ou aposentá-la porque rotas e menu do Desk já vivem em navegacao-desk.ts",
  },
  {
    modulo: "lib/matriz-conformidade.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Sem nenhum importador e sem teste; os rotuloEstado/tomEstado/contarPorEstado usados por studio-devolutivas.tsx e criterios-aceite.ts vêm de lib/estados e de definição própria. É foto de 20/08, anterior a #204 e à casca V4.",
    destino:
      "Decisão: a auditoria de paridade visual (J11 do plano de 31/10) parte desta matriz de 20/08 ou é refeita do zero com os mockups atuais",
  },
  {
    modulo: "lib/matriz-equivalencia.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Só navegacao-desk.test.ts usa MATRIZ_EQUIVALENCIA, para checar que cada grupo cai num dos 7 grupos; contarEstados e totalLinhas de outros módulos são homônimos. A navegação viva é GRUPOS_DESK/SETORES_DESK, decidida em 18-19/10.",
    destino:
      "Decisão: manter a matriz como guarda do mapeamento mockup→grupos (navegacao-desk.test.ts) ou trocar a guarda por GRUPOS_DESK direto e aposentar a matriz",
  },
  {
    modulo: "lib/portal-experiencia-integral.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Fixture de família real (inclui Felipe, menor, e valores do contrato) contrária à regra do vazio honesto: o App lê dado vivo e sanitizado por portal-dados-vivos via usePortalVivo. Só rateio-igualitario-ana-2026-10-23.test.ts lê o arquivo, como texto.",
    destino:
      "Manter no repositório sem religar: o App usa src/lib/portal-dados-vivos.ts (usePortalVivo em routes/portal/index.tsx)",
    riscoVazamento: true,
  },
  {
    modulo: "lib/portal-fallback-canonico.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Régua de 10 etapas com 'Linhagem Friedmann-Reimer mapeada' fixa; o AGENTS.md manda as 5 etapas do caso virem só de etapas-caso.ts, e o App mostra vazio honesto em vez de fallback inventado.",
    destino:
      "Manter sem religar: as etapas vêm de src/lib/etapas-caso.ts e a Home lê portal-dados-vivos (ROTULOS_ETAPA_CLIENTE)",
    riscoVazamento: true,
  },
  {
    modulo: "lib/portal-mapa-kit.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "O cabeçalho diz que a barra é montada daqui, mas portal-shell.tsx monta as 7 abas com lista própria e COPY_TELAS (linhas ~133-141). Religar criaria a terceira fonte de navegação do App, que o AGENTS.md proíbe.",
    destino:
      "Não religar: a barra do App é a lista de 7 abas em src/components/portal/portal-shell.tsx",
  },
  {
    modulo: "lib/portal-navegacao.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Só testes leem PORTAL_ABAS_CANONICAS, PORTAL_ROTAS_SPEC, PORTAL_ROTAS_PROFUNDAS e abasCanonicasDoPortal (enterprise-prd-portal-canonicos e app-cliente-contrato-experiencia). A barra viva é a lista de 7 abas de portal-shell.tsx.",
    destino:
      "Não religar: segunda lista das 7 abas; a barra viva está em src/components/portal/portal-shell.tsx",
  },
  {
    modulo: "lib/rascunhos-comunicacao-governados.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Só rascunhos-comunicacao-governados.test.ts usa o módulo. Templates governados vivem na Biblioteca de Mensagens (status vigente) e o rascunho com aprovação humana vai para communication_queue em onboarding-plano.functions.ts; templateVigente de orquestracao-jornada é homônimo.",
    destino:
      "Não religar: usar src/lib/message-library.functions.ts e a rota biblioteca-mensagens, que já governam templates vigentes",
    riscoVazamento: true,
  },
  {
    modulo: "lib/rotulos-humanos.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Faz o mesmo trabalho de rotulo-negocio.ts#rotuloTabela (nome técnico de tabela → rótulo de negócio). O rotuloHumano que aparece em descoberta-desk.ts:22 é outra função, de rotas. Só rotulos-humanos.test.ts usa este módulo.",
    destino:
      "Não religar: rotuloTabela em src/lib/rotulo-negocio.ts já é o rótulo de negócio das tabelas (hoje chamado por motores-primordiais.tsx, também órfão)",
  },
  {
    modulo: "lib/varredura-completude.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Só varredura-completude.test.ts e decisao-ana-canonica.test.ts usam o módulo; é uma foto datada que descreve a Ana (Felipe sem representação, Alice incompleta) e já não bate com o banco de hoje, que é medido por consulta.",
    destino:
      "Decisão: arquivar a foto de 22/08 como histórico rotulado ou mantê-la como inventário testado; o estado vivo vem do banco e do plano de tarefas de 31/10",
    riscoVazamento: true,
  },
];
