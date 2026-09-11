# Tarefas da aba — Mesa de Discovery

**Aba:** Marketing & Comercial → Mesa de Discovery (`/calls`)  
**Núcleo:** o caso (`crm_casos`) é o eixo; o lead ainda sem caso vive na tabela `leads`.  
**Turno:** 2026-09-11, tarde  
**Quem atualiza:** agente, para a pesquisadora acompanhar.  
**Certificação da dona:** ainda **não**. Merge e print de agente não fecham a aba.

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL
Nenhum contexto desta aba pode ser arquivado enquanto a Mesa não estiver
comprovada no fluxo único do Clube Ancestral.
```

---

## 1. O que já existe e aparece na tela

Ainda **não** é “100% no dia a dia”. Abaixo é o que já tem fio de verdade (tela + gravação no servidor + tabela real).

### Front-end

- A rota `/calls` abre com o título **Mesa de Discovery**.
- Situação → Problema → Implicação → Necessidade são **perguntas**, uma por vez (não são quatro checkboxes).
- Cada card mostra: pergunta, por que importa, campo de resposta, origem do WhatsApp (se houver), destino (“Vai para”).
- Botões **Pergunta anterior** / **Próxima pergunta** e chips das quatro etapas.
- No topo: **Varredura de conversa** (colar dump ou arquivo). O dump **não** é salvo; só o valor que você confirma no campo do lead.
- Em `/leads` o SPIN só espelha progresso (ex.: 1/7) e aponta para a Mesa. Os checkboxes “Situação mapeada” saíram.
- Filas da Mesa: hoje, aguardando registro, qualificação, handoff, sem agenda.

### Back-end

- Leitura e gravação na tabela **`leads`** (`listarLeadsDesk` / `salvarLeadDesk`).
- Ao salvar, as flags `spin_situacao` / `spin_problema` / `spin_implicacao` / `spin_necessidade` **acompanham a resposta**; não dependem de clique avulso.
- Consentimento, handoff e próxima ação usam as regras já existentes do CRM Desk (listas fechadas, sem vocabulário inventado).
- Se o lead já tem `case_id`, o botão de tarefa da próxima ação reusa `salvarTarefa` (não cria escritor novo).

### O que o núcleo exige e esta aba **já respeita**

- Não inventa tabela (`case_participants`, etc.).
- `/calls` permanece a entrada comercial; não foi escondida.
- Planilha mestre / DRE / Asaas legado **não** alimentam esta tela.

---

## 2. O que estou fazendo agora nesta aba

**Nada de correção de código nesta hora.** A Mesa (SPIN como pergunta) já foi mesclada por você na PR #98 (`e3c72a03`).

Neste turno só estou:

1. Escrevendo este quadro de tarefas, em linguagem simples, para você ver o progresso.
2. Deixando a regra de **manhã e fim do dia**: o agente atualiza este arquivo, sem arquivar contexto e sem dizer “pronto” sem o seu print.

Não estou, agora, mexendo em RLS, migration, Pessoa 360, Hoje, nem dossiê.

---

## 3. O que ainda trava o “100%” desta aba

Travas reais, sem eufemismo. Ligadas ao núcleo: tela sem persistência comprovada **não** é funcionalidade; dado precisa seguir a mesma pessoa até o caso.

| # | Trava | Tipo | O que falta para fechar |
|---|---|---|---|
| 1 | Releitura depois de salvar | persistência | Você responder uma pergunta, clicar salvar, dar **F5**, e a resposta continuar no mesmo lead. Isso ainda **não** foi feito no protocolo da dona. |
| 2 | Próxima ação da Mesa no **Hoje** | fiação entre telas | A ação gravada no lead precisa aparecer no Painel Hoje **sem criar segundo registro**. Sem esse print, a aba não conversa com a leitura do dia. |
| 3 | Mesa → **Pessoa 360** | fiação | A resposta da Discovery **não** escreve no perfil da pessoa. Hoje o fio some na ficha 360. |
| 4 | Mesa → **caso / planejador** | fiação | Só vira eixo de caso depois do handoff (`case_id`). Antes disso, vive só em `leads`. Correto para lead; incompleto para o produto único. |
| 5 | Varredura de **dossiê por palavra-chave** | peça inexistente | Não há no `src/` busca de dossiê por pessoa/caso + palavra-chave. WhatsApp da Mesa **não** substitui isso. |
| 6 | Login do agente no Vite local | Supabase | No Cloud Agent, `/equipe/entrar` falha sem `SUPABASE_SERVICE_ROLE_KEY` no **servidor**. A chave **não** vai para chat, git ou print. No preview Vercel a sessão da sua conta **abre**. |
| 7 | Texto repetido no card | distorção visual | “Por que importa” aparece duas vezes no mesmo card. Não quebra gravação; polui a leitura. |
| 8 | 6 grupos no menu vs 8 no núcleo | distorção de regra | O código da Mesa está nos **6** grupos. `.cursor/rules/clube-ancestral-core.mdc` ainda pede **8**. Nenhuma das duas leituras se apaga até você decidir. |

### Fora desta aba, mas a cadeia não fecha sem eles

Pessoa/Dossiê → Caso/Jornada → Pesquisa → Formalização → Financeiro → App Cliente → Hoje/Radar: todos **`NAO_LOCALIZADO`** no registro de prova. A Mesa sozinha não é o produto.

---

## Como ler o próximo turno

- **Manhã:** o agente reabre esta página, marca o que mudou, não apaga o que ainda trava.
- **Fim do dia:** o agente registra o que fez, o que falhou, e o próximo passo **de uma linha**.
- Você só marca a aba como fechada com: print inicial + ação + confirmação + F5 + (quando couber) Hoje.

**Próximo passo de uma linha:** na sua conta, em `/calls`, gravar uma resposta SPIN, dar F5, e conferir se a mesma próxima ação aparece no Hoje — sem pedir senha em chat e sem arquivar esta lista.

**Resultado deste turno:** `NAO_LOCALIZADO` para certificação da dona. Código da Mesa: mesclado. Produto integrado: não.
