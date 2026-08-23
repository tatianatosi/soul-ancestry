# CA-UX-04 — Marketing como 2º grupo e Administração no menu da conta

Data: 23/08/2026 · Escopo: navegação e superfície interna. Nenhuma alteração de banco, RLS,
migration, autenticação, sessão, permissões, integrações, paleta, App Cliente ou deploy.

## 1. Arquitetura final do Desk (8 grupos)

| # | Grupo | Rota de entrada |
|---|---|---|
| 1 | Hoje | `/painel` |
| 2 | **Marketing** | `/marketing` |
| 3 | Comercial | `/leads` |
| 4 | Casos | `/casos` |
| 5 | Pesquisa | `/pesquisa` |
| 6 | Contratos e Financeiro | `/contratos` |
| 7 | Cliente | `/clientes` |
| 8 | Governança | `/biblioteca` |

Administração deixou de ser grupo principal. Não existe nona aba.

## 2. Itens administrativos no menu da conta (`MENU_CONTA`)

Somente descoberta/navegação foi movida. Rotas, guardas e permissões são as mesmas.

| Rota | Rótulo no menu da conta | Permissão |
|---|---|---|
| `/modo-proprietaria` | Modo Proprietária | mesma de antes |
| `/equipe` | Equipe e papéis | `adminOnly` |
| `/configuracoes` | Configurações e preferências | mesma de antes |
| `/etiquetas` | Etiquetas canônicas | mesma de antes |
| `/reconfirmar-propriedade` | Segurança e reconfirmação de propriedade | mesma de antes |
| `/governanca/varredura-administracao` | Verificação administrativa | mesma de antes |

`/integracoes` **permanece em Governança** (subgrupo "Integrações"), junto de `/importacoes`.

## 3. Marketing — seções e fontes

Seções: Visão geral de aquisição · Canais e campanhas · Conteúdo e CTAs · Atribuição e origem ·
Funil de aquisição · Métricas por canal · Aprendizados (+ links contextuais para Comercial).

Fontes reutilizadas, sem criar tabela ou dado: `marketing_campaigns`, `marketing_investments`,
`lead_sources`, `attribution_records`, `conversion_events`, `editorial_content_items`, `leads` e
`payments` apenas como leitura agregada quando já permitido.

## 4. Fronteira Marketing × Comercial

Marketing termina quando o lead é identificado. A partir daí a fonte é Comercial e o destino é
`/leads`. Marketing exibe apenas agregados e links; não mantém segunda lista de lead, etapa de CRM,
proposta, contato, contrato, cobrança, caso ou status comercial. O funil comercial detalhado é
exclusivo de `/conversao`.

## 5. Estados vazios canônicos (`VAZIOS_MARKETING`)

- "Ainda não há campanhas cadastradas."
- "Ainda não há investimento classificado por canal."
- "Registre campanha e UTM antes de analisar atribuição."
- "CAC, ROI e ROAS exigem investimento classificado e atribuição confiável."
- "Não há formulário público ou captura de UTM conectada."
- "WhatsApp ainda não está atribuído como origem de lead."
- "Os leads identificados seguem para o Comercial."

## 6. Origem e atribuição

`CATALOGO_ORIGENS` é o catálogo interno governado por UI (formulário, indicação, manual, whatsapp,
evento, parceria). Valores históricos em texto livre não são apagados nem convertidos: quando fora do
catálogo, a leitura mostra `origem_a_confirmar` (`classificarOrigem`), sem bloquear a operação
comercial. Atribuição UTM permanece vazia até existir captura real. Nenhum formulário público, pixel,
CTA rastreável ou integração foi criado.

## 7. WhatsApp — cinco camadas separadas

1. Origem de lead — só com valor canônico registrado.
2. Histórico comercial — `touchpoints`, `crm_interactions`.
3. Preview/template — Biblioteca de Mensagens.
4. Fila interna — `communication_queue`.
5. Envio externo — inexistente/desligado. Meta, número, template externo, API, webhook, campanha e
   anúncio permanecem não configurados.

## 8. Métricas

Teto de 5 principais (`METRICAS_PRINCIPAIS_MARKETING`): leads por origem, conversões por canal,
investimento por canal, CAC, ROI/ROAS. Secundárias em "Histórico e análise" (fechado por padrão).
CAC/ROI/ROAS retornam exatamente "Sem dados suficientes" sem investimento classificado e atribuição
confiável. Funil, saúde e higiene comercial não são duplicados: ficam em `/conversao`.
