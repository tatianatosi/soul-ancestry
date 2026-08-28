# Inventário de prompts Lovable da semana e priorização pós-CRM

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Documento de decisão e execução  
**Escopo:** Levantamento dos prompts e entregas encontradas entre 16 e 20/08/2026; consolidação de pendências prioritárias pós-CRM; prevenção de novos ciclos de auditoria sem implementação.

---

## 1. Decisão executiva

O CRM diário, o Painel Hoje, a proposta Canva, os gates contratuais, dependentes e a matriz jurídica já receberam implementação funcional nesta semana. A sequência seguinte não deve reabrir CRM, redesenhar o Desk ou criar painéis de KPI adicionais.

A prioridade operacional passa a ser:

1. **Motor Genealógico e Ficha Piloto Genealógica** como fonte canônica de pessoas, relações, linhas, árvore e linha do tempo.
2. **Biblioteca de Evidências e Pesquisa Genealógica** para normalizar fontes, evidências, validação, documentos e pedidos.
3. **Proposta Canva operacional**: completar a materialização interna da proposta da Ana, sem gerar proposta, contrato, assinatura ou cobrança externa.
4. **Relatórios de Fase 1 e Fase 2**: conectar os relatórios já existentes aos dados da ficha, evidências e aprovações, sem criar relatórios paralelos.
5. **Achados, Encontros de Linhagem e Plano de Ação de Pesquisa**.
6. **Navegação mobile e recuperação das 14 abas originais**, pois Financeiro e áreas posteriores a Propostas não estão acessíveis no mobile.

A implementação técnica de regras, dados, RLS, migrations, testes, refactors e publicação deve migrar prioritariamente para Claude Code/GitHub depois que estes blocos forem validados visualmente. Lovable ficará restrito a alterações cirúrgicas de interface e fluxo.

---

## 2. Evidência levantada

### Fontes consultadas

- `prompts-lovable-clube-ancestral-prioridade.docx`, encontrado no Drive, contém a sequência histórica de 11 prompts: fundação, ciclo de vida, ativação, proposta/contrato/financeiro, pesquisa/evidências, documentos/privacidade, Desk/SLA, qualidade, portal, integrações e governança.
- `retome @Clube Ancestral veja que dentro dos arquiv.docx`, encontrado no Drive, reúne evolução posterior: CRM Discovery/Handoff, case service, Top 30, planejador, jornada percebida, Ficha Piloto, pesquisa/evidências, alertas, Mobile, biblioteca, fontes e Blocos 5A/5B.
- O repositório GitHub localizado nesta consulta não contém commits entre 17 e 20/08/2026 no repositório `tatianatosi/recriacao-do-clube-ancestral`; portanto, ele não é evidência suficiente dos prompts aplicados no Lovable nesta semana. O inventário abaixo distingue **confirmado por devolutivas** de **pendente/documentado sem confirmação de aplicação**.

### Limite de rastreabilidade

Não foi localizado um log exportado do Lovable que liste cada prompt, hora, consumo e resposta. Esta é uma lacuna de governança. A partir deste documento, todo novo prompt deve receber ID, finalidade, teto de créditos, versão, evidência de teste e resultado antes de abrir o seguinte.

---

## 3. Tabela de prompts desta semana

