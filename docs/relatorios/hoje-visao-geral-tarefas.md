# Aba Hoje (Visão Geral) — quadro de tarefas

**Tela:** `/painel` · primeira tela da face do Desk  
**Mockup de referência:** PDF de 17 páginas, página 11  
**Branch:** `cursor/kpis-transversais-seis-abas-5d7b` · [PR #99](https://github.com/tatianatosi/soul-ancestry/pull/99)  
**Última leitura:** 12/09/2026, 08h06 Brasília (manhã)

Este quadro é o acompanhamento diário (manhã e fim do dia).  
Legenda: **feito** = lê e grava no banco, com tela. **Aberto** = ainda falta. **Distorção** = a tela não está igual ao mockup, mesmo com dado.

---

## 1. O que já funciona

### Front-end

- Rota `/painel`, face **Visão Geral** (1ª das 7 telas). Código da tela parado em `ee4ba186`.
- Saudação p. 11: `Visão geral · SETEMBRO 2026` + `Bom dia / Boa tarde / Boa noite, equipe.`
- Quatro cards: **Casos ativos**, **Alertas pendentes**, **Receita do mês**, **Taxa de conversão** — ícone navy, serif, clique na aba dona.
- Funil em um card, quatro células. Tabela **Alertas de achados pendentes** | **Prioridades de hoje**.
- **Prioridade agora** (Ana) no topo; botões só abrem ficha / atendimento / Mesa. Nada dispara WhatsApp sozinho.
- Sem dado: `—` / “Sem dados suficientes”. Não inventa R$ 18.400 nem 34%.
- Login autenticado foi provado em 11/09 com `tati@pluggedresearch.com`. Esta manhã: o preview **ainda no ar** (último deploy ok = `7a140367`); `/painel` ficou `pending` — **sem sessão neste agente**. O commit do relatório de ontem à noite (`7c3254c7`) **não** gerou preview novo (cota Vercel).

### Back-end (mesma fiação)

| O que a tela mostra | Tabela / função real |
|---|---|
| Casos ativos | `crm_casos` |
| Alertas pendentes + tabela de achados | `case_alerts` |
| Receita do mês | `payments` (`confirmado` neste mês) |
| Funil e taxa de conversão | `conversion_events` + `leads` |
| Prioridade agora e fila | filas do Painel + matriz de urgência |
| Próxima ação / “objetivo não declarado” | **planejador** (`case_plans`) |
| Registro da semana | `case_timeline_events` |
| Botão Enviar | abre `/alertas`; a humana confirma |

Cadeia legado → lista-alimento → catálogo → Caso 360 está no código da PR; **não alimenta os KPIs do Hoje**.

---

## 2. O que está em execução ou correção agora

**Nada.** Nenhuma fatia da aba Hoje desbloqueada nesta manhã. Sem “pode contar”, sem `case_id` sintético, sem decisão de religar o funil a `leads`.

---

## 3. O que ainda trava o “100%” desta aba

### Preview

- Cota gratuita Vercel: mais de 100 deploys em 11/09. Reset estimado ~18h Brasília (21h UTC). Até lá, push só atualiza o GitHub; não gera prévia nova.

### Fiação / dado (números de 11/09 — não recontados)

1. Funil 0 se não há `lead_criado` em `conversion_events` (carteira em `crm_casos` não basta).
2. Leads em WhatsApp = 0 sem canal/origem gravado.
3. Receita R$ 0,00 se não há `payments.confirmado` em setembro.
4. Ana: objetivo ainda não declarado em `case_plans`.
5. Tabela de alertas vazia se `case_alerts` sem pendente.

*Da proprietária:* (a) “pode contar” só totais, sem PII; (b) um `case_id` sintético; (c) se o funil deve ler `leads` além de `conversion_events`.  
*Do código, só depois:* backfill/fiação do funil, se autorizar.

### Distorções vs mockup p. 11

6. Hero **Prioridade agora** (Ana) — pedido seu, não está no PDF.
7. Faixas **Só interno** / **App · Home**.
8. Subtítulo do shell: “Painel Hoje — o que precisa de ação hoje…” (`painel.tsx`).
9. Blocos operacionais abaixo da dupla alertas | prioridades.
10. Face: 7 telas. Não voltar a 8 grupos nem 6 abas.

### O que esta aba não deve fazer

- Não usa matriz operacional, planilha mestre, DRE nem Asaas antigo.
- Não cria tabela nova.
- Não mescla nem publica produção sem o seu “pode”.

---

## Como ler o progresso no fim do dia

Releitura no código e, se a cota Vercel tiver resetado e houver sessão, na tela autenticada.  
Muda o carimbo do topo e as três seções. O que não mudou permanece.
