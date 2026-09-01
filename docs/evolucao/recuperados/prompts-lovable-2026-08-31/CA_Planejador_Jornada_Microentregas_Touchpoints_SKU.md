# Clube Ancestral — Planejador de Cidadania, Jornada, Micro-entregas, Touchpoints e SKUs

**Versão:** 1.0  
**Data:** 28 de agosto de 2026  
**Uso:** Documento de referência operacional para Desk Intelligence, app cliente Ancestral Canvas, Supabase, catálogo comercial, Asaas e automações de relacionamento.

---

## 1. Objetivo e princípio operacional

O Planejador de Cidadania é o orquestrador da experiência do cliente no Clube Ancestral. Ele transforma dados de genealogia, elegibilidade, documentos, produtos contratados, pagamentos e eventos operacionais em uma jornada visível, com próximos passos claros para o cliente e governança para o Desk Intelligence.

A premissa central é: **cada avanço percebido pelo cliente deve virar uma micro-entrega registrada, uma atualização de jornada e, quando fizer sentido, uma oferta comercial contextual — nunca uma oferta aleatória.**

O artefato conecta cinco dimensões:

1. **Ciclo de vida:** estágio comercial e operacional do cliente/caso.
2. **Jornada:** fase do processo de cidadania e do legado familiar.
3. **Micro-entrega:** evidência tangível de progresso apresentada no app ou enviada por canal humano.
4. **Touchpoint e cadência:** quem comunica, em qual canal, em qual momento e com qual objetivo.
5. **SKU:** produto comercial que habilita, aprofunda ou conclui determinada entrega.

A base operacional existente registra cerca de 57 SKUs, com aproximadamente 30 classificados como TOP Pareto. A orientação é implantar primeiro os SKUs críticos, sanear sobreposições e somente depois expandir a cauda longa. A reconciliação Asaas está funcional, mas a sincronização produto ↔ preço ↔ link ainda deve ser tratada como pendência de integração. [file:1]

---

## 2. Arquitetura da jornada

### Fases do Planejador

| Fase | Nome para o cliente | Objetivo operacional | Saída mínima para avançar |
|---|---|---|---|
| 0 | Descobrir sua história | Captar dados iniciais e verificar aderência à pesquisa/cidadania | Lead identificado e diagnóstico iniciado |
| 1 | Diagnóstico e Direção | Estimar elegibilidade, definir hipótese de linhagem e orientar a primeira estratégia | Relatório ou devolutiva inicial + próximos passos |
| 2 | Pesquisa e Documentos | Encontrar, solicitar, receber e organizar certidões e evidências | Linha documental suficientemente comprovada ou pendências qualificadas |
| 3 | Validação e Pasta | Validar certidões, tratar divergências, tradução, apostila e estratégia jurídica | Checklist crítico aprovado pelo admin/revisor |
| 4 | Protocolo e Acompanhamento | Preparar, protocolar e acompanhar a via consular, administrativa ou judicial | Protocolo realizado ou caso formalmente encaminhado |
| 5 | Reconhecimento e Legado | AIRE/passaporte, registros familiares, memória e continuidade | Reconhecimento registrado ou plano de continuidade ativado |

### Estados paralelos do caso

A fase não substitui o estado do caso. Todo caso deve ter ambos os campos.

| Estado | Uso |
|---|---|
| `lead` | Ainda sem contratação ou caso ativo |
| `qualificado` | Dados mínimos obtidos; aguarda diagnóstico/proposta |
| `proposta_enviada` | Proposta comercial emitida |
| `aguardando_pagamento` | Produto escolhido; cobrança pendente |
| `onboarding` | Pagamento confirmado; coleta inicial de dados/documentos |
| `em_andamento` | Serviço ativo na fase correspondente |
| `aguardando_cliente` | Próximo passo depende de documento, resposta ou aprovação do cliente |
| `aguardando_terceiro` | Depende de cartório, arquivo, tradutor, consulado, tribunal ou parceiro |
| `bloqueado` | Há impedimento ou pendência crítica que exige decisão humana |
| `pausado` | Caso suspenso por cliente ou operação |
| `concluido` | Escopo contratado entregue |
| `pos_reconhecimento` | Reconhecimento concluído; ativar ofertas de continuidade |

---

## 3. Matriz principal: ciclo de vida, micro-entregas, touchpoints e SKUs

