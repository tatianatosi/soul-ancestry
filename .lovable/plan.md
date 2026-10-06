# Paridade ponta a ponta do App Cliente com o mockup

## Objetivo
Revisar e ajustar somente as sete telas oficiais do App Cliente para reproduzir a experiência do mockup enviado em 375 px e 1280 px, usando exclusivamente conteúdo sanitizado já publicado para Ana. Nenhum conteúdo, dado ou acesso será publicado ou alterado.

## Situação confirmada
- A navegação oficial já contém exatamente: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
- Proposta e Faturas existem como rotas profundas, mas não aparecem na barra das sete abas.
- Para o caso de Ana estão publicados no App: seis pessoas da Árvore, uma assinatura e uma entrega da jornada. O resumo do caso está em rascunho; proposta e contrato estão arquivados e não serão exibidos.
- O App já corrigiu “Da nossa jornada”, “neste espaço” e o título Legado. A barra inferior mede mais de 44 px de altura.

## Corte de implementação

### 1. Estrutura compartilhada
- Preservar o cabeçalho navy, filete dourado, coluna central e rodapé fixo das sete abas.
- Refinar proporção, espaçamento, tipografia e hierarquia para aproximar 375 px e 1280 px do mockup, sem criar outro shell.
- Garantir rótulos legíveis, alvo mínimo de 44 px, área segura e ausência de rolagem horizontal.

### 2. Home
- Organizar contexto do caso, próximo passo, pessoas conectadas, até três achados, documentos prioritários e “Da nossa jornada”.
- Renderizar cada bloco somente quando o campo sanitizado correspondente existir.
- Quando faltar conteúdo aprovado, mostrar um único estado vazio específico, sem número, prazo ou ação inventados.

### 3. Jornada
- Manter as linhas História familiar, Processo e Memória conectadas visualmente, com Momentos de União entre elas.
- Exibir datas como datas de publicação ou do fato conforme o campo disponível; nunca rotular publicação passada como “Previsto”.
- Mostrar materiais profundos apenas quando realmente liberados; manter “Da nossa jornada” no lugar de “Micro-entrega”.

### 4. Radar
- Manter a teia de seis dimensões.
- Mostrar percentual quando fornecido e “Como calculamos” em cada dimensão com cálculo disponível.
- Em Conexões Familiares, combinar contagem e percentual somente quando houver denominador real.
- Usar “Em preparação” apenas quando não houver percentual nem registro.
- Reservar Países da sua origem/heatmap para projeção publicada; sem ela, registrar a lacuna e não simular o mapa.

### 5. Árvore
- Tornar a composição visual verdadeiramente dinâmica de G1 até a maior geração publicada, sem texto ou teto visual de cinco/dez gerações.
- Usar o subtítulo “As gerações que compõem você”.
- Mostrar somente nomes, gerações e vínculos presentes nos campos sanitizados; vínculo ausente permanece explicitamente indisponível.
- Preparar estados visuais para genograma, pessoas mapeadas e lacunas apenas quando suas projeções existirem.

### 6. Documentos
- Aproximar a hierarquia do mockup para solicitado, pendente, em conferência, recebido e liberado.
- Exibir checklist e contagem somente com lista completa publicada.
- Exibir download somente para arquivo realmente liberado.
- Evitar duplicar conteúdo editorial pertencente ao Legado.

### 7. Legado
- Manter aba e título como “Legado”.
- Organizar conteúdo publicado em coleções coerentes para narrativas, acervo, entrevistas, descobertas e memória.
- Mostrar “Da nossa jornada” para a entrega publicada, sem repetir a mesma peça em várias coleções.
- Oferta de continuidade só aparece com nome, descrição e preço sanitizados publicados.

### 8. Conta
- Exibir acesso, assinatura, plano, continuidade e oferta com preço somente quando publicados.
- Canal da equipe, membros, preferências de aviso e privacidade aparecem apenas com campos sanitizados próprios; caso contrário, usar ausência consolidada e humana.
- Não mostrar contrato, proposta, identificadores, termos internos ou detalhes de cobrança não confirmados.

## Canos faltando
Atualizar `docs/lovable/canos-faltando.md` com a conferência real por elemento:

`elemento | aba | projeção esperada | campos sanitizados necessários | estado atual no App`

Remover afirmações desatualizadas e registrar separadamente contexto, achado, documento prioritário, próximo passo, vínculos, genograma, lacunas, países/ramos, linha ancestral, trilhas, checklist, fontes contextualizadas, acervo, entrevistas, membros, canal, preferências, privacidade, plano e continuidade com preço.

## Limites técnicos
- Alterar somente `src/routes/portal/*`, componentes visuais em `src/components/portal/*` e `docs/lovable/canos-faltando.md`.
- Não editar `src/lib`, testes, migrations, banco, RLS, writers, `AGENTS.md` ou roadmap.
- Não criar rota, aba, projeção, dado, mock, demo ou publicação.
- Se um teste existente impedir o corte, parar e informar o arquivo e a regra; não modificar o teste.

## Validação e entrega
- Rodar os testes visuais e funcionais já existentes sem alterá-los e conferir a compilação da plataforma.
- Abrir as sete abas com a sessão administrativa e o caso real de Ana em 375 px e 1280 px.
- Gerar 14 capturas e duas pranchas consolidadas, conferindo conteúdo publicado, vazios, legibilidade, alvos de toque, console e overflow.
- Entregar a lista de arquivos alterados, o resumo das lacunas e a confirmação explícita de que nenhum teste, `src/lib`, dado ou publicação foi alterado.
