Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Prompt 1 de 2 — Jornada do Cliente: reconciliar estrutura e ligar a visibilidade progressiva já
especificada

Contexto: existe um spec completo e bem projetado (src/lib/app-visibilidade.ts, marcado CA-UX-01.2)
definindo as 10 telas do App Cliente (Home, Jornada, Radar, Árvore, Docs, Entregas da Jornada, Fase 01,
Fase 02, Legado, Conta), os 7 estados de visibilidade por tela (always_available, available_empty,
in_preparation, contracted_not_released, released, not_applicable, hidden_by_permission), e a regra
central: "nenhuma tela é removida da navegação por estado de dados — o que muda é o estado exibido
dentro da tela". Esse spec é consumido apenas pelo mockup (cliente-app.tsx, /prototipo). O portal real
(src/routes/portal/*, o que o cliente usa de fato) tem hoje só 4 abas: Meus casos, Documentos, Faturas,
Proposta — sem Radar, Jornada, Árvore, Entregas, Fase 01/02 ou Legado, e sem usar nenhum estado de
visibilidade progressiva.

Quando rodar: pós-lançamento. Não bloqueia o go-live já decidido (app real e mais simples vai ao ar).
Este é o item de maior prioridade da fila pós-lançamento.

Modo de execução obrigatório: EXECUTE, com evidência objetiva. Não redesenhar o spec — ele já existe e
está bem pensado; a tarefa aqui é reconciliar e conectar, não reinventar.

────────────────────────────────────────

1. Reconciliar as 12 abas (10 do spec + 2 que já existem fora dele)

Faturas e Proposta existem no portal real hoje, mas não fazem parte do TelaApp de app-visibilidade.ts.

Executar: propor onde Faturas e Proposta se encaixam nas 10 telas do spec — por exemplo, Faturas
dentro de Conta, Proposta dentro de Jornada ou Home — ou justificar por que devem continuar como abas
à parte, chegando a no máximo as 10 do spec + o que for estritamente necessário manter separado. Não
decidir sozinho se a diferença for ambígua — reportar as opções e a recomendação, aguardar confirmação
da proprietária antes de remover qualquer acesso hoje existente (Faturas e Proposta continuam
acessíveis enquanto isso não for decidido).

────────────────────────────────────────

2. Construir as telas que faltam no portal real, usando o spec já pronto

Para cada uma das telas do spec ainda ausentes do portal real (Jornada, Radar, Árvore, Entregas da
Jornada, Fase 01, Fase 02, Legado):
- Criar a rota real dentro de src/routes/portal/, seguindo o padrão já usado (portal-shell.tsx,
  PortalCasoDetalhe) e não o padrão do mockup.
- Ligar cada tela à função visibilidadeTela()/visibilidadeCompleta() de app-visibilidade.ts para decidir
  o estado exibido (released, in_preparation, contracted_not_released, not_applicable etc.) — não
  reimplementar essa lógica, importar e usar a existente.
- Fase 01 e Fase 02 devem seguir exatamente a regra já escrita: Fase 02 nunca aparece com CTA de
  upsell automático (permiteUpsell: false já está no spec) — não adicionar nenhuma chamada comercial
  dentro dessas telas.
- Radar deve usar os 4 eixos já definidos em src/lib/radar-eixos.ts (História familiar, Documentos e
  evidências, Estratégia e possibilidades, Próximos passos e progresso) — não inventar eixos novos.

────────────────────────────────────────

3. Atualizar a navegação do portal real (portal-shell.tsx)

Trocar as 4 abas atuais pela navegação reconciliada da etapa 1, com as telas novas da etapa 2. Cada
aba deve navegar sempre (regra do spec: nenhuma tela some por estado de dado) — o que muda é o
conteúdo interno conforme o estado.

────────────────────────────────────────

Ao final: reportar cada uma das 10 telas do spec com status — já existia / construída nesta rodada /
mapeada para dentro de outra aba — e prints do portal real (não do mockup) mostrando ao menos 2 casos
de teste em estados diferentes (ex.: um caso com Fase 01 em preparação, outro com Fase 01 liberada),
comprovando que o estado muda de fato com o dado real do caso.
