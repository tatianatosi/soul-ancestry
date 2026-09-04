---
status: ativo
versão: 1.1 — corrigida em 04/09 (seção 2): a régua D0-D365 existe, numa branch nunca mesclada
data: 2026-09-04
projeto: Clube Ancestral — Desk Intelligence
responsável pela decisão: Proprietária (Tatiana Melani Tosi)
fontes:
  - Google Drive — 12 documentos listados no pedido da Proprietária (§0)
  - docs/auditorias/2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md
  - docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md
  - docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md
  - docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md
  - docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md
  - docs/governanca/DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md
  - docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md (recuperado nesta rodada — commit 6fc2521, branch nunca mesclada)
  - src/lib/cadencia-d0-d30.ts, src/lib/onboarding-jornada.ts, src/lib/onboarding-padrao.ts, src/lib/fiacao-cadencia-catalogo.ts, src/lib/app-visibilidade.ts, src/lib/portal-jornada.functions.ts
escopo: cruzar 12 documentos do Drive pedidos pela Proprietária contra todo o histórico de varreduras de onboarding/micro-entregas já feito nesta sessão, e reconstruir a régua de cadência D0→D365
premissas: nenhuma escrita em banco; nenhuma migration; nenhum código alterado por este documento
limites: sessão sem credencial ativa do Supabase — nenhuma consulta ao vivo
próximos passos: seção 6
critério de aceite: cada afirmação carrega documento+data (Drive) ou arquivo:linha (repositório) como evidência
---

## Causa

A Proprietária pediu para verificar 10 documentos específicos no Google Drive compartilhado (CRM
Journey, G-06, Catálogo de Exceções Operacionais, Inventário de Prompts Lovable pós-CRM, Respostas
Operacionais e Prompts pós-CRM, Jornada Completa Ana Luiza, Prompts Lovable App Cliente, Decisões
Canônicas CRM, Fluxo Jornada Clube Ancestral, Arquitetura Única de Oferta), cruzá-los com tudo que já
foi varrido nesta sessão sobre onboarding e micro-entregas, e fechar com "a regra geral de cadências de
D0 até D365".

## 1. Os 10 documentos pedidos — todos localizados, mais 2 achados no caminho

Busca no Drive por título/texto integral encontrou os 10 pedidos e mais 2 que se mostraram
indispensáveis para responder ao pedido (um índice mestre de 02/09 que já classifica dezenas de
decisões anteriores, e o registro de entrega técnica de 19/08 citado por vários dos outros documentos):

| # | Documento | Data | Encontrado como |
|---|---|---|---|
| 1 | CLUBE_ANCESTRAL_CRM_JOURNEY.docx | 18/08 | pedido |
| 2 | MAPA-EXCECOES-OPERACIONAIS ("Catálogo de exceções operacionais") | 23/08 | pedido |
| 3 | INVENTARIO_PROMPTS_LOVABLE_SEMANA_E_PRIORIZACAO_POS_CRM_v1.0 | 20/08 | pedido |
| 4 | respostas_operacionais_e_prompts_pos_crm_19_agosto_2026_v1_0 | 19/08 | pedido |
| 5 | ana_luiza_jornada_completa_e_prompts_v1_0 | 19/08 | pedido |
| 6 | prompts_lovable_app_cliente_jornada_documentos_v1_0 | 20/08 | pedido |
| 7 | CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0 | 19/08 | pedido |
| 8 | fluxo-jornada-clube-ancestral.docx | s/d | pedido |
| 9 | "03 - Arquitetura Única de Oferta e Jornada" | 10/08, revisado 24/08 | pedido |
| 10 | G06_ACHADOS_E_ENCONTROS_v1.0.md | 20/08 | pedido — idêntico ao já existente em `docs/G06_ACHADOS_E_ENCONTROS_v1.0.md`, sem novidade |
| 11 | CA_ARTEFATO_MESTRE_RESGATE_PROMPTS_DECISOES_E_FILA | 02/09 | achado — índice mestre que classifica os demais |
| 12 | CA-IMPL-CRM-01_registro_entrega_19_agosto_2026_v1.0 | 19/08 | achado — citado por 3 dos 10 pedidos como "complementa" |

