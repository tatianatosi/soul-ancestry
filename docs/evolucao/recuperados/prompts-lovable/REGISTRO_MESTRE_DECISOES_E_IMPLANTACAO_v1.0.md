# Registro Mestre de Decisões e Implantação

**Versão:** v1.0  
**Data de consolidação:** 21 de agosto de 2026  
**Status:** Documento de referência interna — implantação em validação  
**Projeto:** Clube Ancestral — CRM/Desk Intelligence  

---

## 1. Finalidade, escopo e fontes de verdade

Este registro consolida as decisões operacionais, controles, módulos implantados, pendências de validação e limites de escopo do CRM/Desk Intelligence do Clube Ancestral.

### 1.1 Regras de não regressão

- Nenhum aceite verbal, confirmação formal isolada ou mudança de etapa libera automaticamente contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente.
- Nenhuma operação externa é executada por telas internas sem gatilho, autorização e aprovação humana aplicáveis.
- Conteúdo interno de pesquisa, hipótese, fonte, evidência, risco, status técnico, preço, contrato, dados pessoais sensíveis e histórico decisório não é projetado ao App Cliente.
- Exclusão física de registros de governança, migração e operação deve permanecer bloqueada quando houver regra de retenção e auditoria.
- A navegação do Desk não deve ganhar abas globais duplicadas; conteúdos contextuais pertencem às respectivas áreas, casos e subrotas.

### 1.2 Fontes e papéis

| Fonte | Papel definido |
|---|---|
| Planilha Mestre | Legado somente leitura e referência canônica comercial, quando carregada e homologada |
| CRM OPS e demais planilhas | Legado somente leitura |
| Placego | Origem legada sujeita a importação controlada |
| Asaas | Fonte transacional; sem criação ou alteração automática |
| Drive | Fonte documental; sem criação automática de pastas ou documentos |
| Desk Intelligence | Camada operacional interna, auditável e restrita por organização |
| App Cliente | Projeção sanitizada, autorizada e publicada |

---

## 2. Arquitetura e navegação

O menu do Desk foi reduzido às seguintes sete áreas principais:

1. Visão geral
2. Comercial
3. Casos e núcleos
4. Pesquisa genealógica
5. Operação
6. Contratos e financeiro
7. Governança e biblioteca

### 2.1 Regras de navegação

- Itens secundários aparecem somente como subitens da área aberta.
- `/nucleos` é subitem de **Casos e núcleos**, não uma aba global adicional.
- Módulos administrativos são subitens de **Governança e biblioteca**.
- Pesquisa Genealógica e Evidências é subnavegação da ficha do caso, não uma aba global do Desk.

### 2.2 Caminhos canônicos

| Caminho | Localização | Regra |
|---|---|---|
| CRM Vivo → Propostas | `/propostas` e contexto comercial do caso | Proposta homologada; aceite verbal não libera contrato nem App Cliente |
| Casos 360 → Formalização | `/casos/$id/contrato/preparar` | Centralização de parâmetros e gates; sem duplicação manual |
| Casos 360 → Go-live | Fechamento e `/onboarding/$id` | Nove gates; nenhuma ativação automática |
| App Cliente → Jornada | Tela sempre disponível | Exibe estado seguro, como “em preparação” |
| App Cliente → Legado | Tela sempre disponível | Apenas conteúdo autorizado, sanitizado e publicado |

---

## 3. Comercial, Discovery e conversão

### 3.1 Leads e oportunidades

- Cadastro manual de leads deve estar disponível em Comercial → Leads.
- O ID do lead segue o padrão `CA-LEAD-AAAA-SEQ`.
- O registro inicial exige nome, pelo menos um contato, origem, responsável, próxima ação e prazo.
- A deduplicação deve considerar e-mail, telefone e nome como sinal complementar.
- Dropdowns são fechados; texto livre é limitado a resumo, narrativa, observações e links internos.
- Oportunidades exigem responsável, próxima ação e prazo.
- Interações comerciais são imutáveis e auditáveis.

### 3.2 Aceite em quatro momentos

A regra pura de conversão segue esta sequência:

```text
Aceite verbal
→ Confirmação formal
→ Contrato e cobrança
→ Onboarding
```

