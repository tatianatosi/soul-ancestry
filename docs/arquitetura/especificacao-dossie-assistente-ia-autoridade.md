# Especificação de Arquitetura: Liberação de Autoridade, Persistência do Dossiê e IA Integrada

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: decisão de arquitetura e especificação de motor
caminho_sugerido_no_repositorio: docs/arquitetura/especificacao-dossie-assistente-ia-autoridade.md
fontes:
  - src/routes/api/pesquisa-assistente.ts
  - src/lib/pesquisa-ia.server.ts
  - src/lib/dossie-58c.functions.ts
  - src/components/caso/dossie-consolidado.tsx
  - docs/relatorios/2026-09-05-diagnostico-contexto-bloqueios-e-pesquisa-externa.md
  - Roteiro-Discovery-Ana-Luiza-Cidadania-Austriaca-02-08-2026.pdf
escopo: >
  Retirar as travas impeditivas de autorização na interface interna para a Proprietária,
  estabelecer local canônico de salvamento e visualização dos resultados da IA de pesquisa,
  parametrizar o conceito de Dossiê-Mãe (além do § 58c austríaco, cobrindo Itália, Portugal e demais vias),
  e definir a arquitetura de chatbot/IA de menor custo, alta acurácia e acesso estritamente restrito à dona.
premissas:
  - "Pendência informa, não impede": a Proprietária nunca é bloqueada de operar internamente.
  - O assistente de IA é ferramenta de apoio analítico restrita à visão interna da dona.
  - Resultados da IA devem ser persistidos com botão de aceite/salvamento no histórico do caso.
  - Dossiê-Mãe é a pasta/repositório estruturado do núcleo familiar que varia de acordo com o país/legislação.
criterio_de_aceite: >
  Fim dos bloqueios 409 em /api/pesquisa-assistente para a Proprietária;
  botão explícito 'Salvar Análise no Caso' que persiste o texto gerado em research_reports ou crm_casos;
  integração econômica homologada via API Gateway com modelo de custo ótimo (Claude 3.5 Haiku / GPT-4o-mini).
