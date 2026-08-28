Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: leitura direta do repositório (soul-ancestry-main.zip, exportado do GitHub) confirmou que a
maior parte do trabalho pedido nos prompts anteriores já foi executada com disciplina — arquitetura de
8 grupos com trava de regressão, matriz de equivalência mockup→produção, classificação completa dos
módulos contextuais, e a jornada do cliente inteira (10 telas do spec + Faturas/Proposta) reconciliada
e com dado vivo. Este prompt cobre SOMENTE os itens confirmados como ainda não executados — não repita
nada do que já está feito.

Modo de execução obrigatório: EXECUTE, com evidência objetiva por item.

────────────────────────────────────────

1. Log de decisões (/governanca/decisoes) — ainda 100% estático, 0 queries

Continua igual ao estado anterior: 260 linhas de conteúdo fixo no arquivo, sem nenhuma consulta ao
banco. Um log que não cresce sem deploy de código contradiz o princípio de auditoria append-only que o
próprio projeto declara.

Executar: criar tabela real (ex.: governanca_decisoes), migrar o conteúdo hoje estático como dado
inicial, permitir que a equipe adicione novas decisões pela própria tela (papel admin/operações), sem
exclusão física — só arquivamento.

────────────────────────────────────────

2. Indicadores e métricas (/governanca/indicadores) — ainda 100% estático, 0 queries

Continua usando DETALHE_INDICADOR e MANIFESTACAO_INDICADOR hardcoded. O nome promete métrica viva.

Executar: para cada indicador, ligar à fonte real já existente no produto (metricas.tsx, conversao.tsx,
financeiro.tsx ou onboarding-jornada já têm fonte real — reusar, não duplicar cálculo). Se algum
indicador não tiver fonte real disponível, marcar explicitamente na tela como "definição, medição não
implementada" — não exibir número fixo como se fosse medição atual.

────────────────────────────────────────

3. Critérios de aceite, Matrizes conceituais, Corte vertical, Inventário e recuperação, Inventário
   patrimonial, Varredura de completude — ainda sem decisão registrada

Continuam estáticos, sem indicação clara ao usuário se são documento de referência ou dado vivo
pendente de conexão.

Executar: para cada um, decisão binária e visível na própria tela — "Documento de referência,
atualizado manualmente por [papel], última revisão em [data]" ou ligação a dado real do banco. Não
deixar ambíguo.

────────────────────────────────────────

4. Conectar Biblioteca de Mensagens ao Onboarding-Jornada — ainda sem nenhuma referência cruzada

O componente PainelOnboardingJornada (/ops) calcula alertas de cadência por caso (bloqueado, sem
próxima ação, sem microentrega planejada, 10+ dias sem touchpoint, 14+ dias sem atualização) — nenhum
desses pontos tem link para a Biblioteca de Mensagens.

Executar: ao lado de cada alerta em "Alertas internos", adicionar atalho para o modelo de mensagem mais
adequado da Biblioteca de Mensagens, pré-preenchido com variáveis seguras do caso, para revisão e cópia
manual. Nenhum envio automático — regra continua intacta.

────────────────────────────────────────

5. Personalizar o Painel Hoje por papel, começando pelo pesquisador — ainda não implementado

painel-dia.tsx não tem nenhuma lógica de papel/pesquisador.

Executar: para o papel pesquisador, adicionar bloco com os casos atribuídos com pesquisa pendente
(mesma fonte de /pesquisa-modulo), com link direto ao dossiê do caso. Não remover as 5 categorias
genéricas existentes — adicionar como bloco condicionado ao papel do usuário logado.

────────────────────────────────────────

Ao final: reportar cada item como implementado (com print) ou bloqueado (com motivo técnico). Itens 1
e 2 são prioridade — são os que mais destoam do princípio de auditoria viva que o resto do produto já
cumpre bem.
