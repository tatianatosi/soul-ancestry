# Cotejo Tela a Tela — Desk Simples de 6 Abas × Indicadores Vivos

**Data:** 02 de setembro de 2026
**Natureza:** auditoria de código, não de screenshot — sem acesso autenticado ao Desk nesta sessão (Supabase MCP sem autorização, sem credencial de teste). Todo achado abaixo vem de leitura direta de rota → componente → server function → tabela, nunca de inferência.
**Documentos-base:**
- Taxonomia e regra de navegação: `CA_ADENDO_INDICADORES_VIVOS_DESK_SIMPLES_6_ABAS_TAXONOMIA_MIGRACAO_2026-09-02` (6 abas: Hoje / Marketing & Comercial / Casos 360 / Pesquisa & Inteligência / Formalização & Financeiro / Governança & Administração) — autoritativa para o mapa.
- Catálogo de indicadores e vocabulário de cobertura: `CA_RESGATE_INDICADORES_VIVOS_DESK_DA_LISTA_A_REALIDADE_2026-09-02` — usado como base/vocabulário (`DADO_REAL_CONFIRMADO`, `DADO_PARCIAL`, `SEM_DADO_SUFICIENTE`, `DEMO_OU_LOCAL`, `CONFIGURADO_PENDENTE_DE_TESTE`, `ERRO_DE_FONTE`), não executado como prompt de implementação nesta rodada.

**Fora do escopo desta entrega:** nenhuma alteração de código, layout, schema, RLS ou dado. Nenhuma tela foi movida, fundida ou renomeada. Esta é a matriz do P0.1 do artefato de indicadores, organizada pela taxonomia de 6 abas do Adendo.

**Método:** para cada card/indicador, a coluna "Cobertura" usa o vocabulário do artefato de indicadores. "Verificado" significa que li a cadeia rota → componente → server function → tabela. "A verificar" significa que confirmei a existência de uma server function real por trás da tela, mas não tracei cada card individualmente até a tabela.

---

## 1. Hoje

| Rota | Card/Indicador | Pergunta operacional | Fonte atual | Regra atual | Cobertura | Detalhe acessível | Ação contextual | Classificação |
|---|---|---|---|---|---|---|---|---|
| `/painel` | Vencidos | Quais próximas ações já passaram do prazo? | `painelHojeDesk` (`crm-desk.functions.ts`) → fila `acoes_vencidas`, processada em `filaPriorizada`/`cardsHoje` (`painel-dia.ts`) | Contagem de itens da fila com prazo < hoje, deduplicada por chave canônica | `DADO_REAL_CONFIRMADO` | Abre a fila filtrada no próprio painel | Abrir item, reatribuir ou concluir | Manter |
| `/painel` | Vence hoje | O que precisa ser decidido hoje? | Mesma fonte, fila `acoes_hoje` | Prazo = hoje | `DADO_REAL_CONFIRMADO` | Idem | Idem | Manter |
| `/painel` | Sem responsável | Que registro ativo não tem dono? | `consolidarDia(filas)` → `semResponsavel` | Item ativo sem `responsavel_id`/nome | `DADO_REAL_CONFIRMADO` | Idem | Atribuir responsável | Manter |
| `/painel` | Exceções críticas | Quais casos estão travados em algum domínio? | `FILAS_BLOQUEIO` (contrato, pagamento, onboarding, documento) — conjunto deduplicado por registro, não por ocorrência | Registro presente em qualquer fila marcada como bloqueio | `DADO_REAL_CONFIRMADO` | Idem | Abrir motivo do bloqueio | Manter |
| `/painel` | SLA em risco | Que tarefa/micro-entrega está perto de estourar o prazo? | Card declarado em `CARDS_HOJE`, mas `painel-dia.ts` fixa `sla_em_risco: null` explicitamente | Comentário no próprio código: fonte (`tarefas.sla_status`/`ops_microentregas.prazo_status`) ainda não é carregada pela consulta do Painel Hoje | `SEM_DADO_SUFICIENTE` (já declarado corretamente no código — não aparece como zero) | — | — | Ligar à fonte quando `sla_status` for carregado na consulta |
| `/painel` | Sinais de marketing (leads sem origem, discoveries sem desdobramento, propostas sem follow-up, aceites parados, contratos sem referência financeira, pagamentos sem onboarding) | O que está parado no funil comercial? | `sinaisMarketing()` (`indicadores-marketing.ts`), alimentado por contagens reais de fila (`qtd(...)`) | Contagem direta de itens das filas correspondentes | `DADO_REAL_CONFIRMADO` | Abre a fila de origem | Navega ao lead/proposta/contrato | Manter |
| `/painel` | Fila humana de comunicação (IND-COM-03) | Que contato precisa ser feito hoje? | `candidatosComunicacao` no próprio componente, a partir das mesmas filas reais | Soma de gatilhos por prioridade declarada em `GATILHOS` | `DADO_REAL_CONFIRMADO` | Lista de sugestões em rascunho | Copiar/enviar manualmente (sem disparo automático) | Manter |
| `/metricas` | Reaproveita `painelHojeDesk` | — | Mesma fonte do Painel Hoje | — | `DADO_REAL_CONFIRMADO` (parcial — não tracei se duplica cartão do Painel Hoje) | — | — | Verificar se `/metricas` duplica `/painel` sem explicar a diferença (risco de "duas verdades", proibido pelo Adendo §3.1) |

