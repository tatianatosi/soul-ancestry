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
    modulo: "components/painel/botao-testar-cliente.tsx",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Reescrito por caso em 01/11/2026: recebe o casoId e abre /app-cliente-como-pessoa?casoId=, sem id fixo e sem TODO (o pipeline.py deixa de abortar nele). Segue sem chamador porque Caso 360 e Pessoa 360 já têm o link oficial; um botão a mais seria CTA duplicado.",
    destino:
      "src/routes/_authenticated/app-cliente-como-pessoa.tsx (mecanismo oficial, ligado no Caso 360 e na Pessoa 360)",
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
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Decidido pela Proprietária em 01/11/2026 (N7): o Painel Hoje segue o mockup Desk V4 aprovado e já aplicado em /painel; painel-dia.tsx é o desenho anterior, superado, e não é religado. Não foi apagado e seus testes ficam como registro de requisito.",
    destino:
      "src/routes/_authenticated/painel.tsx (Painel Hoje da Prancha V4, fonte viva)",
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
    modulo: "lib/agenda-assistida.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Símbolos usados só por agenda-assistida.test.ts; a fila de follow-up da Proprietária cobre parte do trabalho (follow-up) mas não a sugestão de reunião com confirmação, então não é casca duplicada nem religável sem decisão.",
    destino:
      "Decisão: a agenda assistida (sugestão de reunião com confirmação da Proprietária) ganha tela ou fica só como especificação testada",
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
    modulo: "lib/campos-obrigatorios.server.ts",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "A regra 'pendência informa, não impede' roda por autoridade.server.ts, usada em casos-ativacao, caso-ficha, crm-desk e contratos; exigirCamposDeConteudo não tem importador (os 'faltando' vistos em outros arquivos são variáveis locais homônimas).",
    destino:
      "lib/autoridade.server.ts#assumirOuRecusarComUsuario, em uso nos escritores do Desk; não religar",
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
    modulo: "lib/debug-cliente-access.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Reescrito por caso em 01/11/2026: o link aponta para /app-cliente-como-pessoa?casoId= e a lista de clientes de teste com id fixo saiu do código. Segue sem chamador porque o link oficial já está ligado no Caso 360 e na Pessoa 360.",
    destino:
      "src/lib/app-cliente-como-pessoa.functions.ts (mecanismo oficial por casoId)",
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
    modulo: "lib/fontes-documentos-rls.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "É um espelho de teste por desenho: só fontes-documentos-rls.test o usa e a autorização real vive nas policies do banco. Manter o espelho exige mantê-lo igual ao SQL à mão; trocar por teste contra o banco muda a estratégia de prova.",
    destino:
      "Decisão: manter o espelho TypeScript como especificação testada da RLS ou substituí-lo por teste contra as policies reais do banco",
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
    modulo: "lib/saneamento-desk-app-v4.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Retrato fixo do caso da Ana (nomes, valores, fase, prazo) que só era importado por portal-experiencia-integral e portal-fallback-canonico, reescritos por caso em 01/11/2026. Fica no repositório porque o teste de rateio ainda lê o texto; nenhuma tela deve voltar a importá-lo.",
    destino:
      "src/lib/portal-dados-vivos.ts (o caso real chega por dadosVivosDoPortal, via usePortalVivo)",
    riscoVazamento: true,
  },
  {
    modulo: "lib/portal-fallback-canonico.ts",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Reescrito em 01/11/2026: o fallback agora é o vazio honesto (tudo 'Não registrado'), sem régua nem contrato fixos. Segue sem chamador porque a falha de rede é tratada por portal-resiliencia e as abas já mostram vazio honesto.",
    destino:
      "Manter sem religar: as etapas vêm de src/lib/etapas-caso.ts e a Home lê portal-dados-vivos (ROTULOS_ETAPA_CLIENTE)",
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
    modulo: "lib/varredura-completude.ts",
    veredicto: "AGUARDA_DECISAO",
    motivo:
      "Só varredura-completude.test.ts e decisao-ana-canonica.test.ts usam o módulo; é uma foto datada que descreve a Ana (Felipe sem representação, Alice incompleta) e já não bate com o banco de hoje, que é medido por consulta.",
    destino:
      "Decisão: arquivar a foto de 22/08 como histórico rotulado ou mantê-la como inventário testado; o estado vivo vem do banco e do plano de tarefas de 31/10",
    riscoVazamento: true,
  },
];