| ID | Frente/prompt identificado | Situação apurada | Evidência de implementação | Decisão |
|---|---|---|---|---|
| P-01 | Persistência e ficha operacional de Casos | **Implementado** | Salvamento corrigido; aviso de alterações não salvas; eixos comercial/formalização; responsável, país/via, riscos, brief e pessoas separadas | Não reabrir; apenas corrigir bugs concretos |
| P-02 | CRM diário, Discovery/Handoff e `/leads` | **Implementado** | Listas controladas, código automático, dois eixos, Discovery, travas cliente/servidor | Congelar escopo; validar uso real |
| P-03 | Painel Hoje `/painel` | **Implementado** | Filas por criticidade, pagamentos, contratos, onboarding, sem responsável, calls e pendências documentais | Preservar; enriquecer somente após o motor genealógico existir |
| P-04 | Produto-pai + trilha + `case_service` | **Parcialmente materializado** | Estrutura e regra descritas; confirmar tela, tabelas e persistência antes de ampliar | Validar e completar em Claude Code quando necessário |
| P-05 | Proposta Canva, escopo, dependentes e gates contratuais | **Implementado, bloqueado corretamente no piloto** | Conferência de páginas 1–7, auditoria sanitizada, gates servidor, painel contratual, dependentes e matriz jurídica; 100 testes declarados | Não redesenhar; executar apenas Corte A de materialização da proposta Ana |
| P-06 | Preço canônico, exceções e despesas de terceiros | **Implementado** | `product_catalog`/exceção aprovada, regra de despesas, bloqueios de execução, painel de preparação | Não criar integrações financeiras agora |
| P-07 | Navegação mobile / recuperação de abas | **Pendente crítico** | Usuária reportou Financeiro e abas posteriores inacessíveis no mobile | Próximo prompt visual prioritário no Lovable |
| P-08 | Ficha Piloto Genealógica, pessoas, relações, árvore e linha do tempo | **Pendente estrutural** | Decisão e especificações extensas, mas sem confirmação de implementação | Prioridade 1 pós-CRM |
| P-09 | Biblioteca de Evidências, fontes, validação e projeções | **Pendente estrutural** | Decisão Bloco 5A/5B e modelo registrados em conversas, sem confirmação de schema/telas | Prioridade 2 pós-CRM |
| P-10 | Pesquisa Genealógica e Evidências, documentos e solicitações | **Pendente estrutural** | Modelagem e prompts preparados; sem prova de entrega funcional | Prioridade 3 pós-CRM |
| P-11 | Relatórios Fase 1 e Fase 2 | **Existem, integração pendente** | Regra é preservar relatórios já existentes, sem duplicá-los | Conectar ao motor, não recriar |
| P-12 | Achados Genealógicos e Encontros de Linhagem | **Pendente** | Modelo detalhado preparado; sem confirmação de implementação | Após ficha/evidências |
| P-13 | Plano de ação de pesquisa, instituições e terceiros | **Pendente** | Modelo/fixture Melani preparado; sem confirmação funcional | Após pesquisa/evidências |
| P-14 | Biblioteca Base, dicionários, glossário e guia de linguagem | **Pendente ou não comprovado** | Política e estrutura definidas; falta confirmação de tela/dados versionados | Implantar como dependência transversal |
| P-15 | Catálogo de fontes e 5B-Pre | **Pendente** | Arquitetura prevista; nenhuma API, scraping ou consulta real autorizada | Implementar apenas governança prévia |
| P-16 | Assistente AI/Gems transversal | **Backlog pós-motor** | Modelo detalhado; não deve anteceder estrutura e fontes canônicas | Não rodar agora no Lovable |
| P-17 | Placego CSV e higiene de dados | **Pendente controlado** | Decisão: Placego somente para contatos; dados fictícios precisam ser isolados | Depois do motor e cockpit validado |
| P-18 | Fusão de navegação/Visão Geral ampliada | **Pendente, dependente do mobile** | Decisão de preservar 14 abas e agregar rotas laterais | Executar após navegação mobile, sem apagar abas |

---

## 4. Sequência primordial

### Regra de execução

- Um prompt por vez.
- Não pedir auditoria, redesenho geral, reconciliação ampla ou criação de novas abas durante um corte.
- Cada prompt deve informar o que foi alterado, migrations, rotas, teste e pendências técnicas.
- Se exigir banco, RLS, migration, regra compartilhada, refactor ou teste automatizado, a correção vai para Claude Code/GitHub; Lovable só faz a camada visual ou fluxo que lhe cabe.
- Não iniciar o prompt seguinte sem registrar o resultado no log desta seção.

