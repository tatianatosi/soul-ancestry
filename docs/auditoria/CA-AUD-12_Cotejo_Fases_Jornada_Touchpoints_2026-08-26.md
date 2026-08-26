# CA-AUD-12 — Cotejo: fases, jornada e touchpoints

**Data:** 26/08/2026 · **Pedido:** "um dash que consegue acompanhar cada fase e que os
touchpoints e jornada estão em todos os momentos" · **Ressalva da Proprietária:**
"uma boa parte ali é arcabouço".

Este documento separa três coisas que hoje estão misturadas: **o que já existe em
código**, **o que está quebrado**, e **o que nos mockups é decoração sem fonte**.
Nada foi construído a partir dele ainda — a ressalva sobre arcabouço é justamente
o motivo de cotejar antes.

## Material lido

| Documento | O que é | Peso |
|---|---|---|
| `fluxojornadaclubeancestral.docx` | 9 etapas WhatsApp → App → Desk, com coluna **"Onde unifica"** | **Normativo.** É o desenho que ela descreve |
| `Clube_Ancestral_Estudo_UXUI_e_Prontidao_Deploy.docx` (23/08) | Auditoria de prontidão, DH-001…DH-010 | Normativo |
| `clubeancestralbasesrepositoriosintelligencedeskfase01_2.xlsx` | 21 repositórios, 102 bases italianas, 13 países, contrato de campos | **Dado real, carregável** |
| `clubeancestralintelligencedeskfinal.html` | Mockup do Desk, "Fase 01" | Misto |
| `appclientefases.html` | Mockup App Cliente + Desk lado a lado | Misto |
| `O_mapeamento_e_muito_forte…pdf` | Taxonomia M1–M6, "integração invisível, evidência explicável" | Normativo |

## 1. O que já existe (não é arcabouço)

1. **Oito fases canônicas com rótulo de cliente pareado.** `onboarding-jornada.ts`
   → `FASES_JORNADA` traz, por fase, `rotulo` (interno) **e** `cliente` (o que o
   cliente lê). É exatamente a coluna "Onde unifica" do fluxo — já como dado, não
   como intenção.
2. **Touchpoint é elo formal da cadeia, não enfeite.** `cadeia-jornada-visao.ts`
   modela 11 elos: `evento_ou_fase → regra_de_jornada → tarefa+responsável+prazo →
   template → rascunho/microentrega → revisão humana → publicação/fila →
   **touchpoint/entrega** → cadência recalculada → alerta derivado → Painel Hoje`.
3. **`dias_sem_touchpoint` é campo calculado de verdade**, com as filas D10
   (atenção) e D14 (crítico) já derivadas dele.
4. **"Caso em destaque" com barra de progresso e linha do tempo** já está no Painel
   (commit `a18e5b3`) — e o mockup `clubeancestralintelligencedeskfinal.html`
   contém o mesmo bloco, com a mesma leitura. Convergiram sem se copiar.
5. **`/fontes-genealogicas`** já existe como módulo governado, com estágios de
   maturidade e trava de "fonte sem verificação não sustenta decisão".

## 2. O que está quebrado (achados desta auditoria)

### 2.1 CRÍTICO — quatro vocabulários de fase, nenhuma fonte única

| Arquivo | IDs | Onde grava |
|---|---|---|
| `derivacao-jornada.ts` | `triagem_inicial` … `entrega_e_acompanhamento` (pré-venda) | — |
| `jornada-cliente.ts` | `aceite_formalizacao`, `pesquisa_validacao`, `protocolo_acompanhamento` | rótulos de tela |
| `onboarding-jornada.ts` | `aceite_e_formalizacao`, `pesquisa_e_validacao`, `protocolo_e_acompanhamento` | **grava em `case_plans.fase_jornada`** |
| `relatorios-fase.ts` | `fase_1_diagnostico`, `fase_2_pesquisa`, … | grava em `case_reports.fase_jornada` |

