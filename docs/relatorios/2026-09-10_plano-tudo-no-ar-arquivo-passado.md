# Plano — pôr a operação no ar e arquivar o passado

Para Tatiana (`tati@pluggedresearch.com`). 10/09/2026.

Não é estimativa de calendário. É o que falta **no produto**, em que ordem, e o que do passado pode sair da face **sem apagar dado nem RLS**.

Fonte de ordem: `docs/politicas/PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md` (P0→P11). Mockup normativo: PDF de **17 páginas**. Não usar o PDF de 47 páginas nem o site Lovable como prova.

---

## 0. Por que você “não vê nada”

Três coisas diferentes estão misturadas:

1. **Onde olhar.** Depois do login a Vercel abre o **Painel Hoje**. Essa tela quase não mudou. O visual aplicado e o inventário P0–P11 estão em **Biblioteca Mestre** e no **Caso 360 → Indicadores**. Quem fica no Painel, no editor Lovable ou em `soul-ancestry.lovable.app` vê o passado.
2. **O que já está no ar.** PR **#91** mesclada em `main` (`51a28e82`). Vercel produção (`soul-ancestry.vercel.app`) já serve o JS com `Motores primordiais P0–P11`. Não falta publicar de novo no Lovable para a Vercel.
3. **O que ainda não existe.** PRs **#30–#84** fechadas ou em draft **não viraram motor**. Fechar PR no GitHub ≠ código no ar. Por isso o Desk ainda parece um caos: várias telas, três stores de evidência, dossiê legado, demo, planejador só em diagnóstico.

**Acesso:** o Desk de produção não pede Vercel/GitHub. Pede o login da equipe:

- https://soul-ancestry.vercel.app/equipe/entrar
- Depois: https://soul-ancestry.vercel.app/biblioteca

Cursor, artefatos PDF e o painel da Vercel são contas à parte. Sem elas você não vê os PDFs da sessão de conferência — mas o **produto** é a URL acima.

Não usar `soul-ancestry.lovable.app` para homologar: o bundle de lá **não tem** o bloco de motores.

---

## 1. O que já está no ar (não refazer)

| Fatia | Onde |
|---|---|
| Visual P0/P1 do mockup (8 grupos, ouro ativo, 7 abas Home, Caso 360 página única, pesquisa no `SaasShell`, rótulos na Biblioteca, aviso do Painel em `<details>`) | `main` / Vercel |
| Pesquisa ligada a `research_cases` + evidências vivas | `main` |
| Próxima ação canônica (RPC) no Desk e projeção no App Cliente | `main` |
| Ana como primeira cliente; legado fora da face dos 8 grupos | `main` |
| Inventário P0–P11 + diagnóstico cidadania 0–8 (leitura, não escritor) | Biblioteca + Caso 360 |
| P4: cria `onboarding_planos` se faltar (não ativa cliente) | `main` |
| P7: SKU só se `product_catalog` ativo e homologado | pré-carga de contrato |

Isto **não** é “tudo no ar”. É o chão. O passado ainda mora em rotas, stores paralelos e PRs nunca executadas.

---

## 2. O que “tudo no ar” significa (e o que não significa)

Significa: **um caso, um `case_id`, uma jornada, uma próxima ação**, nas tabelas que já existem, na ordem P0→P11, visível no Desk da Vercel e no App Cliente autorizado.

Não significa: reabrir 50 PRs de uma vez, criar `case_participants` / `citizenship_cases` / `onboarding_runs`, redesenhar 17 páginas, ligar WhatsApp/Asaas/protocolo sozinho, ou `DROP TABLE`.

“Jogar fora o passado” = **sair da face e parar de dirigir operação**. Dado antigo fica arquivado (linha com `archived_at` ou rota só em Conta). Não se apaga o banco para “limpar”.

---

## 3. Passado a arquivar (face), sem destruir

| Passado | O que fazer | Risco se apagar |
|---|---|---|
| `soul-ancestry.lovable.app` / editor Lovable como “produção” | Parar de homologar ali. Produção = Vercel + `main` | Nenhum |
| Dossiê `/pesquisa` e demo `/app-cliente-demo` | Já saíram dos 8 grupos; próximo passo: só Conta, depois desligar o link quando a pesquisa viva cobrir o caso da Ana | Perde histórico se `DROP` |
| Três stores de evidência (`evidences`, `research_evidence_items`, `evidencias`) | P5: **um escritor** no módulo vivo; os outros leitura/arquivo | Cadeia de custódia |
| `casos` vs `crm_casos` | Continuar eixo `crm_casos`; não criar CRM paralelo | Identidade do caso |
| Planilha Mestre / Asaas legado como verdade | Já política: não dirigem ops | Financeiro histórico |
| PDF de 47 páginas / distorção | Auditoria, não mockup | Redesign indevido |
| Drafts GitHub #30–#84 | Humano fecha como “não executado”; o código novo entra por PRs novas, uma fatia por vez | Reabrir o caos de PRs |
| Rotas `/piloto` | Já fora do menu; não reativar | Confusão Ana vs demo |

