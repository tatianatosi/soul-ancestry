# Políticas e prompts de implementação — arquivo de referência

Cópias verbatim dos documentos de política/prompt enviados pela proprietária, guardadas aqui para que nada dependa de memória de conversa ou de contexto que pode ser resumido ao longo de uma sessão longa. Nenhum deles foi implementado só por estar aqui — este diretório é **arquivo de referência**, não registro de execução. O estado real de cada capacidade fica no Mapa de Autoridade Admin (`docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md`).

## Sequência confirmada pela proprietária (30/08/2026)

> "Concordo com a sequência: manter P0 e P1 operacionais agora; Cockpit, indicadores e revisão visual somente depois."

| Ordem | Documento | Status |
|---|---|---|
| 1 (agora) | `PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md` | P0/P1 efetivado nesta janela — persistência com verificação (PR #31), decisão pós-salvamento em Pessoa (PR #32), Piloto Real com pendências reais (PR #33), reconciliação Contratos PR#28×PR#32 + edição de partes/CPF-CNPJ (PR #35), gravação verificada em Comercial/Financeiro (PR #39), remoção de 3 botões redundantes do contrato (PR #40) |
| 1 (agora) | `PROMPT-AUTORIDADE-ADMIN-MAPA-DESK-APP.md` | Fechado — Mapa de Autoridade Admin (PR #34) cobre as 10 áreas pedidas (Pessoas, Caso 360, Contratos, Piloto Real, Painel Hoje, Comercial, Pesquisa, Marketing, Configuração, App Cliente), todas com evidência real. Painel de Calls (CA-04) confirmado como a mesma tabela/função de Leads já mapeada, não sistema paralelo — ver `ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md` |
| 2 (depois do motor) | `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` | Fase 1 (mapear sem modificar) efetivada com dado real do Supabase (PR #36) — duplicidade de caso da Ana já estava resolvida antes desta sessão; achado real pendente: CNPJ institucional da Clube Ancestral em 3 lugares sem sincronia. Fase 2/3 (motor `case_participants`) aguardando decisão da proprietária — pausado por instrução dela em 30/08 |
| 2 (depois do motor) | `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | Não iniciado — CRM vivo, motor contratual, cadências por evento, indicadores reais |
| 3 (Cockpit) | `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` | Não iniciado — indicadores acionáveis por grupo do Desk |
| 4 (visual, por último) | `TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` | Não implementado — é a fonte de verdade de nomenclatura para quando a revisão visual começar. Os nomes das 7 telas do App Cliente e das 7 telas do Desk Intelligence não podem ser renomeados, fundidos ou substituídos sem aprovação explícita quando esse trabalho começar. |

## Prompt mestre — `PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md` (31/08/2026)

Documento novo, mais recente e mais completo que os anteriores desta lista — organiza os motores do produto em **P0 a P11**, cada um com objetivo, entidades, regras e critério de aceite, e absorve o conteúdo de `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md`, `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` e `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` numa única sequência. A partir de agora este é o documento de referência para a ordem dos motores — os três anteriores continuam arquivados, mas não devem mais ser tratados como pistas paralelas.

Regra do próprio documento: **"Cada fase precisa ser validada com dados reais antes da próxima"** — não pular fase.

| Fase | O que é | Status real em 31/08/2026 |
|---|---|---|
| P0 — Autoridade operacional e persistência | editar → salvar → confirmar linha → reler → refresh → reabrir | Corrigido em código em todos os domínios auditados — `gravarComVerificacao`/`inserirComVerificacao` é o padrão em Pessoas (PR #32), Piloto Real, Contratos (PR #35) e agora também Comercial/Financeiro, 11 funções (PR #39). Nenhum domínio homologado manualmente em preview ainda |
| P1 — Caso canônico, núcleo e participantes | um `case_id`, aliases preservados, matriz de reconciliação antes de qualquer merge | Fase 1 (mapear sem modificar) feita com dado real (PR #36) — zero duplicidade real encontrada, nada unido ainda. Fase de motor (`case_participants`) não iniciada — aguardando decisão da proprietária |
| P2 — Comercial, proposta, contrato e OS | conteúdo jurídico fora de "Dados técnicos", perfil institucional reutilizado automaticamente | Contrato: PR #35 (6 ações reais, edição de CPF/CNPJ, correção do bug da parte contratante, botão de ressincronizar contratante) + PR #40 (remove 3 botões que só duplicavam navegação de aba). Persistência de Propostas/Faturas/Pagamentos corrigida em código (PR #39). Perfil institucional da contratada **ainda não** reutilizado automaticamente de forma correta — é o achado do CNPJ em 3 lugares sem sincronia, registrado e pausado por decisão da proprietária |
| P3 — Tarefas, próxima ação e cadência | decisão de tarefa não bloqueia salvamento; idempotência por `case_id + origem + referência` | Parcial — decisão de tarefa existe em Pessoa (PR #32), Caso 360 e Contrato (PR #35), mas sem a chave de idempotência descrita aqui; ainda cria nova tarefa a cada clique, não reaproveita. Confusão anterior de que só existiria no Painel Ops foi reconciliada — era link de preview errado (produção/`main`), não ausência de implementação; ver `RECONCILIACAO-CRIAR-TAREFA-FECHAMENTO-MAPA-2026-08-31.md` |
| P4 — Onboarding real | um onboarding por `case_id`, motor único parametrizado | Não iniciado — achado dos **3 sistemas de onboarding paralelos** (Mapa de Autoridade Admin) é exatamente o problema que esta fase resolve |
| P5 — Pesquisa, fontes, documentos e evidências | Não iniciado — achado do **3º sistema paralelo de evidências** (Painel Hoje/Comercial/Pesquisa, PR #34) é o mesmo problema |
| P6 — Micro-entregas, App Cliente e portal | Não iniciado como motor — Mapa fechou a auditoria das 7 telas (achado: Legado, Entregas, Fase 01, Fase 02 são stubs com texto fixo, sem busca de dado real) |
| P7 — Catálogo, financeiro e comercial | Persistência de escrita corrigida em código (PR #39); fonte única de catálogo e jornada completa ainda não consolidadas |
| P8 — Marketing, conteúdo e conversão | Não iniciado como motor — Mapa fechou a auditoria (achado: Biblioteca de Mensagens tem função de edição de texto pronta, mas nenhuma tela chama) |
| P9 — Cockpit, indicadores e alertas | Não iniciado — é o prompt do Cockpit, explicitamente adiado pela proprietária |
| P10 — Integrações externas e escala | Não iniciado, nem deve começar antes do fluxo interno estar confiável (regra do próprio documento) |
| P11 — Revisão visual e marca | Não iniciado — pré-requisito do próprio documento ("Ana operável, onboarding real, dados sobrevivem a refresh") ainda não está completo |

## Reconciliações e inventário — 31/08/2026

Documentos operacionais enviados ao longo do dia 31/08, arquivados com nota explicando sobreposição/estado real quando aplicável.

| Documento | Contexto | Status |
|---|---|---|
| `DECISAO-SEQUENCIAMENTO-MOTORES-P0-P4-2026-08-31.md` | Fixa a ordem: fechar P0/P2, só então pedir autorização para especificar P4 | Regra ativa — segue orientando esta sessão |
| `DIAGNOSTICO-CONTRATO-TAREFAS-PERFIS-PESQUISA-2026-08-31.md` | Diagnóstico que originou a decisão de remover os 3 botões redundantes do contrato | Executado — PR #40 |
| `CORRECAO-CRIAR-TAREFA-PAINEL-OPS-2026-08-31.md` | Afirmava que "Criar tarefa" só existe no Painel Ops | Arquivado com contestação (evidência de código encontrada em 3 outras superfícies); depois confirmado em conversa que a causa era link de preview errado |
| `RECONCILIACAO-CRIAR-TAREFA-FECHAMENTO-MAPA-2026-08-31.md` | Reconciliação formal da divergência acima, com taxonomia mais granular | Substitui a conclusão do documento anterior |
| `ATUALIZACAO-PR40-PROXIMA-FATIA-MAPA-2026-08-31.md` | Pedia a mesma fatia do Mapa (Marketing/Configuração/App Cliente) já entregue | Arquivado — auditoria pedida já estava no commit `cf4c86a` quando o pedido chegou |
| `INVENTARIO-CONSOLIDADO-PROMPTS-FASES-2026-08-31.md` | Inventário P0→P11 de todos os prompts anteriores, com prioridades imediatas | Arquivado — conteúdo já refletido nesta tabela e no Mapa |
| `ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md` | Pedia localizar o Painel de Calls (CA-04) no código | Arquivado com achado: `/calls` usa a mesma tabela `leads`/função `salvarLeadDesk` já mapeada em Comercial — não é sistema paralelo |

## Documentos históricos adicionais (arquivados em 30/08/2026, "adicione todos os demais prompts anteriores")

Estes documentos foram enviados em datas anteriores à sequência confirmada acima. Nenhum foi implementado só por estar arquivado aqui — mesma regra do topo desta página. Onde o conteúdo já foi decidido pela sequência confirmada (P0/P1 agora, motor depois, Cockpit/visual por último), essa decisão prevalece sobre qualquer prioridade que o próprio documento reivindique para si.

| Documento | Contexto | Status |
|---|---|---|
| `P0-AUTORIDADE-OPERACIONAL-PERSISTENCIA-PROXIMA-ACAO.md` | P0 — autoridade operacional, persistência real, continuidade por próxima ação/tarefa | Substancialmente coberto pelo trabalho de persistência-com-verificação e decisão pós-salvamento entregue nesta janela (PR #31, #32, #33, #35); não conferido item a item contra este documento |
| `PROMPT-REVISAO-MOTORES-E-CASO-360.md` | Pede diagnóstico objetivo (não implementação) dos motores Marketing/Financeiro/Onboarding/Planejador/Pesquisa/Contratos/Caso 360 antes de qualquer feature nova | Parcialmente coberto pelo Mapa de Autoridade Admin — Pessoas, Caso 360, Contratos, Piloto Real, Painel Hoje, Comercial e Pesquisa já mapeados com evidência real; Marketing/Financeiro/Planejador ainda não auditados |
| `PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE.md` | Correção pontual — admin não conseguia abrir a visão do cliente | Não verificado se o bug ainda existe; precisa reprodução antes de qualquer ação |
| `PROMPT-VISAO-PRODUTO-ARQUITETURA-MOCKUPS-LANDINGS.md` (28/08/2026) | Visão de produto, arquitetura validada, mockups e landings — documento longo (882 linhas) | Não iniciado; entra na fase visual/Cockpit (item 3/4 da sequência confirmada), não antes |
| `PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md` | Eixo de comunicação completo (biblioteca de mensagens, onboarding por cenário, cadências, pós-venda, conteúdo/redes) | Explicitamente marcado pelo próprio documento como "somente após" Cliente→Caso→Proposta→Contrato→Financeiro estarem operáveis com dados persistidos — ainda não iniciado |
| `REVISAO-APLICACAO-DIA-A-DIA-2026-08-24.md` | Revisão externa (Perplexity, 24/08/2026) sobre se o Desk já é utilizável no dia a dia ou ainda é "contexto" | Documento de diagnóstico de terceiro, não prompt de execução; mantido como referência histórica do estado do produto naquela data |
| `PROMPT-REVERSAO-EMERGENCIAL-PLATAFORMA-OPERACIONAL.md` | Pedido de prioridade P0 absoluta para reverter gates/bloqueios/auditoria que teriam travado a operação | Documento histórico; não confirmado se ainda se aplica ao estado atual do produto — precisa confirmação explícita da proprietária antes de qualquer ação, especialmente qualquer item que toque auditoria ou controles de acesso |
| `PROMPT-REMOCAO-TOTAL-BARREIRAS-OPERACIONAIS-REJEITADO.md` | Ordem para remover **todo** mecanismo de bloqueio/aprovação da operação interna | **Rejeitado.** Conflita diretamente com a fronteira de segurança confirmada e mantida nesta operação (RLS, sessão, permissões por organização, auditoria em segundo plano nunca removidos; confirmação exigida para ações externas irreversíveis). Arquivado apenas para que a ordem não seja confundida com orientação ativa — nunca foi executado. |

## Atualização real — 2026-09-06 (6 dias sem revisão deste rastreador)

Este documento ficou parado em 31/08 enquanto o trabalho continuou. Abaixo, só o que tem evidência concreta (commit, query ao banco, ou teste) de 01/09 a 06/09 — sem reabrir os itens "não iniciado"/"não verificado" acima, que continuam exatamente como estavam até serem checados de novo.

| Fase/item afetado | O que mudou | Evidência |
|---|---|---|
| P2 — "Perfil institucional da contratada ainda não reutilizado automaticamente" | **Resolvido.** Nova origem `perfil_institucional` (confiança mais alta que Planejador) monta a qualificação completa da contratada (razão social, CNPJ, endereço, representante) a partir de `PERFIL_INSTITUCIONAL`, em vez de só o nome digitado à mão. Bug irmão também corrigido: salvar um campo sem alterar valor/origem derrubava `validado` para `a confirmar` a cada clique. | commits `48691bb`, `f268cd8`; valor e status confirmados ao vivo no banco em 06/09 |
| P2 — checklist jurídico do contrato | **Bug estrutural corrigido.** `montarChecklistJuridico` comparava `party_role`/`"contratada"`/`"contratante"` e `status`/`approved_at` — colunas que não existem (`contract_parties.role`, `contract_clause_overrides.requires_human_review`/`reviewed_at`). "Contratada qualificada" e mais 3 itens falhavam sempre, em qualquer contrato real, para todo mundo. | commit `639c781`; testes reescritos com schema real |
| P2 — contrato desconectado do Planejador | Causa raiz de "meus dados sumiram": `contract_case_parameters.contract_id` ficava `NULL` quando o contrato era criado pelo fluxo "Novo instrumento", nunca ligando ao registro que o Planejador já tinha preenchido. `criarInstrumento` agora liga automaticamente. | commit `54b6652` |
| Rótulos técnicos crus (`pending_contract`, `blocked_by_contract`) | Confirmado removido de toda UI — só existem nas duas listas de definição de enum, onde é correto existir. | commit `54b6652` |
| Financeiro/Faturas no celular | Tabela cortava a tela (só `overflow-x-auto`, sem alternativa). Vira lista de cards abaixo de 640px. | commit `01b6efc` |
| Cadeia planejador→proposta→OS | Servidor recusava a decisão da proprietária em 4 pontos (homologação de SKU em lote, promoção a cliente ativo, aprovação de prévia contratual, versão final de contrato) — corrigido pela própria proprietária. Depois, mais 3 correções da mesma cadeia: fim da cascata falsa e assinatura fixa, cadeia lê o Planejador Universal e para de exigir SKU do catálogo, campo de conteúdo deixa de impedir o salvar. | commits `2cba76b` (PR #90), `2fa8e89`, `05bb5fd`, `8f084df` |
| Ficha do caso da Ana | 14 requisitos de ativação validados manualmente em `case_activation_checks` desde 04/09 — a ficha continuava dizendo "Não elegível" porque `gatesAtivacaoFicha` lia só as colunas antigas de `crm_casos`, nunca os requisitos validados. Duas fontes de verdade na mesma tela. | commit `930ad8d`, com teste novo usando a linha real da Ana |
| Botão "Assumir e liberar mesmo assim" | Ficava desabilitado sem explicação quando o motivo tinha menos de 10 caracteres — parecia não responder ao clique. Agora avisa quantos caracteres faltam. | commit `de694ac` |
| Proposta da Ana (v1) | Estava com `status = "substituida"` sem nenhuma proposta v2 real que a tivesse substituído (`substituida_por_id = null`), apesar de `aprovada_em` já preenchido desde 17/08. Travava sozinha toda a "Cadeia de formalização". Restaurado para `aprovada`. | correção direta no banco, 06/09 |
| Taxonomia (`entity_labels`) do caso da Ana | 3 de 13 etiquetas ativas contradiziam dado já corrigido (núcleo familiar pendente, serviço do caso pendente, representação de menor pendente) — removidas (soft, com `removed_at`/`removed_by`). As outras 10 conferem com o dado real; 1 (`ESCOPO_PENDENTE`) ficou como decisão pendente, não removida. | soft-delete no banco, 06/09 |
| Autoria PR #87/#88 | Registrado formalmente: execução declarada da proprietária como Perplexity Computer; autoria de commit verificável (e-mail real) da própria proprietária em #88/#89/#90. | `docs/auditorias/varredura-integral-2026-09-05/09-autoria-e-responsabilidade.md` |

| Campos obrigatórios de conteúdo | Recontagem honesta dos 259 pontos de campo obrigatório no servidor: 168 validação de identificador (mantidos), 14 motivo de ação irreversível (mantidos), 77 eram só campo de conteúdo travando o salvar. Relaxados em 3 rodadas (259→214→38 gates reais), sempre preservando validação de identificador e conciliação financeira. | commits `8f084df`, `1d1e2c2`, `75a791b` |
| Paleta de marca | `styles.css` tinha a paleta aprovada sob `[data-paleta="anterior"]`, mas nenhum arquivo do app ativava esse seletor — o produto sempre renderizou com outra paleta, nunca a aprovada. Corrigido no `:root`, conferido pixel a pixel contra o PDF do mockup aprovado. Rota `/mockup` volta como referência visual isolada. | commit `a33e5f2` |

Produção e `main` conferidos ao vivo em 06/09: **mesmo SHA** (`71fe7b8`) nos dois — nada em produção que não esteja no `main`, nada pendente de subir.

## Pente fino por prompt — 2026-09-06

Pedido explícito da proprietária: não dizer "foi executado", mostrar onde em `main`. Cada linha abaixo tem arquivo/commit real, não memória de conversa.

| Prompt | O que pedia | Situação real, com evidência |
|---|---|---|
| `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | Cadeia única lead→cliente→caso→...→retenção, tudo lendo/gravando no mesmo caso | **Parcial.** Feito hoje: seção 3.4 (próxima ação prioritária única por caso) via RPC `proxima_acao_prioritaria`, exibida em `casos.$caseId.index.tsx` (commit `39eb58c`); seção 5 (formatação condicional do Painel de Calls) em `painel-calls.tsx`/`painel-calls.ts` (commit `7bd5a05`). A cadeia completa (Discovery→Diagnóstico→Protocolo→Legado) **não existe como motor único** — segue por módulos separados. |
| `PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE.md` | Botão "Abrir visão do cliente" em `/clientes/:id` e `/casos/:id`, rota `admin_preview`, 12 critérios de aceite | **Parcial, caminho diferente do pedido.** Existe `src/routes/_authenticated/app-cliente-como-pessoa.tsx` (link "Abrir visão do cliente" em `pessoas.$clienteId.tsx:474`), usa `dadosVivosDoPortalComoAdmin` com a mesma projeção sanitizada do cliente — não a rota `/clientes/:id/visao-cliente` nem o contrato `mode: admin_preview` exatos do prompt. Cobre **3 das 10 telas** do App Cliente (Jornada, Árvore, Radar) — o próprio código admite isso no comentário do arquivo. Os 12 critérios de aceite do prompt **não foram verificados um a um**. |
| `PROMPT-VISAO-PRODUTO-ARQUITETURA-MOCKUPS-LANDINGS.md` (882 linhas) | Visão de produto completa, arquitetura validada, mockups, landings | **Fatia pequena feita hoje, não o documento inteiro.** Commit `a33e5f2`: paleta de marca aprovada estava definida em `styles.css` mas nunca ativada (`[data-paleta="anterior"]` sem nenhum seletor real usando), corrigida no `:root`; rota `/mockup` restaurada como referência. É uma correção pontual de cor, não a "visão de produto/arquitetura/landings" completa que o documento pede. |
| `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` | Cockpit de indicadores acionáveis por grupo do Desk | **Não iniciado, confirmado agora.** Nenhum componente/rota de Cockpit encontrado em `src/routes` ou `src/lib` — só menções em fixtures de teste. Mesmo status de 31/08. |
| `PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md` | Biblioteca de mensagens ↔ onboarding/cadência, pós-venda, conteúdo/redes, como motor único | **Não iniciado como motor**, confirmado — o próprio documento pede que isso espere Cliente→Caso→Proposta→Contrato→Financeiro estarem operáveis primeiro. `message-library.functions.ts` foi tocado no commit `930ad8d` de hoje, mas dentro do escopo da ficha do caso (gates de uso de modelo), não da implantação do eixo completo. |
| `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` | Fase 1 mapear sem modificar (feita, PR #36) + Fase 2/3 motor `case_participants` | **Fase 2/3 confirmada como nunca iniciada** — busquei `case_participants` em todo `src/` e `supabase/migrations/`: zero ocorrências. Segue exatamente como em 31/08, pausada aguardando decisão da proprietária. |
| `PROMPT-REVISAO-MOTORES-E-CASO-360.md` | Diagnóstico objetivo de Marketing/Financeiro/Onboarding/Planejador/Pesquisa/Contratos/Caso 360 | **Mais coberto do que eu disse mais cedo hoje nesta conversa** — corrigindo isso agora: o próprio Mapa de Autoridade (linha 278) afirma que, ao final, "todas as áreas do pedido original... têm pelo menos um corte de evidência real", incluindo Marketing e Financeiro (linhas 128, 195-202) que uma leitura só do início do documento não mostra. **Planejador especificamente não aparece nomeado** no mapa — não encontrei evidência de que tenha sido auditado. |

## Pente fino — os 6 documentos restantes de `docs/politicas/`

Completando o pente fino: os outros 20 arquivos deste diretório já estavam cobertos nas seções acima (sequência confirmada, P0-P11, reconciliações, históricos). Faltavam estes 6:

| Documento | Classificação real | Situação |
|---|---|---|
| `politica-autoridade-operacional.md` | **Política ativa, aprovada, datada de 05/09** — não é um prompt pendente, é a regra em vigor ("pendência informa, não impede"). | Em grande parte já implementada pelos commits de hoje (PR #90, remoções de campo de conteúdo `8f084df`/`1d1e2c2`/`75a791b`) — esses commits são a execução desta política, não itens separados |
| `TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` (429 linhas) | Fonte de verdade de nomenclatura das 7+7 telas do mockup aprovado | Confirmado: **não implementado**, mas por decisão própria — é para a fase visual (P11), que o Prompt Mestre coloca por último, depois do operacional funcionar |
| `MATRIZ-AUTORIDADE-PERSISTENCIA-CONTINUIDADE-SEGURANCA-2026-08-31.md` | Diagnóstico ("em revisão"), não um prompt de execução — sintetiza outros documentos | Não reconferido item a item nesta rodada — precisaria de uma passada própria, não coberta aqui |
| `REGISTRO-PREVIEW-PR35-PRIORIDADES-2026-08-31.md` | Relatório sobre o preview específico da PR #35 | Superado — PR #35 já está mapeada em `05-matriz-pr-000-a-090.md` (mesclada) |
| `PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md` (380 linhas) | É o pente fino anterior a este, mesma natureza do que a proprietária pediu agora | Já refletido na linha 1 da "Sequência confirmada" acima |
| `REDESENHO-UNIFICADO-DESK-APP-CLIENTE-PESSOAS-2026-08-31.md` | Já chega arquivado com nota própria de 31/08, corrigindo contradições de 6 documentos anteriores na mesma sequência (ex.: "seis abas" nunca existiu — CA-UX-03 documenta 8 grupos reais) | Já era reconciliação, não pendência nova |

**Conclusão desta rodada completa de `docs/politicas/`:** além dos achados já registrados acima, não apareceu nenhum quarto item "nunca iniciado" novo. Os únicos zeros confirmados continuam sendo três: Cockpit, Eixo de Comunicação como motor único, e o motor `case_participants`.

## Autorização registrada em 06/09/2026 — unificação de pessoa e núcleos

A proprietária autorizou nesta conversa a Fase 2 de `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` (unificação de pessoa), que estava pausada desde 30/08 só por falta dessa decisão. Executado, reaproveitando entidades existentes em vez de criar a tabela hipotética `case_participants` do documento original (regra do próprio documento: "reaproveitar entidades existentes antes de criar novas"):

- **Achado**: das 3 fontes reais de pessoa por caso (`contract_parties`, `nucleo_membros`, `genealogical_person_profiles`), só `genealogical_person_profiles` nunca tinha vínculo com `clientes` — as outras duas já usavam `client_id`/`cliente_id` corretamente.
- **Migration** `20260906134500_unificar_pessoa_genealogica_com_cliente.sql`: adiciona `genealogical_person_profiles.client_id` (nullable, FK para `clientes`, aditiva — nenhuma tabela apagada ou renomeada).
- **Backfill do caso da Ana**: as 4 pessoas (Ana, Adair, Alice, Felipe) agora têm o mesmo `client_id` nas 3 fontes. `contract_parties.client_id` de Felipe também foi preenchido (estava nulo, único que faltava).
- **Núcleos duplicados**: detecção real rodada agora (mesmo cliente em mais de um núcleo; nomes de núcleo repetidos na mesma organização) — **zero duplicidade encontrada**, confirmando o resultado já registrado da Fase 1 (PR #36, 31/08). Não havia núcleo para unificar de fato.
- **Não feito nesta rodada**: estender esse vínculo para outros casos além do da Ana (piloto único, igual ao padrão do dia inteiro); Fase 3 (motor de sincronização automática entre as fontes) segue não iniciada.

Itens acima **não verificados de novo** nesta rodada (P4, P5, P6, P8, P9, P10, P11 e o resto de P1/P3) continuam com o status de 31/08 até serem checados — não foram tocados nem confirmados como ainda válidos.

## Correção de um erro meu — 06/09/2026, 2ª rodada

A proprietária reenviou `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` e `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` pela 7ª vez perguntando por que precisa repetir. Reabrindo os dois com consulta direta ao Supabase (não só busca de texto em `src/`), encontrei um erro real nas duas linhas acima marcadas "não iniciado"/"zero":

**O erro**: eu tinha procurado pelos nomes literais propostos nos documentos (`case_participants`, tabela de cadência) e, não encontrando esses nomes exatos, registrei "zero"/"não iniciado". Isso ignorou que o mesmo conceito já existe sob nomes em português, construídos antes desta sessão:

| Pedido do documento | Existe como | Evidência real (consulta direta ao Supabase em 06/09) |
|---|---|---|
| `case_participants` (papéis por pessoa no caso) | `case_members` + `case_dependents` | Schema com `cpf`, `rg`, `papel_no_caso`, `requerente`, `contratante`, `titular`, `dependente`, `representante_legal`, `cliente_id` — praticamente campo a campo igual ao proposto |
| `case_code_aliases` (alias de código legado) | `crm_casos.codigos_legados` + `ids_historicos` + `id_canonico_decidido`, e tabela `case_aliases` à parte | Caso da Ana: `codigos_legados = [CA-AUT-ANALUIZA-FAM-2026-001, CA-2026-ANA-001]`, `id_canonico_decidido = CA-CID-AT-FAM-2026-001` — já resolvido, com histórico preservado |
| Indicador "casos com código duplicado deve ser zero" | — | **Rodado agora contra os 7 casos reais ativos (excluindo dados de demo/teste): zero duplicidade.** Não é só o caso da Ana — nenhum dos 7 tem código duplicado. |
| "Próxima ação única por caso" (seção 3.4) | RPC `proxima_acao_prioritaria` | Já registrado na linha do pente fino anterior, confirmado de novo hoje: usado em `carregarCanonico` (`caso-canonico.functions.ts`), exibido em `casos.$caseId.index.tsx` |
| Cadência por evento → rascunho com aprovação humana (seção 8/11) | `registrarProximaAcao` grava em `case_alerts` (interno) e `communication_queue` (rascunho externo, `status: awaiting_approval`, nunca enviado sem aprovação) | Código real em `caso-canonico.functions.ts`, já em `main` |
| Onboarding único (seção 7) | `onboarding_checklist` + `onboarding_templates` | Tabelas existem e são lidas por `carregarCanonico`; não verifiquei ainda se cobrem as 13 etapas do documento uma a uma |
| CRM vivo (lead → cliente → caso) | `leads`, `lead_sources`, `conversion_events` | Tabelas existem; `lead_activities` (histórico de atividade por lead) **não existe** — gap real |

**O que isso muda**: as duas frases "não iniciado" e "Fase 2/3 confirmada como nunca iniciada" (linhas acima, registradas em rodadas anteriores desta mesma conversa) estavam **incompletas** — havia trabalho real feito que minha busca não alcançou. Não eram mentira deliberada, mas eram uma conclusão tirada de um método de busca errado (nome literal do documento, não o schema real), e é exatamente esse tipo de erro que gera a sensação de ter que repetir o mesmo prompt várias vezes: cada vez que eu procurava do jeito errado, respondia "zero" para algo que já existia.

**Achado real e novo, corrigido nesta rodada**: apesar de `case_members` existir e cobrir o conceito de `case_participants`, ele estava **vazio para o caso da Ana** — os 4 membros do núcleo (Ana, Adair, Alice, Felipe) nunca tinham sido espelhados lá, embora estivessem corretos em `nucleo_membros`. As duas tabelas nunca se falavam, mesmo padrão de fonte-paralela-desconectada do resto do dia. Corrigido agora:

- Nova função `sincronizarMembrosDoCaso(caseId)` em `caso-canonico.functions.ts` — genérica, funciona para qualquer caso, não só o da Ana; modo verificar/confirmar, nunca sobrescreve membro já existente.
- Antes de gravar, simulação pegou o mesmo bug já visto em `sincronizarPessoaDoCaso`: Felipe (dependente) compartilha `cliente_id` com Ana, e uma versão ingênua teria copiado o CPF dela para o registro dele. Corrigido no código antes de qualquer gravação real — dependente nunca herda documento do responsável.
- Executado para o caso da Ana (piloto): 4 membros criados em `case_members`, com os dados reais que já existiam — CPF da Ana e do Adair preenchidos, Alice e Felipe corretamente sem CPF (ela não tem CPF cadastrado em lugar nenhum; ele é dependente, nunca herda o da mãe). Log em `audit_logs`.

**Continua genuinamente não feito** (sem fingir que está): `case_code_aliases` como tabela separada do documento não foi criada porque `crm_casos` já cobre a mesma necessidade inline — decisão de reaproveitar, não pendência esquecida. Cockpit e Eixo de Comunicação como motor único continuam confirmados como zero (isso não mudou nesta checagem). `lead_activities` não existe. As 13 etapas do onboarding único e os 20 critérios de aceite ponta a ponta da seção 17 do prompt de motores **não foram verificados um a um** nesta rodada — isso exigiria rodar o fluxo completo com dado real, não uma consulta de schema.

## Regra de leitura

Estes documentos frequentemente se sobrepõem ou usam nomes de tabela/schema hipotéticos (ex.: `citizenship_cases`, `case_participants`, `onboarding_runs`) que **não necessariamente existem** no schema real do Supabase deste projeto. Antes de implementar qualquer parte deles, confirmar contra o schema real (`supabase/migrations/`) qual tabela existente já cobre a necessidade — a regra de todos os documentos é reaproveitar entidades existentes antes de criar novas.
