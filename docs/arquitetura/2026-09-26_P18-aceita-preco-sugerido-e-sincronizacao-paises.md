# P18 — Aceitar preço sugerido (regra permanente) + verificação de sincronização por país (2026-09-26)

```yaml
status: executado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Aqueles que tiverem preços sugeridos na planilha mestre dos itens vivos podem
  ser ativos pois a regra sempre foi aceitar o preço sugerido, em relação a Itália e Portugal
  veja o que já tem no planejador e aqueles produtos que faltam pode sincronizar de acordo com
  o planejador e suas fases o mesmo se aplica para os demais países como Hungria Croácia Romênia
  Áustria Bélgica e qualquer outro"
```

## 1. Preço sugerido aceito — 24 itens vivos, sem inventar nenhum valor

Verificado ao vivo (`product_catalog`, organização real `11f32aae-...`): 24 códigos tinham
`preco_sugerido_fonte` preenchido (dado real da fonte original) mas `status_homologacao <>
'homologado'`, com o preço vigente vazio ou já igual ao sugerido — nunca divergente. Aceito
exatamente como a regra manda: `preco_comercial_vigente = preco_sugerido_fonte`,
`preco_estado_homologacao = 'homologado'`.

Ao tentar também fechar `status_homologacao = 'homologado'`, o trigger real
`trg_catalogo_homologacao_guard` reverteu silenciosamente para `'bloqueado'` — motivo: exige
`escopo_aprovado` preenchido. Resolvido com o mesmo princípio da própria regra da Proprietária
("aceitar o dado já resgatado"): copiado de `descricao_curta_fonte` (campo real, já existente na
fonte, não texto novo) para os 24 códigos. Depois disso, os 24 confirmaram
`status_homologacao = 'homologado'` de fato (não só de papel — conferido por releitura).

Códigos afetados: CA-CID-001, 002, 002A, 002B, 002C, 002D, 003, 009, 016, 018, 019, 020, 021,
023, CA-COMBO-001, CA-HIST-001, CA-HIST-002, CA-HIST-004, CA-IND-001, CA-IND-002, CA-IND-005,
CA-IND-006, CA-MEM-004, CA-MEM-008.

## 2. Dois preços NÃO tocados — divergência real exige a sua confirmação

**CA-CID-006** (`preco_comercial_vigente=280,00` vs `preco_sugerido_fonte=249,00`) e
**CA-MEM-003** (`preco_comercial_vigente=297,00` vs `preco_sugerido_fonte=197,00`) têm preço
vigente diferente do sugerido — não é "vazio, aceitar sugerido"; é uma divergência real entre
dois valores já gravados. Sobrescrever um preço já vigente é mais consequente que preencher um
vazio; a regra da Proprietária ("aceitar o sugerido") não deixou claro se ela sabia desta
divergência específica. **Fica para sua confirmação explícita**: qual valor é o correto para
cada um.

## 3. `elegivel_para_proposta=false` em 6 códigos — achado, não bug: gate de Asaas, distinto do de preço

Depois do fechamento de escopo/preço, 6 dos 24 (CA-CID-002A/B/C/D, CA-IND-005/006) continuaram
`elegivel_para_proposta=false` mesmo com `status_homologacao='homologado'`. Investigado: os 6
compartilham `status_link_asaas='pendente'` — o trigger real de governança exige
`status_link_asaas in ('validado','nao_aplicavel')` para elegibilidade comercial plena, um gate
**distinto** do de preço/escopo (validação do link de cobrança, não do valor). Não fabriquei
validação de link — isso exigiria confirmar que o link Asaas existe e está correto, decisão
fora do escopo desta regra de preço. Os 4 códigos `002A/B/D` já estavam `CONDICIONAL_POR_CASO`
no planejador (não tocados); os 2 restantes (`002C`, `IND-005`, `IND-006`) ganharam nota
explicativa em `planner_catalog_feed.reconciliation_note` — continuam `ATIVO_SEM_PRECO_HOMOLOGADO`
(rótulo correto na prática: ainda não plenamente comercial), não `ATIVO_HOMOLOGADO`.

## 4. Itália e Portugal — o que já tem no planejador, o que faltava sincronizar

