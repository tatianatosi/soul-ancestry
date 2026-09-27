# Ficha Piloto da Giovanna + Bloco 5A — execução real (27/09/2026)

```yaml
status: executado (verificação + conexão + 1 mecanismo novo; nenhuma decisão de negócio tomada)
pedido_da_proprietaria: "Prepare um outro agente para executar o achado da ficha piloto da
  Giovanna e a sua construção do bloco 5a e execute as decisões de d01 até d06"
responsável pela decisão de negócio: Proprietária do Clube Ancestral (tati@pluggedresearch.com)
```

## Contexto do achado que originou este pedido

A "Ficha Piloto da Giovanna" (54 campos, `docs/arquitetura/PESSOA-CANONICA-FICHA-PILOTO-GIOVANNA-PRADE-2026-09-02.md`)
e o "Bloco 5A" (`docs/evolucao/recuperados/BLOCO-5A_Arquitetura_Genealogica.md` +
`BLOCO-5A_Adendo_Correcoes.docx`) foram tratados por agentes anteriores como
já resolvidos, mas só existiam como documentos arquivados — nunca
verificados campo a campo contra o código real. Este documento fecha essa
verificação, conecta o que já existia desligado, e declara com exatidão o
que continua sendo decisão pendente da Proprietária.

**Achado central desta execução**: quase todos os 54 campos da Ficha
Giovanna e toda a taxonomia M1–M6 do Bloco 5A **já estão conectados e
vivos** no App Cliente e no Desk reais — construídos por outros agentes
desta mesma sessão longa (commits de 12–27/09/2026), só nunca reconciliados
explicitamente contra os dois documentos originais. O único pedaço
genuinamente pendente é humano, não técnico: as quatro decisões D-01/04/05/06
do "Piloto 5A.1", que continuam "AGUARDANDO DECISÃO HUMANA" desde
11/08/2026 e cuja pendência nunca tinha sido re-confirmada.

---

## 1. Ficha Piloto da Giovanna (54 campos) — mapeamento campo a campo

Fonte: `docs/arquitetura/PESSOA-CANONICA-FICHA-PILOTO-GIOVANNA-PRADE-2026-09-02.md`.
Todas as 7 abas do App Cliente são as canônicas e fixas (`Home · Jornada ·
Radar · Árvore · Documentos · Legado · Conta`, `src/components/portal/portal-shell.tsx`)
— nada abaixo cria ou renomeia aba.

### Home > Painel inicial / Contexto

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Rota provável, documento foco, etapa atual | **conectado** | `src/routes/portal/index.tsx` (`PainelHomeMockup`) lê `vivo.etapa` (de `case_plans.fase_jornada` via a view `portal_casos`) e `vivo.proximaAcao`/`proximaEntrega` — dado real por caso, não fixo |
| Resumo do caso, hipótese principal, trilhas (origem/cidadania/memória) | **conectado, mas por publicação, não por campo fixo** | O conteúdo narrativo do caso chega como `PublicacaoCliente` (`src/lib/projecoes-cliente.ts`) via `app_projections`/`client_deliverables`, sanitizado por `jornadaSanitizada` (`src/lib/portal-dados-vivos.ts`). Não existem colunas `resumo_caso`/`hipotese_principal` fixas porque o modelo real é "o que a equipe publicou", não um formulário de 4 campos — é o dado real, mais rico que o anexo, não uma lacuna |

### Home > Heatmap (país + % aderência)

| Campo do anexo | Estado | Observação |
|---|---|---|
| País 1/2/3 + % aderência | **substituído por decisão de produto já registrada, não uma lacuna** | `src/routes/portal/radar.tsx` (linhas 26–33) documenta o achado de 07/09/2026: o Radar do App Cliente **não é** um heatmap de país/percentual — é o Radar de 6 dimensões do mockup aprovado (Documentação, Origem, Conexões Familiares, Elegibilidade, Memória, Legado), construído em `src/lib/radar-seis-eixos.ts`. "Elegibilidade" deliberadamente **não** tem percentual — decisão institucional já tomada, citada no próprio código, não esquecimento. Reintroduzir país/% seria regredir para um formato já substituído pelo mockup de 17 páginas, então **não foi feito** |