Resumo de uma frase por documento, status de implementação e evidência de código estão registrados no
arquivo de trabalho desta varredura (não versionado — conteúdo integral já refletido nas seções abaixo).

## 2. Achado principal — CORRIGIDO em 04/09: a régua D0→D365 existe, numa branch nunca mesclada

**Correção desta rodada.** A primeira versão deste documento afirmou que a régua D0→D365 não existe em
nenhuma fonte. Isso estava errado, e a Proprietária apontou o erro diretamente: existe uma política
dela própria, **"Mapa de cadências D0–D365 — Ana Luiza como piloto e regra universal"** (rascunho v1.0,
03/09/2026), e um de-para técnico completo contra ela —
`docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md` (commit `6fc2521`,
03/09). O motivo de nenhuma das duas buscas anteriores (a minha e a do subagente) ter encontrado isso:
o commit vive numa branch própria (`docs/de-para-cadencia-microentregas-planejador-2026-09-03`) que
**nunca foi mesclada a `main` nem a nenhuma branch de trabalho** — invisível a qualquer busca em
`docs/`/`src/` feita a partir daqui. Recuperado nesta rodada: o arquivo foi copiado para esta branch em
`docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md`, sem alteração de
conteúdo, só com uma nota de recuperação no topo.

A política original em si (o "Mapa de cadências D0–D365") **não existe como arquivo** — foi um texto
colado diretamente numa sessão anterior, nunca salvo como documento próprio no Drive nem no
repositório. O que sobrevive dela é a reconstrução indireta feita pelo de-para de 03/09, que cita e
tabula suas seções 3, 4, 6 e 9 (não o texto integral). É a régua F abaixo — a mais completa encontrada
até agora, mas ainda parcial.

### 2.1 — O que o de-para de 03/09 já achou, e que segue sem correção um dia depois

O documento recuperado não é só a régua — é uma auditoria completa contra ela, com um achado ainda
**ativo hoje** (verificado nesta rodada, 04/09): `client_deliverables.approval_status` recebe **dois
vocabulários de estado conflitantes na mesma coluna**, gravados por dois módulos que nunca se
cruzam — `onboarding-jornada.functions.ts` grava `"published"` (inglês), `jornada-cliente.functions.ts`
grava `"publicado"` (português). Confirmado ainda presente: `onboarding-jornada.functions.ts:228,562,585`
continua usando `"published"`; `jornada-cliente.functions.ts:247` continua usando `"publicado"`. Isso é
risco de **dado invisível entre telas** — uma entrega publicada por um caminho não aparece como
publicada para quem consulta pelo outro vocabulário — não apenas duplicação de manutenção. Ver seção 4
para o registro completo deste achado no backlog.

### 2.2 — Decisão da Proprietária nesta rodada

A Proprietária declarou, durante esta mesma sessão: **"cadência deve ser obedecida como regra geral D0
até D365"**. Isso substitui a leitura anterior como próximo passo — deixa de ser pergunta em aberto e
vira decisão a implementar —, mas não resolve, por si só, o conflito com a vedação escrita ainda
vigente (`docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md:46`, "nenhuma cadência deve ser
uma sequência fixa universal") nem escolhe, entre as janelas já propostas pela régua F (D0, D1–D30,
D31–D90, D91–D365) e os quatro gaps que o de-para de 03/09 já identificou nelas, qual implementar
primeiro. **Este documento registra a decisão; não decide o formato de aplicação** — ver perguntas na
seção 5.

### 2.3 — Fonte primária recuperada: o texto integral do "Mapa de cadências" agora existe no repositório

