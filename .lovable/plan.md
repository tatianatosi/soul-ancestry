# Painel comercial, entrada de leads e painel do caso

Tudo sobre os dados que já existem. Nenhum registro inventado, nenhuma tabela nova, nenhuma dedução: o que não tem registro continua como "ausente" ou estado vazio.

## 1. Painel comercial (Funil + Kanban + Mesa de Discovery)

A tela Comercial já é esse painel. Ela será organizada como painel único, na ordem:

- Funil por etapa (Lead, Discovery, Call, Proposta, Handoff)
- Leads por origem e por canal de entrada
- Kanban por etapa, com cartões enxutos
- Mesa de Discovery do lead em foco

Sem duplicar tela: quem quiser só o painel abre Comercial; quem quiser trabalhar lead a lead abre Leads.

## 2. Tela de Leads com cadastro

A tela Leads passa a ter o cadastro completo, com nome, origem, etapa, responsável e próximo passo (origem e etapa em listas fechadas). Ao salvar, o lead aparece imediatamente no Funil, no Kanban e na Mesa de Discovery, porque todos leem a mesma fonte.

Discovery e call continuam gravando de verdade. Proposta leva à Formalização; Handoff segue como etapa informativa até o vínculo com o caso ser liberado.

## 3. Fichas da Ana por lote — só ligar o que já existe

Revisão de leitura, sem digitação e sem inferência:

- conferir campo a campo dos lotes A–D contra o registro real (pessoa, núcleo, caso, pesquisa, proposta, contrato, anexos, OS, financeiro, publicação, acesso)
- corrigir ligações que hoje mostram "ausente" mesmo havendo registro gravado
- manter "ausente", "solicitado" ou "em revisão" onde realmente não há dado
- cada campo continua mostrando fonte, responsável, data, visibilidade e tela dona

O que hoje está vazio de verdade (faturas, acesso da cliente, relações aprovadas) continua vazio.

## 4. Painel do caso (Pesquisa, Árvore, Documentos, Legado, Conta)

Dois lugares, com regras de visibilidade diferentes, conforme a política:

- **Desk (novo painel do caso):** reúne os gráficos internos do caso — cobertura de fontes e produção semanal, pessoas e relações aprovadas, situação documental, publicações por aba e por mês, contrato e parcelas. Leitura interna, sem julgamento de mérito.
- **App Cliente:** um resumo agrupado dentro da Home, só com o que já foi publicado e aprovado para a família. Sem aba nova (as sete abas continuam iguais), sem nota interna, sem preço técnico, sem hipótese.

## Detalhes técnicos

- Rotas: `/golive/comercial` (painel), `/golive/leads` (cadastro + ações), nova `/golive/painel-caso`, ajuste pontual em `/golive/app` (Home).
- Escritores reutilizados: `registrarLeadGoLive`, `registrarDiscoveryGoLive`, `registrarCallGoLive`. Nenhum escritor novo.
- Cálculos puros em `src/lib/golive-comercial.ts`, `golive-app.ts` e um módulo de agregação do painel, com testes.
- Sem migration, sem RLS, sem exclusão, sem publicação automática, sem envio ao cliente, sem deploy de produção.
- Entrego prévia autenticada com prints desktop e 375 px e paro para sua aprovação.
