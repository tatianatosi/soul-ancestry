# CA-DECISÕES-DA-PROPRIETÁRIA-E-LIMPEZA-PRÉ-UXUI — execução (09/09/2026)

## 1. Cabeçalho

- Data/hora: 09/09/2026.
- HEAD main no início: `7226048` (`fix(consolidacao): unifica proxima acao canonica, OS idempotente e dry-run blueprint`).
- Branch recovery sincronizada no início: `recovery/operational-authority-all-areas-2026-09-05` @ `c140ed5`.
- Ambiente: Supabase (projeto `zsxpdbhdvbuulwpepemd`), organização `11f32aae-ea08-47e0-8114-f5d8a900c9a1`.
- Checks ao final desta rodada: TypeScript `npx tsc --noEmit` — 0 erros. Testes `npx vitest run --exclude '**/.claude/**'` — 178 arquivos / 1704 testes, todos passando. Build não executado (não exigido pelo prompt).
- Migrations aplicadas nesta rodada: 1 aditiva de dado (`20260909030000_migra_blueprint_ana_para_case_plans`, ver seção 4) — nenhuma migration de schema.
- Limites respeitados: nenhuma tabela nova, nenhum planejador/portal/checklist/auditoria novos, nenhuma ação externa (e-mail, WhatsApp, convite, proposta, cobrança, assinatura, notificação, Drive, pesquisa), nenhum merge de PR antiga em lote, nenhuma alteração de RLS/autenticação/Planilha Mestre/SKU-como-premissa.

## 2. Matriz da Próxima Ação

| Tela | Antes | Depois | Fonte final | Override manual |
|---|---|---|---|---|
| Ficha 360 (`casos.$caseId.index.tsx`) | Já lia `obterProximaAcaoCanonica` (rodada anterior) | Passa também `proxima_acao_dependencia`/`proxima_acao_criterio_conclusao` como metadados da mesma ação, exibidos quando `origem="manual"` | RPC `proxima_acao_prioritaria` | `crm_casos.proxima_acao` (nível 8), com selo "Definida manualmente" e opção "Voltar à sugestão automática" |
| Lista de Casos (`casos.index.tsx`) | Já lia a RPC (rodada anterior); dependência/critério vinham de `l["proxima_acao_dependencia"]` cru, fora da função canônica | Dependência/critério agora vêm de `canonica.dependencia`/`canonica.criterioConclusao` — mesma função, não bloco à parte | RPC `proxima_acao_prioritaria` (via `listarEstadoAtivacao`) | idem |
| **Painel Hoje** (`painel.tsx` → `PainelDia` → `painelHojeDesk`) | Fila `casos_pendencia_documental` mostrava texto fixo próprio ("Documentos aguardados — pendência documental"), nunca a RPC | Mesma RPC em lote (`proxima_acao_prioritaria_lote`, já existia desde 07/09 mas não era usada aqui); o **filtro** que traz o caso para a fila continua sendo "documento mínimo pendente" (visão própria do Painel, permitida), mas o **texto exibido** é o da RPC, com o mesmo selo (`SELO_PROXIMA_ACAO`) | RPC `proxima_acao_prioritaria_lote` | idem, quando aplicável ao caso |
| Pessoa 360 | Não existe como tela dedicada (o rótulo aponta para `/pessoas/$clienteId`, que não tem nenhum conceito de próxima ação) | Sem alteração — não aplicável | — | — |
| App Cliente | Não expõe nenhum campo interno de próxima ação | Sem alteração — já correto | — | — |
| **Achado novo, corrigido** — `proxima_acao_responsavel` (Lista de Casos) vs. `responsavel_principal` (Ficha 360) | Dois campos reais para "responsável pela ação", nunca sincronizados | `registrarProximaAcao` agora grava `proxima_acao_responsavel: c.responsavel_principal` junto com o override manual — mesma linha do caso, sem apagar histórico | — | Convergência daqui em diante (sem backfill retroativo de linhas já gravadas, por regra do prompt) |
| `proxima_acao_dependencia` / `proxima_acao_criterio_conclusao` | Bloco exclusivo da Lista de Casos, fora da leitura canônica | Incorporados ao tipo `ProximaAcaoCanonica` (`dependencia`, `criterioConclusao`) — decisão: são metadados legítimos da mesma ação, não uma terceira fonte | — | — |

