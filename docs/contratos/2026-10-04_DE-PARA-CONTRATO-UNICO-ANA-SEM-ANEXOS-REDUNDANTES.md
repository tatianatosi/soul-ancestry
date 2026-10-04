# De-para — contrato único da Ana, sem anexos iniciais redundantes (04/10/2026)

Decisão da Proprietária: *"contrato único da Ana, sem anexos iniciais redundantes"* e, no mesmo
dia, *"execute também em relação a todos os anexos, não somente ao anexo 1"*.

Commit de referência citado por ela: `deb36da6` (família canônica Anexo I a V). Este documento
registra o que mudou depois, sobre o `main` atual.

## 1. O defeito, medido antes de executar

O corpo renderizado do contrato (`renderCorpoContratual`, `src/lib/contrato-corpo.server.ts`)
continha: cabeçalho e versão, perfil institucional, preâmbulo, as 16 cláusulas fixas, os anexos
e a matriz de 16 blocos. **Nenhum dado do caso.**

Quem são as partes, o escopo de cada pessoa, o valor, a forma de pagamento e os vencimentos
apareciam **somente dentro do Anexo I**. Daí as três consequências que ela descreveu:

1. sem instância do Anexo I, o motor concluía "sem Anexo I não há escopo contratado" — falso,
   porque o escopo está na proposta aprovada e nos parâmetros do caso;
2. os quatro anexos condicionais (II, III, IV, V) apareciam como pendência de contratação, mesmo
   sem despesa concreta, sem ato externo, sem órgão exigindo procuração e sem alteração de escopo;
3. a cobertura por pessoa inferia dependência a partir de valor zero e atribuía a pessoa ao
   primeiro titular quando não havia vínculo — proibido por instrução expressa.

## 2. De-para dos campos: fonte → destino no contrato

Estado medido no caso `CA-CID-AT-FAM-2026-001` em 04/10/2026.

| Campo | Fonte do caso | Destino no contrato | Renderizado? | Pendência real | Bloqueia assinatura inicial? |
|---|---|---|---|---|---|
| Qualificação da contratada | `contract_parameter_values.contratada_qualificacao` + perfil institucional versionado | Bloco "Qualificação das partes" · cláusula 1 | sim | — | sim, se ausente |
| Partes e papéis | `nucleo_membros.papel_no_caso` (função canônica) | Bloco "Qualificação das partes" · cláusula 1 | sim | 1 membro de núcleo **sem nome** (ordem 0) | sim |
| Dependente e representação | `case_dependents.titular_responsavel_legal_nome` + `status_representacao` | Bloco "Qualificação das partes" · cláusula 1 | sim | Felipe com representação `pendente` | sim |
| Objeto do caso | `objeto_contrato` | Bloco "Objeto deste caso" · cláusula 2 | sim | — | sim, se ausente |
| País e rota | `pais_rota` | Bloco "Objeto deste caso" · cláusula 2 | sim | — | sim, se ausente |
| Escopo aprovado | `escopo_resumo` (origem proposta) | Bloco "Objeto deste caso" · cláusula 2 | sim | — | sim, se ausente |
| Escopo individual por pessoa | `case_commercial_condition.approved_items` | Bloco "Escopo individual e familiar" · cláusula 3 | sim | — | sim, se ausente |
| Serviços incluídos | `servicos_incluidos` | Bloco "Serviços incluídos e excluídos" · cláusula 3 | sim | — | sim, se ausente |
| Serviços excluídos | `servicos_excluidos` | Bloco "Serviços incluídos e excluídos" · cláusula 3 | **não** | **vazio** — exclusões não especificadas | **sim** |
| Fases e entregas | `fases_entregas` | Bloco "Entregas, fases e encerramento" · cláusula 11 | sim | — | sim, se ausente |
| Valor total | `case_commercial_condition.fees` | Bloco "Valor e responsabilidades" · cláusula 8 | sim | — | sim, se ausente |
| Distribuição por pessoa | `approved_items[].valor` | Bloco "Valor e responsabilidades" · cláusula 8 | sim | — | sim, se ausente |
| Responsáveis financeiros | `case_commercial_condition.responsaveis_financeiros` | Bloco "Valor e responsabilidades" · cláusula 8 | sim | **divergência de nome** (abaixo) | sim |
| Forma de pagamento | `forma_pagamento` | Bloco "Pagamento, parcelas e vencimentos" · cláusula 8 | sim | — | sim, se ausente |
| Parcelas | `parcelas` | Bloco "Pagamento, parcelas e vencimentos" · cláusula 8 | sim | — | sim, se ausente |
| Vencimentos | `vencimentos` | Bloco "Pagamento, parcelas e vencimentos" · cláusula 8 | sim | — | sim, se ausente |
| Prazo e dependências | `prazos_referencia` | Bloco "Prazo e dependências" · cláusula 10 | **não** | vazio | **não** |
| Regra de despesas | texto institucional (`CLAUSULA_DESPESAS_TERCEIROS`) | Bloco "Despesas de terceiros" · cláusula 9 | sim | — | não |
| Despesas do caso | `despesas_externas` | Bloco "Despesas de terceiros" · cláusula 9 | **não** | nenhuma despesa concreta | **não** |
| Proposta de origem | `case_commercial_condition.proposal_reference` | Bloco "Referência da proposta" · cláusula 14 | sim | — | sim, se ausente |

Critério verificável: o valor específico aparece no HTML renderizado da prévia, não só o título da
cláusula. O mesmo renderizador serve prévia e documento — não há segundo caminho.

## 3. Aplicabilidade dos cinco anexos — a mesma regra para todos

