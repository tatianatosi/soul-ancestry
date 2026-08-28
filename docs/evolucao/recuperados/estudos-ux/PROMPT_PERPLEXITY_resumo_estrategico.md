Contexto para continuar o planejamento do Clube Ancestral (App Cliente + Desk Intelligence)

Não deu para subir o material completo aqui (dois PDFs de auditoria e o histórico integral de um chat
de execução no Lovable — dezenas de milhares de linhas), então este é um resumo denso do estado atual
do produto, extraído direto do código publicado e da documentação de governança que já existe no
repositório. Uso isso como contexto para continuar decisões de produto e priorização com você.

O QUE É O PRODUTO
Clube Ancestral atende pesquisa genealógica e cidadania por descendência (principalmente italiana e
austríaca, com casos alemães/croatas/portugueses também mapeados). Tem duas superfícies: App Cliente
(mobile, o que o cliente final vê — projeção sanitizada, nunca fonte de verdade) e Desk Intelligence
(cockpit interno da equipe, com 14 abas principais: Visão Geral, CRM Vivo, Casos 360, Propostas,
Go-live, Formalização, Checklist AppCliente, Financeiro, Checklist Semanal, Validação Jurídica, Radar
Interno, Alertas, Integrações, Biblioteca Mestre).

EVOLUÇÃO (V1 → V10, jan/2025 a ago/2026)
Cresceu por adição de camadas, sem remover telas aprovadas: protótipo visual → mockup completo →
devolutivas → fundação SaaS (autenticação, portal do cliente, 27 telas de Desk) → CRM vivo → pesquisa
genealógica completa (linhagens, achados, evidências) → governança e mockup canônico → contratos e
catálogo comercial → conciliação de catálogo e correções de acesso → paleta de marca nova e linguagem
humana nos rótulos. Hoje soma 92 telas ativas (14 App Cliente, 6 acesso/equipe, 72 Desk).

ARQUITETURA DE NAVEGAÇÃO DO DESK (achado técnico relevante)
O produto segue uma regra formal (chamada internamente CA-UX-01.2): as 14 abas principais são fixas,
e tudo que poderia virar aba nova vira "módulo contextual" — subrota, painel ou aba interna dentro de
uma das 8 telas principais que os recebem. Existem hoje 38 desses módulos catalogados. Isso é uma boa
disciplina contra inchaço de menu, mas a leitura da lista completa mostrou pelo menos um caso concreto
de duplicação de sinal entre duas abas diferentes (o mesmo marco de prazo "D10/D14" aparece como
módulo separado tanto em Checklist Semanal quanto em Alertas), e uma suspeita mais ampla de que a aba
Alertas em boa parte replica dados que já nascem dentro de Casos 360 e do Checklist, em vez de ser um
feed derivado com regra própria. Isso já está sendo auditado em paralelo no Lovable.

ESTADO DE PRONTIDÃO — O QUE AINDA TRAVA DEPLOY
- Histórico de falha repetida de login da proprietária em produção; a última correção foi um reset
  manual de senha (sem commit de código), então precisa reverificação independente antes de confiar.
- Divergência entre um relatório de comparação de paleta de marca (que dizia "token novo só ativo em
  Pesquisa, resto congelado, depende de aceite tela a tela") e o código publicado (que já tinha os
  valores novos aplicados globalmente no :root). Uma versão mais recente do relatório já corrigiu a
  forma de marcar visualmente "onde mudou" (de preenchimento sólido para hachurado por região), o que
  ajuda a leitura, mas a questão de fundo — se a paleta nova é definitiva e globalmente aceita, ou se
  precisa ser restrita à área de Pesquisa como o texto ainda diz — continua sem decisão registrada.
- Telas do App Cliente mostram, nas mesmas capturas usadas para representar a visão do cliente,
  elementos claramente administrativos (alternância App Cliente/Desk, faixa "MÓDULOS INTERNOS",
  seletor de "caso modelo"). Falta confirmação de que isso nunca aparece no build real do cliente.
- Dez decisões humanas críticas estão formalmente registradas como pendentes no próprio repositório
  (DH-001 a DH-010): SKU e preço não reconciliados, fonte comercial/financeira oficial não definida,
  método de assinatura contratual não homologado, e — a mais relevante para qualquer decisão de
  produto — nenhuma classificação ainda de quais dados no sistema são mock/seed/caso-modelo versus
  dado real de cliente.

O QUE JÁ ESTÁ BEM RESOLVIDO
Nenhuma tela aprovada foi removida em 10 versões (crescimento só por adição). Exclusão física de
registros é proibida por regra de produto (só arquivamento com motivo/autor/data). Existem 8 gates
formais de fonte de verdade (identidade do caso, dados familiares, proposta, SKU/preço, contrato,
cobrança, pesquisa/despesas, App/Desk), cada um com condição de entrada e evidência mínima definida
antes de qualquer decisão de negócio poder se apoiar nele.

MÉTRICAS QUE O PRODUTO JÁ TENTA ACOMPANHAR
Conversão de funil (leads → WhatsApp → diagnóstico → cliente, hoje em ~34% de conversão geral com
queda acentuada entre WhatsApp e diagnóstico), SLAs de resposta e follow-up (4h/24h/72h/96h/120h),
saldo financeiro em aberto por caso, e uma matriz de priorização de casos por elegibilidade × urgência
que hoje fica isolada numa aba pouco visitada em vez de alimentar a rotina diária da equipe.

PERGUNTAS EM ABERTO PARA DECIDIR
1. A paleta de marca nova (navy #2F4B6E, dourado #FCB73A, terracota #9A3A2F) deve virar padrão global
   definitivo, ou deve ficar restrita à área de Pesquisa como planejado originalmente?
2. Alertas deveria continuar existindo como aba própria, ou deveria ser reformulada como uma visão
   filtrada do Checklist Semanal + Casos 360, para não haver duas fontes do mesmo sinal?
3. Dado o volume de decisões comerciais/jurídicas ainda pendentes (SKU, preço, assinatura), faz
   sentido definir uma data-alvo realista de deploy separando "pronto tecnicamente" de "pronto para
   cobrar cliente real"?
4. Que prioridade dar entre destravar as decisões humanas pendentes (DH-001 a DH-010) versus continuar
   evoluindo UX/métricas do Desk — os dois fluxos competem pelo mesmo tempo de equipe agora?

Se puder, me ajude a pensar nessas quatro perguntas com o contexto acima — não preciso que você refaça
a auditoria técnica (isso já está sendo executado no Lovable), só quero apoio na camada de decisão de
produto e priorização.
