# Mapa de Entidades, RLS e Consumidores v1.0

**Data:** 2026-08-19
**Método:** cruzamento somente leitura entre rotas/componentes versionados, `src/data/`, integração Supabase, tipos gerados, migrations e deployment Vercel.

## Regra de evidência

- `INTERFACE_CONFIRMADA`: rota ou componente existe no GitHub.
- `SUPABASE_CONFIRMADO`: cliente, middleware, tipos ou migrations existem no GitHub; não significa que uma tabela específica esteja em uso por aquele módulo.
- `PERSISTENCIA_NAO_CONFIRMADA`: consumidor/tabela/RLS ainda não foi ligado por chamada ou extração SQL verificável.
- `AMBIENTE_NAO_CONFIRMADO`: equivalência com Lovable ou banco remoto ainda não foi testada diretamente.

## Infraestrutura comum

| Camada | Evidência | Estado |
|---|---|---|
| Cliente Supabase browser | `src/integrations/supabase/client.ts` — SHA `8bd3a404d333a3101e267eb206dc5f525e9808f1` | SUPABASE_CONFIRMADO |
| Cliente Supabase server | `src/integrations/supabase/client.server.ts` — SHA `30e131bcd0fcf63c7f372b73bcab363f22352647` | SUPABASE_CONFIRMADO |
| Middleware de autenticação | `src/integrations/supabase/auth-middleware.ts` — SHA `0aefbe67a008727499cd33484d19c5629daabfac` | SUPABASE_CONFIRMADO |
| Guard de rota autenticada | `src/routes/_authenticated/route.tsx` — SHA `198df3deff96b73b7224265c9e19c29ca5e1bc2b` | INTERFACE_CONFIRMADA |
| Tipos gerados | `src/integrations/supabase/types.ts` — SHA `685a4832109e256f7ee5c17cb45b0baba84a0213` | SUPABASE_CONFIRMADO |
| Migrations | `supabase/migrations/` entre 2026-08-16 e 2026-08-19 | SUPABASE_CONFIRMADO |
| Produção Vercel | Projeto `soul-ancestry`, deployment do commit `c55a1ebef2bcd0651caaefdf3a54fb5438724570` pronto | DEPLOY_CONFIRMADO |

## Mapa por domínio

