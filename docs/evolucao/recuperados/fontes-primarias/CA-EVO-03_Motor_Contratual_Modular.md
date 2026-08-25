# CA-EVO-03 — MOTOR CONTRATUAL MODULAR

**Projeto:** Clube Ancestral  
**Data:** 15/08/2026  
**Responsável:** Tatiana Tosi / Perplexity Computer  
**Natureza:** Consolidação de governança, arquitetura documental e especificação de preenchimento.  
**Referência interna:** CA-EVO-02 (CONCLUÍDO_COM_REFINAMENTO_PENDENTE) → CA-EVO-03.  

---

## PREMISSAS E LIMITES

Este documento é uma especificação de motor contratual. Nenhum documento externo foi criado, editado, preenchido, assinado, movido, arquivado ou excluído em Google Drive, Dropbox, Canva, Asaas ou qualquer outro sistema.

**Evidências de partida utilizadas:**

| Evidência | Fonte | Status de verificação |
|---|---|---|
| CA-EVO-02 — Mapa de Automações, Templates, Gatilhos e Sobreposições | Sessão `fd4bada3` — arquivo `CA-EVO-02--Mapa-de-Automações-Templates-Gatilhos-e-Sobreposições.md` | Lido integralmente (261 linhas) |
| CA-EVO-02 — Devolutiva Padronizada | Sessão `fd4bada3` — arquivo `CA-EVO-02--Devolutiva-padronizada.txt` | Lido integralmente (105 linhas) |
| Modelo de Estudo Genealógico | Google Doc ID `17TW-mdc8Mw_7XHzHTnJHYaWHCwlLlZQW6YpYhjfNn7E` | Exportado como text/plain — 134 linhas, 5.773 bytes |
| Contrato-base genérico v2 | Google Doc ID `1AeaIkUMt93X99_FHw0T9O_Rgsko91hLe6b2Ruhz7uBI` | Exportado como text/plain — 61 linhas, 5.862 bytes |
| Anexo I — Ordem de Serviço | Google Doc ID `1sK6c8qBi1dwlxo0ZSwV9TdqRRB517LXDyU-Si0OnRiA` | Exportado como text/plain — 50 linhas, 1.210 bytes |
| Anexo III — Autorização Específica de Pesquisa | Google Doc ID `1nN1xpR6s3IFfLggz1jKEssVWJJRQRitA1hdPMpgN3ms` | Verificado no CA-EVO-02: template com campos parametrizáveis |
| Contrato-Mãe Familiar — Ana Luiza | Google Doc ID `1h_GqWpZ7KH1chlw43YGa51h0nnfyudgxZpNWvJCgQV8` | Exportado como text/plain — 1 linha, 55 bytes. Confirmado: placeholder não preenchido |
| CA-10A1 — Pré-Onboarding Deduplicado Ana Luiza | Referenciado no CA-EVO-02 | Dados do caso utilizados conforme CA-EVO-02 |
| Pasta `01_Modelos-e-Jurídico` | Shared Drive | CA-EVO-02 devolutiva corrigiu para IMPLEMENTADO_E_ATIVO: anexos genéricos localizados nesta pasta |
| Contrato-base genérico v2 (texto colado na sessão `6be3da76`) | Linhas 4914-4974 da conversa | Texto confere com a exportação do Google Doc |

---

## 1. DECLARAÇÃO EXECUTIVA DE DECISÃO CONTRATUAL

### 1.1. Decisão vinculante

**MODELO DE ESTUDO GENEALÓGICO = ÚNICO CONTRATO-BASE VIGENTE.**

O Modelo de Estudo Genealógico (Google Doc ID `17TW-mdc8Mw_7XHzHTnJHYaWHCwlLlZQW6YpYhjfNn7E`), aprovado pelo advogado, é a única matriz jurídica do motor contratual do Clube Ancestral. Todo contrato específico por cliente deve derivar exclusivamente deste modelo.

### 1.2. Tratamento dos modelos excluídos

| Modelo | Google Doc ID | Classificação | Uso permitido |
|---|---|---|---|
| **Modelo de Estudo Genealógico** | `17TW-mdc8Mw_7XHzHTnJHYaWHCwlLlZQW6YpYhjfNn7E` | CONTRATO_BASE_VIGENTE_APROVADO_PELO_ADVOGADO | Matriz jurídica única para derivação de contratos específicos |
| **Modelo Simples** — Contrato Pesquisa Genealógica Prática | `19Ce0rd4t8Qn9jktWTjzaVns2q6Fdbr1y45VoKJk9668` | REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL | Nenhum. Não usar como base, não preencher, não gerar novos documentos a partir deste modelo |
| **Modelo de Contrato 2024** | `1yr8qLy2myvciw1AWykvkh1-6Emk4MRMmMLYXqhzwg4g` | REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL | Nenhum. Preservar apenas como histórico |
| **Contrato-base genérico v2** | `1AeaIkUMt93X99_FHw0T9O_Rgsko91hLe6b2Ruhz7uBI` | INSUMO_COMPLEMENTAR_DE_COMPARACAO | Apenas cotejo contra o Modelo de Estudo para identificar cláusulas operacionais que demandem revisão jurídica. Nunca usar como matriz substituta, nunca gerar documentos diretamente a partir deste texto |

### 1.3. Regra de não concorrência entre modelos

- O Modelo de Estudo Genealógico não concorre com nenhum outro modelo.
- O texto genérico v2 não substitui, não concorre e não autoriza reescrever automaticamente o modelo aprovado pelo advogado.
- Nenhuma sugestão de mudança textual derivada do cotejo pode ser tratada como aprovada sem revisão jurídica prévia.
- Toda cláusula ausente, conflitante ou a alterar deve receber o status REQUER_REVISAO_JURIDICA.

### 1.4. Síntese do Modelo de Estudo Genealógico

O documento exportado contém 9 cláusulas estruturadas:

1. **Cláusula Primeira — Do Objeto:** define o serviço como estudo genealógico/mapeamento, com análise de informações e documentos. Lista o que o serviço inclui (análise de árvore, análise documental, identificação de lacunas/inconsistências, estratégia de pesquisa, parecer técnico) e o que não inclui (busca presencial em cartórios, solicitações externas, acompanhamento junto a órgãos, emissão de certidões, pesquisa ativa prolongada em acervos).
2. **Cláusula Segunda — Obrigações do Contratante:** fornecer informações/documentos, informar corretamente nomes/datas/locais, efetuar pagamento.
3. **Cláusula Terceira — Obrigações do Contratado:** análise técnica com base em documentos, árvore existente, acervos de consulta pública e conhecimento técnico. Relatório em PDF. Não garante localização de documentos, comprovação de linhagem, obtenção de cidadania ou continuidade.
4. **Cláusula Quarta — Dos Serviços:** entrega de relatório em PDF denominado "Estudo Genealógico da Família ___". 1 reunião online para apresentação.
5. **Cláusula Quinta — Guarda, Arquivamento e Descarte de Dados:** prazo máximo de 12 meses de armazenamento, exclusão definitiva após esse prazo, conformidade com LGPD (Lei 13.709/2018).
6. **Cláusula Sexta — Preço e Pagamento:** campo de valor, forma de pagamento (à vista ou 2 parcelas), início após pagamento da primeira parcela.
7. **Cláusula Sétima — Cumprimento do Contrato:** cumprido com entrega do relatório técnico e parecer. Não continuidade não caracteriza descumprimento.
8. **Cláusula Oitava — Prazo:** até 30 dias após pagamento da primeira parcela e envio de documentos.
9. **Cláusula Nona — Foro:** foro da comarca de São Paulo/SP.

---

## 2. MATRIZ DE ARQUITETURA DOCUMENTAL

### 2.1. Arquitetura obrigatória

```
MODELO DE ESTUDO GENEALÓGICO APROVADO PELO ADVOGADO
    |
    +-- Contrato específico por caso (quando dados e gatilhos permitirem)
    |
    +-- ANEXO I — Ordem de Serviço
    |   Define escopo, titulares, entregas, valores, parcelamento, cronograma,
    |   condições especiais e critérios de aceite aplicáveis ao caso.
    |
    +-- ANEXO II — Controle/Aprovação de Despesas Externas
    |   Usado somente diante de despesa externa concreta que demande aprovação.
    |
    +-- ANEXO III — Autorização Específica de Pesquisa
    |   Usado somente quando houver finalidade, pessoa, órgão/acervo, objeto,
    |   custo ou teto, prazo e autorização aplicáveis.
    |
    +-- ANEXO IV — Procuração para Diligência Concreta
    |   Usado somente quando uma diligência específica exigir procuração.
    |
    +-- ANEXO V — Alteração de Escopo/Preço/Prazo/Participantes
        Usado somente para alteração posterior ao instrumento principal.
```

**Regra central:**
- O contrato-base define a relação principal.
- O Anexo I operacionaliza a contratação específica.
- Os Anexos II a V só entram quando seu gatilho concreto ocorrer.
- Não anexar documentos apenas por completude formal.

### 2.2. Matriz completa

