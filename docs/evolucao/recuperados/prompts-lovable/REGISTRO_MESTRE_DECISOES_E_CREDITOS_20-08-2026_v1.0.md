# Registro mestre de decisões e créditos — 20/08/2026

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Registro canônico do dia; consolida decisões, estado de implementação, sequência e orçamento  
**Regra de atualização:** versões futuras devem preservar este arquivo e adicionar changelog; não substituir decisões por texto de conversa.

---

## 1. Objetivo do registro

Este documento consolida as decisões tomadas em 20/08/2026 sobre:

- Pilotagem da Ana Luiza.
- Implementação Lovable e cortes G pós-CRM.
- Confiabilidade de persistência e segurança.
- Proposta Canva, cadastro, `case_service`, matriz jurídica e preparação de instrumentos.
- Identificadores canônicos.
- Ficha Piloto Genealógica, Biblioteca de Evidências e Pesquisa/Documentos.
- Migração futura para Claude Code, GitHub e infraestrutura brasileira.
- Estimativas revisadas de créditos Lovable e custos técnicos.

Nenhuma informação deste documento autoriza ação externa. Contrato, OS, assinatura, cobrança, link de pagamento, criação de pasta, pesquisa externa, contato institucional, mensagem ou publicação no App Cliente exigem gates e confirmação específica.

---

## 2. Decisões normativas vigentes

### 2.1 Arquitetura visual e navegação

1. O mockup aprovado é soberano em layout, nomenclatura, ordem e navegação.
2. Nenhuma aba aprovada pode ser removida, renomeada, deslocada ou simplificada sem matriz `mockup → rota → dado → estado`.
3. A matriz vive em `src/lib/matriz-conformidade.ts` e é consultável em `/governanca/matriz-conformidade`.
4. Módulos profundos entram como painéis, subabas ou subrotas contextuais; não criam nova aba principal concorrente.
5. As 14 abas originais permanecem a arquitetura de referência:
   - Visão Geral
   - CRM vivo
   - Casos 360
   - Propostas
   - Go-live
   - Formalização
   - Checklist AppCliente
   - Financeiro
   - Checklist semanal
   - Validação Jurídica
   - Radar Interno
   - Alertas
   - Integrações
   - Biblioteca Mestre
6. Navegação mobile é requisito de operação: Financeiro, Formalização, Pesquisa, Biblioteca e rotas posteriores a Propostas devem permanecer acessíveis.

### 2.2 Cadeias canônicas

**Preço**

```text
product_catalog homologado
→ condição comercial
→ case_service
→ exceção aprovada
→ Blueprint
→ Canva
```

- Canva é fonte de escopo/proposta, não fonte canônica isolada de preço, condição, cobrança ou contrato.
- Preço manual, WhatsApp, planejador e legado não liberam contrato/cobrança.

**Caso**

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

Nenhum elo pode ser pulado; evento visual não substitui estado persistido e evidência.

### 2.3 Identificadores canônicos

Formato normativo:

```text
CA-CID-[MODELO]-[ANO]-[SEQUENCIA]
```

Modelos: `IND`, `FAM`, `MULTI`, `PESQ`, `LEG`, `POS`.

- País, via, produto, preço, responsável e estado não entram no identificador.
- Leads usam `CA-LEAD-[ANO]-[SEQUENCIA]` até abertura formal.
- Aliases são indeléveis e não são chaves.
- Proposta Canva usa `DECK-CANVA-[CASE_ID]-v[N]`.
- Fixtures usam `CA-DEMO-…`.

Norma G-01 implantada: geração transacional, aliases imutáveis, RLS e 12 testes aprovados; nenhum caso real foi renomeado.

### 2.4 Dados, pesquisa e App Cliente

```text
Fonte/material
→ Biblioteca de Evidências
→ Ficha/Pessoa/Relação/Evento
→ Validação humana e confiança
→ Desk/Pesquisa/Planejador
→ Projeção autorizada
→ App Cliente / One-page / PDF aprovado
```

- O App Cliente só recebe projeção sanitizada, aprovada e autorizada.
- Nunca recebe fonte crua, URL interna, documento bruto, hipótese, risco, transcrição, dado de terceiro, score interno, preço técnico ou juízo de mérito.
- Pesquisa externa, scraping, API, consulta a base, pedido documental ou contato institucional não são autorizados pelos módulos internos.
- Busca negativa é evidência válida, desde que tenha fonte, data e próxima ação.

