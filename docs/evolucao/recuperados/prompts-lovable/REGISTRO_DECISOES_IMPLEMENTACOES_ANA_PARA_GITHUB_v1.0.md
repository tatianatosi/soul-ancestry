# Registro de decisões e implementações — piloto Ana para commit no GitHub

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Registro de implementação e decisão; pronto para versionamento no repositório canônico  
**Caso:** `CA-CID-AT-FAM-2026-001`  
**Estado operacional:** `NO_GO` preservado

---

## 1. Finalidade

Este documento registra o estado real da implementação do piloto Ana Luiza ao final da rodada de 20/08/2026. Ele existe para impedir que decisões, cortes, pendências, regras de segurança e evidências permaneçam somente em conversas, devolutivas ou memória de ferramentas.

O documento deve ser incluído no GitHub em:

```text
docs/governanca/REGISTRO_DECISOES_IMPLEMENTACOES_ANA_v1.0.md
```

Nenhuma informação aqui é autorização para criar contrato, Ordem de Serviço, assinatura, cobrança, link de pagamento, pasta, pesquisa externa, solicitação institucional, mensagem, integração ou publicação no App Cliente.

---

## 2. Decisões canônicas

### 2.1 Caso e identificadores

- O caso operacional vigente é `CA-CID-AT-FAM-2026-001`.
- A norma G-01 de identificadores canônicos foi implantada, mas nenhum caso real foi renomeado.
- Aliases históricos da Ana permanecem preservados e indeléveis:
  - `CA-AUT-ANALUIZA-FAM-2026-001`
  - `CA-2026-ANA-001`
- O identificador futuro pretendido para casos familiares é `CA-CID-FAM-[ANO]-[SEQUENCIA]`, mas qualquer migração de ID real requer aprovação humana nominal, backup, migration controlada e rollback.
- País, via jurídica, produto, preço, estado comercial e responsável são atributos estruturados; não fazem parte do ID canônico.

### 2.2 Arquitetura do Desk

- O mockup aprovado é soberano em layout, nomenclatura, ordem e navegação.
- A matriz `mockup → rota → dado → estado de implementação` é obrigatória e consultável em `/governanca/matriz-conformidade`.
- Módulos profundos entram em painéis, subabas ou subrotas contextuais; não substituem as 14 abas originais do Desk.
- A ficha canônica concentra Caso, Família, Pessoas, Produto/Trilha, Formalização, Onboarding, Pesquisa e histórico sem duplicar entidades.

### 2.3 Cadeias obrigatórias

**Cadeia de preço**

```text
product_catalog homologado
→ condição comercial
→ case_service
→ exceção aprovada
→ Blueprint
→ Canva
```

**Cadeia do caso**

```text
Discovery + Brief
→ Proposta
→ Aceite verbal
→ Confirmação formal
→ Conferência Canva
→ Case service
→ Formalização
→ Contrato
→ Onboarding
→ Caso ativo
```

Canva é fonte de escopo e proposta; não é fonte isolada de preço, condição, contrato ou cobrança.

---

## 3. Implementações concluídas

### 3.1 G-01 — Identificadores canônicos

- `case_aliases` criada com RLS, imutabilidade e sem update/delete.
- Geração transacional de IDs de caso por organização, modelo e ano.
- Modelos permitidos: `IND`, `FAM`, `MULTI`, `PESQ`, `LEG`, `POS`.
- Edição manual de código/modelo de caso é recusada após a abertura.
- Leads não recebem `case_id` antes da abertura formal.
- Deck Canva só aceita referência `DECK-CANVA-[codigo]-v[N]` para caso existente.
- Fixtures usam prefixo obrigatório `CA-DEMO-…`.
- Doze testes passaram; fixtures foram revertidas ao final do teste.

### 3.2 G-02 — Pessoas, linhagens, árvore e timeline

- Tabelas implementadas:
  - `genealogical_person_profiles`
  - `name_variants`
  - `genealogical_relationships`
  - `genealogical_events`
  - `lineage_paths`
