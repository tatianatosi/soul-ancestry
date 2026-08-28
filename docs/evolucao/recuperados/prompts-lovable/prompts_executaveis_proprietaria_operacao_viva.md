# Prompts Executáveis — Proprietária, Operação Viva e Exceções Auditáveis

## Como usar

Execute os prompts abaixo na ordem indicada. Cada prompt é independente, mas os resultados dos anteriores devem ser tratados como evidência para os próximos.

**Regra de autoridade da Proprietária:** a Proprietária autenticada pode validar e autorizar exceções a gates operacionais e comerciais, inclusive início antes de pagamento, materialização contratual e progressão interna de caso. A exceção deve ser explícita, limitada em escopo, justificada, com prazo de revisão e auditada. Ela **não apaga** dados, não reescreve a condição original e não transforma pendências em cumpridas.

**Limites permanentes, mesmo com override:** não permitir burlar autenticação, RLS, isolamento entre clientes/organizações, auditoria imutável, proteção de dados de terceiros, sanitização de conteúdo do portal ou envio externo sem confirmação específica de envio.

---

# PROMPT 01 — Matriz de Prontidão da Operação Viva

> Faça uma auditoria somente leitura para separar o que está operacional no dia a dia, o que está apenas implementado localmente, o que está configurado sem prova e o que está bloqueado.
>
> Leia as fontes canônicas, rotas, módulos, testes, documentos de governança e integrações disponíveis. Não trate código, template, arquivo, configuração ou HTTP 200 como prova de operação real sem evidência direta.
>
> Produza uma matriz com: capacidade, dono operacional, fonte de verdade, ID canônico, rota/sistema, evidência existente, ambiente de prova, lacuna, risco, ação mínima, critério de pronto e estado final.
>
> Estados permitidos: `OPERACIONAL_COMPROVADA`, `OPERACIONAL_COM_RESSALVAS`, `IMPLEMENTADO_LOCAL`, `CONFIGURADO_PENDENTE_DE_TESTE`, `DOCUMENTADO_SEM_IMPLEMENTACAO`, `PENDENTE_DE_VALIDACAO_HUMANA`, `BLOQUEADO_POR_GATILHO`, `NAO_LOCALIZADO_NESTA_SESSAO`.
>
> Priorize: Case_ID, CRM/oportunidade, tarefas, cronograma, catálogo/SKU, preço, links Asaas, pagamentos, contratos, anexos I–V, portal cliente, sessão autenticada e integrações.
>
> Entregue também um backlog P0/P1/P2 e liste decisões humanas necessárias. Não altere código, dados, RLS, integrações, credenciais, links, cobranças, contratos ou deploy.

---

# PROMPT 02 — Autoridade de Override da Proprietária

> Implemente uma política canônica de `override_proprietaria` para exceções operacionais e comerciais.
>
> A Proprietária autenticada pode validar e superar gates para permitir, de forma explícita e limitada:
>
> - Início interno antes de pagamento confirmado.
> - Materialização de contrato, Ordem de Serviço e anexos I–V como rascunho interno.
> - Preparação de onboarding interno.
> - Progressão de caso até o limite autorizado.
> - Aprovação excepcional de tarefa, etapa ou microentrega interna.
>
> A exceção não pode: marcar pagamento como recebido; alterar preço, escopo ou assinatura; apagar gates; converter pendência em cumprida; burlar RLS/autenticação; acessar dados de terceiro; publicar conteúdo ao cliente; enviar comunicação; criar cobrança; assinar ou executar pesquisa externa.
>
> Exigir para todo override: `case_id`, objeto afetado, condição original, gates pendentes, escopo liberado, justificativa obrigatória, identidade/papel da Proprietária, data/hora, data de revisão/expiração, estado anterior, estado posterior e auditoria append-only.
>
> Criar estados explícitos: `BLOQUEADO`, `LIBERADO_POR_OVERRIDE_PROPRIETARIA`, `EXPIRADO_AGUARDA_REVISAO`, `REVOGADO`.
>
> O UI deve mostrar a regra original, a exceção, seu alcance e os limites ainda bloqueados. A implementação deve ser coberta por testes: autorização da Proprietária, recusa a outros papéis, justificativa obrigatória, preservação do gate original, expiração/revisão e ausência de qualquer ação externa.
>
> Não executar alteração em dados reais, migration, RLS ou deploy. Entregue arquivos alterados, testes, typecheck e build.

---

# PROMPT 03 — Ana Luiza: Início Antes de Pagamento

