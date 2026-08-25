# Clube Ancestral — Dicionário de Validações do Painel de Calls → CRM

**Versão:** 1.1  
**Projeto:** Clube Ancestral  
**Aba de referência:** CA 04 — CRM Mestre, Discovery e Handoff  
**Natureza:** especificação operacional e de governança; não executa alterações em sistemas.

---

## 1. Finalidade e limites

Este dicionário define os campos, listas controladas, regras de validação, dependências, visibilidades e responsabilidades que permitem ao **Painel de Calls** servir como camada de entrada, qualificação e handoff para o CRM/Desk do Clube Ancestral.

### 1.1 O que este documento define

- Vocabulário controlado para dropdowns e status.
- Critérios mínimos de cadastro, triagem, Discovery, proposta, formalização e handoff.
- Separação entre informação estruturada de CRM, conteúdo narrativo de Brief e evidências do dossiê/Desk.
- Regras de privacidade, consentimento, pesquisa prévia, dossiê, despesas de terceiros e marcos jurídicos.

### 1.2 O que este documento não faz

- Não cria CRM, Google Sheet, AppSheet, automação, link, preço, SKU, proposta, contrato ou cobrança.
- Não altera Painel de Calls, CRM legado, Asaas, Desk, App Cliente, one-page ou sistemas externos.
- Não migra dados.
- Não pesquisa fontes genealógicas, órgãos ou registros.
- Não oferece parecer jurídico, promessa de elegibilidade, resultado, cidadania, rota individual ou prazo.

---

## 2. Fontes de verdade e visibilidade

| Camada | Responsabilidade canônica | Não deve ser usada como |
|---|---|---|
| Painel de Calls / CRM | Entrada, qualificação, status comercial, handoff, responsável e próxima ação | Catálogo de preço, repositório documental ou parecer jurídico |
| Planilha Mestre | SKU, status de produto, escopo, preço homologado, condição e link de cobrança | Dossiê de cliente ou agenda de pesquisa |
| Asaas | Evento e status transacional de cobrança/pagamento | Fonte de escopo, evidência ou elegibilidade |
| Desk / dossiê autorizado | Caso, pesquisa, evidência, documento, pendência e histórico operacional | Catálogo comercial público |
| App Cliente / one-page | Conteúdo aprovado, jornada, entrega, progresso e próximo passo | Campo interno, preço provisório, SKU técnico, gravação, transcrição ou documento restrito |
| CRM legado | Histórico consultável | Fonte canônica de dados novos |

### Princípios

1. O Painel de Calls é a camada de **entrada e handoff**, não substitui as demais fontes.
2. Campos internos de triagem, risco, marco e pesquisa não devem ser projetados para App Cliente, one-page, PDF ou WhatsApp sem aprovação humana específica.
3. Um núcleo familiar pode possuir um dossiê-mãe compartilhado; cada requerente mantém registro CRM próprio.
4. Campos classificatórios devem usar lista controlada e rejeitar entrada fora do vocabulário permitido.
5. Texto livre é reservado para resumo, observação, narrativa, links internos e registros de exceção.

---

## 3. Dicionário de campos CRM v1.1

### 3.1 Identificação, origem e responsabilidade

| Campo | Tipo | Obrigatório em | Validação / regra |
|---|---|---:|---|
| ID da oportunidade | Texto automático | Entrada | Formato interno padronizado; não editar manualmente. |
| Data de entrada | Data | Entrada | Data válida. |
| Nome completo | Texto | Entrada | Obrigatório; usar nome civil informado quando disponível. |
| WhatsApp | Texto | Entrada | Formato padronizado quando disponível. |
| E-mail | E-mail | Diagnóstico | Formato de e-mail válido. |
| Origem do lead | Dropdown | Entrada | Lista `Origem do lead`. |
| Objetivo principal | Dropdown | Entrada | Lista `Objetivo principal`. |
| País/linha prioritária | Dropdown | Qualificação | Lista `País/linha prioritária`. |
| Nacionalidade de interesse | Dropdown controlado | Qualificação | Lista `Nacionalidade de interesse`; pode ser `Em investigação`. |
| Área responsável | Dropdown | Lead ativo | Comercial; Pesquisa; Operações; Financeiro; Jurídico/parceiro; A definir. |
| Responsável nominal | Referência a pessoa cadastrada | Lead ativo | Nome de pessoa cadastrada no CRM; não usar área, apelido ou texto genérico. |
| Data de atribuição | Data | Lead ativo | Data válida; não pode ser futura sem justificativa operacional. |
| Próxima ação | Dropdown | Lead ativo | Lista `Próxima ação`. |
| Data da próxima ação | Data | Lead ativo | Data válida e não anterior ao registro. |

