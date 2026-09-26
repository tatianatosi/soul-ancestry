# Adendo — Contratos rescatados dos 3 documentos de redesenho do Desk (v1.0, v2.0, Pacote de Instruções) (2026-09-26)

```yaml
status: vigente, complementa MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Faça um pente fino minucioso em cada documento em cada premissa em relação ao
  desk mantém 06 grupos o que é necessário você rever são os conteúdos e faça limpeza de tudo que
  é legado e está em sobreposição também mas principalmente resgatar e deixar como regras todos
  os contratos acima"
```

Este documento **não substitui** `MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md` — só
acrescenta as regras dos 3 documentos colados nesta rodada (v1.0 "seis áreas" 2026-08-31, v2.0
"sete áreas" com correção, "Pacote de Instruções" final que os substitui) que ainda **não**
estavam registradas em nenhum documento normativo, mais o achado de sobreposição encontrado no
pente-fino. Onde a regra já existia (6 grupos, 7 abas do App, CHECK de vocabulário), este adendo
só cita a evidência nova, sem duplicar o texto já normativo.

## Decisão fechada nesta rodada — navegação não se reabre

**Desk continua com 6 grupos (`GRUPOS_DESK`, `src/lib/navegacao-desk.ts`).** A Proprietária
confirmou explicitamente ("Manter 6 grupos") depois de eu perguntar. Os 3 documentos pediam 7-8
áreas com "Pessoas & Famílias" como grupo próprio — **não implementar**. Pessoa 360/Núcleo 360
continuam completos dentro de "Pessoas & Casos", como já é hoje. Nenhum agente deve reabrir esta
pergunta sem nova decisão explícita e datada da Proprietária.

## Regras rescatadas e codificadas (já executadas, confirmadas por leitura direta do código)

1. **App Cliente é o mesmo produto, não um segundo banco.** Toda leitura do portal vem de
   `app_projections`/`client_deliverables`/`portal_casos`, nunca de uma cópia paralela.
2. **Admin tem "Visão Administrativa do Cliente" — não é login como o cliente, nunca token/senha
   do cliente.** Já implementada: `src/lib/app-cliente-como-pessoa.functions.ts`
   (`dadosVivosDoPortalComoAdmin`), rota `/app-cliente-como-pessoa?casoId=`, linkada em **Caso 360**
   (`casos.$caseId.index.tsx`) e em **Pessoa 360** (`pessoas.$clienteId.tsx`). **Regra**: qualquer
   pedido futuro de "admin ver o app do cliente" deve reaproveitar esta rota — nunca criar um
   segundo mecanismo, nunca implementar por impersonação/login real do cliente.
3. **Caso 360 tem exatamente 8 seções endereçáveis, nesta nomenclatura e ordem de navegação**
   (`SECOES` em `casos.$caseId.index.tsx`): **Visão · Jornada · Pessoas e família · Pesquisa ·
   Documentos · Formalização · Financeiro · Histórico**. Fechado em 2026-09-26 (P24). **Regra**:
   não renomear, não remover, não acrescentar seção sem decisão explícita e datada.
4. **Motor jurídico por país/via/marco usa os nomes reais do schema, não os do documento
   arquivado.** `citizenship_tracks` → `versioned_legal_rules` → `legal_reference_milestones` →
   `avaliarValidacaoJuridicaCaso`. **Nunca criar** `legal_framework`/`legal_gate`/`citizenship_routes`
   como tabela nova — são os mesmos conceitos, sob nome já implementado.
5. **Radar de marcos jurídicos × casos afetados** (sentido inverso: marco → quantos casos usam a
   trilha) — construído em `/painel` (P25), `src/lib/radar-marcos-juridicos.ts`. Nunca esconder
   contagem 0 (é dado real, não falha do radar).
6. **Onboarding único por caso é restrição de banco, não convenção.** `UNIQUE (case_id)` real em
   `onboarding_planos`. Nenhum agente deve tratar "um onboarding por caso" como regra frágil de
   aplicação — é impossível violar no schema atual.
