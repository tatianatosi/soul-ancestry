# Execução CRM Journey — todas as fases (com print) — 2026-09-11

**Branch:** `cursor/crm-journey-painel-calls-8085` · **PR:** https://github.com/tatianatosi/soul-ancestry/pull/110  
**Quem:** agente Cloud  
**Conta exigida para `COMPROVADO_EM_USO`:** `tati@pluggedresearch.com`

## Como as fases foram executadas no código

| # | Fase Journey | Rota Desk | WhatsApp (seguro) | Código |
|---|---|---|---|---|
| 1 | Lead Bruto | `/calls` | fila `communication_queue` | Mesa + `leads` |
| 2 | Lead Qualificado | `/calls` | fila | SPIN + avisos |
| 3 | Oportunidade | `/propostas` | fila | CTA pós-handoff |
| 4 | Proposta Aceita | `/contratos` | fila D0 | contratos existentes |
| 5 | Cliente Ativo | `/acessos-portal` | fila D1 | portal access |
| 6 | Cliente Pesquisa | `/achados` | cópia manual | `alertas-whatsapp.ts` |
| 7 | Doc. validado | `/atendimento#publicacao` | fila | publicação App |
| 8 | Pós-reconhecimento | `/casos` | **bloqueado_auto** | backlog |
| 9 | Recorrente D30 | `/conversao` | **bloqueado_auto** | backlog |

Mapa canônico: `src/lib/crm-journey-fases.ts` · UI: bloco **Fases do CRM Journey** em `/conversao`.

**Não criado:** `crm_calls`, `whatsapp_automations`, webhook de envio automático (efeito externo exige aprovação humana + segredo de provedor).

## Prints desta rodada

| Artefato | O que mostra | Resultado |
|---|---|---|
| `crm-journey-fases/01_fase_auth_login_local.png` | Login Desk local `/equipe/entrar` | Rota existe; **sem sessão** |
| `crm-journey-fases/02_fase_auth_login_vercel.png` | Login Desk no preview Vercel | Mesmo gate; share Vercel ≠ login Supabase |

Todas as rotas internas das fases **redirecionam para login** sem credencial.  
Resultado de prova autenticada por fase: **`BLOQUEADO_POR_DADO`** (falta sessão da proprietária).

## Protocolo para você fechar `COMPROVADO_EM_USO` (uma fase por vez)

Para cada fase MVP (1–7):

1. Print **inicial** da rota  
2. **Ação** (ex.: gravar SPIN, registrar proposta, enfileirar WhatsApp)  
3. Print **confirmação**  
4. **F5 / releitura**  
5. Se houver cadeia, print de **integração** (ex.: caso ↔ proposta)

Registrar em `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.

## Próximo desbloqueio

- Senha / magic link da proprietária **ou** captura manual por Tatiana  
- Credenciais WhatsApp (Twilio/Z-API) só em Edge Function — **não** no browser; envio só após gate  