A Proprietária enviou o arquivo original da política, que esta sessão só conhecia por citação indireta
via o de-para de 03/09. Recuperado sem alteração em
`docs/arquitetura/2026-09-03_MAPA-CADENCIAS-D0-D365-ANA-REGRA-UNIVERSAL.md`. Conferido campo a campo
contra as citações do de-para (seção 3, Régua F, abaixo): **batem exatamente** — nenhuma divergência
entre o que o de-para tinha reconstruído por citação e o texto integral agora disponível. A Régua F
nesta rodada já foi escrita com base no texto completo.

### 2.4 — Achado sistêmico, fora do escopo original do pedido: 03/09 tem ~20 branches nunca mescladas

Ao procurar o commit do de-para de cadência, esta rodada encontrou que ele não é um caso isolado. Uma
única data, 03/09/2026, tem **cerca de 20 branches** (`docs/*-2026-09-03`, `fix/*-2026-09-03`,
`feat/*-2026-09-03`) que nunca foram mescladas a `main` nem a nenhuma branch de trabalho posterior —
confirmado com `git merge-base --is-ancestor` para as verificadas nesta rodada. Quatro foram abertas e
lidas parcialmente:

| Branch | Commit | Conteúdo | Verificado nesta rodada |
|---|---|---|---|
| `docs/de-para-cadencia-microentregas-planejador-2026-09-03` | `6fc2521` | De-para cadência D0-D365 (seção 2 acima) | Recuperado integralmente |
| `docs/arquiva-planejador-universal-produtos-pai-jornada-2026-09-03` | `8bef659` | Arquiva proposta de 11 entidades novas; decisão de estender tabelas existentes em vez de criar; achado de 20+ códigos triplicados em `product_catalog` | Só o resumo do commit, não o documento completo |
| `docs/de-para-planejador-cidadania-motores-unificados-2026-09-03` | `021b8a8` | Confirma dois motores reais desconectados (`case_plans`/`cadeia-operacional.ts` × `orquestracao-jornada.ts`/CA-OPS-01/02); `produto_pai_id` confirmado como FK morta, zero consumidor | Só o resumo do commit |
| `docs/de-para-onboarding-jornada-cadencia-2026-09-03` | `334f2ad` | "PR #75" — citado como já mesclado pelo de-para de cadência recuperado, mas **também está numa branch nunca mesclada** | Só confirmado que não está em `main` |
| `fix/produto-sku-catalogo-vivo-2026-09-03` | `c8faf91` | **Correção de código real, não só documentação**: `preencherDeOrigens()` do motor contratual parava de usar nome de SKU hardcoded e passava a exigir `product_catalog.estado_catalogo = 'homologado_ativo'` ao vivo. `tsc`/1595 testes confirmados passando no commit | Só o resumo do commit; código não conferido contra o estado atual desta branch |

**Isto não foi investigado a fundo nesta rodada** — abrir e ler as ~15 branches restantes de 03/09, mais
todo o resto de 04/09 e dias anteriores que possa ter o mesmo padrão, é trabalho de escopo próprio, não
cabe dentro do pedido original (12 documentos do Drive). Fica registrado como achado novo e como
pergunta de decisão (seção 5) porque muda o quadro geral: pelo menos uma dessas cinco branches contém
**código testado, não apenas documento**, esperando revisão para ir a `main`.

## 3. As seis arquiteturas de cadência encontradas — só uma vai além de D30, e não está implementada

### RÉGUA A — Onboarding WhatsApp automático D0–D30 (SUPERADA E PROIBIDA)
Fonte: doc 1, `CLUBE_ANCESTRAL_CRM_JOURNEY.docx`, 18/08, §3.1. Seis mensagens automáticas (D0 boas-vindas,
D1 tutorial, D3 alerta de achado, D7 relatório de progresso, D14 celebração, D30 NPS), todas com
responsável "Automático" e fallback WhatsApp em 24h se o app não for aberto. Revogada 24h depois pelo
doc 7 ("WhatsApp automático… fica fora do MVP") e nunca implementada — `whatsapp_automations` e
`micro_entregas` não existem em nenhuma migration.

### RÉGUA B — Cadência MVP D0–D30 (VIGENTE E IMPLEMENTADA)
Fonte: doc 7, `CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`, 19/08, §10:

> Cadência MVP: D0 checklist e responsável · D1–D3 revisão do plano inicial · até D7 primeiro valor
> verificável · D10 alerta de ausência de touchpoint · D14 alerta crítico · D30 check-in humano (NPS só
> se aprovado).

Transcrita literalmente em `src/lib/cadencia-d0-d30.ts` (`CADENCIA_D0_D30`, 6 momentos, com
`acaoInterna` × `entregaAoCliente`, `aprovacaoExtra: "NPS somente se aprovado"` em D30).

### RÉGUA C — Régua do caso-piloto Ana (D7/D10/D14) — a mesma decisão da Régua B, reafirmada
Fonte: doc 5, `ana_luiza_jornada_completa_e_prompts_v1_0.docx`, 19/08, Prompts Ana-05/Ana-07. Implementada
em `src/lib/onboarding-jornada.ts` (`regra: "D7" | "D10" | "D14"`) e `src/lib/onboarding-padrao.ts`.

### RÉGUA D — Catálogo `CAD-*` por evento (fora dos 12; nunca implementado)
Fonte: `docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_INDICADORES.md`,
31/08 — já apontado na Seção 10 de `2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md`. Dez
cadências por evento, sem dia fixo; `CAD-POS-RECONHECIMENTO` (`recognition_confirmed`) e
`CAD-RENOVACAO-LEGADO` (`subscription_renewal_due`) são **a única cobertura conceitual do território
pós-D30 em todo o acervo**. `communication_cadences` não existe em nenhuma migration.

### RÉGUA E — Catálogo `CAD-*` do eixo de comunicação (fora dos 12; variante, também nunca implementada)
Fonte: `docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md`. Dez cadências quase iguais à
Régua D, nomes divergentes (`CAD-RENOVACAO-ASSINATURA` em vez de `CAD-RENOVACAO-LEGADO`). Regra
anti-spam: "não enviar mais de um contato automático pelo mesmo canal em 48 horas".

### RÉGUA F — Mapa de cadências D0–D365, Ana Luiza como piloto e regra universal (a única que vai além de D30; NUNCA IMPLEMENTADA)
Fonte: política da Proprietária (03/09, texto não preservado como arquivo próprio) + de-para técnico
`docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md` (recuperado nesta
rodada — seção 2). Reconstrução do que o de-para preserva por citação direta:

- **D0** (seção 3 da política, 10 critérios): caso canônico e participantes identificados; contratante/
  partes confirmadas no CRM; produto/SKU e escopo reconciliados com fonte viva; perfil institucional
  vigente e gate contratual aprovado; contrato/OS revisados humanamente + assinatura; condição
  financeira confirmada; dossiê mínimo de onboarding definido; responsável/próxima ação/prazo
  registrados; conteúdo inicial do portal preparado e aprovado (se acesso liberado); nenhum bloqueio
  crítico de autorização/RLS/cadastro/integridade. Cruzado contra os 9 gates de `fechamento-caso.ts`:
  6 batem (exata ou aproximadamente), 4 não têm gate correspondente hoje (produto/SKU reconciliado,
  perfil institucional, conteúdo do portal, ausência de bloqueio crítico) — ver seção 5 do de-para.
- **App Cliente, Fase 01**: D0 fechada até gate `relatorio` + conteúdo; D1–D30 abre só quando aplicável;
  D31–D90 conclui/replaneja; D91–D365 vira histórico de Fase 01.
- **App Cliente, Fase 02**: D0–D30 bloqueada salvo condição excepcional; D31–D90 libera por gate `fase02`
  + condição.
- **Seção 6** (micro-entrega): um único conceito, 7 estados (preparada/em revisão/publicada/
  visualizada/ação pendente/concluída/arquivada), com `case_id`, pessoa autorizada, tipo, fase, origem/
  evidência, responsável, projeção cliente-facing, próxima ação, SKU opcional e datas de publicação/
  leitura/conclusão.
- **Seção 9**: Google Calendar como espelho de cadência — explicitamente **não deve ser ativado ainda**.