| Momento | Efeito permitido | Efeito bloqueado |
|---|---|---|
| Aceite verbal | Registro da intenção e próxima ação | Contrato, cobrança, assinatura, onboarding e App Cliente |
| Confirmação formal | Preparação da formalização | Ativação operacional e onboarding |
| Contrato e cobrança | Formalização e confirmação financeira conforme gates | Ativação sem checklist e demais gates |
| Onboarding | Execução da jornada após todas as condições | Pesquisa externa e publicação sem regras próprias |

### 3.3 Conversão, atribuição e marketing

Entidades internas previstas ou implantadas:

- `lead_sources`
- `marketing_campaigns`
- `marketing_investments`
- `conversion_events`, imutáveis
- `attribution_records`

A tela `/conversao` concentra funil, estados de aceite, eventos rastreáveis e saúde comercial. Indicadores de mídia, como CAC, CPL e ROI, não pertencem à tela de Conversão quando estiverem fora do corte vertical aprovado.

---

## 4. Catálogo e homologação comercial

O catálogo canônico `product_catalog` mantém governança de produto, homologação, vigência, validação, responsável, condições comerciais, escopo aprovado e vínculo Asaas, quando aplicável.

### 4.1 Critérios de oferta

Um SKU é ofertável somente quando houver:

- Produto ativo.
- Homologação explícita e responsável identificado.
- Preço e condição comercial vigentes na fonte canônica.
- Escopo aprovado.
- Link Asaas validado, ou marcação de não aplicável.
- Versão de vigência e data de última validação.
- Ausência de divergência entre preço, escopo e link.

### 4.2 Bloqueios

- SKU inativo, arquivado, histórico ou descontinuado não aparece em seletor de oferta nova.
- SKU em revisão ou bloqueado pode ser visível internamente, mas não gera proposta, contrato, cobrança ou link.
- Divergência de preço, escopo ou link reduz a elegibilidade para bloqueio de validação comercial.
- Pacote familiar do piloto permanece bloqueado enquanto não houver SKU canônico homologado.

---

## 5. Casos, núcleos e dossiês

### 5.1 Casos 360

A ficha de caso concentra formalização, gates, onboarding, jornada, interações imutáveis, alertas e microentregas.

### 5.2 Núcleos e dossiês

A rota `/nucleos` é a fonte operacional para:

- Núcleos familiares.
- Requerentes vinculados por papel.
- Dossiê-mãe, ambiente, link interno, nível de acesso e responsável.
- Situação de dossiê: não iniciado, em preparação, ativo ou arquivado.

O dossiê ativo exige identificação/nome do dossiê-mãe, ambiente autorizado, link interno, nível de acesso e responsável nominal.

### 5.3 Regra de vínculo

Um caso deve referenciar um núcleo familiar único e um dossiê-mãe único. A composição familiar e os metadados do dossiê não devem ser replicados manualmente em múltiplas fichas.

---

## 6. Pesquisa genealógica e evidências

### 6.1 Cadeia normativa

```text
Bases Genealógicas / Dicionários / Trilhas
→ Pesquisa Genealógica e Evidências
→ Ficha, fontes, evidências e validação
→ Achados internos
→ Relatórios F1/F2 ou microentregas sanitizadas
→ App Cliente autorizado e publicado
```

Nenhum elo pode ser pulado.

### 6.2 Seções contextuais do caso

1. Visão de pesquisa.
2. Ficha genealógica.
3. Pessoas, famílias e ramos.
4. Fontes e consultas.
5. Evidências e documentos.
6. Validação e pendências.
7. Achados e microentregas.
8. Relatórios F1/F2.
9. Alertas e histórico.

### 6.3 Controles

- Upload não cria automaticamente pessoas, relações ou eventos.
- A tela não dispara consulta externa, OCR, IA, mensagens, contratos ou publicação.
- Hipóteses, fontes e status técnicos permanecem internos.
- A árvore do cliente usa a porta única `projetarArvoreCliente`.
- Somente pessoas com projeção autorizada ou publicada podem ser exibidas ao cliente.
- A projeção do cliente limita-se a nome e datas aprovadas e rejeita hipótese, evidência, fonte, risco, status técnico e preço.

