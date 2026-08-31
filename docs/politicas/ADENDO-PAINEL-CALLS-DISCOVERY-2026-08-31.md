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

> **Nota ao arquivar (31/08/2026) — achados da verificação no GitHub:** o
> Painel de Calls **existe, está implementado em código e usa a mesma
> espinha dorsal de persistência já documentada no Mapa de Autoridade Admin
> (seção Comercial/Leads)** — não é um sistema paralelo não auditado.
> Resposta linha a linha à tabela "Estado que falta verificar" abaixo:
>
> | Questão | Resposta encontrada |
> |---|---|
> | Onde está a aba? | Rota `/calls` (`src/routes/_authenticated/calls.tsx`) → componente `PainelCalls` (`src/components/crm/painel-calls.tsx`, 484 linhas). Rota irmã só de leitura: `/governanca/dicionario-calls-crm` (`governanca.dicionario-calls-crm.tsx`) — reproduz em tela o próprio dicionário de campos/listas/regras de bloqueio de `src/lib/dicionario-calls-crm.ts` (448 linhas), a mesma referência dos arquivos `Dicionario_Validacoes_Painel_Calls_CRM` citados nas fontes deste adendo. |
> | Quais campos estão efetivamente disponíveis? | Os campos do lead (`LeadDesk`, em `src/lib/crm-desk.ts`) cobertos por `validarLead`/`errosBloqueantesAlteracao` — identificação, origem, objetivo, status/data/consentimento da call, resumo validado, sinal de aderência, via jurídica preliminar, geração do ascendente, próxima ação/prazo, entre outros da mesma lista descrita neste adendo. |
> | Qual botão salva? | `useMutation` em `painel-calls.tsx` (linha ~89) chamando `salvar({data:{id, valores}})`, onde `salvar = useServerFn(salvarLeadDesk)`. |
> | Onde os dados são gravados? | Tabela `leads` (Supabase/Postgres) — a mesma tabela já classificada no Mapa como `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` na seção Comercial/Leads. Não há tabela paralela para Calls. |
> | Qual é a chave? | `id` do lead (uuid) + `organization_id`. Update passa por `gravarComVerificacao` (grava → confirma linha afetada → relê pelo mesmo `id`+`organization_id` → compara). Insert de lead novo usa `.insert()` direto com checagem de `error`, mas **sem** a releitura de verificação de `inserirComVerificacao` — diferença pontual a corrigir se este caminho for priorizado. |
> | O que cria o handoff? | `avaliarHandoffCall(lead)` em `src/lib/painel-calls.ts` (linha 120) — função pura que combina `bloqueiosRegistroCall` + `bloqueiosQualificacao` + `handoffLead` (esta última em `src/lib/crm-desk.ts`, linha 1027) e deriva `destino: "proposta" \| "nutricao" \| "encerrar_sem_aderencia" \| "indefinido"` a partir de `discovery_resultado`. É avaliação/roteamento em memória sobre o próprio lead — **não** grava um evento de handoff nem materializa proposta/caso automaticamente; isso ficaria a cargo de uma ação comercial separada (já existente e documentada: `salvarProposta`, em `comercial.functions.ts`, corrigida na PR #39). |
> | Onde entra o WhatsApp? | `VarreduraWhatsApp` (`src/components/crm/varredura-whatsapp.tsx`) — parsing local via `varrerConversa`, **confirmado pelo próprio comentário do arquivo como não persistente**: "Nada é preenchido sozinho e nada é gravado (...) não vai para o banco, não vira rascunho, não é enviada a lugar nenhum." O dump nunca chega à tabela `leads` automaticamente; o campo de gravação/transcrição (`gravacao_link_interno`) é preenchido manualmente e fica bloqueado sem `consentimento_status = "concedido"` (regra em `bloqueiosRegistroCall`). |
> | Há persistência? | Sim para o caminho de update (via `gravarComVerificacao`, com releitura real); parcial para o caminho de criação de lead novo (insert com checagem de erro, sem releitura de verificação). Nenhum dos dois foi homologado manualmente em preview até o momento deste registro. |
> | Há continuidade? | `filasCalls`/`resumoCalls` (`src/lib/painel-calls.ts`) recalculam as filas do painel (hoje, aguardando registro, qualificação pendente, pronto para handoff, sem agenda) a partir do mesmo array de leads relido do banco — não há tabela de fila separada nem estado que possa divergir da fonte. Próxima ação e responsável são campos do próprio lead, os mesmos que alimentariam Painel Ops/Caso 360 se e quando o lead virar caso.
>
> **Conclusão:** o Painel de Calls não precisa de mapeamento como sistema novo — é uma segunda superfície (`/calls`) sobre a mesma tabela e função de persistência que a seção Comercial/Leads do Mapa já cobre (`listarLeadsDesk`/`salvarLeadDesk`). A rota `/governanca/dicionario-calls-crm` corresponde diretamente aos arquivos de dicionário citados como fonte deste adendo, publicados como referência somente-leitura dentro do próprio app. Ação mínima recomendada (não executada aqui, aguarda autorização): acrescentar uma linha de referência cruzada na seção Comercial do Mapa apontando `/calls` → mesma tabela/função já documentada, e registrar a lacuna pontual do insert sem releitura de verificação.

## Correção

O Painel de Calls e Discovery **já existe como aba/linha operacional** do Clube Ancestral, vinculada ao domínio:

```text
CA 04 — CRM Mestre, Discovery e Handoff
```

A afirmação anterior deve ser corrigida. Não é adequado descrevê-lo apenas como "materiais de discovery no Drive" ou como uma funcionalidade a criar do zero.

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

*(Respondida linha a linha na nota de arquivamento acima, com evidência de arquivo e linha.)*

## Próximos passos

1. Adicionar este adendo ao inventário consolidado. *(feito — ver `INVENTARIO-CONSOLIDADO-PROMPTS-FASES-2026-08-31.md`)*
2. Localizar o Painel de Calls no GitHub e nos conectores autorizados de Google Drive/AppSheet. *(feito para GitHub — ver nota de arquivamento; não há evidência de implementação paralela em AppSheet/Sheets no repositório)*
3. Produzir uma linha de mapa por campo/ação crítica: entrada, call, consentimento, SPIN, resumo, próxima ação, proposta e handoff. *(pendente — depende de decisão sobre adicionar linha própria ao Mapa ou manter como referência cruzada à seção Comercial/Leads já existente)*
4. Classificar cada elemento como formulário persistente, lista, referência, função sem UI, UI sem persistência, integração pendente ou ação externa. *(pendente, mesma dependência acima)*
5. Somente depois decidir ajustes de grupo/abas ou novos indicadores sobre Calls/Discovery.
