# Pacote de Migração — Clube Ancestral para Supabase Próprio

Este pacote contém tudo que você precisa para replicar a estrutura e os dados do projeto atual em um projeto Supabase que seja seu.

## O que está incluso

| Arquivo | Conteúdo |
|---------|----------|
| `01-schema-public.sql` | Schema `public` completo: tabelas, tipos, índices, funções, triggers, políticas RLS e grants. |
| `02-dados-public.sql` | Dados das tabelas do schema `public` (INSERTs). |
| `03-usuarios-e-acessos.md` | Usuários de equipe a recriar e SQL de vínculo de papel/organização. |
| `04-buckets-storage.md` | Buckets de Storage a criar e regra de privacidade. |
| `05-CHECKLIST.md` | Checklist ordenado da migração, com verificações de contagem. |
| `06-reconfigurar-app.md` | Onde trocar o projeto no código e nas variáveis do deploy. |

## O que NÃO está incluso (e precisa ser recriado no novo projeto)

- **Usuários de autenticação** (`auth.users`): você precisará convidar/cadastrar novamente os usuários no novo Supabase, ou usar o painel de Auth para criar os mesmos e-mails.
- **Arquivos de Storage** (contratos, documentos, imagens): reenviar manualmente ou copiar via script usando as URLs públicas assinadas.
- **Buckets de Storage** e suas políticas: recriar os buckets necessários no novo projeto.
- **Configurações de Auth** (providers sociais, templates de e-mail, domínios de redirect): reconfigurar no painel do novo Supabase.
- **Secrets / chaves de API externas** (Stripe, Paddle, OpenAI, etc.): recadastrar nas variáveis de ambiente do novo deploy.

## Passo a passo

### 1. Crie o projeto Supabase

- Acesse [https://supabase.com](https://supabase.com) com a conta que você controla.
- Crie um novo projeto.
- Anote:
  - **Project URL** (ex: `https://<ref>.supabase.co`)
  - **Project API keys** → `anon public` (vai substituir `VITE_SUPABASE_PUBLISHABLE_KEY`)
  - **Project API keys** → `service_role` (só para importação; nunca exponha no front-end)

### 2. Desative temporariamente as triggers de RLS/auditoria (recomendado para importação limpa)

No SQL Editor do novo projeto, execute **antes** de importar os dados:

```sql
SET session_replication_role = replica;
```

Isso desabilita as foreign-key checks durante a carga e evita erros de ciclos de FK (contratos, versões, partes, etc.).

### 3. Importe o schema

No SQL Editor, execute o conteúdo de `01-schema-public.sql`.

> Se o arquivo for muito grande, use a CLI do Supabase ou divida em blocos.

### 4. Importe os dados

No SQL Editor, execute o conteúdo de `02-dados-public.sql`.

Importante: mantenha `session_replication_role = replica` durante toda a carga de dados, ou use `--disable-triggers` se estiver usando `psql` localmente:

```bash
psql -h <host> -U postgres -d postgres -f 02-dados-public.sql
```

### 5. Reative as restrições

Após a importação:

```sql
SET session_replication_role = DEFAULT;
```

### 6. Verifique a importação

```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

Você deve ver aproximadamente **180+ tabelas** e **500+ políticas de RLS**.

### 7. Recrie usuários e papéis

Acesse **Authentication → Users** no novo Supabase e recrie os usuários necessários (ex: `tati@pluggedresearch.com` como admin). Depois, insira os papéis correspondentes na tabela `public.user_roles`:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<uuid-do-usuario-no-novo-auth>', 'admin');
```

### 8. Reconfigure o app

Me envie:
- A nova `VITE_SUPABASE_URL`
- A nova `VITE_SUPABASE_PUBLISHABLE_KEY` (chave `anon public`)

Eu atualizo o código e as variáveis de ambiente do projeto para apontar para o seu Supabase.

### 9. Reconfigure o deploy (Vercel / Lovable)

Atualize as environment variables do deploy com os novos valores:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (do novo projeto, se necessário para server functions)

## Atenções importantes

- **Nunca exponha a `service_role key` no front-end.** Ela só deve estar em server functions/edge functions.
- **RLS já está no schema**, mas só funciona corretamente se os usuários forem recriados no novo `auth.users` e os `user_id` forem mantidos consistentes com os registros de `profiles` e outras tabelas.
- **Dados demo**: registros marcados com `is_demo = true` continuam sendo dados de demonstração e não devem ser tratados como reais.

## Suporte

Quando tiver o novo projeto criado e as chaves em mãos, me envie aqui que eu faço a reconfiguração completa do app e do deploy.
