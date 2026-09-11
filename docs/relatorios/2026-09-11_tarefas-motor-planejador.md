# Relatório de tarefas — Motor do Planejador

**Frente:** Motor do Planejador (elo 1 da cadeia)  
**Data:** 2026-09-11  
**Turno:** fim do dia (UTC)  
**Branch:** `cursor/motor-planejador-ponta-a-ponta-fced`

---

## 1. Já funciona

### Back-end
- Writer `sincronizarPlanejador` grava em `case_plans` (hash idempotente).
- Fase CHECK válida (`faseJornadaValida` → default `aceite_e_formalizacao`).
- Status sobe para `ativo` quando há próxima ação + prazo + responsável e sem bloqueio de fonte.
- Espelho da próxima ação/prazo em `crm_casos` (RPC nível 8 / Ficha / Hoje).
- Reader `carregarPlanejadorOperacional` devolve entrada para hidratar o formulário.

### Front-end
- Formulário no Caso 360 e em Preparar contrato.
- Hidratação ao reabrir; select de fase da jornada; SKU do catálogo homologado.
- Toast com versão/status; invalidação de queries da cadeia/ficha.

### Governança
- Cadeia Legado → lista-alimento → catálogo → Caso 360 permanece: legado não dirige operação.
- Prova autenticada da proprietária: ainda `NAO_LOCALIZADO`.

---

## 2. Agora

- Fatia P0 do motor entregue em código nesta branch.
- Testes unitários do formulário/cadeia: **27 passed**.
- Sem alteração de migrations/RLS/dados reais.

---

## 3. Travado / próximo para 100%

| Item | Por que trava | Quem desbloqueia |
|---|---|---|
| Prova autenticada save → F5 → Ficha/Hoje | Falta print da proprietária | Proprietária |
| Auto liga lista-alimento → plano do caso | Ainda seleção manual de SKU | Próxima fatia (se autorizada) |
| WhatsApp envio | Só rascunho na fila | Fora desta fatia |
| Dual `blueprint_parameters` | Fonte paralela legada de leitura | Limpeza controlada depois |

---

## 4. Prova

- Status: `NAO_LOCALIZADO`
- Vitest verde **não** substitui print autenticado.
- Pode arquivar contexto de resgate do planejador? **Não**
