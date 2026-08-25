Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Prompt 2 de 2 — Jornada do Cliente: dado vivo, cadência de onboarding e isolamento estrito por caso

Contexto: este prompt assume que o Prompt 1 (estrutura e visibilidade) já rodou ou está rodando em
paralelo. Aqui o foco é: as telas mostram dado real e atualizado (não estático), a Jornada/Linha do
tempo reflete a cadência real de onboarding, e o cliente só enxerga o próprio caso — nunca dado de
outro cliente, caso-modelo ou informação interna da equipe.

Quando rodar: pós-lançamento, logo após o Prompt 1.

Modo de execução obrigatório: EXECUTE, com evidência objetiva. Nenhuma alegação de "implementado" sem
teste real logado como cliente.

────────────────────────────────────────

1. Linha do tempo / Jornada com dado vivo, ligada à cadência de onboarding

O motor de cadência já existe no lado da equipe (src/lib/onboarding-jornada.ts/.functions.ts,
PainelOnboardingJornada em /ops), com estado derivado por caso e próxima ação.

Executar: a tela Jornada do cliente deve consumir o mesmo estado derivado do caso (estado_derivado,
próxima ação, prazo) já calculado para a equipe — sanitizado para linguagem do cliente (nunca termos
técnicos, nunca SKU, nunca juízo de mérito, seguindo a mesma regra já usada em nomeComercialParaCliente
de app-visibilidade.ts). Não duplicar o cálculo de cadência — reusar a fonte única.
Reportar: de onde veio o estado exibido ao cliente e confirmação de que é o mesmo dado que a equipe vê
internamente (sanitizado), não um valor solto ou mockado.

────────────────────────────────────────

2. Radar com dado vivo

Os 4 eixos (radar-eixos.ts) precisam refletir dado real do caso — não os exemplos normativos do spec
(ESCOPO_ANA, ESCOPO_JOAO, ESCOPO_DIAGNOSTICO_ISOLADO), que são só para referência de teste.

Executar: confirmar a fonte real de cada eixo (história familiar, documentos e evidências, estratégia
e possibilidades, próximos passos) a partir dos dados do caso já existentes (pessoas/linhagens,
documentos do caso, plano de pesquisa). Reportar de onde vem cada eixo.

────────────────────────────────────────

3. Isolamento estrito — "o cliente só tem acesso à sua vida"

Este é o item de maior risco deste prompt: confirmar, com teste real (não leitura de código), que um
cliente autenticado nunca vê dado de outro caso, de outro cliente, de caso-modelo/demo, ou qualquer
informação interna da equipe (rótulos "(interno)", alternância Desk/Cliente, seletor de caso modelo —
já cobertos em prompt anterior, mas reconfirmar especificamente nas telas novas do Prompt 1).

Executar:
a) Login real como cliente do Caso A. Tentar acessar, por URL direta, uma rota de caso que não é dele
   (ex.: trocar o ID do caso na URL de Radar, Jornada, Entregas, Fase 01/02). Confirmar bloqueio real
   (RLS no banco, não só ocultação visual no front-end).
b) Confirmar que RLS está aplicado a nível de banco para cada uma das tabelas novas consultadas pelas
   telas do Prompt 1 (não confiar em filtro só no client-side).
c) Reportar, para cada tela nova, qual policy de RLS a protege e o resultado do teste de tentativa de
   acesso cruzado.

────────────────────────────────────────

Ao final: reportar por item — dado vivo confirmado / cadência conectada / isolamento confirmado com
teste de acesso cruzado — com evidência (print, log de RLS, ou erro de acesso negado) para cada um.
Este prompt só pode ser considerado concluído com o item 3 comprovadamente PASSOU — é o que garante que
nenhum cliente real vê o que não deveria ver.
