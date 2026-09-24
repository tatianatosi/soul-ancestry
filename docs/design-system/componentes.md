# Catálogo de componentes e cópias a consolidar

**Corte 1 não cria nenhum componente novo.** Este documento apenas registra o
que existe e a sequência segura de consolidação.

## A. Componentes do sistema (papel único esperado)

| Componente | Papel | Regra |
| --- | --- | --- |
| `BrandLogo` | logotipo oficial SVG | nunca recriar SVG inline |
| Shell do Desk | sidebar + topbar, **6 grupos** | não criar 7º grupo; conta fica no menu da conta |
| Shell do App Cliente | barra móvel, **7 abas** | Home · Jornada · Radar · Árvore · Documentos · Legado · Conta |
| Cabeçalho de superfície | título, contexto, 1 CTA principal | um CTA por estado |
| Cartão | contêiner de bloco | raio `--ca-radius-lg`, borda `--ca-border` |
| Selo | estado com **texto** | cinco estados canônicos, nunca só cor |
| KPI | número + fonte + fórmula + período | máximo 4 por superfície |
| Estado vazio | frase honesta + no máximo 1 ação | nunca dado fictício |
| Acordeão | detalhe secundário | não usar para esconder o fluxo principal |
| Tabela | lista densa | mobile 375 px: vira lista em uma coluna |
| Timeline | eventos com data e fonte | fato × pendência × decisão × não registrado |
| Gráfico | só com dado real | sem gráfico decorativo |

## B. Cópias existentes (dívida declarada)

| Arquivo | Contém | Observação |
| --- | --- | --- |
| `ui-desk.tsx` | cartão, selo, KPI, vazio, tabela | mais usado no Desk |
| `clube-ancestral-kit/base.tsx` | cartão, selo, KPI, vazio | base do kit visual |
| `clube-ancestral-kit/kit-consolidado.tsx` | reagrupamento dos anteriores | consolidação parcial anterior |
| `clube-ancestral-kit/kit-exportavel.tsx` | versão para exportação/prancha | saída estática |
| `golive/graficos.tsx` | gráficos e cores literais | migrar cor para token |
| `clube-ancestral-kit/visualizacao.tsx` | gráficos e timeline | sobrepõe `golive/graficos.tsx` |
| `clube-ancestral-kit/jornada.tsx` | timeline de jornada | sobrepõe timeline do Desk |
| componentes de cadência (D0–D365) | selos e cores manuais | maior concentração de cor literal |
| `comercial/base.tsx` (`Painel`) | cartão (título + conteúdo) | **em migração (DSA-10, 23/09/2026)** — ver seção D |

## C. Sequência segura de consolidação (cortes futuros, cada um com aprovação)

1. **Cor primeiro, estrutura depois.** Trocar literais por token nos 8 arquivos
   acima, sem mudar API nem marcação.
2. **Selo** — unificar em uma implementação com os 5 estados + texto.
   Demais arquivos passam a reexportar.
3. **KPI** — unificar, exigindo props `fonte`, `formula`, `periodo`, `vazio`.
4. **Estado vazio** — unificar, exigindo frase e no máximo uma ação.
5. **Cartão / Tabela** — unificar após os três acima. **Etapa iniciada em
   23/09/2026 (DSA-10)** — ver seção D para o estado real.
6. **Gráfico** — unificar `golive/graficos.tsx` + `kit/visualizacao.tsx`,
   bloqueando render sem dado real.
7. **Timeline** — unificar `kit/jornada.tsx` + timeline do Desk.
8. **Remoção** — só depois que nenhum import apontar para a cópia; remover
   arquivo é o último passo, nunca o primeiro.

Reexportação é obrigatória em cada passo: nenhum import existente pode quebrar.

## D. Cartão — estado real da consolidação (DSA-10, 23/09/2026)

Autorização explícita da Proprietária: não trocar `Painel` por `CaCard` como
swap isolado de um arquivo — `Painel` tem ~30 consumidores e é a linguagem
visual do fluxo contratual/operacional. Executar como primeira etapa real da
iniciativa **Painel → Cartão Canônico**:

- **Componente canônico definido**: `CaCard` (`@/components/ui/ca-card`)
  ganha `variante?: "padrao" | "compacto"`. `padrao` é o visual que `CaCard`
  já tinha (inalterado). `compacto` reproduz exatamente o visual que
  `Painel` sempre teve (borda navy suave, fundo creme, sem sombra) — mesmos
  slots (`titulo`, `eyebrow`, `acao`, `className`, `children`).
- **`Painel` em compatibilidade**: `@/components/comercial/base` mantém
  `Painel` exportado com a mesma assinatura (`{ titulo, children }`); por
  dentro, delega para `<CaCard variante="compacto">`. Nenhum dos ~30
  imports existentes quebra.
