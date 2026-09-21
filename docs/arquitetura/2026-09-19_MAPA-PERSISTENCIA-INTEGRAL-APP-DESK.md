# Mapa de persistência integral — App Cliente × Desk

- Status: rascunho
- Versão: v1.0
- Data: 2026-09-21 (nome do arquivo mantém 2026-09-19, data da ordem)
- Responsável pela decisão: Proprietária do Clube Ancestral
- Fonte de evidência: leitura direta de `origin/main` em `76e8968b`, worktree isolado (`execucao-tecnica-total`). Nenhuma linha inferida; onde não verifiquei, está declarado.
- Escopo: ordem "CLUBE ANCESTRAL — EXECUÇÃO TÉCNICA TOTAL" v3.0, Entregável 2. Complementa `2026-09-19_DE-PARA-INTEGRAL-APP-DESK-MOCKUP-APROVADO.md`.

## Vocabulário fechado (da própria ordem)

`PERSISTE` · `SIMULA` · `NÃO_PERSISTE` · `DIVERGENTE` · `SEM_PERMISSÃO` · `EXIGE_MIGRATION` · `EXIGE_DECISÃO`

Definições aplicadas aqui, para que a classificação não vire opinião:

- **PERSISTE** — grava em tabela real, relê após reload, e existe leitor.
- **SIMULA** — a UI dá sinal de sucesso sem gravação correspondente, ou grava em lugar que nada relê (sucesso visual sem efeito operacional).
- **NÃO_PERSISTE** — não há escrita; é leitura ou cálculo em runtime.
- **DIVERGENTE** — grava, mas em fonte concorrente à canônica, ou com vocabulário/coluna que não bate com o CHECK/schema.
- **EXIGE_MIGRATION** — a operação correta depende de coluna/tabela inexistente.
- **EXIGE_DECISÃO** — depende de escolha da Proprietária, não de código.

## 1. Infraestrutura de escrita (medida em `main`)

| Peça | Arquivo | Cobertura | Classificação |
|---|---|---|---|
| `gravarComVerificacao`/`inserirComVerificacao` | `src/lib/persistencia.server.ts` | 37 de 90 `*.functions.ts` | PERSISTE |
| `registrarTimelineCaso` | `src/lib/timeline-operacional.server.ts` | 22 de 90 | PERSISTE |
| `AcaoOperacional` (confirmação + motivo) | `src/components/saas/acao-operacional.tsx` | 47 arquivos | PERSISTE |
| `arquivarRegistro` (arquivamento lógico) | `src/lib/saas.functions.ts:743-755` | genérico | PERSISTE |
| `restaurarRegistro` genérico | — | **não existe** | NÃO_PERSISTE |
| `ESTADOS_SALVAMENTO` (vocabulário salvando/salvo/erro) | `src/lib/persistencia-erros.ts:44` | **0 consumidores em `src/`** | NÃO_PERSISTE (peça órfã) |
| `classificarErroPersistencia` | `src/lib/persistencia-erros.ts:33` | 1 tela | PERSISTE (subutilizado) |
| Dirty-state (`useBlocker`+`beforeunload`) | `casos.$caseId.index.tsx:472-495` | 2 de 105 telas | PERSISTE (não extraído) |

## 2. Planejador de Cidadania — a cadeia que falha

| Domínio | Rota | CTA | Ator | Entidade | Operação | Validação | Fonte de verdade | Persiste? | Desk | App | Auditoria | Estado UI | Gap | Prio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Planejador | `casos/$caseId` + `contrato/preparar` | Salvar planejador | Staff | `case_plans` | upsert | `avaliarPlanejador` só checa campo vazio | `case_plans` | **DIVERGENTE** | Form existe | Não lê | `revisao_humana: "pendente"` | sem estado de erro de escrita | `fase_jornada: null` em coluna NOT NULL → viola `23502` | **P0** |
| Planejador | idem | idem (campo Fase) | Staff | `case_plans.fase_jornada` | — | CHECK de 8 valores | `case_plans` | **NÃO_PERSISTE** | valor nunca enviado | lido como default | — | campo não existe no form | form envia `null` hardcoded (`planejador-operacional.tsx:115`) | **P0** |
| Planejador | idem | idem (Bloqueios) | Staff | `case_plans.bloqueios` | derivado | só `fontes` com `conflito` | `avaliarPlanejador:106` | **SIMULA** | sempre vazio | — | — | "sem bloqueio" indistinguível de "nunca avaliado" | `fontes: []` hardcoded (`:110`) | **P0** |
| Planejador | idem | Marcos / Microentregas | Staff | `case_plans.marcos[]`, `.microentregas[]` | write | — | `case_plans` | **SIMULA** | gravado | não lê | — | grava e some | **nenhuma tela relê** | P1 |
| Planejador | idem | Rota/país-via | Staff | `case_plans.rota_confirmada` | write | texto livre | 3 fontes concorrentes | **DIVERGENTE** | nenhuma tela exibe | não lê | — | — | concorre com `crm_casos.via` e `citizenship_tracks` | P1 |

