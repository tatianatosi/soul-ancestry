# CA-ART-01 — Manifesto de Artefatos Canônicos

Versão: 1.0

## Finalidade

Este manifesto registra artefatos canônicos preservados fora do repositório, sem fabricar cópias textuais com extensões binárias. A inclusão binária no GitHub deve ocorrer somente por uma rota que preserve integralidade, tamanho e tipo de arquivo.

## Inventário

| Identificador | Arquivo canônico | Origem atual | Tipo | Integridade conhecida | Estado |
|---|---|---|---|---|---|
| CA-ART-001 | inventario-patrimonial.csv | LOCAL | CSV | 18.799 bytes | Preservado na fonte; inclusão binária no GitHub pendente |
| CA-ART-002 | relatorio-inventario-patrimonial.pdf | LOCAL | PDF, 6 páginas | 64.786 bytes | Preservado na fonte; inclusão binária no GitHub pendente |
| CA-ART-003 | resumo-escopo-contratual.pdf | LOCAL | PDF, 3 páginas | 52.528 bytes | Preservado na fonte; QA visual pendente; inclusão binária no GitHub pendente |

## Regras de integridade

- Não substituir artefato por texto de placeholder com extensão .pdf ou .csv.
- Registrar origem, versão, data de captura, tamanho e hash quando a cópia binária for incorporada.
- Manter o arquivo canônico imutável durante QA visual, salvo nova versão explicitamente identificada.
- Registrar a revisão de layout do resumo de escopo como evento de QA, sem confundir revisão visual com alteração do conteúdo contratual.

## Dependências

A cópia binária para o GitHub depende de uma ferramenta ou fluxo que aceite upload binário preservando o conteúdo. Até isso ocorrer, estas referências são o registro de rastreabilidade no repositório.