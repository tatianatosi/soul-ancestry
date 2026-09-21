# De–Para Completo — Clube Ancestral

> **Autoridade, fixada pela Proprietária em 21/09/2026 — leia antes do resto.**
>
> **O mockup rege, e é regra, tanto para o App quanto para o Desk.** Ele é o
> contrato de composição, hierarquia, conteúdo e navegação das duas
> superfícies.
>
> Duas ressalvas dela, e só duas:
>
> 1. **Bom senso resolve alguns detalhes.** O PDF foi gerado pelo Lovable e
>    mostra que os elementos existem; onde ele for literal demais ou estiver
>    atrás das páginas vivas — que são mais atualizadas —, aplica-se bom
>    senso em vez de cópia cega. Exemplo real desta rodada: o mockup escreve
>    "até 10 MB" na caixa de envio, e a regra aprovada no servidor aceita
>    25 MB e mais formatos. Anunciar 10 MB faria a tela recusar o que o
>    servidor aceita — vale o limite real.
> 2. **Número tem dono.** A §29, no fim deste arquivo, continua valendo para
>    cálculo: regra de negócio aprovada manda no valor, e divergência se
>    registra em vez de inventar terceira interpretação.
>
> Registro de uma correção minha: numa versão anterior deste cabeçalho
> escrevi que "o PDF não é regra nem limite". Foi extrapolação — a
> Proprietária disse que o mockup rege e que bom senso ajuda em alguns
> pontos, não que o mockup deixou de valer.
>
> Camadas, como a Proprietária fixou:
>
> | Camada | O que pode aparecer |
> |---|---|
> | Operação interna | Tarefas, bloqueios, fontes, hipóteses, responsáveis, SLA, documentos em validação, cálculos de radar |
> | Revisão editorial | Achados, microentregas, relatórios e materiais aguardando aprovação |
> | App Cliente | Apenas conteúdo liberado, seguro, contextualizado e publicado para a família |
> | Legado GitHub | Código, rotas e telas sem uso na arquitetura aprovada, preservados fora da linha principal |

**Objetivo:** alinhar o produto implementado ao mockup aprovado de 17 páginas, com inventário tela a tela de conteúdo, superfícies, wireframes, indicadores, camadas visuais e destino técnico. Este documento serve como especificação de execução para o Claude e como critério de aceite visual e funcional.

**Regra de decisão:**

- **Manter / construir:** item presente no mockup aprovado, necessário à jornada e com função clara.
- **Sobreposto:** item que permanece, mas deve obedecer à hierarquia visual, sem duplicar conteúdo, controles ou indicadores.
- **Ocultar:** item que pode continuar existindo tecnicamente, mas não deve aparecer na interface atual.
- **Legado GitHub:** item sem uso operacional ou que conflita com o mockup; remover da linha ativa, manter apenas em branch/tag/arquivo histórico documentado.
- **Radares:** não redesenhar a lógica nem substituir as especificações já parcialmente aprovadas. Ajustar somente composição, superfícies, integração e nomenclatura para aderir a este kit.

---

## 1. Referência visual obrigatória

### 1.1 Linguagem comum

| Elemento | Regra de aplicação |
|---|---|
| Fundo de conteúdo | Off-white quente, sem blocos decorativos desnecessários |
| Navegação desk | Sidebar azul-marinho contínua, fixa à esquerda |
| Cabeçalhos do app | Faixa azul-marinho com marca, título e subtítulo |
| Superfície de conteúdo | Cards brancos com raio discreto, sombra leve, borda sutil quando necessária |
| Cor primária | Azul-marinho para navegação, títulos operacionais, ações principais e eixos de gráficos |
| Cor de destaque | Dourado para etapa ativa, seleção, progresso e ênfase de marca |
| Estados | Verde = saudável/concluído; dourado = atenção/em análise; vermelho suave = crítico/pendente; cinza = neutro/sem dados |
| Tipografia de título | Serif elegante, usada apenas em títulos de página, títulos de cards principais e pontos institucionais |
| Tipografia operacional | Sans-serif legível para rótulos, dados, tabelas, chips, filtros e ações |
| Ícones | Linha fina, coerente; evitar misturar estilos, preenchimentos e tamanhos |
| Dados demonstrativos | Devem aparecer somente onde o mockup prevê dados demonstrativos; nunca simular dado real sem origem |

### 1.2 Regras de superfície

1. Uma tela deve ter **uma área principal de leitura**, não uma coleção de widgets concorrentes.
2. Cards só existem para agrupar informação ou ação. Não criar card para texto solto.
3. O card de maior prioridade deve aparecer primeiro e pode usar azul-marinho interno, como no App “Sua jornada” e “Legado”.
4. Chips são estados curtos: não devem virar parágrafos, abas duplicadas ou filtros permanentes.
5. Gráficos devem ocupar cards próprios, ter legenda e uma leitura explícita. Não inserir gráficos sem decisão operacional associada.
6. Espaços vazios do mockup são intencionais: não preencher com painéis, métricas ou tabelas não solicitadas.

### 1.3 Estrutura desk obrigatória

De cima para baixo, em todas as abas desk:

1. Faixa superior azul-marinho: “PRANCHA VISUAL DO DESK · KIT PARA APROVAÇÃO · CONTEÚDO DEMONSTRATIVO”.
2. Barra branca superior com busca global e identidade do usuário.
3. Sidebar azul-marinho fixa com grupos de navegação.
4. Título da página + descrição curta + chip de status geral à direita.
5. Navegação horizontal de módulos do kit aprovado.
6. Área principal em cards, respeitando o wireframe específico da aba.

### 1.4 Navegação desk aprovada

| Grupo na sidebar | Itens / abas correspondentes |
|---|---|
| Hoje | Hoje |
| Marketing & Comercial | Comercial / CRM Vivo |
| Pessoas & Casos | Checklist / Kanban operacional; Caso 360; Pessoas & Famílias; Radar & Matrizes |
| Inteligência & Pesquisa | Pesquisa; Biblioteca Mestre |
| Formalização & Financeiro | Financeiro; Jurídico & Contrato |
| Governança & Administração | Portal do cliente (visão interna); Configuração & Acesso |

