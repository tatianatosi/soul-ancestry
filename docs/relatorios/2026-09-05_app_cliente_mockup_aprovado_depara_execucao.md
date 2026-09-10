---
titulo: App Cliente × mockup aprovado — de-para tela a tela e execução real
data: 2026-09-05
branch: claude/ancestral-club-desk-intelligence-0gsoeg
pr: "#86 (draft, sem merge — aguardando confirmação explícita)"
---

Fonte de verdade usada: `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` + o PDF `Clube Ancestral — Mockup
visual para aprovação` (7 telas do App Cliente, lidas integralmente nesta rodada) + as capturas reais de 05/09.

Não digo "pronto". Duas correções reais foram feitas e verificadas por código/schema; o restante das 13 áreas
listadas no seu pedido segue como pendência nomeada — não testada, não inflada.

## 1. O que mudou nesta rodada, com evidência

1. **Navegação mobile truncada — corrigida.** Causa: a barra usava rolagem horizontal no topo (padrão desktop)
   também no celular; com rótulo sempre visível ao lado do ícone, a última aba ("Árvore", no seu relato) ficava
   cortada na borda sem indicar que havia mais conteúdo ao lado — não é que a aba não existisse, é que a barra
   não cabia. Corrigido: abaixo do breakpoint `sm`, o portal agora renderiza uma barra **fixa no rodapé**, ícone
   sobre rótulo, largura igual por aba — o padrão do mockup — onde todas as abas cabem sem rolagem. Commit `c5a77e2`.
2. **Jornada e Árvore agora têm uma ação real de ADMIN para publicar — antes só existia por SQL direto.** Novo
   par `publicarProjecaoApp`/`despublicarProjecaoApp` em `portal-atendimento.functions.ts`, sem alterar nenhuma
   policy/trigger (a leitura já funcionava — faltava só quem escreve). Interface em Atendimento: escolher
   caso, tipo (Jornada ou Árvore), escrever o texto em linguagem de cliente, publicar. Recusa automaticamente
   texto com termo interno (`contemConteudoInterno`). Commit `c5a77e2`.
3. **Conteúdo publicado agora, usando esse caminho, no caso de homologação** (`aae4d5f5-8329-4f53-926c-8a7448ba8bfa`):
   Jornada — "Documento de identificação civil recebido e conferido pela equipe. Ambiente de homologação —
   CA-ACESSO-004."; Árvore — "Vínculo confirmado entre você e um ascendente direto nesta etapa. Ambiente de
   homologação — CA-ACESSO-004." Ambos com `approval_status='published'`, `approved_by`/`approved_at` preenchidos,
   passam pelo filtro de linguagem viva (`textoParaCliente`) sem serem descartados — confirmado por leitura do
   filtro, não por clique.

## 2. Por que não há screenshot mobile/desktop nesta rodada

Mesma limitação já registrada em todas as rodadas anteriores desta madrugada: o Chromium desta sessão de
automação não completa chamadas HTTPS de saída, então não alcança nem o preview da Vercel nem uma sessão
autenticada real de cliente. Todas as linhas abaixo marcadas "não testado" são exatamente isso — não vou
chamar leitura de código de teste visual. Você já está autenticada no App Cliente agora — o roteiro da seção 4
pede exatamente os dois recarregamentos que provariam isto por fora desta sessão.

## 3. Tabela obrigatória

