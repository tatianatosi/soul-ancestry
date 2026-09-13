# KPIs e revisão visual integral do Desk

## Objetivo
Criar uma leitura executiva de KPIs para os seis grupos do Desk e elevar o topo das telas reais com os gráficos e a linguagem Pantone já aprovados, sem alterar dados, regras ou navegação.

## Direção aprovada
- Paleta equilibrada: azul `#2F4B6E`, fundo `#F7F1E7`, dourado `#FCB73A` e terracota `#9A3A2F` apenas para atenção.
- Cormorant Garamond nos títulos e Karla no corpo.
- Faixa de decisão no topo, com contexto, origem e no máximo cinco indicadores prioritários.
- Composição baseada na direção “Modern dashboard overview”, reinterpretada com a identidade Clube Ancestral e sem métricas demonstrativas.

## Implementação
- Evoluir a tela real `/metricas` para “KPIs do Desk”, organizada pelos seis grupos vigentes e alimentada somente pelos motores e leituras já existentes.
- Reutilizar os gráficos aprovados para séries, distribuição, progresso, funil e estados; cada gráfico terá fonte, vazio, carregamento e erro explícitos.
- Criar componentes compartilhados para a faixa de decisão e aplicá-los aos principais pontos de entrada de cada grupo, preservando o conteúdo e as ações atuais.
- Revisar hierarquia, cor semântica, legibilidade e informação prioritária no topo das demais abas por herança do kit compartilhado, sem transformar toda tela em painel.
- Manter o teto de cinco KPIs principais e deixar análises secundárias recolhidas ou dentro do grupo responsável.

## Fontes e motores
- Hoje e Comercial: painel diário, leads, calls, conversão e próximas ações.
- Pessoas & Casos: casos, tarefas, operação, prazos e qualidade.
- Inteligência & Pesquisa: pesquisa, pendências, fontes, evidências e microentregas.
- Formalização & Financeiro: contratos, validações, anexos, ordens, condições e pagamentos existentes.
- Governança & Administração: equipe, papéis, privacidade, decisões e qualidade disponíveis.
- Nenhum KPI será exibido quando sua fonte real não permitir cálculo confiável.

## De-para e validação
- Atualizar o de-para mockup 17 páginas × auditoria 47 × seis grupos × rotas × motores, distinguindo: coberto, parcial, bloqueado por dado e não localizado.
- Validar a nova tela e os principais pontos de entrada em desktop e celular, incluindo sobreposição, navegação, estados e erros.
- Registrar telas protegidas sem sessão ou sem dado como bloqueadas, nunca como aprovadas.

## Limites
- Sem nova aba principal, schema, RLS, integração, automação, CRM, taxonomia ou dado fictício.
- App Cliente permanece inalterado nesta execução.
- Rotas e motores existentes continuam sendo as fontes de verdade.