| Componente documental | Papel jurídico-operacional | Fonte ou modelo de origem | Dados necessários | Fonte de verdade dos dados | Gatilho de uso | Bloqueios | Saída esperada | Estado global | Estado por caso (Ana Luiza) | Evidência verificável | Regra de não duplicidade | Ação correta |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Modelo de Estudo Genealógico** | Contrato-base vigente — matriz jurídica única | Google Doc `17TW-mdc8Mw_7XHzHTnJHYaWHCwlLlZQW6YpYhjfNn7E` — aprovado pelo advogado | Nenhum (é template, não caso) | N/A | Necessidade de derivar contrato específico | Nenhum | Template disponível para derivação | IMPLEMENTADO_E_ATIVO | DISPONIVEL_GLOBALMENTE_NAO_APLICADO_AO_CASO | Exportado como text/plain: 134 linhas, 5.773 bytes; 9 cláusulas; data: 10/03/2026 | Único contrato-base; nenhum outro modelo pode ser usado como matriz | Manter como matriz jurídica única; não criar novo modelo |
| **Contrato específico por caso** | Instrumento contratual individual derivado do Modelo de Estudo | Derivado do Modelo de Estudo Genealógico + dados do caso | Nome, CPF, RG, profissão, estado civil, endereço da contratante; razão social, CNPJ, endereço da contratada; escopo; valor; forma de pagamento; prazo | Dossiê consolidado; cadastro do cliente; Planilha Mestre de Produtos (SKU/escopo); aceite comercial | Aceite comercial confirmado + dados cadastrais coletados + escopo consolidado | Dados cadastrais pendentes; escopo não consolidado em instrumento | Contrato específico assinado | PENDENTE_DE_DADOS_E_PREPARACAO | PENDENTE_DE_DADOS_E_PREPARACAO | CA-EVO-02: aceite confirmado; CA-10A1: contrato específico inexistente | Um contrato específico por caso; não duplicar em Dropbox/Drive | Preparar após coleta de dados cadastrais e consolidação de escopo |
| **Anexo I — Ordem de Serviço** | Operacionaliza a contratação específica: escopo, titulares, entregas, valores, parcelamento, cronograma, condições especiais e critérios de aceite | Google Doc `1sK6c8qBi1dwlxo0ZSwV9TdqRRB517LXDyU-Si0OnRiA` — existência e conteúdo confirmados por exportação direta; localização em pasta não confirmada nesta sessão | Case ID, Nome, CPF, SKU, Produto, Data, Responsável, Escopo, Objetivo, Entregáveis, Investimento, Pagamento, Condições, Aceite | Dossiê consolidado; Planilha Mestre (SKU); aceite comercial | Contrato-base preparado + escopo consolidado + dados cadastrais validados | Escopo não consolidado; dados cadastrais pendentes | Ordem de Serviço assinada | IMPLEMENTADO_E_ATIVO | PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO | Exportado: 50 linhas, template com campos parametrizáveis `[CASE_ID]`, `[NOME]`, `[SKU]`, etc.; CA-EVO-02 devolutiva: corrigido de NAO_LOCALIZADO para IMPLEMENTADO_E_ATIVO | Um Anexo I por caso; não duplicar | Preencher após contrato-base preparado e escopo consolidado |
| **Anexo II — Controle/Aprovação de Despesas Externas** | Autoriza e registra custos extraordinários (certidões, apostilamentos, traduções, taxas consulares, postagens, deslocamentos) | CA-EVO-02 devolutiva: localizado na pasta `01_Modelos-e-Jurídico` (baseado em memória de sessão anterior, não verificação direta) | Finalidade da despesa, fornecedor, valor/teto, impacto no processo, forma de pagamento | Dossiê do caso; aprovação do cliente | Despesa externa concreta que demande aprovação | Nenhuma despesa externa concreta identificada | Autorização de despesa assinada | PENDENTE_DE_VERIFICACAO_DIRETA | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | CA-EVO-02 devolutiva: corrigido para IMPLEMENTADO_E_ATIVO com base em memória de sessão anterior. CA-EVO-03 verificação direta: não localizado no Drive. Busca por nome e por pasta não retornou resultado | Um Anexo II por despesa ou conjunto de despesas aprovadas | Verificar diretamente no Drive; não usar até confirmação |
| **Anexo III — Autorização Específica de Pesquisa** | Autoriza uma pesquisa externa delimitada (finalidade, pessoa, órgão/acervo, objeto, custo, prazo) | Google Doc `1nN1xpR6s3IFfLggz1jKEssVWJJRQRitA1hdPMpgN3ms` — template com campos parametrizáveis | Case ID, Nome, finalidade, pessoa relacionada, órgão/acervo, objeto, custo/teto, prazo | Dossiê do caso; decisão de pesquisa | Necessidade concreta de pesquisa externa + finalidade + pessoa + órgão + custo + prazo definidos | Nenhuma pesquisa externa iniciada | Autorização de pesquisa assinada | IMPLEMENTADO_E_ATIVO | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | CA-EVO-02: template confirmado com campos `[CASE_ID]`, `[NOME]`, `[DESCREVER]`, `[ÓRGÃO]`, etc.; modificado 10/08/2026 | Um Anexo III por pesquisa externa autorizada | Acionar somente quando houver finalidade, pessoa, órgão, custo e prazo aplicáveis |
| **Anexo IV — Procuração para Diligência Concreta** | Formaliza poderes para diligência específica | CA-EVO-02 devolutiva: localizado na pasta `01_Modelos-e-Jurídico` (baseado em memória de sessão anterior, não verificação direta) | Dados do cliente; natureza da diligência; poderes necessários; órgão/destinatário | Dossiê do caso; decisão de diligência | Diligência específica que exija procuração | Nenhuma diligência concreta identificada | Procuração assinada | PENDENTE_DE_VERIFICACAO_DIRETA | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | CA-EVO-02 devolutiva: corrigido para IMPLEMENTADO_E_ATIVO com base em memória de sessão anterior. CA-EVO-03 verificação direta: não localizado no Drive. Busca por nome não retornou resultado específico do Clube Ancestral | Uma procuração por diligência específica | Verificar diretamente no Drive; não usar até confirmação |
| **Anexo V — Alteração de Escopo/Preço/Prazo/Participantes** | Registra mudança posterior ao instrumento principal | CA-EVO-02 devolutiva: Doc ID `1oi1LS3P16HjXYu-2lmNGU1JhxRVzvoA_W-ohtT5PEuQ` referenciado na sessão `6be3da76` | Tipo de alteração (escopo/preço/prazo/participantes); detalhamento; impacto financeiro; novo aceite | Dossiê do caso; aceite comercial original | Necessidade de alteração contratual posterior à assinatura | Contrato ainda não assinado | Termo de alteração assinado | NAO_LOCALIZADO_NESTA_SESSAO | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | CA-EVO-02 devolutiva: corrigido para IMPLEMENTADO_E_ATIVO com base em memória de sessão anterior. CA-EVO-03 verificação direta: Doc ID `1oi1LS3P16HjXYu-2lmNGU1JhxRVzvoA_W-ohtT5PEuQ` retornou HTTP 404 (File not found). Documento não existe ou foi removido | Um Anexo V por alteração contratual | Verificar diretamente no Drive; Doc ID pode estar obsoleto |
| **Modelo Simples** — Contrato Pesquisa Genealógica Prática | Referência histórica sem uso operacional | Google Doc `19Ce0rd4t8Qn9jktWTjzaVns2q6Fdbr1y45VoKJk9668` | N/A | N/A | Nenhum | Modelo histórico, não vigente | Nenhuma | REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL | NAO_APLICAVEL | CA-EVO-02: encontrado no Drive, modificado 11/05/2026 | Não usar como base; não preencher; não gerar documentos | Tratar como referência histórica; não usar operacionalmente |
| **Modelo de Contrato 2024** | Referência histórica sem uso operacional | Google Doc `1yr8qLy2myvciw1AWykvkh1-6Emk4MRMmMLYXqhzwg4g` | N/A | N/A | Nenhum | Modelo histórico, não vigente | Nenhuma | REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL | NAO_APLICAVEL | CA-EVO-02: encontrado no Drive, modificado 31/01/2025 | Não usar como base; não preencher; não gerar documentos | Tratar como referência histórica; não usar operacionalmente |
| **Contrato-base genérico v2** | Insumo complementar de comparação | Google Doc `1AeaIkUMt93X99_FHw0T9O_Rgsko91hLe6b2Ruhz7uBI` | N/A | N/A | Cotejo contra o Modelo de Estudo (apenas leitura e comparação) | Não pode ser usado como matriz substituta | Nenhuma — apenas cotejo | INSUMO_COMPLEMENTAR_DE_COMPARACAO | NAO_APLICAVEL | Exportado: 61 linhas, 5.862 bytes; 14 seções; texto colado confere com exportação | Não usar como base; não gerar documentos diretamente | Cotejar apenas para identificar cláusulas que demandem revisão jurídica |
| **Pasta `01_Modelos-e-Jurídico`** | Local central para contrato-base e Anexos I-V | Shared Drive — pasta `01_Modelos-e-Jurídico` (referência de localização histórica) | N/A | N/A | N/A | N/A | Repositório jurídico | NAO_LOCALIZADO_NESTA_SESSAO | NAO_APLICAVEL | CA-EVO-02 devolutiva: corrigido para IMPLEMENTADO_E_ATIVO com base em memória de sessão anterior. CA-EVO-03 prompt: tratar localização como histórica até verificação direta. CA-EVO-03 verificação direta: busca no Drive por nome da pasta retornou 0 resultados. Pasta não confirmada nesta sessão | Se existir, manter como local único de modelos jurídicos | Verificar diretamente no Drive antes de usar como referência operacional |
| **Pasta `00_Administração e Contrato` do caso** | Local para contrato específico e documentos contratuais do caso | Shared Drive — subpasta do caso (ex: `CA-CID-AT-FAM-2026-001 — Família Silveira Rodrigues/00_Administração e Contrato`) | Case ID + sobrenome da família | Dossiê; aceite comercial | Aceite formal escrito + contrato assinado | Contrato ainda não assinado | Pasta com contrato específico e anexos aplicáveis | IMPLEMENTADO_E_ATIVO | REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO | CA-EVO-02: pasta criada em pré-onboarding antes do contrato assinado; CA-10A1 Entrega 3 Etapa 2: 9 subpastas criadas | Uma pasta 00 por caso; não duplicar | Validar conformidade: pasta criada antes do gatilho de contrato assinado |

---

## 3. MATRIZ DE CAMPOS PARAMETRIZÁVEIS

