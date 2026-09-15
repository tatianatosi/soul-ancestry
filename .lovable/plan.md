# Ficha da Ana com fontes reais e uma microentrega publicada

## 1. Ficha por lotes — ligar tudo que já está gravado

Conferência campo a campo dos lotes A–D contra o registro real do caso `CA-CID-AT-FAM-2026-001`, sem digitar valor novo e sem deduzir:

- A (pessoa, núcleo, caso): titular, núcleo Silveira / Friedmann-Reimer, participantes e dependentes, responsável, fase e próxima ação
- B (pesquisa): pergunta, 3 fontes consultadas, 1 evidência, 2 achados e estado de validação
- C (formalização e financeiro): proposta, escopo, contrato 2026-CB-0001, assinatura pendente, 10 anexos, OS e faturas
- D (entrega e acesso): microentregas, revisão, projeções, publicado/despublicado, e-mail autorizado e acesso ao App

Cada campo continua mostrando fonte, responsável, data, visibilidade e tela dona. Onde não existe registro (faturas, OS, relações aprovadas, acesso da cliente), fica "ausente" — nada de preenchimento estimado.

Se algum campo aparecer como "ausente" mesmo havendo registro, a correção é só na leitura (ligação com a tabela certa), nunca criando dado.

## 2. Microentrega publicada e prova em Home e Jornada

Usando um marco real já gravado da Ana (a confirmação formal de 14/08/2026), pelos caminhos que já existem:

1. criar a microentrega no Caso 360
2. aprovar na revisão
3. publicar para a família, com autor e data
4. abrir o App e conferir que ela aparece em Home ("Última entrega" e resumo) e em Jornada ("Seus marcos")

Registro antes/depois com prints desktop e 375 px. Nada é enviado para a cliente: não há convite, e-mail nem link mágico nesta etapa.

## Detalhes técnicos

- Leitura da ficha em `src/lib/golive-ficha.ts`, sem alterar as fontes.
- Escritores já existentes: `criarMicroentregaGoLive`, `aprovarMicroentregaGoLive`, `publicarNoAppGoLive` (e `despublicarDoAppGoLive` se você quiser reverter).
- Sem tabela nova, sem migration, sem RLS, sem exclusão, sem envio externo e sem deploy de produção.
- Prova autenticada na prévia, com prints salvos em Arquivos.
