Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: aplicar melhorias de UX/UI no Desk Intelligence voltadas a métrica real (conversão, SLA,
cobrança, eficiência operacional) — não estética. Este prompt assume que a auditoria de módulos vs.
métricas (prompt separado) já rodou ou vai rodar em paralelo; aqui o foco é a apresentação de dado que
já existe, tela a tela.

Modo de execução obrigatório: EXECUTE. Implemente de fato, com dado real (não mock, não hardcoded),
rode build, teste visualmente cada tela alterada, e reporte evidência objetiva por item. Se um item
depender de um dado que hoje não existe no schema (ex.: "dias em aberto" sem campo de data de
abertura), reporte como FALHOU/BLOQUEADO com o campo que falta — não simule o número.

Escopo e proibições
- Não alterar as 14 abas principais nem criar abas novas.
- Não mudar paleta de cores, tokens ou marca — isso é tratado em outro ciclo.
- Não alterar dados reais de cliente, contrato, catálogo ou financeiro — apenas a forma de exibição.
- Não remover nenhum dado hoje visível; só reorganizar, agregar ou destacar.

────────────────────────────────────────

1. P1 — Radar Interno acessível a partir da Visão Geral

A matriz de priorização (elegibilidade × urgência) hoje só aparece na aba Radar Interno, isolada.
Adicionar na Visão Geral um card-resumo (ex.: "3 casos em Agir Agora") que reflita a contagem real do
quadrante superior direito do Radar, com link direto para a tela completa. Não duplicar o gráfico
inteiro na Visão Geral — só o resumo acionável.

2. P1 — SLA como estado vivo no CRM Vivo

Os cards de SLA (Resposta no WhatsApp 4h, Retorno pós-call 24h, Follow-up de discovery 72h, Tarefa do
planner 96h, Prazo de microentrega 120h) hoje mostram só a meta. Calcular e exibir o status real de
cada SLA contra o tempo decorrido desde o evento que o dispara, com estado visual claro: no prazo / em
risco (ex.: faltam menos de 20% do prazo) / estourado. Usar cor e não só texto para diferenciação
rápida.

3. P1 — Consolidar Alertas e Checklist Semanal (ou explicitar a relação entre elas)

Depende do resultado da classificação do prompt de auditoria de módulos. Se Alertas for confirmada
como view derivada do Checklist/Casos: deixar isso visualmente explícito (ex.: "Pendente Crítico do
Checklist" com o mesmo rótulo em ambas as telas, mesmo cálculo). Se não for possível resolver ainda,
não implementar nada aqui — aguardar o resultado da auditoria.

4. P1 — Badge numérico no menu lateral

Adicionar contagem visível ao lado do nome de cada aba no menu lateral do Desk, com dado real:
Alertas (N), Financeiro (N casos com saldo em aberto), Validação Jurídica (N pendências), Checklist
Semanal (N pendente crítico). Atualizar dinamicamente, não como valor fixo.

5. P2 — Funil de leads como funil visual (Visão Geral)

Hoje os números do funil (Novos leads → WhatsApp → Diagnóstico → Cliente) aparecem em blocos de texto
lado a lado. Substituir por uma visualização de funil real, com o percentual de queda entre cada etapa
destacado — especialmente a queda mais acentuada do funil atual, que hoje passa despercebida no
formato tabela.

6. P2 — Idade da proposta sem resposta (Propostas)

Nos cards de proposta, exibir há quantos dias a proposta foi enviada sem retorno do cliente, com
destaque visual a partir de um limiar a definir (ex.: 7 dias). Usar a data de envio já registrada no
sistema.

7. P2 — Avatar/responsável nos cards do Checklist Semanal

Adicionar indicação de responsável em cada card do kanban (Confirmar / Em Revisão / Pendente Crítico),
puxando o dado de responsável já existente no caso.

8. P2 — Idade do saldo em aberto (Financeiro)

Ao lado do badge "Saldo em aberto" por caso, exibir há quantos dias esse saldo está em aberto, usando
a data de vencimento/registro já existente.

9. P2 — Status de caso com tempo no estado atual (Casos 360)

Ao lado do status textual (Em proposta, Em andamento), exibir há quantos dias o caso está naquele
status, usando a data da última mudança de status já registrada no log/auditoria do caso.

10. P2 — Barra de progresso no Checklist AppCliente

Substituir a fração textual (ex.: "1/6") por uma barra de progresso visual em cada card da grade.

11. P2 — Dono e prazo nas integrações pendentes (Integrações)

Nos itens com status "Em teste"/"Pendente", adicionar campo de responsável e prazo estimado, se esse
dado já existir em alguma fonte interna; se não existir, reportar como BLOQUEADO por falta de campo,
sem inventar valor.

────────────────────────────────────────

Ordem de execução: 1 e 2 primeiro (maior impacto em conversão e SLA), depois 4 (baixo custo, alto
retorno), depois os demais itens P1/P2 na ordem listada. Ao final, reportar por item: implementado /
bloqueado (com motivo) / aguardando decisão de outro prompt, e o link/rota de cada tela alterada para
conferência visual.
