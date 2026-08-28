# 03 — Usuários e acessos a recriar no novo projeto

Os usuários de login vivem no schema `auth`, que não é exportado. Recrie-os em
**Authentication → Users** no novo projeto e depois vincule os papéis.

## Equipe interna (tabela `public.staff_access`)

| E-mail | Papel | Status atual |
|---|---|---|
| tati@pluggedresearch.com | admin | ativo |
| admin.demo@exemplo.test | admin | ativo (demo) |
| atendimento@clubeancestral.com.br | admin | convidado |
| pluggedresearch@gmail.com | admin | convidado |
| tati@memotechintelligence.com | admin | convidado |
| admin.demo.beta@exemplo.test | admin | convidado (demo) |
| comercial.demo.alfa@exemplo.test | comercial | convidado (demo) |
| financeiro.demo.alfa@exemplo.test | financeiro | convidado (demo) |
| leitura.demo.alfa@exemplo.test | leitura | convidado (demo) |
| operacoes.demo.alfa@exemplo.test | operacoes | convidado (demo) |
| pesquisa.demo.alfa@exemplo.test | pesquisador | convidado (demo) |

Contas `*.exemplo.test` são de demonstração; recriar apenas se quiser manter o
ambiente de teste.

## Clientes (portal)

O portal usa link mágico. Nenhum e-mail autorizado está cadastrado hoje em
`public.authorized_portal_emails` — nada a recriar.

## Depois de criar cada usuário

Para cada conta criada, copie o `id` gerado em Authentication → Users e rode:

```sql
-- 1. vincular o login ao registro de equipe já importado
UPDATE public.staff_access
   SET auth_user_id = '<uuid-do-novo-auth>', status = 'active'
 WHERE email = 'tati@pluggedresearch.com';

-- 2. papel efetivo
INSERT INTO public.user_roles (user_id, organization_id, role)
SELECT '<uuid-do-novo-auth>', organization_id, 'admin'
  FROM public.staff_access
 WHERE email = 'tati@pluggedresearch.com'
ON CONFLICT DO NOTHING;

-- 3. membro da organização
INSERT INTO public.organization_members (user_id, organization_id)
SELECT '<uuid-do-novo-auth>', organization_id
  FROM public.staff_access
 WHERE email = 'tati@pluggedresearch.com'
ON CONFLICT DO NOTHING;
```

Sem os três passos o login entra mas não enxerga dado nenhum — o RLS é por
organização.
