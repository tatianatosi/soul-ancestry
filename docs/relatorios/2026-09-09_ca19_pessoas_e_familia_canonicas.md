# CA19-PESSOAS-E-FAMILIA-CANONICAS — execução (09/09/2026)

## Achado

Auditoria completa (grep de `.from("case_members")` em todo `src/lib`, 5 ocorrências no total) mostrou que os leitores restantes citados no objetivo — **Caso 360** (`caso-ficha.functions.ts`), **Pesquisa** (`pesquisa.functions.ts`) e **Documentos** (`fontes-documentos.functions.ts`) — já haviam sido migrados para `pessoasDoCasoComFallbackNucleo` em 07/09/2026 (corte anterior à série CA12–CA18 desta sessão), cada um com o mesmo comentário de achado ("mesmo achado do cotejo tela a tela"). As demais 2 ocorrências são legítimas: reconciliação `case_members`×`nucleo_membros` (`caso-canonico.functions.ts`, precisa comparar as duas tabelas) e escrita de `cliente_id` de volta (`cadastro-checklist.functions.ts`, não é leitura de exibição).

## Alterado

Nenhum arquivo de produção — não havia lacuna de código para fechar. Escrito `ca19-pessoas-e-familia-canonicas.test.ts`, um guard de regressão que varre todo `src/lib` e falha se qualquer novo `.from("case_members")` aparecer fora da lista documentada de exceções — trava o estado para a redundância não voltar por descuido em corte futuro.

## Preservado

`pessoasDoCasoComFallbackNucleo` (fonte única) e a separação de dependente/representação por `case_dependents` (fonte própria, nunca fundida) continuam exatamente como estavam.

## Testes

`ca19-pessoas-e-familia-canonicas.test.ts` (5): nenhum `.from("case_members")` fora da lista de exceções; Caso 360/Pesquisa/Documentos confirmados usando a função canônica; dependentes continuam em `case_dependents`, fonte própria. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (203 arquivos, 1952 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma que bloqueie CA20.