| Ciclo de Vida / Fase | Evento ou Gatilho | Micro-entrega visível | Touchpoint e cadência | Produto / SKU âncora | Oferta contextual e regra comercial | Status de implantação |
|---|---|---|---|---|---|---|
| Lead novo / Fase 0 | Cadastro no site, anúncio, indicação, LinkedIn ou WhatsApp | Confirmação de recebimento + convite para iniciar o Radar | **Imediato:** e-mail ou WhatsApp; **D+1:** lembrete se o radar não for concluído | Diagnóstico Gratuito / `CA-DIAG-FREE-001` | Não vender ainda; capturar país de interesse, parentesco, sobrenome e objetivo | Crítico |
| Lead em diagnóstico / Fase 0 | Radar iniciado | Progresso do questionário e hipótese preliminar de país/linha | In-app em tempo real; WhatsApp apenas se abandono em 48h | Diagnóstico Gratuito / `CA-DIAG-FREE-001` | Exibir “continuar diagnóstico”; não apresentar preço antes de gerar valor | Crítico |
| Lead qualificado / Fase 1 | Radar concluído | Resultado simplificado: potencial, revisão necessária ou rota não aplicável | Imediato no app; e-mail-resumo; WhatsApp humano em até 1 dia útil para leads qualificados | Consultoria / Diagnóstico / `CA-CID-001` ou `CA-DIAG-ELIG-002` | CTA: contratar análise aprofundada; se houver incerteza, vender consultoria, não promessa de cidadania | Crítico |
| Diagnóstico contratado / Fase 1 | Pagamento confirmado | Boas-vindas + checklist de informações e documentos mínimos | Imediato: e-mail/WhatsApp de confirmação; **D+2:** lembrete de checklist; semanal até conclusão | Consultoria / Diagnóstico / `CA-CID-001` | Incluir relatório, devolutiva e trilha inicial; criar oportunidade futura de pasta/assessoria | Crítico |
| Diagnóstico concluído / Fase 1 | Parecer e estratégia aprovados internamente | Relatório de elegibilidade sintetizado, risco, rota sugerida e próximos passos | Entrega no app + e-mail; chamada de devolutiva quando prevista no escopo; follow-up em D+3 | Consultoria / Diagnóstico / `CA-CID-001` | Oferta em 3 níveis: documento avulso, combo documental ou Assessoria Completa | Crítico |
| Estratégia definida / Fase 1 | Cliente escolhe país e via | Plano de ação: linha prioritária, marcos, documentos críticos, estimativa em faixa | App imediatamente; WhatsApp após reunião; D+7 se proposta não fechada | Montagem de Pasta / `CA-CID-002`; Assessoria Completa / `CA-CID-003` | Diferenciar escopo: Pasta = execução documental; Assessoria Completa = produto guarda-chuva/orquestrador | Crítico |
| Onboarding / Fase 2 | Contrato assinado e pagamento confirmado | Card “Pagamento confirmado” + próximo passo + acesso ao portal de upload | Imediato: app, e-mail e WhatsApp; D+2 se sem upload; D+7 alerta de onboarding parado | SKU contratado no caso | Não fazer upsell no primeiro touchpoint; priorizar confiança e coleta de dados | Crítico |
| Árvore em construção / Fase 2 | Dados familiares recebidos | Linha ancestral inicial, pessoas confirmadas, lacunas e hipóteses | Atualização no app a cada achado relevante; resumo operacional quinzenal | Pesquisa Genealógica / `CA-MEM-001`; Pesquisa por Sobrenome / `CA-RES-SOB-004` | Quando descoberta desbloquear nova linha, oferecer pesquisa complementar ou expansão de árvore | Crítico |
| Documento faltante / Fase 2 | Checklist identifica certidão obrigatória ausente | Item documental com pessoa, local provável, tipo de certidão, status e SLA estimado | App imediato; mensagem humana somente quando ação do cliente for necessária; lembrete D+7/D+14 conforme SLA | Pedido de Certidão / `CA-DOC-001` | Se houver 2+ documentos críticos, priorizar `CA-DOC-002` Combo de Certidões em vez de múltiplos avulsos | Crítico |
| Pedido documental iniciado / Fase 2 | Solicitação enviada a cartório/arquivo/base | “Pedido iniciado” com origem, data, previsão e dependência externa | App imediato; atualização somente por mudança de status ou relatório quinzenal | Pedido de Certidão / `CA-DOC-001` | Sem nova oferta; foco em transparência e redução de ansiedade | Crítico |
| Certidão localizada / Fase 2 | Fonte confirma localização | Achado Histórico: prévia, referência de fonte, pessoa vinculada e próximo passo | Push/in-app imediato; WhatsApp de celebração apenas em achados de alto valor; relatório quinzenal | Pedido de Certidão / `CA-DOC-001`; Pesquisa por país | Oferecer aquisição/emissão, tradução ou apostila apenas se necessário para o caso | Crítico |
| Conjunto documental incompleto / Fase 2 | Cliente possui vários itens pendentes | Painel “Documentos críticos restantes” e recomendação de lote | App; e-mail semanal enquanto houver itens bloqueantes; WhatsApp no segundo ciclo sem avanço | Combo de Certidões / `CA-DOC-002` | Oferta de combo com desconto transparente versus avulsos; não ofertar se cliente já possui pedido ativo equivalente | Crítico |
| Pesquisa por país — Itália / Fase 2 | País/linha Itália selecionado | Linha italiana, geração, fontes e alertas de transmissão/naturalização | App por marcos; revisão humana ao detectar risco legal | Pesquisa Itália / `CA-RES-ITA-001` | Direcionar para análise jurídica ou rota judicial/consular após documentação suficiente | Crítico |
| Pesquisa por país — Portugal / Fase 2 | País/linha Portugal selecionado | Linha portuguesa, fontes, vínculo e pendências | App por marcos; relatório quinzenal | Pesquisa Portugal / `CA-RES-POR-001` | Oferta de montagem de pasta quando documentos essenciais forem confirmados | Crítico |
| Pesquisa por país — Espanha / Fase 2 | País/linha Espanha selecionado | Linha espanhola, fonte, janela/regra aplicável e pendências | App por marcos; atenção humana para limites temporais/regras específicas | Pesquisa Espanha / `CA-RES-ESP-001` | Não prometer protocolo; oferecer validação jurídica quando houver prova documental | Crítico |
| Pesquisa por país — Alemanha, Polônia, Hungria, Áustria, Luxemburgo / Fase 2 | País de rota secundária escolhido | Status de pesquisa, fonte, ancestral, lacunas e estimativa operacional | App por marco; relatório quinzenal; escalonamento humano conforme complexidade | `CA-RES-GER-001`, `CA-RES-POL-001`, `CA-RES-HUN-001`, `CA-RES-AUT-001`, `CA-RES-LUX-001` | Implementar como catálogo parametrizado por país; ativar após validação das regras e fornecedores | Backlog |
| Documento recebido / Fase 2 | Arquivo é carregado/recebido | Documento disponível, status “em análise” e vínculo com pessoa da árvore | Notificação no app; sem WhatsApp salvo se for solicitação do cliente | SKU de documento em curso | Sem oferta; criar tarefa de validação interna | Crítico |
| Documento validado / Fase 2 | Genealogista/revisor aprova evidência | Selo “validado” + progresso percentual da pasta | App imediato; resumo quinzenal; mensagem humana quando desbloquear etapa | Revisão documental / componente de `CA-CID-002` | Se exigir tradução/apostila, mostrar o próximo serviço necessário com contexto | Crítico |
| Inconsistência detectada / Fase 3 | Nome, data, local ou filiação divergente | Alerta claro: divergência encontrada, impacto, documento afetado e ação em análise | App com linguagem não alarmista; WhatsApp/e-mail humano em até 1 dia útil; atualização semanal até definição | Retificação / `CA-LAW-RET-001` | Não automatizar cobrança: revisão humana define necessidade, escopo e proposta de retificação | Crítico |
| Tradução requerida / Fase 3 | Documento aprovado, porém idioma/formato exige tradução | Checklist de tradução com documento e dependência | App imediato; follow-up D+5 se decisão pendente | Tradução / `CA-LAW-TRAD-001` | Oferecer por documento ou pacote; respeitar SKU e preço vigente | Crítico |
| Apostilamento requerido / Fase 3 | Documento aprovado e requer apostila | Checklist de apostila com emissor, local e status | App imediato; cadência semanal enquanto pendente | Apostilamento / `CA-LAW-APOS-001` | Oferta apenas quando aplicável à rota/documento; não tratar como requisito universal | Crítico |
| Pasta 80% pronta / Fase 3 | Completude documental atinge limiar configurado | Card de progresso: “sua pasta está 80% pronta” + lista curta do que falta | App imediato; e-mail de progresso; reunião opcional se houver bloqueio crítico | Montagem de Pasta / `CA-CID-002` | Oferta de revisão jurídica/finalização premium, se ainda não contratada e elegível | Crítico |
| Checklist jurídico completo / Fase 3 | Todos os itens bloqueantes validados | Pronto para revisão final: certidões, traduções, apostilas e divergências resolvidas | App informa “em revisão final”; admin recebe alerta interno imediato | Validação Jurídica / `CA-LAW-VAL-001` | Não vender automaticamente; concluir gate interno antes de proposta de protocolo | Crítico |
| Pasta aprovada / Fase 4 | Admin/revisor libera avanço | Linha do tempo de protocolo, rota escolhida, documentos prontos e previsão em faixa | App + e-mail; chamada estratégica conforme contrato | Assessoria Completa / `CA-CID-003`; Protocolo Consular / `CA-PROT-CONS-001`; Protocolo Judicial / `CA-PROT-JUDI-001` | Gerar proposta/contrato paramétrico com país, rota, escopo, exclusões e estimativas não garantidas | Crítico |
| Contrato de protocolo emitido | Oferta final aprovada pelo cliente | Contrato disponível para assinatura + resumo de escopo e pagamento | E-mail imediato; WhatsApp D+2 se pendente; lembrete final conforme política comercial | Contrato Paramétrico / `CA-PROT-CONT-001` | Um contrato deve referenciar os SKUs contratados e a versão de preço; nunca texto livre sem vínculo | Crítico |
| Protocolo realizado / Fase 4 | Pedido enviado/ajuizado/registrado | Marco “protocolo realizado”, comprovante, número de referência quando houver e próximos marcos | App imediato; WhatsApp humano de confirmação; atualização mensal ou por evento externo | SKU de Protocolo contratado | Suspender upsell de cidadania; comunicar previsões como faixas e dependentes de terceiros | Crítico |
| Em acompanhamento externo / Fase 4 | Caso aguardando consulado, autoridade ou tribunal | Linha do tempo atualizada, último movimento, próxima janela estimada e explicação de dependência externa | Atualização mensal; extraordinária apenas por mudança relevante | Assessoria de acompanhamento prevista no contrato | Oferecer somente serviços adjacentes não conflitantes, como memória/organização documental, sem pressionar | Crítico |
| Reconhecimento confirmado / Fase 5 | Certidão/decisão/reconhecimento formal recebido | Celebração, comprovante, checklist pós-reconhecimento e próximos passos | Imediato no app, e-mail e WhatsApp humano; convite para reunião breve | Pós-reconhecimento / `CA-POS-AIRE-001` | Apresentar AIRE/passaporte e registros familiares como continuidade lógica, não como custo surpresa | Backlog |
| Pós-reconhecimento / Fase 5 | Cliente deseja passaporte, AIRE ou transcrição | Plano pós-cidadania com etapas e documentos aplicáveis | App + WhatsApp por etapa; cadência mensal enquanto serviço ativo | AIRE + Passaporte / `CA-POS-AIRE-001` | Up-sell para registros de filhos/casamento quando houver composição familiar aplicável | Backlog |
| Legado familiar / Fase 5 | Árvore, história ou achados têm valor de preservação | Linha do tempo familiar, biblioteca de descobertas, memória e convite de continuidade | In-app por novo achado; newsletter/e-mail mensal; oferta no aniversário de conclusão | Plano Essência / `CA-ASS-001`; Plano Memórias / `CA-ASS-002`; Plano Legado / `CA-ASS-003`; Pesquisa Genealógica / `CA-MEM-001` | Upgrade progressivo Essência → Memórias → Legado, condicionado ao uso e ao valor entregue | Crítico |
| Expansão familiar / Fase 5 | Filhos/cônjuge/outros parentes elegíveis ou interessados | Mapa de impacto familiar e próximos registros possíveis | App no contexto de família; WhatsApp consultivo quando solicitado | Registro de Filho/Casamento / `CA-REG-001`; Combo Família / `CA-POS-FAM-001` | Criar oferta por núcleo familiar, evitando duplicar produtos já contratados por outro membro | Backlog |