**Achado geral da aba:** Hoje é a aba mais bem resolvida do Desk — quatro dos cinco cards centrais são reais, e o quinto (SLA em risco) já se declara honestamente ausente em vez de mentir com zero. É o padrão a copiar para as outras abas.

---

## 2. Marketing & Comercial

| Rota | Card/Indicador | Pergunta operacional | Fonte atual | Regra atual | Cobertura | Detalhe acessível | Ação contextual | Classificação |
|---|---|---|---|---|---|---|---|---|
| `/leads` | Lista de leads (via `listarLeadsDesk`) | Quem precisa de atenção comercial? | `crm-desk.functions.ts` (real, corrigida na PR #47 para excluir arquivados por padrão) | Filtro por `archived_at`, ordenado por criação | `DADO_REAL_CONFIRMADO` | Abre ficha do lead | Editar, arquivar, avançar etapa | Manter |
| `/leads` | Referência de SKU no card de recomendação comercial | Qual produto foi recomendado? | Campo `sku_referencia` do lead + rótulo (corrigido na PR #50 para "catálogo homologado") | Texto livre validado contra `CAT_PRODUTO_SKU` (ver achado abaixo, aba Governança) | `DADO_PARCIAL` | — | — | Corrigir a fonte da lista de SKUs primeiro (ver aba 6) |
| `/conversao` | Funil comercial (`montarFunil`) | Onde o funil está afunilando mais? | `carregarConversao` (server fn real) → `eventos`/`estados` reais → `montarFunil` (`conversao-funil.ts`) | Razão entre entidades que alcançaram cada etapa consecutiva | `DADO_REAL_CONFIRMADO` | Tabela do funil na própria tela | Abrir entidades da etapa | Manter |
| `/conversao` | Higiene comercial (`montarSaude`) | Quem está sem próxima ação ou com follow-up vencido? | Mesma fonte (`carregarConversao`) | Leads ativos sem próxima ação + follow-ups vencidos | `DADO_REAL_CONFIRMADO` | Lista de leads afetados | Abrir lead | Manter |
| Painel de Calls (componente, dentro de `/leads`) | Roteiro de perguntas / Discovery | O que perguntar na call e o que já foi registrado? | `painel-calls.tsx` + `dicionario-calls-crm.ts` (dicionário de validação, v1.1) | Roteiro fixo por etapa comercial | A verificar | — | — | Investigar a reclamação de UX já registrada (lead não salvava, roteiro "em cima" confuso) — parcialmente corrigida na PR #54, mas o roteiro em si não foi reavaliado |
| Varredura de WhatsApp | Sinais extraídos do dump (nacionalidade, geração, linha, documentos, estrutura familiar, objeção) | O que a call revelou sobre o lead? | `varredura-whatsapp.ts`, aplicado ao lead só por clique explícito (PR #48) | De-para fechado (`CAMPO_LEAD_POR_VARREDURA`), nunca grava o trecho bruto | `DADO_REAL_CONFIRMADO` (o mecanismo; ainda não mesclado — PR #48 em draft) | Achados no próprio componente | Botão "Usar no lead" por achado | Manter — aguardando teste manual antes do merge |
| `/marketing` | Painel de marketing (campanhas, conteúdo, atribuição) | De onde vem a demanda? | A verificar — não tracei esta rota nesta rodada | — | A verificar | — | — | Pendente de cotejo |

**Achado geral da aba:** o núcleo comercial (leads, funil, higiene, varredura) é real e testado. O ponto fraco identificado nesta sessão é a UX do fluxo "criar lead → registrar call" (já com fricção reduzida na PR #54) e a dependência de `produto_sku`, que hoje é uma lista fixa de um item só (ver aba 6).

---

## 3. Casos 360

| Rota | Card/Indicador | Pergunta operacional | Fonte atual | Regra atual | Cobertura | Detalhe acessível | Ação contextual | Classificação |
|---|---|---|---|---|---|---|---|---|
| `/casos/$caseId` | Ficha do caso (`carregarFichaCaso`, `carregarCanonico`) | O que precisa acontecer neste caso agora? | Server functions reais confirmadas (`casos.$caseId.index.tsx`) | A verificar por bloco — não tracei cada seção (saúde, radar, pessoas, jornada, entregas) individualmente nesta rodada | A verificar (fonte real confirmada; granularidade por card pendente) | — | — | Pendente de cotejo campo a campo — próxima rodada |
| `/casos/$caseId` | Núcleos (`listarNucleos`) | Quem compõe o caso? | Server function real | — | A verificar | — | — | Pendente de cotejo |
| `/casos/$caseId/contrato/preparar` | Bloqueios de preparação contratual | O contrato pode avançar? | `abrirPreparacaoContrato` (`contrato-preparar.functions.ts`) — **verificado a fundo nesta sessão**: inclui gates de proposta Canva (`validarPropostaCanva`/`bloqueiosDeEscopo`), completude de páginas, coerência planejador×parâmetros×proposta | Gate real, reforçado em `gerar_versao_final` e `solicitar_assinatura` (`gates-formalizacao.ts`) | `DADO_REAL_CONFIRMADO` | Lista de bloqueios na própria tela | Resolver cada bloqueio | Manter — já é o padrão-ouro de gate real no repositório |
| `/casos/$caseId/contrato/preparar` | Perfil institucional (vigência) | O perfil da contratada está aprovado para assinar? | Até PR #53: sempre "vigente" fixo. **Corrigido nesta sessão** (PR #53, ainda em draft): lê `institutional_profiles` via `lerPerfilInstitucionalPersistido`, com fallback seguro | `CONFIGURADO_PENDENTE_DE_TESTE` (código pronto, não mesclado, sem teste em preview) | Aba Partes/Resumo do contrato | — | Testar em preview antes do merge |

**Achado geral da aba:** Caso 360 tem fonte real confirmada, mas esta sessão não chegou a traçar cada bloco (saúde do caso, radar, pessoas, jornada, financeiro do caso) individualmente até a tabela — só confirmei que a ficha inteira não é mock. É o próximo passo mais importante do cotejo.

---

## 4. Pesquisa & Inteligência

| Rota | Card/Indicador | Pergunta operacional | Fonte atual | Regra atual | Cobertura | Detalhe acessível | Ação contextual | Classificação |
|---|---|---|---|---|---|---|---|---|
| `/pesquisa-modulo` | Painel de pesquisa (`painelPesquisaModulo`) | O que a pesquisa deste caso precisa agora? | Server function real confirmada | A verificar por indicador | A verificar | — | — | Pendente de cotejo |
| `/pesquisa-modulo` | Pendências (`resolverPendenciaPesquisa`, `criarTarefaDaPendencia`) | Que lacuna vira tarefa? | Server functions reais, com escrita de verdade | — | A verificar | — | — | Pendente de cotejo |
| `/pesquisa-modulo` | Liberação externa (`registrarLiberacaoExterna`) | O que pode ir ao App Cliente? | Server function real | — | A verificar | — | — | Pendente de cotejo |
| `/biblioteca` (Biblioteca Mestre) | Acervo versionado | O que está homologado e vigente? | `IND-BIB-01` no registro de governança referencia `master_library_items` — **não tracei se a tela lê essa tabela de verdade ou é lista fixa** | — | A verificar | — | — | Pendente de cotejo — prioridade alta, é a base que a Adenda pede para não virar "cadastro técnico" |
| `/fontes-genealogicas` (Bases Genealógicas) | Catálogo de fontes | Que base é elegível para este caso? | O PDF da Perplexity enviado nesta sessão descreve uma proposta de taxonomia M1–M6 e campos novos para este catálogo — **ainda não implementada**, é material de pesquisa estratégica, não código | — | `DOCUMENTADO_SEM_IMPLEMENTACAO` (a taxonomia M1–M6) | — | — | Não implementar sem decisão específica — é a "próxima execução" que o próprio PDF recomenda, fora do escopo desta sessão |

**Achado geral da aba:** esta é a aba com menos cotejo feito até agora nesta sessão — confirmei que os server functions de pesquisa são reais (não mock), mas não tracei os indicadores individuais (lacunas por linha, cobertura de evidência, conflitos de identidade) até a tabela. A Biblioteca Mestre e as Bases Genealógicas, que o Adendo trata como parte estrutural da Central de Inteligência, precisam de cotejo dedicado antes de qualquer decisão de layout.

---

## 5. Formalização & Financeiro

| Rota | Card/Indicador | Pergunta operacional | Fonte atual | Regra atual | Cobertura | Detalhe acessível | Ação contextual | Classificação |
|---|---|---|---|---|---|---|---|---|
| `/financeiro` | Resultado de caixa do período | O caixa do período é positivo ou negativo? | `resultadoCaixa(base)`, `base` somado de `pagamentos`/`faturas` reais (`qPagamentos`, `qFaturas`) | Receita recebida − despesas − investimento de mídia | `DADO_REAL_CONFIRMADO` | Listas de faturas/pagamentos na mesma tela | Registrar pagamento/fatura | Manter |
| `/financeiro` | CPL, CAC, ROI de mídia | Quanto custa adquirir e reter um cliente? | `cpl`/`cac`/`roi` (`indicadores-marketing.ts`), chamadas com o mesmo `base` | Fórmula real, mas sem `investimento_midia` no objeto `base` atual | `SEM_DADO_SUFICIENTE` (corretamente declarado — a fórmula existe, a fonte de investimento em mídia não) | — | — | Pendente de fonte real (`marketing_investments`) — não é bug, é lacuna de dado já registrada no próprio código |
| Contrato → Partes | Contratante (nome/documento/endereço) | Quem é a parte contratante do instrumento? | Até PR #35: cópia única na criação, nunca ressincronizada. **Corrigido nesta sessão** (PR #35): CRM (`clientes`) é fonte canônica, matriz de Parâmetros como complemento | `CONFIGURADO_PENDENTE_DE_TESTE` (código pronto, PR em draft, sem teste em preview) | Aba Partes do contrato | Botão "Ressincronizar contratante do CRM" | Testar em preview antes do merge |
| Contrato → geração/assinatura | Escopo obrigatório da proposta Canva | O escopo do contrato reflete a proposta aprovada? | `validarPropostaCanva`/`bloqueiosDeEscopo` (`escopo-proposta.ts`), gate real em `gerar_versao_final` e `solicitar_assinatura` | Páginas 1–7 completas, status aprovada/aceita, sem substituição/expiração | `DADO_REAL_CONFIRMADO` | Bloqueios na tela de preparo | Corrigir cada bloqueio | Manter — já implementado antes desta sessão, apenas verificado agora |
| `contrato-parametros` | `produto_sku` (produto-pai do catálogo) | Qual produto-pai foi contratado? | `CAT_PRODUTO_SKU` (`parametros-catalogos.ts`) — **lista fixa com um único item hardcoded** (o SKU da Ana Luiza), não lê `product_catalog` | Dropdown estático | `DEMO_OU_LOCAL` (efetivamente — não é fonte real do catálogo) | — | — | Corrigir: ligar à fonte real (`product_catalog`, `tipo_oferta = produto_pai`) — já identificado, ainda não corrigido |

**Achado geral da aba:** esta é a aba mais auditada nesta sessão inteira — três correções reais já saíram daqui (contratante do CRM, gate do perfil institucional, confirmação do gate Canva) e uma pendência clara e já isolada ficou (`produto_sku` hardcoded).

---

## 6. Governança & Administração

| Rota | Card/Indicador | Pergunta operacional | Fonte atual | Regra atual | Cobertura | Detalhe acessível | Ação contextual | Classificação |
|---|---|---|---|---|---|---|---|---|
| `/governanca/indicadores` | Tabela "Indicadores e métricas" (18 indicadores registrados) | O que cada indicador do Desk mede e de onde vem? | `INDICADORES`/`DETALHE_INDICADOR`/`MANIFESTACAO_INDICADOR` (`indicadores-governanca.ts`) — **arrays hardcoded no código-fonte**, `status` de cada indicador (`apurado`/`parcial`/`sem_dados`) é texto escrito à mão, não calculado | Nenhuma consulta ao banco nesta tela | `DEMO_OU_LOCAL` na forma de exibição (é um dicionário, corretamente rotulado como "registro de leitura" — o problema não é a tela existir, é ela ter sido confundida com um dashboard operacional) | — | Nenhuma — é só leitura | Manter como dicionário em Governança, exatamente como o Adendo pede (§3.6); a confusão da proprietária vinha de esperar números vivos aqui — esclarecido nesta sessão |
| `/governanca/indicadores` | Fila humana de comunicação (tabela de `GATILHOS`) | Que gatilhos de comunicação existem? | `fila-comunicacao.ts` — lista de definição, não de execução | — | `DEMO_OU_LOCAL` (dicionário, correto para o contexto) | — | — | Manter em Governança |
| `/metricas` | Reaproveita `painelHojeDesk` | Ver aba Hoje | Ver aba Hoje | — | Ver aba Hoje | — | — | Verificar se `/metricas` deveria ser fundido com `/painel` ou mantido como resumo agregado com fonte e cobertura, como o Adendo pede em §3.6 para métrica agregada |
| `/configuracoes`, `/equipe` | Usuários e papéis | Quem tem acesso e qual papel? | Não tracei nesta rodada — já registrado como duplicidade conhecida no Mapa de Autoridade Admin (30/08) | — | A verificar | — | — | Já documentado como pendência anterior; não reaberto aqui |

**Achado geral da aba:** o maior mal-entendido da sessão estava aqui — `/governanca/indicadores` nunca foi um dashboard quebrado, é um dicionário estático que se apresenta corretamente como tal, mas foi confundido com o lugar onde os números vivos deveriam aparecer. Os números vivos de verdade estão nas abas operacionais (Hoje, Financeiro, Comercial) — o problema real não era a tela de Governança, era a ausência de um "onde estão os números de verdade" claro, que este documento agora registra.

---

## 7. Síntese e próximos passos

### Já corrigido nesta sessão (PRs em draft, aguardando teste em preview e aprovação)

| PR | O que corrige |
|---|---|
| #35 | Contratante do contrato passa a vir do CRM (`clientes`), não de texto digitado |
| #47 | Leads arquivados somem da lista por padrão |
| #48 | Sinais da varredura de WhatsApp podem ser aplicados ao rascunho do lead, com consentimento explícito por clique |
| #53 | Gate de perfil institucional lê status persistido (`institutional_profiles`), não só o valor fixo |
| #54 | Cadastro de lead não bloqueia mais no meio de uma call |

### Pendências identificadas e ainda não corrigidas

1. `produto_sku` na ficha de contrato é uma lista fixa de um item — não lê `product_catalog`/produto-pai real (aba 5).
2. CPL/CAC/ROI de mídia não têm fonte real de investimento (`marketing_investments`) — corretamente declarado como "sem dados suficientes", não é bug (aba 5).
3. `/metricas` pode estar duplicando `/painel` sem explicar a diferença — precisa de decisão (abas 1 e 6).
4. Caso 360 (ficha completa) e Pesquisa & Inteligência (painel de pesquisa, Biblioteca Mestre, Bases Genealógicas) não foram traçados card a card nesta rodada — só confirmei que a fonte de dados por trás é real, não mock. É o cotejo mais importante que falta.
5. `/marketing` (campanhas, conteúdo, atribuição) não foi verificado nesta rodada.
6. `/configuracoes` × `/equipe` (duplicidade de papéis) — já era pendência conhecida, não reaberta aqui.

### Regra de continuidade

Nenhum item acima foi apagado, movido, fundido ou renomeado. Toda mudança de rota, fusão ou remoção visual depende de aprovação explícita da proprietária, por regra do próprio Adendo (§7, item 9) e da política de arquivamento já vigente no repositório.
