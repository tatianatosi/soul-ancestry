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

## C. Sequência segura de consolidação (cortes futuros, cada um com aprovação)

1. **Cor primeiro, estrutura depois.** Trocar literais por token nos 8 arquivos
   acima, sem mudar API nem marcação.
2. **Selo** — unificar em uma implementação com os 5 estados + texto.
   Demais arquivos passam a reexportar.
3. **KPI** — unificar, exigindo props `fonte`, `formula`, `periodo`, `vazio`.
4. **Estado vazio** — unificar, exigindo frase e no máximo uma ação.
5. **Cartão / Tabela** — unificar após os três acima.
6. **Gráfico** — unificar `golive/graficos.tsx` + `kit/visualizacao.tsx`,
   bloqueando render sem dado real.
7. **Timeline** — unificar `kit/jornada.tsx` + timeline do Desk.
8. **Remoção** — só depois que nenhum import apontar para a cópia; remover
   arquivo é o último passo, nunca o primeiro.

Reexportação é obrigatória em cada passo: nenhum import existente pode quebrar.
