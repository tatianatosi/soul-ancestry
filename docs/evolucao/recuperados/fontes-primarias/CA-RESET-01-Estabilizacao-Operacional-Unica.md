# CA-RESET-01 — ESTABILIZAÇÃO OPERACIONAL ÚNICA

**Projeto:** Clube Ancestral
**Data:** 15/08/2026
**Responsável:** Tatiana Tosi
**Natureza:** Auditoria de decisão + plano de implementação fechado
**Fontes consultadas:** CA-EVO-02, CA-EVO-03, CA-EVO-04, CA-EVO-05A, sessão 6be3da76, Planilha Mestre de Produtos (Google Drive), MODELO - CONTRATO ESTUDO GENEALÓGICO (Google Drive), Configuração Asaas Ana Luiza (Google Drive), Contrato-Mãe Ana Luiza (Google Drive), notas de memória do projeto.

---

## 4.1 — VEREDITO EXECUTIVO

```text
ESTADO DE PRODUÇÃO: NAO_PRONTO

Não falta nova arquitetura; falta executar uma sequência curta de estabilização.
A fundação (modelos, fontes de verdade, fluxos, governança) está definida e documentada.
O que impede produção é a cadeia comercial-jurídica-financeira não reconciliada.

A publicação do app é um FLUXO INDEPENDENTE que pode avançar em paralelo,
sem depender de contrato, SKU, Asaas ou revisão jurídica.

BLOQUEADORES REAIS — CADEIA COMERCIAL-JURÍDICA-FINANCEIRA (6):

1. Aprovar operação transitória sem CRM OU eleger CRM oficial mínimo.
2. Criar e aprovar especificação comercial única para Áustria/§58c/PACOTE-AT-01 na Planilha Mestre.
3. Reconciliar representação de valor: R$ 9.600 total = 10×R$960 familiar = 3×R$320×10 operacional.
4. Compor Contrato + Anexo I/OS a partir do MODELO ESTUDO e submeter à revisão jurídica.
5. Coletar dados obrigatórios das partes: Ana, Alice (nome completo), Adair, Felipe (representação legal) e dados oficiais da contratada (CNPJ, razão social, endereço).
6. Definir gatilho de ativação financeira: contrato/OS assinado + SKU aprovado + Asaas refletindo exatamente a condição contratada.

FLUXO INDEPENDENTE — PUBLICAÇÃO DO APP (não bloqueia nem é bloqueado pela cadeia comercial):

- Eleger 1 app existente, congelar escopo, publicar com dados sanitizados.
- Não depende de contrato assinado, SKU aprovado, Asaas ativo ou revisão jurídica.
- Pode e deve avançar em paralelo.
- Publicar a experiência e a operação aprovadas ≠ assinar contrato, gerar cobrança ou prometer condição comercial.

NÃO BLOQUEIA PRODUÇÃO (lista fechada):

- App: protótipos existentes podem ser eleitos e publicados sem novo redesign; fluxo independente da cadeia comercial.
- Planejador: IDs duplicados e #ERROR! são corrigíveis cirurgicamente sem rearquitetura.
- Anexos II, IV: pendem verificação direta no Drive, mas não bloqueiam a composição do contrato (Anexo I + MODELO ESTUDO são suficientes para primeira versão).
- Integrações de CRM, webhooks, sincronizações Calendar/Tasks: backlog pós-produção.
- Dashboards, analytics, copy refinement: backlog pós-produção.
- Novas nacionalidades além de Áustria/§58c: backlog pós-produção.

DECISÕES TOMADAS (lista fechada):

1. MODELO ESTUDO GENEALÓGICO é o único contrato-base vigente. Modelo Simples = descontinuado. Modelo 2024 = referência histórica.
2. Planilha Mestre prevalece sobre preço, SKU, escopo e condição comercial.
3. Asaas é exclusivamente receptor financeiro — não define produto, preço ou elegibilidade.
4. Desk/Dossiê é a fonte de verdade para caso, evidências e histórico durante a operação transitória sem CRM.
5. Case_ID canônico de Ana Luiza: CA-CID-AT-FAM-2026-001 (CA-AUT-ANALUIZA-FAM-2026-001 é alias histórico).
6. Aceite comercial de Ana Luiza confirmado em 14/08/2026; risco de expiração resolvido.
7. CRM Mestre e OPS/Pipeline classificados como NAO_VALIDADO_COMO_FONTE_OPERACIONAL; D09 = BLOQUEADO_POR_DECISAO_DE_GOVERNANCA.
8. Nenhum sistema externo foi alterado em CA-EVO-02 a CA-EVO-05A.

DECISÕES HUMANAS NECESSÁRIAS:

| # | Decisão | Decisor | Prazo sugerido | Impacto se não decidir |
|---|---------|---------|----------------|----------------------|
| D1 | Eleger e publicar app oficial (fluxo independente) | Tatiana | 3 dias úteis | Sem app publicado, não há entrega cliente visível — mas não bloqueia a cadeia comercial |
| D2 | Aprovar operação transitória sem CRM (formalizar) | Tatiana | 3 dias úteis | Sem decisão, dados ficam espalhados sem fonte canônica |
| D3 | Aprovar especificação comercial do PACOTE-AT-01 (nome, escopo, preço R$9.600, parcelamento, regra Asaas) | Tatiana | 5 dias úteis | Sem SKU comercial, contrato e Asaas não podem ser compostos |
| D4 | Revisão jurídica do Contrato + Anexo I/OS composto | Advogado | 10 dias úteis após composição | Sem revisão jurídica, não há segurança para assinatura e cobrança |
| D5 | Confirmar nome completo de Alice Gomes Silveira | Tatiana/Ana Luiza | 5 dias úteis | Sem nome completo, contrato não pode ser preenchido |
| D6 | Documentar representação legal de Felipe (se menor) | Tatiana/Ana Luiza | 5 dias úteis | Sem representação documentada, Felipe não pode figurar no contrato |
| D7 | Confirmar dados oficiais da contratada (CNPJ, razão social, endereço) | Tatiana | 3 dias úteis | Sem dados oficiais, contrato não pode ser emitido |

PRIMEIRA ENTREGA DE PRODUÇÃO:

Duas trilhas paralelas:

Trilha A — Publicação do app (fluxo independente):
App eleito, escopo congelado e publicado com conteúdo sanitizado. Pode avançar imediatamente.

Trilha B — Cadeia comercial-jurídica-financeira:
Contrato + Anexo I/OS compostos, revisados juridicamente e assinados para o caso CA-CID-AT-FAM-2026-001, com SKU comercial austríaco aprovado na Planilha Mestre e Asaas configurado refletindo exatamente a condição contratada (3 assinaturas de R$320/mês × 10 meses, primeiro vencimento 01/10/2026).

DATA ESTIMADA DE PRONTIDÃO:
- Trilha A (publicação do app): 3 dias úteis (decisão + publicação)
- Trilha B (primeira cobrança ativa): 25-30 dias úteis
  - Trabalho interno de consolidação: 10 dias úteis
  - Dependência de resposta da cliente (dados de Alice, Felipe): 5 dias úteis
  - Dependência do advogado (revisão jurídica): 10 dias úteis
  - Dependência de decisão da gestora (D2, D3): 5 dias úteis
- Cenário completo (operação escalável): 45-60 dias úteis
- Premissas: disponibilidade de Tatiana para decisões em 3 dias úteis; advogado disponível em 5 dias úteis após recebimento; Ana Luiza responde em 3 dias úteis.
```

