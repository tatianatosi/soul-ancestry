# Reverificação adversarial — Ficha Piloto da Giovanna (54 campos) + Bloco 5A

```yaml
data: 2026-09-27
motivo: A Proprietária desconfiou de FICHA-PILOTO-GIOVANNA-BLOCO-5A-EXECUTADO-2026-09-27.md
  ("não tenho certeza que não foi feito nem mapeado nem executado").
método: cada campo conferido por leitura direta do código (query → JSX → aba), sem
  aceitar o documento anterior como prova. Decisões citadas só quando achadas em
  arquivo/linha; sem isso, o campo vira GAP_REAL.
especificação original: docs/arquitetura/PESSOA-CANONICA-FICHA-PILOTO-GIOVANNA-PRADE-2026-09-02.md
especificação de tela aprovada usada como régua: docs/politicas/DE-PARA-COMPLETO-APP-DESK-2026-09-21.md
limite desta prova: estática (código + migrations + testes). Não houve sessão autenticada
  da Proprietária nem consulta ao banco de produção (MCP Supabase indisponível nesta sessão).
  Resultado para o registro de prova autenticada: BLOQUEADO_POR_DADO até prints reais.
```

## Resumo direto

**A suspeita da Proprietária era procedente.** O documento anterior declarou "conectado" ou
"substituído por decisão" para campos que, lidos no código, estavam **vazios, falsos ou só
funcionavam no caso de demonstração**:

| # campos | O que o documento anterior disse | O que o código mostra |
|---|---|---|
| 47–49 Histórico (3 marcos) | "gap pequeno, é marcos ou conversas?" | A seção era **texto fixo repetido duas vezes, sem nenhuma consulta**. A spec aprovada (DE-PARA §9 linha 5) pede "HISTÓRICO — eventos publicáveis". Tabela, coluna e policy de portal já existiam (`case_timeline_events`, `summary_client_approved`, `cte_select_portal`); **nenhum escritor** gravava `cliente_aprovado` e **nenhum leitor** existia. |
| 6, 28 Documento foco / Pendência principal | "conectado" | A aba Documentos só mostrava a frase genérica do motor ("Há 1 documento para você enviar.") — **nunca qual documento**, embora `portal_document_requests.titulo` seja legível pelo cliente (policy `pdr_sel_portal`) e já apareça na rota profunda `/portal/casos/$id`. |
| 39–40 Interseções (Momentos de União) | "conectado, e mais robusto que o anexo" | Só aparece para **dois IDs fixos da demo Sophia** (`portal-demo-sophia.ts:58-60`, `jornada.tsx:380-393`). Em caso real, nunca. |
| 19–21, 31 Pessoas centrais / gerações | "anonimização deliberada" | A spec aprovada (DE-PARA §6 linha 3) manda **exibir nomes/vínculos liberados**; o código anonimiza **sempre**, mesmo liberado. Não é decisão: é falta de fonte com policy de portal. |
| 44 Produto atual | "omitido por regra do Bloco 5A (SKU/preço)" | O Bloco 5A proíbe **SKU ou preço cru** (linhas 80, 616), não o nome do plano. A spec aprovada (DE-PARA §9 linha 3) pede "PLANO — o que está contratualmente publicado". Racionalização. |
| 41–42 Achados | "conectado em legado.tsx" | `legado.tsx` só lê o tipo `legado`; achados aparecem na Home e na Jornada, não na biblioteca. Conectado, mas não onde o documento disse. |

**Contagem:** dos 54 campos, **11 são gaps reais**:

- **8 que a auditoria anterior declarou resolvidos:** 6, 28 ("conectado"), 19, 20, 21
  ("anonimização deliberada"), 39, 40 ("conectado, mais robusto") e 44 ("regra de governança").
- **3 que ela reconheceu como gap, mas minimizou e deixou sem corrigir:** 47, 48, 49.

Destes 11:

- **Corrigidos agora no código (5 campos):** 6, 28, 47, 48, 49.
- **Pendentes de decisão ou autorização humana (6 campos):** 19, 20, 21 (árvore nominal),
  39, 40 (Momentos de União em caso real), 44 (plano contratado).