### 2.5 Linguagem e conteúdo

- Não usar termos terapêuticos, deterministas ou promissórios em conteúdo público/cliente.
- Termos proibidos incluem cura ancestral, cura da linhagem, terapia genealógica, destino familiar, karma ancestral, garantia de cidadania/documento/linhagem, prazo garantido e elegibilidade confirmada sem revisão.
- Encontro de Linhagem é entrega aprovada e sanitizada; não pode afirmar vínculo sem evidência ou atribuir traços psicológicos/culturais deterministas.

---

## 3. Estado do piloto Ana

### 3.1 Estado operacional

| Item | Estado vigente |
|---|---|
| Caso | `CA-CID-AT-FAM-2026-001` |
| Estado geral | `NO_GO` |
| Eixo comercial | Confirmação formal recebida |
| Eixo formalização/operação | Formalização em preparação |
| Status derivado | Pré-onboarding bloqueado |
| Responsável principal/supervisora | Tatiana Melani Tosi |
| Proposta | Canva v1 registrada; tecnicamente bloqueada por validade e extração parcial |
| Contrato/OS | Não criados; preparação interna pendente de gates |
| Assinatura/financeiro | Bloqueados |
| Pesquisa externa | Não iniciada |
| App Cliente | Nenhuma projeção publicada |

### 3.2 Núcleo e participantes

- Núcleo ativo: `Silveira / Friedmann-Reimer`.
- Adultos: Ana Luiza, Adair e Alice, com estado de signatários/cliente conforme modelagem vigente.
- Felipe: dependente do Processo A de Ana; `signature_required=false`, `possui_acesso_app=false`, sem anexo individual enquanto representação estiver pendente.
- Barreira de dependentes ativa: TypeScript `bloqueiosDependentes` + trigger `fn_case_dependent_guard`.

### 3.3 Bloqueios humanos e materiais

1. Proposta Canva expirada em 19/08 e extração parcial das páginas 3–7, com campos ausentes.
2. Cadastro de signatários/contratada incompleto; itens pendentes por pessoa.
3. Identidade paralela de Adair em checklist cadastral a reconciliar por ID.
4. `case_service` em `draft`, sem referência contratual e com critérios pendentes de decisão humana.
5. Condição comercial sem homologação rastreável completa ou espelho homologado de pagamento/parcelamento.
6. Matriz jurídica sem decisões; temas bloqueantes impedem assinatura.
7. Felipe requer representação documentada caso participe de contrato, App ou anexo.
8. Persistência, guard de rascunho, feedback e testes de regressão ainda não estão plenamente conectados.

---

## 4. Implementações concluídas

### 4.1 G-01 — Identificadores canônicos

**Concluído.**

- `case_aliases` criada, com RLS, imutabilidade e bloqueio de exclusão/reescrita.
- `crm_casos.modelo` com `IND/FAM/MULTI/PESQ/LEG/POS`.
- `gerar_case_id()` transacional, trigger de geração e bloqueio de edição posterior.
- Lead somente recebe `case_id` após ganho/abertura formal.
- Deck só é aceito no padrão `DECK-CANVA-[codigo]-v[N]` para caso existente.
- 12 testes passaram; fixtures foram desfeitas por rollback.
- Aliases Ana preservados: `CA-AUT-ANALUIZA-FAM-2026-001` e `CA-2026-ANA-001`.

### 4.2 G-02 — Pessoas, Linhagens, Árvore e Timeline

**Concluído.**

- Tabelas: `genealogical_person_profiles`, `name_variants`, `genealogical_relationships`, `genealogical_events`, `lineage_paths`.
- RLS por organização, autoria automática, arquivamento com motivo e bloqueio de exclusão física.
- Relações, variantes, eventos e perfis só saem de “a confirmar” com fonte/evidência.
- Sem relação reflexiva, com datas coerentes e múltiplas linhagens/linha dupla.
- Rota: `/pessoas-linhagens/$caseId`.
- Abas: Perfil 360°, Árvore interna, Linha do tempo, Relações, Variantes, Linhagens, Eventos e Lacunas.
- 12 testes passando; build e typecheck limpos.
- Nenhum dado genealógico foi inventado/inserido para Ana.

### 4.3 G-03 — Biblioteca de Evidências e Projeções

**Concluído.**