**Regra inegociável:** nenhum lead ativo pode permanecer sem Área responsável, Responsável nominal e Próxima ação datada.

### 3.2 Call, consentimento e SPIN

| Campo | Tipo | Obrigatório em | Validação / regra |
|---|---|---:|---|
| Status da call | Dropdown | Quando houver call | Lista `Status da call`. |
| Data/hora da call | Data/hora | Call agendada/realizada | Data/hora válida. |
| Consentimento de gravação | Dropdown | Antes de gravar | Concedido; Recusado; Não aplicável; Não solicitado. |
| Data/hora do consentimento | Data/hora | Se Concedido ou Recusado | Obrigatória; deve preceder ou coincidir com a gravação. |
| Canal do consentimento | Dropdown | Se Concedido ou Recusado | WhatsApp; Formulário; Call gravada; E-mail; Outro. |
| Versão do aviso aplicado | Dropdown/texto controlado | Se gravação aplicável | Versão vigente de aviso aprovada pelo Clube. |
| Link da gravação/transcrição | URL interna | Se Concedido | Acesso interno restrito; proibido em App/one-page. |
| SPIN-S — Situação | Dropdown | Discovery | Não iniciado; Em andamento; Concluído; Não aplicável. |
| SPIN-P — Problema | Dropdown | Discovery | Não iniciado; Em andamento; Concluído; Não aplicável. |
| SPIN-I — Implicação | Dropdown | Discovery | Não iniciado; Em andamento; Concluído; Não aplicável. |
| SPIN-N — Necessidade/valor | Dropdown | Discovery | Não iniciado; Em andamento; Concluído; Não aplicável. |
| Resumo validado da call | Texto curto | Pós-Discovery | Síntese operacional; não inserir transcrição bruta. |

**Regra SPIN:** não marcar `Concluído` sem registro correspondente de: contexto/Situação, dor ou lacuna/Problema, consequência/Implicação, ou necessidade verbalizada/Necessidade-valor.

### 3.3 Triagem e contexto jurídico preliminar

| Campo | Tipo | Obrigatório em | Validação / regra |
|---|---|---:|---|
| Sinal de aderência preliminar | Dropdown | Pós-Discovery | Forte; Provável; Possível com pesquisa; Baixa; Inconclusiva; Sem aderência atual. |
| Confiança da triagem | Dropdown | Pós-Discovery | Alta — documentos-chave vistos; Média — narrativa + parte documental; Baixa — apenas relato inicial. |
| Via jurídica preliminar | Dropdown | Pós-Discovery | Lista `Via jurídica preliminar`. |
| Status da via | Dropdown | Pós-Discovery | Lista `Status da via`. |
| Marco jurídico de referência | Dropdown | Quando aplicável | Lista `Marco jurídico de referência`. |
| Fonte oficial do marco | URL interna/externa validada | Quando marco aplicável | Deve apontar para fonte oficial identificada pelo Desk. |
| Última verificação do marco | Data | Quando marco aplicável | Data válida. |
| Revisão humana/jurídica necessária? | Dropdown | Quando marco aplicável | Sim; Não. |
| Status de atualização do marco | Dropdown | Quando marco aplicável | Atualizado; A revisar; Desatualizado; Não aplicável. |
| Geração do ascendente identificado | Dropdown | Pós-Discovery | Lista `Geração do ascendente`. |
| Linha de transmissão | Dropdown | Pós-Discovery | Paterna; Materna; Mista; Linha única ainda não confirmada. |
| Risco de ruptura na linha | Dropdown | Pós-Discovery | Lista `Risco de ruptura`. |
| Complexidade documental | Dropdown | Pós-Discovery | Baixa; Média; Alta; Muito alta. |
| Estado documental inicial | Dropdown | Pós-Discovery | Lista `Estado documental inicial`. |
| Exige idioma/entrevista | Dropdown | Quando aplicável | Não; Sim — idioma; Sim — entrevista; Sim — ambos; A confirmar. |
| Número de requerentes potenciais | Número | Pós-Discovery | Inteiro positivo. |
| Estrutura familiar | Dropdown | Pós-Discovery | Individual; Casal; Núcleo familiar; Família ampliada; Linha com menores; A definir. |