---

## 4. Cadências de comunicação

### Princípios

- O app é o **canal de verdade operacional**: status, documentos, jornada, previsões e entregas.
- WhatsApp é o canal de **acolhimento, desbloqueio, celebração e orientação humana**; não deve replicar toda alteração técnica.
- E-mail é o canal de **formalização, registro e entregas mais densas**, como proposta, contrato, relatório, orientações e avisos de cobrança.
- O Desk Intelligence é o canal de **ação interna, controle de SLA e acompanhamento de conversão**.
- Toda cadência deve cessar quando o evento de conclusão ocorrer; evitar automação repetitiva após pagamento, envio ou aprovação.

### Cadência por momento

| Momento | App cliente | WhatsApp | E-mail | Desk / automação interna |
|---|---|---|---|---|
| Novo lead | CTA para Radar | Confirmação opcional imediata | Confirmação de cadastro | Criar lead e origem; SLA de primeiro atendimento |
| Radar abandonado | Salvar progresso | D+2: lembrete simples | D+4: resumo e retomada | Criar tarefa para leads de maior potencial |
| Diagnóstico concluído | Resultado simplificado | Até 1 dia útil: convite para próxima etapa | Entrega do resumo/agenda | Classificar potencial, rota e oportunidade |
| Pagamento confirmado | Card de confirmação + checklist | Imediato: boas-vindas humana | Recibo/instruções de onboarding | Mudar status; criar caso, tarefas e produtos contratados |
| Documento pendente do cliente | Lista priorizada | D+7 e D+14 somente para item bloqueante | E-mail semanal consolidado | Escalar para `aguardando_cliente`; registrar motivo |
| Documento em análise | Status de recebimento | Não enviar, salvo exceção | Não enviar | Criar tarefa e medir SLA de análise |
| Achado relevante | Card de descoberta | Mensagem de celebração e contexto | Relatório quando aplicável | Registrar micro-entrega e possível oferta contextual |
| Bloqueio/retificação | Alerta de impacto e próximos passos | Até 1 dia útil com linguagem humana | Registro do plano de ação | Abrir incidente, definir owner e prazo de resposta |
| Protocolo realizado | Marco e comprovante | Confirmação humana | Confirmação formal | Criar próximo marco e recalcular previsão |
| Acompanhamento externo | Último andamento e janela estimada | Apenas mudança relevante | Boletim mensal se contratado | Atualizar SLA e data da última comunicação |
| Pós-reconhecimento | Checklist de continuidade | Celebração e convite | Instruções formais | Criar oportunidades AIRE/passaporte/registros |

