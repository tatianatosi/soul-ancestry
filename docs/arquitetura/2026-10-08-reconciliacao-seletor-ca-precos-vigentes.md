# Reconciliação executável — famílias CA-, seletor e preços

> **CORREÇÃO DE FONTE (09/10/2026).** Este documento foi medido no Supabase
> `zsxpdbhdvbuulwpepemd` — o projeto **legado da Vercel**, não o banco do
> Lovable (`liiqqibnirnpnvjmjrpj`), que é onde o produto roda e onde será o
> lançamento (decisão da Proprietária). Por isso os números das seções 2 e 3
> **não descrevem a operação atual**. A remedição no banco correto está na
> seção 7, ao fim deste arquivo. O restante do texto é preservado como
> histórico da leitura de 08/10, não como estado vigente.


Status: em revisão
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: consulta ao Supabase zsxpdbhdvbuulwpepemd em 08/10/2026, organização 11f32aae-ea08-47e0-8114-f5d8a900c9a1; product_catalog e leitura anterior de price_catalog_rescued; código do orçamento em main.
Escopo: famílias de propósito, jornada, ciclo, reaproveitamento dos SKUs e preços já vigentes. Não reabre a taxonomia PP.
Premissas: CA-CID e CA-MEM são os propósitos estáveis. País é parâmetro, não produto. Aprovação da proprietária torna o item utilizável; não exige segunda homologação. Planilha Mestre, CRM Mestre e OPS não alimentam o Desk.
Limites: não desbloqueei os 90 registros. Esta publicação não grava banco nem altera o seletor no código. Duplicatas entre organizações não foram apagadas.
Substitui: qualquer leitura que trate PP-01–PP-09 como famílias a executar.
Próximos passos: ligar o seletor de proposta e contrato somente à lista da seção 3 e remover telas que ainda leem Mestre.
Critério de aceite: seção 6.

## 1. Famílias que permanecem

O propósito não muda com a rodada horária de nomes.

| Família | Propósito | Uso na jornada |
|---|---|---|
| CA-CID | Cidadania por país e via | Diagnóstico, prova, execução e atos posteriores |
| CA-MEM | Memória e legado | Pode existir sem cidadania |
| CA-HIST | Pesquisa genealógica | Alimenta CA-CID ou CA-MEM, não cria país |
| CA-ASS | Continuidade | Depois do reconhecimento ou da entrega de memória |
| CA-IND, CA-FAM, CA-COMBO, CA-WPP | Complementos | Só entram se a proprietária reativar o código |

Fases vistas no catálogo vivo: execução, acompanhamento e pós-reconhecimento. Nascimento, casamento e óbito continuam eventos, não fases de produto.

## 2. Os 90 registros

Na tabela inteira há 90 linhas: 69 bloqueadas, 13 em revisão e 8 homologadas. Há duplicata do mesmo código entre organizações e linhas arquivadas. Não são 90 produtos.

Na organização real, sem arquivados, o recorte ativo é pequeno. A maioria bloqueada é deduplicação ou legado e não entra no seletor. Arquivado pode ser reutilizado somente se a proprietária nomear o código. Essa nomeação já o torna alimento; o sistema não deve pedir nova homologação.

## 3. Alimento utilizável agora

Somente a organização real, não arquivado, homologado e elegível para proposta:

| Código | Nome | Fase | Preço vigente |
|---|---|---|---|
| CA-CID-025 | Acompanhamento Familiar — Processo Compartilhado | Execução | R$ 1.190,00 |
| CA-ASS-005 | Plano Anual com Desconto — Memórias | Pós-reconhecimento | R$ 1.825,00 |

Estes dois já podem aparecer no seletor de proposta e contrato, sem novo gate.

Não entram agora, embora tenham preço ou revisão:

| Código | Motivo |
|---|---|
| CA-ASS-001, CA-ASS-003, CA-ASS-004 | Em revisão, sem preço vigente, não elegíveis |
| CA-CID-006 | R$ 280,00, mas em revisão e não elegível |
| CA-HIST-006 | Em revisão, sem preço, restrito à Itália no nome |
| CA-MEM ativo | Os dois não arquivados estão bloqueados |
| CA-CID bloqueados | Nove códigos; não reabrir por prefixo |

CA-CID-001 e CA-CID-AT-001 continuam fora enquanto estiverem em legado a reconciliar. CA-CURSO-001 continua fora pelo estado arquivado da proprietária.

## 4. Tabela de preços

Há duas camadas e elas não se misturam.

Preço vigente de catálogo, já utilizável: somente CA-CID-025 e CA-ASS-005, na seção 3.

Referência resgatada por país, não homologada e não seletor automático:

