# CA13-CONTRATO-V2-E-ANEXOS — execução (09/09/2026)

## Achado

O Contrato de Estudo Genealógico v2 (`MODELO-ESTUDO + BASE-GEN-V2`, `contrato-base-consolidado.ts`) e seus Anexos I–V já estavam catalogados em detalhe — versão, situação, fonte de verdade, risco, ação necessária — no inventário patrimonial (`inventario-patrimonial.ts`, leitura de 22/08/2026, somente leitura). Nenhuma tela nunca consumia esse inventário: zero rotas o importavam. `/contratos` (a área contratual real e já operacional — instrumentos, gates financeiro/pesquisa, revisão jurídica) não mostrava versão nem anexos, só a lista de instrumentos.

## Alterado

`contratos.index.tsx`: nova seção "Contrato de Estudo Genealógico v2 e anexos", usando `itensPorDominio("contrato_base")` e `itensPorDominio("anexos")` (funções já existentes no inventário, não uma leitura nova) — mostra os 9 ativos (3 contrato-base + 6 anexos) com ativo, domínio, versão, situação, fonte de verdade e ação necessária. Data do inventário (`INVENTARIO_DATA`) fica visível para não ser confundida com leitura ao vivo do banco. Link para `/governanca/contrato-base` (leitor de texto já existente) dá o "acesso" pedido no aceite, sem criar um segundo leitor.

## Preservado

Nenhum texto jurídico foi reescrito. `inventario-patrimonial.ts`, `contrato-base-consolidado.ts`, `ContratoBaseLeitor`, matriz de cláusulas A–P e todos os 9 itens do inventário (contrato-base + anexos I–V + registros legados) continuam exatamente como estavam — só passaram a ser lidos por uma tela.

## Testes

`ca13-contrato-v2-e-anexos.test.ts` (7): a tela consome `itensPorDominio` (não uma leitura paralela); os 9 ativos existem com os nomes canônicos corretos; link para o texto do contrato-base presente; seção se declara somente leitura; data do inventário visível; nenhuma rota/tabela/aba nova criada; nenhum campo do inventário original foi alterado. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (197 arquivos, 1910 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Nenhuma pendência bloqueia CA14. (O inventário continua datado de 22/08/2026 — atualizá-lo é decisão de governança à parte, não desta CA.)
