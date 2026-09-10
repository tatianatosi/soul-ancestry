# Clube Ancestral — Decisões Canônicas: CRM, Catálogo, Planejador e Jornada

- **Versão:** 1.0
- **Data:** 19 de agosto de 2026
- **Estado:** decisão operacional consolidada; implementação pendente de commit e validação técnica
- **Escopo:** Desk Intelligence, CRM proprietário, Planejador, catálogo por jornada, importação legada, onboarding e higiene de dados de demonstração.

## 1. Objetivo

Transformar o Desk Intelligence no sistema operacional canônico do Clube Ancestral, com modelo único de contatos, conversas, oportunidades, famílias, casos, planejamento e entregas ao cliente. O primeiro corte funcional executa um fluxo real completo — Ana Luiza como caso-piloto e João como primeiro fluxo novo de aceite verbal para confirmação formal — antes de automações, dashboards amplos e integrações financeiras externas.

## 2. Decisões já tomadas

- Planilha Mestre de Produtos, CRM OPS e demais planilhas deixam de ser sistemas operacionais; viram legado somente leitura (inventário, migração, reconciliação, auditoria).
- Nenhum webhook novo usa planilha como etapa intermediária.
- Desk Intelligence/Supabase é a fonte canônica de novos registros operacionais.
- Placego serve apenas para exportar contatos e metadados mínimos; não é fonte de verdade de conversão, investimento, contexto comercial ou etapa.
- WhatsApp, transcrições e reuniões são evidências de conversa, registradas em interações imutáveis.
- Funil comercial modelado por eventos imutáveis, nunca por um único campo de status.
- Catálogo reduzido a produtos-pai e módulos de jornada Top 30; país não é SKU.
- Preço sugerido homologado torna-se preço comercial vigente; preço antigo torna-se histórico legado.
- Planejador usa trilhas por país/via como configuração interna, sem decisão jurídica, score de elegibilidade ou prazo automático.
- Onboarding exige contrato assinado, pagamento inicial confirmado, responsável, núcleo/dossiê e plano inicial.
- App Cliente mostra somente conteúdo aprovado e sanitizado.
- WhatsApp automático, webhook de micro-entrega, dashboard de ROI/CAC e automações financeiras ficam fora do MVP.
- Dados fictícios devem ser identificados, isolados e substituídos por fixtures de desenvolvimento antes do go-live.

## 3. Arquitetura e fontes de verdade

| Domínio | Fonte canônica | Responsabilidade |
| --- | --- | --- |
| Contatos, oportunidades, famílias, casos, tarefas | Desk Intelligence / Supabase | Operação diária |
| Conversas, calls, WhatsApp, e-mails, reuniões | Desk Intelligence / Supabase | Registro imutável de evidência |
| Proposta aprovada | Ambiente documental autorizado | Referência comercial e versão aceita |
| Contrato e Ordem de Serviço | Ambiente documental autorizado | Instrumentos e assinaturas |
| Cobrança e pagamento | Asaas | Evento e status transacional |
| Dossiê, documentos, evidências | Drive/ambiente autorizado | Fonte documental restrita |
| Jornada e conteúdo ao cliente | App Cliente | Conteúdo aprovado e sanitizado |
| Catálogo comercial | Desk / `product_catalog` | Produto-pai, preço vigente, condição, homologação |
| Trilha técnica de cidadania | Desk / `citizenship_tracks` | País, via, requisitos, riscos, revisão, documentos |
| Planilhas antigas | Legado somente leitura | Migração e auditoria |

**Precedência:** Asaas não define escopo/preço/elegibilidade; Drive não define etapa comercial ou pagamento; Planejador não define direito, prazo ou oferta automática; App não recebe dados internos ou evidência bruta; Desk indexa dossiês, mas não substitui o repositório documental.

## 4. Sistemas legados e migração

Legados controlados: Planilha Mestre de Produtos, CRM OPS, outra planilha de CRM. Placego é origem de importação mínima.

**Importação Placego:** primeira importação por CSV; sem API, sincronização contínua ou webhook antes de conjunto validado e regras de deduplicação. Campos mínimos: `placego_contact_id`, nome, e-mail, telefone/WhatsApp, data de entrada, origem, campanha, observação legada. Campos Placego não provam conversão, custo, campanha ativa, aceite, proposta ou pagamento.

