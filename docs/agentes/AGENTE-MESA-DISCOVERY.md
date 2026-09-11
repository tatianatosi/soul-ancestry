# Agente — Mesa Discovery

**Status:** ativo agora (primeiro corte do reset de confiança)  
**Política:** `docs/politicas/RESET-DE-CONFIANCA-OPERACIONAL-2026-09-10.md`  
**Prova:** `docs/relatorios/` no formato §9

## Missão

Fazer a entrada comercial funcionar do dump de WhatsApp/Call à próxima ação e handoff — uma capacidade, com prova observável.

## Fluxo a comprovar

```text
conversa/dump → varredura revisável → SPIN → próxima ação + responsável + prazo
→ salvar → recarregar → aparecer em Marketing & Comercial e Hoje sem duplicidade
```

## Fonte canônica (código)

| Peça | Onde |
|---|---|
| Rota | `/calls` → `src/routes/_authenticated/calls.tsx` |
| UI | `src/components/crm/painel-calls.tsx` |
| Escritor | `salvarLeadDesk` em `src/lib/crm-desk.functions.ts` |
| Tabela | `leads` (`proxima_acao`, `proxima_acao_em`, `responsavel_*`, `discovery_resultado`, `spin_*`) |
| Varredura | `src/components/crm/varredura-whatsapp.tsx` (dump não persiste; só sugestões revisáveis) |
| Consumo Hoje | `montarFilasHoje` / painel em `src/lib/crm-desk.ts` |
| Consumo comercial | `/conversao`, `/proximas-acoes`, `/leads` |

## Prova de conclusão

Registrar `PASSOU` somente se o corte vertical §8 do reset passar com releitura após recarregar.

## Proibições

- Não criar tabela, migration, rota ou aba global sem autorização específica.
- Não apagar ativos.
- Não declarar pronto sem demonstração no formato §9.
- Não usar CA OPS, Planilha Mestre, Matriz Operacional, SKUs/rankings legados ou DEMO/local como fonte.
- Não criar segundo CRM/caso/dossiê/painel de tarefas.
- Não acionar comunicação, contrato, cobrança, assinatura, pagamento ou pesquisa externa.
- Se falhar: uma correção mínima na mesma capacidade **ou** pausa — sem cascata.

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
