# Plano de decisões e prompts Ana — cortes A a E

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Documento mestre de execução controlada  
**Caso:** `CA-CID-AT-FAM-2026-001`  
**Estado do caso:** `NO_GO`  
**Referências:** `docs/AUDITORIA_SALVAMENTO_ABA_CASOS_v1.0.md`, `docs/FICHA_POS_CRM_FAMILIA_ANA_v1.0.md`, `docs/PREPARACAO_INSTRUMENTOS_ANA_REVISAO_v1.0.md`, `docs/ANA_FIX_P0_EXECUCAO_v1.0.md`, `docs/AUDITORIA_PROPOSTA_CANVA_ANA_v1.0.md`.

---

## 1. Finalidade

Este documento consolida os cortes A a E do piloto Ana, suas decisões, dependências, estado de implementação, prompts pendentes e critérios de aceite. Ele substitui a execução dispersa por uma sequência única e controlada.

Nenhum prompt deste documento autoriza ação externa. Contrato, Ordem de Serviço, cláusula jurídica final, assinatura, cobrança, link de pagamento, criação de pasta, documento externo, pesquisa externa, mensagem, integração ou publicação no App Cliente exigem gates satisfeitos e confirmação específica posterior.

---

## 2. Norma de execução

1. Executar um corte por vez.
2. Não avançar se o gate do corte anterior não estiver comprovado.
3. Não preencher lacunas por inferência.
4. Não usar o front-end como fonte de verdade: regras críticas devem existir no servidor/banco e ser testadas.
5. Não apagar registros reais; usar reconciliação auditável, aliases, arquivamento ou marcação de substituição.
6. O mockup aprovado é soberano em layout, nomenclatura, ordem e navegação. Módulos profundos entram como painéis/subrotas dentro das telas aprovadas.
7. Lovable fica restrito a UI/fluxo visual; migrations, FKs, RLS, auditoria, testes, persistência e regras de servidor devem ser priorizados em Claude Code/GitHub.

---

## 3. Estado geral atual

| Frente | Situação |
|---|---|
| Caso e núcleo Ana | Implementados, mas `NO_GO` |
| Proposta Canva / Corte A | Registrada, porém expirada em 19/08 e com extração parcial em páginas 3–7 |
| Checklist cadastral / Corte B | Existe, mas incompleto e com identidade paralela de Adair |
| `case_service` / Corte C | Existe em `draft`; 10 critérios pendentes de decisão humana |
| Preparação de instrumentos / Corte D | Não implementada; parada antes de escrita |
| Matriz jurídica e painel / Corte E | Matriz/funções parciais existem; agregador e painéis pendentes |
| Segurança e salvamento | Parcial; auditoria identificou 7 caminhos incompletos e 8 correções mínimas |
| RLS public | Duas tabelas identificadas; correção declarada parcialmente aplicada em atualização posterior, mas exige teste de regressão |
| Identificadores G-01 | Implementado; 12 testes passaram; nenhum caso real renomeado |
| Ficha Piloto G-02 | Implementada; não deve receber dados reais até a persistência estar concluída |

---

## 4. Ordem obrigatória

```text
Pré-corte: concluir ANA-SAVE-SEC-01B
→ Corte A: proposta Canva e completude de escopo
→ Corte B: cadastro por pessoa e núcleo familiar
→ Corte C: case service, condição comercial e critérios de aceite
→ Corte E: matriz jurídica e painel de decisão humana
→ Corte D: consolidador interno de instrumentos
→ revisão humana dos bloqueios restantes
→ contrato pronto para assinatura, se todos os gates forem satisfeitos
```

**Nota:** D depende de A, B, C e E. A ordem funcional é deliberadamente A → B → C → E → D, embora a nomenclatura histórica seja A–E.

---

## 5. Pré-corte obrigatório — ANA-SAVE-SEC-01B

### Decisão