### 3.1. Campos por documento

| Campo | Documento(s) que usam o campo | Obrigatório ou condicional | Fonte de verdade | Responsável pela validação | Momento de captura | Condição para preenchimento | Sensibilidade/LGPD | Status quando ausente | Observação de consistência |
|---|---|---|---|---|---|---|---|---|---|
| ID canônico do caso | Contrato específico, Anexo I, Anexo III, Anexo IV, Anexo V | Obrigatório | Dossiê consolidado; Planilha go-live | Tatiana / operação | Abertura do caso | Caso formalmente aberto | Baixa | PENDENTE_DE_DADO / ID_CANONICO_PENDENTE_DE_CONFIRMACAO | Divergência identificada: CA-CID-AT-FAM-2026-001 (dossiê) vs CA-AUT-ANALUIZA-FAM-2026-001 (go-live). Não resolvida formalmente. Não escolher um sem confirmação |
| Nome completo da contratante | Contrato específico, Anexo I, Anexo III, Anexo IV | Obrigatório | Cadastro do cliente; dossiê | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Alta (dado pessoal) | PENDENTE_DE_DADO | Deve conferir entre contrato, OS e dossiê |
| CPF da contratante | Contrato específico, Anexo I | Obrigatório | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Alta (dado pessoal identificador / alto risco) | PENDENTE_DE_DADO | Deve conferir entre contrato e OS |
| RG da contratante | Contrato específico (Modelo de Estudo) | Obrigatório (no Modelo de Estudo) | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Alta (dado pessoal) | PENDENTE_DE_DADO | Campo previsto no Modelo de Estudo Cláusula Primeira |
| Profissão da contratante | Contrato específico (Modelo de Estudo) | Obrigatório (no Modelo de Estudo) | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Média | PENDENTE_DE_DADO | Campo previsto no Modelo de Estudo Cláusula Primeira |
| Estado civil da contratante | Contrato específico (Modelo de Estudo) | Obrigatório (no Modelo de Estudo) | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Média | PENDENTE_DE_DADO | Campo previsto no Modelo de Estudo Cláusula Primeira |
| Endereço completo da contratante | Contrato específico, Anexo I | Obrigatório | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Alta (dado pessoal) | PENDENTE_DE_DADO | Deve conferir entre contrato, OS e dossiê |
| E-mail da contratante | Contrato específico, Anexo I | Obrigatório | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Alta (dado pessoal) | PENDENTE_DE_DADO | Canal formal de comunicação (Cláusula 11 do genérico v2) |
| Telefone/WhatsApp da contratante | Contrato específico, Anexo I | Obrigatório | Cadastro do cliente | Tatiana / operação | Coleta de dados cadastrais | Aceite comercial confirmado | Alta (dado pessoal) | PENDENTE_DE_DADO | Canal formal de comunicação (Cláusula 11 do genérico v2) |
| Razão social da contratada | Contrato específico (Modelo de Estudo) | Obrigatório | Contrato social da empresa | Tatiana / jurídico | Preenchimento do contrato | N/A | Baixa | PENDENTE_DE_DADO | Genérico v2 traz: "operando como Clube Ancestral" |
| CNPJ da contratada | Contrato específico, genérico v2 | Obrigatório | Contrato social da empresa | Tatiana / jurídico | Preenchimento do contrato | N/A | Baixa | PENDENTE_DE_DADO | Genérico v2 traz CNPJ 10.448.812/0001-58 — verificar se vigente |
| Endereço da contratada | Contrato específico (Modelo de Estudo), genérico v2 | Obrigatório | Contrato social da empresa | Tatiana / jurídico | Preenchimento do contrato | N/A | Baixa | PENDENTE_DE_DADO | Genérico v2 traz: Rua Nova York, 822, Apt. 142, Brooklin, CEP 04560-001, São Paulo – SP — verificar se vigente |
| E-mail oficial da contratada | Contrato específico (genérico v2) | Obrigatório | Configuração oficial | Tatiana / jurídico | Preenchimento do contrato | N/A | Baixa | PENDENTE_DE_DADO | Campo `[E-MAIL OFICIAL]` no genérico v2 |
| Escopo contratado | Contrato específico, Anexo I | Obrigatório | Dossiê consolidado; Planilha Mestre (SKU) | Tatiana / operação | Preparação do contrato | Aceite comercial + escopo consolidado | Baixa | PENDENTE_DE_DADO | Deve conferir entre contrato, OS e proposta aprovada |
| País/linha/objetivo da pesquisa | Contrato específico, Anexo I | Obrigatório | Dossiê consolidado | Tatiana / operação | Preparação do contrato | Aceite comercial + definição de país/linha | Baixa | PENDENTE_DE_DADO | Ana Luiza: Áustria, §58c (evidenciado no dossiê) |
| Titulares, participantes e dependentes | Anexo I | Obrigatório | Dossiê consolidado (seção estrutura familiar) | Tatiana / operação | Preparação do Anexo I | Aceite comercial + estrutura familiar confirmada | Alta (dados pessoais) | PENDENTE_DE_DADO | Ana Luiza: 3 titulares (Ana, Alice, Adair) + 1 dependente (Felipe) — evidenciado no CA-EVO-02 |
| Entregas e critérios de aceite | Anexo I | Obrigatório | Dossiê; Planilha Mestre (SKU) | Tatiana / operação | Preparação do Anexo I | Escopo consolidado | Baixa | PENDENTE_DE_DADO | Deve refletir SKU contratado e fases da OS |
| Valor | Contrato específico, Anexo I | Obrigatório | Proposta aprovada; Planilha Mestre | Tatiana / operação | Preparação do contrato | Aceite comercial com valor definido | Baixa | PENDENTE_DE_DADO | Ana Luiza: R$ 9.600,00 (evidenciado no CA-EVO-02) |
| Parcelamento | Contrato específico, Anexo I | Obrigatório | Proposta aprovada | Tatiana / operação | Preparação do contrato | Aceite comercial com condição definida | Baixa | PENDENTE_DE_DADO | Ana Luiza: 10 mensalidades familiares de R$ 960,00 (evidenciado no CA-EVO-02) |
| Desconto | Anexo I | Condicional | Proposta aprovada | Tatiana / operação | Preparação do Anexo I | Se houver desconto acordado | Baixa | NAO_APLICAVEL_SEM_DESCONTO | Congelar valor na Planilha Mestre |
| Validade da oferta | Anexo I | Obrigatório | Proposta aprovada | Tatiana / operação | Preparação do Anexo I | Aceite comercial | Baixa | PENDENTE_DE_DADO | Ana Luiza: proposta válida até 19/08/2026 (CA-EVO-02) |
| Forma de pagamento | Contrato específico, Anexo I | Obrigatório | Proposta aprovada; Asaas (após ativação) | Tatiana / operação | Preparação do contrato | Aceite comercial + Asaas configurado | Baixa | PENDENTE_DE_DADO | Asaas ainda não ativado para o caso |
| Cronograma e marcos | Anexo I | Obrigatório | Dossiê; Planejador Universal | Tatiana / operação | Preparação do Anexo I | Escopo consolidado | Baixa | PENDENTE_DE_DADO | Deve refletir fases da OS e cronograma do Planejador |
| Despesas externas (teto) | Anexo II | Condicional | Dossiê; aprovação do cliente | Tatiana / operação | Acionamento do Anexo II | Despesa externa concreta identificada | Baixa | NAO_APLICAVEL_SEM_DESPESA | Anexo II só entra com despesa concreta |
| Despesas externas (forma de aprovação) | Anexo II | Condicional | Aprovação do cliente | Tatiana / operação | Acionamento do Anexo II | Despesa externa concreta | Baixa | NAO_APLICAVEL_SEM_DESPESA | Genérico v2: procedimento de aprovação, adiantamento e irreversibilidade |
| Finalidade de pesquisa | Anexo III | Obrigatório (quando Anexo III acionado) | Dossiê; decisão de pesquisa | Tatiana / genealogista | Acionamento do Anexo III | Necessidade concreta de pesquisa externa | Baixa | NAO_APLICAVEL_SEM_PESQUISA | Template Anexo III: campo `[DESCREVER]` |
| Pessoa relacionada na pesquisa | Anexo III | Obrigatório (quando Anexo III acionado) | Dossiê | Tatiana / genealogista | Acionamento do Anexo III | Pessoa identificada | Alta (dado pessoal) | NAO_APLICAVEL_SEM_PESQUISA | Template Anexo III: campo `[NOME]` |
| Órgão/acervo da pesquisa | Anexo III | Obrigatório (quando Anexo III acionado) | Dossiê; definição de pesquisa | Tatiana / genealogista | Acionamento do Anexo III | Órgão/acervo identificado | Baixa | NAO_APLICAVEL_SEM_PESQUISA | Template Anexo III: campo `[ÓRGÃO]` |
| Custo/teto da pesquisa | Anexo III | Obrigatório (quando Anexo III acionado) | Dossiê; orçamento | Tatiana / operação | Acionamento do Anexo III | Custo estimado | Baixa | NAO_APLICAVEL_SEM_PESQUISA | Vincular ao Anexo II se houver despesa |
| Prazo da pesquisa | Anexo III | Obrigatório (quando Anexo III acionado) | Dossiê; Planejador | Tatiana / operação | Acionamento do Anexo III | Prazo definido | Baixa | NAO_APLICAVEL_SEM_PESQUISA | Deve ser coerente com cronograma do caso |
| Diligência concreta | Anexo IV | Obrigatório (quando Anexo IV acionado) | Dossiê; decisão de diligência | Tatiana / operação | Acionamento do Anexo IV | Diligência específica identificada | Baixa | NAO_APLICAVEL_SEM_DILIGENCIA | Anexo IV só entra quando diligência exigir procuração |
| Poderes necessários (procuração) | Anexo IV | Obrigatório (quando Anexo IV acionado) | Dossiê; definição jurídica | Tatiana / jurídico | Acionamento do Anexo IV | Poderes definidos | Baixa | NAO_APLICAVEL_SEM_DILIGENCIA | Requer definição jurídica dos poderes |
| Alteração de escopo | Anexo V | Obrigatório (quando Anexo V acionado) | Dossiê; novo aceite | Tatiana / operação | Acionamento do Anexo V | Alteração posterior à assinatura | Baixa | NAO_APLICAVEL_SEM_ALTERACAO | Anexo V só entra após instrumento principal assinado |
| Alteração de preço | Anexo V | Obrigatório (quando Anexo V acionado) | Novo aceite comercial; Planilha Mestre | Tatiana / operação | Acionamento do Anexo V | Alteração de preço acordada | Baixa | NAO_APLICAVEL_SEM_ALTERACAO | Atualizar Planilha Mestre e Asaas |
| Alteração de prazo | Anexo V | Obrigatório (quando Anexo V acionado) | Dossiê; Planejador | Tatiana / operação | Acionamento do Anexo V | Alteração de prazo acordada | Baixa | NAO_APLICAVEL_SEM_ALTERACAO | Atualizar Planejador e calendário |
| Alteração de participantes | Anexo V | Obrigatório (quando Anexo V acionado) | Dossiê; novo aceite | Tatiana / operação | Acionamento do Anexo V | Alteração de titulares/dependentes | Alta (dados pessoais) | NAO_APLICAVEL_SEM_ALTERACAO | Atualizar dossiê e estrutura familiar |
| Canais formais de comunicação | Contrato específico (genérico v2 Cláusula 11) | Obrigatório | Configuração oficial | Tatiana / operação | Preenchimento do contrato | N/A | Baixa | PENDENTE_DE_DADO | Genérico v2: e-mail e WhatsApp autorizados |
| Data de assinatura/aceite | Contrato específico, Anexo I, todos os anexos | Obrigatório | Registro de assinatura | Tatiana / operação | Assinatura | Contrato preparado e revisado | Baixa | BLOQUEADO_POR_GATILHO | Depende de contrato preparado e revisado |
| Método de assinatura/aceite | Contrato específico, Anexo I | Obrigatório | Configuração de assinatura eletrônica | Tatiana / operação | Assinatura | Contrato preparado | Baixa | BLOQUEADO_POR_GATILHO | Genérico v2: aceite digital e logs de acesso como prova |