### Regras anti-spam

1. Não enviar mais de um contato ativo por canal em 48 horas, exceto prazo crítico ou resposta do cliente.
2. Se o cliente realizar a ação, cancelar automaticamente os lembretes daquela pendência.
3. Consolidar múltiplos documentos pendentes em uma única mensagem semanal, salvo se um item bloquear protocolo.
4. Alertas de cobrança seguem política financeira separada e não devem ser misturados a atualizações genealógicas.
5. Achados históricos são momentos de alto valor emocional: comunicar com contexto e cuidado, sem transformar cada achado em oferta imediata.

---

## 5. Catálogo de micro-entregas

Uma micro-entrega deve ter registro próprio. Ela é uma unidade de valor percebido, diferente da tarefa interna e diferente do produto vendido.

| Código | Micro-entrega | Definição de pronto | Visibilidade | Métrica principal | SKU(s) relacionado(s) |
|---|---|---|---|---|---|
| `ME-DIAG-001` | Radar concluído | Perguntas mínimas respondidas e resultado preliminar calculado | Cliente + Desk | Taxa de conclusão do radar | `CA-DIAG-FREE-001` |
| `ME-DIAG-002` | Relatório de elegibilidade | Parecer entregue com hipóteses, riscos, rota e próximos passos | Cliente + Desk | Conversão diagnóstico → proposta | `CA-CID-001` |
| `ME-STRAT-001` | Plano de ação por via | Rota definida, etapas, pendências e previsão em faixa apresentadas | Cliente + Desk | Aceite de proposta | `CA-CID-002`, `CA-CID-003` |
| `ME-TREE-001` | Linha ancestral inicial | Pessoas principais e relações mínimas registradas | Cliente + Desk | Tempo até primeira descoberta | `CA-MEM-001`, `CA-RES-SOB-004` |
| `ME-DOC-001` | Checklist documental | Documentos necessários classificados por pessoa e prioridade | Cliente + Desk | Percentual de checklist iniciado | `CA-DOC-001`, `CA-DOC-002` |
| `ME-DOC-002` | Certidão localizada | Fonte e documento localizados, com referência registrada | Cliente + Desk | SLA de localização | `CA-DOC-001`, `CA-RES-*-001` |
| `ME-DOC-003` | Documento validado | Documento revisado, vinculado à pessoa e aprovado/rejeitado | Cliente + Desk | SLA de revisão | `CA-CID-002`, `CA-LAW-VAL-001` |
| `ME-LEGAL-001` | Diagnóstico de divergência | Inconsistência descrita, impacto classificado e próximo passo definido | Cliente + Desk | Taxa de casos com divergência | `CA-LAW-RET-001` |
| `ME-LEGAL-002` | Pasta apta à revisão | Itens críticos completos; faltas não bloqueantes qualificadas | Desk primeiro; cliente após validação | Completude da pasta | `CA-CID-002`, `CA-LAW-VAL-001` |
| `ME-PROT-001` | Contrato emitido | Escopo, SKUs, preço, rota e exclusões gerados de forma parametrizada | Cliente + Desk | Assinatura de contrato | `CA-PROT-CONT-001` |
| `ME-PROT-002` | Protocolo realizado | Comprovante/registro de envio associado ao caso | Cliente + Desk | Tempo pasta pronta → protocolo | `CA-PROT-CONS-001`, `CA-PROT-JUDI-001` |
| `ME-POST-001` | Reconhecimento registrado | Decisão/certidão confirmada e checklist pós-reconhecimento criado | Cliente + Desk | Conversão reconhecimento → pós-venda | `CA-POS-AIRE-001` |
| `ME-LEG-001` | Linha do tempo familiar | História/linha do tempo organizada com fontes e marcos | Cliente + Desk | Retenção de assinatura | `CA-ASS-002`, `CA-ASS-003`, `CA-MEM-001` |

