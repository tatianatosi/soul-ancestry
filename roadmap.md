# Roadmap

- [x] Consolidar o kit visual exportável aprovado, com tokens Pantone isolados e componentes reutilizáveis.
- [x] Preservar as 15 prévias e as 7 telas canônicas do App Cliente.
- [x] Conectar Hoje, CRM, Caso 360, Pesquisa, Biblioteca, Financeiro e Jurídico aos dados reais existentes, sem criar registros fictícios.
- [x] Gerar pacote exportável com código, assets locais e dependências mínimas.
- [x] Validar compilação e integridade do pacote exportável. A validação autenticada de navegador depende de uma sessão de proprietária disponível.
- [x] Aplicar o kit em Pessoas & Famílias com resumo visual derivado dos registros reais.
- [x] Aplicar o kit em Configuração & Acesso Master sem alterar autoridade ou papéis.
- [x] Aplicar o kit na área de Documentos mantendo fonte, evidência e publicação separadas.
- [x] Centralizar cadências vencidas, casos sem próxima ação e leads parados em Alertas, preservando as fontes de origem.
- [x] Conectar a fila editorial da Biblioteca a uma tela de Microentregas com status, responsável, prazo e detalhe real.
- [x] Validar compilação, rotas e estados de leitura das novas superfícies.
- [x] Ligar os cartões de Hoje e a fila da Biblioteca às fontes reais do Desk.
- [ ] Publicar o App Cliente e conferir etapa, próxima ação e microentrega publicada em tela real.
- [x] Completar o pente-fino visual das 15 prévias contra o mockup aprovado de 17 páginas, preservando 6 grupos do Desk e 7 telas do App Cliente.
- [x] Validar visualmente as prévias atualizadas em desktop e mobile.
- [x] Aplicar no Desk os modelos gráficos aprovados de família, marketing, comercial, pesquisa, acervo, financeiro e jurídico, sem alterar o App Cliente.
- [x] Gerar prancha visual das 15 superfícies do Desk e pacote reutilizável com tokens, gráficos, assets e instruções.
- [x] Revisar App Cliente e Desk tela a tela contra o mockup de 17 páginas, validar os radares e entregar PDF comparativo da versão anterior versus publicação verificável.
- [ ] Unificar, na tela Radar Interno, a matriz geral e o Radar Individual por caso conforme a página 15 do mockup, validar em sessão autenticada e publicar para revisão.
- [x] Conectar o Radar Individual de cada Caso 360 aos dados reais, com status e ações, atualizar o PDF comparativo anterior × atual e publicar ambos para revisão.
- [x] Consolidar o Kit Visual de aprovação com a nova paleta, componentes TSX/CSS e 13 superfícies do Desk, sem backend ou publicação.
- [x] Gerar a exportação única final com pranchas A3, componentes, tokens, logos, exemplos, mapas, licenças e checksums.
- [x] Atualizar a prancha visual do Desk com o Radar Individual aprovado e a matriz nominal por urgência e elegibilidade.
- [x] Gerar ZIP do Kit Visual do Desk e ZIP do Kit Visual do App Cliente (7 telas) para aprovação.
- [x] Revisar o kit final contra o Radar atual, incluindo matriz nominal e Radar Individual operacional, sem alterar dados ou regras.

## Kit visual ligado a dados reais (13/09/2026)
- Caso 360, Pessoa, Microentregas e Radar usam componentes do kit lendo tabelas canônicas (crm_casos, clientes/nucleo_membros/documents, app_projections). Sem tabela nova.
- Pendente: prova autenticada na UI pela Proprietária (sessão de teste do agente cai em /equipe/entrar por falta de acesso de equipe).

## Limpeza do Desk publicado (14/09/2026)
- [x] Remover a montagem empilhada entre o kit visual novo e as telas antigas em Hoje, Comercial, Pesquisa/Biblioteca, Formalização & Financeiro e Governança.
- [x] Retirar da operação diária inventários técnicos, motores P0–P11 e fases explicativas, preservando as ações e leituras reais.
- [x] Substituir a primeira leitura das cinco superfícies pelo novo Desk conectado, deixando as rotinas reais em áreas operacionais recolhidas e sem sobreposição.
- [x] Retirar do Hoje a composição histórica longa (`PainelDia`), que ainda podia reabrir Caso em destaque, Jornada, cadência, revisão jurídica e filas antigas abaixo da superfície nova.
- [ ] Validar as cinco superfícies em celular e desktop, sem sobreposição, dados demonstrativos ou regressão de acesso.

## Patch global de responsividade do Desk (14/09/2026)
- [x] Escopar contenção horizontal ao shell autenticado, sem alterar dados ou rotas.
- [x] Manter sidebar em drawer fechado abaixo de 768px e ocultar launchers flutuantes no mobile.
- [x] Tornar bases de cards, inputs, grids, filtros, textos longos e tabelas resilientes entre 320–430px.
- [ ] Capturar e comparar as seis rotas autenticadas; bloqueado enquanto a sessão de teste redirecionar para `/equipe/entrar`.

## Superfície de go-live (14/09/2026)
- [x] Shell novo `/golive` (Hoje, Caso Ana, Pesquisa, Formalização, Configurações, App Cliente) lendo só `CA-CID-AT-FAM-2026-001`
- [x] Publicação manual de microentrega reaproveitando `publicarProjecaoApp`
- [ ] Prova autenticada da Proprietária (prints inicial/ação/confirmação/releitura)

## Mapa Ana: Lead → App Cliente (14/09/2026, somente leitura)
- [ ] Mapear os 12 marcos (Lead → Portal/App) com rota, CTA entrada/saída, o que se vê, estado vazio, estado visual e print mobile.
- [ ] Conferir as 11 superfícies do Desk e as 7 abas do App da prancha v3, marcando lacunas e telas com demo/teste/alerta técnico/catálogo/blocos repetidos.
- [ ] Entregar `mapa-ana-lead-app-visual` (Markdown + PDF). Sem implementar, sem corrigir.
- [ ] Revisar a proposta contra a prancha v3 (contrato): Desk cobre 11 contextos (Hoje, Comercial, Kanban, Caso 360, Pessoa 360, Radar, Pesquisa, Financeiro, Jurídico, Pessoas, Portal/Config Master) e App mantém 7 abas. Nada removido: Discovery/Calls, funil/handoff, Kanban, Pessoa 360, Pessoas/núcleos, Radar, Financeiro próprio, Jurídico completo e convite real do cliente.

## Pesquisa e Biblioteca (15/09/2026)
- [ ] Pesquisa do caso: 3 blocos (cobertura por fonte, produção de evidência, fila editorial) na cadeia Pergunta → Fonte → Evidência → Achado → Revisão → Publicação
- [ ] Biblioteca como acervo/fila editorial, nunca segundo motor de pesquisa

## Prova funcional + 7 abas do App (15/09/2026)
- [ ] Prova Lead→App do caso Ana com antes/depois
- [ ] Verificar e completar as 7 abas do App Cliente
