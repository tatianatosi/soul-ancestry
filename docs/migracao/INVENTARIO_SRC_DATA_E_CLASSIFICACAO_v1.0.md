# Inventário `src/data` e Classificação v1.0

**Data:** 2026-08-19

## Regra de classificação

A presença de arquivo em `src/data/` não prova que o conteúdo é dado vivo, persistido ou autorizado para produção. A classificação é preliminar até o cruzamento com chamadas Supabase, migrations, RLS e ambiente.

| Classe | Definição | Uso permitido até validação |
|---|---|---|
| CONFIGURACAO_LOCAL | Estrutura, catálogo ou parâmetros empacotados | UI e desenvolvimento, sem assumir fonte operacional |
| TEMPLATE_OU_CASO_MODELO | Estrutura demonstrativa ou parametrizável | Demonstração e testes controlados |
| DADO_DE_CASO_NO_BUNDLE | Conteúdo nominal de caso ou pessoa em código | Requer sanitização e decisão de migração |
| SNAPSHOT_OU_DERIVADO | Material derivado para leitura ou visualização | Não usar como fonte de verdade |

## Arquivos identificados

| Caminho | SHA | Classe preliminar | Domínio | Ação de migração |
|---|---|---|---|---|
| `src/data/activeCase.ts` | `db84ad540f40303b5d371a0061eb079b02b9137b` | CONFIGURACAO_LOCAL | Caso ativo | Verificar rota, sessão ou Supabase |
| `src/data/case-directory.ts` | `73933609d7030306ae8af222a8e54f74606bc270` | CONFIGURACAO_LOCAL | Diretório de casos | Migrar para índice persistido se usado em produção |
| `src/data/case-registry.ts` | `605d5876a9192cdcbdec6019e3494aab24e04b25` | DADO_DE_CASO_NO_BUNDLE | Registro de casos | Classificar registros, remover PII e definir fonte persistida |
| `src/data/caseDataGiovanna.ts` | `f4fe306bfe0c2d04035386cfa8960f826711cc95` | DADO_DE_CASO_NO_BUNDLE | Caso Giovanna | Decidir entre caso-modelo, seed sanitizado ou migração |
| `src/data/caseDataSophia.ts` | `8e34069df74eeaa6162766ef56f47002ee405d17` | DADO_DE_CASO_NO_BUNDLE | Caso Sophia | Decidir entre caso-modelo, seed sanitizado ou migração |
| `src/data/caseTemplate.ts` | `8294c0faa77c7884ae387548ad87ee92ca6a2d1f` | TEMPLATE_OU_CASO_MODELO | Template de caso | Separar estrutura de conteúdo nominal |
| `src/data/caso-sophia.ts` | `7ce96d8435dcc51b972a87af48fdefea0353e522` | DADO_DE_CASO_NO_BUNDLE | Caso Sophia | Consolidar ou preservar como histórico explicitamente |
| `src/data/casos.ts` | `3905062c78d629abc298a3f5e48d97d69b98be75` | DADO_DE_CASO_NO_BUNDLE | Casos | Inventariar entidades e mover dados vivos para Supabase |
| `src/data/client-one-page.ts` | `548ae0a37f53bced4e1529a1cdd3c905a812316a` | SNAPSHOT_OU_DERIVADO | One page de cliente | Identificar se é composição de UI ou export |
| `src/data/entrega-consultiva.ts` | `cd8145b2ac3f0d73f0713f4f587f0f8775bb10fa` | TEMPLATE_OU_CASO_MODELO | Entrega consultiva | Extrair parâmetros genéricos e separar conteúdo específico |
| `src/data/propostas.ts` | `f3535d89428c55ddb5ad448092869e0fe4f949c1` | DADO_DE_CASO_NO_BUNDLE | Propostas | Definir status, versão, fonte e persistência antes de pré-carga |
| `src/data/relatorio-fase02.ts` | `5746e09da629037eea188945ad46b507ca31e971` | TEMPLATE_OU_CASO_MODELO | Relatório Fase 02 | Separar template de dados de caso |
| `src/data/relatorio-visual.ts` | `62c8b211d026ec2b2cce6479f1c4867c254331b3` | TEMPLATE_OU_CASO_MODELO | Relatório visual | Separar composição visual de conteúdo persistido |
| `src/data/saneamento.ts` | `e6c5a1eb2c638e0b9faaee88ea5b1a072d84f1ba` | CONFIGURACAO_LOCAL | Saneamento/catálogo | Conferir contra catálogo oficial antes de uso operacional |
| `src/data/studio-devolutivas.ts` | `f3df51861589afc587f3d9de7b26315e0cc2589e` | TEMPLATE_OU_CASO_MODELO | Studio de devolutivas | Mapear dados de entrada e persistência |

## Riscos prioritários

1. Arquivos com dados nominais de caso podem conter PII e não devem ser assumidos como seed público.
2. Há duplicidade aparente de conteúdo Sophia que exige decisão de origem e destino.
3. Propostas e casos locais não podem alimentar preço, cobrança ou contrato sem gate de fonte aprovada.
4. A classificação só é concluída após ligar cada arquivo a consumidor, tabela/migration, RLS e ambiente.