**Regra de triagem:** `Sinal de aderência preliminar` é campo interno de triagem comercial/técnica. Não equivale a parecer jurídico, direito adquirido, elegibilidade confirmada, cidadania reconhecida, rota jurídica definida ou prazo. Nunca projetar este campo para App Cliente, one-page, PDF ou WhatsApp.

**Regra de marco:** o marco selecionado é referência interna de contexto. Não confirma direito, resultado, prazo ou via individual.

### 3.4 Pesquisa prévia e limites de atuação

| Campo | Tipo | Obrigatório em | Validação / regra |
|---|---|---:|---|
| Autorização para pesquisa prévia | Dropdown | Antes de pesquisa aplicável | Não solicitada; Pendente; Registrada; Não autorizada; Não aplicável. |
| Escopo autorizado | Dropdown | Se Registrada | Triagem pública; Documentos fornecidos; Pesquisa genealógica; Outro. |
| Observação de limite | Texto curto | Se houver limitação | Registrar escopo, restrição ou condição relevante. |

**Regra:** sem autorização aplicável, o CRM pode registrar dados de contato e informações da call, mas não deve disparar pesquisa nominal externa, pedido institucional, contato com órgão, solicitação de documento em nome da pessoa ou entrega personalizada.

### 3.5 Proposta, despesas de terceiros e lifecycle

| Campo | Tipo | Obrigatório em | Validação / regra |
|---|---|---:|---|
| Produtos/serviços recomendados | Dropdown múltiplo controlado | Proposta | Lista `Produtos/serviços`; referência ao catálogo, sem criar produto novo. |
| SKU recomendado | Referência controlada | Proposta | Apenas SKU ativo na Planilha Mestre. |
| Link da proposta | URL interna | Proposta enviada | Link do documento vigente. |
| Eixo Comercial | Dropdown | Entrada e atualização | Lista `Eixo Comercial`. |
| Eixo Formalização/Operação | Dropdown | Após proposta | Lista `Eixo Formalização/Operação`. |
| Resultado comercial | Campo derivado | Fechamento/relatório | Lista `Resultado comercial`; não substitui os dois eixos. |
| Motivo de perda | Dropdown | Se perdido | Lista `Motivo de perda`. |
| Status de despesas de terceiros | Dropdown | Proposta/execução | Lista `Status de despesas de terceiros`. |
| Regra de despesas | Dropdown fixo | Proposta | Cliente paga diretamente ao terceiro; Cliente antecipa valor aprovado; Clube não antecipa nem reembolsa despesas de terceiros. |
| Despesa vinculada à proposta? | Dropdown | Quando houver despesa | Sim; Não. |
| Aprovação do cliente registrada? | Dropdown | Quando houver despesa | Sim; Não; Pendente; Não aplicável. |
| Responsável pagador | Dropdown | Quando houver despesa | Cliente; Família/núcleo; Outro autorizado. |
| Faixa de despesas externas | Dropdown | Quando estimada | Sem estimativa; Até R$ 1.000; R$ 1.001–3.000; R$ 3.001–6.000; R$ 6.001–10.000; Acima de R$ 10.000; Sob consulta. |
| Status de pagamento inicial | Referência controlada | Formalização | Consultar fonte transacional autorizada; CRM não substitui Asaas. |

**Regra de despesas:** comprovante de terceiro não fica no Painel de Calls; fica apenas no dossiê operacional autorizado quando necessário.

### 3.6 Dossiê, acesso e handoff

| Campo | Tipo | Obrigatório em | Validação / regra |
|---|---|---:|---|
| ID do núcleo/família | Texto/referência | Estrutura familiar | Identificador único do núcleo. |
| ID individual do requerente | Texto/referência | Requerente | Identificador individual vinculado ao núcleo quando aplicável. |
| Dossiê-mãe do núcleo/família | Texto/referência | Onboarding/caso | Nome/ID canônico do dossiê-mãe. |
| Ambiente autorizado | Dropdown | Se dossiê existir | Drive compartilhado; Desk; Ambiente operacional aprovado; Outro autorizado. |
| Link interno | URL interna | Se dossiê existir | Link interno; não expor em App/one-page. |
| Nível de acesso | Dropdown | Se dossiê existir | Restrito; Equipe do caso; Cliente autorizado; Público histórico. |
| Responsável pelo dossiê | Referência a pessoa | Se dossiê existir | Pessoa cadastrada no CRM/Desk. |
| Status do dossiê | Dropdown | Onboarding/caso | Não criado; Em preparação; Ativo; Arquivado. |
| Link do contrato | URL interna | Se contrato aplicável | Link do instrumento vigente. |
| Link de gravação/transcrição | URL interna | Se consentimento concedido | Acesso interno restrito. |