- Tabelas: `evidences`, `evidence_validations`, `app_projections`.
- RLS, autoria, arquivamento e regras de acesso para evidência restrita.
- Busca negativa exige fonte, data e próxima ação.
- Confiança nasce em inicial/baixa; não salta automaticamente de inicial para alta.
- Validação por documento exige natureza documental e revisão nominal.
- Projeções bloqueiam URL, arquivo, transcrição, hipótese, risco, nota interna e juízo de mérito.
- Projeção exige aprovação humana; publicada somente pode ser arquivada.
- Rota: `/biblioteca-evidencias/$caseId`.
- 11 testes passando; tipos e build limpos.
- Nenhuma fonte externa, API, scraping, pesquisa, mensagem ou publicação App executada.

### 4.4 G-04 — Pesquisa, Documentos e Solicitações

**Concluído.**

- Rota: `/pesquisa-evidencias/$caseId`, ligada à ficha canônica.
- Oito seções de pesquisa/evidências.
- `document_requests` com RLS, arquivamento e grade operacional:
  geração, nome completo, tipo de documento, arquivo/instituição, data do pedido, situação, data de recebimento e observação.
- Recebido cria/vincula evidência `Recebida`.
- Espera de cliente/instituição, divergência, não localizado e retificação exigem próxima ação, prazo, responsável e alerta.
- Ação cliente gera somente rascunho com aprovação humana obrigatória.
- Estimativa externa não vira receita, custo, reembolso ou cobrança.
- 11 testes passando; build e typecheck limpos.
- Nenhuma certidão solicitada, instituição contatada, despesa, cobrança, pasta, mensagem ou documento externo criado.

---

## 5. Implementações parciais e pendentes

### 5.1 ANA-SAVE-SEC-01 — Persistência, segurança e feedback

**Parcial.**

Concluído:

- `data_origin` para casos, leads, clientes, tarefas, alertas e fila de comunicação.
- Trigger `trg_data_origin` em coerência com `demo`.
- `verificacao-persistencia.ts` com `DIVERGENCIA_PERSISTENCIA`.
- `proxima-acao-regras.ts` com validações de responsável, prazo, público, visibilidade, canal e aprovação humana.
- `persistencia-caso.ts` com mapa formal de persistência e gerador Markdown.
- RLS `public` identificada em `checklist_cadastral` e `case_timeline_events`; atualização posterior declarou remoção de acesso `anon` e políticas autenticadas.
- Autoria/auditoria adicionadas parcialmente e `<Toaster />` montado.

Pendente:

1. Conectar releitura/comparação aos caminhos reais de servidor.
2. Completar `updated_by` nas funções restantes.
3. Implementar guard salvar/descartar/cancelar.
4. Conectar feedback em todos os formulários da Aba Casos.
5. Filtrar fixtures do cockpit, filas, alertas e App; adicionar rótulo visual.
6. Aplicar validação de Próxima Ação no servidor.
7. Gerar mapa Markdown, changelog, relatório e 10 testes de regressão.

### 5.2 Corte A — Proposta Canva

**Implementado, porém bloqueado.**

- Fonte, case_id, status, deck e páginas 1–7 registrados.
- Validade vencida em 19/08.
- Páginas 3–7 com extração parcial e campos ausentes.
- Gate bloqueia rascunho de instrumentos, assinatura, financeiro e onboarding.

### 5.3 Corte B — Cadastro e núcleo

**Parcial.**

- Checklist cadastral e estrutura de núcleo existem.
- P0: Adair possui divergência de nome entre checklist e registros canônicos.
- P0: Felipe→Ana ainda requer persistência referencial por FK.
- `nucleoOk` precisa deixar de derivar de mera existência de linha.

### 5.4 Corte C — `case_service`, preço e critérios

**Parcial.**

- Estruturas existem.
- `case_service` em `draft`.
- Dez critérios de aceite pendentes de decisão humana.
- Produto/condição requerem homologação rastreável completa.
- `planoInicialOk` deve usar completude verificável, não mera existência de linha.

### 5.5 Corte E — Matriz jurídica

**Parcial.**

- Estrutura e funções de matriz existem.
- Há necessidade de deduplicar linhas e manter uma linha canônica por organização/tema.
- Painel na preparação contratual e leitura agregada ainda devem ser concluídos.
- Não há autorização para gerar cláusulas ou texto jurídico final.

### 5.6 Corte D — Preparação de instrumentos

**Não iniciado.**

Só começa após A, B, C e E. Produz diagnóstico e prévia interna, sem criar contrato, OS, anexo, assinatura ou cobrança.

### 5.7 Próximos G

