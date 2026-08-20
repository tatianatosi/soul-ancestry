# G-01 — Norma de identificadores canônicos do Clube Ancestral

Data: 20/08/2026 · Responsável: Tatiana Melani Tosi · Status: implantado (sem renomeação de casos reais)

## 1. Norma

Formato canônico de caso: `CA-CID-[MODELO]-[ANO]-[SEQUENCIA]`
Modelos permitidos: `IND`, `FAM`, `MULTI`, `PESQ`, `LEG`, `POS`.
Fixtures: `CA-DEMO-CID-[MODELO]-[ANO]-[SEQUENCIA]`.
Lead: `CA-LEAD-[ANO]-[SEQUENCIA]`.
Proposta Canva: `DECK-CANVA-[CASE_ID]-v[N]` (referência, nunca chave).

O identificador não carrega país, nacionalidade, via jurídica, produto, case_service, preço,
pessoa, estado comercial ou hipótese. Esses dados vivem em campos estruturados
(`pais`, `via`, `citizenship_track_id`, `case_service_id`, `status`, `responsavel_principal` etc.).

## 2. O que foi criado no banco

| Objeto | Tipo | Função |
|---|---|---|
| `case_aliases` | tabela | histórico de identificadores: `id`, `organization_id`, `case_id`, `alias`, `alias_type`, `source`, `reason`, `superseded_by`, `created_at`, `created_by`. Unicidade por organização. RLS: leitura para membros da organização, inserção para quem tem escrita. Sem política de update/delete. |
| `fn_case_alias_imutavel` | trigger | recusa exclusão e reescrita de alias; só `reason`/`superseded_by` podem ser complementados. |
| `fn_case_alias_guard` | trigger | alias precisa apontar para caso existente da mesma organização e não pode ser o código canônico de outro caso; grava autoria pelo servidor. |
| `crm_casos.modelo` | coluna | `IND`/`FAM`/`MULTI`/`PESQ`/`LEG`/`POS`, com constraint e backfill a partir dos códigos existentes. |
| `gerar_case_id(org, modelo, demo, ano)` | função | geração transacional com `pg_advisory_xact_lock` por organização/modelo/ano; valida o modelo; execução negada para anônimo. |
| `fn_case_codigo_canonico` | trigger | gera o código na inserção quando ausente, recusa qualquer alteração de `codigo` ou `modelo` após a abertura, separa DEMO de real e impede que um alias vire chave. |
| `fn_lead_case_id_guard` | trigger | lead só pode apontar para caso quando o estágio é `ganho` (abertura formal); exige mesma organização. |
| `fn_deck_referencia_guard` | trigger | referência de deck só é aceita no padrão `DECK-CANVA-[codigo do caso]-v[N]`, com caso existente; proposta nunca cria nem redefine identificador. |
| `fn_lead_codigo` | confirmado | gerador já existente de `CA-LEAD-[ANO]-[SEQ]`, imutável em update. |

Aplicação: `src/lib/saas.functions.ts` deixou de aceitar `codigo` e `alias_historico` como
campos graváveis; `src/lib/caso-canonico.functions.ts` passou a carregar os aliases; a ficha
interna do caso (`/casos/:id`) exibe identificador e aliases apenas em leitura.

## 3. Testes executados (fixtures DEMO, todos desfeitos por rollback)

| # | Teste | Resultado |
|---|---|---|
| 1 | fixture individual gera ID único | `CA-DEMO-CID-IND-2026-001` — OK |
| 2 | dois fixtures familiares geram IDs distintos | `CA-DEMO-CID-FAM-2026-001` / `-002` — OK |
| 3 | alterar país/via não altera o identificador | estável — OK |
| 4 | edição manual de `codigo` | recusada — OK |
| 5 | alias consultável | 1 alias legível pelo caso — OK |
| 5b | exclusão de alias | recusada — OK |
| 5c | alias usado como código de caso novo | recusado — OK |
| 6 | deck com referência do caso correto | aceito — OK |
| 6b | deck apontando para caso inexistente | recusado — OK |
| 6c | deck sem caso vinculado | recusado — OK |
| 7 | lead recebe identificador próprio e nenhum case_id | `CA-LEAD-2026-0001`, `case_id` nulo — OK |
| 7b | vincular case_id a lead em triagem | recusado — OK |

Nenhuma fixture permaneceu no banco (verificado após a execução: apenas os 2 casos reais existentes).

## 4. Aliases preservados

| Caso | Identificador atual (inalterado) | Aliases registrados |
|---|---|---|
| Família Ana Luiza | `CA-CID-AT-FAM-2026-001` | `CA-AUT-ANALUIZA-FAM-2026-001`, `CA-2026-ANA-001` |
| Demonstração Itália | `CA-DEMO-IT-2026-001` | — |

## 5. Aplicação de referência (sem renomear nada agora)

- **Ana** — modelo `FAM`; canônico pretendido `CA-CID-FAM-2026-001`. Áustria permanece em
  `citizenship_track`/`pais`. Renomeação depende do plano da seção 6.
- **João** — quando houver caso formal, `CA-CID-IND-2026-002` gerado pelo servidor.
  Portugal fica em `citizenship_track`.
- **Amigo do Danilo** — permanece como lead `CA-LEAD-2026-[SEQ]` enquanto em triagem.
  Só após abertura formal (lead ganho) recebe `CA-CID-IND-2026-003`.
  Brasil/naturalização ficam em `citizenship_track` e `via_juridica_preliminar`.

## 6. Plano separado — renomeação da Ana (requer aprovação humana)

Nada abaixo foi executado.

1. Congelar gravações na ficha do caso durante a janela de renomeação.
2. Inserir `CA-CID-AT-FAM-2026-001` em `case_aliases` como `alias_type = 'historico'`,
   `source = 'renomeacao_g01'`, `superseded_by = 'CA-CID-FAM-2026-001'`.
3. Suspender temporariamente `trg_case_codigo_canonico`, atualizar `crm_casos.codigo`
   para `CA-CID-FAM-2026-001` e reativar o trigger na mesma transação.
4. Reemitir referências de deck para `DECK-CANVA-CA-CID-FAM-2026-001-v[N]`
   mantendo as referências antigas registradas como alias de deck.
5. Revalidar: contratos, propostas, faturas, onboarding, pesquisa e portal do cliente
   apontam por `case_id` (uuid), não por código — a renomeação não os altera.
6. Registrar decisão `CA-DEC-2026-XX` com aprovação nominal antes de aplicar.

Impacto externo previsto: nenhum documento assinado, cobrança ou comunicação já enviada
é reeditado; peças futuras passam a usar o novo identificador.

## 7. Confirmação de não interferência

Nenhum caso real foi renomeado, criado ou arquivado. Nenhuma proposta, contrato, cobrança,
assinatura, pasta, documento externo, pesquisa externa ou comunicação foi alterada ou disparada.
As fixtures usadas nos testes foram integralmente desfeitas.
