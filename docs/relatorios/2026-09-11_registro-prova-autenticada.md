# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Atualizado em:** 2026-09-11 (após merge da #98 em `main` `e3c72a03`)

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build, merge ou declaração de agente **não** alteram essa condição.

A senha da conta **não** entra neste arquivo, no git nem em print.

Prints feitos por agente com a conta da proprietária (pedido explícito dela) são **evidência de sessão**, não o protocolo completo da seção 3 (inicial + ação + confirmação + releitura + integração executados por ela). Não pedimos que ela refaça o clique já documentado; o próximo teste dela, quando autorizar escrita, é gravar na Mesa → F5 → ver a próxima ação no Hoje.

## Fonte citada e não localizada no repositório

| Artefato | Resultado | Onde procurar |
|---|---|---|
| `CA_RESET_CONTEXTO_CANONICO_RECONSTRUCAO_CONTROLADA_2026-09-10.md` | `NAO_LOCALIZADO` | Não há arquivo com esse nome. Existem apenas `docs/evolucao/recuperados/fontes-primarias/CA-RESET-01-*`. Esses textos **permanecem ativos**. |

## Sessões autenticadas

### A. Vite local — bloqueio (#103)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:34 UTC |
| Ambiente | `http://127.0.0.1:8080/equipe/entrar` |
| Motor | Sessão da proprietária |
| Resultado | `BLOQUEADO_POR_DADO` |
| Evidência | Tela de login; mensagem genérica de falha. Sem Painel autenticado. |
| Causa | `prepararLoginEquipe` → `estadoLimite` exige `SUPABASE_SERVICE_ROLE_KEY` no servidor local. A chave **não** pode ser colada em chat, git ou artefato. |

### B. Produção `soul-ancestry.vercel.app` — antes do deploy da #98

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:52–00:54 UTC |
| Ambiente | `https://soul-ancestry.vercel.app` |
| Conta | `tati@pluggedresearch.com` (Painel visível; sem print do campo de senha) |
| Quem executou | Agente, com a conta da proprietária |
| Entrada | Landing → “Acesso da equipe” → `/equipe/entrar` → `/painel` |
| Resultado da sessão | evidência autenticada (Desk aberto) |
| Prints | `docs/provas/2026-09-11-producao/` |
| O que a tela mostrou | 6 grupos. Comercial abria `/leads`. `/calls` era o Painel de Calls antigo. |
| Limitação | Só leitura. Sem gravar, sem F5. **Superado como estado de produção** quando o deploy da #98 (`e3c72a03`) estiver no ar — a linha permanece como evidência daquele instante, não como arquivo de contexto. |

### C. Preview Vercel da PR #98 — Mesa SPIN (agora mesclada)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:31–00:37 UTC |
| Ambiente | `https://soul-ancestry-git-cursor-mesa-discov-f8ced8-tati-6134s-projects.vercel.app` |
| Conta | `tati@pluggedresearch.com` |
| Quem executou | Agente, com a conta da proprietária |
| Objeto | Lead de teste **Ana Luiza** |
| Prints | `docs/provas/2026-09-11-preview-pr98/` |
| O que a tela mostrou | Comercial → Mesa `/calls`. SPIN uma pergunta por vez. Clique em Problema saltou. `/leads` sem checkbox. |
| F5 após gravar | **não feito** |
| Integração Hoje | **não feito** |
| Resultado do protocolo | não `PASSOU`; não `COMPROVADO_EM_USO` |
| Depois do merge | A #98 entrou em `main` em 2026-09-11 01:45 UTC. Produção no ar conferida no bloco D. |

### D. Produção `soul-ancestry.vercel.app` — depois do deploy da #98

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~01:50–01:51 UTC |
| Ambiente | `https://soul-ancestry.vercel.app/calls` |
| Conta | `tati@pluggedresearch.com` |
| Quem executou | Agente, com a conta da proprietária |
| Prints | `docs/provas/2026-09-11-producao-pos-98/` |
| O que a tela mostrou | Comercial abre **Mesa de Discovery** `/calls`. Item de menu “Mesa de Discovery”. Ana Luiza: Situação, pergunta 2 de 19, uma pergunta (nacionalidade). Hoje diz que a Mesa faz a entrada comercial. |
| F5 após gravar | **não feito** |
| Integração Hoje | **não feito** |
| Resultado do protocolo | não `PASSOU`; não `COMPROVADO_EM_USO` |

## Matriz por motor