> Configure, em modo interno e auditável, a decisão de Proprietária para o caso `CA-CID-AT-FAM-2026-001` de Ana Luiza Gomes Silveira Rodrigues.
>
> Contexto conhecido: aceite formal registrado; proposta familiar de R$ 9.600,00 em 10 parcelas mensais de R$ 960,00; primeira cobrança prevista para 01/10/2026. O fato de a cobrança estar prevista não é prova de pagamento recebido.
>
> Implementar a capacidade de registrar a decisão `INICIAR_ANTES_DO_PAGAMENTO`, mas não efetivá-la sobre dados reais sem confirmação posterior da Proprietária.
>
> A tela/fluxo deve apresentar:
>
> - Condição original: início condicionado ao pagamento.
> - Status financeiro atual, sem inferência de quitação.
> - Gates pendentes e efeitos de liberar o início.
> - Escopo selecionável: preparação contratual, coleta de dados, onboarding interno, planejamento ou outro escopo interno permitido.
> - Justificativa obrigatória, prazo de revisão e possibilidade de revogação.
> - Limites que continuam bloqueados: cobrança, assinatura, publicação para cliente, pesquisa externa e comunicação externa.
>
> A Proprietária deve poder validar e superar o bloqueio de início, mas a exceção não pode adulterar os registros financeiros ou fechar gates automaticamente.
>
> Adicionar testes para: condição original preservada; inexistência de pagamento inferido; só Proprietária pode registrar override; escopo limitado; revogação; expiração; auditoria; nenhuma ação externa.
>
> Não criar cobrança, pagamento, contrato, assinatura, mensagem, evento de calendário, pesquisa externa, migration, RLS ou deploy.

---

# PROMPT 04 — Materialização Contratual com Exceção Auditável

> Implementar o fluxo de materialização contratual interna para Contrato de Serviços de Pesquisa Genealógica, Ordem de Serviço (Anexo I) e Anexos II–V.
>
> A Proprietária autenticada pode validar e superar bloqueios para gerar rascunhos internos mesmo quando faltarem gates de formalização, financeiro ou dados, desde que registre uma exceção auditável.
>
> Para cada documento, exigir:
>
> - Caso e contratante resolvidos.
> - Versão do modelo e origem canônica.
> - Campos preenchidos, ausentes e conflitantes.
> - Gates pendentes.
> - Escopo da exceção e justificativa da Proprietária.
> - Estado do artefato: `RASCUNHO_INTERNO`, `AGUARDA_REVISAO`, `PRONTO_PARA_CONFIRMACAO`, `BLOQUEADO`.
>
> O sistema deve gerar apenas projeção/rascunho interno; não enviar ao cliente, não coletar assinatura, não publicar, não criar cobrança, não ativar caso e não iniciar diligência externa.
>
> Se houver dados ausentes, usar marcador explícito `PENDENTE_DE_DADO`; nunca inventar informação pessoal, preço, escopo, data ou assinatura.
>
> Criar uma visão de auditoria para mostrar modelo, versão, campos de origem, exceção aplicada e limitações restantes.
>
> Cobrir com testes: geração de rascunho, bloqueio para envio/assinatura/cobrança, override só da Proprietária, campos ausentes explícitos, rastreabilidade e ausência de efeitos externos.
>
> Não materializar documentos reais sem confirmação específica posterior. Não alterar dados, migrations, RLS, integrações ou deploy.

---

# PROMPT 05 — Painel Hoje: Próximas Ações e Lembretes Internos

> Implementar uma fila derivada de acompanhamento no Painel Hoje para que a operação não dependa de memória manual.
>
> A fila deve gerar, em modo somente leitura, próximos passos a partir de proposta pronta, confirmação formal pendente, reunião não agendada, follow-up vencido, vencimento financeiro, último elo pendente, cadência e override próximo da expiração.
>
> Cada item deve ter: chave canônica de deduplicação, pessoa/caso, motivo, estado, responsável, prazo, prioridade derivada, rota de destino, evidência de origem e recomendação de próxima ação.
>
> Aplicar precedência para não duplicar um mesmo objeto em diversas filas. A lista deve explicar por que o item apareceu e qual dado o sustenta.
>
> Registrar especificamente como exemplos de fixtures de teste, não como escrita real:
>
> - Ana Luiza: decisão pendente sobre início antes de pagamento.
> - João: confirmação formal pendente e preparação de rascunho “confirme”.
> - Lara: proposta pronta e reunião de apresentação ainda não agendada.
>
> Não criar tarefa persistida, evento no calendário, contato, cobrança, envio de mensagem ou mudança de etapa. A fila apenas sugere e direciona.
>
> Implementar estados de carregamento, erro e dado indisponível; em falha, nunca concluir que uma pendência está resolvida.
>
> Adicionar testes de deduplicação, precedência, escopo, ausência de escrita, vínculo com o último elo pendente e apresentação de responsável/prazo.

---

# PROMPT 06 — Agenda Assistida, sem Criação Automática

> Implementar uma camada de agenda assistida para reuniões, follow-ups, revisões de override, vencimentos e prazos de caso.
>
> O sistema deve apenas produzir uma sugestão interna com título, objetivo, participantes propostos, janela de data, duração, contexto, rota do objeto, dependências e texto de pauta. Não criar evento no Google Calendar automaticamente.
>
> A Proprietária pode validar e superar a ausência de alguns dados de agenda para salvar uma sugestão interna, mas não pode criar evento externo sem confirmação específica do alvo, participantes, data/hora e conteúdo.
>
> Para cada sugestão, indicar: `RASCUNHO_INTERNO`, `AGUARDA_CONFIRMACAO_PROPRIETARIA`, `PRONTO_PARA_CRIAR_EVENTO`, `CANCELADO`.
>
> Criar integrações apenas no nível de leitura/documentação nesta etapa. Se houver conector de calendário, não invocá-lo para criar ou alterar eventos.
>
> Testar que não há chamada de criação de evento e que o texto de pauta não contém dados internos indevidos quando o destino for cliente.