A navegação horizontal também deve espelhar os módulos: Hoje, Comercial / CRM Vivo, Checklist / Kanban operacional, Caso 360, Pessoas 360, Radar & Matrizes, Pesquisa, Biblioteca Mestre, Financeiro, Jurídico & Contrato, Pessoas & Famílias, Portal do cliente (visão interna), Configuração & Acesso.

---

# Parte A — App Cliente

## 2. App: mapa de navegação e rodapé

### 2.1 Cabeçalho comum do App

| Elemento | Manter | Conteúdo aprovado | Não fazer |
|---|---|---|---|
| Marca | Sim | Selo + “Clube Ancestral” | Logo grande demais ou cabeçalho com múltiplas ações |
| Identificador | Sim | “APLICATIVO DA FAMÍLIA” em dourado | Trocar por linguagem técnica interna |
| Título | Sim | Específico por aba | Repetir “Clube Ancestral” como título de conteúdo |
| Subtítulo | Sim | Uma frase explicativa e segura | Inserir promessas, pareceres ou percentuais sem fonte |
| Perfil | Sim | Ícone circular discreto no canto superior direito | Expor dados pessoais excessivos |

### 2.2 Rodapé comum do App

O rodapé é fixo e contém, nesta ordem: **Home, Jornada, Radar, Árvore, Documentos, Legado, Conta**.

| Regra | Especificação |
|---|---|
| Estado ativo | Ícone e rótulo em dourado; demais em cinza-azulado |
| Área de toque | Cada item com área ampla e equivalente |
| Rótulo | Curto e sempre visível; não substituir por tooltip |
| Persistência | Permanece em todas as telas principais do App |
| Não permitido | Menu hambúrguer paralelo, abas duplicadas, rodapé com itens extras ou mudança de ordem |

---

## 3. App — 01. Sua Jornada / Home

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Sua jornada” + “Acompanhe o que já foi publicado e o que vem a seguir.” | Sem KPI numérico obrigatório | Manter |
| 2 | Card destaque azul | Eyebrow “ACOMPANHAMENTO DA FAMÍLIA”; título “Uma história em construção”; texto de segurança; divisor; “Etapa atual”; nome da etapa; barra de progresso | Etapa derivada do fluxo publicado, não de tarefa interna. Ex.: “Pesquisa em andamento” | Manter e conectar ao status publicado |
| 3 | Card branco | “PRÓXIMA AÇÃO”; “Aguardar a próxima atualização”; texto explicativo | Só mostra ação real necessária da família. Estado vazio: “Nenhuma ação da família é necessária neste momento.” | Manter |
| 4 | Card branco | “ACHADOS”; título “Em preparação”; texto de publicação | Achados só aparecem após revisão e publicação | Manter |
| 5 | Card branco | “MICROENTREGA”; título “Nenhuma publicação nova”; texto de expectativa | Última microentrega publicada ou vazio honesto | Manter |
| 6 | Rodapé | Home ativo | Estado ativo dourado | Manter |

### O que fica oculto do cliente

- Score interno de prioridade, urgência, elegibilidade ou SLA.
- Nomes de responsáveis internos, backlog, bloqueios operacionais e hipóteses ainda não revisadas.
- Progresso em percentuais inferidos ou estimados.

### O que é legado / deve sair da linha

- Dashboard genérico de cliente com cards de CRM, gráfico de produtividade, kanban ou indicadores internos.
- Duplicação de “Jornada” e “Home” com o mesmo conteúdo em telas separadas. Home é o resumo; Jornada é o fluxo detalhado.

---

## 4. App — 02. Jornada

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Jornada”; subtítulo “A história da família e o acompanhamento do seu caso.” | Sem métrica operacional | Manter |
| 2 | Card de etapas | Linha horizontal: Início, Pesquisa, Conferência, Entrega | Etapa ativa em azul/dourado; concluídas em dourado; futuras em cinza | Manter |
| 3 | Card branco | “PASSADO FAMILIAR”; “Linha ancestral”; itens “Memórias da família” e “Conexões entre gerações” | Mostrar apenas registros e conexões liberados | Manter |
| 4 | Separador | “União de Ramos” | Divisor narrativo, não componente clicável se não houver ação | Manter |
| 5 | Card branco | “PRESENTE”; “Seu acompanhamento”; linha de status “Pesquisa em andamento” e “Próxima atualização” | Deve refletir publicação e cadência real | Manter |
| 6 | Rodapé | Jornada ativo | Dourado | Manter |

### Conteúdo oculto

- Linha de tarefas internas, dependências de documentos, responsáveis e comentários de equipe.
- Conteúdo de hipótese antes de ser convertido em achado revisado/publicado.

### Legado

- Timeline com todos os eventos técnicos do caso.
- Porcentagens de conclusão sem regra formal e sem data de atualização.
- Etapas extras que não se traduzam para linguagem da família.

---

## 5. App — 03. Radar Ancestral

### Premissa

O radar do App já possui especificação própria e uso parcialmente aprovado. Preservar sua semântica e dados; aplicar apenas o enquadramento visual abaixo.

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Radar Ancestral”; “Uma leitura simples das seis dimensões da sua jornada.” | Sem prometer parecer ou resultado | Manter |
| 2 | Card branco principal | Eyebrow “VISÃO DA JORNADA”; título “Seis dimensões”; gráfico radar central | Exibir composição visual aprovada; sem percentual estimado se a regra não o sustenta | Manter |
| 3 | Texto de segurança | “O desenho representa apenas a composição visual. Nenhum percentual é estimado.” | Deve permanecer enquanto não houver métrica metodologicamente publicada | Manter |
| 4 | Lista de dimensões | Itens numerados com nome, explicação curta e chip de estado | No mockup: Documentação, Origem, Conexões Familiares, Elegibilidade; completar as seis dimensões conforme especificação existente | Manter |
| 5 | Rodapé | Radar ativo | Dourado | Manter |

### Camadas e dados

- Camada pública: leitura simples, dimensões e estados publicados.
- Camada interna: cálculo, fontes, confiança, evidências, pendências e regras de elegibilidade.
- Não exibir ao cliente: percentuais fabricados, prazo de decisão, probabilidade jurídica ou interpretação não revisada.

### Legado