---

## 4. MATRIZ DE GATILHOS E BLOQUEIOS

### 4.1. Preparar um contrato específico

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Aceite comercial confirmado | Registro de aceite (proposta aprovada, WhatsApp, call) | CONFIRMADO |
| Gatilho obrigatório | Dados cadastrais da contratante coletados (nome, CPF, RG, profissão, estado civil, endereço, e-mail, telefone) | Cadastro preenchido | PENDENTE_DE_DADO |
| Gatilho obrigatório | Dados da contratada confirmados (razão social, CNPJ, endereço, e-mail) | Contrato social verificado | PENDENTE_DE_DADO |
| Gatilho obrigatório | Escopo consolidado (país, linha, titulares, valor, parcelamento) | Dossiê + proposta aprovada + Planilha Mestre | PARCIALMENTE_CONFIRMADO (país, titulares e valor confirmados; escopo detalhado pendente) |
| Gatilho obrigatório | ID canônico do caso confirmado | Resolução formal da divergência de ID | ID_CANONICO_PENDENTE_DE_CONFIRMACAO |
| Bloqueio | Dados cadastrais pendentes | N/A | BLOQUEADO_POR_GATILHO |

### 4.2. Revisar internamente o contrato específico

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Contrato específico preparado (preenchido a partir do Modelo de Estudo) | Documento com campos preenchidos | BLOQUEADO_POR_GATILHO (contrato não preparado) |
| Gatilho obrigatório | Revisão interna de consistência (dados, escopo, valores, prazos) | Checklist de revisão | BLOQUEADO_POR_GATILHO |
| Gatilho condicional | Cotejo com genérico v2 para cláusulas operacionais | Matriz de cotejo (Seção 5 deste documento) | DISPONIVEL (cotejo realizado neste CA-EVO-03) |

### 4.3. Enviar para assinatura

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Contrato revisado internamente | Aprovação interna registrada | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Anexo I (Ordem de Serviço) preparado | OS preenchida | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Método de assinatura definido | Configuração de assinatura eletrônica | PENDENTE_DE_DADO |
| Bloqueio | Contrato não preparado | N/A | BLOQUEADO_POR_GATILHO |

### 4.4. Considerar contrato assinado

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Assinatura eletrônica ou física registrada | Log/certificado de assinatura | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Cliente recebeu cópia do contrato e da OS | Comprovante de envio | BLOQUEADO_POR_GATILHO |
| Bloqueio | Contrato não enviado para assinatura | N/A | BLOQUEADO_POR_GATILHO |

### 4.5. Preparar Anexo I

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Contrato-base preparado | Documento preenchido | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Escopo consolidado (SKU, entregas, fases) | Planilha Mestre + dossiê | PENDENTE_DE_DADO |
| Gatilho obrigatório | Titulares e dependentes confirmados | Dossiê (estrutura familiar) | PARCIALMENTE_CONFIRMADO (3 titulares + 1 dependente identificados) |
| Gatilho obrigatório | Valor, parcelamento e primeiro vencimento definidos | Proposta aprovada | CONFIRMADO (R$ 9.600, 10x R$ 960, 01/10/2026) |
| Gatilho obrigatório | Responsável pelo caso definido | Designação interna | PENDENTE_DE_DADO |

### 4.6. Acionar Anexo II (Despesas Externas)

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho condicional | Despesa externa concreta identificada | Solicitação de despesa com finalidade, fornecedor e valor | NAO_APLICAVEL |
| Gatilho condicional | Aprovação do cliente obtida | Registro de aprovação | NAO_APLICAVEL |
| Gatilho condicional | Teto máximo e condições de reembolso definidos | Documento de autorização | NAO_APLICAVEL |
| Bloqueio | Nenhuma despesa externa concreta | N/A | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO |

### 4.7. Acionar Anexo III (Autorização de Pesquisa)

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho condicional | Finalidade da pesquisa definida | Documento de decisão de pesquisa | NAO_APLICAVEL |
| Gatilho condicional | Pessoa relacionada identificada | Dossiê | NAO_APLICAVEL |
| Gatilho condicional | Órgão/acervo identificado | Definição de pesquisa | NAO_APLICAVEL |
| Gatilho condicional | Custo ou teto definido | Orçamento | NAO_APLICAVEL |
| Gatilho condicional | Prazo definido | Planejador | NAO_APLICAVEL |
| Gatilho condicional | Contrato assinado | Comprovante de assinatura | BLOQUEADO_POR_GATILHO |
| Bloqueio | Nenhuma pesquisa externa iniciada | N/A | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO |

### 4.8. Acionar Anexo IV (Procuração)

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho condicional | Diligência específica identificada | Documento de decisão de diligência | NAO_APLICAVEL |
| Gatilho condicional | Poderes necessários definidos juridicamente | Parecer/definição jurídica | NAO_APLICAVEL |
| Gatilho condicional | Órgão/destinatário da procuração identificado | Definição de diligência | NAO_APLICAVEL |
| Gatilho condicional | Contrato assinado | Comprovante de assinatura | BLOQUEADO_POR_GATILHO |
| Bloqueio | Nenhuma diligência concreta | N/A | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO |

### 4.9. Acionar Anexo V (Alteração)

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho condicional | Contrato principal assinado | Comprovante de assinatura | BLOQUEADO_POR_GATILHO |
| Gatilho condicional | Alteração de escopo/preço/prazo/participantes acordada | Novo aceite registrado | NAO_APLICAVEL |
| Bloqueio | Contrato ainda não assinado | N/A | BLOQUEADO_POR_GATILHO |

### 4.10. Iniciar pesquisa externa

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Contrato assinado | Comprovante de assinatura | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Primeira cobrança confirmada no Asaas | Comprovante transacional | BLOQUEADO_POR_GATILHO |
| Gatilho condicional | Anexo III assinado (se pesquisa envolver autorização específica) | Anexo III assinado | NAO_APLICAVEL |
| Bloqueio | Contrato não assinado + Asaas não ativado | N/A | BLOQUEADO_POR_GATILHO |

### 4.11. Ativar cobrança ou assinatura no Asaas

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Contrato assinado | Comprovante de assinatura | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Anexo I assinado (OS com valor, parcelamento e vencimento) | OS assinada | BLOQUEADO_POR_GATILHO |
| Gatilho obrigatório | Cliente cadastrado no Asaas | Registro no Asaas | BLOQUEADO_POR_GATILHO |
| Bloqueio | Contrato não assinado | N/A | BLOQUEADO_POR_GATILHO |

### 4.12. Criar ou liberar estrutura operacional de caso

| Tipo | Condição | Evidência necessária | Status Ana Luiza |
|---|---|---|---|
| Gatilho obrigatório | Aceite formal escrito | Registro de aceite | CONFIRMADO |
| Gatilho condicional | Contrato assinado (para liberação completa) | Comprovante de assinatura | BLOQUEADO_POR_GATILHO |
| Evidência observada | Pastas do caso criadas em pré-onboarding | Drive: 9 subpastas criadas | REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO (pastas criadas antes do contrato assinado) |
| Bloqueio | Estrutura criada antes do gatilho de contrato assinado | N/A | Pendente de validação de conformidade |

---

## 5. COTEJO DE CLÁUSULAS — MODELO DE ESTUDO GENEALÓGICO x CONTRATO-BASE GENÉRICO V2

### 5.1. Metodologia