---

## 6. Regras de oferta: upgrade, upsell e cross-sell

### Modelo de decisão

```text
Evento de jornada
  → micro-entrega concluída
  → verificar elegibilidade da oferta
  → verificar SKUs já contratados e cobranças ativas
  → verificar bloqueios, consentimento e janela de contato
  → selecionar no máximo uma oferta principal
  → exibir card no app
  → abrir WhatsApp humano somente quando necessário
  → registrar impressão, clique, proposta, pagamento ou recusa
```

### Elegibilidade de uma oferta

Uma oferta pode ser exibida apenas se todos os critérios forem verdadeiros:

- O caso está ativo e não está cancelado/concluído para aquele escopo.
- O SKU sugerido está ativo no catálogo e tem preço vigente.
- Não há `case_product` contratado, em proposta ou em pagamento pendente para o mesmo escopo.
- A micro-entrega correspondente foi concluída ou há bloqueio real que o produto resolve.
- O cliente não recebeu a mesma oferta dentro da janela de supressão configurada.
- Existe link de pagamento válido **ou** fluxo de “falar com especialista” definido.
- O produto não cria promessa legal automática; itens jurídicos exigem validação humana antes de proposta definitiva.

### Regras comerciais sugeridas

| Contexto | Oferta principal | Alternativa | Supressão / trava |
|---|---|---|---|
| Relatório de elegibilidade concluído | Combo de certidões | Pedido unitário | Não mostrar Assessoria Completa sem rota e escopo definidos |
| 2 ou mais documentos críticos pendentes | Combo de Certidões | Documento avulso | Não ofertar combo se pedidos equivalentes já estiverem ativos |
| Certidão validada que exige tradução | Tradução | Pacote de tradução | Não ofertar antes da revisão documental |
| Documento exige apostila | Apostilamento | Orientação/serviço de apoio | Não assumir necessidade universal; depende da rota e do documento |
| Pasta 80% concluída | Revisão jurídica/finalização | Montagem de Pasta | Não oferecer se Assessoria Completa já incluir a entrega |
| Pasta aprovada | Protocolo consular/judicial | Assessoria Completa | Exige revisão humana e contrato paramétrico |
| Reconhecimento concluído | AIRE + Passaporte | Registro de filho/casamento | Não ofertar até haver confirmação formal de reconhecimento |
| Nova descoberta familiar | Pesquisa complementar / Plano Memórias | Plano Legado | Usar abordagem de valor/memória, não urgência artificial |

