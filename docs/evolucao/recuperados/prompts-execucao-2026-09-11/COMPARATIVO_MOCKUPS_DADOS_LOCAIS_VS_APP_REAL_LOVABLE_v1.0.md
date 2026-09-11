# Comparativo — Mockups, Dados Locais e App Real/Lovable v1.0

**Escopo:** comparação estrutural baseada no que está versionado no GitHub. Não presume que o ambiente Lovable em execução seja idêntico ao repositório sem validação adicional de build, deploy e telas.

## Classes de evidência

| Classe | Definição | Tratamento de migração |
|---|---|---|
| Implementado/versionado | Rota, componente, migration ou integração presente no GitHub. | Inventariar dependências e testes. |
| Dados locais | Arquivo em `src/data/`. | Classificar como mock, seed, configuração, caso-modelo ou dado vivo indevidamente empacotado. |
| Mockup/design | Layout ou proposta visual sem confirmação de rota/componente. | Não assumir funcionalidade; vincular a design/screenshot/arquivo. |
| Lovable não confirmado | Comportamento relatado fora do GitHub. | Requer comparação direta com build/ambiente. |

## Evidência técnica presente

| Área | GitHub real | Dados locais correlatos | Estado comparativo |
|---|---|---|---|
| Cliente | `src/components/cliente-app.tsx`, rota Canvas e devolutivas. | `case-registry.ts`, `casos.ts`, `caseTemplate.ts`, dados de casos. | Implementação e dados locais coexistem; origem dos dados deve ser classificada. |
| Desk/CRM | `desk-app.tsx`, `desk-crm.tsx`, rotas de clientes, leads, casos e operações. | Registros de casos e propostas. | Interface real identificada; consumo de dados e permissões exigem inspeção. |
| Go-live/onboarding | `desk-go-live.tsx`, rota de onboarding e acessos. | Dados de propostas/casos. | Implementação presente; gates e dados vivos precisam de cotejo. |
| Contratos | Rotas e componentes contratuais. | Propostas e dados de caso. | Fluxo real presente; regra P0 e templates requerem extração. |
| Entrega consultiva | `entrega-consultiva.tsx` e `src/data/entrega-consultiva.ts`. | Configuração/dados de entrega. | Necessário separar template de conteúdo do caso. |
| Relatórios/devolutivas | Componentes e rotas de relatório/studio. | Dados de relatório fase 02 e visual. | Há camada visual e dados locais; mapear persistência. |

## Achados de risco para migração

1. A presença de arquivos como `caseDataGiovanna.ts`, `caseDataSophia.ts`, `caso-sophia.ts`, `casos.ts` e `propostas.ts` indica que há conteúdo de caso/configuração dentro do bundle; cada arquivo precisa de classificação de dado, sanitização e destino.
2. Componentes extensos como `cliente-app.tsx` e `desk-app.tsx` devem ser fatiados após mapear chamadas Supabase, estado, permissões e dependências.
3. Tipos Supabase gerados existem, mas não substituem inventário de migrations, RLS, tabelas e funções.
4. Nenhum mockup deve ser usado para afirmar que uma função está ativa; a confirmação exige rota/componente, chamada de dados e, quando aplicável, migration/RLS.

## Matriz de decisão por item

| Pergunta | Se sim | Se não |
|---|---|---|
| Há rota/componente versionado? | Classificar como implementado tecnicamente. | Tratar como mockup, requisito ou ausência. |
| Há migration/tabela/policy de suporte? | Mapear contrato de dados. | Marcar como UI local, mock ou integração pendente. |
| Há dado em `src/data/`? | Classificar antes de exibir/migrar. | Buscar fonte Supabase/serviço. |
| Há prova de deploy/Lovable equivalente? | Marcar como ambiente confirmado. | Manter como repositório confirmado, ambiente não confirmado. |

## Saída obrigatória da próxima versão

Criar tabela item a item com: caminho, SHA, domínio, tipo de dado, consumidor, fonte de verdade, estado Lovable, estado GitHub, migration/RLS, risco e ação de migração.
