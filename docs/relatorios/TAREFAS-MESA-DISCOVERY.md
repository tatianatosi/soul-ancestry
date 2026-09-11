# Tarefas — Mesa Discovery (`/calls`)

**Aba / capacidade:** Mesa Discovery (entrada comercial)  
**Última atualização:** 2026-09-11 · **fim do dia** (rotina 21:00 UTC)  
**Status geral:** login produção ok · jornada CRM mapeada · espinha **ainda não** reconstruída no código · prova integrada aberta · **não** `COMPROVADO_EM_USO`  
**Diagnóstico:** `docs/relatorios/2026-09-11_diagnostico-crm-vivo-fragmentacao.md`  
**Plano jornada:** `docs/politicas/JORNADA-CRM-RECONSTRUCAO-CONTROLADA-2026-09-11.md`  
**Rotina:** manhã + fim do dia.

Legenda: `OK` · `PARCIAL` · `TRAVADO` · `PAUSADO`

---

## 1. O que já está funcionando

### Front-end
- Login autenticado em produção (Vercel ↔ Supabase) — **confirmado pela dona hoje**
- Criar lead em `/leads` (“Novo lead”) — **ainda não** na Mesa `/calls`
- Abrir `/calls` com lead existente e percorrer roteiro (19 perguntas SPIN, uma a uma)
- Em `/leads`: progresso SPIN derivado + link para `/calls`
- Gravação com mensagem de sucesso; flags `spin_*` derivadas

### Back-end
- Um CRM: tabela **`leads`** via `salvarLeadDesk`
- Próxima ação / responsável / prazo nos campos existentes
- Bug conhecido: `DIVERGENCIA_PERSISTENCIA` em `call_realizada_em` (formato de data)

### Política / trilha
- Reset + adendo de prova autenticada vigentes
- Diagnóstico de fragmentação CRM Vivo registrado
- Plano de **reconstrução controlada da jornada** sob dona única (sem segundo CRM)
- KPIs e Abas **pausados**; merge conflicts da PR #102 resolvidos

---

## 2. O que executei / tentei corrigir **hoje**

| Feito hoje | Resultado |
|---|---|
| Guia Vercel/Supabase para a dona | Login produção **ok** |
| Auditoria CRM Vivo / Mesa / dicionários (prints dela) | Fragmentação confirmada: lead em `/leads`, Mesa só edita |
| Documento de diagnóstico | Publicado no repo |
| Plano jornada CRM (espinha A→E) | Publicado; **aguardando autorização** para Fase A+B no código |
| Check CI Vercel na PR | **TRAVADO** por rate limit do plano (~24h) — não é bug de código |
| Correção “Novo lead na Mesa” + fix de data | **Não iniciada** — falta “pode começar” da dona |

**Agora (fim do dia):** parado na autorização da espinha. Sem cascata para outros motores.

---

## 3. O que ainda trava o 100% desta aba

### A. Prova autenticada da dona (integração)
- [ ] Print inicial / ação / confirmação / F5 (parte já existe do agente; falta certificação dela)
- [ ] Mesma próxima ação em **Hoje** e **Comercial** sem duplicar → `PASSOU` / `FALHOU` dela
- Status: `PARCIAL` / `TRAVADO`

### B. Espinha jornada (autorização pendente)
- [ ] Botão **Novo lead** também em `/calls` (mesmo fluxo de `/leads`)
- [ ] Corrigir divergência de data `call_realizada_em`
- [ ] Copy clara: criar aqui ou abrir existente
- Status: `TRAVADO` (espera decisão)

### C. Deploy Vercel
- [ ] Rate limit de build — esperar ~24h ou upgrade; depois redeploy
- Status: `TRAVADO` (infra, fora do diff)

### D. Pausado de propósito
- Pessoa 360, Proposta, Financeiro, App, KPIs, Abas → `PAUSADO`

---

## 4. Quadro visual do dia (2026-09-11)

| Peça | Manhã | Fim do dia |
|---|---|---|
| Abrir `/calls` | — | `OK` (código) |
| Login produção (dona) | — | `OK` |
| SPIN gravar + F5 | — | `PARCIAL` (agente ok · falta certificação dela) |
| Mesma ação Hoje/Comercial | — | `TRAVADO` |
| Novo lead na Mesa | — | `TRAVADO` (não autorizado ainda) |
| Fix data `call_realizada_em` | — | `TRAVADO` (não iniciado) |
| Deploy Vercel CI | — | `TRAVADO` (rate limit) |
| KPIs / Abas / outros motores | — | `PAUSADO` |
| Contexto arquivável? | — | **Não** |

---

## 5. Como ler amanhã de manhã

1. Seção 1 = só o estável.  
2. Seção 2 = o que o agente mexeu **naquele dia**.  
3. Seção 3 = o que impede 100% **desta** aba.  
4. Sem `COMPROVADO_EM_USO` sem `PASSOU` autenticado dela.

```text
REGRA: código / PR / Vitest ≠ feito.
Feito = dona logada + prints + F5 + (se couber) integração.
```
