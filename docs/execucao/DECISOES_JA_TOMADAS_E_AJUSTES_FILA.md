# DECISÕES JÁ TOMADAS PELA PROPRIETÁRIA — registro único e ajustes à fila
Este arquivo PREVALECE sobre FILA_DE_MICROCORTES_AUTORIZADA_v2.md onde houver diferença. Cada decisão traz de onde veio. Ninguém pergunta de novo: quem discordar escreve "REVOGAR <nº>" e a data.

## 1. Decisões que estavam marcadas como pendentes e já estavam decididas

| Nº | Decisão | Onde a Proprietária disse | Efeito na fila |
|---|---|---|---|
| D1 | Menu do Desk = 8 grupos (Hoje, Comercial, Casos, Pessoas & Famílias, Pesquisa, Marketing, Financeiro, Configuração). GoLive mora dentro de Casos. | navegacao-desk.ts: decisão de 18/10 ("7 grupos V4 + Financeiro"), reconciliação de 19/10 (casca derivada de GRUPOS_DESK, 8 grupos) e 23/10 ("o GoLive é a vida completa de cada cliente") | CORRIGE I01: NÃO alinhar a 6 setores. Manter os 8. Atualizar contrato-interface-desk.md e os testes que citam 6 ou 7 grupos. O de-para de 12/10 (6 setores) é anterior e fica superado. |
| D2 | Produtos-pai canônicos = PP-01 a PP-09. Planejador governa a jornada; SKU é legado e contexto, nunca gate. | planejador-produtos-pai.ts: decisão de 07/09; mandato de 17/09; case_plans.produto_pai_id desde 21/09 | E03 usa PP-01..09. O Top 10 e o Top 30 não existem mais. |
| D3 | Top 30 encerrado. Premissas, famílias e tipologias classificam por país e apoiam proposta e orçamento. O catálogo legado não pode sobrepor o catálogo de produtos-pai. | memória de 05/10; mensagem de 03/11 | E05 vale integral: painel-top30, COMPLEMENTOS_TOP30 e a tela CA-06 saem do fluxo. |
| D4 | País é parâmetro do caso (checklist, evidência, marco, risco), não SKU nem coluna de catálogo. | CA-06 de 14/08; de-para de 04/09; Arquitetura Única (regra 4) | E02 vale integral. |
| D5 | A proprietária administradora não é bloqueada em nenhuma ação interna. Ato externo ou irreversível pede confirmação explícita dela mesma, e isso não é bloqueio. | autoridade-operacional.ts (retificação de 18/10); hotfix de autonomia | Bloco A integral. |
| D6 | Contrato vigente = Contrato de Estudo Genealógico v2 completo. O cliente NÃO acessa proposta nem contrato dentro do App; assina pelo portal; dados da proposta ficam na Conta. | commit de 03/10 | CORRIGE B10: "publicar ao cliente" = liberar para assinatura pelo portal. |
| D7 | Banco único = Lovable Cloud. Banco zsxpd congelado desde 20/10. Vercel fora do caminho de produção. | memória de 20 a 23/10 | L02 só remove restos. |
| D8 | Paleta = Pantone aprovado em 12/09 (navy #13294B, dourado #C2A84D, Cloud Dancer #F0EEE9). A paleta OKI anterior não volta. | styles.css (12/09) | A PR #125 fica fora. |
| D9 | App Cliente = 7 abas imutáveis (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta). | de-para de 12/10, seção 0 item 2 | H01 a H07 integral. |
| D10 | Proibido dado fictício e mock sem persistência em produção; vazio honesto no lugar. | de-para de 12/10 | preview-fixtures: APOSENTAR. |
| D11 | Automações e agenda só depois do go-live e com revisão humana. | PRD go-live, Ordem 7 | agenda-assistida fora do lançamento; fontes-documentos-rls APOSENTAR (a regra vive no banco). |
| D12 | Pesquisa é o centro operacional; Biblioteca Mestre + assistente multipaís; Itália é o primeiro módulo de um catálogo europeu. | memória; mensagem de 03/11 | D02 AUTORIZADO: inserir os dados da planilha (sem migration), "[Verificare]" como "Revisar". |
| D13 | A Proprietária quer ler os logs. | mensagem de 03/11 | A06 e A09 AUTORIZADOS. |
| D14 | Fonte canônica de acesso = staff_access. | saas.functions.ts | K04 usa staff_access como origem. |
| D15 | Fonte canônica de pessoa: case_members para os campos civis do caso; Pessoa 360 é a ficha central; fusão por nome exato permitida; unificação automática de identidade na pesquisa nunca. | mascaras-e-validadores.md (P30); inventário de 11/09; commit de 05/10 | J01 a J05 integral. |
| D16 | Pesquisa: evidência = research_evidence_items; hipótese = research_case_hypotheses; raiz = research_cases. Tabelas legadas só leitura. | comentário no pesquisa-assistente.ts (27/09) | K03 integral. |
| D17 | types.ts desatualizado pode ser regenerado. | pedido recorrente | K06 AUTORIZADO via Lovable. |

## 2. Sem registro: padrão adotado (revogue se discordar)

| Nº | Assunto | Padrão adotado | Motivo |
|---|---|---|---|
| P1 | Vocabulário da família de oferta | As 7 famílias da Arquitetura Única como texto em product_catalog.familia_comercial, sem CHECK novo | AGENTS.md proíbe CHECK novo |
| P2 | 8 vínculos "aprovada" com pesquisa pendente | O cliente vê com o rótulo "em confirmação" | hipótese não revisada não vira fato familiar (11/09); a aprovação de visibilidade de 09/10 continua valendo |
| P3 | Fatura, pagamento, eventos financeiros | invoices e payments são a fonte; eventos_financeiros só histórico | sem outro registro |
| P4 | Alertas | case_alerts é a fonte; alerta derivado aponta o trabalho e não duplica | inventário de 11/09 |
| P5 | Os 3 documentos internos da Ana | Retirar do App antes de qualquer convite | realidade de 03/11 |

## 3. O que continua só com a Proprietária (atos, não decisões)
Retirar os 3 documentos da Ana no Desk (Privacidade); registrar a próxima ação real e ativar o plano; enviar o contrato e registrar a assinatura; reconvidar a Ana; dizer "pode publicar".

## 4. Itens da fila v2 que mudam
I01: manter os 8 grupos. B10: liberar para assinatura pelo portal. E03: PP-01..09, sem Top 10. E05, O5, D02, A06, A09, K06, L02: autorizados.