| País | Honorários | Despesas | Taxas |
|---|---:|---:|---:|
| Alemanha | R$ 4.200 | R$ 1.500 | R$ 500 |
| Áustria | R$ 4.800 | R$ 1.800 | R$ 600 |
| Croácia | R$ 4.000 | R$ 1.800 | R$ 600 |
| Espanha | R$ 3.200 | R$ 1.200 | R$ 400 |
| Polônia | R$ 3.900 | R$ 1.500 | R$ 450 |
| Romênia | R$ 3.600 | R$ 1.400 | R$ 450 |
| Itália e Portugal | Valores divergentes | Respectivas referências | Não escolher automaticamente |
| Hungria, Luxemburgo e Irlanda | Nulo | Não usar zero | Não estimar |

Valor final = honorários + despesas de terceiros + taxas oficiais + outros. Proposta Canva aprovada continua condição do caso e não substitui esta tabela.

## 5. Desk

O Desk deve mostrar apenas o seletor da seção 3, a jornada CA-CID por país e CA-MEM quando reativado. Não deve oferecer Planilha Mestre, CRM Mestre, OPS, PP nem os 90 códigos como lista viva.

A limpeza de tela não foi aplicada neste commit. O alimento já está definido para essa limpeza.

## 6. Aceite

- Seletor usa os dois códigos elegíveis sem nova homologação.
- Bloqueado e deduplicado não aparece.
- Arquivado só volta se a proprietária nomear o código.
- País sem preço não gera proposta automática.
- Mestre, CRM Mestre e OPS não aparecem como fonte.

## 7. Remedição no banco do Lovable (09/10/2026)

Fonte: `mcp__Lovable__query_database`, projeto `1a628b61-ec68-454f-85e1-671d6f297370`
(Supabase `liiqqibnirnpnvjmjrpj`). Somente leitura.

### 7.1 `product_catalog` — 118 linhas em 3 organizações, não 90

| Organização | Linhas | Vivas | Homologadas | Homologadas e elegíveis |
|---|---:|---:|---:|---:|
| Clube Ancestral (real) | 46 | 46 | 31 | **23** |
| DEMO — Organização Alfa (fictícia) | 36 | 36 | 4 | 3 |
| DEMO — Organização Beta (fictícia) | 36 | 36 | 4 | 3 |

O recorte utilizável na organização real é de **23 itens** homologados e
elegíveis para proposta — não "um recorte pequeno" de 2. As 72 linhas das duas
organizações DEMO não são produto do Clube e nunca devem entrar em seletor
(o filtro de fixtures já existe no código).

### 7.2 Preços resgatados — invariante corrigida hoje

`price_catalog_rescued`, 75 linhas:

| Estado | Linhas | Com valor |
|---|---:|---:|
| VIGENTE | 65 | 65 |
| ARQUIVADO | 6 | 6 |
| PENDENTE_DE_HOMOLOGACAO | 3 | 0 |
| CONDICAO_PARTICULAR_DE_CASO | 1 | 1 |

Correção aplicada em 09/10/2026, com `audit_logs`: Luxemburgo, Hungria e
Irlanda tinham honorários **sem valor** marcados como `VIGENTE`. Pelo documento
canônico de 04/09 ("sem valor localizado; não estimar"), passaram a
`PENDENTE_DE_HOMOLOGACAO`. Agora toda linha `VIGENTE` tem valor, e nenhuma
linha sem valor pode ser lida como preço ativo.

### 7.3 O que já estava correto (medido, não presumido)

- `planner_catalog_feed`: 99 itens, com o dicionário de 8 estados exatamente
  como o documento canônico define.
- `CA-CURSO-001`: `ARQUIVADO_DECISAO_PROPRIETARIA`, fora do motor comercial.
- `PACOTE-*`: existe apenas como `legacy_aliases` de itens `CA-*`; nenhum
  `item_id` com esse prefixo. A taxonomia não foi contaminada.
- Áustria: a condição de R$ 9.600 da Ana Luiza está isolada como
  `CONDICAO_PARTICULAR_DE_CASO` e **não** substitui a referência de R$ 4.800.
- Itália e Portugal: as divergências (4.500/4.700/4.800 e 3.800/4.400/4.800)
  foram **resolvidas em 26/09 por decisão explícita da Proprietária** — IT
  R$ 4.700 e PT R$ 4.800 ficaram `VIGENTE`, as perdedoras `ARQUIVADO`. O
  documento canônico de 04/09 pede `DIVERGENTE` e bloqueio; isso descreve o
  estado **anterior** à decisão de 26/09. Não reabri a decisão mais recente —
  se a intenção for voltar a bloquear, é decisão explícita da Proprietária.