- Qualquer radar antigo com eixos diferentes dos seis eixos aprovados.
- Medidores circulares duplicados, barras de score ou dashboards de pesquisa paralelos no App.

---

## 6. App — 04. Árvore

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Árvore”; “Gerações e conexões liberadas para a família.” | Sem contagem pública obrigatória | Manter |
| 2 | Faixa explicativa | Selo “G1–G5” + texto “A árvore mostra somente nomes e vínculos já liberados.” | Regra de privacidade explícita | Manter |
| 3 | Card branco | Árvore geracional G1 a G4/G5; pessoa central “Você”; nós com “Em pesquisa” ou “A publicar” | Exibir somente nomes/vínculos liberados; placeholders sem dados identificáveis | Manter |
| 4 | Card branco | Eyebrow “LIGAÇÃO COM A JORNADA”; “Próxima atualização”; texto explicativo | Próxima conexão liberada ou estado vazio | Manter |
| 5 | Rodapé | Árvore ativa | Dourado | Manter |

### Oculto

- Pessoas em pesquisa que não foram liberadas.
- Hipóteses de parentesco, relações contestadas, duplicidades e notas de investigação.
- Dados sensíveis e detalhes de terceiros sem autorização.

### Legado

- Árvores completas com dados internos, ferramentas de edição, importação GEDCOM exposta ao cliente ou grafo técnico sem linguagem de família.

---

## 7. App — 05. Documentos

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Documentos”; “Pedidos, recebimentos e materiais liberados em um só lugar.” | Sem KPI técnico | Manter |
| 2 | Card branco | “DOCUMENTOS”; “Solicitados”; caixa tracejada de estado | Solicitações abertas ou “Nenhuma solicitação aberta” | Manter |
| 3 | Card branco | “DOCUMENTOS”; “Recebidos”; caixa tracejada de estado | Último envio recebido / “Nenhum envio recente” | Manter |
| 4 | Card branco | “DOCUMENTOS”; “Liberados”; caixa tracejada de estado | Arquivos revisados e publicados | Manter |
| 5 | Card branco | “DOCUMENTOS”; “Entregas”; caixa tracejada de estado | Entregas disponíveis, com ação somente se houver arquivo liberado | Manter |
| 6 | Rodapé | Documentos ativo | Dourado | Manter |

### Regras de conteúdo

- “Solicitados” pode solicitar ação da família.
- “Recebidos” confirma entrada, não significa validação.
- “Liberados” exige revisão e autorização de publicação.
- “Entregas” contém somente material final disponível para consulta/download.

### Oculto e legado

- Ocultar logs de upload, versões internas, nomes de buckets, erros técnicos, documentos rejeitados sem orientação adequada e arquivos sem liberação.
- Arquivar interfaces antigas que misturam solicitações, evidências de pesquisa, contratos e arquivos finais numa única lista sem status.

---

## 8. App — 06. Legado

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Legado”; “Conteúdos publicados para preservar e compartilhar em família.” | Sem métrica operacional | Manter |
| 2 | Card destaque azul | Eyebrow “BIBLIOTECA DA FAMÍLIA”; “Seu legado, organizado por coleção”; texto de acesso | Só conteúdo publicado | Manter |
| 3 | Card branco | “COLEÇÃO”; “Cadernos”; estado vazio/publicações | Conteúdo publicado por coleção | Manter |
| 4 | Card branco | “COLEÇÃO”; “Relatórios”; estado vazio/publicações | Conteúdo publicado por coleção | Manter |
| 5 | Card branco | “COLEÇÃO”; “Narrativas”; estado vazio/publicações | Conteúdo publicado por coleção | Manter |
| 6 | Rodapé | Legado ativo | Dourado | Manter |

### Oculto

- Rascunhos, conteúdos em revisão, relatórios internos, hipóteses e materiais que não foram aprovados para a família.

### Legado técnico

- Biblioteca sem separação de estado editorial.
- Qualquer conteúdo publicado automaticamente por conclusão de tarefa, sem etapa explícita de curadoria/liberação.

---

## 9. App — 07. Conta

### Wireframe de conteúdo

| Ordem | Superfície | Conteúdo aprovado | Indicador real / estado | Destino |
|---|---|---|---|---|
| 1 | Cabeçalho azul | “Conta”; “Seu perfil, preferências e histórico de acesso.” | Sem dados sensíveis em excesso | Manter |
| 2 | Card branco | “PERFIL”; “Dados da conta”; titular e preferência | Campos efetivos do usuário | Manter |
| 3 | Card branco | “PLANO”; “Acompanhamento”; texto de disponibilidade | Mostrar o que está contratualmente publicado para a conta | Manter |
| 4 | Card branco | “AVISOS”; “Atualizações para você”; estado vazio/lista | Avisos publicados | Manter |
| 5 | Card branco | “HISTÓRICO”; “Movimentos disponíveis”; estado vazio/lista | Eventos publicáveis e compreensíveis | Manter |
| 6 | Rodapé | Conta ativo | Dourado | Manter |

### Oculto e legado

- Ocultar permissões internas, identificação de equipe, tokens, logs de auditoria técnicos e histórico administrativo bruto.
- Arquivar telas antigas que transformem “Conta” em painel interno de caso.

---

# Parte B — Desk Operacional

## 10. Matriz das abas desk

