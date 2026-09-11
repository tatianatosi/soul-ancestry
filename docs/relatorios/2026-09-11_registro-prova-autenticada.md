# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Atualizado em:** 2026-09-11

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build ou tela sem sessão da proprietária **não** alteram essa condição.

A senha da conta **não** entra neste arquivo, no git nem em print.

## Fonte citada e não localizada no repositório

| Artefato | Resultado | Onde procurar |
|---|---|---|
| `CA_RESET_CONTEXTO_CANONICO_RECONSTRUCAO_CONTROLADA_2026-09-10.md` | `NAO_LOCALIZADO` | Não há arquivo com esse nome. Existem apenas `docs/evolucao/recuperados/fontes-primarias/CA-RESET-01-*`. Esses textos **permanecem ativos**. |

## Sessões autenticadas

### A. Vite local — bloqueio já registrado (#103)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:34 UTC |
| Ambiente | `http://127.0.0.1:8080/equipe/entrar` |
| Motor | Sessão da proprietária |
| Resultado | `BLOQUEADO_POR_DADO` |
| Evidência | Tela de login; mensagem genérica de falha. Sem Painel autenticado. |
| Causa | `prepararLoginEquipe` → `estadoLimite` exige `SUPABASE_SERVICE_ROLE_KEY` no servidor local. A chave **não** pode ser colada em chat, git ou artefato. |
| Limitação | Esse bloqueio vale só para o Vite do Cloud Agent. **Não** anula a sessão no preview Vercel. |

### B. Preview Vercel da PR #98 — sessão autenticada

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:31–00:37 UTC |
| Ambiente | `https://soul-ancestry-git-cursor-mesa-discov-f8ced8-tati-6134s-projects.vercel.app` |
| Conta | `tati@pluggedresearch.com` (Painel visível; sem print do campo de senha) |
| Objeto | Lead de teste **Ana Luiza** (rótulo “dado de teste”) |
| Motor | Sessão da proprietária |
| Resultado | `PASSOU` |
| Prints | `docs/provas/2026-09-11-preview-pr98/` |
| Limitação | Preview da branch da Mesa, não `main`/produção. Sem gravação de resposta, sem F5 de persistência, sem alteração de dado (o adendo não autoriza escrita nesta incorporação). |

## Matriz por motor

Resultados permitidos: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE`, `NAO_LOCALIZADO`.  
`COMPROVADO_EM_USO` só depois de prints inicial + ação + confirmação + releitura (+ integração quando houver cadeia).

| Motor | Resultado | Prints (inicial / ação / confirmação / releitura / integração) | Observação |
|---|---|---|---|
| Sessão da proprietária (Vite local) | `BLOQUEADO_POR_DADO` | não / tentada / erro / não / não | Ver bloco A. |
| Sessão da proprietária (preview #98) | `PASSOU` | sim / login / Desk aberto / — / — | Ver bloco B. Sem nova sessão depois do F5. |
| Mesa Discovery / CRM | `PASSOU` só leitura; **não** `COMPROVADO_EM_USO` | inicial + ação de navegação / sem gravar / sem toast de save / sem F5 / sem Hoje | Abriu Ana Luiza; SPIN uma pergunta por vez; clique em Problema saltou a etapa. Falta: colar WhatsApp, aceitar varredura, gravar resposta, responsável, próxima ação, recarregar, ver a ação no Hoje. Código dessa Mesa está na PR #98, ainda não em `main`. |
| Pessoa 360 | `NAO_LOCALIZADO` | — | Sem teste autenticado neste registro. |
| Varredura de dossiê | `NAO_LOCALIZADO` | — | Skill só em documento (`docs/prompts/ARTEFATO-RESGATE-SKILLS-INTELIGENCIA-VARREDURA-DOSSIE-2026-09-02.md`). Sem UI comprovada. |
| Pesquisa e evidências | `NAO_LOCALIZADO` | — | Sem teste autenticado neste registro. |
| Contexto de países / jurídico | `NAO_LOCALIZADO` | — | Sem teste autenticado neste registro. |
| Proposta / formalização | `NAO_LOCALIZADO` | — | Sem teste autenticado neste registro. |
| Financeiro | `NAO_LOCALIZADO` | — | Sem teste autenticado neste registro. |
| Entregas / App Cliente | `NAO_LOCALIZADO` | — | Sem teste autenticado neste registro. |
| KPIs e Hoje | `PASSOU` só leitura; **não** `COMPROVADO_EM_USO` | inicial `/painel` / sem resolver item / — / sem F5 / — | Cards de parado/vencido/decisão visíveis (7 casos, 3 exceções). Sem Receita/Conversão no topo do preview #98. Falta resolver um item e recarregar a fila. |
| Abas / taxonomia (6 grupos vigentes) | `PASSOU` navegação; **não** `COMPROVADO_EM_USO` | inicial autenticado / abriu Comercial → Mesa / — / — / objeto na aba dona | Seis grupos no menu: Hoje, Marketing & Comercial, Pessoas & Casos, Inteligência & Pesquisa, Formalização & Financeiro, Governança & Administração. Comercial entra em `/calls`, não em `/leads`. Falta prova de que um mesmo objeto só resume nas outras abas. |

## Cadeia transversal

```text
Entrada comercial → Mesa Discovery → Pessoa/Dossiê → Caso/Jornada
→ Pesquisa/Evidência → Proposta/Formalização → Financeiro
→ Entrega/App Cliente → Hoje/Radar
```

| Fluxo | Resultado | Prints de integração |
|---|---|---|
| Cadeia ponta a ponta autenticada | `NAO_LOCALIZADO` | nenhum |

## Prints desta rodada (preview PR #98)

| Arquivo | O que mostra |
|---|---|
| `docs/provas/2026-09-11-preview-pr98/abas_comercial_entra_na_mesa.webp` | Sessão autenticada; 6 grupos; Comercial → Mesa de Discovery `/calls`. |
| `docs/provas/2026-09-11-preview-pr98/hoje_kpis_parado_vencido_decisao.webp` | `/painel` com casos, alertas, vencidos, exceções. Sem Receita/Conversão no topo. |
| `docs/provas/2026-09-11-preview-pr98/mesa_discovery_uma_pergunta.webp` | Ana Luiza; Situação 1/7; uma pergunta (nacionalidade). |
| `docs/provas/2026-09-11-preview-pr98/mesa_discovery_salto_problema.webp` | Clique em Problema; pergunta de casamento/nome/adoção. |
| `docs/provas/2026-09-11-preview-pr98/leads_spin_sem_checkbox.webp` | `/leads` com progresso SPIN e link para a Mesa; sem checkbox. |

## O que este registro recusa como prova

- Homepage pública e formulário `/equipe/entrar` sem Painel autenticado.
- Vitest, `tsc`, ESLint, build, PR verde, inclusive #103.
- Preview sem sessão da proprietária.
- Declaração de agente de que o ambiente “está funcionando”.
- Cópia em `archive/` ou pasta GitHub de catálogo legado: **não** é arquivamento de contexto. Esses materiais permanecem ativos até `COMPROVADO_EM_USO`.

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
