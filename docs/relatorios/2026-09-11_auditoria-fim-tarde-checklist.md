# Auditoria fim de tarde — checklist — 2026-09-11

**Quem:** agente Cloud · **Branch:** `cursor/circuito-abas-mesa-kpis-efd3` · **PR:** #101  
**Base normativa:** `.cursor/rules/clube-ancestral-core.mdc` + `AGENTS.md`  
**Banco vivo conferido:** projeto `zsxpdbhdvbuulwpepemd` (CHECKs reais lidos via SQL)

Legenda: `[x]` feito nesta rodada · `[ ]` aberto · `[!]` bloqueado (dona / segredo / decisão)

---

## 1. 🚨 Pendências críticas no Back-End

- [x] **BE-01** Trigger `fn_evidence_estado_guard` ≠ CHECK `evidences_workflow_ck` (validação/publicação impossíveis) — migration `20260911160000_…` + apply remoto
- [x] **BE-02** Escritores/UI de evidência gravavam aliases (`validada_internamente`, `aprovada_para_entrega_cliente`, …) — alinhados ao CHECK em `pesquisa-cadeia.ts` + `pesquisa-cadeia.functions.ts` + `rotulo-negocio.ts`
- [x] **BE-03** Contagens Caso 360 / pesquisa-evidências usavam status inválido — `evidenciaComprovada` / `evidenciaEmValidacao`
- [ ] **BE-04** Handoff cria pessoa+caso sem criar `proposals` — esperado; falta fluxo UI “proposta a partir do caso” além do redirect (parcial: redirect pós-handoff → `/propostas`)
- [!] **BE-05** Prova autenticada Mesa/Discovery (F5 + Hoje sem duplicar KPI) — só a dona com login
- [!] **BE-06** Magic link / convite cliente ponta a ponta — sem `service_role` em chat; dona
- [!] **BE-07** Desk **6** grupos no código vs memória **8** — decisão Tatiana (não “corrigir” sozinho)
- [!] **BE-08** Merge/deploy produção — só com OK explícito (branch + SHA)
- [ ] **BE-09** Fragmentação documentos (`documents` / `evidencias` / `evidences` / …) — dívida estrutural, não inventar 4ª cópia
- [ ] **BE-10** `case_phase_history` pode faltar em `types.ts` — regenerar types quando autorizado

---

## 2. 🎨 Pendências no Front-End

- [x] **FE-01** Âncora `#publicacao` em `/atendimento` — `id="publicacao"` no bloco Publicar
- [x] **FE-02** CTAs “Entregas / Fase 01 / Fase 02” na Jornada pareciam aba — demovidos a links de rota profunda
- [x] **FE-03** Pós-handoff: navega para `/propostas` (handoff ≠ proposta)
- [ ] **FE-04** Timeline App: portal não lê `case_timeline_events` (só projeções) — gap mockup
- [ ] **FE-05** Pessoa 360 incompleta vs CA-008 (máscaras, Comercial, Consentimentos, `contacts`)
- [ ] **FE-06** Achado → alerta / WhatsApp / App: três atos distintos; botão “autorizar alerta” ainda não existe
- [ ] **FE-07** P11 visual App vs mockup 17p (tipografia/atmosfera) — depois do motor
- [!] **FE-08** Domínio `clubeancestral.com.br` **não** apontar para app Vercel (SEO) — política vigente, não executar bind

---

## 3. 🔗 Lógica de Genealogia & Pesquisa

- [x] **GP-01** `STATUS_PESQUISA_RELACAO` oferecia `em_pesquisa`/`descartado` — CHECK vivo: `a_confirmar|pendente|hipotese|provavel|com_suporte|confirmado|refutado`
- [x] **GP-02** Filtros de árvore/lacunas: `refutado` (+ legado `descartado` só leitura); lacunas incluem `pendente`/`hipotese`
- [x] **GP-03** Cadeia de evidências: máquina de estados = CHECK; aliases só leitura
- [ ] **GP-04** Achado confirmado → publicação App só via `app_projections` + aprovação humana (já regra; falta CTA dedicado se dona escolher escopo)
- [x] **GP-05** `STATUS_LINHA` = CHECK `lineage_paths.status` (`em_pesquisa` etc. — válido neste CHECK, distinto de relações)

---

## 4. Executado nesta rodada (prova)

| Item | Camada | Evidência |
|---|---|---|
| Trigger evidências | SQL remoto + migration | `fn_evidence_estado_guard` alinhado ao CHECK |
| Vocabulário evidência | `src/lib/pesquisa-cadeia*` | CHECK + aliases |
| Relação genealógica | `pessoas-linhagens.ts` | opções = CHECK |
| `#publicacao` | `atendimento-interno.tsx` | `id="publicacao"` |
| Jornada CTAs | `portal/jornada.tsx` | links demovidos |
| Handoff → proposta | `painel-calls.tsx` | redirect `/propostas` |
| Testes | Vitest | ca20, alinhamento, aceite-cadeia |

---

## 5. Ordem sugerida para a próxima sessão (uma por uma)

1. [!] BE-07 — decisão 6 vs 8 grupos Desk  
2. [ ] FE-06 — escopo do botão achado→alerta (opções 1–4 já mapeadas)  
3. [ ] FE-04 — Jornada portal + timeline operacional  
4. [ ] FE-05 — Pessoa 360 cards faltantes  
5. [!] BE-05/06 — prova autenticada dona + `COMPROVADO_EM_USO`  
6. [ ] FE-07 — P11 só após motor estável  
~~7. GP-05~~ — conferido: `lineage_paths` aceita `em_pesquisa` 

---

## 6. O que **não** fazer

- Inventar tabelas (`case_participants`, `crm_calls`, …) ou CHECK novo  
- Colocar Entregas/Fase na barra do App Cliente  
- Apontar site oficial para o app Vercel  
- Merge produção sem OK da proprietária  