| Aba | Função única | Superfície dominante | Indicadores reais | O que não pode aparecer |
|---|---|---|---|---|
| Hoje | Centralizar decisões e ritmo | Grade de cards operacionais | decisões, cadências, casos sem ação, microentregas, funil, alertas, ritmo, prioridades | dados detalhados de cada caso e listas intermináveis |
| Comercial / CRM Vivo | Conduzir leads e relacionamento comercial | Funil + pipeline/kanban + métricas | novos leads, etapa, origem, próxima ação, conversão | elementos de pesquisa genealógica e contrato |
| Checklist / Kanban operacional | Executar trabalho de casos | Colunas de kanban | estado, responsável, prazo, bloqueio, SLA | dashboards analíticos repetidos |
| Caso 360 | Visão integrada de um caso | Linha do tempo + progresso + dossiê | etapa, participantes, completude, próximos passos | backlog global e dados de outros casos |
| Pessoas 360 | Gestão individual/relacional | Perfil + relações + sinais | dados da pessoa, vínculos, pendências | árvore pública simplificada do App |
| Radar & Matrizes | Priorização transversal | Matriz + radar individual | urgência, elegibilidade, prioridade, responsável, próxima ação | percentuais inventados e cópia do radar do App |
| Pesquisa | Conduzir evidência e hipótese | Dossiê + pipeline de pesquisa | fontes, confiança, cobertura, produção | conclusão publicada sem validação |
| Biblioteca Mestre | Governar acervo e publicação | Coleções + estados editoriais | itens, revisão, liberação, coleção | repositório de arquivos sem curadoria |
| Financeiro | Acompanhar obrigação financeira | cards + lista/resumo + gráfico | valores, vencimentos, status, recebimento | dados de pesquisa, documentos e CRM duplicados |
| Jurídico & Contrato | Validar formalização | checklists + alertas + completude | assinatura, anexos, validações, conflitos | lógica de CRM ou pesquisa |
| Pessoas & Famílias | Ler linhagem e núcleos | gerações + árvore + rede + cobertura | gerações, conexões, lacunas, cobertura | conteúdo liberado do App como fonte de verdade |
| Portal do cliente (visão interna) | Controlar publicação para App | matriz de módulos e estados de publicação | visibilidade, aprovado, pendente, último publish | conteúdo de edição direta no cliente |
| Configuração & Acesso | Governar usuários, perfis e regras | tabelas de acesso + parâmetros | papéis, permissões, integrações, auditoria | operação diária de casos |

---

## 11. Desk — Hoje

### Wireframe aprovado

| Ordem | Superfície | Conteúdo aprovado | Indicador demonstrativo do mockup | Regra de produção |
|---|---|---|---|---|
| 1 | Título | “Hoje”; descrição curta; chip “Sem dados reais” quando aplicável | — | Quando houver dados reais, trocar o chip por data de atualização/origem |
| 2 | 4 cards KPI | Decisões do dia; Cadências vencidas; Casos sem próxima ação; Microentregas para revisão | 6; 3; 1; 2 | Contagens clicáveis e reconciliadas com listas abaixo |
| 3 | Card | Decisões prioritárias | Aprovar escopo — Família Bianchi; Liberar pesquisa — Ana Luiza; Rever proposta — Núcleo Rossi; Confirmar documento mínimo | Cada linha deve abrir contexto e ação possível |
| 4 | Card | Tarefas e microentregas | Enviar achado à família; Atualizar linha do tempo; Publicar entrega no App; Registrar fonte paroquial | Separar tarefas internas de publicações ao cliente |
| 5 | Card | Cadência dos casos | Em dia 7; Atrasada 3; Aguardando cliente 4 | Estado derivado de regra de cadência documentada |
| 6 | Card | Casos sem próxima ação | Sem responsável 1; Parado 2; Encerrado no mês 5 | Não tratar encerrado como falha |
| 7 | Card | Microentregas prontas para revisão | Síntese do registro paroquial; Linha familiar documentada | Exigir revisão antes de publicar |
| 8 | Card | Funil de leads | Novos leads 58; Discovery 31; Diagnóstico 18; Cliente 7 | Dados do CRM, leitura de 30 dias quando houver período definido |
| 9 | Card | Alertas centralizados por origem | Jornada 3; Caso 360 1; CRM Vivo 2 | Cada alerta deve apontar para a origem |
| 10 | Card | Ritmo operacional — 6 semanas | Linha S1 a S6 | Métrica e unidade explicitadas em produção |
| 11 | Card | Distribuição das prioridades | Críticas 3; Atenção 5; Em dia 8 | Valores precisam bater com a fonte de tarefas/casos |

### Ocultar / arquivar

- Widgets extras não presentes na prancha, como feed de atividade sem decisão, calendário grande, ranking de colaboradores ou dados financeiros misturados.
- Duplicações de indicadores que já vivem em Kanban, Caso 360 e CRM.

---

## 12. Desk — Comercial / CRM Vivo

### Wireframe obrigatório

| Zona | Conteúdo | Indicadores reais | Destino |
|---|---|---|---|
| Cabeçalho | “Comercial / CRM Vivo”, descrição e chip de qualidade de dados | Sem dados reais / última atualização | Manter |
| Resumo superior | Funil de aquisição e conversão | novos leads, discovery, diagnóstico, proposta, cliente; conversões e período | Manter |
| Pipeline | Colunas por etapa comercial | lead, responsável, origem, próxima ação, data, bloqueio | Manter |
| Detalhe de lead | Dados essenciais + interação recente + próxima ação | etapa, prioridade, valor/escopo se aplicável, consentimento | Manter |
| Ações | Novo lead, atualizar etapa, registrar interação, criar próxima ação | sempre auditáveis | Manter |

### Oculto

- Dados de pesquisa, linhagem e documentos do caso antes de conversão/consentimento.
- Métricas de “sucesso” sem definição de janela temporal, origem e estágio.

### Legado

- CRM paralelo fora da navegação principal.
- Cards de lead sem próxima ação/responsável.
- Pipeline que mistura prospect, caso ativo e cliente já encerrado sem estado explícito.

---

## 13. Desk — Checklist / Kanban operacional

### Wireframe aprovado

| Ordem | Superfície | Conteúdo aprovado | Indicadores demonstrativos | Regra |
|---|---|---|---|---|
| 1 | Título | “Checklist / Kanban operacional” | — | Manter |
| 2 | 4 KPIs | Confirmar; Em revisão; Pendente crítico; SLA em risco | 3; 4; 3; 1 | Cada total deriva dos cards mostrados e dos filtros ativos |
| 3 | Faixa | “Trabalho dos casos”; filtros; ação “Nova tarefa” | — | Um único ponto de criação |
| 4 | Kanban | Não iniciada; Em andamento; Bloqueada; Concluída; Cancelada | 2; 1; 1; 1; 1 | Estados mutuamente exclusivos |
| 5 | Cards | Título, ID, contexto, próximo passo, chip, responsável e prazo | Ex.: Conferir certidão-base; Validar grafia do ascendente; Emitir relatório FI; Registrar fonte paroquial; Consulta duplicada | Não esconder bloqueio ou prazo crítico em tooltip |

