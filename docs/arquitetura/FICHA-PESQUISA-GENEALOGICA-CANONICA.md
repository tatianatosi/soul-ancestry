# Ficha Pesquisa Genealógica — contrato canônico (Fase 3, 27/09/2026)

```yaml
status: executado (majoritariamente documental, por limite explícito do prompt)
fase: 3 de 6 — "Prompt Canônicos — Fichas, Evidências, Identidade e Contrato v1.0"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Une pessoa de pesquisa, linhagem, fonte, consulta, evidência, hipótese,
achado, relatório F1/F2 e microentrega — sem converter nada disso em dado de
cadastro pessoal nem em conteúdo do App Cliente sem gate de aprovação.

## Regra de limite (por que esta fase é majoritariamente documental)

O próprio prompt proíbe criar um segundo CHECK/coluna de estado de evidência.
O vocabulário histórico dos documentos CA05 ("Piloto de Evidência") e Piloto
5A.1 (M1-M6, `dado_pesquisa_inicial`/`pendente_confirmacao`/
`em_validacao_documental`/`validado_por_documento`/`busca_negativa`) **nunca
foi implementado como schema** — confirmado por grep em todas as migrations:
nenhum desses valores aparece em CHECK constraint algum. O vocabulário real e
vigente, verificado nas migrations, é outro.

## Tabela de equivalência — conceito histórico → campo/estado vigente

| Conceito histórico (CA05/Piloto 5A.1) | Campo/estado vigente | Migração |
|---|---|---|
| Classificação de fonte M1 (registro oficial/cartório, consulta manual) | `genealogical_sources_catalog.nivel_de_fonte = 'primaria'` ou `'institucional'` + `modo_de_uso_permitido = 'manual'` | `20260820203240` |
| Classificação M2 (metadados linkout, ex.: Portale Antenati) | `nivel_de_fonte = 'secundaria'`/`'indice'` + `modo_de_uso_permitido = 'metadados_linkout'` | `20260820203240` |
| Classificação M5 (playbook/orientação metodológica, nunca fonte documental) | Fora do catálogo de fontes — vive como conteúdo de referência (Biblioteca Mestre → Modelos), nunca uma linha de `genealogical_sources_catalog` | — |
| Classificação M6 (fonte exploratória colaborativa, ex.: FamilySearch) | `nivel_de_fonte = 'colaborativa'` + `modo_de_uso_permitido = 'nao_validado'`/`'restrito'` | `20260820203240` |
| `informacao_compartilhada_familia` | `status_pesquisa = 'a_confirmar'` (relato ainda sem verificação) | `20260822205306` |
| `dado_pesquisa_inicial` | `status_pesquisa = 'pendente'`/`'hipotese'` (conforme grau de verificação já feito) | `20260822205306` |
| `pendente_confirmacao` | `status_pesquisa = 'hipotese'`/`'provavel'` | `20260822205306` |
| `em_validacao_documental` | `status_pesquisa = 'provavel'`/`'com_suporte'` (evidência anexada, revisão humana em curso) — **achado à parte**: o termo literal "em_validacao_documental" já existe num CHECK real, mas para outro conceito: `crm_casos.hipotese_elegibilidade` (5 valores: nao_avaliada/possivel/em_validacao_documental/documentalmente_confirmada/inconclusiva, migration `20260821190747`) — hipótese de elegibilidade do CASO inteiro, não estado de uma evidência individual. Coincidência de terminologia, não o mesmo campo — não reconciliar como se fossem a mesma coisa. | `20260822205306` (evidência) / `20260821190747` (hipótese do caso) |
| `validado_por_documento` | `status_pesquisa = 'confirmado'` | `20260822205306` |
| `busca_negativa` | `status_pesquisa = 'refutado'` (quando a busca nega a hipótese) ou lacuna registrada sem mudar o status (quando é "não localizado, não é conclusão") | `20260822205306` |
| `documento_fornecido_pela_familia` | `case_source_documents`/`evidences` com `origem`/`workflow_status` reais (ver AGENTS.md, vocabulário `evidences.workflow_status`) | migrations de `case_source_documents`/`evidences` |
| Decisões de governança nomeadas (D-01 consentimento, D-04 fontes, D-05 responsável, D-06 critério de elevação) | Não existe entidade rastreada equivalente — hoje são decisões registradas em `audit_logs`/`owner_override_events` genéricos, sem numeração D-0x. **Declarado, não construído**: criar rastreamento nomeado de decisões de governança é decisão de produto nova, fora do escopo desta fase. |
| Template de log de consulta (`CONSULTA_ID`, `FONTE_ID`, `CLASSIFICACAO_M`, `RESULTADO`) | Sem coluna equivalente em `research_sources`/`research_document_requests`. **Declarado, não construído** — mesma razão acima. |
| Checklist de revisão documental (`LEGIVEL`, `INTEGRO`, `PESSOA_IDENTIFICAVEL` etc.) | Campos parcialmente adjacentes em `case_source_documents` (`extracao_status`, `qualidade_origem`, `confidencialidade`) e `evidence_validations` (`confianca_anterior/nova`, `estado_anterior/novo`) — nomes diferentes, sem 1:1. **Declarado, não construído.** |

**Nada disso é fabricado como CHECK novo.** Os itens "declarado, não
construído" exigiriam decisão de produto (criar rastreamento de decisão
nomeada, criar checklist estruturado de revisão) — fora do escopo desta
fase, que só mapeia o vocabulário existente contra o histórico.

## Hub de caso — já existe, com dois gaps de link fechados

`/pesquisa-evidencias/$caseId` já cobre, num único hub por caso, as 9 peças
pedidas: pessoa de pesquisa e linhagem ("Pessoas, famílias e ramos" +
"Ficha genealógica do caso" + "Relações genealógicas" + link para
`/pessoas-linhagens/$caseId`), fonte e consulta ("Fontes e documentos" +
`ConsultaBasesHomologadas`), evidência ("Evidências e validação"),
hipótese (ver seção própria abaixo — achado da auditoria de 27/09), achado
(link para `/achados/$caseId`), relatório F1/F2 (seção própria) e
microentrega/publicação (link para `/biblioteca-evidencias/$caseId`).

**Gap real fechado (27/09/2026, execução original)**: a seção
"Relatórios F1/F2" só listava (leitura), sem link para criar/editar.
Adicionado link "Criar ou editar relatório de fase →" para
`/relatorios-fase/$caseId` — mesma tela que o corte P5 desta sessão já
conectou ao App.

## Hipótese — 3 sistemas desconectados, achado da auditoria pós-execução (27/09/2026)

A execução original desta fase tratou "Hipótese interna" (o campo de texto
livre `research_cases.internal_hypothesis`, mostrado no hub) como se
cobrisse o conceito de hipótese do prompt canônico. Uma auditoria
posterior (pedida pela Proprietária, que chamou esta fase de "a mais
importante") encontrou que na verdade existem **3 sistemas de hipótese
genuinamente desconectados**:

1. `research_hypotheses` (por `case_id`) — só leitura, exposta na Ficha
   Piloto (`ficha-piloto-genealogica.functions.ts`).
2. `research_case_hypotheses` (por `research_case_id`, com
   `status`/`category`/`confidence_level`) — CRUD completo e real, com UI
   própria em `/pesquisa-modulo/$id` (`src/components/pesquisa/modulo.tsx`,
   aba "Hipóteses") — mas **nunca era alcançável a partir do hub**.
3. `research_cases.internal_hypothesis` — o campo de texto livre único que
   o hub mostrava como se fosse "a hipótese do caso".

O próprio código já registrava essa fragmentação como pendência conhecida
(`src/lib/biblioteca-mestre.ts:170`, "duas tabelas de hipótese,
declarado") — não é um achado inédito, mas nunca tinha sido reconciliado
com o hub de Pesquisa desta fase.

**Gap fechado (só link, sem fundir dado)**: `c.pesquisa.id` (já carregado
pelo hub, é a própria linha de `research_cases`) é exatamente o
`research_case_id` que `/pesquisa-modulo/$id` espera como parâmetro
(`pesquisa-modulo.functions.ts:643-645` confirma o FK). Adicionado link
condicional "Abrir hipóteses estruturadas (status/categoria/confiança) →"
logo após o bloco "Dimensões da pesquisa", e o rótulo do campo de texto
foi clarificado para "Hipótese interna (resumo em texto)" — deixando
explícito que é um resumo, não a lista estruturada. Nenhuma query nova,
nenhum writer novo, nenhuma tabela criada.

**Declarado, não construído — decisão humana pendente**: qual dos 3
sistemas deve ser o canônico daqui pra frente (ou se os 3 continuam
coexistindo com papéis distintos: resumo executivo vs. lista estruturada
vs. leitura legada) é decisão de arquitetura de dado, não algo que um
agente deve resolver sozinho fundindo tabelas. Enquanto essa decisão não
vier explicitamente da Proprietária, os 3 continuam como estão — só
ficaram mutuamente alcançáveis por link.

## Ficha Piloto — mantida pré-pesquisa, com link explícito (opção mais segura)

Por instrução direta do prompt ("mover... se isso não quebrar rota, ou
deixar link explícito... sem duplicar dados"), optei pela opção mais
segura: **não mover de rota** (a Ficha Piloto continua em Caso 360, seção
"Técnico e riscos", só leitura, pré-pesquisa) — só acrescentei um link
"Abrir Pesquisa e Evidências do caso →" para o hub real. Mover de rota
arriscaria quebrar o link já existente do Caso 360 sem ganho real; o link
explícito já satisfaz "não duplicar dados e apontar para a fonte real".

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/fase3-ficha-pesquisa-genealogica-2026-09-27.test.ts`.
Suíte completa e `vite build` — ver rodapé do commit.

## Prova Lovable pós-push

1. Em `/pesquisa-evidencias/$caseId`, seção "Relatórios de fase": conferir o
   link "Criar ou editar relatório de fase →" abrindo `/relatorios-fase/$caseId`.
2. Em Caso 360, seção "Técnico e riscos" (Ficha Piloto): conferir o novo
   link "Abrir Pesquisa e Evidências do caso →".
