# Quadro de tarefas — aba Desk (6 grupos)

**Aba:** onde cada função vive (Hoje · Comercial · Casos · Inteligência · Formalização · Governança)  
**PR:** [#100](https://github.com/tatianatosi/soul-ancestry/pull/100) · branch `cursor/guia-abas-desk-simplificado-5d7b`  
**Atualizado:** 11/09/2026, tarde (BRT)  
**Prova:** login `tati@pluggedresearch.com` no preview (senha fora deste arquivo)

Como ler: **ok** = já usa; **agora** = em cima disto; **travado** = ainda não fecha.

---

## 1. O que já funciona

### Front-end (visto no preview com o seu login)

- As **6 abas** aparecem na barra esquerda e não se misturam.
- **Hoje** (`/painel`) abre e diz: o que está parado, vencido ou pede decisão.
- **Encontrar no Desk** tem o atalho **Mesa de Discovery**.
- **Calls** (`/calls`) abre como entrada comercial, dentro de Marketing & Comercial.
- **Governança** mostra o grupo **Legado (fora da operação diária)** com Catálogo 30, homologação SKU, conciliação, divergências e origem do escopo — rotulados. Nada foi apagado.
- **Privacidade** saiu da Inteligência e está em Governança.
- Login da equipe funciona (`/equipe/entrar` → Desk).

### Back-end (já existente; esta aba não inventou tabela)

- Login e papéis passam pelo Supabase Auth + confirmação de sessão da equipe.
- Painel Hoje lê casos, alertas, leads e exceções de tabelas reais (`crm_casos`, `leads`, alertas).
- Calls grava no CRM vivo (`leads` + Painel de Calls). CA-04 / dicionário continuam no Comercial.
- Catálogo 30, conciliação e homologação **existem** no banco e nas rotas; só mudaram de lugar no menu.
- Planejador e caso (`case_plans`, `crm_casos`) não foram mexidos nesta aba.

---

## 2. O que estou fazendo agora

- Quadro de tarefas desta aba, para você acompanhar de manhã e à noite.
- Corrigir o texto dourado do Hoje que ainda dizia “Catálogo 30 no arquivo” — a sua decisão é: **fica em Governança agora; GitHub só no pente fino**.
- Manter o legado **no menu** até você pedir o pente fino. Não vou tirar do Desk nesta rodada.

Não estou, nesta aba: criando tabela, mesclando produção, apagando rota, nem juntando os PRs #97 e #98 aqui.

---

## 3. Travado / ainda não está 100%

| Item | Tipo | O que falta |
|---|---|---|
| Esta aba no `main` | merge | O preview prova. Produção ainda é o Desk antigo até você autorizar o merge do #100. |
| Texto “no arquivo” no Hoje | distorção | O menu já mostra legado em Governança; a faixa dourada mentia. Correção nesta atualização. |
| Mesa SPIN (perguntas, uma a uma) | outro PR | Código está no **#98**, não neste. Nesta aba o Calls abre; o roteiro SPIN novo ainda não está no `main`. |
| KPIs vivos refinados (vencidos / sem dono com o recorte do #97) | outro PR | O Hoje já tem números. O recorte fino do **#97** não entra junto, porque ele **tira o legado do menu** — e você mandou deixar em Governança. |
| Números do Hoje → aba dona | fiação | `grupoDonoDaRota` existe no menu. Os cartões do Hoje ainda não usam essa função para apontar sempre a aba dona. Sem tabela nova. |
| Calls → Pessoa 360 | fiação | A call grava o **lead**. Não devolve sozinha para a ficha da pessoa. Dívida antiga, não desta aba. |
| Pente fino → GitHub | espera a sua ordem | Lista pronta: `ROTAS_LEGADO_MENU_GOVERNANCA`. Só sai do menu quando você pedir o pente fino. |
| Regra “8 grupos” vs Desk de 6 | distorção de documento | O código e o preview têm **6** grupos (decisão já usada). O arquivo `clube-ancestral-core.mdc` ainda fala em 8. Não vou reescrever a memória permanente sem você. |

Nenhum erro novo de Supabase nesta aba: não houve migration, RPC nova nem quebra de RLS. O que trava é **lugar no menu**, **PRs separados** e **merge**.

---

## 4. Ritmo

Este quadro atualiza **de manhã** e **no fim do dia**.  
Prova visual: print com o seu login no preview da branch, nunca senha no GitHub.