| Ordem | Prompt | Ferramenta primária | Teto Lovable | Gate de aceite |
|---:|---|---|---:|---|
| 1 | P-07 Navegação mobile | Lovable | 120 créditos | Financeiro, Formalização, Pesquisa e Biblioteca acessíveis em 320–414px |
| 2 | P-08 Ficha Piloto/Árvore | Lovable visual + Claude Code para schema/RLS | 250 créditos | Pessoas, relações, linhagens e eventos persistem; árvore deriva de relações |
| 3 | P-09 Biblioteca de Evidências | Claude Code; Lovable somente tela | 180 créditos | Fonte → evidência → validação → projeção autorizada, sem exposição ao App |
| 4 | P-10 Pesquisa e solicitações | Claude Code; Lovable somente tela | 180 créditos | Documento/pedido vincula pessoa, fonte, evidência, próxima ação e alerta |
| 5 | P-11 Relatórios F1/F2 | Lovable visual + Claude Code para persistência | 100 créditos | Relatórios existentes aparecem como entregas de fase, sem duplicação |
| 6 | P-12 Achados e Encontros | Lovable visual + Claude Code para dados | 150 créditos | Achado exige fonte/evidência; encontro exige validação e projeção aprovada |
| 7 | P-13 Plano de pesquisa | Claude Code; Lovable somente tela | 120 créditos | Pendência gera ação, prazo, alerta e rascunho, sem envio externo |
| 8 | P-14 Biblioteca Base | Claude Code + Lovable | 150 créditos | Glossário, termos e dicionários versionados e reutilizáveis |
| 9 | P-15 Catálogo de fontes 5B-Pre | Claude Code + Lovable | 100 créditos | Fontes catalogadas sem API, scraping ou consulta externa |
| 10 | P-17 Higiene de dados | Claude Code | 0–50 créditos | Fixture não aparece no cockpit produtivo; origem rastreável |

**Teto planejado para Lovable nos itens acima: 1.350 créditos.** A meta é executar menos: todo bloco que já exista deve ser apenas validado e corrigido, não reconstruído.

---

## 5. Prompts executáveis

### L-01 — Navegação mobile

```text
[ID L-01] CORRIGIR SOMENTE A NAVEGAÇÃO MOBILE DO DESK.

Problema: em mobile, Financeiro e Formalização, Matriz Jurídica, Pesquisa e Evidências, Biblioteca Base e rotas posteriores a Propostas não estão acessíveis.

Escopo:
- Não alterar schema, dados, gates, propostas, contratos, preços, pesquisa ou integrações.
- Não criar abas novas nem remover as 14 abas originais.
- Em larguras 320px, 375px, 390px e 414px, trocar navegação horizontal oculta por menu/drawer ou seletor acessível.
- Garantir acesso a Visão Geral, CRM vivo, Casos 360, Propostas, Go-live, Formalização, Checklist AppCliente, Financeiro, Checklist semanal, Validação Jurídica, Radar Interno, Alertas, Integrações e Biblioteca Mestre.
- Dentro de Caso, transformar subabas em seletor mobile acessível, sem overflow oculto.
- Avisar antes de trocar rota quando existirem alterações não salvas.

Critérios de aceite:
1. Financeiro e Formalização aparecem e abrem em 320px.
2. /matriz-juridica e /casos/:caseId/contrato/preparar são acessíveis em mobile.
3. Nenhuma rota desaparece depois de Propostas.
4. Nenhuma navegação depende de gesto horizontal oculto.
5. Não há alteração funcional ou de dados.

Ao concluir, listar componentes/rotas alterados e como foi testado.
```

### L-02 — Ficha Piloto Genealógica

