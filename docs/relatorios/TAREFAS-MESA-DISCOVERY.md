# Tarefas — Mesa Discovery (`/calls`)

**Aba / capacidade:** Mesa Discovery (entrada comercial)  
**Última atualização:** 2026-09-11 · fim do dia (agente)  
**Status geral:** código SPIN ok · prova da dona ainda aberta · **não** `COMPROVADO_EM_USO`  
**Rotina:** este quadro é atualizado **todo dia de manhã** e **no fim do dia**.

Legenda rápida: `OK` = funciona com evidência · `PARCIAL` = quase · `TRAVADO` = precisa de você ou de fio · `PAUSADO` = não mexer agora

---

## 1. O que já está funcionando

### Front-end (tela)
- Abrir a mesa em `/calls`
- Abrir um lead e ver o roteiro vivo
- Bloco **SPIN** com 4 checkboxes no **mesmo** fluxo (não em outra tela)
- Contador de progresso SPIN (ex.: 4/4)
- Campos de resultado, responsável, prazo e próxima ação no card
- Mensagem de “registro gravado” após salvar
- Após F5, o SPIN marcado continua na tela (prova local do agente)

### Back-end (gravação)
- Escritor `salvarLeadDesk` grava `spin_situacao`, `spin_problema`, `spin_implicacao`, `spin_necessidade` na tabela `leads`
- Também grava próxima ação / responsável / prazo nos campos já existentes de `leads`
- Testes automáticos do roteiro/painel: suporte técnico ok (não substituem print seu)

### Política / trilha
- Reset de confiança + adendo de prova autenticada arquivados e ligados ao Desk
- Brief do agente Discovery ativo; KPIs e Abas **pausados**
- Conflitos de merge com `main` na PR #102 resolvidos

---

## 2. O que estou fazendo / corrigindo **agora**

| Agora | Detalhe |
|---|---|
| **Esperando sua prova** | Preciso que **você** rode o teste autenticado (prints). Print só do agente **não** fecha a aba. |
| **Não estou** abrindo Pessoa 360, Proposta, Financeiro, App, KPIs ou Abas | Ordem do reset: só Discovery até fechar. |
| **Não estou** inventando tabela nem migration | Fiação usa `leads` + filas Hoje/Comercial já existentes. |
| **Aguardando confirmação de fio** | Se o login no Vercel falhar, a causa mais comum é falta da chave secreta do Supabase **só no servidor** da Vercel (nunca no chat). |

**Próxima ação concreta (uma só):**  
Você grava um lead de teste com **próxima ação com texto único** → F5 → confere se **a mesma frase** aparece em Hoje e em Comercial → manda os prints ou diz `PASSOU` / `FALHOU`.

---

## 3. Próximos passos travados (para a aba ir a 100%)

### A. Prova visual sua (obrigatória)
- [ ] Print inicial (logada, e-mail visível)
- [ ] Print da ação (mesa + lead + SPIN)
- [ ] Print da confirmação (gravar, 4/4)
- [ ] Print da releitura (F5)
- [ ] Print de integração: **mesma** próxima ação em **Hoje** e **Comercial**, sem duplicar
- [ ] Sua declaração explícita: `PASSOU` ou `FALHOU` nessa integração

**Por que trava:** o agente viu “Ana Luiza” em Hoje/Comercial, mas não dá para jurar que é o **mesmo** fato acabado de gravar → status `PARCIAL`.

### B. Fiação Supabase ↔ Vercel (se o login falhar)
- [ ] No Vercel (`soul-ancestry`), Production **e** Preview com:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY` (+ espelho `VITE_*` se usar)
  - `SUPABASE_SERVICE_ROLE_KEY` (**só servidor**, mesmo projeto `zsxpdbhdvbuulwpepemd`)
- [ ] Redeploy depois de salvar as variáveis
- [ ] No Supabase: e-mail/senha ligado; seu usuário ativo; linha `staff_access` admin ativa
- [ ] Se duvidar do fio: abrir `/equipe/diagnostico-conexao`

**Sintoma típico:** tela de login com erro genérico / “configuração do servidor” = falta da chave secreta no servidor (não é bug da mesa em si).

### C. Ambiente de prova
- [ ] Preferir `https://soul-ancestry.vercel.app/equipe/entrar`
- [ ] Se o preview pedir login da Vercel / MFA: entrar logada no browser **ou** usar a URL de produção acima
- [ ] **Não** colar `service_role` no chat, PR ou artefato

### D. Fora do escopo desta aba (pausado de propósito)
- Pessoa 360, Pesquisa, Proposta, Financeiro, App Cliente, KPIs, Abas  
- Cadeia ponta a ponta do produto único  
→ só depois de Discovery = `COMPROVADO_EM_USO` **por você**

---

## 4. Quadro visual do dia

| Peça | Manhã | Fim do dia |
|---|---|---|
| Abrir `/calls` | — | `OK` (código) |
| SPIN 4/4 + gravar + F5 | — | `OK` (agente) · falta **sua** certificação |
| Mesma próxima ação em Hoje/Comercial | — | `PARCIAL` / `TRAVADO` |
| Login Vercel com seu e-mail | — | conferir fio se falhar |
| Contexto de resgate arquivável? | — | **Não** |

---

## 5. Como ler o progresso amanhã

1. Seção **1** cresce só com o que tem print ou comportamento estável.  
2. Seção **2** diz o que o agente está mexendo **hoje** (sem cascata).  
3. Seção **3** lista só o que ainda impede 100% **desta** aba.  
4. Nada sobe para “pronto” sem o seu `PASSOU` autenticado.

```text
REGRA: código / PR / Vitest ≠ feito.
Feito = você logada + print inicial + ação + confirmação + F5 + (se couber) integração.
```
