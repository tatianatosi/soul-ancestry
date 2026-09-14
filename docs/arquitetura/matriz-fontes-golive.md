# Matriz de fontes do go-live — Desk + App Cliente

- **Status:** registro técnico (somente leitura do produto atual)
- **Versão:** v1.0
- **Data:** 2026-09-14
- **Contratos únicos:** prancha visual v3 e `2026-09-14-matriz-dados-graficos-e-canos-desk-app.md`
- **Escopo deste arquivo:** mapear, superfície por superfície, rota, componente, fonte real já disponível, filtros obrigatórios, o que pode ser ligado agora, o que deve permanecer vazio e o cano Desk → App.
- **Limites respeitados:** nenhuma tela, dado, tabela, função, migration, RLS, publicação ou deploy criado nesta etapa. Nenhum código alterado.

## Fonte única de leitura

Todas as superfícies do shell go-live leem do mesmo servidor autenticado `obterCasoGoLive` (`src/lib/golive.functions.ts`), consumido no cliente por `useGoLive()` (`src/components/golive/dados.ts`). Não há segunda fonte, cache paralelo ou mock.

Filtros aplicados no servidor, sempre por identificador — nunca por texto ou nome:

| Filtro | Onde é aplicado |
|---|---|
| `organization_id` | resolução da organização ativa da sessão antes de qualquer leitura |
| `case_id` | caso canônico `CA-CID-AT-FAM-2026-001` em todas as listas dependentes |
| `client_id` / titular | acessos de portal e identidade da pessoa principal |
| arquivado / excluído | helper `limpar()` remove registros arquivados ou marcados como excluídos |

Observação de dívida declarada: a consolidação de identidade compara **nome normalizado** apenas para *rotular* duplicados como legado fora do piloto. Isso não é filtro de dados operacionais — nenhum card, gráfico ou projeção depende dessa comparação.

Campos já expostos pela fonte: `identidade`, `caso`, `plano`, `pessoas`, `documentos`, `microentregas`, `publicados`, `contratos`, `faturas`, `lead`, `propostas`, `escopo`, `ordensServico`, `pesquisa`, `hipoteses`, `fontes`, `evidencias`, `achados`, `portal.acessos`, `portal.emailsAutorizados`, `equipeTotal`.

Componentes gráficos existentes: `Barras` e `Escada` (`src/components/golive/graficos.tsx`). Não existem hoje donut, linha temporal, matriz de dispersão genérica nem radar reutilizável — o radar é desenhado dentro da própria rota.

## Desk — 11 superfícies

| # | Superfície | Rota atual | Componente/template | Fonte real disponível | Filtros obrigatórios | Pode ligar agora | Deve ficar vazio | Cano Desk → App |
|---:|---|---|---|---|---|---|---|---|
| 1 | Hoje | `/golive` | `golive.index.tsx` + `GoLiveShell`, `FaixaIdentidade`, `Escada`, `Acao` | `caso`, `plano`, `microentregas`, `publicados` | org, case, arquivado | KPIs de ações (com/sem próxima ação, prazo vencido, aguardando externo) a partir de `caso`/`plano`/`microentregas`; escada de etapas | Ritmo de entregas por semana (não há série histórica de `published_at` suficiente); donut de prioridade da carteira (piloto de um caso) | Etapa e próximo passo publicados alimentam Home do App |
| 2 | Comercial / CRM Vivo | `/golive/comercial` | `golive.comercial.tsx` + `Barras` | `lead` (estágio, origem, call agendada/realizada, discovery) | org, case, arquivado | Funil por estágio do lead; origem/canal do lead; saúde do lead (sem dono, sem próxima ação) | Série temporal de leads e conversão por período (carteira de um lead só) | Nenhum — comercial não projeta para o cliente |
| 3 | Kanban operacional | `/golive/kanban` | `golive.kanban.tsx` + `Barras`, `Acao` | `microentregas`, `plano`, `caso` | org, case, arquivado | Contagem por coluna de prazo; distribuição por fase da microentrega | Carga por responsável (microentrega não carrega responsável na leitura atual) | Indireto: próxima ação vira "próximo passo" na Home/Jornada |
| 4 | Caso 360 | `/golive/caso` | `golive.caso.tsx` + abas internas, `Acao` | `caso`, `plano`, `pessoas`, `documentos`, `microentregas`, `publicados` | org, case, arquivado | Progresso de jornada por marco do plano; contagem de documentos por estado; estado das microentregas | Linha do tempo unificada de eventos (não há tabela de eventos lida pela fonte); donut de origem do sinal (campo de origem não é lido) | Revisão → aprovação → projeção sanitizada → Home, Jornada, Documentos, Legado |
| 5 | Pessoa 360 | `/golive/pessoa` | `golive.pessoa.tsx` | `identidade` (pessoa principal, núcleo, membros, responsável, status, legado) | org, case, client | Papel no núcleo, vínculos declarados, conflito "revisar identidade" | Completude por domínio e confiança de dados (não há marcação campo a campo na fonte) | Nomes e vínculos autorizados alimentam a Árvore |
| 6 | Radar & Matrizes | `/golive/radar` | `golive.radar.tsx` (SVG próprio) | `caso`, `plano`, `microentregas`, `documentos`, `evidencias` | org, case, arquivado | Radar individual de 4 eixos e matriz urgência × prontidão com um ponto por caso | Ranking de carteira e comparação entre casos (piloto tem um caso) | Radar interno → radar sanitizado do App (a conversão para 6 dimensões ainda não existe) |
| 7 | Pesquisa | `/golive/pesquisa` | `golive.pesquisa.tsx` + `Barras`, `Acao` | `pesquisa`, `hipoteses`, `fontes`, `evidencias`, `achados` | org, case, arquivado | Cobertura por tipo de fonte; evidências por estado; achados por confiança/validação; fila editorial | Produção por semana (as leituras não trazem data de criação normalizada) | Achado aprovado e publicável → Legado e Jornada |
| 8 | Financeiro | `/golive/financeiro` | `golive.financeiro.tsx` + `Acao` | `faturas`, `contratos`, `propostas` | org, case, arquivado | Valor contratado, aberto, vencido e pago; situação das faturas por estado | Recebimento por mês (pagamentos não são lidos com data de confirmação na fonte) | Nada por padrão; valor interno não vai ao cliente |
| 9 | Jurídico & Contratos | `/golive/juridico` | `golive.juridico.tsx` | `propostas`, `escopo`, `contratos`, `ordensServico` | org, case, arquivado | Pipeline de formalização por estado; itens de escopo que exigem revisão humana; instrumentos assinados versus pendentes | Prazos e alertas de risco (não há campo de prazo nos instrumentos lidos) | Somente estado simples, se autorizado |
| 10 | Pessoas & Famílias | `/golive/pessoas` | `golive.pessoas.tsx` + `Acao` | `identidade.nucleoMembros`, `pessoas` | org, case, nucleo | Composição do núcleo por papel; relações declaradas | Cobertura por geração G1–G5 (geração não existe na leitura atual) | Pessoas e vínculos aprovados → Árvore |
| 11 | Portal / Configuração Master | `/golive/portal` e `/golive/configuracoes` | `golive.portal.tsx`, `golive.configuracoes.tsx` + `Acao` | `publicados`, `microentregas`, `portal.acessos`, `portal.emailsAutorizados`, `equipeTotal` | org, case, client/titular | Publicações por estado; acessos por situação; e-mails autorizados por estado | Cobertura por aba do App (a projeção não declara aba de destino) | Aprovar/publicar/despublicar e convite por link mágico |