Antes de tocar em proposta, cadastro, `case_service`, matriz jurídica ou instrumentos, a Aba Casos deve comprovar persistência, feedback, RLS, auditoria e proteção contra perda de rascunho.

### Estado conhecido

Já existem, mas ainda não estão plenamente conectados:

- `data_origin` e `trg_data_origin`.
- `src/lib/verificacao-persistencia.ts`.
- `src/lib/proxima-acao-regras.ts`.
- `src/lib/persistencia-caso.ts`.
- `<Toaster />` global.
- Correções parciais de RLS e autoria.

### Prompt — ANA-SAVE-SEC-01B

```text
[ID ANA-SAVE-SEC-01B] CONCLUIR A CONFIABILIDADE DE PERSISTÊNCIA, AUDITORIA E RLS DA ABA CASOS.

CONTINUAR A PARTIR DO ESTADO EXISTENTE.
NÃO REFAZER MIGRATIONS JÁ APLICADAS.
NÃO ALTERAR REGRAS COMERCIAIS, PROPOSTAS, PREÇOS, CASE SERVICE, MATRIZ JURÍDICA, PESQUISA, CONTRATOS OU APP CLIENTE.
NÃO CRIAR CONTRATO, OS, CLÁUSULA, ASSINATURA, COBRANÇA, LINK, PASTA, DOCUMENTO EXTERNO, PESQUISA EXTERNA, MENSAGEM, INTEGRAÇÃO OU PUBLICAÇÃO.

A. CONECTAR VERIFICAÇÃO PÓS-SAVE
Nos caminhos atualizarRegistro, atualizarAlerta, atualizarItemOnboarding, etiquetas, rascunhos de comunicação, ficha de caso, família, pessoa, checklist e próxima ação:
1. salvar via servidor;
2. reler o registro no servidor;
3. comparar payload persistível e registro relido usando verificacao-persistencia.ts;
4. retornar sucesso somente se coincidirem;
5. retornar DIVERGENCIA_PERSISTENCIA com campos sanitizados quando divergirem;
6. retornar CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA para campo fora do mapa;
7. retornar NENHUMA_LINHA_AFETADA quando nenhum registro for alterado.

B. AUTORIA E AUDITORIA
- Garantir updated_by derivado da sessão em atualizarAlerta, atualizarItemOnboarding, etiquetas e rascunhos.
- Nunca aceitar updated_by do cliente.
- Manter trigger como proteção secundária.
- Confirmar que audit logs mascaram CPF, RG, documento, endereço, CEP, telefone, e-mail, URL, token, transcrição e observações sensíveis.

C. GUARD DE ALTERAÇÕES NÃO SALVAS
Aplicar em troca de rota, subaba, caso e refresh/fechamento:
- Salvar e continuar;
- Descartar alterações;
- Cancelar.
Salvar e continuar só navega depois de releitura/comparação bem-sucedida.

D. FEEDBACK
Conectar estados e toasts nos formulários da Aba Casos:
- Salvando;
- Salvo às HH:MM;
- Alterações não salvas;
- Campo não mapeado;
- Nenhuma linha afetada;
- Divergência de persistência;
- Erro de permissão;
- Erro inesperado.

E. FIXTURES
- Excluir data_origin=fixture_demo das filas, alertas, cockpit, métricas e App Cliente.
- Mostrar rótulo DEMONSTRAÇÃO/FIXTURE somente no Desk autorizado.
- Não apagar dados reais ou fixtures.

F. PRÓXIMA AÇÃO
Aplicar proxima-acao-regras.ts no servidor e exigir responsável, prazo, público, visibilidade, canal e aprovação humana para canal externo.
Canal externo gera apenas rascunho interno; nunca envio.

G. DOCUMENTAÇÃO E TESTES
Gerar docs/seguranca/MAPA_PERSISTENCIA_ABA_CASOS_v1.0.md, changelog e relatório.
Criar e executar 10 testes:
1. salvar/reler/confirmar persistência;
2. divergência pós-save;
3. campo não mapeado;
4. nenhuma linha afetada;
5. guard em troca de subaba;
6. updated_by da sessão;
7. auditoria mascarada;
8. fixture fora do Painel/App;
9. próxima ação incompleta negada;
10. próxima ação externa cria somente rascunho.

H. ENTREGA
Mostrar caminhos conectados, formulários com feedback, guard, filtros de fixture, regras de próxima ação, alterações, 10 testes, estado NO_GO da Ana e confirmação de nenhuma ação externa.
```

