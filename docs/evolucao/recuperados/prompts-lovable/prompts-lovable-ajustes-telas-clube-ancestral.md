# Prompts Lovable — Ajustes das telas do Clube Ancestral

## Como usar

Execute **um prompt por vez** no Lovable. Antes do seguinte, valide os critérios de aceite do atual. Não troque uma trava executável por aviso visual: regras de elegibilidade, autorização, transição de estado e auditoria devem ser aplicadas também no banco/servidor.

## Regras globais obrigatórias

- Todo dado operacional deve ser isolado por `organization_id`, com autenticação, autorização por papel e RLS no banco.
- Perfis internos mínimos: `admin`, `operacoes`, `comercial`, `financeiro`, `pesquisador` e `leitura`.
- Dados de clientes, familiares, documentos, transcrições e contratos são sensíveis. Não criar links públicos de documentos e não registrar conteúdo sensível integral em logs.
- Não permitir exclusão física de clientes, casos, documentos, eventos de conversão, contratos, faturas, pagamentos ou logs. Usar arquivamento com motivo, autor e data.
- Toda mudança relevante deve gerar evento de auditoria com ator, papel, organização, entidade, ID, ação, data/hora, estado anterior, estado novo, origem e justificativa quando aplicável.
- Toda verificação de acesso e de gate precisa ocorrer no servidor/banco; não confiar em botões ocultos ou flags do front-end.
- Dados e casos de demonstração devem ter marcador `is_demo=true`, identificação visual explícita e exclusão padrão das métricas reais.
- Nenhuma tela cria automaticamente cobrança, contrato, assinatura, mensagem, e-mail, WhatsApp, pesquisa externa, solicitação institucional, portal, integração ou onboarding.
- Hipóteses genealógicas, jurídicas, migratórias ou financeiras nunca devem ser apresentadas como confirmação automática.

---

# Prompt 01 — Tela Conversão

## Objetivo

Ajustar a tela **Conversão** para funcionar como leitura interna do funil comercial baseado em eventos imutáveis, distinguindo claramente aceite verbal, confirmação formal, contrato, pagamento e onboarding. A tela não deve disparar cobrança, comunicação ou automação.

## Implementar

Crie ou ajuste o modelo de eventos de conversão com:

- `lead_criado`
- `lead_qualificado`
- `discovery_agendada`
- `discovery_realizada`
- `proposta_enviada`
- `aceite_verbal_confirmado`
- `confirmacao_formal_recebida`
- `contrato_enviado`
- `contrato_assinado`
- `pagamento_inicial_confirmado`
- `onboarding_iniciado`
- `caso_ativo`
- `perdido`

Cada evento deve registrar `case_id` ou `lead_id`, `organization_id`, `occurred_at`, `recorded_at`, `recorded_by`, origem/evidência, observação e `is_demo`.

A interface deve ter quatro blocos:

1. Estado atual por lead: escada de etapas, próxima ação, responsável e bloqueios.
2. Funil de eventos: contagens e taxas calculadas apenas quando denominador for maior que zero.
3. Saúde comercial: leads sem próxima ação, follow-ups vencidos, propostas sem resposta e aceite verbal sem confirmação formal.
4. Referência operacional recolhível: regra de aceite e onboarding padrão.

## Regra de aceite em quatro momentos

1. **Aceite verbal**: somente registra o evento; solicitar confirmação escrita; não cria cliente ativo, contrato, cobrança ou onboarding.
2. **Confirmação formal**: aceita print, WhatsApp, e-mail ou aceite registrado com referência interna; libera apenas preparação de ficha, escopo e prévia contratual.
3. **Contrato e cobrança**: contrato específico e Ordem de Serviço com dados e escopo reconciliados; cobrança somente após contrato e condições aprovados, por decisão humana.
4. **Onboarding**: somente após contrato assinado e pagamento inicial confirmado; libera núcleo familiar, dossiê-mãe, checklist, plano de ação e primeira micro-entrega.

## Regras executáveis

