# Registro de prova autenticada — Clube Ancestral

**Status do registro:** ativo (não arquivável)  
**Política:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Conta exigida:** proprietária `tati@pluggedresearch.com`  
**Atualizado em:** 2026-09-11

Nenhum motor abaixo está `COMPROVADO_EM_USO`. Código, PR, Vitest, build, DEMO ou declaração de agente **não** alteram essa coluna.

## Sessões

### A — Vite local (Cloud Agent)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:34 UTC |
| Ambiente | `http://127.0.0.1:5173/equipe/entrar` (e tentativa em `:8080`) |
| Motor | Sessão da proprietária (pré-requisito) |
| Ação | Login da proprietária no Desk |
| Resultado | `BLOQUEADO_POR_DADO` |
| Evidência visual | Tela de login; mensagem genérica “Não foi possível entrar. Verifique os dados e tente novamente.” |
| Causa | `prepararLoginEquipe` → `estadoLimite` usa cliente administrativo e exige `SUPABASE_SERVICE_ROLE_KEY` no servidor. A variável não está no Cloud Agent. A chave **não** pode ser colada em chat, git ou artefato. |
| Limitação | Print sem Painel autenticado **não** conta. A senha não foi o ponto de falha visível. |
| Próximo passo | Segredo só no ambiente de servidor. Não repetir este teste local até o ambiente ter a chave. |

### B — Prévia Vercel do Desk de 6 grupos (sessão autenticada)

| Campo | Valor |
|---|---|
| Data/hora | 2026-09-11 ~00:39–00:48 UTC |
| Ambiente | `https://soul-ancestry-git-cursor-desk-produt-c233f7-tati-6134s-projects.vercel.app` |
| Conta | `tati@pluggedresearch.com` · Clube Ancestral · Admin |
| Motor | Sessão + taxonomia + leitura de face |
| Ação | Login em `/equipe/entrar` → `/painel` → `/calls` → `/contratos` → `/catalogo` → `/biblioteca` → `/configuracoes` → `/crm-mestre` → `/app-cliente-demo` → `/painel` |
| Resultado da **sessão** | `PASSOU` |
| Prints | `docs/provas/2026-09-11-preview-desk-6-grupos/` |
| Limitação | Sem escrita persistida neste passe (o adendo desta incorporação não autoriza gravar dado). DEMO do App Cliente não é projeção de cliente real. Relesitura = retorno a `/painel`, não F5 de um save. Integração de cadeia (Discovery → Pessoa → Caso → Hoje) **não** executada. |

## Matriz por motor

Resultados permitidos: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE`, `NAO_LOCALIZADO`.  
`COMPROVADO_EM_USO` só depois de prints inicial + ação + confirmação + releitura (+ integração quando houver cadeia).

| Motor | Resultado | Prints (inicial / ação / confirmação / releitura / integração) | Observação |
|---|---|---|---|
| Sessão da proprietária (Vite local) | `BLOQUEADO_POR_DADO` | não / tentada / erro genérico / não / não | Sessão A. |
| Sessão da proprietária (prévia 6 grupos) | `PASSOU` | sim / login / `/painel` com Admin / retorno a `/painel` / N/A | `sessao_autenticada_tati_admin.png`, `painel_hoje_6_grupos_kpis.png`. |
| Mesa Discovery / CRM | `NAO_LOCALIZADO` | inicial Calls sim / sem SPIN gravado / — / — / — | `/calls` aberto; varredura visível; **sem** salvar próxima ação nem recarregar. |
| Pessoa 360 | `NAO_LOCALIZADO` | — | Não aberta para edição nesta sessão. |
| Varredura de dossiê | `NAO_LOCALIZADO` | — | Não executada. |
| Pesquisa e evidências | `NAO_LOCALIZADO` | leitura Biblioteca sim / sem gravar lacuna / — / — / — | Face da Biblioteca sem Top 30. |
| Contexto de países / jurídico | `NAO_LOCALIZADO` | — | Não aberto. |
| Proposta / formalização | `NAO_LOCALIZADO` | leitura Contratos sim / sem parâmetro gravado / — / — / — | Sem Top 30 na face. |
| Financeiro | `NAO_LOCALIZADO` | — | Não aberto `/financeiro`. Catálogo homologado lido (não é caixa). |
| Entregas / App Cliente | `NAO_LOCALIZADO` | DEMO 7 abas sim / — / — / — / — | `/app-cliente-demo` é DEMO rotulada. O adendo recusa DEMO como prova do motor. |
| KPIs e Hoje | `PASSOU` (leitura) / `NAO_LOCALIZADO` (escrever item e recarregar) | inicial `/painel` / navegação / cards visíveis / retorno `/painel` / sem fila atualizada por ação | Casos ativos 7; sem Receita/Conversão no topo. Não se abriu um KPI para resolver item. |
| Abas / taxonomia (6 grupos Desk + 7 abas App) | `PASSOU` (navegação) | sim / sidebar + rotas / páginas carregaram / retorno `/painel` / objeto ainda não “dono vs resumo” | 6 grupos visíveis. App: Home · Jornada · Radar · Árvore · Documentos · Legado · Conta. **Dívida visível:** CRM Mestre e Dicionário ainda aparecem no Comercial nesta prévia. |

## Cadeia transversal

```text
Entrada comercial → Mesa Discovery → Pessoa/Dossiê → Caso/Jornada
→ Pesquisa/Evidência → Proposta/Formalização → Financeiro
→ Entrega/App Cliente → Hoje/Radar
```

| Fluxo | Resultado | Prints de integração |
|---|---|---|
| Cadeia ponta a ponta autenticada | `NAO_LOCALIZADO` | nenhum (não houve save de Discovery → Hoje) |

## Prints desta sessão (prévia)

| Arquivo | Rota | O que mostra |
|---|---|---|
| `docs/provas/2026-09-11-preview-desk-6-grupos/sessao_autenticada_tati_admin.png` | `/configuracoes` | Rodapé: `tati@pluggedresearch.com`, Clube Ancestral, Admin. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/painel_hoje_6_grupos_kpis.png` | `/painel` | 6 grupos; KPIs vivos; sem Receita/Conversão no topo. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/painel_calls_comercial.png` | `/calls` | Painel de Calls no grupo Marketing & Comercial. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/contratos_sem_top30.png` | `/contratos` | Formalização; sem Top 30 na face. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/catalogo_homologado.png` | `/catalogo` | Catálogo homologado; Planilha Mestre como origem histórica. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/biblioteca_mestre.png` | `/biblioteca` | Centro de Inteligência; Top 30 fora da face. |
| `docs/provas/2026-09-11-preview-desk-6-grupos/app_cliente_demo_7_abas.png` | `/app-cliente-demo` | 7 abas; faixa DEMO. |

## O que este registro recusa como prova

- Homepage pública e formulário `/equipe/entrar` sem Painel autenticado.
- Vite local sem chave de servidor.
- Vitest, `tsc`, ESLint, build, PR verde.
- DEMO do App Cliente como se fosse entrega ao cliente real.
- Declaração de agente de que o ambiente “está funcionando”.
- Leitura de face como `COMPROVADO_EM_USO` de motor.

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