### Gate do pré-corte

- [ ] 10 testes automatizados passam.
- [ ] Editar → salvar → recarregar confirma o valor.
- [ ] Troca de aba com rascunho mostra as três escolhas.
- [ ] Sem sessão não lê tabelas protegidas.
- [ ] Nenhum fixture aparece em operação produtiva.

---

## 6. Corte A — Proposta Canva e escopo

### Decisão

A proposta Canva é fonte de escopo, não fonte isolada de preço, contrato ou cobrança. A proposta Ana está vinculada ao caso e tem páginas registradas, mas permanece inválida para assinatura/financeiro enquanto expirada e com páginas 3–7 parcialmente extraídas.

### Estado atual

- Deck: `DECK-CANVA-CA-CID-AT-FAM-2026-001-v1`.
- Origem Canva, proposta aprovada e vinculada ao caso.
- Validade vencida em 19/08/2026.
- Páginas 3–7 em extração parcial.
- Dez campos não localizados, incluindo valor total, forma de pagamento e parcelas.

### Prompt — ANA-A-01

```text
[ID ANA-A-01] SANEAMENTO INTERNO DA PROPOSTA CANVA E CONFERÊNCIA DE ESCOPO DA ANA.

NÃO CRIAR, EDITAR OU COPIAR DESIGN NO CANVA.
NÃO CRIAR CONTRATO, OS, ANEXO, ASSINATURA, COBRANÇA, LINK, PASTA, MENSAGEM, PESQUISA EXTERNA OU PUBLICAÇÃO.
NÃO INFERIR CAMPOS AUSENTES.

CASO: CA-CID-AT-FAM-2026-001.

A. PRESERVAR A REFERÊNCIA
- Preservar deck_referencia_interna DECK-CANVA-CA-CID-AT-FAM-2026-001-v1.
- Preservar status/origem/versionamento/páginas já registrados.
- Não tratar URL externa como requisito de validade nem gravar URL em auditoria.

B. EXTRAÇÃO E AUSÊNCIA
- Exibir páginas 1–7 individualmente.
- Manter páginas 3–7 como em_extracao enquanto não houver conteúdo verificável.
- Para cada campo, registrar somente: coberto_validado, importado_a_confirmar, parametro_vazio, nao_localizado_na_proposta, divergente ou opcional_nao_declarado.
- Nunca converter ausência em valor padrão.
- Campos não localizados devem produzir pendência explícita, sem preencher preço, pagamento ou parcelas.

C. VALIDADE
- Tratar validade vencida em 19/08 como bloqueio explícito.
- Criar ação interna Revalidar proposta/validade comercial, sem enviar mensagem e sem editar Canva.
- Exigir decisão humana: renovar, substituir ou encerrar a vigência.

D. CONFERÊNCIA
- Reexecutar conferirEscopoProposta e mostrar campos extraídos, ausentes, conflitos, anexos impactados e bloqueios.
- Manter gate de assinatura, financeiro, versão final e onboarding bloqueado enquanto houver validade vencida, campo obrigatório ausente ou conflito.

E. TESTES
1. Página ausente bloqueia.
2. Campo obrigatório não localizado bloqueia.
3. Proposta expirada bloqueia.
4. Proposta substituída bloqueia.
5. Auditoria sanitizada não contém URL, conteúdo integral nem dados pessoais.

F. ENTREGA
Mostrar status por página, campos ausentes, bloqueios, ação humana requerida e confirmação de nenhuma ação externa.
```