---

## 3 — DECISÕES FORÇADAS POR TEMA

### 3.1 App — FLUXO INDEPENDENTE

- **Classificação:** Fluxo independente. Publicar a experiência e a operação aprovadas ≠ assinar contrato, gerar cobrança ou prometer condição comercial.
- **Sistema oficial:** Nenhum eleito ainda. Candidato-base: App Lovable existente (mobile-first, protótipo funcional).
- **Quais funcionalidades já funcionam de forma verificável:** O protótipo Lovable está ativo e acessível, com cards de jornada, status e entrega visível. Não há verificação de dados vivos do caso.
- **Defeitos que são bloqueadores técnicos reais:** Nenhum defeito técnico impede a eleição. O bloqueio é decisório, não técnico.
- **O que deve ser congelado para evitar novo redesign:** Escopo de telas, fluxo de navegação e tipos de card. Proibido redesenhar até a primeira publicação estar ativa.
- **Dados que podem entrar sem risco:** Apenas conteúdo aprovado e sanitizado — status genérico de etapa, marcos de progresso, mensagens de acompanhamento. Nunca CPF, RG, documentos integrais, dados sensíveis familiares, cobrança ou detalhes de contrato.
- **Dependência da cadeia comercial:** Nenhuma. A publicação do app não depende de contrato assinado, SKU aprovado, Asaas ativo ou revisão jurídica. Pode e deve avançar em paralelo.
- **Dependência do app pela cadeia comercial:** Nenhuma. A cadeia comercial não depende do app publicado para avançar.

### 3.2 CRM

- **Decisão provisória de produção:** Operação transitória SEM CRM. CRM Mestre e OPS/Pipeline classificados como NAO_VALIDADO_COMO_FONTE_OPERACIONAL.
- **Operação transitória oficial sem CRM:** Desk/Dossiê como fonte canônica de caso e evidências; Planilha Mestre para SKU/preço/escopo; Canva para proposta aceita; Asaas apenas para pagamento; Planejador para cronograma (após correção cirúrgica).
- **Campos mínimos obrigatórios para operação:** Nome completo, CPF, RG, profissão, estado civil, endereço completo, email, telefone/WhatsApp, canal de comunicação formal autorizado. Metadados por campo: fonte de verdade, evidência disponível, status, classificação LGPD, se bloqueia contrato, se bloqueia Asaas.
- **Data e critério para decisão definitiva de CRM:** Após Sprint 4. Critério: 2+ casos ativos em operação transitória sem CRM permitindo avaliar se o volume justifica investimento em CRM.

### 3.3 Planejador

- **Função única do Planejador:** Cronograma, marcos, responsáveis e etapas por caso. Nunca fonte-mãe de produto, preço ou cobrança.
- **Erros que são bloqueadores:** IDs duplicados e #ERROR! no resumo. Corrigíveis cirurgicamente, não exigem rearquitetura.
- **O que é apenas limpeza de backlog:** Padronização de formatação, revisão de fórmulas secundárias.
- **Procedimento universal de entrada de um novo caso:** Case_ID atribuído no Desk → inserção no Planejador com ID canônico → marcos e responsáveis definidos → cronograma gerado.

### 3.4 Catálogo e SKU

- **Relação obrigatória:** SKU operacional do Planejador → SKU comercial da Planilha Mestre → produto/assinatura Asaas. O fluxo é unidirecional: Planejador identifica → Planilha Mestre valida comercialmente → Asaas reflete financeiramente.
- **PACOTE-AT-01:** NÃO tem correspondência comercial válida. Existe apenas no Planejador (tab PARAMETROS) como SKU_DE_REFERENCIA_OPERACIONAL. Não existe na Planilha Mestre.
- **Especificação única a ser aprovada:** Ficha de Decisão de SKU (seção 4.3 abaixo) com código, nome, escopo, preço, parcelamento e regra Asaas.
- **Quem aprova:** Nome, escopo, preço, parcelamento e regra Asaas → Tatiana Tosi.

### 3.5 Jurídico

