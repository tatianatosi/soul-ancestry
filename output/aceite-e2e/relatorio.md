# Aceite Operacional — Passos 3 a 8 (E2E autenticado)

Execução: 2026-08-22T20:34:37.315778+00:00
Sessão do preview: `signed_out`

| Passo | Título | Rota | Autenticado | Evidência | Status | Captura |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | Operar Caso — identificador canônico e alias legado | `/casos?busca=CA-AUT-ANALUIZA-FAM-2026-001` | não | não | NAO_VERIFICADO | output/aceite-e2e/p3-caso-alias.png |
| P4 | Operar Painel Hoje — fila, exceções e sinais | `/painel` | não | sim | NAO_VERIFICADO | output/aceite-e2e/p4-painel-hoje.png |
| P5 | Operar Formalização — contrato-base e Anexos I–V | `/governanca/contrato-base` | não | não | NAO_VERIFICADO | output/aceite-e2e/p5-formalizacao-anexos.png |
| P6 | Operar Pesquisa — módulo genealógico do caso | `/pesquisa` | não | sim | NAO_VERIFICADO | output/aceite-e2e/p6-pesquisa.png |
| P7 | Operar Comercial — conversão e catálogo homologado | `/conversao` | não | sim | NAO_VERIFICADO | output/aceite-e2e/p7-comercial.png |
| P8 | Operar Modo Proprietária — overrides auditados | `/modo-proprietaria` | não | sim | NAO_VERIFICADO | output/aceite-e2e/p8-modo-proprietaria.png |

## Eventos de auditoria

| Tabela | Antes | Depois |
| --- | --- | --- |
| audit_logs | sessao_indisponivel | sessao_indisponivel |
| case_aliases | sessao_indisponivel | sessao_indisponivel |
| catalog_audit_events | sessao_indisponivel | sessao_indisponivel |
| contract_annexes | sessao_indisponivel | sessao_indisponivel |
| contract_review_events | sessao_indisponivel | sessao_indisponivel |
| conversion_events | sessao_indisponivel | sessao_indisponivel |
| owner_override_events | sessao_indisponivel | sessao_indisponivel |
| research_audit_events | sessao_indisponivel | sessao_indisponivel |

> Roteiro somente leitura: nenhuma ação externa (comunicação, cobrança,
> publicação, pesquisa externa ou integração) foi executada.
