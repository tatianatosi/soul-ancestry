# Execução CRM Journey — jornada navegável com prints — 2026-09-11

**Branch:** `cursor/crm-journey-painel-calls-8085` · **PR:** https://github.com/tatianatosi/soul-ancestry/pull/110  
**Quem:** agente Cloud  
**Conta exigida para `COMPROVADO_EM_USO`:** `tati@pluggedresearch.com`

## O que ficou navegável no Desk

| Superfície | Rota | Papel |
|---|---|---|
| Hub CRM Journey | `/crm-journey?fase=` | Stepper das 9 fases + CTA para tela real |
| Menu Desk | Marketing & Comercial → **CRM Journey (ciclo completo)** | Entrada canônica |
| Conversão | `/conversao` | Matriz das fases + botão **Abrir CRM Journey** (visível mesmo se o funil falhar) |

Código: `src/lib/crm-journey-fases.ts`, `src/components/crm/jornada-crm.tsx`, `src/routes/_authenticated/crm-journey.tsx`.

**Não criado:** `crm_calls`, `whatsapp_automations`, webhook de envio automático.

## Mapa fase → rota

| # | Fase | Rota | WhatsApp |
|---|---|---|---|
| 1 | Lead Bruto | `/calls` | fila |
| 2 | Lead Qualificado | `/calls` | fila |
| 3 | Oportunidade | `/propostas` | fila |
| 4 | Proposta Aceita | `/contratos` | fila |
| 5 | Cliente Ativo | `/acessos-portal` | fila |
| 6 | Cliente Pesquisa | `/pesquisa-modulo` | cópia manual |
| 7 | Doc. validado | `/atendimento#publicacao` | fila |
| 8 | Pós-reconhecimento | `/casos` | bloqueado_auto |
| 9 | Recorrente | `/crm-journey` | bloqueado_auto |

## Prints (artefatos)

Pasta: `/opt/cursor/artifacts/crm-journey-fases/`

| Arquivo | Conteúdo | Classificação |
|---|---|---|
| `01_fase_auth_login_local.png` | Login Desk local | Gate real |
| `02_fase_auth_login_vercel.png` | Login preview Vercel | Gate real |
| `03_hub_crm_journey.png` | Hub fase 1 Lead Bruto + nav | UI hub (sessão de captura local; **não** dona) |
| `04_hub_fase_oportunidade.png` | Hub fase 3 Oportunidade | UI hub |
| `05_fase_propostas.png` | Tela `/propostas` | Rota alcançada |
| `06_fase_calls_mesa.png` | Mesa `/calls` | Rota alcançada |
| `07_conversao_com_link_hub.png` | Conversão com fases + CTA hub | UI + erro de API sem sessão real |
| `08`–`12` | contratos, pesquisa, acessos, atendimento, casos | Rotas alcançadas |
| `13_hub_fase_lead_bruto.png` | Hub Lead Bruto | UI hub |
| `14_nav_marketing_crm_journey.png` | Item de menu CRM Journey | Nav |
| `15_hub_fase_pesquisa.png` | Hub Cliente em Pesquisa | UI hub |

Resultado de prova autenticada da **proprietária**: ainda **`BLOQUEADO_POR_DADO`** / **`NAO_LOCALIZADO`** para `COMPROVADO_EM_USO` (falta login `tati@pluggedresearch.com` com prints inicial → ação → confirmação → F5).

## Como fechar `COMPROVADO_EM_USO`

1. Entrar como Tatiana no Desk.  
2. Abrir `/crm-journey` e percorrer MVP 1–7 (CTA de cada fase).  
3. Em cada fase: print inicial, ação real, confirmação, F5.  
4. Registrar em `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.
