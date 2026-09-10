# Correção de referência de mockup e manutenção dos 8 grupos operacionais

## Status
Concluído.

## Data
2026-09-09

## Fontes
- `docs/evolucao/recuperados/prompts-lovable/ca_ux_01_1_decisoes_mockup_17_telas_e_prompt_reconciliacao_v1_1.md` — declara `clube-ancestral-mockup.pdf` (17 páginas) como fonte visual primária e `clube-ancestral-mockup-auditoria.pdf` (47 páginas) como fonte complementar de conteúdo/estados/fluxos.
- `docs/relatorios/2026-09-09_ca13_uxui_pantone_mockup.md` — relatório que citava incorretamente o PDF de 47 páginas como "o mockup aprovado".
- `docs/politicas/fonte-de-verdade-design-e-execucao.md` — ordem de precedência aplicada (decisão explícita e mais recente da Proprietária > política aprovada > mockup aprovado > implementação existente).
- Decisão vinculante da Proprietária desta mesma data: manter os 8 grupos operacionais reais do Desk.

## Escopo
Corrigir somente o rótulo/referência ao mockup aprovado no relatório de comparação UX/UI da CA anterior, e registrar formalmente a decisão de manter os 8 grupos operacionais do Desk. Sem alteração de layout, rota, dado ou regra de negócio.

## Correção aplicada
No arquivo `docs/relatorios/2026-09-09_ca13_uxui_pantone_mockup.md`:
- Adicionada nota de correção no topo declarando que o mockup aprovado de UX/UI é o documento de 17 páginas (`clube-ancestral-mockup.pdf`), não presente neste repositório, e que o PDF de 47 páginas é material de auditoria/referência complementar, sem força normativa de design.
- Todas as menções que tratavam o PDF de 47 páginas como "o mockup" foram trocadas para "o PDF de auditoria", inclusive nas seções de paleta/tipografia, estrutura visual e estados/CTAs/dados vivos.
- Registrada explicitamente a decisão vinculante da Proprietária de manter os 8 grupos operacionais reais do Desk (Hoje, Marketing, Comercial, Casos, Pesquisa, Contratos, Financeiro, Biblioteca/Governança), encerrando a divergência antes apenas "registrada para decisão".
- Nenhum outro documento ou trecho de código no repositório trata o PDF de 47 páginas como mockup aprovado (verificado por busca em `docs/` e `src/`); nenhuma outra correção de rótulo foi necessária.

## Itens preservados
Todas as rotas, CTAs, fontes vivas, contratos, matrizes, App Cliente, RLS, indicadores e dados — nenhum arquivo de código foi tocado nesta correção. Os 8 grupos operacionais do Desk continuam intactos e visíveis, agora com a preservação formalizada como decisão explícita, não apenas herança histórica.

## Testes
Correção é exclusivamente documental (rótulo/referência em relatório Markdown) — nenhuma leitura de código ou lógica de aplicação faz referência ao nome do arquivo de mockup, então nenhum teste automatizado se aplica (nenhum teste decorativo criado). `npx tsc --noEmit` limpo. `npx vitest run --exclude '**/.claude/**'` — 208 arquivos, 1994 testes, todos passando (suíte inalterada, como esperado para correção documental). `npx vite build` — limpo.

## Limites
O arquivo `clube-ancestral-mockup.pdf` (17 páginas, mockup aprovado real) não está presente neste repositório — a comparação visual tela a tela da CA anterior foi feita contra o PDF de auditoria de 47 páginas, não contra o mockup aprovado propriamente dito. Uma verificação de conformidade real contra o mockup de 17 páginas depende de esse arquivo ser disponibilizado nesta sessão ou anexado ao repositório.

## Próximos passos
Se a Proprietária quiser uma verificação de conformidade visual real (não apenas de rótulo), anexar ou apontar o caminho do `clube-ancestral-mockup.pdf` de 17 páginas. Trabalho de clareza visual dos 8 grupos do Desk (ordem, rótulo humano, ícone, agrupamento, hierarquia) permanece disponível para uma CA própria, sem redesenho e sem criar elementos novos, conforme já registrado no relatório corrigido.

## Critério de aceite
Atendido: nenhum documento chama o PDF de 47 páginas de mockup aprovado; a fonte aprovada de UX/UI está identificada como o mockup de 17 páginas; os 8 grupos operacionais continuam visíveis e preservados por decisão explícita; a mudança não alterou produção além da referência/rótulo no relatório.
