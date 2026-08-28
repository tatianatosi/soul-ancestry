# CA-LOVABLE-VALIDACAO-UI-E-NAVEGACAO-v1.0

**Prioridade:** P0  
**Tipo:** Validação visual e correção restrita de navegação  
**Regra de execução:** Este prompt não cria novos módulos, não cria dados e não executa ação externa.

---

## Contexto

O Desk Intelligence já possui telas, rotas e módulos implementados. Ocorreram alterações sucessivas de menu e existe risco de duplicidade, abas legadas, links em local errado e discrepância entre preview e código.

O objetivo é verificar o que realmente está renderizado no preview e corrigir somente a fonte de navegação, se necessário. Não reconstrua CRM, Casos 360, Pesquisa Genealógica, Núcleos, Onboarding, Catálogo, Migração, Biblioteca Mestre ou App Cliente.

Há dois registros históricos conflitantes de navegação: uma versão menciona sete áreas principais e outra menciona quatorze abas aprovadas. **Não escolha nem imponha uma redução de menu com base em suposição.** Primeiro, identifique a fonte normativa ativa no código e preserve a quantidade de abas que ela define como aprovada no estado atual. O objetivo desta execução é remover apenas duplicidades, abas extras, fallbacks legados e links fora de contexto.

## Objetivo

Validar visualmente a navegação do Desk no preview e assegurar que:

- não existam abas globais duplicadas;
- itens contextuais não virem novas abas principais;
- `/nucleos` seja acessível por contexto, sem criar 15ª aba;
- Biblioteca Mestre e Bases Genealógicas não desapareçam nem sejam substituídas por Log de decisões;
- a navegação desktop e mobile utilizem a mesma fonte de verdade;
- o preview represente o commit atual.

## Escopo obrigatório

### 1. Localizar fonte de verdade

1. Localize o componente, configuração, constante ou árvore normativa que renderiza a navegação global do Desk.
2. Localize qualquer fonte concorrente, fallback, lista legada, array duplicado ou componente alternativo que possa renderizar abas antigas.
3. Identifique qual rota/layout é usado no preview atual.
4. Não altere a quantidade aprovada de abas principais até provar que há duplicidade ou regressão visual.

### 2. Validar navegação global

Confirme no preview, desktop e mobile:

- As abas principais existentes aparecem uma única vez.
- Não há uma aba extra criada por `/nucleos`, Pesquisa Genealógica e Evidências, Formalização, Jornada, Fechamento, Relatórios, Alertas ou módulos de administração.
- Os subitens são apresentados apenas quando a seção correspondente está aberta, conforme a arquitetura atual.
- Não há fallback com menu antigo, especialmente um menu de 14 abas quando a fonte normativa atual tiver sido consolidada de outra forma.
- Não há redução de abas por suposição ou remoção de rota funcional.

### 3. Validar atalhos contextuais

- `/nucleos` deve ser acessível por atalhos contextuais em Casos — lista e ficha — e no Painel Hoje.
- A rota `/nucleos` não deve aparecer como nova aba global.
- Pesquisa Genealógica e Evidências deve continuar vinculada ao caso em `/pesquisa-evidencias/$caseId`.
- Fontes/Consultas e o bloco Fontes e documentos continuam como seções internas da tela de pesquisa do caso.
- Formalização, Fechamento, Jornada, Relatórios F1/F2 e Alertas permanecem nas rotas e contextos existentes; não promover para abas globais.

### 4. Validar Governança e biblioteca

Na seção/aba existente de Governança e biblioteca, confirme que os itens abaixo são distintos, quando definidos na navegação ativa:

- Biblioteca Mestre.
- Bases Genealógicas.
- Matrizes conceituais.
- Indicadores e métricas.
- Log de decisões.
- Corte vertical e fontes.

Regras:

- Biblioteca Mestre não pode desaparecer por ser substituída pelo Log de decisões.
- Bases Genealógicas não pode ser absorvida pela Biblioteca Mestre nem pelo Log de decisões.
- Não criar aba global nova para nenhum desses itens.
- Se algum item ainda não possuir base curada, mostrar estado vazio ou pendência honesta; não inventar conteúdo.

