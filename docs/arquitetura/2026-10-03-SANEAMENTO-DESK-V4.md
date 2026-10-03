# Saneamento reversível do Desk V4 — matriz aplicada (03/10/2026)

Diretriz da Proprietária: "SANEAMENTO REVERSÍVEL DO DESK V4 — EXECUTAR, NÃO PLANEJAR".

Nenhuma rota foi apagada. O que saiu do menu continua aberto por endereço direto e
está em `ROTAS_FORA_DO_MENU` / `CLASSIFICACAO_SANEAMENTO_V4` (`src/lib/navegacao-desk.ts`).
Sem migration, sem RLS, sem exclusão de dado ou de fixture.

Achado que explica o atraso: `NAVEGACAO_V4_DESK` e `ROTAS_FORA_DO_MENU` já existiam
desde 02/10 e **nunca tinham sido aplicados** ao `GRUPOS_DESK` que de fato renderiza.
O V4 estava decidido e não executado.

## Menu V4 — primeiro nível (7)

| Grupo | Entrada | Contém |
|---|---|---|
| Hoje | `/painel` | Visão geral, encontrar no Desk, alertas, próximas ações |
| Comercial | `/calls` | Leads, Calls/Mesa Discovery, Propostas, Conversão e handoff |
| Casos | `/casos` | Caso 360, Jornada/Planejador, Documentos, Formalização/Contrato, Financeiro, Histórico, Checklist, Operação |
| Pessoas & Famílias | `/clientes` | Pessoa 360, Núcleos e dossiê-mãe, duplicidades, acessos ao App, visão administrativa |
| Pesquisa | `/pesquisa-modulo` | Pesquisa genealógica (hipóteses e evidências), Ficha Única do caso, Evidências, Fontes contextuais, Entregas, Biblioteca, Assistente |
| Marketing | `/marketing` | Aquisição e origem |
| Configuração | `/configuracoes` | Usuários e permissões, integrações, templates contratuais e de mensagem, decisões, auditoria |

## Matriz de classificação

| Rota | Classificação | Onde passa a viver |
|---|---|---|
| `/painel`, `/alertas`, `/proximas-acoes` | MANTER_V4 | Hoje |
| `/calls`, `/leads`, `/propostas`, `/conversao` | MANTER_V4 | Comercial |
| `/casos`, `/atendimento`, `/contratos`, `/financeiro`, `/tarefas`, `/ops` | MANTER_V4 | Casos |
| `/clientes`, `/nucleos`, `/nucleos-duplicidades`, `/acessos-portal`, `/app-cliente-como-pessoa` | MANTER_V4 | Pessoas & Famílias |
| `/pesquisa-modulo`, `/evidencias`, `/fontes-genealogicas`, `/microentregas`, `/biblioteca` | MANTER_V4 | Pesquisa |
| `/marketing` | MANTER_V4 | Marketing |
| `/configuracoes`, `/equipe`, `/integracoes`, `/governanca/decisoes` | MANTER_V4 | Configuração |
| `/governanca/modelos-contratuais`, `/biblioteca-mensagens` | ABSORVER_EM_ECOSSISTEMA | Configuração › templates |
| `/crm-mestre`, `/governanca/dicionario-calls-crm` | ALIMENTO_CONTEXTUAL | dicionário consumido por Calls/Leads |
| `/etiquetas` | ALIMENTO_CONTEXTUAL | opções de etiqueta onde se etiqueta |
| `/catalogo` | ALIMENTO_CONTEXTUAL | opções de produto na proposta/contrato |
| `/matriz-juridica` | ALIMENTO_CONTEXTUAL | trilha jurídica dentro do caso e da pesquisa |
| `/contrato-parametros`, `/ordens-servico` | ALIMENTO_CONTEXTUAL | dentro de Formalização do caso |
| `/governanca/contrato-base`, `/governanca/modelo-individual`, `/governanca/modelo-familiar-casal` | ALIMENTO_CONTEXTUAL | composição de template |
| `/governanca/catalogo-operacional-30`, `/homologacao-skus`, `/conciliacao-catalogo`, `/divergencias-catalogo`, `/escopo-origem` | LEGADO_SEM_MENU | rota preservada, sem link |
| `/pesquisa` (dossiê legado) | LEGADO_SEM_MENU | substituído por `/pesquisa-modulo` |
| `/relatorios`, `/metricas`, `/importacoes`, `/privacidade`, `/qualidade`, `/ops-excecoes` | LEGADO_SEM_MENU | rota preservada, sem link |
| `/golive/*` (19 rotas) | **decisão pendente da Proprietária** | Desk paralelo inteiro; medido e congelado em teste, não tocado neste corte |

## O que este corte NÃO fez

- Não removeu o botão "Nova tela do Desk" da home pública nem as 19 rotas `/golive/*`:
  qual Desk é o canônico é decisão da Proprietária, da mesma família da dívida
  `painel-dia.tsx` × `/painel` já declarada no `AGENTS.md`.
- Não apagou rota, dado, fixture nem migration.