Terceira fonte de próxima ação: **classificada, não eliminada por exclusão de dado** — `proxima_acao_responsavel`/`dependencia`/`criterio_conclusao` são metadados reais (mantidos), e o par `responsavel_principal`/`proxima_acao_responsavel` agora converge por sincronização de escrita (mesmo padrão já usado para `proxima_acao`/`proxima_acao_codigo` na rodada anterior).

## 3. Matriz da OS

| Item | Antes | Depois |
|---|---|---|
| Escritor único | `emitirOuRecuperarOS` (já unificado na rodada anterior) | Sem mudança de escritor |
| `responsible_user_id` | Nunca escrito por nenhum caminho (sempre `NULL`) | Preenchido em todo INSERT: `caso.responsavel_id` quando o caso já tem responsável atribuído, senão quem está emitindo a OS agora (`input.userId`) — nunca vazio, nunca texto fictício |
| Autoria (`created_by`/`updated_by`) | Já usava `input.userId` real | Sem mudança |
| Idempotência | Já idempotente por `conteudo_hash` | Sem mudança |
| Origem rastreável (`origem`) | Já implementada na rodada anterior | Sem mudança |

Caminho manual (`salvarOrdemServico`) e automático (`emitirOSCadeia`) continuam chamando a mesma função — confirmado por leitura de código, sem novo teste de integração (ver seção 8, `TESTE_UI_PENDENTE_DE_HOMOLOGACAO`).

## 4. Relatório do blueprint (Decisão 3 — migração executada)

**Dry-run revalidado imediatamente antes de escrever** (SQL direto, somente leitura):

```
7 casos reais na organização.
0 conflitos (nenhum caso com dado em blueprint_parameters E case_plans simultaneamente).
1 caso somente em blueprint_parameters: CA-CID-AT-FAM-2026-001 (Ana),
  blueprint_parameters.id = 103c50e0-f3b8-43d5-b812-8dccba1a9c59.
```

Resultado idêntico ao dry-run da rodada anterior — nenhuma mudança de estado entre as duas execuções.

**Candidato migrado**: exatamente esse caso, via migration aditiva de dado `supabase/migrations/20260909030000_migra_blueprint_ana_para_case_plans.sql` (INSERT guardado por `WHERE NOT EXISTS`, idempotente).

**Campos migrados** (equivalência explícita apenas):

| `blueprint_parameters` | `case_plans` | Observação |
|---|---|---|
| `organization_id`, `case_id`, `family_id`, `case_service_id`, `product_catalog_id` | mesmos nomes | cópia direta |
| `entregas_previstas` (jsonb) | `entregas` (text[]) | mesma semântica, tipo convertido |
| `criterios_aceite` (jsonb) | — (sem coluna equivalente) | preservado como texto em `observacao_interna`, não descartado; não consumido por nenhuma regra de gate (`entradaDoPlano` nunca leu este campo — confirmado por leitura de código, apesar de um comentário desatualizado no arquivo dizer o contrário) |
| — | `fase_jornada`, `status`, `status_saude` | mantidos no **padrão da própria tabela** (`aceite_e_formalizacao`/`rascunho`/`regular`) — blueprint não declara equivalente; nada foi inferido, conforme regra "não resolver por inferência" |
| — | `objetivo`, `etapa`, `composicao`, `marcos`, `checklist_aplicavel`, `perguntas`, `responsavel_user_id`, `proxima_acao`, `prazo_proxima_acao` | ficam `null`/`[]` — sem fonte no blueprint, comportamento idêntico ao que já acontecia quando `materializarProposta` lia direto do blueprint |

