# Plano completo App Cliente + Desk — go-live (revisão PRDs)

**Data:** 2026-09-12  
**Fontes:** `prd-e-ordem-cursor-go-live-clube-ancestral-aprovado.md` (v1.1) + `prd-aprovado-soul-ancestry-go-live-reuso-motores.md` (v1.0)  
**Status:** plano operacional unificado — **executável**

## Lacunas encontradas e correções neste plano

| Lacuna vs PRDs / pedido da dona | Correção |
|---|---|
| Ordem 1 mostrou chrome Desk | Ordem 1 = `PortalShell` full-bleed; Desk demo só em `/app-cliente-demo` |
| Magic link não era ordem explícita no PRD mestre | **Ordem 1B** obrigatória: `/acesso` + OTP + `/acesso/confirmar` → `/portal` (web + mobile) |
| Mobile pouco enfatizado | Todo print de App: desktop **e** mobile (bottom nav) |
| Repo oficial Soul Ancestry / Vercel | Entrega via PR → preview Vercel → merge `main` só com “sim” explícito |
| Desk face mockup (7) vs `GRUPOS_DESK` (6) | Desk face = contexto ativo; menu runtime 6 grupos até `COMPROVADO_EM_USO` |
| Adapter `caseId` único ausente | Ordem 2: reader fino em `crm_casos.id` (não fixture Sophia) |

## Sequência fechada (App + Desk + magic link)

```text
0  Realinhar (prova Desk-chrome inválida)           [feito]
1  App Cliente mockup no ar + prints web/mobile     [código+prints → commit/PR]
1B Magic link /acesso mobile+web + prints           [próxima]
2  caseId App↔Desk + prints
3  Caso 360 / Pessoas / Pesquisa
4  CRM Vivo / Journey / Calls
5  Proposta / contrato / jurídico contextual
6  Funil financeiro / marketing
7  Radar / Biblioteca / Legado / automações
```

Cada ordem: implementar → print → “Aprova para merge?” → commit/PR → merge só com sim.

## Aceite “Clube Ancestral no ar”

- App: 7 abas mockup, cream/navy, mobile bottom nav, dados honestos.
- Acesso: magic link web + mobile (sem senha de cliente).
- Desk: mesmos casos por `crm_casos.id`; motores reaproveitados; sem CRM/banco paralelo.
- Produção: preview Vercel aprovado → merge `main` → `soul-ancestry.vercel.app` só com autorização explícita.

## Fora de escopo

`/build-agents` (eve) — não se aplica a este go-live de produto. Redesign taxonomia; merge sem prints; automação de pagamento/mensagem.
