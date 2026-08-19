# Dicionário de Schema, Migrations e RLS v1.0

**Data:** 2026-08-19

## Evidências técnicas

| Item | Evidência | Estado |
|---|---|---|
| Diretório de migrations | `supabase/migrations/` | Confirmado no GitHub |
| Janela temporal observada | 2026-08-16 a 2026-08-19 | Confirmada por nomes de migrations |
| Tipos Supabase gerados | `src/integrations/supabase/types.ts` — SHA `685a4832109e256f7ee5c17cb45b0baba84a0213`, 277.570 B | Confirmado no GitHub |
| Integração browser/server | Clientes, middleware e auth-attacher em `src/integrations/supabase/` | Confirmada no GitHub |
| Estado integral aplicado no ambiente | Não extraído por API de banco nesta rodada | NAO_CONFIRMADO |

## Migrations de referência inspecionadas

| Migration | SHA | Papel de auditoria |
|---|---|---|
| `20260816231149_0424098a-7ba0-4959-80c3-3d5a48184760.sql` | `f17365957977c03e831c45ee9189d276152dfe1f` | Estrutura e políticas a detalhar |
| `20260818190735_56b19236-0408-44eb-8e43-04df813b7b4d.sql` | `a5c5ac7bf67a8dfcebb4c2d98a25a85847499e29` | Alteração recente de dados/governança |
| `20260818192206_ff820f52-db73-4a30-9397-47a85ce3b2b7.sql` | `5b23fd24d3f2b78e095700c45685561f9fbdfd6e` | Acesso e políticas |
| `20260818201721_818f92ac-fdac-403d-a1b8-b17a4a5cf300.sql` | `ae4628da6c03853ece884ed3bf9197a1b5799ce3` | Família, casos ou operação |
| `20260818202152_c47b30e4-6564-4b62-b2d9-6258abbaea16.sql` | `1225eb6542cfe35f2703cb1d6e35dc640f8ba4a4` | Contratos, propostas ou finanças |
| `20260818202220_f5d2fa16-90c7-4330-b127-52113eb58cdc.sql` | `4d24fccf4ce6e2b0af88584394e9d6cba1c510e4` | Ajuste recente a classificar |
| `20260819012038_1e6c772c-9c2e-4d53-a4fb-01ab568c7dbb.sql` | `30458678c658b443c030afdf0e7755652a2d31cc` | Migration mais recente listada |

## Modelo de dicionário de entidades

Para cada entidade, registrar:

| Campo | Descrição |
|---|---|
| `schema.tabela` | Nome técnico |
| Finalidade | Domínio de negócio ou operação |
| Chave primária e FKs | Relações e integridade |
| PII/LGPD | Nenhum, pessoal, sensível ou financeiro |
| Operações | Select, insert, update, delete e RPCs permitidos |
| RLS/policies | Nome, papel e condição |
| Consumidores | Rotas, componentes, serviços e jobs |
| Origem de dados | Formulário, proposta, importação, app, Desk ou integração |
| Auditoria | Logs, timestamps, responsável e commit |

## Domínios obrigatórios de extração

1. Identidade, usuários, perfis e autenticação.
2. Casos, pessoas, núcleo familiar e representação legal.
3. Propostas, versões, pré-carga, arquivamento e aceite.
4. SKU, catálogo, preço, condição e reconciliação.
5. Contratos, parâmetros, anexos, assinatura e ordem de serviço.
6. Financeiro, despesas, pagamentos, links e logs de integração.
7. Pesquisa, fontes, evidências, documentos e relatórios.
8. Operação, tarefas, atendimento, go-live, exceções e auditoria.
9. Privacidade, consentimento, RLS e trilhas de acesso.

## RLS e segurança

- Middleware e migrations de acesso não comprovam cobertura adequada de toda tabela.
- Dados familiares, menores, contratos, despesas, documentos e casos exigem classificação LGPD e teste de acesso por perfil.
- A próxima versão deve listar policy por tabela, condição de acesso, perfil autorizado e cenário de negação.

## Bloqueios de afirmação

Não afirmar até a extração completa: quantidade final de tabelas, cobertura integral de RLS, funções/triggers ativos, equivalência entre tipos gerados e banco de produção, ou sucesso de migrations no ambiente remoto.