| Corte | Estado | Dependência |
|---|---|---|
| G-05 Relatórios F1/F2 | Pendente | G-02/G-03/G-04 concluídos; não publicar para Ana ainda |
| G-06 Achados e Encontros de Linhagem | Pendente | Linhagens + evidências + projeções existentes |
| G-07 Plano de Ação, Instituições e Terceiros | Pendente | Solicitações e próximas ações existentes |
| G-08 Bases Genealógicas 5B-Pre | Pendente | Governança apenas; sem API/scraping/consulta externa |

---

## 6. Ordem de execução revisada

```text
1. Concluir ANA-SAVE-SEC-01B
2. Executar e validar ANA-FIX-P0 / Corte B
3. Resolver ações humanas: proposta, cadastro, condição comercial, jurídico, Felipe
4. Corte A — proposta Canva e validade/extração
5. Corte C — case service, preço, condição e critérios
6. Corte E — matriz jurídica e decisão humana
7. Corte D — preparação interna de instrumentos
8. G-05 — relatórios F1/F2
9. G-06 — achados e encontros de linhagem
10. G-07 — plano de ação, instituições e terceiros
11. G-08 — catálogo de bases 5B-Pre
12. Revalidar jornada Ana
13. Contrato pronto para assinatura, se todos os gates forem satisfeitos
14. Assinatura, pagamento, onboarding e primeira entrega — somente com confirmação humana por ação
15. Congelar Lovable e migrar para Claude Code/GitHub/stack brasileira
```

---

## 7. Estimativa revisada de créditos Lovable

### 7.1 Princípios de cálculo

- G-01, G-02, G-03 e G-04 já foram implantados; não devem ser novamente orçados.
- Os números abaixo são **créditos adicionais estimados**, não créditos já consumidos.
- Itens de banco, RLS, migrations, testes, FKs, persistência e regra de servidor devem ser transferidos a Claude Code assim que houver repositório canônico; se continuarem no Lovable, consomem mais crédito e aumentam risco de regressão.
- O orçamento exclui novas auditorias amplas, redesign, integrações externas, scraping, AI/Gems, Placego e automações.

### 7.2 Cenário mínimo — terminar Ana e preparar migração

| Bloco | Ferramenta preferencial | Lovable adicional | Observação |
|---|---|---:|---|
| ANA-SAVE-SEC-01B | Claude Code/GitHub | 0–80 | Lovable somente para guard/toasts/feedback visual |
| ANA-FIX-P0/Corte B | Claude Code/GitHub | 0–60 | FKs, migração e dicionários em código; UI mínima no Lovable |
| Corte A — proposta Canva | Lovable + código | 60–120 | Painel e estados; sem editar Canva |
| Corte C — case service/condição | Claude Code/GitHub + UI Lovable | 40–100 | Regras e homologação em código; visual no Lovable |
| Corte E — matriz jurídica/painel | Claude Code/GitHub + UI Lovable | 50–100 | Sem cláusula final |
| Corte D — preparação interna | Claude Code/GitHub + UI Lovable | 50–100 | Prévia interna e checklist |
| G-05 — relatórios F1/F2 | Lovable + código | 50–90 | Conectar, não recriar |
| G-06 — achados/encontros | Lovable + código | 80–140 | Sem publicação automática |
| G-07 — plano de ação | Lovable + código | 60–120 | Sem contato externo |
| G-08 — bases 5B-Pre | Claude Code/GitHub + UI Lovable | 40–90 | Catálogo, sem integração |
| Correções e smoke test | Lovable | 120–200 | Reserva para UI/móvel/regressões |
| **Total adicional provável** |  | **550–1.100** | Se a maior parte técnica migrar para Claude Code |

### 7.3 Cenário realista de economia

Como G-01 a G-04 já foram implantados, a faixa de 650–1.100 créditos anteriormente prevista para a sequência G inteira deve ser substituída por:

```text
Crédito Lovable já potencialmente consumido: G-01 a G-04 + cortes anteriores
Crédito Lovable adicional para Ana + G-05 a G-08: 550–1.100
Meta operacional: 650–850
Teto de proteção: 1.100
```

### 7.4 Stop-loss

- Parar qualquer corte Lovable se consumir mais de 250 créditos sem entregar um bloco testável fechado.
- Parar a sequência inteira se atingir 850 créditos sem contrato interno pronto para assinatura ou sem fechamento dos gates técnicos da Ana.
- O teto de 1.100 exige nova decisão humana explícita.
- Não gastar Lovable em migrations, RLS, deduplicação, FKs, testes de servidor ou infraestrutura quando Claude Code estiver disponível.

