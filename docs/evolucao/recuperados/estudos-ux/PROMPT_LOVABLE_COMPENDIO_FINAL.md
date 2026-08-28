Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Compêndio final — Governança, Métricas e Conexão de Sistemas

Contexto: leitura direta do repositório (soul-ancestry-main.zip) confirmou que a arquitetura de 8
grupos, a matriz de equivalência mockup→produção, a classificação de módulos contextuais e a jornada
inteira do App Cliente (10 telas do spec + Faturas/Proposta, com dado vivo) já foram implementadas com
disciplina real. A duplicação do funil de conversão (metricas.tsx vs conversao.tsx) também já foi
resolvida — metricas.tsx hoje só linka para /conversao, sem repetir os cards. Este prompt cobre
SOMENTE os itens confirmados como ainda pendentes nesta leitura. Não repita nada do que já está feito.

Modo de execução obrigatório: EXECUTE, com evidência objetiva por item (print, trecho de código,
resultado de query). Nenhuma alegação de "implementado" sem verificação real.

Escopo e proibições
- Não alterar os 8 grupos de menu nem a estrutura da jornada do cliente — ambos já estão corretos.
- Não remover nenhuma rota da lista ROTAS_PRESERVADAS.
- Não implementar nenhum disparo automático de WhatsApp/e-mail — regra de envio manual continua.
- Não excluir fisicamente nenhum registro — só arquivamento, como já é regra do projeto.

────────────────────────────────────────

GOVERNANÇA — prioridade alta

1. Log de decisões (/governanca/decisoes) — 260 linhas, ainda 0 queries

Continua com conteúdo fixo no arquivo. Um log que não cresce sem deploy contradiz o princípio de
auditoria append-only que o projeto já pratica em outras áreas (ex.: histórico de casos, RLS).

Executar: criar tabela real (ex.: governanca_decisoes) com os campos já usados no conteúdo estático
(problema, regra anterior, regra nova, arquivos afetados, impacto, responsável, status, data). Migrar
o conteúdo hoje estático como dado inicial — não perder histórico. Permitir que a equipe (papel
admin/operações) adicione novas decisões pela própria tela, sem deploy.

2. Indicadores e métricas (/governanca/indicadores) — 223 linhas, ainda 0 queries

Continua usando DETALHE_INDICADOR e MANIFESTACAO_INDICADOR hardcoded, apesar do nome sugerir métrica
viva.

Executar: para cada indicador, ligar à fonte real já existente (metricas.tsx, conversao.tsx,
financeiro.tsx, ou onboarding-jornada já têm fonte real — reusar, não duplicar cálculo). Se algum
indicador não tiver fonte real disponível, marcar explicitamente como "definição do indicador, medição
ainda não implementada" — nunca exibir número fixo como se fosse medição atual.

────────────────────────────────────────

GOVERNANÇA — decisão binária pendente (6 itens)

Para cada um, decidir e tornar visível na própria tela: (a) liga a dado real do banco, ou (b) assume
como documento de referência estático com aviso ("Documento de referência, atualizado manualmente por
[papel], última revisão em [data]"). Não deixar ambíguo em nenhum dos seis:

3. Critérios de aceite (/governanca/criterios-aceite)
4. Matrizes conceituais (/governanca/matriz-conformidade)
5. Corte vertical e fontes (/governanca/corte-vertical)
6. Inventário e recuperação (/governanca/inventario-recuperacao)
7. Inventário patrimonial (/governanca/inventario-patrimonial)
8. Varredura de completude (/governanca/varredura-completude) — atenção especial: o nome "varredura"
   sugere execução real; se ela roda de fato (mesmo manualmente) e o resultado é salvo, ligar a esse
   resultado; se é só checklist de referência, renomear para deixar isso claro.

────────────────────────────────────────

CONEXÃO DE SISTEMAS — os dois elos que ainda faltam

9. Biblioteca de Mensagens ↔ Onboarding-Jornada — nenhuma referência cruzada encontrada

O motor de cadência (onboarding-jornada.functions.ts, PainelOnboardingJornada em /ops) calcula alertas
por caso (bloqueado, sem próxima ação, sem microentrega planejada, 10+ dias sem touchpoint, 14+ dias
sem atualização) sem nenhum link para a Biblioteca de Mensagens.

Executar: ao lado de cada alerta em "Alertas internos", adicionar atalho para o modelo de mensagem mais
adequado da Biblioteca de Mensagens, pré-preenchido com variáveis seguras do caso, para revisão e cópia
manual. Nenhum envio automático.

10. Painel Hoje personalizado por papel, começando pelo pesquisador — ainda genérico para todos

painel-dia.tsx já une GATILHOS (fila-comunicacao.ts) com calcularPrioridade (prioridade-matriz.ts) —
essa parte está conectada. O que falta é personalização por papel: nenhuma lógica de
`papel`/`pesquisador` existe hoje na tela.

Executar: para o papel pesquisador, adicionar bloco com os casos atribuídos com pesquisa pendente
(mesma fonte de /pesquisa-modulo), com link direto ao dossiê. Não remover as categorias genéricas já
existentes — adicionar como bloco condicionado ao papel do usuário logado.

────────────────────────────────────────

MONITORAR, NÃO EXECUTAR AGORA (fica registrado, sem ação neste prompt)

- Radar multi-país / índice de elegibilidade consolidado: já está corretamente declarado como lacuna
  real em LACUNAS_CONHECIDAS e na matriz de equivalência ("sem fonte canônica definida, nenhum cálculo
  é simulado"). Correto continuar assim até haver decisão de negócio para especificá-lo.
- Os 14 módulos ainda com tipo "a_confirmar" em desk-modulos.ts: não fazem parte deste prompt — tratar
  em ciclo separado, item a item, quando houver tempo de equipe.

────────────────────────────────────────

Ao final: reportar cada um dos 10 itens numerados como implementado (com evidência) ou bloqueado (com
motivo). Prioridade real: itens 1 e 2 primeiro — são os que mais destoam do padrão de auditoria viva
que o resto do produto já cumpre bem.
