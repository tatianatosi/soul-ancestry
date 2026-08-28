Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: o workspace de pesquisa por caso (/pesquisa-modulo/$id, componente PainelPesquisaModulo) está
completo — 12 abas cobrindo pessoas, relações, eventos, fontes, evidências, hipóteses, pendências,
relatórios internos, resumo ao cliente e auditoria. O problema não é essa tela — é o caminho até ela e
a confirmação de que o que o pesquisador publica chega mesmo ao cliente.

Quando rodar: pós-lançamento. Não bloqueia o go-live.

Modo de execução obrigatório: EXECUTE, com evidência objetiva por item.

────────────────────────────────────────

1. Confirmar (com teste real) a ponte pesquisa → cliente

O pesquisador publica em "Resumo ao cliente" (aba resumos, tabela com title_client_facing,
summary_client_facing, status released_to_client). O cliente vê uma seção "Publicado pela equipe" em
PortalCasoDetalhe, alimentada por painel.publicacoes.

Executar: em um caso de teste, publicar um resumo com status released_to_client pelo fluxo real do
pesquisador. Logar como cliente daquele caso (via link mágico) e confirmar que o conteúdo aparece em
"Publicado pela equipe", com o texto certo e sem vazar nenhum campo interno (hipótese, juízo de mérito,
dado sensível de terceiro). Reportar print de antes (painel do pesquisador) e depois (portal do
cliente).

Se não aparecer: identificar se painel.publicacoes lê de outra fonte, e corrigir a ligação. Esta é a
confirmação mais importante deste prompt — é o elo entre o trabalho de pesquisa e o que o cliente paga
para ver.

────────────────────────────────────────

2. Personalizar o Painel Hoje por papel, começando pelo pesquisador

Hoje painel-dia.tsx não usa o papel do usuário (pesquisador, comercial, financeiro etc.) — mostra as
mesmas 5 categorias genéricas para todos.

Executar: para o papel pesquisador, adicionar ao Painel Hoje um bloco com os casos atribuídos que têm
pesquisa pendente (usar a mesma fonte de dado de /pesquisa-modulo), com link direto para o dossiê do
caso. Não remover as 5 categorias genéricas — adicionar como bloco extra, condicionado ao papel do
usuário logado.
Reportar: print do Painel Hoje logado como pesquisador, antes e depois.

────────────────────────────────────────

3. Resolver as 6 rotas órfãs de pesquisa (era V6, pré-consolidação)

achados.$caseId.tsx, plano-acao.$caseId.tsx, relatorios-fase.$caseId.tsx, pessoas-linhagens.$caseId.tsx,
biblioteca-evidencias.$caseId.tsx, pesquisa-evidencias.$caseId.tsx não são linkadas de nenhum lugar do
app real — o conteúdo equivalente já existe dentro das 12 abas de PainelPesquisaModulo.

Executar:
a) Confirmar que cada uma dessas 6 rotas realmente tem equivalente funcional dentro do módulo
   consolidado (comparar campo a campo, não só por nome de aba).
b) Se confirmado equivalente: redirecionar cada rota órfã para a aba correspondente do módulo
   consolidado (não deletar o arquivo sem necessidade — redirecionar é mais seguro e auditável).
c) Se alguma NÃO for equivalente (fizer algo que o módulo consolidado não cobre): reportar como
   achado à parte — pode ser função perdida de verdade, não só duplicação.

────────────────────────────────────────

Ao final: reportar por item — confirmado / implementado / achado adicional — com prints e trechos de
código como evidência.
