# Política de Onboarding de Países Não Mapeados e Scraping Pontual

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: política operacional e especificação de feature
caminho_sugerido_no_repositorio: docs/politicas/politica-onboarding-paises-novos-e-scraping.md
fontes:
  - docs/arquitetura/dossie-mae-inteligencia-global.md
  - docs/arquitetura/especificacao-skills-varredura-discovery-multipais.md
  - CA04_Artefato_Consolidado_v1.0.1.md
  - docs/politicas/politica-autoridade-operacional.md
escopo: >
  Protocolo operacional padrão para recepção de clientes de países ainda não catalogados no Desk,
  garantindo a ingestão via esteira única (Dump WhatsApp -> Discovery SPIN -> Dossiê-Mãe em 4 Blocos),
  e especificação do mecanismo de scraping pontual sob demanda para captura de certidões e fontes oficiais.
premissas:
  - "Nenhum cliente fica sem fluxo": país novo não gera sistema paralelo, entra pelo tronco comum.
  - O scraping é pontual, assistido e orientado a fontes públicas oficiais ou acervos digitais permitidos.
  - Segurança e conformidade: zero vazamento de dados brutos ou scrapings não tratados para o App Cliente.
criterio_de_aceite: >
  Esteira de 5 passos para novos países definida;
  especificação técnica da feature de scraping pontual (URL + seletor/termo -> parsing -> Dossiê-Mãe);
  rastreabilidade garantida em audit_logs e isolamento por organization_id.
```

## 1. Princípio Fundamental: O Tronco Comum Universal

O Clube Ancestral não cria novos softwares, planilhas paralelas ou rotas dispersas quando surge um cliente de país inédito (ex.: Suíça, Grécia, Lituânia, República Tcheca, Suécia, etc.).
O princípio arquitetural aprovado determina que **a jornada do cliente é uma só**: a variação por país altera apenas o catálogo de arquivos e a base legal, mantendo a mesma esteira de entrada, diagnóstico e montagem do Dossiê-Mãe.

---

## 2. Protocolo de Onboarding de Novo País em 5 Passos

Sempre que ingressar um lead de nacionalidade ainda não coberta, o Desk Intelligence segue o rito padronizado:

```
[ 1. Ingestão de Dump ] ──► [ 2. Roteiro Discovery SPIN ] ──► [ 3. Ficha Técnica do País ] ──► [ 4. Dossiê-Mãe 4 Blocos ] ──► [ 5. Proposta Homologada ]
```

1. **Passo 1 — Ingestão de Dump Bruto (WhatsApp / E-mail)**:
   - A skill `ca-client-go-live` recebe os relatos e documentos iniciais.
   - Aplica-se a varredura semântica universal (datas, nomes, locais, parentesco, registros de imigração) para preencher o Brief Pré-Call.
2. **Passo 2 — Chamada de Discovery (15 min)**:
   - Aplicação do Roteiro Discovery Mestre baseado em SPIN Selling.
   - Identificação do ancestral imigrante, cidade de origem declarada e se houve naturalização voluntária no Brasil.
3. **Passo 3 — Geração da Ficha Técnica do País no Desk**:
   - Cadastro na tabela `genealogical_sources_catalog` com o novo `pais_eixo`.
   - Parametrização da base legal de transmissão (*jus sanguinis*, reparação histórica ou naturalização facilitada).
4. **Passo 4 — Abertura do Dossiê-Mãe Padronizado (4 Blocos)**:
   - *Bloco 1*: Documentos já fornecidos pela família.
   - *Bloco 2*: Mapeamento dos arquivos paroquiais/civis do novo país (ex.: Arquivo Central da cidade de nascimento).
   - *Bloco 3*: Cadeia civil brasileira em inteiro teor.
   - *Bloco 4*: Certidão Negativa de Naturalização (CNN) + traduções juramentadas e apostila.
5. **Passo 5 — Proposta e Enquadramento no Planejador**:
   - Criação da condição comercial vinculada a um dos 9 Produtos-Pai canônicos (ex.: PP-01 Diagnóstico Familiar ou PP-03 Pesquisa Genealógica por Ramo), sem inventar SKUs avulsos fora da governança.

---

## 3. Especificação da Feature: Scraping Pontual Assistido

Para atender pesquisas em cartórios estrangeiros, hemerotecas ou arquivos digitalizados sem API nativa (ex.: portais paroquiais, listas de passageiros, gazetas oficiais e acervos regionais), fica instituído o motor de **Scraping Pontual Assistido**.

### 3.1. Requisitos de Arquitetura da Feature
- **Componente**: Botão `[Captura Rápida de Evidência]` na interface de **Pesquisa & Intelligence -> Acervo** do Desk v4.
- **Entrada (Parâmetros)**:
  - `url_origem`: Link público da página de busca paroquial/arquivística ou registro civil digitalizado.
  - `termo_busca`: Nome do antepassado, ano ou comarca.
  - `tipo_documento`: Batismo, Casamento, Óbito, Censo, Imigração, Gazeta.
  - `case_id`: Vínculo obrigatório ao caso em análise.
- **Execução Backend**:
  - Endpoint seguro de servidor (ex.: `src/lib/scraping-pesquisa.server.ts`).
  - Utilização de headless parser com higienização estrita de HTML para extrair apenas tabelas, imagens de livros digitalizados e metadados arquivísticos.
  - Registro de auditoria em `audit_logs` com timestamp e usuário autenticado (`tati@pluggedresearch.com`).

### 3.2. Destino do Dado Capturado (Sem Criação de Lixo)
O scraping pontual **nunca** grava dados soltos no banco. O resultado é direcionado estritamente para:
1. **`research_evidence_items`**: O extrato textual ou imagem capturada é anexado como evidência preliminar vinculada ao `research_case_id`.
2. **Pasta `02_Evidencias_Europeias` do Dossiê-Mãe**: O arquivo PDF/imagem gerado é catalogado automaticamente na pasta correspondente no Google Drive/Supabase Storage.
3. **Parecer do Assistente de IA**: O texto transcrito do scraping alimenta diretamente o prompt do Claude 3.5 Haiku para validação paleográfica imediata.

---

## 4. Limites Éticos e de Segurança
1. O scraping destina-se exclusivamente a **fontes públicas de consulta e acervos históricos digitalizados**.
2. É proibida a raspagem de dados pessoais de terceiros sem vínculo com a árvore genealógica do caso.
3. Todo dado capturado permanece **100% interno ao Desk**; apenas certidões analisadas e sanitizadas pela Proprietária são liberadas para visualização na aba *Documentos* do App Cliente.