### 5. Validar estados seguros

- Acesso direto a rota interna sem permissão deve retornar estado seguro, sem expor motivo interno ou dados sensíveis.
- O menu não deve expor itens do Desk no App Cliente.
- Rotas inexistentes devem retornar tratamento de rota não encontrada, sem quebrar o shell de navegação.
- Testar atualização completa da página para confirmar que não há dependência de cache de navegação.

## Fora de escopo

Não fazer nenhuma das ações abaixo:

- Não criar, excluir ou migrar tabelas, colunas, triggers, funções, RLS ou dados.
- Não alterar casos, leads, oportunidades, contatos, interações, eventos, produtos, SKUs, dossiês, documentos, fontes ou registros de importação.
- Não criar uma nova aba global.
- Não decidir a troca de 14 para 7 abas, ou de 7 para 14 abas, sem decisão humana e referência normativa inequívoca no código.
- Não recriar Biblioteca Mestre, Bases Genealógicas, Pesquisa Genealógica, Casos 360, CRM, Conversão, Catálogo, Onboarding ou Importações.
- Não fazer qualquer chamada, gravação ou alteração externa em Asaas, Drive, Dropbox, Placego, Planilha Mestre, CRM OPS, e-mail, mensageria ou App Cliente.
- Não executar OCR, IA externa, pesquisa externa, consulta nominal, solicitação de certidão ou contato com instituição.

## Critérios de aceite

A execução só é concluída se todos os itens abaixo forem demonstrados:

1. A fonte única da navegação global foi identificada por arquivo e símbolo/componente.
2. Fontes concorrentes, fallback ou listas duplicadas foram identificadas e, somente se necessário, removidas ou alinhadas.
3. O preview e o código exibem a mesma navegação principal aprovada no estado atual.
4. Não existe aba global adicional criada por `/nucleos`.
5. `/nucleos` funciona pelos atalhos contextuais de Casos e Painel Hoje.
6. Pesquisa Genealógica e Evidências continua contextual ao caso.
7. Biblioteca Mestre, Bases Genealógicas e Log de decisões não foram fundidos indevidamente.
8. Desktop e mobile exibem o mesmo mapa de navegação.
9. Acesso direto não autorizado retorna estado seguro.
10. Typecheck, build e testes existentes passam.
11. Nenhuma operação externa, mutation de dados ou migration foi executada.

## Roteiro mínimo de verificação visual

1. Abrir o preview em janela anônima ou após hard refresh.
2. Abrir e recolher cada aba/seção principal do Desk.
3. Conferir se cada entrada global aparece uma única vez.
4. Abrir Casos e núcleos e validar os atalhos para `/nucleos`.
5. Abrir a ficha de Ana Luiza e validar o link para Pesquisa Genealógica e Evidências.
6. Abrir Fontes/Consultas e confirmar que Fontes e documentos permanece dentro da pesquisa do caso.
7. Abrir Governança e biblioteca e confirmar Biblioteca Mestre, Bases Genealógicas e Log de decisões em locais distintos.
8. Repetir a conferência em viewport mobile.
9. Recarregar a página e repetir a verificação de menu.

## Entrega esperada

Ao concluir, responda somente com:

1. Arquivo(s), componente(s) e símbolo(s) identificados como fonte da navegação.
2. Se havia ou não lista concorrente/fallback/duplicidade, e o que foi corrigido.
3. Número de abas principais efetivamente preservado, com a referência normativa encontrada no código.
4. Rotas e atalhos contextuais testados.
5. Confirmação de Biblioteca Mestre, Bases Genealógicas e Log de decisões como itens distintos ou a pendência exata encontrada.
6. Resultado de typecheck, build e testes.
7. Declaração explícita de que nenhuma migration, dado interno ou ação externa foi executada.
8. Pendências reais que dependam de decisão humana.

Não iniciar outro prompt automaticamente.