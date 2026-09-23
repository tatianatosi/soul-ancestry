# Execução visual — Caso 360 (1440 px) e Jornada do App (375 px)

Somente composição visual nas rotas oficiais. Nenhum dado, consulta, permissão, publicação ou regra é alterado.

## Rodada 1 — as duas telas pedidas

### 1. Desk — Caso 360, 1440 px
Rota oficial: `src/routes/_authenticated/casos.$caseId.index.tsx` (shell `src/components/saas/shell.tsx`).

- Aplicar o acabamento da prancha v4 no shell já existente: faixa institucional azul-marinho, topo branco com busca e usuário, sidebar azul-marinho, navegação horizontal dos seis grupos, fundo off-white, cards brancos com raio discreto e sombra leve.
- Recompor a página em blocos com hierarquia clara, na ordem já conectada: cabeçalho do caso, participantes, Estado do dossiê (donut), Progresso por frente, Estado Integrado com cadência, linha do tempo/jornada e próximas ações.
- Donut ganha destaque visual (área maior, legenda textual dos três segmentos). `data-caso360-dossie-donut` e os números reais permanecem intactos.
- Nenhuma porcentagem nova: só chips e estados já fornecidos pelos dados.

### 2. App — Jornada, 375 px
Rota oficial: `src/routes/portal/jornada.tsx` (shell `src/components/portal/portal-shell.tsx`).

- Cabeçalho mobile azul-marinho com marca, título serifado e subtítulo; rodapé fixo com as sete abas e ativo em dourado.
- As duas linhas existentes (Linha Ancestral e Linha do Processo) ficam visualmente distintas, empilhadas em 375 px, com Momentos de União como conector entre elas — sem fundir e sem virar kanban.
- Preserva composição (individual/casal/família), etapa real e conteúdo sanitizado. Nada de microentrega pública, SLA, responsável, tarefa, hipótese ou log.

### Entrega da rodada 1
Lista de arquivos alterados com props/dados preservados, prévia do Caso 360 em 1440 px e prévia da Jornada em 375 px.

## Rodada 2 — depois da aprovação das duas telas

1. Abrir o wireframe completo do contrato da Ana em desktop e 375 px com a sessão master, registrando cada seção.
2. Aplicar o respiro do wireframe do contrato às sete abas do App, sem tocar dados.
3. Fechar a jornada da Ana como superfície contínua com contrato contínuo, mantendo cada efeito (aprovar, enviar, assinar, publicar) separado e sem execução.
4. Sessão master: carregar uma validação jurídica real passo a passo e confirmar que todos os dependentes aparecem sem erro.
5. Alinhar Hoje, CRM Vivo, Kanban e Pessoa 360 à prancha v4, com os KPIs e blocos já conectados visíveis.

## Regras desta execução

- Só arquivos de apresentação: TSX de rota, componentes do kit, `src/styles.css`, tokens.
- Não remover links, ações, estados vazios, chips, atributos `data-*` nem textos semânticos.
- Sem dados mockados, números estáticos, rotas novas ou menus paralelos.
- Validação por tela: tipos, build, capturas 1440 px e 375 px, console sem erro, sem rolagem horizontal.
- Parar antes de commit, push, PR, merge, publicação ou deploy.