Resultados permitidos: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE`, `NAO_LOCALIZADO`.  
`COMPROVADO_EM_USO` só depois de prints inicial + ação + confirmação + releitura (+ integração quando houver cadeia), **executados pela proprietária**.

| Motor | Resultado | Prints (inicial / ação / confirmação / releitura / integração) | Observação |
|---|---|---|---|
| Sessão (Vite local) | `BLOQUEADO_POR_DADO` | não / tentada / erro / não / não | Bloco A. |
| Sessão (produção pré-#98) | evidência de agente | sim / login / `/painel` / — / — | Bloco B. Desk aberto. |
| Sessão (preview #98) | evidência de agente | sim / login / Mesa / — / — | Bloco C. |
| Mesa Discovery / CRM | evidência de abertura em produção; não `PASSOU`; **não** `COMPROVADO_EM_USO` | inicial `/calls` + Ana Luiza pergunta 2/19 / sem gravar / sem save / sem F5 / sem Hoje | #98 no ar. Comercial entra na Mesa. Falta gravar, F5 e próxima ação no Hoje. |
| Pessoa 360 | `NAO_LOCALIZADO` | — | Mesa ainda não grava na Pessoa 360. |
| Varredura de dossiê | `NAO_LOCALIZADO` | — | Skill só em documento. Sem UI comprovada. |
| Pesquisa e evidências | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Contexto de países / jurídico | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Proposta / formalização | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Financeiro | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| Entregas / App Cliente | `NAO_LOCALIZADO` | — | Sem prova autenticada da dona. |
| KPIs e Hoje | evidência de leitura; **não** `COMPROVADO_EM_USO` | `/painel` / sem resolver item / — / sem F5 / — | 7 casos, 3 exceções. Falta resolver item e recarregar. Sem print da próxima ação da Mesa no Hoje. |
| Abas / taxonomia (6 grupos) | evidência de navegação; **não** `COMPROVADO_EM_USO` | autenticado / Comercial e Pessoas & Casos / — / — / parcial | 6 grupos no menu. Memória permanente ainda cita 8 — nenhuma leitura se arquiva. |

## Cadeia transversal

```text
Entrada comercial → Mesa Discovery → Pessoa/Dossiê → Caso/Jornada
→ Pesquisa/Evidência → Proposta/Formalização → Financeiro
→ Entrega/App Cliente → Hoje/Radar
```

| Fluxo | Resultado | Prints de integração |
|---|---|---|
| Cadeia ponta a ponta autenticada | `NAO_LOCALIZADO` | nenhum |

## Prints (produção pré-#98)

| Arquivo | O que mostra |
|---|---|
| `docs/provas/2026-09-11-producao/hoje_autenticado.webp` | Sessão autenticada em `/painel`; 6 grupos no menu. |
| `docs/provas/2026-09-11-producao/hoje_kpis.webp` | Cards de parado/vencido/decisão (7 casos, 3 exceções). |
| `docs/provas/2026-09-11-producao/comercial_abre_leads.webp` | Comercial abria `/leads` (estado anterior ao deploy da #98). |
| `docs/provas/2026-09-11-producao/calls_painel_antigo.webp` | `/calls` = Painel de Calls antigo. |
| `docs/provas/2026-09-11-producao/ana_luiza_call.webp` | Lead de teste Ana Luiza aberto; sem gravação. |
| `docs/provas/2026-09-11-producao/pessoas_casos.webp` | Pessoas & Casos → Casos 360. |

## Prints (produção depois da #98)

| Arquivo | O que mostra |
|---|---|
| `docs/provas/2026-09-11-producao-pos-98/comercial_abre_mesa.webp` | Comercial → Mesa de Discovery `/calls`; 6 grupos. |
| `docs/provas/2026-09-11-producao-pos-98/mesa_sidebar_6_grupos.webp` | Mesma Mesa, menu “Mesa de Discovery”. |
| `docs/provas/2026-09-11-producao-pos-98/ana_spin_uma_pergunta.webp` | Ana Luiza; Situação pergunta 2/19; uma pergunta. |
| `docs/provas/2026-09-11-producao-pos-98/hoje_kpis.webp` | Hoje: a Mesa faz a entrada comercial; 3 exceções. |

## Prints (preview PR #98, código agora em `main`)

| Arquivo | O que mostra |
|---|---|
| `docs/provas/2026-09-11-preview-pr98/abas_comercial_entra_na_mesa.webp` | 6 grupos; Comercial → Mesa de Discovery `/calls`. |
| `docs/provas/2026-09-11-preview-pr98/hoje_kpis_parado_vencido_decisao.webp` | `/painel` sem Receita/Conversão no topo. |
| `docs/provas/2026-09-11-preview-pr98/mesa_discovery_uma_pergunta.webp` | Ana Luiza; Situação 1/7; uma pergunta. |
| `docs/provas/2026-09-11-preview-pr98/mesa_discovery_salto_problema.webp` | Clique em Problema; pergunta de casamento/nome/adoção. |
| `docs/provas/2026-09-11-preview-pr98/leads_spin_sem_checkbox.webp` | `/leads` com progresso SPIN; sem checkbox. |

## O que este registro recusa como prova

- Homepage pública e formulário `/equipe/entrar` sem Painel autenticado.
- Vitest, `tsc`, ESLint, build, PR verde, merge da #98.
- Preview ou produção com lead `dados_teste` executado só por agente, sem F5 após gravar.
- Toast sem releitura após salvar.
- Declaração de agente de que o ambiente “está funcionando”.
- Cópia em `archive/` ou pasta GitHub de catálogo legado: **não** é arquivamento de contexto.

Nenhum contexto de resgate (Discovery, Pessoa 360, dossiê, Pesquisa, formalização, Radar, App, RLS) foi arquivado.

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