- **Conjunto mínimo obrigatório antes de contratar e cobrar:** MODELO ESTUDO GENEALÓGICO (contrato-base) + Anexo I (Ordem de Serviço) com escopo, preço e responsável preenchidos. Contrato e OS devem estar compostos e revisados juridicamente.
- **Temas que exigem advogado:** Assinatura eletrônica e validade jurídica de logs; foro; composição contratual para múltiplos signatários familiares; prevalência da OS sobre o contrato; cancelamento/rescisão; procurações; formas de pagamento.
- **Pacote documental universal por caso:** Contrato (MODELO ESTUDO) + Anexo I (OS).
- **Anexos condicionais (não exigir por padrão):** Anexo II (Controle de Despesas Externas) — somente se houver despesas externas; Anexo III (Autorização de Pesquisa) — somente quando houver pesquisa externa autorizada; Anexo IV (Procuração) — somente se necessário representante legal; Anexo V (Alteração de Escopo) — somente se houver alteração pós-assinatura.

### 3.6 Financeiro

- **Condição única que sai de contrato/OS e entra no Asaas:** Contrato + Anexo I/OS assinados por todas as partes + SKU comercial aprovado na Planilha Mestre + representação de valor reconciliada (R$ 9.600 = 10×R$960 = 3×R$320×10).
- **Como traduzir pacote familiar sem divergência:** Contrato e OS registram o valor familiar total (R$ 9.600 em 10×R$960). Asaas opera com 3 assinaturas de R$ 320/mês × 10 meses. A OS deve explicitar que o valor familiar total corresponde à soma das 3 assinaturas individuais.
- **O que constitui ativação financeira válida:** (a) Contrato assinado; (b) SKU criado na Planilha Mestre; (c) 3 assinaturas criadas no Asaas com nextDueDate correto; (d) IDs das assinaturas arquivados no Desk/Dossiê; (e) Link de pagamento enviado ao cliente somente após (a)-(d).

### 3.7 Dados e documentos

- **Onde vive cada fato:**
  - Cliente (cadastro): Desk/Dossiê
  - Caso (evidências, histórico, decisões): Desk/Dossiê
  - Proposta (versão aceita): Canva
  - Escopo contratado: Contrato + Anexo I/OS (Drive)
  - Contrato (relação jurídica): Drive (MODELO ESTUDO preenchido)
  - Cobrança (pagamento, assinatura): Asaas
  - Cronograma (marcos, etapas): Planejador
  - Documento (armazenamento): Drive
  - Evidência (comprovação): Desk/Dossiê
- **Fontes oficiais:** Desk/Dossiê, Planilha Mestre, Asaas, Drive, Canva, MODELO ESTUDO.
- **Fontes que são histórico/backup apenas:** Dropbox, CRM Pipeline (DADOS TESTE), versões arquivadas/inativas da Planilha Mestre.

---

## CLASSIFICAÇÃO CA-RESET (A-E)

| Categoria | Descrição | Itens
|-----------|-----------|------|
| **A — BLOQUEADOR_DE_PRODUCAO** | Impede a cadeia comercial-jurídica-financeira de funcionar com segurança | 1. CRM não validado (operação transitória não formalizada); 2. SKU austríaco inexistente na Planilha Mestre; 3. Divergência de representação de valor (R$9.600); 4. Contrato/OS não composto; 5. Revisão jurídica pendente; 6. Gatilho de ativação financeira não definido |
| **FLUXO_INDEPENDENTE** | Pode avançar em paralelo; não bloqueia nem é bloqueado pela cadeia comercial | Publicação do app: eleger, congelar escopo, publicar com dados sanitizados. Publicar a experiência e a operação aprovadas ≠ assinar contrato, gerar cobrança ou prometer condição comercial |
| **B — NECESSARIO_PARA_GO_LIVE_DO_CASO** | Impede especificamente o caso Ana Luiza | Dados cadastrais de Ana/Adair; Nome completo de Alice; Representação legal de Felipe; Dados oficiais da contratada; Assinatura do contrato |
| **C — NECESSARIO_PARA_ESCALA** | Precisa existir antes de multiplicar clientes | Decisão definitiva de CRM; Logs de auditoria; Rotina de status; Schema mínimo de CRM; Correção estrutural do Planejador |
| **D — BACKLOG_POS_PRODUCAO** | Melhoria, automação, integração, dashboard | Integrações CRM/Asaas/Calendar/Tasks; Dashboards; Micro-entregas no app; Novas nacionalidades; Redesign; Analytics |
| **E — HISTORICO_OU_DESCARTADO** | Não usar para decidir produção | Modelo Simples (descontinuado); Modelo 2024 (referência histórica); CRM Pipeline DADOS TESTE; Protótipos de app não eleitos; Versões arquivadas da Planilha Mestre |

---

## 4.2 — ARQUITETURA ÚNICA DE PRODUÇÃO

