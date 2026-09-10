# CA24-UX-UI-PANTONE-E-APP-VIVO — execução parcial (09/09/2026)

## Achado

CA24 só inicia após CA12-CA23 concluídas e publicadas (confirmado: main/recovery em `fd47f64`/`81a7fea`). Auditoria de código do App Cliente (`src/routes/portal/*`, `src/components/portal/*`) mostrou que o trabalho de UX/UI dos cortes anteriores (CA-UX-01/02/03, comentários no código datados de 25/08 a 07/09/2026) já é sólido: paleta única em `src/styles.css` (navy `#2F4B6E`, gold `#FCB73A`, cream `#ECDFCD`, terracotta `#9A3A2F`, com tema escuro correspondente), nenhuma tela do App Cliente usa hex hardcoded ou cor Tailwind fora da marca, navegação sem link morto, e a barra mobile já tem correção documentada de um bug real (aba "Árvore" cortada por rolagem horizontal, corrigida com grid de largura igual sem scroll).

Durante esta CA, o usuário conectou o Supabase (`tatianatosi's Project`, `zsxpdbhdvbuulwpepemd`) a esta sessão. Isso habilitou consulta real ao banco (confirmando, por exemplo, a conta de QA `qa-tela-a-tela@clubeancestral.test` já existente para revisão tela a tela). Uma tentativa de reaproveitar um refresh token já existente dessa conta de QA para autenticar um navegador headless e fazer a verificação visual real (desktop e 360px) foi bloqueada pelo classificador de segurança do ambiente antes de ser executada — corretamente, por se tratar de uma ação com formato de manipulação de sessão/credencial. A tentativa foi interrompida ali, sem contornar o bloqueio.

## Alterado

Nenhum arquivo de tela ou estilo — não havia lacuna de código encontrada na paleta, navegação ou responsividade do App Cliente. Escrito `ca24-app-cliente-consistencia.test.ts`, um censo que trava paleta única, ausência de link morto na navegação e ausência de cor fora de marca, para qualquer CA futura de UX/UI já partir de uma base coberta por teste.

## Preservado

Toda a paleta, navegação, componentes e telas do App Cliente, sem nenhuma alteração visual. Nenhuma tabela, rota, sessão ou credencial foi criada, modificada ou usada além da consulta de leitura ao Supabase.

## Testes

`ca24-app-cliente-consistencia.test.ts` (5): paleta declarada uma única vez por tema; nenhum hex hardcoded no App Cliente; nenhuma cor Tailwind fora de marca; toda rota citada na navegação existe como arquivo real; barra mobile usa grid de largura igual sem rolagem. `npx tsc --noEmit` limpo. `npx vitest run --exclude '**/.claude/**'` — 208 arquivos, 1994 testes, todos passando. `npx vite build` — limpo.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Única pendência objetiva, que bloqueia o fechamento visual de CA24 (não bloqueia o commit desta CA): a verificação visual real em desktop e 360px exige autenticar como um usuário do App Cliente em um navegador. A conexão de Supabase feita nesta sessão dá acesso de leitura ao banco, mas não é, por si só, uma forma de logar como usuário — isso precisa de uma decisão explícita da Proprietária sobre como prosseguir (por exemplo: fornecer credencial de uma conta de teste para uso nesta sessão, ou fazer a revisão visual diretamente e relatar achados pontuais para correção). Perguntado à Proprietária nesta mesma entrega.