- RLS por organização, autoria automática, arquivamento com motivo e bloqueio de exclusão física.
- Relações, variantes, perfis e eventos não saem de “a confirmar” sem fonte/evidência.
- Sem relações reflexivas, com coerência de datas e suporte a múltiplas linhagens/linha dupla.
- Rota contextual: `/pessoas-linhagens/$caseId`.
- Nenhum dado genealógico da Ana foi inventado ou preenchido.

### 3.3 G-03 — Biblioteca de Evidências e projeções

- Tabelas implementadas:
  - `evidences`
  - `evidence_validations`
  - `app_projections`
- Busca negativa exige fonte, data e próxima ação.
- Confiança inicia em inicial/baixa e não salta automaticamente de inicial para alta.
- Validação por documento exige natureza documental e revisão nominal.
- Projeções client-facing exigem conteúdo sanitizado, aprovação humana, aprovador e data.
- Projeção bloqueia URL, arquivo, transcrição, hipótese, risco, nota interna e juízo de mérito.
- Nenhuma evidência/pessoa/linhagem é lida diretamente pelo App Cliente.

### 3.4 G-04 — Pesquisa, documentos e solicitações

- Rota contextual: `/pesquisa-evidencias/$caseId`.
- `document_requests` implementada com RLS, arquivamento e classificadores fechados.
- Grade operacional: geração, pessoa, tipo de documento, arquivo/instituição, data do pedido, situação, data de recebimento e observação.
- Recebido cria/vincula evidência no estado `Recebida`.
- Espera de cliente/instituição, divergência, não localizado e retificação exigem próxima ação, prazo, responsável e alerta interno.
- Ações externas ficam apenas como rascunho sujeito a aprovação humana.
- Previsão de custo externo não gera despesa, receita, reembolso ou cobrança.

### 3.5 G-05 — Relatórios de fase

- Tabelas implementadas:
  - `case_reports`
  - `report_evidence_links`
  - `report_microdelivery_links`
- F1 é Relatório de Diagnóstico e Direcionamento.
- F2 é Relatório de Pesquisa Genealógica e Evidências.
- Micro-entrega só se vincula a relatório existente; nunca cria relatório paralelo.
- Aprovação, entrega e publicação exigem estados, datas e resumo aprovado compatíveis.
- Nenhum relatório, PDF ou conteúdo da Ana foi criado/publicado/enviado automaticamente.

### 3.6 G-06 — Achados e Encontros de Linhagem

- Tabelas implementadas:
  - `genealogical_findings`
  - `lineage_encounters`
- Achado exige fonte ou evidência.
- Resultado negativo exige fonte consultada, data e próxima ação alternativa.
- Hipótese não pode ser validada nem virar conexão confirmada.
- Impacto em árvore/timeline exige validação interna.
- Encontro exige duas linhas com evidência por lado, salvo marco de origem.
- Encontro sem disclaimer e aprovação não pode gerar projeção ao cliente.
- Linguagem terapêutica, determinista ou de traço psicológico ancestral é recusada.
- Nenhum achado/encontro foi publicado no App ou enviado a cliente.

### 3.7 ANA-B-01 — Cadastro e núcleo familiar

**Adair**

- Pessoa canônica: `case_members cbc6e723…`, com nome `Adair Pinto Silveira Júnior`.
- Cliente canônico `a11a0000-…-0003` gravado em `checklist_cadastral.cliente_id`.
- Nome histórico `Adair Gomes Silveira` preservado em `pessoa_nome_historico` e `audit_logs` com evento `reconciliacao_pessoa`.
- Trigger `fn_checklist_pessoa_guard` exige `pessoa_ref_id` quando aplicável e bloqueia criação por string se pessoa existe.
- Nome exibido deriva do cadastro referenciado; alteração de nome sem motivo é bloqueada.

**Felipe**

- `dependent_person_id = f9095735…` e `titular_responsavel_legal_id = 14cd316d…` persistidos como FKs para `case_members`.
- Participação em contrato, App e anexo individual permanece `false`.
- Banco recusa ativação dessas participações sem `status_representacao='documentada'`, referência interna válida e ambas as FKs.

**Núcleo**

- `nucleo_completude(case)` e `src/lib/nucleo-completude.ts` implementados.
- Critérios persistidos:
  1. núcleo vinculado;
  2. contratante identificada;
  3. participantes com papel;
  4. dependentes com representação;
  5. dossiê-mãe/ambiente/nível de acesso.