**Deduplicação:** telefone normalizado (1ª chave), e-mail válido (2ª chave), nome + telefone parcial exige revisão humana. Todo registro preserva `source_system`, `source_record_id`, lote e data. Ambíguo entra em exceção de migração, sem fusão automática.

## 5. Modelo CRM proprietário

Entidades mínimas: `contacts`, `opportunities`, `crm_interactions`, `discovery_assessments`, `conversion_events`, `families`, `family_members`, `cases`, `case_plans`, `client_deliverables`, `communication_queue`, `legacy_import_batches`, `legacy_record_links`, `migration_exceptions`, `product_catalog`, `citizenship_tracks`, `case_services`.

Etapas por evento imutável: `lead_created`, `discovery_scheduled`, `discovery_completed`, `proposal_sent`, `verbal_acceptance_confirmed`, `formal_confirmation_received`, `contract_sent`, `contract_signed`, `initial_payment_confirmed`, `onboarding_started`, `case_activated`, `lost`.

**Regra de lead ativo:** nenhum lead ativo sem área responsável, responsável nominal, próxima ação e prazo da próxima ação.

## 6. Painel de Calls e Discovery

Interface do Desk gravando direto no Supabase. `crm_interactions` é imutável; correção gera nova interação ligada à anterior (`supersedes_interaction_id`). `discovery_assessments` guarda objetivo, nacionalidade, país/linha, estrutura familiar, geração do ascendente, linha de transmissão, via preliminar, sinal de aderência, confiança, complexidade e estado documental, risco de ruptura, SPIN e observações internas.

Validações: call realizada exige resumo validado, resultado e próxima ação datada; gravação exige consentimento; SPIN concluído exige registro; sinal de aderência e via são preliminares e internos.

## 7. Planejador e trilhas de cidadania

`citizenship_tracks`: país, via preliminar, marco jurídico, status da via, requisitos, riscos, documentos prioritários, pesquisa externa aplicável, autorização necessária, idioma/entrevista, revisão humana/jurídica, status de atualização, última revisão, responsável, conteúdo sanitizado permitido ao cliente.

Trilhas iniciais: Itália, Portugal, Espanha, Alemanha, Áustria, Polônia, Hungria, Luxemburgo, Croácia, Romênia, Brasil — naturalização, Multipaís, Em investigação.

Pode gerar: checklist inicial, perguntas prioritárias, dependências do cliente, pendências internas, próxima ação, próximo marco verificável, entrega robusta prevista, micro-entrega possível, necessidade de revisão.

Não pode: determinar direito, calcular score para cliente, prometer prazo, gerar contrato automático por país, recomendar/contratar SKU automaticamente, iniciar pesquisa externa sem autorização, exibir risco/score/hipótese no App Cliente.

## 8. Catálogo comercial Top 30 por jornada

`preco_historico_legado` só para auditoria; `preco_comercial_vigente` deriva do preço sugerido homologado. Só produto homologado entra em proposta. Exceção comercial exige justificativa, aprovador e validade e não altera o catálogo. App Cliente não exibe SKU, preço, ranking ou link técnico.

### Produtos-pai por jornada

**Descoberta e diagnóstico:** CA-DIAG-001 Diagnóstico de Cidadania por Etapas (Top 10) · CA-DIAG-002 Diagnóstico Familiar Multipaís (Top 30) · CA-DIAG-003 Diagnóstico de Pesquisa de Origem (Top 30) · CA-DIAG-004 AncestralScan / Discovery gratuita (funil, sem cobrança).

**Pesquisa e estratégia:** CA-PESQ-001 Pesquisa Genealógica de Base (Top 10) · CA-PESQ-002 Pesquisa Genealógica Familiar Ampliada (Top 10) · CA-PESQ-003 Pesquisa Documental Direcionada (Top 30) · CA-PESQ-004 Pesquisa de Linha Alternativa/Multipaís (Top 30).