### Gate A

- [ ] Proposta válida ou decisão formal de revalidação/substituição registrada.
- [ ] Páginas necessárias extraídas ou ausências aceitas por decisão humana documentada.
- [ ] Campos comerciais reconciliados fora do Canva, pela cadeia canônica.

---

## 7. Corte B — Cadastro e núcleo familiar

### Decisão

Cadastro pertence à pessoa; Caso não é ficha cadastral. Todo checklist deve usar referência por ID, não string de nome. Felipe continua dependente não signatário sem App/anexo enquanto a representação estiver pendente.

### Prompt — ANA-B-01

```text
[ID ANA-B-01] CORRIGIR CADASTRO POR PESSOA E INTEGRIDADE DO NÚCLEO FAMILIAR DA ANA.

NÃO CRIAR CONTRATO, ANEXO, ASSINATURA, COBRANÇA, APP CLIENTE ATIVO, PASTA, PESQUISA EXTERNA OU COMUNICAÇÃO.
NÃO APAGAR REGISTROS; toda reconciliação deve ser auditável.

A. ADAIR
- Localizar checklist_cadastral com nome divergente "Adair Gomes Silveira".
- Adicionar/usar pessoa_ref_id e cliente_id como referência obrigatória.
- Reconciliar com pessoa/cliente canônicos de "Adair Pinto Silveira Júnior".
- Preservar valor histórico somente em audit log e registrar motivo.
- Impedir nova criação de checklist apenas por string quando houver pessoa existente.

B. FELIPE
- Persistir dependent_person_id e titular_responsavel_legal_id por FK.
- Fazer backfill controlado Felipe → Ana somente se os IDs de pessoa correspondentes já existirem e forem verificados.
- Manter signature_required=false, possui_acesso_app=false e anexo_individual=false enquanto representação estiver pendente.
- Impedir contrato, App ou anexo para Felipe sem status_representacao=documentada e referência interna válida.

C. COMPLETUDE DO NÚCLEO
Substituir nucleoOk derivado de existência de linha por critérios persistidos:
1. núcleo vinculado ao caso;
2. contratante identificada;
3. participantes com papel definido;
4. dependentes com status de representação;
5. dossiê-mãe/ambiente/nível de acesso, quando aplicável.
Exibir itens pendentes e motivo; não usar booleano opaco.

D. CHECKLIST CADASTRAL
- Manter cadastro individual de Ana, Adair e Alice por pessoa.
- Mostrar itens pendentes e fonte/verificação por pessoa.
- Não preencher dados ausentes por suposição.

E. TESTES
1. Checklist de Adair persiste pelo ID canônico após reload.
2. Checklist novo não usa nome como única chave.
3. Felipe persiste FKs corretas.
4. Felipe sem contrato/App/anexo não bloqueia apenas por existir.
5. Felipe com participação sem representação bloqueia no servidor e banco.
6. Núcleo sem critérios completos não satisfaz nucleoOk.

F. ENTREGA
Mostrar referências reconciliadas, FKs, critérios de núcleo, testes e confirmação de nenhuma ação externa.
```

### Gate B

- [ ] Não há identidade paralela de Adair.
- [ ] Vínculo Felipe → Ana está persistido por FK ou permanece explicitamente pendente sem texto enganoso.
- [ ] Itens cadastrais necessários estão preenchidos e verificados por pessoa.
- [ ] `nucleoOk` representa completude real, não mera existência.

---

## 8. Corte C — Case service, condição comercial e critérios de aceite

### Decisão

A cadeia canônica de preço é:

```text
product_catalog homologado → condição → case_service → exceção aprovada → Blueprint → Canva
```