| Tela/aba aprovada | Rota atual | Mockup exige | Estado atual | Fonte de dados | Ação de publicação no Desk | Correção | Commit | Preview | Teste mobile | Teste desktop | Resultado após reload | Pendência |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Navegação (todas as abas) | `/portal/*` | 7 abas, ordem fixa, todas visíveis sem corte | Corrigido: barra fixa no rodapé no mobile | — | — | Trocada rolagem horizontal por barra fixa | `c5a77e2` | link na seção 5 | **Não testado** (limitação de sandbox) | Não testado | — | Confirmar visualmente que as 7 abas cabem no seu aparelho |
| Início | `/portal` (`casos`) | Home com nome/caso, progresso, "hoje você está aqui", próximos passos, pessoas conectadas, achados recentes | Ainda é "Seu acompanhamento" genérico — não reconstruído nesta rodada | `crm_casos`, `app_projections` | Nenhuma | Nenhuma | — | — | Não testado | Não testado | — | **Maior pendência real**: exige decidir de onde vêm "progresso %" e o marcador de etapa (1–5) — nenhum campo hoje modela isso; não fabricado sem decisão sua |
| Jornada | `/portal/jornada` | Duas linhas (ancestral + processo), marcos com data | Estrutura de lista única (não duas linhas), mas agora com **conteúdo real publicado**, não mais vazia | `app_projections` (tipo `marco`) | `publicarProjecaoApp` (novo) | Publicação executada (seção 1.3) | `c5a77e2` | link na seção 5 | Não testado | Não testado | Deve mostrar 1 item agora, não mais "Ainda não há atualizações" | Redesenho de duas linhas (ancestral × processo) não feito — decisão de conteúdo/fonte da "linha ancestral" pendente |
| Radar | `/portal/radar` | Gráfico hexagonal, 6 eixos, percentual | Continua 4 eixos em lista, sem gráfico | `app_projections`, `documents` | Nenhuma | Nenhuma | — | — | Não testado | Não testado | — | Modelo de dados diferente do mockup (4 eixos de leitura × 6 dimensões percentuais) — não implementado; inventar os 6 percentuais sem fonte real violaria a regra de não inventar conteúdo |
| Árvore | `/portal/arvore` | 5 gerações (G1–G5), nós conectados/não conectados | Continua texto genérico de projeção, mas agora com **conteúdo real publicado** | `app_projections` (tipo `arvore`) | `publicarProjecaoApp` (novo) | Publicação executada (seção 1.3) | `c5a77e2` | link na seção 5 | Não testado | Não testado | Deve mostrar 1 item agora, não mais vazio | Árvore genealógica estruturada (nós/gerações) não existe — `genealogical_person_profiles` não tem policy de portal (achado já registrado em `2026-09-05_app_cliente_fidelidade_mockup_e_publicacao.md`) |
| Documentos | `/portal/documentos` | Upload, checklist consolidado, entregas do caso | Funcional (policy real, testada em rodada anterior) | `documents` | `liberarEntregaCliente` (já existia) | Nenhuma nesta rodada | — | — | Não testado | Não testado | — | Nenhum documento publicado nesta rodada — `fn_documents_guard` exige sessão autenticada real, esta sessão não tem uma |
| Entregas | `/portal/entregas` | — (não é aba de primeiro nível no mockup de 7 telas) | Estático, sem policy de portal | `client_deliverables` | Não existe | Nenhuma | — | — | — | — | — | Sem policy de portal por desenho atual (achado pré-existente, não corrigido) |
| Fase 01 / Fase 02 | `/portal/fase-01`, `/portal/fase-02` | — (não são abas de primeiro nível no mockup) | Estático, sem policy de portal | `contracts`/`case_services` | Não existe | Nenhuma | — | — | — | — | — | Idem — decisão de arquitetura em aberto, não bug pontual |
| Legado | `/portal/legado` | Biblioteca de achados + card de plano premium | Estático, sem policy de portal | `knowledge_items`/`client_deliverables` | Não existe | Nenhuma | — | — | Não testado | Não testado | — | Sem policy de portal (achado pré-existente) |
| Conta | `/portal/conta` | Perfil, plano, WhatsApp, histórico de atividades | Existe (dados de acesso/perfil), não redesenhado nesta rodada | `client_portal_access`, `clientes` | — | Nenhuma | — | — | Não testado | Não testado | — | Layout "Meu Plano"/"WhatsApp"/"Histórico" do mockup não replicado |
| Proposta | `/portal/proposta` | — (nível `proposal_portal`, fora das 7 abas do App Cliente pleno) | Funcional, não alterado | `proposals` | — | Nenhuma | — | — | Não testado | Não testado | — | — |
| Faturas | rota não confirmada nesta rodada | Não é aba própria no mockup de 7 telas (financeiro aparece dentro de Conta) | Não investigado nesta rodada | `invoices` | `liberarFaturaCliente` (já existia) | Nenhuma | — | — | — | — | — | Confirmar com você se "Faturas" deve ser aba própria (como no código atual) ou bloco dentro de Conta (como no mockup) — divergência objetiva, decisão sua |
| Mensagens | não identificada como rota do App Cliente nesta rodada | Não aparece como aba nas 7 telas do mockup | — | — | — | Nenhuma | — | — | — | — | — | Item do seu pedido sem tela correspondente encontrada — pode ser Atendimento (`/atendimento`, já existe) ou não fazer parte do escopo do App Cliente |

## 4. Roteiro para você confirmar agora (você já está logada)

1. Recarregue `/portal` no celular: as 7 abas devem caber na barra do rodapé, sem cortar nenhuma.
2. Abra `/portal/jornada`: deve mostrar "Documento de identificação civil recebido e conferido pela equipe...".
3. Abra `/portal/arvore`: deve mostrar "Vínculo confirmado entre você e um ascendente direto...".
4. Se qualquer um dos três itens acima não aparecer exatamente assim, é achado novo e real — me diga o que
   apareceu.

## 5. Preview, branch, PR

Preview: `https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app`
Branch: `claude/ancestral-club-desk-intelligence-0gsoeg`
Commits desta rodada: `c5a77e2` (nav + publicação), mais `9c5dcd1`/`b4b5f63`/`61f5e79` de rodadas anteriores do
mesmo dia, todos na mesma PR.
PR: **#86, draft — sem merge, aguardando sua confirmação explícita**, exatamente como pedido.

## 6. Não digo pronto

Início, Radar e a estrutura de duas linhas da Jornada continuam divergentes do mockup — não por falta de
tempo, mas porque exigem decisão sua sobre fonte de dado (de onde vem "progresso %", o marcador 1–5, os 6
eixos percentuais do Radar) que esta sessão não pode inventar sem virar conteúdo fictício apresentado como
real. Documentos, Entregas, Fase 01/02 e Legado não avançaram nesta rodada. Nenhum teste visual mobile/desktop
foi feito por esta sessão — a seção 4 é o caminho para você mesma confirmar em minutos.
