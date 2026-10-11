# De-Para Arquitetural e Expurgo do Passado: Mockup 17 Páginas, Desk v4 e Série GoLive

```yaml
status: aprovado
versao: v1.1
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: decisão de arquitetura e plano de consolidação
caminho_sugerido_no_repositorio: docs/arquitetura/de-para-mockup-17-paginas-desk-v4-e-expurgo-passado.md
fontes:
  - Mockup canônico de 17 páginas do App Cliente (primeiras páginas aprovadas)
  - Prancha visual Desk Intelligence v4 (inventário autenticado)
  - Série GoLive publicada (19 rotas /golive)
  - docs/arquitetura/plano-consolidacao-desk-golive-app.md
  - CA-CONN-01_base_existente_desk.md e CA-EVO-02_Mapa_Automacoes_Templates.md
escopo: >
  Mapeamento de-para canônico entre o Mockup de 17 páginas do App Cliente e o Desk v4 aprovado,
  com expurgo e blindagem contra resquícios do passado (dados fictícios/demo, dicionários mortos,
  formulários infinitos, telas sem salvamento, auditorias circulares e rotas concorrentes).
  Reintegração completa dos motores vitais do Clube Ancestral: Pesquisa / Centro de Inteligência,
  Marketing, Comercial e Financeiro.
premissas:
  - App Cliente preserva rigorosamente as 7 abas canônicas originadas do Mockup aprovado.
  - Desk v4 é a prancha visual e shell operacional canônico para a equipe interna.
  - A série GoLive fornece os fluxos de trabalho e a vida do cliente sob o shell do Desk.
  - Pesquisa Genealógica, Centro de Inteligência, Comercial, Marketing e Financeiro são entidades vivas com persistência canônica.
  - Proibição absoluta de dados fictícios, mocks sem persistência e duplicidade de rotas.
limites:
  - Documento de especificação e governança; alterações em código e banco seguem fluxo de migração auditada.
criterio_de_aceite: >
  Eliminação do labirinto de rotas (89 URLs reduzidas para 7 entradas canônicas);
  autoridade única de persistência no Supabase; visão do cliente pelo /golive/portal sem dados demonstrativos;
  todas as entidades de pesquisa, inteligência, comercial, marketing e financeiro vivas e conectadas.
```

## 1. Diagnóstico do Trauma Histórico: Causas e Mecanismos de Ruptura

O histórico de desenvolvimento gerou proliferação desordenada e insegurança decorrente de falhas estruturais:
1. **Proliferação desordenada de rotas (89 URLs autenticadas)**: Criação de rotas paralelas em vez de reutilização de componentes (`/ops`, `/tarefas`, `/proximas-acoes`, `/golive/kanban`, `/golive/microentregas`).
2. **Camadas desconectadas e dados que não salvam**: Telas que retinham dados em memória (`useState` local ou arrays estáticos) sem persistência relacional no Supabase.
3. **Dicionários mortos e formulários infinitos**: Telas monótonas de cadastro com dezenas de campos manuais de redigitação, gerando scrolls exaustivos.
4. **Auditorias circulares e perda de autoridade**: Relatórios que apenas apontavam inconsistências sem fornecer rotinas resolutivas.
5. **Apagamento da vida do Clube**: Redução da aplicação a um visualizador estático, ignorando os motores de valor: **Pesquisa Genealógica / Centro de Inteligência**, **Comercial**, **Marketing** e **Financeiro**.

---

## 2. Matriz Canônica De-Para: Mockup 17 Páginas vs. Desk v4 vs. Série GoLive