## App Cliente — 7 abas

Espelho interno em `/golive/app` (`golive.app.tsx`), com as abas exatas `Home · Jornada · Radar · Árvore · Documentos · Legado · Conta`.

| # | Aba | Componente | Fonte real disponível | Filtros obrigatórios | Pode ligar agora | Deve ficar vazio | Origem Desk |
|---:|---|---|---|---|---|---|---|
| 1 | Home | seção de `golive.app.tsx` | `publicados`, `plano` | case, titular, publicado | Etapa atual, próximo passo e última publicação | Progresso percentual (não há escala publicada) | Caso 360 / Hoje |
| 2 | Jornada | idem | `plano`, `publicados` | case, titular, publicado | Stepper de marcos e linha do tempo de publicações | Previsão de data futura | Caso 360 / planejador |
| 3 | Radar | idem | `publicados` do tipo radar | case, titular, publicado | Estado textual sanitizado | Radar de 6 dimensões (a projeção de 6 eixos não existe) | Radar interno |
| 4 | Árvore | idem | `identidade.nucleoMembros` aprovados | case, titular, relação aprovada | Pessoas e vínculos declarados | Gerações G1–G5 e nós "em pesquisa" | Pessoas & Famílias |
| 5 | Documentos | idem | `documentos` com `liberadoCliente` | case, titular, liberado | Solicitados, em revisão e liberados | Download direto de arquivo interno | Caso 360 / Jurídico |
| 6 | Legado | idem | `achados` publicáveis e `publicados` | case, titular, publicado | Conteúdo publicado e descobertas aprovadas | Coleções (Cadernos/Relatórios/Narrativas não existem como tipo) | Pesquisa |
| 7 | Conta | idem | `identidade`, `portal.acessos` | case, titular | Titular, participantes autorizados e situação de acesso | Plano, preço e histórico de avisos | Portal / Configuração Master |

## Lacunas reais (sem redesign)

| # | Lacuna | Onde aparece | Natureza | Ação mínima futura |
|---:|---|---|---|---|
| 1 | Sem componente donut ou linha temporal | Hoje, Financeiro, Caso, Pessoas, Portal | visual | Criar os dois componentes em `graficos.tsx` |
| 2 | Sem série temporal de publicação | Hoje, Pesquisa | dado | Expor data de criação/publicação normalizada na fonte |
| 3 | Sem responsável por microentrega | Kanban | dado | Expor responsável na leitura das microentregas |
| 4 | Sem eventos de caso unificados | Caso 360 | dado | Ler a linha do tempo do caso já existente no banco |
| 5 | Sem origem do sinal | Caso 360 | dado | Expor a origem do evento/ação |
| 6 | Sem completude campo a campo da pessoa | Pessoa 360 | dado | Definir os domínios e expor o que está confirmado |
| 7 | Sem geração familiar | Pessoas & Famílias, Árvore | dado | Expor a geração da relação declarada |
| 8 | Radar de 6 dimensões não existe como projeção | Radar do App | cano | Definir a conversão dos 4 eixos internos em 6 estados publicáveis |
| 9 | Projeção não declara aba de destino | Portal, todas as abas | cano | Registrar o destino no momento da publicação |
| 10 | Pagamentos não são lidos com data de confirmação | Financeiro | dado | Expor pagamentos confirmados na fonte |
| 11 | Prazo dos instrumentos não é lido | Jurídico | dado | Expor prazo/vencimento dos instrumentos |
| 12 | Prova autenticada ao vivo pendente | todas | prova | Sessão de equipe e sessão de cliente no mesmo ambiente |