- `aceite_verbal_confirmado` não pode criar cliente ativo, contrato, fatura, pagamento, acesso de portal ou onboarding.
- `confirmacao_formal_recebida` permite apenas preparar formalização; não permite emitir contrato, cobrança ou acesso ao portal automaticamente.
- `contrato_assinado` exige versão do contrato, data, referência/origem externa de assinatura, partes qualificadas e aprovação humana.
- `pagamento_inicial_confirmado` exige valor, data e referência transacional confirmados pela fonte financeira.
- `onboarding_iniciado` só pode ocorrer se houver contrato assinado e pagamento inicial confirmado.
- Métricas devem excluir demos por padrão, com filtro explícito para incluí-las.
- A saúde comercial deve apontar João ou equivalente em “aceite verbal sem confirmação formal” sempre que esse estado existir; não permitir que o indicador mostre zero se houver evento pendente.
- Não mostrar “Lead criado = 0” para leads que possuem eventos posteriores sem sinalizar inconsistência. Exibir alerta de integridade: “evento inicial ausente ou fora do filtro”.

## Critérios de aceite

- Um lead com aceite verbal não aparece como cliente ativo.
- Uma confirmação formal não libera cobrança.
- Um caso não inicia onboarding sem contrato assinado e pagamento inicial confirmado.
- Taxas sem denominador exibem “—”, não zero artificial.
- Um aceite verbal pendente de formalização aparece na saúde comercial.
- Nenhuma ação externa é disparada pela tela.

---

# Prompt 02 — Tela Clientes

## Objetivo

Corrigir a tela **Clientes** para diferenciar contratante/cliente ativo, pré-cliente, participante familiar e dado demonstrativo. A lista principal não pode tratar automaticamente participantes ou casos em formalização como clientes ativos.

## Implementar

Ajuste o modelo de pessoa e relacionamento:

- `person`: dados de pessoa, com classificação e dados mínimos.
- `client_profile`: perfil de cliente vinculado à pessoa somente quando houver ativação elegível.
- `case_member`: participante vinculado ao núcleo/caso, com papel como contratante, titular, dependente, representante legal ou beneficiário.
- `family_nucleus`: núcleo familiar e seus participantes.

Na lista principal de Clientes, exibir somente perfis elegíveis, com filtros:

- Ativos
- Suspensos
- Encerrados
- Arquivados
- Incluir pré-clientes
- Incluir demonstrações

Os filtros “Incluir pré-clientes” e “Incluir demonstrações” devem ficar desligados por padrão.

## Regras executáveis

- Um perfil entra em **Cliente ativo** somente após contrato assinado, pagamento inicial confirmado e decisão humana de ativação registrada.
- Pessoas em aceite verbal, confirmação formal ou formalização ficam como lead/oportunidade/caso em formalização, não como cliente ativo.
- Participantes como Alice e Adair devem ficar no núcleo familiar e dossiê, não como clientes independentes, salvo contratação individual documentada.
- “Pré-onboarding” pode existir como estado do caso, mas não deve promover a pessoa à lista principal de clientes ativos.
- Arquivamento deve exigir motivo e preservar histórico; não implementar exclusão física.
- Padronizar país com valor controlado, por exemplo `Áustria`, sem duplicidade por grafia como `Austria`.
- “Origem” e “status comercial” são campos distintos. Não usar `proposta_aprovada` como origem.
- Registros demo devem ser rotulados visualmente e excluídos das métricas e listas reais por padrão.

## Critérios de aceite

- Ana em formalização não aparece como cliente ativo.
- Alice e Adair aparecem como participantes do núcleo, não clientes independentes, salvo exceção registrada.
- Dados demo ficam ocultos por padrão.
- País e origem usam valores padronizados.
- Arquivar exige motivo e gera auditoria.

---

# Prompt 03 — Tela Acessos ao portal

## Objetivo

Ajustar a tela **Acessos ao portal** para permitir somente convites por link mágico a e-mails previamente autorizados e apenas para casos elegíveis. Separar claramente “Portal de proposta” de “Espaço do cliente”.

## Implementar

Criar entidades ou campos para:

- `authorized_portal_email`: pessoa, caso, e-mail, finalidade, status, validado_por, validado_em.
- `portal_access`: pessoa, caso, nível de acesso, status, convite, criado_por, enviado_em, suspenso_em, revogado_em, motivo.
- `portal_access_audit`: convite criado, link enviado, acesso utilizado, reenvio, suspensão, revogação, tentativa bloqueada e expiração.

Níveis de acesso:

- `portal_proposta`: conteúdo de proposta explicitamente autorizado, sem conteúdo de operação.
- `espaco_cliente`: acesso ao ambiente do cliente elegível.

## Regras executáveis

- Não usar senha e não permitir autocadastro.
- Link mágico deve ser de uso único ou controlado, com expiração, associado ao e-mail autorizado e ao caso autorizado.
- Para `espaco_cliente`, exigir: contrato assinado, pagamento inicial confirmado, documentos mínimos definidos, decisão humana de ativação e caso ativo ou onboarding elegível.
- Para `portal_proposta`, exigir proposta/escopo explicitamente autorizado e e-mail aprovado; não liberar dossiê, pesquisa, documentos internos, tarefas, auditoria, dados financeiros internos ou hipóteses.
- O seletor deve mostrar somente pessoas/casos elegíveis para o nível escolhido. Itens bloqueados podem aparecer desabilitados com motivo explícito, como “Bloqueado: contrato não assinado”.
- Participantes familiares não recebem acesso individual apenas por pertencerem ao núcleo; exigir autorização e finalidade registrada.
- Reenviar, suspender, revogar e bloquear acesso no app devem exigir permissão e gerar auditoria.
- Dados demo devem ficar em ambiente/tenant de demonstração ou marcados como demo, sem contaminar métricas reais.

## Critérios de aceite

- Ana e João não podem receber Espaço do cliente enquanto estiverem sem contrato/pagamento elegível.
- Um participante familiar sem autorização não recebe convite.
- Cliente só acessa casos expressamente associados ao seu acesso.
- Reenvio, suspensão e revogação ficam auditáveis.
- Link expirado ou usado indevidamente não libera acesso.

---

# Prompt 04 — Tela Atendimento ao cliente

## Objetivo

Ajustar a tela **Atendimento ao cliente** para controlar solicitações documentais, recebimento e revisão de uploads, publicação de entregas, faturas visíveis e tickets. Nada deve ser disponibilizado ao cliente por padrão.

## Implementar

Organize a tela em blocos:

1. Solicitar documento ao cliente.
2. Envios do cliente pendentes de revisão.
3. Entregas ao cliente.
4. Faturas visíveis ao cliente.
5. Atendimentos/tickets.

Cada ação deve indicar caso, status de elegibilidade, responsável, prazo quando aplicável e motivo de bloqueio.

## Regras executáveis

- Somente casos com portal elegível podem receber solicitação documental, entrega, fatura visível ou interação no portal.
- Casos em diagnóstico, aceite verbal, confirmação formal ou formalização devem aparecer bloqueados para ações client-facing, com motivo.
- Todo upload do cliente começa em `pendente_de_revisao`; “Aceitar” significa validar o recebimento/adequação interna, não publicar nem liberar amplamente o arquivo.
- “Pedir reenvio” exige justificativa objetiva, exibindo ao cliente apenas a orientação necessária.
- Solicitações devem registrar finalidade, documento/categoria solicitada, participante correto, prazo e responsável.
- Liberação de entrega requer perfil `admin` ou `operacoes`, classificação como `externa_aprovada`, versão, caso, responsável e registro de auditoria.
- Recolhimento de entrega exige justificativa e preserva histórico e versão substituta quando houver.
- Faturas só podem ser liberadas por `admin` ou `financeiro`, após validação do vínculo com caso e acesso autorizado.
- Tickets do cliente podem gerar alerta interno, mas não devem disparar e-mail, WhatsApp ou automação externa.
- Registrar em auditoria visualização, download, upload, aceite, rejeição, reenvio, liberação, recolhimento, bloqueio e alteração de visibilidade. Não colocar RG, número de documento, tokens, links mágicos ou conteúdo integral de arquivos nos logs.

