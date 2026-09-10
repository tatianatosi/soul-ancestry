# Plano de produto — Desk Intelligence como o mockup de 17 páginas

**Data:** 2026-09-10  
**Fonte visual:** mockup aprovado de 17 páginas (`clube-ancestral-mockup_5499.pdf`)  
**Fontes normativas lidas de ponta a ponta nesta rodada:** taxonomia canônica; arquitetura 7 telas Desk simplificado; CA-UX-03 (8 grupos como camada operacional, não como face); memória permanente; fonte de verdade de design; decisões canônicas CRM/catálogo/planejador/jornada; prompt-mestre P0–P11; CA-PORTAL-02; estado operacional atual.

Este documento corrige o recorte tático anterior (consertar Calls, exigir `case_id`, mover um item de menu). O produto não é um CRM de 8 buckets com rótulos colados. O produto é o Desk de 7 telas que produz o App Cliente de 7 abas.

---

## 1. O que o mockup desenhou (autoridade visual)

### App Cliente — 7 abas, mobile

| # | Tela | O que a pessoa vê | Motor que alimenta |
|---|---|---|---|
| 1 | **Home** | Caso, progresso da jornada, próximos passos, achados recentes, pessoas conectadas | P6 `app_projections` publicadas + planejador + microentregas |
| 2 | **Jornada** | Duas linhas juntas: história ancestral × processo (kickoff → coleta → reconstrução → validação → requerimento) | P5 achados liberados + P3/P4 marcos do caso |
| 3 | **Radar** | Seis eixos: Documentação, Origem, Conexões Familiares, Elegibilidade, Memória, Legado — síntese, não parecer | Projeção sanitizada; nunca score jurídico |
| 4 | **Árvore** | G1–G5, pessoas conectadas | Pessoas/núcleo publicados; nunca árvore bruta interna |
| 5 | **Documentos** | Upload real, checklist, entregas do caso | `documents` + pedidos + entregas publicadas |
| 6 | **Legado** | Biblioteca de achados + oferta premium ligada a SKU real | Repositório de pesquisa publicado (`legado`) |
| 7 | **Conta** | Perfil, plano, WhatsApp, histórico | `clientes`, consentimento, plano contratado |

Entregas / Relatório Fase 1 / Fase 02 **não** são aba. Abrem a partir da Jornada.

### Desk Intelligence — 7 telas, sidebar única

O mockup **não** tem Marketing, Comercial, Pesquisa, Contratos nem Cliente como primeiro nível. Esses trabalhos existem; moram **dentro** das 7 telas.

| # | Tela | O que a equipe vê | Fonte viva | Ação |
|---|---|---|---|---|
| 1 | **Visão Geral** | 4 KPIs (casos ativos, alertas pendentes, receita do mês, taxa de conversão); funil de leads; tabela de achados pendentes com **Enviar**; prioridades de hoje | `crm_casos`, `leads`, `case_alerts`, planejador, faturas quando houver | Cada número abre a lista; Enviar vai para fila humana, nunca disparo automático |
| 2 | **Casos 360** | Carteira: nome, país alvo, estágio, saúde, próxima ação, ticket | `crm_casos` + `case_plans` + próxima ação canônica + condição comercial | Abrir o caso; pessoa, contrato, pesquisa e App entram **na ficha** |
| 3 | **Checklist** | Três colunas da semana: Confirmar / Em revisão / Pendente crítico | `tarefas` com `caso_id` | Concluir, reprogramar, criar com caso |
| 4 | **Validação Jurídica** | Por caso: país, critério jurídico, geração, elegibilidade humana, observações | `trilhas_juridicas` / matriz + decisão humana | Registrar parecer; não bloqueia rascunho |
| 5 | **Radar Interno** | Matriz Urgência × Elegibilidade (Agir agora / Avaliar / Monitorar / Cultivar) + radar individual | Sinal derivado (`prioridade-matriz`); sem dados = “Sem dados suficientes” | Abrir o caso crítico |
| 6 | **Alertas** | Achados: cliente, tipo, descoberta, espera, status, **Enviar** | `case_alerts` (mesmos writers já deduplicados) | Enviar/revisar sinal; não duplica tarefa |
| 7 | **Biblioteca Mestre** | Produção de conteúdo **por caso**: dossiê, registro, narrativa, com status Publicado / Em produção / Revisão | pesquisa + `app_projections` + biblioteca | Produzir e publicar o que o App Legado/Home mostra |

---

## 2. Onde o planejamento anterior ficou simplista

1. Tratou CA-UX-03 (8 grupos) como **a face do produto**. A taxonomia diz o contrário: agrupamento operacional é camada interna, submenu — nunca substituição silenciosa das 7 telas.
2. Fez o cockpit “operar” com mais atalhos, sem montar as 7 superfícies do mockup (funil, matriz, kanban, carteira com saúde/ticket, alertas com Enviar, biblioteca por caso).
3. Escondeu `/pesquisa` como “sistema anterior”. A proprietária corrigiu: o dossiê é o **repositório que alimenta o Legado** do App Cliente — mora na Biblioteca Mestre, não no menu da conta.
4. Moveu a matriz de prioridade para Casos 360. No mockup ela é a tela **Radar Interno**. Casos 360 mostra saúde **por linha**.
5. O Radar do App foi reduzido a 4 eixos técnicos. O mockup tem **6 eixos** nomeados. Os 4 eixos internos não substituem os 6 da experiência do cliente.
6. Biblioteca Mestre virou dump de governança. No mockup ela é **produção por caso**.