**Origem registrada**: `case_plans.observacao_interna` grava o id do `blueprint_parameters` de origem, data/hora da execução, o nome desta rodada (`CA-DECISÕES-DA-PROPRIETÁRIA-E-LIMPEZA-PRÉ-UXUI-2026-09-09`, Decisão 3) e os critérios de aceite preservados em texto. `created_by`/`updated_by` = `1540b457-47c3-4365-b31d-e6ff8764fae5` (tati@pluggedresearch.com, Proprietária, staff_access ativo na mesma organização — autora desta autorização).

**Comparação antes/depois**: `blueprint_parameters.updated_at` idêntico ao valor pré-migração (`2026-09-08 23:56:40`) — confirmado sem alteração. `case_plans` para este caso não existia antes (`case_plan_id: null` no dry-run) e agora tem exatamente 1 linha ativa.

**Efeito em `materializarProposta`**: a função já escolhia "quem foi atualizado por último" entre as duas tabelas; com a migração, `case_plans` (recém-criado) passa a vencer esse desempate para este caso. Verificado por leitura de código que isso **não muda nenhum resultado observável**: a proposta de Ana é Canva/aprovada/não-rascunho, então `materializarProposta` sempre entra no ramo "vínculo somente" (não lê `escopo`/`valor`/`status` do plano nesse ramo); e `entradaDoPlano` não lê `criterios_aceite` (o único campo sem equivalência), então nenhuma regra de liberação do Planejador muda de resultado. Proposta, condição comercial, contrato e OS de Ana continuam apontando para os mesmos registros de antes — nada foi recriado.

**Rollback**: `delete from case_plans where id = '0eecd90a-7506-43e8-be88-55513bae2f75';` — reversível, não toca `blueprint_parameters` nem nenhuma outra tabela.

**Legado preservado**: `blueprint_parameters` não foi arquivado nem alterado; continua sendo a fonte de leitura da Ficha 360 (`carregarFichaCaso`) para este caso, sem mudança.

**Novas escritas de UI em blueprint_parameters**: já não existem (confirmado por busca no repositório inteiro — nenhuma tela ou função escreve nesta tabela). Nada a bloquear nesta rodada.

## 5. Matriz do `fn_documents_guard`

Nenhuma alteração de código nesta rodada — a proteção foi lida, não tocada.

| Ação com documento | Estado atual do guard | Decisão | Autorização adicional necessária |
|---|---|---|---|
| Registrar metadado mínimo (upload) | INSERT de categoria sensível (`identificacao`/`certidao`/`documento_civil`/`documento_financeiro`) fora do portal do cliente exige `consentimento_ativo` OU `consentimento_dispensado` — bloqueia o INSERT em si, não só publicação | Mantido — proteção LGPD real, não removida por conveniência | **Sim** — ver abaixo |
| Armazenar em área interna restrita | Mesmo bloqueio do item acima (o guard não distingue "guardar restrito" de "publicar/compartilhar") | Achado confirmado do relatório anterior (`2026-09-09_consolidacao_jornada_checklists_gates_execucao.md`): a equipe **não consegue nem guardar** um documento sensível de trabalho antes do consentimento formal, mesmo em área 100% interna | **Sim** — decisão jurídica/LGPD pendente, registrada como decisão da Proprietária (seção 10) |
| Compartilhar com terceiro/fora do escopo | Não há caminho de código que faça isso hoje; guard bloquearia por padrão | Mantido | Não |
| Publicar no App Cliente | Portal upload (`confirmarEnvioDocumento`) já força `pendente_de_revisao`/`interno_restrito` — nunca publica direto | Mantido | Não |
| Liberar ao cliente (`status='liberado'`) | Exige `visibilidade='cliente_quando_liberado'` E `is_staff_ativo` — não reavalia consentimento neste passo | Mantido — é autorização de papel, não LGPD; fora do escopo desta decisão | Não |

