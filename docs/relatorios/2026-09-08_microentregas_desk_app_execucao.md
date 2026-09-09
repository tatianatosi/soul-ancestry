# Microentregas Desk → App Cliente — fecha a cadeia (execução)

```yaml
status: executado
data: 2026-09-09
responsável pela decisão: Proprietária do Clube Ancestral
escopo: localizar o escritor/leitor real de microentrega, normalizar o vocabulário de
  estados, garantir os campos mínimos, ligar as ações do Desk que faltavam e conectar
  Home/Jornada/Legado do App Cliente à mesma fonte já segura — sem taxonomia nova, sem
  planejador novo, sem portal novo, sem tabela de entrega nova, sem checklist nova, sem
  auditoria nova.
limites respeitados: nenhuma alteração em contrato, preço, SKU, Planilha Mestre, RLS,
  autenticação, convites, WhatsApp, e-mail, Drive ou cobrança nesta rodada.
```

## 1. Escritor canônico da microentrega

Antes de mexer em qualquer coisa, mapeei todo escritor/leitor real de "entrega" no
código (não só o que os prompts descreviam). Achado central: **existiam dois sistemas
paralelos para o mesmo conceito**, e só um deles está ligado de ponta a ponta.

| Sistema | Tabela | Escritor | Leitor App Cliente | Situação |
|---|---|---|---|---|
| **Biblioteca de Evidências (G-03)** | `app_projections` | `salvarProjecao`/`aprovarProjecao`/`arquivarRegistroG03` (`biblioteca-evidencias.functions.ts`), UI real em `/biblioteca-evidencias/$caseId` | `portal_projecoes` (view sobre `app_projections`, RLS `app_proj_select_portal` já comprovada) → `meuCaso()`, `dadosVivosDoPortal()` | **Escritor canônico** — já wired ponta a ponta, já usado por Home e Jornada |
| Onboarding-jornada "entregas" | `client_deliverables` | `salvarEntregaCliente`/`aprovarEntregaCliente`/`publicarEntregaCliente` (`onboarding-jornada.functions.ts`) | nenhum — `listarEntregasPublicadas` nunca é chamado por rota alguma | **Morto**: nenhuma tela do Desk chama esses escritores; nenhuma tela do App lê `client_deliverables`. Já documentado como bloqueado em `BLOQUEIOS_CA_PORTAL_02` (`client_deliverables` só tem RLS `is_org_member`, sem policy de portal). |

**Decisão, seguindo a regra "sem dedup, manter somente uma"**: `app_projections` (via
`biblioteca-evidencias.functions.ts`) é o escritor canônico. `client_deliverables`
**não foi tocado nem apagado** — continua existindo, sem uso real, exatamente como já
estava documentado. Não recriei nem estendi esse sistema morto.

## 2. Estados antigos mapeados

`app_projections.approval_status` (a coluna real, único escritor/leitor ativo) tinha 5
valores: `draft`, `in_review`, `approved`, `published`, `archived`. Adicionei uma
função pura de normalização (`estadoMicroentrega()`, `src/lib/biblioteca-evidencias.ts`)
que traduz para o vocabulário de 7 estados pedido, **sem migrar dado nem renomear
coluna** — registros antigos continuam lidos e funcionando:

| Estado pedido | `approval_status` real | Observação |
|---|---|---|
| planejada | — | Não existe hoje: o fluxo real começa direto em rascunho. Não inventei uma distinção que o dado não sustenta. |
| em_producao | `draft` | |
| em_revisao | `in_review` | |
| aprovada | `approved` | |
| liberada | `published` + `effective_from` futuro ou nulo | Reaproveita a coluna que já existe — sem campo novo |
| publicada | `published` + `effective_from` já vigente | Mesma coluna que "liberada"; é o que a view `portal_projecoes` realmente mostra |
| arquivada | `archived` | |

## 3. Campos mínimos — o que já existia e o que faltava

