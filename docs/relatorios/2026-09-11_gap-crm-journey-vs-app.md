# Gap — CRM Journey vs app (2026-09-11)

Fonte Journey: `docs/evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md`  
Leitura operacional: `docs/politicas/ADENDO-CRM-JOURNEY-PAINEL-CALLS-2026-09-11.md`

## Inventário código ↔ Journey

| Journey | Código / tabela | Status |
|---|---|---|
| Lead bruto / triagem (antes da call) | `/leads` → `leads` | OK — Lead vem primeiro |
| Call Discovery / diagnóstico | `PainelCalls`, `/calls` | OK — Calls ⊂ CRM vivo; após o Lead |
| Oportunidade | `/conversao` | OK — após Discovery, antes da proposta |
| Proposta + confirmação | `/propostas` | OK — handoff só depois da confirmação |
| Handoff → pessoa/caso | `executarHandoffDiscovery` | OK — grava clientes + crm_casos |
| Planejador Universal | UI no caso | OK — fonte operacional do caso |
| SPIN Discovery | `discovery-roteiro.ts` + Mesa em `painel-calls.tsx` | OK |
| status_call / consentimento | `leads.status_call`, `consentimento_*` + `bloqueiosRegistroCall` | OK |
| Próxima ação + responsável + área | `leads.proxima_acao`, `proxima_acao_em`, `responsavel_nome`, `area_responsavel` + `validarLead` | OK backend; UI de aviso reforçada nesta fatia |
| Handoff → pessoa + caso | `handoff-discovery.functions.ts` | OK (grava) |
| Proposta após discovery | `/propostas` + `proposals` | Gap fechado parcialmente: CTA pós-handoff (handoff **não** cria proposta) |
| Tabela `crm_calls` | — | **Não criar** — de-para = `leads` |
| `crm_interactions` / WhatsApp API | `VarreduraWhatsApp` local | BLOQUEADO automação |
| Onboarding WhatsApp D0–D30 | — | BLOQUEADO |
| Planilha Mestre / Asaas master | legado | Não usar como operação |
| Relatórios conversão | `/conversao` | Leitura; sem motor novo nesta fatia |

## Campos SPIN / call (amostra)

Persistidos no lead (não em `crm_calls`): objetivo, nacionalidades, elegibilidade preliminar, via jurídica, geração do ascendente, documentos chave, resumo validado, resultado discovery, progresso SPIN derivado (`spinDerivadoDoLead`).

## O que esta fatia entrega

1. Memória + adendo + este gap.
2. Aviso operacional explícito no Painel de Calls quando lead ativo está sem área/responsável/próxima ação datada.
3. Após handoff bem-sucedido: CTAs “Abrir caso” e “Abrir / registrar proposta” (sem inventar SKU).
4. Search opcional em `/propostas?caso=` / `?lead=` para pré-preencher busca/vínculo quando possível.
5. Correção documental: handoff já materializa pessoa+caso.
