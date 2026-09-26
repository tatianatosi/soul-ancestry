# P19 — Divergências de preço resolvidas, país Itália confirmado, e verificação da fórmula de cálculo e do fluxo (2026-09-26)

```yaml
status: executado (preços/país) + investigado (fórmula/fluxo — achados abaixo, nada fabricado)
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Ca Cid 006 vira 249 e cá mem vira 197 os códigos cá Cid 002 a B c d fazem
  parte da Itália verifique em que fase cada um está para adicionar a tabela só não lembre
  cá ind 005 e 006 o que é verifique se o fluxo do planejador está de acordo com [a fórmula
  de cálculo] ... Se segue a taxonomia correta e esse fluxo [pipeline Planilha Mestre →
  Lista-alimento → Catálogo canônico → Caso 360 → Desk/Dossiê → App Cliente → WhatsApp]"
```

## 1. Duas divergências de preço resolvidas por decisão explícita

- **CA-CID-006** ("Combo Codice + SPID"): preço vigente `280,00` → **`249,00`** (o preço sugerido
  da fonte, agora confirmado como correto).
- **CA-MEM-003** ("Entrevista Guiada com Idoso"): preço vigente `297,00` → **`197,00`**.

Ambos fecharam homologação completa (`status_homologacao='homologado'`,
`elegivel_para_proposta=true`, `status_link_asaas` já `validado` nos dois). CA-MEM-003 foi
promovido em `planner_catalog_feed` de `ATIVO_SEM_PRECO_HOMOLOGADO` para `ATIVO_HOMOLOGADO`
pela mesma regra de dado real do P18 (join contra `product_catalog`, não lista fixa). CA-CID-006
**continua `CONDICIONAL_POR_CASO`** — esse rótulo é sobre aplicabilidade por trilha, um eixo
diferente de prontidão de preço; resolver o preço não muda essa classificação.

## 2. CA-CID-002A/B/C/D confirmados como Itália — fase já estava correta, país estava faltando

Conferido em `product_catalog`: as 4 variantes já eram, de fato, produtos de Itália
(`categoria_fonte='Cidadania Italiana'`) — Revisão de Pasta, Atualização de Pasta, Complemento
de Pasta e Pasta+Checklist de Pendências, todos derivados do produto-base `CA-CID-002`
("Montagem Completa de Pasta para Cidadania").

Já estavam corretamente em `planner_catalog_feed` com `journey_phase_default='F2'` e
`product_parent='Preparação de Prova e Pasta Documental'` (fase F2 = "Pesquisa e prova" no
modelo canônico F0-F7, coerente com serem tarefas de montagem/revisão documental) — **nada a
corrigir na fase**. O que faltava era `country_scope`: estava vazio (`[]`) nos 5 códigos da
família (002, 002A, 002B, 002C, 002D), por serem itens pré-existentes à convenção de
`country_scope` introduzida só a partir do P12 para os países adicionados depois. Preenchido
como `['IT']` nos 5.

## 3. CA-IND-005 e CA-IND-006 — identificação (você não lembrava o que eram)

- **CA-IND-005**: "Livro Biográfico Completo — Premium" — livro biográfico com pesquisa
  aprofundada e edição premium, R$5.900,00. Categoria "Memória Individual".
- **CA-IND-006**: "Memória Empresarial — História da Empresa" — registro profissional da
  história e trajetória de uma empresa, R$5.900,00. Mesma categoria.

Ambos já homologados (preço/escopo, desde o P18) mas ainda `ATIVO_SEM_PRECO_HOMOLOGADO` no
planejador — não por preço, mas porque `status_link_asaas` continua `pendente` (gate distinto,
já explicado no P18; não fabriquei validação de link).

## 4. Fórmula de cálculo (`referencia_da_trilha`/`condicao_do_caso`/`caso_multipais`) — investigação: não existe hoje

Investigação direta (agente Explore, busca exaustiva em `supabase/migrations/`, `types.ts`,
todo `src/lib/`, todo `docs/`) confirma: **nenhum dos termos da fórmula que você descreveu
existe hoje** — nem como coluna real, nem como identificador de código, nem como especificação
documentada em `docs/politicas/`. Não é dívida escondida nem vocabulário antigo esquecido — é
genuinamente inexistente no repositório até agora.

O que existe hoje, em vez disso:
- `case_services.preco_acordado` é um **número único, digitado**, nunca decomposto em
  honorários + despesas + taxas + incrementais. `condicao-comercial.ts` inclusive **bloqueia**
  explicitamente qualquer gravação de preço que não espelhe o valor único do catálogo
  (`CAMPOS_PRECO_BLOQUEADOS`, `validarGravacaoPreco`) — hoje o sistema é deliberadamente
  "uma fonte, um valor", não uma soma de componentes.