| Camada | Sistema oficial | Finalidade | Fonte de verdade para | Entrada | Saída | Não pode definir | Estado | Bloqueia produção? | Dono | Próxima ação |
|--------|----------------|-----------|----------------------|---------|-------|------------------|--------|-------------------|------|-------------|
| **App** | App Lovable existente (a eleger) | Jornada do cliente, entrega visível, acompanhamento | Conteúdo aprovado e sanitizado para o cliente | Dados aprovados do Desk/Dossiê | Visualização do cliente | Preço, SKU, condição comercial, elegibilidade | Protótipo existe, nenhum eleito como oficial | NÃO (fluxo independente) | Tatiana | Eleger 1 app, congelar escopo, publicar com dados não-sensíveis — pode avançar em paralelo |
| **CRM** | Nenhum validado (operação transitória sem CRM) | Entrada de lead, status comercial, aceite, handoff | Nada (temporariamente) | — | — | Nada até ser validado | BLOQUEADO_POR_DECISAO_DE_GOVERNANCA | NÃO (operação transitória sem CRM é viável) | Tatiana | Formalizar decisão de operação transitória; usar Desk/Dossiê como fonte temporária |
| **Dossiê/Desk** | Desk Intelligence / Dossiê Consolidado | Caso, evidências, documentos, pendências, decisões, histórico | Fatos do caso, evidência escrita de aceite, histórico | Dados cadastrais, documentos, decisões | Evidência organizada por caso | Preço, SKU, cobrança | ATIVO como fonte temporária de caso | NÃO | Tatiana | Manter como fonte canônica de caso durante operação transitória |
| **Drive** | Google Drive | Documentos operacionais, contratos, anexos, pastas do caso | Armazenamento documental | Documentos gerados | Acesso a documentos | Status comercial, cobrança | ATIVO; pasta Ana Luiza criada mas não validada | NÃO | Tatiana | Validar pasta 02_Ana Luiza e Filho como pasta operacional do caso |
| **Planejador** | Planejador Universal (Google Sheets) | Cronograma, marcos, responsáveis, etapas por caso | Cronologia do caso | Dados do caso e escopo | Cronograma e marcos | Preço, SKU, condição comercial, cobrança | Estruturalmente aproveitável; IDs duplicados e #ERROR! no resumo | NÃO (corrigível cirurgicamente) | Tatiana | Corrigir IDs duplicados e #ERROR! antes de uso em dados vivos |
| **Planilha Mestre** | CA · FIN · Planilha Mestre de Produtos OFICIAL | Catálogo, SKU, preço, escopo, condição, status, link Asaas | SKU comercial, preço, escopo, condição comercial | Decisões comerciais aprovadas | Catálogo reconciliado | Dados do caso, cronograma, cobrança ativa | ATIVO; 40+ SKUs italianos/memória; nenhum SKU austríaco | SIM (bloqueador D3) | Tatiana | Criar e aprovar SKU comercial para Áustria/§58c |
| **Asaas** | Asaas | Cobrança, pagamento, assinatura, conciliação financeira | Pagamento efetivamente conciliado | Contrato assinado + SKU aprovado | Cobrança ativa e conciliada | Produto, preço, escopo, elegibilidade | Configurado (documentado), não ativado | SIM (bloqueador D7) | Tatiana | Ativar após contrato assinado e SKU aprovado |
| **Canva** | Canva (proposta DAHSB6nbt_M) | Proposta-mestre e aceite comercial visual | Versão-mestre da proposta aceita | Dados da proposta | Proposta visual aceita | Preço canônico (fonte é Planilha Mestre), contrato | ATIVO; proposta Ana Luiza aceita em 14/08 | NÃO | Tatiana | Preservar como evidência de aceite; usar como insumo para OS |
| **Dropbox** | Dropbox | Backup e histórico apenas | Nada operacional | — | — | Nada | ATIVO como backup | NÃO | Tatiana | Manter como backup; não usar como fonte operacional |
| **Contrato/OS/Anexos** | MODELO ESTUDO GENEALÓGICO + Anexos I-V | Contrato, Ordem de Serviço, autorizações | Relação jurídica, escopo contratado, obrigações | Dados das partes + escopo + preço | Contrato assinado | Preço canônico, SKU (fonte é Planilha Mestre) | MODELO ativo; Contrato-Mãe Ana Luiza = placeholder 55 bytes | SIM (bloqueador D5) | Tatiana + Advogado | Compor contrato a partir do MODELO ESTUDO; submeter à revisão jurídica |
| **Logs/Automações** | Especificados (CA-EVO-04), não ativados | Auditoria, rastreabilidade, sincronização | Nada (não ativados) | — | — | Nada até ativação | DOCUMENTADO_SEM_IMPLEMENTACAO | NÃO | Tatiana | Backlog pós-produção |
| **Tarefas/Calendário** | Google Tasks / Google Calendar | Lembretes, marcos, prazos | Nada operacional (temporário) | — | — | Nada | Não integrados | NÃO | Tatiana | Backlog pós-produção |

---

## 4.3 — MATRIZ UNIVERSAL DE PRODUTO

### Matriz principal

| Linha operacional | SKU operacional | SKU comercial | Produto comercial | Escopo padrão | Preço | Parcelamento | Regra Asaas | Contrato/OS | Estado | Lacuna | Decisor | Ação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cidadania Italiana — Consultoria | CA-CID-001 | CA-CID-001 | Consultoria de Cidadania Italiana | Análise de caso + plano de ação (1h) | R$ 260 | À vista | Link Asaas ativo | MODELO ESTUDO + Anexo I | ATIVO | — | — | — |
| Cidadania Italiana — Pasta | CA-CID-002 | CA-CID-002 | Montagem Completa de Pasta | Zero a pasta pronta para consulado | R$ 990 | 12× R$133 | Link Asaas ativo | MODELO ESTUDO + Anexo I | ATIVO | — | — | — |
| Cidadania Italiana — Assessoria | CA-CID-023 | CA-CID-023 | Assessoria Completa de Cidadania | Processo ponta a ponta | R$ 4.500 | Até 12× | Link Asaas ativo | MODELO ESTUDO + Anexo I | ATIVO | — | — | — |
| Estudo Genealógico | CA-HIST-001 | CA-HIST-001 | Estudo Genealógico Aprofundado | Levantamento de linhagem + documentos + parecer | R$ 4.500 | 12× R$524 | Link Asaas ativo | MODELO ESTUDO + Anexo I | ATIVO | — | — | — |
| **Cidadania Austríaca §58c** | **PACOTE-AT-01** | **INEXISTENTE** | **A definir** | **Processo §58c familiar (3 adultos)** | **R$ 9.600** | **10× R$960 ou 3× R$320×10** | **A criar após aprovação** | **MODELO ESTUDO + Anexo I** | **SKU_COMERCIAL_PENDENTE_DE_CADASTRO_E_RECONCILIACAO** | **SKU comercial não existe na Planilha Mestre; divergência de representação de valor** | **Tatiana** | **Aprovar ficha de decisão abaixo e criar SKU na Planilha Mestre** |