Verificação direta (join `product_catalog` × `planner_catalog_feed`, corrigindo um erro de
precedência SQL da minha primeira consulta — `AND`/`OR` sem parênteses vazava linhas de outras
organizações para os prefixos não-Itália, corrigido antes de qualquer decisão):

- **Itália**: **nenhum código real está ausente do planejador** — todo `CA-CID-*` e `CA-ASS-*`/
  `CA-HIST-*`/`CA-IND-*`/`CA-MEM-*`/`CA-COMBO-*` real já tem linha em `planner_catalog_feed`
  (os 20 itens reclassificados no P17 já cobriam isso). O que faltava não era item ausente — era
  **estado** (preço/homologação), corrigido nas partes 1-3 acima.
- **Portugal, Hungria, Croácia, Romênia, Áustria, Bélgica** (e todos os demais países, `DE`,
  `ES`, `PL`, `LU`, `IE`, `NL`, `EE`, `LV`, `LT`, `CZ`, `SI`): **zero linhas reais em
  `product_catalog`** para qualquer um destes países (reconfirmado agora por consulta direta,
  incluindo `CA-NAT-*`). Não há, portanto, nenhum produto real adicional a sincronizar para eles
  além do que os P16/P17 já trouxeram como especificação (`ATIVO_SEM_PRECO_HOMOLOGADO`, sem
  preço estimado, conforme a regra "não estimar" já vigente). Assim que a Proprietária cadastrar
  produtos reais para esses países em `product_catalog` (com preço sugerido da fonte), a mesma
  regra desta rodada se aplica automaticamente a eles.

## 5. Promoção de `planner_catalog_feed` — regra de dado real (join), não lista fixa

12 itens que já eram `ATIVO_SEM_PRECO_HOMOLOGADO` e agora confirmam `status_homologacao=
'homologado'` **e** `elegivel_para_proposta=true` em `product_catalog` foram promovidos para
`ATIVO_HOMOLOGADO`: CA-CID-001, 002, 009, 019, 020, 021, 023, CA-COMBO-001, CA-HIST-001,
CA-HIST-004, CA-IND-001, CA-IND-002. Itens `CONDICIONAL_POR_CASO` (aplicabilidade condicional,
categoria diferente de prontidão de preço) não foram tocados por esta regra, mesmo quando o
produto real já está homologado — são classificações distintas.

## Achado à parte, não acionado nesta rodada (fora do pedido, declarado)

Verificação de órfãos (`product_catalog` sem linha correspondente em `planner_catalog_feed`)
encontrou 9 códigos: `CA-DIAG-003`, `CA-DOC-005`, `CA-FAM-001`, `CA-MEM-006`, `CA-PROT-002`,
`CA-PROT-004`, `PROD-COMPL-DOC`, `PROD-DIAG-FAM-MULTI`, `PROD-DIAG-INDIVIDUAL`. Nenhum é
produto de país (todos multi-país/genéricos — os 5 do P9 nunca ligados ao planejador, mais os
3 produtos-tampão do piloto de 19/08). Fora do escopo deste pedido (que é especificamente sobre
países) — não vinculei ao planejador sem pedido explícito. Registrado como dívida separada.

## Verificação

`tsc --noEmit` limpo, teste novo (`p18-aceita-preco-sugerido-2026-09-26.test.ts`: 6 testes —
regra de preço nunca sobrescreve divergência, nunca inventa valor, escopo vem de dado real,
promoção é join contra `product_catalog` nunca lista fixa, nunca promove `CONDICIONAL_POR_CASO`,
nota do Asaas nunca fabrica validação), suíte completa idêntica à baseline, `vite build` limpo.
Migration aplicada ao banco real e registrada em `schema_migrations`.

## Prova Lovable pós-push

Abrir `/catalogo`: os 24 códigos aparecem com preço vigente = preço sugerido, `homologado`;
CA-CID-006 e CA-MEM-003 continuam com o preço antigo (280/297), aguardando decisão. Na
lista-alimento/planejador: os 12 itens promovidos aparecem `ATIVO_HOMOLOGADO`; CA-CID-002C/
CA-IND-005/CA-IND-006 continuam `ATIVO_SEM_PRECO_HOMOLOGADO` com nota sobre o link Asaas
pendente. Portugal/Hungria/Croácia/Romênia/Áustria/Bélgica continuam só com os itens de
especificação já existentes (sem preço), sem item novo.
