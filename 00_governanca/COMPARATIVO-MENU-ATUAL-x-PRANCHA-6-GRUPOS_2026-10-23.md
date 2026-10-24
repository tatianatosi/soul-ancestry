# Comparativo do menu do Desk: atual × prancha de 6 grupos

Data: 2026-10-23
Menu atual: GitHub `main` (`41ce1f73`), arquivo `src/lib/navegacao-desk.ts` → `GRUPOS_DESK`. Está publicado no Lovable desde hoje.
Prancha de 6 grupos: versão que o Claude montou em 19/10 a partir da prancha visual (commit `90571e90`, `SETORES_DESK_V5` + `SUPERFICIES_PRANCHA_V4`). Ela segue a arquitetura de 6 grupos de setembro (`docs/arquitetura/2026-09-10_de-para-mockup-17-desk-6-grupos.md`).
Decisão em vigor: 8 grupos (7 da V4 + Financeiro). Foi decidida em 18/10, mantida na reconciliação de 19/10 e está registrada no `AGENTS.md`.

Observação: nas outras referências visuais salvas, o menu não tem 6 grupos.
- Prancha "seis áreas e subabas" (setembro): 7 itens na lateral (Hoje, Comercial, Casos, Pessoas & Famílias, Pesquisa, Marketing, Configuração).
- Sugestão visual navegável V4 (22/10): os mesmos 7 itens.
- Captura do Desk usada como referência (`visao-dia.jpg`): 8 itens, com "Formalização & Financeiro" e "Governança & Configuração".

---

## 1. Primeiro nível (lateral)

| # | Prancha (6 grupos) | Menu atual (8 grupos) | O que muda |
|---|---|---|---|
| 1 | Hoje | Hoje | Igual |
| 2 | **Marketing & Comercial** | **Comercial** + **Marketing** | Um grupo virou dois |
| 3 | **Pessoas & Casos** | **Casos** + **Pessoas & Famílias** | Um grupo virou dois |
| 4 | **Inteligência & Pesquisa** | **Pesquisa** | Mudou o nome |
| 5 | **Formalização & Financeiro** | **Financeiro**. Contratos foram para Comercial, Ordens de serviço para Casos e Validação jurídica para Configuração | O grupo foi desfeito |
| 6 | **Governança & Administração** | **Configuração** | Mudou o nome e cresceu |
| — | 13 atalhos fixos no topo de toda tela (`SUPERFICIES_PRANCHA_V4`) | Não aparecem. Cada tela mostra só as abas do próprio grupo | Atalhos removidos da tela |

## 2. Tela por tela (onde cada item da prancha está agora)