### Diretriz de precificação incremental

O estudo operacional anterior propõe ofertas incrementais tipicamente entre 10% e 25% do ticket da etapa corrente e combos com desconto aproximado de 10% a 15% frente à soma de itens avulsos. Essa é uma diretriz de teste comercial, não uma tabela definitiva de preços. A fonte de verdade deve ser sempre `product_skus` + `product_prices` sincronizados com a planilha mestre e o Asaas. [file:22]

---

## 7. Touchpoints por superfície

### App Cliente — o que deve existir

| Área | Cards / componentes obrigatórios | Dados de origem |
|---|---|---|
| Home | Seu caso, fase atual, próximo passo, progresso, achados recentes, pagamento confirmado | Caso, milestones, tarefas, micro-entregas, pagamento |
| Jornada | Linha do processo com etapas, marcos previstos/realizados e explicações de dependência externa | Fase, milestones, SLA, previsão |
| Documentos | Checklist por pessoa, upload, status pendente/parcial/ok, motivo de rejeição e ação | Requisitos documentais, documentos, revisões |
| Radar | Resultado de elegibilidade, hipótese de rota, alertas e convite à análise humana | Assessments, flags, ruleset público resumido |
| Descobertas | Pessoas, documentos, fontes, linha do tempo e achados históricos | Árvore, documentos, micro-entregas |
| Conta | Produtos contratados, propostas, parcelas, pagamentos, contrato e links válidos | Case products, invoices/payments, contracts |
| Legado | Árvore contínua, linha do tempo, registros familiares e plano recorrente | Assinaturas, genealogia, pós-reconhecimento |

### Desk Intelligence — cards e filas obrigatórios

| Área | Pergunta que responde | Ação principal |
|---|---|---|
| Casos 360 | Onde está cada caso e qual é o próximo bloqueio? | Priorizar tarefa, cobrar resposta, mover fase |
| Fila documental | Quais documentos bloqueiam o maior número de casos? | Solicitar, pesquisar, revisar ou escalar |
| Fila jurídica | Quais casos têm divergência, retificação ou revisão final pendente? | Atribuir revisor e controlar SLA |
| Painel de micro-entregas | O que foi entregue, visualizado, convertido e recusado? | Ajustar oferta, copy e cadência |
| Funil comercial | Qual origem gera diagnóstico, proposta, pagamento e ticket? | Ajustar aquisição e atendimento |
| Financeiro por SKU | Qual SKU vende, entrega e converte por fase? | Sanear produto, preço, link e margem |
| Reconciliação Asaas | Existem SKUs, nomes, preços ou links fora de sincronia? | Corrigir catálogo/link antes de nova venda |
| Cadências | Quem está sem comunicação, com excesso de lembretes ou aguardando retorno? | Disparar/pausar/escalar contato |

---

## 8. Modelo mínimo de dados

### Entidades fundamentais