### FICHA DE DECISÃO DE SKU — PACOTE-AT-01

```text
CÓDIGO PROPOSTO: CA-CID-AT-001 (ou manter PACOTE-AT-01 como alias operacional)

NOME COMERCIAL: Pacote Cidadania Austríaca §58c — Família

LINHA/NACIONALIDADE: Cidadania Austríaca / §58c StbG

PÚBLICO/PARTICIPANTES: Família de 3 adultos (Ana Luiza, Adair, Alice) + 1 menor (Felipe)
- Condição: pacote familiar; cada adulto recebe processo individual integrado

ESCOPO INCLUÍDO (PROPOSTO PARA APROVAÇÃO — validar contra proposta Canva aceita e OS):
- Análise de elegibilidade §58c StbG
- Pesquisa genealógica de linha austríaca
- Coleta e organização documental
- Traduções juramentadas necessárias
- Apostilamento
- Protocolo junto à autoridade austríaca competente
- Acompanhamento até reconhecimento

NOTA: O escopo acima é uma proposta baseada na proposta Canva aceita e na configuração Asaas documentada. Deve ser validado contra a proposta aceita e a OS antes de ser considerado definitivo.

EXCLUSÕES:
- Despesas externas (embaixada, cartórios, traduções adicionais além do escopo)
- Passaporte e registro pós-reconhecimento
- Pesquisa de linha não-austríaca

ENTREGAS:
- Relatório de elegibilidade
- Pasta documental completa por adulto
- Protocolo submetido
- Acompanhamento de status

PREÇO TOTAL: R$ 9.600,00

PARCELAMENTO: 10 mensalidades de R$ 960,00 (visão familiar)
- Primeiro vencimento: 01/10/2026

MODELAGEM ASAAS: 3 assinaturas mensais de R$ 320,00 × 10 meses
- Assinatura 1: Ana Luiza — R$ 320 × 10
- Assinatura 2: Adair — R$ 320 × 10
- Assinatura 3: Alice — R$ 320 × 10
- Total: R$ 9.600,00
- Primeiro vencimento: 01/10/2026
- Encerramento automático após 10ª cobrança
- Não enviar link de pagamento até contrato assinado

CRITÉRIO DE ACEITE: Contrato assinado pelos 3 adultos + SKU criado na Planilha Mestre + Asaas configurado

CONDIÇÃO DE USO: Exclusivo para casos §58c austríaco; não aplicar a outras nacionalidades sem aprovação específica

RESPONSÁVEL PELA APROVAÇÃO: Tatiana Tosi

SISTEMAS QUE RECEBERÃO A CRIAÇÃO QUANDO APROVADA:
1. Planilha Mestre (Catalogo Produtos) — novo SKU
2. Asaas — 3 assinaturas conforme modelagem acima
3. Contrato/OS — referência ao SKU e condição
4. Desk/Dossiê — registro do SKU no caso
5. Planejador — atualização do PACOTE-AT-01 para SKU comercial validado
```

---

## 4.4 — PACOTE UNIVERSAL DE CASO

Sequência única reutilizável para qualquer cliente:

| # | Passo | Entrada | Saída | Fonte de verdade | Bloqueador | Responsável | Evidência | Ação externa | Exige confirmação? |
|---|-------|---------|-------|------------------|-----------|-------------|-----------|--------------|-------------------|
| 1 | Discovery e aceite | Lead/contato inicial | Necessidade identificada + aceite de prosseguir | Canva (proposta) ou WhatsApp | Nenhum | Tatiana | Registro no Desk/Dossiê | Nenhuma | Sim (aceite do cliente) |
| 2 | Case_ID e responsável | Cliente aceitou prosseguir | Case_ID atribuído + responsável definido | Desk/Dossiê | Nenhum | Tatiana | Registro no Desk | Nenhuma | Não |
| 3 | Dados cadastrais e familiares | Formulário ou entrevista | Cadastro completo: nome, CPF, RG, profissão, estado civil, endereço, email, telefone + dados familiares | Desk/Dossiê | Dados faltantes | Tatiana + Cliente | Ficha cadastral no Dossiê | Nenhuma | Sim (dados do cliente) |
| 4 | SKU e condição comercial validados | Necessidade + catálogo | SKU comercial selecionado + preço + parcelamento + regra Asaas | Planilha Mestre | SKU inexistente no catálogo | Tatiana | Registro na Planilha Mestre | Criar SKU se inexistente (requer aprovação) | Sim (se criar novo SKU) |
| 5 | Contrato + Anexo I | Dados das partes + SKU + escopo | Contrato composto + OS | MODELO ESTUDO + Anexo I | Dados faltantes; SKU não aprovado | Tatiana | Documento no Drive | Nenhuma | Não |
| 6 | Assinatura | Contrato composto + revisado | Contrato assinado por todas as partes | Drive | Revisão jurídica pendente | Advogado + Tatiana + Cliente | Contrato assinado no Drive | Assinatura eletrônica (a definir juridicamente) | Sim (assinatura de todas as partes) |
| 7 | Asaas | Contrato assinado + SKU aprovado | Assinaturas/cobranças criadas no Asaas | Asaas | Contrato não assinado; SKU não aprovado | Tatiana | IDs das assinaturas no Desk | Criação manual no painel Asaas | Sim (envio de link após configuração) |
| 8 | Dossiê/Drive/Planejador | Contrato assinado + Asaas ativo | Pasta do caso organizada + cronograma + marcos | Drive + Desk/Dossiê + Planejador | Passo 7 não concluído | Tatiana | Estrutura no Drive + Planejador | Nenhuma | Não |
| 9 | Pesquisa e autorizações condicionais | Dossiê pronto + pagamento iniciado | Pesquisa autorizada + autorizações assinadas se aplicável | Anexo III (Autorização de Pesquisa) | Passo 8 não concluído; Anexo III não classificado para o caso | Tatiana | Autorização no Drive | Nenhuma (se Anexo III já existir) | Sim (autorização do cliente) |
| 10 | App e acompanhamento | Dados aprovados + escopo sanitizado | Cliente tem acesso ao app com acompanhamento | App (conteúdo aprovado) | App não eleito; dados não sanitizados | Tatiana | Acesso do cliente ao app | Publicação do app | Sim (autorização do cliente para acesso) |