**Estado real contra essa régua, verificado pelo de-para de 03/09 e reconfirmado nesta rodada (04/09)**:

| Peça da régua F | Estado no código |
|---|---|
| D0 (10 critérios) | 6 de 9 gates de `fechamento-caso.ts` cobrem 5 dos 10 critérios; 4 critérios sem gate algum |
| Fase 01, D1–D30/D31–D90/D91–D365 | **Gap real** — `fase1Status` não modela janela de dias; estado "entregue" existe no tipo mas nenhum código escreve nele; não há vista de histórico |
| Fase 02, D31–D90 | **Gap real** — `escopoIncluiFase2` hardcoded `false`, sem caminho de código que mude isso |
| Micro-entrega, 7 estados únicos | **Gap + conflito ativo** — nenhum dos 4 mecanismos reais tem os 7 estados; `client_deliverables.approval_status` tem dois vocabulários conflitantes na mesma coluna (seção 2.1), confirmado ainda presente hoje |
| Google Calendar | Corretamente não ativado — nenhuma integração encontrada, consistente com a política |

A régua F é, portanto, **a única fonte com dias que passam de D30**. É exatamente o "resgate" que a
Proprietária pedia: não precisa ser decidida do zero (ao contrário do que a seção 2 desta rodada
concluiu antes da correção), precisa ser **executada** — o desenho já existe desde 03/09.

### RÉGUA F — execução aplicada nesta rodada, autorizada pela Proprietária ("pode executar a regra D0 até D365 em todos os níveis e abas e grupos que se aplique")

**1. Os 4 gates D0 sem correspondência foram criados** em `src/lib/fechamento-caso.ts` — o gate de
fechamento passa de 9 para 13, com sinal real por trás de cada um:

| Gate novo | Condição real | Fonte do dado |
|---|---|---|
| `produto_servico` | `case_services` do caso tem `product_catalog_id` referenciando um SKU com `estado_catalogo = 'homologado_ativo'` | mesma regra já usada por `preencherDeOrigens` (motor contratual) |
| `perfil_institucional` | `perfilInstitucionalRenderizado().vigente` (`src/lib/perfil-institucional.ts`) | mesma função já usada por `piloto-ana.functions.ts` |
| `conteudo_portal` | se `crm_casos.app_access_status = 'liberado'`, exige ao menos uma linha de `client_deliverables` com `approval_status` em `aprovado`/`publicado`; se o acesso não está liberado, o gate não se aplica (passa) | reaproveita o vocabulário já unificado nesta rodada (seção 2.1) |
| `sem_bloqueio_critico` | nenhum `case_alerts` com `criticidade = 'critico'` e `status = 'pending'` para o caso | — |

`caso_ativo` (o gate final) agora também exige `sem_bloqueio_critico`, e `contrato` agora depende de
`perfil_institucional` além dos gates que já dependia — refletindo a ordem D0 da política (produto/
perfil antes de contrato). `permite.casoAtivo` idem. 2 testes novos cobrem os dois gates condicionais
(`sem_bloqueio_critico` barrando `caso_ativo`; `conteudo_portal` só cobrando quando o acesso está
liberado).

**2. O que NÃO foi executado nesta rodada, por escopo/risco, e fica registrado como continuação**:
- Janelas de dia (D1–D30/D31–D90/D91–D365) para Fase 01/Fase 02 do App Cliente — mexe em
  `app-visibilidade.ts`/`portal-jornada.functions.ts`, caminho que decide o que o cliente **vê**;
  não fiz essa mudança sem revisão específica dela, dado o histórico de gap encontrado ali (comentário
  do código já citava tabela errada — seção 4.2 do de-para).
- Os 7 estados únicos de micro-entrega (`visualizada`, `ação pendente`, `concluída` como estados reais,
  não como timestamp) — exigiria unificar ou ligar `client_deliverables` e `ops_microentregas`, mudança
  de schema maior que os 4 gates.