### Home > Genograma / Árvore dinâmica

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Pessoa central 1/2/3, conexão-chave, conexão territorial, lacuna crítica | **conectado, com anonimização deliberada** | `src/routes/portal/arvore.tsx` + `src/lib/portal-arvore-geracoes.ts` mostram a estrutura G1–G5 real (gerações, contagem "N pessoas conectadas na história publicada") a partir de `arvoreSanitizada(vivo.projecoes)`. Os slots não nomeiam pessoas individualmente por design ("sem inventar QUAL slot é filho de qual" — comentário de 12/09/2026 no próprio arquivo): dado genealógico nominal de terceiros vivos/falecidos recentes não é exposto sem regra de visibilidade aprovada por pessoa. "Conexão-chave"/"território"/"lacuna" chegam como publicações reais (`item.conteudo`) na Jornada, não campos fixos |

### Home > Aviso importante

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Título + texto do alerta | **conectado, em Conta em vez de Home** | `src/routes/portal/conta.tsx`, seção "Novidades para você" (`data-conta-alertas`): mostra `vivo.proximaAcao` como alerta acionável quando o destino é Documentos ou Conta, com fallback honesto ("Nenhum recado novo por enquanto"). É o mesmo mecanismo do anexo (alerta = próxima ação relevante), só que vive na aba Conta — mover para Home também seria redesenho de composição de tela sem pedido explícito, então não foi tocado |

### Home > Documentos

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Documento principal, pendência principal, status documental | **conectado** | `src/routes/portal/documentos.tsx`: seções "Solicitados" (pendência ativa, de `vivo.proximaAcao`), "Recebidos" (`documents.origem === 'cliente'`), "Liberados" (`documents.liberado_cliente === true`) — todas por dado real, com estados vazios explícitos, nunca "sem informação" |

### Origem (→ aba Radar) > Bases externas, radar, árvore completa

| Campo do anexo | Estado | Observação |
|---|---|---|
| Pessoas conectadas, gerações lidas | **conectado** | `arvoreSanitizada`/`painelArvoreGeracoes` — contagem real exibida em Árvore |
| Base externa 1/2/3 (FamilySearch etc.) | **omitido por regra de governança já vigente, não lacuna** | Bloco 5A §5.9/§6.2/R-02: FamilySearch e afins são só validação interna, **nunca citados no App**; URL interna nunca exposta ao cliente. O anexo Giovanna listava esses links porque era rascunho de planilha interna, não especificação do que o cliente deveria ver — manter oculto está correto |
| Resumo do radar | **conectado** | As 6 dimensões + legenda de `radar-seis-eixos.ts` cobrem esse resumo, com o texto real do próximo passo (`vivo.proximaAcao`) |

### Jornada (linha dupla viva)

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Linha ancestral, linha do cliente/processo, interseções | **conectado, e mais robusto que o anexo** | `src/routes/portal/jornada.tsx`: duas colunas reais — "Linha Ancestral" (fatos históricos, dourado) × "Linha do Processo" (presente, navy) — com "Momentos de União" como conector explícito (implementado em 23/09/2026, `A2-JORNADA-DUAS-LINHAS`). Etapa real vem de `case_plans.fase_jornada` (8 fases canônicas), não uma lista fixa de 5 passos |

### Descobertas (→ abas Legado/Documentos, não existe como aba própria)

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Achado 1/2, entregável | **conectado** | `src/routes/portal/legado.tsx`: prateleiras reais (`PRATELEIRAS`/`prateleiraDe`, `src/lib/projecoes-cliente.ts`) agrupam publicações por coleção (Pesquisa, Cidadania, Memória, Legado, Vida prática — os mesmos 5 nomes do Bloco 5A §7.1), com contagem real e estado vazio por prateleira. Seção "Continuidade da jornada" reaproveita `vivo.proximaAcao`, mesma fonte da Home |

### Conta