`app_projections` já tinha: `case_id`, origem/evidência (`source_entity_type` +
`source_entity_id`, genérico), responsável (`created_by`/`approved_by`), destino
(`destination`: app/one_page/pdf_aprovado), conteúdo cliente-facing
(`content_sanitized`). Conteúdo interno **não é um campo da projeção** por desenho: vive
na evidência de origem (`title_internal`/`description_internal`) — misturar os dois na
mesma linha romperia o princípio do próprio sistema ("integração invisível, evidência
visível"). Preservei esse desenho.

Faltava pessoa/núcleo e prazo. Migration aditiva (`20260909010000_app_projections_pessoa_prazo.sql`),
nula, sem tocar RLS nem apagar dado:

```sql
alter table public.app_projections
  add column if not exists pessoa_id uuid null references public.research_people(id),
  add column if not exists due_at timestamptz null;
```

## 4. Elo novo: marco jurídico → microentrega

Até ontem, a única origem possível de uma projeção era `source_entity_type = "evidence"`.
Adicionei `marcoJuridicoProjetavel()` (mesma trava de `evidenciaProjetavel`, mas a favor
da regra jurídica: só `versioned_legal_rules.status = "aprovado"` e não arquivada) e
estendi:

- `painelBibliotecaEvidencias` agora busca as trilhas do caso (`case_services.citizenship_track_id`)
  e as regras jurídicas aprovadas ligadas a elas (`versioned_legal_rules`) — os mesmos
  dados que fechei ontem na consolidação trilha→regra→marco.
- `FormProjecao` (UI) ganhou um seletor "Tipo de origem": Evidência de pesquisa ou
  Marco/regra jurídica do caso. Só regra aprovada aparece na lista.
- Ao criar a partir de uma regra, a projeção nasce com `source_entity_type = "legal_rule"`.

Cadeia completa agora possível de ponta a ponta: marco jurídico aprovado (Áustria,
Itália, Portugal... — os 8 da primeira onda) → projeção rascunho → revisão → aprovação
→ liberação/publicação → App Cliente.

## 5. Ações do Desk — criadas/reusadas

| Ação pedida | Implementação |
|---|---|
| Criar microentrega | `salvarProjecao` — já existia, reusado |
| Revisar | **Nova**: `revisarProjecao` — `draft`/`approved` → `in_review`. Antes não existia ação explícita para isso (só dava para pular direto para aprovar). Botão "Enviar para revisão" na UI. |
| Aprovar | `aprovarProjecao(publicar:false)` — já existia, reusado |
| Liberar/publicar | `aprovarProjecao(publicar:true)` — já existia, reusado |
| Despublicar | **Nova**: `despublicarProjecao` — volta para `approved` e zera `effective_from`. Reversível, diferente de arquivar (que exige motivo e é definitivo). Botão "Despublicar" aparece quando a microentrega está liberada/publicada. |
| Preparar rascunho de alerta, sem envio externo | **Nova**: `prepararAlertaProjecao` — insere em `case_alerts` (mesma tabela já usada por `registrarProximaAcao`), `status: "pending"`. Nenhum WhatsApp, e-mail ou envio externo é chamado — respeitando o limite da rodada. |

Todas as ações passam por `autorizarEscrita()` (papel do usuário) e reusam
`invalidateQueries` no React Query — nenhuma ação nova inventa mecanismo de
persistência.

## 6. Rotas Desk e App conectadas

- **Desk**: `/biblioteca-evidencias/$caseId` — já existia, ganhou os 3 botões novos e o
  seletor de origem por marco jurídico.
- **App Cliente Home** (`/portal/casos/$id`, seção "Publicado pela equipe"): já lia
  `portal_projecoes` via `meuCaso()`. Sem alteração — já correto.
- **App Cliente Jornada** (`/portal/jornada`): já lia `portal_projecoes` via
  `usePortalVivo()` + `jornadaSanitizada()`. Sem alteração — já correto.
- **App Cliente Legado** (`/portal/legado`): **estava travada** — tela estática
  ("Nenhum material de legado publicado") que nunca consultava nada. Conectei à mesma
  fonte segura (`usePortalVivo()` + nova `legadoSanitizado()`, filtrando
  `projection_type = "legado"`), sem RLS nova — a view `portal_projecoes` já cobre
  qualquer `projection_type`. Adicionei o rótulo "Entrega de legado" em
  `TIPO_PROJECAO_ROTULO`.
- **`/portal/entregas`**: continua com a tela estática — fora do escopo explícito desta
  rodada (a instrução cita Home/Jornada/Legado, não uma quarta tela). Registrado como
  observação, não corrigido.

## 7. Testes: salvar → reload → despublicar

- `estadoMicroentrega()`: 6 casos (draft/in_review/approved/archived/published-futuro/
  published-vigente) — `src/lib/__tests__/biblioteca-evidencias.test.ts`, teste 11.
- `marcoJuridicoProjetavel()`: regra em revisão bloqueia, regra aprovada e arquivada
  bloqueia, regra aprovada e ativa libera — teste 12.
- `legadoSanitizado()`: só publica tipo `legado`, bloqueia conteúdo com termo interno —
  `src/lib/__tests__/portal-dados-vivos.test.ts`.
- Persistência/refetch: todas as mutações (criar, revisar, aprovar, despublicar,
  arquivar, alerta) chamam `invalidateQueries(["g03", caseId])` no sucesso — o mesmo
  padrão já usado pelas ações antigas (`mNova`, `mAprovar`). Isso recarrega a lista
  inteira do servidor a cada ação: **não há caminho de duplicar item em refetch**,
  porque a lista nunca é montada por append local, sempre por reload completo.
- **Não testado ao vivo no navegador**: sem sessão autenticada disponível nesta sessão
  (mesma limitação já registrada em rodadas anteriores — ver seção 8). `npx tsc --noEmit`
  limpo e os 1692 testes automatizados (177 arquivos) passam, incluindo os 5 novos.

## 8. Dados internos explicitamente bloqueados no App

Nada mudou na fronteira de sanitização — reusei as travas existentes:

- `conteudoProjetavel()` continua recusando URL/link/referência de arquivo interno e
  qualquer termo de hipótese, risco, transcrição, nota interna, confidencial,
  probabilidade, chance de êxito, garantia ou parecer jurídico — testado antes de
  qualquer conteúdo (evidência ou marco jurídico) virar projeção.
- Nenhum campo novo (`pessoa_id`, `due_at`, `tema`/`fonte_referencia` da regra jurídica)
  é exposto ao cliente — `pessoa_id`/`due_at` não entram em `ProjecaoBruta`
  (`portal_projecoes` só expõe `id, case_id, projection_type, content_sanitized,
  effective_from, updated_at`); `tema`/`fonte_referencia` aparecem só no seletor interno
  do Desk, nunca em `content_sanitized` automaticamente — quem escreve o texto
  cliente-facing é sempre a pessoa da equipe, à mão.
- `regraAplicavelACaso`/`marcoJuridicoProjetavel` seguem a mesma régua: regra jurídica
  em rascunho, em revisão ou arquivada nunca vira opção selecionável de origem.

## 9. Pendências de login Cliente A/B

Sem mudança em relação ao que já estava documentado (`2026-09-08_p0_contrato_ana_go_live_app_cliente.md`,
seções 5 e 6) — esta sessão também não tem navegador autenticado disponível:

- Existe um login de teste de homologação ("Cliente A"), mas não é a conta real da Ana
  — usá-lo misturaria evidência de teste com evidência do caso real.
- Não existe hoje um "Cliente B" de homologação criado e autorizado, então a prova
  negativa de isolamento (Cliente B não conseguir ver dado da Ana) continua não feita
  ao vivo — só por leitura de schema (`portal_caso_permitido`, `client_portal_access`).
- Nada nesta rodada mexeu em RLS, autenticação ou convites — o isolamento entre
  clientes segue exatamente como estava antes desta execução.

## 10. Commits/PR e reversão

- Migration de schema (aditiva, aplicada via Supabase MCP e versionada em
  `supabase/migrations/20260909010000_app_projections_pessoa_prazo.sql`).
- Código: `src/lib/biblioteca-evidencias.ts`, `src/lib/biblioteca-evidencias.functions.ts`,
  `src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx`,
  `src/lib/portal-dados-vivos.ts`, `src/lib/projecoes-cliente.ts`,
  `src/routes/portal/legado.tsx`, mais os 2 arquivos de teste.
- Commit único nesta rodada, enviado direto para `main` (mesmo fluxo desta sessão:
  branch a partir de `origin/main`, `tsc`/`vitest` limpos, fast-forward, sync da branch
  de recuperação).
- **Reversão**: `git revert` do commit desfaz todo o código sem efeito colateral — as
  duas colunas novas (`pessoa_id`, `due_at`) são nulas e aditivas, e podem ficar no
  banco sem uso caso o commit seja revertido (não quebram nada mesmo sem o código que
  as lê). Nenhum dado existente foi apagado, movido ou renomeado.
