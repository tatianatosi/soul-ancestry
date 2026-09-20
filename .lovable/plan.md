# Sistema único do Clube Ancestral — de-para, App fiel e jornada da Ana

## Objetivo
Aplicar os contratos de Design System e os mockups aprovados como uma única regra de produto: primeiro documentar o de-para completo do App Cliente e do Desk; depois tornar o App idêntico à prancha aprovada de 17 páginas; por fim fechar a jornada real da Ana no Desk até o contrato revisável com rapidez e a preparação segura do acesso ao App.

## Ordem de execução

### Corte 1 — De-para integral App + Desk, somente leitura
- Comparar, do topo à última linha, cada tela atual com:
  - prancha App v4 e mockup aprovado de 17 páginas;
  - prancha Desk v6 e desenhos aprovados de cada superfície;
  - tokens, componentes, regras de uso, taxonomia, sanitização e contratos de interface do Design System.
- Para cada elemento registrar: referência aprovada, conteúdo esperado, fonte real, estado atual, componente atual, divergência visual, divergência funcional, duplicidade, prioridade e ação proposta.
- Cobrir cabeçalho, navegação, títulos, hierarquia, textos, cartões, selos, indicadores, gráficos, tabelas, estados vazios, CTAs, rodapé/barra móvel e comportamento em 375 px.
- Classificar cada linha como: aderente, ajuste visual, ajuste de conteúdo, dado ausente, falha de fonte, duplicidade, bloqueado por decisão ou não localizado.
- Entregar duas matrizes: App (sete abas) e Desk (seis grupos e superfícies internas), sem alterar código ou dados neste corte.

### Corte 2 — App Cliente idêntico ao mockup aprovado
Executar uma aba por vez, nesta ordem, parando para aprovação visual a cada fatia:
1. Shell comum: marca, cabeçalho, sidebar desktop, barra inferior mobile e exatamente sete abas.
2. Home.
3. Jornada.
4. Radar.
5. Árvore.
6. Documentos.
7. Legado.
8. Conta.

Em cada aba:
- reproduzir composição, densidade, hierarquia, elementos visuais, indicadores e estados da prancha;
- usar somente tokens e primitivas canônicas, sem criar segundo kit;
- manter dados reais publicados/sanitizados ou vazio honesto;
- remover qualquer fallback demonstrativo em contexto real;
- não exibir notas internas, SKU, preço técnico, gates, hipótese não publicada ou pagamento não confirmado;
- manter uma coluna em 375 px, sem overflow e com ações acessíveis;
- gráfico somente quando houver dado real e fonte identificada.

### Corte 3 — Unificação visual e funcional do Desk
- Preservar exatamente os seis grupos de `GRUPOS_DESK`; não criar nova navegação.
- Mapear as superfícies paralelas para suas casas canônicas e propor incorporação gradual, sem apagar rotas ou registros antes de decisão explícita.
- Aplicar o Design System por superfície, seguindo a prancha Desk v6 e reutilizando Cartão, Selo, KPI e Estado Vazio já consolidados.
- Eliminar duplicidade de leitura e cálculo somente quando a fonte canônica e o destino estiverem comprovados.
- Manter próxima ação, responsável, prazo e bloqueio visíveis em todo caso ativo.

### Corte 4 — Jornada real da Ana no Desk
- Preservar a identidade única e o caso `CA-CID-AT-FAM-2026-001` em toda a cadeia.
- Organizar a leitura contínua: Pessoa → Caso → Planejador → Pesquisa/Evidências → Proposta Canva → Contrato → Anexos I–V/OS → Assinatura → acesso ao App.
- Usar o Contrato de Estudo Genealógico v2 e o contrato `2026-CB-0001` v1 já existente; não criar contrato paralelo nem reabrir validação jurídica institucional.
- Apresentar partes, perfil institucional, escopo e entregas extraídos da proposta, texto contínuo, anexos I–V, OS, assinatura e histórico em uma única superfície.
- Projetar a revisão operacional para ser concluída em até 60 minutos: resumo de pendências, edição em blocos curtos, navegação por âncoras, salvamento de rascunho e pedido de revisão claramente separados.
- Mostrar `Link do Canva não registrado` enquanto não existir URL válida persistida.
- Tratar divergências de fonte, inclusive exclusões, como decisão humana; nunca completar por inferência.

### Corte 5 — Preparação do acesso da Ana
- Somente após contrato e decisões humanas válidas, validar a cadeia: contrato assinado → caso liberado → projeções aprovadas/publicadas → magic link → sessão → destino explícito → sete abas.
- Assinatura, envio, convite, geração de link, liberação do caso, publicação e cobrança continuam atos separados e exigem autorização explícita da Proprietária antes de qualquer execução.
- Não contornar o bloqueio atual de contrato não assinado.

## Validação obrigatória por corte
- Comparação lado a lado com o mockup correspondente.
- Tipos, testes relevantes e build completa.
- Capturas desktop e 375 px; no App, uma captura por aba.
- Console sem erro, ausência de overflow horizontal e textos sem sobreposição.
- Quando houver escrita autorizada: ação, confirmação, F5/releitura e integração.
- Relatório objetivo de arquivos, diff, fontes usadas, resultado e bloqueios; parar antes de commit, push, merge, publicação ou deploy.

## Limites preservados
- Nenhum projeto, schema, tabela, writer, fluxo, navegação, catálogo ou Design System paralelo.
- Nenhum dado fictício apresentado como real.
- Nenhuma alteração de dados, RLS, migration, acesso, contrato, assinatura, pagamento, publicação, integração ou deploy sem autorização específica para aquele ato.
- O App mantém sete abas; o Desk mantém seis grupos.

## Primeira entrega
O próximo passo executável é somente o Corte 1: as duas matrizes detalhadas de de-para, com prioridades e sequência de correção. Nenhuma tela será modificada até a aprovação dessas matrizes.
