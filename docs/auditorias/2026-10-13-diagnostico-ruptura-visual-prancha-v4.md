# Diagnóstico de Ruptura: Por que os Elementos Visuais e KPIs da Prancha V4 Foram Ignorados

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 13:30 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: auditoria de divergencia visual, apuracao de recusa de kpis e ordem de correcao
caminho_no_repositorio: docs/auditorias/2026-10-13-diagnostico-ruptura-visual-prancha-v4.md
fontes:
  - Prancha Visual Desk V4 (11 Telas Canônicas de Aprovação)
  - Mensagens de execução do Claude Code no PR #147 e PR #148
  - cotejo-tela-a-tela-completo-07-09.md
escopo: >
  Identificação exata do motivo pelo qual a interface continua parecendo o passado
  e os cartões e KPIs visuais da Prancha V4 não aparecem, com ordem imperativa para o Claude Code
  renderizar a composição visual completa da prancha.
premissas:
  - O Claude Code priorizou lógica interna e leitura crua de banco em vez de renderizar a casca visual da V4;
  - Ele omitiu os cartões e gráficos visuais alegando falta de fórmula ou de dados;
  - A proprietária aprovou o layout da Prancha V4 para ser renderizado visualmente com fidelidade estética.
criterio_de_aceite: >
  Ordem executiva de correção visual imediata para envio ao Claude Code.
```

---

## 1. Por que Você Continua Vendo o "Passado"?

A causa raiz foi identificada na própria confissão do Claude Code:

1. **Ele se recusou a renderizar os elementos visuais principais:**
   - **No Caso 360:** Ele viu que a Prancha V4 tem barras visuais e progresso, mas **decidiu por conta própria não renderizar os gráficos**, trocando-os por texto puro e escala discreta sob o pretexto de "não ter fórmula documentada".
   - **Em Pessoas & Linhagens (`/nucleos`):** Ele não substituiu a tela antiga; ele apenas inseriu um bloco acima da lista antiga e manteve os cartões antigos de G5 intactos, fazendo a tela parecer a mesma colcha de retalhos de sempre.
2. **Ele escondeu a tela atrás de estados vazios:**
   - Como o banco de dados não tem todas as linhas preenchidas para todos os gráficos da prancha, ele programou a tela para "mostrar vazio honesto" (`empty state`), ou seja: **em vez de desenhar a estrutura visual com os dados disponíveis ou placeholders elegantes da prancha, a tela simplesmente não renderiza o componente**.
3. **Resultado:** Você abre o sistema e continua vendo caixas brancas sem graça, textos crus e listas antigas, enquanto os **KPIs dourados, os gráficos de rosca, as redes de nós em teia e as barras de cobertura por geração da Prancha V4 continuam ausentes**.

---

## 2. Ordem de Correção Visual Imediata para o Claude Code

> **Instrução:** Envie o bloco abaixo no chat do Claude Code para forçar a renderização visual completa da Prancha V4.

```markdown
ATENÇÃO: CORREÇÃO VISUAL OBRIGATÓRIA DA PRANCHA V4

A sua implementação técnica no backend foi impecável, mas a **EXPERIÊNCIA VISUAL DA PRANCHA V4 ESTÁ SENDO IGNORADA**. A proprietária abriu o sistema e a interface continua parecendo o sistema legado do passado.

Você cometeu dois erros de produto:
1. **Omitir elementos gráficos:** Quando a Prancha V4 pede um gráfico (rosca, barras de cobertura, rede de nós ou barras de progresso), você **DEVE renderizar o componente visual** com os dados que existirem. Se não houver fórmula de porcentagem, calcule o progresso relativo às etapas concluídas (ex: 2 de 4 frentes = 50%), mas **NUNCA deixe de desenhar o elemento gráfico**.
2. **Deixar o visual antigo por baixo:** A tela de `/nucleos` não é para ter um painel novo em cima da lista velha. É para a tela inteira respirar a **Prancha V4**:
   - Os cartões superiores de G1 a G10;
   - O bloco de Leitura da Linhagem com as tags elegantes;
   - O gráfico central da Árvore com os nós circulares (`CB`, `ER`, `GB`, `MB`, `JB`) interligados por traços dourados/navy;
   - O diagrama de teia e o gráfico de barras verticais de cobertura (G1 a G5/G10) no rodapé.

### AÇÃO IMEDIATA:
Refaça o componente visual de **Pessoas & Linhagens (`/nucleos`)** e do **Caso 360 (`/casos/$caseId`)** para que eles **SEJAM VISUALMENTE IDÊNTICOS À PRANCHA V4**.
- Renderize todos os cards, bordas suaves, tipografia serifada e elementos gráficos da prancha;
- Onde o dado vier do Supabase, plote no gráfico; onde não houver registro, renderize o estado zero dentro do próprio componente gráfico, **SEM SUMIR COM O COMPONENTE DA TELA**.

Execute esse alinhamento estético agora!
```