7. **Central Hoje (`/painel`) usa cards, nunca tabela.** Confirmado: zero `<table>`, uso extensivo
   de `<CaCard>`. Mantido em todos os cortes desta sessão (P25/P26), incluindo os cards novos de
   país/via e radar jurídico.
8. **Dicionário jurídico (`glossario-oficial.ts`, `VOCABULARIO_OFICIAL`) é objeto distinto** do
   motor de país (`citizenship_tracks`) e da matriz de cláusulas de contrato (`/matriz-juridica`).
   Hoje só aparece como subseção de `/governanca/dicionario-calls-crm`. **Regra**: se um dia ganhar
   página própria, é aditivo (mover/expor), nunca recriar o objeto sob nome novo.
9. **Radar macro (`/golive/radar`) já usa cards por caso** (causa, próxima ação, urgência,
   responsável) — não é lista de KPI. Qualquer pedido de "radar mais rico" é aditivo sobre os cards
   já reais, nunca substituição por tabela/lista de números.
10. **Núcleo Familiar 360 (`/nucleos`) já tem o conteúdo real**: membros, dossiê-mãe editável,
    papéis (`NUCLEO_PAPEIS`), ambientes/níveis de acesso, cobertura por geração, fila real de Drive
    (`drive_provisioning_queue`). É lista de cards com editor inline, não rota endereçável por
    núcleo — se isso mudar, é só roteamento (`/nucleos/$id`), nunca um segundo modelo de dado.

## Sobreposição encontrada no pente-fino — declarada, não corrigida sozinho

### Achado: duas implementações de "Painel Hoje" coexistem, sem decisão que reconheça isso

`src/components/painel/painel-dia.tsx` (1260 linhas, `export function PainelDia()`) é testado
exaustivamente — **13 arquivos de teste** (`ca-ux-03-fase-b`, `cockpit-operacional`,
`circuito-abas-mesa-kpis`, `alertas-rota-canonica`, `descoberta-desk`, `fase1-motor-unificado`,
`cadencia-onboarding-tela`, `fila-sla-operacional`, `painel-caso-destaque`,
`alinhamento-mockup-producao`, `ca-ops-02-fiacao-cadencia-catalogo`, `desk-pendencia-nao-trava`,
`p3-d7-microentrega-2026-09-25`) leem o arquivo por `readFileSync` e verificam seu conteúdo
(5 blocos operacionais: `fila_priorizada`/`excecoes`/`comercial`/`prazos`/`descoberta`, resumo
comercial, resumo financeiro, uso de `prioridade-matriz`). **Mas nenhuma rota real importa ou
renderiza `<PainelDia>`** — confirmado por grep exaustivo (`import.*PainelDia`, `<PainelDia`) em
todo `src/`, fora do próprio arquivo e de um comentário em teste.

A rota real `/painel` (`src/routes/_authenticated/painel.tsx`, 592 linhas) é uma implementação
**diferente e mais nova**, construída direto sobre `useGoLive`/`golive-*.ts`
(`golive-aprovacoes`, `golive-comercial`, `golive-microentregas`, `radar-marcos-juridicos`, os
cards de P25) — sem nenhuma linha em comum com `painel-dia.tsx`.

Ou seja: existe um arquivo de componente extensamente coberto por teste que **nunca roda na tela
que a Proprietária realmente abre hoje**. Isto não é o mesmo achado do P25 (que já tinha
confundido isto com "código morto simples") — é mais sério: os testes garantem um comportamento
que não está em produção, o que pode dar falsa confiança de cobertura.