- `escopoIncluiFase2` continua hardcoded `false` — a política já sinaliza (seção 4, App Cliente) que
  Fase 02 só libera "por gate `fase02` + condição", e esse gate/condição real ainda não existe em
  nenhuma fonte para eu implementar contra algo concreto.

Estas três peças continuam na régua F como trabalho real, não como decisão pendente — ficam registradas
no backlog (seção 6) para a próxima rodada.

### O que existe hoje no código, no lugar de uma régua longa
`CA-OPS-01`/`CA-OPS-02` (23/08) + `src/lib/fiacao-cadencia-catalogo.ts`: faixas de saúde (regular < 10
dias · atenção ≥ 10 · crítico ≥ 14) e 5 alertas derivados (`sem_touchpoint_10d`, `sem_atualizacao_14d`,
`sem_proxima_acao`, `sem_microentrega_planejada`, `caso_bloqueado`), sempre com
`ACAO_PERMITIDA = "abrir_preview_e_copiar_manual"` — nunca envio automático.

## 4. Contradições que ficam abertas (não fecham com este documento)

1. **Duas famílias de código de produto-pai na mesma data (19/08)**: doc 7 usa `CA-DIAG-*`/`CA-PESQ-*`/
   `CA-PROT-*`/`CA-POS-*`; doc 9 e o doc 4 (Prompt 06) usam `CA-CID-*`/`CA-HIST-*`/`CA-FAM-*`/`CA-WPP-*`.
   Não são sinônimos — `CA-MEM-002` significa coisas diferentes em cada família. Já registrada em
   `docs/governanca/DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md` como não reconciliada; **continua aberta**.
   Isto é o mesmo problema, com outra roupagem, da divergência PP-01–PP-09 × PP-01–PP-08 × PP-01–PP-14
   já registrada em `2026-09-04_RECONCILIACAO-PP01-14-vs-35-SKUS-ATIVOS.md` e
   `2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md` — três desenhos de produto-pai
   concorrentes, nenhum ratificado como taxonomia única.
2. **Formato do `case_id` da Ana em produção nunca foi formalmente aprovado**: `DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md`
   registra que o dicionário de 91 SKUs marca `CA-CID-[PAÍS]-NNN` como "FORMATO AMBÍGUO… proposta
   pendente de aprovação", mas é exatamente o formato em uso (`CA-CID-AT-FAM-2026-001`).
3. **Um prompt executável (doc 4, Prompt 06) manda gravar no `product_catalog` códigos que vêm do doc 9**,
   que é "PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA" no próprio cabeçalho. Não deve ser executado sem
   resolver o item 1.
4. **O doc 3 (inventário de 20/08) declara "pendente" trabalho que o repositório já entregou** (G02, G03,
   G04, G06) — não serve como leitura de estado atual; usar apenas como registro histórico.
5. Nenhuma das cinco contradições acima aparece nas 5 decisões abertas nem nos 15 itens da fila P0/P1/P2
   do Artefato Mestre de Resgate (02/09) — ou seja, elas ficaram de fora da última consolidação de
   prioridades, não por terem sido resolvidas, mas por não terem sido citadas.
6. **`client_deliverables.approval_status` grava dois vocabulários de estado conflitantes na mesma
   coluna** (seção 2.1) — achado do de-para de 03/09, confirmado ainda ativo em 04/09. Diferente das
   outras contradições desta lista, este é risco de **dado invisível entre telas em produção agora**,
   não só de documentação desalinhada. Candidato a P0, não a decisão de arquitetura de longo prazo.

## 5. Perguntas de decisão que só a Proprietária pode responder

1. **Vocabulário canônico de `approval_status`**: inglês (`onboarding-jornada.functions.ts`) ou
   português (`jornada-cliente.functions.ts`)? Sem essa decisão, corrigir o conflito da seção 2.1/item 6
   da seção 4 significa escolher um lado às cegas.