`sincronizarPlanejador` (`cadeia-operacional.server.ts:102-192`) nunca escreve `marco_atual`, `proxima_microentrega`, `entrega_robusta_atual` nem `status_saude` — colunas existem e ficam no default.

## 3. Produto-Pai

| Domínio | Rota | CTA | Entidade | Operação | Fonte de verdade | Persiste? | Gap | Prio |
|---|---|---|---|---|---|---|---|---|
| Produto-Pai | `casos/$caseId` (AbaProdutoTrilha) | Selecionar produto | `case_services.product_catalog_id` | write | `case_services` | **PERSISTE** | — | — |
| Produto-Pai | idem | agrupamento PP-01…PP-09 | — | cálculo runtime | `PRODUTOS_PAI_CANONICOS` (TS) | **NÃO_PERSISTE** | código PP-XX nunca gravado; match por string do nome (`planejador-produtos-pai.ts:52-53`) | P1 |
| Produto-Pai | idem | trilha de cidadania | `case_services.citizenship_track_id` | write | `citizenship_tracks` | **PERSISTE** | única fonte estruturada de país/via | — |
| Produto-Pai | `/catalogo` | — | — | leitura | catálogo | **NÃO_PERSISTE** | única tela que mostra PP-XX, não conhece caso | P2 |

Ligar produto-pai ao caso de forma persistida **EXIGE_MIGRATION** (não há coluna) ou **EXIGE_DECISÃO** (usar `citizenship_tracks` como eixo em vez de criar coluna nova). Não executo nenhuma das duas sem autorização específica — a ordem proíbe migration sem proposta e autorização.

## 4. App Cliente

| Aba | Rota | Escrita? | Fonte | Persiste? | Sanitização | Gap | Prio |
|---|---|---|---|---|---|---|---|
| Home | `/portal` | não | `app_projections` via `usePortalVivo` | NÃO_PERSISTE (leitura) | `portal-dados-vivos.ts` | — | — |
| Jornada | `/portal/jornada` | não | `PASSOS_CASO` **hardcoded** (`:19`) | **SIMULA** | `jornadaSanitizada:79` | ver 4.1 | **P0** |
| Radar | `/portal/radar` | não | `app_projections` | NÃO_PERSISTE | `radarSanitizado:123` | — | — || Árvore | `/portal/arvore` | não | `app_projections` | NÃO_PERSISTE | `arvoreSanitizada:176` | — | — |
| Documentos | `/portal/documentos` | `useServerFn` | `documents`/projeções | PERSISTE | sim | — | — |
| Legado | `/portal/legado` | não | `app_projections` | NÃO_PERSISTE | `legadoSanitizado:190` | — | — |
| Conta | `/portal/conta` | `useServerFn` | `client_portal_access` | PERSISTE | sim | — | — |
| (fora da barra) | `/portal/mensagens/$id` | `useMutation` | atendimento | PERSISTE | sim | — | — |

**A fronteira de sanitização está correta**: o App lê `app_projections` (só publicado) e passa por funções puras. Não é gap. O gap do App é de **conteúdo** (jornada fixa), não de vazamento.

### 4.1 A trilha da jornada do App só tem passo atual em modo demo

Verificado em `origin/main`, e é pior do que "lista fixa":

- `PASSOS_CASO` (`portal/jornada.tsx:19`) é `["Onboarding","Pesquisa","Documentos","Validação","Entrega"]` — 5 rótulos que **não correspondem** às 8 fases canônicas de `FASES_JORNADA` (`onboarding-jornada.ts:45`). É vocabulário paralelo, contra a regra de autoridade 1.
- `passoAtualIndice` (`portal/jornada.tsx:318`) é `ehDemo ? PASSO_CASO_ATUAL_DEMO_SOPHIA_INDICE : null`. Para **cliente real é sempre `null`** — e `TrilhaCompacta` (`:134-140`) só marca "concluído"/"atual" quando o índice não é nulo. Ou seja: o cliente real vê a trilha inteira apagada, sem nenhum passo marcado. Só a demo tem passo atual.
- Nenhuma rota de `src/routes/portal/` lê `case_plans`, `fase_jornada` ou produto-pai. A view `portal_casos` (`portal.functions.ts:224`) projeta `id, codigo, titulo, pais, via, status, ativo, updated_at` — **sem fase**.

Consequência: a promessa "o cliente acompanha sua jornada" não se cumpre hoje para nenhum cliente real. Classificação: **SIMULA**.

**O que destrava, e o que falta.** O corte 1 fez o Planejador voltar a gravar `fase_jornada` válida, e o corte 3 deu produto-pai canônico ao caso — os dados passaram a existir. Falta levá-los ao App **sem romper a fronteira**: o portal não deve passar a ler `case_plans` direto; a fase precisa entrar na projeção. O caminho é estender a view `portal_casos`, e há precedente exato desse movimento (`20260827151500_portal_casos_onboarding_iniciado_em.sql`).