| Domínio | Consumidores de interface conhecidos | Dados locais identificados | Evidência Supabase | Persistência/RLS | Risco | Próxima ação técnica |
|---|---|---|---|---|---|---|
| Acesso e perfis | `acesso.*`, `auth.tsx`, `equipe.*`, guard autenticado | Não identificado como dado local nesta rodada | Cliente browser/server, middleware, tipos e migrations | PERSISTENCIA_NAO_CONFIRMADA por entidade/policy | Alto: acesso a informações de caso | Extrair perfis, sessões, policies e cenários de negação |
| Casos | `casos.index.tsx`, `casos.$caseId.contrato.preparar.tsx`, `painel.tsx`, Canvas | `activeCase.ts`, `case-directory.ts`, `case-registry.ts`, `casos.ts`, dados Giovanna/Sophia | Tipos e migrations presentes | PERSISTENCIA_NAO_CONFIRMADA | Alto: PII e duplicidade entre bundle e banco | Mapear chamadas, tabelas, FKs e fallback local |
| Pessoas e família | CRM, cliente, onboarding e preparação de contrato | Dados nominais nos arquivos de caso | Migrations recentes e tipos presentes; commits de estrutura familiar registrados | PERSISTENCIA_NAO_CONFIRMADA | Crítico: menores, representação, consentimento e RLS | Extrair entidades de pessoa/família, policies e acessos por papel |
| CRM, clientes e leads | `desk-crm.tsx`, `clientes.tsx`, `leads.tsx`, `desk-app.tsx` | Casos/propostas locais podem alimentar a interface | Cliente Supabase e migrations presentes | PERSISTENCIA_NAO_CONFIRMADA | Alto: fonte operacional não ratificada | Identificar tabelas, logs, status e mutações |
| Propostas e pré-carga | `propostas.tsx`, `onboarding.$id.tsx`, preparação de contrato | `propostas.ts` | Tipos/migrations presentes | PERSISTENCIA_NAO_CONFIRMADA | Crítico: proposta arquivada, versão, preço e sobrescrita | Mapear status, origem, idempotência, auditoria e RLS |
| SKU, preço e catálogo | Financeiro, propostas, contratos e Desk | `saneamento.ts`, dados de proposta | Tipos/migrations presentes; fonte comercial externa ainda exige reconciliação | PERSISTENCIA_NAO_CONFIRMADA | Crítico: preço, link e cobrança | Extrair entidades técnicas e separar da fonte comercial aprovada |
| Contratos e anexos | Rotas de contrato, parâmetros, preparação e `kit-contratual.tsx` | Dados de caso/proposta locais | Tipos/migrations presentes; correção P0 em commits recentes | PERSISTENCIA_NAO_CONFIRMADA | Crítico: dado jurídico e assinatura | Mapear entidades, versões, campos obrigatórios, logs e RLS |
| Financeiro e despesas | `financeiro.tsx` | Dados locais de caso/proposta podem influenciar apresentação | Tipos/migrations presentes; regra de despesas implementada | PERSISTENCIA_NAO_CONFIRMADA | Crítico: valores, autorização e eventual Asaas | Extrair tabelas, aprovações, logs e integração |
| Entrega consultiva e relatórios | `cliente-app.tsx`, `entrega-consultiva.tsx`, relatórios e studio | `entrega-consultiva.ts`, relatórios, devolutivas e one-page | Tipos/migrations presentes | PERSISTENCIA_NAO_CONFIRMADA | Médio: conteúdo de caso exposto | Separar template, conteúdo persistido e conteúdo sanitizado |
| Pesquisa e evidências | Rotas `pesquisa.*`, `evidencias.tsx`, API `pesquisa-assistente.ts` | Sem fonte local confirmada nesta rodada além de possíveis dados de caso | API, tipos e migrations presentes | PERSISTENCIA_NAO_CONFIRMADA | Alto: proveniência e afirmações genealógicas | Extrair entidades de fonte, evidência, documento e policy |
| Operação, go-live e tarefas | `desk-go-live.tsx`, `ops.tsx`, `tarefas.tsx`, `ordens-servico.tsx`, `atendimento.tsx` | Dados locais de casos/propostas podem afetar status | Tipos/migrations presentes | PERSISTENCIA_NAO_CONFIRMADA | Médio: execução fora de gate | Mapear estado, logs, responsáveis e transições permitidas |
| Governança, auditoria e privacidade | Rotas de governança, auditoria, qualidade, privacidade e exceções | Documentação versionada | Tipos/migrations e middleware presentes | PERSISTENCIA_NAO_CONFIRMADA | Alto: trilha de decisão e LGPD | Extrair entidades de decisão, evidência, consentimento e log |

## Estado de paridade

| Plano | Estado | Evidência | Limite |
|---|---|---|---|
| GitHub | CONFIRMADO | Rotas, componentes, dados locais, clientes Supabase, tipos e migrations versionados | Não prova dados remotos atuais |
| Supabase remoto | NAO_CONFIRMADO | Tipos e migrations são evidência de schema versionado | Não houve leitura direta do schema/policies ativos nesta rodada |
| Vercel | CONFIRMADO | Deployment de produção pronto e build sem erros; runtime sem erros no intervalo verificado | Não substitui teste de cada rota e fluxo |
| Lovable | NAO_CONFIRMADO | Framework `tanstack-start-lovable` e origem sincronizada no repositório | Não houve cotejo visual/funcional direto de ambiente |

## Prioridade de extração

1. Entidades e RLS de pessoas, família, casos e acessos.
2. Entidades de propostas, pré-carga, contratos, ordem de serviço e preços.
3. Entidades de despesas, financeiro, logs e integração de cobrança.
4. Entidades de pesquisa, fontes, evidências e documentos.
5. Estados de go-live, tarefas, auditoria, consentimento e privacidade.

## Critério para promover uma ligação

Uma relação entre interface e entidade só pode ser marcada como `LIGADA_E_VERIFICADA` quando houver, no mínimo: caminho do consumidor; chamada ou serviço identificável; tabela/RPC/tipo correspondente; migration ou schema associado; policy/RLS aplicável; e teste de acesso ou cenário de negação.