- `nucleoOk` deixou de depender apenas de existência de linha.

**Checklist**

- Cadastro individual de Ana, Adair e Alice agrupado por ID, com pendências, fonte e verificação.
- Nenhum dado foi preenchido por suposição.

**Testes**

- Seis casos novos e cinco existentes passaram no teste `ana-b01-cadastro-nucleo.test.ts`.

---

## 4. Implementações parciais

### 4.1 ANA-SAVE-SEC-01

Concluído:

- `data_origin` em casos, leads, clientes, tarefas, alertas e fila de comunicação.
- Trigger `trg_data_origin` em coerência com flag demo.
- `src/lib/verificacao-persistencia.ts` com `DIVERGENCIA_PERSISTENCIA`.
- `src/lib/proxima-acao-regras.ts`.
- `src/lib/persistencia-caso.ts` com mapa formal de persistência.
- Toaster global montado.
- RLS pública identificada e correções declaradas para `checklist_cadastral` e `case_timeline_events`.
- Auditoria mascarada e autoria parcialmente aplicadas.

Pendente:

1. Conectar releitura/comparação aos caminhos reais de servidor.
2. Completar `updated_by` em funções restantes.
3. Guard de alterações não salvas.
4. Feedback/toasts em todos os formulários da Aba Casos.
5. Filtro de fixtures em cockpit, filas, alertas e App Cliente.
6. Aplicar regras de Próxima Ação no servidor.
7. Gerar documento de mapa, changelog, relatório e dez testes de regressão.

### 4.2 G-07 — Plano de Ação de Pesquisa

Concluído:

- Tabelas `institutions`, `research_action_plan_items`, `expense_estimates`, `crm_interactions` imutável.
- RLS por organização, GRANTs, sem exclusão física e funções endurecidas.
- Aprovação humana obrigatória.
- `aguardando_resposta` exige `next_check_at`.
- Ação realizada exige resultado interno e gera interação imutável.
- Ação crítica vencida/para hoje gera alerta interno `plano_acao_critico`.
- Comunicação externa fica em `draft_created`, sem envio.
- Estimativas calculam totais sem lançamento financeiro.
- Bibliotecas de domínio e funções de painel/salvamento/arquivamento criadas.

Pendente:

- Tela `/plano-acao/$caseId`.
- Link contextual na ficha canônica.
- Card “Pendências críticas de pesquisa” no Painel Hoje.
- Testes das regras e de ausência de envio.

---

## 5. Pendências A–E do piloto Ana

### Corte A — Proposta Canva

- A proposta é fonte correta de escopo, vinculada ao caso e com deck/páginas registrados.
- Está expirada desde 19/08/2026.
- Páginas 3–7 permanecem com extração parcial e campos críticos ausentes.
- Assinatura, financeiro, onboarding e preparação final continuam bloqueados.

### Corte B — Cadastro

- Integridade referencial de Adair e Felipe foi corrigida por ANA-B-01.
- Preenchimento e verificação real dos itens cadastrais seguem pendentes.

### Corte C — Case service e condição comercial

- `case_service` permanece em `draft`.
- Dez critérios de aceite requerem decisão humana.
- Preço/condição/parcelamento exigem homologação rastreável e reconciliação.

### Corte E — Matriz jurídica

- Estrutura e funções existem, mas decisões humanas continuam pendentes.
- Linhas duplicadas devem ser saneadas para uma linha canônica por tema/organização.
- Temas bloqueantes impedem assinatura.
- Não há autorização para gerar cláusula jurídica final.

### Corte D — Preparação interna de instrumentos

- Não iniciado.
- Só pode começar após A, B, C e E estarem completos.
- Deve produzir diagnóstico e prévia interna, nunca contrato, OS, anexo, assinatura ou cobrança.

---

## 6. Bloqueios atuais da Ana