| Prancha: grupo → item | Rota | Menu atual: grupo → item | Situação |
|---|---|---|---|
| Hoje → Visão do dia | `/painel` | Hoje → Visão Geral | Mesmo grupo, outro nome |
| Hoje → Alertas | `/alertas` | Hoje → Alertas | Igual |
| Hoje → Métricas | `/metricas` | Marketing → Métricas de campanha | Mudou de grupo |
| Mkt & Comercial → CRM Vivo | `/leads` | Comercial → Leads e oportunidades | Outro nome |
| Mkt & Comercial → Mesa de Discovery | `/calls` | Comercial → Discovery | Outro nome |
| Mkt & Comercial → Próximas ações | `/proximas-acoes` | Hoje → Próximas ações | Mudou de grupo |
| Mkt & Comercial → Propostas | `/propostas` | Comercial → Propostas | Igual |
| Mkt & Comercial → Funil & Conversão | `/conversao` | Comercial → Conversão e origem | Outro nome |
| Mkt & Comercial → Roteiro Discovery | `/crm-mestre` | Fora do menu (link dentro de Discovery) | **Saiu do menu** |
| Mkt & Comercial → Aquisição | `/marketing` | Marketing → Dashboard | Mudou de grupo |
| Mkt & Comercial → Biblioteca de mensagens | `/biblioteca-mensagens` | Marketing → Biblioteca de mensagens | Mudou de grupo |
| Pessoas & Casos → Caso 360 | `/casos` | Casos → Todos os casos / Caso 360 | Igual |
| Pessoas & Casos → Kanban operacional | `/tarefas` | Hoje → Tarefas | Mudou de grupo e de nome |
| Pessoas & Casos → Operações | `/ops` | Casos → Operação | Igual |
| Pessoas & Casos → Pessoa 360 | `/clientes` | Pessoas & Famílias → Pessoa 360 | Mudou de grupo |
| Pessoas & Casos → Pessoas & Famílias | `/nucleos` | Pessoas & Famílias → Núcleos familiares | Mudou de grupo |
| Pessoas & Casos → Duplicidades | `/nucleos-duplicidades` | Pessoas & Famílias → Participantes e duplicidades | Mudou de grupo |
| Pessoas & Casos → Radar & Matrizes | `/qualidade` | Configuração → Radar e matrizes | **Foi para Configuração** |
| Pessoas & Casos → Portal do cliente | `/acessos-portal` | Pessoas & Famílias → Acessos ao App Cliente | Mudou de grupo |
| Int. & Pesquisa → Centro de Inteligência | `/pesquisa-modulo` | Pesquisa → Painel de pesquisa | Outro nome |
| Int. & Pesquisa → Microentregas | `/microentregas` | Casos → Entregas e validações | Mudou de grupo |
| Int. & Pesquisa → Fontes | `/fontes-genealogicas` | Pesquisa → Bases e repositórios | Outro nome |
| Int. & Pesquisa → Evidências | `/evidencias` | Pesquisa → Evidências | Igual |
| Int. & Pesquisa → Devolutivas | `/studio-devolutivas` | **Sem item no menu** (o grupo Pesquisa acende, mas não há aba) | **Tela escondida** |
| Int. & Pesquisa → Biblioteca Mestre | `/biblioteca` | Pesquisa → Biblioteca de documentos | Outro nome |
| Form. & Financeiro → Jurídico & Contrato | `/contratos` | Comercial → Contratos e condições | Mudou de grupo |
| Form. & Financeiro → Validação jurídica | `/matriz-juridica` | Configuração → Validação jurídica | Mudou de grupo |
| Form. & Financeiro → Ordens de serviço | `/ordens-servico` | Casos → Ordens de serviço | Mudou de grupo |
| Form. & Financeiro → Financeiro | `/financeiro` | Financeiro → Financeiro de casos | Virou grupo próprio |
| Gov. & Adm. → Configuração & Acesso | `/configuracoes` | Configuração → Perfil institucional | Outro nome |
| Gov. & Adm. → Equipe e acesso | `/equipe` | Configuração → Equipe e acessos | Igual |
| Gov. & Adm. → Catálogos e preços | `/catalogo` | Configuração → Catálogo e preços | Igual |
| Gov. & Adm. → Integrações | `/integracoes` | Configuração → Integrações operacionais | Igual |
| Gov. & Adm. → Exceções operacionais | `/ops-excecoes` | Fora do menu (virou alerta no Hoje) | **Saiu do menu** |

## 3. O que só existe no menu atual (não estava na prancha)

- Hoje: Encontrar no Desk
- Casos: Onboarding e jornada (dentro do Caso 360)
- Pessoas & Famílias: Visão administrativa do App
- Pesquisa: Ficha Única do caso, Solicitações documentais, Relatórios, Assistente de pesquisa
- Configuração: Modelos e templates, Decisões, Dados históricos, Privacidade e consentimento

## 4. Resumo

- 34 itens da prancha: 8 estão iguais, 8 só mudaram de nome, 15 mudaram de grupo, 2 saíram do menu de propósito (Roteiro Discovery, Exceções operacionais) e **1 ficou sem aba (Devolutivas)**.
- Principal diferença: a prancha junta as telas em 6 áreas de negócio. O menu atual separa Comercial/Marketing e Casos/Pessoas, desfaz Formalização e cria Financeiro como grupo próprio.
- Problema que vale corrigir em qualquer cenário: `/studio-devolutivas` não tem aba no menu atual.

## 5. Caminhos possíveis

A. **Manter os 8 grupos** (decisão vigente): só devolver "Devolutivas" como aba em Pesquisa. Mudança pequena.
B. **Voltar para os 6 grupos da prancha:** recuperar o menu do commit `90571e90` numa PR nova (`navegacao-desk.ts`, `shell.tsx`, testes e `AGENTS.md`), com nova decisão registrada. Os atalhos do topo (13 superfícies) podem voltar ou não. Depois do merge, é preciso publicar no Lovable.
