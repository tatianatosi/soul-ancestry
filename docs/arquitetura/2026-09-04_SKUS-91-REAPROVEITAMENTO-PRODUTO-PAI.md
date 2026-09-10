# SKUs do saneamento de 25/08 (91 linhas): o que é reaproveitável como alimento para produto-pai e Planejador Universal

```yaml
status: mapeamento — pendente de decisão da Proprietária
versão: 1.0
data: 2026-09-04
projeto: Clube Ancestral
classificação: de-para de reaproveitamento de dado real
responsável pela decisão: Proprietária Administradora do Clube Ancestral
fonte: docs/evolucao/recuperados/fontes-primarias/01_CATALOGO_E_SKUS/SANEAMENTO_DE_SKUS.csv
  (91 linhas, 25/08/2026) cruzado ao vivo contra product_catalog (Supabase, projeto
  zsxpdbhdvbuulwpepemd) em 04/09/2026, 35 códigos distintos ativos hoje.
escopo: responder "o que dos 91 SKUs pode ser reaproveitado como alimento para produtos-pai
  e Planejador Universal" — somente leitura, nenhuma escrita em product_catalog além do
  arquivamento de duplicatas já feito antes desta tarefa.
limites: não recria nenhum SKU, não decide reativação — só mapeia e sinaliza.
```

## Causa