---

## 8. Créditos e custo técnico histórico

### 8.1 Perplexity Computer rastreável

| Marco | Créditos confirmados |
|---|---:|
| CA-EVO-01 | 233,99 |
| CA-EVO-02 | 730,00 |
| CA-EVO-03 | 375,00 |
| **Subtotal rastreável** | **1.338,99** |

Esse subtotal é mínimo comprovado, não total histórico do Clube Ancestral. Estimativas antigas de 3.600–6.400 créditos eram projeções de go-live e não gasto histórico confirmado.

### 8.2 Custo futuro de desenvolvimento

- Lovable: uso residual até Ana e cortes G restantes; não tratar como custo fixo permanente.
- Claude Code: canal padrão pós-piloto para desenvolvimento técnico, migrations, RLS, testes e deploy.
- GitHub: repositório canônico, decisões, documentação e releases.
- Servla: alvo de hospedagem brasileira após homologação e migração controlada.

---

## 9. Migração após Ana

### Gatilho de migração

Começar migração quando:

- [ ] ANA-SAVE-SEC-01B concluído.
- [ ] A–E concluídos como prévia interna e gates verificáveis.
- [ ] Jornada Ana testada em desktop e mobile.
- [ ] Contrato pronto para assinatura, sem bloqueio técnico pendente.
- [ ] Código, migrations, RLS, Storage e variáveis inventariados.
- [ ] Backup e rollback preparados.

### Destino

```text
GitHub → código, documentação, decisões, CI, releases
Claude Code → implementação, testes, migrations, RLS, infraestrutura
Servla Brasil → homologação e depois produção
app.clubeancestral.com.br → App Cliente e Magic Links finais
```

Vercel/Supabase Cloud podem ser ponte e rollback durante transição; não devem ser desligados no corte inicial da Servla.

---

## 10. Registro de documentos criados ou atualizados hoje

| Documento/artefato | Estado |
|---|---|
| `DECISAO_IDENTIFICADORES_CANONICOS_CASOS_v1.0.md` | Criado |
| `PROMPTS_POS_CRM_IDENTIFICADORES_E_MOTOR_GENEALOGICO_v1.0.md` | Criado |
| `AUDITORIA_PROMPTS_ANA_IMPLEMENTACAO_E_LACUNAS_v1.0.md` | Criado |
| `PLANO_DECISOES_E_PROMPTS_ANA_A_E_v1.0.md` | Criado |
| `INVENTARIO_PROMPTS_LOVABLE_SEMANA_E_PRIORIZACAO_POS_CRM_v1.0.md` | Criado |
| `PLANO_MIGRACAO_E_STACK_BRASIL_APOS_PILOTO_ANA_v1.0.md` | Criado |
| `docs/G01_IDENTIFICADORES_CANONICOS_v1.0.md` | Declarado implementado |
| `docs/G02_PESSOAS_E_LINHAGENS_v1.0.md` | Declarado implementado |
| `docs/G03_BIBLIOTECA_EVIDENCIAS_E_PROJECOES_v1.0.md` | Declarado implementado |
| `docs/G04_PESQUISA_DOCUMENTOS_E_SOLICITACOES_v1.0.md` | Declarado implementado |
| `docs/AUDITORIA_SALVAMENTO_ABA_CASOS_v1.0.md` | Declarado registrado |
| `docs/ANA_FIX_P0_EXECUCAO_v1.0.md` | Declarado registrado |
| `docs/PREPARACAO_INSTRUMENTOS_ANA_REVISAO_v1.0.md` | Declarado registrado |
| `docs/AUDITORIA_PROPOSTA_CANVA_ANA_v1.0.md` | Declarado registrado |

---

## 11. Changelog

### v1.0 — 20/08/2026

- Consolidou decisões do dia em documento canônico.
- Registrou G-01 a G-04 como implementados segundo devolutivas recebidas.
- Registrou Ana Save/Security, A–E e bloqueios humanos como pendências controladas.
- Revisou créditos Lovable adicionais para faixa provável de 550–1.100, com meta de 650–850 e stop-loss de 850.
- Confirmou G-05 a G-08 como próximos módulos, sem integração externa ou automação.
- Confirmou a migração para Claude Code/GitHub/Servla após a jornada Ana e os gates técnicos.