## Critérios de aceite

- Caso sem elegibilidade não permite liberar portal, pedir documento ou publicar entrega.
- Upload do cliente não se torna disponível para toda a equipe sem revisão e permissão.
- Apenas perfis autorizados liberam entregas e faturas.
- Recolhimento preserva o registro histórico.
- Tickets não enviam mensagem externa automaticamente.

---

# Prompt 05 — Tela Casos

## Objetivo

Ajustar a lista **Casos** para separar hipótese de elegibilidade, ciclo comercial, formalização, financeiro e operação. Ação de ativação deve ser uma verificação de gates, não um atalho para ativar.

## Implementar

Exibir em colunas ou badges independentes:

- Código canônico.
- Título.
- Papel do registro: operacional, referência, demo.
- Tipo de serviço.
- Fase comercial.
- Fase de formalização.
- Situação financeira.
- Situação operacional.
- Prioridade.
- Hipótese de elegibilidade.
- Próxima ação com responsável e prazo.
- Estado de ativação.

Substituir o rótulo/botão “Pronto para ativar?” por **“Ver requisitos de ativação”**.

## Regras executáveis

- Hipótese deve usar estados controlados como `não avaliada`, `possível`, `em validação documental`, `documentalmente confirmada`, `inconclusiva`; hipótese nunca equivale a elegibilidade definitiva.
- “Rascunho” e “Aguardando documentos” não podem ser o único status geral, pois não descrevem comercial, contrato, financeiro e operação ao mesmo tempo.
- Casos demo devem ser visualmente isolados e excluídos por padrão de relatórios e métricas reais.
- A próxima ação deve possuir título, responsável, prazo, dependência e critério de conclusão.
- O painel de ativação deve mostrar requisitos em modo somente leitura enquanto existir pendência.
- Ativação só fica disponível quando todos os gates obrigatórios estiverem validados pelo servidor/banco.
- Datas futuras de contrato, pagamento ou onboarding devem ser qualificadas como “previsão condicional”; nunca tratadas como fato realizado.

## Checklist de ativação

- Contrato assinado.
- Pagamento inicial confirmado na fonte transacional.
- Responsável interno definido.
- Núcleo familiar e participantes conferidos.
- Dossiê-mãe criado.
- Ambiente e nível de acesso definidos.
- Checklist documental e plano de ação preparados.
- Aprovação interna de ativação registrada.

## Critérios de aceite

- Casos com qualquer gate pendente exibem “Não elegível — ativação bloqueada”.
- Não há botão de ativação enquanto o checklist não estiver completo.
- Datas previstas são visivelmente condicionais.
- Casos demo não alteram indicadores reais.

---

# Prompt 06 — Ficha operacional canônica

## Objetivo

Ajustar a ficha operacional canônica do caso para consolidar ciclo comercial, formalização, gates, jornada, alertas, auditoria e integrações bloqueadas, mantendo núcleo familiar e dossiê-mãe em módulo próprio.

## Implementar

Na ficha do caso, apresentar:

- Cabeçalho: código canônico, título, classificação, status derivado e aviso de bloqueio.
- Referências: núcleo familiar e dossiê-mãe, em links de leitura contextual.
- Eixo comercial: proposta, aceite verbal, confirmação formal.
- Formalização e operação: preparação, contrato, financeiro, ativação e onboarding.
- Painel “Gates de ativação”, com progresso por categoria.
- Linha do tempo de eventos imutáveis: passado registrado e próximos marcos condicionais.
- Próxima ação operacional estruturada.
- Blueprint e fila de provisionamento em modo informativo, sem execução automática.
- Mapa de persistência e rejeição de campos fora do contrato de dados.

## Regras executáveis