**Regra:** um núcleo familiar pode compartilhar um dossiê-mãe, mas cada requerente mantém seu próprio registro CRM e seu vínculo com o núcleo.

---

## 4. Brief de Discovery por pessoa

O Brief de Discovery é complemento narrativo do CRM. Ele não deve ser transformado automaticamente em conjunto de campos obrigatórios.

### Deve conter

- ID da oportunidade.
- Nome do lead.
- Data/hora da call.
- Responsável.
- Roteiro-base.
- País/linha prioritária.
- Objetivo declarado.
- Dados recebidos antes da call.
- Documentos/links recebidos.
- Materiais ainda não localizados.
- Estrutura familiar resumida.
- Hipóteses e lacunas.
- Perguntas prioritárias.
- Perguntas que não devem ser repetidas.
- Risco de privacidade/gravação.
- Decisão esperada após a call.

**Regra:** narrativa detalhada, transcrição bruta, documentos, fontes, hipóteses de pesquisa e análise longa ficam no Brief/dossiê/Desk, não no CRM estruturado.

---

## 5. Matriz de campo → sistema responsável → visibilidade → validação

| Campo/grupo | Sistema responsável | Visibilidade | Requisito de validação |
|---|---|---|---|
| Identidade, origem, objetivo e call | Painel de Calls / CRM | Interna: Comercial e áreas autorizadas | Formato válido e dropdown controlado quando classificatório |
| Área responsável, responsável nominal e próxima ação | Painel de Calls / CRM | Interna: equipe autorizada | Obrigatórios para lead ativo |
| SPIN e resumo da call | Painel de Calls / CRM + Brief | Interna: Comercial | Status SPIN exige registro correspondente |
| Consentimento, aviso e link de gravação | CRM + ambiente interno de gravação | Restrita | Concedido e registrado antes de gravar; link interno restrito |
| Sinal de aderência, via e riscos | CRM | Restrita: Comercial/Desk autorizado | Campo interno; não é conclusão jurídica nem conteúdo de cliente |
| Marco jurídico e fonte oficial | Desk / base jurídica | Restrita: equipe autorizada | Fonte oficial, data de verificação e status de atualização |
| Pesquisa prévia | CRM + Desk | Restrita | Autorização e escopo antes de pesquisa aplicável |
| SKU, preço, condição e link de cobrança | Planilha Mestre / Asaas | Interna: Comercial/Financeiro | Apenas referência homologada; não digitar livremente no Painel |
| Proposta e contrato | Ambiente documental autorizado | Restrita: partes/equipe autorizada | Link interno e status separado por eixo |
| Pagamento inicial | Asaas | Interna: Financeiro/Operações | Evento transacional; CRM apenas referencia status |
| Despesas de terceiros | CRM + dossiê operacional | Interna: Comercial/Operações | Aprovação, responsável pagador e regra de não antecipação |
| Dossiê-mãe, documentos e evidências | Desk / ambiente autorizado | Restrita conforme nível de acesso | Um dossiê-mãe por núcleo; documentos fora do Painel |
| Conteúdo de jornada aprovado | App Cliente / one-page | Cliente autorizado | Apenas conteúdo aprovado; sem dados internos, SKU técnico ou evidência restrita |

---

## 6. Regras atualizadas de dependência e bloqueio