---

# PROMPT 07 — Rascunhos Governados de Comunicação

> Implementar rascunhos internos governados para comunicação comercial e operacional, com versionamento de template, etapa, evento, canal previsto, destinatário ainda não enviado, dados de origem e revisão de terminologia cliente.
>
> Os rascunhos devem permanecer em `rascunho_interno` e jamais disparar WhatsApp, e-mail, SMS ou notificação externa.
>
> Preparar dois modelos de uso interno:
>
> 1. João — mensagem curta de confirmação formal (“confirme”), alinhada ao fluxo: aceite verbal com evidência → confirmação escrita → contrato/cobrança/ativação somente após a confirmação. João é contratante individual; a esposa pode acompanhar, mas não deve ser incluída como parte contratual sem decisão explícita.
> 2. Lara — follow-up leve para convidar ao agendamento da reunião de apresentação da proposta, sem pressão, promessa de resultado, preço não confirmado ou inferência de aceite.
>
> Exigir validação de dados e bloqueios antes da sugestão: destinatário, contexto do caso, fase, versão de template e conteúdo sanitizado.
>
> Criar testes para: escolha da versão vigente; rascunho quando template expirou; dados ausentes; revisão de terminologia; ausência de handler de envio; ausência de chamada externa; auditabilidade da origem do texto.
>
> Não enviar mensagens nem criar contatos, interações, campanhas ou filas externas.

---

# PROMPT 08 — Validação Autenticada em Produção

> Preparar e executar somente quando uma sessão de homologação autorizada estiver disponível um roteiro E2E read-only no domínio publicado.
>
> Cobrir:
>
> - Login de Proprietária e de cliente de homologação.
> - Rotas do Desk, menu da conta, permissões administrativas e navegação mobile.
> - Painel Hoje, fila de próximos passos e ausência de escrita automática.
> - Caso com override de teste, sem afetar dado real.
> - Portal: apenas caso autorizado; bloqueio de URL direta de caso alheio; conteúdo sanitizado; estado vazio seguro; reload de sessão.
> - Ausência de SKU, preço, gate, SLA, hipótese, evidência bruta e dados internos no App Cliente.
>
> Registrar evidência por caso de teste: pré-condição, ambiente, identidade de teste, passos, resultado, screenshot ou log, e aprovação/reprovação.
>
> Não executar criação, alteração, comunicação, pagamento, assinatura, publicação ou deploy. Se a sessão não estiver disponível, reportar `NAO_COMPROVADO_NO_DOMINIO_PUBLICADO`, sem substituir por hipótese local.

---

# PROMPT 09 — Validação de Catálogo, Links e Reconciliação Asaas

> Executar auditoria somente leitura da cadeia SKU → Planilha Mestre → proposta → link Asaas → cobrança → pagamento → reconciliação.
>
> Classificar cada SKU em: ativo conciliado, ativo sem link, link sem SKU, múltiplos links, preço divergente, condição divergente, pendente, arquivado, histórico ou bloqueado.
>
> Para cada divergência, indicar fonte de verdade, impacto, dono e decisão humana necessária. Preço, escopo e condição devem vir da Planilha Mestre; Asaas é fonte transacional e não define elegibilidade.
>
> Verificar se produtos pendentes/arquivados — incluindo `CA-CURSO-001` enquanto não houver decisão de reativação — não são tratados como oferta ativa.
>
> Produzir plano de reconciliação com chave proposta, sem criar, editar, desativar ou publicar produtos, links, cobranças ou assinaturas.
>
> A Proprietária pode aprovar posteriormente uma decisão de conciliação, mas este prompt não executa a decisão; deve apenas preparar a evidência e a lista de alterações exatas para aprovação separada.

---

# PROMPT 10 — Fechamento e Critério de Go-Live Operacional

> Consolidar os resultados dos prompts anteriores em um relatório de prontidão operacional.
>
> Não declarar go-live por ter código, testes, templates ou configuração. Só marcar uma capacidade como `OPERACIONAL_COMPROVADA` quando houver fonte de verdade, dono, identificador reconciliado, fluxo demonstrado, auditoria, tratamento de falha e prova autenticada publicada quando aplicável.
>
> Produzir:
>
> - Capacidade e estado final.
> - Evidência e data.
> - Lacuna residual.
> - Decisão de Proprietária pendente.
> - Risco aceito ou não aceito.
> - Próxima ação mínima.
>
> A Proprietária pode validar e aceitar risco operacional explicitamente, com registro de escopo, justificativa, duração e revisão. Essa aceitação não pode reduzir segurança, ocultar pendências ou autorizar ações externas automaticamente.
>
> Não realizar deploy, comunicação, cobrança, assinatura, publicação ou integração sem nova confirmação específica.