Canva apresenta proposta; não define preço final. O valor de R$ 9.600 permanece referência interna enquanto não houver homologação rastreável e condição/parcelamento aprovados.

### Prompt — ANA-C-01

```text
[ID ANA-C-01] CONSOLIDAR CASE SERVICE, CONDIÇÃO COMERCIAL E CRITÉRIOS DE ACEITE DA ANA, SEM EFEITO EXTERNO.

NÃO CRIAR SKU NOVO, COBRANÇA, LINK ASAAS, PARCELA, CHECKOUT, CONTRATO, OS, ANEXO, ASSINATURA OU COMUNICAÇÃO.

A. PRODUCT CATALOG
- Localizar PROD-DIAG-FAM-MULTI e preservar histórico.
- Para considerar preço elegível, exigir homologado_por, homologado_em, vigencia_inicio e vigencia_fim ou regra de vigência ativa.
- Se faltar qualquer rastro, marcar preço como não homologado para uso contratual/financeiro.
- Não usar preço da proposta, planejador, WhatsApp ou texto manual como fonte final.

B. CONDIÇÃO COMERCIAL
- Criar/confirmar condição comercial homologada, separada de texto Canva.
- Modelar forma de pagamento, parcelas, vencimento e condição aplicável como campos estruturados e aprovados.
- Registrar divergência entre proposta, product_catalog, case_service e condição sem resolver automaticamente.
- R$ 9.600 permanece referência interna até decisão humana homologada.

C. CASE SERVICE
- Manter case_service em draft enquanto faltar referência contratual, condição homologada ou critérios de aceite.
- Cada um dos 10 critérios deve registrar: estado, decisão humana, responsável, data, justificativa e evidência interna quando aplicável.
- Não promover a approved/contracted com critério pendente.

D. PLANO INICIAL
Substituir planoInicialOk por critérios persistidos:
1. responsável principal;
2. case_service consolidado;
3. próxima ação datada;
4. checklist aplicável criado;
5. primeira entrega planejada somente quando onboarding estiver liberado.

E. TESTES
1. Produto sem homologador/data/vigência bloqueia condição comercial.
2. Divergência de valor cria bloqueio, não ajuste automático.
3. Critério pendente impede promoção do case_service.
4. Plano vazio não satisfaz planoInicialOk.
5. Nenhum campo de preço pode ser gravado livremente por oportunidade/caso.

F. ENTREGA
Mostrar fonte de preço, condição, divergências, 10 critérios, estado do case_service, plano inicial e nenhuma ação externa.
```

### Gate C

- [ ] Produto e condição comercial possuem homologação rastreável.
- [ ] Parcelamento e vencimento estão estruturados e aprovados.
- [ ] Os 10 critérios de aceite foram decididos ou mantêm bloqueio explícito.
- [ ] `case_service` pode ser consolidado sem preço livre ou conflito oculto.

---

## 9. Corte E — Matriz jurídica e decisão humana

### Decisão

A matriz jurídica é mecanismo de decisão e gate, não gerador de cláusulas. Não inserir texto-base, copiar cláusulas de site ou produzir contrato final enquanto temas bloqueantes não estiverem aprovados por revisão jurídica humana.

### Prompt — ANA-E-01

