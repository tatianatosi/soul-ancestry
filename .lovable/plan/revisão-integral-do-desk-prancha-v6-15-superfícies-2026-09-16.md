# Revisão integral do Desk — prancha v6 (15 superfícies)

## Decisões aprovadas nesta rodada

1. O desenho novo vai para a tela operacional dona; as prévias `/golive/*` saem do menu e passam a levar à tela dona. Nada é apagado.
2. Os sete pontos de decisão do documento estão confirmados.
3. Execução em uma rodada única: fronteiras, indicadores e ajuste visual das 15 superfícies.

## Donos de rota (de-para)

| Superfície | Tela dona | Prévia que deixa de concorrer |
|---|---|---|
| Hoje | `/painel` | `/golive` |
| Comercial | `/calls` (Mesa) | `/golive/comercial` |
| Leads | `/leads` | `/golive/leads` |
| Kanban por prazo | `/tarefas` | `/golive/kanban` |
| Caso 360 | `/casos/$caseId` | `/golive/caso` |
| Pessoa 360 | `/pessoas/$clienteId` | `/golive/pessoa` |
| Pessoas e Famílias | `/nucleos` | `/golive/pessoas` |
| Painel do caso | bloco de entrada dentro do Caso 360 | `/golive/painel-caso` |
| Pesquisa | `/pesquisa-modulo` | `/golive/pesquisa` |
| Radar | `/qualidade` | `/golive/radar` |
| Validação Jurídica da Trilha | `/matriz-juridica` | `/golive/juridico` |
| Financeiro | `/financeiro` | `/golive/financeiro` |
| Formalização | `/contratos` como orquestradora | `/golive/formalizacao` |
| Portal | `/acessos-portal` + `/atendimento` | `/golive/portal` |
| Configurações | `/configuracoes` | `/golive/configuracoes` |

As telas de prévia continuam existindo em disco, sem link no menu, redirecionando para a tela dona. Nenhuma rota é excluída.

## O que muda em cada tela

- **Primeira dobra**: contexto + pergunta decisória + no máximo três blocos + uma ação principal. O resto vai para abas, acordeões ou "ver todos".
- **Faixa de números**: no máximo quatro por tela, cada um com fonte, fórmula, período e estado explicado em detalhe recolhido. Leads e Configurações ficam sem faixa e sem gráfico.
- **Vazios honestos**: `0`, "Sem registros", "Sem fatura emitida", "Dados insuficientes para radar", "Não registrado" — um vazio e um CTA por domínio.
- **Gráficos**: só permanecem os que respondem a uma decisão e têm dado real. Os indicadores listados como proibidos no documento não são exibidos.
- **Fronteiras**: Hoje resume, Kanban executa por prazo; Comercial lê o funil, Leads edita o lead; Caso 360 é a ficha e o Painel do caso vira porta de entrada com atalhos; Pesquisa produz achado e Árvore recebe só relação aprovada; Formalização conduz marcos e Jurídico aponta validação/risco; Financeiro registra fatura e pagamento como fatos; Portal cuida de acesso e publicação, Configurações da organização.
- **Rótulo**: "Auditoria Jurídica" sai da experiência principal; fica "Validação Jurídica da Trilha".
- **Responsivo**: desktop e 375 px com primeira dobra preservada, uma coluna no celular, sem corte nem rolagem lateral.

## Caso Ana no desenho

- Identidade sempre por `case_id`, nunca por filtro de nome.
- Cabeçalho decisório com etapa, responsável, próxima ação, prazo e bloqueio real.
- Canva só vira botão quando houver referência registrada; senão, "Link do Canva não registrado".
- Contrato em leitura contínua, com versão, partes, pendências, assinatura e referências.
- Financeiro separa autorização, fatura e pagamento; nada é deduzido.
- Arquivados e registros de teste permanecem fora da tela principal, sem exclusão.

## Detalhes técnicos

- Trabalho restrito a apresentação e navegação: componentes de shell, grade, faixa de indicadores, cards, abas/acordeões e links entre rotas já existentes.
- As prévias viram redirecionamento para a rota dona, preservando os arquivos e o histórico.
- Leituras, filtros por organização/caso/titular, permissões e writers existentes permanecem intocados.
- Sem criação de dados, mocks, fixtures, catálogo, SKU, tabela, migration, RLS, publicação, envio ou deploy.
- Validação: compilação, verificação de tipos, testes existentes e captura de cada superfície em desktop, 390 px e 375 px, conferindo ausência de overflow, erro de console, CTA duplicado e rótulo técnico indevido.

## Fora desta rodada

Liberação do caso da Ana no App (contrato, pagamento e documentos mínimos), publicação, convites, link mágico e qualquer ato externo.
