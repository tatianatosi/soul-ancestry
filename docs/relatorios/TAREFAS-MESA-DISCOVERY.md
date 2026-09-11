# Tarefas — Mesa Discovery (`/calls`)

**Aba / capacidade:** Mesa Discovery (entrada comercial)  
**Última atualização:** 2026-09-11 · noite (após autorização da dona — espinha A+B)  
**Status geral:** Novo lead na Mesa + fix de data no código · prova autenticada dela ainda aberta · **não** `COMPROVADO_EM_USO`  
**Diagnóstico:** `docs/relatorios/2026-09-11_diagnostico-crm-vivo-fragmentacao.md`  
**Plano jornada:** `docs/politicas/JORNADA-CRM-RECONSTRUCAO-CONTROLADA-2026-09-11.md`  
**Rotina:** manhã + fim do dia.

Legenda: `OK` · `PARCIAL` · `TRAVADO` · `PAUSADO`

---

## 1. O que já está funcionando

### Front-end
- Login autenticado em produção (Vercel ↔ Supabase) — confirmado pela dona
- **Novo lead na Mesa `/calls`** (mesmo diálogo de `/leads`) — código nesta branch
- Copy clara: criar aqui ou abrir existente
- Abrir lead e percorrer roteiro SPIN (perguntas + flags)
- Progresso SPIN em `/leads` + link para `/calls`

### Back-end
- Um CRM: tabela **`leads`**
- Comparação de persistência aceita `datetime-local` (HH:mm) vs timestamptz Postgres — evita falso `DIVERGENCIA_PERSISTENCIA` em `call_realizada_em`
- Vitest focado: 46/46 (persistência + painel + roteiro)

### Política
- Reset + adendo + plano de jornada sob dona única
- KPIs / Abas pausados

---

## 2. O que executei agora (autorizado)

| Item | Resultado |
|---|---|
| Botão **Novo lead** em `/calls` | Feito |
| Empty state + copy da espinha | Feito |
| Fix `call_realizada_em` (datetime-local) | Feito |
| Testes | 46 passed |
| Prova visual da dona | **Aguardando ela** |

**Próxima ação dela (uma):** em produção (ou após rate limit Vercel), criar lead **na Mesa** → frase única de próxima ação → Gravar → F5 → mesma frase em Hoje e Comercial → `PASSOU` / `FALHOU`.

---

## 3. Ainda trava o 100%

### A. Prova autenticada
- [ ] Prints + `PASSOU` dela na integração Hoje/Comercial  
- Status: `TRAVADO` (só ela fecha)

### B. Deploy Vercel CI
- [ ] Rate limit ~24h — esperar ou upgrade  
- Status: `TRAVADO` (infra)

### C. Pausado
- Pessoa 360, Proposta, Financeiro, App, KPIs, Abas → `PAUSADO`

---

## 4. Quadro visual

| Peça | Fim do dia |
|---|---|
| Login produção | `OK` |
| Novo lead na Mesa | `OK` (código) · falta print dela |
| Fix data call | `OK` (código + teste) |
| SPIN + F5 | `PARCIAL` |
| Hoje/Comercial mesmo fato | `TRAVADO` |
| Deploy CI | `TRAVADO` |
| Contexto arquivável? | **Não** |

```text
REGRA: código / PR / Vitest ≠ feito.
Feito = dona logada + prints + F5 + integração.
```
