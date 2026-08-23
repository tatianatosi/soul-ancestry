# CA-UX-03 — Navegação do Desk Intelligence em 8 grupos

**Versão:** 1.0
**Data:** 23 de agosto de 2026
**Estado:** implementado (navegação e rótulos); dados, banco, RLS e integrações inalterados
**Fonte canônica de navegação:** `src/lib/navegacao-desk.ts`

## 1. As 8 áreas

| # | Grupo | Descrição humana | Rota de entrada |
|---|-------|------------------|-----------------|
| 1 | Hoje | Fila operacional única do dia, prioridades, alertas derivados e atalhos | `/painel` |
| 2 | Comercial | Aquisição, leads, Discovery, propostas e conversão até o handoff | `/leads` |
| 3 | Casos | Casos 360, núcleos, tarefas, exceções, qualidade, onboarding e go-live | `/casos` |
| 4 | Pesquisa | Pesquisa genealógica, evidências, fontes, achados e relatórios F1/F2 | `/pesquisa` |
| 5 | Contratos e financeiro | Escopo aprovado, contratos, OS, catálogo e financeiro | `/contratos` |
| 6 | Cliente | Acessos ao portal, atendimento, solicitações e publicação autorizada | `/acessos-portal` |
| 7 | Governança | Jurídico, radar interno, bibliotecas, auditoria, conformidade e integrações | `/biblioteca` |
| 8 | Administração | Modo Proprietária, equipe, papéis, configurações e verificação de segurança | `/modo-proprietaria` |

## 2. Rotas e módulos mapeados

**1. Hoje** — `/painel` (Painel Hoje + `#encontrar-no-desk`), `/metricas`, `/relatorios`.

**2. Comercial** — `/conversao#marketing` (marketing e aquisição), `/leads` (leads e triagem),
`/calls` (Calls Discovery), `/leads#crm-contatos` (CRM, contatos e interações),
`/proximas-acoes`, `/propostas`, `/conversao` (conversão, follow-up e handoff),
`/clientes`, `/matriz-juridica` (link contextual de bloqueio).

**3. Casos** — `/casos` (Casos 360), `/nucleos`, `/tarefas` (tarefas e entregas internas por caso),
`/ops` (operação), `/ops-excecoes`, `/qualidade` (Radar Interno e Qualidade),
`/piloto` (piloto e go-live), `/piloto-ana`, `/casos#onboarding`, `/matriz-juridica` (contextual).
Rotas contextuais preservadas: `/casos/$caseId`, `/onboarding/$id`.

**4. Pesquisa** — `/pesquisa-modulo` (Pesquisa Genealógica e Evidências), `/pesquisa`
(plano de ação e ficha genealógica), `/nucleos#pessoas-linhagens`,
`/fontes-genealogicas` (fontes, consultas e bases), `/evidencias`, `/privacidade`,
`/qualidade#pesquisa` (validação e pendências), `/relatorios` (achados, microentregas, F1/F2),
`/pesquisa-modulo#assistente-ia`, `/pesquisa#historico`.
Rotas contextuais preservadas: `/plano-acao/$caseId`, `/achados/$caseId`,
`/pessoas-linhagens/$caseId`, `/pesquisa-evidencias/$caseId`, `/biblioteca-evidencias/$caseId`,
`/relatorios-fase/$caseId`, `/pesquisa/$id`, `/pesquisa-modulo/$id`, `/privacidade/$id`.

**5. Contratos e financeiro** — `/escopo-origem`, `/contratos`, `/contrato-parametros`,
`/ordens-servico`, `/catalogo`, `/homologacao-skus`, `/conciliacao-catalogo`,
`/divergencias-catalogo`, `/financeiro`, `/conciliacao-catalogo#bloqueios`.
Rotas contextuais preservadas: `/contratos/$id`, `/contrato-parametros/$id`,
`/casos/$caseId/contrato/preparar`.

**6. Cliente** — `/acessos-portal`, `/atendimento`, `/atendimento#publicacao`,
`/acessos-portal#espelho`.