Há também duas observações sem veredito de gap: 25–26 (avisos na Conta) e 30 (a contagem de
"pessoas conectadas" conta publicações). Os outros 43 campos estão conectados de verdade ou
foram substituídos por regra escrita e localizável.

A seção 3 também corrige duas afirmações falsas do documento anterior sobre o Bloco 5A.

---

## 1. O que foi corrigido no código (commit desta rodada)

### 1.1 Histórico da Conta (#47–49) — cadeia completa, sem tabela nova

| Elo exigido (AGENTS.md artefato 010) | Onde |
|---|---|
| Fonte | `case_timeline_events` (já existia; já lida pelo Desk em `caso-ficha.functions.ts:59-65`) |
| Escritor real | **novo** `src/lib/timeline-caso.functions.ts` — `aprovarEventoTimelineParaCliente` / `revogarEventoTimelineDoCliente`, via `contextoOps` + `exigirEscrita` + `gravarComVerificacao` (relê e compara) |
| Validação | **nova** `validarAprovacaoEventoCliente` em `src/lib/timeline-caso.ts` — nunca aprova em branco |
| Persistência | colunas existentes `visibility` + `summary_client_approved` |
| UI do Desk | Caso 360 › Histórico › "Marcos aprovados para o App Cliente" (`casos.$caseId.index.tsx`) — aprovar exige escrever o texto da família; revogar volta a `interno` |
| RLS | policy existente `cte_select_portal` (migration `20260910184500`), nenhuma alterada |
| Leitor do App | `dadosVivosDoPortal` (`portal-dados-vivos.functions.ts`) lê `case_timeline_events` do caso ativo, `visibility = 'cliente_aprovado'`, limite 3 |
| Sanitização | **nova** `historicoSanitizado` (`portal-dados-vivos.ts`): só `summary_client_approved`, **nunca** `title`/`event_type`/`summary_internal`; passa por `contemConteudoInterno` + `textoParaCliente` como toda publicação |
| Tela | `src/routes/portal/conta.tsx` — seção `data-conta-marcos` "Marcos da sua jornada", estado vazio honesto. O texto duplicado de "Nossas conversas" virou uma linha só (mensageria continua fora de escopo). |

### 1.2 Documento foco / Pendência principal (#6, #28)

- `dadosVivosDoPortal` — a consulta **já existente** a `portal_document_requests` (antes só
  `case_id, status`, para contar) agora traz também `id, titulo, descricao, prazo, motivo_recusa`.
  Nenhuma consulta nova; policy `pdr_sel_portal` (migration `20260816212117`, linha 48).
- **nova** `solicitacoesAbertasCliente` (`portal-dados-vivos.ts`): só `aguardando`/`recusado`,
  com título, texto via `textoParaCliente`.
- `src/routes/portal/documentos.tsx` — "Solicitados" lista cada pedido pelo nome, prazo, motivo
  de recusa, e liga o envio ao pedido (`<EnviarDocumento casoId={casoAtivo} solicitacaoId={s.id} />`).
  Precedente de exibição ao cliente: `components/portal/caso-detalhe.tsx:157-193`.

### 1.3 Testes

- `src/lib/__tests__/reverificacao-ficha-giovanna-2026-09-27.test.ts` (8 casos) e
  `src/lib/__tests__/timeline-caso.test.ts` (4 casos).
- `portal-casos-modelo-de-acesso.test.ts`: contagem de `.in("case_id", alvo)` passou de 4 para 5
  (a invariante "toda consulta usa o mesmo caso" continua travada).

---

## 2. Os 54 campos, um a um

Legenda: **CR** = CONECTADO_REAL · **SD** = SUBSTITUIDO_POR_DECISAO_REAL · **GC** =
GAP_REAL_CORRIGIDO_AGORA · **GP** = GAP_REAL_PENDENTE_DE_DECISAO.
"Spec" = `docs/politicas/DE-PARA-COMPLETO-APP-DESK-2026-09-21.md`.

