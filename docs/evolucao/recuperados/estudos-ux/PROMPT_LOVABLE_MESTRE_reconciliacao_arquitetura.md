Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: reconciliar a arquitetura de navegação do produto. Hoje existem TRÊS versões de "quantas
abas o Desk tem" convivendo no código, e nenhuma delas é a que aparece nos mockups/relatórios que a
Proprietária tem revisado. Este prompt existe para acabar com essa divergência antes de qualquer nova
funcionalidade.

Modo de execução obrigatório: EXECUTE. Leia o código real antes de escrever qualquer linha. Não
proponha, não redesenhe do zero, não crie "mais uma versão" — implemente a reconciliação abaixo em
cima do que já existe. Rode build e teste visualmente cada rota alterada. Reporte evidência objetiva
por item. Se encontrar uma quarta divergência não prevista aqui, reporte antes de decidir sozinho.

O DIAGNÓSTICO (confirmar antes de agir — não presumir que mudou)
- src/components/desk-app.tsx (usado no mockup /mockup e possivelmente ainda referenciado em algum
  lugar do app real) tem 14 abas no array `nav`: Visão Geral, CRM vivo, Casos 360, Propostas, Go-live,
  Formalização, Checklist AppCliente, Financeiro, Checklist semanal, Validação Jurídica, Radar Interno,
  Alertas, Integrações, Biblioteca Mestre.
- src/components/saas/shell.tsx (o menu real do Desk em produção, dentro de /_authenticated) tem 7
  grupos: Visão geral, Comercial, Casos e núcleos, Pesquisa genealógica, Contratos e financeiro,
  Governança e biblioteca (com 24 subitens dentro), App Cliente.
- src/lib/desk-modulos.ts + a rota /governanca/modulos-contextuais descrevem uma TERCEIRA taxonomia
  (8 telas: overview, crm, casos, checklist, juridica, biblio, alertas, assistente) que não corresponde
  a nenhuma das duas anteriores.
- Nenhuma rota real em src/routes/_authenticated tem "radar", "alertas" ou "checklist" no nome — essas
  telas só existem como componentes estáticos dentro do mockup, nunca foram implementadas como
  funcionalidade real com dado vivo.
- O App Cliente real (src/components/portal/portal-shell.tsx) tem só 4 abas (Meus casos, Documentos,
  Faturas, Proposta) — não as 6, nem as 10 que aparecem no mockup e no relatório de marca.

Confirmar isso primeiro (com `grep`/`find`, reportando o que encontrar) antes de prosseguir. Se algo
já mudou desde a última leitura, reportar a diferença antes de agir.

Escopo e proibições
- Só existe UMA arquitetura de navegação daqui para frente: a definida abaixo. Depois de implementada,
  desk-app.tsx (mockup) deve deixar de ser citado como "o Desk real" em qualquer lugar — se ele
  continuar existindo, é só como referência visual histórica, isolado do app funcional.
- Não alterar dado real de cliente, contrato, catálogo, financeiro. Isso é reorganização de navegação
  e implementação de telas que faltam, não migração de dado.
- Não remover nenhuma funcionalidade hoje acessível por alguma rota real — só reorganizar onde ela
  aparece no menu, e implementar o que está documentado mas nunca foi construído.
- Preservar RLS, auditoria append-only, soft delete, histórico.
- Nenhuma aba principal nova além das definidas abaixo (8 no Desk, 7 no App Cliente).

────────────────────────────────────────

PARTE 1 — Desk Intelligence: 8 abas definitivas

Implementar esta estrutura em src/components/saas/shell.tsx (o menu real), redistribuindo o que hoje
está em "Governança e biblioteca" (24 itens) para seu destino natural:

1. Visão Geral — Painel Hoje, Métricas comerciais e operacionais (hoje em Governança), Relatórios,
   Conversão. Adicionar aqui um card-resumo do Radar (ver aba 5) com contagem real de "Agir Agora".
2. Comercial — Leads e Discovery, Painel de Calls, Próximas ações, Propostas, Conversão, Clientes e
   núcleos vinculados (como já está hoje, sem mudança).
3. Casos e Núcleos — Casos 360, Pessoas/família/dossiê-mãe, Jornada e tarefas, Exceções operacionais,
   Qualidade e fechamento, Piloto real, Caso-piloto Ana Luiza, Pesquisa genealógica completa (fundir o
   grupo "Pesquisa genealógica" aqui dentro como sub-seção, para não ter uma aba quase vazia sozinha).
4. Contratos e Financeiro — Contratos, Ordens de serviço, Origem do escopo, Conciliação/Divergências de
   catálogo, Dados parametrizáveis, Financeiro, Go-live, Formalização (mover Go-live e Formalização
   para cá, saindo de onde estiverem hoje).
5. Prioridade e Jurídico — Matriz jurídica interna (mover de Governança para cá) + Validação jurídica
   por caso + Radar Interno IMPLEMENTADO DE VERDADE: matriz de elegibilidade x urgência com dado real
   (não hardcoded), calculada a partir dos casos ativos — não o componente estático do mockup.