```text
[ID L-02] IMPLEMENTAR A FICHA PILOTO GENEALÓGICA COMO ORIGEM CANÔNICA DE ÁRVORE, LINHAGENS E LINHA DO TEMPO.

Não iniciar pesquisa externa, não criar documentos externos, não publicar no App Cliente e não gerar comunicação externa.

Arquitetura obrigatória:
Pessoa + Relações estruturadas + Linhagens + Eventos + Evidências = árvore interna e linha do tempo.

Criar/confirmar:
- genealogical_person_profiles para identidade, datas e localidades com status de verificação;
- genealogical_relationships, sem campos fixos Filho 1/2 ou Irmão 1/2;
- lineage_paths para linha paterna, materna, direta, colateral, cidadania, memória/legado, dupla/familiar, alternativa e a confirmar;
- genealogical_events para nascimento, casamento, morte, residência, migração, serviço militar, patrimônio e outros marcos;
- name_variants como entidade própria.

Regras:
- Fato confirmado exige fonte/evidência.
- Relação não confirmada deve permanecer como hipótese/pendente.
- Linha dupla não duplica pessoa nem cria caso novo.
- Árvore e linha do tempo são derivadas de registros persistidos, não de texto livre.
- Para cada campo usar estados: confirmado, provável, hipótese, pendente, não aplicável.

Caso de validação:
- Criar somente estrutura interna para Ana, sem dados inventados e sem alterar sua formalização.

Critérios de aceite:
1. Criar pessoa e vínculo, salvar, recarregar e preservar.
2. A árvore mostra relação a partir de genealogical_relationships.
3. Nome variante não cria segunda pessoa.
4. Uma linha dupla pode vincular duas linhas ao mesmo caso.
5. Nenhum dado é exposto ao App Cliente.

Mostrar migrations, telas, testes e pendências técnicas.
```

### L-03 — Biblioteca de Evidências

```text
[ID L-03] IMPLEMENTAR A BIBLIOTECA DE EVIDÊNCIAS E PROJEÇÕES AUTORIZADAS.

Não consultar fontes externas, não fazer scraping, não usar API, não publicar no App Cliente e não enviar mensagens.

Arquitetura:
Fonte/material → Biblioteca de Evidências → Desk/Pesquisa → Projeção autorizada → App/One-page/PDF aprovado.

Criar/confirmar:
- evidences com pessoa, fonte, tipo, natureza, acesso, estado do fluxo e estado epistemológico;
- evidence_validations;
- pesquisa negativa como evidência válida;
- app_projections para destino app, one_page e pdf_aprovado;
- visibilidade: app, desk_only, crm_only, one_page, pdf_aprovado;
- níveis de confiança: inicial, baixo, médio, alto;
- estados epistemológicos: INFORMACAO_COMPARTILHADA_FAMILIA, DADO_PESQUISA_INICIAL, EM_VALIDACAO_DOCUMENTAL, VALIDADO_POR_DOCUMENTO, PENDENTE_CONFIRMACAO, NAO_APLICAVEL.

Regras:
- Não permitir salto automático de confiança inicial para alto.
- Fonte crua, URL interna, transcrição, hipótese, risco e documento bruto nunca chegam ao App.
- Evidência validada internamente não equivale a parecer jurídico, direito, cidadania ou parentesco definitivo.
- Projeção cliente exige conteúdo sanitizado, aprovação humana, responsável e data.

Critérios de aceite:
1. Evidência interna sem projeção aprovada não aparece no App.
2. Busca negativa permanece registrada e gera próxima ação possível.
3. Alteração de confiança exige responsável e data.
4. Log/auditoria não guarda URL sensível ou conteúdo bruto.
```

### L-04 — Pesquisa, documentos e solicitações

```text
[ID L-04] IMPLEMENTAR PESQUISA GENEALÓGICA E EVIDÊNCIAS COM DOCUMENTOS E SOLICITAÇÕES.

Não iniciar pesquisa externa, não solicitar documentos a instituições, não criar pastas, não gerar despesas e não enviar WhatsApp.

Criar área Pesquisa Genealógica e Evidências com:
- Visão de pesquisa;
- Pessoas e ramos;
- Fontes e consultas;
- Documentos e Solicitações;
- Evidências e validações;
- Hipóteses e lacunas;
- Relatórios de fase;
- Alertas e histórico.

Criar document_requests com colunas visíveis:
1. Geração
2. Nome completo
3. Tipo de documento
4. Arquivo/Instituição
5. Data pedido
6. Status
7. Data recebimento
8. Observação

Regras:
- Nome completo referencia pessoa existente.
- Classificações usam dicionário fechado.
- Recebido cria/vincula evidência em estado Recebida.
- Divergente, não localizado, requer retificação ou aguardando cliente exigem próxima ação, prazo, responsável e alerta interno.
- Ação externa cria somente rascunho em communication_queue, sem envio.
- Documento bruto e link interno não aparecem no App.

Critérios de aceite:
1. Solicitação vinculada a pessoa, fonte e caso persiste após reload.
2. Mudança para Recebido cria evidência vinculada.
3. Mudança para Aguardando cliente cria alerta interno e rascunho, sem envio.
4. Nenhuma ação externa é executada.
```

