# CA-ARQUITETURA-7-TELAS-DESK-SIMPLIFICADO-2026-09-09

Base: mockup aprovado (14 telas: 7 App Cliente + 7 Desk Intelligence). Sem nova auditoria, sem UX/UI, sem oitava aba.

## 1. Matriz das 14 telas

| Tela | Propósito (definido pela Proprietária) | Fonte viva | Ação canônica | Sobreposição | Pronta p/ layout |
|---|---|---|---|---|---|
| App·Home | Painel do caso, progresso, achados recentes | `case_ativacao_bloqueios_reais`, `app_projections` | Ver próximo passo | Nenhuma | Sim |
| App·Jornada | Linha do tempo ancestral × processo | `case_plans`/`entradaDoPlano` | Acompanhar etapa | Nenhuma | Sim |
| App·Radar | Elegibilidade em 6 eixos | projeção sanitizada | Ver detalhe do eixo | Nenhuma | Sim |
| App·Árvore | Árvore G1-G5 | `case_members`/`research_people` | Explorar pessoa | Nenhuma | Sim |
| App·Documentos | Upload, checklist, entregas | `documents`, `onboarding_checklist` | Enviar documento | Nenhuma | Sim |
| App·Legado | Achados + upsell plano | `app_projections` publicadas | Ver achado / assinar | Nenhuma | Sim |
| App·Conta | Perfil, plano, WhatsApp, histórico | `clientes`, `consent_records` | Gerenciar plano | Nenhuma | Sim |
| Desk·Visão Geral | Carteira, Comercial/CRM, decisões | `/painel` (Painel Dia) | Priorizar caso do dia | Nenhuma após fix `/auditoria`→`/qualidade` | Sim |
| Desk·Casos 360 | Pessoa/família, jornada, contrato, pesquisa, entrega por caso | `/casos`+`/casos/$caseId` | Abrir caso | Nenhuma após remoção dos campos comerciais duplicados no CRUD | Sim |
| Desk·Checklist | Execução, tarefas, cadência, responsáveis | `/tarefas` (`tarefas`, `salvarTarefa`) | Concluir tarefa | Nenhuma | Sim |
| Desk·Validação Jurídica | Marcos/decisões de ato formal | `/matriz-juridica` (`versioned_legal_rules`) | Homologar regra | Nenhuma | Sim |
| Desk·Radar Interno | Urgência da carteira + saúde individual | `/qualidade` | Abrir caso crítico | Nenhuma | Sim |
| Desk·Alertas | Sinal sem duplicar tarefa | `case_alerts` (4+2 writers já deduplicados) | Enviar/revisar sinal | **Sem rota própria** — hoje só tabela embutida em `/painel` | **Não** — ver lacuna |
| Desk·Biblioteca Mestre | Centro de inteligência: bases, fontes, pesquisa, conteúdo, microentregas | `/biblioteca` + `/pesquisa-modulo` | Produzir conteúdo do caso | Nenhuma | Sim |

## 2. Correção de rota/CTA/sobreposição

Os 3 únicos itens que impediam função própria em telas do Desk já foram corrigidos na rodada anterior (CA-ÚLTIMA-LIMPEZA, mesma data): CTA morto `/auditoria` em Visão Geral, campos comerciais duplicados no CRUD de Casos 360, botões de troca de aba disfarçados de ação no Contrato (dentro de Casos 360). Nenhum item novo encontrado nesta rodada — não repetido.

## 3. Regra transversal — confirmação

Todas as 7 regras já estavam corretas ou foram corrigidas na rodada CA-ÚLTIMA-LIMPEZA (mesma data): Onboarding = cadência (onboarding_planos execução-only, confirmado); Microentrega = valor liberável (client_deliverables tem escritor ativo, confirmado); Próxima ação = 1/caso (RPC única, confirmado); Tarefa = execução (salvarTarefa + 2 gaps deduplicados); Alerta = sinal sem duplicar tarefa (6 writers, todos deduplicados); Gate = só ato externo (ativação × formalização sem sobreposição, confirmado); app_projections/portal_projecoes = conteúdo cliente-facing (sanitização agora também no servidor).

## 4. Lacuna maior encontrada — registrada, não corrigida

**Alertas não tem rota própria.** No Desk real hoje, "alerta" é uma tabela embutida dentro de `/painel` (Visão Geral) — não existe uma tela dedicada equivalente à `Desk·Alertas` do mockup. Isso não é um bug de rota/CTA corrigível nesta missão (seria criar tela nova, fora do escopo "não criar nada novo"). Registrado para decisão da Proprietária antes do layout real desta tela.