- `despesas-terceiros.ts` trata despesa de terceiro como trilha **separada**, nunca somada a
  honorário/receita/custo próprio — o oposto de uma fórmula que soma tudo num único valor.
- `planejador-parametros.ts` é o único lugar onde honorários/despesas/taxas aparecem juntos,
  mas só como **texto de exibição** ("Despesas previstas R$X · taxas previstas R$Y"), nunca
  somados nem persistidos como total calculado.

**Conclusão honesta**: esta fórmula de 3 níveis (referência da trilha / condição do caso /
caso multipaís, com soma de honorários+despesas+taxas+incrementais) é uma proposta nova sua,
não uma decisão ou especificação já registrada neste repositório. Se existe um documento-fonte
para ela (fora deste repo, ou ainda não colado aqui), preciso que você aponte — não vou
implementá-la sem ver a especificação completa, dado que ela mudaria uma regra hoje
deliberadamente oposta (preço único vs. preço composto), o que é decisão de arquitetura
comercial, não uma correção de bug.

## 5. Fluxo/taxonomia (Planilha Mestre → ... → WhatsApp) — 6 de 7 etapas reais, 1 aspiracional

| Etapa do fluxo | Tabela/módulo real | Situação |
|---|---|---|
| Planilha Mestre / arquivos históricos | `price_catalog_rescued` + `legacy_catalog_import` | Real, correto — nunca lida em runtime, é o destino da migração, não espelho vivo |
| Lista-alimento legada, versionada e rastreável | `planner_catalog_feed` | Real, **mas não é só histórica** — é lida ao vivo por `motor-cidadania.ts`, `planejador-produtos-pai.functions.ts`, `caso-canonico.functions.ts`, `regra-comercial.functions.ts`. "Legada" está correto como origem (vem de planilha antiga), mas não como "fora de uso" |
| Catálogo canônico de itens elegíveis | `product_catalog` | Real, confirmado (sessões anteriores) |
| Caso 360: produto-pai + trilha + fase + condição + microentregas | `case_plans` + `case_services` + `d7-microentrega.*`/`golive-microentregas.ts`/`alertas-derivados.ts` | Real, todos os campos citados existem e estão ligados |
| Desk/Dossiê: produção, revisão, aprovação, gates, auditoria | `evidences.workflow_status`, `case_source_documents`, `audit_logs`, `owner_override_events` | Real, confirmado |
| App Cliente: projeção autorizada | `app_projections`, `client_deliverables`, `portal_casos` | Real, confirmado |
| **WhatsApp: aviso de valor já liberado (saída automática)** | — | **Não existe.** Só geração de template para cópia manual (`alertas-whatsapp.ts`, `templates-whatsapp.ts` — texto explícito: "nenhum template é enviado por este módulo"), fila com envio automático **desligado por constante** (`fila-comunicacao.ts`: `ENVIO_AUTOMATICO_HABILITADO = false`, travado por teste), e uma linha de catálogo de integração inativa (`whatsapp_meta`/Meta Cloud API) sem nenhuma chamada HTTP real implementada. |

**Conclusão honesta sobre a taxonomia**: as 6 primeiras etapas do fluxo já são exatamente como
você descreveu — a arquitetura real já segue essa cadeia. A última etapa ("WhatsApp: aviso de
valor já liberado") **não existe como envio automático** — é, no máximo, um rascunho que uma
pessoa da equipe copia e envia manualmente pelo canal próprio. Isso não é um gap acidental: é
uma decisão de política já registrada e testada nesta sessão (`ENVIO_AUTOMATICO_HABILITADO =
false`, envio automático de WhatsApp sempre bloqueado). Se você quer manter essa etapa como
"aviso automático via WhatsApp", isso exige decisão explícita de habilitar envio automático —
uma mudança de política de segurança/comunicação, não uma correção técnica.

## Verificação

`tsc --noEmit` limpo, teste novo (`p19-divergencia-preco-e-pais-italia-2026-09-26.test.ts`:
5 testes — preço só muda para os 2 códigos confirmados e só quando divergente, promoção
continua data-driven, CA-CID-006 não muda de status_dictionary, country_scope só para os 5
códigos e só quando vazio, fase nunca tocada), suíte completa idêntica à baseline, `vite build`
limpo. Migration aplicada ao banco real e registrada em `schema_migrations`.

## Prova Lovable pós-push

Em `/catalogo`: CA-CID-006 e CA-MEM-003 aparecem com os novos preços (249,00 / 197,00),
`homologado`. Na lista-alimento/planejador: CA-CID-002/002A/002B/002C/002D aparecem com país
Itália; CA-MEM-003 aparece `ATIVO_HOMOLOGADO`; CA-CID-006 continua `CONDICIONAL_POR_CASO` com
nota do preço resolvido.