| Campo do anexo | Estado | Onde vive hoje |
|---|---|---|
| Produto atual | **omitido por regra de governança, não lacuna** | Bloco 5A §7.2: "SKU, preço, contrato — Nunca [no Dashboard]". Mostrar o nome comercial do produto contratado no App Cliente violaria essa regra; por isso `conta.tsx` mostra "Origem de interesse" (país) em vez de produto/SKU |
| Status da jornada, última atualização | **conectado, via jornada/etapa real** | Coberto pela etapa real (`case_plans.fase_jornada`) e pelas publicações da Jornada — não como 2 campos de texto fixo, como texto vivo |
| Histórico (3 marcos) | **parcialmente coberto, gap real e pequeno, não fechado nesta execução** | `conta.tsx` tem uma seção "Nossas conversas" com texto placeholder duplicado ("Ainda não há conversas disponíveis neste espaço." repetido) sem fonte de dado nenhuma — não é o mesmo conceito do anexo (marcos históricos do caso), é aparentemente um espaço reservado para mensageria (existe rota `/portal/mensagens.$id`), não coberto por este pedido. Registrado aqui como observação, não corrigido: mexer nessa seção sem entender se é "marcos" ou "conversas" arriscaria confundir dois conceitos distintos sem decisão de produto |
| Upgrade | **omitido por regra de governança, não lacuna** | Texto comercial de upsell — mesma regra de SKU/preço acima |

### Conclusão da Ficha Giovanna

Dos 54 campos do anexo, a esmagadora maioria já está conectada a dado real
(App Cliente lendo Supabase de verdade, nunca simulado); um pequeno grupo
foi **deliberadamente substituído** por decisões de produto já registradas
no próprio código (heatmap de país → Radar de 6 dimensões; genograma
nominal → árvore anônima por geração; SKU/produto → omitido por regra do
Bloco 5A); e um único item (histórico de 3 marcos em Conta) fica como
observação de gap pequeno, não corrigido nesta execução por exigir decidir
se é o mesmo conceito de "conversas" — decisão de produto pequena, fora do
escopo deste pedido (que é sobre a Ficha Giovanna e o Bloco 5A, não sobre a
aba Conta em si). **Nenhum código novo foi necessário no App Cliente** —
tudo já estava construído por agentes anteriores desta sessão; o trabalho
real aqui foi a verificação campo a campo contra o anexo original.

### Nota sobre o protótipo morto com o mesmo nome

