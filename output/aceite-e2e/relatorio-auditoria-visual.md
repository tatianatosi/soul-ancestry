# Relatório de auditoria visual autenticada — caso Ana Luiza

- **Data/hora:** 2026-10-12 14:48:46 UTC
- **Ambiente:** prévia local do projeto, conectada ao backend vigente
- **Sessão:** tati@pluggedresearch.com
- **Caso:** CA-CID-AT-FAM-2026-001 · Ana Luiza
- **Natureza da evidência:** inspeção administrativa autenticada produzida pelo agente; não equivale a `COMPROVADO_EM_USO` nem a prova executada pela Proprietária.

## Resultado geral

**FALHOU.** As dez imagens foram produzidas, mas a conformidade visual integral não pode ser confirmada. Há divergências visíveis e bloqueios por ausência de conteúdo publicado. A URL não aparece dentro dos PNGs porque a captura registra a página, não a barra do navegador; portanto, estas imagens também não cumprem sozinhas o requisito de rota visível da prova oficial.

## Evidências

### 1. Painel Hoje
- **Arquivo:** `01-desk-painel-hoje.png`
- **Rota inicial/final:** `/painel` → `/painel`
- **Resultado:** `FALHOU`
- **Observado:** o grid executivo de quatro cartões está visível e não contém rótulos DEMO.
- **Divergência:** a lateral ainda exibe “Sessão demo do App Cliente (dado fictício)”, contrariando o estado visual solicitado para o Desk limpo de acesso demo.

### 2. Caso 360 — CaseHealthHero
- **Arquivo:** `02-desk-caso360-hero.png`
- **Rota inicial/final:** `/casos/CA-CID-AT-FAM-2026-001` → `/casos/a11a0000-0000-4000-8000-000000000002`
- **Resultado:** `NAO_LOCALIZADO`
- **Observado:** o cabeçalho operacional e o bloco “Saúde do caso: Bloqueado” estão visíveis.
- **Divergência:** não há ficha civil no Hero para comprovar mascaramento. O bloco acima do Hero expõe metadados técnicos (`caseId`, código e fonte), logo a ausência de dados civis não prova máscara.

### 3. Radar Individual — Heatmap
- **Arquivo:** `03-desk-radar-heatmap.png`
- **Rota inicial/final:** `/qualidade` → `/qualidade`
- **Resultado:** `PASSOU`
- **Observado:** aba Radar Individual, caso CA-CID-AT-FAM-2026-001 selecionado, leitura dos quatro eixos e tabela “Aderência por país (heatmap)” visíveis. O botão Assistente não cobre a última coluna no recorte autenticado.
- **Limite:** o heatmap mostra “Aderência não calculada” e evidência pendente de validação; o resultado aprova somente a presença e composição visual, não o dado do motor.

### 4. App Cliente — Home
- **Arquivo:** `04-portal-home.png`
- **Rota inicial/final:** `/portal/` → `/portal`
- **Resultado:** `FALHOU`
- **Observado:** Home autenticada do caso da Ana, com sete abas.
- **Divergência:** não há mensagem de boas-vindas nem próxima ação publicada; a tela mostra `Lacuna` e informa que a história está sendo preparada.

### 5. App Cliente — Jornada
- **Arquivo:** `05-portal-jornada.png`
- **Rota inicial/final:** `/portal/jornada` → `/portal/jornada`
- **Resultado:** `FALHOU`
- **Observado:** Linha Ancestral e Linha do Processo aparecem sem metadados de banco.
- **Divergência:** a tela contém conteúdo ilustrativo e rótulos “Exemplo do layout — ainda sem dados publicados”; não comprova uma jornada real publicada do caso.

### 6. App Cliente — Radar de seis dimensões
- **Arquivo:** `06-portal-radar-6eixos.png`
- **Rota inicial/final:** `/portal/radar` → `/portal/radar`
- **Resultado:** `BLOQUEADO_POR_DADO`
- **Observado:** os seis eixos públicos estão nomeados e a orientação de Ouro Nobre está presente.
- **Bloqueio:** todas as dimensões permanecem `Lacuna`; a teia não tem preenchimento real. O mapa abaixo é explicitamente exemplo sem dados publicados.

### 7. App Cliente — Árvore
- **Arquivo:** `07-portal-arvore.png`
- **Rota inicial/final:** `/portal/arvore` → `/portal/arvore`
- **Resultado:** `BLOQUEADO_POR_DADO`
- **Observado:** estrutura por gerações e âncora “Você”.
- **Bloqueio:** nenhum nome ou vínculo foi liberado para a família; não há nós genealógicos publicados a comprovar nesta sessão.

### 8. App Cliente — Documentos
- **Arquivo:** `08-portal-documentos.png`
- **Rota inicial/final:** `/portal/documentos` → `/portal/documentos`
- **Resultado:** `FALHOU`
- **Observado:** áreas Solicitados, Recebidos, Liberados e Entregas do Legado estão visíveis.
- **Divergência:** a listagem exibida é marcada como exemplo e usa documentos genéricos sem arquivo associado; não comprova evidências reais aprovadas.

### 9. App Cliente — Legado
- **Arquivo:** `09-portal-legado-disclaimer.png`
- **Rota inicial/final:** `/portal/legado` → `/portal/legado`
- **Resultado:** `PASSOU`
- **Observado:** o aviso “Sobre os Encontros de Linhagem” está visível, com o texto de que o conteúdo é histórico, cultural e narrativo e não substitui acompanhamento terapêutico, psicológico ou médico.
- **Limite:** as coleções continuam em preparação e os itens são exemplos; o resultado cobre somente a presença visual do disclaimer.

### 10. App Cliente — Conta
- **Arquivo:** `10-portal-conta-sem-upsell.png`
- **Rota inicial/final:** `/portal/conta` → `/portal/conta`
- **Resultado:** `BLOQUEADO_POR_DADO`
- **Observado:** não há cartões de upsell.
- **Bloqueio:** a tela informa “Nenhuma assinatura publicada ainda” e “Nenhum plano publicado ainda”. Não exibe R$ 320/mês × 10 nem o descritivo “Condição familiar: 3 assinaturas / parcelas mensais”. O plano presente está claramente marcado como exemplo, sem preço, vigência ou contratação.

## Releitura

As sete rotas do App foram reabertas e recarregadas após a primeira captura. Os estados continuaram acessíveis, mas essa releitura feita pelo agente não substitui a execução pela Proprietária.

## Continuidade

Código, build, teste automatizado, preview, log e capturas do agente não substituem a prova visual executada pela Proprietária autenticada. Nenhum motor foi marcado como `COMPROVADO_EM_USO` e nenhum contexto relacionado foi arquivado.