### Metadados

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 1 | ID do caso | SD | Interno por regra: Bloco 5A `BLOCO-5A_Arquitetura_Genealogica.md:92,117` ("nunca visível no App"); `conta.tsx:66-70` retirou o código; teste `app-isolamento-por-caso.test.ts:100-103`. Visível no Desk (Caso 360). |
| 2 | Nome do caso | CR | `portal_casos.titulo` via `meusCasos` (`portal-cliente.functions.ts` select `titulo`) → `index.tsx:141,335`. A própria Ficha diz "nome para uso interno"; o App mostra o título do caso. |
| 3 | Nome do cliente | CR | `portal_meu_cadastro.nome` (`portal.functions.ts:204`) → `conta.tsx:42,92`. |
| 4 | Status do caso | CR | `statusSimples` sobre `portal_casos.status` → `statusTexto` → `index.tsx:142,338`. |

### Home

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 5 | Rota provável | CR (na Conta) | `portal_meu_cadastro.pais_interesse` → `conta.tsx:43,96` ("Origem de interesse"). Não está no card da Home como a Ficha queria; a Home aprovada (Spec §3) não tem esse card. |
| 6 | Documento foco | **GC** | Antes: só frase genérica (`motor-caso.ts:127-135`). Agora: nome do pedido em Documentos (seção 1.2). A Home continua com a ação do motor + link "Ver documentos solicitados" (`index.tsx:371-376`). |
| 7 | Etapa atual | CR | `case_plans.fase_jornada` → view `portal_casos` → `etapaDoCasoCliente` (`portal-dados-vivos.ts:298-316`) → `index.tsx:162-170`. |
| 8 | Resumo do caso | SD | A Home aprovada (Spec §3 linhas 2–5) não tem bloco "Contexto": tem Etapa, Próxima ação, Achados, Microentrega. Texto de resumo chega como publicação `resumo` (`projecoes-cliente.ts:37`), exibida em Achados (`index.tsx:148-153`, 1 linha) e na Jornada. |
| 9 | Hipótese principal | SD | Proibido no App: Spec §3 linha 145 e §4 linha 171; AGENTS.md ("sem hipóteses como fato"); filtro `TERMOS_PROIBIDOS` inclui "hipótese" (`onboarding-jornada.ts:406-410`), teste `portal-dados-vivos.test.ts:92-101`. |
| 10–12 | Trilhas origem/cidadania/memória | SD | Mesmo motivo do #8 (Home aprovada sem "Contexto"). Conteúdo pode chegar como publicação; não há campo estruturado de "trilha". |
| 13 | País 1 | CR (na Conta) | Igual ao #5. |
| 14 | Aderência país 1 (88%) | SD | Spec §3 linhas 144/146: proibido "score de elegibilidade" e "percentuais inferidos"; Spec §5 linha 205 ("radar antigo com eixos diferentes dos seis"); `radar-seis-eixos.ts:147-166`. |
| 15–18 | País 2/3 + aderência | SD | A própria Ficha manda "deixar vazio"; % proibido pelo mesmo motivo do #14. |
| 19–21 | Pessoas centrais 1/2/3 | **GP** | Spec §6 linha 3: "Exibir somente nomes/vínculos liberados" — ou seja, liberado **deve** aparecer. O código nunca nomeia (`arvore.tsx:131-139`, `portal-arvore-geracoes.ts:48-59`). A fonte nominal `genealogical_person_profiles` tem `client_visibility` mas **não tem policy de portal** (`gpp_sel` = `is_org_member`, migration `20260820192635:48`; registrado em `BLOQUEIOS_CA_PORTAL_02`) e não tem coluna de geração. Paliativo existente: notas de publicação `arvore` (`arvore.tsx:156-184`). |
| 22 | Conexão-chave | CR | Publicação `arvore` → "Próxima atualização da árvore" (`arvore.tsx:170-181`) e Jornada. |
| 23 | Conexão territorial | CR | Idem #22. |
| 24 | Lacuna crítica | CR (com ressalva) | Idem #22; texto com "fonte", "evidência", "risco" é descartado pelo filtro (`onboarding-jornada.ts:406+`). |
| 25–26 | Título/texto do alerta | CR | Mensagem de engajamento = publicação mais recente em "Achados da sua história" (`index.tsx:389-419`). "Novidades para você" na Conta (`conta.tsx:52-57,116-146`) só mostra pendência acionável (documento/pagamento), não avisos publicados — a Spec §9 linha 4 pede "avisos publicados": observação, não corrigido. |
| 27 | Documento principal | CR | `documents.liberado_cliente = true` → `minhasEntregas` → `documentos.tsx:258-293`, com download. |
| 28 | Pendência principal | **GC** | Seção 1.2. |
| 29 | Status documental | CR | Recebidos/Liberados (`documentos.tsx:215-293`) + Radar Documentação (`radar-seis-eixos.ts:88-98`). |

