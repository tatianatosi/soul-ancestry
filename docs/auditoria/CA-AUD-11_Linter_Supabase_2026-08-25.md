# Achados do linter do Supabase — 25/08/2026

**Projeto:** `zsxpdbhdvbuulwpepemd` · **Fonte:** database linter do painel do Supabase

## 1 e 2 — `public.rls_auto_enable()` executável por anon e authenticated

**Estado: FECHADO em 25/08/2026.**

A função é `SECURITY DEFINER` e estava exposta em
`/rest/v1/rpc/rls_auto_enable` para `anon` e `authenticated` — qualquer
pessoa, sem sessão, podia invocá-la com os privilégios de quem a definiu.

Agravante de rastreabilidade: **a função não tem migration neste repositório
nem referência em nenhuma linha de código.** Foi criada fora do repo,
provavelmente pela automação do Lovable Cloud. Como o corpo não era auditável
a partir daqui, aplicou-se o mesmo tratamento que o projeto já dá a todas as
suas funções de guarda: nenhuma função `SECURITY DEFINER` de infraestrutura é
chamável por papel de cliente.

Comando aplicado pela Proprietária no SQL Editor:

```sql
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
```

Migration equivalente, idempotente e defensiva (não falha se a função não
existir no ambiente): `supabase/migrations/20260825171500_revogar_execute_rls_auto_enable.sql`.

### Verificação, por duas vias independentes

```
funcao          | security_definer | papeis_com_execute
rls_auto_enable | true             | nenhum — fechado

banco    | existe_em_qualquer_schema | existe_em_public | grants_abertos
postgres | 1                         | 1                | 0
```

A função continua existindo — o `REVOKE` fecha o acesso de papel de cliente
sem alcançar o papel de serviço, então automação de plataforma que porventura
a use segue funcionando.

### Resíduo registrado, sem urgência

`rls_auto_enable()` permanece `SECURITY DEFINER`, sem migration, sem
referência no código e sem ninguém saber o que faz. Inalcançável por papel de
cliente, deixou de ser risco. Quando o Lovable for desligado de vez, vale
rodar `pg_get_functiondef` e decidir se ainda serve para alguma coisa.

## 3 — Proteção contra senha vazada desativada

**Estado: PENDENTE.**

O Supabase pode conferir senhas novas contra a base do HaveIBeenPwned e
recusar as que já vazaram. Fica em **Authentication → Providers → Email**.
Vale ligar antes de existir conta de cliente real.

## O que este documento não cobre

Nenhuma alteração de RLS, de política ou do schema `auth` foi feita. As
políticas do schema `auth` são internas do Supabase e não devem ser tocadas.
