# Visibilidade e sanitização — o que pode chegar ao App Cliente

Camada do Design System. Documento de leitura. Não altera permissão, RLS,
publicação, projeção ou dado.

## 1. Princípio

O Desk é a fonte soberana. O App Cliente é **projeção autorizada**, nunca uma
segunda base. Nada aparece no App por consequência de existir no Desk: aparece
porque alguém publicou, com autor, data, caso e estado registrados.

A tela esconder um dado não é segurança. A visibilidade é decidida no
servidor e no banco, com RLS por organização e por caso. Esta camada descreve a
regra de conteúdo; não substitui nem afrouxa a regra de acesso.

## 2. Níveis de visibilidade em uso

O campo `client_visibility` já existe em `genealogical_person_profiles` e em
outras entidades de pesquisa, com três valores:

| Nível | Significado | Quem vê |
|---|---|---|
| `interna` | Trabalho em andamento, nota, hipótese, decisão de equipe | Somente equipe |
| `sanitizada` | Reescrito para a família, sem juízo de mérito nem termo técnico | Equipe; App somente se publicado |
| `aprovada` | Revisado e liberado para projeção | Equipe e App, quando publicado |

Além destes, esta documentação usa **protegida** para o campo que não sai do
Desk em hipótese alguma, nem mascarado.

A cadeia completa até a tela da família é:

```text
dado interno ──► reescrita sanitizada ──► revisão humana ──► aprovada
                                                              │
                                                              └─► publicação (autor, data, caso)
                                                                        └─► App Cliente
```

Cada seta é uma decisão humana registrada. Nenhuma é automática.

## 3. O que nunca chega ao App

1. **Dado sensível de terceiros.** Documento, endereço, telefone e data de
   nascimento de quem não é da relação daquele caso.
2. **Hipótese apresentada como fato.** Estados `asserted`, `under_review`,
   `tentative`, `conflicting` e `a_confirmar` não viram afirmação.
3. **Evidência bruta.** Digitalização sem tratamento, transcrição crua,
   anotação de arquivo, número de fonte interna.
4. **Token e material de acesso.** `canvas_token`, material de link mágico,
   identificadores internos, cabeçalho de autenticação.
5. **SKU e catálogo técnico.** `leads.sku_referencia`, `produtos_recomendados`,
   nomenclatura de produto interna.
6. **Preço técnico.** Custo, margem, faixa de despesa de terceiros, preço de
   referência que não seja o valor da proposta aprovada.
7. **Gates.** `STATUS_GATE_PESQUISA`, bloqueio por contrato, bloqueio por gate
   financeiro, bloqueio por qualidade. A família vê a situação em linguagem
   humana, nunca o nome da regra.
8. **Nota interna.** Todos os campos `notes_internal`, `internal_notes`,
   `observacao_interna`, `observacoes_protegidas`, `motivo_recusa`,
   `revocation_reason`, `suspension_reason`.
9. **Juízo de mérito sobre o caso.** Chance, probabilidade, percentual de êxito,
   "hipótese forte", "caso difícil". Regra permanente do produto.
10. **Dado de outro caso ou de outro cliente.** Inclusive em contagem, média,
    comparação ou gráfico agregado.
11. **Nome técnico de tabela, coluna, rota ou função.**
12. **Cobrança ou pagamento não confirmado.** Só fato financeiro registrado.

## 4. As sete abas e o que cada uma pode mostrar

O App Cliente tem exatamente sete abas: Home, Jornada, Radar, Árvore,
Documentos, Legado e Conta. Nada abaixo autoriza uma oitava.

| Aba | Pode mostrar | Não pode mostrar |
|---|---|---|
| Home | Situação do caso em linguagem humana, próxima ação da família, último marco publicado | Gate, nota interna, indicador operacional da equipe |
| Jornada | Fases e marcos publicados, o que já aconteceu, o que vem a seguir | Tarefa interna, responsável interno, prazo operacional |
| Radar | Sinal já publicado e pertinente ao próprio caso | Sinal de outro caso, hipótese, alerta interno |
| Árvore | Somente relações aprovadas e publicadas, com precisão declarada quando aproximada | Vínculo apenas afirmado, pessoa não revisada, hipótese |
| Documentos | Documento publicado para a família, com nome legível e data | Evidência bruta, documento de outro integrante sem relação, arquivo interno |
| Legado | Narrativa aprovada e publicada | Interpretação não revisada, conclusão sem evidência |
| Conta | Identidade da própria pessoa, contrato quando aplicável, faturas registradas | Token, dado de acesso, nota interna, preço técnico |

Regra de conteúdo transversal: no máximo quatro indicadores por superfície, cada
um com fonte, fórmula, período e comportamento definido quando vazio; gráfico
somente com dado real; estado vazio com frase específica e no máximo uma ação.

## 5. Árvore — regra própria

A Árvore é a superfície de maior risco de afirmar o que não foi provado.

1. Recebe **apenas** relações aprovadas e publicadas.
2. Vínculo em `asserted`, `under_review` ou `conflicting` não é desenhado.
3. Data aproximada aparece como aproximada; nunca convertida em data exata.
4. Pessoa sem identidade revisada não recebe nome afirmativo.
5. Nenhum parentesco é inferido por proximidade de nome, data ou localidade.
6. Retirar uma relação da Árvore é despublicação registrada, nunca exclusão.

## 6. Estados honestos

Vazio nunca é preenchido com texto inventado nem com dado de exemplo.

| Situação | O que a tela diz |
|---|---|
| Nada publicado ainda | Frase específica daquela aba e uma única ação válida |
| Existe, mas não foi revisado | Não aparece; a aba permanece em estado vazio honesto |
| Existe e está aguardando decisão | "Aguardando" explícito, sem prazo inventado |
| Origem indisponível no momento | Erro temporário claro, com opção de tentar de novo |
| Acesso ativo sem caso liberado | Mensagem explícita, sem novo link automático |

"Sem informação" não é estado aceitável. Aguardando, pausado, encerrado e
cancelado são.

## 7. Publicação e despublicação

Publicar é ato do Desk, com autor, data, caso e estado registrados, sem nenhuma
intervenção manual em banco. Despublicar usa o mesmo caminho e preserva o
histórico. Salvar nunca publica: salvar rascunho, solicitar revisão e publicar
são três ações distintas, com botões distintos.