### Origem (aba Radar/Árvore)

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 30 | Pessoas conectadas | CR (com ressalva) | `arvore.tsx:118-122` mostra "N pessoas conectadas", mas N = **nº de publicações `arvore`**, não de pessoas. Só é verdadeiro se a equipe publicar uma nota por pessoa — convenção não imposta em lugar nenhum. |
| 31 | Gerações lidas | SD | Spec §6 linha 1: "Sem contagem pública obrigatória". G1–G5 é moldura fixa (`portal-arvore-geracoes.ts:21-27`). |
| 32–34 | Bases externas (FamilySearch) | SD | Bloco 5A linhas 38, 431, 484 ("nunca citado no App", "nunca expor URL interna/fonte crua"); Spec §6 "Oculto". |
| 35 | Resumo do radar | SD | O texto da Ficha ("Itália lidera com aderência alta") é juízo de elegibilidade — Spec §3 linha 144. Substituído por 6 dimensões com legenda por eixo (`radar.tsx:81-106`). |
| 36 | Resumo da árvore | CR | Publicações `arvore` (`arvore.tsx:156-184`); não há campo de resumo estruturado. |

### Jornada

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 37 | Linha ancestral | CR | `jornada.tsx:435-437,499` a partir de publicações de tipo histórico (`jornada.tsx:16`). |
| 38 | Linha do cliente | CR | `jornada.tsx:438-440,502`. |
| 39 | Interseção 1 | **GP** | Só existe na demo: `UNIAO_DE_RAMOS_DEMO_SOPHIA` com IDs fixos `demo-sophia-03`/`-01` (`portal-demo-sophia.ts:58-60`); em caso real `pontes` fica vazio e `MomentosDeUniao` não renderiza (`jornada.tsx:287`, `380-393`). Criar um tipo de publicação para isso é vocabulário novo — exige decisão (AGENTS.md). |
| 40 | Interseção 2 | **GP** | Idem #39. |

### Descobertas

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 41–42 | Achado 1/2 | CR (lugar diferente do declarado) | Publicação `achado` → Home (`index.tsx:148-153`) e Jornada. **Não** aparece no Legado: `legadoSanitizado` só lê `legado` (`portal-dados-vivos.ts:190-194`). |
| 43 | Entregável | CR | Publicações `legado` nas prateleiras (`legado.tsx:54-160`) + documentos liberados. |

### Conta

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 44 | Produto atual | **GP** | Spec §9 linha 3 pede "PLANO — o que está contratualmente publicado". A tela mostra só "Sua jornada está sendo acompanhada pela equipe." (`conta.tsx:44,104-114`). A regra citada antes (Bloco 5A) proíbe SKU/preço, não o nome do plano. Fonte bloqueada: `contracts`/`case_services` sem policy de portal (`BLOQUEIOS_CA_PORTAL_02`). |
| 45 | Status da jornada | CR | Home (`statusTexto` + etapa) e Jornada (`ritmoRotulo`, `jornada.tsx:349-356`). Não repetido na Conta. |
| 46 | Última atualização | CR (com ressalva) | Publicação mais recente = 1º item de Achados na Home. `jornadaSanitizada` calcula `ultimaAtualizacaoEm` mas nenhuma tela a exibe (grep em `src/routes` e `src/components/portal`: zero). |
| 47–49 | Marcos 1/2/3 | **GC** | Seção 1.1. |
| 50 | Texto do upgrade | SD | Regra no código: `permiteUpsell: false` sempre; "Diagnóstico isolado: sem Fase 02 e sem upsell automático" (`app-visibilidade.ts:94,105,138`); teste `portal-dados-vivos.test.ts:103-113`. Um texto comercial de próxima etapa na Conta exigiria decisão da Proprietária. |

### Anexos

