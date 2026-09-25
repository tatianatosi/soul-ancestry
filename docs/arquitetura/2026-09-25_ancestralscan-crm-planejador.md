# P10 — Motor de Triagem AncestralScan → CRM Vivo/Mesa Discovery → Planejador

## Adendo (P11, 25/09/2026) — contexto histórico real do AncestralScan

A Proprietária confirmou: o AncestralScan é parte real do Clube
Ancestral, mas hospedado num projeto Lovable de terceiro (quem construiu
o site institucional) — sem acesso às tabelas dele nesta sessão. Reli o
histórico recuperado (`docs/evolucao/recuperados/fontes-primarias/02_AUDITORIA_MAE_Clube_Ancestral.md`,
`docs/evolucao/recuperados/prompts-lovable-2026-08-31/CLUBE_ANCESTRAL_PRODUCTS_SKU.md`)
para enriquecer o contexto, sem mudar o desenho já publicado:

- AncestralScan™ é real, público, ~5 minutos, 10 países, gratuito
  ("CAMADA 1: ENTRADA" da arquitetura mapeada em 18/08/2026).
- **Achado que valida o desenho conservador do P10**: o histórico descreve
  que a ferramenta pública, hoje, "calcula radar de elegibilidade... e
  exibe limite geracional, via administrativa/judicial e prazo médio"
  diretamente ao visitante — mais do que as regras internas do Clube
  Ancestral permitiriam fazer aqui dentro (nunca prazo automático, nunca
  elegibilidade confirmada). Por isso `PayloadTriagemAncestralScan`
  guarda qualquer score do Scan só em `scoresOrientativos` — nunca em
  `elegibilidade_preliminar` ou qualquer campo que o Desk trate como
  fato. O Clube Ancestral não controla nem endossa o cálculo que a
  ferramenta de terceiro exibe publicamente.

Nenhuma mudança de código decorre deste adendo — é confirmação de que o
contrato já publicado (Camada A) estava correto.

## Autorização

Autorização explícita da Proprietária, 25/09/2026: "EXECUTE EM MAIN".
Objetivo: construir o motor de triagem reutilizando os motores existentes,
sem segundo CRM, sem segundo Planejador, sem motor jurídico de 13 tabelas,
sem máquina que prometa cidadania. O AncestralScan público é orientativo:
sugere, nunca confirma elegibilidade/via/produto/preço/contrato/cobrança/
acesso ao App/abertura automática de caso.

## Achado que precede a execução — "AncestralScan" não existe como código neste repositório

Antes de construir qualquer coisa, procurei o código real do AncestralScan
(pedido explícito da autorização, Camada A item 1). **Não existe** — o
nome só aparece em documentos arquivados/recuperados e num módulo de
proposta nunca implementado (`src/lib/ca06-catalogo-operacional.ts`,
14/08/2026, ainda rotulado "PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA"). É,
com grande probabilidade, uma ferramenta do site institucional
(`clubeancestral.com.br`), fora deste app e fora do escopo desta sessão
(`tatianatosi/soul-ancestry`).

Consequência de desenho: como não há código real para "extrair a
taxonomia de entrada", o contrato do payload (Camada A) segue
literalmente os campos que a própria autorização já especificou —
nenhum campo foi inventado. E como não existe endpoint/app do Scan neste
repositório, a Camada A é uma **importação manual por staff** (mesmo
padrão da importação Placego por CSV, seção 4 do CA-DECISOES-CANONICAS —
sem API/webhook contínuo), nunca um endpoint público não autenticado.

## Fontes canônicas reutilizadas (nenhuma duplicada)

- `citizenship_tracks` (via `listarTrilhasJuridicas`) — país/via/status/lifecycle.
- `leads` — schema já tinha praticamente todos os campos declarativos que
  o Scan precisa (`nacionalidades_interesse`, `geracao_ascendente`,
  `localidades_conhecidas`, `documentos_chave`, `consentimento_status`/
  `consentimento_versao_aviso`/`consentimento_em`, `origem`,
  `trilha_referencia_id`) — confirmado por leitura direta do schema antes
  de escrever qualquer linha nova.
- `salvarLeadDesk`/`executarHandoffDiscovery`/`podeExecutarHandoffDiscovery`
  — não alterados; o handoff continua sendo o único caminho para
  cliente/caso, independente de o lead ter vindo do Scan.
- O padrão "aceitar achado só se o campo estiver vazio, nunca sobrescreve
  escolha humana" já existia em `painel-calls.tsx#aplicarAchado`
  (corte 6 do reset, 24/09/2026, para achados de país por WhatsApp) — a
  mesma regra foi reaplicada aqui para sugestão de trilha por Scan, sem
  duplicar a lógica.
- `audit_logs` (entidade `"lead"`) — mesma trilha que `salvarLeadDesk`/
  `trilhaDoLead` já usam; lead criado a partir de uma triagem aparece na
  mesma trilha de auditoria de qualquer outro lead.

## Camada A — contrato de triagem pública

`src/lib/ancestralscan-triagem.ts` (puro): `PayloadTriagemAncestralScan`
com exatamente os campos da autorização (versão, data/hora,
origem/campanha, consentimento + versão + data, países declarados,
geração declarada, localidade do ascendente, documentos declarados,
respostas públicas versionadas, alertas públicos, scores orientativos —
sempre em campo separado de qualquer decisão interna). `validarTriagem`
exige só o mínimo auditável (versão, data, consentimento).