**Documentação e prontidão:** CA-DOC-001 Plano Documental e Checklist de Prontidão (Top 30) · CA-DOC-002 Montagem de Pasta para Cidadania (Top 10) · CA-DOC-003 Revisão ou Atualização de Pasta (Top 30) · CA-DOC-004 Retificação Documental Assistida (sob demanda) · CA-DOC-005 Coordenação de Tradução e Apostilamento (Top 30) · CA-DOC-006 Solicitação de Certidões e Registros (sob demanda).

**Protocolo e acompanhamento:** CA-PROT-001 Assessoria de Protocolo e Acompanhamento (Top 10) · CA-PROT-002 Estratégia de Via Jurídica com Parceiro (sob demanda, revisão obrigatória) · CA-PROT-003 Acompanhamento Familiar de Processo Compartilhado (Top 30) · CA-PROT-004 Preparação de Reunião ou Entrevista Consular (Top 30).

**Pós-reconhecimento:** CA-POS-001 Regularização Pós-Reconhecimento · CA-POS-002 Registros Familiares Derivados · CA-POS-003 Passaporte e Registros Consulares · CA-POS-004 Continuidade Cidadão (todos Top 30).

**Memória e legado:** CA-MEM-001 Entrevista de Memória Guiada (Top 30) · CA-MEM-002 Livro de História Familiar (Top 10) · CA-MEM-003 Livro de Memórias Premium (Top 30) · CA-MEM-004 Mapa Ancestral Ilustrado (Top 30) · CA-MEM-005 Legado em Vídeo (sob demanda) · CA-MEM-006 Acervo Digital Familiar (Top 30).

**Continuidade:** CA-ASS-001 Plano Essência (Top 30) · CA-ASS-002 Plano Memórias (Top 10) · CA-ASS-003 Plano Legado (Top 30) · CA-ASS-004 Plano Anual Memórias (Top 30) · CA-ASS-005 Assinatura Pós-Reconhecimento (Top 30).

**Legado:** SKUs antigos não são apagados; são ligados ao produto-pai por `legacy_sku_mappings`. Novo SKU comercial, link Asaas ou preço só após escopo aprovado, preço homologado, condição definida, responsável comercial, validação humana e ação externa aprovada.

## 9. Produtos contratados por caso

```text
Produto-pai comercial
+ trilha por nacionalidade/via
+ composição familiar
+ escopo e condição aprovados
= serviço contratado do caso
```

`case_services`: `case_id`, `product_catalog_id`, `citizenship_track_id`, escopo aprovado, condição comercial aprovada, preço acordado, exceção comercial, status (`draft`, `approved`, `contracted`, `active`, `completed`, `cancelled`), contrato de referência, responsável.

- **Ana Luiza:** composição de caso (CA-DIAG-002, ou CA-PROT-003 apenas se o escopo assinado incluir acompanhamento familiar), trilha Áustria §58c StbG, núcleo Ana/Adair/Alice/Felipe, estado `formalization_in_preparation` / NO_GO, R$ 9.600 apenas como condição particular de proposta aceita, cobrança bloqueada.
- **João:** CA-DIAG-001, trilha Portugal (via a confirmar), condição conversada R$ 1.290 com Pix Asaas previsto para 03/09/2026, estado aceite verbal, próxima ação solicitar confirmação escrita; sem cobrança, contrato ou onboarding antes da confirmação formal.
- **Naturalização brasileira (amigo do Danilo):** CA-DIAG-001 + trilha Brasil — naturalização/residência; lead em triagem, via em confirmação; CA-PROT-001 só após diagnóstico e revisão humana.

## 10. Onboarding e ciclo do cliente

```text
Contrato assinado + pagamento inicial confirmado + responsável definido
+ núcleo familiar quando aplicável + dossiê-mãe vinculado
+ plano inicial e checklist criados = onboarding iniciado
```

Magic Link não é gatilho de onboarding; é consequência dele. Fases: aceite e formalização, onboarding, pesquisa inicial, pesquisa e validação, preparação documental, protocolo e acompanhamento, reconhecimento, pós-reconhecimento.

Cadência MVP: D0 checklist e responsável · D1–D3 revisão do plano inicial · até D7 primeiro valor verificável · D10 alerta de ausência de touchpoint · D14 alerta crítico · D30 check-in humano (NPS só se aprovado).

