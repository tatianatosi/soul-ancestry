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
- **Famílias ainda pendentes** (continuam em `Painel`, sem tocar neste
  corte): CRM/Comercial (demais rotas do módulo), Pesquisa, Privacidade,
  Ops, Financeiro (parcial — já usa `CaCard` `padrao` em blocos próprios
  desde DSA-7) e demais rotas isoladas (`conciliacao-catalogo.tsx`,
  `qualidade.tsx`, `ops-excecoes.tsx`). Cada família migra em corte
  próprio, com aprovação visual antes do merge.
