# Revisão integral das 15 superfícies do Desk — prancha v6

## Objetivo
Revisar o Desk inteiro contra a prancha visual v6 antes de qualquer nova implementação. A rodada será somente de arquitetura visual, matriz, KPIs e wireframes; não alterará produto, dados ou publicação.

## Contratos desta revisão
- Usar `03-prancha-desk-v6.pdf` como referência visual mais recente. Ela contém 15 superfícies internas: Hoje, Comercial, Leads, Kanban, Caso 360, Pessoa 360, Pessoas e Famílias, Painel do caso, Pesquisa, Radar, Jurídico, Financeiro, Formalização, Portal e Configurações.
- Preservar os seis grupos vigentes do Desk; as 15 superfícies são destinos internos, não novos grupos de navegação.
- Tratar pranchas v3/v1, mapas e diagnósticos anteriores como material de comparação, nunca como autoridade superior à v6.
- Manter o App Cliente fora desta rodada; ele serve apenas para verificar a fronteira Desk → projeção sanitizada.
- Usar somente fontes, rotas e permissões existentes. Sem dados fictícios, inferências, filtros por nome, SKU como gate ou gráficos sem fonte real.

## Entregas

### 1. Matriz das 15 superfícies
Para cada superfície, registrar:
- grupo do Desk, rota e papel na cadeia operacional;
- pergunta decisória e ação principal;
- fonte canônica, escopo de organização/caso/titular e filtros estruturados;
- até quatro KPIs, cada um com fonte, fórmula, período e estado vazio;
- elementos da prancha presentes, parciais, ausentes ou indevidos na tela atual;
- sobreposições, CTA duplicado, detalhe técnico exposto e risco de confusão;
- destino correto do detalhe: aba, acordeão, gaveta ou “ver todos”.

### 2. Limites entre superfícies
Consolidar decisões para evitar duplicação:
- Comercial = leitura do funil; Leads = lista, ficha e ação no lead.
- Kanban = operação por prazo; Hoje = decisão diária consolidada.
- Caso 360 = ficha completa; Painel do caso = entrada e atalhos.
- Formalização = fluxo; Jurídico = validação da trilha, conferência e risco.
- Financeiro separa condição, autorização, fatura e pagamento confirmado.
- Portal = acesso e publicação humana; Prontidão permanece detalhe, não nova superfície principal.
- Pessoa/Família/Árvore nunca inferem parentesco; relações visuais exigem aprovação.

### 3. Mapa de KPIs e gráficos
- Limitar cada superfície a quatro KPIs e manter apenas gráficos que respondam a uma decisão real.
- Marcar como `SEM FONTE — NÃO EXIBIR` qualquer indicador sem fórmula e origem comprovadas.
- Identificar escopo e data de referência, incluindo regras de prazo e timezone.
- Manter Leads e Configurações sem gráficos.
- Não restaurar gráficos rejeitados ou meramente decorativos.

### 4. Wireframes v6 antes/depois
Produzir wireframes comparativos das 15 superfícies em desktop e 375 px:
- primeira dobra com contexto, decisão, no máximo três blocos e uma ação principal;
- detalhes recolhidos em abas/acordeões, sem remover informação existente;
- um vazio e um CTA por domínio;
- grade responsiva sem corte, sobreposição ou rolagem horizontal;
- cabeçalho navy, marca e navegação dos seis grupos conforme o padrão aprovado;
- paleta, tipografia, selos e hierarquia coerentes com a prancha, sem mudar tokens silenciosamente.

### 5. Caso Ana como teste de coerência
Aplicar o caso `CA-CID-AT-FAM-2026-001` apenas como leitura de validação dos wireframes:
- próxima ação, prazo, responsável e bloqueio continuam visíveis;
- proposta Canva aparece como navegação contextual quando a referência existir;
- contrato é legível e assinatura/fatura/pagamento não são inferidos;
- Validação Jurídica da Trilha substitui linguagem de auditoria contratual recorrente;
- vazios permanecem honestos e registros arquivados/teste não retornam ao shell.

## Arquivos de revisão
- Um Markdown consolidado com a matriz das 15 superfícies, o mapa de KPIs, lacunas e decisões pendentes.
- Wireframes antes/depois em desktop e 375 px, organizados por superfície.
- Índice curto ligando cada quadro da prancha ao respectivo wireframe e rota atual.

## Validação e parada obrigatória
- Conferir todos os wireframes contra a prancha v6 e a matriz antes de apresentar.
- Verificar legibilidade, ordem, textos, ausência de cortes e coerência entre desktop e 375 px.
- Classificar cada superfície como `PRONTA PARA APROVAÇÃO`, `PENDENTE DE FONTE` ou `PENDENTE DE DECISÃO`.
- Entregar os materiais e parar para aprovação explícita da Proprietária antes de qualquer alteração no produto.

## Fora de escopo
- Código, rotas, componentes, tokens, banco, dados, RLS, migrations, writers, contratos, faturas, campanhas, integrações, publicação, commit, merge ou deploy.
- Criação de motores, telas, grupos de navegação, fontes, conteúdo homologado, mocks ou fixtures.
- Qualquer ato externo ou mudança no App Cliente.