## 11. Micro-entregas e App Cliente

`client_deliverables` com `approval_status` (`draft`, `in_review`, `approved`, `published`, `archived`), canal de notificação, `available_at`, `viewed_at`, referência interna e responsável. Tipos MVP: boas-vindas, plano de ação, checklist documental, confirmação de documento recebido, documento localizado, documento validado, pendência contextualizada, atualização sem ação, árvore inicial, relatório parcial, próximo passo personalizado.

Somente entregas `published` chegam ao App Cliente. Nunca publicar documento cru, evidência, fonte, hipótese jurídica, score, gravação, transcrição, URL interna, preço técnico ou dado de terceiro.

## 12. Caso-piloto Ana Luiza

Case ID canônico `CA-CID-AT-FAM-2026-001`, alias histórico `CA-AUT-ANALUIZA-FAM-2026-001`, responsável Tatiana Tosi, trilha Áustria §58c StbG, aceite formal em 14/08/2026, estado formalização em preparação, go-live NO_GO.

Participantes: Ana Luiza (contratante e titular), Adair (pai), Alice (irmã, dados pendentes), Felipe (dependente menor, representação pendente). Adriel Felipe está fora do escopo.

Bloqueios ativos: dados cadastrais da contratante, dados da contratada contra fonte societária, contrato específico, Anexo I/OS e critérios de aceite, revisão jurídica, método de assinatura, dados da Alice, representação do Felipe, formalização do `case_service` e Asaas bloqueado.

Carga inicial: caso interno bloqueado, sem cobrança, contrato, pesquisa externa, comunicação automática ou acesso de cliente.

## 13. Fluxo João

Aceite verbal → confirmação formal escrita → formalização → contrato assinado → pagamento confirmado → onboarding iniciado, cada estado com evidência própria e próxima ação datada. Mensagem-base de confirmação formal registrada na fila humana, sem envio automático.

## 14. Higiene de dados

`data_origin` obrigatório: `production_real`, `migration_legacy`, `development_fixture`, `sandbox`, `unknown_needs_review`.

Fixtures usam nomes claramente fictícios, sem telefone, e-mail ou documento real, e não aparecem em produção, métricas, filas, App Cliente ou pesquisa. Registros sem origem viram `unknown_needs_review` em fila de saneamento. Limpeza gera relatório de preservados, migrados, arquivados, removidos e exceções. Exclusão produtiva exige backup, lista de IDs e confirmação específica.

## 15. MVP e backlog

**MVP:** artefato de decisões canônicas, migration com entidades mínimas, contatos/oportunidades/conversas, Painel de Calls e Discovery, eventos imutáveis, famílias/casos/planejador, catálogo Top 30 e trilhas, `case_services`, fila de comunicação humana, importador Placego CSV, saneamento de fictícios, Ana bloqueada como piloto.

**Backlog:** API contínua Placego, integração Asaas de criação/atualização, automação WhatsApp, webhooks de micro-entregas, deep links e fallback, dashboard de investimento/CAC/ROI/atribuição, NPS automatizado, gamificação, recomendação automatizada de produto, simulador jurídico.

## 16. Critérios de aceite

1. Planilhas legadas não recebem dados novos por fluxos do Desk.
2. Importação Placego por CSV com rastreabilidade e deduplicação.
3. Conversa registrável de modo imutável.
4. Discovery com campos estruturados e próxima ação obrigatória.
5. Aceite verbal e confirmação formal como eventos separados.
6. Contrato, pagamento, onboarding e caso ativo como estados separados com gates.
7. Planejador gera checklist e próximos passos sem decisão jurídica automática.
8. Ana existe como caso piloto bloqueado, com ID canônico e bloqueios visíveis.
9. João segue verbal → formal → contrato → pagamento → onboarding.
10. Naturalização brasileira é trilha, não SKU de país.
11. Catálogo Top 30 separado das trilhas técnicas.
12. Fictícios classificados e ausentes da operação produtiva.
13. Comunicação em fila humana, sem envio automático.
14. App Cliente só vê entregas publicadas e sanitizadas.

