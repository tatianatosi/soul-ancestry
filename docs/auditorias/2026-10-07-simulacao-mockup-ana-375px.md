# Simulação do teste mobile — Ana, 375 px

Status: rascunho  
Versão: v1.0  
Data: 2026-10-07  
Responsável pela decisão: Proprietária do Clube Ancestral  
Fonte: relatório de percurso fornecido em 07/10 às 11:04 e decisões PP-03/PDF da conversa.  
Escopo: simulação de navegação e aceite das sete abas no caso CA-CID-AT-FAM-2026-001.  
Premissas: viewport de 375 px; mesma informação do espelho administrativo relatado; nenhum conteúdo novo publicado; produto PP-03; percentuais com bases reais.

**Limites:** NÃO é execução em navegador. Não houve login, clique, leitura do DOM, medição de toque, download, teste de rede ou consulta ao banco. Resultados abaixo são projeções do relatório, não evidência nova. Altura, navegador e dispositivo não foram especificados. Login cliente e isolamento permanecem não verificados.

## Percurso simulado

Entrada pela visão administrativa Ver App Cliente como pessoa; conferir nome/caso; seguir Home → Jornada → Radar → Árvore → Documentos → Legado → Conta; voltar à Home. A barra inferior deve manter sete destinos, sem perder identidade do caso. Não acionar publicação, cobrança ou assinatura.

## Casos e vereditos projetados

| ID | Aba/ação | Aceite esperado | Resultado projetado pelo relato | Veredito |
|---|---|---|---|---|
| H01 | Abrir Home | Resumo sanitizado do caso | Resumo em rascunho com conteúdo de teste, não pronto para cliente | Incompleto |
| H02 | Ler Achados | Achado interpretado e autorizado | Pessoas da Árvore usadas como achados | Falha semântica |
| H03 | Ler Pessoas conectadas | Pessoas publicadas distintas, sem confirmação inventada | Seis publicações de pessoas disponíveis; conferir contagem específica da Home na execução | A verificar |
| H04 | Prioridade documental | Pedido real e prioridade, ou ausência específica | Nenhum pedido/prioridade publicado | Incompleto |
| H05 | Próximo passo e régua | Próxima ação e etapa com origem real | Espaço vazio, sem etapa publicada | Incompleto |
| H06 | Contato | Canal autorizado ou explicação de indisponibilidade | Só título de contato | Falha de apresentação |
| J01 | Linha Ancestral | Fatos/narrativas documentadas, precisão e contexto | Pessoas viram acontecimentos Passado | Falha semântica |
| J02 | Rituais/hábitos | Conteúdo com suporte, nunca inferido | Não disponível | Incompleto |
| J03 | União/trilhas | União explícita; marcos por trilha | União vazia e trilhas só com botões | Incompleto |
| J04 | Linha do Processo | Microentrega contextualizada sem gerar fatos fictícios | Uma microentrega de 15/09/2026 | Presença relatada; qualidade a verificar |
| R01 | Documentação | 0% apenas com total positivo; sem total, motivo | 0% com 0/0 | Falha de cálculo |
| R02 | Origem | Progresso com base real | 100% só por seis registros | Falha de cálculo |
| R03 | Conexões | Publicadas distintas/mapeadas aplicáveis, mesma referência | Seis registros, denominador não chega | Incompleto |
| R04 | Progresso Geral | Fórmula única; ausências não viram zero | 20% dependente de base incoerente | Falha de cálculo |
| R05 | Países/ramos | Heatmap com fonte histórica e projeção autorizada | Ausente | Incompleto |
| A01 | Abrir Árvore | Seis pessoas com geração correta | G3 Cleusa; G4 Ana Maria; G5 Lotte/Otto; G6 Rudolf; G7 Heinrich | Presença relatada |
| A02 | Rótulos | Mesma convenção de âncora em todos os leitores | G4 com rótulo incorreto; relatório também conflita com convenção G1=âncora | Falha; resolver convenção |
| A03 | Geração ausente | Informar ausência de publicação, não inexistência de pessoa | G2 omitida sem explicação | Incompleto |
| A04 | Expandir vínculo | Só vínculo efetivamente liberado | Seis pessoas sem vínculo publicado; onze relações internas sem suporte | Incompleto; não inventar vínculo |
| A05 | Correção/lacunas | Ação persistente e lacunas contextualizadas | Genograma, lacunas, mapeadas e correção faltam | Incompleto |
| D01 | Checklist N/M | Universo documental do caso rastreável | Não existe | Incompleto |
| D02 | Estados | Solicitados/recebidos/em conferência/liberados separados | Três blocos; em conferência não separado | Falha de paridade |
| D03 | Abrir original | Arquivo autorizado com isolamento por caso | Nenhum original liberado | Incompleto; download não testável |
| D04 | Descobertas/fontes | Interpretação e contextualização sanitizadas | Não disponíveis | Incompleto |
| L01 | Coleções | Categoria editorial explícita | Uma microentrega em Cadernos; classificação deduzida do texto | Falha de classificação |
| L02 | Narrativas/entrevistas/acervo | Conteúdo real ou ausência específica | Coleções vazias | Incompleto |
| C01 | Assinatura | PP-03, R$320/mês, situação sem insinuar pagamento | Esses dados aparecem aguardando confirmação | Presença relatada; não comprova pagamento |
| C02 | Composição/duração | Campos autorizados sem confundir total e parcela individual | Três assinaturas e dez meses não chegam | Incompleto; avaliar exposição por titular |
| C03 | Continuidade/upsell | Oferta e preço autorizados | Não disponível | Incompleto; não inventar oferta |
| C04 | Perfil/canais/preferências | Dados permitidos; ações com persistência | Membros, canal, preferências e acesso faltam | Incompleto |
| C05 | Contrato/proposta | Fora das sete abas | Não aparecem | Conforme relatado |

