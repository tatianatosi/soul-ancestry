# Wireframes: tela única de contrato (Canva) + matriz das 15 superfícies

Somente wireframes em PDF/PNG. Nada de código de produto, dados, publicação, permissões ou deploy.

## Estado real da Ana (verificado agora no banco)

| Item | Valor |
|---|---|
| Caso | `CA-CID-AT-FAM-2026-001` |
| Proposta Canva | `DECK-CANVA-CA-CID-AT-FAM-2026-001-v1`, 7 páginas registradas, extração **parcial**, aprovada em 17/08/2026, R$ 9.600,00 |
| Contrato | `2026-CB-0001` — "Contrato-base familiar — Silveira / Friedmann-Reimer (Áustria)" |
| Situação do contrato | **pending_data** (dados pendentes), **não assinado** |
| Versões | 1 |
| Anexos | 0 |
| Ordem de serviço | 0 |
| Privacidade | definida |
| Financeiro | travado aguardando contrato |
| Pesquisa | travada aguardando contrato |

Os wireframes mostram exatamente esses estados. Onde não há dado (anexos, assinatura, OS, faturas), o wireframe mostra o vazio honesto, sem inventar conteúdo.

## Entrega 1 — Tela única de contrato vinculada ao Canva

Uma só tela, sem duplicar Jurídico/Formalização. Blocos, de cima para baixo:

1. **Cabeçalho de decisão**: número do contrato, caso, titular, situação "Dados pendentes", responsável e a próxima ação única.
2. **Origem Canva**: referência do deck, 7 páginas, selo "extração parcial", lista página a página (o que foi extraído × o que falta), link para a proposta aprovada e o valor de origem.
3. **De-para Canva → contrato**: escopo, exclusões, prazo, forma de pagamento e partes — cada campo com a página de origem e um estado (preenchido / falta / divergente).
4. **Pendências para avançar**: o que impede preparar, aprovar e assinar, em linguagem humana.
5. **Anexos e versões**: versão 1 atual; anexos com vazio "Nenhum anexo gerado ainda".
6. **Efeitos travados**: financeiro e pesquisa aguardando contrato, e a ausência de ordem de serviço.
7. **Barra de ações** (representada, não ligada): preparar, revisar, aprovar para envio, assinar — cada uma com o motivo do bloqueio quando aplicável.

Três larguras: desktop, 390 px e 375 px, com a barra lateral navy no desktop e ações empilhadas no celular.

## Entrega 2 — Matriz das 15 superfícies

Wireframes de ajuste das 15 superfícies do Desk (prancha v6), nas três larguras, com sidebar navy fixa em desktop e cabeçalho + gaveta no celular. Cada quadro segue a mesma gramática: contexto → decisão → 2–3 blocos → um CTA; detalhe em abas/acordeão; um vazio por domínio; sem gráfico que não sustente decisão.

Superfícies: Hoje, Comercial, Leads, Kanban, Caso 360, Painel do caso, Pessoa 360, Pessoas & Famílias, Pesquisa, Radar, Formalização, Jurídico, Financeiro, Portal, Configurações.

## Arquivos que serão gerados em Files

- `wireframe-contrato-canva-ana-desktop.pdf`, `-390.pdf`, `-375.pdf`
- `wireframes-matriz-desk-15-desktop.pdf`, `-390.pdf`, `-375.pdf`
- PNGs individuais por superfície e largura
- `wireframes-contrato-e-matriz.zip`
- `wireframes-contrato-e-matriz-leitura.md` com o estado da Ana e as decisões pendentes

## Conferência antes de entregar

Cada página convertida em imagem e inspecionada: nada cortado, nada sobreposto, margens iguais, sete/quinze quadros completos por conjunto, sidebar navy consistente e nenhum dado fictício.

## Fora de escopo

Código, rotas, componentes, dados, publicação, convite, link mágico, contrato real, financeiro, banco, RLS, migrations, commit, merge e deploy.
