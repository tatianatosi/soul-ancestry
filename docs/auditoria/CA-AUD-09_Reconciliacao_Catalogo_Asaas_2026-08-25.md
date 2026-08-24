# Auditoria de catálogo, links e reconciliação Asaas (PROMPT 09)

**Data:** 25/08/2026 · **Natureza:** somente leitura. Nenhum produto, link,
cobrança ou assinatura foi criado, editado, desativado ou publicado nesta
auditoria.

## Fontes lidas

- `src/data/catalogo-fonte-mestre.ts` — snapshot somente-leitura da "CA · FIN
  · Planilha Mestre de Produtos OFICIAL 2.xlsx" (30 SKUs do Catálogo
  Operacional 30), incluindo `linkAsaas`/`statusLinkAsaas` por SKU.
- `output/catalogo/precos-a-homologar.csv` — status de homologação por SKU
  (43 linhas, catálogo mais amplo, inclui os 91 do saneamento).
- `src/lib/ca06-catalogo-operacional.ts` — `CATALOGO_OPERACIONAL_30`,
  `DECISOES_BLOQUEADORAS`, status de `CA-CURSO-001`.
- `src/data/propostas.ts` — preços em proposta por caso.

**Limite explícito:** este repositório não tem nenhuma integração Asaas
ativa (confirmado nas sessões anteriores — `PEND-08` em
`varredura-completude.ts`: "preparadas, nunca executadas"). O campo
`linkAsaas` é uma referência estática copiada da Planilha Mestre, não uma
consulta em tempo real à API do Asaas. Portanto, **cobrança e pagamento não
são verificáveis a partir deste repositório** — apenas a existência (ou não)
do link, tal como registrada na última importação da planilha.

## Classificação por SKU (30 SKUs do Catálogo Operacional)

| Classificação | Quantidade | Critério |
| --- | --- | --- |
| Ativo com link Asaas | 23 | `statusLinkAsaas = link_criado` |
| Ativo com link pendente de revisão manual | 7 | `statusLinkAsaas = revisar_manual` |
| Ativo sem link | 0 | `statusLinkAsaas = pendente_criar_link` |
| Preço divergente (atual × sugerido) | **24** | `precoAtual != precoSugerido` na Planilha Mestre |
| Arquivado tratado corretamente como inativo | 1 (`CA-CURSO-001`) | Fora dos 30 operacionais; bloqueado por `DECISOES_BLOQUEADORAS` até decisão humana |

### Links Asaas pendentes de revisão manual (7)

`CA-IND-005`, `CA-IND-006`, `CA-CID-002A`, `CA-CID-002B`, `CA-CID-002C`,
`CA-CID-002D`, `CA-WPP-002`. Fonte de verdade: Planilha Mestre. Dono: quem
mantém o Asaas (financeiro/Proprietária). Decisão humana necessária: revisar
cada link manualmente antes de qualquer cobrança nova nesses SKUs.

### Divergências de preço (24 de 30) — achado principal desta auditoria

