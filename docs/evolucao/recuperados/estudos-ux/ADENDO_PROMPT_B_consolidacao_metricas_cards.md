Adendo ao PROMPT_LOVABLE_B_POS_LANCAMENTO — Consolidação de métricas e cards duplicados

Quando rodar: depois do lançamento, junto com a Parte 1 (auditoria de módulos) do prompt B. Não roda
antes do go-live de amanhã.

Modo de execução obrigatório: EXECUTE, com evidência objetiva por item. Antes de remover qualquer card,
confirmar que a fonte de dado de cada instância é realmente a mesma (não presumir pelo nome parecido).

────────────────────────────────────────

FAMÍLIA 1 — Funil de conversão / saúde comercial (triplicado, confirmado por código)

Hoje aparece em três lugares: card "Funil de conversão" e card "Higiene comercial" em /metricas;
bloco "Funil de eventos" e bloco "Saúde comercial" em /conversao; seção "Comercial hoje" no Painel
Hoje (/painel, componente painel-dia.tsx).

Executar:
1. Confirmar se as quatro instâncias (metricas, conversao, painel) consultam a mesma fonte de dado ou
   se divergem em critério/filtro. Reportar a fonte de cada uma antes de mudar qualquer coisa.
2. Se forem a mesma fonte: manter /conversao como a página única com o funil completo e o detalhe
   operacional (é onde a equipe age, lead a lead). Remover os cards "Funil de conversão" e "Higiene
   comercial" de /metricas, substituindo por um link para /conversao. Reduzir a seção "Comercial hoje"
   do Painel Hoje a um resumo de 1 linha com link, não um bloco espelhado.
3. Se divergirem (critérios diferentes apesar do nome parecido): não remover nada — documentar a
   diferença real e, se fizer sentido, renomear para deixar claro que não é o mesmo número.

────────────────────────────────────────

FAMÍLIA 2 — Sinal de prioridade/atenção (até três fontes possíveis, confirmar antes de mexer)

Hoje aparece em: seção "Sinais de atenção" no Painel Hoje (usa GATILHOS com prioridade 1/2/3); coluna
de prioridade em Casos 360 (casos.index.tsx), alegadamente vinda de src/lib/prioridade-matriz.ts; e
possivelmente em /qualidade como equivalente ao Radar Interno do mockup — este último ainda depende da
confirmação visual pendente do outro prompt (Fase 1, item 1).

Executar:
1. Confirmar se GATILHOS (Painel Hoje) e prioridade-matriz.ts (Casos 360) usam o mesmo cálculo de
   prioridade, ou são lógicas paralelas com o mesmo nome. Reportar com evidência de código (não
   suposição).
2. Se forem o mesmo cálculo: ok manter as duas visualizações (lista no Painel, coluna em Casos) — são
   apresentações diferentes da mesma fonte, isso não é duplicação problemática.
3. Se forem lógicas divergentes: expor isso à proprietária como risco (dois "sinais de prioridade"
   que podem discordar entre si), propor unificação, mas não decidir sozinho qual prevalece.
4. Não mexer em /qualidade neste item — depende da Fase 1 do prompt de arquitetura já enviado.

────────────────────────────────────────

FAMÍLIA 3 — Financeiro (padrão correto, não mexer)

Card resumo "Financeiro" no Painel Hoje → página completa em /financeiro. Esse é o padrão certo
(resumo aponta para detalhe, sem duplicar). Não alterar.

────────────────────────────────────────

Ao final: reportar por família — confirmado como duplicado real / confirmado como divergente / não
mexido — e, para os casos de duplicação real resolvida, a lista de cards removidos e para onde cada
um passou a apontar.