| Entidade | Chave | Responsabilidade |
|---|---|---|
| `clients` | `client_id` | Pessoa contratante e relação CRM |
| `citizenship_cases` | `case_id` | Um processo por país, linha e rota |
| `case_phase_history` | `phase_history_id` | Auditoria de avanço/recuo da jornada |
| `persons` | `person_id` | Pessoas da árvore familiar |
| `person_relationships` | `relationship_id` | Relações parentais/familiares |
| `case_lineages` | `lineage_id` | Linha ancestral relevante ao caso |
| `eligibility_assessments` | `assessment_id` | Resultado versionado do radar/avaliação |
| `eligibility_flags` | `flag_id` | Alertas, riscos e impedimentos |
| `case_document_requirements` | `requirement_id` | Checklist de documentos por pessoa/caso |
| `documents` | `document_id` | Evidência, arquivo, origem e validação |
| `case_tasks` | `task_id` | Próxima ação interna ou do cliente |
| `case_milestones` | `milestone_id` | Marco de jornada visível ou interno |
| `micro_deliveries` | `micro_delivery_id` | Unidade de valor entregue e rastreável |
| `touchpoint_events` | `touchpoint_id` | Mensagem, notificação, e-mail, visualização ou contato humano |
| `products` / `product_skus` | `product_id` / `sku_id` | Catálogo e variação vendável |
| `product_prices` | `price_id` | Preço vigente e histórico |
| `case_products` | `case_product_id` | Produto efetivamente vendido/contratado no caso |
| `offers` | `offer_id` | Oferta contextual gerada pelo Planejador |
| `offer_events` | `offer_event_id` | Exibição, clique, proposta, aceite, recusa, pagamento |
| `payment_links` | `payment_link_id` | Link Asaas/checkout vinculado ao SKU e à versão de preço |
| `contracts` | `contract_id` | Contrato parametrizado e assinado |

### Campos essenciais para `micro_deliveries`

```sql
create table micro_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  code text not null,
  title text not null,
  status text not null default 'planned',
  delivered_at timestamptz,
  visible_to_client boolean not null default true,
  source_type text not null,
  source_id uuid,
  related_sku_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);
```

### Campos essenciais para `touchpoint_events`