1. **Lead ativo:** Área responsável, Responsável nominal e Próxima ação datada são obrigatórios.
2. **Call realizada:** exige Resultado da Discovery, Resumo validado da call e Próxima ação datada.
3. **Consentimento recusado:** bloqueia gravação, transcrição e inclusão de link de gravação/transcrição.
4. **Consentimento não solicitado:** bloqueia ativação de gravação e inclusão de link.
5. **Consentimento concedido:** exige Data/hora, Canal e Versão do aviso aplicado.
6. **SPIN concluído:** exige registro correspondente no resumo ou Brief.
7. **Sinal Forte ou Provável:** exige Confiança da triagem, Via jurídica preliminar, Geração do ascendente e Estado documental inicial. Não autoriza linguagem jurídica conclusiva.
8. **Marco jurídico aplicável:** exige Fonte oficial, Última verificação, Revisão humana/jurídica necessária e Status de atualização.
9. **Marco desatualizado ou a revisar:** bloqueia comunicação externa que o apresente como atual sem revisão humana.
10. **Pesquisa aplicável:** Autorização para pesquisa prévia deve ser `Registrada`; sem isso, bloquear pesquisa nominal externa, pedido institucional, contato com órgão e solicitação em nome da pessoa.
11. **Despesa de terceiro aprovada:** exige Despesa vinculada à proposta, Aprovação do cliente registrada e Responsável pagador. Nunca registrar como desembolso/reembolso do Clube.
12. **Eixo Comercial = Proposta enviada:** exige Link da proposta e Responsável nominal.
13. **Eixo Formalização/Operação = Contrato assinado:** exige Link do contrato.
14. **Eixo Formalização/Operação = Pagamento inicial confirmado:** exige referência à fonte transacional autorizada.
15. **Resultado comercial = Convertido:** é derivado da condição comercial/formal definida pela operação; não substitui eventos separados de contrato, pagamento, onboarding e caso ativo.
16. **Resultado comercial = Perdido:** exige Motivo de perda.
17. **Status da via = Encerrada para novos pedidos:** bloqueia proposta de protocolo para a via; permitir somente diagnóstico, pesquisa de alternativa, nutrição ou encerramento, conforme decisão humana.
18. **Dossiê ativo:** exige Dossiê-mãe, Ambiente autorizado, Link interno, Nível de acesso e Responsável pelo dossiê.
19. **App/one-page:** bloquear projeção de sinal de aderência, confiança de triagem, risco de ruptura, consentimento, gravação, transcrição, links internos, documentos, despesas internas, SKU técnico, preço provisório e ranking.

---

## 7. LISTAS_BASE atualizada

### Área responsável
Comercial
Pesquisa
Operações
Financeiro
Jurídico/parceiro
A definir

### Origem do lead
Diagnóstico rápido site
Diagnóstico profundo site
WhatsApp orgânico
Instagram
Indicação
Google orgânico
Google Ads
Evento
Parceiro
Base antiga
Outro

### Objetivo principal
Cidadania
Pesquisa de origem
Genealogia/árvore
Memória familiar
Pós-cidadania
Documento específico
Outro

### Nacionalidade de interesse
Italiana
Portuguesa
Espanhola
Alemã
Austríaca
Polonesa
Húngara
Luxemburguesa
Croata
Romena
Europeia geral
Em investigação
Outra UE — validar antes de ofertar

### País/linha prioritária
Itália
Portugal
Espanha
Alemanha
Áustria
Polônia
Hungria
Luxemburgo
Croácia
Romênia
Multipaís
A definir

### Status da call
Agendada
Confirmada
Realizada
Remarcada
No-show
Cancelada pelo lead
Cancelada pelo Clube

### Consentimento de gravação
Concedido
Recusado
Não aplicável
Não solicitado

### Canal do consentimento
WhatsApp
Formulário
Call gravada
E-mail
Outro

### Status SPIN
Não iniciado
Em andamento
Concluído
Não aplicável

### Sinal de aderência preliminar
Forte
Provável
Possível com pesquisa
Baixa
Inconclusiva
Sem aderência atual

### Confiança da triagem
Alta — documentos-chave vistos
Média — narrativa + parte documental
Baixa — apenas relato inicial

### Via jurídica preliminar
Descendência/jus sanguinis
Reparação histórica
Linha materna judicial
Memória Democrática
Descendência direta
Recuperação de nacionalidade
Naturalização/residência
Via familiar
Via a confirmar
Sem via identificada

### Status da via
Aberta
Aberta com requisito específico
Aberta com prazo
Restrita
Encerrada para novos pedidos
Em confirmação jurídica
Não aplicável

### Status de atualização do marco
Atualizado
A revisar
Desatualizado
Não aplicável

### Revisão humana/jurídica necessária?
Sim
Não

### Autorização para pesquisa prévia
Não solicitada
Pendente
Registrada
Não autorizada
Não aplicável