### L-05 — Relatórios F1/F2 sem duplicação

```text
[ID L-05] CONECTAR OS RELATÓRIOS JÁ EXISTENTES DAS FASES 1 E 2 AO MOTOR DO CASO.

Não criar relatórios paralelos, não gerar PDF externo, não publicar e não enviar comunicação.

Criar/confirmar case_reports com:
- REPORT_F1_DIAGNOSTICO = Relatório de Diagnóstico e Direcionamento;
- REPORT_F2_PESQUISA = Relatório de Pesquisa Genealógica e Evidências;
- status: a_preparar, em_elaboracao, em_revisao, aprovado_internamente, entregue, arquivado;
- versão, responsável, revisor, data de aprovação, data de entrega, link interno, resumo aprovado ao cliente;
- evidências vinculadas e pendências abertas.

Regras:
- Relatório é entrega robusta de fase; não substitui evidências nem micro-entregas.
- Micro-entrega não pode criar relatório duplicado.
- Conteúdo para cliente exige projeção aprovada/sanitizada.
- Para Ana: F1 somente a preparar/em elaboração conforme dados reais; F2 não inicia automaticamente.

Critérios de aceite:
1. F1 e F2 aparecem como cards distintos na jornada.
2. Evidências podem ser vinculadas ao relatório sem duplicação.
3. Um relatório não publicado não aparece no App.
```

### L-06 — Achados e Encontros de Linhagem

```text
[ID L-06] IMPLEMENTAR ACHADOS GENEALÓGICOS E ENCONTROS DE LINHAGEM.

Não publicar no App, não enviar mensagens e não afirmar relações sem evidência/revisão humana.

Fluxo obrigatório:
Fonte → Evidência → Validação interna → Achado → Árvore/Linha do tempo → Micro-entrega ou relatório aprovado.

Criar genealogical_findings e lineage_encounters.

Achado deve conter pessoa, geração, tipo, fatos confirmados, dados a confirmar, fontes/evidências vinculadas, relevância, estado de validação, impacto na árvore, linha do tempo e planejamento.

Encontro de Linhagem deve conter duas linhagens quando aplicável, tipo de encontro, contexto histórico, territórios migratórios, memória familiar, práticas culturais documentadas, encontros no Brasil, disclaimer obrigatório, conteúdo sanitizado e aprovação.

Proibições:
- Não atribuir personalidade, destino, trauma, comportamento ou caráter à ancestralidade.
- Não afirmar conexão por sobrenome ou localidade sem evidência.
- Não publicar conteúdo sem aprovação humana.

Critérios de aceite:
1. Achado exige pelo menos uma fonte ou evidência.
2. Resultado negativo de pesquisa pode ser registrado com próxima fonte/ação.
3. Encontro sem disclaimer ou aprovação não pode gerar projeção cliente.
4. Atualização de árvore exige revisão interna.
```

### L-07 — Plano de ação de pesquisa