```sql
create table touchpoint_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid not null,
  case_id uuid,
  channel text not null, -- app, whatsapp, email, phone, meeting, desk
  event_type text not null, -- sent, delivered, read, replied, scheduled, failed
  template_code text,
  related_micro_delivery_id uuid,
  related_offer_id uuid,
  scheduled_for timestamptz,
  occurred_at timestamptz,
  actor_type text not null, -- automation, admin, specialist, client
  actor_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

### Campos essenciais para `offers`

```sql
create table offers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  sku_id uuid not null,
  trigger_code text not null,
  source_micro_delivery_id uuid,
  status text not null default 'eligible',
  display_channel text not null, -- app, whatsapp, email, desk
  price_snapshot jsonb not null,
  payment_link_id uuid,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  suppression_key text,
  created_at timestamptz not null default now()
);
```

---

## 9. Indicadores de gestão

| Indicador | Fórmula operacional | Decisão que suporta |
|---|---|---|
| Conversão Radar → Diagnóstico pago | Diagnósticos pagos / radares concluídos | Qualidade do radar e CTA |
| Conversão Diagnóstico → Proposta | Propostas emitidas / diagnósticos concluídos | Clareza da devolutiva e adequação do produto |
| Conversão Proposta → Pagamento | Pagamentos confirmados / propostas emitidas | Precificação, follow-up e checkout |
| Tempo até primeira micro-entrega | Data primeira micro-entrega − data de pagamento | Qualidade do onboarding e percepção de valor |
| SLA de localização de certidão | Data localizado − data de solicitação | Operação de pesquisa e fornecedores |
| Percentual de checklist completo | Itens aprovados / itens obrigatórios | Saúde de cada caso e previsão de protocolo |
| Taxa de retificação | Casos/documentos com divergência / documentos revisados | Qualidade de origem e complexidade da carteira |
| Conversão de oferta contextual | Pagamentos / ofertas exibidas | Relevância de upsell/cross-sell |
| Receita por micro-entrega | Receita atribuída / micro-entregas concluídas | Onde há valor comercial percebido |
| Receita por SKU e fase | Receita confirmada por SKU/fase | Pareto, margem e saneamento do catálogo |
| Cadência cumprida | Touchpoints realizados no SLA / touchpoints planejados | Qualidade de relacionamento |
| Sobrecarga de comunicação | Clientes com >N contatos em janela / clientes ativos | Proteção contra spam e desgaste |

---

## 10. Regras de governança

1. **Uma única fonte de verdade para produto e preço.** O SKU, nome comercial, preço vigente, status e link devem convergir em um catálogo mestre; não duplicar preço em cards do app, templates de WhatsApp ou contratos.
2. **Um SKU, um escopo claro.** Montagem de Pasta e Assessoria Completa precisam de entregas e limites distintos para evitar concorrência interna.
3. **Oferta contextual não é automação cega.** Produtos jurídicos, retificações, vias de protocolo e situações de risco devem passar por revisão humana antes de cobrança ou promessa.
4. **Micro-entrega não é apenas atualização de status.** Para ser contabilizada, deve produzir valor perceptível: relatório, achado, checklist qualificado, documento validado, plano, marco ou linha do tempo.
5. **SLA deve ser intervalo, não garantia.** A previsão deve registrar premissas, dependências externas e nível de confiança.
6. **Toda mudança de fase deve ser auditável.** Guardar autor, data, regra/gate usado e justificativa para avanço manual.
7. **Toda cadência deve ser reversível.** Conclusão do evento, resposta do cliente, pagamento ou opt-out devem encerrar lembretes relacionados.
8. **O cliente vê progresso; o Desk vê complexidade.** O app deve mostrar linguagem simples e orientada à ação. O Desk deve exibir risco, fonte, tarefas, custo, SLA, score e dependências.

---

## 11. Backlog priorizado

### MVP crítico

- Cadastro de lead, cliente e caso.
- Radar/diagnóstico com resultado, flags e convite à análise humana.
- Jornada em cinco fases no app: Diagnóstico, Pendências, Execução, Complementos e Continuidade.
- Card “Seu caso”, progresso, próximo passo, achados recentes e pagamento confirmado.
- Checklist documental por pessoa, upload e status `Pendente` / `Parcial` / `OK`.
- Catálogo de SKUs críticos: assinatura, diagnóstico, montagem de pasta, assessoria completa, certidão unitária/combo, pesquisa genealógica.
- `case_products` e reconciliação manual SKU ↔ pagamento ↔ link Asaas.
- Micro-entregas e eventos de touchpoint para medir valor e conversão.
- Desk: Casos 360, fila documental, próximo passo, financeiro por SKU e alertas.

### Fase posterior

- Motor de regras completo para todos os países e rotas.
- Integração automatizada Asaas e conciliação de cobrança em tempo real.
- Contrato jurídico totalmente parametrizado com assinatura integrada.
- AIRE, passaporte, registros familiares e combo família.
- Regras avançadas de previsão por fornecedor, cartório, consulado e tribunal.
- Automação multicanal completa com consentimento, templates e testes de cadência.
- Segmentação de assinatura/legado por comportamento e valor de árvore.

---

## 12. Checklist de implantação

### Catálogo e financeiro

- [ ] Saneamento dos ~30 SKUs TOP Pareto antes da expansão do catálogo completo.
- [ ] Definição de escopo, entrega, preço, status e responsável para cada SKU crítico.
- [ ] Uma tabela de preços versionada; preços não devem ser alterados retroativamente em contratos já emitidos.
- [ ] Reconciliação de `SKU ↔ produto ↔ preço ↔ link Asaas ↔ status de cobrança`.
- [ ] Marcar explicitamente links inválidos, pendentes ou duplicados.

### Planejador e app

- [ ] Criar um `citizenship_case` por país/linha/rota, e não por cliente apenas.
- [ ] Registrar micro-entregas de forma estruturada.
- [ ] Mostrar ao cliente somente marcos, documentos e alertas autorizados.
- [ ] Incluir próximo passo único e claro na Home do app.
- [ ] Exibir previsão como faixa, com explicação de dependências externas.

### Desk e governança

- [ ] Definir owner por tarefa, documento, revisão jurídica e fase.
- [ ] Criar SLA para primeira resposta, análise documental, atualização quinzenal e atualização mensal de protocolo.
- [ ] Implantar fila de casos bloqueados e de clientes aguardando ação.
- [ ] Monitorar taxa de oferta contextual, conversão e sobrecarga de touchpoints.
- [ ] Manter log de mudança de fase, mudança de preço, oferta, contrato e decisão de elegibilidade.

---

## 13. Referências recuperadas

- Matriz Operacional Única do Clube Ancestral: SKUs ativos, micro-entregas, upgrades, upsells, status do app/Desk e necessidade de sincronização com links de pagamento. [file:1]
- Estudo interno de micro-entregas, produtos, app cliente, Desk, precificação incremental, gatilhos contextuais e visão operacional. [file:22]
- Materiais internos de cards do Ancestral Canvas: app cliente com Home, Jornada, Documentos e Conta; Desk com Casos 360, checklists e financeiro. [file:36]

---

**Próxima decisão operacional recomendada:** validar esta matriz contra a planilha mestre de produtos e definir, para cada SKU crítico, o preço vigente, o link Asaas canônico, o owner, o SLA e as regras de elegibilidade da oferta. Somente depois deve-se automatizar cards, pagamentos e cadências.