2. **Prioridade de implementação da régua F**: dos quatro gaps confirmados contra a régua F (D0 com 4
   critérios sem gate, Fase 01 sem janelas D1-D365, Fase 02 sem D31-D90, micro-entrega sem os 7 estados
   únicos), qual entra primeiro? A régua já está desenhada (seção 3, Régua F) — o trabalho que falta é
   de implementação, não de decisão de formato.
3. **A vedação escrita em `PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md:46`** ("nenhuma cadência deve
   ser uma sequência fixa universal") — ela foi escrita depois da política D0-D365 (a política é de
   03/09; não há data de criação confirmada para o documento da vedação nesta rodada) ou antes? Precisa
   de reconciliação explícita antes de qualquer implementação de janelas fixas D31-D365.
4. **Produtos-pai — qual documento é "as premissas de novos países enviadas ontem no motor do
   planejador universal"?** A Proprietária instruiu usar a lista de valores do de-para (documento 5 dos
   5 já reconciliados em `2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md` — já aplicado) e
   "aplicar primeiro" as premissas de países novos enviadas em 03/09 dentro do "motor do planejador
   universal". Esta rodada não conseguiu identificar esse documento com confiança: checados e
   descartados (sem conteúdo específico de países novos) `docs/de-para-motor-cidadania-tabelas-existentes-2026-09-03`
   e o resumo de `docs/de-para-planejador-cidadania-motores-unificados-2026-09-03`; não abertos por
   completo (só o commit) `docs/arquiva-planejador-universal-produtos-pai-jornada-2026-09-03` e
   `docs/de-para-motores-unificados-crm-vivo-2026-09-03`, candidatos mais prováveis pelo nome. Pode ser
   um desses, outra das ~20 branches de 03/09 (seção 2.4), ou as tabelas de país já incorporadas em
   `2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md` seção 5-7 (a partir do de-para, doc 5).
   Peço confirmação do nome exato ou do trecho, para não aplicar a ordem errada.
5. **Fazer a varredura completa das ~20 branches de 03/09 (seção 2.4)?** É trabalho de escopo próprio —
   pelo menos uma delas (`fix/produto-sku-catalogo-vivo-2026-09-03`) tem código testado esperando
   revisão, não só documento. Vale uma rodada dedicada, separada dos produtos-pai e da cadência.

## 6. Próximos passos

1. ✅ **Corrigido**: conflito de vocabulário de `approval_status` (seção 2.1) — decisão da Proprietária,
   português sempre prevalece. `client_deliverables` unificado, migration de backfill aplicada.
2. ✅ **Executado**: os 4 gates D0 de `fechamento-caso.ts` (régua F, subseção "execução aplicada nesta
   rodada") — autorizado pela Proprietária.
3. **Não executado ainda, registrado como continuação**: janelas de dia D1-D365 de Fase 01/Fase 02 do
   App Cliente, e os 7 estados únicos de micro-entrega — ver a mesma subseção para o motivo (mexe
   diretamente no que o cliente vê; exige unificar/ligar `client_deliverables` e `ops_microentregas`).
4. Reconciliar a contradição C-01 da seção 4 (duas famílias de código de produto-pai) antes ou junto com
   a decisão de produto-pai — são a mesma categoria de problema. Ainda aguardando confirmação da
   pergunta 4 da seção 5 (qual documento é "as premissas de novos países").

## 7. O que este documento NÃO decide

- **Não decide** qual vocabulário de `approval_status` vira canônico, nem qual dos gaps da régua F
  (seção 3, Régua F) é implementado primeiro — perguntas em aberto (seção 5).
- **Não decide** qual dos três desenhos de produto-pai é a taxonomia final.
- **Não revoga nem confirma** a vedação escrita contra cadência fixa universal, nem resolve sua data
  relativa à política D0-D365 (pergunta 3, seção 5).
- **Não copia a branch inteira `docs/de-para-cadencia-microentregas-planejador-2026-09-03`** para este
  branch de trabalho — só o documento de cadência foi recuperado; a branch pode conter outros commits
  não avaliados nesta rodada.
- **Não altera nenhuma linha de banco, nenhum arquivo de código de produto, nenhuma migration.**