```text
[ID L-07] IMPLEMENTAR PLANO DE AÇÃO DE PESQUISA, INSTITUIÇÕES E PREVISÃO DE TERCEIROS.

Não contatar instituições, não enviar e-mail/WhatsApp, não criar cobrança, não criar despesa, não criar evento externo de calendário.

Criar research_action_plan_items, institutions e expense_estimates.

Regras:
- Toda pendência documental, resultado negativo ou rechecagem vencida pode gerar ação com prioridade, prazo, responsável, canal sugerido e rascunho interno.
- Prioridade crítica cria alerta imediato para Tatiana Melani Tosi.
- Aguardando resposta exige next_check_at.
- Comunicação externa só vira rascunho e exige aprovação humana.
- Estimativa de terceiro é previsão; não é custo, receita, reembolso ou cobrança do Clube.
- Instituições são reutilizáveis e possuem data de última verificação; não duplicar contato em tarefas.

Critérios de aceite:
1. Pendência gera plano de ação persistente.
2. Ação crítica aparece no Painel Hoje.
3. Rascunho externo não envia nada.
4. Previsão de terceiros não cria lançamento financeiro.
```

### L-08 — Biblioteca Base e linguagem

```text
[ID L-08] IMPLEMENTAR BIBLIOTECA BASE, DICIONÁRIOS, GLOSSÁRIO E GUIA DE LINGUAGEM.

Não redesenhar nem alterar copy aprovada do App Cliente. Não criar comunicação externa, contrato, cobrança, integração ou pesquisa externa.

Criar Biblioteca Base com:
- Glossário operacional;
- Dicionários de listas controladas;
- Guia de linguagem e termos;
- Trilhas por país/via;
- Marcos jurídicos e fontes oficiais;
- Catálogo de fontes genealógicas;
- Tipos documentais e evidências;
- Produtos-pai e jornadas;
- Modelos F1/F2;
- Templates de comunicação;
- Privacidade, sanitização e versões.

Cada item: code, nome, descrição, domínio, versão, status, vigência, responsável, destino permitido e observação de governança.

Cadastrar termos proibidos para conteúdo público/cliente: cura ancestral, cura da linhagem, terapia genealógica, diagnóstico emocional, destino familiar, karma ancestral, garantia de cidadania/documento/linhagem, prazo garantido e elegibilidade confirmada sem revisão.

Criar substituições aprovadas e validação de linguagem para rascunhos, sem alteração automática de textos aprovados.

Critérios de aceite:
1. Dicionário é reutilizado por campos, sem texto livre classificatório.
2. Rascunho com termo proibido fica bloqueado para publicação/envio.
3. Mesmo objeto pode ser referenciado em caso, pesquisa, relatório e entrega sem duplicação.
```

### L-09 — Catálogo de fontes 5B-Pre

```text
[ID L-09] IMPLEMENTAR BLOCO 5B-PRE: CATÁLOGO E GOVERNANÇA DE FONTES E INTEGRAÇÕES GENEALÓGICAS.

Não fazer scraping, API, consulta externa, login externo, coleta, credenciais, comunicação ou publicação.

Criar módulo interno Fontes e Integrações Genealógicas com:
- genealogical_sources_catalog;
- source_evaluation_matrix;
- sources_activation_backlog;
- source_access_logs apenas como estrutura futura.

Modos de uso permitidos:
manual, metadados_linkout, api_validada, parceria, restrito, nao_validado.

Estágios de maturidade:
CATALOGADA, DOCUMENTADA, TERMOS_A_CONFIRMAR, ELEGIVEL_PARA_PILOTO, PILOTO_INTERNO, HOMOLOGADA_MANUAL, HOMOLOGADA_API, RESTRITA, DESCONTINUADA.

Regras:
- Fonte catalogada não é integração.
- Fonte manual não equivale a API homologada.
- Termos a confirmar não pode ir para piloto.
- Scraping é proibido por padrão e só um marcador interno de vedação/risco.
- Fonte externa nunca aparece crua no App Cliente.

Critérios de aceite:
1. Fonte pode ser vinculada à pesquisa sem ser consultada.
2. Nenhuma rota oferece botão de consulta externa.
3. Fonte restrita não aparece em recomendação operacional.
4. Logs futuros não armazenam tokens nem payload bruto.
```

### L-10 — Higiene e fixtures

