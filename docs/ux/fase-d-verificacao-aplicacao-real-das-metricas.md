# Fase D — Verificação de aplicação real das métricas (não só contexto)

Versão 1.0 — 24/08/2026. Continuação da Fase C. Método: para cada grupo,
abri o arquivo de rota real e conferi se existe `useQuery`/`useServerFn`
ligado a um cartão numérico visível, ou se o que existe é só declaração em
documento/biblioteca. "Aplicado" = número real, calculado, na tela que a
equipe abre no dia a dia. "Só contexto" = existe fórmula, rota ou registro,
mas nenhum cartão com aquele número aparece em lugar nenhum hoje.

## 1. Resultado por grupo (8 grupos do menu)

| Grupo | O que o documento `CA-UX-03_Metricas_Canonicas.md` promete | O que a tela realmente mostra hoje | Veredito |
|---|---|---|---|
| **Hoje** (`/painel`) | 5 métricas: fila, vencidos, exceções sem dono, sinais de atenção, prioridade | `CARDS_HOJE` (`painel-dia.ts:309-321`) tem **8 cartões reais** com dado ao vivo (ações vencidas, ações de hoje, leads sem responsável, propostas sem follow-up, contratos enviados, pagamentos aguardados, onboardings pendentes, documentos aguardados) — nenhum bate literalmente com os 5 nomes do documento | **Aplicado, mas o teto de 5 não foi respeitado nem os nomes batem com o combinado** |
| **Comercial** (`/conversao`) | 5 métricas: leads novos, Discovery agendada×realizada, propostas em aberto, follow-ups vencidos, leads sem próxima ação | "Saúde comercial" tem 5 cartões reais (`conversao.tsx:102-113`), mas só 2 dos 5 batem com o documento (follow-ups vencidos, leads sem próxima ação); os outros 3 (propostas sem resposta, aceite verbal sem confirmação, inconsistências) não estão no documento | **Aplicado, conteúdo diferente do combinado** |
| **Casos** (`/casos`) | 5 métricas: casos ativos, tarefas atrasadas, microentregas atrasadas, exceções abertas, casos sem responsável | Tela é uma tabela (`EntidadeCrud`) + busca por código + `PainelFormalizacao`. **Nenhum cartão numérico dessas 5 métricas existe na tela** | **Só contexto — nada aplicado** |
| **Pesquisa** (`/pesquisa-modulo`) | 5 métricas: casos em pesquisa, evidências pendentes, consultas em aberto, achados aguardando confirmação, pendências de privacidade | Tela é formulário de criação/scan + lista, sem grade de cartões numéricos no topo | **Só contexto — nada aplicado** |
| **Contratos e financeiro** (`/contratos`, `/financeiro`) | 5 métricas: contratos aguardando assinatura, OS bloqueadas por divergência, SKUs pendentes de homologação, faturas em aberto, escopo sem origem homologada | `/contratos` tem 4 cartões reais (`contratos.index.tsx:80-83`: bloqueios abertos, revisão humana pendente, anexos ausentes, OS impedidas por gate) e `/financeiro` tem um bloco recolhido "Realidade financeira" com caixa/CAC/CPL/ROI reais. **Nenhum dos rótulos bate literalmente com os 5 do documento**, embora o assunto se sobreponha | **Aplicado, taxonomia diferente da combinada** |
| **Cliente** (`/acessos-portal`) | 5 métricas: acessos ativos, solicitações em aberto, entregas aguardando publicação, tickets abertos, aberturas/downloads | Tela é gestão de convites e e-mails autorizados (formulários + listas), sem cartão numérico de nenhuma das 5 | **Só contexto — nada aplicado** |
| **Governança** (`/governanca/indicadores`) | 5 métricas: itens jurídicos pendentes, inconsistências críticas, decisões no período, completude pendente, integrações não confirmadas | `/governanca/indicadores` é uma **tabela de catálogo estático** (17 indicadores `IND-XXX`, ver seção 2) — não um painel com números ao vivo. Quem tem cartão real com contagem é `/qualidade` (`PainelQualidade`, `painel.tsx:110-120`, grade de 4 e de 3 colunas, dado ao vivo) | **Existe número real, mas não onde o documento diz — vive em `/qualidade`, não em `/governanca/indicadores`** |
| **Administração** (`/equipe`) | 5 métricas: overrides da proprietária, usuários ativos, papéis sem atribuição, ações externas aguardando confirmação, pendências de verificação | Tela é convite/gestão de membros (formulário + lista), sem cartão numérico de nenhuma das 5 | **Só contexto — nada aplicado** |

**Resumo: de 8 grupos, 3 têm cartões reais e ao vivo na tela do grupo (Hoje,
Comercial, Contratos e financeiro), mas nenhum dos 3 bate com os nomes
combinados no documento canônico. Os outros 5 grupos (Casos, Pesquisa,
Cliente, Governança, Administração) não têm nenhum cartão numérico
correspondente às métricas que o próprio documento diz que deveriam
existir.**

