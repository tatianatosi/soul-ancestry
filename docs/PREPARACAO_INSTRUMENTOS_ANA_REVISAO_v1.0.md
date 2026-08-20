# Preparação de instrumentos — revisão somente de leitura

Caso: **CA-CID-AT-FAM-2026-001** · Trilha: Áustria — § 58c StbG · Responsável: Tatiana Melani Tosi
Versão 1.0 · 20/08/2026 · Situação operacional do caso: **NO_GO**

> Revisão de leitura. Nenhum arquivo de código foi criado, nenhuma cláusula gerada, nenhum contrato
> ou OS real criado, nenhuma assinatura, cobrança ou comunicação executada. Consultas exclusivamente `SELECT`.

---

## 1. Estado dos cinco pré-requisitos

| # | Fonte | Estado | Síntese |
| --- | --- | --- | --- |
| 1 | Proposta Canva aprovada | **Conflitante** | Aprovada e vinculada ao caso, mas **validade vencida** e páginas 3–7 incompletas |
| 2 | Cadastro das pessoas adultas signatárias | **Incompleto** | 27 itens de checklist, 27 pendentes (9 por titular) |
| 3 | Case service e critérios de aceite | **Incompleto** | Case service em `draft`; 10 critérios obrigatórios em `pendente_decisao_humana` |
| 4 | Condição comercial homologada de SKU ativo | **Conflitante** | `sku_catalog` **vazio**; preço vem de `product_catalog` (homologado) e a forma de pagamento da proposta não tem espelho homologado |
| 5 | Matriz jurídica | **Bloqueado** | 12 temas, todos `pendente_revisao_juridica`; 8 bloqueiam assinatura; linhas triplicadas |

---

## 2. Evidência técnica

### 2.1 Proposta Canva
- `proposals` (1 linha, `case_id = a11a0000-…-002`): `status = aprovada`, `aprovada_em = 17/08/2026`,
  `valor = 9600`, `deck_referencia_interna = DECK-CANVA-CA-CID-AT-FAM-2026-001-v1`,
  `paginas_registradas = [1..7]`, `extracao_status = parcial`.
- **`validade = 19/08/2026`** — vencida em relação à data corrente (20/08/2026).
- `proposal_canva_pages`: páginas 1 e 2 `extraida` sem lacunas; páginas 3 a 7 `em_extracao` com
  `campos_nao_localizados`: p3 `servicos_incluidos`, `servicos_excluidos`; p4 `escopos_individuais`,
  `responsabilidades`; p5 `entregas_jornada`; p6 `valor_total`, `forma_pagamento`, `parcelas`;
  p7 `despesas_externas`, `proximos_passos` — **10 campos ausentes**, nenhum inferido (correto).
- `forma_pagamento` textual na proposta: "3 assinaturas mensais de R$ 320 por responsável, durante
  10 meses — total R$ 9.600", sem correspondência estruturada homologada.

### 2.2 Cadastro dos signatários
- `checklist_cadastral`: Ana Luiza 9/9 pendentes, Adair 9/9 pendentes, Alice 9/9 pendentes,
  Felipe 6/6 pendentes, contratada 5 itens em `aguarda_fonte_societaria`.
- `clientes`: 3 adultos em `pre_onboarding`; apenas Ana com documento e contatos completos.
- Defeito de identidade já registrado na auditoria anterior: checklist grava
  **"Adair Gomes Silveira"** contra o canônico **"Adair Pinto Silveira Júnior"**.

### 2.3 Case service e critérios
- `case_services` (1 linha): `status = draft`, `preco_acordado = 9600`,
  `condicao_comercial_aprovada` marcada como referência interna pendente de formalização,
  `escopo_aprovado` declarando explicitamente extração parcial das páginas 3–7,
  `contrato_referencia_interna = NULL`.
- `case_service_criterios`: 10 critérios obrigatórios, **todos** `pendente_decisao_humana`, em
  4 entregas (`ENT-DIAG-FAM`, `ENT-TRILHA-AT`, `ENT-DOSSIE`, `ENT-COMERCIAL`).

### 2.4 Condição comercial
- `sku_catalog`: **nenhuma linha** — não existe SKU ativo/homologado cadastrado.
- `product_catalog`: `PROD-DIAG-FAM-MULTI` — `Diagnóstico Familiar Multipaís`, `ativo = true`,
  `status_homologacao = homologado`, `preco_comercial_vigente = 9600`,
  `requer_fechamento_humano = true`, `vigencia_inicio/fim = NULL`, `homologado_por/em = NULL`.
- `preco-canonico.ts` aceita como fontes canônicas apenas `product_catalog` e
  `excecao_comercial_aprovada`; códigos relevantes aqui: `PRECO_NAO_HOMOLOGADO` não dispara
  (produto homologado), mas `homologado_por/em` nulos e ausência de vigência deixam a homologação
  sem rastro auditável.

