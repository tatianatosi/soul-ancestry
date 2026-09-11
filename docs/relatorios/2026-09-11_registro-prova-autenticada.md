# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Ambiente alvo desta linha:** Cloud Agent / Vite local `http://127.0.0.1:8080`  
**Atualizado em:** 2026-09-11

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build ou tela sem sessão da proprietária **não** alteram esta tabela.

## Bloqueio atual da sessão autenticada

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:34 UTC |
| Ambiente | `http://127.0.0.1:8080/equipe/entrar` |
| Motor | Sessão da proprietária (pré-requisito de todos os demais) |
| Ação | Tentativa de login da proprietária no Desk |
| Resultado | `BLOQUEADO_POR_DADO` |
| Evidência visual | Tela de login com e-mail da proprietária; mensagem genérica “Não foi possível entrar. Verifique os dados e tente novamente.” Print de sessão autenticada **não existe**. |
| Causa | O passo de rate-limit (`prepararLoginEquipe` → `estadoLimite`) usa cliente administrativo e exige `SUPABASE_SERVICE_ROLE_KEY` no servidor. A variável não está no ambiente Cloud Agent. A chave **não** pode ser colada em chat, git ou artefato. |
| Limitação | Sem sessão autenticada, a matriz da seção 4 do adendo não pode ser executada. Prints de homepage/login sem Painel **não** contam como prova. |
| Próximo passo | Proprietária adiciona no painel de Environment os segredos `SUPABASE_SERVICE_ROLE_KEY`, `TEST_LOGIN_USERNAME` e `TEST_LOGIN_PASSWORD`. Depois: print inicial autenticado em `/painel`, ação, confirmação, releitura e integração. |

## Matriz por motor

Resultados permitidos: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE`, `NAO_LOCALIZADO`.  
`COMPROVADO_EM_USO` só depois de prints inicial + ação + confirmação + releitura (+ integração quando houver cadeia).

| Motor | Resultado | Prints (inicial / ação / confirmação / releitura / integração) | Observação |
|---|---|---|---|
| Sessão da proprietária | `BLOQUEADO_POR_DADO` | não / tentada / erro genérico / não / não | Ver bloco acima. |
| Mesa Discovery / CRM | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Pessoa 360 | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Varredura de dossiê | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Pesquisa e evidências | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Contexto de países / jurídico | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Proposta / formalização | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Financeiro | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Entregas / App Cliente | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| KPIs e Hoje | `NAO_LOCALIZADO` | — | Dependente da sessão. |
| Abas / taxonomia (8 grupos Desk + 7 abas App) | `NAO_LOCALIZADO` | — | Dependente da sessão. |

## Cadeia transversal

```text
Entrada comercial → Mesa Discovery → Pessoa/Dossiê → Caso/Jornada
→ Pesquisa/Evidência → Proposta/Formalização → Financeiro
→ Entrega/App Cliente → Hoje/Radar
```

| Fluxo | Resultado | Prints de integração |
|---|---|---|
| Cadeia ponta a ponta autenticada | `NAO_LOCALIZADO` | nenhum |

## O que este registro recusa como prova

- Homepage pública e formulário `/equipe/entrar` sem Painel autenticado.
- Vitest, `tsc`, ESLint, build de environment, PR verde.
- Declaração de agente de que o ambiente “está funcionando”.

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
