# De-Para — CRM Caso → Micro-entrega → Onboarding → Operação Viva → Motores Unificados → Núcleos Unificados

```yaml
status: mapeamento — nenhum código alterado, aguardando decisão da Proprietária
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: de-para de convergência (arquitetura interna) / auditoria de cadeia ponta a ponta
responsável pela decisão: Proprietária Administradora do Clube Ancestral (Tatiana Melani Tosi)
base normativa: docs/arquitetura/2026-09-03_DE-PARA-ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md (PR #75);
  docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md (PR #76);
  docs/arquitetura/2026-09-03_DE-PARA-PLANEJADOR-CIDADANIA-PRODUTO-PAI-MOTORES-UNIFICADOS.md (PR #79);
  docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md (v1.1, PR #67, branch
  docs/de-para-motores-unificados-crm-vivo-2026-09-03 — não mesclada em main nesta linha de commits,
  lida via `git show` para esta sessão);
  docs/arquitetura/2026-09-03_PESSOA-360-CONJUNTO-UNIFICADO-DE-DADOS.md (PR #64);
  docs/auditorias/2026-09-03_LEVANTAMENTO-FICHA-PILOTO-GENEALOGICA-CLIENTE-CRM-VIVO.md (PR #65);
  docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md (já em `main`, 19/08);
  docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-ONBOARDING-JORNADA-v1.0.md (21/08);
  docs/evolucao/recuperados/prompts-lovable/prompt_implementacao_validacao_operacao_viva.md;
  docs/evolucao/recuperados/prompts-lovable/prompts_executaveis_proprietaria_operacao_viva.md;
  docs/politicas/REVISAO-APLICACAO-DIA-A-DIA-2026-08-24.md;
  docs/auditoria/CA-AUD-10_Fechamento_Prontidao_Operacional_2026-08-25.md;
  docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md; PR #30 e PR #36 no GitHub
  (tatianatosi/soul-ancestry, ambas abertas/não mescladas — lidas via API do GitHub nesta sessão)
repositório: tatianatosi/soul-ancestry
fonte: leitura completa dos 5 de-para anteriores desta série (PR #64, #65, #67, #75, #76, #79); varredura
  de docs/evolucao/recuperados/, docs/politicas/, docs/governanca/ por "núcleo unificado"/"Operação Viva"/
  "client_deliverables case_id"; leitura de supabase/migrations/20260819203256_...sql (criação de
  client_deliverables); leitura de src/lib/override-proprietaria-comercial.ts(.functions.ts),
  fila-follow-up-proprietaria.ts, agenda-assistida.ts, rascunhos-comunicacao-governados.ts,
  anexos-materializacao.ts, onboarding-jornada.functions.ts, cadeia-operacional.server.ts,
  jornada-cliente.ts; consulta ao histórico de commits e branches via `git log --all`; consulta à API do
  GitHub (`pull_request_read`, `list_pull_requests`) para o estado real (aberta/fechada/mesclada) de
  PR #30 e PR #36; em 2026-09-03
limite desta sessão: o MCP do Supabase requer autorização não concedida nesta sessão específica —
  nenhuma tabela real foi consultada ao vivo aqui. Os achados sobre `case_plans.status_saude`/
  `dias_sem_touchpoint`/`ultima_atualizacao_cliente_em` citados no pedido da Proprietária como já
  confirmados via `information_schema.columns` (sessão anterior) foram reconfirmados aqui por grep
  completo de escrita (`.update`/`.insert`) em `src/lib/cadeia-operacional.server.ts` e
  `onboarding-jornada.functions.ts` — nenhuma escrita dessas três colunas encontrada em nenhum dos dois
  únicos pontos de escrita de `case_plans` no código.
```

## Causa

Pedido da Proprietária (03/09/2026, verbatim): "Verifique no histórico de prompts tem razão estar em
Crm casos e estar ligado a deliverables micro entregas reveja todas os prompts e faça de para de tudo
que contenha Crm caso microentrega onboarding até chegar na operação viva motores unificados e núcleos
unificados pois acredito que nada foi executado."

Este documento fecha a corrente pedida — CRM caso → micro-entrega → onboarding → Operação Viva →
Motores Unificados → Núcleos Unificados — citando os cinco de-para já escritos nesta série onde já
respondem a um elo, e investigando pela primeira vez os três elos que nenhum documento anterior tinha
coberto: (A) a razão do vínculo `client_deliverables.case_id`, (B) Núcleos Unificados, (C) Operação
Viva. A seção E monta a tabela-síntese pedida.