```text
[ID L-10] IMPLEMENTAR HIGIENE DE DADOS E ISOLAMENTO DE FIXTURES.

Não excluir dados reais, não migrar Placego e não alterar fontes legadas nesta entrega.

Criar/confirmar data_origin:
production_real, migration_legacy, development_fixture, sandbox, unknown_needs_review.

Regras:
- development_fixture e sandbox não entram em cockpit produtivo, App Cliente, métricas operacionais, alertas ou filas reais.
- unknown_needs_review entra em fila de saneamento.
- Toda ação de arquivamento/exclusão futura exige lista de IDs, backup e confirmação específica.
- Planilhas e Placego continuam como legado/leitura até importação aprovada.

Critérios de aceite:
1. Fixture Melani fica isolada da operação produtiva.
2. Painel distingue sem dado de dado inválido/fictício.
3. Nenhum dado real é apagado.
```

---

## 6. Caso Ana e proposta Canva

### Estado confirmado

- Caso: `CA-CID-AT-FAM-2026-001`.
- Proposta v1 marcada como Canva e aprovada, porém sem referência interna de deck, sem páginas 1–7 registradas e sem conteúdo extraído por página.
- O estado bloqueado da formalização é correto e deve permanecer até que os dados sejam materializados internamente.
- Não criar ou alterar proposta no Canva, contrato, cobrança, assinatura, pasta ou comunicação como consequência deste registro.

### Corte A já realizado

- `deck_referencia_interna = DECK-CANVA-CA-CID-AT-FAM-2026-001-v1`.
- Páginas 1–7 registradas com conteúdo estruturado e status individual de extração.
- Conferência resultou **BLOQUEADO**: sete grupos de informação extraídos e dez campos não localizados; validade comercial vencida em 19/08/2026.
- Contrato, assinatura e financeiro seguem travados.

### Próximo passo interno

Executar saneamento de proposta somente pelos dados canônicos e autorizados: `product_catalog` homologado → condição → `case_service` → exceção aprovada → Blueprint → Canva. Não preencher lacunas por inferência e não substituir a proposta por texto livre.

---

## 7. Registro de execução

| Data | ID | Resultado | Créditos | Evidência | Próxima decisão |
|---|---|---|---:|---|---|
| 20/08/2026 | P-01 a P-06 | Implementações declaradas concluídas | A registrar | Devolutivas e 100 testes declarados | Validar uso real e mobile |
| 20/08/2026 | L-01 | Pendente |  |  |  |
| 20/08/2026 | L-02 | Pendente |  |  |  |
| 20/08/2026 | L-03 | Pendente |  |  |  |
| 20/08/2026 | L-04 | Pendente |  |  |  |
| 20/08/2026 | L-05 | Pendente |  |  |  |
| 20/08/2026 | L-06 | Pendente |  |  |  |
| 20/08/2026 | L-07 | Pendente |  |  |  |
| 20/08/2026 | L-08 | Pendente |  |  |  |
| 20/08/2026 | L-09 | Pendente |  |  |  |
| 20/08/2026 | L-10 | Pendente |  |  |  |

---

## 8. Decisões normativas vigentes

- As 14 abas originais do Desk permanecem a arquitetura de referência; módulos incorporados residem nelas ou em rotas laterais sem substituí-las.
- A cadeia de preço é: catálogo homologado → condição → `case_service` → exceção aprovada → Blueprint → Canva.
- A cadeia do caso segue Discovery + Brief até Caso ativo, sem saltar elos.
- Canva apresenta proposta; não é fonte canônica de preço nem substitui contrato.
- Relatórios Fase 1 e Fase 2 existem como entregas de fase; não devem ser recriados como relatórios paralelos.
- Ficha Piloto Genealógica é a origem da árvore, linhagens e linha do tempo.
- Pesquisa externa, integração, scraping, criação de documentos, assinaturas, cobranças, pastas e mensagens dependem de gates e autorização específica.
- O App Cliente recebe somente projeções sanitizadas e aprovadas.
- Todo novo prompt Lovable deve ser cirúrgico, ter ID, teto de crédito e gate de aceite.