| Domínio | Bloqueio |
|---|---|
| Persistência | ANA-SAVE-SEC-01 incompleto; caminhos reais ainda não usam releitura/comparação de forma plena |
| Proposta | Validade expirada e extração parcial páginas 3–7 |
| Cadastro | Itens reais pendentes por pessoa/contratada |
| Case service | `draft` e critérios de aceite pendentes |
| Comercial | Homologação rastreável, pagamento e parcelamento pendentes | 
| Jurídico | Temas bloqueantes sem decisão jurídica humana |
| Dependente | Felipe bloqueia se contrato/App/anexo forem ativados sem representação documentada |
| Instrumentos | D não iniciado |
| Financeiro | Bloqueado até contrato/OS/condição/gates |
| Onboarding | Bloqueado até assinatura, pagamento e requisitos operacionais |

---

## 7. Próxima sequência obrigatória

```text
1. Concluir ANA-SAVE-SEC-01B
2. Concluir G-07B (UI, card e testes), se houver créditos
3. Resolver ações humanas: proposta, cadastro, condição comercial, matriz jurídica e Felipe
4. Corte A — revalidar proposta/escopo
5. Corte C — consolidar case service e condição
6. Corte E — matriz jurídica canônica/painel
7. Corte D — preparação interna de instrumentos
8. Revalidar gates e fazer smoke test Ana
9. Contrato pronto para assinatura, se todos os gates estiverem satisfeitos
10. Assinatura, pagamento, onboarding e primeira entrega, cada um com confirmação humana específica
11. Congelar Lovable e iniciar migração para Claude Code/GitHub/Servla
```

G-08, Assistente AI/Gems, Placego, automações, APIs e scraping não bloqueiam o fechamento da Ana e ficam fora do corte Lovable final.

---

## 8. Critério para encerrar Lovable

O Lovable pode ser congelado quando:

- [ ] ANA-SAVE-SEC-01B passa os dez testes e os testes manuais de persistência/guard/RLS.
- [ ] G-07B passa seus testes de tela, alerta e ausência de envio.
- [ ] A proposta está revalidada ou substituída, com escopo verificável.
- [ ] Cadastro e núcleo estão completos por referência de ID.
- [ ] Produto, condição, parcelas e `case_service` estão homologados e sem conflito oculto.
- [ ] Matriz jurídica bloqueante recebeu decisões humanas.
- [ ] Preparação interna de instrumentos funciona apenas como diagnóstico/prévia.
- [ ] Smoke test desktop/mobile da Ana passa.
- [ ] Contrato está pronto para assinatura, mas nenhuma ação externa é feita sem confirmação.

---

## 9. Próximo commit sugerido

**Título do commit:**

```text
docs(governance): register Ana pilot implementation and controlled next steps
```

**Arquivos a incluir:**

```text
docs/governanca/REGISTRO_DECISOES_IMPLEMENTACOES_ANA_v1.0.md
docs/G01_IDENTIFICADORES_CANONICOS_v1.0.md
docs/G02_PESSOAS_E_LINHAGENS_v1.0.md
docs/G03_BIBLIOTECA_EVIDENCIAS_E_PROJECOES_v1.0.md
docs/G04_PESQUISA_DOCUMENTOS_E_SOLICITACOES_v1.0.md
docs/G05_RELATORIOS_FASE_v1.0.md
docs/ANA_FIX_P0_EXECUCAO_v1.0.md
docs/PREPARACAO_INSTRUMENTOS_ANA_REVISAO_v1.0.md
docs/AUDITORIA_SALVAMENTO_ABA_CASOS_v1.0.md
docs/AUDITORIA_PROPOSTA_CANVA_ANA_v1.0.md
```

Se algum arquivo listado não existir ainda no repositório, registrar a lacuna no pull request e não inventar conteúdo retroativo.

---

## 10. Changelog

### v1.0 — 20/08/2026

- Registradas decisões de arquitetura, IDs, mockup, pesquisa, evidências e App Cliente.
- Registradas G-01 a G-06 como implementações concluídas segundo devolutivas técnicas.
- Registrada ANA-B-01 como correção de integridade referencial do núcleo Ana.
- Registrado G-07 como parcialmente implantado.
- Registrado ANA-SAVE-SEC-01 como parcialmente implantado.
- Mantido o caso Ana em `NO_GO`.
- Definida sequência final para fechar Lovable e migrar para Claude Code/GitHub/Servla.
