# CA-LOVABLE-P2 — Identidade Visual do Desk Intelligence v1.0

**Projeto:** Clube Ancestral  
**Prioridade:** P2 — melhora leitura, coerência de marca e velocidade operacional; não altera regras de negócio  
**Escopo:** Rodada final de UI/UX do Desk Intelligence  
**Objetivo:** Reaplicar integralmente a identidade Clube Ancestral no Desk interno — especialmente em Gestão de Pesquisa — mantendo todos os fluxos, indicadores, alertas, regras, dados e controles já aprovados.

---

# PROMPT COMPLETO PARA LOVABLE

```text
IMPLEMENTAR P2 — IDENTIDADE CLUBE ANCESTRAL NO DESK INTELLIGENCE.

NÃO AUDITAR DE NOVO. NÃO REABRIR ARQUITETURA. NÃO CRIAR NOVAS ROTAS,
MÓDULOS DE NEGÓCIO, TABELAS, DADOS DEMO, AUTOMAÇÕES OU INTEGRAÇÕES.
NÃO MODIFICAR QUALQUER REGRA DE CRM, SCORE, FINANCEIRO, CONTRATO,
PESQUISA, WHATSAPP, RLS, GATES OU AUDITORIA.

Esta é exclusivamente a rodada final de UI/UX e identidade visual da marca.

OBJETIVO

O App Cliente já possui direção visual aprovada, porém o Desk Intelligence
perdeu identidade e várias áreas internas parecem um SaaS genérico. Reaplicar,
de ponta a ponta, a marca oficial Clube Ancestral ao Desk, sem comprometer
legibilidade de operação densa. A área “Gestão de pesquisa” deve passar a
parecer uma área interna sofisticada e coerente com genealogia, fontes,
evidências e jornada familiar — não uma ferramenta genérica de gestão.

FONTES VISUAIS OBRIGATÓRIAS

1. Usar exclusivamente o logo oficial já presente no projeto:
   clube-ancestral-logo.svg

2. O logo deve ser renderizado pelo componente central existente:
   BrandLogo usando logoAsset.url

3. Não criar logo alternativo, símbolo novo, ícone substituto, imagem gerada,
   fallback genérico ou texto improvisado como marca.

4. Usar o Guia de Marca já disponível no projeto como fonte da tipografia,
   paleta, espaçamento e tom visual. Reutilizar apenas fontes e assets que
   já estejam no repositório/projeto; não baixar fontes ou assets externos.

REFERÊNCIA VISUAL — GUIA DE MARCA

Use a identidade já aprovada do Clube Ancestral como direção:

- Elegância editorial, genealogia, memória, cuidado e método.
- Tons institucionais quentes/neutros definidos nos tokens existentes.
- Tipografia de marca para títulos, navegação e momentos institucionais.
- Tipografia de interface de alta legibilidade para tabelas, campos,
  filtros, números, prazos, filas e registros densos.
- Interface serena, precisa e humana; evitar aparência de painel SaaS
  genérico, excessivamente azul, neon, tecnológico ou cheio de gradientes.
- Não confundir identidade de marca com semântica operacional: cores de
  bloqueio, crítico, atenção, sucesso e informativo mantêm significado
  próprio, acompanhadas de texto e/ou ícone.

IMAGEM DE REFERÊNCIA

A imagem abaixo é referência de DIREÇÃO VISUAL, não é um asset para copiar,
incorporar, baixar, rasterizar ou reproduzir literalmente. Use apenas para
orientar atmosfera, hierarquia, densidade, respiro, tipografia e contraste.

[image:1]

PRESERVAR SEM EXCEÇÃO

- Toda a arquitetura atual do Desk Intelligence.
- Todas as rotas existentes.
- Todas as entidades, queries, schema, migrations, constraints e RLS.
- Dados reais, dados demo e regra de demos excluídas por padrão.
- Gates de contrato, assinatura, pagamento, onboarding, pesquisa e portal.
- Auditoria append-only.
- Score/Radar de Elegibilidade Preliminar e sua linguagem interna.
- Indicadores CAC, CPL, ROI/ROAS, funil, caixa, previsão e “Sem dados suficientes”.
- Fila humana de comunicação, sem disparo automático.
- Cores semânticas de risco, bloqueio, atenção e sucesso.
- Layout e componentes funcionais: somente aprimorar consistência visual,
  espaçamento, tipografia, hierarquia e microcopy não jurídica.

NÃO ALTERAR O APP CLIENTE JÁ APROVADO. Só corrigir um token compartilhado se
houver regressão comprovada e se a alteração preservar integralmente as telas
aprovadas de desktop e mobile.

ÁREAS PRIORITÁRIAS

Aplicar e revisar primeiro, em desktop e mobile:

1. /painel
2. /leads
3. /conversao
4. /casos
5. /pesquisa — Gestão de pesquisa
6. /evidencias
7. /matriz-juridica
8. /financeiro
9. /atendimento
10. /biblioteca
11. /governanca/indicadores
12. /biblioteca-mensagens
13. /piloto

1. SHELL AUTENTICADO E MARCA

- Garantir que o BrandLogo oficial apareça no shell autenticado do Desk,
  navegação lateral, cabeçalho responsivo e estados relevantes de carregamento
  e erro, quando isso fizer sentido.
- Conferir a proporção do logo em desktop, tablet e mobile: sem distorção,
  corte, pixelização, espremimento, transparência incorreta ou fallback.
- Criar respiro apropriado entre marca, navegação e conteúdo operacional.
- O logo não deve competir com o Painel Hoje ou reduzir a área de trabalho.
- Remover cabeçalhos vazios, nomes de produto genéricos, ícones substitutos
  e marcas visuais incoerentes.

2. TIPOGRAFIA

- Identificar e usar as fontes oficiais já aprovadas e já disponíveis no
  projeto, conforme Guia de Marca e tokens existentes.
- Aplicar a tipografia de marca nos títulos de página, títulos de seção,
  navegação, cards de visão geral, estados vazios e momentos institucionais.
- Preservar tipografia de interface de alta legibilidade em tabelas, formulários,
  valores financeiros, indicadores, filtros, datas, prazos, tags e listas densas.
- Padronizar tokens reutilizáveis de font-family, tamanho, peso, line-height,
  letter-spacing, espaçamento vertical e truncamento.
- Não usar fonte decorativa em tabelas, formulários ou informações críticas.
- Garantir hierarquia inequívoca:
  título de página > bloco operacional > item/sinal > metadado/ajuda.

3. PALETA, TOKENS E SEMÂNTICA

- Centralizar e usar tokens de marca já aprovados no CSS/Tailwind existente.
- Reaplicar os tokens em sidebar, cabeçalho, títulos, divisores, bordas,
  superfícies, estados vazios, ícones, links, CTAs internos e componentes.
- Evitar o visual SaaS azul/cinza genérico quando houver token institucional
  oficial aplicável.
- Não substituir semântica operacional pela cor da marca:
  crítico, atenção, sucesso, bloqueio e informação devem continuar distintos.
- Todo estado semântico precisa de texto e/ou ícone além de cor.
- Corrigir contraste insuficiente e não usar texto de baixo contraste em
  superfícies claras ou escuras.

4. COMPONENTES COMPARTILHADOS

Padronizar, sem reescrever funcionalidade:

- AppShell / navegação lateral / cabeçalho mobile.
- BrandLogo.
- PageHeader.
- SectionHeader.
- KPI/IndicatorCard.
- AlertCard e linhas de fila.
- Tabelas e tabelas responsivas.
- Filtros, selects, chips e busca.
- Badges de estado, prioridade e severidade.
- Botões e links internos.
- Drawers, modais e tooltips.
- Empty states, loading/skeleton e mensagens de erro.
- Cards de caso, lead, proposta, pagamento e entrega.

Aplicar o mesmo sistema de espaçamento, borda, raio, sombra, divisores,
tipografia e estados de interação, sem tornar a interface pesada ou decorativa.

5. PAINEL HOJE — /painel

O Painel Hoje continua uma fila de ação. A identidade visual deve reforçar
prioridade e leitura rápida, nunca encobrir os sinais.

- Diferenciar visualmente: crítico/bloqueado, vencido, hoje, próximos 7 dias
  e acompanhamento.
- Cada item deve preservar: motivo escrito, responsável, prazo/idade,
  severidade e ação/rota.
- Cards compactos de resumo devem usar identidade de marca, mas abrir listas
  filtradas e não duplicar a fila.
- Dar destaque tipográfico e espacial ao bloco “Sinais de conversão e
  integridade”, mantendo os demais blocos legíveis.
- Exibir claramente o filtro de demonstrações e seu estado.

6. LEADS E RADAR — /leads

- Organizar a ficha de Discovery em blocos escaneáveis e visualmente coerentes:
  entrada/responsabilidade; call/consentimento/SPIN; Radar; trilha jurídica;
  documentos/linha; pesquisa prévia; decisão/próxima ação.
- O Radar de Elegibilidade Preliminar precisa comunicar faixa, confiança,
  completude, fatores favoráveis, pendências e próxima ação.
- Usar a identidade Clube Ancestral para a leitura editorial do Radar, mas
  preservar avisos explícitos: é triagem interna, não parecer jurídico,
  probabilidade de êxito ou garantia.
- Priorizar visualmente os fatores que exigem ação, sem esconder detalhes
  em uma tela separada.

7. GESTÃO DE PESQUISA — /pesquisa E /evidencias

Esta é a prioridade visual desta rodada.

- Fazer a área parecer uma mesa de trabalho de pesquisa do Clube Ancestral:
  sóbria, cuidadosa, editorial e organizada, sem criar ilustrações ou assets
  novos.
- Reaplicar logo, cabeçalho, tipografia, subtítulos e componentes de marca.
- Usar hierarquia clara entre:
  caso/núcleo; hipótese; fonte; evidência; documento; pendência; tarefa;
  estado de validação.
- Tornar visível a diferença entre hipótese, achado, evidência em validação,
  evidência validada e conteúdo publicável.
- Subtítulo recomendado para a página:
  “Fontes, evidências e próximos passos do caso — uso interno.”
- Não afirmar ou insinuar que pesquisa, fonte ou hipótese prova cidadania,
  rota, direito ou prazo.
- Aplicar estados vazios úteis e no tom da marca. Exemplo:
  “Ainda não há fontes vinculadas a este caso. Registre uma fonte ou crie uma
  tarefa de pesquisa com responsável e prazo.”
- Não criar segunda aba de pesquisa, automação de coleta ou novo agente.

8. CONVERSÃO E FINANCEIRO — /conversao E /financeiro

- Unificar visualmente os cards de funil, caixa, mídia, receita recebida,
  previsão e indicadores sem reduzir a separação semântica entre eles.
- Destacar no Financeiro a leitura principal:
  receita recebida; em aberto; investimento em mídia; despesas operacionais;
  resultado de caixa.
- Manter previsão contratada visualmente separada de caixa e receita recebida.
- Estados “Sem dados suficientes” devem parecer úteis e honestos, com link
  para corrigir classificação/origem/fonte quando aplicável.
- CAC, CPL, ROI e ROAS devem usar cards consistentes, com período, origem e
  status de dados visíveis sem poluir a leitura.
- Usar tipografia tabular/monoespaçada somente se já existir no sistema e
  preservar boa leitura de moeda, período e valores negativos.

9. CASOS, BIBLIOTECA, MATRIZ JURÍDICA E GOVERNANÇA

- /casos: valorizar visualmente o resumo do caso, eixos, gates, próximo marco,
  pendência principal e responsável.
- /biblioteca: reforçar a ideia de acervo governado; ciclo de vigência precisa
  ser visualmente muito claro, sem virar uma área burocrática e fria.
- /matriz-juridica: aplicar marca e leitura editorial, mantendo a distinção
  visível entre referência interna, revisão necessária e conteúdo vigente.
- /governanca/indicadores: continuar como registro técnico interno, porém com
  hierarquia melhor entre código, nome, fórmula, fonte, consumo e estado.
- /biblioteca-mensagens: deixar inequívoco que é fila humana/rascunho,
  não ferramenta de disparo automático.
- /piloto: manter gates, evidências e bloqueios como foco; a identidade visual
  deve tornar o caso-piloto mais compreensível, não mais ornamentado.

10. MICROCOPY

- Revisar somente rótulos genéricos, subtítulos, estados vazios, mensagens de
  ajuda e erros de interface que não alterem conteúdo jurídico, financeiro,
  contratual ou dados reais.
- Usar tom Clube Ancestral: humano, preciso, acolhedor, metódico e sóbrio.
- Evitar jargão de SaaS genérico (“workspace”, “dashboard”, “pipeline”) quando
  houver termo operacional claro em português.
- Manter termos técnicos necessários para auditoria, dados e operação.
- Não usar promessas de resultado, prazo, elegibilidade confirmada ou direito.

11. ACESSIBILIDADE E RESPONSIVIDADE

- Conferir desktop, tablet e mobile nas áreas prioritárias.
- Garantir contraste mínimo AA, foco visível, navegação por teclado e labels
  compreensíveis para leitores de tela onde aplicável.
- Não depender apenas da cor para risco, status ou prioridade.
- Tabelas densas devem continuar navegáveis: cabeçalhos, scroll horizontal
  quando inevitável, prioridade de colunas e leitura de valores preservados.
- Logo, menu e cabeçalho nunca podem cortar, sobrepor conteúdo ou causar
  deslocamento de layout em telas pequenas.

PROIBIÇÕES

- Não criar, enviar ou alterar mensagem de WhatsApp/e-mail.
- Não integrar provedor, webhook, worker ou automação externa.
- Não criar cobrança, contrato, proposta, OS, assinatura, pagamento, dossiê
  ou pesquisa externa.
- Não mudar score, fórmula de indicador, matriz jurídica, dados, status,
  cálculo financeiro, ciclo de conversão ou regras de gate.
- Não remover dados demo, registros históricos ou auditoria.
- Não gerar imagens, mockups, logos ou ilustrações.
- Não substituir o logo oficial por texto ou fallback.
- Não alterar layouts aprovados do App Cliente.

CRITÉRIOS DE ACEITE

1. O Desk autenticado é imediatamente reconhecível como Clube Ancestral em
   desktop e mobile.
2. O logo oficial aparece por BrandLogo/logoAsset.url sem fallback genérico.
3. Tipografia, paleta, navegação, cabeçalhos, cards, tabelas e estados vazios
   são visualmente consistentes nas áreas prioritárias.
4. Gestão de pesquisa e Evidências deixam de parecer SaaS genérico e comunicam
   pesquisa genealógica interna, método e cuidado.
5. Painel Hoje, Radar, Conversão, Financeiro, Casos e Governança mantêm ou
   melhoram a velocidade de leitura.
6. Estados de severidade continuam semanticamente claros e acessíveis.
7. Não ocorre regressão em RLS, regras, dados, gates, indicadores, score,
   fila humana ou App Cliente.
8. Executar typecheck, suíte de testes e build.
9. Entregar changelog visual, rotas/componentes/tokens alterados e capturas
   autenticadas de desktop e mobile das áreas prioritárias.
10. Confirmar por escrito que não houve alteração de dados reais, disparo de
    comunicação, cobrança, contrato, assinatura, pesquisa externa ou
    integração automática.
```