Isso é uma **segunda migration**, distinta da autorizada nesta rodada (que era `case_plans.produto_pai_id`), e mexe no que o cliente vê — logo toca visibilidade/sanitização. Fica registrado como **EXIGE_DECISÃO**, não executado. Os rótulos voltados ao cliente já existem e não precisam ser criados: `rotuloFaseCliente` (`fase-rotulo.ts:53`) devolve o texto de cliente para cada uma das 8 fases.

## 5. Pessoa, cliente e caso

| Domínio | CTA | Entidade | Persiste? | Observação | Prio |
|---|---|---|---|---|---|
| Cliente | Novo cadastro | `clientes` | PERSISTE | duplicidade preventiva por CPF/e-mail/telefone desde `76e8968b` | — |
| Lead | Salvar lead | `leads` | PERSISTE | writer único `salvarLeadDesk` em `/calls` e `/leads` | — |
| Conversão | Converter em cliente canônico | `clientes` + `crm_casos` | PERSISTE | `executarHandoffDiscovery`; caso só após cliente definido | — |
| Membro do caso | Reconciliar CPF | `case_members` | PERSISTE | conflito nunca sobrescrito | — |
| Perfil genealógico | Vincular a pessoa | `genealogical_person_profiles.client_id` | PERSISTE | opt-in humano | — |
| Arquivamento | Arquivar | `archived_at`/`archive_motivo` | PERSISTE | `archive_reason` em `cadeia-operacional.server.ts:651` é **DIVERGENTE** | P2 |
| Restauração | Restaurar | vários | **DIVERGENTE** | sem função genérica; 3 implementações dispersas | P2 |

## 6. Estados de UI — lacuna transversal

| Estado | Existe? | Onde | Classificação |
|---|---|---|---|
| Carregando / vazio / erro (leitura) | Sim | `EstadoDados`, 56 arquivos | PERSISTE |
| Retry de leitura | Sim | `EstadoDados:89` | PERSISTE |
| Acesso negado | **Não** como componente | vira texto dentro do erro | NÃO_PERSISTE |
| Salvando / salvo / erro (escrita) | **Não** padronizado | `ESTADOS_SALVAMENTO` órfão | NÃO_PERSISTE |
| Retry de escrita | **Não** | — | NÃO_PERSISTE |
| Dirty-state | Só em 2 telas | `casos.$caseId.index.tsx`, `contratos.$id.tsx` | PERSISTE (não extraído) |
| Duplo submit | Parcial | `AcaoOperacional:68-81` falha com `onConfirmar` síncrono; 51 arquivos usam `disabled={isPending}` ad-hoc | DIVERGENTE |

## 7. Fila de correção derivada deste mapa

1. **P0** — `fase_jornada`: form passa fase real do CHECK; `avaliarPlanejador` nunca emite NULL para coluna NOT NULL. (Bloco D)
2. **P0** — `fontes` deixa de ser `[]` hardcoded, para que `bloqueios` signifique algo. (Bloco D)
3. **P0** — App Jornada passa a derivar do caso real em vez de `PASSOS_CASO`. (Bloco D/F) — depende de 1 e 2.
4. **P1** — conectar `ESTADOS_SALVAMENTO`/`classificarErroPersistencia` como estado único de escrita. (Bloco A)
5. **P1** — fechar duplo submit do `AcaoOperacional` para `onConfirmar` síncrono. (Bloco A)
6. **P1** — extrair dirty-state para hook reutilizável. (Bloco A)
7. **P1** — relê `marcos[]`/`microentregas[]` ou parar de gravá-los. **EXIGE_DECISÃO**.
8. **P1** — persistir Produto-Pai no caso. **EXIGE_MIGRATION** ou **EXIGE_DECISÃO**.
9. **P2** — unificar microentregas (4 fontes). **EXIGE_DECISÃO**.
10. **P2** — `archive_reason` × `archive_motivo`; `restaurarRegistro` genérico.

Itens 7, 8 e 9 **não serão executados sem autorização específica** — envolvem migration ou decisão de modelo, e a ordem proíbe ambos sem proposta aprovada. Os demais são executáveis com o schema atual.

## 8. Limites desta execução

### 8.1 Radar — o que NÃO se toca (decisão da Proprietária, 21/09/2026)

O Radar do App é **6 dimensões de progresso/andamento**. Não é parecer jurídico, não é elegibilidade definitiva, não é garantia. **Os seis eixos não se alteram**, e o Radar do App não se confunde com o Radar Interno de quatro eixos do Desk. O percentual de progresso é legítimo — nenhum documento desta execução propôs removê-lo, e `radarSanitizado` (`portal-dados-vivos.ts:123`) consta aqui como conforme, sem gap.

Do Radar do cliente só sai o que é interno: comparação Desk/App, score técnico, gate interno e texto técnico.
Não publicou. Não tocou schema, RLS, migration, cobrança, assinatura, preço nem cláusula. Não criou entidade ou tela paralela. Nenhum acesso ao banco em runtime foi possível nesta sessão (sem credencial Supabase e MCP sem OAuth), então as classificações vêm de leitura de código, schema e migrations — o item P0 de `fase_jornada` é **defeito derivado do contrato NOT NULL**, ainda não observado em execução; a correção do Bloco D inclui teste que trava o contrato.