O cotejo foi realizado a partir da leitura direta de ambos os documentos exportados do Google Docs:
- **Modelo de Estudo Genealógico:** 134 linhas, 9 cláusulas (Doc ID `17TW-mdc8Mw_7XHzHTnJHYaWHCwlLlZQW6YpYhjfNn7E`)
- **Contrato-base genérico v2:** 61 linhas, 14 seções (Doc ID `1AeaIkUMt93X99_FHw0T9O_Rgsko91hLe6b2Ruhz7uBI`)

Nenhum documento foi modificado. O genérico v2 é tratado exclusivamente como insumo complementar de comparação.

### 5.2. Tabela de cotejo

| Tema | Tratamento no Modelo de Estudo Genealógico | Contribuição potencial do texto genérico v2 | Compatível, conflitante, ausente ou requer revisão jurídica | Encaminhamento correto |
|---|---|---|---|---|
| **Partes e aceitação** | Cláusula Primeira: identifica CONTRATANTE (Nome, RG, CPF, Profissão, Estado Civil, Endereço) e CONTRATADO(A) (Nome, CNPJ, sede). Aceitação por assinatura física ao final ("Por estarem de acordo, as partes assinam"). | Seção 1: identifica Contratada (razão social, CNPJ, endereço, e-mail) e Contratante (pessoa física detalhada no cadastro e na OS). Aceitação por concordância digital ("inclusive via meio digital, formaliza o aceite"). | REQUER_REVISAO_JURIDICA | O genérico v2 traz aceitação digital que o Modelo de Estudo não prevê. Incorporar aceite eletrônico requer revisão jurídica para garantir validade. A qualificação detalhada do Modelo de Estudo (RG, profissão, estado civil) deve ser preservada |
| **Composição documental e prevalência da Ordem de Serviço** | Não há cláusula sobre composição documental ou prevalência da OS. O contrato é autônomo e não referencia anexos. | Seção 2: enumera componentes do vínculo contratual (Contrato-Base, OS/Proposta, descritivo do caso, autorizações suplementares, Política de Privacidade, registros eletrônicos) e estabelece prevalência da OS em caso de conflito sobre escopo, valores, prazos e despesas. | AUSENTE no Modelo de Estudo | REQUER_REVISAO_JURIDICA: a arquitetura modular (contrato-base + Anexo I + Anexos II-V) depende de cláusula de composição documental e prevalência. O genérico v2 oferece a estrutura, mas sua incorporação ao Modelo de Estudo requer revisão do advogado |
| **Objeto do serviço** | Cláusula Primeira: objeto = prestação de serviço técnico especializado em genealogia (Estudo Genealógico / Mapeamento Genealógico) com análise de informações e documentos. Lista 5 inclusões e 5 exclusões. | Seção 3: objeto = pesquisa genealógica, estruturação de dados familiares, orientação sobre documentos, produção de relatórios e árvores, suporte na jornada para cidadania. Inclui consultas em acervos. | PARCIALMENTE_COMPATIVEL | O Modelo de Estudo é mais restrito (estudo/mapeamento, sem busca presencial). O genérico v2 amplia para jornada de cidadania e consultas em acervos. A ampliação do escopo requer revisão jurídica para alinhar com o que foi aprovado pelo advogado |
| **Escopo, limites e ausência de representação jurídica** | Cláusula Primeira (1.3): serviço NÃO inclui busca presencial em cartórios, solicitações externas, acompanhamento junto a órgãos, emissão de certidões, pesquisa ativa prolongada em acervos. Cláusula Terceira (3.3): não garante localização de documentos, comprovação de linhagem, obtenção de cidadania ou continuidade. | Seção 4: não realiza representação jurídica; não atua em substituição a advogados/cartórios/órgãos; não assegura deferimento de cidadania/passaportes; não garante prazos de terceiros ou existência de registros. Via de reconhecimento depende de análise técnica. | COMPATIVEL | Ambos limitam o escopo e excluem representação jurídica e garantia de resultado. O genérico v2 é mais detalhado nas exclusões. Manter o tratamento do Modelo de Estudo; considerar incorporar as exclusões adicionais do genérico v2 após revisão jurídica |
| **Deveres do cliente** | Cláusula Segunda: fornecer informações/documentos; informar corretamente nomes/datas/locais; efetuar pagamento na forma acordada. | Seção 5: prover dados fidedignos e documentos legíveis; reportar alterações de estado civil ou endereço; validar despesas externas e assinar autorizações solicitadas. Atrasos impactam cronograma. | COMPATIVEL | O genérico v2 amplia os deveres (reportar alterações, validar despesas, assinar autorizações). Compatível com a arquitetura modular. Considerar incorporar após revisão jurídica |
| **Valores e pagamentos** | Cláusula Sexta: campo de valor (R$ ___), forma de pagamento (à vista ou 2 parcelas), início após pagamento da primeira parcela. Conclusão não depende de resultado positivo. | Seção 6: preço, parcelamento, descontos e validade constam na OS. Pagamento único, recorrência ou por etapas. Nenhuma cobrança extra sem comunicação prévia e anuência. | REQUER_REVISAO_JURIDICA | O Modelo de Estudo prevê apenas 2 parcelas ou à vista. O genérico v2 permite recorrência/por etapas (compatível com cobrança Asaas). A flexibilização da forma de pagamento requer revisão jurídica. A remissão para a OS é compatível com a arquitetura modular |
| **Despesas externas, aprovações, adiantamentos e irreversibilidade** | Não há cláusula específica sobre despesas externas. O serviço exclui busca presencial, solicitações externas e emissão de certidões (Cláusula 1.3). | Seção 7: despesas externas (certidões, apostilamentos, traduções, taxas, postagens, deslocamentos) de responsabilidade da Cliente. Procedimento de aprovação (7.1), adiantamento pelo Clube (7.2) com teto máximo e condições de reembolso, custos irreversíveis não reembolsáveis (7.3). | AUSENTE no Modelo de Estudo | REQUER_REVISAO_JURIDICA: o Modelo de Estudo não trata despesas externas. O genérico v2 oferece estrutura completa (aprovação, adiantamento, irreversibilidade) compatível com o Anexo II. Incorporação essencial para a arquitetura modular, mas requer revisão do advogado |
| **Procurações e formalidades separadas** | Não há cláusula sobre procurações ou formalidades separadas. | Seção 8: documentos específicos para protocolos em órgãos oficiais serão apresentados separadamente para assinatura, não substituídos pela aceitação do contrato. | AUSENTE no Modelo de Estudo | REQUER_REVISAO_JURIDICA: o Modelo de Estudo não prevê procurações. O genérico v2 estabelece a separação entre contrato-base e formalidades específicas, compatível com Anexo IV. Incorporação necessária, requer revisão do advogado |
| **Cancelamento, rescisão e direito de arrependimento** | Não há cláusula de cancelamento, rescisão ou arrependimento. A Cláusula Sétima estabelece que a não continuidade da pesquisa não caracteriza descumprimento. | Seção 9: Cliente pode interromper a qualquer tempo, sem multas ou fidelidade. Direito de arrependimento de 7 dias para contratações eletrônicas. Encerrado o arrependimento, cessam cobranças futuras, mantendo débito por etapas concluídas e despesas irreversíveis. | AUSENTE no Modelo de Estudo | REQUER_REVISAO_JURIDICA: o Modelo de Estudo não prevê cancelamento/rescisão/arrependimento. O genérico v2 oferece estrutura completa compatível com relações de consumo eletrônico. Incorporação essencial, requer revisão do advogado |
| **Proteção de dados** | Cláusula Quinta: guarda de dados por 12 meses, exclusão definitiva após prazo, sigilo, conformidade com LGPD (Lei 13.709/2018). Detalhado em 5 subcláusulas. | Seção 10: tratamento de dados visa execução contratual e obrigações legais, conforme Política de Privacidade integrada ao instrumento. | PARCIALMENTE_COMPATIVEL | O Modelo de Estudo é mais detalhado (prazo de 12 meses, exclusão, sigilo). O genérico v2 remete a Política de Privacidade externa. Manter o tratamento do Modelo de Estudo; considerar referenciar Política de Privacidade após revisão jurídica |
| **Comunicações** | Não há cláusula sobre canais de comunicação. | Seção 11: autorizado uso de e-mail e WhatsApp para registros operacionais, envio de entregas e solicitações de pagamento ou autorização. | AUSENTE no Modelo de Estudo | REQUER_REVISAO_JURIDICA: o Modelo de Estudo não prevê canais de comunicação. O genérico v2 estabelece e-mail e WhatsApp como canais autorizados. Incorporação útil para operação, requer revisão do advogado |
| **Propriedade intelectual** | Não há cláusula sobre propriedade intelectual. | Seção 12: materiais produzidos são de uso pessoal da Cliente. Clube Ancestral detém propriedade de métodos, sistemas e identidade visual. | AUSENTE no Modelo de Estudo | REQUER_REVISAO_JURIDICA: o Modelo de Estudo não trata propriedade intelectual. O genérico v2 oferece estrutura simples e compatível. Incorporação recomendada, requer revisão do advogado |
| **Assinatura eletrônica, logs e prova** | Assinatura física ao final ("Por estarem de acordo, as partes assinam"). Não há menção a assinatura eletrônica ou logs. | Seção 13: aceite digital e logs de acesso constituem prova da contratação. Cliente deve receber cópia do instrumento e da OS. | CONFLITANTE | REQUER_REVISAO_JURIDICA: o Modelo de Estudo prevê assinatura física; o genérico v2 prevê aceite digital. A adoção de assinatura eletrônica requer revisão jurídica para garantir validade probatória. Prioridade alta: a operação do Clube Ancestral depende de assinatura eletrônica |
| **Disposições finais e foro** | Cláusula Nona: foro da comarca de São Paulo/SP, com renúncia de qualquer outro. Data: São Paulo/SP, 10 de Março de 2026. | Seção 14: tolerância não implica renúncia. Legislação brasileira. Foro no domicílio da Cliente para relações de consumo. | CONFLITANTE | REQUER_REVISAO_JURIDICA: o Modelo de Estudo estabelece foro de São Paulo/SP; o genérico v2 estabelece foro no domicílio da Cliente (relação de consumo). Conflito direto. A escolha de foro deve ser definida pelo advogado. O genérico v2 também traz cláusula de tolerância ausente no Modelo de Estudo |

