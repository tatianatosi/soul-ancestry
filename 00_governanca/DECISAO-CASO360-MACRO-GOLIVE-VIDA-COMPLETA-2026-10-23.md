# Decisão e plano: Caso 360 (macro) × GoLive (vida completa do cliente)

Data: 2026-10-23
Decisão da Proprietária (23/10):
- **Caso 360** é a **visão macro**: cards que resumem **toda a vida do cliente**, do lead ao App.
- **GoLive** é a **vida do cliente por completo**: cada etapa em detalhe, para **cada cliente**.
- O GoLive **não pode ficar centralizado dentro do Caso 360**. Ele precisa de **lugar próprio** no Desk.

Isso substitui:
- a leitura de 13/10 de que o Caso 360 é a ficha guiada de 4 lotes;
- a Fase 6 do plano de 07/10 (absorver o GoLive nas telas V4).

---

## 1. O que está errado hoje (conferido no código publicado)

### 1.1 GoLive
- Abre só o caso da Ana Luiza. Nenhuma das 19 telas recebe o caso escolhido.
- Todas as gravações (leads, propostas, contrato, OS, microentregas, faturas, núcleo, próxima ação) estão **fixas no caso-piloto** (`golive-escritores.functions.ts` → `contexto()` → `CODIGO_CASO_GO_LIVE`).
- Ele não tem lugar no menu: só se chega lá pelos 7 links da Hoje, que sempre abrem a Ana.

### 1.2 Caso 360 (`/casos/$caseId`)
- É uma ficha longa: 8 seções, Visão Concreta e os 4 lotes do GoLive embutidos.
- Tem **6 blocos recolhidos**.
- Não é um conjunto de cards-resumo com saída para o detalhe.

### 1.3 Contrato: a revisão de uma hora em cards
- Os **5 cartões de formalização** (orçamento de 10/10/20/15/5 min, decisão de 09/10) existem (`components/contrato/cartoes-formalizacao.tsx`).
- Só aparecem em **duas telas escondidas**: `/casos/$caseId/contrato/preparar` (três cliques a partir do Caso 360) e `/golive/formalizacao` (só a Ana).
- **A tela de contrato do menu (`/contratos/$id`) não mostra os cartões.** Por isso "nada mudou no contrato".

### 1.4 Mesa de Discovery / Painel de Calls (`/calls`)
- A tela tem **duas versões empilhadas**:
  - em cima, a casca V4 (Mesa de Discovery, Agenda do dia, Consentimento e gravação, Roteiro SPIN e diagnóstico, Revisão da conversa);
  - embaixo, o painel antigo inteiro (`painel-calls.tsx`, 1.304 linhas: Mesa de Discovery de novo, Preparação pré-call, Registro da call, Bloqueios do registro, Bloqueios da qualificação, Síntese, Decisão e handoff, Bloqueios do handoff, Regras CA-04).
- O título "Mesa de Discovery" aparece **4 vezes**. O resultado é a página de rolagem infinita.

### 1.5 Alimentos que foram ignorados de novo
Estão aprovados em `docs/arquitetura/especificacao-skills-varredura-discovery-multipais.md` (11/10) e no CA-04, mas **não estão ligados** à Mesa de Discovery:

| Alimento aprovado | Na tela hoje |
|---|---|
| Brief pré-call gerado pela skill `ca-client-go-live` (varredura do WhatsApp/e-mail) | Só um texto livre de "pré-call" |
| Checklist documental **por país** (11 países; Áustria §58c no caso da Ana) | **Ausente** (0 ocorrências) |
| Dossiê-Mãe (pastas 00–03) | **Ausente** |
| Roteiro Discovery de 15 min (SPIN) | Presente, mas repetido em duas versões |
| Dicionário CA-04 (CRM Mestre como alimento) | No fim da página, como "regras que informam" |
| Transcrição e gravação da call | Só menções, sem lugar fixo |

---

## 2. Arquitetura-alvo

```
DESK V4
├─ Hoje ........................ macro do dia (todos os casos)
├─ Casos
│   ├─ Todos os casos .......... lista (macro da carteira)
│   └─ Caso 360 ................ CARDS-RESUMO da vida de UM cliente
│        Lead/Discovery · Pessoa & Família · Pesquisa · Contrato ·
│        Financeiro · Entregas · App Cliente · Próxima ação
│        └─ cada card tem "Abrir no GoLive" → aba correspondente
└─ GoLive (lugar próprio) ....... VIDA COMPLETA do cliente escolhido
     seletor de cliente no topo (?casoId=)
     abas: Painel · Leads · Comercial · Pessoas · Pessoa · Caso ·
           Kanban · Pesquisa · Microentregas · Aprovações ·
           Formalização · Jurídico · Financeiro · Radar · Prontidão ·
           Portal · App · Configurações
```

Regras:
- O Caso 360 só **resume** e aponta. Nenhum formulário longo, nenhum bloco recolhido.
- O GoLive é onde se **trabalha**: tudo do cliente escolhido, e as gravações vão para o caso escolhido.
- Uma tela por assunto. Sem versão nova em cima e antiga embaixo.

---

## 3. Plano de execução (uma PR por fase; merge e Publish só com autorização)

| Fase | Entrega | Critério de aceite |
|---|---|---|
| **G1: GoLive por cliente** | As 19 telas recebem `?casoId=`; `contexto()` grava no caso escolhido, validando a organização (sem caso escolhido, abre a Ana, como hoje); seletor de cliente no topo; o GoLive ganha lugar no menu | Teste: uma gravação no caso X nunca cai no caso da Ana. Leitura e gravação do mesmo caso. |
| **G2: Caso 360 em cards** | `/casos/$caseId` vira 8 cards-resumo com contagem real e o botão "Abrir no GoLive"; saem os 6 recolhidos (o conteúdo vai para a aba GoLive correspondente) | Nada do que existia some: cada bloco antigo tem um destino no GoLive. |
| **G3: Contrato em cards** | Os 5 cartões da revisão de uma hora no topo de `/contratos/$id`; o que fica abaixo vira consulta, não formulário | Os 5 cartões aparecem na tela do menu e gravam (`marcarItemFormalizacao`). |
| **G4: Mesa de Discovery sem rolagem infinita** | Uma versão só, em 4 momentos com abas ou passos: **Antes** (Brief da skill, dump do WhatsApp, Dossiê-Mãe), **Durante** (consentimento, roteiro SPIN de 15 min, checklist do país), **Depois** (síntese, transcrição), **Decisão e handoff**; o CA-04 ao lado, como apoio | "Mesa de Discovery" aparece uma vez; cada momento cabe numa tela; os editores e as gravações atuais continuam montados (regra do `AGENTS.md`). |
| **G5: Inventário de alimentos** | Lista de todo documento aprovado como "alimento" × onde ele aparece no Desk; ligar os que faltam | Nenhum alimento aprovado fica sem lugar. |

Pré-requisito: registrar esta decisão no GitHub e atualizar o `AGENTS.md`, porque ela revoga as regras de 13/10 (Caso 360 = 4 lotes) e de 19/10 (`golive-*` intocados).