**Não apaguei nada.** Descobri também, ao investigar mais a fundo desta vez, que `painel-dia.tsx`
tem um irmão que **é** legado deliberado e documentado:
`src/components/painel/painel-desk-hoje.tsx` e `src/components/painel/painel-hoje.tsx` estão
registrados em `PAINEIS_HISTORICOS`
(`src/lib/fontes-canonicas-indicadores.ts`) como **"painéis aposentados visualmente: arquivo,
rota e teste preservados"** — as ROTAS deles (`/historico/painel-hoje`,
`/historico/painel-desk-hoje`) foram arquivadas em 08/09/2026 por decisão explícita ("preservado
apenas para consulta interna", "sem uso diário"), mas os ARQUIVOS de componente continuam de
propósito, com um teste (`ca-ux-03-fase-b.test.ts:86`) que **falha se o arquivo for apagado**
(`expect(existsSync(p.componente)).toBe(true)`). **Isto é exatamente o padrão de legado que
`AGENTS.md` manda preservar** — rotulado, fora da camada ativa, incapaz de sobrescrever o
planejador. Confirmado: **não apagar `painel-desk-hoje.tsx` nem `painel-hoje.tsx`** — apagar
quebraria o próprio contrato de preservação histórica que a Proprietária já aprovou.

`painel-dia.tsx` é diferente: **não está** em `PAINEIS_HISTORICOS`, não tem rota histórica
declarada, e ainda tem 13 testes tratando-o como se fosse a fonte viva. Isto não se encaixa nem
como "legado preservado" nem como "peça em uso real" — é a sobreposição genuína que a Proprietária
pediu para eu encontrar.

**Duas opções honestas, nenhuma decidida por mim**:
- (a) `painel-dia.tsx` é o desenho de referência mais completo (5 blocos, resumo comercial e
  financeiro, prioridade-matriz) e `/painel` deveria adotá-lo ou reconciliar os cards que faltam
  (o `/painel` de hoje não tem, por exemplo, o bloco `fila_priorizada`/`excecoes` como blocos
  nomeados — tem cards soltos: Funil de leads, Ritmo operacional, Distribuição de prioridades,
  Casos por país e via, Cadência, Casos sem próxima ação);
- (b) `/painel` (golive) é o desenho vigente e `painel-dia.tsx` deveria ser formalmente aposentado
  como os outros dois (entrar em `PAINEIS_HISTORICOS`, ganhar rota histórica se ainda fizer sentido,
  ou ser apagado com os 13 testes reescritos/removidos).

Nenhuma das duas é uma limpeza "segura" sem decisão — a primeira é uma reestruturação de UI real;
a segunda apaga 13 arquivos de teste que a Proprietária pode querer manter como registro de
requisito. **Fico aguardando a decisão dela antes de tocar em qualquer um dos dois arquivos.**

## Peças genuinamente faltantes dos 3 documentos — aguardando decisão, não fabricadas

(Já detalhado em `docs/arquitetura/2026-09-26_P26-plano-redesenho-desk-pente-fino-tres-documentos.md`,
repetido aqui só como referência de regra, não para duplicar o texto completo.)

- Vocabulário de 7 estados de microentrega (documento) vs. 5 estados reais
  (`client_deliverables.approval_status`) — decisão de arquitetura de dado, não ajuste aditivo.
- Portal de proposta pré-conversão (lead sem caso) — decisão de autenticação externa.
- Núcleo Familiar 360 como rota endereçável (`/nucleos/$id`) — mudança de estrutura de página,
  proposta como corte próprio (P28).
- Radar macro enriquecido com marco jurídico/microentrega pendente — proposto, não codificado
  (exigiria estender `CasoRadar`/`golive-radar.ts`/o loader, não só a função pura).

## Regra permanente sobre este adendo

Nenhum agente futuro deve reler os 3 documentos originais (v1.0/v2.0/Pacote de Instruções) como
se fossem pedido novo — as regras deles já estão aqui, na Memória Permanente e no P26. Reabrir a
navegação para 7/8 grupos, inventar `legal_framework`/`legal_gate` como tabela nova, ou apagar
`painel-desk-hoje.tsx`/`painel-hoje.tsx` sem decisão são os três erros mais fáceis de cometer
relendo esses documentos sem este adendo — evitá-los é o propósito deste arquivo.
