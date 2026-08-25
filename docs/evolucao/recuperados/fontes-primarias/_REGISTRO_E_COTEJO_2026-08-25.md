# Fontes primárias do Lovable — registro e cotejo

**Origem:** `ClubeAncestral.zip` (129 arquivos, 36 MB) e
`lovablechat20260825_1.md` (31.801 linhas), enviados pela Proprietária em
25/08/2026, com a observação: *"acho que não foram executados"*.

## O que foi preservado aqui, e o que ficou de fora

Preservados: **as 33 fontes estruturadas** (1,8 MB) mais o chat atualizado
do Lovable (1,1 MB). São os documentos-fonte que os outros acervos apenas
citavam — inclusive `SANEAMENTO_DE_SKUS.csv`, a Auditoria-Mãe e os
CA-EVO-03/04/05A.

**Não preservados:** ~27 MB de dumps de chat com nomes UUID
(`394a48ec-…`, `5fe64800-…`, `c6286997-…`, `eb3d89e9-…`), em blocos
sequenciais de ~468 KB. São exportações da mesma conversa em partes, em
grande medida cobertas pelo chat atualizado que está aqui. Ficaram de fora
para não inflar o repositório em 27 MB de texto redundante — decisão
reversível: os arquivos continuam no zip original.

## Por que estas fontes importam

Elas fecham o círculo de citações. A "Proposta de Definição de Top SKUs"
recebida em 24/08 listava como referências auditáveis exatamente
`01_CATALOGO_E_SKUS/SANEAMENTO_DE_SKUS.csv`, `PARETO_E_PRIORIDADE.csv`,
`MAPA_DE_RECONCILIACAO_ASAAS.csv` e `02_AUDITORIA_MAE_Clube_Ancestral.md`
— documentos que até então eu só conhecia de segunda mão.

`SANEAMENTO_DE_SKUS.csv` tem **91 linhas de SKU** (92 com cabeçalho),
confirmando o universo de 91 que todos os estudos posteriores usam como
base.

## Cotejo: "não foram executados"?

### Dicionário de Validações Calls→CRM — nem sim nem não

Este é o caso mais instrutivo do acervo.

- `Dicionario_Validacoes_Painel_Calls_CRM_v1.0_base.md` — 236 linhas
- `Dicionario_Validacoes_Painel_Calls_CRM_v1.1.md` — **614 linhas**, 2,6×
  maior, com seções inteiras novas: Brief de Discovery por pessoa, matriz
  campo → sistema responsável → visibilidade → validação, LISTAS_BASE
  atualizada, e regras de dependência revisadas

`src/lib/dicionario-calls-crm.ts` declara explicitamente
`DICIONARIO_CALLS_VERSAO = "1.0"`.

Conclusão intuitiva: a v1.1 não foi executada. **Mas o cotejo mostra o
contrário.** Os conceitos exclusivos da v1.1 — LISTAS_BASE, consentimento,
despesas de terceiros, handoff, Brief de Discovery — **estão presentes no
código**, distribuídos entre `dicionario-calls-crm.ts` e
`ca04-crm-mestre.ts`.

Ou seja: o conteúdo da v1.1 foi absorvido, mas repartido em dois módulos,
e o módulo do dicionário nunca teve sua etiqueta de versão atualizada. Não
é lacuna funcional — é lacuna de registro.

### O padrão que se repete

É o mesmo padrão de toda esta série, e vale nomear:

| O que parecia | O que era |
| --- | --- |
| Paleta errada | Paleta certa, relatório desatualizado |
| Jurídico e Radar perdidos | Renomeados para rótulo humano |
| Cormorant fora do guia | Guia cobre marca, não interface |
| Dicionário v1.1 não executado | Executado, etiqueta parada na v1.0 |
| Cadeia de 11 elos não existe | Existe, mora em `/biblioteca-mensagens` |

Cinco vezes a mesma coisa: **o trabalho foi feito e o registro não
acompanhou.** O problema quase nunca foi execução; foi rastreabilidade e
lugar.

## O que ainda não foi cotejado

Chegaram nesta sessão, em sequência, três acervos e um chat: 68 prompts,
36 arquivos de estudo UX, 129 arquivos de fonte primária e 31.801 linhas
de conversa. Foi cotejado o que respondia a perguntas em aberto. **Não
foram cotejados individualmente:**

- `02_AUDITORIA_MAE_Clube_Ancestral.md` (76 KB)
- `CA-EVO-03_Motor_Contratual_Modular.md`, `CA-EVO-04_Dados_Vivos_e_Integracoes.md`,
  `CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md` — citados como fonte pela
  `varredura-completude.ts`, agora disponíveis em texto integral
- `CA-RESET-01-Estabilizacao-Operacional-Unica.md` e suas três devolutivas
- `MAPA_DE_RECONCILIACAO_ASAAS.csv` — relevante para a auditoria
  CA-AUD-09, que hoje só pôde olhar os links copiados na Planilha Mestre
- O chat de 25/08

Estão preservados e disponíveis. O cotejo de cada um é trabalho de uma
sessão dedicada, não de uma passagem rápida.
