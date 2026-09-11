# Diagnóstico — Caso 360 emaranhado × macro cenário

**Data:** 2026-09-11  
**Branch:** `cursor/casos-360-macro-cenario-5722`  
**Quem:** agente (Cloud)  
**Prova autenticada:** **não** `COMPROVADO_EM_USO` — fatia de código + testes estáticos; falta print da dona (inicial / ação / confirmação / releitura).

## Veredito

O Caso 360 tinha virado **tela infinita**: pesquisa (7 links), financeiro com formulário de pagamento e indicadores densos no meio da ficha operacional. Isso **contraria** o mockup 17 + auditoria 47 + CA-FICHAS-009: **Caso 360 = macro operacional do caso**; **Pessoa 360 = macro da pessoa**; Pesquisa e Contrato/Financeiro são superfícies donas.

## O que o normativo pede

| Superfície | Papel |
|---|---|
| **Caso 360** (`/casos/$caseId`) | Situação, próxima ação, responsável, prazo, motivo, impacto + pontes |
| **Pessoa 360** (`/pessoas/$clienteId`) | História da pessoa no Clube Ancestral (todas as nuances) |
| **Pesquisa** | Evidências, achados, plano, fontes — dona do detalhe genealógico |
| **Contratos / Financeiro** | Formalização e dinheiro — donas do detalhe contratual |

Nav Desk já diz: *Pessoa, núcleo, caso, jornada… **sem copiar contrato nem pesquisa***.

## O que estava errado (print / código)

1. **Muro de pesquisa** no card Pesquisa/entregas (Achados, Biblioteca, Evidências, Linhagens, Plano, Relatórios, Fontes).
2. **Financeiro embutido** com “Registrar pagamento” / “Preparar cobrança” no meio do macro.
3. **Visão do cliente** com lista longa de métricas + atalho para biblioteca de evidências.
4. Comentário CA04 ainda prometia “links de pesquisa continuam abaixo” — dívida vs. intenção de macro.

## Correção desta fatia (código)

- `src/lib/caso-360-superficie.ts` — contrato de superfície + status CHECK `aprovada_para_entrega` + pontes.
- `src/routes/_authenticated/casos.$caseId.index.tsx`:
  - faixa macro (Caso × Pessoa × donas);
  - card Pesquisa: resumo numérico + **uma** ponte;
  - card Financeiro: status/saldo/próxima parcela/ação + pontes `/financeiro` e `/contratos` (sem formulário);
  - Visão do cliente enxuta (acesso, última liberação, publicação) + ponte App.
- Testes CA04/CA20 atualizados (sem muro; sem pagamento embutido).

## O que ainda falta para 100%

| Travamento | Onde | Tipo | O que falta |
|---|---|---|---|
| Print autenticado Caso 360 pós-limpeza | registro vivo | prova dona | Slots inicial/ação/confirmação/releitura |
| “Ver página completa” ainda empilha seções densas | mesma rota | distorção / decisão | Dona: manter índice seccionado ou enxugar seções abaixo |
| Contagem “comprovada” antes usava `validada_internamente` (fora do CHECK) | resumo | fiação | Corrigido no código; validar em dado real |

## Fronteira Caso × Pessoa (não misturar)

- Abrir **Pessoa 360** a partir do caso = ver a pessoa.
- Abrir **Caso 360** a partir da pessoa = ver a operação daquele caso.
- Não transformar Caso 360 em segundo dossiê civil nem em segundo módulo de pesquisa.
