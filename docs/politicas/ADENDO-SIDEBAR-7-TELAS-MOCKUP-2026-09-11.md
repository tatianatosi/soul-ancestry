# Adendo vinculante — Sidebar Desk = 7 telas do mockup

**Data:** 2026-09-11  
**Decisão:** Proprietária do Clube Ancestral  
**Status:** vigente — prevalece sobre leituras anteriores de “6 grupos” ou “8 grupos” como **navegação de primeiro nível**.

## Face do produto (sidebar principal)

1. Visão Geral (`/painel`)
2. Casos 360 (`/casos`)
3. Checklist (`/tarefas`)
4. Validação Jurídica (`/matriz-juridica`)
5. Radar Interno (`/qualidade`)
6. Alertas (`/alertas`)
7. Biblioteca Mestre (`/biblioteca`)

## Organização interna (não é menu de primeiro nível)

Os eixos `Hoje`, `Comercial`, `Casos & Pessoas`, `Pesquisa`, `Formalização` e `Governança` continuam a estruturar funções, filtros, CTAs e submenus **recolhidos**. Não são removidos do sistema, do código nem do banco. A mudança é de **hierarquia visual**.

Comercial, Marketing, Formalização e Governança ficam como contexto (no máximo dois cliques a partir da tela certa), não como concorrentes na entrada diária.

## Preservação

- Nenhuma rota, dado, tabela, migration, RLS, Edge Function, documento, contrato ou histórico é apagado.
- Rotas internas permanecem acessíveis por CTA, submenu fechado, busca ou menu da conta.
- App Cliente permanece com as 7 abas canônicas; Entregas / Fase 01 / Fase 02 não são navegação principal.

## Fonte de implementação

`src/lib/navegacao-desk.ts` (`GRUPOS_DESK` = as 7 telas; `GRUPOS_OPERACIONAIS_DESK` = organização interna de referência).