`src/data/caseDataGiovanna.ts` + `src/lib/caseAdapter.ts` (`toFichaPiloto`)
+ `src/components/kit-contratual.tsx` / `timeline-contratual.tsx` contêm,
de fato, **todos os 54 campos já nomeados quase literalmente** (`heatmap_pais_1`,
`genograma_pessoa_1`, `jornada_intersecao_1`, `conta_historico_1` etc.) —
mas são o protótipo visual antigo, confirmado morto: nenhuma rota monta
`kit-contratual`/`timeline-contratual` (`grep` em `src/routes/` não retorna
nada), e `src/lib/inventario-recuperacao.ts` (linha ~239, consumido pela
navegação real do Desk em `navegacao-desk.ts`/`desk-modulos.ts`) já
classifica esse conjunto como `status: "legado"`, `decisão: "preservar"` —
**decisão já tomada por outro agente/auditoria anterior, não revista
aqui**. Confirma a pista da Proprietária ("muito já foi construído, só não
está no lugar certo"): o "lugar certo" já existe e está ativo
(`src/routes/portal/*`); o protótipo antigo é só a evidência histórica de
que a estrutura de 54 campos sempre existiu, preservada como registro, não
reativada.

---

## 2. Bloco 5A (taxonomia M1–M6, matriz de evidência e confiança)

**Já coberto integralmente por outra fase desta mesma sessão**, concluída
mais cedo hoje (27/09/2026): `docs/arquitetura/FICHA-PESQUISA-GENEALOGICA-CANONICA.md`.
Essa fase confirmou por grep em **todas** as migrations que o vocabulário
literal do Bloco 5A (`dado_pesquisa_inicial`, `validado_por_documento`,
`informacao_compartilhada_familia`, `pendente_confirmacao`,
`busca_negativa`) nunca foi implementado como CHECK — e mapeou cada
conceito histórico contra o vocabulário real e vigente:

| M1–M6 (Bloco 5A) | Campo real vigente |
|---|---|
| M1 (registro oficial/cartório, manual) | `genealogical_sources_catalog.nivel_de_fonte IN ('primaria','institucional')` + `modo_de_uso_permitido = 'manual'` |
| M2 (metadados linkout, ex. Portale Antenati) | `nivel_de_fonte IN ('secundaria','indice')` + `modo_de_uso_permitido = 'metadados_linkout'` |
| M5 (playbook/orientação metodológica) | Fora do catálogo de fontes — conteúdo de referência (Biblioteca Mestre → Modelos), nunca uma linha de `genealogical_sources_catalog` |
| M6 (fonte exploratória colaborativa, ex. FamilySearch) | `nivel_de_fonte = 'colaborativa'` + `modo_de_uso_permitido IN ('nao_validado','restrito')` |

Estados de validação (`informacao_compartilhada_familia` →
`dado_pesquisa_inicial` → `em_validacao_documental` → `validado_por_documento`,
mais `busca_negativa`) mapeiam para `status_pesquisa` real
(`a_confirmar`/`pendente`/`hipotese`/`provavel`/`com_suporte`/`confirmado`/`refutado`).
**Esta execução não repete esse trabalho** — confirmei lendo o documento e
a migration `20260822205306`; nada ficou de fora do escopo do que o Bloco
5A pedia tecnicamente. A única coisa que o Bloco 5A também lista (§10.2,
D-01 a D-10) e que continua sem entidade rastreada é exatamente o pacote de
decisões humanas da seção 3 abaixo.

---

## 3. Decisões D-01, D-04, D-05, D-06 (Piloto 5A.1) — status real

Fonte: `docs/evolucao/recuperados/PILOTO-5A_1a_Rodada_Decisoes.docx`
("Piloto 5A.1 — Rodada 2 · Preparação para Execução Controlada", caso
Giovanna Prade, 11/08/2026). Texto extraído por completo (o arquivo é
`.docx`; extraído via desempacotamento do XML nesta sessão, não por
suposição). As quatro decisões continuam, **hoje, 27/09/2026**, com status
**AGUARDANDO DECISÃO HUMANA** — ninguém as decidiu depois de 11/08. Nenhuma
delas foi decidida por mim nesta execução: são decisões de política/negócio
genuinamente novas e sensíveis (consentimento de dados pessoais, fonte
externa aprovada para consulta, responsável nomeado por validação, regra
oficial de elevação de evidência), que só a Proprietária pode tomar.

### D-01 — Consentimento mínimo de pesquisa e documentos

**Pendente.** Texto proposto de consentimento (não aprovado):

> "Autorizo o Clube Ancestral a receber, organizar e analisar as
> informações e documentos que eu compartilhar voluntariamente para fins
> de pesquisa genealógica e organização da minha linha familiar. Entendo
> que informações compartilhadas pela família, referências de pesquisa e
> documentos ainda podem depender de validação documental. A autorização
> não representa conclusão sobre cidadania, parentesco, elegibilidade,
> rota jurídica ou resultado."

**Decisão que falta**: aprovar esse texto (ou outro), definir o canal de
registro (assinatura física / e-mail / WhatsApp com confirmação /
formulário) e autorizar o início da coleta.

**Não é equivalente a algo já coberto.** `leads.consentimento_status` e
`case_members.consentimentos` (citados como possível equivalência no pedido
desta execução) cobrem consentimento comercial/LGPD genérico do caso — não
o texto específico de consentimento de pesquisa genealógica do Piloto 5A.1,
que tem redação própria e ainda não foi decidido.

### D-04 — Cinco fontes humanas permitidas

**Pendente.** Apenas 4 fontes externas numeradas foram propostas (não
aprovadas): cartórios brasileiros (M1); arquivo ou registro civil
brasileiro aplicável (M1/M2); Portale Antenati (M2); comune/arquivo
distrital/paróquia/arquivo local italiano aplicável (M1/M2). Falta uma 5ª,
e falta a aprovação da ordem de prioridade entre elas.

### D-05 — Responsável pela validação

**Pendente.** Proposta (não aprovada): Tatiana Tosi como revisora e
aprovadora humana de evidências, escopo "Piloto 5A.1 — casos Giovanna
Prade e Sophia Piccoli Santiago", suplente ainda não definido.

**Achado adicional desta execução**: nem Giovanna Prade nem Sophia Piccoli
Santiago são casos reais e ativos hoje. Consultei o banco de produção
(`crm_casos`, projeto Lovable): o único registro para "Giovanna Prade" é
`codigo = 'CA-DEMO-IT-2026-001'`, com `piloto = false` e classificado como
demo em `src/lib/inventario-recuperacao.ts`. O piloto real e ativo
(`piloto = true`) é `CA-CID-AT-FAM-2026-001` (Ana Luiza Gomes Silveira
Rodrigues) — um piloto diferente, sem relação com D-01/04/05/06. Isso
confirma por que este pacote de decisões nunca avançou: o caso ao qual ele
se referia nunca virou operação real.

### D-06 — Critério de elevação de evidência

**Pendente.** Quatro critérios propostos (A: relato → dado de pesquisa
inicial; B: dado de pesquisa inicial → em validação documental; C: em
validação documental → validado por documento; D: busca negativa) —
detalhados no documento-fonte, nunca formalmente aprovados como regra
oficial.

**Achado**: o critério A→B→C→D do Piloto 5A.1 é operacionalmente coerente
com o `status_pesquisa` real (`a_confirmar → pendente/hipotese →
provavel/com_suporte → confirmado`, ver mapeamento §2 acima e no documento
`FICHA-PESQUISA-GENEALOGICA-CANONICA.md`) — ou seja, tecnicamente o
esqueleto já existe no schema. O que falta **não é técnico**: é a
Proprietária formalizar esse critério específico (com os campos de revisão
humana nomeados no documento — responsável, data, justificativa) como
regra oficial do Piloto 5A.1, distinta de simplesmente usar o
`status_pesquisa` já disponível sem essa camada de aprovação formal.

### Mecanismo neutro implementado (não decide, só rastreia)

Como pedido — "implemente o mecanismo/estrutura de forma neutra... um
campo/enum vazio esperando a escolha dela" — criei
`src/lib/piloto-5a1-decisoes-pendentes.ts` (+ teste em
`src/lib/__tests__/piloto-5a1-decisoes-pendentes.test.ts`): um registro
tipado das quatro decisões, cada uma com `status: "aguardando_decisao_humana"`
e `valorDecidido`/`decididoPor`/`decididoEm` nulos. O teste trava que
nenhum agente resolva isso silenciosamente editando o arquivo — mudar
`status` para `"decidida"` exige preencher os três campos de decisão junto,
e mesmo assim só é legítimo quando a Proprietária de fato decidir.

**Por que não é uma tabela nova no banco nem uma tela nova no Desk**: não
existe hoje um `case_id` real para anexar essas quatro decisões (ver achado
D-05 acima — nem Giovanna nem Sophia são casos ativos), e a página
`/governanca/decisoes` existente é explicitamente "registro somente leitura
das decisões **aprovadas**" (CA-DEC-*) — colocar decisões pendentes lá
misturaria dois conceitos (aprovado vs. aguardando) na mesma página. Por
isso o mecanismo vive como módulo TypeScript testável, pronto para ganhar
uma tela ou um caso real quando a Proprietária decidir avançar o piloto —
sem fabricar um caso ou uma tela que hoje não existiriam de verdade.

---

## 4. O que fica pendente (resumo direto)

| Item | Status |
|---|---|
| D-01 (consentimento) | **Pendente de decisão da Proprietária** — aprovar texto + canal + autorizar início |
| D-04 (fontes) | **Pendente** — escolher a 5ª fonte + ordem de prioridade |
| D-05 (responsável) | **Pendente** — confirmar Tatiana Tosi (ou outra pessoa) + suplente |
| D-06 (critério de elevação) | **Pendente** — aprovar formalmente os critérios A/B/C/D |
| Conta > Histórico (3 marcos) | Observação de gap pequeno, não corrigida — decisão de produto menor (é "marcos" ou é "conversas"?), fora do escopo deste pedido |

Nenhuma dessas cinco linhas foi decidida por mim. Tudo o mais do pedido —
Ficha Giovanna (54 campos) e Bloco 5A (M1–M6) — está **verificado,
conectado onde precisava, ou já coberto por trabalho anterior desta
sessão**, sem necessidade de código novo no App Cliente além do mecanismo
neutro de rastreio das quatro decisões.

## Verificação

`npx tsc --noEmit` limpo. Teste novo em
`src/lib/__tests__/piloto-5a1-decisoes-pendentes.test.ts` (6 casos, todos
verdes). Suíte completa e `vite build` — ver rodapé do commit.
