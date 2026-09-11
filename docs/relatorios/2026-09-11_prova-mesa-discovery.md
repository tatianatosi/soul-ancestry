# Prova — Mesa Discovery (corte vertical + adendo de prova autenticada)

**Data:** 2026-09-11  
**Políticas:**  
- `docs/politicas/RESET-DE-CONFIANCA-OPERACIONAL-2026-09-10.md`  
- `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Capacidade:** Mesa Discovery / entrada comercial  
**Classificação atual:** prova visual autenticada **parcialmente fechada** no SPIN+persistência; cadeia integrada do produto **ainda não** `COMPROVADO_EM_USO`  
**Arquivamento do contexto:** **PROIBIDO** (adendo §5–§8)

## Ambiente

| Item | Valor |
|---|---|
| Código | branch com SPIN no mesmo fluxo de `/calls` |
| Preview Vercel | `BLOQUEADO` — Deployment Protection + MFA |
| App local | `http://127.0.0.1:5173` |
| Conta | `tati@pluggedresearch.com` (typo `pluggegdresearch` não autentica) |
| Senha | fornecida na conversa — **não** versionada |

## Matriz de prova autenticada (adendo §3)

| Evidência | Resultado | Artefato |
|---|---|---|
| 1. Print inicial autenticado | `PASSOU` | `docs/relatorios/evidencias-2026-09-11-mesa-discovery/03-logged-in-hoje.png` |
| 2. Print da ação (mesa / lead / dump / SPIN) | `PASSOU` | `04-calls-mesa.png`, `05-lead-aberto.png`, `06-varredura-dump.png`, `07-spin-bloco.png` |
| 3. Print confirmação (SPIN 4/4 + gravar) | `PASSOU` | `08-spin-salvo.png` — mensagem de registro gravado; contador 4/4 |
| 4. Print releitura F5 | `PASSOU` | `09-reload-persistiu.png` — SPIN permanece 4/4 após reload |
| 5. Print integração Hoje / Comercial | `PARCIAL` | `10-hoje-proxima-acao.png`, `11-comercial-proxima-acao.png` — há “Ana Luiza” em Hoje e em Próximas ações; **não** está isolado com certeza que é o mesmo fato Discovery acabado de gravar (pode haver caso/lead pré-existente) |
| 6. Registro | este arquivo | |

## Corte vertical §8

| # | Ação | Resultado |
|---|---|---|
| 1–2 | Login + `/calls` | `PASSOU` |
| 3–5 | Dump / varredura / lead teste | `PASSOU` |
| 6 | Quatro SPIN no mesmo fluxo | `PASSOU` (UI + marcação + persistência) |
| 7–8 | Resultado + responsável + prazo + salvar | `PASSOU` |
| 9–10 | Recarregar e confirmar SPIN | `PASSOU` |
| 11 | Mesmo fato em Comercial e Hoje sem duplicar | `PARCIAL` — precisa confirmação da proprietária de que o item visto é o mesmo registro Discovery |

### Resultado agregado desta rodada

- **SPIN no mesmo fluxo + save + F5:** `PASSOU` (com prints).  
- **Cadeia produto integrado (adendo §2 e §8):** ainda **não** encerrada — falta confirmação inequívoca de integração Hoje/Comercial do mesmo fato, e os demais motores seguem sem prova autenticada.  
- Vitest 29/29 = suporte; **não** arquiva contexto.  
- **Não** declarar o Clube Ancestral “pronto como produto único”.

## Registro mínimo §9

| Campo | Conteúdo |
|---|---|
| Capacidade | Mesa Discovery — SPIN no fluxo `/calls` |
| Objeto | Lead sintético “Ana Luiza (dado de teste)” |
| Fonte | `/calls`, `painel-calls.tsx`, `discovery-roteiro.ts`, `salvarLeadDesk` → `leads.spin_*` |
| Ação | Autenticar; abrir mesa; abrir lead; marcar 4 SPIN; gravar; F5; reabrir; olhar Hoje/Próximas ações |
| Resultado | SPIN+persistência `PASSOU`; integração Hoje/Comercial `PARCIAL` |
| Prova | Prints em `docs/relatorios/evidencias-2026-09-11-mesa-discovery/` (03–11, 08–09 críticos) |
| Limite | Preview Vercel com MFA; integração Hoje/Comercial não isolada 100% ao fato acabado de gravar |
| Próxima ação | **Uma:** proprietária confirma no print 10/11 se a próxima ação vista é a do Discovery recém-salvo; se não, grava uma próxima ação única e anexa novo print de integração |

## Decisão de continuidade (adendo)

Contexto de resgate (reset + adendo + Discovery + briefs) permanece **ativo**.  
Não iniciar Pessoa 360 / Proposta / Financeiro / App / KPIs / Abas como “próximo feito”.  
Agentes KPIs e Abas seguem pausados.

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```
