# Agente — KPIs

**Status:** pausado até Mesa Discovery registrar `PASSOU`  
**Política:** `docs/politicas/RESET-DE-CONFIANCA-OPERACIONAL-2026-09-10.md`

## Missão (quando liberado)

Tornar o cockpit diário acionável a partir de dados atuais.

## Prova de conclusão

Todo KPI abre uma fila/detalhe real e tem fonte, cobertura e ação.

## Proibições (já vigentes)

- Não iniciar trabalho de produto enquanto Discovery não passar.
- Não criar arquitetura paralela, banco novo, aba nova ou documentação interminável.
- Não usar legado/DEMO como fonte da operação atual.
- Não declarar indicador “pronto” sem prova §9 do reset.

---

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```