### 2.5 Matriz jurídica
- `legal_clause_matrix`: **36 linhas** = 12 temas × 3 duplicatas. Todos `pendente_revisao_juridica`,
  `decisao = NULL`, `decidido_em = NULL`.
- Temas com `bloqueia_assinatura = true` (8): `natureza_servico`, `nao_garantia`, `limite_relatorio`,
  `dependentes_representacao`, `despesas_terceiros`, `dados_retencao`, `inadimplemento`, `rescisao`.
- Não bloqueantes (4): `parcelamento`, `suspensao_prazo`, `encerramento`, `foro`.
- `temasBloqueantesPendentes` (`matriz-juridica.ts`) retornaria os 8 temas — assinatura barrada.

---

## 3. Como as fontes podem ser agregadas

```
product_catalog (preço homologado) ─┐
proposta Canva aprovada (escopo)  ──┤
cadastro dos signatários          ──┼─► instrumentos-preparacao.ts (função pura)
case service + critérios          ──┤        │
matriz jurídica (temas/bloqueios) ──┘        ├─► rascunho interno (permitido/bloqueado)
                                             ├─► assinatura (permitida/bloqueada)
                                             └─► financeiro (permitido/bloqueado)
```

Agregação por chave `case_id`; cada fonte entra com `origem`, `confianca` e `verificado_em`.
Nada é inferido: campo não localizado permanece ausente e vira bloqueio, nunca valor presumido.

---

## 4. Impacto atual

| Ação | Estado | Motivo determinante |
| --- | --- | --- |
| Rascunho interno de instrumento | **Bloqueado** | Escopo Canva incompleto (10 campos) + validade vencida + case service `draft` |
| Assinatura | **Bloqueada** | 8 temas jurídicos bloqueantes pendentes + contrato não preparado + cadastro incompleto |
| Financeiro (cobrança/parcelas/link) | **Bloqueado** | Condição comercial sem espelho homologado; `sku_catalog` vazio; página 6 da proposta sem `valor_total`/`forma_pagamento`/`parcelas` |
| Onboarding / Drive / App | **Bloqueado** | Depende de contrato assinado + pagamento confirmado (gates já vigentes) |

---

## 5. Regra de Felipe

Felipe é dependente/beneficiário do Processo A de Ana; **nunca** cliente nem signatário autônomo.

Quando qualquer uma das três chaves for ativada — `participa_do_contrato`, `possui_acesso_app` ou
`anexo_individual_aplicavel` — aplicam-se cumulativamente:

1. `status_representacao` deve ser `documentada`, com
   `documento_representacao_referencia_interna` preenchido; se `pendente`, bloqueio
   `DEPENDENTE_REPRESENTACAO_PENDENTE`.
2. Acesso ao App exige representação `documentada`; caso contrário
   `DEPENDENTE_APP_SEM_REPRESENTACAO`.
3. Marcar `documentada` sem referência gera `DEPENDENTE_DOCUMENTO_SEM_REFERENCIA`.
4. Em `contract_parties`, Felipe permanece `role = dependent`, `legal_capacity_status = minor`,
   `signature_required = false`. Se algum dia exigisse assinatura, `fn_contract_parties_guard`
   passaria a exigir `represented_by_party_id`.
5. O tema jurídico `dependentes_representacao` é bloqueante e está pendente — logo, hoje **nenhuma**
   das três chaves pode ser ativada.

Estado atual: representação `pendente`, três chaves em `false`, 6 itens de cadastro pendentes.

---

## 6. Desenho da função pura `src/lib/instrumentos-preparacao.ts`

Sem I/O, sem data corrente implícita (recebe `hoje`), sem texto jurídico.

```
Estado = "disponivel" | "incompleto" | "ausente" | "conflitante" | "bloqueado"

EntradaPreparacao = {
  hoje: string
  proposta: { existe, status, vinculadaAoCaso, validade, aprovadaEm,
              deckReferenciaInterna, paginas: { numero, status, camposNaoLocalizados[] }[] } | null
  signatarios: { nome, itensTotal, itensPendentes, documentoOk, contatoOk }[]
  caseService: { status, precoAcordado, condicaoAprovada, escopoAprovado, criterios:
                 { codigo, obrigatorio, status }[] } | null
  comercial: { produtoCodigo, homologado, precoVigente, homologadoPor, vigenciaInicio,
               vigenciaFim, skuAtivoEncontrado } | null
  matriz: { temaCodigo, status, decisao, bloqueiaAssinatura }[]
  dependentes: { nome, statusRepresentacao, documentoReferencia,
                 participaContrato, acessoApp, anexoIndividual }[]
}

PreRequisito = { chave, rotulo, estado: Estado, evidencia: string[], bloqueios: Bloqueio[] }
Bloqueio     = { codigo, descricao, impacta: ("rascunho"|"assinatura"|"financeiro")[] }

ResultadoPreparacao = {
  preRequisitos: PreRequisito[]        // 5 entradas, ordem fixa
  bloqueios: Bloqueio[]                // deduplicados por código
  permite: { rascunhoInterno: boolean; assinatura: boolean; financeiro: boolean }
  resumo: { disponiveis, incompletos, ausentes, conflitantes, bloqueados }
}

avaliarPreparacaoInstrumentos(e: EntradaPreparacao): ResultadoPreparacao
```