---

## 4. Sequência para pôr o resto no ar

Cada fatia: tabelas existentes + escritor + consumidor + CTA + reload. Validar na Vercel com o caso da Ana antes da próxima.

### Fatia A — Você ver (bloqueio atual)

- Abrir só a Vercel (URLs da seção 0). Hard-refresh se a aba era de antes das 16:37 UTC de 10/09.
- Opcional no produto: **uma linha no Painel Hoje** apontando para Biblioteca / motores — o Painel hoje não denuncia que o `main` mudou. Invasão: um componente, um link. Sem 9º grupo.

### Fatia B — P1 caso e núcleo (maior buraco de ordem)

- Unificação controlada de núcleos fases 2–6 (**#30**): comparar, plano, confirmar, merge atômico, validar. Tabelas: `nucleos_familiares`, `nucleo_membros`. Sem coluna `nucleo_canonico_id` nova se der para evitar.
- Participantes só em `case_members` / `case_dependents` / `nucleo_membros`. Não criar `case_participants`.
- Invasão: alta (lógica de merge + UI de confirmação humana). Dependência: P0 já opera.

### Fatia C — P2 contrato que grava

- Barra do contrato só com ações que persistem (**#35, #40, #53**). Perfil institucional persistido no gate, não valor fixo.
- Invasão: média (rotas de contrato já existem). Depois do P1 para não contratar núcleo errado.

### Fatia D — P3 tarefa depois de salvar

- Após salvar pessoa: criar tarefa / próxima ação / “sem nova ação” (**#32**). Reusar `proxima_acao_prioritaria`, não segunda RPC.
- CRM Vivo restante (**#67**): cadência por evento em `tarefas` / `case_alerts`, sem `cadence_runs`.
- Invasão: média.

### Fatia E — P4 onboarding de verdade

- Um plano por `case_id` (já cria linha). Falta: iniciar → reutilizar → tarefas → primeira micro-entrega (**#75, #81**). Nunca ativar cliente sozinho. Sem `onboarding_runs`.
- Invasão: média-alta (vários escritores já existem desconectados).

### Fatia F — P5 uma pesquisa

- Escritor único no módulo vivo (`research_*`). Dossiê `/pesquisa` só arquivo.
- Invasão: alta (três stores). Fazer por caso (Ana primeiro), não migração global destrutiva.

### Fatia G — P6 App Cliente = projeção

- Cadeia `client_deliverables.case_id` ponta a ponta (**#81**). Continuar 7 abas. Sem Entregas/Fase na nav.
- Invasão: média.

### Fatia H — P7 planejador que escreve (hoje só lê)

- Fases 0–8 **gravam** em `citizenship_tracks`, `case_plans`, `product_catalog` — ainda sem % de elegibilidade e sem preço na trilha (**#61–#63, #79, #82**). Sem `country_catalog`.
- Invasão: alta. Só depois de P1–P5, senão o planejador planeja núcleo/pesquisa errados.

### Fatia I — P8 Discovery

- Card roteiro (**#58**) + cadastro rápido de lead (**#54**) em `leads`. Sem CRM paralelo.
- Invasão: baixa-média.

### Fatia J — P9 cockpit vivo

- Alertas e filas já existem (`case_alerts`, Painel). Falta indicador por grupo sem inventar 6 abas (**#55**). Desk permanece 8 grupos.
- Invasão: média.

### Fatia K — P10 / P11 por último

- P10: integrações reais com confirmação humana (e-mail, cobrança, protocolo). Planta até existir alvo + confirmação.
- P11: revisão visual tela a tela do mockup de 17 páginas **depois** dos motores, não no lugar deles.

---

## 5. O que eu preciso de você (pouca coisa)

1. Homologar **só** em `https://soul-ancestry.vercel.app` (não Lovable).
2. Dizer, depois da Fatia A, se o bloco P0–P11 na Biblioteca está visível para você.
3. Autorizar merge de cada fatia B, C, D… no `main` (senão a Vercel não muda).
4. Não pedir as 50 PRs antigas de uma vez — o prompt-mestre proíbe pular fase.
5. Decisão humana em merge de núcleo, contrato e go-live jurídico (fase 8). Eu não unifico nem assino sozinho.

Não preciso de `service_role`, de tabela nova, nem de acesso ao painel da Vercel para implementar. Preciso que você olhe a URL certa e aprove cada merge.

---

## 6. O que eu faço sozinho na próxima execução

Se você confirmar este plano, a primeira entrega de código é a **Fatia A** (Painel aponta para Biblioteca) + começar **Fatia B** (P1 merge de núcleo 2–6, só com confirmação humana, tabelas atuais).

Não reabrir #30–#84. Abrir PRs novas, uma fatia, base `main`, sem force-push.
