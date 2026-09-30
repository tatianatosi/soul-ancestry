# Convergência visual do Desk V4 — primeiro corte

## Resultado deste corte
- O Desk passa a mostrar **uma única navegação principal** com sete entradas, nesta ordem: Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas e Biblioteca Mestre. Cada entrada abre sua rota oficial existente; as seis áreas operacionais continuam apenas como contexto recolhido para alcançar as demais funções, sem segunda barra de navegação.
- A Home oficial do App Cliente mostra o **título real do caso da Ana** no destaque, sem fixar o nome no código. “O que vem agora” mostra somente um próximo passo autorizado para a família; sem publicação correspondente, mostra uma espera acolhedora, nunca uma tarefa interna ou um passo inventado. Não acrescentar indicadores técnicos.
- Este corte **não** altera Caso 360 nem Checklist além de seus links no menu; essas telas aguardam aprovação visual separada.

## Execução
1. Registrar capturas do estado anterior no Desk e na Home, em desktop e 375 px, com sessão autorizada e o mesmo caso real quando disponível.
2. Adaptar a apresentação do shell existente às sete entradas. Reusar as rotas, os links, o menu da conta, as regras de acesso e a taxonomia operacional já presentes; manter caminhos antigos acessíveis em contexto recolhido. Remover a barra horizontal redundante de grupos, não criar rota, tela ou shell paralelo.
3. Ajustar apenas a apresentação e a seleção de conteúdo da Home: título vindo do caso autorizado; verificar a origem do próximo passo publicado antes de o mostrar. Na ausência dessa origem, apresentar estado vazio honesto. Manter os achados restritos às publicações já sanitizadas.
4. Atualizar somente os testes afetados pelo menu e pela Home; conferir tipos, testes relevantes, compilação e capturas posteriores em desktop e 375 px. Conferir acesso, links, ausência de rolagem horizontal e erros visíveis; nenhuma escrita ou publicação será executada.
5. Entregar arquivos alterados, diferenças, testes, capturas antes/depois, fontes reais efetivamente usadas, elementos visuais reaproveitados e os descartados. Parar para aprovação antes de qualquer alteração no conteúdo de Caso 360 ou Checklist.

## Detalhes técnicos e limites
- A navegação atual é gerada por `GRUPOS_DESK` em `src/lib/navegacao-desk.ts` e repetida no menu lateral e numa barra horizontal em `src/components/saas/shell.tsx`. As sete rotas de destino já existem: `/painel`, `/casos`, `/tarefas`, `/matriz-juridica`, `/qualidade`, `/alertas`, `/biblioteca`.
- `src/routes/portal/index.tsx` já lê o título do caso e publicações sanitizadas; a próxima ação atualmente pode vir de uma projeção **derivada de sinais do caso**, não necessariamente de uma publicação editorial. Não a rotular como “publicada” sem verificar a fonte e a autorização. Sem conteúdo publicado verificável, usar o vazio, não criar dados.
- A prancha GoLive e o kit anexado são referências visuais e inventário de reaproveitamento, não fonte de dados nem permissão para copiar fixtures, KPIs ou navegação paralela. Não tocar banco, RLS, escritores, catálogo, acessos, contrato, pagamentos, publicação ou deploy.
- A documentação histórica alterna seis grupos de face e sete telas de face; para **este corte**, prevalece o pedido explícito atual de sete entradas, com seis áreas somente contextuais. Nenhuma outra tela ou cálculo muda. Indicadores já existentes ficam intactos; a revisão de cada KPI/card (fonte, cálculo, vazio, clique e rota dona) ocorrerá no corte da sua tela, nunca por números de mockup.