### Escopo autorizado
Triagem pública
Documentos fornecidos
Pesquisa genealógica
Outro

### Geração do ascendente
Pai/mãe
Avô/avó
Bisavô/bisavó
Trisavô/trisavó
Tetravô/tetravó ou anterior
Ainda não identificado

### Linha de transmissão
Paterna
Materna
Mista
Linha única ainda não confirmada

### Risco de ruptura
Nenhum identificado
Naturalização estrangeira
Divergência de nomes/datas
Casamento/estado civil
Linha materna pré-1948
Adoção/reconhecimento
Falta de certidão
Perseguição/prova histórica
Outro
Em investigação

### Complexidade documental
Baixa
Média
Alta
Muito alta

### Estado documental inicial
Documentos-chave disponíveis
Documentos parciais
Só informações orais
Árvore/nomes sem certidões
Sem dados suficientes

### Exige idioma/entrevista
Não
Sim — idioma
Sim — entrevista
Sim — ambos
A confirmar

### Eixo Comercial
Novo lead
Triagem
Discovery agendada
Discovery realizada
Diagnóstico em elaboração
Proposta enviada
Negociação
Nutrição
Perdido
Encerrado sem aderência

### Eixo Formalização/Operação
Não iniciado
Contrato enviado
Contrato assinado
Pagamento inicial confirmado
Cliente ativo
Onboarding iniciado
Caso ativo
Arquivado

### Resultado comercial
Em aberto
Em negociação
Convertido
Nutrição
Perdido — preço
Perdido — elegibilidade
Perdido — documentos
Perdido — timing
Perdido — sem retorno
Perdido — concorrente

### Motivo de perda
Preço
Elegibilidade
Documentação
Prazo
Sem resposta
Escolheu concorrente
Mudança de prioridade
Falta de decisor
Outro

### Status de despesas de terceiros
Não aplicável
Estimativa pendente
Estimadas e comunicadas
Aguardando aprovação
Aprovadas
Pagas diretamente pelo cliente
Parcialmente pagas
Pendência do cliente

### Despesa vinculada à proposta?
Sim
Não

### Aprovação do cliente registrada?
Sim
Não
Pendente
Não aplicável

### Responsável pagador
Cliente
Família/núcleo
Outro autorizado

### Regra de despesas
Cliente paga diretamente ao terceiro
Cliente antecipa valor aprovado
Clube não antecipa nem reembolsa despesas de terceiros

### Ambiente autorizado
Drive compartilhado
Desk
Ambiente operacional aprovado
Outro autorizado

### Nível de acesso do dossiê
Restrito
Equipe do caso
Cliente autorizado
Público histórico

### Status do dossiê
Não criado
Em preparação
Ativo
Arquivado

### Próxima ação
Confirmar call
Enviar checklist
Solicitar documentos
Revisar documentos
Preparar diagnóstico
Enviar proposta
Cobrar retorno
Enviar contrato
Confirmar pagamento
Iniciar onboarding
Encerrar
Outro

---

## 8. Campos novos, alterados e removidos

| Situação | Campo v1.1 | Tratamento |
|---|---|---|
| Alterado | Responsável atual | Substituído por Área responsável, Responsável nominal e Data de atribuição. |
| Alterado | Elegibilidade preliminar | Renomeado para Sinal de aderência preliminar, com regra explícita de não conclusão jurídica. |
| Alterado | Consentimento de gravação (checkbox) | Substituído por status, data/hora, canal, versão do aviso e link interno condicionado. |
| Alterado | Link do dossiê/pasta do caso | Desdobrado em Dossiê-mãe, Ambiente autorizado, Link interno, Nível de acesso, Responsável e Status. |
| Alterado | Etapa do funil | Separada em Eixo Comercial e Eixo Formalização/Operação. |
| Alterado | Resultado comercial | Tornado campo derivado, separado dos eventos operacionais. |
| Mantido e ampliado | Marco jurídico de referência | Adicionados fonte oficial, última verificação, revisão humana/jurídica e status de atualização. |
| Mantido e ampliado | Despesas de terceiros | Adicionados vínculo com proposta, aprovação registrada e responsável pagador. |
| Novo | Autorização para pesquisa prévia | Controla limites antes de pesquisa externa aplicável. |
| Novo | Escopo autorizado | Define Triagem pública, Documentos fornecidos, Pesquisa genealógica ou Outro. |
| Novo | Observação de limite | Registra restrição de pesquisa. |
| Novo | ID do núcleo/família | Vincula requerentes sem duplicar dossiê. |
| Novo | ID individual do requerente | Preserva individualidade do processo dentro do núcleo. |
| Novo | Brief de Discovery por pessoa | Mapeamento narrativo complementar, fora do CRM estruturado. |
| Alterado | SPIN checkbox | Convertido em status Não iniciado / Em andamento / Concluído / Não aplicável. |
| Removido | Checkbox simples de gravação | Absorvido pela estrutura de consentimento detalhada. |
| Removido | Responsável único genérico | Substituído pela estrutura Área + Pessoa + Data. |

