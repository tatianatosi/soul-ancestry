# P14 — Múltiplos ramos por caso: já construído, nunca aplicado (2026-09-26)

```yaml
status: executado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Pode executar múltiplos ramos por caso verifique os demais itens que estão
  pendentes para adicionar e verifique se está aplicando. E veja como na auditoria o caso da
  Ana como deve ser aplicado"
fontes:
  - Auditoria de Coerência — Produto-Pai, Jornada, Planejador Universal e Legado (v1.0, 04/09/2026),
    colada pela Proprietária nesta rodada
  - docs/arquitetura/2026-09-25_dedup-trilhas-motor-juridico-paises-baixos.md (P12 — trilha
    canônica de Áustria)
  - schema real do Supabase (projeto 1a628b61-ec68-454f-85e1-671d6f297370), consultado ao vivo
    em 26/09/2026
```

## Achado central — não é um gap de schema, é um gap de aplicação

Antes de escrever qualquer migration, verifiquei se "múltiplos ramos por caso" (Cenário E da
auditoria: ramo paterno + ramo materno, cada um com sua trilha, uma base de pesquisa
compartilhada) já existia sob outro nome — como aconteceu repetidamente nesta sessão com
`citizenship_tracks`, `case_services`, `price_catalog_rescued` etc.

Confirmado por leitura direta do schema real e do código:

- **`lineage_paths`** já é, literalmente, a entidade "ramo/branch" da auditoria: colunas
  `case_id`, `family_id` (FK para `nucleos_familiares`), `nome_da_linha`, `pessoa_ancora_id`
  (FK para `research_people`), `tipo_da_linha` (CHECK: `paterna`, `materna`, `direta`,
  `colateral`, `cidadania`, `memoria_legado`, `dupla_familiar`, `alternativa`, `a_confirmar`),
  `citizenship_track_id` (FK para `citizenship_tracks`) — a ligação ramo↔trilha que a
  auditoria pede em `nationality_track.branch_id`.
- **`research_cases`** já suporta o "esforço incremental por trilha" da auditoria:
  `citizenship_track_id` é nullable — uma linha com `citizenship_track_id = null` é a base de
  pesquisa **compartilhada** do caso/família; uma linha com o campo preenchido é pesquisa
  **específica** de uma trilha. `research_people`/`research_sources`/`research_evidence_items`
  são todas escopadas por `research_case_id` (nunca por `case_id` direto), então a base
  compartilhada nunca duplica automaticamente ao abrir uma segunda trilha.
- **`case_services`** não tem `unique constraint` em `case_id` — múltiplas linhas por caso já
  são permitidas ao nível de banco, cada uma com seu próprio `citizenship_track_id`,
  `escopo_aprovado` e `condicao_comercial_aprovada`.
- **Leitor + escritor + UI já existem e já publicados**: `pessoas-linhagens.functions.ts`
  (`painelPessoasLinhagens` lê `lineage_paths` do caso sem `limit`/`maybeSingle` — sempre lista;
  `salvarRegistroG02` insere uma nova linha sempre que chamado sem `id`, sem nenhuma restrição
  de "uma linhagem por caso") e `pessoas-linhagens.$caseId.tsx` (aba "Linhagens" já tem
  formulário de nova linha + lista de todas as linhas do caso, com o texto explícito: *"Linha
  dupla é configuração de análise: o mesmo caso aceita várias linhagens, sem duplicar pessoa nem
  criar caso novo."*).

**Verificação de uso real**: `select case_id, count(*) from lineage_paths group by case_id`
devolveu **zero linhas em toda a organização** — a tabela nunca foi populada para nenhum caso
real, apesar de pronta desde antes desta sessão. Este é exatamente o tipo de achado que o
`AGENTS.md` pede para relatar com precisão: "código e teste" não é "motor operado" — aqui havia
código, teste e UI reais, mas **zero aplicação**.

## O que foi feito — nenhuma tabela nova, só aplicação ao caso real

Não fabriquei o Cenário E (ramo paterno Italiano + ramo materno Alemão) — é um "exemplo
arquitetural" da própria auditoria, sem correspondência a nenhum caso real hoje (confirmado:
não existe caso "Danilo" em `crm_casos`, só o lead "Amigo do Danilo", sem caso ativo). Criar
uma segunda trilha fictícia para demonstrar multi-ramo seria fabricar dado, proibido pelo
`AGENTS.md`.