### Conteúdo de cada card

- Título da tarefa.
- ID do caso ou contexto de origem.
- Próximo passo legível.
- Estado/risco: alta, média, SLA em risco, bloqueio, concluída, histórico.
- Responsável.
- Data/prazo.
- Contagem de anexos/comentários apenas se tiver uso.

### Ocultar / legado

- Coluna “aguardando” genérica sem semântica; usar bloqueada, aguardando cliente ou em revisão segundo a regra.
- Cards sem responsável, prazo ou próximo passo, salvo cancelados/históricos.
- Kanban duplicado em páginas de caso sem link de origem.

---

## 14. Desk — Caso 360

### Wireframe aprovado

| Ordem | Superfície | Conteúdo | Indicadores demonstrativos | Regra |
|---|---|---|---|---|
| 1 | Cabeçalho de caso | “Família Bianchi”; subtítulo “Reconhecimento italiano · pesquisa e validação”; chip “Dados demonstrativos” | — | Caso selecionado é a fonte de contexto de todos os cards |
| 2 | Abas internas | Visão geral, Jornada, Pesquisa, Documentos, Financeiro, Jurídico, Cliente | — | Não duplicar páginas globais; cada aba filtra pelo caso |
| 3 | Linha do tempo | Contrato 21/03; Onboarding 04/04; Pesquisa 18/05; Certidões 02/06 | marcos | Eventos com origem e data reais |
| 4 | Participantes | Giulia, Carlo, Marina, Tatiana; com papéis | 4 participantes | Separar pessoa/caso/usuário interno |
| 5 | Progresso por frente | Formalização, Pesquisa, Documentos, Publicação | concluída / em andamento / em coleta / inicial | Não usar percentual sem fórmula documentada |
| 6 | Estado do dossiê | Confirmados 12; Em revisão 5; Pendentes 3 | donut | Deve reconciliar com o dossiê real |
| 7 | Jornada D0–D365 | Aceite, Onboarding, Pesquisa, Documentos, Encerramento | etapa atual Pesquisa; cadência Em dia; próxima ação; microentrega; alertas | Dados efetivos e um item por estado |

### Oculto

- Dados brutos de integrações, logs, ajustes técnicos e toda informação não necessária à gestão do caso.

### Legado

- Páginas separadas que repetem o mesmo resumo de caso com nomenclaturas distintas.
- Barra de progresso decorativa sem frente operacional, estado ou fonte.

---

## 15. Desk — Pessoas 360

### Wireframe obrigatório

| Zona | Conteúdo | Indicadores reais | Destino |
|---|---|---|---|
| Pesquisa e seleção | Encontrar pessoa e contextualizar caso/núcleo | pessoa selecionada, casos associados | Manter |
| Perfil de pessoa | Nome, papel, relação, dados aplicáveis e consentimento | status cadastral, conexões, pendências | Manter |
| Relações | Pais, cônjuge, filhos, dependentes, possíveis vínculos | tipo de vínculo e grau de confirmação | Manter |
| Atividade | Interações, documentos, solicitações e próximos passos | data, origem e responsável | Manter |
| Sinais | Duplicidade, conflito, lacuna documental, consentimento | prioridade e ação recomendada | Manter |

### Não confundir

- Pessoas 360 é uma ficha operacional/relacional.
- Pessoas & Famílias é a leitura de linhagem e cobertura geracional.
- Árvore do App é uma publicação simplificada e autorizada.

### Legado

- Cadastro de pessoas isolado, sem vínculo com caso, família ou evidência.
- Duplicar a mesma árvore em vários módulos com fontes diferentes.

---

## 16. Desk — Radar & Matrizes

### Premissa

Preservar as especificações de radar já existentes. O mockup aprovado define como os resultados aparecem no Desk, não uma reescrita das regras internas.

### Wireframe aprovado

| Ordem | Superfície | Conteúdo | Indicadores demonstrativos | Regra |
|---|---|---|---|---|
| 1 | Título | “Radar & Matrizes”; descrição; chip “Sem dados reais” | — | Indicar origem/atualização quando em produção |
| 2 | Faixa de controle | “Radar interno”; filtros; seletor de caso “Caso: Ana Luiza (demonstrativo)” | — | Seleção deve sincronizar matriz e radar individual |
| 3 | Alternador | “Matriz de prioridade” / “Radar individual” | — | Não renderizar os dois como concorrentes fora do layout aprovado |
| 4 | Card esquerdo | “Matriz elegibilidade × prioridade”; quadrantes Avaliar, Agir agora, Monitorar, Cultivar | nomes demonstrativos | Pontos clicáveis selecionam o caso no radar à direita |
| 5 | Legenda/ordem | Ordem de atendimento; Crítico, Atenção, Saudável | Beatriz Lima; Diego Nogueira; Helena Duarte | Regra de ordenação documentada |
| 6 | Card direito | “Radar individual — caso selecionado”; radar 4 eixos: História familiar 72%, Documentos 58%, Estratégia 81%, Próximos passos 64% | percentuais demonstrativos | Valores somente se a fórmula real existe e é rastreável |
| 7 | Lista de situação | Situação, Prioridade, Urgência, Elegibilidade, Responsável | Em pesquisa; Alta; Prazo em 5 dias; Provável; Equipe de pesquisa | Tudo deve possuir fonte de regra |
| 8 | Próxima ação | “Confirmar certidão de nascimento do ascendente · prazo 18/09”; bloqueio informado | — | Deve abrir tarefa/origem |

### Camadas

- Matriz global: atende priorização do portfólio de casos.
- Radar individual: leitura de caso selecionado.
- Radar do App: comunicação pública, sem equivalência obrigatória com eixos/taxonomia interna.

### Ocultar / legado

- Ocultar dados de cálculo e pontuação técnica onde o usuário não tem permissão.
- Arquivar medidores antigos ou duplicados que não usam os eixos e regras atuais.
- Não manter “score geral” isolado se ele não decide prioridade, capacidade ou próxima ação.

---

## 17. Desk — Pesquisa

### Wireframe aprovado

