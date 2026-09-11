# Execução — Pessoa 360 × Caso 360 (2026-09-11)

## Pedido
Arquivar materiais reenviados; tratar prompts como execução; aplicar Casos 360 / Pessoa 360; traçar estratégia de resgate do produto.

## Entregue (código)

| Camada | O quê |
|---|---|
| `pessoa.functions.ts` | RPC `proxima_acao_prioritaria_lote` + campos de responsável/formalização nos casos da pessoa |
| `pessoas.$clienteId.tsx` | Cards de caso com próxima ação, responsável, prazo; links Caso / Formalização / Jornada / Visão cliente; propostas/contratos/documentos com deep links |
| `casos.$caseId.index.tsx` | CTA **Abrir Pessoa 360** no hero |
| Memória | Pacote `prompts-execucao-2026-09-11/`; adendos PROMPTS-SAO-EXECUCAO + ESTRATEGIA-RESGATE |
| Teste | `pessoa-caso-360-resgate-2026-09-11.test.ts` |

## Não entregue nesta fatia (dívida declarada)
Cockpit completo; eixo comunicação; landings; unificação visual P11 tela a tela; prova autenticada UI; Cliente A×B.

## Próximo passo concreto
Fechar seta proposta→contrato na operação diária (Canva já na preparação) e auditar indicadores do Painel contra auditoria 47 com dedup.
