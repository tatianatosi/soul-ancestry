# P11 — Contexto jurídico dos países novos + achados críticos (duplicidade de trilhas) + fechamento de P7 e AncestralScan histórico

## 1. Países novos adicionados: Tchéquia (CZ) e Eslovênia (SI)

Fonte: `docs/arquitetura/contexto-motor-cidadania-v1.0.md` (02/09/2026,
seção "Matriz jurídica inicial" e "Universo regional" — conteúdo citado a
um acervo de pesquisa real, `[cite:N]`, não inventado). Esses dois países
estão na mesma camada ("operational_context"/"Pesquisa jurídica
pendente") que Croácia e Romênia — que já têm `citizenship_tracks` reais
no banco. Adicionados com o **mesmo padrão conservador** dessas duas:
nenhuma fonte legal é afirmada como homologada
(`legal_reference_label`/`official_source_name` = "a homologar",
resumo = "Não ofertar como rota concluída sem revisão jurídica").
Migration: `supabase/migrations/20260925170000_citizenship_tracks_czequia_eslovenia.sql`.

**Não adicionados nesta rodada** (camada de maturidade menor, o próprio
documento-fonte pede cautela: "não devem ser apresentados como serviços
já homologados"): Países Baixos, Bélgica (`low_countries_expansion`),
Estônia, Letônia, Lituânia (`baltic_expansion`, rotuladas "piloto
jurídico interno"). O documento tem conteúdo real e citável para esses 5
países também (seções "Países Baixos" e "Bálticos", com tabelas de
rota/marco/evidência/alerta) — posso adicionar no mesmo padrão
conservador se a Proprietária confirmar. **Nunca adicionados, nem
propostos**: a "eastern watchlist" (Eslováquia, Ucrânia, Bulgária,
Sérvia, Moldávia) — o próprio documento os classifica como "detecção
apenas... sem resultado ou preço", uma camada abaixo até de
"pesquisa pendente".

## 2. Achado crítico, não corrigido nesta rodada: `citizenship_tracks` tem duplicidade real por país

Ao investigar antes de adicionar Tchéquia/Eslovênia, conferi o estado
real de todas as trilhas (`mcp__Lovable__query_database`, só leitura). O
de-para de 09/09/2026 (`2026-09-09_DE-PARA-PLANEJADOR-MARCOS-JURIDICOS-CRM-VIVO-vs-PRECOS-RESGATADOS.md`)
afirmava "uma trilha v1.0 por país na organização real, sem
sobreposição" — **isso não é mais verdade hoje**. Contagem real por
código de trilha:

| País | Quantas linhas em `citizenship_tracks` |
|---|---|
| Áustria | 4 (`TRILHA_AUSTRIA` rascunho + `TRK-AT-58C` × 3, idênticas) |
| Alemanha | 4 (`TRILHA_ALEMANHA` rascunho + `TRK-DE-REPARACAO` × 3) |
| Itália | 4 (`TRILHA_ITALIA` rascunho + `TRK-IT-DESC` × 3) |
| Espanha, Hungria, Luxemburgo, Multipaís, Polônia, Portugal | 4 cada (1 `TRILHA_*` rascunho + `TRK-*` × 3) |
| Croácia, Romênia | 4 e 3 respectivamente |

Isto é a mesma classe de problema já documentada nesta sessão para
`product_catalog` ("20+ códigos triplicados") — nunca corrigido lá
também. **Não tentei resolver isso agora**: apagar/arquivar duplicatas
sem saber qual linha cada caso real já referencia arriscaria quebrar um
vínculo vivo (ver achado abaixo). Fica registrado como pendência real,
não escondida.

### Achado mais grave: o próprio caso-piloto Ana Luiza tem DUAS referências de trilha divergentes

- `crm_casos.citizenship_track_id` da Ana aponta para `bffdfb48-...`
  (`TRILHA_AUSTRIA`, `lifecycle_status = rascunho`).
- `case_services.citizenship_track_id` da Ana (a mesma linha que o P8/P9
  já leram e corrigiram o `produto_pai_id`) aponta para `adc77966-...`
  (`TRK-AT-58C`, `lifecycle_status = em_revisao`, a que tem
  `versioned_legal_rules`/`legal_reference_milestones` reais e
  aprovados).

Ou seja: dependendo de qual tabela uma tela lê, o caso mais visível do
Clube Ancestral aponta para uma trilha diferente — uma delas (`rascunho`)
sem regra jurídica nenhuma associada. **Não corrigi isto agora** — decidir
qual das duas é a referência certa (e por extensão, qual das 4 linhas
duplicadas de cada país deveria ser a única) é uma decisão de dado real
em um caso vivo, não uma dedução que eu deva fazer sozinho.

## 3. Motor jurídico automático — não construído; risco de fabricar conteúdo jurídico

A Proprietária pediu para "construir o motor automático jurídico". Antes
de escrever qualquer lógica de comparação/pontuação de rota, preciso
sinalizar o risco real: tanto o documento de 02/09
(`contexto-motor-cidadania-v1.0.md`, seção "Modelo decisório"/"Regras de
execução") quanto a correção "Claude" colada nesta mesma sessão são
explícitos — **não é para automatizar decisão jurídica**, só
explicabilidade + revisão humana obrigatória. O validador real que já
existe (`avaliarValidacaoJuridicaCaso`) já cumpre exatamente esse papel
(gate de conformidade, nunca elegibilidade computada) — extensível com o
conteúdo jurídico novo (item 1) sem inventar lógica de pontuação.

**Não construí um motor de pontuação/comparação de rotas** nesta rodada
— faria exatamente o que o documento fonte proíbe ("não usar percentual
de chance jurídica") sem critério de comparação definido pela
Proprietária. Pergunta enviada a ela (fora deste documento, na resposta
da sessão): o que exatamente "motor automático" deveria calcular, dado
que toda a documentação-fonte pede explicabilidade sem veredito.

## 4. AncestralScan — contexto histórico incorporado (não é código deste repositório)

A Proprietária confirmou: o AncestralScan é parte real do Clube
Ancestral, mas hospedado num projeto Lovable de terceiro (quem construiu
o site) — sem acesso às tabelas dele nesta sessão. Reli o histórico
recuperado (`docs/evolucao/recuperados/fontes-primarias/02_AUDITORIA_MAE_Clube_Ancestral.md`,
`docs/evolucao/recuperados/prompts-lovable-2026-08-31/CLUBE_ANCESTRAL_PRODUCTS_SKU.md`)
para enriquecer o P10 com contexto real:

- AncestralScan™ é uma ferramenta pública real do site, ~5 minutos, 10
  países, gratuita (camada de entrada/triagem, "CAMADA 1: ENTRADA" da
  arquitetura mapeada em 18/08/2026).
- **Achado relevante para o desenho do P10**: o histórico descreve que a
  ferramenta pública, hoje, "calcula radar de elegibilidade com base nas
  leis vigentes... e exibe limite geracional, via administrativa/judicial
  e prazo médio" diretamente ao visitante — ou seja, o Scan **externo**
  já pode estar fazendo mais do que as regras internas do Clube Ancestral
  permitiriam (que proíbem exatamente isso: prazo automático, elegibilidade
  confirmada). Isso confirma que o desenho do P10 estava certo em tratar
  qualquer score do Scan como puramente declarado/orientativo
  (`scoresOrientativos`, nunca `elegibilidade_preliminar`) — o Clube
  Ancestral não controla nem endossa o cálculo que a ferramenta de
  terceiro exibe publicamente; internamente, nada disso vira fato.
- Não há ação de código aqui — é contexto documental, adicionado a
  `docs/arquitetura/2026-09-25_ancestralscan-crm-planejador.md` por
  referência (este documento).

## 5. Painel "Cadeia deste caso" (P7) — decisão: não construir

A Proprietária pediu para checar a especificação do próprio Caso 360
antes de criar mais uma tela, dado o processo de limpeza de legado em
andamento. Busquei "Cadeia deste caso"/"Cadeia Caso 360" em todos os
documentos de política/arquitetura/governança — **nenhuma especificação
canônica pede essa tela**. A ideia vinha inteiramente da branch remota
órfã `cursor/cadeia-caso-360-planejador-0ed5` (11/09/2026, nunca
mesclada, experimental) — não de um documento aprovado pela Proprietária.

Caso 360 já cobre o que essa branch propunha, sob nomes/telas reais: o
`PainelJornadaPlanejador` (P4) já mostra produto-pai/rota/fase/marcos/
próxima ação; a seção "Validação jurídica deste caso"
(`avaliarValidacaoJuridicaCaso`) já mostra o estado jurídico; a aba de
produto/trilha já existe. Construir mais uma "faixa de diagnóstico"
resumindo o que essas telas já mostram seria exatamente o "dump de tudo"
que a Proprietária está tentando eliminar. **P7 é encerrado sem
construção** — decisão tomada por ausência de especificação real, não
por preguiça de investigar.

## Verificação
Migration aditiva, idempotente (`not exists`), aplicada e conferida
diretamente no banco antes deste commit. Nenhum código de aplicação
alterado nesta rodada (achados 2, 3 e 5 são registro/decisão, não
código). `tsc`/suíte/build não aplicável a mudança pura de dado +
documentação — confirmando que nenhum arquivo `.ts`/`.tsx` foi tocado.