As linhas 2 e 3 são **a mesma jornada com IDs diferentes** — sobram/faltam `_e_`.
Quem grava é a 3; quem rotula na tela é a 2. E `case_plans.fase_jornada` é
`string` livre no banco: **nada impede a divergência**.

Consequência concreta: em `painel-top30.tsx:133` a lista "Casos por fase da
jornada" imprime `{f.fase}` cru — a Proprietária lê `aceite_e_formalizacao — 3`,
não "Aceite e formalização — 3".

### 2.2 ALTO — duas telas dizem "casos por fase" a partir de campos diferentes

| Tela | Componente | Campo de origem | Rótulo |
|---|---|---|---|
| `/ops` | `MetricasJornada` | `crm_casos.fase` | via `ROTULO_FASE` (jornada-cliente) |
| `/contratos` | `PainelTop30` | `case_plans.fase_jornada` | **nenhum — ID cru** |

É a mesma classe de defeito que ela já pegou no bloco Comercial: **dois números
sob o mesmo rótulo, em telas diferentes, sem nada dizendo que são coisas
distintas.**

### 2.3 ALTO — o dash de fase que ela quer existe, mas está arquivado no lugar errado

`PainelTop30` é a coisa mais próxima do "dash que acompanha cada fase": casos por
fase, dias sem touchpoint, filas D10/D14, pendências por responsável, casos sem
plano, casos sem próxima microentrega. **Está dentro de `/contratos`.**
`MetricasJornada` (ativação, tempo até primeira entrega vista, média de dias sem
touchpoint) está dentro de `/ops`. Nenhum dos dois no Painel.

Não falta construir o dash. Falta **tirá-lo de baixo de Contratos**.

### 2.4 BAIXO — comentário desatualizado em `painel-ordem.ts`

O cabeçalho ainda descreve a regra de adjacência "Sinais de atenção imediatamente
após Exceções", que deixou de existir na fusão de 25/08. O corpo do arquivo já
registra a decisão corretamente; só o comentário do topo ficou para trás.

## 3. O que nos mockups é arcabouço

Ela avisou, e confere. Sem fonte de dado por trás:

- **KPIs do App** — `73% Radar de elegibilidade`, `18 Pessoas conectadas`,
  `6/9 Documentos confirmados`, `2 Novos achados`. Números escritos à mão.
- **Topcards do Desk** — `42 / 13 / 21 / 8`. Idem.
- **Notas por país** — Itália 94, Portugal 76, Espanha 63, Alemanha 58. Não há
  cálculo de nota por país em lugar nenhum do código.
- **Badges Base / Upgrade** — modelo de degrau comercial que **DH-001, DH-002 e
  DH-008 ainda não decidiram**. O PDF é explícito: não criar SKU por artefato; o
  produto comercial é a etapa aprovada.
- **Heat map de casos** — sem fonte.
- **Os seis "módulos" do mockup final** (Visão 360, Memória Italiana, Dossiê &
  Prova, Risco Consular, Objeções & Conversão, Authority Audit) — são os valores
  da coluna `Modulo_Desk` **da planilha de repositórios**, não a navegação do
  Desk. Tratar como taxonomia de fontes, não como menu.

## 4. O que a planilha entrega de verdade

`clubeancestralbasesrepositoriosintelligencedeskfase01_2.xlsx` **não** é arcabouço:

- 21 repositórios estratégicos com URL, acesso, volume, conteúdo-chave, método de
  integração, prioridade e status de validação;
- 102 bases italianas reaproveitadas, 13 países/blocos;
- aba `Campos_App_Desk` — **contrato de campos já escrito**, com obrigatoriedade
  por campo, que casa com o que `/fontes-genealogicas` já modela;
- aba `Componentes_Mobile` — MOB-001…MOB-007, com prioridade e módulo.

É material de carga, não de desenho. Depende do Supabase (hoje sem autorização
nesta sessão).

