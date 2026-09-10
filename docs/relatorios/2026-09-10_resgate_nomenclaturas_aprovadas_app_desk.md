# Resgate das nomenclaturas aprovadas — App Cliente e Desk Intelligence

## Status
Concluído.

## Data
2026-09-09/10

## Fontes
- Mockup visual aprovado de 17 páginas (`clube-ancestral-mockup.pdf`, salvo em `docs/evolucao/recuperados/prompts-lovable-2026-08-31/`).
- `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`.
- `src/lib/navegacao-desk.ts` (CA-UX-03, 8 grupos operacionais reais).
- `src/lib/descoberta-desk.ts`, `src/lib/portal-copy.ts`, `src/lib/matriz-equivalencia.ts`.

## Escopo
Corrigir somente rótulos de navegação, cabeçalhos e textos de contexto que trocaram os nomes aprovados por nomes técnicos ou agrupamentos internos — sem criar tela, rota, grupo, aba, tabela, formulário, checklist, dado de demonstração ou regra de negócio; sem apagar os 8 grupos operacionais reais do Desk; sem alterar fontes vivas, persistência, RLS, contratos, matrizes, indicadores, App ou fluxos.

## Rótulos corrigidos

**Desk — de-para obrigatório aplicado:**
- Grupo de navegação `hoje`: rótulo "Hoje" → **"Visão Geral"**. Cabeçalho de `/painel` (SaasShell + `<title>`): "Painel Hoje" → **"Visão Geral"** (descrição mantém "Painel Hoje" como contexto: "Painel Hoje — o que precisa de ação hoje...").
- Grupo de navegação `casos`: rótulo "Casos" → **"Casos 360"**. Cabeçalho de `/casos` (SaasShell, `PageHeader`, `<title>`, rótulo do CRUD genérico): "Casos" → **"Casos 360"**.
- Grupo de navegação `governanca`: rótulo "Governança" → **"Biblioteca Mestre"** (seu `to` já apontava para `/biblioteca`; conteúdo de governança/jurídico/radar interno/integrações passa a existir como contexto dentro dessa tela aprovada, não como grupo com nome próprio concorrente).
- Sub-item `/tarefas` em Casos 360: "Tarefas e entregas internas" → **"Checklist (tarefas e entregas internas)"**.
- Cabeçalho de `/tarefas`: "Tarefas" → **"Checklist"**.
- `<title>` de `/matriz-juridica`: "Matriz jurídica interna" → **"Validação Jurídica"** (o H1/SaasShell já dizia isso corretamente; só a aba do navegador divergia).
- `<title>` de `/qualidade`: "Qualidade e inconsistências" → **"Radar Interno"** (mesma correção de consistência entre aba e H1).
- `descoberta-desk.ts` (`ROTULOS_HUMANOS["/painel"]`): "Painel Hoje" → "Visão Geral" (registro sem consumidor de UI ainda, corrigido por consistência).
- `matriz-equivalencia.ts` (`grupoNovo`, mapeamento legado→atual): "Hoje"/"Casos"/"Governança" → "Visão Geral"/"Casos 360"/"Biblioteca Mestre".
- `LINKS_CONTEXTUAIS` (atalhos entre grupos): referências a "Governança"/"Hoje"/"Casos" atualizadas para os novos rótulos, preservando exatamente os mesmos atalhos (Validação Jurídica em Comercial/Casos 360, Radar Interno em Casos 360/Pesquisa etc.).

**App Cliente — achado adicional confirmado contra o mockup real de 17 páginas:** a primeira aba (`/portal`) mostrava "Início" na navegação inferior; o mockup aprovado mostra literalmente **"Home"** (em inglês, mesmo com o resto da navegação em português — confirmado na imagem da página 3 do PDF). Corrigido `COPY_TELAS.casos.navegacao` de "Início" para "Home".

**Não alterado (mantido por decisão explícita da missão):** rótulos dos grupos Marketing, Comercial, Pesquisa, Contratos e financeiro e Cliente — já são nomes humanos e continuam como grupos operacionais reais. Sub-item `/ops` ("Operação") não foi renomeado para "Checklist": é um painel distinto de SLA/microentregas, não a tela aprovada de Checklist propriamente dita.

## Itens preservados
Todas as 8 rotas de entrada dos grupos operacionais (`/painel`, `/marketing`, `/leads`, `/casos`, `/pesquisa`, `/contratos`, `/acessos-portal`, `/biblioteca`) — nenhuma rota, funcionalidade ou dado alterado. Nenhum grupo removido, fundido ou escondido. Pessoa 360/Pessoas & Famílias continuam como recursos dentro de Casos 360, sem tela concorrente. Nenhuma âncora ou CTA quebrado — só o texto do rótulo mudou.

## Testes
`depara-nomenclatura-aprovada.test.ts` (15 testes): 8 grupos preservados com as mesmas rotas; rótulos aprovados (Visão Geral, Casos 360, Biblioteca Mestre) presentes; grupos operacionais reais (Marketing, Comercial, Pesquisa, Contratos e financeiro) preservados; Checklist aparece como contexto em Casos 360; `LINKS_CONTEXTUAIS` usa os novos rótulos; cabeçalhos das 7 telas do Desk batem com o nome aprovado; App Cliente sem nomes técnicos do Desk e com "Home" na primeira aba. Ajustados 2 testes pré-existentes (`descoberta-desk.test.ts`, `fase-rotulo.test.ts`) que verificavam os rótulos antigos, para as mesmas verificações com os rótulos corretos — nenhuma verificação foi removida, só atualizada. `npx tsc --noEmit` limpo. `npx vitest run --exclude '**/.claude/**'` — 209 arquivos, 2009 testes, todos passando. `npx vite build` — limpo.

## Limites
Correção só de rótulos visíveis; não foi feita verificação visual ao vivo nesta entrega (ver relatório separado `2026-09-10_ca24b_correcao_visual_real_mockup_17_paginas.md`).

## Próximos passos
Nenhum obrigatório. Se a Proprietária quiser, o mesmo tratamento pode ser estendido a telas/breadcrumbs adicionais fora do escopo desta missão (ex.: `/ops`), mediante aprovação explícita.

## Critério de aceite
Atendido: App mostra Home, Jornada, Radar, Árvore, Documentos, Legado e Conta; Desk usa Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas e Biblioteca Mestre na experiência principal; os 8 grupos operacionais existem sem substituir os nomes aprovados; nenhuma capacidade operacional foi escondida ou perdida; nenhuma mudança de dado, regra, permissão ou contrato foi introduzida.
