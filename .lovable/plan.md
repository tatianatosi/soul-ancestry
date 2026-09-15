# Alinhamento visual completo do App Cliente à prancha aprovada

## Objetivo
Alinhar o App Cliente real e seu espelho interno às referências web e mobile enviadas, preservando exatamente as sete abas, os dados reais e todas as regras atuais de sanitização e publicação.

## Diagnóstico confirmado
- A paleta Pantone vigente já está definida: Navy 2767 C `#13294B`, Navy 534 C `#1B365D`, dourado 4019 C `#C2A84D`, cinza-tinta 2380 C `#28334A` e fundo Cloud Dancer `#F0EEE9`.
- O App real ainda mostra a navegação em grade no topo. A prancha aprovada exige sidebar navy no desktop e barra inferior fixa com ícones no mobile.
- A navegação inativa atual usa texto claro fora de uma superfície navy, reduzindo contraste.
- O espelho interno e o App real ainda não compartilham integralmente a mesma composição visual.
- Home, Jornada, Radar, Árvore, Documentos, Legado e Conta têm partes aderentes, mas ainda divergem em hierarquia, densidade, cartões, indicadores e distribuição web/mobile.

## Implementação
1. **Escopo visual Pantone do App**
   - Aplicar a paleta aprovada somente ao App Cliente real e ao espelho interno, sem trocar tokens globais do Desk.
   - Uniformizar fundo, cartões brancos, bordas, sombras, textos e destaques dourados.
   - Manter Cormorant Garamond nos títulos e Montserrat no corpo.

2. **Shell web e mobile**
   - Desktop: cabeçalho navy compacto, filete dourado e sidebar navy com as sete abas e estado ativo dourado.
   - Mobile: cabeçalho navy e barra inferior fixa com ícone + rótulo para as sete abas.
   - Remover a grade de abas do topo e garantir que conteúdo não fique encoberto pela barra inferior.
   - Preservar exatamente: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.

3. **Hierarquia comum das sete abas**
   - Reproduzir os títulos, subtítulos, etiquetas douradas, cartões claros e cartões navy previstos na prancha.
   - Padronizar raios, bordas, sombras, espaços e estados vazios.
   - Usar duas colunas apenas onde a prancha desktop mostra leitura paralela; mobile permanece em uma coluna.

4. **Ajustes por aba**
   - **Home:** destaque navy do acompanhamento, etapa/progresso, próximo passo, achados e microentrega na ordem aprovada.
   - **Jornada:** faixa-resumo, linha ancestral, aviso em revisão e blocos História/Seu caso em duas colunas no desktop e sequência única no mobile.
   - **Radar:** gráfico de seis dimensões, rótulos legíveis e lista de dimensões no padrão da prancha, sem percentuais inventados.
   - **Árvore:** faixa-resumo e estrutura G1–G5 com conectores e nós compactos; somente relações e nomes publicados.
   - **Documentos:** separar Solicitados, Recebidos, Liberados e Entregues, mantendo vazios e ações existentes.
   - **Legado:** abertura navy e coleções Cadernos, Relatórios e Narrativas conforme a prancha; nenhum conteúdo fictício.
   - **Conta:** Dados da conta, Acompanhamento, Atualizações e Histórico com somente campos permitidos e pagamentos confirmados.

5. **Espelho interno**
   - Reusar a mesma linguagem visual do App real, sem expor navegação, CTA ou informação interna do Desk dentro da experiência do cliente.
   - Manter o espelho como leitura das projeções aprovadas/publicadas do caso e titular.

6. **Validação visual**
   - Comparar App real e espelho com as referências enviadas em desktop 1440×1024 e mobile 390×844.
   - Verificar todas as sete abas, contraste Pantone, ícones, estado ativo, primeira dobra, textos, vazios e ausência de overflow.
   - Entregar capturas antes/depois e uma tabela curta de aderência por aba.

## Limites preservados
- Nenhuma alteração de dados, banco, RLS, migrations, writers, publicação, convite, link mágico, envio ou deploy.
- Nenhuma aba, rota ou conteúdo fictício novo.
- Nenhum nome, relação familiar, documento, pagamento ou percentual inferido.
- As referências enviadas são contrato visual; não serão criadas direções alternativas.

## Critério de conclusão
As sete abas devem reproduzir a mesma identidade Pantone, navegação e hierarquia da prancha em web e mobile, com dados reais ou vazios honestos, sem corte horizontal e sem mudar o comportamento operacional existente.
