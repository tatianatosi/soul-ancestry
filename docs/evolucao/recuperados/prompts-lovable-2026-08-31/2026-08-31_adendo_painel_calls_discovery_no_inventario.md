# Adendo ao inventário — Painel de Calls e Discovery já existente

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: correção de inventário e mapeamento operacional
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - 05_CA04_CRM_DISCOVERY_HANDOFF/Dicionario_Validacoes_Painel_Calls_CRM_v1.1.md
  - 05_CA04_CRM_DISCOVERY_HANDOFF/Dicionario_Validacoes_Painel_Calls_CRM_v1.0_base.md
  - Inventário consolidado — Prompts anteriores, fases, estado e próximos passos
escopo:
  - corrigir a omissão sobre a existência do Painel de Calls e Discovery
  - registrar sua função prevista, fontes de verdade e limites
  - separar especificação operacional de validação de implementação no aplicativo
premissas:
  - os documentos recuperados comprovam que existe uma aba/linha de trabalho denominada Painel de Calls / CRM / Discovery / Handoff
  - os documentos são especificações operacionais e não provam, por si só, que cada campo, automação ou integração esteja implementado e persistindo no aplicativo atual
limites:
  - não altera o Painel de Calls, CRM, AppSheet, Google Sheets, Desk, App Cliente, Drive, Asaas ou WhatsApp
  - não afirma existência de rota web, tabela Supabase ou integração automática sem verificação direta adicional
próximos passos:
  - localizar a implementação concreta do Painel de Calls no GitHub e/ou Google AppSheet/Sheets
  - mapear formulário, campos, handlers, fonte de dados, persistência e handoff para Caso 360
  - verificar a regra de armazenamento e visibilidade do dump/transcrição de WhatsApp
critério de aceite:
  - demonstrar entrada de lead/call, salvamento, releitura, atualização após refresh e handoff rastreável para o caso ou oportunidade correta
substitui:
  - a formulação anterior que tratava Painel de Calls e Discovery apenas como materiais do Drive sem reconhecer a aba existente
```

## Correção

O Painel de Calls e Discovery **já existe como aba/linha operacional** do Clube Ancestral, vinculada ao domínio:

```text
CA 04 — CRM Mestre, Discovery e Handoff
```

A afirmação anterior deve ser corrigida. Não é adequado descrevê-lo apenas como “materiais de discovery no Drive” ou como uma funcionalidade a criar do zero.

O que ainda exige checagem é o seu estado de implementação atual: os documentos recuperados definem a estrutura operacional e as regras, mas não demonstram sozinhos qual interface está ativa hoje, onde grava, se persiste ou como o handoff chega ao Caso 360.

## Papel canônico definido

Segundo os documentos de referência, o Painel de Calls é a camada de:

```text
entrada
→ qualificação
→ Discovery
→ responsável
→ próxima ação
→ handoff para CRM/Desk
```

Ele não substitui as fontes canônicas de outros domínios:

| Domínio | Fonte de verdade indicada | Papel do Painel de Calls |
|---|---|---|
| Entrada, qualificação, status comercial, responsável e handoff | Painel de Calls / CRM | Fonte operacional de entrada e condução comercial |
| SKU, preço, condição e link de cobrança | Planilha Mestre | Painel somente referencia itens homologados; não cria preço/SKU livre |
| Cobrança, pagamento e assinatura | Asaas | Painel pode registrar referência/status, não substitui o dado transacional |
| Caso, pesquisa, evidências, documentos e pendências | Desk/Dossiê | Painel entrega contexto por handoff; não vira repositório de evidências |
| Conteúdo liberado ao cliente | App Cliente/One Page | Painel não projeta dados internos, gravações ou triagem ao cliente |

## Estrutura de formulário prevista

O dicionário v1.1 define campos estruturados para a operação de Calls/Discovery, incluindo:

```text
Identificação do lead/oportunidade
Origem do lead
Objetivo principal
País/linha/nacionalidade de interesse
Área responsável e responsável nominal
Status, data/hora e consentimento da call
Roteiro SPIN
Resumo validado da call
Sinal de aderência preliminar e nível de confiança
Via jurídica preliminar e marco de referência
Estrutura familiar e geração do ascendente
Estado documental inicial, riscos e pendências
Produtos/SKUs recomendados por referência controlada
Eixo comercial e eixo de formalização/operação
Próxima ação e data da próxima ação
Dossiê-mãe, ambiente autorizado e link interno
```

O Brief de Discovery é complementar e narrativo. Ele deve guardar resumo, hipóteses, lacunas, perguntas, documentos/links recebidos, estrutura familiar e decisão esperada; não deve ser confundido com o cadastro estruturado do CRM.

## Roteiro de Discovery e WhatsApp

O Painel de Calls deve funcionar como ponto de organização do Discovery, não como depósito de conteúdo bruto.

### Uso permitido do dump/transcrição

```text
WhatsApp/call
→ evidência bruta e referência interna
→ resumo estruturado da Discovery
→ fatos, hipóteses, pendências e próximos passos
→ responsável e prazo
→ handoff para oportunidade/caso
```

### Regras registradas

- Gravação/transcrição exige consentimento registrado antes de gravar.
- Link de gravação/transcrição deve ser interno e restrito.
- Não publicar dump, transcrição, links internos, dados de triagem ou dados sensíveis no App Cliente/one-page.
- Não transformar mensagem bruta de WhatsApp em conclusão jurídica, elegibilidade definitiva, preço ou escopo contratado.
- Um dump de WhatsApp deve estar ligado a `lead_id`, `opportunity_id` ou `case_id` conforme o estágio; não criar uma lista paralela sem vínculo.

## Posição no fluxo unificado

O Painel de Calls/Discovery pertence ao início da jornada:

```text
Lead
→ Painel de Calls / CRM
→ Discovery estruturada
→ oportunidade
→ proposta
→ aceite
→ caso canônico
→ Caso 360
```

Ele deve alimentar a próxima ação e o handoff, mas não criar um segundo caso, dossiê, contrato ou onboarding.

## Estado que falta verificar

Para atualizar o inventário com precisão, é necessário localizar o Painel de Calls na implementação atual e responder:

| Questão | Evidência necessária |
|---|---|
| Onde está a aba? | Rota web, planilha, AppSheet ou outro ambiente ativo |
| Quais campos estão efetivamente disponíveis? | Captura/estrutura da interface e arquivo de definição |
| Qual botão salva? | Handler/mutation/AppSheet action/Apps Script |
| Onde os dados são gravados? | Tabela Supabase, Google Sheet, AppSheet datasource ou CRM |
| Qual é a chave? | `lead_id`, `opportunity_id`, `case_id`, e relação com organização |
| O que cria o handoff? | Evento, função, tabela ou atualização de pipeline/caso |
| Onde entra o WhatsApp? | Link, anexo, campo restrito, resumo ou armazenamento documental |
| Há persistência? | Salvar → reler → refresh/reabertura → confirmar dados |
| Há continuidade? | Próxima ação, responsável e prazo reaparecem no Painel Ops/Caso 360 quando aplicável |

## Próximos passos

1. Adicionar este adendo ao inventário consolidado.
2. Localizar o Painel de Calls no GitHub e nos conectores autorizados de Google Drive/AppSheet.
3. Produzir uma linha de mapa por campo/ação crítica: entrada, call, consentimento, SPIN, resumo, próxima ação, proposta e handoff.
4. Classificar cada elemento como formulário persistente, lista, referência, função sem UI, UI sem persistência, integração pendente ou ação externa.
5. Somente depois decidir ajustes de grupo/abas ou novos indicadores sobre Calls/Discovery.
