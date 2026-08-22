# Anexo I — instância canônica do caso CA-CID-AT-FAM-2026-001

Verificação somente leitura. Nenhum registro foi criado, alterado, apagado ou
enviado. Nenhuma ação externa (comunicação, cobrança, assinatura, publicação,
pesquisa externa ou integração) foi executada.

## 1. Caso alvo

| Campo | Valor |
| --- | --- |
| Código canônico | `CA-CID-AT-FAM-2026-001` |
| `case_id` | `a11a0000-0000-4000-8000-000000000002` |
| Título | Projeto familiar — Ana Luiza (piloto real) |
| Contrato do caso | `a11a0000-0000-4000-8000-0000000000c1` (`status = pending_data`) |
| Ficha de parâmetros | `226234d5-0a9c-4572-bfa9-f97ce20c1a29` (`status = rascunho`, 31 valores) |
| Prévias geradas | 7 (última em 2026-08-21 15:16 UTC) |

## 2. Situação real da tabela `contract_annexes`

Total de 9 linhas. Nenhuma delas está vinculada ao caso da Ana.

| `annex_code` | `case_id` | `rendered_html` | `model_version` | `status` |
| --- | --- | --- | --- | --- |
| `ANEXO-I` (legado) | nulo | 0 caracteres | nulo | missing |
| `ANEXO_I_ORDEM_SERVICO` | `7e57ca5e-…-0001` (CA-TESTE-VAL-2026-001) | 266 caracteres | ANEXO-I-ORDEM-DE-SERVICO-v1.0 | missing |
| `ANEXO_II…` a `ANEXO_V…`, `ANX-ESCOPO`, `ANX-COMERCIAL`, `ANX-PRIVACIDADE` | `7e57ca5e-…-0001` | 88–277 caracteres | v1.0 | missing / not_applicable / drafting |

A instância técnica íntegra do Anexo I (id `4f0d0fa0-f3cf-45fc-aff5-8a3800527f14`,
versão 1, modelo `ANEXO-I-ORDEM-DE-SERVICO-v1.0`, hash `125a1baba1ab2f0`, prévia
`b863e973-…`, 20 campos com fonte declarada e pendências explícitas) pertence ao
caso de validação `CA-TESTE-VAL-2026-001`, não ao caso da Ana. A linha legada
`ANEXO-I` continua intocada e segue fora do escopo.

## 3. Defeito técnico registrado (não é pendência documental)

**D-02 — Instância de Anexo I do caso da Ana não é materializada.**

- Origem: `src/lib/contrato-parametros.functions.ts` → `sincronizarMotor()` (linha ~602),
  que chama `sincronizarAnexosPersistidos()` de `src/lib/anexos-persistidos.server.ts`.
- Comportamento: instâncias em `contract_annexes` só são gravadas no momento em que
  uma prévia é gerada/salva pela ficha de parâmetros. A última prévia da Ana é de
  2026-08-21 15:16 UTC, anterior à entrada em operação dessa camada de persistência
  (primeiras instâncias gravadas em 2026-08-22 17:59 UTC, para o caso de teste).
- Consequência: não existe leitura de fallback nem rotina de materialização para
  fichas cuja última prévia antecede a camada. A tela `/contratos/$id` lê
  `contract_annexes` e, para o contrato da Ana, retorna vazio.
- Erro concreto observável: consulta `contract_annexes where case_id =
  'a11a0000-0000-4000-8000-000000000002'` retorna 0 linhas; nenhum evento em
  `audit_logs` com `entidade = 'contract_annexes'`.
- Correção esperada (não executada aqui): materializar a instância a partir da ficha
  existente ao abrir a rota, sem criar dados novos por inferência, ou disparar a
  sincronização a partir da prévia já persistida `470a93d3-…`.

## 4. Captura autenticada

Não realizada nesta execução: o preview está com sessão `signed_out`
(`LOVABLE_BROWSER_AUTH_STATUS = signed_out`), portanto qualquer acesso a
`/casos/a11a0000-0000-4000-8000-000000000002/contrato/preparar` ou
`/contratos/a11a0000-0000-4000-8000-0000000000c1` é redirecionado para
`/equipe/entrar`. Com a Proprietária autenticada no preview, o harness
`scripts/aceite-operacional-e2e.py` anexa a captura da instância.

## 5. Auditoria

- `audit_logs` para `entidade = 'contract_annexes'`: 0 eventos.
- `contract_review_events` para o contrato da Ana: nenhum evento de revisão de anexo.
- Nenhuma escrita foi feita durante esta verificação.