### 5.3. Síntese do cotejo

| Status | Quantidade | Temas |
|---|---|---|
| COMPATIVEL | 2 | Escopo/limites; Deveres do cliente |
| PARCIALMENTE_COMPATIVEL | 2 | Objeto do serviço; Proteção de dados |
| AUSENTE no Modelo de Estudo | 6 | Composição documental/OS; Despesas externas; Procurações; Cancelamento/rescisão; Comunicações; Propriedade intelectual |
| CONFLITANTE | 2 | Assinatura eletrônica/logs; Foro/disposições finais |
| REQUER_REVISAO_JURIDICA | 12 | Todos os temas exceto os 2 compatíveis (os 2 parcialmente compatíveis, os 6 ausentes e os 2 conflitantes exigem revisão jurídica antes de qualquer adoção) |

**Conclusão do cotejo:** O Modelo de Estudo Genealógico é juridicamente aprovado mas cobre apenas parte das necessidades operacionais do Clube Ancestral. O genérico v2 oferece estrutura para composição documental, despesas externas, procurações, cancelamento, comunicações, propriedade intelectual e assinatura eletrônica — todas ausentes no Modelo de Estudo. Há conflito direto em dois pontos (assinatura e foro). Dos 14 temas comparados, 12 requerem revisão jurídica antes de qualquer incorporação. Nenhuma incorporação pode ser feita sem revisão jurídica prévia.

---

## 6. APLICAÇÃO AO CASO ANA LUIZA

### 6.1. Dados evidenciados do caso

| Dado | Valor evidenciado | Fonte |
|---|---|---|
| Aceite comercial | CONFIRMADO | CA-EVO-02; CA-10A1 |
| Participantes | Ana Luiza Gomes Silveira Rodrigues, Alice Gomes Silveira e Adair Pinto Silveira Júnior | CA-EVO-02 |
| Dependente | Felipe (vinculado à Ana) | CA-10A1 Entrega 6 |
| Valor | R$ 9.600,00 | CA-EVO-02 |
| Condição | 10 mensalidades familiares de R$ 960,00 | CA-EVO-02 |
| Primeiro vencimento | 01/10/2026 | CA-EVO-02 |
| País/linha | Áustria, §58c | CA-10A1; CA-EVO-02 |
| Proposta Canva | Design ID `DAHSB6nbt_M`; válida até 19/08/2026 | CA-EVO-02 |
| ID dossiê | CA-CID-AT-FAM-2026-001 | CA-10A1; CA-EVO-02 |
| ID go-live | CA-AUT-ANALUIZA-FAM-2026-001 | CA-EVO-02 |
| Contrato específico | Google Doc `1h_GqWpZ7KH1chlw43YGa51h0nnfyudgxZpNWvJCgQV8` — placeholder não preenchido | Exportado: 55 bytes, confirma placeholder |
| Estrutura de pastas | 9 subpastas criadas em pré-onboarding | CA-10A1 Entrega 3 Etapa 2 |
| Dados cadastrais | PENDENTES | CA-EVO-02 |
| Asaas | Não ativado | CA-EVO-02 |
| Pesquisa externa | Não iniciada | CA-EVO-02 |
| Despesas externas | Não ativadas | CA-EVO-02 |

### 6.2. Estado do motor contratual no caso Ana Luiza

| Componente | Estado global | Estado no caso Ana Luiza | Justificativa |
|---|---|---|---|
| Modelo de Estudo Genealógico | IMPLEMENTADO_E_ATIVO | DISPONIVEL_GLOBALMENTE_NAO_APLICADO_AO_CASO | Template aprovado pelo advogado, disponível para derivação |
| Contrato específico | N/A | PENDENTE_DE_DADOS_E_PREPARACAO | Placeholder existe mas não preenchido; dados cadastrais pendentes; escopo não consolidado em instrumento |
| Anexo I | IMPLEMENTADO_E_ATIVO | PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO | Template disponível; escopo detalhado e responsável pendentes |
| Anexo II | PENDENTE_DE_VERIFICACAO_DIRETA | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | Nenhuma despesa externa concreta; documento não localizado no Drive nesta sessão |
| Anexo III | IMPLEMENTADO_E_ATIVO | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | Nenhuma pesquisa externa iniciada |
| Anexo IV | PENDENTE_DE_VERIFICACAO_DIRETA | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | Nenhuma diligência concreta; documento não localizado no Drive nesta sessão |
| Anexo V | NAO_LOCALIZADO_NESTA_SESSAO | PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO | Contrato ainda não assinado; Doc ID retornou HTTP 404 |
| Pesquisa externa | N/A | BLOQUEADO_POR_GATILHO | Contrato não assinado + Asaas não ativado |
| Asaas/financeiro | N/A | BLOQUEADO_POR_GATILHO | Contrato não assinado + Anexo I não preparado |
| Estrutura de pastas do caso | IMPLEMENTADO_E_ATIVO | REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO | Pastas criadas em pré-onboarding antes do contrato assinado; pendente de validação de conformidade |

### 6.3. ID canônico

A divergência entre `CA-CID-AT-FAM-2026-001` (dossiê) e `CA-AUT-ANALUIZA-FAM-2026-001` (go-live) não foi formalmente resolvida. Portanto:

**ID_CANONICO_PENDENTE_DE_CONFIRMACAO**

Não escolher um dos IDs por conta própria. A resolução requer confirmação formal da operação.

### 6.4. Declaração de estado do caso

No caso Ana Luiza:
- O Modelo de Estudo Genealógico está disponível globalmente;
- O contrato específico permanece PENDENTE_DE_DADOS_E_PREPARACAO;
- O Anexo I permanece PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO;
- Os Anexos II, III, IV e V permanecem PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO;
- A pesquisa externa e as ativações financeiras permanecem BLOQUEADO_POR_GATILHO.

---

## 7. BACKLOG JURÍDICO-OPERACIONAL

| Prioridade | Pendência | Tipo | Ação permitida | Efeito | Responsável sugerido | Pré-requisito |
|---|---|---|---|---|---|---|
| Crítica | Revisar juridicamente a cláusula de assinatura eletrônica e logs | Jurídico | Encaminhar o cotejo ao advogado | Impede definir o método seguro de assinatura digital | Advogado | Cotejo realizado (Seção 5) |
| Crítica | Resolver o conflito de foro: São Paulo/SP versus domicílio da cliente | Jurídico | Decisão expressa do advogado | Deve ser definido antes de assinatura | Advogado | Cotejo realizado |
| Crítica | Definir composição contratual e prevalência da Ordem de Serviço | Jurídico | Revisão do Modelo de Estudo pelo advogado | Necessária para a arquitetura modular completa | Advogado | Cotejo realizado |
| Crítica | Coletar dados cadastrais da contratante | Dados | Solicitar cadastro validado | Bloqueia contrato específico e Anexo I | Tatiana / operação | Aceite comercial confirmado |
| Crítica | Confirmar dados oficiais da contratada: razão social, CNPJ, endereço e e-mail | Dados/jurídico | Confrontar com contrato social vigente | Bloqueia preenchimento do contrato | Tatiana / jurídico | Nenhum |
| Crítica | Resolver o ID canônico: CA-CID-AT-FAM-2026-001 versus CA-AUT-ANALUIZA-FAM-2026-001 | Decisão operacional | Formalizar um único ID | Bloqueia identificação documental unificada | Tatiana / operação | Nenhum |
| Alta | Consolidar escopo, SKU, entregas, cronograma e critérios de aceite | Operacional | Consolidar proposta, dossiê e Planilha Mestre | Bloqueia Anexo I | Tatiana / operação | Dossiê + Planilha Mestre |
| Alta | Definir responsável pelo caso | Operacional | Designar internamente | Bloqueia Anexo I | Tatiana / operação | Nenhum |
| Alta | Revisar despesas externas, aprovações, adiantamentos e irreversibilidade | Jurídico | Submeter cotejo ao advogado | Impede uso seguro do Anexo II | Advogado | Cotejo realizado |
| Alta | Revisar cancelamento, rescisão e direito de arrependimento | Jurídico | Submeter cotejo ao advogado | Reduz risco de relação de consumo incompleta | Advogado | Cotejo realizado |
| Alta | Revisar procurações e formalidades separadas | Jurídico | Submeter cotejo ao advogado | Impede uso seguro do Anexo IV | Advogado | Cotejo realizado |
| Alta | Revisar flexibilidade de pagamentos além de à vista ou duas parcelas | Jurídico | Submeter cotejo ao advogado | Afeta cobrança recorrente via Asaas | Advogado | Cotejo realizado |
| Média | Localizar e validar Anexo II | Evidência | Busca dirigida no Drive por título, conteúdo ou pasta-pai | Necessário antes de qualquer despesa externa | Tatiana / operação | Nenhum |
| Média | Localizar e validar Anexo IV | Evidência | Busca dirigida no Drive por título, conteúdo ou pasta-pai | Necessário antes de diligência com procuração | Tatiana / operação | Nenhum |
| Média | Recuperar ou substituir o Anexo V sob orientação jurídica | Evidência/jurídico | Identificar ID novo ou versão aprovada | Necessário apenas em alteração futura de contrato | Tatiana / jurídico | Doc ID atual retornou HTTP 404 |
| Média | Verificar a pasta 01_Modelos-e-Jurídico | Evidência | Localizar por ID, proprietário, pasta-pai ou permissões | Remove ambiguidade de repositório jurídico | Tatiana / operação | Nenhum |
| Média | Validar criação antecipada das pastas de Ana Luiza | Governança | Auditar o fluxo de pré-onboarding | Corrige divergência entre gatilho planejado e execução | Tatiana / operação | Nenhum |
| Média | Definir canais formais de comunicação | Jurídico/operacional | Revisão de cláusula de e-mail e WhatsApp | Necessário antes do uso contratual desses canais | Advogado | Cotejo realizado |
| Média | Definir propriedade intelectual sobre métodos, sistemas e materiais | Jurídico | Revisão jurídica | Protege ativos do Clube | Advogado | Cotejo realizado |