Nova tabela `ancestralscan_triagens`
(`supabase/migrations/20260925160000_ancestralscan_triagens.sql`):
registro versionado e auditável, RLS por organização
(`is_org_member`/`can_write`, mesmo padrão de toda tabela nova desta
sessão), `consentimento_status` usa o **mesmo vocabulário** de
`leads.consentimento_status` (`nao_solicitado`/`pendente`/`concedido`/
`recusado`) — nunca um vocabulário novo à parte. `lead_id` só é
preenchido quando um humano decide criar/vincular um lead (Camada B).

`importarTriagemAncestralScan` (`ancestralscan-triagem.server.ts`): staff
importa a resposta já registrada no Scan público (manual — nunca cria
dado sozinho, nunca é chamado por um webhook).

## Camada B — ponte para CRM Vivo

`criarLeadDaTriagem`: só executa por chamada explícita (nunca automática
a partir da importação). Usa o mesmo padrão de escritor canônico já
estabelecido nesta sessão (`inserirComVerificacao`, grava e relê) e grava
a mesma trilha de auditoria (`acao: "criar_lead"`) que `salvarLeadDesk`
grava — consistência de trilha entre os dois caminhos de criação de lead.
`mapearTriagemParaLead` é o único de-para: nunca escreve
`elegibilidade_preliminar`, `trilha_referencia_id`, `produtos_recomendados`
nem `confianca_triagem` — só o que a pessoa declarou.

Mesa Discovery (`src/components/crm/triagem-ancestralscan.tsx`, montado em
`painel-calls.tsx`): cartão "Contexto declarado no AncestralScan" — país,
geração, documentos, alertas —, explicitamente rotulado orientativo, some
por completo quando o lead não veio do Scan (a maioria). Nenhum campo do
Scan é duplicado numa segunda ficha — o cartão lê a mesma triagem, nunca
copia os valores para uma tabela nova.

## Camada C — sugestão explicável de trilha

`sugerirTrilhasDaTriagem` (pura): cruza países declarados × trilhas ativas
(`citizenship_tracks`, via `sugerirTrilhasParaLead`), devolve lista com
`trackId`, país/via, `sinais` (o que contribuiu), `perguntasFaltantes`,
`alertasPublicos` e `estado` (`sugerida`/`a_confirmar`/`descartada`/
`confirmada_humana`) — nunca "elegível", "inelegível", "direito
confirmado" ou percentual jurídico (testado explicitamente).

`aceitarSugestaoTrilha`: grava `trilha_referencia_id` **só se ainda
estiver vazio** — a mesma regra de `aplicarAchado`, aplicada de forma
independente aqui porque a Camada C tem sua própria origem de dado
(Scan, não achado de WhatsApp) e sua própria auditoria
(`aceitar_sugestao_trilha_scan`). `rejeitarSugestaoTrilha` exige motivo,
grava só em `audit_logs`, nunca cria ou altera lead/caso.

## Camada D — handoff para caso e Planejador

Nenhum código alterado: `executarHandoffDiscovery`/
`podeExecutarHandoffDiscovery` continuam exatamente como eram. Um lead
com `scan_triagem_id` preenchido passa pelos mesmos gates de qualquer
outro lead antes de virar caso — o Scan nunca cria `case_plans`,
pesquisa ou hipótese por conta própria (confirmado por teste: nenhuma
dessas tabelas é referenciada em `ancestralscan-triagem.server.ts`).
Depois da conversão, a trilha já confirmada (se aceita na Camada C)
segue como contexto real para o Planejador, sem duplicar registro —
`case_plans`/`citizenship_tracks` continuam sendo a fonte, como já eram.

## Segurança e comunicação

- Nenhum e-mail/WhatsApp/proposta/contrato/cobrança/acesso ao App é
  criado por este corte.
- Nenhuma rota do App/Portal importa `ancestralscan-triagem` (testado).
- Nenhuma regra jurídica nova: `versioned_legal_rules`/
  `legal_reference_milestones` continuam a única fonte de regra por
  trilha, depois da escolha humana.

## Sobre o mapa de motores

`src/lib/motores-tabelas.ts` é explicitamente escopado aos "Motores
primordiais P0–P11" de um prompt externo específico
(`PROMPT-MESTRE-MOTORES-A-IMPLANTAR`) — uma enumeração fechada, não um
registro geral de features. Este corte não é um dos P0–P11 daquele
prompt, então não foi adicionado ali (evitar forçar um item novo numa
lista que o próprio arquivo declara fechada). Este documento é o
registro correspondente, no mesmo padrão de todo de-para desta sessão.

## Verificação

`tsc --noEmit` (limpo, só o erro pré-existente de `portal/index.tsx`), 15
testes novos (`p10-ancestralscan-triagem-2026-09-25.test.ts`) cobrindo os
9 comportamentos obrigatórios da autorização, suíte completa (mesma
baseline pré-existente de 7 arquivos/11 testes, nenhuma regressão nova),
`vite build` limpo. Migration aplicada e registrada em
`schema_migrations`.

## Prova Lovable pós-push

1. Importar uma triagem de teste (via chamada direta à função ou script) →
   conferir que nenhum lead é criado sozinho.
2. Criar um lead a partir dela (ação humana) → abrir `/calls`, selecionar
   o lead → conferir o cartão "Contexto declarado no AncestralScan" com
   país/geração/documentos.
3. Conferir a sugestão de trilha explicável (sinais, perguntas em aberto)
   → clicar "Aplicar esta trilha" → conferir que preenche
   `trilha_referencia_id` só se estava vazio.
4. Com uma trilha já escolhida manualmente antes, conferir que a sugestão
   mostra "sugestão não sobrescreve" e o botão de aplicar some.
5. Rejeitar uma sugestão com motivo → conferir na trilha de auditoria do
   lead (`TrilhaDoLead`, mesma seção) — sem criar caso.