---

## 7. Formalização, onboarding e cadência

### 7.1 Gates e ativação

- A ativação permanece bloqueada enquanto houver gate pendente.
- Planos operacionais exigem responsável, próxima ação e prazo.
- Não há ativação automática.
- Publicação de entrega segue: salvar → revisão/aprovação humana → publicar.

### 7.2 Jornada padrão

- Seis fases, incluindo confirmação formal.
- Checklist reutilizável de 12 itens para onboarding padrão.
- Primeira microentrega em D7.
- Alerta contextualizado após até 14 dias sem atualização, exceto durante espera externa comunicada.

### 7.3 Painel Hoje

As filas operacionais incluem, conforme configuração vigente:

- Aceites verbais sem confirmação formal.
- Formalização e contratos pendentes.
- Pagamentos iniciais aguardados.
- Onboardings bloqueados.
- Falta de dossiê-mãe, núcleo ou requerentes.
- Cadência de 10+ dias e alerta crítico de 14+ dias.
- Documentos aguardados.
- Microentregas a aprovar ou publicar.
- Ações vencidas e ações de hoje.
- Erros ou duplicidades de importação Placego.
- Casos travados por SKU não homologado.

---

## 8. Governança e Biblioteca Mestre

A área **Governança e biblioteca** deve preservar subitens separados:

1. Biblioteca Mestre.
2. Bases Genealógicas.
3. Matrizes conceituais.
4. Indicadores e métricas.
5. Log de decisões.
6. Corte vertical e fontes.

### 8.1 Biblioteca Mestre

Status atual: **estrutura parcialmente implementada; base curada e validação funcional pendentes**.

A Biblioteca Mestre deve ser um repositório interno de normas, modelos, checklists, dicionários, referências e ativos homologados, com:

- Taxonomia de subáreas.
- Busca e filtros por status, responsável, país/escopo e vigência.
- Registro de fonte, versão e homologação.
- Arquivamento lógico com motivo.
- Nenhuma projeção ao App Cliente.

### 8.2 Bases Genealógicas

As Bases Genealógicas devem manter catálogo interno, avaliação, estágio de maturidade, backlog de ativação e logs de acesso. Estar catalogada não torna uma fonte automaticamente ativa nem inicia pesquisa externa.

### 8.3 Matrizes, indicadores e decisões

O log de decisões registra decisões, matrizes de origem, indicadores impactados e telas/rotinas consumidoras. Ele não substitui a Biblioteca Mestre nem as Bases Genealógicas.

---

## 9. Migração e dados legados

### 9.1 Camada de migração

Entidades de migração:

- `import_batches`
- `legacy_record_links`
- `migration_exceptions`

Regras:

- RLS por organização.
- Sem exclusão física.
- Mapeamento, payload, vínculos legados e arquivamento lógico.
- Preview, mapeamento, deduplicação e relatório final em `/importacoes`.

### 9.2 Placego

- Importação CSV com mapeamento explícito de 17 campos em `CAMPOS_PLACEGO`, versão `placego-v1`.
- Preservação de `legacy_record_id`.
- Cada rodada registrada em `import_batches`.
- Arquitetura pronta para API autenticada, sem integração externa executada.

---

## 10. Registros piloto

### 10.1 João

| Item | Estado |
|---|---|
| Posição na escada | Confirmação formal |
| Estado | Aceite verbal — confirmação formal pendente |
| Próxima ação | Solicitar confirmação escrita |
| Contrato e cobrança | Bloqueados |
| Onboarding e ativação | Bloqueados |

### 10.2 Ana Luiza

| Item | Estado |
|---|---|
| ID canônico | `CA-CID-AT-FAM-2026-001` |
| Alias histórico | `CA-AUT-ANALUIZA-FAM-2026-001` |
| Estado | `formalizacao_em_preparacao` |
| Estado operacional | NO_GO |
| Aceite formal | 14/08/2026 |
| País | Áustria |
| Referência jurídica interna | §58c StbG |

