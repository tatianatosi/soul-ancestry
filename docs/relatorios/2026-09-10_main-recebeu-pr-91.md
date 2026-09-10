# `main` recebeu o PR #91 — 2026-09-10

Tatiana pediu para empurrar o que já estava aprovado para `main`, porque a produção Vercel (`soul-ancestry.vercel.app`) ainda mostrava o caos antigo.

## O que aconteceu

- Produção acompanha `origin/main`. PRs fechadas no GitHub **não** entram em produção.
- CA02–CA24 em `main` **não** significa que as PRs #30–#84 tenham sido implementadas.
- O trabalho visível que ela já tinha aprovado estava em `cursor/pesquisa-alinhamento-busca-5d7b` (PR **#91**).
- Em 2026-09-10 esse ramo foi mesclado em `main` com merge commit (sem rebase, sem force-push): `51a28e82`.
- PR #91: https://github.com/tatianatosi/soul-ancestry/pull/91 — estado **MERGED**.

A Vercel de produção só atualiza depois deste merge. O preview do #91 já estava verde; o site antigo era `main` sem esses 9 commits.

## O que agora está em `main` (o que ela passa a ver)

- Alinhamento visual do Desk ao mockup (8 grupos; 8º = Cliente; financeiro em Contratos).
- Pesquisa reconectada ao Supabase.
- Motor unificado de próxima ação no App Cliente (7 abas).
- Pente-fino Ana como primeira cliente (contrato/legado fora da face).
- Inventário P0–P11 na Biblioteca + diagnóstico do Planejador de Cidadania 0–8 no Caso 360.
- Criação da linha de `onboarding_planos` se faltar (não ativa cliente).
- SKU do contrato só entra com `product_catalog` ativo e homologado.

## O que NÃO entra só porque o #91 mesclou

Fechar ou mesclar #91 **não** implementa a pilha #30–#84. Continua fora de `main` como motor:

| Ordem | O que falta | PR / motor |
|---|---|---|
| P1 | Unificação de núcleos fases 2–6 | #30 |
| P1 / P3 | Decisão de tarefa após salvar pessoa | #32 |
| P2 | Barra de contrato só com ações que gravam | #35, #40, #53 |
| P3 | CRM Vivo restante (cadência por evento) | #67 |
| P4 | Onboarding completo (tarefas + micro-entrega; não só criar a linha) | #75, #81 |
| P7 | Escritores do Planejador de Cidadania 0–8 (hoje só diagnóstico) | #61–#63 |
| P7 | Planejador × produto-pai × jornada | #79, #82 |
| P8 | Card de roteiro Discovery | #58 |
| — | Pessoa 360 em 5 camadas | #64 |

Inventário completo: `docs/relatorios/2026-09-10_prs-30-84-arquitetura-nao-aplicada.md`.

## Próximo passo (ordem P0–P11, não um motor paralelo)

P0 já opera. **Próximo: P1** — caso canônico / núcleo / participantes, sem tabela nova: unificação controlada de núcleos (fases 2–6 do #30) e, em seguida, a decisão de tarefa após salvar pessoa (#32 / P3).

Não reabrir a pilha #30–#84 de uma vez. Não começar o escritor completo de cidadania 0–8 neste momento — isso é P7 e ainda é só diagnóstico.
