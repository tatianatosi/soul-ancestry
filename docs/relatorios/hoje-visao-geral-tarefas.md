# Aba Hoje (Visão Geral) — quadro de tarefas

**Tela:** `/painel` · primeiro grupo do Desk  
**Mockup de referência:** PDF de 17 páginas, página 11  
**Branch:** `cursor/kpis-transversais-seis-abas-5d7b` · [PR #99](https://github.com/tatianatosi/soul-ancestry/pull/99)  
**Última leitura:** 11/09/2026, 11h50 Brasília (fim da fatia visual da p. 11)

Este quadro é o acompanhamento diário (manhã e fim do dia).  
Legenda: **feito** = lê e grava no banco, com tela. **Aberto** = ainda falta. **Distorção** = a tela não está igual ao mockup, mesmo com dado.

---

## 1. O que já funciona

### Front-end (o que você vê)

- Login do Desk e a aba **Hoje** abrem com sessão real (prova no preview com `tati@pluggedresearch.com`).
- Saudação no estilo do mockup: `VISÃO GERAL · SETEMBRO 2026` e `Bom dia / Boa tarde / Boa noite, equipe.`
- Quatro cards: **Casos ativos**, **Alertas pendentes**, **Receita do mês**, **Taxa de conversão** — ícone navy, número em serif, clique abre a aba dona.
- Funil em **um** card, **quatro células**: Novos leads · Leads em WhatsApp · Lead → diagnóstico · Lead → cliente (barras navy, sage, dourado, terracota).
- Tabela **Alertas de achados pendentes** ao lado de **Prioridades de hoje**.
- Card **Prioridade agora** (Ana) no topo, com botões que só abrem ficha / atendimento / Mesa — **nada dispara WhatsApp sozinho**.
- **Registro da semana** lê o que já foi gravado ontem e na semana.
- Abaixo: jornada, fila do dia, exceções, comercial, cadência, “Encontrar no Desk”.
- Sem dado, a tela escreve `—` / “Sem dados suficientes”. Não inventa R$ 18.400 nem 34%.

### Back-end (de onde o número vem)

| O que a tela mostra | Tabela / função real |
|---|---|
| Casos ativos | `crm_casos` |
| Alertas pendentes + tabela de achados | `case_alerts` (mesma leitura de `/alertas`) |
| Receita do mês | `payments` (só status `confirmado` neste mês) |
| Funil e taxa de conversão | `conversion_events` + `leads` |
| Prioridade agora e fila | filas do Painel + matriz de urgência |
| Próxima ação / “objetivo não declarado” | **planejador** (`case_plans`) — única fonte do plano ativo |
| Registro da semana | `case_timeline_events` |
| Botão Enviar | abre `/alertas`; a humana confirma. Não envia mensagem. |

Login, RLS por organização e recarregar a página mostram o persistido. Isso já está no ar no preview da PR.

---

## 2. O que está em execução agora

**Nada em correção de código neste momento.**

Fatia recém-fechada (commit `ee4ba186`): devolver o *layout* da p. 11 (cards, cores, tipografia, funil de 4 células, tabela de alertas). Preview Vercel **Ready**. Testes da fatia verdes. O check **Labeler** do GitHub falha à parte (falta arquivo no `main`) — não é defeito desta aba.

Aguardando você para: merge, e as decisões da seção 3.

---

## 3. O que ainda trava o “100%” desta aba

### Fiação / dado no Supabase (o número não fecha)

1. **Funil zerado com 10 casos na carteira.**  
   Os casos estão em `crm_casos`. O funil só conta evento `lead_criado` em `conversion_events`. Sem esse evento, Novos leads = 0 e a taxa fica “Sem dados”.  
   *Não é bug de tela.* Falta o rastro comercial do lead → caso, ou uma decisão sua de também contar a partir de `leads`.

2. **Leads em WhatsApp = 0.**  
   Só entra quem tem canal/origem gravado como WhatsApp. Se o lead não tem esse campo, a célula fica zero.

3. **Receita R$ 0,00.**  
   A consulta de `payments` respondeu. Não há pagamento `confirmado` em setembro. Zero verdadeiro, não “sem dados”.

4. **Ana: “Objetivo do caso não declarado no planejador.”**  
   O Hoje está honesto: o plano em `case_plans` ainda não tem o objetivo.  
   *Quem desbloqueia:* preencher o planejador do caso (não inventar texto na tela).

5. **Tabela de alertas vazia.**  
   `case_alerts` sem pendente. O botão Enviar só aparece quando houver linha. Correto.

### Distorções visuais vs mockup p. 11

6. Card **Prioridade agora** (Ana) entre a saudação e os KPIs — o PDF não tem esse hero; ficou porque você pediu o caso urgente com botões.
7. Faixas **Só interno** / **App · Home** em cima dos cards (âncora Desk↔App). Não estão no PDF.
8. Título da página ainda diz “Painel Hoje — o que precisa de ação hoje…”.
9. Abaixo do bloco do mockup a aba continua operacional (jornada, fila, exceções…). O PDF para na dupla alertas | prioridades.
10. Menu do Desk nesta branch: **7 telas de face** (mockup) + **6 grupos internos** recolhidos. Decisão da proprietária em 11/09/2026: nem 8 grupos nem 6 abas como barra principal.

### O que esta aba não deve fazer (não é atraso)

- Não usa matriz operacional, planilha mestre, DRE nem Asaas antigo.
- Não cria tabela nova.
- Não mescla nem publica produção sem o seu “pode”.

---

## Como ler o progresso amanhã

Manhã e fim do dia este quadro é relido no código e, se o preview estiver no ar, na tela autenticada.  
Muda o carimbo do topo e as três seções. O que não mudou permanece escrito como está.