O que **não** muda (já decidido e vigente):

- Não restaurar 14 abas no Desk.
- Não promover Entregas/Fase a aba do App.
- Não inventar tabelas (`case_participants`, `citizenship_cases`, etc.).
- Não mergear PRs #32 #35 #40.
- Não aplicar SQL de timeline sem a proprietária ver efeito e reversibilidade.
- Planejador (`case_plans` + `salvarPlanejadorOperacional`) é a fonte do planejamento ativo.
- Caso (`crm_casos`) é o eixo. Pendência informa, não bloqueia — só falta de identidade/org bloqueia.
- Git ≠ banco ≠ produção.

---

## 3. Cadeia única (motores P0–P11 no produto, não no inventário)

```
Lead (Calls, mesma tabela leads)
→ Discovery
→ Caso canônico (um case_id)
→ Núcleo / pessoas
→ Planejador 0–8 (P7)
→ Proposta → Contrato/OS (P2, com case_id)
→ Onboarding (P4, cadência, sem Magic Link como gatilho)
→ Tarefas + uma próxima ação (P3)
→ Pesquisa / evidências (P5)
→ Biblioteca Mestre produz
→ Publicação sanitizada (P6)
→ App Cliente (7 abas)
→ Alertas e cockpit (P9) fecham o ciclo
```

Nenhuma tela “pronta” se faltar: fonte + escritor + persistência + consumidor + CTA + reload.

---

## 4. De-para: trabalho operacional → tela do mockup

Os 8 grupos CA-UX-03 **continuam existindo como trabalho**. Saem da sidebar de primeiro nível.

| Trabalho CA-UX-03 | Onde mora agora |
|---|---|
| Hoje / cockpit | **Visão Geral** (é a tela) |
| Marketing + funil + Calls + leads + propostas + conversão | **Visão Geral** (funil e Calls) e ficha do caso depois do handoff |
| Casos, núcleos, pessoa 360, contratos, catálogo, portal, App como pessoa | **Casos 360** (carteira + ficha) |
| Tarefas, operação, exceções, próximas ações | **Checklist** |
| Matriz jurídica | **Validação Jurídica** (tela própria, como no mockup) |
| Qualidade / matriz de prioridade | **Radar Interno** (tela própria) |
| Alertas | **Alertas** (tela própria — lacuna que o relatório de 09/09 já tinha registrado) |
| Pesquisa, dossiê do Legado, fontes, evidências, mensagens | **Biblioteca Mestre** |
| Equipe, config, CRM Mestre, dicionário, catálogo 30 consulta | Menu da **conta** (não é 8ª aba) |

Nenhuma rota operacional some. `ROTAS_PRESERVADAS` continua com link no menu principal ou na conta.

---

## 5. Ordem de execução (Desk primeiro, depois o espelho)

### Frente A — Face do Desk (esta entrega)

1. Sidebar com as **7 telas** na ordem do mockup.
2. Visão Geral: KPIs com ação, funil, achados pendentes, prioridades de hoje — dados vivos; ausência = “Sem dados suficientes”, nunca zero inventado.
3. Radar Interno volta a hospedar a matriz Urgência × Elegibilidade.
4. Alertas permanece rota canônica de `case_alerts`; a Visão Geral mostra o recorte; Enviar abre a tela completa / fila humana.
5. Painel de Calls permanece alcançável a partir da Visão Geral (funil). Erro de uma aba não pode derrubar o Desk inteiro em inglês.
6. Dossiê `/pesquisa` no núcleo Biblioteca Mestre, como repositório do Legado.

### Frente B — Cada tela do mockup operar de ponta a ponta

7. Casos 360: colunas nome, país, estágio, saúde, próxima ação, ticket; ficha com síntese e planejador.
8. Checklist: quadro Confirmar / Em revisão / Pendente crítico sobre `tarefas`+`caso_id` (o CRUD continua por baixo, não como face).
9. Validação Jurídica: leitura por caso (país, critério, geração, decisão humana), sem bloquear rascunho.
10. Biblioteca Mestre: grade de conteúdo por caso (dossiê / registro / narrativa) ligando pesquisa → publicação → App Legado.

### Frente C — App Cliente como espelho publicado

11. Staff lê `app_projections` (não a view RLS do cliente). Nav master não ejeta para `/portal`.
12. Home, Jornada, Radar (6 eixos sanitizados), Árvore, Documentos, Legado (repositório), Conta — só o publicado.
13. Contrato-base exige caso. Ana permanece primeira cliente, com bloqueios visíveis, sem cobrança indevida.

Homologação logada em `https://soul-ancestry.vercel.app` é da proprietária. Commit não é prova de produção.

---

## 6. Critério de pronto (produto, não auditoria)

O Desk está no desenho quando a proprietária, logada:

1. Vê **sete** itens na lateral, com os nomes do mockup.
2. Na Visão Geral, um KPI ou um alerta abre trabalho real, e um lead gravado no Calls reaparece no funil após F5.
3. Em Casos 360, a carteira mostra próxima ação e saúde do **mesmo** planejador da ficha.
4. No Checklist, concluir uma tarefa some da coluna e permanece some depois do reload.
5. No Radar Interno, a matriz posiciona casos reais ou declara falta de dados.
6. Em Alertas, um achado de pesquisa aparece; Enviar não dispara WhatsApp/e-mail sozinho.
7. Na Biblioteca Mestre, um item por caso pode ser publicado e aparece no Legado/Home do App.

Enquanto isso não ocorrer na interface, a tela não está pronta — mesmo com teste verde.
