# Proposta das seis decisões P0 — ficha da Ana (nada executado)

Levantamento só de leitura do caso `CA-CID-AT-FAM-2026-001`. Nada foi criado, editado, arquivado, publicado ou enviado. Cada item abaixo mostra o valor de hoje, o efeito da mudança e o teste — para você escolher.

## P0.1 Papéis do núcleo

Hoje o núcleo "Silveira / Friedmann-Reimer" tem 5 pessoas ativas, e quatro delas estão com o mesmo papel:

| Pessoa | Papel hoje | Observação gravada |
|---|---|---|
| Maria Silveira Rodrigues | contratante_signatario | "Certidão de casamento Silveira 1912" (parece ser pessoa histórica, não contratante) |
| Ana Luiza Gomes Silveira Rodrigues | contratante_signatario | "Titular adulta, contratante e signatária" |
| Adair Pinto Silveira Júnior | contratante_signatario | "Adulto contratante e signatário" |
| Alice Gomes Silveira | contratante_signatario | "Adulta contratante e signatária" |
| Felipe | dependente | "Dependente/beneficiário menor vinculado a Ana Luiza" |

Proposta: separar **papel operacional** (titular, participante, dependente, pessoa pesquisada) do parentesco, que continua em branco por falta de fonte. Depois: Ana = titular; Adair e Alice = participantes signatários; Felipe = dependente; Maria = decisão pendente (pessoa histórica ou participante?).

Efeito: só o rótulo mudaria em Pessoa 360, Pessoas & Famílias e Painel do caso. Nenhuma linha nova.

**Decisão pendente:** confirmar os quatro papéis e o caso de Maria.

## P0.2 Duplicidade "Prancha 1 — Linha materna Silveira"

| Campo | Registro A | Registro B |
|---|---|---|
| ID | b6705afb…81e52b | 64d7523e…e238ee |
| Criado | 15/09 12:47 | 15/09 12:50 |
| Estado | pendente | concluída em 15/09 12:51 |
| Prazo | 30/09 | 30/09 |
| Revisão registrada | nenhuma | "Revisão humana da Proprietária em 15/09/2026" |

Recomendação técnica: **B é canônico** (tem revisão e conclusão); A fica arquivado com motivo e apontando para B. Nada é apagado.

## P0.3 Duplicidade "Vínculo materno Silveira documentado"

| Campo | Registro A | Registro B |
|---|---|---|
| ID | f661b826…3f6 | cc39868d…91ee |
| Criado | 15/09 12:43 | 15/09 12:45 |
| Estado | em revisão | em revisão |
| Evidência ligada | 0ed6bd91…4934 | 0ed6bd91…4934 (a mesma) |
| Resumo interno | "Certidão localizada no arquivo municipal." | idêntico |
| Projeção no App | não projetado | não projetado |

São idênticos, inclusive a evidência. Recomendação: manter **A** (o primeiro) como canônico e arquivar B como repetição. Ambos seguem "em revisão" — nenhum vai para o App.

## P0.4 Próxima ação vencida

Hoje: "Solicitar dados cadastrais", prazo 22/08/2026, responsável Tati Tosi, caso em rascunho/preparação.

Recomendação: manter a vencida como histórico e criar uma sucessora datada. Modelo a preencher por você (não será criado agora): título humano, responsável, prazo, estado, dependência de terceiro e motivo.

**Decisão pendente:** o texto verdadeiro da nova ação e o prazo.

## P0.5 Acesso e primeira publicação (dois atos separados)

Hoje: nenhum e-mail autorizado, nenhum acesso criado, nenhuma projeção publicada. Existem 3 projeções: 1 rascunho de 22/08 e 2 arquivadas dos testes de hoje.

Sequência proposta, cada passo com confirmação sua:
1. autorizar o e-mail da titular (já cadastrado no cliente) — sem enviar nada
2. criar o acesso ligado só a este caso — sem link mágico
3. preparar a projeção sanitizada da microentrega canônica — sem publicar
4. publicar após sua revisão
5. só depois, e em pedido separado, gerar e enviar o link mágico

**Decisão pendente:** qual desses passos autorizar e o texto da primeira publicação.

## P0.6 CTA "Ver proposta e escopo"

Hoje o botão leva a uma rota de proposta e existe 1 proposta aprovada (17/08), sem liberação explícita para a família. Recomendação: no App real, estado vazio cliente-facing ("A proposta e o escopo aparecem aqui após a liberação da equipe"); o caminho para o conteúdo interno fica só na prévia administrativa, marcada como prévia.

## Limites desta rodada

Nada foi criado, editado, desarquivado, fundido, arquivado, publicado, despublicado, enviado ou convidado. Sem mudança de banco, RLS, migration, CTA ou deploy. As correções de fronteira entre App e Desk que você pediu antes continuam na fila, sem execução.
