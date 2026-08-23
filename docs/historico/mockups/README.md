# Histórico de mockups e protótipos — Clube Ancestral (read-only)

Índice documental dos artefatos de protótipo/mockup preservados **fora do runtime**.
Nada nesta pasta (ou em `archive/mockups/`) é compilado, roteado, importado ou
publicado pela aplicação. Decisão da Proprietária Administradora — CA-UX-04,
23/08/2026.

## Código arquivado

Os componentes TypeScript foram movidos para `archive/mockups/`, fora de `src/`,
porque `tsconfig.json` inclui apenas `src/**` e o bundler só alcança `src/`.

| Caminho anterior | Caminho novo | Motivo | Data | Importado no runtime? |
| --- | --- | --- | --- | --- |
| `src/components/desk-app.tsx` | `archive/mockups/componentes/desk-app.tsx` | Desk Intelligence em versão protótipo | 2026-08-23 | Não |
| `src/components/cliente-app.tsx` | `archive/mockups/componentes/cliente-app.tsx` | App Cliente em versão protótipo | 2026-08-23 | Não |
| `src/components/mockup/cliente-mockup.tsx` | `archive/mockups/componentes/mockup/cliente-mockup.tsx` | Mockup v2 do App Cliente | 2026-08-23 | Não |
| `src/components/mockup/desk-mockup.tsx` | `archive/mockups/componentes/mockup/desk-mockup.tsx` | Mockup v2 do Desk (14 abas) | 2026-08-23 | Não |
| `src/components/mockup/ui.tsx` | `archive/mockups/componentes/mockup/ui.tsx` | Primitivos visuais exclusivos do mockup | 2026-08-23 | Não |
| `src/components/mockup/radar.tsx` | `archive/mockups/componentes/mockup/radar.tsx` | Gráfico ilustrativo do mockup | 2026-08-23 | Não |
| `src/routes/prototipo.tsx` | `archive/mockups/rotas/prototipo.tsx` | Rota pública de protótipo | 2026-08-23 | Não |
| `src/routes/mockup.tsx` | `archive/mockups/rotas/mockup.tsx` | Rota pública de mockup v2 | 2026-08-23 | Não |
| `src/routes/_authenticated/referencia-mockup-desk.tsx` | `archive/mockups/rotas/referencia-mockup-desk.tsx` | Referência interna de 14 abas | 2026-08-23 | Não |

O controle `AppSwitcher` (alternância "App Cliente / Desk Intelligence") foi
removido de `src/components/brand.tsx`; seu uso permanece apenas nas rotas
arquivadas acima.

## Documentação e capturas

PDFs, capturas e material histórico permanecem preservados em `docs/` e nas
pastas de referência existentes. Nenhum arquivo documental foi apagado.

## Regra de retorno

O protótipo **não pode voltar ao runtime** sem, cumulativamente:

1. novo documento de decisão assinado pela Proprietária Administradora;
2. atualização da matriz de equivalência (`/governanca/matriz-equivalencia`);
3. aceite explícito registrado em changelog.
