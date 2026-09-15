# Ajuste visual restrito — Desk e cabeçalho do App Cliente

## Resultado esperado

Aproximar as superfícies autorizadas da prancha v3 sem alterar dados, regras, navegação ou fontes. O Desk ganha leitura mais compacta; o App Cliente ganha o cabeçalho azul-marinho com marca e as sete abas em grade de duas colunas.

## Escopo de implementação

### 1. Registrar a referência anterior
- Capturar a primeira dobra atual, em desktop e 375/390 px, de **Hoje, Comercial, Pesquisa e Financeiro** antes das alterações.
- Usar a prancha v3 e o de-para já aprovado como referência visual.

### 2. Componentes visuais reutilizáveis
- Criar uma faixa compacta de até quatro KPIs, responsiva: quatro itens no desktop e leitura sem corte no celular.
- Criar selo semântico com texto sempre visível:
  - azul: em andamento/interno;
  - dourado: aguardando revisão/decisão;
  - verde: concluído/confirmado/publicado;
  - terracota: vencido/bloqueado/atenção;
  - cinza: ausente/não aplicável/arquivado.
- Usar exclusivamente os tokens da marca já existentes; sem mudança global de paleta.

### 3. Grades autorizadas no Desk
Aplicar duas colunas no desktop e uma no mobile somente em:
- Hoje;
- Comercial;
- Kanban;
- Pesquisa;
- Financeiro;
- Jurídico;
- Radar;
- Portal.

A grade reorganizará blocos existentes, sem criar gráficos, dados ou ações. Blocos que precisem de largura total — como Kanban, matriz e fluxos — poderão ocupar as duas colunas para preservar legibilidade.

Não aplicar grade global nem reorganizar a leitura sequencial de:
- Caso 360;
- Pessoa 360;
- Pessoas & Famílias;
- Leads;
- Microentregas;
- Formalização;
- Configurações.

### 4. Faixas de números com fontes reais
- **Hoje:** ativos, vencidas, sem próxima ação, aguardando externo.
- **Comercial:** leads ativos, sem próxima ação, calls vencidas, propostas sem follow-up.
- **Kanban:** vencidas, hoje, próximos sete dias, aguardando externo.
- **Pesquisa:** perguntas abertas, fontes, evidências em revisão, achados aprovados.
- **Financeiro:** contratado, recebido confirmado, em aberto, vencido.
- **Jurídico:** em revisão, pendências formais, assinados, anexos pendentes.
- **Radar:** carteira, vencidos, sem próxima ação, aguardando externo.
- **Portal:** rascunhos, em revisão, publicados, acessos ativos.

Cada número será calculado apenas a partir das coleções e estados já entregues pelo leitor autenticado. Ausência será exibida como `0` ou `Sem registros`; nenhum valor será inferido ou preenchido.

### 5. App Cliente
- Aplicar o cabeçalho azul-marinho com a marca somente ao App Cliente.
- Organizar as sete abas aprovadas — **Home, Jornada, Radar, Árvore, Documentos, Legado e Conta** — em duas colunas no contexto solicitado, preservando exatamente os rótulos, a ordem, os destinos e o conteúdo sanitizado.
- Manter a apresentação coerente entre o App real e seu espelho interno, sem introduzir rota, aba ou CTA novo.
- Não alterar as fontes, projeções, publicações, permissões ou conteúdo exibido.

### 6. Biblioteca Mestre
- Não criar tela nesta rodada.
- Registrar apenas o gap na entrega: etapa futura com seis entradas propostas — Acervo, Bases Genealógicas, Dicionários, Trilhas Jurídicas, Modelos e Referências.

## Validação e evidências

- Verificar que nenhuma superfície tem corte ou rolagem horizontal em desktop, 375 px e 390 px.
- Confirmar que as sete superfícies excluídas mantiveram a leitura sequencial.
- Confirmar os rótulos e cores dos selos com texto, inclusive sem depender apenas da cor.
- Confirmar que KPIs vazios exibem `0` ou `Sem registros` e que nenhum gráfico decorativo foi criado.
- Rodar os testes relacionados, verificação de tipos e compilação automática.
- Capturar a primeira dobra **depois**, em desktop e 375/390 px, de Hoje, Comercial, Pesquisa e Financeiro.
- Entregar o comparativo antes/depois, os arquivos de apresentação alterados e o gap da Biblioteca Mestre; parar para revisão, sem commit, publicação ou deploy.

## Limites preservados

- Nenhuma criação ou alteração de dados.
- Nenhuma fixture, pessoa, documento, pagamento, achado ou publicação fictícia.
- Nenhuma mudança em banco, regras de acesso, migrations, consultas, writers ou integrações.
- Nenhum envio, convite, link mágico, commit, merge, publicação ou deploy.