| Ordem | Superfície | Conteúdo | Indicadores demonstrativos | Regra |
|---|---|---|---|---|
| 1 | Título | “Pesquisa”; descrição; chip de dados | — | Manter |
| 2 | Faixa | “Dossiê de pesquisa”; filtros; “Nova consulta” | — | Uma entrada para criação de consulta |
| 3 | Card | Fontes e referências | Arquivo paroquial — Lucca; Registro civil — Santos; Lista de imigração; Arquivo militar | Status: revisada, em leitura, a consultar |
| 4 | Card | Hipóteses e confiança | Confiança da cadeia 82%; Grafia alternativa provável; Segundo casamento a confirmar; Naturalização anterior refutada | Separar hipótese, evidência e conclusão |
| 5 | Card | Miniatura familiar | Carlo, Elena, Giulia, Marina, João; 2 de 3 gerações documentadas | Visual de apoio, não fonte autônoma |
| 6 | Faixa de processo | Pergunta → Fonte → Evidência → Achado → Microentrega → Pronta para revisão | estágios | Cada etapa precisa ter artefato/estado |
| 7 | Card | Cobertura das fontes | Registro civil 11; Paroquial 8; Imigração 5; Militar 2 | Quantidade com link para lista filtrada |
| 8 | Card | Produção de evidências | Abr 4; Mai 7; Jun 6; Jul 10; Ago 13 | Métrica definida e período explícito |

### Oculto

- Conclusões em elaboração, dados não verificados, hipóteses sensíveis e fontes sem permissão de visualização.

### Legado

- Pesquisa sem pergunta de origem.
- “Achado” que não conecta evidência, fonte e responsável pela revisão.
- Relatórios ou gráficos sem possibilidade de abrir o conjunto de dados correspondente.

---

## 18. Desk — Biblioteca Mestre

### Wireframe obrigatório

| Zona | Conteúdo | Indicadores reais | Destino |
|---|---|---|---|
| Cabeçalho | “Biblioteca Mestre” e estado de publicação | coleções, itens em revisão, publicados, arquivados | Manter |
| Coleções | Cadernos, Relatórios, Narrativas e demais taxonomias aprovadas | número de itens e último update | Manter |
| Lista de conteúdo | título, coleção, caso/família, autor, estado editorial, versão, data | rascunho, em revisão, aprovado, publicado, arquivado | Manter |
| Painel editorial | revisão, aprovação, visibilidade App, entrega vinculada | responsável, data, público | Manter |
| Ações | criar, revisar, publicar, despublicar, arquivar | auditáveis | Manter |

### Oculto

- Itens em rascunho ou em revisão para usuários sem papel editorial.
- Arquivos de trabalho, anexos técnicos e versões intermediárias no App Cliente.

### Legado

- Pastas ou páginas onde “arquivo físico”, “documento solicitado”, “evidência” e “conteúdo publicado” são tratados como o mesmo tipo de coisa.

---

## 19. Desk — Financeiro

### Wireframe obrigatório

| Zona | Conteúdo | Indicadores reais | Destino |
|---|---|---|---|
| Resumo | visão financeira do período | previsto, recebido, vencido, em atraso, saldo | Manter |
| Recebimentos | faturas/parcelas e status | valor, vencimento, pagamento, método, conciliação | Manter |
| Obrigações | custos/repasse/fornecedores quando aplicável | valor, competência, status, responsável | Manter |
| Gráficos | evolução e composição | período, unidade monetária e fonte | Manter |
| Relação com caso | vínculo financeiro ao caso/contrato | contrato, cliente, parcela, observação | Manter |

### Oculto e legado

- Ocultar dados financeiros em telas de pesquisa, árvore e App Cliente, salvo o que o contrato determinar.
- Arquivar widgets financeiros genéricos sem conciliação, data de competência e vínculo de origem.

---

## 20. Desk — Jurídico & Contrato

### Wireframe aprovado

| Ordem | Superfície | Conteúdo | Indicadores demonstrativos | Regra |
|---|---|---|---|---|
| 1 | Título | “Jurídico & Contrato” | — | Manter |
| 2 | Card | Escopo e assinatura | Contrato-base v2 vigente; Anexo I assinado; Anexo IV assinado; Aditivo de dependente pendente | Cada linha abre documento/ação |
| 3 | Card | Assinatura | Giulia Bianchi; assinatura registrada 21/03/2026; integridade validada | Evidência de assinatura deve ser rastreável |
| 4 | Card | Validação jurídica | Cadeia documental completa validada; retificação em análise; tradução juramentada pendente; apostilamento pendente | Estados claros e não conclusivos quando aplicável |
| 5 | Card | Conflitos e conferências | Variação de sobrenome revisar; datas conferidas; representação aplicável; poderes conferidos | Um conflito = origem + ação |
| 6 | Faixa | Alertas do contrato e atos formais | aditivo pendente; conferir poderes; integridade validada | Não esconder alertas no detalhe |
| 7 | Card | Completude formal | Contrato-base assinado; anexos 6 de 7; procurações em conferência; validação documental em análise | Barra só com definição de completude |

### Oculto

- Pareceres internos e documentação de terceiros sem acesso aplicável.
- Dados de assinatura expostos em contexto incorreto.

### Legado

- Tela de contrato baseada apenas em upload de PDF sem escopo, assinatura, validação, conflito e completude.

---

## 21. Desk — Pessoas & Famílias

### Wireframe aprovado

| Ordem | Superfície | Conteúdo | Indicadores demonstrativos | Regra |
|---|---|---|---|---|
| 1 | Título | “Pessoas & Famílias” | — | Manter |
| 2 | Card | “Gerações G1–G5” | G5 Antônio R. 1860 / Isabel F. 1887; G4 Carlo Bianchi 1891 / Elena Rossi 1895; G3 Luigi Bianchi 1923 / Rosa Moretti 1927; G2 Paulo Bianchi 1965 / Marta Costa 1968; G1 Giulia/Marina Bianchi | Cada registro deve ter fonte/nível de confirmação |
| 3 | Card | Leitura da linhagem | Conexão-chave Carlo Bianchi; Território Lucca · Toscana; Pessoas conectadas 12 de 31; falta Certidão G4 | Indicadores conectados à pesquisa, não decorativos |
| 4 | Card amplo | Árvore visual do núcleo | Carlo/Elena → Giulia → Marina/João | Relações devem diferenciar confirmado, provável e pendente |
| 5 | Lista | Núcleo Bianchi — dossiê-mãe ativo; Núcleo Rossi — possível duplicidade revisar | status | Ação para abrir/fundir/revisar |
| 6 | Card | Rede de núcleos e dependentes | grafo com CB, ER, GB, MB, JB | Visual complementar, não banco de dados isolado |
| 7 | Card | Cobertura por geração | G1 100; G2 92; G3 78; G4 56; G5 34 | Percentual requer fórmula de cobertura publicada internamente |