- Confirmação formal recebida libera somente preparação de formalização e não cria cliente ativo, cobrança, portal ou onboarding.
- Status derivado “Pré-onboarding bloqueado” deve explicar a causa exata: por exemplo, “contrato ainda não assinado” e “pagamento inicial ainda não confirmado”.
- Organizar bloqueios em gates: Identidade e participantes; Oferta e escopo; Contrato e assinatura; Financeiro; Ativação e consentimento.
- Cada gate deve informar item, status, responsável, evidência exigida, origem permitida, data da revisão e resultado.
- A ação “Resolver” abre a coleta/revisão da evidência; não conclui automaticamente o requisito.
- Alterações em escopo, preço, signatários, contrato, pagamento, ativação, visibilidade e acesso devem registrar antes/depois, ator, origem e justificativa.
- Fila de Drive, integrações e provisionamento permanecem bloqueados até os gates aplicáveis. Não criar pastas, mover arquivos, enviar links ou disponibilizar acesso por efeito de confirmação formal isolada.
- Sugestões de jornada devem ser não executáveis e classificadas como recomendação interna.
- Coletar somente dados mínimos necessários enquanto o caso estiver em formalização; onboarding e coleta documental operacional ampla ficam bloqueados até ativação.

## Critérios de aceite

- O caso mostra claramente confirmação formal, formalização em preparação e pré-onboarding bloqueado.
- Não é possível avançar para onboarding sem contrato e pagamento.
- O usuário vê quais gates faltam, quem é responsável e que evidência resolve cada um.
- Marcas futuras são condicionais e não geram ação externa.
- Núcleo e dossiê mantêm seus próprios limites de responsabilidade.

---

# Prompt 07 — Piloto real Ana Luiza: conferência e gates

## Objetivo

Ajustar a tela restrita do piloto real de Ana Luiza para funcionar como um painel de conferência humana, bloqueios críticos e sequência controlada de go-live. Não preencher lacunas por inferência e não executar atos externos por essa tela.

## Contexto vinculante

- Caso: `CA-CID-AT-FAM-2026-001`.
- Aceite formal registrado em 14/08/2026.
- Preparação: `GO_CONDICIONAL` apenas para trabalho interno.
- Ativação operacional: `NO_GO` enquanto houver bloqueio crítico aberto.
- Portal: bloqueado.
- O valor comercial, SKU, escopo, parcelamento e vencimento devem ser reconciliados com fonte homologada e revisados por humano.
- O modelo aplicável é `MODELO ESTUDO`, com base contratual genérica v2 e anexos aplicáveis; versões não aplicáveis devem ser recusadas.

## Implementar

Agrupe os campos de conferência em:

1. Comercial.
2. Contrato.
3. Documentos e consentimento.
4. Família e genealogia.
5. Identificação.

Para cada campo, exibir:

- Estado: sem dado, capturado, em revisão, verificado, recusado, não aplicável.
- Origem: proposta aprovada, WhatsApp confirmado, reunião/transcrição não verificada, documento, formulário ou preenchimento humano.
- Evidência/referência.
- Responsável pela revisão.
- Data/hora de captura e verificação.
- Ação “Salvar com origem” e, quando permitido, “Marcar como verificado”.

Reorganizar bloqueios críticos por gate:

- Gate A: governança e identidade canônica.
- Gate B: cadastro, consentimento e núcleo familiar.
- Gate C: proposta, SKU, preço, escopo, parcelamento e vencimento.
- Gate D: jurídico, partes, anexos e assinatura.
- Gate E: contrato específico e Ordem de Serviço.
- Gate F: financeiro.
- Gate G: pesquisa externa, despesas e diligências.
- Gate H: operação, portal e conteúdo client-facing.

## Regras executáveis

- WhatsApp, transcrição, reunião e relato são fontes brutas: podem subsidiar captura, mas não validam parentesco, elegibilidade, rota jurídica, valor final ou condição contratual por si só.
- “Salvar com origem” não muda automaticamente o estado para verificado.
- Não preencher automaticamente os campos obrigatórios pendentes.
- Não gerar terceiro ID canônico. A decisão entre IDs existentes deve ser humana; o ID não escolhido vira alias/histórico.
- Não criar contrato definitivo, cobrança no Asaas, assinatura, portal, pesquisa externa, solicitação institucional, entrega, mensagem ou integração por esta tela.
- Pesquisa externa continua bloqueada até contrato assinado, condição financeira aplicável confirmada, autorizações aplicáveis e qualidade mínima de dados.
- Portal deve expor somente views seguras: cadastro permitido, uploads próprios, documentos/entregas liberados e mensagens client-facing. Nunca expor contrato interno, transcrições, anotações, hipóteses, fontes, riscos, tarefas, auditoria, pagamentos ou decisões internas.
- A representação legal de menor deve ser verificada e documentada antes de constar em instrumento, acesso ou autorização aplicável.
- Cobrança só pode ser autorizada manualmente após reconciliação comercial, contrato assinado e condição financeira aprovada.