**Resumo do achado, antes do detalhamento:** a suspeita da Proprietária está certa em grau, não em
totalidade. Nem "tudo" é só lista, nem "tudo" foi executado. Há uma espinha dorsal real e viva
(CRM caso, o vínculo `case_id` de micro-entrega, o motor de cadência D7/D10/D14) — mas tudo que
"unificação"/"operação viva" prometia como camada de integração entre motores já existentes **não**
foi executado: dois PRs de unificação de núcleo/caso estão abertos e não mesclados há mais de duas
semanas (PR #30, PR #36), a Operação Viva produziu uma matriz de prontidão real uma única vez
(25/08) e nunca foi repetida, e ao menos três motores dela (override de exceção, agenda assistida,
rascunhos de comunicação) são código testado com **zero consumidor de tela** até hoje.

## A. Por que `client_deliverables` está ligada a `crm_casos` via `case_id`?

**Sim, existe decisão histórica explícita — não é modelagem acidental.**

| Fonte | Data | O que decide |
|---|---|---|
| `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md:55` | 19/08/2026 | Lista `client_deliverables` como uma das "entidades mínimas" do CRM vivo, ao lado de `cases`/`case_plans` — desenhada desde o início como entidade *case-scoped*, não como entidade independente |
| `supabase/migrations/20260819203256_42404813-0996-4745-8565-cf07464b1991.sql:234-238` | 19/08/2026 (mesmo dia) | Migration real: `create table public.client_deliverables (... case_id uuid not null references public.crm_casos(id), family_id uuid references public.nucleos_familiares(id), ...)` — o vínculo `case_id` é `not null`, com FK explícita para `crm_casos` |
| `docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-ONBOARDING-JORNADA-v1.0.md:118-121` | 21/08/2026 | Prompt executável, seção "MICROENTREGAS E ENTREGAS": "Criar ou ajustar `client_deliverables`: id / **case_id** / family_id opcional / tipo_entrega / ..." — especifica campo a campo, `case_id` é o segundo campo, logo após `id` |
| `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md:127-131` §11 | 19/08/2026 | "Micro-entregas e App Cliente": `client_deliverables` com `approval_status`, canal de notificação, `available_at`, `viewed_at` — sempre descrita como artefato de um caso específico, nunca como entidade solta |

**O que a decisão NÃO registra:** nenhum dos três documentos discute ou descarta alternativas
(entrega vinculada só a `family_id`, a `product_catalog_id`, ou entidade totalmente independente sem
FK a caso). Não há um trecho de "avaliamos X e escolhemos `case_id` porque Y" — a decisão é direta:
toda a linha de domínio do CRM vivo (§5, 16 entidades) já nasce case-scoped, e `client_deliverables`
segue a mesma convenção sem debate registrado. **Não é um vínculo forçado nem um acidente de
implementação** — é a modelagem óbvia e explícita de um sistema onde tudo gira em torno do caso, e o
código (migration `20260819203256`) implementa exatamente o que os dois documentos normativos do
mesmo dia (19/08) e do dia seguinte (21/08) especificaram, campo a campo. Não força-se aqui nenhuma
outra razão além desta.

## B. Núcleos Unificados

**Existe desenho histórico. Existe início de execução (Fase 1 de 6). Não existe unificação real —
e o próprio mecanismo de detecção está preso numa PR aberta e não mesclada há 5 dias.**

### B.1 O prompt de origem: 6 fases, achado só via commit — não existe mais como arquivo

O commit `70b96e8` ("Detecta possíveis núcleos duplicados (Fase 1 do prompt de unificação)",
30/08/2026) e o corpo da PR #30 no GitHub citam "PROMPT CANÔNICO — UNIFICAÇÃO CONTROLADA DE NÚCLEOS
FAMILIARES", motivado pelo caso `CA-CID-PT-2026-001` (João), com 6 fases: **Detecção, Comparação,
Plano, Confirmação, Execução Atômica, Validação Pós-Merge**. Busca exaustiva (com e sem acento,
"unificação controlada de núcleos", "núcleo unificado", `git log --all --diff-filter=A` por nome de
arquivo) não encontra esse prompt como documento em `docs/` nem em nenhuma branch do repositório —
ele existe hoje só como referência dentro do commit e da PR, não como arquivo independente. Registrado
aqui para transparência, sem inventar uma origem que não foi localizada.

### B.2 O que foi de fato construído: só Fase 1 (Detecção), e está numa PR aberta, não mesclada

| Item | Estado real |
|---|---|
| Código | `src/lib/nucleo-duplicidade.ts` (111 linhas) + `.functions.ts` (66 linhas) + rota `/nucleos-duplicidades` — módulo puro, sem estado, compara núcleos par a par por caso/nome/contratante em comum, atribui confiança alta/média/baixa. **Nunca decide, nunca funde, nunca marca nada como igual** (comentário do próprio arquivo, linha 4-6) |
| Testes | `nucleo-duplicidade.test.ts` — cobre confiança alta/média/nenhuma, falso positivo de nome isolado, núcleo arquivado excluído; `tsc`/`vitest`/`vite build` limpos (corpo da PR #30) |
| PR | **#30, "Fase 1 (Detecção) — Possíveis núcleos duplicados", estado `open`, `draft: true`, `merged: false`** (confirmado via API do GitHub nesta sessão, `mergeable_state: "clean"`) — aberta desde 30/08/2026, sem merge até 04/09/2026 |
| Instrução da Proprietária na própria PR | Comentário de 31/08/2026 (autoria da Proprietária, `author_association: "OWNER"`): "esta PR ... permanece aberta e passa a rodar em conjunto com o trabalho de política unificada de casos familiares ... **Não fechar nem mesclar isoladamente** — a decisão de fusão de núcleos segue exigindo matriz de reconciliação e aprovação humana explícita" |
| Fases 3-6 (Plano, Confirmação, Execução Atômica, Validação Pós-Merge) | **Não construídas.** O próprio corpo da PR declara que exigem colunas novas (`nucleo_canonico_id`, `unificado_em`, `unificado_por`, status `mesclado`) que a sessão que a abriu não tinha acesso de escrita ao schema para criar — bloqueio ainda não resolvido |
| No código de produção hoje (`src/` em `HEAD`) | `nucleo-duplicidade.ts` **não existe** — confirmado por `ls`/`grep`. O que está em `main` não tem nenhum mecanismo de detecção, comparação ou fusão de núcleo duplicado |

### B.3 Uma segunda frente irmã, também aberta e não mesclada: Política Unificada de Casos Familiares

`docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` (809 linhas) é o documento normativo
mais amplo que o comentário da Proprietária na PR #30 referencia. Sua Fase 1 ("mapear sem modificar")
foi parcialmente construída no commit `785adf8` (30/08/2026): uma migration aditiva
`case_code_aliases` (nunca aplicada ao banco — confirmado, `case_code_aliases` não aparece em nenhum
arquivo de `supabase/migrations/` nem em `src/`) e um documento de 5 consultas de reconciliação
prontas para rodar. Isso também está em **PR #36, "Política Unificada de Casos — Fase 1 (mapear sem
modificar)", estado `open`, `merged: false`** (confirmado via API do GitHub). As Fases 2/3 daquele
documento (correção do caso real da Ana, schema de `case_participants`/motor único) nunca começaram —
"dependem da matriz de reconciliação com dado real, que ainda não existe" (mensagem do próprio
commit).

### B.4 Conclusão da seção B

Não existe hoje, em `main`, nenhum mecanismo real de deduplicação/unificação de núcleos. Existe: (1)
um desenho histórico de 6 fases, hoje preservado só via commit/PR, não como documento; (2) uma
implementação real e testada da Fase 1 (detecção, somente leitura) — mas presa numa PR aberta, em
pausa deliberada por instrução direta da Proprietária, aguardando convergência com uma segunda frente
(Política Unificada de Casos) que também está presa numa PR aberta e não mesclada. **Não é "lista
nunca implantada" pura — é código real, testado, e propositalmente não mesclado, aguardando decisão
humana que ainda não veio.** Isso é diferente de "esquecido": é "pausado por decisão", com a decisão
registrada em comentário da própria Proprietária na PR.

## C. Operação Viva

**Existe desenho histórico robusto (dois documentos, 10 prompts executáveis). Existe uma execução
real e datada da metodologia (25/08/2026), com resultado honesto e nada inflado. Desde então, a
metodologia não foi repetida, e pelo menos três dos motores que ela mandou construir têm zero
consumidor de tela até hoje — inclusive um deles nesta própria sessão de investigação.**

### C.1 O que "Operação Viva" pede, na fonte

Dois documentos, achados via busca por "Operação Viva"/"CRM Operação Viva" (com e sem maiúscula,
singular, com e sem "CRM"):

- `docs/evolucao/recuperados/prompts-lovable/prompt_implementacao_validacao_operacao_viva.md` — define
  "operação viva" com 7 critérios obrigatórios simultâneos (dono operacional, fonte de verdade única,
  ID canônico reconciliado, fluxo explícito, evidência de execução real, controle de falha/auditoria,
  prova repetida em produção autenticada) e proíbe promover status por inferência.
- `docs/evolucao/recuperados/prompts-lovable/prompts_executaveis_proprietaria_operacao_viva.md` — 10
  prompts executáveis em sequência (PROMPT 01-10): matriz de prontidão, override auditável da
  Proprietária, exceção para o caso da Ana (início antes do pagamento), materialização contratual
  com exceção, fila de próximas ações do Painel Hoje, agenda assistida, rascunhos governados de
  comunicação, validação E2E autenticada, reconciliação de catálogo/Asaas, e fechamento/matriz final.

Não é um recurso de produto a construir — é uma **metodologia de auditoria e um conjunto de motores
de exceção auditável**, com a mesma disciplina "mapear antes de decidir, nunca inferir operação real
de código/teste local" que esta própria série de de-paras usa.

### C.2 O que foi de fato executado, prompt a prompt

| Prompt | O que pedia | Executado? | Evidência |
|---|---|---|---|
| 01 — Matriz de prontidão | Auditoria somente leitura, matriz de capacidade × estado | **Sim, uma vez** | `docs/auditoria/CA-AUD-10_Fechamento_Prontidao_Operacional_2026-08-25.md` — matriz de 14 linhas, estados corretos, sem inflar nada |
| 02 — Override auditável da Proprietária | Política canônica de exceção a gates, com estados `BLOQUEADO`/`LIBERADO_POR_OVERRIDE_PROPRIETARIA`/`EXPIRADO_AGUARDA_REVISAO`/`REVOGADO` | **Código sim, uso não** | `src/lib/override-proprietaria-comercial.ts` (commit `b88e56b`, **mesclado em `main`**) implementa exatamente a spec (mesmos 4 estados, 5 `TipoOverride`, `ESCOPOS_LIBERAVEIS` por tipo). **Mas** `grep -rln "override-proprietaria-comercial" src/` retorna só o próprio módulo e seu teste — **nenhum componente, rota ou outro módulo de produção o importa**. É motor testado, real, mesclado — e nunca chamado por nenhuma tela até hoje |
| 03 — Ana: início antes do pagamento | Registrar decisão `INICIAR_ANTES_DO_PAGAMENTO` para o caso da Ana Luiza | **Não** | A capacidade genérica existe (item 02), mas nenhum registro real da exceção para o caso `CA-CID-AT-FAM-2026-001` foi encontrado — CA-AUD-10 já registrava isso como `PENDENTE_DE_VALIDACAO_HUMANA` em 25/08, e nada no código sinaliza mudança desde então |
| 04 — Materialização contratual com exceção | Fluxo de rascunho interno de Contrato/OS/Anexos com exceção auditável da Proprietária | **Parcial** | `src/lib/anexos-materializacao.ts` existe, testado, **e wireado** (`src/components/contrato/materializar-revisados.tsx`, `casos.$caseId.contrato.preparar.tsx`) — mas não usa o mecanismo de override do item 02 (`grep` por `materializacao_contratual`/`registrarOverrideComercial` fora do próprio módulo de override não encontra nada) — a materialização em si roda, a "exceção auditável" específica que o prompt pedia não está amarrada a ela |
| 05 — Painel Hoje: fila de próximas ações | Fila derivada, dedup, precedência, sem escrita | **Sim, e hoje com UI** | `src/lib/fila-follow-up-proprietaria.ts` — em 25/08 (CA-AUD-10) estava `IMPLEMENTADO_LOCAL ... não wireada ao Painel Hoje real ainda`; hoje (04/09) `src/components/painel/fila-cadencia.tsx` consome o módulo e é importado por `painel-dia.tsx` — **progrediu de motor isolado para tela real entre 25/08 e agora** |
| 06 — Agenda assistida | Sugestão interna de reunião/follow-up, sem criar evento externo | **Só motor** | `src/lib/agenda-assistida.ts` existe, testado (citado em CA-AUD-10 como "4 estados, sanitização de pauta testados") — `grep -rln "agenda-assistida" src/ --include="*.ts" --include="*.tsx"` (excluindo o teste) **não retorna nenhum arquivo**. Zero consumidor, hoje como em 25/08 |
| 07 — Rascunhos governados de comunicação | Templates versionados de João/Lara, sem handler de envio | **Só motor** | `src/lib/rascunhos-comunicacao-governados.ts` existe, testado — mesma checagem, **zero consumidor** fora do próprio teste. Mesmo estado de 25/08 |
| 08 — Validação E2E autenticada em produção | Roteiro read-only com sessão real | **Não, explicitamente** | CA-AUD-10 registra `NAO_COMPROVADO_NO_DOMINIO_PUBLICADO` — sem sessão/credencial disponível na sessão de 25/08; esta sessão também não tem acesso a sessão autenticada em produção, então o estado permanece idêntico, não reavaliável aqui |
| 09 — Reconciliação de catálogo/Asaas | Classificar cada SKU (ativo, sem link, divergente, etc.) | **Auditoria feita, correção não aplicada** | CA-AUD-10: 24/30 SKUs com preço divergente da Planilha Mestre, mapeados, resolução proposta **não aplicada** — "fica para aprovação separada". Não verificado nesta sessão se os 24 foram corrigidos desde 25/08 (fora do escopo desta pesquisa, que é sobre a cadeia CRM→núcleo, não sobre catálogo) |
| 10 — Fechamento/matriz final | Consolidar tudo num relatório de prontidão | **Sim, uma vez** | O próprio `CA-AUD-10`, fechando 01-09. **Não foi repetido desde 25/08** — nenhum segundo "fechamento de Operação Viva" existe no histórico de commits |

### C.3 Conclusão da seção C

A Operação Viva não é "só lista, nunca implantada" — é a categoria mais honestamente documentada de
todo este levantamento: sabe dizer de si mesma o que está `IMPLEMENTADO_LOCAL` vs.
`OPERACIONAL_COMPROVADA`, e o documento de fechamento (CA-AUD-10) já fazia, em 25/08, exatamente o
trabalho que a Proprietária está pedindo de novo agora (separar o que é real do que é código sem
uso). O achado novo desta seção é que **essa mesma disciplina não foi reaplicada desde 25/08** — dez
dias depois, dois dos sete motores construídos (agenda assistida, rascunhos de comunicação) e um
terceiro mesclado em produção (override auditável da Proprietária) seguem exatamente como estavam:
código testado, zero tela, zero uso real. A validação autenticada (item 08) segue impossível nesta
classe de sessão, então o "risco não aceito" registrado em 25/08 continua em aberto, sem
novidade.

## D. Motores Unificados — complemento pontual ao PR #67, sem repetir

O PR #67 (v1.1, `docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md`) já cobre a
ligação entre "motores unificados" e onboarding/cadência/micro-entregas — não é lacuna nova:

- Seção "Correção (v1.1)" do PR #67 já registra, com evidência de código
  (`src/lib/orquestracao-jornada.ts`, CA-OPS-01/02), que "microentregas e onboarding já são cadência,
  não conceitos separados" — a cadeia CRM → Onboarding → Cadência → Microentregas → Alertas → Painel
  Hoje já existe como módulo único testado.
- A tabela de entidades do PR #67 já mapeia `citizenship_cases`/`cases` → `casos`/`crm_casos` (a
  ligação "CRM caso" do pedido de hoje) e `micro_deliveries` → tabela `microentregas`.

