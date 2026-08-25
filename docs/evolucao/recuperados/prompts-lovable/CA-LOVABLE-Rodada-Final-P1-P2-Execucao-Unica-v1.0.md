# CA-LOVABLE — Rodada Final P1 + P2 + Ajustes Finais v1.0

**Projeto:** Clube Ancestral  
**Uso previsto:** Rodada única no Lovable — sábado, 22/08/2026  
**Decisão de custo:** Usar os créditos remanescentes somente nesta execução, se necessária. Não comprar créditos adicionais.  
**Objetivo:** Fechar os resíduos P1 de leitura operacional e aplicar o P2 de identidade visual Clube Ancestral no Desk Intelligence, com validação técnica e visual. Depois desta execução, interromper evolução no Lovable e seguir migração/continuidade fora dele.

---

# PROMPT ÚNICO EXECUTÁVEL PARA LOVABLE

```text
IMPLEMENTAR A RODADA FINAL ÚNICA — P1 DE LEITURA OPERACIONAL + P2 DE IDENTIDADE VISUAL + VALIDAÇÃO FINAL.

IMPORTANTE: EXECUTAR DIRETAMENTE. NÃO FAZER AUDITORIA, DESCOBERTA, INVENTÁRIO,
PLANEJAMENTO, EXPLICAÇÃO PRÉVIA, REDESIGN, NOVA ARQUITETURA OU LISTA DO QUE JÁ
EXISTE. NÃO PARAR ANTES DE APLICAR EDIÇÕES.

Este é o último corte no Lovable. Trabalhar apenas no escopo abaixo. Preservar
integralmente a arquitetura, dados e controles já existentes.

================================================================
A. LIMITES INVIOLÁVEIS
================================================================

NÃO criar:
- novos indicadores;
- rotas primárias;
- dashboards paralelos ou redundantes;
- modelos de negócio paralelos;
- dados demo, migrations destrutivas ou importações automáticas;
- automação de WhatsApp/e-mail, webhooks, workers ou integrações externas;
- cobrança, proposta, contrato, OS, assinatura, pagamento, pesquisa externa,
  acesso ao portal, convite ou comunicação real;
- logo alternativo, imagem gerada, mockup, ilustração, asset externo ou fallback
  gráfico genérico.

NÃO alterar:
- Gates de contrato, assinatura, pagamento, onboarding, pesquisa e portal.
- RLS, política de organização, permissão por papel, auditoria append-only,
  dados reais, dados demo ou exclusão de demos por padrão.
- Fontes canônicas: Planilha Mestre/Planejador, financeiro/Asaas, CRM, Desk,
  dossiê, Biblioteca Mestre e matrizes homologadas.
- Fórmulas homologadas de CAC, CPL, ROI, ROAS, caixa, receita recebida,
  previsão contratada, Radar de Elegibilidade ou funil de conversão.
- Estados de conversão, regras de transição, constraints, schema de domínio,
  rotas existentes e regras de ausência de disparo automático.
- App Cliente já aprovado, salvo correção comprovada de token compartilhado,
  sem qualquer regressão nas telas aprovadas.

================================================================
B. CONTEXTO JÁ CONFIRMADO — NÃO RECRIAR
================================================================

Já existem e devem ser preservados:

- src/lib/indicadores-governanca.ts com MANIFESTACAO_INDICADOR para 16 indicadores.
- Rota /governanca/indicadores com tabela canônica de indicadores.
- Painel Hoje em /painel com quatro blocos compactos e clicáveis.
- Leads /leads com Painel de Calls, roteiro vivo e Radar de Elegibilidade
  Preliminar.
- Financeiro /financeiro com realidade de caixa e estados “Sem dados suficientes”.
- Fila humana de comunicação, sem qualquer disparo automático.
- Biblioteca de Mensagens em /biblioteca-mensagens.
- Desk, CRM, Casos, Pesquisa, Evidências, Matriz Jurídica, Contratos, Propostas,
  Atendimento, Governança e Piloto com controles já implantados.

Não recriar esses componentes. Fechar apenas os resíduos P1 abaixo e aplicar a
camada visual P2.

================================================================
C. P1 — FECHAMENTO DA LEITURA OPERACIONAL
================================================================

## C1. Tipagem e dados de manifestação dos indicadores

Em src/lib/indicadores-governanca.ts, ampliar o tipo ManifestacaoIndicador
existente com campos obrigatórios:

- componente_tipo:
  "card" | "fila" | "badge" | "filtro" | "drawer" | "detalhe"

- severidade:
  "P0" | "P1" | "P2"

- sem_dados:
  string

Preencher esses três campos em TODOS os 16 registros existentes, preservando
propriedades já usadas pelas telas. Não renomear campos existentes sem manter
compatibilidade.

Critério de severidade:

- P0: bloqueio real de operação, integridade, segurança ou impossibilidade de
  avanço aplicável.
- P1: risco, gargalo, qualidade insuficiente ou ambiguidade que exige correção.
- P2: contexto, melhoria de leitura, acompanhamento ou governança sem impacto
  operacional imediato.

Para IND-COM-03 — Fila humana de comunicação:

- incluir /biblioteca-mensagens nas telas de consumo, preservando /painel e
  /atendimento;
- não criar envio, botão de disparo, webhook, cron, integração ou ação externa.

A regra sem_dados deve ser específica e honesta por indicador:

- CPL/CAC/ROI/ROAS:
  “Sem dados suficientes: faltam custo de mídia classificado, atribuição válida
  ou eventos financeiros confirmados no período.”
- Indicadores de volume sem eventos registrados:
  informar a ausência de registros no período, sem substituir por zero quando
  a fonte/período for incompleto.
- Indicadores sem dependência de cálculo externo:
  usar “Não aplicável” ou regra concreta de ausência de registro.

## C2. Governança > Indicadores

Na rota /governanca/indicadores:

- Adicionar coluna “Tipo de componente”, renderizada como badge:
  card, fila, badge, filtro, drawer ou detalhe.
- Adicionar coluna “Severidade”, renderizada como badge P0, P1 ou P2.
- Adicionar coluna “Regra de sem dados”, com texto truncado acessível e conteúdo
  completo em tooltip, drawer ou detalhe já existente.
- Preservar as colunas atuais: código, indicador, matriz de origem, definição,
  fonte canônica, telas/uso e demais metadados.
- Não criar tabela paralela, rota nova ou indicador novo.
- Não alterar fórmula, fonte, cálculo ou catálogo canônico dos indicadores.

## C3. Painel Hoje — linhas acionáveis e deduplicação

Na rota /painel, manter exclusivamente estes quatro grupos compactos:

1. Conversão e integridade.
2. Radar e Discovery.
3. Casos e cadência.
4. Comunicação humana.

Se houver bloco separado duplicado chamado “Sinais de conversão e integridade”,
absorver seu conteúdo no grupo correto e remover a duplicidade visual.

Cada linha de sinal deve mostrar, obrigatoriamente:

- motivo escrito e compreensível;
- entidade vinculada: lead, proposta, contrato, pagamento, caso ou contato;
- responsável nominal; quando ausente, exibir “Sem responsável”;
- prazo, idade ou regra temporal relevante;
- badge de severidade P0/P1/P2;
- ação/rota clicável para ficha ou lista filtrada correta.

Deduplicação obrigatória:

- A mesma entidade não pode aparecer em mais de um grupo.
- Manter apenas a manifestação de maior prioridade: P0 > P1 > P2.
- Em empate, usar a prioridade de grupo:
  Conversão e integridade > Radar e Discovery > Casos e cadência > Comunicação humana.
- Preservar a precedência de prazo:
  crítico/bloqueado > vencido > hoje > próximos 7 dias > acompanhamento.

Preservar o filtro “Incluir demonstrações”, desligado por padrão.

================================================================
D. P2 — IDENTIDADE VISUAL CLUBE ANCESTRAL NO DESK
================================================================

## D1. Direção visual e fontes obrigatórias

Objetivo: fazer com que o Desk Intelligence seja imediatamente reconhecido como
Clube Ancestral, em especial Gestão de Pesquisa e Evidências, sem prejudicar a
leitura de operação densa.

Usar exclusivamente:

- Logo oficial existente: clube-ancestral-logo.svg.
- Componente central BrandLogo usando logoAsset.url.
- Guia de Marca e tokens, fontes e assets já existentes no projeto.

Não criar, baixar ou usar fontes/ativos externos. Não criar símbolo, logo, ícone
substituto, fallback genérico, imagem gerada ou ilustração nova.

Direção de marca:

- Elegância editorial; genealogia, memória, cuidado e método.
- Interface serena, precisa, humana e sóbria.
- Evitar aparência de SaaS genérico, azul/neon, excesso de gradiente ou cards
  decorativos que reduzem densidade operacional.
- Tipografia de marca em títulos, navegação e momentos institucionais.
- Tipografia de alta legibilidade em tabelas, campos, filtros, indicadores,
  valores, prazos e filas.
- Cores de crítico, atenção, sucesso, bloqueio e informação são semânticas;
  não substituí-las por cores institucionais. Sempre usar texto e/ou ícone além
  da cor.

## D2. Shell autenticado e logo

- Garantir BrandLogo/logoAsset.url no shell autenticado, sidebar, cabeçalho
  responsivo e estados relevantes de carregamento/erro quando fizer sentido.
- Conferir logo em desktop, tablet e mobile: sem distorção, corte, pixelização,
  perda de contraste, fallback ou sobreposição.
- Criar respiro adequado entre marca, navegação e conteúdo.
- O logo não pode competir com Painel Hoje nem diminuir a área de trabalho.
- Remover cabeçalhos vazios, marcas genéricas, ícones substitutos ou elementos
  incoerentes.

## D3. Tipografia, paleta e tokens

- Identificar fontes aprovadas já disponíveis e usá-las conforme o Guia de
  Marca/tokens existentes.
- Padronizar tokens de font-family, tamanhos, peso, line-height, letter-spacing,
  espaçamento vertical e truncamento.
- Reaplicar tokens institucionais existentes em sidebar, cabeçalho, títulos,
  divisores, bordas, superfícies, estados vazios, ícones, links, CTAs internos,
  filtros e cards.
- Preservar fonte de interface legível em tabelas, valores financeiros,
  indicadores, prazos, campos e listas densas.
- Corrigir contrastes insuficientes, incluindo textos secundários, badges e
  estados vazios.

## D4. Componentes compartilhados

Padronizar visualmente sem reescrever a função de:

- AppShell, sidebar e cabeçalho mobile.
- BrandLogo.
- PageHeader e SectionHeader.
- KPI/IndicatorCard.
- AlertCard e linhas de fila.
- Tabelas e tabelas responsivas.
- Filtros, selects, chips e busca.
- Badges de estado, prioridade e severidade.
- Botões, links internos, drawers, modais e tooltips.
- Empty states, loading/skeleton e mensagens de erro.
- Cards de caso, lead, proposta, pagamento e entrega.

Aplicar sistema coerente de espaçamento, bordas, raios, sombras e estados de
interação. Não tornar a interface ornamental ou pesada.

## D5. Áreas prioritárias

Aplicar e revisar em desktop e mobile:

1. /painel
2. /leads
3. /conversao
4. /casos
5. /pesquisa
6. /evidencias
7. /matriz-juridica
8. /financeiro
9. /atendimento
10. /biblioteca
11. /governanca/indicadores
12. /biblioteca-mensagens
13. /piloto

### /painel

- Reforçar leitura rápida de crítico/bloqueado, vencido, hoje, próximos 7 dias
  e acompanhamento.
- Preservar motivo, responsável, prazo/idade, severidade e rota.
- Aplicar identidade de marca nos cards de resumo sem duplicar a fila.
- Dar boa hierarquia ao grupo Conversão e integridade.
- Mostrar claramente o filtro de demonstrações e seu estado.

### /leads e Radar

- Organizar a ficha de Discovery em blocos escaneáveis:
  entrada/responsabilidade; call/consentimento/SPIN; Radar; trilha jurídica;
  documentos/linha; pesquisa prévia; decisão/próxima ação.
- O Radar deve tornar visíveis faixa, confiança, completude, fatores favoráveis,
  pendências e próximo passo.
- Preservar aviso explícito: triagem interna; não é parecer jurídico,
  probabilidade de êxito ou garantia.
- Priorizar fatores que exigem ação sem esconder detalhes essenciais.

### /pesquisa e /evidencias — prioridade visual máxima

- Fazer a área parecer uma mesa interna de pesquisa do Clube Ancestral:
  sóbria, editorial, organizada e cuidadosa.
- Reaplicar logo, PageHeader, tipografia, subtítulo e componentes de marca.
- Usar hierarquia clara entre caso/núcleo; hipótese; fonte; evidência; documento;
  pendência; tarefa; estado de validação.
- Diferenciar visualmente hipótese, achado, evidência em validação, evidência
  validada e conteúdo publicável.
- Aplicar o subtítulo:
  “Fontes, evidências e próximos passos do caso — uso interno.”
- Não insinuar que pesquisa, fonte, hipótese ou achado prova cidadania, rota,
  direito ou prazo.
- Criar/ajustar estado vazio útil, usando tom de marca:
  “Ainda não há fontes vinculadas a este caso. Registre uma fonte ou crie uma
  tarefa de pesquisa com responsável e prazo.”
- Não criar segunda aba de pesquisa, agente novo, coleta automática ou pesquisa
  externa automática.

### /conversao e /financeiro

- Unificar visualmente funil, caixa, mídia, receita recebida, previsão e
  indicadores, preservando separação semântica.
- Destacar no Financeiro: receita recebida, em aberto, investimento em mídia,
  despesas operacionais e resultado de caixa.
- Manter previsão contratada visualmente separada de caixa e receita recebida.
- Estados “Sem dados suficientes” precisam ser honestos, úteis e, quando
  aplicável, levar ao filtro de classificação/origem/fonte faltante.
- CAC, CPL, ROI e ROAS devem exibir período, fonte e qualidade da atribuição
  sem poluir a leitura.

### /casos, /biblioteca, /matriz-juridica, /governanca/indicadores,
### /biblioteca-mensagens e /piloto

- /casos: valorizar resumo, eixos, gates, próximo marco, pendência principal
  e responsável.
- /biblioteca: reforçar acervo governado e ciclo de vigência de maneira clara,
  sem aparência burocrática/fria.
- /matriz-juridica: leitura editorial, distinguindo referência interna, revisão
  necessária e item vigente.
- /governanca/indicadores: manter registro técnico, melhorando hierarquia entre
  código, nome, fórmula, fonte, consumo, tipo de componente, severidade e regra
  de sem dados.
- /biblioteca-mensagens: tornar inequívoco que se trata de fila humana/rascunho,
  nunca de disparo automático.
- /piloto: deixar gates, evidências e bloqueios mais compreensíveis sem
  ornamentação.

## D6. Microcopy, acessibilidade e responsividade

- Ajustar apenas rótulos genéricos, subtítulos, estados vazios, ajuda e erros
  de interface; não alterar conteúdo jurídico, financeiro, contratual ou dado
  real.
- Tom Clube Ancestral: humano, preciso, acolhedor, metódico e sóbrio.
- Evitar jargão de SaaS genérico quando houver termo operacional claro em
  português; manter termos técnicos necessários à auditoria/operação.
- Garantir contraste AA, foco visível, navegação por teclado e texto/ícone além
  de cor para estados críticos.
- Conferir desktop, tablet e mobile. Logo, menu e cabeçalho não podem cortar,
  sobrepor conteúdo ou causar deslocamento de layout.
- Tabelas densas devem continuar navegáveis, com cabeçalhos, prioridade de
  colunas e scroll horizontal quando inevitável.

================================================================
E. VALIDAÇÃO FINAL OBRIGATÓRIA
================================================================

Após aplicar P1 e P2, executar obrigatoriamente:

1. Typecheck completo, sem erros.

2. Suíte de testes completa, incluindo novos testes para:
   - componente_tipo, severidade e sem_dados nos 16 indicadores;
   - IND-COM-03 também consumido em /biblioteca-mensagens;
   - colunas Tipo de componente, Severidade e Regra de sem dados em
     /governanca/indicadores;
   - deduplicação por severidade e prioridade de grupo no Painel Hoje;
   - linha de sinal contendo motivo, entidade, responsável, prazo/idade,
     severidade e rota de ação;
   - filtro de demonstrações preservado e desligado por padrão;
   - ausência de qualquer disparo automático de comunicação/ação externa;
   - ausência de regressão nas rotas e controles atuais.

3. Build de produção completo, sem erro de transformação, rota ou renderização.

4. Preview autenticado: conferir desktop e mobile, tela a tela, nas rotas:

   /painel
   /leads
   /conversao
   /casos
   /pesquisa
   /evidencias
   /matriz-juridica
   /financeiro
   /atendimento
   /biblioteca
   /governanca/indicadores
   /biblioteca-mensagens
   /piloto

5. Corrigir somente falhas encontradas que sejam:

   - P0: impedem operação, segurança, integridade ou avanço real;
   - P1: geram erro, duplicidade, ambiguidade material ou leitura enganosa.

Não abrir escopo para P2 adicional após a revisão visual, salvo ajuste mínimo
necessário para coerência de marca/legibilidade na tela revisada.

================================================================
F. ENTREGA FINAL EXIGIDA
================================================================

Apresentar ao final, sem texto genérico:

1. Lista de arquivos, rotas, componentes e tokens alterados.
2. Resultado do typecheck.
3. Número total de testes e resultado.
4. Resultado do build.
5. Changelog objetivo dividido em:
   - P1: indicadores, metadados, tabela de governança, sinais e deduplicação;
   - P2: logo, tipografia, paleta, componentes, pesquisa/evidências e
     consistência visual.
6. Capturas autenticadas desktop e mobile das áreas prioritárias.
7. Lista curta de pendências bloqueantes reais, se houver.
8. Confirmação expressa de que não ocorreu:
   - alteração de dados reais;
   - criação, edição ou envio de mensagem;
   - criação de cobrança, proposta, contrato, OS ou assinatura;
   - pagamento, pesquisa externa, convite, acesso ao portal ou integração automática;
   - mudança de RLS, gates, auditoria append-only, fontes canônicas,
     estados de conversão ou fórmulas homologadas.

Ao finalizar, PARAR. Não propor nova auditoria, novo módulo, dashboard,
redesign, automação, expansão de escopo ou nova rodada no Lovable.
```

---

## Critério para executar amanhã

Execute este prompt apenas se os cinco créditos estiverem disponíveis e você puder validar o preview autenticado após a aplicação. Se o Lovable voltar a responder com inventário, auditoria ou planejamento sem editar o código, interrompa a rodada e não gaste créditos adicionais.

## Sequência de uso

1. Cole o prompt integralmente em uma única mensagem no Lovable.
2. Aguarde a implementação e a validação técnica.
3. Entre no preview autenticado para a conferência visual das rotas listadas.
4. Autorize somente correções P0/P1 que forem concretamente encontradas.
5. Encerrar o uso do Lovable após esta rodada e seguir a continuidade técnica fora da plataforma.
