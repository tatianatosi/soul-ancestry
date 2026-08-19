# Baseline Técnico GitHub para Migração do Lovable — 2026-08-19 v1.0

**Escopo:** fotografia estrutural baseada apenas no conteúdo versionado em `tatianatosi/soul-ancestry`. Não descreve funcionalidades não encontradas no repositório e não presume o estado do ambiente do Lovable além do que foi sincronizado no código.

## Objetivo de migração

Transformar o repositório em fonte técnica reprodutível do produto. O Lovable deve ser tratado como ambiente de construção/origem enquanto GitHub, migrations Supabase, configuração controlada, testes e deploy independente assumem progressivamente a função de base de continuidade.

## Estrutura confirmada

| Camada | Caminhos observados | Evidência | Leitura factual |
|---|---|---|---|
| Aplicação | `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routes/` | Arquivos versionados | Há aplicação com roteamento e infraestrutura de inicialização no repositório. |
| Rotas públicas | `src/routes/index.tsx`, `acesso.tsx`, `auth.tsx`, `canvas.$token.tsx`, `devolutiva.tsx`, `studio-devolutivas.tsx` | Arquivos versionados | Há pontos de entrada, acesso, Canvas por token e devolutivas. |
| Rotas autenticadas | `src/routes/_authenticated/` | Diretório com casos, contratos, financeiro, propostas, CRM/clientes, pesquisa, operações, governança, auditoria, privacidade e tarefas | Há área interna extensa versionada. |
| Componentes | `src/components/` | Componentes de cliente, Desk, CRM, Go-live, contratos, comercial, relatórios e entrega | Há módulos de interface por domínio. |
| Dados locais | `src/data/` | Registros de caso, propostas, entrega consultiva, relatórios e saneamento | Há dados/mocks/configurações versionados; classificá-los antes de migrar para produção. |
| Integração Supabase | `src/integrations/supabase/` | Clientes client/server, middleware, auth-attacher e tipos gerados | Há integração Supabase e tipos versionados. |
| Banco | `supabase/migrations/` | Migrations datadas de 2026-08-16 a 2026-08-19 | Há histórico versionado de evolução do banco. |

## Domínios confirmados por rotas autenticadas

- Acessos de portal, equipe e clientes
- Casos e onboarding
- Propostas, contratos, parâmetros e ordens de serviço
- Financeiro, operações e exceções
- Governança, auditoria, evidências e qualidade
- Pesquisa e módulos de pesquisa
- Biblioteca, relatórios, privacidade, integrações e tarefas

A presença das rotas demonstra módulos implementados; a regra de negócio detalhada deve ser extraída de componentes, serviços e migrations antes de qualquer reescrita.

## Componentes de maior acoplamento aparente

| Caminho | Papel inferível pelo nome/estrutura | Tratamento de migração |
|---|---|---|
| `src/components/cliente-app.tsx` | Experiência principal de cliente | Mapear dependências, estado e dados antes de fatiar. |
| `src/components/desk-app.tsx` | Desk operacional principal | Separar módulos por domínio e dependências Supabase. |
| `src/components/desk-crm.tsx` | CRM interno | Extrair modelo de dados, permissões e mutações. |
| `src/components/desk-go-live.tsx` | Go-live operacional | Mapear checklists, estados e gatilhos. |
| `src/components/entrega-consultiva.tsx` | Entrega consultiva | Definir contrato de dados e limites comerciais. |
| `src/components/kit-contratual.tsx` | Kit/motor de contrato | Relacionar a templates, parâmetros e migrations. |
| `src/components/relatorio-visual.tsx` e `studio-devolutivas.tsx` | Relatórios e devolutivas | Separar geração, dados e camada visual. |

## Dependências de migração

1. Inventariar cada migration e gerar dicionário de tabelas, funções, triggers e políticas RLS.
2. Mapear a origem de cada dado em `src/data/`: mock, seed, configuração, caso-modelo ou dado que precisa sair do bundle.
3. Extrair as chamadas Supabase nos componentes/rotas e documentar leitura, escrita e permissão.
4. Criar testes de regressão para acesso, família, proposta, contrato, despesas, país/canônico e pré-carga.
5. Produzir configuração portável com `.env.example`, sem credenciais, e procedimento de deploy independente.

## Critérios para considerar um módulo migrável

- Rota e dependências identificadas.
- Contrato de dados documentado.
- Migrations e RLS relacionadas identificadas.
- Variáveis de ambiente declaradas sem segredo.
- Cenário mínimo de teste disponível.
- Sem dependência oculta exclusiva do Lovable.

## Limites atuais

- Este baseline não afirma que o repositório corresponde integralmente ao ambiente de produção/Lovable.
- Não confirma deploy, variáveis de ambiente, dados em produção ou integrações financeiras ativas.
- Não substitui inspeção posterior de diffs, migrations, RLS, chamadas Supabase e fluxo de build/deploy.
