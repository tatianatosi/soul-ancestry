# Circuito operacional mínimo — relatório de tarefas

**Aba / circuito:** Abas → Mesa Discovery → KPIs (Desk)  
**Núcleo:** planejador + caso (`crm_casos`) + próxima ação — ver `.cursor/rules/clube-ancestral-core.mdc`  
**Como usar:** preencher **manhã** (plano do dia) e **fim do dia** (o que fechou / o que travou).  
**Pasta:** `docs/relatorios/circuito-operacional-minimo/`

---

## Modelo (copiar a cada turno)

```markdown
# Circuito operacional mínimo — [MANHÃ | FIM DO DIA] — AAAA-MM-DD

**Quem:** agente / Tatiana  
**Branch:** …  
**SHA:** …

## 1. O que já funciona (Back-end e Front-end)

### Back-end / banco
- …

### Front-end / telas
- …

## 2. O que estou fazendo agora nesta aba

- …

## 3. Próximos passos travados (para 100%)

| Travamento | Onde | Tipo | O que falta |
|---|---|---|---|
| … | … | fiação Supabase / distorção / prova dona / decisão | … |

## 4. Prova autenticada (dona)

- Resultado no registro vivo: …
```

---

## Turno atual — FIM DO DIA — 2026-09-11

**Quem:** agente (Cloud)  
**Branch:** `cursor/circuito-abas-mesa-kpis-efd3`  
**SHA:** `01f31c0f`  
**PR:** https://github.com/tatianatosi/soul-ancestry/pull/101

### 1. O que já funciona (Back-end e Front-end)

#### Back-end / banco
- Handoff Discovery grava `clientes` + `crm_casos` + `case_id` no lead (`executarHandoffDiscovery`).
- Próxima ação canônica via RPC `proxima_acao_prioritaria` / lote (usada em Caso e Pessoa 360).
- Fix RLS remoto em `app_projections` ↔ shares: **aplicado** (helpers + policy); leitura sem `42P17`.
- Planejador / `case_plans` permanece a fonte de planejamento (regra do núcleo).

#### Front-end / telas
- Mesa em `/calls` com handoff real (“Concluir handoff”).
- Hoje `/painel`: deep-link `?lead=` → Painel de Calls.
- Desk em 6 grupos no código desta linha (Calls em Marketing & Comercial).
- App Cliente: **7 abas** na barra; Tatiana leu as 7 em master sem erro de recursão (empty states OK).
- Pessoa 360: cards Quem é / Casos (com próxima ação) / Núcleo / Propostas·contratos·docs / App publicado — **parciais**, mas a tela abre e edita civis.

### 2. O que estou fazendo agora nesta aba

- **Não** estou reescrevendo código do circuito Abas→Mesa→KPIs neste minuto.
- Acabei de **mapear e documentar** (verificações):
  - achados ≠ página `/atendimento#publicacao`;
  - gaps App vs mockup (timeline dupla ausente);
  - Pessoa 360 vs CA-008 (máscaras / unificação).
- **Próxima fatia pedida por você (ainda sem plano fechado):**  
  1) separar a âncora “Publicação de entregas”;  
  2) botão de alerta em `/achados` — escopo A+B vs App ainda **aguardando sua escolha** (1 / 2 / 3 / 4 da pergunta anterior).

### 3. Próximos passos travados (para o circuito a 100%)

| Travamento | Onde | Tipo | O que falta |
|---|---|---|---|
| Prova Mesa completa | `/calls` + Hoje | prova dona | F5 após gravar SPIN/próxima ação; mesma ação no Hoje sem duplicar — registro ainda **não PASSOU** |
| Desk 6 vs memória 8 grupos | `navegacao-desk.ts` | distorção / dívida | Decisão da dona: alinhar doc ou código — não “corrigir” sozinho |
| `#publicacao` sem âncora | `/atendimento` | distorção UI | Hash não tem `id`; página mistura docs + atalho App — separar / renomear |
| Achado → alerta / WhatsApp / App | `/achados`, Biblioteca | fiação + decisão | Três atos distintos; botão “autorizar alerta” ainda não existe; WhatsApp só cópia manual; App só via `app_projections` |
| Timeline dupla App | `/portal/jornada` | gap mockup | Portal não lê `case_timeline_events`; lista única de projeções |
| Pessoa unificada | `/pessoas`, `/clientes` | gap CA-008 | Máscaras só no Editar; `/clientes` sem máscara; sem Comercial/Consentimentos; `contacts` fora |
| Merge / produção | GitHub / Vercel | decisão dona | Sem ordem explícita de merge |

### 4. Prova autenticada (dona)

Registro vivo: `docs/relatorios/2026-09-11_registro-prova-autenticada.md`

- App Cliente master (7 abas, sem 42P17): **PASSOU** leitura — **não** `COMPROVADO_EM_USO` (falta publicar→F5).
- Mesa Discovery: **não PASSOU** protocolo completo.
- Pessoa 360: **NAO_LOCALIZADO** como prova de escrita/unificação.
- Cadeia ponta a ponta: **NAO_LOCALIZADO**.

### Leituras irmãs (hoje)

- `docs/relatorios/2026-09-11_verificacao-achados-alertas-vs-publicacao-e-gaps-app-cliente.md`
- `docs/relatorios/2026-09-11_verificacao-pessoa-360-cards-mascaras-unificacao.md`
- `docs/relatorios/2026-09-11_backlog-p11-app-cliente-vs-mockup.md`

---

## Rotina (manhã e fim do dia)

1. Abrir este arquivo-modelo (ou criar `AAAA-MM-DD_manha.md` / `AAAA-MM-DD_fim-do-dia.md` na pasta).
2. Preencher as 4 seções em linguagem simples.
3. Atualizar a tabela de travamentos (não esconder falha de Supabase/RLS).
4. Commit + push na branch de trabalho; **não** merge sem ordem da Tatiana.
