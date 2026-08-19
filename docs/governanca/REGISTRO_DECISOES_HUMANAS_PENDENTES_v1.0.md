# Registro de Decisões Humanas Pendentes v1.0

**Data:** 2026-08-19  
**Escopo:** decisões que não podem ser concluídas por código, inventário, mockup, planilha ou automação.

## Regra

A existência de componente, migration, proposta, SKU, link, valor ou configuração não equivale a aprovação operacional, jurídica ou comercial. Nenhuma decisão deste registro deve ser inferida ou executada automaticamente.

## Decisões pendentes

| ID | Decisão humana necessária | Evidência disponível | Bloqueia | Dono sugerido | Estado |
|---|---|---|---|---|---|
| DH-001 | Definir SKU canônico para cidadania austríaca §58c e pacote familiar. | `PACOTE-AT-01` é referência individual no Planejador; proposta familiar aceita possui escopo/valor distintos; catálogo canônico não foi reconciliado. | Contrato, OS, Asaas, preço e automação. | Comercial + operação. | PENDENTE_CRITICO |
| DH-002 | Congelar preço, condição, parcelamento e escopo aprovados por oferta/caso. | Há fontes com preço/link divergentes e estado de reconciliação pendente. | Proposta, contrato, cobrança e app. | Comercial + financeiro. | PENDENTE_CRITICO |
| DH-003 | Definir fonte comercial e financeira oficial por campo. | Catálogo, proposta, Planejador e Asaas têm papéis diferentes. | Integração e cobrança. | Governança. | PENDENTE_CRITICO |
| DH-004 | Validar dados institucionais e representação da contratada. | Documentos anteriores registram dados que exigem confirmação contra fonte societária vigente. | Contrato. | Jurídico + direção. | PENDENTE_ALTO |
| DH-005 | Homologar método de assinatura e cláusulas jurídicas pendentes. | Cotejo contratual e divergência entre assinatura física/eletrônica. | Contrato e go-live. | Jurídico. | PENDENTE_CRITICO |
| DH-006 | Definir CRM operacional, sistema de tarefas e calendário oficiais. | Material histórico registra fontes concorrentes; GitHub contém módulos, mas não confirma operação vigente. | Automação e rastreabilidade. | Operação. | PENDENTE_ALTO |
| DH-007 | Aprovar regra de dados familiares, menores, consentimento e visibilidade. | Ficha/estrutura familiar foi implementada; representação e RLS devem ser confirmadas. | App, CRM, privacidade e contrato. | Direção + jurídico + operação. | PENDENTE_CRITICO |
| DH-008 | Ratificar taxonomia internacional de SKU e destino de `PACOTE-*`, `CA-CID-AT-*` e `CA-CID-DE-*`. | Dicionário registra formatos como propostos/ambíguos. | Catálogo, proposta e Asaas. | Comercial + governança. | PENDENTE_ALTO |
| DH-009 | Definir critérios de aceite por microentrega e por fase. | Entregas/marcos existem, mas critérios não estão integralmente homologados. | OS, qualidade e encerramento. | Operação + comercial. | PENDENTE_ALTO |
| DH-010 | Definir quais dados locais são mock, seed, caso-modelo ou dados vivos. | `src/data/` possui casos, templates, propostas, relatórios e saneamento. | Migração e privacidade. | Produto + dados. | PENDENTE_CRITICO |

## Protocolo de fechamento

Cada decisão só pode ser encerrada quando houver: decisão escrita; responsável; data; fonte de evidência; impacto mapeado; regra implementável; teste/critério de aceite; e atualização dos documentos e sistemas afetados.
