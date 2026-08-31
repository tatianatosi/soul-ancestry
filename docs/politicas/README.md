# Políticas e prompts de implementação — arquivo de referência

Cópias verbatim dos documentos de política/prompt enviados pela proprietária, guardadas aqui para que nada dependa de memória de conversa ou de contexto que pode ser resumido ao longo de uma sessão longa. Nenhum deles foi implementado só por estar aqui — este diretório é **arquivo de referência**, não registro de execução. O estado real de cada capacidade fica no Mapa de Autoridade Admin (`docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md`).

## Sequência confirmada pela proprietária (30/08/2026)

> "Concordo com a sequência: manter P0 e P1 operacionais agora; Cockpit, indicadores e revisão visual somente depois."

| Ordem | Documento | Status |
|---|---|---|
| 1 (agora) | `PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md` | P0/P1 efetivado nesta janela — persistência com verificação (PR #31), decisão pós-salvamento em Pessoa (PR #32), Piloto Real com pendências reais (PR #33), reconciliação Contratos PR#28×PR#32 + edição de partes/CPF-CNPJ (PR #35) |
| 1 (agora) | `PROMPT-AUTORIDADE-ADMIN-MAPA-DESK-APP.md` | Em andamento — Mapa de Autoridade Admin (PR #34) com Pessoas, Caso 360, Contratos, Piloto Real, Painel Hoje, Comercial e Pesquisa mapeados com evidência real; Marketing/Configuração/App Cliente ainda pendentes |
| 2 (depois do motor) | `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` | Fase 1 (mapear sem modificar) efetivada com dado real do Supabase (PR #36) — duplicidade de caso da Ana já estava resolvida antes desta sessão; achado real pendente: CNPJ institucional da Clube Ancestral em 3 lugares sem sincronia. Fase 2/3 (motor `case_participants`) aguardando decisão da proprietária — pausado por instrução dela em 30/08 |
| 2 (depois do motor) | `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | Não iniciado — CRM vivo, motor contratual, cadências por evento, indicadores reais |
| 3 (Cockpit) | `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` | Não iniciado — indicadores acionáveis por grupo do Desk |
| 4 (visual, por último) | `TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` | Não implementado — é a fonte de verdade de nomenclatura para quando a revisão visual começar. Os nomes das 7 telas do App Cliente e das 7 telas do Desk Intelligence não podem ser renomeados, fundidos ou substituídos sem aprovação explícita quando esse trabalho começar. |

## Prompt mestre — `PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md` (31/08/2026)

Documento novo, mais recente e mais completo que os anteriores desta lista — organiza os motores do produto em **P0 a P11**, cada um com objetivo, entidades, regras e critério de aceite, e absorve o conteúdo de `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md`, `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` e `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` numa única sequência. A partir de agora este é o documento de referência para a ordem dos motores — os três anteriores continuam arquivados, mas não devem mais ser tratados como pistas paralelas.

Regra do próprio documento: **"Cada fase precisa ser validada com dados reais antes da próxima"** — não pular fase.

| Fase | O que é | Status real em 31/08/2026 |
|---|---|---|
| P0 — Autoridade operacional e persistência | editar → salvar → confirmar linha → reler → refresh → reabrir | Em andamento, maior parte feita — `gravarComVerificacao`/`inserirComVerificacao` já é o padrão em Pessoas (PR #32), Piloto Real, Contratos (PR #35); Comercial/Financeiro ainda com ~12 de 14 funções sem esse padrão (achado do Mapa, não corrigido ainda) |
| P1 — Caso canônico, núcleo e participantes | um `case_id`, aliases preservados, matriz de reconciliação antes de qualquer merge | Fase 1 (mapear sem modificar) feita com dado real (PR #36) — zero duplicidade real encontrada, nada unido ainda. Fase de motor (`case_participants`) não iniciada — aguardando decisão da proprietária |
| P2 — Comercial, proposta, contrato e OS | conteúdo jurídico fora de "Dados técnicos", perfil institucional reutilizado automaticamente | Contrato parcialmente feito (PR #35: 6 ações reais, edição de CPF/CNPJ, correção do bug da parte contratante); perfil institucional da contratada **ainda não** reutilizado automaticamente de forma correta — é o achado do CNPJ em 3 lugares sem sincronia, registrado e pausado por decisão da proprietária |
| P3 — Tarefas, próxima ação e cadência | decisão de tarefa não bloqueia salvamento; idempotência por `case_id + origem + referência` | Parcial — decisão de tarefa existe em Pessoa (PR #32) e Caso 360, mas sem a chave de idempotência descrita aqui; ainda cria nova tarefa a cada clique, não reaproveita |
| P4 — Onboarding real | um onboarding por `case_id`, motor único parametrizado | Não iniciado — achado dos **3 sistemas de onboarding paralelos** (Mapa de Autoridade Admin) é exatamente o problema que esta fase resolve |
| P5 — Pesquisa, fontes, documentos e evidências | Não iniciado — achado do **3º sistema paralelo de evidências** (Painel Hoje/Comercial/Pesquisa, PR #34) é o mesmo problema |
| P6 — Micro-entregas, App Cliente e portal | Não iniciado — App Cliente ainda não auditado no Mapa |
| P7 — Catálogo, financeiro e comercial | Não iniciado além do que já existe em Comercial (auditado, não corrigido) |
| P8 — Marketing, conteúdo e conversão | Não iniciado — Marketing ainda não auditado no Mapa |
| P9 — Cockpit, indicadores e alertas | Não iniciado — é o prompt do Cockpit, explicitamente adiado pela proprietária |
| P10 — Integrações externas e escala | Não iniciado, nem deve começar antes do fluxo interno estar confiável (regra do próprio documento) |
| P11 — Revisão visual e marca | Não iniciado — pré-requisito do próprio documento ("Ana operável, onboarding real, dados sobrevivem a refresh") ainda não está completo |

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

## Regra de leitura

Estes documentos frequentemente se sobrepõem ou usam nomes de tabela/schema hipotéticos (ex.: `citizenship_cases`, `case_participants`, `onboarding_runs`) que **não necessariamente existem** no schema real do Supabase deste projeto. Antes de implementar qualquer parte deles, confirmar contra o schema real (`supabase/migrations/`) qual tabela existente já cobre a necessidade — a regra de todos os documentos é reaproveitar entidades existentes antes de criar novas.
