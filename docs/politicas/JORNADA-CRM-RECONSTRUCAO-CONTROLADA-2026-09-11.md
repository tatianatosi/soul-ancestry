# Jornada CRM — revisão e reconstrução controlada

**Data:** 2026-09-11  
**Decisão de trabalho:** a jornada CRM é **essencial** e tem **uma única dona** (proprietária).  
**Não é:** apagar o Desk e refazer do zero nesta semana.  
**É:** revisar o que existe, cortar duplicidade de uso, e reconstruir a **espinha** lead → próxima ação → handoff como um só caminho.

---

## 1. Por que é necessário revisar / reconstruir

| Achado | Efeito na dona |
|---|---|
| Lead nasce em `/leads`; Mesa `/calls` não cria | Quebra a entrada: “não tem onde criar na mesa” |
| SPIN virou 19 forms eternos | Cansaço; docs ainda falam em 4 checkboxes |
| Dicionários / CRM Mestre / Conversão / Próximas ações | Parecem “outro sistema”; na verdade leem a mesma `leads` |
| Dezenas de prompts antigos | Ruído: parece que falta ferramenta; falta **caminho único** |
| Uma pessoa cuida da jornada | Qualquer fragmentação multiplica o trabalho dela |

Conclusão: **sim, precisa revisar e reconstruir a jornada**.  
Não como 10 projetos paralelos. Como **um único fio** sob a dona.

---

## 2. Dona e regra de autoridade

- **Dona da jornada CRM:** proprietária (Tatiana).  
- Agentes só executam fatias que ela autorizar, com prova autenticada.  
- Planejador / caso continuam eixo do produto; a jornada comercial **alimenta** o caso — não cria segundo CRM.  
- Tabela canônica de entrada: **`leads`**. Sem tabela nova “crm_journey”.

---

## 3. Espinha a reconstruir (ordem fixa)

```text
1. Criar lead (mesmo lugar em que se atende)
2. Mesa Discovery (perguntas úteis, não form eterno)
3. Próxima ação + responsável + prazo (um fato)
4. Ver o mesmo fato em Hoje e em Comercial (sem digitar de novo)
5. Handoff revisável → Pessoa/Caso (só depois de 1–4 comprovados)
```

Tudo que não estiver nesta espinha fica **fora do caminho diário** (Governança / leitura / legado), até a dona liberar.

---

## 4. O que NÃO fazer nesta reconstrução

- Não redesenhar o menu inteiro do Desk  
- Não fundir KPIs / Abas / App nesta fatia  
- Não inventar migration / tabela / segundo motor  
- Não “apagar dicionários” — reclassificar: **norma** vs **operação**  
- Não declarar pronto sem print da dona  

---

## 5. Fases (uma de cada vez)

| Fase | Nome | Critério de fechamento (dona) |
|---|---|---|
| **A** | Entrada única | Criar lead **a partir da Mesa** (atalho = mesmo `criarLeadManual`) + F5 |
| **B** | Discovery utilizável | Roteiro gravável + releitura; sem divergência falsa de data; prova SPIN/próxima ação |
| **C** | Um fato, três lugares | Mesma próxima ação em Mesa → Hoje → Comercial/Próximas ações |
| **D** | Handoff | Só diagnóstico → materializar Pessoa/Caso quando A–C = `PASSOU` |
| **E** | Limpeza de ruído | Docs/prompts desatualizados rotulados; dicionários só como leitura |

Fase atual do reset: **ainda em A/B** (Discovery). C está `PARCIAL`.

---

## 6. Papel do agente vs papel da dona

| Dona | Agente |
|---|---|
| Decide a ordem e o aceite | Executa uma fase por vez |
| Faz a prova autenticada (prints) | Corrige fio mínimo (botão, data, copy) |
| Diz o que sai do caminho diário | Atualiza quadro `TAREFAS-MESA-DISCOVERY.md` |
| Única a declarar `COMPROVADO_EM_USO` | Nunca arquiva contexto sem isso |

---

## 7. Próximo passo concreto (aguardar autorização)

Se a dona disser **sim, começar a reconstrução da espinha**:

1. Colocar **Novo lead** na Mesa `/calls` (mesmo diálogo de `/leads`).  
2. Corrigir `DIVERGENCIA_PERSISTENCIA` de `call_realizada_em`.  
3. Atualizar copy: “primeiro crie o lead aqui / ou abra um existente”.  
4. Ela prova com prints (criar → SPIN/ação → F5 → Hoje/Comercial).

Sem essa autorização, o agente **não** abre redesign amplo.