Conforme a regra do prompt ("se for necessária decisão jurídica/LGPD, pare e registre a escolha, sem alterar a proteção"): a proteção **não foi alterada**. A pergunta objetiva fica registrada na seção 10, decisão 1.

## 6. Matriz de autoria em proposta, condição e OS

| Campo | Fonte real (antes) | Valor antigo | Correção | Teste |
|---|---|---|---|---|
| `proposals.responsavel_comercial` | Texto fixo enviado pelo componente `CadeiaOperacional` | `"Comercial responsável"` (sempre, para qualquer usuário) | `materializarProposta` resolve `nomeResponsavelSessao(supabase, org, userId)` — lê `staff_access.full_name`/`email` da sessão real | `nome-responsavel-sessao.test.ts` (3 testes: nome cadastrado, fallback para e-mail, fallback final para o id da sessão) |
| `proposals.responsavel_operacional` | Texto fixo enviado pelo componente | `"Operações responsável"` (sempre) | `caso.responsavel_principal` quando o caso já tem responsável atribuído; senão, mesmo nome da sessão | idem |
| `service_orders.responsible_user_id` | Nunca escrito (sempre `NULL`) | `NULL` | `caso.responsavel_id` quando atribuído, senão `input.userId` | Verificado por leitura de código; sem teste de integração dedicado (ver seção 8) |
| `commercial_conditions.homologado_por` | Aceito como texto livre do cliente (`homologadoPor`) | Qualquer string que o front enviasse | Removido do `inputValidator`; resolvido no servidor com `nomeResponsavelSessao` | Coberto indiretamente pelos mesmos testes de `nomeResponsavelSessao` (mesma função, sem mock de integração para `salvarCondicaoComercial`) |
| `responsible_user_id`/`created_by`/`updated_by` vindo do navegador em qualquer outro ponto de proposta/condição/OS | Nenhum caso encontrado — todos os demais escritores já usavam `context.userId`/`input.userId` | — | Nenhuma correção necessária | — |

## 7. Inventário de referências `emitirOSAnexoI`

| Ocorrência | Classificação | Ação |
|---|---|---|
| `cadeia-operacional.server.ts:665` (comentário no docstring de `emitirOuRecuperarOS`) | Comentário histórico | Mantido — documenta a linhagem do rename, não é nome ativo |
| `docs/relatorios/2026-09-08_planejador_proposta_condicao_comercial.md` | Documentação histórica (anterior ao rename) | Mantido — registro de época |
| `docs/relatorios/2026-09-09_consolidacao_3_redundancias_criticas_execucao.md` | Documentação histórica (registra o próprio rename) | Mantido |
| `docs/relatorios/2026-09-09_consolidacao_jornada_checklists_gates_execucao.md` | Documentação histórica | Mantido |
| `.output/server/**` | Artefato de build obsoleto (pré-rename) | Fora do escopo — não é código-fonte, é gerado e será sobrescrito no próximo build |
| `.claude/worktrees/agent-*/**` | Cópias de worktrees de outros agentes, não a árvore de trabalho principal | Fora do escopo — não pertence a este branch |
| `.git/COMMIT_EDITMSG` | Mensagem de commit anterior, registrando o próprio rename | Não é conteúdo do repositório |

**Consumidores ativos do nome antigo em `src/`**: 0. **Aliases necessários**: 0 — nenhum consumidor externo depende do nome antigo. **Docs/scripts históricos**: 3 relatórios datados (registro de época, não alterados). **Nomenclatura humana aplicada**: sim, já — a UI sempre usou o rótulo "OS / Anexo I" (`cadeia-operacional.tsx`, `bloqueio-emissao-os.tsx`, `cadeia-formalizacao.tsx`), nunca o nome interno da função; "Anexo I" continua sendo vocabulário de negócio legítimo (documento contratual real) e não foi removido.