**O que o PR #67 não cobriu, e o PR #79 cobriu depois:** a ligação entre o motor de cadência
(`orquestracao-jornada.ts`) e o "Planejador operacional" (`case_plans` via `cadeia-operacional.ts`) —
o PR #79 (seção 6) confirma, por grep direto, **zero referência cruzada** entre os dois arquivos: são
"dois motores vivos, testados, e desconectados entre si". Esse é o gap real de "motores unificados"
que sobrevive depois dos PRs #67 e #79: os motores individuais (CRM, cadência, planejador) existem e
funcionam — a *unificação* entre eles, no sentido de uma FK ou chamada de função de um para o outro,
não existe. Não repito aqui a tabela de 39 entidades do PR #67 nem a tabela de gap do PR #79 — ambas
já respondem à pergunta; esta seção só confirma que nenhuma delas ficou de fora por engano.

## E. Tabela-síntese — a corrente completa

| Conceito | Existe decisão histórica? (doc:linha) | Existe mecanismo real em código hoje? (arquivo:linha ou "nenhum") | Executado ou só planejado | Observação |
|---|---|---|---|---|
| **CRM caso** (`crm_casos`) | Sim — `CA-DECISOES-CANONICAS...v1.0.md:55` (entidade `cases`/`casos`, 19/08) | Sim — `crm_casos` real, `src/lib/crm-fluxo.ts` (`ETAPAS_COMERCIAIS`), rota `historico.fluxo-comercial-canonico.tsx` | **Executado** | Confirmado "implementado e em uso" no PR #65 (levantamento histórico) — é a espinha dorsal de toda a corrente |
| **Vínculo micro-entrega ↔ caso** (`client_deliverables.case_id`) | Sim — `CA-DECISOES-CANONICAS...v1.0.md:55,127-131` + `CA-LOVABLE-ONBOARDING-JORNADA-v1.0.md:118-121` (19-21/08) | Sim — `client_deliverables.case_id not null references crm_casos(id)`, migration `20260819203256:234-238` | **Executado** | Vínculo é intencional, não acidental (seção A). Mas o dado gravado nessa coluna tem dois vocabulários conflitantes de estado (`approval_status`), já registrado no PR #76 — regra da Proprietária: português vence, ainda não aplicada em código |
| **Micro-entrega como conceito único** | Sim — `CA-DECISOES-CANONICAS...v1.0.md:127-131` §11 (7 estados propostos) | Fragmentado — 4-5 representações reais (`client_deliverables`, `ops_microentregas`, `microentregas` órfã, texto livre em `cadeia-operacional.ts`), nenhuma com os 7 estados | **Parcialmente executado, fragmentado** | Achado central do PR #76 — nenhuma FK entre as tabelas, cada uma cobre metade do modelo da política |
| **Onboarding único / ciclo de jornada de vida** | Sim — múltiplos documentos, ver PR #75 seção 2 (tabela completa) | 7 mecanismos reais e distintos (A-H sem duplicar letra), nenhum chamando os outros | **Fragmentado, nunca unificado** | Achado central do PR #75 — D7/D10/D14 redeclarado em 6 lugares independentes; `onboarding_planos` × `case_plans` nunca cruzadas |
| **Cadência D0-D365** | Sim — `CA-DECISOES-CANONICAS...v1.0.md` §10 (norma D0/D1-D3/D7/D10/D14/D30) | Sim — `orquestracao-jornada.ts` (CA-OPS-01/02), testado, cadeia de 11 elos, wireado em `/biblioteca-mensagens` | **Executado** | Confirmado real no PR #67 (correção v1.1) — mas é uma tela manual (mecanismo A do PR #75): não lê `crm_casos` ao vivo, é calculadora "e se" |
| **Operação Viva** (metodologia + motores de exceção) | Sim — 2 documentos completos (validação + 10 prompts executáveis), `docs/politicas/REVISAO-APLICACAO-DIA-A-DIA-2026-08-24.md` | Parcial — matriz real produzida uma vez (`CA-AUD-10`, 25/08); override auditável mesclado mas **zero UI** (`override-proprietaria-comercial.ts`); agenda assistida e rascunhos governados são motor puro sem consumidor; fila de follow-up **ganhou UI** desde 25/08 | **Parcialmente executado, não repetido desde 25/08** | Seção C. É a categoria mais honesta do levantamento (sabe dizer de si "implementado local" vs "comprovado") — mas a disciplina não voltou a rodar em 10 dias |
| **Motores Unificados (CRM Vivo)** | Sim — `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` (984 linhas, 31/08) | Motores individuais existem (CRM, cadência, planejador `case_plans`) — mas **zero ligação de código entre planejador e cadência**, confirmado por grep em branco no PR #79 | **Motores individuais executados; unificação entre eles não** | PR #67 já resolveu a maioria das 39 entidades propostas como já existentes sob nome português; PR #79 é quem achou o gap real: dois motores vivos, paralelos, nunca cruzados |
| **Núcleos Unificados** | Sim — "PROMPT CANÔNICO — UNIFICAÇÃO CONTROLADA DE NÚCLEOS FAMILIARES" (6 fases), só preservado via commit/PR, arquivo original não localizado no repositório | Só Fase 1 (detecção, somente leitura) — `nucleo-duplicidade.ts`, **PR #30, aberta, `draft`, não mesclada** desde 30/08; Fases 3-6 (fusão real) nunca construídas, exigem migration ainda não escrita | **Não executado** — só detecção, presa numa PR aberta por instrução deliberada da Proprietária | Seção B — a PR fica aberta de propósito, aguardando convergência com a Política Unificada de Casos (PR #36, também aberta, não mesclada) |