```text
[ID ANA-E-01] CONSOLIDAR MATRIZ JURÍDICA E PAINEL DE DECISÃO HUMANA DA ANA.

NÃO REDIGIR CLÁUSULA JURÍDICA FINAL.
NÃO GERAR CONTRATO, OS, ANEXO, ASSINATURA, COBRANÇA, LINK OU COMUNICAÇÃO.
NÃO APAGAR HISTÓRICO; deduplicar com trilha de substituição e auditoria.

A. DEDUPLICAÇÃO
- Identificar as 36 linhas para 12 temas.
- Manter uma linha canônica por organização + tema.
- Arquivar/substituir logicamente linhas duplicadas, preservando motivo, origem, data e referência.
- Não usar exclusão física.

B. TEMAS E ESTADO
Para cada um dos 12 temas, registrar:
- tema;
- status: pendente_revisao_juridica, aprovado, rejeitado, substituir, nao_aplicavel;
- bloqueia_assinatura;
- impacto_templates;
- versao_juridica_aplicavel;
- justificativa;
- responsável pela decisão;
- data da decisão;
- referência de evidência/versão.

C. PAINEL CONTEXTUAL
Criar ou concluir componente matriz-juridica-preparacao.tsx e exibir dentro de:
- Validação Jurídica;
- Casos → Formalização → Preparar contrato.

O painel deve mostrar:
- 12 temas;
- quais bloqueiam assinatura;
- status e decisão;
- versão jurídica;
- justificativa;
- responsável/data;
- impacto nos templates;
- bloqueios ativos.

D. SERVER FUNCTION DE LEITURA
Criar/concluir função de leitura agregada para instrumentos que leia matriz, dependentes, checklist cadastral, case_service, critérios e conferência Canva.
A função deve retornar diagnóstico e bloqueios; não pode gerar cláusula, contrato ou qualquer artefato externo.

E. TESTES
1. Um tema por organização permanece canônico.
2. Duplicata é arquivada/substituída sem exclusão física.
3. Tema bloqueante pendente impede assinatura.
4. Tema aprovado com versão jurídica vigente permite apenas a preparação interna correspondente.
5. Tentativa de gerar cláusula sem tema/versão aprovada é negada.

F. ENTREGA
Mostrar temas canônicos, duplicatas preservadas, painel, função de leitura, bloqueios e confirmação de nenhuma ação externa.
```

### Gate E

- [ ] Uma linha canônica por tema/organização.
- [ ] Temas bloqueantes têm decisão jurídica humana registrada antes de assinatura.
- [ ] Painel mostra a matriz em Formalização/Validação Jurídica.
- [ ] Nenhuma cláusula é criada automaticamente.

---

## 10. Corte D — Preparação interna de instrumentos

### Decisão

Corte D só pode começar após os gates A, B, C e E. Ele produz diagnóstico, checklist e prévia interna de campos, nunca contrato final ou texto jurídico não aprovado.

### Prompt — ANA-D-01

```text
[ID ANA-D-01] IMPLEMENTAR PREPARAÇÃO INTERNA DE INSTRUMENTOS DA ANA APÓS GATES A, B, C E E.

PRÉ-CONDIÇÃO: executar somente se a função de leitura confirmar que não há bloqueio crítico de proposta, cadastro, case_service, condição comercial, critérios de aceite, dependentes ou matriz jurídica.

NÃO CRIAR CONTRATO, OS, ANEXO, CLÁUSULA JURÍDICA, ASSINATURA, COBRANÇA, LINK, PASTA, DOCUMENTO EXTERNO, MENSAGEM OU PUBLICAÇÃO.

CRIAR:
1. src/lib/instrumentos-preparacao.ts
- Regra pura que consolida:
  - proposta Canva completa e válida;
  - cadastro por pessoa;
  - núcleo familiar;
  - dependentes e representação;
  - case_service consolidado;
  - condição comercial homologada;
  - critérios de aceite decididos;
  - matriz jurídica e temas bloqueantes;
  - despesas de terceiros quando aplicáveis.
- Retornar status: pronto_para_previa_interna, bloqueado, requer_revisao.
- Retornar códigos de bloqueio, campos faltantes, conflitos, anexos condicionais e próxima ação recomendada.

2. src/lib/instrumentos-preparacao.functions.ts
- Server function somente de leitura.
- Agregar dados por IDs e respeitar RLS.
- Criar auditoria sanitizada de consulta/preparação.
- Não gerar arquivo, contrato, cláusula ou documento externo.

3. Painel Preparação de Instrumentos
Na rota /casos/:caseId/contrato/preparar, abaixo de PainelPreparacao:
- pré-requisitos A–E;
- status por requisito;
- campos completos/faltantes;
- conflitos;
- dependentes;
- condição comercial;
- matriz jurídica;
- anexos condicionais;
- bloqueios e próxima ação.

REGRAS:
- Se houver bloqueio, mostrar diagnóstico sem habilitar versão final, assinatura, financeiro ou onboarding.
- Preço só vem de product_catalog homologado ou exceção aprovada.
- Proposta Canva só fornece escopo/conteúdo extraído; não substitui condição comercial.
- Não gerar texto jurídico; apenas indicar versão jurídica aprovada aplicável.

TESTES:
1. Proposta inválida bloqueia.
2. Cadastro incompleto bloqueia.
3. Case service draft bloqueia.
4. Condição sem homologação bloqueia.
5. Critério de aceite pendente bloqueia.
6. Tema jurídico bloqueante pendente bloqueia.
7. Dependente participante sem representação bloqueia.
8. Todos os requisitos válidos retornam pronto_para_previa_interna, sem criar instrumento.

ENTREGA:
- arquivos criados;
- painel e função de leitura;
- testes;
- lista de bloqueios/estado da Ana;
- confirmação de nenhuma ação externa.
```