---

## 4.5 — PLANO DE RECUPERAÇÃO EM SPRINTS

### Tabela-resumo

| Sprint | Objetivo | Entregas verificáveis | Dependências | Responsável | Estimativa interna | Dependência externa | Critério de aceite |
|--------|----------|----------------------|--------------|-------------|-------------------|-------------------|-------------------|
| 1 | Decisões fundacionais fechadas | Operação sem CRM formalizada; Ficha de SKU aprovada | Nenhuma | Tatiana | 2 dias úteis | Nenhuma | 2 decisões documentadas e assinadas |
| 2 | Jurídico e comercial | SKU criado na Planilha; Dados das partes coletados; Contrato composto e enviado à revisão jurídica | Sprint 1 | Tatiana + Advogado + Ana Luiza | 5 dias úteis | Advogado: 10 dias úteis; Ana Luiza: 3 dias úteis | Contrato no Drive com campos preenchidos + envio ao advogado confirmado |
| 3 | Financeiro e operacional | Contrato assinado; Asaas ativado; Dossiê/Drive/Planejador prontos | Sprint 2 (revisão jurídica concluída) | Tatiana + Cliente | 4-6 dias úteis | Cliente assina em 3 dias úteis | 3 assinaturas Asaas ativas + pasta validada |
| 4 | Escala controlada | Rotina de status; Logs mínimos; Decisão de CRM definida; Backlog priorizado; Link de pagamento enviado | Sprint 3 | Tatiana | 3-5 dias úteis | Aproximação de setembro (link) | Rotina documentada + 1ª cobrança verificada em 01/10 |

### Trilha Paralela — Publicação do App (FLUXO INDEPENDENTE)

| Entrega | Dependência | Responsável | Estimativa | Critério de aceite |
|---------|-------------|-------------|------------|-------------------|
| App eleito e escopo congelado (sem redesign) | Nenhuma | Tatiana | 1 dia útil | Documento nomeando o app oficial + escopo congelado |
| Dados não-sensíveis aprovados para publicação | Nenhuma | Tatiana | 1 dia útil | Lista de conteúdo sanitizado aprovado |
| App publicado e acessível | Entregas acima | Tatiana | 1 dia útil | URL ativa com conteúdo sanitizado |

**Duração estimada:** 3 dias úteis. Não depende de nenhum sprint da cadeia comercial.

### Detalhamento

### Sprint 1 — Decisões fundacionais fechadas (cadeia comercial)

**Objetivo:** Fechar as 2 decisões que destravam toda a cadeia comercial-jurídica-financeira.

| # | Entrega verificável | Dependência | Responsável | Estimativa interna | Dependência externa | Critério de aceite |
|---|---------------------|-------------|-------------|---------------------|---------------------|-------------------|
| 1.1 | Decisão formal de operação transitória sem CRM (ou eleição de CRM mínimo) | D2 | Tatiana | 1 dia útil | Nenhuma | Registro no Desk formalizando a decisão e a fonte temporária (Desk/Dossiê) |
| 1.2 | Ficha de SKU austríaco aprovada (PACOTE-AT-01 → CA-CID-AT-001 ou manutenção do código) | Ficha acima aprovada | Tatiana | 2 dias úteis | Nenhuma | Ficha assinada/aprovada com nome, escopo, preço R$9.600, parcelamento e regra Asaas definidos |

**Duração estimada:** 2 dias úteis (se Tatiana disponível)

**Nota:** A publicação do app não faz parte deste sprint. É um fluxo independente que avança em paralelo (ver Trilha Paralela acima).

---

### Sprint 2 — Jurídico e comercial

**Objetivo:** Compor o contrato e coletar dados das partes para o caso Ana Luiza.

| # | Entrega verificável | Dependência | Responsável | Estimativa interna | Dependência externa | Critério de aceite |
|---|---------------------|-------------|-------------|---------------------|---------------------|-------------------|
| 2.1 | SKU austríaco criado na Planilha Mestre (Catalogo Produtos) | Sprint 1 concluído | Tatiana | 1 dia útil | Nenhuma | Nova linha na Planilha Mestre com SKU, preço, status Ativo |
| 2.2 | Dados cadastrais de Ana Luiza, Adair e Alice coletados (incl. nome completo de Alice) | Resposta de Ana Luiza | Tatiana + Ana Luiza | 2 dias úteis | Ana Luiza responde em 3 dias úteis | Ficha cadastral completa no Dossiê |
| 2.3 | Representação legal de Felipe documentada (se aplicável) | Resposta de Ana Luiza | Tatiana + Ana Luiza | 1 dia útil | Ana Luiza responde | Documento de representação no Dossiê |
| 2.4 | Dados oficiais da contratada confirmados (CNPJ, razão social, endereço, email oficial) | Nenhum | Tatiana | 1 dia útil | Nenhuma | Dados verificados contra documento oficial |
| 2.5 | Contrato + Anexo I/OS compostos a partir do MODELO ESTUDO | 2.1, 2.2, 2.3, 2.4 | Tatiana | 2 dias úteis | Nenhuma | Documento no Drive com todos os campos preenchidos |
| 2.6 | Contrato submetido à revisão jurídica | 2.5 | Advogado | 1 dia útil (envio) | Advogado revisa em 10 dias úteis | Confirmação de envio ao advogado |

