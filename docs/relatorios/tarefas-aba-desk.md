# Quadro de tarefas — aba Desk (6 grupos)

**Aba:** onde cada função vive (Hoje · Comercial · Casos · Inteligência · Formalização · Governança)  
**PR:** [#100](https://github.com/tatianatosi/soul-ancestry/pull/100) · branch `cursor/guia-abas-desk-simplificado-5d7b`  
**Atualizado:** 11/09/2026, fim do dia (21h UTC)  
**Prova:** login `tati@pluggedresearch.com` no preview desta branch (senha fora deste arquivo)  
**Preview:** https://soul-ancestry-git-cursor-guia-abas-d-46a710-tati-6134s-projects.vercel.app

Como ler: **ok** = já usa; **agora** = em cima disto; **travado** = ainda não fecha.

---

## 1. O que já funciona

### Front-end (visto de novo hoje à noite, com o seu login)

- As **6 abas** estão na barra esquerda, sem se misturar: Hoje, Marketing & Comercial, Pessoas & Casos, Inteligência & Pesquisa, Formalização & Financeiro, Governança & Administração.
- **Hoje** (`/painel`) abre. Faixa dourada: Calls no Comercial; Catálogo 30 em **Governança**, rotulado como legado, até o pente fino. Não diz mais “no arquivo”.
- **Encontrar no Desk** continua como item do Hoje. Mesa de Discovery mora em Comercial (`/calls`).
- **Governança** ainda tem o grupo **Legado (fora da operação diária)** no menu: Catálogo 30, homologação SKU, conciliação, divergências, origem do escopo. Nada foi tirado.
- Conta visível: `tati@pluggedresearch.com` · Clube Ancestral · Admin.
- Números do Hoje leram casos (10 ativos, 3 exceções, caso Ana Luiza em destaque).

### Back-end (já existente; esta aba não inventou tabela)

- Login e papéis: Supabase Auth + confirmação de sessão da equipe (o preview autenticou).
- Painel Hoje lê casos, alertas, leads e exceções de tabelas reais (`crm_casos`, `leads`, alertas).
- Calls grava no CRM vivo. CA-04 / dicionário continuam no Comercial.
- Catálogo 30 e conciliação existem no banco e nas rotas; nesta aba só mudaram de lugar no menu.
- Planejador e caso (`case_plans`, `crm_casos`) não foram mexidos nesta aba.

---

## 2. O que você fez nesta aba hoje e o que ainda está em cima

**Feito hoje nesta aba**

- Quadro de tarefas criado (manhã/tarde) para acompanhar de manhã e à noite.
- Texto do Hoje alinhado: Catálogo 30 fica em Governança agora; GitHub só no pente fino. Confirmado de novo no print das 21h.
- Legado **mantido no menu** de Governança. Não saiu do Desk.

**Ainda em cima (esta aba)**

- Esperar a sua ordem para o merge do **#100**. Produção continua o Desk antigo.
- Não misturar aqui os PRs #97 (tira legado do menu) e #98 (SPIN da Mesa).

Não estou, nesta aba: criando tabela, mesclando produção, apagando rota, nem tirando o legado do menu.

---

## 3. Travado / para o próximo dia

| Item | Tipo | O que falta |
|---|---|---|
| Esta aba no `main` | merge | O preview prova. Produção espera a sua autorização do #100. |
| Login `/equipe/entrar` | distorção | A tela de senha ainda diz que Catálogo 30 fica “na conta, embaixo”. O menu e o Hoje já dizem Governança. |
| Mesa SPIN (perguntas, uma a uma) | outro PR | Código no **#98**, não neste. Nesta aba o Calls abre. |
| KPIs vivos do recorte #97 | outro PR | O Hoje já tem números. O #97 tira legado do menu — fica de fora até o pente fino. |
| Números do Hoje → aba dona | fiação | `grupoDonoDaRota` existe. Os cartões ainda não usam essa função em todo atalho. Sem tabela nova. |
| Calls → Pessoa 360 | fiação | A call grava o **lead**. Não devolve sozinha para a ficha da pessoa. Dívida antiga. |
| Pente fino → GitHub | espera a sua ordem | Lista pronta: `ROTAS_LEGADO_MENU_GOVERNANCA`. Só sai do menu quando você pedir. |
| Regra “8 grupos” vs Desk de 6 | distorção de documento | Código e preview desta aba: **6** grupos. `clube-ancestral-core.mdc` ainda fala em 8. Não reescrevo a memória permanente sem você. |
| Deploy Vercel de hoje à noite | limite da conta | Plano Hobby passou de 100 deploys no dia. Este preview **já existente** (17h) continua no ar; um commit só de texto não ganha preview novo até o limite resetar. |

Nenhum erro novo de Supabase nesta aba: sem migration, RPC nova ou quebra de RLS. O que trava é **lugar no menu**, **PRs separados** e **merge**.

---

## 4. Ritmo

Este quadro atualiza **de manhã** e **no fim do dia**.  
Prova visual: print com o seu login no preview da branch, nunca senha no GitHub.
