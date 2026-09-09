# Adendo — Ficha Piloto, CRM e Dados para App Cliente
## Clube Ancestral

**Data:** 11/08/2026 · **Natureza:** modelagem de dados e recomendação. Não alterar sistemas externos. Não copiar a ficha piloto inteira para o CRM. Não expor automaticamente no App dados não validados.

**Ficha piloto de referência:** [clube_ancestral_ficha_caso_real_piloto_Giovanna Veiga Prade](https://docs.google.com/spreadsheets/d/12IvNJK_CIvXpi5ZyUJRE7AuKkAfFLhAD73r9WVRnnts/edit) — editada hoje (10/08/2026).

**Artefatos de apoio encontrados:**
- Notas de Discovery — Giovanna Prade ([Google Docs](https://docs.google.com/document/d/1_tx9rcnxSkHo5h1KqhVbp4v2IPYx4queG832SCtruik/edit))
- Anotações do Gemini — Discovery Giovanna ([Google Docs](https://docs.google.com/document/d/1O8cpR-eexoDfJQj-0EKdLUsv2LGYCZtPX57ufdQ4gf8/edit))
- 9+ versões de proposta Giovanna no Drive e Dropbox (v25 a v29 + final + carrossel + WhatsApp)

---

## A. Matriz Ficha Piloto → CRM → Desk → App → Biblioteca de Evidências

| Campo da ficha piloto | Entidade de destino | CRM / Desk / App / Biblioteca | Campo técnico | Tipo | Fonte de origem | Nível de confiança | Validação | Sensível? | Consentimento? | Visibilidade | Relatório? | App? | Validação humana? | Regra de atualização | Responsável |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Nome do cliente | CRM (Contato) + App | CRM / App | app_display_name | Texto | CRM (cadastro) | Alto | Sim (identidade) | Sim | Sim (uso de dados) | Workspace (nome confirmado) | Sim | Sim (nome aprovado) | Sim — confirmar identidade | Atualizar só após conferência | Tatiana |
| ID do caso | CRM (Caso) + Desk | CRM / Desk | case_id | ID | CRM (após aceite) | Alto | Sim | Não | Não | Interno | Sim | Não | Sim — só após aceite | Gerado automaticamente após aceite | Sistema |
| País/contexto | CRM (Lead) + App | CRM / App | country_context | Dropdown | CRM (discovery) | Alto | Sim | Não | Não | Portal + Workspace | Sim | Sim (escopo) | Não | Atualizar no discovery | Tatiana |
| Linha familiar | Desk/Pesquisa + App | Desk / App | family_line_summary | Texto | Desk (pesquisa) | Médio | Sim | Não | Não | Workspace (resumo validado) | Sim | Sim (resumo validado) | Sim — só exibir se validado | Atualizar após validação documental | Pesquisadora |
| Objetivo da pesquisa | CRM (Oportunidade) + App | CRM / App | research_objective | Dropdown | CRM (discovery) | Alto | Sim | Não | Não | Portal + Workspace | Sim | Sim | Não | Atualizar no discovery | Tatiana |
| Estágio da jornada | Desk (Go-live) + App | Desk / App | journey_stage | Dropdown | Desk (Go-live) | Alto | Sim | Não | Não | Workspace | Sim | Sim | Sim — só após registro no Go-live | Atualizar no Go-live | Tatiana |
| Entrega atual | Desk (Go-live) + App | Desk / App | current_delivery_title + current_delivery_status | Texto + Dropdown | Desk (Go-live) | Alto | Sim | Não | Não | Workspace | Sim | Sim (só liberada) | Sim — só exibir se liberada no Go-live | Atualizar no Go-live | Tatiana |
| Próximo passo (cliente) | Desk (Go-live) + App | Desk / App | next_step_client_facing | Texto | Desk (Go-live) | Alto | Sim | Não | Não | Portal + Workspace | Sim | Sim | Sim — deve espelhar Casos 360 | Atualizar no Go-live | Tatiana |
| Status de documentos | Desk (Go-live) + App | Desk / App | document_request_status | Dropdown | Desk (Go-live) | Alto | Sim | Sim (documentos) | Sim (recebimento) | Workspace (pendências) | Sim | Sim (pendências) | Não | Atualizar no Go-live | Tatiana |
| Consentimento de dados | CRM (Contato) | CRM | data_sharing_consent | Dropdown | CRM (cadastro) | Alto | Sim | Sim | Sim | Interno | Não | Não | Sim — LGPD | Atualizar no cadastro + a cada renovação | Tatiana |
| Nível de acesso ao App | CRM (Caso) + Desk | CRM / Desk | app_visibility_level | Dropdown | CRM/Desk (após case_id) | Alto | Sim | Não | Não | Interno | Não | Não | Sim — definido por regra de acesso | Atualizar conforme estágio | Tatiana |
| Identidade verificada | CRM (Contato) | CRM | identity_verified | Dropdown (Sim/Não) | CRM | Alto | Sim | Sim | Sim | Interno | Não | Não | Sim — conferência humana | Atualizar após conferência | Tatiana |
| Data da última atualização cliente-facing | Desk (Go-live) | Desk | last_client_facing_update_at | DateTime | Desk | Alto | Sim | Não | Não | Interno | Sim | Não | Não | Atualizar a cada mudança no App | Tatiana |
| Árvore genealógica / pessoas | Desk/Pesquisa + Biblioteca | Desk / Biblioteca | (interna do Desk) | Estrutura | Desk (pesquisa) | Médio | Sim | Não | Não | Interno (nunca App cru) | Sim | Só árvore aprovada (resumo) | Sim — só exibir dados validados | Atualizar na pesquisa | Pesquisadora |
| Gerações | Desk/Pesquisa | Desk | (interna do Desk) | Numérico | Desk (pesquisa) | Médio | Sim | Não | Não | Interno | Sim | Só resumo (ex: "4 gerações") | Sim — só exibir se validado | Atualizar na pesquisa | Pesquisadora |
| Eventos civis (nascimento, casamento, óbito) | Desk/Pesquisa + Biblioteca | Desk / Biblioteca | (interna do Desk) | Estrutura | Desk (pesquisa) | Médio | Sim | Sim (dados pessoais) | Sim | Interno | Sim | Não | Sim — validar documento | Atualizar na pesquisa | Pesquisadora |
| Documentos (certidões, registros) | Desk/Pesquisa + Biblioteca | Desk / Biblioteca | (interna do Desk) | Arquivo | Desk (pesquisa) | Médio | Sim | Sim | Sim (recebimento) | Interno (Workspace: só status, não conteúdo) | Sim | Só status (solicitado/recebido/pendente) | Sim — validar autenticidade | Atualizar na pesquisa | Pesquisadora |
| Fontes de pesquisa | Biblioteca de Evidências | Biblioteca | source_reference | Texto | Pesquisadora | Médio | Sim | Não | Não | Interno (nunca App) | Sim | Nunca | Sim — marcar como "pendente de validação documental" | Atualizar na pesquisa | Pesquisadora |
| Referências externas (FamilySearch) | Biblioteca de Evidências | Biblioteca | external_reference | Texto | Pesquisadora | Médio | Sim | Não | Não | Interno (nunca App) | Sim | Nunca | Sim — "referência de pesquisa — pendente de validação documental" | Atualizar na pesquisa | Pesquisadora |
| Variantes de nome | Desk/Pesquisa + Biblioteca | Desk / Biblioteca | name_variant | Texto | Pesquisadora | Baixo | Sim | Sim | Não | Interno (nunca App) | Sim | Nunca | Sim — não criam pessoa duplicada | Atualizar na pesquisa | Pesquisadora |
| Hipótese de rota | CRM (Oportunidade) | CRM | hipotese_rota | Dropdown | CRM (discovery) | Baixo | Sim | Não | Não | Interno (nunca App) | Sim | Nunca | Sim — sempre PENDENTE DE VALIDAÇÃO HUMANA | Atualizar no discovery + revisão | Tatiana |
| Grau de confiança da pesquisa | Desk/Pesquisa | Desk | research_confidence_level | Dropdown | Pesquisadora | Médio | Sim | Não | Não | Interno | Sim | Nunca | Não | Atualizar na pesquisa | Pesquisadora |
| Pendências de pesquisa | Desk/Pesquisa | Desk | research_pending_items | Texto | Pesquisadora | Médio | Sim | Não | Não | Interno | Sim | Nunca | Não | Atualizar na pesquisa | Pesquisadora |
| Responsável pela pesquisa | Desk/Pesquisa | Desk | research_responsible | Dropdown | Desk | Alto | Sim | Não | Não | Interno | Sim | Nunca | Não | Atualizar no caso | Tatiana |
| Próxima ação de pesquisa | Desk/Pesquisa | Desk | next_research_action | Texto | Pesquisadora | Médio | Sim | Não | Não | Interno | Sim | Nunca | Não | Atualizar na pesquisa | Pesquisadora |
| Endereço do cliente | CRM (Contato) | CRM | address | Texto | CRM (cadastro) | Alto | Sim | Sim | Sim | Interno (nunca App) | Não | Nunca | Não | Atualizar no cadastro | Tatiana |
| Documento pessoal (CPF, RG, passaporte) | CRM (Contato) | CRM | personal_document | Texto | CRM (cadastro) | Alto | Sim | Sim | Sim | Interno (nunca App) | Não | Nunca | Não | Atualizar no cadastro | Tatiana |
| Gravação/transcrição de call | Painel de Calls | Painel | recording_link | Texto | Painel | Alto | Sim | Sim | Sim (gravação) | Interno (nunca App) | Não | Nunca | Não | Atualizar no pós-call | Tatiana |
| Objeções comerciais | CRM (Histórico) | CRM | objections | Texto | CRM (pós-call) | Médio | Sim | Sim | Não | Interno (nunca App) | Não | Nunca | Não | Atualizar no pós-call | Tatiana |
| Preço cru de catálogo | Mestre | Mestre | (SKU price) | Decimal | Mestre | Alto | Sim | Não | Não | Interno (nunca App) | Não | Nunca | Sim — só da Mestre | Atualizar na Mestre | Tatiana |
| SKU técnico | Mestre | Mestre | sku_code | ID | Mestre | Alto | Sim | Não | Não | Interno (nunca App) | Não | Nunca | Não | Atualizar na Mestre | Tatiana |

---

## B. Bloco "Perfil do Caso e Dados para App Cliente"

Este bloco vive no CRM (entidade Caso) e é a única fonte de dados que o App Cliente pode consumir. Cada campo só é populado após a condição indicada.

| Campo técnico | Tipo | Quando popular | Fonte | Regra |
|---|---|---|---|---|
| app_access_status | Dropdown (Liberado/Bloqueado/Pendente) | Após case_id + decisão de acesso | CRM/Desk | Só "Liberado" após contrato + pagamento + onboarding |
| app_access_granted_at | DateTime | Quando app_access_status = Liberado | CRM/Desk | |
| app_primary_contact_id | ID (Contato) | No cadastro do caso | CRM | |
| case_id | ID | Após aceite comercial | CRM | |
| app_display_name | Texto | Após conferência de identidade | CRM | Nome confirmado para exibição — nunca variantes não validadas |
| app_case_title | Texto | Após definição de escopo | CRM/Desk | Ex: "Cidadania Italiana — Linha Paterna Prade" |
| country_context | Dropdown | No discovery | CRM | |
| family_line_summary | Texto | Após validação documental | Desk/Pesquisa | Resumo aprovado — nunca árvore cru ou dados não validados |
| research_objective | Dropdown | No discovery | CRM | |
| journey_stage | Dropdown | Atualizado no Go-live | Desk | Espelha o estágio do Go-live |
| current_delivery_title | Texto | Atualizado no Go-live | Desk | Só exibir se liberada no Go-live |
| current_delivery_status | Dropdown (Prevista/Em produção/Entregue) | Atualizado no Go-live | Desk | |
| next_step_client_facing | Texto | Atualizado no Go-live | Desk | Deve espelhar Casos 360 |
| document_request_status | Dropdown (Solicitados/Recebidos/Pendentes) | Atualizado no Go-live | Desk | Só status — nunca conteúdo do documento |
| data_sharing_consent | Dropdown (Sim/Não/Parcial) | No cadastro + renovações | CRM | LGPD |
| app_visibility_level | Dropdown (Interno/Portal/Workspace) | Definido por regra de acesso | CRM/Desk | |
| identity_verified | Dropdown (Sim/Não) | Após conferência humana | CRM | |
| last_client_facing_update_at | DateTime | A cada mudança no App | Desk | |

**Regra fundamental:** o App Cliente só pode ler da Projeção App Cliente autorizada por caso. A Projeção não é fonte de verdade; é uma visão cliente-facing, atualizada a partir de campos aprovados do CRM, Desk/Go-live, Asaas reconciliado e Pesquisa validada.

---

## C. Regras de visibilidade e consentimento

### C.1 — Fontes por tipo de dado na Projeção App Cliente

| Tipo de dado | Fonte | O que alimenta na Projeção |
|---|---|---|
| Identidade confirmada, contato principal, consentimentos, proposta e acesso | CRM | app_display_name, app_primary_contact_id, data_sharing_consent, app_access_status, app_visibility_level |
| Jornada, entregas, documentos pertinentes, pendências e próximo passo | Desk/Go-live | journey_stage, current_delivery_title, current_delivery_status, next_step_client_facing, document_request_status |
| Status financeiro reconciliado | Asaas | Somente "pagamento confirmado/pendente" — nunca valor bruto |
| Resumo familiar validado | Desk/Pesquisa | family_line_summary (só após validação documental) |
| Biblioteca de Evidências | Nunca alimenta o App diretamente | — |

### C.2 — Níveis de acesso

| Nível | Requisito | O que permite | O que não expõe |
|---|---|---|---|
| Portal de Proposta | opportunity_id ou proposal_id (não exige case_id) | Proposta resumida, escopo, próximo passo e escolha de pagamento | Documentos sensíveis, histórico interno, fontes, hipóteses, SKU, preço cru, transcrições, dados sensíveis, jornada completa |
| Workspace do Cliente | case_id e regra operacional aprovada | Jornada, documentos pertinentes, entregas e histórico autorizado | Dados internos, fontes de pesquisa, hipóteses, SKU, preço cru, transcrições, gravações, objeções, endereço, documento pessoal, variantes não validadas, árvore cru |

### C.3 — Pendente de validação humana (LGPD)

Os seguintes itens permanecem PENDENTE DE VALIDAÇÃO HUMANA antes de qualquer implementação:
- Política final de LGPD
- Base legal/finalidade de cada categoria de dado
- Regras de retenção, exclusão, arquivamento e reativação

### C.4 — Consentimentos obrigatórios

| Tipo | Quando obter | Onde registrar | Sem consentimento |
|---|---|---|---|
| Contato | Primeiro contato | CRM (Contato) | Não iniciar comunicação ativa |
| Armazenamento e uso de dados | Cadastro | CRM (Contato) | Não armazenar dados além do mínimo |
| Gravação | Antes de gravar call | Painel de Calls | Não gravar |
| Recebimento/compartilhamento de documentos | Quando solicitar/enviar documentos | CRM (Contato) + Desk | Não trocar documentos |

**Política final de LGPD: PENDENTE DE VALIDAÇÃO HUMANA antes de implementação.**

---

## D. Regras de validação de identidade, fontes e variantes de nome

### D.1 — Referências de pesquisa (ex: FamilySearch)

Toda referência externa (FamilySearch, arquivos, cartórios, bases) é classificada como **"referência de pesquisa — pendente de validação documental"** até que um responsável humano confirme:
- que a fonte existe e é acessível;
- que o documento referenciado foi localizado;
- que o conteúdo foi conferido contra o dado genealógico.

Até essa confirmação, a referência não alimenta o App Cliente, não aparece em relatórios cliente-facing e não é usada como prova de parentesco.

### D.2 — Variantes de nome

Variantes de nome (ex: Piccoli / Picoli / Picolli) **não criam pessoa duplicada**. São registradas como `name_variant` na Biblioteca de Evidências, vinculadas à mesma pessoa. Regras:
- A variante principal (confirmada) é usada no `app_display_name`.
- Variantes não validadas não aparecem no App.
- Inconsistência entre variantes exige conferência antes de qualquer exibição.

### D.3 — Inconsistência de identidade

Se houver inconsistência de identidade (nomes conflitantes, datas incompatíveis, documentos contraditórios):
- **Bloquear exibição ao cliente** até conferência.
- Registrar a inconsistência no Desk (Pendências de pesquisa).
- Notificar o responsável.
- Só liberar após validação humana e atualização do `identity_verified = Sim`.

### D.4 — Dados que nunca vão ao App Cliente

| Dado | Por que é proibido |
|---|---|
| Endereço do cliente | Dado pessoal sensível, sem necessidade no App |
| Documento pessoal (CPF, RG, passaporte) | Dado sensível, risco de exposição |
| Gravação/transcrição de call | Interno, LGPD, sem valor para o cliente |
| Objeção comercial | Interno, pode gerar desconforta |
| Preço cru de catálogo (SKU isolado) | Cliente deve ver preço de proposta, não de catálogo |
| SKU técnico | Código interno, sem significado para o cliente |
| Hipótese jurídica | Sempre PENDENTE DE VALIDAÇÃO HUMANA — nunca expor |
| Referências de pesquisa externas | Interno, pode gerar expectativa indevida |
| Variantes de nome não validadas | Pode confundir o cliente |
| Árvore genealógica cru | Só exibir resumo validado, nunca dados brutos |
| Status financeiro interno | Só "confirmado/pendente", nunca valor bruto ou margem |

---

## E. Template reutilizável de ficha piloto para próximos casos

### Estrutura da ficha (a adaptar por caso, não copiar cegamente)

```
FICHA DE CASO — [NOME DO CLIENTE]
=====================================

1. IDENTIFICAÇÃO
   - app_display_name: [nome confirmado]
   - case_id: [ID, só após aceite]
   - country_context: [país]
   - research_objective: [objetivo]
   - identity_verified: [Sim/Não]

2. CONTEXTO FAMILIAR
   - family_line_summary: [resumo validado da linha]
   - ancestral conhecido: [nome, se validado]
   - gerações mapeadas: [número, se validado]
   - pessoas na árvore: [número, se validado]

3. JORNADA E ENTREGAS
   - journey_stage: [estágio atual]
   - current_delivery_title: [entrega atual]
   - current_delivery_status: [status]
   - next_step_client_facing: [próximo passo]
   - document_request_status: [status de documentos]

4. ACESSO E CONSENTIMENTO
   - app_access_status: [Liberado/Bloqueado/Pendente]
   - app_visibility_level: [Interno/Portal/Workspace]
   - data_sharing_consent: [Sim/Não/Parcial]
   - last_client_facing_update_at: [data]

5. PESQUISA INTERNA (nunca no App)
   - hipotese_rota: [sempre PENDENTE DE VALIDAÇÃO HUMANA]
   - fontes de pesquisa: [referências — pendente de validação documental]
   - variantes de nome: [registradas, não expostas]
   - pendências de pesquisa: [lista]
   - grau de confiança: [nível]
   - responsável pela pesquisa: [nome]
   - próxima ação de pesquisa: [ação]

6. DOCUMENTOS (no Desk, só status no App)
   - [documento]: [Solicitado/Recebido/Pendente/Validado]
   - [documento]: [status]

7. COMMERCIAL INTERNO (nunca no App)
   - SKU/produto: [da Mestre]
   - preço: [da Mestre]
   - contrato: [Pendente/Assinado]
   - pagamento: [Pendente/Confirmado (Asaas)]
   - objeções: [texto]
```

### Regras de uso do template

1. **Não copiar a ficha inteira para o CRM** — a ficha é um documento de trabalho interno; o CRM recebe apenas os campos estruturados do bloco "Perfil do Caso" (Seção B).
2. **Não expor automaticamente no App** — cada campo do bloco "Perfil do Caso" só é populado após a condição indicada (validação, aceite, liberação no Go-live).
3. **Adaptar por caso** — a estrutura é a mesma, mas o conteúdo varia (país, linha, documentos específicos).
4. **Uma ficha por caso** — se o cliente tem múltiplas linhas (ex: Danilo Kluyber com Croácia/Itália/Alemanha), cada linha é um case_id separado.
5. **Preservar histórico** — versões anteriores da ficha são arquivadas, nunca apagadas.

---

## Resumo

A ficha piloto de Giovanna Prade é o modelo de referência. Do seu conteúdo, apenas 18 campos estruturados vão para o bloco "Perfil do Caso e Dados para App Cliente" no CRM — o resto fica no Desk/Pesquisa e na Biblioteca de Evidências, acessível somente internamente. O App Cliente lê exclusivamente deste bloco, nunca do Desk, da Mestre, do Planejador, do Asaas ou da Biblioteca diretamente. Referências de pesquisa são sempre "pendente de validação documental" até confirmação humana. Variantes de nome não criam duplicatas. Inconsistências bloqueiam exibição. Endereço, documento pessoal, gravação, transcrição, objeção, preço cru, SKU e hipótese jurídica nunca vão ao App.
