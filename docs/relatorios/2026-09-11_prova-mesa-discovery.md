# Prova — Mesa Discovery (corte vertical do reset de confiança)

**Data:** 2026-09-11  
**Política:** `docs/politicas/RESET-DE-CONFIANCA-OPERACIONAL-2026-09-10.md`  
**Capacidade:** Mesa Discovery / entrada comercial  
**Ambiente:** branch de trabalho (código + Vitest). Sessão autenticada em UI **não** executada neste ambiente (sem credenciais de operador / sem browser autenticado).

## Inventário classificado (só o que entra no corte)

| Peça | Fonte | Classificação |
|---|---|---|
| Rota Mesa Discovery | `/calls` → `src/routes/_authenticated/calls.tsx` | `CODIGO_SEM_PROVA_DE_USO` |
| UI Painel de Calls | `src/components/crm/painel-calls.tsx` | `CODIGO_SEM_PROVA_DE_USO` (após correção SPIN: ainda sem sessão real) |
| Varredura WhatsApp | `src/components/crm/varredura-whatsapp.tsx` + `src/lib/varredura-whatsapp.ts` | `CODIGO_SEM_PROVA_DE_USO` — dump **não** persiste; só sugestões revisáveis |
| Escritor | `salvarLeadDesk` em `src/lib/crm-desk.functions.ts` | `CODIGO_SEM_PROVA_DE_USO` — allowlist inclui `spin_*`, `proxima_acao`, `proxima_acao_em`, `discovery_resultado` |
| Tabela | `leads` | Schema presente em `types.ts` / writer — sem releitura autenticada nesta rodada |
| SPIN `spin_*` | Antes só em `/leads`; agora também bloco `spin` no roteiro de `/calls` | Era `QUEBRADO_OU_INCOMPLETO` no critério §8; corrigido em código + Vitest |
| Consumo Hoje | `montarFilasHoje` em `src/lib/crm-desk.ts` lê `leads.proxima_acao` / `proxima_acao_em` | `CODIGO_SEM_PROVA_DE_USO` |
| Consumo Marketing & Comercial | `/conversao`, `/proximas-acoes`, `/leads` | `CODIGO_SEM_PROVA_DE_USO` |
| CRM paralelo `discovery_assessments` / `registrarDiscovery` | histórico | `LEGADO_HISTORICO` — **não usado** neste corte |
| Vitest roteiro + painel | `discovery-roteiro.test.ts`, `painel-calls-roteiro-vivo.test.ts` | Prova automatizada de estrutura (29 testes verdes) — **não** substitui prova autenticada em UI |

**Fora deste corte:** `case_plans`, App Cliente, contrato, financeiro, KPIs avançados, redesenho de `GRUPOS_DESK`.

## Corte vertical §8 — registro por passo

| # | Ação | Resultado | Prova / limite |
|---|---|---|---|
| 1 | Localizar/criar lead de teste interno | `BLOQUEADO_POR_AMBIENTE` | Sem sessão autenticada / credenciais de operador neste ambiente |
| 2 | Abrir `/calls` | `BLOQUEADO_POR_AMBIENTE` | Idem |
| 3–5 | Colar dump → ver sugestões → revisar uma | `CODIGO_SEM_PROVA_DE_USO` | Código e Vitest de varredura existem; dump não grava bruto; fluxo UI não exercitado aqui |
| 6 | Responder quatro blocos SPIN **no mesmo fluxo** | `PASSOU` (código) / antes `FALHOU` | Gap: SPIN só em `/leads`. Correção: bloco `spin` em `ROTEIRO_DISCOVERY` + cards checkbox em `painel-calls` ligados a `spin_situacao\|problema\|implicacao\|necessidade` já na allowlist de `salvarLeadDesk`. Vitest: 29/29 |
| 7–8 | Registrar resultado + responsável + prazo + próxima ação e salvar | `BLOQUEADO_POR_AMBIENTE` | Writer e campos existem; sem gravação autenticada |
| 9–10 | Recarregar e confirmar persistência | `BLOQUEADO_POR_AMBIENTE` | Releitura autenticada não feita |
| 11 | Ver o mesmo fato em Marketing & Comercial e Hoje sem duplicar | `CODIGO_SEM_PROVA_DE_USO` | `montarFilasHoje` consome os mesmos campos de `leads`; sem prova de sessão |

### Resultado agregado do corte

**`BLOQUEADO_POR_AMBIENTE`** para o aceite completo do §8 (salvar → recarregar → Hoje/Comercial).  
**Correção SPIN mínima:** aplicada e coberta por teste — critério “SPIN no mesmo fluxo” deixa de ser gap de UI.  
**Não** se declara `COMPROVADO_EM_USO` nem “Discovery pronto”.

## Registro mínimo §9

| Campo | Conteúdo |
|---|---|
| Capacidade | Mesa Discovery — corte vertical comercial mínimo |
| Objeto | Lead de teste interno (não criado — bloqueio de ambiente) |
| Fonte | `/calls`, `painel-calls.tsx`, `discovery-roteiro.ts`, `salvarLeadDesk` → `leads`; consumidores `montarFilasHoje`, `/conversao`, `/proximas-acoes` |
| Ação | Arquivar reset; briefs dos 3 agentes; inventário; fechar gap SPIN em `/calls`; Vitest |
| Resultado | `BLOQUEADO_POR_AMBIENTE` (prova UI autenticada); SPIN no mesmo fluxo `PASSOU` em código/teste |
| Prova | `npx vitest run src/lib/__tests__/discovery-roteiro.test.ts src/lib/__tests__/painel-calls-roteiro-vivo.test.ts` → 29 passed |
| Limite | Sem login operador, sem lead sintético gravado, sem reload autenticado, sem isolamento org comprovado em sessão |
| Próxima ação | **Uma:** em ambiente permitido, com lead de teste interno, executar os passos 1–11 do §8 e atualizar este relatório para `PASSOU` ou `FALHOU` concreto. Não iniciar Pessoa 360 nem Proposta até essa prova ou decisão da proprietária. |

## Decisão de parada

Conforme reset §7–§8 e plano: **não** abrir motor de contrato, financeiro, automação, KPIs ou Abas de produto.  
Agentes KPIs e Abas permanecem **pausados**.  
Próximo motor (Pessoa 360/Dossiê vs Proposta/Formalização) só após prova do corte ou decisão explícita da proprietária.