### Oculto

- Informações de privacidade, hipóteses e indivíduos não autorizados para áreas que não precisam acessá-los.

### Legado

- Geração de árvore pública diretamente da base sem camada de liberação.
- Grafos duplicados com relações contraditórias.

---

## 22. Desk — Portal do Cliente (visão interna)

### Wireframe obrigatório

| Zona | Conteúdo | Indicadores reais | Destino |
|---|---|---|---|
| Resumo por família/caso | status geral de publicação do App | módulos publicados, pendentes, última atualização | Manter |
| Matriz de módulos | Home, Jornada, Radar, Árvore, Documentos, Legado, Conta | visível/oculto, rascunho/revisão/publicado, responsável | Manter |
| Fila editorial | itens para revisar e publicar | tipo de conteúdo, família, origem, responsável, prazo | Manter |
| Prévia | visualização segura da tela/trecho do App | versão a publicar | Manter |
| Histórico | publicações, despublicações e justificativas | data, autor, alteração | Manter |

### Regra crítica

O Desk não deve editar diretamente dados de pesquisa “dentro” do App. Ele deve promover conteúdo aprovado por uma camada de publicação: origem → revisão → aprovação → visibilidade no módulo correto.

### Legado

- Botões “publicar” sem prévia, trilha de auditoria, público-alvo ou status editorial.
- Qualquer fluxo que exponha automaticamente documentos/evidências ao concluir uma tarefa interna.

---

## 23. Desk — Configuração & Acesso

### Wireframe obrigatório

| Zona | Conteúdo | Indicadores reais | Destino |
|---|---|---|---|
| Usuários | nome, papel, status, último acesso | ativo/inativo/convidado | Manter |
| Papéis | permissões por domínio | leitura, edição, publicação, administração | Manter |
| Acessos por família/caso | usuários internos e acesso do cliente | escopo e validade | Manter |
| Parâmetros | taxonomias, estados, cadências, regras de alerta | versão e responsável | Manter |
| Integrações/auditoria | integrações habilitadas e eventos críticos | saúde, última sincronização, registro | Manter |

### Oculto

- Segredos, tokens, credenciais e configurações de infraestrutura para qualquer pessoa sem papel técnico autorizado.

### Legado

- Permissões codificadas em telas isoladas sem matriz central de papéis.
- Configurações duplicadas que alteram o mesmo estado em lugares diferentes.

---

# Parte C — Sobreposições, ocultação e destino técnico

## 24. O que é sobreposto versus duplicado

| Conceito | Onde existe | Como deve coexistir | O que seria duplicação indevida |
|---|---|---|---|
| Jornada | App e Caso 360 | App comunica etapa publicada; Caso 360 gere marcos e frentes internas | Dois cálculos independentes de etapa sem origem comum |
| Radar | App e Radar & Matrizes | App simplifica e publica; Desk analisa e prioriza | Copiar score/percentual interno como se fosse leitura pública |
| Árvore | App e Pessoas & Famílias | App exibe vínculos liberados; Desk administra dados e confirmação | Expor árvore operacional completa no App |
| Documentos | App e Caso 360/Jurídico/Pesquisa | App mostra solicitação/recebimento/liberação/entrega; Desk gere validação e evidência | Misturar arquivos internos com materiais liberados |
| Legado | App e Biblioteca Mestre | App consome coleções publicadas; Desk cria, revisa e publica | App consultar rascunhos diretamente |
| Pessoas | App, Pessoas 360 e Pessoas & Famílias | App mostra somente relação liberada; Desk mantém cadastro e linhagem | Três fontes de pessoa/vínculo divergentes |
| Próxima ação | App, Hoje, Kanban, Caso 360 | App exibe só ação da família; Desk exibe ações operacionais | Mostrar no App tarefas da equipe ou manter ações paralelas sem fonte |

---

## 25. Lista direta para o Claude — retirar da linha ativa

> Antes de remover código, criar uma tag/branch de preservação e registrar a origem. O objetivo é tirar poluição da linha ativa sem apagar rastreabilidade.

### Arquivar como legado no GitHub

1. Telas, componentes, rotas e widgets que não pertencem às 17 páginas aprovadas nem às 13 abas desk definidas neste documento.
2. Dashboards genéricos, cards KPI, gráficos, tabelas ou “analytics” sem decisão operacional e sem correspondência na prancha.
3. Implementações antigas de radar que não correspondem às especificações de radar atualmente aprovadas.
4. Barras de progresso sem fórmula, sem origem de dados ou sem estado operacional/publicável claro.
5. Duplicações de navegação: sidebar, tabs, rodapés, menus hambúrguer ou rotas que oferecem o mesmo destino sob nomes diferentes.
6. Listas de documentos que misturam upload bruto, evidência de pesquisa, solicitação ao cliente, contrato e entrega final sem tipo/estado editorial.
7. Dados demonstrativos hard-coded usados como se fossem dados reais, sem rótulo “Dados demonstrativos” ou “Sem dados reais”.
8. Cards sem título, origem, ação, estado, responsável ou propósito explícito.
9. Páginas de perfil que exponham logs técnicos, permissões internas, tokens, IDs de infraestrutura ou informações administrativas ao usuário final.
10. Árvores/grafos paralelos que calculam relações com fontes diferentes e podem gerar contradição.
11. Telas de CRUD cru abertas ao usuário final, quando deveriam ser uma leitura de produto ou um fluxo editorial.
12. Experimentos visuais que quebrem o sistema de superfícies: fundos coloridos sem função, sombras pesadas, raio inconsistente, cores fora da paleta e ícones misturados.