- **Família Contrato migrada** (chamam `CaCard` diretamente, não mais
  `Painel`): `contrato-parametros.$id.tsx`, `casos.$caseId.contrato.
  preparar.tsx`, e os 13 componentes `contrato/*` que essas duas telas
  compõem e que usavam `Painel` como wrapper de seção (`anexos-aplicaveis`,
  `cadeia-operacional`, `cadeia-formalizacao`, `ficha-governanca`,
  `planejador-operacional`, `matriz-juridica-preparacao`,
  `conflito-coerencia`, `painel-instrumentos`, `estrutura-familiar`,
  `regra-comercial`, `painel-bloqueios`, `escopo-proposta`,
  `painel-preparacao`). Visual idêntico ao anterior (`variante="compacto"`)
  — a migração troca a superfície de chamada, não a aparência.
- **`propostas.tsx` migrado** (2026-09-24, mesmo mecanismo): os 6 blocos
  (Resumo, Mover status, Renovar validade, Editar, Criar versão para
  ajuste, Histórico) viram `<CaCard variante="compacto">`. Visual idêntico.
- **`ordens-servico.tsx` migrado** (2026-09-24, mesmo mecanismo): os 5
  blocos (Resumo, Escopo / observação, Planejamento, Mover status,
  Histórico) viram `<CaCard variante="compacto">`. Visual idêntico.
- **`divergencias-catalogo.tsx` migrado** (2026-09-24, mesmo mecanismo):
  os 2 blocos (Filtros, Divergências (N)) viram `<CaCard
  variante="compacto">`. Visual idêntico.
- **`conciliacao-catalogo.tsx` migrado** (2026-09-24, mesmo mecanismo):
  os 2 blocos (Síntese da conciliação, um por proposta na lista) viram
  `<CaCard variante="compacto">`. Visual idêntico.
- **`qualidade.tsx` migrado** (2026-09-24) — correção de escopo: a rota
  em si nunca usava `Painel` (o `<PainelQualidade>` era um falso
  positivo de grep, componente próprio); o uso real estava em
  `src/components/qualidade/painel.tsx` (o componente `PainelQualidade`),
  6 blocos migrados para `<CaCard variante="compacto">`. Visual idêntico.
- **`ops-excecoes.tsx` migrado** (2026-09-24, mesmo mecanismo): os 2
  blocos (Registrar exceção, Histórico de exceções) viram `<CaCard
  variante="compacto">`. Visual idêntico. Com isto, todas as rotas
  isoladas listadas nesta seção estão migradas.
- **Família Privacidade migrada** (2026-09-24): `src/components/
  privacidade/painel.tsx` (5 blocos: Documentos do caso, Consentimentos
  registrados, Exceções formais, Matriz de permissões deste caso,
  Eventos recentes) e `privacidade.index.tsx` (1 bloco: Casos). Visual
  idêntico.
- **Família Ops migrada** (2026-09-24): `src/components/ops/
  desk-operacional.tsx` (5 blocos: Carga por responsável, Fila de
  trabalho, Micro-entregas, Calendário de prazos, SLA por tipo de
  tarefa e prioridade) — `ops-excecoes.tsx` já migrado antes. Visual
  idêntico. Ops está completa.
- **Família Pesquisa migrada** (2026-09-24, a maior família): `pesquisa/
  painel.tsx` (8 blocos), `pesquisa/modulo.tsx` (5 blocos, incluindo um
  título dinâmico), `pesquisa/assistente.tsx` (1 bloco) e
  `pesquisa-modulo.index.tsx` (2 dos 3 `CaCard` da tela — o terceiro,
  "Inconsistências de pesquisa em aberto", já era `CaCard` `padrao`
  desde DSA-3 e não foi tocado). O teste `pesquisa-modulo-dsa3-cards.
  test.ts`, que travava o estado anterior ("os demais blocos continuam
  com Painel — troca é aditiva") foi atualizado para refletir a
  migração, não revertido. Visual idêntico. Pesquisa está completa.
- **Arquivos avulsos migrados** (2026-09-24):
  `contrato-parametros.index.tsx` (2 blocos: Como funciona, Casos
  reais) e `escopo-origem.tsx` (1 bloco: Síntese da cadeia). Visual
  idêntico.
- **Único ponto restante, deliberadamente intocado**: `financeiro.tsx`
  continua usando `Painel` e `CaCard` lado a lado por decisão explícita
  (DSA-7-FINANCEIRO, 23/09/2026) — não é dívida esquecida, é escolha
  registrada; não mexer sem reconfirmar essa decisão primeiro. Com isto,
  a migração `Painel` → `CaCard` canônico (DSA-10) está completa em
  todo o resto do Desk.
