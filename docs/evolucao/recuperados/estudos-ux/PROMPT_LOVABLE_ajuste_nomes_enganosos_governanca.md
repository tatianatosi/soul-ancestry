Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: pente fino final em Governança e Biblioteca (26 itens) confirmou que a maior parte já está
correta — 14 reais/vivos, 10 estáticos por design apropriado. Sobraram só 2 nomes enganosos, que este
prompt corrige. Não é reconstrução — é ajuste cirúrgico de expectativa.

Quando rodar: pós-lançamento, baixa prioridade, pode ser feito junto com qualquer outro ciclo.

Modo de execução obrigatório: EXECUTE, com evidência objetiva.

────────────────────────────────────────

1. "Indicadores e métricas" (/governanca/indicadores)

Hoje mostra regras de governança sobre indicadores (o que deve existir, como classificar), lidas de
src/lib/indicadores-governanca.ts — não mostra os números reais do negócio.

Executar: escolher uma das duas correções (não as duas ao mesmo tempo sem decisão da proprietária):
a) Renomear o item de menu para algo que reflita o conteúdo real, ex. "Regras de indicadores" ou
   "Catálogo de indicadores", deixando claro que é referência de governança, não dashboard.
b) Se a intenção é que a proprietária veja números reais ali: adicionar uma seção com os valores
   ao vivo (reaproveitando os cards já existentes em /metricas e /painel — sem duplicar cálculo, só
   referenciar) além da parte de regras já existente.
Reportar qual opção foi escolhida e por quê (ou reportar como pendente de decisão da proprietária).

────────────────────────────────────────

2. "Varredura de completude" (/governanca/varredura-completude)

O componente dedicado (VarreduraCompletude) não tem nenhuma chamada de dado real — é um checklist
estático, não uma varredura ativa, apesar do nome sugerir um scan em execução.

Executar: mesma lógica do item 1 —
a) Renomear para refletir o conteúdo real (ex. "Checklist de completude"), ou
b) Conectar a uma varredura real se essa for a intenção original (verificar se existe alguma fonte de
   dado — ex. contagem de campos obrigatórios preenchidos por caso — que poderia alimentar isso).
Reportar a escolha.

────────────────────────────────────────

Ao final: reportar as duas decisões tomadas (renomear ou conectar), com o nome final de cada item de
menu e print da tela resultante.
