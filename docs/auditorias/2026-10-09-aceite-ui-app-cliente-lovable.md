# Checklist de homologação — App Cliente no Lovable

Status: executado integralmente nas sete abas — NÃO APROVADO (divergências abaixo)
Versão: v1.1
Data/hora UTC: 2026-10-11 16:40
Responsável pela execução: Lovable, sessão administrativa autorizada da Proprietária (sem segredo ou token neste artefato)
Rota: `/app-cliente-como-pessoa?casoId=` — caso CA-CID-AT-FAM-2026-001 (visão admin; não é login cliente)
Mockup App: `clube-ancestral-mockup.pdf`, 17 págs.; App = págs. 3–9 (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta). Mockup Desk: referência separada, não usada.
Banco: Lovable Cloud do projeto. Evidências: Files `app-checklist-paridade-2026-10-11-v1/` (14 capturas + PDF comparativo de 7 págs.).

## 1. Referências e contenção
- [x] R01 mockup App separado do Desk.
- [x] R02 tokens canônicos locais (navy, Ouro Nobre, Cormorant/Montserrat).
- [x] R03 nenhum asset substituto gerado.
- [x] R04 nenhum tema global/Desk alterado.
- [x] R05 mesma sessão e caso nas 14 capturas; exemplos do mockup não viraram dado real.
- [x] R06 sem SQL de escrita, migration, RLS ou publicação.

## 2. Aceite por aba (375 e 1280)

| ID | Aba | Composição | Cores/formas | Estados/dados | Overflow | Resultado |
|---|---|---|---|---|---|---|
| A01 | Home | falhou: sem saudação "Bem-vinda" + avatar; card navy sem barra de progresso e stepper de fases | passou | passou (vazios honestos) | 0 px | falhou |
| A02 | Jornada | parcial: duas linhas presentes; marcos são exemplo rotulado | passou | passou | 0 px | parcial |
| A03 | Radar | falhou: teia não preenchida (3 de 6 dimensões em Lacuna) | passou (Ouro Nobre) | passou | 0 px | parcial — bloqueado por dado |
| A04 | Árvore | parcial: 6 pessoas reais G3–G7; sem linhas (0 relações publicadas) | passou | passou | 0 px | parcial — bloqueado por dado |
| A05 | Documentos | parcial: upload + checklist + entregas presentes como exemplo rotulado | passou | falhou: texto "não precisamos de nenhum documento" contradiz checklist (copy travada por teste a5) | 0 px | falhou |
| A06 | Legado | divergente: mockup = "Seus Achados" + card premium; atual = coleções editoriais | passou | passou | 0 px | parcial |
| A07 | Conta | parcial: assinatura R$ 320/mês × 10 como prevista/aguardando confirmação | passou | passou | 0 px | parcial |

## 3. Roteiros específicos
- H01 passou: nenhum KPI/data inventado; próxima ação vazia honesta.
- J01 parcial: sequência preservada; etapas reais ausentes.
- RA01 passou com ressalva: sem percentual fictício; Lacuna mantida.
- AR01 passou: mesmos nós, nenhum menor exposto, nenhum vínculo inferido.
- D01 parcial: recebido × validado distinguidos no exemplo; upload/download ilustrativos desabilitados.
- L01 passou: só material publicado (1 microentrega) + exemplos rotulados.
- C01 parcial: sem link Asaas (não há cobrança confirmada); salvar/sair não exercitados (exigiria escrita).

## 4. Transversais
- T01 passou: 14 capturas + comparativo.
- T02 parcial: vazios verificados; loading visto; erro não forçado.
- T03 passou visualmente.
- T04 parcial: 375/1280 = 0 px de overflow; 320/768/1440 verificados em 09/10, não refeitos.
- T05 passou em 375.
- T06 não executado (200%/teclado/modal).
- T07 não executado (contraste não medido).
- T08 passou: Lacuna e % acompanham a cor.
- T09 passou: logo sem distorção.
- T10 não executado nesta rodada.
- T11 parcial: build mais recente OK; tipos/lint/testes não rodados nesta rodada (sem mudança de código).
- T12 passou: caso por `casoId`, sem Ana fixa no código.
- Alvos de toque: 1 elemento < 44 px em Home e Documentos (link de texto).

## 5. Não regressão no Desk
- ND01–ND05 preservado por contenção: nenhum arquivo do Desk alterado.

## 6. Publicação
- P01–P06 pendentes: sem publicação nem smoke em produção.

## 7. Decisão
Decisão: pendente / não aprovado.
Bloqueios de dado (não visuais): relações publicadas, dimensões Memória/Legado/Documentação, próxima ação compartilhada, cobrança individual Asaas.
Divergências visuais corrigíveis no App (aguardam autorização): saudação + avatar e card de progresso com stepper na Home; estrutura "Seus Achados" no Legado; texto contraditório em Documentos (requer ajuste no teste a5 → PEDIDO AO CLAUDE).