---

## 8. REGRAS DE GOVERNANÇA DOCUMENTAL

### 8.1. Local lógico do contrato-base e dos anexos

- **Contrato-base (Modelo de Estudo Genealógico):** pasta `01_Modelos-e-Jurídico` no Shared Drive (referência de localização histórica; pasta não confirmada em verificação direta nesta sessão).
- **Anexos I a V (templates genéricos):** pasta `01_Modelos-e-Jurídico` no Shared Drive (referência de localização histórica; pasta não confirmada em verificação direta nesta sessão).
- **Contrato-base genérico v2:** pasta `01_Modelos-e-Jurídico` (classificado como INSUMO_COMPLEMENTAR_DE_COMPARACAO).
- **Modelo Simples e Modelo 2024:** pasta `01_Modelos-e-Jurídico` (classificados como REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL).

### 8.2. Local lógico de contrato específico por caso

- **Contrato específico por caso:** subpasta `00_Administração e Contrato` dentro da pasta do caso no Shared Drive.
- **Anexos preenchidos por caso:** subpasta `00_Administração e Contrato` dentro da pasta do caso.

### 8.3. Convenção recomendada de nome de arquivo

- Contrato específico: `[CASE_ID] — Contrato Específico — [Sobrenome da Família].pdf`
- Anexo I: `[CASE_ID] — Anexo I — Ordem de Serviço — [Sobrenome].pdf`
- Anexo II: `[CASE_ID] — Anexo II — Despesa [nº] — [Descrição].pdf`
- Anexo III: `[CASE_ID] — Anexo III — Autorização Pesquisa — [Órgão].pdf`
- Anexo IV: `[CASE_ID] — Anexo IV — Procuração — [Diligência].pdf`
- Anexo V: `[CASE_ID] — Anexo V — Alteração [nº] — [Tipo].pdf`

### 8.4. Regra de versão

- O Modelo de Estudo Genealógico possui versão datada (10/03/2026) e aprovada pelo advogado.
- Qualquer alteração no modelo-base requer nova aprovação jurídica e nova datação.
- Contratos específicos derivados devem registrar a versão/data do modelo-base utilizado.

### 8.5. Regra de arquivo histórico

- Modelo Simples e Modelo 2024: manter na pasta `01_Modelos-e-Jurídico` com marcação clara de REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL.
- Não mover, não renomear, não excluir.
- Não usar como base para novos contratos.

### 8.6. Regra para impedir uso de Modelo Simples e Modelo 2024

- Nenhum contrato específico pode ser derivado do Modelo Simples ou do Modelo 2024.
- Apenas o Modelo de Estudo Genealógico (aprovado pelo advogado) pode gerar contratos específicos.
- O contrato-base genérico v2 não pode gerar contratos; serve apenas para cotejo.

### 8.7. Regra de evidência para aceite, assinatura e autorizações

- Aceite comercial: registrado por escrito (WhatsApp, e-mail, call gravada, proposta assinada).
- Assinatura do contrato: comprovante de assinatura eletrônica (log/certificado) ou física (assinatura manual).
- Autorizações (Anexos II-V): assinadas e arquivadas na pasta `00_Administração e Contrato` do caso.
- A existência de um template não constitui prova de que ele foi preenchido, enviado, assinado ou aplicado a um caso.

### 8.8. Regra de não duplicidade entre Drive, dossiê e Dropbox

- O Google Drive (Shared Drive) é o ambiente operacional para clientes ativos.
- O Dropbox é backup/histórico; não é fonte operacional.
- Cada documento contratual deve existir em uma única localização ativa no Drive.
- O dossiê consolidado referencia os documentos contratuais; não os duplica.
- Cópias no Dropbox devem ser tratadas como versões aparentes, não como versões oficiais.

---

## 9. RISCOS, LACUNAS E PONTOS QUE REQUEREM REVISÃO JURÍDICA

### 9.1. Riscos identificados

| Risco | Gravidade | Descrição | Mitigação |
|---|---|---|---|
| Contrato sem cláusulas operacionais essenciais | ALTA | O Modelo de Estudo Genealógico aprovado não contém cláusulas de composição documental, despesas externas, cancelamento, comunicações, propriedade intelectual, assinatura eletrônica e procurações. A operação do Clube Ancestral depende dessas cláusulas. | Encaminhar cotejo (Seção 5) ao advogado para incorporação das cláusulas ausentes |
| Conflito de foro | ALTA | O Modelo de Estudo estabelece foro de São Paulo/SP; o genérico v2 estabelece foro no domicílio da Cliente. Conflito direto. | Advogado deve decidir qual foro adotar antes de qualquer assinatura |
| Assinatura eletrônica sem base contratual | ALTA | O Modelo de Estudo prevê apenas assinatura física. A operação digital do Clube depende de assinatura eletrônica. | Advogado deve revisar e incorporar cláusula de assinatura eletrônica |
| Forma de pagamento restrita | MEDIA | O Modelo de Estudo prevê apenas à vista ou 2 parcelas. A operação usa cobrança recorrente (Asaas). | Advogado deve flexibilizar a cláusula de pagamento |
| Pastas criadas antes do contrato assinado | MEDIA | As pastas do caso Ana Luiza foram criadas em pré-onboarding antes do contrato assinado, criando referência conflitante. | Validar conformidade do fluxo operacional |
| Divergência de ID não resolvida | MEDIA | Dois IDs para o mesmo caso sem resolução formal. | Resolver formalmente antes de preparar documentos |
| CNPJ e endereço da contratada não verificados | BAIXA | O genérico v2 traz CNPJ e endereço que podem estar desatualizados. | Verificar contrato social vigente |

### 9.2. Lacunas no Modelo de Estudo Genealógico

As seguintes cláusulas operacionais estão AUSENTES no Modelo de Estudo Genealógico e são necessárias para a operação do Clube Ancestral:

1. **Composição documental e prevalência da Ordem de Serviço** — necessária para arquitetura modular
2. **Despesas externas (aprovação, adiantamento, irreversibilidade)** — necessária para Anexo II
3. **Cancelamento, rescisão e direito de arrependimento** — necessária para relações de consumo
4. **Procurações e formalidades separadas** — necessária para Anexo IV
5. **Canais de comunicação (e-mail e WhatsApp)** — necessária para operação
6. **Propriedade intelectual** — necessária para proteção de métodos e sistemas
7. **Assinatura eletrônica, logs e prova** — necessária para operação digital

Todas as lacunas devem ser preenchidas pelo advogado com base no cotejo realizado. Nenhuma incorporação pode ser feita operacionalmente sem revisão jurídica prévia.

---

## 10. DEVOLUTIVA PADRONIZADA

