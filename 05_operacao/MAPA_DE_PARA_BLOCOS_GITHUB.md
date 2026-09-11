# Mapa De-Para — Blocos GitHub

**Atualização:** 2026-09-11  
**Sync:** [`../00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md`](../00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md)

## Objetivo

Garantir que decisões, telas, regras e materiais não fiquem só no Lovable, em chat ou em Drive. Cada origem operacional aponta para um bloco consolidado no GitHub.

Estados: `implementado` | `decidido` | `revisar` | `historica_superada`.

---

## De/para consolidado (blocos)

| Bloco atual / provisório | Bloco GitHub consolidado | Estado do bloco |
|---|---|---|
| Mockups, testes e UI demonstrativa | `06_produto_e_app/` | `decidido` (pasta ainda a materializar; App em `src/` + docs portal) |
| Estrutura familiar, CRM, jornada, microentregas do dia | `05_operacao/` | `implementado` (este mapa + ops em código) |
| Motor, propostas, anexos, despesas, ciclo SKU/comercial | `07_contratos_e_comercial/` | `implementado` (arquitetura SKU aqui) |
| Supabase, RLS, Auth, Asaas, SKU dado, integrações | `08_dados_e_integracoes/` | `implementado` (matriz aqui) |
| Desk, CA-05, bases genealógicas, pesquisa | `04_inteligencia_e_pesquisa/` | `decidido` (pasta a materializar; código em `/biblioteca`, `/pesquisa*`) |
| Decisões, ADRs, estado real, commits, changelog, sync | `00_governanca/` | `implementado` |
| Materiais superados, auditorias antigas, versões de proposta, SKU/Planilha face | `09_arquivo_historico/` + `archive/github/` | `decidido` / parcial (`archive/…-legado-catalogo-desk` na PR #97) |

**Nota:** pastas numeradas `02_catalogo/`, `03_jornada_e_entregas/`, `04_linguagem_e_conteudo/` do mapa antigo de 19/08 ficam **absorvidas** pelos blocos acima (catálogo legado → `09`/`archive`; jornada viva → `05`; copy → `04` ou `06`). Não criar sitemap paralelo.

---

## De/para operacional (origens → destino)

| Origem operacional | Artefato a versionar | Destino GitHub | Estado |
|---|---|---|---|
| Face Desk 7 telas + 6 grupos internos | Decisão de nav | `00_governanca/DECISAO-NAV-DESK-…` | `decidido` / `revisar` (código ainda 6-face) |
| 8 grupos como menu principal | — | `09_arquivo_historico/` (conceito) | `historica_superada` |
| CRM: estrutura familiar | Schema, permissões, vínculos | `05_operacao/` + `08_dados_e_integracoes/` | `implementado` / doc `revisar` |
| App: ficha familiar / 7 abas | Fluxo, validações, dívida Entregas/Fase | `06_produto_e_app/` | `implementado` parcial |
| Microentregas → alerta Hoje / WhatsApp / App | Cadência, ops, copy de alerta | `05_operacao/` | `decidido` / fiação `revisar` |
| Proposta: pré-carga | Campos, precedência, arquivo | `07_contratos_e_comercial/` | `implementado` / doc P0 |
| Despesas | Política, categorias, contrato | `07_contratos_e_comercial/` + `05_operacao/` | `implementado` / doc P0 |
| Motor contratual | Regras, testes | `07_contratos_e_comercial/` | `implementado` |
| País/canônico | Dicionário, consumo | `08_dados_e_integracoes/` | `implementado` / reconciliação `revisar` |
| Catálogo homologado `product_catalog` | Schema + `/catalogo` | `08_dados_e_integracoes/` (+ face admin Biblioteca) | `implementado` |
| SKU legado / Planilha / Top 30 / conciliação | Archive + README | `09_arquivo_historico/` + `archive/github/2026-09-10-legado-catalogo-desk/` | `historica_superada` (face); PR #97 |
| Asaas link / checkout / webhook | Matriz; prontidão | `08_dados_e_integracoes/` | `decidido` **bloqueado** até automações OK |
| Calls / Discovery / WhatsApp operacional | Roteiro, consentimento, cadência | `05_operacao/` (+ inteligência em `04_`) | `implementado` parcial |
| Pesquisa / bases / Biblioteca | Fontes, evidências | `04_inteligencia_e_pesquisa/` | `implementado` em `src/`; pasta bloco `decidido` |
| Login / UUID / Auth / RLS | Política, testes | `08_dados_e_integracoes/` + `06_produto_e_app/` | `implementado` / doc `revisar` |

---

## Regra de de-para

Nenhuma alteração relevante está “concluída” só porque entrou no app. Exigir: documentação funcional, referência técnica, impacto operacional, estado de teste e classificação de dados.

## Campos mínimos do manifesto de mudança

- Identificador · data · responsável · commit/PR/migration · domínios · regra anterior/atual · dados pessoais · rollback · evidência de teste · próxima revisão · estado (`implementado`/`decidido`/`revisar`/`historica_superada`)