Bloqueios relevantes incluem definição humana do ID canônico, contratante, contratada, contrato, Anexo I/OS, revisão jurídica, assinatura, reconciliação de SKU/preço/escopo/parcelamento, Asaas bloqueado, dossiê pré-onboarding, nome completo da Alice e representação legal do Felipe.

A proposta de R$ 9.600 para três participantes permanece como evidência interna e não autoriza cobrança, contrato ou publicação.

---

## 11. Operações externas proibidas neste corte

Sem comando humano específico e confirmação aplicável, este corte não deve:

- Criar ou alterar cobranças, produtos, links, assinaturas ou clientes no Asaas.
- Criar ou enviar contratos.
- Criar pastas, arquivos ou documentos no Drive.
- Enviar mensagens, e-mails ou comunicações externas.
- Fazer consultas externas, solicitar certidões ou contatar instituições.
- Executar OCR, IA externa ou pesquisa nominal externa.
- Publicar conteúdo no App Cliente sem validação, sanitização e autorização.

---

## 12. Matriz de implantação

| Frente | Situação | Próxima verificação |
|---|---|---|
| Navegação de sete áreas | Em validação de interface | Conferir preview e ausência de abas/duplicidades legadas |
| Leads manuais e disciplina comercial | Implementado; validar UI | Confirmar botão Novo lead, deduplicação e campos obrigatórios |
| Conversão em quatro momentos | Implementado | Validar estados por lead e bloqueios entre degraus |
| Catálogo e homologação de SKU | Implementado em leitura/bloqueio | Reconciliar SKU e pacote familiar da Ana |
| Casos, núcleos e dossiês | Implementado; validar vínculos | Confirmar núcleo único e dossiê-mãe único para Ana |
| Pesquisa e evidências | Implementado; validar UI | Conferir cadeia, nove seções e isolamento do App Cliente |
| Onboarding e cadência | Implementado; validar gates | Conferir checklist, D7, D10/D14 e publicação controlada |
| Migração Placego | Implementado internamente | Testar preview, mapeamento, deduplicação e exceções |
| Biblioteca Mestre | Parcial | Definir base curada e executar carga/validação controlada |
| Bases Genealógicas | Implementado; validar acesso | Conferir catálogo, filtros, RLS e ausência de ativação automática |

---

## 13. Backlog priorizado de prompts Lovable

### P0 — Validação antes de novos módulos

**CA-LOVABLE-VALIDACAO-UI-E-NAVEGACAO-v1.0**

Objetivo: validar a interface de produção/preview contra a navegação de sete áreas, subitens, rotas e estados exibidos, sem criar entidades nem executar ação externa.

### P1 — CRM Discovery, handoff e cockpit diário

**CA-LOVABLE-CRM-DISCOVERY-HANDOFF-COCKPIT-v1.0**

Objetivo: concluir e comprovar o cockpit operacional comercial.

Escopo:

- Lista única priorizada por próxima ação e prazo, nunca por data de criação.
- Cadastro manual de leads com ID automático, deduplicação e validações mínimas.
- Fluxo Discovery → oportunidade → handoff com responsável, próxima ação, prazo e interações imutáveis.
- Evidência visual dos bloqueios entre aceite verbal, confirmação formal, formalização e onboarding.
- Estados vazios, filtros, erros, RLS e testes de regressão.

Restrições:

- Não criar cobrança, contrato, pasta, mensagem, consulta externa ou publicação no App Cliente.

### P2 — Base curada da Biblioteca Mestre

**CA-LOVABLE-BIBLIOTECA-MESTRE-CARGA-E-VALIDACAO-v1.0**

Pré-condição: taxonomia e inventário curado aprovados fora do Lovable.

Objetivo: carregar e validar itens internos aprovados, sem reconstruir a arquitetura existente.

Escopo:

- Inserção/carga controlada de itens aprovados.
- Metadados: tipo, país/escopo, status, versão, vigência, responsável, fonte e observação de uso.
- Busca, filtros, arquivamento lógico, RLS e testes.
- Confirmação de que nada é projetado ao App Cliente.

---

## 14. Controle de versão

| Versão | Data | Alteração |
|---|---|---|
| v1.0 | 21/08/2026 | Primeira consolidação de decisões, implantação, limites e backlog |