## 2. O catálogo `/governanca/indicadores` se autoavalia — e o resultado é revelador

Esse catálogo (`src/lib/indicadores-governanca.ts`) é o único lugar do
sistema onde cada indicador declara seu próprio status de apuração. Em 17
indicadores registrados:

| Status | Quantidade | Significado |
|---|---|---|
| **Apurado** | 7 (41%) | Número real, calculado, com fonte de dado presente |
| **Parcial** | 4 (24%) | Fórmula roda, mas parte dos casos fica fora por falta de dado (ex.: lead sem origem declarada) |
| **Sem dados suficientes** | 6 (35%) | A fórmula existe no código, mas hoje não há dado nenhum para calcular — não é bug, é ausência de lançamento operacional |

Os 6 "sem dados" são majoritariamente marketing/aquisição: CPL, CAC, ROI de
mídia (`IND-MKT-01/02/03`), ativação em 48h (`IND-JOR-01`), tempo até valor
(`IND-JOR-02`) e conversão por marco (`IND-COM-02`). O código está pronto
(`financeiro.tsx:292-315` calcula CPL/CAC/ROI ao vivo e mostra "Sem dados
suficientes" honestamente) — falta **lançar investimento de mídia por
canal** (`marketing_investments`) para esses números aparecerem. Isso não é
uma correção de código; é uma tarefa operacional (alguém precisa registrar
quanto foi gasto em cada canal).

## 3. Por que a sensação de "só contexto" é factualmente correta

Três taxonomias de métrica coexistem hoje sem se falar:

1. `CA-UX-03_Metricas_Canonicas.md` — lista aspiracional de 5 por grupo, documento de planejamento.
2. `src/lib/indicadores-governanca.ts` — 17 códigos `IND-XXX`, com status próprio, exibidos como tabela em `/governanca/indicadores`.
3. Os cartões que cada tela realmente decidiu mostrar (`CARDS_HOJE`, cartões de `/conversao`, `/contratos`, `/qualidade`) — construídos independentemente, com nomes próprios.

Nenhuma das três foi usada para gerar as outras. Resultado: é possível abrir
o documento (1), ler que existe uma métrica "Casos ativos" para o grupo
Casos, e nunca encontrá-la em tela nenhuma — porque ela nunca foi
implementada como cartão, só descrita. Ao mesmo tempo, o Painel Hoje tem 8
cartões reais funcionando todo dia que **não estão em nenhum dos três
documentos** com esse nome exato.

## 4. O que está de fato confiável hoje (para uso diário)

Cartões com dado real, ao vivo, testado neste estudo por leitura de código:

- `/painel` — 8 cartões do dia (`CARDS_HOJE`) + fila priorizada + exceções + cadência.
- `/conversao` — funil de eventos, saúde comercial (5 filas), estado por lead.
- `/contratos` — 4 cartões de bloqueio/revisão/anexo/OS.
- `/financeiro` — caixa realizado, CAC/CPL/ROI (quando houver dado de mídia lançado).
- `/qualidade` — contagem por severidade e resumo de checklist.
- `/metricas` — leads por origem, entrada semanal, calls/Discovery, casos por nacionalidade/via, pendência documental.

O restante (Casos, Pesquisa, Cliente, Administração como grupos, e o
catálogo de `/governanca/indicadores` como um todo) é **documentação e
intenção**, não aplicação — hoje é seguro dizer que **não mudou nada na
prática nesses cinco grupos**, o que confirma diretamente a sua impressão.

## 5. Proposta (sem implementar)

1. Escolher **uma única fonte de verdade de nomes de métrica** entre as
   três taxonomias (recomendo `indicadores-governanca.ts`, por já ter
   status de apuração) e aposentar as outras duas como redundantes.
2. Implementar de fato os cartões que faltam nos 5 grupos sem nenhum hoje
   — só depois de decidir (1), para não criar uma quarta taxonomia.
3. Ajustar `CARDS_HOJE` para 5 itens (ou atualizar o documento para refletir
   os 8 reais) — hoje documento e código divergem em número, não só em nome.
4. Tratar os 6 indicadores "sem dados suficientes" como pendência
   **operacional** (lançar investimento de mídia por canal), não como
   tarefa de desenvolvimento.

## 6. Aceite necessário

Aprovar: (a) qual das três taxonomias vira única fonte de verdade; (b) se
vale a pena implementar cartões nos 5 grupos que hoje não têm nenhum, ou se
o padrão atual (tabela/CRUD sem cartão) é aceitável para esses grupos; (c)
quem lança os dados de investimento de mídia para destravar CAC/CPL/ROI.