## 4-B. Os PDFs anteriores — o que eles fecham

### `ApresentacaoClubeAncestral_OKI.pdf` e `CA-MARCA — Guia de Marca` fecham o P0 nº 2 do estudo de UX/UI

O estudo de 23/08 travava o deploy até que se decidisse **por escrito** se a
paleta nova é definitiva e global, porque o relatório antes/depois dizia
"congelada, depende de aceite" em 26 páginas enquanto o código já a tinha no
`:root`. Os PDFs de marca resolvem isso: eles **são** a fonte oficial, e trazem
os valores exatos.

| Token | Guia de marca (PDF) | `src/styles.css` | Confere |
|---|---|---|---|
| Azul | `#2F4B6E` | `--navy: #2F4B6E` | sim |
| Preto | `#101010` | `--preto: #101010` | sim |
| Creme | `#ECDFCD` | `--cream: #ECDFCD` | sim |
| Dourado | `#FCB73A` | `--gold: #FCB73A` | sim |
| Terracota | `#9a3a2f` | `--terracotta: #9A3A2F` | sim |
| Tipografia funcional | Montserrat | `--font-sans: "Montserrat"` | sim |

Leitura: vale a hipótese **(a)** do estudo — a paleta nova é a definitiva, e o
relatório antes/depois é que está desatualizado. O código já está certo; o que
faltava era o registro. Fica registrado aqui.

O que **não** fica fechado pelo PDF: o contraste WCAG AA do dourado `#FCB73A`
sobre creme `#ECDFCD` em badges pequenos (P1 do estudo). O guia define a cor,
não o uso em badge de status.

### `O_mapeamento_e_muito_forte…pdf` — a regra que limita o dash

Duas frases do PDF são restrição direta sobre o que o dash de fase pode mostrar
ao cliente, e valem a pena repetidas aqui porque contradizem parte dos mockups:

> "Integração invisível, evidência explicável."

O App **pode** exibir: "Documento solicitado", "Referência de pesquisa em
validação", "Registro confirmado por documento", "Atualizado em 11 de agosto",
"Próximo passo: confirmar a certidão da geração anterior".

O App **não pode** exibir: nome de base, URL, mecanismo de matching, **percentual
de confiança**, API/token, hipótese jurídica.

Isso mata, no lado do cliente, o KPI **"73% Radar de elegibilidade"** do mockup
`appclientefases.html`: é percentual de confiança em tela de cliente. No Desk é
legítimo; no App, não. A distinção precisa ser feita antes de qualquer
implementação daquele card.

O PDF também confirma a jornada comercial em cinco etapas (leitura inicial →
estratégia e validação documental → execução do escopo → regularizações →
história e memória) e é explícito: **"não crie um SKU para cada relatório,
caderno, insight ou card"** — o que reforça a recomendação de não construir
Base/Upgrade agora.

## 5. Ordem recomendada

| # | Item | Por quê primeiro |
|---|---|---|
| 1 | Unificar os IDs de fase da jornada de entrega numa fonte única e rotular a lista do Top 30 | É defeito de dado; enquanto durar, qualquer dash de fase mostra número errado |
| 2 | Nomear a diferença entre as duas contagens de "casos por fase", ou unificar o campo | Mesma classe do defeito que ela já pegou |
| 3 | Levar a leitura de fase + touchpoint para o Painel | É literalmente o pedido dela |
| 4 | Carregar os 21 repositórios em `/fontes-genealogicas` | Dado real pronto; depende de Supabase autorizado |
| 5 | Base/Upgrade | **Não fazer.** Bloqueado por DH-001/002/008 |

## 6. O que este documento não fez

Não construiu nada. Não tocou em dado. Não decidiu Base/Upgrade nem taxonomia de
SKU — são decisões humanas registradas como pendentes no estudo de UX/UI e não
cabe a código fechá-las.