| Mockup 17 Páginas (App Cliente) | Desk v4 (Prancha Interna) | Série GoLive (/golive) | Centro de Inteligência & Motores Vivos | Decisão de Governança |
|---|---|---|---|---|
| **Aba 1: Home** (Visão geral, projeto familiar, próximo passo, pessoas conectadas) | **Hoje / Cockpit Executivo** (Fila prioritária do dia, pendências críticas) | `/golive` e `/golive/painel-caso` | Orquestrador de Casos (`crm_casos`, `nucleo_membros`) | `/golive/painel-caso` é absorvido como aba "Visão Geral" de Caso 360; App Cliente lê apenas projeção sanitizada. |
| **Aba 2: Jornada** (Linha ancestral + linha processual, marcos) | **Casos 360 -> Jornada** (Marcos contratuais, fases, linha do tempo) | `/golive/caso` e `/golive/microentregas` | Motor de Prazos e Entregáveis (`caso_timeline`, `microentregas`) | Unificação de microentregas no Caso 360; publicação explícita no portal do cliente. |
| **Aba 3: Radar** (6 dimensões de elegibilidade e viabilidade) | **Pesquisa -> Radar & Matrizes** (Análise multi-país, viabilidade jurídica) | `/golive/pesquisa` | Centro de Inteligência Genealógica & Radar Jurídico | Cálculo algorítmico e curadoria técnica no Desk; cliente visualiza índices higienizados sem notas de risco internas. |
| **Aba 4: Árvore** (Genograma por gerações, parentescos e ramos) | **Pessoas & Famílias -> Árvore** (Árvore genealógica completa, nós críticos, fontes) | `/golive/pessoas` e `/golive/pessoa` | Banco Genealógico Vivo (`pessoas`, `parentescos`, registros paroquiais e civis) | `/golive/pessoa` vira drawer contextual de `/golive/pessoas`. App Cliente recebe nós verificados. |
| **Aba 5: Documentos** (Solicitados, Recebidos, Validados, Entregas) | **Pesquisa & Evidências -> Acervo** (Trilha documental, apostilamento, traduções) | `/golive/pesquisa` e subrotas de evidências | Arquivo Digital & Dossiê Técnico (`evidencias_arquivos`, pasta consular) | Unificação do pipeline de documentos; status do documento reflete imediatamente no App Cliente. |
| **Aba 6: Legado** (Narrativas, dossiês, entrevistas, memórias) | **Pesquisa & Studio -> Legado** (Cadernos narrativos, biografias familiares) | `/golive/relatorios` e `/golive/pesquisa` | Studio de Conteúdo e Inteligência Histórica | Geração de relatórios e cadernos de memória no Desk; liberação seletiva para a aba Legado do cliente. |
| **Aba 7: Conta** (Assinatura, parcelas, dados do titular, canais) | **Configuração / Financeiro** (Contrato, faturamento Asaas, webhook, acessos) | `/golive/financeiro`, `/golive/formalizacao`, `/golive/portal` | Motor Financeiro (Asaas) e Motor Contratual Gov.br | Eliminação de telas paralelas; Desk orquestra; App Cliente exibe parcelas e contratos para titulares. |
| *Superfície Externa (Não existe no App)* | **Comercial / CRM Vivo** (Funil, Leads, Discovery, Propostas) | `/golive/comercial` e `/golive/leads` | Motor de Vendas e Conversão (`leads`, `oportunidades`, `discovery_calls`) | `/crm-mestre` é arquivado; `/golive/comercial` assume funil unificado; `/golive/leads` vira subvisão. |
| *Superfície Externa (Não existe no App)* | **Marketing / Aquisição** (Campanhas, origens de tráfego, SEO, canais) | Absorvido em Comercial / Inteligência | Centro de Métricas de Aquisição (`utm_campaigns`, tráfego) | Mapeamento de canal e campanha persistido diretamente no lead sem formulário paralelo. |

---

## 3. O Centro de Inteligência e a Vida do Clube: Reintegração dos Motores Vitais

Para erradicar a desconexão operacional, os 4 motores de suporte à vida do negócio são consolidados no Desk Intelligence v4:

### 3.1. Pesquisa Genealógica & Centro de Inteligência
- **Função**: Coração operacional da empresa. Executa busca em arquivos distritais, certidões paroquiais (ÖStA, FamilySearch, matrizes italianas e portuguesas), análise paleográfica e reconciliação onomástica.
- **Estrutura no Desk v4**: Agrupado na entrada **Pesquisa & Intelligence**.
- **Regra de persistência**: Toda evidência localizada alimenta o repositório central (`evidencias_documentais`) e calcula o avanço do Radar de Elegibilidade.
- **Fluxo para o App Cliente**: Apenas achados aprovados e sanitizados pelo historiador/pesquisador são projetados para o Radar, Árvore e Legado do cliente.

