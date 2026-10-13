# Plano de Consolidação Canônico: App Cliente, GoLive e Desk Intelligence

```yaml
status: aprovado
versao: v1.0
data: 2026-10-07
data_homologacao: 2026-10-13
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: docs/arquitetura/
caminho_no_repositorio: docs/arquitetura/plano-consolidacao-app-golive-desk.md
fontes_de_evidencia:
  - Inventário autenticado desk-atual-comparacao-v4.pdf
  - Pranchas aprovadas Desk V4
  - Série GoLive (19 rotas operacionais)
  - Evolução visual das 7 abas do App Cliente
  - Memória decisória de CRM, Discovery, Planejador e Produtos-Pai
escopo: >
  Consolidação da autoridade única entre App Cliente, GoLive transitório e Desk Intelligence.
  Eliminação de módulos concorrentes, rebaixamento de listas e tabelas legadas a alimentos contextuais,
  e blindagem das 7 abas do App Cliente com publicação controlada.
premissas:
  - App Cliente é a experiência canônica do usuário (7 abas intactas);
  - GoLive é camada transitória de homologação e absorção funcional;
  - Desk Intelligence é o produto interno único de operação e decisão;
  - Uma única autoridade por entidade: Kanban para tarefas, Lead único para comercial, Planejador por Produto-Pai.
criterio_de_aceite: >
  Estrutura das 7 abas do App blindada;
  absorção ordenada das rotas GoLive sem criação de sistemas paralelos;
  gravação formal do documento no repositório GitHub.
```

---

## 1. Decisão Executiva de Autoridade

1. **App Cliente Permanece Canônico:** A experiência do cliente é composta exclusivamente pelas 7 abas (*Home, Jornada, Radar, Árvore, Documentos, Legado e Conta*), sem menus técnicos ou vazamento de dados internos [file:502].
2. **GoLive É Camada Transitória de Homologação:** Não é um segundo Desk nem um sistema concorrente; serve como catálogo de módulos e rotas a serem absorvidos pelas superfícies canônicas [file:502].
3. **Desk Intelligence É o Produto Interno Único:** O Intelligence é uma camada transversal de sinais, métricas e cálculos, nunca um menu paralelo [file:502].
4. **Comercial com Lead Único:** **CRM Vivo** é a superfície do pipeline; **Painel de Calls** executa o Discovery; o roteiro vive dentro da call/lead [file:502].
5. **CRM Mestre É Legado/Alimento:** Atua como dicionário, lista de validação e histórico; proibido seu uso como área operacional diária [file:502].
6. **Kanban É o Dono do Trabalho:** Tarefas, próximas ações e pendências convergem para um motor único com ID, responsável, prazo e estado [file:502].
7. **Congelamento do OPS:** OPS e exceções entram em modo leitura. Nenhum novo registro é aberto lá [file:502].
8. **Planejador por Produto-Pai:** A jornada familiar é governada pelo **Produto-Pai** (ex.: *Pacote Cidadania Austríaca §58c*). SKUs e catálogos antigos ficam como detalhe contábil e não bloqueiam clientes [file:502].

---

## 2. Matriz de Autoridade e Navegação de Destino

| Macroárea V4 | Superfície Canônica | Subfluxos Incorporados | Papel dos Alimentos / Legados |
|---|---|---|---|
| **Hoje** | Hoje | Radar de prioridades, decisões do dia, acesso ao Kanban | Sinais calculados de ausência e alertas |
| **Comercial** | Comercial / CRM Vivo | Calls, Discovery, propostas e handoff | CRM Mestre e conversão como dicionário de apoio |
| **Casos** | Caso 360, Financeiro, Jurídico | Planejador, formalização, OS, microentregas | Produtos-Pai governam; SKU apenas referência |
| **Pessoas & Famílias** | Pessoa 360, Pessoas & Famílias | Núcleos, consentimentos e linhagens | Ficha única; sem cadastro genealógico paralelo |
| **Pesquisa** | Centro de Pesquisa & Inteligência | Fontes, evidências, relações, achados e relatórios | Bases e tipologias como alimentos dos CTAs |
| **Marketing** | Marketing | Aquisição, campanhas e landing pages | Não toca dados pessoais nem CRM |
| **Configuração** | Configuração Master / Portal | Acessos, aprovações, prontidão e espelho do App | Governança de regras, RLS e integrações |