### Manter somente se estiverem integrados ao novo modelo

1. Modelos e serviços de dados que alimentam Caso 360, Pessoas, Pesquisa, Documentos, Financeiro, Jurídico, Biblioteca, publicação do App e controle de acesso.
2. Componentes de radar existentes, desde que obedeçam às especificações já aprovadas e tenham uma única fonte de dados/regra.
3. Serviços de upload, armazenamento, auditoria, autenticação e permissões, mesmo que as telas antigas sejam arquivadas.
4. Histórico de versões/editorial e trilhas de publicação, desde que o novo Portal do Cliente as use.
5. Componentes de gráficos apenas quando o gráfico aparece no wireframe e tem métrica definida.

### Como arquivar

1. Criar tag de preservação: `legacy-pre-mockup-17p`.
2. Criar branch de arquivo: `archive/legacy-pre-mockup-17p`.
3. Mover rotas, componentes e telas removidas para uma pasta de legado ou excluir da branch principal após tag, conforme política do repositório.
4. Criar `docs/legacy-inventory.md` com: caminho antigo, finalidade, motivo do arquivamento, dependências e substituto atual.
5. Remover rotas antigas da navegação, links internos, imports mortos, feature flags obsoletas e testes correspondentes que não representam a linha aprovada.
6. Não apagar migrations, dados, políticas de segurança, auditoria ou serviços de backend sem mapear dependências e plano de migração.

---

## 26. Lista direta para o Claude — manter e construir

### Shell e design system

- [ ] Implementar shell desk único: faixa superior, busca, sidebar, área de conteúdo e navegação horizontal de módulos.
- [ ] Implementar shell App único: cabeçalho azul, rodapé fixo de 7 itens e superfícies de card.
- [ ] Centralizar tokens de cor, tipografia, espaçamento, raio, sombras, chips, estados e ícones.
- [ ] Eliminar estilos locais que contrariem o kit visual.

### App Cliente

- [ ] Entregar as 7 telas: Home/Sua Jornada, Jornada, Radar Ancestral, Árvore, Documentos, Legado e Conta.
- [ ] Respeitar rigorosamente a ordem vertical de cards descrita neste documento.
- [ ] Criar estados vazios honestos, idênticos em intenção aos mockups.
- [ ] Aplicar camada de publicação: apenas conteúdo liberado aparece ao cliente.
- [ ] Manter os radares existentes e ajustar somente superfície, textos, estados e integração aprovados.

### Desk

- [ ] Entregar as 13 abas: Hoje, Comercial/CRM Vivo, Checklist/Kanban, Caso 360, Pessoas 360, Radar & Matrizes, Pesquisa, Biblioteca Mestre, Financeiro, Jurídico & Contrato, Pessoas & Famílias, Portal do Cliente, Configuração & Acesso.
- [ ] Fazer toda métrica clicável abrir sua lista/origem filtrada.
- [ ] Garantir que uma mesma entidade tenha fonte única: pessoa, caso, família, documento, fonte, tarefa, contrato, publicação e usuário.
- [ ] Diferenciar com clareza estado interno, estado editorial e estado público.
- [ ] Tratar “Sem dados reais” e “Dados demonstrativos” como estados explícitos, não como dados silenciosamente simulados.

---

## 27. Critérios de aceite

### Aceite visual

- [ ] A interface do App corresponde às 7 telas aprovadas, em conteúdo, ordem, rodapé, cabeçalhos, superfícies, cores e estados vazios.
- [ ] A interface Desk corresponde à prancha aprovada: shell, navegação, títulos, chips, cards, grids, gráficos e áreas vazias.
- [ ] Não há widgets extras ocupando os vazios planejados.
- [ ] Não há rotas duplicadas ou menus que levem ao mesmo conteúdo com nomes distintos.
- [ ] Radar do App e radar do Desk mantêm as suas especificações, sem mistura de linguagem e sem duplicação visual.

### Aceite funcional

- [ ] Próxima ação do App mostra apenas ação da família, nunca tarefa interna.
- [ ] O conteúdo do App é sempre filtrado por publicação/liberação e permissão.
- [ ] Documento recebido não é automaticamente documento validado ou liberado.
- [ ] Achado de pesquisa não é automaticamente conteúdo publicado.
- [ ] Métrica, gráfico, chip e progresso possuem fonte de dados, regra e estado definidos.
- [ ] Seleção de caso sincroniza somente as superfícies que pertencem ao mesmo contexto.
- [ ] Toda publicação e despublicação é rastreável.

### Aceite técnico

- [ ] A linha principal não contém rotas, imports, componentes e estilos mortos do legado.
- [ ] O legado está identificado em tag/branch e inventário de documentação.
- [ ] Não houve exclusão de políticas, migrations, dados ou serviços críticos sem migração validada.
- [ ] Tipos, contratos de dados e permissões distinguem estado interno, revisão, publicação e arquivamento.
- [ ] Testes cobrem a camada de visibilidade do App, navegação, permissões e estados de publicação.

---

## 28. Sequência curta de execução

1. Congelar o estado atual do repositório em tag e branch de legado.
2. Inventariar rotas/componentes atuais contra este De–Para; marcar: manter, refatorar, ocultar ou arquivar.
3. Implementar os dois shells e o design system antes de preencher telas.
4. Ajustar navegação e rotas para as 7 telas App e 13 abas Desk.
5. Construir as superfícies na ordem do mockup, começando por App e depois Desk.
6. Ligar conteúdo a uma camada explícita de estado: interno, revisão, aprovado, publicado, arquivado.
7. Conectar radares existentes sem redesenhar sua lógica aprovada.
8. Remover da linha principal todos os elementos sem lugar neste documento.
9. Validar tela a tela com os critérios de aceite visual, funcional e técnico.

---

## 29. Nota de governança

O mockup é a fonte de verdade para composição visual, hierarquia, texto demonstrativo, superfícies e navegação. As regras de negócio existentes e aprovadas — principalmente as dos radares — são a fonte de verdade para cálculo, critérios e dados. Quando houver conflito, não “inventar” uma terceira interpretação: registrar a divergência, preservar a regra aprovada e adaptar a apresentação ao mockup.