## Sobre a regra "português é canônico" (vocabulário duplicado)

Nenhuma sobreposição **nova** de vocabulário português/inglês foi encontrada nesta varredura além da
já registrada no PR #76 (`client_deliverables.approval_status`: inglês `draft/in_review/approved/
published` vs. português `rascunho/em_revisao/aprovado/publicado/arquivado`, na mesma coluna). Os
demais vocabulários encontrados nesta sessão — `ESTADOS_OVERRIDE` (`BLOQUEADO`,
`LIBERADO_POR_OVERRIDE_PROPRIETARIA`, `EXPIRADO_AGUARDA_REVISAO`, `REVOGADO`, em
`override-proprietaria-comercial.ts`) e os nomes de entidade em inglês do
`CA-DECISOES-CANONICAS...v1.0.md` (`cases`, `client_deliverables`, `families`) — não são conflitos de
dado gravado: o primeiro é só português maiúsculo, o segundo é nome de documento/proposta, nunca
gravado como string em coluna real (as tabelas reais já nasceram com nomes em português —
`crm_casos`, `nucleos_familiares`). Não decido aqui se algo deve migrar; só registro que não há
achado novo de vocabulário conflitante fora do já apontado no PR #76.

## O que este documento NÃO decide

- Nenhum arquivo em `src/` foi alterado. Nenhuma migration foi criada. Nenhuma branch ou PR foi
  criada por esta sessão.
- Não decide se as PRs #30 e #36 devem ser mescladas, fechadas ou continuar abertas — a própria
  Proprietária já registrou, em comentário na PR #30, que a decisão de fusão de núcleos segue
  exigindo matriz de reconciliação e aprovação humana explícita; este documento não substitui essa
  decisão, só confirma o estado atual das duas PRs via API do GitHub.
- Não decide se `override-proprietaria-comercial.ts`, `agenda-assistida.ts` e
  `rascunhos-comunicacao-governados.ts` devem ganhar UI agora — só constata que são motores reais,
  testados, mesclados ou não, sem nenhum consumidor de tela até hoje.
- Não decide qual vocabulário de `client_deliverables.approval_status` vira canônico — o PR #76 já
  registrou o conflito; a regra "português é canônico" já foi declarada pela Proprietária no contexto
  desta tarefa, mas nenhuma migração de dado foi executada aqui.
- Não reabre nem contradiz nenhum achado dos PRs #64, #65, #67, #75, #76 ou #79 — cita e complementa,
  nunca repete por inteiro.
- Não consultou o banco Supabase ao vivo (MCP não autorizado nesta sessão específica) — a
  reconfirmação de que `case_plans.status_saude`/`dias_sem_touchpoint`/`ultima_atualizacao_cliente_em`
  nunca são escritas veio de grep exaustivo dos dois únicos pontos de escrita de `case_plans`
  encontrados em código (`cadeia-operacional.server.ts:165`, `onboarding-jornada.functions.ts:367`),
  não de uma query real contra produção.
- Não decide se o prompt canônico de 6 fases de unificação de núcleos deve ser recriado como
  documento formal em `docs/` — só registra que hoje só existe via commit/PR, não como arquivo.
- Segue o mesmo padrão de todo de-para desta série: **mapear primeiro, decidir depois, executar só
  com autorização explícita da Proprietária. Nada é apagado, só arquivado/documentado.**