---

## 3. Absorção da Série GoLive para as Superfícies Canônicas

| Rota GoLive Original | Superfície de Destino Canônica | Tratamento Operacional |
|---|---|---|
| `/golive` | **Hoje** | Absorvido como resumo executivo do dia [file:502] |
| `/golivecomercial` + `/goliveleads` | **Comercial / CRM Vivo** | Ficha e pipeline de lead único [file:502] |
| `/golivekanban` | **Kanban** | Motor transversal de tarefas com 5 estados [file:502] |
| `/golivepessoa` | **Pessoa 360** | Ficha única civil e de contato [file:502] |
| `/golivepessoas` | **Pessoas & Famílias** | Núcleo familiar e representação legal [file:502] |
| `/golivecaso` + `/golivepainel-caso` | **Caso 360** | Ficha guiada de 4 lotes unificada no Ecossistema Casos [file:502] |
| `/goliveradar` | **Radar & Matrizes** | Indicadores derivados (Pesquisa/Hoje) [file:502] |
| `/golivepesquisa` | **Centro de Pesquisa** | Cadeia pergunta → fonte → evidência → achado [file:502] |
| `/goliveformalizacao` + `/golivejuridico`| **Caso / Jurídico** | Proposta → contrato v2 → OS [file:502] |
| `/golivefinanceiro` | **Formalização & Financeiro** | Contratos, parcelas e conciliação Asaas [file:502] |
| `/golivemicroentregas` | **Caso 360 / Kanban** | Entregáveis com aceite e publicação [file:502] |
| `/goliveportal` + `/goliveprontidao` | **Configuração / Portal** | Gestão de publicação e sanitização [file:502] |
| `/goliveapp` | **Espelho Interno do App** | Preview administrativo do `/portal` [file:502] |
| `/goliveconfiguracoes` | **Configuração Master** | Governança de acessos e equipe [file:502] |

---

## 4. Estrutura Canônica das 7 Abas do App Cliente

| Aba | Estrutura Preservada / Resgatada no Mockup (Páginas 3 a 9) |
|---|---|
| **Home** | Painel do Caso familiar, 3 próximas ações, pessoas conectadas e atalho WhatsApp [file:491] |
| **Jornada** | Duas linhas paralelas (Família/Ancestral à esquerda vs. Processo à direita), card de união e fiação dourada [file:491] |
| **Radar** | Polígono central amplo em 70%, 6 dimensões em grade 2x3 e checklist de prontidão [file:491] |
| **Árvore** | Moldura nobre central branca, 8 elos canônicos com destaque dourado e Otto Reimer (1895) [file:491] |
| **Documentos** | Checklist estruturado de 10 atos, tags de status claros ("Em busca cartorária", "Aguardando") e cofre [file:491] |
| **Legado** | Prateleiras de cadernos familiares com capas nobres (crest/brasão) e histórias compartilhadas [file:491] |
| **Conta** | Ficha nominal da contratante, card do Projeto Familiar (3 assinaturas) e hub de atendimento [file:491] |

---

## 5. Fases de Execução da Consolidação

1. **Fase 1 (Congelamento de Escopo e Mapeamento):** Proibir novas telas para CRM, tarefas, OPS ou catálogo bruto; mapear readers/writers [file:502].
2. **Fase 2 (App Cliente):** Resgatar os containers e componentes visuais faltantes das páginas 3 a 9 do mockup normativo, unificando mobile e desktop [file:491].
3. **Fase 3 (Comercial):** CRM Vivo único incorporando Calls e Discovery em passos do mesmo lead [file:502].
4. **Fase 4 (Operação):** Motor único de tarefas no Kanban; OPS colocado estritamente em leitura [file:502].
5. **Fase 5 (Planejador):** Produto-Pai governando a jornada; SKUs antigos congelados como alimento contábil [file:502].
6. **Fase 6 (GoLive):** Absorção das 19 rotas para os 7 ecossistemas; redirecionamento somente após paridade funcional [file:502].
7. **Fase 7 (Intelligence):** Validação das fontes e distribuição dos indicadores acionáveis [file:502].