| Anexo | Regra | Só se aplica quando | Ausente bloqueia assinatura inicial? |
|---|---|---|---|
| I — Ordem de Serviço | incorporado ao corpo | — (conteúdo está nos blocos de escopo, serviços, entregas, valor e pagamento) | **não** |
| II — Despesas externas | condicionado a despesa concreta | existe despesa de terceiro prevista, estimada ou aprovada | **não** |
| III — Autorização de pesquisa | condicionado a ato externo | há ação externa específica a autorizar | **não** (bloqueia pesquisa externa) |
| IV — Procuração | condicionado a exigência de órgão | um órgão/país exige instrumento próprio | **não** |
| V — Alteração de escopo | condicionado a alteração posterior | houve mudança de escopo depois da contratação | **não** |

Nenhum anexo foi apagado. Os nove códigos retirados por duplicidade em `deb36da6`
(`ANX-*` e `ANEXO_A`–`D`) continuam arquivados com motivo, e não foram recriados.

Estado usado para a não aplicabilidade: `nao_aplicavel`, que já existe em `ESTADOS_ANEXO` —
nunca `aprovado` nem `completed` para esconder ausência de documento.

## 4. Pendências reais de assinatura inicial do caso da Ana

1. **Serviços excluídos não especificados** (`servicos_excluidos` vazio). Exige revisão humana:
   o que está fora do escopo não se infere do que está dentro.
2. **Representação do dependente Felipe** com status `pendente`. Menor não assina; a
   representação precisa estar registrada e confirmada antes de qualquer ato.
3. **Membro de núcleo sem nome** (`nucleo_membros`, ordem 0, papel contratante). Uma parte sem
   nome não pode constar do contrato.
4. **Divergência de nome do mesmo titular**: a condição comercial lista o responsável financeiro
   como "Adair Gomes Silveira"; o cadastro do caso e os parâmetros dizem "Adair Pinto Silveira
   Júnior". **Não foi fundido por semelhança de nome** — fundir pessoa por nome é proibido. Hoje o
   contrato listaria as duas como partes distintas, e a pendência fica nomeada para decisão dela.

## 5. Instrumentos e atos posteriores (não são pendência de contratação)

- Anexo II — quando houver despesa de terceiro concreta a aprovar.
- Anexo III — quando houver pesquisa externa específica a autorizar.
- Anexo IV — quando um órgão exigir procuração, com país, órgão e poderes confirmados.
- Anexo V — quando houver alteração de escopo depois da contratação.
- Prazo e dependências documentais (`prazos_referencia`) — pendência real, não impeditiva.

## 6. Estado jurídico: alinhado, não reaberto

- `CONTRATO_BASE_STATUS` = `vigente`; `CONTRATO_BASE_DATA` = **2026-08-22**, preservada.
- O histórico de decisões (03/10 — 14 cláusulas; 04/10 — cláusulas 15 e 16) continua no documento
  canônico, sem apagar a etapa anterior.
- `CONTRATO_BASE_AVISO` deixou de dizer "não substitui revisão jurídica independente", que
  contradizia o status aprovado. Passou a dizer que a revisão está concluída, que a conferência
  humana dos dados por caso continua obrigatória e **não reabre** a revisão jurídica, e que
  vigência não autoriza ato externo.
- **Substituição pontual, nunca global**: `ADENDO-CANCELAMENTO-v1.0`,
  `ADENDO-CANAIS-OFICIAIS-v1.0` e o modelo `INDIVIDUAL — REQUERENTE ÚNICO COM ACOMPANHANTE`
  seguem em `under_legal_review` — não estão abrangidos pela aprovação.

## 7. Fases do instrumento, separadas

`pronto_para_assinatura` · `assinado` · `execucao` · `atos_posteriores`.

Um contrato não assinado pode aparecer como pronto para assinatura; **nunca** como assinado.
Execução depende de assinatura registrada. Ato posterior condicional não é pendência inicial.

## 8. Arquivos alterados

| Arquivo | O que mudou |
|---|---|
| `src/lib/contrato-blocos-incorporados.ts` | **novo** — papéis, pessoas do contrato, 10 blocos ancorados em cláusula existente, cobertura material, regra de aplicabilidade dos cinco anexos |
| `src/lib/contrato-corpo.server.ts` | corpo passa a renderizar os blocos do caso; Anexo I recebe o sinal de incorporação |
| `src/lib/anexos-i-v.ts` | Anexo I não obrigatório quando incorporado; Anexo II condicionado a despesa concreta; III/IV/V com motivo único de não aplicabilidade |
| `src/lib/condicao-comercial-caso.ts` | fim da inferência por valor zero e por posição; lacuna passa a ser material |
| `src/lib/contrato-prontidao.ts` | passo "Anexo I (OS) e anexos" → "Cobertura contratual completa"; fases do instrumento |
| `src/lib/contrato-preparar.functions.ts` | calcula a cobertura material e a aplicabilidade real dos cinco anexos |
| `src/lib/contrato-parametros.functions.ts` | prévia passa a receber composição do caso e condição comercial |
| `src/lib/contrato-base-consolidado.ts` | aviso alinhado ao status aprovado |
| `src/lib/matriz-modelos-contratuais.ts` | linha de revisão jurídica alinhada (pontual) |
| `src/components/contrato/cobertura-contratual.tsx` | **novo** — partes, blocos, anexos e as duas listas separadas |
| `src/components/contrato/trilho-prontidao.tsx` | mostra as quatro fases |
| `src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx` | monta o painel de cobertura |

## 9. O que esta tarefa não fez

Não enviou contrato, não solicitou assinatura, não cobrou, não executou pesquisa externa e não
publicou no portal. Não apagou documento, instância ou snapshot. Não criou cláusula jurídica nova.
Não recriou os anexos A–D. Não fez substituição global de `under_legal_review`.