## 8. Testes técnicos/UI e limites de homologação

Executados e passando:
- `npx tsc --noEmit` — 0 erros.
- `npx vitest run --exclude '**/.claude/**'` — 178 arquivos / 1704 testes.
- Novos/alterados: `caso-ficha-proxima-acao-canonica.test.ts` (+2 testes: dependência/critério como metadados, fallback null), `crm-desk.test.ts` (+2 testes: Painel Hoje mostra texto/selo da RPC para caso com pendência documental; fallback seguro sem RPC), `cadeia-operacional.test.ts` (ajuste de tipo, sem mudança de comportamento), `nome-responsavel-sessao.test.ts` (novo, 3 testes), `materializar-proposta-canva-guard.test.ts` (ajustado à nova assinatura, mesmo comportamento validado).

`TESTE_UI_PENDENTE_DE_HOMOLOGACAO` (não executado nesta rodada — sem ambiente de homologação seguro; não foi usado nenhum caso real/pagante como laboratório):
1. Confirmar visualmente que o Painel Hoje mostra o mesmo texto de próxima ação que a Ficha 360 e a Lista de Casos para um caso real com pendência documental.
2. Confirmar que gerar uma proposta a partir do Planejador grava o nome real do usuário logado em `responsavel_comercial`/`responsavel_operacional` (não foi gerada nenhuma proposta real nesta rodada — a mudança foi validada por leitura de código e pelo teste unitário de `nomeResponsavelSessao`, não por execução do fluxo completo).
3. Confirmar que uma nova OS emitida (automática ou manual) grava `responsible_user_id` real.
4. Confirmar visualmente, na Ficha 360 de Ana, que o Planejador (`case_plans`) recém-migrado não introduziu nenhuma regressão perceptível na aba de consolidação.

LGPD/documentos: nenhuma alteração de RLS, consentimento ou isolamento nesta rodada — apenas leitura e documentação do `fn_documents_guard` (seção 5).

## 9. Commits/PRs/migrations e reversão

- Migration aditiva de dado: `supabase/migrations/20260909030000_migra_blueprint_ana_para_case_plans.sql` (aplicada via Supabase MCP, idempotente por `WHERE NOT EXISTS`). Reversão: `delete from case_plans where id = '0eecd90a-7506-43e8-be88-55513bae2f75';`.
- Nenhuma migration de schema.
- Commit(s) de código: ver resposta final (seção 11) para o SHA exato após push.
- Reversão de código: `git revert <sha>` no commit desta rodada (não houve alteração de schema para reverter além do dado acima).

## 10. Decisões restantes da Proprietária

1. **`fn_documents_guard` e consentimento**: hoje o guard bloqueia até o *armazenamento em área interna restrita* de um documento de categoria sensível sem consentimento/dispensa já registrada — não só a publicação/compartilhamento. Isso é intencional (evitar até a posse do dado sem base legal) ou deveria permitir "guardar restrito, sem uso" antes do consentimento formal, como o prompt cogita? Esta decisão precisa de aval jurídico/LGPD explícito antes de qualquer mudança no guard.
2. Autorização para o Painel Hoje adotar a mesma régua RPC-canônica também no card de "caso em destaque" (`escolherCasoDestaque`) e nas demais filas de leads (hoje corretamente fora de escopo, pois lead ainda não tem caso) — ou manter como está, já que o único ponto com caso real (`casos_pendencia_documental`) foi convergido nesta rodada?
3. As 5 decisões da rodada anterior (jornada/checklists/gates) que não foram objeto direto deste prompt continuam abertas sem novidade: Painel Hoje (parcialmente respondida acima), consentimento em documentos internos (mesma pergunta do item 1), e responsáveis ausentes/fictícios em proposta/condição/OS (resolvida nesta rodada, ver seções 3 e 6).
