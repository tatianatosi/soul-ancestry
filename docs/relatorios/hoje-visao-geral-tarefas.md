# Aba Hoje (Visão Geral) — quadro de tarefas

**Tela:** `/painel` · primeira tela da face do Desk  
**Mockup de referência:** PDF de 17 páginas, página 11  
**Branch:** `cursor/kpis-transversais-seis-abas-5d7b` · [PR #99](https://github.com/tatianatosi/soul-ancestry/pull/99)  
**Última leitura:** 11/09/2026, 18h05 Brasília (fim do dia)

Este quadro é o acompanhamento diário (manhã e fim do dia).  
Legenda: **feito** = lê e grava no banco, com tela. **Aberto** = ainda falta. **Distorção** = a tela não está igual ao mockup, mesmo com dado.

---

## 1. O que já funciona

### O que mudou desde a manhã (11h50)

- Face do Desk no ar: **Visão Geral** continua a primeira das 7 telas (`/painel`). Os 6 grupos internos só no submenu. Commit `7e42a9d3`.
- A cadeia legado → lista-alimento → catálogo → Caso 360 foi persistida (commits `5cd9b486`, `7a140367`). Não altera os números do Hoje; trava a origem do produto-pai/fase na ficha do caso.
- CI do HEAD `7a140367` verde (incluindo Labeler). Preview Vercel Ready.

### Front-end (permanece)

- Login do Desk e a aba **Hoje** abrem com sessão real (prova da manhã com `tati@pluggedresearch.com`). Fim do dia: preview responde em `/painel`, mas a rota autenticada ficou `pending` — **não reabri a sessão**.
- Saudação no estilo do mockup: `Visão geral · SETEMBRO 2026` e `Bom dia / Boa tarde / Boa noite, equipe.`
- Quatro cards: **Casos ativos**, **Alertas pendentes**, **Receita do mês**, **Taxa de conversão** — ícone navy, número em serif, clique abre a aba dona.
- Funil em **um** card, **quatro células**: Novos leads · Leads em WhatsApp · Lead → diagnóstico · Lead → cliente.
- Tabela **Alertas de achados pendentes** ao lado de **Prioridades de hoje**.
- Card **Prioridade agora** (Ana) no topo; botões só abrem ficha / atendimento / Mesa — **nada dispara WhatsApp sozinho**.
- **Registro da semana** lê o gravado. Sem dado: `—` / “Sem dados suficientes”. Não inventa R$ 18.400 nem 34%.

### Back-end (permanece — mesma fiação)

| O que a tela mostra | Tabela / função real |
|---|---|
| Casos ativos | `crm_casos` |
| Alertas pendentes + tabela de achados | `case_alerts` |
| Receita do mês | `payments` (status `confirmado` neste mês) |
| Funil e taxa de conversão | `conversion_events` + `leads` |
| Prioridade agora e fila | filas do Painel + matriz de urgência |
| Próxima ação / “objetivo não declarado” | **planejador** (`case_plans`) |
| Registro da semana | `case_timeline_events` |
| Botão Enviar | abre `/alertas`; a humana confirma |

Código do `/painel` (`painel-dia.tsx`, `visao-geral-topo.tsx`) **não mudou** depois do commit `ee4ba186`.

---

## 2. O que foi tentado hoje e o resultado

| Tentativa | Resultado |
|---|---|
| Devolver layout da p. 11 (cards, funil 4 células, tabela) | **Fechou** (`ee4ba186`). |
| Quadro diário deste arquivo | **Fechou** de manhã (`c730ef4f`); atualizado agora no fim do dia. |
| Face 7 telas / 6 internos | **Fechou** (`7e42a9d3`). Visão Geral segue `/painel`. |
| Cadeia legado → Caso 360 | **Fechou** no código + CI. Prova autenticada da ficha **segue**. |
| Religar funil a `leads` / backfill `lead_criado` | **Não tentado** — espera decisão sua. |
| Contagem só-leitura no Supabase (lista-alimento, planos, pagamentos) | **Segue.** Pedi “pode contar” + case_id sintético; ainda sem resposta. Sem isso não atualizo os zeros da manhã. |
| Reabrir `/painel` autenticada no fim do dia | **Não feita.** Preview no ar; sem sessão neste agente. |
| Merge / produção | **Não.** Sem o seu “pode”. |

Labeler no HEAD passou. Não tratar Labeler como bug desta aba.

---

## 3. O que ainda trava o “100%” desta aba

### Fiação / dado no Supabase (números da manhã — não recontados)

1. **Funil zerado com carteira em `crm_casos`.** Só conta `lead_criado` em `conversion_events`. Falta rastro comercial ou decisão de contar também a partir de `leads`.
2. **Leads em WhatsApp = 0** se o canal/origem não está gravado.
3. **Receita R$ 0,00** se não há `payments.confirmado` em setembro — zero verdadeiro.
4. **Ana: “Objetivo do caso não declarado no planejador.”** Preencher `case_plans`, não inventar na tela.
5. **Tabela de alertas vazia** se `case_alerts` não tem pendente. Botão Enviar só com linha.

*Da proprietária:* (a) “pode contar” só totais, sem PII; (b) um `case_id` sintético; (c) se o funil deve passar a ler `leads` além de `conversion_events`.  
*Do código, só depois disso:* backfill/fiação do funil, se você autorizar.

### Distorções visuais vs mockup p. 11 (iguais à manhã)

6. Card **Prioridade agora** (Ana) entre saudação e KPIs — você pediu o caso urgente.
7. Faixas **Só interno** / **App · Home** nos cards.
8. Descrição do shell ainda: “Painel Hoje — o que precisa de ação hoje…” (`painel.tsx`).
9. Abaixo do bloco p. 11 a aba continua operacional (jornada, fila, exceções…).
10. Face: 7 telas. Não voltar a 8 grupos nem 6 abas.

### O que esta aba não deve fazer

- Não usa matriz operacional, planilha mestre, DRE nem Asaas antigo.
- Não cria tabela nova.
- Não mescla nem publica produção sem o seu “pode”.

---

## Como ler o progresso amanhã

Manhã e fim do dia este quadro é relido no código e, se houver sessão, na tela autenticada.  
Muda o carimbo do topo e as três seções. O que não mudou permanece escrito como está.