**Duração estimada:** 5 dias úteis internos + 10 dias úteis de advogado (paralelizáveis parcialmente)

---

### Sprint 3 — Financeiro e operacional

**Objetivo:** Ativar Asaas e preparar a estrutura operacional do caso.

| # | Entrega verificável | Dependência | Responsável | Estimativa interna | Dependência externa | Critério de aceite |
|---|---------------------|-------------|-------------|---------------------|---------------------|-------------------|
| 3.1 | Contrato assinado por todas as partes | Revisão jurídica concluída (Sprint 2) | Tatiana + Cliente | 3 dias úteis | Cliente assina | Contrato assinado no Drive |
| 3.2 | 3 assinaturas criadas no Asaas (R$ 320 × 10, vencimento 01/10/2026) | 3.1 + SKU aprovado (Sprint 1) | Tatiana | 1 dia útil | Nenhuma | 3 IDs de assinatura ativos no Asaas; nextDueDate = 01/10/2026 |
| 3.3 | IDs das assinaturas Asaas arquivados no Desk/Dossiê | 3.2 | Tatiana | 1 dia útil | Nenhuma | Registro no Dossiê com os 3 IDs |
| 3.4 | Pasta do caso validada no Drive (02_Ana Luiza e Filho) | 3.1 | Tatiana | 1 dia útil | Nenhuma | Pasta com subpastas operacionais confirmada |
| 3.5 | Planejador corrigido (IDs duplicados e #ERROR! sanados) | Nenhum | Tatiana | 1 dia útil | Nenhuma | Planejador sem #ERROR! e com ID canônico CA-CID-AT-FAM-2026-001 |

**Duração estimada:** 4-6 dias úteis (após revisão jurídica)

**Nota:** A publicação do app já foi entregue na Trilha Paralela, independente deste sprint.

---

### Sprint 4 — Escala controlada

**Objetivo:** Preparar a operação para multiplicar clientes sem rearquitetura.

| # | Entrega verificável | Dependência | Responsável | Estimativa interna | Dependência externa | Critério de aceite |
|---|---------------------|-------------|-------------|---------------------|---------------------|-------------------|
| 4.1 | Rotina de status do caso definida (checklist semanal mínimo) | Sprint 3 | Tatiana | 1 dia útil | Nenhuma | Documento de rotina no Desk |
| 4.2 | Logs mínimos de auditoria definidos (o que registrar por caso) | Sprint 3 | Tatiana | 1 dia útil | Nenhuma | Lista de campos de auditoria por caso |
| 4.3 | Critério de decisão definitiva de CRM definido (quando e como avaliar) | Sprint 3 | Tatiana | 1 dia útil | Nenhuma | Documento com critério e prazo para decisão de CRM |
| 4.4 | Backlog pós-produção consolidado e priorizado | Sprint 3 | Tatiana | 1 dia útil | Nenhuma | Lista priorizada no Desk |
| 4.5 | Envio do link de pagamento Asaas ao cliente (em setembro, próximo a outubro) | 3.1 + 3.2 | Tatiana | 1 dia útil | Aproximação de setembro | Link enviado ao cliente após contrato assinado |
| 4.6 | Verificação da 1ª cobrança em 01/10/2026 | 4.5 | Tatiana | 1 dia útil | Data chegar a 01/10 | Confirmação das 3 cobranças geradas |

**Duração estimada:** 3-5 dias úteis

---

## 4.6 — BACKLOG CONGELADO

Itens que NÃO entram no caminho crítico de produção:

### Integrações e automações
- Integração CRM → Desk/Dossiê
- Sincronização Planilha Mestre → Proposta/OS/Asaas/App
- Webhook Lovable → CRM Mestre/Sheets
- Sincronização Asaas → CRM/Painel/Planejador/Desk
- Sincronização Desk → Planejador
- Sincronização OPS Tarefas → Google Tasks
- Sincronização Planejador → Google Calendar
- Formulário de diagnóstico → CRM
- Apps Script para Asaas (ativação)

### CRM
- Decisão definitiva de CRM (Mestre, OPS, novo, ou descontinuação formal)
- Saneamento e validação de CRM Mestre
- Saneamento e validação de OPS/Pipeline
- População de CRM com dados reais
- Definição de schema mínimo de CRM
- Teste de captura de leads

### App
- Redesign de app
- Novos MVPs
- Novas features no app
- Micro-entregas no app (cross-sell/up-sell por etapa)
- Dashboard no app

### Catálogo
- Catalogação ampla de fontes genealógicas
- Novas nacionalidades (Portugal, Espanha, Alemanha, Hungria, Croácia, etc.)
- Reconciliação de SKUs inativos/arquivados
- Novos bundles/combos
- Precificação incremental por micro-entrega

### Operacional
- Dashboards e analytics
- SLA/KPI e reconciliação mensal (CA-EVO-06)
- Governança de bases genealógicas (CA-EVO-07)
- Ativação por lotes (CA-EVO-08)
- Melhorias de copy, estética
- Sincronização de etiquetas WhatsApp
- Parametrização de lista de países por fonte canônica

### Documentos
- Recuperação/substituição do Anexo V (Termo de Alteração de Escopo)
- Verificação direta do Anexo II e Anexo IV no Drive
- Validação da pasta jurídica 01_Modelos-e-Jurídico
- Auditoria da criação antecipada das pastas da Ana Luiza

---

## 4.7 — ANA LUIZA — CASO-PILOTO

| Item | Estado | É global ou do caso? | Bloqueia o caso? | Próximo responsável | Próxima ação concreta |
|------|--------|----------------------|-----------------|--------------------|-----------------------|
| Dados cadastrais/familiares (Ana, Adair, Alice, Felipe) | Pendentes: cadastro completo de Ana e Adair; nome completo de Alice; representação legal de Felipe | Do caso | SIM | Tatiana + Ana Luiza | Coletar ficha cadastral completa de cada adulto; confirmar nome de Alice; documentar representação de Felipe |
| SKU comercial austríaco | INEXISTENTE na Planilha Mestre; PACOTE-AT-01 existe apenas no Planejador | Global | SIM | Tatiana | Aprovar ficha de SKU e criar na Planilha Mestre (Sprint 1→2) |
| Condição comercial reconciliada | R$ 9.600 = 10×R$960 (familiar) = 3×R$320×10 (Asaas) — divergência de representação pendente | Global | SIM | Tatiana | Definir representação canônica no contrato/OS |
| Contrato/OS e revisão jurídica | Contrato-Mãe = placeholder 55 bytes; precisa ser composto a partir do MODELO ESTUDO e revisado | Do caso + Global | SIM | Tatiana (compor) + Advogado (revisar) | Compor contrato após dados e SKU; submeter à revisão jurídica |
| Assinatura | Pendente | Do caso | SIM | Tatiana + Cliente | Assinatura eletrônica após revisão jurídica (método a definir juridicamente) |
| Asaas | Configurado (documentado), não ativado: 3× R$320/mês × 10, 1º venc. 01/10/2026 | Do caso | SIM (não ativado) | Tatiana | Criar 3 assinaturas após contrato assinado |
| Pesquisa/autorização | Anexo III existente globalmente; não classificado para o caso | Do caso | NÃO (condicional) | Tatiana | Classificar e aplicar Anexo III quando houver pesquisa externa autorizada |

---

## CRITÉRIO DE SUCESSO

O CA-RESET-01 é bem-sucedido quando:

1. As 7 decisões humanas (D1-D7) estão tomadas ou em execução.
2. O Sprint 1 está concluído (decisões fundacionais fechadas).
3. O Sprint 2 está em andamento (contrato sendo composto ou em revisão jurídica).
4. Não há novos prompts de auditoria fragmentada abertos.
5. A próxima ação de cada bloqueador tem responsável e prazo definidos.
6. O backlog congelado está registrado e não está sendo executado em paralelo.

---

## FONTES E EVIDÊNCIAS USADAS

| Fonte | Localização/ID | Como foi usada |
|-------|---------------|----------------|
| CA-EVO-02 (Mapa de Automações, Templates, Gatilhos e Sobreposições) | Sessão 6be3da76, linhas 58-820 | Extraído via subagente; automações, sobreposições, anexos, modelos contratuais |
| CA-EVO-03 (Motor Contratual Modular) | Sessão 6be3da76, linhas 593-820 | Extraído via subagente; MODELO ESTUDO como contrato-base, classificação de modelos |
| CA-EVO-04 (Dados Vivos e Integrações) | Sessão 6be3da76, linhas 820-1060 | Extraído via subagente; fontes oficiais, entidades, fluxos, ondas |
| CA-EVO-05A (Preparação Go-Live Ana Luiza) | Sessão 6be3da76, linhas 1060-1760 | Extraído via subagente; matrizes de prontidão, bloqueios, Gate A |
| CA-EVO-05B (Ativação Controlada) | Sessão 6be3da76, linhas 1760-3219 | Extraído via subagente; decisão de CRM, SKU, frustrações, próximos passos |
| Planilha Mestre de Produtos | Google Drive ID: 1zrLQlQzCBevPufddwiOeVEAex523G9xIaYQJ6XxBvdk | Leitura direta via gws; catálogo de SKUs, preços, links Asaas; confirmação de ausência de SKU austríaco |
| MODELO - CONTRATO ESTUDO GENEALÓGICO | Google Drive ID: 17TW-mdc8Mw_7XHzHTnJHYaWHCwlLlZQW6YpYhjfNn7E | Exportação direta via gws; cláusulas, obrigações, LGPD, preço, prazo |
| Configuração Asaas — Ana Luiza | Google Drive ID: 1RNZNhWYr0ZkITmtJT_6vliNPFEpWQGPmJIIlqNl6X-s | Exportação direta via gws; 3 assinaturas, R$ 320×10, nextDueDate 01/10/2026 |
| Contrato-Mãe Familiar — Ana Luiza | Google Drive ID: 1h_GqWpZ7KH1chlw43YGa51h0nnfyudgxZpNWvJCgQV8 | Confirmado como placeholder de 55 bytes via exportação |
| Dossiê Consolidado — Ana Luiza | Google Drive ID: 1oqPughlb244LKcOugj8tXqJvB9D8TBcz3UuYNtfM1Wk | Identificado no Drive; não reaberto para auditoria (não necessário para RESET) |
| Checklist §58c — Ana Luiza | Google Drive ID: 1XzWWjdmBMLfIGsb80zi3jjEs2ZxHnwAnFtgA1pIE8JU | Identificado no Drive; não reaberto para auditoria |
| Proposta Canva (Ana Luiza) | Canva design ID: DAHSB6nbt_M | Referenciada via CA-EVO-05A; R$ 9.600, 7 páginas, aceite 14/08/2026 |
| Anexos I-V (links do Drive) | IDs documentados em CA-EVO-02 (sessão 6be3da76, linhas 69-80) | Estados classificados via CA-EVO-02; não reabertos individualmente |
| Notas de memória do projeto | memory/notes/projects/citizenship_lineage_app/ | Lidas diretamente; governance status, timeline Ana Luiza, aceite familiar, auditoria Drive |
| Auditoria-Mãe | Referenciada em CA-EVO-02 e consolidações | Não reaberta diretamente; usada apenas via consolidações CA-EVO e memória |
| CA-10A1 | Referenciado em memória como pre-onboarding deduplicado de Ana Luiza | Não reaberto diretamente; usado apenas via consolidações CA-EVO e memória |

*Documento produzido em 15/08/2026. Não cria, edita, ativa, envia, cobra ou publica nenhum recurso externo. É exclusivamente um documento de decisão e planejamento.*