### 3.2. Comercial & Marketing
- **Função**: Captação, qualificação, Discovery Call com roteiro estruturado e emissão de propostas comerciais personalizadas.
- **Estrutura no Desk v4**: Agrupado na entrada **Comercial** (absorvendo `/golive/comercial`, `/leads` e `/calls`).
- **Eliminação de telas mortas**: O `/crm-mestre` deixa de ser tela operacional; vira repositório de taxonomia de elegibilidade. O roteiro de Discovery salva diretamente no registro vivo do cliente (`crm_leads` e `discovery_respostas`).
- **Marketing Integrado**: Origem do lead (Meta Ads, Orgânico, Indicação) é gravada na conversão sem requerer redigitação em planilhas.

### 3.3. Financeiro & Motor Contratual
- **Função**: Geração de faturas, assinaturas recorrentes no Asaas, conciliação bancária por webhook e controle de inadimplência/elegibilidade.
- **Estrutura no Desk v4**: Operado diretamente no módulo canônico do Desk e integrado a cada caso via **Caso 360 -> Financeiro**.
- **Regra de autoridade**: Nenhuma flag financeira é alterada manualmente em formulário infinito; status de pagamento é alimentado via webhook do Asaas ou conciliação bancária auditada.

---

## 4. Plano de Expurgo Sistemático dos Resquícios do Passado

| Resquício do Passado / "Trauma" | Onde Ocorria | Mecanismo de Expurgo | Estado Alvo no Desk v4 |
|---|---|---|---|
| **Demos e Dados Fictícios** | Mock arrays estáticos (`cases.ts`, `demo-data.ts`) | Remoção de fallbacks demonstrativos em produção; flag `demo = false` obrigatória; leitura exclusiva de tabelas Supabase. | Zero mock; interfaces mostram estados vazios com onboarding real quando sem dados. |
| **Dicionários Mortos** | `/crm-mestre`, tabelas isoladas de termos | Centralização de enums e tabelas auxiliares no schema PostgreSQL de governança. | Dicionários alimentam selects contextuais; sem tela própria de trabalho. |
| **Formulários Longos & Scroll Infinito** | Modais gigantes de criação de casos e cadastros | Fragmentação em drawers progressivos, wizard contextual orientado a etapas e autopreenchimento por CNJ/FamilySearch. | Telas respiradas, grids v4 de 3 colunas, paginação e tabs organizadas. |
| **Desks que não salvam** | Telas com `useState` local não conectado | Substituição por mutations React Query com optimistic updates e feedback imediato de gravação no Supabase. | Persistência garantida em cada input (`onBlur` ou botão de ação explícito). |
| **Rotas que não se conversam (89 URLs)** | Endereços duplicados (`/ops`, `/tarefas`, `/kanban`) | Redução rigorosa para 7 rotas mestras com navegação por abas contextuais. | 7 entradas no sidebar: Hoje, Comercial, Casos, Pessoas, Pesquisa, Portal, Configurações. |
| **Telas de Auditoria Sem Fim** | Relatórios estáticos sem ação | Conversão de auditorias em checklists acionáveis diretamente nas telas de trabalho. | Auditoria é ferramenta interna do sistema, não destino do usuário operacional. |

---

## 5. Arquitetura Final de Navegação (As 7 Entradas do Desk v4)

1. **Hoje**: Cockpit executivo, prioridades do dia, alertas calculados, prazos iminentes.
2. **Comercial**: Funil de vendas, Leads, Discovery Calls (roteiro vivo), Propostas e Handoff com Marketing.
3. **Casos**: Gestão de casos ativos (Caso 360), Kanban operacional único, microentregas, timeline e formalização.
4. **Pessoas & Famílias**: Diretório de pessoas, relações de parentesco, genograma interativo e núcleos familiares.
5. **Pesquisa & Intelligence**: Centro de Inteligência genealógica, Radar de elegibilidade, acervo de evidências, transcrições e Studio de Legado.
6. **Portal do Cliente**: Central de Publicação (aprovação e saneamento de dados), gestão de acessos do App Cliente e impersonação `/golive/portal`.
7. **Configurações & Governança**: Equipe, auditoria de acessos, conectores externos (Asaas, Gov.br, Supabase) e parametrizações globais.
