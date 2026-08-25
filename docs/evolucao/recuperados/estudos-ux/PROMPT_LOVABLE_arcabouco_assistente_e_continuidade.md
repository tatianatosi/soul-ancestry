Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: dois princípios a aplicar de forma transversal, não pontual.

1) Governança e Biblioteca Mestre como arcabouco de conhecimento consultável pelos assistentes
(Transversal e de Pesquisa) — hoje eles não leem esse conteúdo, só sabem que o grupo existe.

2) O modelo de transição já aprovado para o checkout (o motor externo/existente faz o trabalho
pesado, mas a experiência ao redor preserva continuidade, nunca é um beco sem volta) vale como
princípio geral para qualquer ponto de cadência que saia do produto ou dependa de outro sistema.

Quando rodar: depois dos prompts de Financeiro/CRM e Checkout já enviados.

Modo de execução obrigatório: EXECUTE, com evidência objetiva.

────────────────────────────────────────

PARTE 1 — Governança/Biblioteca como corpus real do assistente

Contexto: Assistente Transversal (assistente-transversal.ts) hoje só usa o grupo "governanca" para
sugerir atalho de navegação — não lê conteúdo. Assistente de Pesquisa (pesquisa-assistente.ts) lê só o
dossiê do caso, não a base de governança.

Executar:
1. Levantar quais itens de Governança/Biblioteca fazem sentido como corpus consultável: Contrato-base
   consolidado, Critérios de aceite, Matrizes conceituais, Corte vertical, Inventário e recuperação,
   Bases Genealógicas (quando existirem), guia de marca/tom de voz (se estiverem documentados em algum
   lugar do repositório).
2. Para cada um, adicionar uma função de consulta (read-only) que o Assistente Transversal e/ou o
   Assistente de Pesquisa possam chamar quando a pergunta do usuário for sobre esse assunto — seguindo
   o mesmo contrato de resposta já definido no documento CA-05 (base consultada, versão, trecho citado,
   nível de certeza, nunca inventar).
3. Não migrar esses itens para "dado real editável pela equipe" neste prompt — isso já está coberto
   separadamente para Log de decisões e Indicadores no PROMPT_LOVABLE_COMPENDIO_FINAL. Aqui o objetivo
   é só torná-los legíveis pelo assistente como estão.
4. Guardrail: o assistente cita a fonte (qual documento/versão) em toda resposta baseada nesse corpus;
   nunca apresenta como fato confirmado algo que é orientação/referência.

────────────────────────────────────────

PARTE 2 — Princípio de continuidade em todo ponto de cadência

Aplicar esta checklist a cada ponto onde o produto depende de sistema externo ou entrega manual, e
reportar o estado de cada um (já segue o princípio / precisa ajuste):

1. Checkout (Proposta → Asaas): já coberto no prompt de checkout — copy de continuidade, retorno ao
   app pós-pagamento. Confirmar que foi implementado.
2. Biblioteca de Mensagens → WhatsApp: já segue o princípio corretamente — abre modelo pré-preenchido
   para cópia manual, nunca envia sozinho. Não mexer, só confirmar que continua assim.
3. Onboarding-Jornada → Biblioteca de Mensagens (fiacao-cadencia-catalogo.ts): mesma lógica, já
   correta — confirmar.
4. Resumo ao cliente (Pesquisa) → App Cliente (client_deliverables): fluxo de aprovação humana antes
   de publicar já existe (fn_deliverable_publicacao_guard) — confirmar que a transição de "aprovado
   internamente" para "visível ao cliente" também tem alguma indicação de continuidade (ex.: não é só
   um campo mudando silenciosamente, o cliente recebe algum sinal de que algo novo chegou).
5. Qualquer outro ponto de saída do produto que a equipe conheça e não esteja listado aqui: reportar,
   não implementar sem antes descrever o ponto de saída e a proposta de continuidade para aprovação.

────────────────────────────────────────

Ao final: reportar por item — implementado / já correto / pendente de ajuste — com evidência.
