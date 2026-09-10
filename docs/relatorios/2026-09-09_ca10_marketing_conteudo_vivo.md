# CA10-MARKETING-CONTEUDO-VIVO — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0. Nenhuma automação externa, preço, condição comercial ou link de cobrança criado — só leitura viva do que já existe.

## Fontes localizadas (item 1)

`marketing_campaigns`, `marketing_investments`, `lead_sources`, `attribution_records`, `conversion_events`, `leads`, `crm_casos` (todas já lidas por `carregarConversao`) e `message_templates`/`editorial_content_items`/`editorial_content_links` (Biblioteca de Mensagens, `listarBibliotecaMensagens`). O achado central: `attribution_records` já tem `case_id` **e** `lead_source_id` desde a criação da tabela, e nenhuma tela cruzava as duas colunas — "propostas/casos por origem" nunca existiu. Da mesma forma, `editorial_content_items.owner_id` e a tabela inteira `editorial_content_links` nunca tinham um leitor em `src/lib` (confirmado por grep antes da mudança) — motor pronto, nunca ligado, mesmo padrão de CA05/CA08/CA09.

## Indicadores (item 2)

Nova função pura `casosPorOrigem` (`marketing-aquisicao.ts`) agrupa casos por origem catalogada só quando a atribuição já liga `case_id` + `lead_source_id` a uma fonte existente — sem inventar rótulo nem vínculo. Renderizada em `/marketing#atribuicao` como "Casos por origem", com contagem de pagamentos confirmados e chip por caso. Leads por origem (`origensCatalogo`) e conversão (métricas `conversoes_por_canal`/`funil_ate_proposta`) já eram reais; conteúdo/campanha publicado passa a ter listagem individual (abaixo).

## Ações — CTA contextual (item 4)

Origem (visão geral + catálogo de origem) agora abre `/leads`. Caso listado em "Casos por origem" abre `/casos/$caseId` (Caso 360 real). Campanhas passam de 3 badges de contagem para uma tabela por campanha (nome/canal/status/período) — não existe tela própria de detalhe de campanha no Desk, então a linha completa já é a abertura. Conteúdo continua abrindo `/biblioteca-mensagens` (ponte já existente, sem duplicar consulta).

## Sem dados (item 3)

`casosPorOrigem` vazio exibe "Sem dados suficientes" (nunca zero fabricado); mesma disciplina de CAC/ROI/aprendizados já testada antes é mantida sem alteração.

## Conteúdos — Biblioteca de Mensagens (item 5)

"Conteúdos editoriais" ganhou responsável (via `staff_access`, nunca texto livre), status completo nos 8 estados reais do banco, próxima ação derivada do estado (`proximaAcaoEditorial`, ex.: rascunho → "Enviar para revisão") e vínculo via `editorial_content_links` (`referencia`/`derivado_de`/`reutiliza_template`/`relacionado_a` — sempre entidade-a-entidade, nunca pessoa/lead/caso, preservando a regra de LGPD já declarada na tela).

## Testes

`ca10-marketing-conteudo-vivo.test.ts` (16) + 5 novos em `marketing-aquisicao.test.ts`: `casosPorOrigem` nunca inventa origem/rótulo/vínculo, dedup por caso, cobertura dos 8 estados editoriais e 4 link_types, leitura real de `owner_id`/`editorial_content_links`/`staff_access`, CTAs presentes (leads/caso/campanha), nenhum termo de cobrança/automação introduzido. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (194 arquivos, 1881 testes) e `npx vite build` — todos limpos. Reload: `useQuery` com `queryKey` existente, sem estado adicional fora do padrão já usado na tela.

## Pendência

Nenhuma nova coluna, tabela ou automação externa criada. `editorial_content_links` segue sem nenhum gravador na interface (só leitura) — se a Proprietária quiser registrar vínculo pela tela em vez de só exibi-lo, é corte à parte.

Commit: branch temporária → main → recovery.
