# Árvore — três ajustes focais (conferência)

## Situação atual (conferida no código hoje)
Os três ajustes já estão aplicados e publicados desde 27/10. Árvore, genograma, sete abas e cores ficam como estão.
1. **Destaque do ancestral:** não usa mais o nome "Otto Reimer". O destaque vem do registro autorizado do caso da Ana (identificador da pessoa + caso). Em outro caso, ninguém é destacado pelo nome.
2. **Sem teto de gerações:** o filtro "até a geração 10" foi removido. Toda pessoa publicada aparece, e nenhuma geração é criada.
3. **Restaurar visão:** usa o mesmo enquadramento da abertura, ajustado e centralizado ao tamanho da tela.

## O que farei
1. Rodar de novo os testes da Árvore: nomes longos, cônjuges, filiações, outro caso sem destaque e geração acima de 10.
2. Capturar a Árvore atual (já com cartões) em 375 e 1280 px e conferir que nenhuma linha passa por cima de nomes.
3. Gerar uma nova comparação lado a lado com a página 6 do mockup aprovado: `arvore-ajustes-focais-vs-mockup-p6-2026-10-30-v1.pdf`.
4. Fechar com a lista dos arquivos que os três ajustes alteraram: `genograma-familiar.tsx`, `genograma-layout.ts`, `arvore.tsx` e o teste `genograma-focal-2026-10-27.test.ts`.

Não altero parentescos no banco, não publico e não abro uma auditoria geral.