## Prova responsiva disponível

O relatório informa ausência de rolagem lateral em 375 e 1280 px e mesmo conteúdo nas duas larguras. Não reproduzido nesta simulação. Não prova legibilidade, toque, foco, teclado, ordem de leitura ou operação com login cliente.

## Roteiro de execução real

1. Fixar SHA, ambiente Lovable, navegador, altura do viewport e caso antes de capturar.
2. Em 375 px, capturar topo, meio e fim de cada aba; verificar overflow de documento e dos componentes, não apenas screenshot inicial.
3. Percorrer sete destinos com toque e teclado, confirmar estado ativo, foco visível e identidade da Ana preservada.
4. Conferir nomes longos, botões, cartões expandidos, estados vazios, carregamento, erro e contraste/legibilidade; medir alvos e não supor pela imagem.
5. Inspecionar payloads e conferir cálculo do Radar com a mesma fonte usada no Desk. Incluir total ausente, zero/total positivo e valores válidos.
6. Conferir persistência após salvar/recarregar no Desk, em tarefa autorizada, e leitura correspondente no App. Preparar conteúdo não equivale a autorizá-lo para publicação.
7. Testar login da Ana e isolamento de outra família com contas de teste autorizadas. Não acessar dados reais de outra família para comprovar isolamento.
8. Testar download PDF no fluxo contratual do Desk: arquivo real, não vazio, versão correta, abre e contém os blocos aprovados. Não adicionar contrato ao App para testar PDF.
9. Registrar resultado por caso, evidência, SHA e defeito; não marcar aprovado pelo simples número de capturas.

## Critério de aceite de lançamento

Não aprovar com pessoa=achado/evento, 0/0, 100% por presença ou rótulo de parentesco incorreto. Conteúdo pendente pode manter estado vazio específico, se escopo de lançamento for explicitamente aceito; não declarar paridade completa. Segurança/login/persistência precisam de execução própria. PDF é condição da entrega contratual, não resultado deste teste do App.

## Resultado da simulação

Paridade visual básica: relatada, não reproduzida.  
Paridade funcional e de conteúdo: não aprovada no cenário descrito.  
Login, isolamento, persistência e download: não verificados.  
Prioridade: Claude corrige semântica/cálculo e canos; Lovable corrige apresentação/estados dentro da janela acordada. PP-03/PDF continuam corte urgente separado.

## Próximos passos

Executar primeiro os defeitos independentes de nova publicação (H02/J01/R01/R02/R04/A02/L01). Depois conectar preparação e aprovação de conteúdo. Repetir percurso no mesmo SHA após integração, sem alterar dados ou publicar sem autorização.

## Adendo — conferência estática separada da simulação

Data: 07/10/2026. SHA-base lido: `1b7d901a0aad1d3f24ffa09b1e0308e4a4f6582a`.

Este adendo não modifica os vereditos projetados acima e **não constitui execução real nem aceite**. Apenas compara o relato com o código presente; nenhum arquivo do produto foi alterado, nenhum teste foi executado, nenhuma sessão foi aberta e nenhum conteúdo foi publicado neste registro.

| Item | Código atual | Estado e responsável |
|---|---|---|
| R01 | `src/lib/radar-seis-eixos.ts` retorna percentual `null` e motivo de lacuna quando não há documentos. | Implementação presente; resultado no App/payload ainda não reproduzido neste corte. Claude mantém cálculo/leitor. |
| R02 | Origem retorna percentual `null` e contagem publicada, não 100% por presença. Ainda agrupa publicações `arvore` e `linha_tempo` como origem. | Falha antiga de percentual não deve ser repetida como estado atual comprovado; semântica da origem ainda requer Claude. |
| R03 | O cálculo recebe `pessoasMapeadas` e usa IDs distintos de pessoa, mas conta tipos `arvore` e `linha_tempo`; coerência do universo/publicação precisa de verificação própria. | Não afirmar 6/10 sem nova leitura. Claude: reconciliar base e sanitização. |
| R04 | A média inclui somente eixos com percentual não nulo; ausências não são convertidas em zero nessa média. | Implementação presente; fórmula e base reais ainda precisam de integração e teste no App. |
| A02 | `src/lib/portal-arvore-geracoes.ts` ainda contém `G2 · Avós`, `G3 · Bisavós` e `G4 · Bisavós de bisavós`; a tela consome esses rótulos. | PEDIDO AO CLAUDE: unificar convenção com rótulos neutros de geração, sem inferir parentesco. Não corrigir a biblioteca fora da coordenação. |
| A03 | A tela já prevê mensagem de lacuna para geração exibida sem pessoa publicada e usa `geracoesParaExibir`. | Não equivale a provar G2 visível com o payload atual; repetir no navegador. |

Os pedidos de campos/projeções permanecem em `docs/lovable/canos-faltando.md`; suas afirmações antigas também precisam ser reconciliadas por corte, não usadas como consulta atual ao banco. Não arquivar pendências como comprovadas em uso a partir desta conferência estática.