# Execução — navegação Pessoa 360 nas superfícies CA-PESSOA-360 (2026-09-11)

## Pedido
Tratar políticas + quadro PRs como fontes permanentes; inventariar ignored; fechar gaps de navegação Pessoa 360 (Trilha A).

## Entregue

| Camada | O quê |
|---|---|
| Memória | `ADENDO-FONTES-EXECUCAO-POLITICAS-QUADRO-PRS-2026-09-11.md`; links em AGENTS, README políticas, MEMORIA, adendo prompts, rule Cursor; quadro integral em `docs/relatorios/` + recuperados |
| Inventário | `docs/relatorios/2026-09-11_inventario-politicas-nao-executadas.md` |
| `crm-desk.functions` | `listarLeadsDesk` deriva `cliente_id` de `crm_casos` |
| `leads.tsx` | CTAs Caso 360 / Pessoa 360 |
| `contratos.$id` / `contratos.index` | Pessoa 360 + Caso 360 (hero, partes, lista) |
| `documentos-solicitacoes` + `pesquisa-evidencias` | `cliente_id` no caso + CTAs |
| `privacidade.index` | Pessoa 360 / Caso 360 por caso |
| `contrato/preparar` | Links Pessoa 360 + Caso 360 no banner Canva |
| Teste | `pessoa-360-navegacao-superficies-2026-09-11.test.ts` |

## Deferido
Cockpit, eixo comunicação, P11 visual, portal 7-abas cleanup, prova autenticada, tabelas novas (`lead_activities`, etc.).
