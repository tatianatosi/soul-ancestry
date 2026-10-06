# Desk — construir os elementos faltantes da prancha v4

## Objetivo
Aproximar o Desk atual da prancha visual v4 aprovada usando só as telas, os dados e as ações que já existem. Para isso, seguimos as lacunas levantadas no estudo de elementos faltantes. Trabalho em cortes. Depois de cada corte, paro para aprovação visual da Proprietária.

## Decisão necessária antes do Corte 1
O menu hoje mostra 7 rótulos: Hoje, Comercial, Casos, Pessoas & Famílias, Pesquisa, Marketing e Configuração. A regra vigente define 6 grupos. Preciso que a Proprietária confirme qual versão vale como face final do Desk. Enquanto não houver resposta, o Corte 1 não muda a lista de itens do menu: só ajusta o visual.

## Cortes (um por vez, com parada após cada um)
1. **Moldura geral do Desk:** faixa institucional, busca, menu da conta, menu lateral, título, subtítulo e selo de estado no padrão v4. Tiro a barra horizontal que repete o menu. Nenhuma rota nova.
2. **Hoje (Visão Geral):** ordem da prancha (exceções → sinais → descoberta), no máximo 4 indicadores com fonte, cálculo, período, vazio e clique. Sem fonte, mostra "Sem dados suficientes". Microentregas do dia entram como alertas, não como item de menu.
3. **Caso 360:** cabeçalho da família, linha do tempo, participantes, progresso por frente, dossiê e jornada D0–D365, dentro das 8 seções atuais (sem renomear nenhuma). Onboarding, gates e diagnóstico ficam em blocos recolhidos.
4. **Comercial / CRM Vivo e Kanban:** cartões com responsável, origem, próxima ação e prazo vindos de leads e tarefas reais. A Mesa de Discovery continua no mesmo fluxo.
5. **Pessoas & Famílias (Pessoa 360 e Núcleos):** composição v4 com identidade única, vínculos aprovados e link para "Ver App Cliente como pessoa". Dados civis só para quem tem permissão.
6. **Pesquisa e Biblioteca Mestre:** fluxo fonte → transcrição → interpretação → hipótese → conclusão; mini-árvore só com relações registradas; Biblioteca dentro de Pesquisa.
7. **Formalização & Financeiro / Jurídico:** contrato em leitura contínua, validação jurídica da trilha, parcelas e reconciliação. Gráficos só quando houver dado real; os demais espaços mostram vazio honesto.
8. **Radar Interno, Alertas e Configuração:** Radar com marcos jurídicos × casos afetados (zero é dado real); permissões, política e auditoria em Configuração; gestão detalhada recolhida.

## Em cada corte
- Capturas antes/depois em desktop 1440 px e em 375 px, lado a lado com a prancha v4.
- Verificação de tipos, testes da tela, compilação, console sem erro e nenhuma rolagem horizontal.
- Entrega: arquivos alterados, o que foi reaproveitado, lacunas que dependem de dado ou decisão, e parada.

## Limites
- Não mexo em banco, migrations, RLS, permissões, gravações, publicação, catálogo, contrato ou pagamentos.
- Não crio tela de primeiro nível, segundo Caso 360/CRM, número fictício, conteúdo demo ou KPI sem fonte.
- Se um teste existente travar uma mudança, paro e informo qual teste e por quê.
- Sem commit manual, publicação ou deploy sem autorização explícita.

## Detalhes técnicos
- Menu: `src/lib/navegacao-desk.ts` (`GRUPOS_DESK` / `NAVEGACAO_V4_DESK`), shell em `src/components/saas/shell.tsx`.
- Caso 360: `SECOES` em `casos.$caseId.index.tsx`. Peças GoLive (`src/components/golive/*`) entram só como referência visual reaproveitável, nunca como fonte de dados.
- A sobreposição `painel-dia.tsx` × `/painel` (golive) continua sem decisão: não toco nos dois arquivos.