Pedido da Proprietária (04/09): "Veja destes 91 skus o que pode ser reaproveitado como
alimento para produtos pai e planejador universal." Complementa o PR #82 e sua correção
(`2026-09-04_DE-PARA-SKUS-CORPUS-HISTORICO-COMPLETO.md`), que já tinha classificado esse CSV
como "duplicata/reformatação" de `01_CATALOGO_E_SKUS_Saneamento_Mestre_SKUs.md" sem extrair
seu conteúdo linha a linha. Esta tarefa lê as 91 linhas de verdade e cruza contra o banco ao
vivo.

## 1. Achado principal: o CSV já tem hierarquia produto-pai real, usável agora

O CSV tem colunas `Produto-pai` e `Produtos-filhos` preenchidas para vários SKUs — é
"alimento" direto, sem precisar inventar taxonomia nova:

| Produto-pai | Filhos/absorvidos | Já bate com o de-para do PR #82? |
|---|---|---|
| `CA-CID-002` | `CA-CID-002A/B/C/D` | Sim — PR #82 já tinha esse mesmo agrupamento (P03) |
| `CA-CID-006` | absorve `CA-CID-004`, `CA-CID-005` (decisão: `DESCONTINUAR` os filhos) | Consistente — PR #82 mapeou 006 para P06; 004/005 nunca existiram no banco |
| `CA-CID-011` | absorve `CA-CID-007` (`ARQUIVAR`, sobreposição de nome) | Novo — não estava no PR #82 |
| `CA-CID-014` | absorve `CA-CID-008` (`ARQUIVAR`, sobreposição de nome) | Novo — não estava no PR #82 |
| `CA-MEM-003` | absorve `CA-MEM-002` (`ARQUIVAR`) | Novo — não estava no PR #82 |
| `CA-CID-001` | `CA-CID-024` (proposto, **não decidido** — status `BLOQUEADO`) | Fusão sugerida em 25/08 e nunca decidida; `CA-CID-024` não existe no banco hoje |

Isso é reaproveitável direto: já é dado real, com motivo registrado, sem precisar recriar
nada — só formalizar como metadado de produto-pai se a Proprietária aprovar.

## 2. Achado maior que o `CA-CID-003` isolado: um padrão de SKUs "para manter" que sumiram

O PR #82 já tinha achado `CA-CID-003` fisicamente excluído (nem ativo, nem arquivado). Cruzando
os 91 códigos do CSV contra os 35 códigos reais de hoje, esse não é um caso isolado — é um
padrão. Estes SKUs tinham decisão **`MANTER`** ou **`AJUSTAR`** (nunca `ARQUIVAR` nem
`DESCONTINUAR`) no saneamento de 25/08, e **não existem em `product_catalog` hoje, nem ativos
nem arquivados**:

| Code | Nome | Decisão em 25/08 | Motivo registrado no CSV |
|---|---|---|---|
| `CA-CID-003` | AIRE + Agendamento de Passaporte | `AJUSTAR` | Separar avulso de bundle; já era `TOP PARETO` |
| `CA-CID-022` | AncestralScan™ — Scan Completo (5min) | `MANTER` | Lead magnet gratuito, funil/CRM — não deveria ser cobrado, mas deveria existir |
| `CA-CID-026` | AncestralScan™ — Diagnóstico Rápido (60s) | `MANTER` | Par do CA-CID-022, qualificador rápido |
| `CA-FAM-001` | Familiar Conectado (base) | `AJUSTAR` | Camada de entrada abaixo do `CA-FAM-002` (que existe) |
| `CA-WPP-001` | Pacote WhatsApp Essencial | `AJUSTAR` | Camada de entrada abaixo do `CA-WPP-002` (que existe) |
| `CA-ASS-006` | Acervo Digital Familiar (Plano SaaS) | `AJUSTAR` | Status divergente entre fontes já em 25/08, nunca resolvido |
| `CA-CID-011/012/013/014/015/017` (6 códigos) | Certidões/registros pós-cidadania migrados da Digishop | `AJUSTAR` (todos) | "Precisa de link Asaas novo — prioridade Fase 2 (D31–D60)" — ficaram pendentes e nunca voltaram |

**Por que isso importa para produto-pai/Planejador**: `CA-CID-022`/`CA-CID-026` (AncestralScan)
são exatamente o tipo de SKU que alimentaria o **P01 — Diagnóstico de elegibilidade e direção**
do Planejador Universal (documento de 02/09) — e hoje não existem no catálogo real, então P01
não tem SKU vivo de diagnóstico gratuito. `CA-FAM-001`/`CA-WPP-001` fariam par de entrada com
os `-002` que já existem (P08 — continuidade/relacionamento). Os 6 códigos pós-cidadania
alimentariam P06. Sem eles, esses produtos-pai ficam sem a metade "leve"/"entrada" do catálogo.

**Não sei se isso é decisão deliberada ou perda de dado.** Pode ser que esses SKUs tenham sido
descontinuados por decisão comercial não documentada em código. Mas como nenhum deles tem
`archived_at` preenchido — diferente de tudo que passou pela disciplina "arquivar, não
apagar" que os próprios documentos históricos definem — não há como distinguir "decisão" de
"perda" só olhando o banco.

## 3. SKUs operacionais reais que nunca foram formalizados no catálogo

Quatro códigos aparecem no CSV como `ATIVO (não catalogado oficialmente)` — eram usados de
verdade na Matriz Operacional (fila Top 30), mas nunca entraram em `product_catalog`:

| Code | Nome | Observação do CSV |
|---|---|---|
| `CA-DOC-001` | Pedido de Certidão | "presente apenas na Matriz Operacional... PROPOSTA PENDENTE DE APROVAÇÃO" |
| `CA-DOC-002` | Combo de Certidões | idem |
| `CA-POS-001` | AIRE + Passaporte (pós-reconhecimento) | **"Risco de sobreposição com CA-CID-003... confirmar se é o mesmo escopo antes de formalizar SKU novo"** |
| `CA-REG-001` | Registro de Filho / Casamento | "presente apenas na Matriz Operacional... PROPOSTA PENDENTE DE APROVAÇÃO" |

`CA-POS-001` é a peça que fecha o quebra-cabeça do achado do PR #82: em 25/08 já se sabia que
havia risco de duplicidade entre `CA-POS-001` (nunca formalizado) e `CA-CID-003` (formalizado,
`TOP PARETO`). Ninguém decidiu qual ficava — e agora **os dois estão ausentes** do catálogo
real. O produto "AIRE + Passaporte pós-reconhecimento" não tem nenhum SKU vivo hoje, apesar de
ter sido documentado como demanda real duas vezes.

## 4. O que não é reaproveitável — puro histórico, sem ação

Todos os códigos com sufixo `-OLD` (17 no total: `CA-ASS-004-OLD`, `006-OLD`; `CA-CID-011-OLD`
a `022-OLD`, 7 códigos; `CA-COMBO-003-OLD`; `CA-CURSO-001/002/003-OLD`; `CA-HIST-003-OLD`;
`CA-IND-003/004/007-OLD`; `CA-MEM-007/009-OLD`) são marcados `ARQUIVAR` com o motivo padrão
"mantém código para rastreabilidade histórica; substituída pela versão ativa". São
puramente históricos — não alimentam nada, e o próprio CSV já os classificou assim há mais de
uma semana. Confirma achado do PR #82: histórico já superado.

## 5. O que este documento NÃO decide

- **Não decide** reativar nenhum dos SKUs "ausentes com decisão de manter" (Seção 2) — só
  sinaliza o padrão. Pode ser decisão comercial deliberada não documentada.
- **Não decide** formalizar `CA-DOC-001/002`, `CA-POS-001` ou `CA-REG-001` como produto real —
  eram propostas `PENDENTE DE APROVAÇÃO` em 25/08 e continuam sem decisão.
- **Não decide** qual das duas propostas para o produto "AIRE + Passaporte pós-reconhecimento"
  (reviver `CA-CID-003` ou formalizar `CA-POS-001`) é a certa.
- **Não decide** se a hierarquia produto-pai da Seção 1 deve ser gravada como metadado formal em
  `product_catalog` (não existe hoje coluna própria para isso — `papel_comercial`/
  `faixa_prioridade`, do achado anterior do PR #82, são os campos mais próximos que já existem).
- **Não altera nenhuma linha de `product_catalog`, nenhuma migration, nenhum código.**
