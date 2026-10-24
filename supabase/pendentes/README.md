# `supabase/pendentes/` — propostas de mudança no banco

Criada pela **Decisão de Hospedagem Única no Lovable** (23/10/2026), regra 3.

## A regra

> O Claude Code nunca escreve em `supabase/migrations/` nem em `drizzle/migrations/`.
> Mudanças no banco são propostas em `supabase/pendentes/` e aplicadas pelo Lovable.

Por quê: com produção só no Lovable e banco único no Lovable Cloud (`liiqqibnirnpnvjmjrpj`), quem aplica schema é o chat do Lovable. O Lovable **não** executa migrações que chegam pelo GitHub ([git-sync-overview](https://docs.lovable.dev/integrations/git-sync-overview)), então um arquivo em `supabase/migrations/` escrito por aqui não seria aplicado por ninguém — só criaria a ilusão de que foi.

## Como usar

1. O Claude Code escreve o SQL aqui, com cabeçalho dizendo o que faz, por quê, e se é idempotente.
2. A Proprietária leva o conteúdo ao chat do Lovable, que aplica.
3. Depois de aplicado, o cabeçalho é atualizado para `ESTADO: JÁ APLICADO`, com a data.

Nada daqui é aplicado automaticamente. Um arquivo nesta pasta é uma proposta, não um fato.

## O que já está aqui

| Arquivo | Estado | O que faz |
|---|---|---|
| `20261023140000_rateio_igualitario_condicao_ana.sql` | JÁ APLICADO em 23/10 | Versão 3 da condição comercial do caso `CA-CID-AT-FAM-2026-001`: rateio igualitário de R$ 3.200,00 por contratante adulto |
| `20261023150000_redacao_canonica_rateio_familiar_ana.sql` | JÁ APLICADO em 23/10 | Versão 4: redação canônica (Pacote Áustria § 58c), nome completo do dependente, rateio igualitário explícito no `payment_terms` |
| `20261023160000_libera_fatura_ana_checklist_e_flags.sql` | JÁ APLICADO em 23/10 | Conclui os 2 itens abertos do `onboarding_checklist` e reconcilia as 3 flags do portão do App |

As três foram aplicadas por mim direto via a ferramenta do Lovable, sob autorização explícita da Proprietária, **antes** de a regra 3 existir. Ficam registradas aqui porque a regra proíbe que vivam em `supabase/migrations/`. Os três blocos são idempotentes: reaplicar vira no-op.

## O que ainda falta neste caso, e não é SQL

A ativação do caso (`status → ativo`, `ativado_em`) não pode vir daqui. A trigger `fn_guard_ativacao()` exige sessão autenticada de admin ou operações, verificada por `auth.uid()` — uma conexão SQL não tem usuário. É um clique da Proprietária em `/onboarding/a11a0000-0000-4000-8000-000000000002`, pelo writer `ativarCasoComChecks`, que caminha a máquina de estados espelhada em trigger no banco.
