---
name: pendente-sql
description: Propõe uma mudança de schema/dado no banco real seguindo a regra 3 da Decisão de Hospedagem Única (23/10/2026) — escreve em supabase/pendentes/, nunca em supabase/migrations/ ou drizzle/migrations/, e registra a proposta em supabase/pendentes/README.md. Use sempre que uma tarefa exigir ALTER TABLE, CREATE TABLE, UPDATE/INSERT de dado real, policy nova, ou qualquer outra mudança no Lovable Cloud (liiqqibnirnpnvjmjrpj).
---

# Propor mudança de banco (`supabase/pendentes/`)

## Por quê esta skill existe

Este projeto é hospedado só no Lovable (Decisão de Hospedagem Única,
23/10/2026). O Lovable **não executa** migrações que chegam pelo GitHub — um
arquivo escrito direto em `supabase/migrations/` ou `drizzle/migrations/`
não seria aplicado por ninguém, só criaria a ilusão de que foi. Por isso
existe um hook `PreToolUse` em `.claude/settings.json` que bloqueia Edit/
Write/NotebookEdit nesses dois diretórios. Esta skill é o caminho certo.

## Quando usar

Sempre que a tarefa precisar de uma mudança real no banco: nova coluna,
nova tabela, nova policy, correção de dado existente, backfill. Não use
para leitura (SELECT de inspeção) — isso é `mcp__Lovable__query_database`
direto, sem arquivo.

## Passo a passo

1. **Escolha o nome do arquivo**: `supabase/pendentes/YYYYMMDDHHMMSS_slug-curto.sql`,
   timestamp de agora, slug descrevendo a mudança (ex.: `_arquivamento`, não
   `_fix`).

2. **Escreva o cabeçalho antes do SQL**, sempre com:
   - O que faz, em 1-3 linhas.
   - Por quê (qual regra do `AGENTS.md`, qual achado de auditoria, qual
     autorização da Proprietária — cite a data/frase exata se houver).
   - Se é idempotente, e como (`if not exists`, `on conflict do nothing`,
     `where ... is null`/`where <coluna> = <valor atual exato>`). **Todo
     arquivo nesta pasta precisa ser seguro para reaplicar.**
   - Se a mudança for maior que o SQL isolado (ex.: uma coluna nova só
     funciona se o código também mudar para usá-la), diga isso no
     cabeçalho — não deixe a Proprietária achar que aplicar o SQL já
     resolve.

   Exemplo real desta sessão (`20261026230000_user_roles_arquivamento.sql`):
   ```sql
   -- ESTADO: NÃO APLICADO; AGUARDA AUTORIZAÇÃO EXPLÍCITA
   -- Auditoria pré-lançamento (25/10/2026), item 2 do "Ainda pendente":
   -- "Remover papel apaga a linha de `user_roles`..." AGENTS.md: "sem
   -- exclusão física; auditoria em mudanças."
   --
   -- O que faz: adiciona `archived_at` em `public.user_roles`, idempotente
   -- (IF NOT EXISTS). Não apaga nada, não altera dado existente.
   --
   -- O que NÃO vem neste arquivo, e por quê não é só SQL:
   -- [explica que 2 escritores e 13 leituras também precisam mudar]

   alter table if exists public.user_roles
     add column if not exists archived_at timestamptz;
   ```

3. **Nunca escreva em `supabase/migrations/` ou `drizzle/migrations/`** —
   mesmo que a tarefa peça "crie a migration". O hook bloqueia, mas não
   conte com ele: o arquivo certo nasce em `supabase/pendentes/`.

4. **Registre em `supabase/pendentes/README.md`**, na tabela "O que já está
   aqui", uma linha nova com três colunas: arquivo (com link/menção ao PR
   se vier de um), estado, o que faz (resumo de uma frase). Estados usados
   neste projeto:
   - `NÃO APLICADO` + motivo em MAIÚSCULAS_COM_UNDERSCORE: `BLOQUEADO_POR_DADO`
     (falta metadado real, não pode inventar), `BLOQUEADO_POR_TAMANHO`
     (conteúdo grande demais para transcrever com segurança — ver skill
     irmã de conteúdo grande), `AGUARDA AUTORIZAÇÃO` (escrito, revisado,
     só falta o "sim" da Proprietária).
   - `JÁ APLICADO em DD/MM` — só depois de executar de fato (ver passo 5) e
     conferir no banco.

5. **Se e somente se a Proprietária autorizou nominalmente esta mudança**
   (nunca um "sem aprovação" genérico — `AGENTS.md`: "Sem migration, RLS,
   convite, publicação, merge ou deploy sem autorização explícita"):
   - Aplique via `mcp__Lovable__query_database` (projeto do Lovable Cloud,
     não um Supabase CLI local).
   - **Confira antes**: rode um SELECT medindo o estado atual (quantas
     linhas, qual coluna existe) antes de aplicar.
   - **Confira depois**: rode o mesmo tipo de SELECT e compare — nunca
     declare aplicado sem essa segunda medição.
   - Só então troque o estado para `JÁ APLICADO em DD/MM` no `README.md`,
     citando a frase exata de autorização e o resultado da conferência.

## Armadilhas já vistas neste projeto

- **Payload grande demais para retranscrever**: um SQL vindo de PR antigo
  pode ter uma única linha de JSON de centenas de KB. Não tente reproduzir
  isso de memória num tool call — copie com `git show <ref>:<path> > arquivo`
  (operação de arquivo, não digitação) e confira com `diff` antes de
  prosseguir. Se mesmo assim for grande demais para aplicar com segurança
  por este mecanismo, registre `BLOQUEADO_POR_TAMANHO` e recomende o chat
  do Lovable direto — não é falha de autorização, é limite da ferramenta.
- **Escrever a coluna sem o código que a usa**: uma coluna nova (ex.:
  `archived_at`) só vale algo se todo escritor e todo leitor da tabela for
  atualizado na mesma mudança. Levante TODOS os call sites (`grep -rn
  'from("tabela")'`) antes de aplicar, não só o caso que motivou a tarefa.
- **UPDATE sem guarda de valor exato**: nunca sobrescreva um campo de
  cadastro real às cegas. Use `where <coluna> is null` (preencher vazio) ou
  `where <coluna> = '<valor errado exato que você mediu>'` (corrigir erro
  conhecido) — nunca `where id = ...` sem checar o valor atual primeiro.