```
CA-EVO-03 — DEVOLUTIVA PADRONIZADA
Projeto: Clube Ancestral
Prompt: CA-EVO-03 — Motor Contratual Modular
Data: 15/08/2026
Estado: CONCLUIDO_COM_REFINAMENTOS_PENDENTES

---

O QUE FOI ENTREGUE

1. Decisão de governança contratual
   - Modelo de Estudo Genealógico declarado como único contrato-base vigente
   - Modelo Simples e Modelo 2024 classificados como referência histórica sem uso operacional
   - Contrato-base genérico v2 classificado como insumo complementar de comparação
   - Governança vinculante registrada sem ambiguidade

2. Arquitetura documental modular
   - Matriz com 12 componentes documentais (modelo-base, contrato específico, Anexos I-V, modelos históricos, genérico v2, pastas)
   - 13 colunas por componente (papel, fonte, dados, gatilho, bloqueios, saída, estado global, estado por caso, evidência, não duplicidade, ação)
   - Arquitetura hierárquica: contrato-base → Anexo I (operacional) → Anexos II-V (condicionais)

3. Matriz de campos e fontes de verdade
   - 36 campos parametrizados mapeados
   - Cobertura completa: ID do caso, dados da contratante e contratada, escopo, titulares, entregas, valores, despesas, pesquisa, diligência, alterações, comunicações, assinatura
   - Fonte de verdade e responsável de validação definidos para cada campo
   - Status de cada campo no caso Ana Luiza

4. Gatilhos, bloqueios e evidências
   - 12 fluxos de gatilho mapeados (preparar contrato, revisar, assinar, Anexos I-V, pesquisa, Asaas, estrutura operacional)
   - Separação entre gatilhos obrigatórios, condicionais e bloqueios
   - Evidência necessária para cada condição
   - Status de cada gatilho no caso Ana Luiza

5. Cotejo jurídico-operacional
   - 14 temas comparados entre Modelo de Estudo Genealógico e genérico v2
   - 2 compatíveis, 2 parcialmente compatíveis, 6 ausentes no Modelo de Estudo, 2 conflitantes
   - 12 temas requerem revisão jurídica antes de qualquer adoção
   - Nenhuma sugestão de mudança tratada como aprovada

6. Aplicação ao caso Ana Luiza
   - Dados evidenciados registrados sem suposição
   - Estado do motor: contrato PENDENTE_DE_DADOS_E_PREPARACAO
   - Anexos II-V: PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO
   - Pesquisa e financeiro: BLOQUEADO_POR_GATILHO
   - ID canônico: PENDENTE_DE_CONFIRMACAO

7. Backlog e governança documental
   - 19 pendências catalogadas por prioridade (6 críticas, 6 altas, 7 médias)
   - Tipos: jurídico, dados, operacional, evidência, governança
   - Ação permitida e efeito definidos para cada pendência
   - 8 regras de governança documental definidas

---

DECISÕES VINCULANTES REGISTRADAS

- Contrato-base vigente: MODELO DE ESTUDO GENEALÓGICO aprovado pelo advogado.
- MODELO SIMPLES: referência histórica sem uso operacional.
- Modelo 2024: referência histórica sem uso operacional.
- Contrato-base genérico v2: insumo complementar de comparação; não é matriz substituta.
- Alterações de cláusulas: requerem revisão jurídica antes de qualquer adoção.

---

ESTADOS — GLOBAL X CASO

Estados por caso (Ana Luiza):
- Modelo de Estudo Genealógico — estado global: IMPLEMENTADO_E_ATIVO
- Contrato específico Ana Luiza — estado por caso: PENDENTE_DE_DADOS_E_PREPARACAO
- Anexo I — estado no caso Ana Luiza: PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO
- Anexos II, III, IV e V — estado no caso Ana Luiza: PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO
- Pesquisa externa — estado no caso Ana Luiza: BLOQUEADO_POR_GATILHO
- Asaas/financeiro — estado no caso Ana Luiza: BLOQUEADO_POR_GATILHO

Estados globais de evidência (disponibilidade verificável de cada template):
- Anexo I e Anexo III: IMPLEMENTADO_E_ATIVO
- Anexo II e Anexo IV: PENDENTE_DE_VERIFICACAO_DIRETA
- Anexo V: NAO_LOCALIZADO_NESTA_SESSAO
- Pasta 01_Modelos-e-Jurídico: NAO_LOCALIZADO_NESTA_SESSAO

Nota de evidência: Os estados por caso mostram o uso no caso específico, não a disponibilidade verificável de cada template. Os estados globais de evidência permanecem válidos em paralelo.

---

PENDÊNCIAS E BLOQUEIOS

1. Dados cadastrais da contratante pendentes — BLOQUEIA contrato específico e Anexo I
2. Dados oficiais da contratada não verificados — BLOQUEIA preenchimento do contrato
3. Divergência de ID do caso não resolvida — BLOQUEIA identificação documental unificada
4. Escopo não consolidado em instrumento — BLOQUEIA Anexo I
5. Responsável pelo caso não designado — BLOQUEIA Anexo I
6. 12 temas do cotejo requerem revisão jurídica (6 ausentes, 2 parcialmente compatíveis, 2 conflitantes, 2 compatíveis)
7. 2 conflitos diretos (foro e assinatura) — REQUEREM decisão jurídica
8. Anexos II e IV não localizados no Drive — PENDENTE_DE_VERIFICACAO_DIRETA
9. Anexo V: Doc ID retornou HTTP 404 — NAO_LOCALIZADO_NESTA_SESSAO
10. Pasta 01_Modelos-e-Jurídico não localizada — NAO_LOCALIZADO_NESTA_SESSAO
11. Método de assinatura eletrônica não definido — BLOQUEIA envio para assinatura
12. Pastas do caso criadas antes do contrato — PENDENTE de validação de conformidade

---

REVISÃO JURÍDICA NECESSÁRIA

- Composição documental e prevalência da Ordem de Serviço (AUSENTE no Modelo de Estudo)
- Despesas externas: aprovação, adiantamento, irreversibilidade (AUSENTE)
- Cancelamento, rescisão e direito de arrependimento (AUSENTE)
- Procurações e formalidades separadas (AUSENTE)
- Canais de comunicação — e-mail e WhatsApp (AUSENTE)
- Propriedade intelectual (AUSENTE)
- Assinatura eletrônica, logs e prova (CONFLITANTE — Modelo prevê assinatura física)
- Disposições finais e foro (CONFLITANTE — São Paulo/SP vs domicílio da Cliente)
- Flexibilização da forma de pagamento (Modelo prevê apenas à vista ou 2 parcelas)

---

SISTEMAS EXTERNOS PRESERVADOS

- Google Drive: não alterado
- CRM / Pipeline: não alterado
- Planejador Universal: não alterado
- Asaas: não alterado
- App Cliente / Ancestral Canvas: não alterado
- Desk Intelligence: não alterado
- Google Forms: não alterado
- Google Tasks: não alterado
- Google Calendar: não alterado
- Dropbox: não indexado, salvo autorização expressa e escopo específico

---

PRÓXIMA ABA

CA-EVO-04 — Dados Vivos e Integrações

CONDIÇÃO PARA AVANÇO:

- registrar as pendências que serão consumidas pelo CA-EVO-04;
- não avançar para criação, assinatura, cobrança, pesquisa ou ativação de caso sem os gatilhos correspondentes;
- manter o Modelo de Estudo Genealógico como única matriz jurídica vigente.
```

---

## CHECKLIST DE VERIFICAÇÃO CONTRA O PROMPT

| Requisito do prompt | Status | Observação |
|---|---|---|
| 1. Definir o único contrato-base vigente | ATENDIDO | Seção 1 |
| 2. Arquitetura entre contrato-base, OS e Anexos I a V | ATENDIDO | Seção 2 |
| 3. Campos parametrizáveis e fontes de verdade | ATENDIDO | Seção 3 |
| 4. Gatilhos e bloqueios para preenchimento, assinatura e uso | ATENDIDO | Seção 4 |
| 5. Fluxo por caso, com aplicação ao caso Ana Luiza | ATENDIDO | Seção 6 |
| 6. Separação entre estado global e estado por caso | ATENDIDO | Seções 2 e 6 |
| 7. Tratamento dos modelos descartados como referências históricas | ATENDIDO | Seções 1 e 8 |
| 6.1. Decisão de modelo vigente | ATENDIDO | Seção 1 |
| 6.2. Matriz de arquitetura documental (13 colunas, 12 componentes) | ATENDIDO | Seção 2 |
| 6.3. Matriz de campos parametrizáveis (10 colunas, cobertura completa) | ATENDIDO | Seção 3 |
| 6.4. Matriz de gatilhos e bloqueios (12 fluxos) | ATENDIDO | Seção 4 |
| 6.5. Cotejo de cláusulas (14 temas, 5 colunas) | ATENDIDO | Seção 5 |
| 6.6. Aplicação ao caso Ana Luiza | ATENDIDO | Seção 6 |
| 6.7. Backlog jurídico-operacional (8 colunas) | ATENDIDO | Seção 7 |
| 6.8. Recomendação de governança documental | ATENDIDO | Seção 8 |
| 7. Taxonomia de estados | ATENDIDO | Aplicada em todas as seções |
| 8. Forma da resposta (10 itens em ordem) | ATENDIDO | Seções 1-10 |
| 9. Devolutiva padronizada preenchida | ATENDIDO | Seção 10 |
| Não criar, editar, preencher, assinar, mover, arquivar ou excluir documentos | ATENDIDO | Nenhuma ação externa executada |
| Não presumir dados ausentes | ATENDIDO | Pendências registradas como PENDENTE_DE_DADO ou BLOQUEADO_POR_GATILHO |
| Registrar PENDENTE_DE_DADO ou BLOQUEADO_POR_GATILHO quando aplicável | ATENDIDO | Aplicado em todas as seções |

---

## ADENDO DE CORREÇÕES — 15/08/2026

As correções abaixo foram aplicadas ao documento após verificação direta no Google Drive e validação do advisor. Todas já estão refletidas nas seções anteriores.

| Item | Registro anterior | Correção aplicada | Estado correto |
|---|---|---|---|
| Anexo I — Ordem de Serviço | Referência à pasta 01_Modelos-e-Jurídico | Existência e conteúdo confirmados por exportação direta do Google Doc `1sK6c8qBi1dwlxo0ZSwV9TdqRRB517LXDyU-Si0OnRiA`; localização em pasta não confirmada nesta sessão | IMPLEMENTADO_E_ATIVO |
| Anexo II — Despesas Externas | Marcado como localizado com base em memória | Não localizado em busca direta no Drive; não declarar inexistência definitiva | PENDENTE_DE_VERIFICACAO_DIRETA |
| Anexo III — Autorização de Pesquisa | Template existente | Confirmado como template parametrizável para autorizações de pesquisa delimitadas | IMPLEMENTADO_E_ATIVO |
| Anexo IV — Procuração | Marcado como localizado com base em memória | Não localizado em busca direta no Drive; não declarar inexistência definitiva | PENDENTE_DE_VERIFICACAO_DIRETA |
| Anexo V — Alteração contratual | Marcado como existente por referência histórica | Doc ID `1oi1LS3P16HjXYu-2lmNGU1JhxRVzvoA_W-ohtT5PEuQ` retornou HTTP 404; ID obsoleto, arquivo removido ou acesso indisponível | NAO_LOCALIZADO_NESTA_SESSAO |
| Pasta 01_Modelos-e-Jurídico | Tratada como local central ativo | Busca direta pelo nome retornou zero resultados; manter apenas como referência histórica até verificação identificável | NAO_LOCALIZADO_NESTA_SESSAO |
| Contrato-Mãe Ana Luiza | Documento específico disponível | Exportação direta confirmou placeholder de 55 bytes, sem conteúdo contratual preenchido | PENDENTE_DE_DADOS_E_PREPARACAO |
| Pasta 00_Administração e Contrato do caso | Estrutura normal do caso | Estrutura criada em pré-onboarding antes de contrato assinado; exige validação de aderência ao fluxo | REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO |

Nenhum documento externo foi alterado. As correções são apenas de registro e estado no documento de especificação.