---

## 9. Changelog v1.0 → v1.1

1. Substituído `Responsável atual` por Área responsável, Responsável nominal e Data de atribuição.
2. Criada regra de completude para lead ativo: área, pessoa responsável e próxima ação datada.
3. Renomeada `Elegibilidade preliminar` para `Sinal de aderência preliminar`.
4. Incluída trava explícita contra interpretação jurídica ou projeção externa do sinal de aderência.
5. Ampliado Marco jurídico de referência com fonte oficial, data de verificação, revisão humana/jurídica e status de atualização.
6. Substituído checkbox de consentimento por estrutura rastreável de consentimento, canal, data/hora, aviso e link interno.
7. Incluídas regras de bloqueio para consentimento Recusado e Não solicitado.
8. Criados Autorização para pesquisa prévia, Escopo autorizado e Observação de limite.
9. Criada trava contra pesquisa nominal externa sem autorização aplicável.
10. Substituído link isolado do dossiê por estrutura de dossiê-mãe, ambiente, link interno, acesso, responsável e status.
11. Separado lifecycle em Eixo Comercial e Eixo Formalização/Operação.
12. Transformado Resultado comercial em campo derivado, sem substituir contrato, pagamento, onboarding e caso ativo.
13. Ampliadas despesas de terceiros com vínculo de proposta, aprovação e responsável pagador.
14. Formalizada a regra de que comprovantes de terceiros ficam no dossiê operacional autorizado, não no Painel de Calls.
15. Criada seção de Brief de Discovery por pessoa, com distinção explícita entre narrativa/evidência e CRM estruturado.
16. Substituídos checkboxes SPIN por estados de execução com regra de evidência correspondente.
17. Atualizada LISTAS_BASE para cobrir os novos campos e os eixos separados.

---

## 10. Pontos que exigem decisão humana futura

1. Definir a fonte e o formato canônico de `Responsável nominal` (lista de usuários do CRM, diretório interno ou outra referência aprovada).
2. Homologar a versão vigente do aviso de gravação e os canais aceitos de consentimento.
3. Definir quais casos exigem autorização para pesquisa prévia e qual texto/documento registra cada escopo.
4. Definir quem pode sinalizar `Revisão humana/jurídica necessária = Não` e com qual periodicidade os marcos serão revisados.
5. Homologar a lista de Marcos jurídicos de referência e suas fontes oficiais no Desk/base jurídica.
6. Definir a condição operacional exata para que `Resultado comercial = Convertido` seja derivado.
7. Definir o ambiente autorizado padrão do dossiê-mãe e a política de nível de acesso por perfil.
8. Definir o identificador canônico de núcleo/família e de requerente individual.
9. Definir como o Painel de Calls receberá somente referências de SKU, proposta, contrato e status de pagamento sem duplicar as fontes de verdade.
10. Definir a política de retenção, arquivamento e acesso de transcrições/gravações.
11. Confirmar quais listas terão dependência por país, via jurídica ou etapa antes de qualquer implementação.
12. Validar o vocabulário de perda, objeção e próxima ação com SDR, Closer, Pesquisa, Operações e Financeiro antes de congelar listas.

---

## 11. Critérios de aceite v1.1

A implementação futura deverá demonstrar que:

- O Painel de Calls permanece como entrada e handoff.
- Planilha Mestre, Asaas, Desk e App mantêm fontes de verdade separadas.
- Triagem comercial não se transforma em conclusão jurídica.
- Pesquisa externa aplicável não é iniciada sem autorização registrada.
- Gravação, transcrição, dossiê, documentos e links internos não vazam para App Cliente ou one-page.
- Não há criação automática de produto, preço, SKU, proposta, contrato, cobrança, automação ou sistema a partir deste documento.
