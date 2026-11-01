# Matriz Canônica de Sanitização e Absorção do GoLive no Desk V4

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 13:40 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: sanitizacao de dados, absorcao de kpis da prancha v4 e saneamento de mock
caminho_no_repositorio: docs/arquitetura/2026-10-13-matriz-sanitizacao-e-absorcao-golive-desk-v4.md
fontes:
  - CA-RESET-01 (Estabilização Operacional Única)
  - CA-04 CRM Mestre, Discovery e Handoff
  - Prancha Visual Desk V4 (11 Telas)
  - Srie GoLive (/golive/*)
escopo: >
  Mapeamento cirúrgico de sanitização: o que pode e o que NÃO pode ser projetado para a tela,
  como cada elemento gráfico e KPI da Prancha V4 é calculado com segurança jurídica,
  e ordem direta para o Claude Code renderizar o visual sem desculpas de dados faltantes.
premissas:
  - A Prancha V4 NÃO pode ter seus cartões ou gráficos ocultados por falta de dados;
  - Sanitização: dados crus de bastidores (tokens, notas de risco, logs internos) não vazam para a UI do cliente;
  - No Desk, os KPIs reais refletem a esteira do caso sem percentuais jurídicos inventados.
criterio_de_aceite: >
  Regra objetiva de preenchimento e renderização para todas as 11 telas da Prancha V4.
```

---

## 1. A Regra de Ouro da Sanitização (O que Pode e o que NÃO Pode Aparecer)

Conforme cravado no documento **`CA-04`** e no **`CA-RESET-01`**, a separação de segurança entre bastidores e interface é [file:405][file:630]:

### 🚫 O QUE É RIGOROSAMENTE PROIBIDO EXIBIR NA TELA:
1. **No App Cliente (`/portal/*`):**
   - Nunca exibir jargões de engenharia: `NO_GO`, `GO_CONDICIONAL`, `blocked_by_contract`, `gate_ativacao` [file:519].
   - Nunca exibir SKUs internos de planilha (ex: `PACOTE-AT-01`), preços provisórios ou anotações de margem [file:523].
   - Nunca expor notas internas da consultora sobre riscos ou dúvidas familiares [file:523].
2. **No Desk Intelligence (`/*`):**
   - Nunca exibir percentuais fictícios de "sucesso jurídico" (a assessoria genealógica não promete deferimento de cidadania) [file:522].
   - Nunca travar a tela com botões cinzas desabilitados (`disabled={true}`) para a proprietária [file:519].

### ✅ O QUE DEVE SER RENDERIZADO VISUALMENTE (A CASCA DA PRANCHA V4):
1. **Onde houver gráfico de Rosca (Dossiê / Situação das Parcelas):**
   - O componente gráfico DEVE ser renderizado [file:619].
   - Se houver dados (ex: 3 confirmados, 2 pendentes), plote as fatias verde e dourada [file:619].
   - Se o caso estiver no início (zero documentos), renderize o gráfico com a fatia neutra (`100% a iniciar`) e legenda explicativa, **JAMAIS suma com o gráfico** [file:619].
2. **Onde houver Gráfico de Barras de Cobertura (G1 a G10):**
   - As barras verticais DEVEM aparecer na tela [file:619].
   - A altura da barra reflete o número de pessoas cadastradas na respectiva geração (ex: G1 = 2 pessoas, G2 = 4 pessoas) [file:619].
3. **Onde houver Árvore Genealógica em Teia:**
   - Os círculos com as iniciais (`CB`, `ER`, `GB`, etc.) conectados por linhas douradas/navy DEVEM ser desenhados [file:619].
   - Eles leem as linhas da tabela `nucleomembros` [file:629].

---

## 2. Ordem Direta de Execução para Enviar ao Claude Code

> **Instrução:** Copie o texto abaixo e cole no terminal do Claude Code.

```markdown
ORDEM EXECUTIVA DE SANITIZAÇÃO E RENDERIZAÇÃO VISUAL:

A proprietária conferiu a arquitetura e determinou a regra oficial para você destravar todas as telas:

1. **A REGRA DO COMPONENTE PERMANENTE:**
   - Nenhum componente visual ou gráfico da Prancha V4 pode ser omitido da tela sob a alegação de "não ter dados suficientes" ou "falta de fórmula".
   - Quando uma consulta retornar vazio ou estado inicial, renderize o componente gráfico desenhado em estado neutro ou inicial (ex: rosca vazia com fatia única cinza-claro, barras de cobertura em zero, nós da árvore com os titulares já cadastrados). O visual da tela deve ser sempre elegante e completo como nos mockups da V4.

2. **SANITIZAÇÃO HOMOLOGADA:**
   - No App do Cliente (`/portal`): proibido vazar nomes de tabelas, gates de backend, termos em inglês (`NO_GO`) ou SKUs internos de precificação. Apenas a jornada humana e acolhedora.
   - No Desk: a barra superior permanece limpa com a busca e o avatar Tatiana Tosi, e as pílulas fixas no topo dão acesso às seções de trabalho.

3. **EXECUÇÃO DA PRÓXIMA TELA:**
   - Avance imediatamente para **Pessoa 360 (`/clientes`)** e consolide **Pessoas & Linhagens (`/nucleos`)**:
   - Garanta que as caixas arredondadas de G1 a G10, a leitura da linhagem e o diagrama de teia sejam desenhados visualmente com os dados que já existem em `nucleomembros` e `crm_pessoas`.

Execute a renderização gráfica completa agora!
```