### Gate D

- [ ] A função retorna apenas prévia interna, nunca instrumento final.
- [ ] Todos os bloqueios aparecem com códigos e próxima ação.
- [ ] Versão final, assinatura, financeiro e onboarding permanecem bloqueados quando houver pendência.

---

## 11. Ações humanas fora do Lovable/Claude Code

Nenhum prompt pode resolver estas decisões sem informação ou aprovação humana:

1. Revalidar, renovar ou substituir a validade comercial da proposta Canva da Ana.
2. Completar e verificar dados cadastrais de Ana, Adair, Alice e contratada.
3. Decidir condição comercial, forma de pagamento, parcelas, vencimento e critérios de aceite com homologação rastreável.
4. Obter decisões jurídicas dos temas bloqueantes, incluindo assinatura, não garantia, escopo, dados, rescisão, foro, parcelamento e dependentes/representação.
5. Decidir se Felipe participará de contrato, App ou anexo; se sim, documentar representação legal.

---

## 12. Critério de conclusão A–E

A–E somente estão concluídos quando:

- [ ] ANA-SAVE-SEC-01B passou os testes e as validações manuais.
- [ ] Proposta Canva possui validade/decisão vigente, extração suficiente e sem lacuna crítica não resolvida.
- [ ] Cadastro e núcleo usam referências por ID, sem identidade paralela.
- [ ] Dependente e responsável legal possuem vínculo referencial verificável.
- [ ] Produto, condição e `case_service` são rastreáveis e sem preço livre.
- [ ] Dez critérios de aceite foram decididos.
- [ ] Matriz jurídica possui uma linha por tema e decisões humanas para bloqueantes.
- [ ] Preparação de instrumentos retorna prévia interna sem criar contrato.
- [ ] O caso continua NO_GO até assinatura e financeiro terem gates próprios satisfeitos.

---

## 13. Registro de decisões

| Data | Decisão | Resultado |
|---|---|---|
| 20/08/2026 | Manter Ana em NO_GO | Bloqueios de proposta, cadastro, condição, jurídico e representação permanecem ativos |
| 20/08/2026 | Pré-corte de persistência antes de A–E | Evita operar dados e gates sobre salvamento não comprovado |
| 20/08/2026 | Ordem A → B → C → E → D | D depende da consolidação dos quatro pré-requisitos anteriores |
| 20/08/2026 | D é preparação interna, não geração contratual | Sem cláusula, contrato, assinatura, cobrança ou documento externo |
| 20/08/2026 | Correções de integridade em Claude Code/GitHub | Lovable limitado à UI/fluxo visual após base segura |
