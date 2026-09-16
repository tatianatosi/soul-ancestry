# Corte 2 do Design System — quatro primitivas + piloto na Pesquisa do Desk

Escopo restrito e aditivo: criar um único arquivo de primitivas, ligar a tela de Pesquisa do Desk a ele e não apagar nada. Sem tokens novos, sem Fase B, sem tabela/gráfico/timeline/jornada/formulário/navegação.

## O que será criado

`src/components/clube-ancestral-kit/primitivos.tsx` com exatamente quatro primitivas:

1. **CartaoCA** — moldura única (borda, fundo, raio, sombra já em uso hoje). Sem nova hierarquia visual, sem alterar layout: reproduz o recorte atual de `CardIndicador`/`KitCard` para que a tela não mude de aparência.
2. **SeloCA** — sempre com texto visível, nunca só cor. Estados fixos:
   - `em_andamento` (azul), `aguardando` (dourado), `concluido` (verde), `atencao` (terracota, cobre vencido/atenção), `ausente` (cinza, cobre não aplicável).
3. **IndicadorCA** — recebe rótulo, valor, e fonte/período. Sem valor, mostra "Sem dados suficientes" e nunca estimativa. Um agrupador `FaixaIndicadoresCA` limita a quatro por superfície (o quinto é ignorado em produção e sinalizado em desenvolvimento).
4. **VazioCA** — frase específica obrigatória e no máximo uma ação. Ação desativada não é aceita; sem ação válida, a primitiva renderiza só a explicação.

Regras aplicadas: cor exclusivamente pelos tokens canônicos já aprovados no Corte 1 (`--ca-*` / classes semânticas existentes), nenhum hex literal, nenhum nome técnico de tabela no texto renderizado.

## Compatibilidade (nada é apagado)

Os componentes atuais continuam existindo e exportados. O mapa componente antigo → novo:

| Componente atual | Destino no Corte 2 |
| --- | --- |
| `CardIndicador` (`desk/ui-desk.tsx`) | vira wrapper fino sobre `IndicadorCA`, mesma assinatura |
| `BadgeDesk` (`desk/ui-desk.tsx`) | vira wrapper sobre `SeloCA`, com de-para `neutro/critico/atencao/sucesso/bloqueio` → estados novos |
| `VazioDesk` (`desk/ui-desk.tsx`) | vira wrapper sobre `VazioCA` |
| `KitCard`, `KitBadge`, `KitEmptyState`, `KpiCard` (kit) | permanecem como estão no Corte 2; só serão reapontados nos Cortes 3–6 |

Como `CardIndicador`, `BadgeDesk` e `VazioDesk` são usados em várias telas, os wrappers preservam pixel a pixel o visual atual — o ganho é ter uma fonte única por baixo.

## Piloto

`src/routes/_authenticated/pesquisa/index.tsx` passa a usar as primitivas para: os dois indicadores ("Sem via jurídica definida", "Sem país definido"), o selo de status do caso, o cartão de cada caso da lista e o estado vazio. A busca, a lista, os links de contagem canônica, a tabela e qualquer gráfico ficam intocados. Nenhuma leitura de dados muda.

## Verificação antes de parar

- `tsgo --noEmit`, `bun run build` e a suíte de testes relevante (comparando com a linha de base conhecida de 7 falhas preexistentes).
- Screenshots antes/depois da Pesquisa do Desk em desktop e 375 px.
- Conferência de overflow horizontal, erros de console e ausência de mudança em dados/rotas/permissões.
- Entrega de A–G conforme pedido: arquivos, mapa de migração, diff resumido, testes, screenshots, confirmação de estabilidade e lista de duplicidades remanescentes.

## Duplicidades que ficam para os Cortes 3–6 (apenas listadas)

`kit/base.tsx`, `kit-consolidado.tsx`, `kit-exportavel.tsx`, `kit/visualizacao.tsx` (`KpiCard`, `DeskMatrix`, gráficos), `kit/jornada.tsx`, `golive/graficos.tsx`, `superficies-desk.tsx` e componentes de cadência.

## Limites desta rodada

Nenhuma alteração de dados, RLS, migrations, acessos, magic links, conteúdo, contratos, faturas, pagamentos, publicações, integrações ou deploy. Nenhum commit, push ou início do Corte 3 sem sua aprovação explícita.