## 17. Anti-padrões proibidos

Planilha como ponte obrigatória; SKU por país ou via; SKU automático por caso antes de repetição e homologação; status único no lugar de eventos; tratar aceite verbal como contrato/pagamento/cliente ativo; onboarding por Magic Link sem contrato e pagamento; prometer prazo automático; publicar score, hipótese ou risco ao cliente; notificar automaticamente sem conteúdo aprovado; criar cobrança/link Asaas por sugestão do Planejador; misturar dados reais e fictícios; apagar legado sem migração e confirmação.

## Controle de versão

| Versão | Data | Decisão |
| --- | --- | --- |
| 1.0 | 19/08/2026 | Consolidação inicial de CRM, legado, Placego, Top 30, Planejador, Ana, João, naturalização brasileira e higiene de dados |

## Reconciliação com o estado real do repositório (02/09/2026)

A proprietária pediu para aplicar as decisões deste documento, apontando que a Planilha Mestre é só uma camada (layer) dentro delas. Conferido linha a linha contra o código e as migrations:

**Já implementado, confirmado por schema real** — as decisões de Catálogo (seção 8) e Planejador (seção 7) já existem como tabelas reais desde 19–22/08: `product_catalog` (catálogo homologado, preço vigente) e `trilhas_juridicas` (equivalente a `citizenship_tracks` — país, via, marco jurídico, status). `preco-canonico.ts` já declara exatamente a precedência pedida aqui: `product_catalog`/exceção comercial aprovada são as fontes canônicas de preço; Planilha Mestre é `"legado — auditoria histórica"`, nunca fonte operacional. `leads.tsx` já usa `listarTrilhasJuridicas` para vincular trilha e marco ao lead. Ou seja: a arquitetura de dados desta seção já está de pé — o que faltava era a interface ainda falar como se a Planilha Mestre fosse a fonte viva.

**Corrigido nesta rodada** — texto e rótulos que ainda descreviam a Planilha Mestre como fonte de verdade viva, em vez de camada legada por trás do catálogo homologado: `leads.tsx` (seção "Recomendação comercial", campo "Referência de SKU"), `dicionario-calls-crm.ts` (Princípios de Governança, v1.0 → v1.1), `governanca.dicionario-calls-crm.tsx` e `painel-catalogo.tsx`. Nenhuma mudança de schema, comportamento ou dado — só a descrição passou a bater com o que `preco-canonico.ts` já impunha.

**Não aplicado, e não deveria ser** — a seção 5 deste documento propõe entidades novas de CRM (`contacts`, `opportunities`, `crm_interactions`, `discovery_assessments`, `conversion_events`, `families`, `family_members`, `cases`...). Essas tabelas chegaram a ser criadas (ver `contacts`/`opportunities`, hoje preservadas só em `/historico/fluxo-comercial-canonico`, 0 registros desde 21/08) — mas foram deliberadamente descontinuadas por uma decisão posterior e mais recente, `CA-LOVABLE-RESGATE-DESK-7-SECOES-CRM-VIVO-E-SUBITENS-v1.1` (28/08/2026): *"não basta haver funções, tabelas ou componentes isolados... use apenas rotas e telas existentes"* — o CRM Vivo real roda sobre `leads`/`crm_casos`, não sobre um segundo modelo paralelo. Pela regra já combinada com a proprietária (documento mais novo prevalece quando há contradição), esta parte da seção 5 fica como registro histórico da decisão de 19/08, superada pela de 28/08 — não como pendência de implementação.

**Ainda pendente de decisão, não tocado agora** — as seções 5 (`case_services`, `client_deliverables`, `communication_queue`), 6 (Painel de Calls/Discovery além do que já existe), 9–13 (produtos contratados por caso, onboarding, caso-piloto Ana, fluxo João) e 14 (higiene de dados fictícios) não têm o mesmo tipo de evidência direta de schema já implementado que Catálogo/Planejador têm — ficam para revisão específica, não fabricadas aqui.

Verificação: `npx tsc --noEmit` (limpo), `npx vitest run` (164 arquivos, 1595 testes, todos verdes), `npx vite build` (sucesso).