```

## 1. Liberação Definitiva das Travas de Autorização Interna

### 1.1. O Diagnóstico das Barreiras Artificiais
Em `/api/pesquisa-assistente.ts`, o assistente de pesquisa recusava a execução retornando HTTP `409` quando `estado_de_autorizacao_pesquisa !== 'autorizada'` ou quando o `case_id` não era reconfirmado por digitação redundante.
Essas travas foram desenhadas originalmente para evitar disparos acidentais de bots externos, mas acabaram virando uma barreira cerimonial para a própria Proprietária autenticada (`tati@pluggedresearch.com`).

### 1.2. Regra de Autoridade Aprovada
- **Princípio**: Para a Proprietária (role `admin` / conta oficial), o estado de autorização é informativo de status da jornada comercial, **nunca um bloqueador de execução analítica interna**.
- **Comportamento Alvo**: Se a dona clica em "Analisar com Assistente", o backend executa imediatamente a montagem do dossiê e o streaming, registrando em log quem acionou sem travar a chamada.
- **Remoção de Inputs Redundantes**: Eliminação da exigência de `casoIdConfirmado` manual na UI, aproveitando o contexto de navegação ativo.

---

## 2. Persistência e Onde Salvar os Resultados da Assistente

### 2.1. Onde os Resultados Viviam vs. Onde Devem Viver
Anteriormente, o endpoint `/api/pesquisa-assistente` apenas cuspia um fluxo de texto via streaming na tela. Se o operador trocasse de aba ou recarregasse a página, **a análise inteira se perdia**, pois não havia mutation de salvamento.

### 2.2. Fluxo Canônico de Persistência
1. **Área de Exibição (Desk v4 -> Pesquisa & Intelligence)**:
   - O painel exibe a janela de streaming em tempo real com indicador de conclusão.
2. **Ações Imediatas Pós-Geração**:
   - `[Salvar como Parecer de Pesquisa]`: Grava em `research_reports` vinculado ao `research_case_id` com tipo `diagnostico_ia` e timestamp.
   - `[Adicionar às Hipóteses do Caso]`: Permite extrair trechos e converter em linhas vivas de `research_case_hypotheses`.
   - `[Atualizar Briefing do Caso]`: Salva uma versão resumida diretamente em `crm_casos.brief_interno`.
3. **Visibilidade**:
   - Acesso 100% restrito à equipe interna (Proprietária). O App Cliente jamais lê essas tabelas diretamente.

---

## 3. O Dossiê-Mãe Universal: Além do § 58c Austríaco

O Dossiê-Mãe não é um conceito fixo da Áustria; ele é o **tronco documental comum do núcleo familiar**, adaptável a cada nacionalidade:

| País / Trilha | Legislação / Via | O que compõe o Dossiê-Mãe | Fontes Típicas Integradas |
|---|---|---|---|
| **Áustria** | § 58c StbG (Reparação) | Passaporte pré-1938, prova de judaísmo, Heimatrecht, 11ª Portaria 1941, cadeia de óbitos/casamentos | ÖStA, MA 35, MA 8, APESP, Arolsen Archives |
| **Itália** | *Jus Sanguinis* (Comum / Judicial) | Estratto di Nascita do Dante Causa, Certidão Negativa de Naturalização (CNN), certidões brasileiras em inteiro teor | Paróquias/Comuni italianos, FamilySearch, Arquivo Nacional |
| **Portugal** | Lei da Nacionalidade (Art. 1º, 1, d) | Assento de batismo/nascimento do avô português, fixação de sobrenome, transcrição de casamento | Arquivos Distritais (Tombo.pt), CRC Lisboa |
| **Alemanha** | Art. 116, II / § 15 StAG | Prova de residência alemã, revogação de nacionalidade pelo regime nazista | Bundesarchiv, Standesamt, Standesamtsabfrage |

### 3.1. Ingestão Multicanal do Dossiê
O Dossiê-Mãe é alimentado de forma contínua por 4 fontes:
1. **Dump do WhatsApp / Discovery**: Arquivos brutos e transcrições da entrevista inicial (ex.: o roteiro de 15 min da Ana Luiza).
2. **Drive Compartilhado**: Pasta estruturada do cliente (`00_Dossie_Mae`, `01_Documentos`, `02_Evidencias`).
3. **Pesquisas Perplexity / Acervos Digitais**: Transcrições de livros, links de microfilmes FamilySearch e relatórios consulares.
4. **Entregas F1/F2**: Relatórios consolidados gerados pela equipe.

---

## 4. Escolha da IA / Chatbot Mais Econômica, Rápida e Privada

Para manter os custos baixos (💵 centavos por análise) com máxima privacidade restrita à Proprietária:

### 4.1. Comparativo de Inteligências

| Modelo / Provedor | Custo por 1M Tokens (Entrada / Saída) | Velocidade / Latência | Capacidade Analítica Genealógica | Recomendação |
|---|---|---|---|---|
| **Claude 3.5 Haiku** (Anthropic) | ~$0.25 / $1.25 | Extremamente Rápido (<1s) | Alta precisão paleográfica e estruturação de datas/parentescos | **Melhor Custo-Benefício Geral** |
| **GPT-4o-mini** (OpenAI) | ~$0.15 / $0.60 | Extremamente Rápido (<1s) | Muito bom para resumos de chamadas e triagens de WhatsApp | **Alternativa Mais Barata** |
| **Claude 3.5 Sonnet** (Anthropic) | ~$3.00 / $15.00 | Média (2-4s) | Excelência em pareceres jurídicos complexos e reconciliação | Uso pontual em casos difíceis |

### 4.2. Decisão de Arquitetura do Chatbot Interno
- **Backbone Padrão**: Utilizar **Claude 3.5 Haiku** via API Gateway oficial (ou OpenAI GPT-4o-mini). Um dossiê médio de 10 páginas custará menos de R$ 0,02 por consulta.
- **Privacidade & Segurança**:
  - Parâmetro `stream: true` com autenticação JWT Supabase do usuário interno.
  - Zero exposição no App Cliente.
  - A Proprietária terá um console direto de chat dentro de **Pesquisa & Intelligence -> Assistente**, com a opção de carregar o contexto de qualquer caso com 1 clique.