| # | Campo | Veredito | Evidência |
|---|---|---|---|
| 51–52 | Pastas de documentos/imagens | SD | Insumo interno (a Ficha manda "deixar vazio"). Desk: `drive_provisioning_queue` em `caso-ficha.functions.ts`. App: Bloco 5A linha 219 (`url_interna` "Nunca no App"). |
| 53 | Links de fontes extras | SD | Igual #32–34. |
| 54 | Regra de input/output | CR (como filtro) | Aplicada negativamente em toda saída: `publicacoesParaCliente` + `contemConteudoInterno` + `textoParaCliente`. O aviso "hipóteses em verificação" (`AVISO_PUBLICACAO_CLIENTE`, `projecoes-cliente.ts:53`) só aparece na rota profunda (`caso-detalhe.tsx:233`), não nas 7 abas. |

---

## 3. Protótipo morto e Bloco 5A — conferidos, não copiados

**Protótipo (`caseDataGiovanna.ts`, `caseAdapter.ts`, `kit-contratual.tsx`, `timeline-contratual.tsx`):
confirmado morto.** A única cadeia viva é `caseDataGiovanna` ← `case-directory` ←
`useActiveCase` ← `kit-contratual`. Nada importa `kit-contratual`, `timeline-contratual` nem
`caseAdapter`. `activeCase.ts` não tem importador. O único outro importador de
`caseDataGiovanna` é um teste (`radar-eixos-canonicos.test.ts:3`). `grep` em `src/routes/`: zero.

**Bloco 5A — duas afirmações do documento anterior estavam erradas, uma confere:**

1. "Confirmei lendo a migration `20260822205306`": essa migration define `status_pesquisa` e
   `client_visibility`. Ela **não** define o catálogo de fontes. `nivel_de_fonte` e
   `modo_de_uso_permitido` estão em `20260820203240` (linhas 40 e 42). O mapeamento M1/M2/M6 em
   si confere com esses valores.
2. "O vocabulário literal do Bloco 5A nunca foi implementado como CHECK": falso para
   `busca_negativa`. Ele é valor do CHECK `evidences_nature_ck` (`20260820193628:39`) e tem
   trigger próprio (`:193`, reconstruído em `20260923180000:286`). Os outros quatro
   (`dado_pesquisa_inicial`, `validado_por_documento`, `informacao_compartilhada_familia`,
   `pendente_confirmacao`) de fato não existem em migration.
3. O CHECK de `status_pesquisa` confere com AGENTS.md (`20260822205306:33-34`).

As decisões D-01/04/05/06 do Piloto 5A.1 não foram revistas aqui. São decisões de negócio e
continuam pendentes, como o documento anterior registrou.

---

## 4. Pendências que só a Proprietária pode destravar

| Campo(s) | O que falta | Tipo de decisão |
|---|---|---|
| 19–21 (árvore nominal) | Autorizar leitura pelo portal de pessoas com `client_visibility = 'aprovada'` (nova policy/projeção + migration) e definir como a geração G1–G5 é registrada por pessoa | RLS/migration + modelo de dado |
| 39–40 (Momentos de União) | Aprovar um tipo de publicação (vocabulário) para "interseção" em caso real, e quem a escreve | Vocabulário/produto |
| 44 (plano contratado) | Fonte portal-segura do escopo contratado (`contracts`/`case_services` sem policy) e o rótulo que o cliente lê, sem SKU/preço | RLS + texto comercial |
| 25–26 (observação) | Se "Novidades para você" na Conta deve listar avisos publicados (Spec §9 linha 4) além das pendências | Produto |
| 30 (observação) | Se "pessoas conectadas" deve continuar contando publicações ou passar a contar pessoas liberadas (depende de 19–21) | Produto |

## 5. Verificação

- `npx tsc --noEmit` sem erros.
- `npx vitest run --exclude '**/.claude/**'`: somente as 2 falhas de baseline pré-existentes
  (`app-isolamento-por-caso.test.ts`, `composicao-caso-home-jornada.test.ts`); fronteiras
  (`app-fronteira-pessoa-unificada-2026-09-24`, `golive-app-fronteiras`) verdes.
- `npx vite build` concluído.
- **Não comprovado em uso:** nenhum print autenticado. Para `COMPROVADO_EM_USO`, falta a
  Proprietária, logada: (1) aprovar um evento em Caso 360 › Histórico; (2) abrir o App do
  mesmo caso › Conta e ver o marco; (3) criar uma solicitação de documento e vê-la nomeada em
  Documentos; (4) recarregar e confirmar.
