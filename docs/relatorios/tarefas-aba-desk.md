# Quadro de tarefas — aba Desk (6 grupos)

**Aba:** onde cada função vive (Hoje · Comercial · Casos · Inteligência · Formalização · Governança)  
**PR desta manhã:** [#121](https://github.com/tatianatosi/soul-ancestry/pull/121) · branch `cursor/legado-arquivo-github-0ed5`  
**O #100** já está no `main`.  
**Atualizado:** 12/09/2026, manhã (~11h UTC)  
**Prova:** login `tati@pluggedresearch.com` no preview da #121 (senha fora deste arquivo)  
**Preview:** https://soul-ancestry-git-cursor-legado-arqu-a0d02e-tati-6134s-projects.vercel.app

Como ler: **ok** = já usa; **agora** = em cima disto; **travado** = ainda não fecha.

---

## 1. O que já funciona

### Front-end (visto de novo esta manhã, com o seu login)

- As **6 abas** estão na barra esquerda: Hoje, Marketing & Comercial, Pessoas & Casos, Inteligência & Pesquisa, Formalização & Financeiro, Governança & Administração.
- **Hoje** (`/painel`) abre autenticado.
- **Governança** **não** tem mais o grupo Legado. Configurações, equipe, etiquetas, integrações, importações, métricas e privacidade continuam. Confirmado no print e de novo após F5.
- **Formalização** mostra Catálogo homologado e financeiro. Sem conciliação, homologação de SKU nem origem do escopo no menu.
- Login `/equipe/entrar` já diz: catálogo legado saiu do menu — arquivo só no GitHub.
- URL direta `/governanca/catalogo-operacional-30` ainda abre (nada apagado). O menu não aponta para ela.

### Back-end (já existente; esta aba não inventou tabela)

- Login e papéis: Supabase Auth. O preview autenticou.
- Painel Hoje lê casos, alertas, leads e exceções.
- Catálogo vivo: `/catalogo` (`product_catalog`). Cópia do legado em `archive/github/2026-09-10-legado-catalogo-desk/`.
- Planejador e caso (`case_plans`, `crm_casos`) não foram mexidos nesta aba.

---

## 2. O que você está fazendo agora nesta aba

**Pedido seu:** “Tudo que é legado deve ir para o GitHub conforme a PR 97” e, em seguida, “Prepare os prints de aprovação”.

**Feito nesta manhã**

- Opção B da #97 nesta branch: as 5 rotas saíram do menu. Rotas e tabelas permanecem.
- Prints autenticados (agente, não certificação sua) em `docs/relatorios/provas/2026-09-12-legado-arquivo-github/`.
- Esta PR **não** mistura o extra da #97 (tirar o card “Sem responsável”).

**Ainda em cima**

- Você conferir os prints e dizer se pode mesclar a #121 (branch + SHA + se dispara produção).
- A certificação `COMPROVADO_EM_USO` só vale quando **você** clicar: inicial, ação, confirmação, F5, integração.

O timer da manhã ainda dizia “não tire o legado do menu”. Esse texto é anterior. A ordem mais recente foi arquivar no GitHub.

---

## 3. Travado

| Item | Tipo | O que falta |
|---|---|---|
| Merge da #121 | espera a sua ordem | Rascunho. Sem merge/deploy de produção sem você. |
| Certificação da dona | prova | Prints do agente prontos. Falta o seu protocolo. |
| Card “Sem responsável” no Hoje | outro PR | Continua no Painel desta preview. A #97 queria tirá-lo; esta fatia não mexeu nisso. |
| Calls → Pessoa 360 | fiação | A call grava o lead. Não devolve sozinha para a ficha da pessoa. |
| Números do Hoje → aba dona | fiação | `grupoDonoDaRota` existe. Nem todo cartão usa. Sem tabela nova. |
| Regra “8 grupos” vs Desk de 6 | distorção de documento | Preview e código desta aba: **6** grupos. `clube-ancestral-core.mdc` ainda fala em 8. |

Nenhum erro novo de Supabase nesta aba: sem migration, RPC nova ou quebra de RLS.

---

## 4. Ritmo

Este quadro atualiza **de manhã** e **no fim do dia**.  
Prova visual: print com o seu login no preview da branch, nunca senha no GitHub.
