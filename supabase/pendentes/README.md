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
| `20261024120000_documentos_reais_ana_liberados.sql` | NÃO APLICADO; BLOQUEADO_POR_DADO | Proposta de inserção/publicação de documentos, não schema. Materiais recebidos contêm informações internas; faltam versões sanitizadas e correspondência documental comprovada. |
| `20261024170000_ativacao_cede_a_proprietaria.sql` | JÁ APLICADO em 25/10 | Registrado em `drizzle/migrations/0002_ativacao_cede_a_proprietaria.sql`; consulta ao banco confirmou `piloto_cede = true` e `ativacao_cede = true`. |
| `20261018120000_force_row_level_security.sql` (PR #170, mesclada em `main` em 26/10) | JÁ APLICADO em 26/10 | `FORCE ROW LEVEL SECURITY` nas 167 tabelas com RLS habilitado. Aplicado direto via ferramenta do Lovable, sob autorização explícita da Proprietária ("Aprovado Pr 170", 26/10). Conferido no banco: `pg_class.relforcerowsecurity = true` nas 167 tabelas — nenhuma faltante, nenhuma extra. Idempotente, não cria política nova, não altera dado, `service_role` não afetado. |

### Conferência do banco em 25/10/2026

- 234 arquivos em `supabase/migrations/`: 231 registrados no histórico anterior; as duas mudanças de suporte financeiro/telemetria estão registradas no histórico Drizzle, com hashes conferidos. O saneamento do núcleo restante é uma alteração de dados já refletida no banco (três contratantes ativos e linha vazia arquivada), não schema pendente.
- As três propostas de dados de 23/10 foram conferidas: condições v3/v4 existentes, v4 aprovada, dois itens concluídos e três flags verdadeiras. Não foram reaplicadas.
- Os três arquivos do histórico Drizzle têm hashes idênticos aos registros aplicados no banco. As funções de ativação foram novamente conferidas.
- Todas as 194 tabelas públicas têm o mesmo conjunto de colunas que os tipos gerados. Nenhuma migration de schema pendente foi identificada nesta comparação; isso não comprova toda regra funcional, política ou uso em tela.
- Nenhum documento foi publicado, nenhum dado foi alterado e nenhum deploy foi executado nesta conferência.

As três foram aplicadas por mim direto via a ferramenta do Lovable, sob autorização explícita da Proprietária, **antes** de a regra 3 existir. Ficam registradas aqui porque a regra proíbe que vivam em `supabase/migrations/`. Os três blocos são idempotentes: reaplicar vira no-op.

## O que ainda falta neste caso, e não é SQL

A ativação do caso (`status → ativo`, `ativado_em`) não pode vir daqui. A trigger `fn_guard_ativacao()` exige sessão autenticada de admin ou operações, verificada por `auth.uid()` — uma conexão SQL não tem usuário. É um clique da Proprietária em `/onboarding/a11a0000-0000-4000-8000-000000000002`, pelo writer `ativarCasoComChecks`, que caminha a máquina de estados espelhada em trigger no banco.
