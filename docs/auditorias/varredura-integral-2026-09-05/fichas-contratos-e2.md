# E.2 — Fichas comparativas não destrutivas: contratos 2026-CB-0001 (todos os registros), 0002 e 0004

Nenhum registro foi arquivado, excluído, fundido ou renumerado nesta varredura. Todos os dados abaixo vêm de leitura direta no Supabase de produção (`zsxpdbhdvbuulwpepemd`), sem escrita.

## Achado: existem 3 registros com `contract_number = '2026-CB-0001'`, não 2

| ID | Título | `demo` | `case_id` | `client_id` | Status | Assinado em |
|---|---|---|---|---|---|---|
| `6a5ab444-4418-4290-8ef7-beb2655c39f5` | DEMO — Contrato-base de pesquisa genealógica (fictício) | **true** | null | null | signed | 2026-08-16 |
| `c0c988b4-74b0-442b-8e74-8aea028f1ee1` | DEMO — Contrato-base da organização Beta (fictício) | **true** | null | null | draft | — |
| `a11a0000-0000-4000-8000-0000000000c1` | Contrato-base familiar — Silveira / Friedmann-Reimer (Áustria) | **false** | `a11a0000-…-002` (caso da Ana) | `a11a0000-…-001` | pending_data | — |

Dois dos três são fixtures de demonstração explicitamente marcadas (`demo: true`, títulos com "DEMO" e "fictício", sem caso/cliente vinculado) e nunca aparecem em indicadores, previsão de caixa ou App Cliente (regra confirmada em `financeiro.tsx`: "registros com selo DEMO nunca entram em indicadores"). **Apenas o terceiro registro (`a11a0000-…-c1`) é o contrato real da Ana.** Recomendação: nenhuma ação — a coexistência dos 3 sob o mesmo número de exibição é um comportamento conhecido de fixtures de demo, não uma duplicidade de dado real. Se a proprietária quiser eliminar a ambiguidade visual de dois registros "DEMO" sob o mesmo número, isso é uma decisão de dado de demonstração, não uma correção de bug — listada em "decisões pendentes", não executada aqui.

### Partes contratuais (`contract_parties`)

| Contrato | Papel | Nome | Documento |
|---|---|---|---|
| DEMO fictício (6a5ab444) | contracting_client | DEMO — Contratante Fictícia | — |
| DEMO fictício (6a5ab444) | provider | DEMO — Clube Ancestral (fictício) | — |
| DEMO Beta (c0c988b4) | — | *(nenhuma parte cadastrada)* | — |
| **Real da Ana (a11a0000-…-c1)** | provider | Clube Ancestral | CNPJ 10.448.812/0001-58 |
| Real da Ana | contracting_client | Ana Luiza Gomes Silveira Rodrigues | CPF 037.795.711-96 |
| Real da Ana | co_contractor | Adair Pinto Silveira Júnior | CPF 774.227.321-72 |
| Real da Ana | co_contractor | Alice Gomes Silveira | **sem documento** |
| Real da Ana | dependent | Felipe | **sem documento** |

Pendência real confirmada (não é bug de checklist): 2 das 5 partes do contrato real (Alice, Felipe) não têm documento cadastrado — é exatamente o que o item "Documentos das partes" do checklist jurídico aponta. Ação disponível: cadastrar CPF/documento de Alice e Felipe na ficha de núcleo familiar/pessoa.

### Parâmetros do Planejador vinculados

| Contrato | `contract_case_parameters` vinculado | Campos | Validados |
|---|---|---|---|
| Real da Ana (a11a0000-…-c1) | `226234d5-0a9c-4572-bfa9-f97ce20c1a29` | 31 | 19 |
| Ambos DEMO | nenhum | — | — |

## 2026-CB-0002 — "TESTE - Contrato de estudo genealogico"

| Campo | Valor |
|---|---|
| ID | `7e57c047-0000-4000-8000-000000000001` |
| `demo` | false (mas título começa com "TESTE") |
| `case_id` | `7e57ca5e-0000-4000-8000-000000000001` (não é o caso da Ana) |
| Status | draft |
| Partes cadastradas | nenhuma |
| Parâmetros do Planejador vinculados | nenhum |
| `financial_gate_status` / `research_gate_status` | pending_contract / blocked_by_contract |

Achado: apesar de `demo=false`, o título "TESTE" e a ausência total de partes/parâmetros indicam um registro de teste, não um cliente real. Se registros assim entram em contagens agregadas (dashboards de contratos/financeiro), eles inflam números sem representar operação real — candidato à mesma bandeira de exclusão que os registros `demo=true` já recebem, mas isso é decisão de negócio (que critério usar: `demo`, prefixo do título, ou um novo campo), não corrigida aqui.

## 2026-CB-0004 — "Contrato-base — Homologação Fluxo Interno"

| Campo | Valor |
|---|---|
| ID | `96f30b44-a8f2-4bbe-a12c-9627ee01dbae` |
| `demo` | false (título diz "Homologação Fluxo Interno") |
| `case_id` | `f0bcd9a8-c77a-4f82-af92-03b1660f6749` → caso `CA-HOMOLOG-FLUXO-2026-001`, "Homologação — Caso→Escopo→Proposta→Condição→Contrato→OS", criado 2026-09-05 |
| Status | draft |
| Partes cadastradas | nenhuma |
| Parâmetros do Planejador vinculados | nenhum |

Mesmo achado do 0002: registro de homologação interna (criado ontem, para testar o fluxo Caso→OS), não um contrato de cliente. Mesma recomendação: decisão de negócio sobre critério de exclusão de contagens, não uma correção técnica unilateral.