6. Rotina e Alertas — Tarefas/Checklist semanal (implementar como tela real, hoje só existe no
   mockup) + Rechecagens institucionais + marcos D10/D14 (fonte única — ver Parte 3 sobre duplicação)
   + Alertas como VISÃO FILTRADA desta mesma aba (não uma aba paralela com dado próprio que pode
   divergir).
7. Biblioteca Mestre — Catálogo comercial, Biblioteca Mestre, Biblioteca de Mensagens, Bases
   Genealógicas, Etiquetas canônicas, Modelos F1/F2, Templates de comunicação (mover os itens de
   catálogo/biblioteca que hoje estão soltos em Governança para cá).
8. Governança — só o que é meta/auditoria, não operação do dia a dia: Modo Proprietária, Reconfirmar
   propriedade, Log de decisões, Auditoria, Inventários (recuperação e patrimonial), Varreduras
   (administração e completude), Identificadores, Módulos contextuais, Integrações, Importações e
   migração, Configurações, Usuários e papéis. Contratos-base e modelos contratuais (individual,
   familiar, matriz) ficam aqui só se forem templates de referência jurídica — se forem usados na
   operação do dia a dia de formalização, mover para a aba 4.

Executar: atualizar o array NAV de shell.tsx com essa estrutura, criar as rotas que faltam (Radar
Interno real, Checklist Semanal real, Alertas como view filtrada), e testar cada uma das 8 entradas do
menu carregando sem erro, no domínio publicado.

────────────────────────────────────────

PARTE 2 — App Cliente: 7 abas definitivas

Implementar em src/components/portal/portal-shell.tsx e criar as rotas que faltam em src/routes/portal:

1. Meu Painel — resumo do caso, próxima etapa, e um espelho sanitizado do que a equipe está vendo/
   fazendo agora (ver Parte 4 sobre o espelho de alertas). Substitui a mistura solta de hoje.
2. Jornada — linha do tempo do processo, etapas concluídas e futuras. Não existe hoje como rota real
   — implementar com dado vivo do caso, não estático.
3. Radar (do cliente) — versão simplificada e sanitizada do Radar Interno da equipe: só o que é seguro
   mostrar sobre o progresso/prioridade do próprio caso, sem juízo de mérito interno. Não existe hoje
   como rota real.
4. Árvore — árvore genealógica do caso, linhagem confirmada. Não existe hoje como rota real.
5. Documentos — já existe (/portal/documentos), manter como está.
6. Entregas — fundir o conceito de Fase 01/Fase 02/Legado do mockup em uma única aba de
   microentregas publicadas e relatórios de fase.
7. Conta — fundir Faturas + Proposta (já existem) com dados cadastrais em uma aba só.

Executar: implementar as rotas que faltam (Jornada, Radar do cliente, Árvore, Entregas) com dado real
puxado do caso do cliente autenticado, respeitando a regra já documentada de que o App Cliente nunca
exibe juízo de mérito interno nem dado que não foi explicitamente marcado como visível ao cliente.

────────────────────────────────────────

PARTE 3 — Resolver a duplicação de D10/D14

Verificar se o marco D10/D14 (hoje descrito em dois lugares na documentação: dentro de Checklist e
dentro de Alertas) vem da mesma fonte de dado ou de cálculos diferentes. Se for a mesma fonte, exibir
uma vez só (na aba 6, Rotina e Alertas) e não duplicar em painel separado.

────────────────────────────────────────

PARTE 4 — Espelho de alertas no App Cliente ("Meu Painel")

No painel do cliente, exibir uma versão sanitizada e com atraso controlado do que a equipe está vendo
sobre o caso dele: achados novos publicados, próxima ação aguardando o cliente, e status de mensagens
recebidas por WhatsApp (se houver integração ativa) — sempre filtrado pela mesma regra de visibilidade
já usada no Canvas do cliente (nunca preço, nunca juízo de mérito interno, nunca dado de outro caso).
Se a integração de WhatsApp ainda não está pronta para expor isso automaticamente, implementar como
"aguardando integração" visível apenas para a equipe, não fingir que já existe.

────────────────────────────────────────

PARTE 5 — Aposentar a terceira taxonomia (desk-modulos.ts)

Depois que a Parte 1 estiver implementada de verdade na navegação real, atualizar
src/lib/desk-modulos.ts e a rota /governanca/modulos-contextuais para descrever a arquitetura de 8
abas definitiva — não a de 8 telas antigas (overview/crm/casos/checklist/juridica/biblio/alertas/
assistente) que nunca foi a navegação real. Essa página deve voltar a ser fonte de verdade, não um
documento sobre uma arquitetura paralela que ninguém usa.

────────────────────────────────────────

Aceite deste ciclo: build passando, as 8 abas do Desk e as 7 do App Cliente carregando sem erro no
domínio publicado, Radar Interno/Checklist/Alertas funcionando com dado real (não mockup), e um
relatório final listando: o que foi implementado, o que ficou como "aguardando decisão" (e qual
pergunta falta responder), e a confirmação de que desk-app.tsx deixou de ser citado como o Desk real
em qualquer parte do código ou documentação.