## Sequência obrigatória

1. Resolver identidade canônica e estrutura familiar mínima.
2. Completar e verificar cadastro, consentimento e dados oficiais necessários.
3. Conferir proposta-mestre e reconciliar SKU, preço, escopo, parcelamento, vencimento e composição familiar.
4. Definir partes, representação, anexos, revisão jurídica e método de assinatura.
5. Preparar contrato específico e OS para revisão interna.
6. Coletar/registrar assinatura externa com data, referência, origem e partes qualificadas.
7. Autorizar cobrança humana, criar apenas após confirmação específica e confirmar pagamento inicial na fonte transacional.
8. Registrar aprovação interna de ativação.
9. Somente então iniciar onboarding, ambiente, checklist, plano de ação, boas-vindas e primeira micro-entrega até D7.

## Critérios de aceite

- Qualquer bloqueio crítico aberto mantém ativação em `NO_GO`.
- Campos sem fonte ou sem revisão não são tratados como confirmados.
- Não existe botão que inicie cobrança, portal, pesquisa ou onboarding enquanto gates estiverem pendentes.
- O painel mostra o primeiro gate não atendido e as evidências exigidas.
- Todo avanço relevante é auditável.

---

# Registro consolidado dos ajustes

## Prioridade P0 — Bloqueios de segurança e ciclo de vida

- Implementar gates no servidor/banco, não somente na interface.
- Não promover aceite verbal, confirmação formal ou pré-onboarding a cliente ativo.
- Não liberar cobrança antes de contrato e condições aprovadas por humano.
- Não iniciar onboarding antes de contrato assinado e pagamento inicial confirmado.
- Não liberar portal antes da elegibilidade mínima e autorização de e-mail/pessoa.
- Excluir demos de métricas e visões reais por padrão.

## Prioridade P1 — Integridade do funil e das listas

- Tratar conversão como sequência de eventos imutáveis.
- Corrigir inconsistência entre aceites verbais pendentes e indicador de saúde comercial.
- Sinalizar eventos iniciais ausentes quando houver evento posterior sem histórico completo.
- Separar pessoa, cliente ativo, lead, caso, participante familiar e núcleo.
- Padronizar país, origem, fase e status em campos controlados.

## Prioridade P2 — Atendimento e conteúdo client-facing

- Bloquear solicitações, entregas, faturas e tickets do portal em casos não elegíveis.
- Revisar uploads antes de uso ou publicação.
- Liberar/recolher entregas com versão e auditoria.
- Restringir faturas visíveis a ação de Admin/Financeiro.
- Evitar notificações ou comunicação externa automática.

## Prioridade P3 — Ficha canônica e piloto real

- Tornar status derivados explicáveis por gates pendentes.
- Transformar “Pronto para ativar?” em verificação de requisitos.
- Marcar datas futuras como previsões condicionais.
- Estruturar bloqueios por dependência e gate.
- Tratar fontes brutas como captura, não como validação.
- Manter o piloto em `NO_GO` enquanto houver pendências críticas.

## Auditoria mínima obrigatória

Registrar criação, alteração, arquivo, mudança de status, validação, exceção, bloqueio, desbloqueio, acesso ao portal, convite, uso de link, upload, download, pedido de reenvio, publicação, recolhimento, fatura liberada, mudança de contrato, pagamento e ativação.

Logs não devem reter tokens, links mágicos, números de documentos, conteúdo integral de anexos ou informações pessoais desnecessárias.
