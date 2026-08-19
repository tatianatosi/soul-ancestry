# Matriz de Verificação — Repositório, Supabase e Lovable v1.0

## Objetivo

Controlar a verificação do que está versionado, do que existe no banco e do que está efetivamente disponível no ambiente Lovable/deploy. Nenhum dos três planos substitui os outros.

| ID | Área | GitHub/repositório | Supabase/schema/RLS | Lovable/deploy | Estado atual | Próxima verificação |
|---|---|---|---|---|---|---|
| V-001 | Rotas | `src/routes/` e área autenticada existentes. | N/A. | Não confirmado nesta matriz. | GitHub confirmado. | Testar rotas no ambiente. |
| V-002 | Cliente/Canvas | Componentes e rotas de cliente presentes. | Mapear consultas e RLS. | Não confirmado nesta matriz. | Parcial. | Cotejar tela, token e dados. |
| V-003 | Desk/CRM | Componentes `desk-*` e rotas operacionais presentes. | Mapear tabelas, mutações e permissões. | Não confirmado nesta matriz. | Parcial. | Inspecionar chamadas e fluxo real. |
| V-004 | Família | Evidência de commits e módulos recentes. | Inspecionar migrations/RLS/relacionamentos. | Não confirmado nesta matriz. | Parcial. | Mapear schema e tela. |
| V-005 | Propostas/pré-carga | Rota/dados de proposta presentes. | Mapear persistência e logs. | Não confirmado nesta matriz. | Parcial. | Testar proposta ativa, arquivada e idempotência. |
| V-006 | Contratos | Rotas e componentes presentes; correção P0 registrada. | Mapear dados e auditoria. | Não confirmado nesta matriz. | Parcial. | Inspecionar diffs e cenários de regressão. |
| V-007 | Financeiro/despesas | Rota financeira e commits de despesas presentes. | Mapear tabelas, regras e RLS. | Não confirmado nesta matriz. | Parcial. | Extrair cálculo e aprovação. |
| V-008 | Asaas | Documentação/matriz presente; integração ativa não confirmada. | Mapear logs/campos se existirem. | Não confirmado nesta matriz. | Pendente. | Validar conector, secrets e gates. |
| V-009 | Migrations | Diretório com migrations 2026-08-16 a 2026-08-19 presente. | Conteúdo ainda não inventariado tabela a tabela. | N/A. | Parcial. | Extrair dicionário de schema/RLS. |
| V-010 | Dados locais | `src/data/` presente com casos, propostas e templates. | Determinar dados persistidos vs locais. | Não confirmado nesta matriz. | Pendente crítico. | Classificar arquivo a arquivo. |
| V-011 | Mockups/design | Não há mockup visual identificado em `output/`; há snapshots CSV. | N/A. | Designs Lovable/Canva não cotejados aqui. | Pendente. | Localizar IDs/screenshots e comparar. |
| V-012 | Configuração | `.env` e `.gitignore` presentes; inventário protegido criado. | Configuração de conexão deve ser validada sem expor segredo. | Variáveis de deploy não confirmadas. | Pendente crítico. | Executar saneamento protegido. |

## Atualização obrigatória

Após cada inspeção, registrar: caminho/ID; SHA ou versão; ambiente; resultado; divergência; risco; decisão humana necessária; ação de correção; teste; e data.
