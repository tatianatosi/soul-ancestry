# Checklist de homologação — App Cliente no Lovable

Status: reexecutado nas sete abas (v1.2) — NÃO APROVADO (divergências abaixo e seção 8)
Versão: v1.2
Data/hora UTC: 2026-10-12 17:55
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

## 9. Homologação v1.3 — 2026-10-12 (parecer da Proprietária: iniciar auditoria das 7 abas)

Execução: inspeção tela a tela no staging, caso CA-CID-AT-FAM-2026-001, sessão
administrativa autorizada da Proprietária. 14 capturas (7 abas × 375 e 1280) em
`/tmp/browser/homolog7/screens/`. Overflow horizontal 0 px em todas; nenhum erro
de console. Nenhuma tabela, consulta, permissão, convite ou publicação alterada.

| # | Condição da Proprietária | Veredito | Evidência na tela |
|---|---|---|---|
| 1 | Home sem caixas cinzas | **NÃO ATENDIDO** | 3 blocos `data-exemplo-visual` com selo "Exemplo do layout — ainda sem dados publicados" |
| 1 | Home com régua de 10 etapas | **NAO_LOCALIZADO** | não existe régua de etapas; há "Acompanhamento da família" (com "Cidadania Austríaca (§ 58c StbG)"), "Próximo passo", "Pessoas conectadas" e "Achados da sua história" |
| 1 | Home com os 4 membros reais | **NÃO ATENDIDO** | bloco "Núcleo familiar" exibe "Não registrado — os membros aparecem aqui quando forem compartilhados"; a Home não usa o leitor de membros que a Conta já usa |
| 2 | Jornada com Linha Dupla | **ATENDIDO (estrutura)** | "Linha Ancestral", "União de Ramos" e "Linha do Processo" presentes, com âncoras Origem · Processo · Memória |
| 2 | Graz 1895 → Brasil | **BLOQUEADO_POR_DADO** | "Lacuna · ainda sem marco publicado" e "Lacuna · ainda sem encontro publicado"; nenhuma menção a Graz, 1895, 1920 ou Brasil |
| 2 | Processo § 58c | **PARCIAL** | Linha do Processo mostra "Presente · 15 de set. de 2026" e a nota da jornada; a referência "§ 58c StbG" aparece na Home, não nessa linha |
| 3 | Radar com teia SVG de 6 eixos | **ATENDIDO** | SVG com 8 linhas e 4 polígonos; seis dimensões em "Parte 1 de 6 … 6 de 6" |
| 3 | "Lacuna" onde não há total | **ATENDIDO** | 4 ocorrências; "Documentação · Lacuna"; nenhum percentual fictício |
| 4 | Árvore com linhas de G7 a G0 | **BLOQUEADO_POR_DADO** | G7→G1 com 6 pessoas nomeadas e G2 em "Lacuna"; zero `<line>` no SVG — nenhum vínculo publicado. G0 não existe no modelo (âncora é G1) |
| 4 | Destaque no casal G5 | **NÃO ATENDIDO** | Lotte Friedmann e Otto Reimer aparecem na G5 sem realce de casal |
| 5 | Documentos com triagem tripartite | **ATENDIDO** | "Solicitados", "Em conferência", "Certidões liberadas" (+ "Entregas do Legado") |
| 5 | Botão de download ativo | **BLOQUEADO_POR_DADO** | "Ainda não há documentos liberados para você neste momento" — nenhum botão de baixar existe |
| 6 | Legado com prateleiras | **ATENDIDO** | "Cadernos de Família" (1 material), "Dossiês e Relatórios" e "Narrativas de Origem" (em preparação); o termo "prateleira" não aparece na tela |
| 6 | Aviso legal no rodapé | **ATENDIDO** | `data-legado-disclaimer`: "Este conteúdo é histórico, cultural e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico." + bloco "Sobre os Encontros de Linhagem" |
| 7 | Conta com cota de R$ 320/mês | **ATENDIDO** | "Sua assinatura · Pesquisa Genealógica por Ramo Familiar · R$ 320,00 por mês · aguardando confirmação · Condição familiar: 3 assinaturas / parcelas mensais · Condição prevista por 10 meses" |
| 7 | Cota vinculada ao titular | **BLOQUEADO_POR_DECISAO** | o selo "Titular / Signatário" só é emitido no acesso real da cliente; na visão administrativa a Conta fica em estado neutro |

Pendências abertas por esta rodada:
- Remover as caixas cinzas do App (Home 3, Radar 1, Conta 2) ou rotulá-las de outra forma — mudança de conteúdo cliente-facing, exige autorização.
- Levar os membros do núcleo para a Home reaproveitando o leitor que a Conta já usa — exige autorização.
- Publicar marcos da Linha Ancestral (Graz 1895 → Brasil), vínculos da Árvore e documentos liberados: dependem de fonte aprovada, não de código.
- Copy contraditória em Documentos ("não precisamos de nenhum documento seu" × triagem) segue travada pelo teste a5 → PEDIDO AO CLAUDE.