Apliquei a infraestrutura ao único caso real qualificado — **Ana Luiza** (Cenário C da
auditoria: caso familiar composto, trilha única Áustria §58c, condição particular de proposta),
usando somente ids já existentes:

1. **`lineage_paths`**: uma linha nova — `case_id` = Ana Luiza (`CA-CID-AT-FAM-2026-001`),
   `family_id` = núcleo Silveira/Friedmann-Reimer (já cadastrado), `pessoa_ancora_id` = Ana
   Luiza (já cadastrada em `research_people`), `tipo_da_linha` = `cidadania` (vocabulário já
   existente no CHECK), `citizenship_track_id` = a trilha canônica de Áustria (a mesma
   corrigida no dedup do P12), `status` = `em_estruturacao` (compatível com
   `case_services.status = draft` e `case_plans.fase_jornada = aceite_e_formalizacao`).
2. **`research_cases.family_id`**: preenchido com o mesmo núcleo, fechando a cadeia caso →
   família → linha → trilha → pesquisa que a auditoria descreve (seção 7.3), sem tocar
   `citizenship_track_id` (continua `null` — é a base de pesquisa compartilhada do caso, não
   presa a nenhuma trilha específica).

Migration: `supabase/migrations/20260926100000_multiplos_ramos_por_caso_aplicado_ana.sql`
(idempotente — `where not exists`/`where family_id is null`).

## Por que isso já resolve "bloquear cobrança duplicada da mesma base de pesquisa" sem código novo

A auditoria pede: "O motor deve bloquear a cobrança duplicada da mesma base de pesquisa." Como
`research_people`/`research_sources`/`research_evidence_items` são escopados por
`research_case_id` — e uma família pode ter **uma** `research_cases` compartilhada
(`citizenship_track_id = null`) mais **N** `research_cases` incrementais (uma por trilha
específica) —, a duplicação simplesmente não tem caminho de dado: abrir uma segunda trilha para
a mesma família cria uma nova `research_cases` incremental, nunca duplica a base compartilhada.
Isso é uma propriedade do desenho já existente, não uma regra nova a codificar.

## Verificação (após sincronizar com edições do Lovable em `main`)

Ao rodar o pipeline, `git fetch`/`git log HEAD..origin/main` mostrou 5 commits novos da própria
Proprietária no editor do Lovable (ajustes de texto do App Cliente em `src/routes/portal/*` e
`roadmap.md`, e `types.ts` regenerado) — sem relação com este corte. Fast-forward limpo, sem
conflito. `tsc --noEmit` agora limpo por completo (o erro pré-existente de `portal/index.tsx`
foi corrigido pela própria edição da Proprietária). Suíte completa idêntica à baseline (7
arquivos/11 testes falhos, todos visuais/portal, sem relação com este corte). Teste novo
(`p14-multiplos-ramos-por-caso-2026-09-26.test.ts`: escritor genérico nunca restringe a uma
linha por caso, leitura sempre lista, UI já declara suporte a múltiplas linhagens, migration usa
só ids já existentes, é idempotente, `tipo_da_linha` usa vocabulário já existente). `vite build`
limpo. Migration aplicada ao banco real e registrada em `schema_migrations`.

## Não fazer sem decisão adicional

- Não fabricar um segundo caso/trilha (Cenário E) sem um caso real multi-país existir.
- Não escrever `pais_interesse`/`nacionalidades_interesse` dos leads João/"Amigo do Danilo" fora
  do pipeline real de achado (`aplicarAchado`) — isso pertence ao fluxo de Mesa Discovery, não a
  uma escrita direta de banco.
- Não construir um guard de "bloqueio de cobrança duplicada" novo — o desenho existente
  (research_cases por trilha, nunca por caso) já impede a duplicação por construção.

## Prova Lovable pós-push

Abrir `/pessoas-linhagens/$caseId` do caso da Ana Luiza (aba "Linhagens") → conferir que a linha
"Linha de cidadania — Áustria (§58c StbG)" aparece na lista, com tipo "Cidadania", trilha
vinculada e núcleo Silveira/Friedmann-Reimer selecionado → registrar uma segunda linhagem de
teste no mesmo caso (ex.: "Linha de teste — Alemanha", tipo "A confirmar") e confirmar que ambas
convivem na lista, sem duplicar pessoa nem criar caso novo — validando ao vivo o texto que a
própria tela já promete.