A regra vigente já aplicada nesta sessão a `CA-CID-023` ("preço sugerido
sempre prevalece em divergência") **ainda não foi aplicada** às 24 linhas
abaixo. Nenhuma foi alterada aqui — é evidência para decisão separada seguindo
a mesma sistemática (fonte de verdade = Planilha Mestre / preço sugerido).

| SKU | Preço atual (sistema) | Preço sugerido (Planilha Mestre) | Resolução proposta pela regra vigente |
| --- | ---: | ---: | --- |
| CA-CID-001 | R$ 197,00 | R$ 260,00 | Usar sugerido |
| CA-CID-002 | R$ 1.436,00 | R$ 990,00 | Usar sugerido |
| CA-CID-003 | R$ 530,00 | R$ 490,00 | Usar sugerido |
| CA-CID-006 | R$ 280,00 | R$ 249,00 | Usar sugerido |
| CA-CID-009 | R$ 628,00 | R$ 490,00 | Usar sugerido |
| CA-CID-016 | R$ 1.511,00 | R$ 2.490,00 | Usar sugerido |
| CA-CID-018 | R$ 1.588,00 | R$ 2.490,00 | Usar sugerido |
| CA-CID-019 | R$ 3.881,00 | R$ 4.500,00 | Usar sugerido |
| CA-CID-020 | R$ 3.520,00 | R$ 4.500,00 | Usar sugerido |
| CA-CID-021 | R$ 340,00 | R$ 490,00 | Usar sugerido |
| CA-CID-025 | R$ 990,00 | R$ 1.190,00 | Usar sugerido |
| CA-HIST-001 | R$ 5.651,00 | R$ 4.500,00 | Usar sugerido |
| CA-HIST-002 | R$ 7.053,00 | R$ 7.700,00 | Usar sugerido |
| CA-HIST-004 | R$ 3.200,00 | R$ 2.490,00 | Usar sugerido |
| CA-MEM-003 | R$ 297,00 | R$ 197,00 | Usar sugerido |
| CA-MEM-004 | R$ 490,00 | R$ 390,00 | Usar sugerido |
| CA-MEM-008 | R$ 2.990,00 | R$ 1.990,00 | Usar sugerido |
| CA-IND-001 | R$ 1.490,00 | R$ 890,00 | Usar sugerido |
| CA-IND-002 | R$ 1.590,00 | R$ 1.990,00 | Usar sugerido |
| CA-IND-005 | R$ 7.700,00 | R$ 5.900,00 | Usar sugerido |
| CA-IND-006 | R$ 8.500,00 | R$ 5.900,00 | Usar sugerido |
| CA-ASS-002 | R$ 269,00 | R$ 169,00 | Usar sugerido |
| CA-ASS-005 | R$ 2.148,00 | R$ 1.825,00 | Usar sugerido |
| CA-WPP-002 | R$ 149,00 | R$ 119,00 | Usar sugerido |

Impacto: enquanto não homologado, `preco-sugerido-canonico.ts` já resolve
essas divergências em tempo de leitura pela mesma regra (preço sugerido
prevalece) — então o Desk já *exibe* o valor correto hoje. O que falta é
**homologar formalmente** cada linha em `output/catalogo/precos-a-homologar.csv`
(hoje `em_revisao`/`bloqueado` para a maioria), do mesmo jeito que foi feito
para `CA-CID-023` → `homologado`, R$ 4.800,00.

### CA-CURSO-001 — confirmado corretamente tratado como não ativo

Status oficial `Arquivado`; `ca06-catalogo-operacional.ts` bloqueia sua
inclusão no Catálogo 30 até decisão humana explícita
(`DECISOES_BLOQUEADORAS`, item citado). Não está entre os 30 SKUs
operacionais do snapshot da Planilha Mestre. Nenhuma tela trata como oferta
ativa — confirmado nesta auditoria, sem alteração.

## Plano de reconciliação (evidência, não execução)

| # | Ação proposta | Chave | Fonte de verdade | Decisão humana |
| --- | --- | --- | --- | --- |
| 1 | Homologar as 24 linhas acima com preço = preço sugerido, mesmo padrão de CA-CID-023 | SKU | Planilha Mestre (`precoSugerido`) | Aprovar em bloco ou linha a linha |
| 2 | Revisar manualmente os 7 links Asaas marcados `revisar_manual` | SKU | Planilha Mestre / painel Asaas real | Financeiro/Proprietária |
| 3 | Manter `CA-CURSO-001` fora de qualquer oferta ativa até decisão de reativação | SKU | `ca06-catalogo-operacional.ts` | Já é a regra vigente — nenhuma ação |

**Nenhuma destas três ações foi executada.** A primeira replica exatamente o
padrão que você já aprovou para CA-CID-023 — se quiser, posso aplicar às 24
linhas da mesma forma (atualizar `precos-a-homologar.csv` para
`homologado`); só preciso da confirmação, já que agora é catálogo inteiro, não
uma linha isolada.