Códigos de bloqueio previstos: `PROP_AUSENTE`, `PROP_NAO_APROVADA`, `PROP_NAO_VINCULADA`,
`PROP_VALIDADE_VENCIDA`, `PROP_PAGINAS_INCOMPLETAS`, `CADASTRO_SIGNATARIO_INCOMPLETO`,
`CASE_SERVICE_DRAFT`, `CRITERIOS_PENDENTES`, `COMERCIAL_SEM_SKU_ATIVO`,
`COMERCIAL_SEM_HOMOLOGACAO_RASTREAVEL`, `COMERCIAL_FORA_DE_VIGENCIA`, `COMERCIAL_DIVERGENTE`,
`JURIDICO_TEMA_BLOQUEANTE_PENDENTE`, `JURIDICO_MATRIZ_DUPLICADA`,
`DEPENDENTE_REPRESENTACAO_PENDENTE`. Reaproveitar códigos já existentes em `preco-canonico.ts`,
`escopo-conferencia.ts` e `dependentes.ts` em vez de criar sinônimos.

Regras de derivação: `rascunhoInterno` exige pré-requisitos 1–4 sem `ausente`/`conflitante`;
`assinatura` exige adicionalmente zero temas bloqueantes pendentes e zero pendência de representação;
`financeiro` exige preço canônico conferido e condição comercial homologada.

---

## 7. Desenho da função server somente de leitura

`src/lib/instrumentos-preparacao.functions.ts` — `createServerFn({ method: "GET" })`,
`.middleware([requireSupabaseAuth])`, `.inputValidator(z.object({ caseId: z.string().uuid() }))`.

O handler apenas **lê**, via `context.supabase` (RLS como o usuário):
`crm_casos`, `proposals`, `proposal_canva_pages`, `checklist_cadastral`, `clientes`,
`case_services`, `case_service_criterios`, `product_catalog`, `sku_catalog`,
`sku_price_exceptions`, `legal_clause_matrix`, `case_dependents`, `contract_parties`.

Monta `EntradaPreparacao`, chama `avaliarPreparacaoInstrumentos` e devolve o resultado mais os
metadados do caso. Sem `INSERT`/`UPDATE`, sem `supabaseAdmin`, sem chamada externa, sem geração de
cláusula, sem criação de contrato ou OS. Escrita eventual de auditoria fica fora desta função.

---

## 8. Desenho do componente de matriz jurídica

`src/components/contrato/painel-matriz-juridica.tsx` — painel dentro da aba **Validação Jurídica**
(e como painel contextual em Casos 360 → Formalização). Não é nova aba principal.

- Cabeçalho: contagem por status, número de temas bloqueantes pendentes, aviso de duplicidade
  quando o mesmo `tema_codigo` retorna mais de uma linha ativa.
- Tabela por tema: código, nome, status, `bloqueia_assinatura`, responsável pela revisão,
  decisão, justificativa, `decidido_em`, versão jurídica aplicável, impacto em templates.
- Ação humana: registrar decisão e justificativa por tema (`registrarDecisaoTema`), sem redigir
  cláusula — o painel guarda decisão e rastro, não texto contratual.
- Faixa inferior: "Assinatura bloqueada por N temas", listando os códigos.
- Somente leitura para perfis sem permissão de revisão jurídica.

---

## 9. Critérios de aceite para implementar depois da revisão humana

- [ ] Validade da proposta renovada com motivo registrado, ou nova versão aprovada e vinculada.
- [ ] Páginas 3–7 do Canva completas — 10 campos localizados, nenhum inferido.
- [ ] Cadastro dos três signatários adultos completo (ou com fonte/status explícito por campo).
- [ ] Nome de Adair reconciliado no `checklist_cadastral`.
- [ ] Case service promovido de `draft` com os 10 critérios obrigatórios decididos por humano.
- [ ] Condição comercial com fonte homologada rastreável (`homologado_por`, `homologado_em`,
      vigência) e forma de pagamento espelhada em fonte homologada, não só texto de proposta.
- [ ] `legal_clause_matrix` desduplicada: 12 linhas ativas, uma por tema.
- [ ] 8 temas bloqueantes com decisão e justificativa registradas.
- [ ] Felipe permanece `pendente`, três chaves em `false`, até documento de representação referenciado.
- [ ] `avaliarPreparacaoInstrumentos` coberta por testes cobrindo os cinco estados e as três permissões.
- [ ] Painel exibe estado e bloqueios sem gerar cláusula, contrato, OS, assinatura, cobrança ou comunicação.

**Ordem sugerida:** proposta → cadastro → case service → condição comercial → matriz jurídica.
Nada avança enquanto o caso permanecer em NO_GO.
