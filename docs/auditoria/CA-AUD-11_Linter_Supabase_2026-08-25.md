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

**Estado: FECHADO em 25/08/2026.** Ativada pela Proprietária no painel.

O Supabase passa a conferir toda senha nova contra a base do
HaveIBeenPwned e a recusar as que já vazaram. A verificação usa
k-anonimato: só um prefixo do hash sai, nunca a senha.

Vale registrar o momento: a proteção age apenas sobre senha **nova**, não
revisa as existentes. Foi ligada **antes de existir qualquer conta de
cliente real**, então toda conta do App Cliente nasce sob essa checagem —
e são contas que dão acesso a árvore genealógica, documentos pessoais e
faturas.

## Estado final dos três achados

| Achado | Estado |
| --- | --- |
| `anon` executa SECURITY DEFINER | fechado |
| `authenticated` executa SECURITY DEFINER | fechado |
| Proteção contra senha vazada | fechado |

## O que este documento não cobre

Nenhuma alteração de RLS, de política ou do schema `auth` foi feita. As
políticas do schema `auth` são internas do Supabase e não devem ser tocadas.
