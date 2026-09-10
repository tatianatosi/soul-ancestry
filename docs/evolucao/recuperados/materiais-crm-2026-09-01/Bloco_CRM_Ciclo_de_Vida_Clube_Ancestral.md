# Bloco CRM — Ciclo de Vida, Discovery, Pós-Call e Legado
## Arquitetura Conceitual do CRM Mestre — Clube Ancestral

**Data:** 10/08/2026 · **Natureza:** arquitetura conceitual e recomendação. Não migrar dados, não apagar contatos, não criar automações, não alterar sistemas externos.

---

## 1. Diagnóstico do estado atual

| Aspecto | Estado | Evidência |
|---|---|---|
| CRM operacional ativo | Inexistente | CRM Pipeline na Mestre é "DADOS TESTE" com leads fictícios (Maria Silva, João Rossi) |
| CRM Lovable | Sem login staff | Projeto existe mas exige papéis (admin/gestor/operador) não configurados |
| Contatos históricos | Preservados em legado | Mas sem separação clara entre contato, lead, oportunidade, caso e cliente |
| 2 clientes sem nome | "Amigo do Danilo", "Amigo Francês" | Em Casos 360 do Desk — não podem existir como cliente sem identificação |
| Painel de Calls Discovery | Existe mas não lido | [Google Sheets](https://docs.google.com/spreadsheets/d/1iq61cjwZkd6dQ8b3fqiPBwKGQPRh7g_0npCHchR0_10/edit) — roteiro vivo de calls |
| CA OPS Painel Geral Mestre | Já auditado pela Auditoria-Mãe | Requer reauditoria da versão atual |
| Transcrição de discovery | 1 existente (João Marcelo) | [Google Docs](https://docs.google.com/document/d/1OePJRLpY8ZK_9Oewfdux5Jd4LWK7q3wtict-1m_ieYE/edit) |

---

## 2. Arquitetura conceitual do CRM Mestre

### 2.1 — Ciclo de vida (funil canônico)

```
CONTATO → LEAD → OPORTUNIDADE → PROPOSTA → CASO → CLIENTE ATIVO → PÓS-ENTREGA → LEGADO
```

Cada estágio tem regras de entrada, saída e dados obrigatórios. Nenhum estágio é automático.

### 2.2 — Estágios e regras

| Estágio | Definição | Dados obrigatórios | Regra de saída |
|---|---|---|---|
| **Contato** | Pessoa com quem houve qualquer interação (WhatsApp, call, indicação, evento, rede social) — sem intenção comercial confirmada | Nome, canal de origem, data do primeiro contato | Confirmação de interesse → vira Lead |
| **Lead** | Contato que expressou interesse em cidadania, genealogia ou memória familiar | Nome, contato, país de interesse, linha investigada (se mencionada), origem do lead, responsável | Qualificação de oportunidade (descoberta feita, escopo初步) → vira Oportunidade |
| **Oportunidade** | Lead qualificado com escopo preliminar e intenção comercial confirmada | País, linha investigada, estimativa de necessidade, responsável, etapa de discovery | Proposta formal enviada → vira Proposta |
| **Proposta** | Oportunidade com proposta formal enviada ao cliente | ID de caso vinculado, SKUs/produtos propostos (da Mestre), preço (da Mestre), formato (à vista/etapas/recorrência), data de envio | Aceite do cliente → vira Caso |
| **Caso** | Proposta aceita, contrato em formalização ou assinado | ID de caso, contrato (pendente/assinado), pagamento (pendente/confirmado via Asaas), onboarding documental, responsável, fase (1/2), próximo marco | Pagamento confirmado + onboarding liberado → vira Cliente Ativo |
| **Cliente Ativo** | Caso com contrato assinado, pagamento confirmado no Asaas e onboarding documental liberado | Tudo do estágio Caso + data de ativação, fase atual de pesquisa/entrega, entregas liberadas no App (conforme nível de acesso) | Conclusão da entrega contratada → vira Pós-entrega |
| **Pós-entrega** | Cliente com entrega concluída, em fase de acompanhamento, upsell ou continuidade | Data de conclusão, entregas realizadas, satisfação, oportunidade de upsell (se aplicável) | Decisão de continuidade (assinatura/plano) ou arquivamento → vira Legado |
| **Legado** | Cliente concluído, pausado, inativo ou arquivado — preservado para histórico | Data de encerramento, motivo (concluído/pausado/inativo), histórico completo preservado | Nunca sai do Legado — apenas pode ser reativado como novo Lead se houver novo interesse |

### 2.3 — Estados especiais (não seguem o funil linear)

| Estado | Quando usar |
|---|---|
| **Pausado** | Caso ou cliente interrompido temporariamente (aguardando documento externo, decisão judicial, questão pessoal) — volta ao estágio anterior quando reativado |
| **Descartado** | Lead que perdeu interesse ou não qualifica — preservado em legado, nunca apagado |
| **Reativado** | Contato/lead legado que retorna com novo interesse — cria novo registro de Lead com referência ao histórico |
| **Duplicado** | Mesma pessoa em dois registros — fundir preservando histórico de ambos |

---

## 3. Separação de ambientes

### 3.1 — Ambientes do CRM

| Ambiente | O que contém | Quem acessa | Pode alimentar indicadores? |
|---|---|---|---|
| **CRM Operacional** | Leads, oportunidades, propostas, casos, clientes ativos, pós-entrega em curso | Equipe staff (com login e papéis) | Sim |
| **Legado** | Contatos não convertidos, leads descartados, casos concluídos/pausados/inativos | Equipe staff (somente leitura) | Não — apenas contagem histórica |
| **Teste/Demo** | Dados fictícios (Maria Silva, João Rossi, Marina Alves etc.) | Equipe staff (isolado) | Nunca |

### 3.2 — Regra de isolamento

- Dados de teste nunca podem aparecer no CRM Operacional.
- Contatos de legado não alimentam funil, pipeline ou indicadores de conversão.
- Se um contato de legado retornar, cria-se um novo Lead no CRM Operacional com referência ao histórico de legado (não reativa o registro antigo no funil).

---

## 4. Matriz de campos obrigatórios por estágio

| Campo | Contato | Lead | Oportunidade | Proposta | Caso | Cliente Ativo | Pós-entrega | Legado |
|---|---|---|---|---|---|---|---|---|
| Nome | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório |
| Contato (WhatsApp/email) | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Preservado |
| Canal de origem | Obrigatório | Obrigatório | — | — | — | — | — | Preservado |
| País de interesse | — | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Preservado | Preservado |
| Linha investigada | — | Se mencionada | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Preservado | Preservado |
| Responsável | — | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Preservado |
| Origem do lead | — | Obrigatório | — | — | — | — | — | Preservado |
| ID de caso | — | — | Gerado na proposta | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Preservado |
| SKU/produto proposto | — | — | — | Da Mestre | Da Mestre | Da Mestre | Preservado | Preservado |
| Preço | — | — | — | Da Mestre | Da Mestre | Da Mestre | Preservado | Preservado |
| Contrato | — | — | — | — | Pendente/Assinado | Assinado | Preservado | Preservado |
| Pagamento | — | — | — | — | Pendente/Confirmado (Asaas) | Confirmado (Asaas) | Preservado | Preservado |
| Onboarding | — | — | — | — | Liberado? | Liberado | Preservado | Preservado |
| Fase atual | — | — | — | — | 1 ou 2 | 1 ou 2 | Concluída | Preservado |
| Próximo marco | — | — | Obrigatório | Obrigatório | Obrigatório | Obrigatório | — | — |
| Data de entrada no estágio | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório |
| Motivo de saída | — | — | — | — | — | — | Obrigatório | Obrigatório |

---

## 5. Discovery e pós-call

### 5.1 — Discovery (qualificação de lead → oportunidade)

O discovery é o processo que transforma um Lead em Oportunidade. Deve registrar:

| Campo | Descrição |
|---|---|
| Data da call | Quando aconteceu |
| Participantes | Quem do Clube Ancestral + cliente |
| País de interesse | Confirmado na call |
| Linha investigada | Sobrenome, ancestral, período, região |
| Objetivo do cliente | Cidadania, genealogia, memória, herança, outro |
| Maturidade | Explorando, comparando, decidido |
| Estimativa de urgência | Baixa, média, alta |
| Documentos já possuídos | Lista inicial |
| Documentos necessários | Lista preliminar |
| Bloqueadores identificados | Certidões ausentes, lacunas, questões jurídicas |
| Próxima ação | Agendamento, envio de proposta, coleta de documentos |
| Responsável pela próxima ação | Quem faz o quê |

**Modelo de referência:** a transcrição de discovery de João Marcelo ([Google Docs](https://docs.google.com/document/d/1OePJRLpY8ZK_9Oewfdux5Jd4LWK7q3wtict-1m_ieYE/edit)) e o Painel de Calls Discovery ([Google Sheets](https://docs.google.com/spreadsheets/d/1iq61cjwZkd6dQ8b3fqiPBwKGQPRh7g_0npCHchR0_10/edit)) são os artefatos existentes a serem auditados e usados como base — mas seu conteúdo ainda não foi lido nesta consolidação.

### 5.2 — Pós-call (registro imediato)

Após cada call, o responsável deve registrar no CRM:
1. Atualização do estágio do lead/oportunidade (se mudou)
2. Resumo da conversa (texto livre)
3. Descobertas (documentos mencionados, bloqueadores, urgência)
4. Próxima ação e prazo
5. Se virou proposta: gerar ID de caso e vincular

---

## 6. Relação com Desk Intelligence e App Cliente

### 6.1 — CRM → Desk

O CRM alimenta o Desk com:
- ID de caso (gerado no CRM, referenciado no Desk)
- Nome do cliente
- País e linha investigada
- Responsável
- Estágio comercial atual
- Histórico de relacionamento (resumo, não transcrições completas)

O Desk não cria leads, contatos ou clientes — apenas referencia os IDs do CRM.

### 6.2 — CRM → App Cliente (via Desk)

O App Cliente só recebe do CRM (via Desk) o que for permitido pelo nível de acesso:
- **Nível 1 (Auditoria interna):** nada do CRM é exposto
- **Nível 2 (Portal de proposta):** nome do cliente, escopo resumido, próxima ação
- **Nível 3 (Workspace do cliente):** nome, jornada, entregas, pendências — nunca histórico comercial completo do CRM

### 6.3 — Desk → CRM (feedback)

O Desk devolve ao CRM:
- Status operacional do caso (fase, documentos, entregas)
- Pagamento confirmado (do Asaas, não do Desk)
- Bloqueadores operacionais identificados
- Data de conclusão e motivo de encerramento

---

## 7. Gestão de legado

### 7.1 — O que vai para legado

| Tipo | Quando |
|---|---|
| Contato não convertido | 90 dias sem resposta após último follow-up |
| Lead descartado | Perdeu interesse, não qualifica, ou decidiu não prosseguir |
| Caso concluído | Entrega finalizada e aceita pelo cliente |
| Caso pausado > 180 dias | Reavaliar se vira legado inativo ou se reativa |
| Cliente inativo | Sem interação há 12 meses após pós-entrega |

### 7.2 — Regras de preservação

- **Nunca apagar** — legado é append-only.
- Dados de legado podem ser consultados para referência histórica mas não alimentam funil, pipeline, KPI ou indicador.
- Se um contato de legado retornar: criar novo Lead no CRM Operacional, referenciar o histórico de legado no campo "histórico anterior".
- Dados de teste (Maria Silva etc.) vão para o ambiente Teste/Demo, não para legado.

---

## 8. Status comerciais padronizados (alinhado ao Bloco 4)

| Status | Estágio do CRM | Significado |
|---|---|---|
| Lead novo | Lead | Primeiro contato registrado com interesse |
| Aguardando resposta inicial | Lead | Contato iniciado, sem retorno |
| Interessado | Lead → Oportunidade | Cliente confirmou interesse e qualificou |
| Proposta enviada | Proposta | Proposta formalmente enviada |
| Proposta aceita | Proposta → Caso | Cliente aceitou |
| Contrato pendente | Caso | Contrato enviado, aguardando assinatura |
| Contrato assinado | Caso | Assinado por ambas as partes |
| Pagamento pendente | Caso | Cobrança gerada, aguardando confirmação no Asaas |
| Pagamento confirmado | Caso → Cliente Ativo | Pagamento reconciliado no Asaas |
| Onboarding iniciado | Cliente Ativo | Coleta de documentos liberada |
| Documentos solicitados | Cliente Ativo | Lista de documentos enviada ao cliente |
| Pesquisa em andamento | Cliente Ativo | Fase 1 ou 2 em execução |
| Fase 01 entregue | Cliente Ativo | Diagnóstico inicial concluído |
| Fase 02 prevista | Cliente Ativo | Fase 2 planejada |
| Fase 02 em produção | Cliente Ativo | Fase 2 em execução |
| Fase 02 entregue | Cliente Ativo → Pós-entrega | Fase 2 concluída |
| Pausado | Especial | Interrompido temporariamente |
| Concluído/Legado | Legado | Finalizado |

---

## 9. Casos reais atuais — classificação proposta

| Caso (Desk Casos 360) | Estágio CRM proposto | Justificativa |
|---|---|---|
| Giovanna Prade (CA-CID-IT-2026-001) | Proposta → Caso | Proposta disponível, contrato em revisão jurídica, modalidade de pagamento aguardando escolha |
| Sophia Piccoli Santiago (CA-ITA-SOPHI-PICCOLI) | Proposta → Caso | Fase 01 concluída, mas oferta ainda não formalizada como produto próprio |
| Ana Luiza Gomes Silveira (CA-CID-AT-2026-002) | Oportunidade | Sem preço/escopo definido (CA-CID-AT-001 sem preço no Planejador) |
| João Marcelo Faria Moraes (CA-CID-PT-2026-002) | Oportunidade | Discovery feito, proposta pendente; SKU base (PACOTE-PT-01) não oficial |
| Danilo Kluyber — Croácia (CA-CID-HR-2026-001) | Oportunidade | Em andamento, mas SKU base (PACOTE-CROACIA-01) não oficial |
| Danilo Kluyber — Itália (CA-CID-IT-2026-002) | Oportunidade | Saúde "crítico" no Desk, sem detalhe do motivo |
| Danilo Kluyber — Alemanha (CA-CID-DE-2026-001) | Oportunidade | SKU base (CA-CID-DE-001/002/003b) não oficial |
| "Amigo do Danilo" (CA-NAT-BR-2026-001) | Lead (incompleto) | Sem nome próprio — não pode avançar sem identificação |
| "Amigo Francês" (CA-NAT-FR-2026-001) | Lead (incompleto) | Sem nome próprio — não pode avançar sem identificação |

**Nenhum dos 9 casos é "Cliente Ativo" hoje** — nenhum tem contrato assinado + pagamento confirmado no Asaas + onboarding liberado. O mais avançado (Giovanna) está em transição de Proposta para Caso.

---

## 10. Recomendações para implementação futura

1. **Não migrar dados agora** — construir o modelo conceitual primeiro, validar com 1-2 pilotos, depois migrar.
2. **Isolar dados de teste** imediatamente — Maria Silva, João Rossi e a camada fictícia do Desk (Marina Alves etc.) devem sair do CRM Operacional.
3. **Cadastrar nome real** dos 2 clientes sem nome antes de qualquer avanço comercial.
4. **Configurar login staff** com papéis (admin/gestor/operador) antes de qualquer uso operacional.
5. **Usar o Painel de Calls Discovery** como ponto de partida para o processo de discovery — auditar seu conteúdo primeiro.
6. **Todo novo caso** que entrar no Desk deve ter origem registrada no CRM (contato → lead → oportunidade → proposta → caso).
7. **Auditar o CA OPS Painel Geral Mestre** vs Auditoria-Mãe para identificar se já existe estrutura de CRM utilizável lá dentro.

---

## Resumo

O CRM Mestre do Clube Ancestral deve ser reconstruído a partir de uma lógica de ciclo de vida (Contato → Lead → Oportunidade → Proposta → Caso → Cliente Ativo → Pós-entrega → Legado), com separação clara entre ambiente operacional, legado e teste. Os 9 casos atuais do Desk correspondem majoritariamente a Oportunidades e Propostas — nenhum é Cliente Ativo. Os 2 casos sem nome próprio são Leads incompletos que não podem avançar sem identificação. O CRM é fonte de contato/lead/cliente/caso/histórico; a Mestre é fonte de SKU/preço/link; o Asaas é fonte de pagamento; o Desk é consolidador operacional; o App é recorte cliente-facing. Nenhum dado deve ser migrado ou alterado até o modelo conceitual ser validado com 1-2 pilotos.