**7. Governança** — `/matriz-juridica`, `/qualidade`, `/governanca/matriz-conformidade`,
`/governanca/criterios-aceite`, `/governanca/corte-vertical`, `/biblioteca`,
`/biblioteca-mensagens`, `/governanca/contrato-base`, `/governanca/modelo-individual`,
`/governanca/modelo-familiar-casal`, `/governanca/modelos-contratuais`, `/auditoria` (admin),
`/governanca/decisoes`, `/governanca/indicadores`, `/governanca/inventario-recuperacao`,
`/governanca/inventario-patrimonial`, `/governanca/varredura-completude`,
`/governanca/modulos-contextuais`, `/governanca/matriz-equivalencia`,
`/governanca/identificadores`, `/etiquetas`, `/referencia-mockup-desk`,
`/integracoes`, `/importacoes`.

**8. Administração** — `/modo-proprietaria`, `/equipe` (admin), `/configuracoes`,
`/reconfirmar-propriedade`, `/governanca/varredura-administracao`.

## 3. Regra de preservação

- Nenhuma rota foi criada, renomeada, removida ou redirecionada.
- Toda rota que tinha link no menu anterior continua com link direto — verificado pelo
  teste `rotasSemLink()` (deve retornar lista vazia).
- Rotas com parâmetro (`$id`, `$caseId`) permanecem acessíveis por URL e por link
  contextual dentro das telas de listagem, como antes.
- O mockup histórico de 14 abas permanece somente como referência em
  `/referencia-mockup-desk`; não é sistema operacional e não recebe dado real.

## 4. Regra de não duplicação

- Um destino (rota + âncora) não se repete **dentro** de um grupo.
- Repetição **entre** grupos é link contextual declarado em `LINKS_CONTEXTUAIS`
  (`/matriz-juridica`, `/qualidade`, `/relatorios`, `/nucleos`) — não cria fila nova,
  não cria tarefa e não duplica objeto.
- O Painel Hoje continua a única fila diária; alertas e prioridade são sinais derivados
  que abrem o objeto canônico.

## 5. Critérios de aceite

1. Exatamente 8 grupos principais para usuário interno autorizado.
2. Todas as rotas mapeadas continuam acessíveis ao papel correto.
3. Cliente não vê grupos, rotas ou documentos internos (isolamento do App Cliente mantido).
4. Todo link do menu abre rota existente e autorizada.
5. Nenhuma rota operacional removida.
6. Painel Hoje sem duplicação de itens.
7. Rótulos humanos ativos em `/qualidade`, `/matriz-juridica`, `/pesquisa-modulo` e na
   prioridade derivada.
8. Documentos CA-UX-03 existem, são consistentes entre si e não expõem dado pessoal
   nem segredo.

## 6. Antes → depois

| Antes (7 grupos) | Depois (8 grupos) |
|---|---|
| Visão geral | Hoje |
| Comercial | Comercial (agora com marketing e aquisição explícitos) |
| Casos e núcleos | Casos (agora com `/ops` e onboarding visíveis) |
| Pesquisa genealógica | Pesquisa (fluxo completo: investigação → fontes → resultado) |
| Contratos e financeiro | Contratos e financeiro (subgrupos Formalização, Catálogo, Financeiro) |
| App Cliente | Cliente (acessos, atendimento, publicação, espelho) |
| Governança e biblioteca | Governança (conformidade, bibliotecas, registro/risco, integrações) |
| — (itens administrativos dentro de Governança) | Administração (novo 8º grupo) |

## 7. Lacunas conhecidas

| Lacuna | Situação |
|---|---|
| Radar multi-país | Sem fonte canônica; permanece declarado como ausente, sem cálculo simulado. |
| Atividade real de abertura/download no App Cliente | Exibida apenas se houver evento canônico registrado. |
| Espelho do App Cliente | Reutiliza exclusivamente a projeção sanitizada existente; nenhuma cópia é criada. |
| Assistente IA de pesquisa | Exige confirmação explícita de `case_id`, bloqueia dado insuficiente, não pesquisa externamente e não publica. |
| Integrações externas | E-mail bloqueado por DNS; assinatura e cobrança sem credencial — estado `a_confirmar`. |
