# Arquivo GitHub — Planilha Mestre, conciliação e SKU legado

**Data:** 10/09/2026 (confirmado opção B em 11/09/2026)  
**Pedido:** sair da face do Desk; preservar no GitHub. Nada disso volta ao menu, à conta ou a um grupo “Legado”.

Nada foi apagado. As rotas originais continuam em `src/routes/_authenticated/` para URL direta e recuperação. Tabelas (`product_catalog`, divergências, runs de conciliação) não foram tocadas. O catálogo vivo do Desk é `/catalogo` (homologado). Financeiro continua em `/financeiro`.

## O que saiu do Desk

| Superfície | Rota | Por que saiu |
| --- | --- | --- |
| Catálogo operacional 30 | `/governanca/catalogo-operacional-30` | SKU/Top 30 estático — não decide preço nem o dia |
| Conciliação de catálogo | `/conciliacao-catalogo` | Ferramenta de reconciliação histórica, duplicada em relação ao catálogo homologado |
| Divergências de catálogo | `/divergencias-catalogo` | Mesma reconciliação; bloqueio de OS continua no registro, sem tela própria no menu |
| Homologação de SKUs | `/homologacao-skus` | Fluxo legado de SKU; a face viva é o catálogo homologado |
| Origem do escopo | `/escopo-origem` | Leitura/CSV da cadeia; não é fila do dia |

Cópia das rotas nesta pasta: `rotas/`.

## Varredura de Governança (11/09/2026)

O submenu “Legado (fora da operação diária)” do `main` tinha exatamente estes cinco itens. Foram os únicos legado na face da Governança.

**Permanece no menu de Governança (administração viva):** configurações, equipe, etiquetas, integrações, importações, métricas, privacidade.

**Já estava fora do menu:** `/governanca/decisoes` (log citado em pesquisa). CA-04 `/crm-mestre` e `/governanca/dicionario-calls-crm` moram no Comercial.

## O que permanece na face

- `/catalogo` — catálogo homologado (`product_catalog`)
- `/financeiro` — receita confirmada, condições, faturas
- CA-04 `/crm-mestre` e `/governanca/dicionario-calls-crm` no Comercial, com as Calls
- KPIs vivos no Hoje: casos, alertas, leads sem próxima ação, vencidos, vence hoje, exceções. Sem card “Sem responsável”: Tatiana Tosi é a única responsável.

## O que não está neste arquivo

CRM Mestre, dicionário Calls → CRM, dossiê `/pesquisa` e App Cliente **não** entram aqui. Continuam no Desk.

Restaurar um item = recolocar o link em `src/lib/navegacao-desk.ts`, não recriar o arquivo.
