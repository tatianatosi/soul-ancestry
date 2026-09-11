> **Arquivo da proprietária (Tatiana, 2026-09-10).** Superfície operacional para agentes: `AGENTS.md` e `.cursor/rules/clube-ancestral.mdc`. Verificação contra o código: `docs/relatorios/2026-09-10_memoria-permanente-verificacao.md`. Adendo de continuidade e prova autenticada: `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`. Adendo auditoria 47 + Canvas + comparativo (2026-09-11): `docs/politicas/ADENDO-MEMORIA-AUDITORIA-MOCKUP-CANVAS-2026-09-11.md`. Prompts ≠ arquivo morto: `ADENDO-PROMPTS-SAO-EXECUCAO-2026-09-11.md`. Estratégia de resgate do produto: `ESTRATEGIA-RESGATE-PRODUTO-CLUBE-ANCESTRAL-2026-09-11.md`. Fontes permanentes políticas + quadro PRs: `ADENDO-FONTES-EXECUCAO-POLITICAS-QUADRO-PRS-2026-09-11.md` ([políticas main](https://github.com/tatianatosi/soul-ancestry/tree/main/docs/politicas), [quadro PRs](https://github.com/tatianatosi/soul-ancestry/blob/claude/ancestral-club-desk-intelligence-0gsoeg/docs/relatorios/2026-09-05_quadro_completo_prs_1_ate_atual.md)). Marca + site SEO (não apontar domínio ao Vercel app): `ADENDO-MARCA-SITE-SEO-2026-09-11.md` · core: `.cursor/rules/clube-ancestral-core.mdc`. Enterprise PRD: `CLUBE_ANCESTRAL_ENTERPRISE_PRD.md` + `ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md`. Este arquivo é a fonte completa; não reinterpretar como redesenho de menu, vocabulário CHECK-* ou schema hipotético.

# Clube Ancestral — Memória Permanente e Instruções de Implementação

**Status:** documento normativo permanente  
**Finalidade:** preservar contexto operacional, decisões de produto e regras de implementação para evitar regressões, interpretações soltas, retrabalho e uso indevido de materiais legados.  
**Escopo:** Clube Ancestral; integrações e operações relacionadas da Plugged Research e Memotech Intelligence quando forem explicitamente conectadas ao produto.  
**Aplicação:** qualquer IA, pessoa desenvolvedora, designer, produto, operação, automação, banco de dados, front-end, back-end, integração, migração, deploy, auditoria ou documentação.

---

## 1. Ordem de autoridade

Este documento estabelece a ordem obrigatória para interpretar requisitos e dados operacionais do Clube Ancestral.

1. **Planejador** é a única fonte válida para o planejamento operacional, prioridades, cronograma, capacidade, projeções, tarefas planejadas, acompanhamento e decisões ativas.
2. **Instruções permanentes e decisões explícitas mais recentes da proprietária do produto** prevalecem sobre interpretações anteriores, documentos antigos, sugestões de IA e convenções técnicas.
3. **Modelo de dados, regras de negócio, migrations e código efetivamente aprovados** devem refletir as instruções permanentes; se divergem, a divergência deve ser declarada como dívida ou bloqueio, nunca escondida.
4. **Materiais legados** servem somente como referência histórica, evidência ou fonte de migração cuidadosamente controlada. Eles não definem a operação atual.

### Regra inegociável sobre materiais legados

A **matriz operacional legada**, a **planilha mestre**, o **DRE** e a **reconciliação do Asaas** são passado. Eles não são fonte de verdade do presente, não devem ser usados como premissa arquitetural e não podem conduzir automações, dashboards, indicadores, regras de priorização, regras financeiras ou fluxo operacional.

Esses materiais podem ser acessados exclusivamente quando houver uma tarefa formal de:

- preservação de histórico;
- conferência pontual de dados passados;
- migração de dados com mapeamento e aprovação;
- auditoria de divergência histórica;
- exportação ou arquivo de evidência.

Mesmo nessas situações, os dados históricos devem ser rotulados como **legado**, separados da camada operacional ativa e incapazes de sobrescrever o planejador.

### Proibição explícita

É proibido:

- reconstruir ou reintroduzir a matriz operacional legada como núcleo do produto;
- tratar planilha mestre como banco operacional atual;
- utilizar DRE histórico como motor de decisão ou de fluxo;
- tratar reconciliação do Asaas como sistema operacional, CRM, planner ou razão única do negócio;
- usar dados legados para alterar prioridades atuais sem validação no planejador;
- criar telas, tabelas, automações ou relatórios que misturem estado planejado atual com histórico legado sem separação visual e sem regra de precedência;
- concluir que uma exigência atual está atendida apenas porque algo parecido existe em documento, planilha, conversa ou ferramenta antiga.

---

## 2. Identidade e propósito do Clube Ancestral

O Clube Ancestral é uma plataforma operacional e de relacionamento voltada a jornadas de genealogia, ancestralidade, documentação, cidadania e imigração, articulando atendimento, pesquisa, coleta documental, planejamento, produção, comunicação e acompanhamento do cliente.

O produto não é apenas um site institucional, um CRM genérico, uma coleção de formulários ou uma área de tarefas. Ele deve funcionar como um **sistema operacional de casos e jornadas**, capaz de transformar demandas em trabalho organizado, rastreável e orientado por próximas ações.

### Problema que o produto precisa resolver

A operação envolve múltiplas frentes simultâneas:

- entrada e qualificação de potenciais clientes;
- entendimento da necessidade e do serviço apropriado;
- proposta, contratação e onboarding;
- coleta, validação e gestão de documentos;
- pesquisa genealógica e documental;
- planejamento de processos de cidadania e imigração;
- tarefas internas distribuídas entre responsáveis;
- comunicação com cliente;
- pendências, riscos, prazos e evidências;
- entregas, encerramento e continuidade de relacionamento.

Sem um núcleo único, essas frentes se fragmentam em conversas, planilhas, ferramentas financeiras, checklists isolados e memórias informais. O Clube Ancestral deve eliminar essa fragmentação.

---

## 3. Princípio central: motor unificado obrigatório

O **motor unificado** é o núcleo obrigatório do produto. Não é recurso opcional, nome de tela ou ideia futura. É a arquitetura que conecta todos os módulos por uma mesma fonte de verdade operacional.

Todo cliente, lead, caso, serviço, jornada, etapa, tarefa, documento, evento, interação, pendência, responsável e decisão precisa poder ser compreendido em relação a esse núcleo.

### Definição funcional

O motor unificado deve:

1. receber ou criar uma demanda, lead, cliente, caso ou jornada;
2. identificar o contexto, tipo de serviço, objetivo, estágio e prioridade;
3. associar regras e templates compatíveis;
4. gerar ou sugerir etapas, requisitos documentais, tarefas, responsáveis e prazos;
5. registrar cada mudança relevante em histórico temporal;
6. indicar claramente a próxima ação, o responsável e a condição de bloqueio;
7. oferecer visão interna e visão segura ao cliente;
8. manter rastreabilidade entre origem, trabalho executado, documentos, comunicação e resultado;
9. alimentar dashboards a partir de dados operacionais reais;
10. permitir adaptação humana justificada sem perder a trilha de auditoria.

### O que não é motor unificado

Não é suficiente entregar:

- páginas desconectadas;
- um kanban visual sem dados relacionais;
- checklist estático;
- formulários que não criam ou atualizam objetos reais;
- dashboard alimentado manualmente;
- CRM sem casos;
- portal de cliente sem documentos, status e pendências reais;
- banco de dados sem regras, eventos e permissões;
- automações genéricas sem vínculo com estados de caso;
- tabelas criadas sem telas, fluxos e testes utilizáveis.

A entrega deve demonstrar a cadeia inteira: **entrada → decisão → criação/atualização do caso → plano operacional → execução → evidência → comunicação → acompanhamento → encerramento**.

---

## 4. Fonte de verdade e modelo mental

### Planejador como sistema operacional ativo

O planejador é o centro da coordenação ativa. Ele é a fonte válida para saber:

- o que está planejado;
- o que deve acontecer em seguida;
- quem é responsável;
- quais itens estão atrasados, bloqueados ou aguardando;
- qual é a capacidade e a prioridade operacional;
- quais compromissos, prazos e ações estão em curso;
- o que foi concluído, adiado, cancelado ou replanejado.

O produto deve integrar-se ao planejador por meio de um modelo de dados coerente; não deve duplicar cegamente informação nem manter dois estados contraditórios para a mesma ação.

### Separação entre presente e legado

O sistema precisa diferenciar de maneira explícita:

| Camada | Finalidade | Fonte principal | Pode dirigir a operação atual? |
|---|---|---|---|
| Operacional ativa | Casos, jornadas, tarefas, documentos, prazos, responsáveis, eventos e decisões atuais | Planejador e motor unificado | Sim |
| Financeira operacional futura, quando aprovada | Cobranças e eventos financeiros conectados a casos, sem substituir o núcleo de casos | Integração definida e aprovada | Somente dentro de regras aprovadas |
| Histórica/legado | Consulta, auditoria, preservação e migração de registros passados | Matriz legada, planilha mestre, DRE, reconciliação Asaas e outros arquivos históricos | Não |
| Analítica | Indicadores derivados, sem alterar registro-fonte | Dados operacionais ativos e históricos segregados | Não diretamente |

Qualquer visualização que exiba dados legados deve dizer claramente que são históricos. Qualquer dashboard operacional atual deve preferir dados do planejador e do motor unificado.

---

## 5. Entidades mínimas do domínio

A nomenclatura técnica pode evoluir, mas a capacidade de representar estas entidades não pode desaparecer.

### Pessoas e organizações

- **Contato:** pessoa com quem existe interação, podendo ser lead, cliente, familiar, representante, fornecedor, parceiro ou profissional.
- **Cliente/conta:** pessoa ou grupo contratante e titular do relacionamento comercial.
- **Grupo familiar:** conjunto de pessoas relacionado à investigação, genealogia, documentação ou processo.
- **Usuário interno:** membro da equipe, com perfil, responsabilidades e permissões.
- **Parceiro/fornecedor:** entidade externa com papel operacional rastreável.

### Trabalho e jornadas

- **Lead/demanda:** entrada ainda em qualificação ou pré-venda.
- **Oportunidade:** demanda qualificada com serviço, valor ou proposta em avaliação.
- **Caso:** unidade operacional central para organizar uma jornada contratada ou em estruturação.
- **Serviço:** oferta ou modalidade de trabalho que orienta templates, requisitos, etapas e regras.
- **Jornada/workflow:** percurso configurável associado a um caso, composto por estágios, condições e ações.
- **Etapa:** estado macro do caso.
- **Tarefa:** ação executável, com responsável, prazo, status, origem e resultado.
- **Pendência/bloqueio:** condição que impede ou atrasa avanço e exige tratamento explícito.
- **Marco:** evento ou resultado relevante para medição e comunicação.

### Informação e evidência

- **Documento:** arquivo, referência ou registro recebido, produzido, analisado ou solicitado.
- **Requisito documental:** item esperado segundo tipo de serviço, caso, pessoa ou etapa.
- **Pesquisa/achado:** evidência genealógica, documental ou investigativa com fonte, conclusão e grau de confiança.
- **Evento/timeline:** registro imutável ou auditável de ação, alteração, comunicação, decisão ou transição.
- **Nota interna:** contexto de trabalho não exposto ao cliente.
- **Comunicação:** mensagem, solicitação, lembrete, e-mail, WhatsApp ou outra interação vinculada ao contexto correto.

### Governança e configuração

- **Template de serviço/jornada:** definição reutilizável de etapas, requisitos, tarefas e prazos.
- **Regra de automação:** ação gerada por evento, condição ou transição autorizada.
- **Permissão:** regra que determina quais dados e ações um perfil pode acessar.
- **Auditoria:** registro de quem fez o quê, quando, em qual contexto e com quais mudanças.

---

## 6. Regras de negócio fundamentais

### Caso como eixo

Todo trabalho operacional relevante deve estar ligado a um caso ou justificar explicitamente por que ainda não está. Tarefas soltas, documentos sem contexto, comunicações sem vínculo e decisões sem histórico são falhas de modelagem.

Um caso deve permitir identificar, pelo menos:

- cliente e contatos relacionados;
- serviço ou serviços associados;
- objetivo da jornada;
- estágio atual;
- estado operacional;
- prioridade;
- próximo passo;
- responsável principal;
- pendências e bloqueios;
- prazos e marcos;
- documentos exigidos, recebidos, validados e faltantes;
- tarefas abertas, concluídas, canceladas e atrasadas;
- histórico de eventos;
- visibilidade para cliente;
- origem do caso;
- data de abertura, atualização e encerramento, quando aplicável.

### Próxima ação obrigatória

Um caso ativo não pode ficar apenas com status. Deve ser possível responder rapidamente:

> Qual é a próxima ação concreta, quem a executa, quando deve ocorrer e o que a bloqueia?

Se não houver próxima ação, o caso precisa ser marcado intencionalmente como aguardando, pausado, encerrado, cancelado ou em outra condição formal. “Sem informação” não é um estado operacional aceitável.

### Transições controladas

Mudanças de etapa ou estado devem ser controladas por regras. Uma transição pode exigir:

- tarefa concluída;
- documento validado;
- aprovação interna;
- aceite do cliente;
- ausência de bloqueio crítico;
- justificativa de exceção;
- criação automática de próximos itens.

Não é necessário engessar a equipe: deve ser possível usar exceções, mas cada exceção precisa de motivo, autor e registro de evento.

### Templates aceleram, não substituem julgamento

Templates devem reduzir trabalho repetitivo e preservar consistência, porém não devem apagar a natureza singular de pesquisas genealógicas, casos documentais e jornadas migratórias.

Ao iniciar ou reconfigurar um caso, o sistema deve permitir:

- aplicar template de serviço;
- incluir ou remover tarefas e documentos conforme particularidade;
- alterar responsável e prazo;
- registrar a razão de desvios relevantes;
- manter vínculo entre o que veio do template e o que foi customizado.

---

## 7. Fluxo ponta a ponta

### Entrada e qualificação

1. Registrar lead ou demanda com origem, contato, tema, necessidade inicial e consentimentos aplicáveis.
2. Registrar interações e informações de qualificação.
3. Definir se há oportunidade, serviço possível, próximos passos e responsável.
4. Quando apropriado, transformar a oportunidade em caso, preservando origem e histórico.

### Proposta, contratação e onboarding

1. Associar escopo de serviço, proposta e condições aprovadas ao contexto do cliente/caso.
2. Quando houver contratação ou autorização para iniciar, criar ou ativar o caso operacional.
3. Aplicar jornada e requisitos compatíveis.
4. Criar tarefas iniciais, checklist de documentos, marcos e comunicação de onboarding.
5. Dar acesso ao cliente somente ao que é necessário e permitido.

### Execução

1. A equipe trabalha por tarefas e próximas ações vinculadas ao caso.
2. Documentos recebidos são classificados, vinculados e validados conforme requisito.
3. Achados de pesquisa são registrados com fonte e interpretação, sem confundir hipótese com evidência.
4. Mudanças de estado geram eventos e podem criar automações autorizadas.
5. Bloqueios e riscos são explícitos, atribuídos e acompanhados.

### Comunicação e portal

1. O cliente deve ver uma representação compreensível do próprio progresso, pendências, documentos e comunicações autorizadas.
2. Notas internas, avaliações sensíveis, regras internas, dados de outros casos e informações não autorizadas nunca devem aparecer no portal.
3. A comunicação deve ter contexto: caso, assunto, origem, data, responsável e status de leitura/resposta quando aplicável.

### Conclusão e continuidade

1. Encerrar somente com estado explícito, entregas e pendências remanescentes registradas.
2. Preservar histórico, evidências, documentos e decisões.
3. Possibilitar continuidade por novo serviço ou novo caso sem contaminar o histórico anterior.

---

## 8. Back-end: instruções permanentes

### Arquitetura de dados

O back-end deve priorizar modelo relacional consistente, integridade referencial, auditoria, escalabilidade operacional e segurança. Supabase/Postgres pode ser a infraestrutura principal quando esta for a arquitetura aprovada.

Regras obrigatórias:

- Não usar campos genéricos de texto ou JSON como substituto permanente de entidades relacionais essenciais.
- Usar identificadores estáveis e chaves estrangeiras para relações de negócio importantes.
- Registrar `created_at`, `updated_at`, `created_by` e, quando apropriado, `updated_by`.
- Implementar arquivamento ou exclusão lógica quando a preservação de histórico for relevante.
- Não apagar documentos, eventos, comunicações ou decisões de modo a destruir a auditabilidade sem uma política aprovada.
- Validar entradas no servidor; validação de front-end é complementar, não suficiente.
- Manter migrations versionadas, reversíveis quando viável e acompanhadas de descrição clara.
- Não modificar manualmente produção como alternativa a migrations controladas, salvo incidente documentado e correção posterior versionada.

### Estado e workflow

- Estados de caso, tarefa, documento e requisito devem ser definidos e validados de forma central.
- O front-end não deve ser a única autoridade para decidir transições de estado.
- Regras críticas de transição, elegibilidade e automação devem estar no back-end, banco ou camada de serviço confiável.
- Toda mudança material deve gerar evento de timeline/auditoria.
- Automação deve ser idempotente: reprocessar um evento não pode criar duplicações indevidas.
- Eventos e jobs devem prever falha, nova tentativa, rastreio e intervenção humana.

### Segurança e acesso

- Aplicar autenticação e autorização reais em todas as rotas e consultas sensíveis.
- Usar Row Level Security ou mecanismo equivalente para garantir segregação de dados por usuário, cliente e função.
- Nunca confiar apenas em esconder botões ou rotas na interface.
- Separar claramente perfis internos e externos.
- Clientes devem ter acesso apenas a seus próprios dados, documentos e comunicações autorizadas.
- Privilégios administrativos devem ser mínimos, explícitos e auditáveis.
- Segredos, chaves de serviço, tokens e credenciais não podem ser expostos no repositório nem no cliente.

### API e integrações

- APIs devem usar contratos previsíveis, mensagens de erro úteis e validação de payload.
- Integrações externas não devem se tornar fonte implícita de verdade do caso.
- Eventos recebidos de integrações devem ser armazenados com referência, origem, data e mecanismo de deduplicação.
- Qualquer integração financeira futura deve enriquecer ou sincronizar eventos autorizados, sem substituir o planejamento ativo nem a governança do caso.
- Webhooks precisam validar assinatura/autenticidade quando disponível.
- Falhas de integração devem ser exibidas em logs e, quando operacionais, em uma fila tratável; não podem falhar silenciosamente.

### Documentos e arquivos

- Arquivos devem ser armazenados com política de acesso, vínculo a caso/pessoa/requisito e metadados mínimos.
- Separar arquivo bruto de sua interpretação/validação operacional.
- Registrar quem enviou, quando, qual categoria, qual requisito atende, status de validação e observações necessárias.
- Evitar exposição pública de links e buckets de documentos sensíveis.

### Pesquisa genealógica e evidências

- Diferenciar fonte, transcrição, interpretação, hipótese e conclusão.
- Toda conclusão relevante deve poder apontar para evidência ou registrar claramente a ausência dela.
- Não apresentar hipóteses como fatos confirmados.
- Permitir relações entre pessoas, famílias, locais, eventos, documentos e achados sem perder fonte e grau de confiança.

### Observabilidade e qualidade

- Registrar erros de aplicação com contexto seguro, sem vazar dados pessoais.
- Medir falhas de automação, rotas críticas, criação de caso, upload de documento e transições de workflow.
- Criar testes para regras centrais: permissões, criação de caso, aplicação de templates, geração de tarefas, transições e segregação de dados.
- Antes de deploy, executar testes e verificar migrations no ambiente adequado.

---

## 9. Front-end: instruções permanentes

### Princípios de experiência

O front-end deve servir ao trabalho real da operação. Priorizar clareza, velocidade, contexto, baixa carga cognitiva e prevenção de erro. Uma interface elegante sem permitir executar o fluxo real não é uma entrega concluída.

O usuário deve conseguir responder rapidamente:

- Onde estou?
- Qual cliente/caso estou vendo?
- Em que etapa está?
- O que falta?
- Qual é a próxima ação?
- Quem é responsável?
- O que está bloqueado ou atrasado?
- Que documento, comunicação ou evidência sustenta essa situação?

### Hierarquia de telas

As telas prioritárias devem refletir o motor unificado:

1. **Visão de trabalho/planner:** filas, prioridades, tarefas, atrasos, pendências e próximos passos.
2. **Lista de casos:** filtros por estágio, serviço, responsável, prioridade, risco e situação.
3. **Detalhe do caso:** visão 360 graus com status, próxima ação, etapas, tarefas, documentos, timeline, comunicação, pessoas e bloqueios.
4. **Detalhe de contato/família:** vínculos, histórico e casos relacionados.
5. **Documentos/requisitos:** o que foi solicitado, recebido, validado, recusado ou está pendente.
6. **Pesquisa e evidências:** fontes, achados, hipóteses e conclusões vinculadas ao caso e às pessoas.
7. **Portal do cliente:** experiência simplificada, segura e sem exposição de conteúdo interno.
8. **Configuração administrativa:** templates, etapas, regras, perfis e permissões, acessível apenas a quem deve configurá-los.

### Regras de interface

- Exibir status com linguagem compreensível e não depender apenas de cor.
- Sempre mostrar próxima ação e responsável em casos ativos.
- Exibir bloqueios e pendências de maneira destacada, com ação possível quando o usuário tem permissão.
- Fornecer filtros persistentes e busca para operações com volume.
- Usar confirmação para ações destrutivas ou transições irreversíveis.
- Exibir feedback de carregamento, sucesso, erro e estado vazio.
- Não simular sucesso quando a gravação falhar.
- Não usar dados de demonstração como se fossem produção.
- Não esconder falhas de integração atrás de uma interface aparentemente concluída.
- Exibir fontes e nível de confiança em resultados de pesquisa quando pertinente.

### Formulários e validação

- Cada formulário deve criar ou atualizar objetos reais e persistidos.
- Indicar campos obrigatórios, formato esperado e erro diretamente no contexto.
- Salvar rascunhos quando houver risco de perda de trabalho extenso, especialmente em pesquisa e notas.
- Não exigir informações irrelevantes para iniciar um fluxo; coletar progressivamente quando possível.
- Preservar contexto ao navegar entre detalhes de cliente, caso, documentos e tarefas.

### Acessibilidade e responsividade

- Garantir navegação por teclado, foco visível, rótulos em inputs e contraste adequado.
- Não codificar significado apenas por cor, ícone ou posição.
- Projetar responsivamente, priorizando uso prático em desktop e boa consulta/atualização em celular.
- Usar linguagem em português do Brasil, clara, respeitosa e coerente com a operação.

### Portal do cliente

O portal não é cópia da operação interna. Deve priorizar:

- entendimento do estágio atual;
- próximos passos do cliente;
- lista de documentos necessários e seus status;
- upload seguro;
- mensagens e solicitações autorizadas;
- histórico de entregas e itens relevantes;
- transparência suficiente sem expor investigação interna, anotações estratégicas, outros envolvidos ou dados sensíveis indevidos.

---

## 10. Integração front-end e back-end

A aplicação só está implementada quando front-end e back-end operam como um único fluxo verificável.

### Critérios de integração

- A interface lê dados reais do ambiente definido, não mocks permanentes.
- Ações da interface persistem no banco e aparecem após recarregamento.
- Regras de permissão são reforçadas no servidor/banco, não somente na UI.
- Erros de persistência e autorização aparecem corretamente para o usuário adequado.
- Eventos criados por ações visíveis geram timeline/auditoria quando necessário.
- Dados criados por automação ficam visíveis na interface correta.
- Atualizações de estado refletem tarefas, pendências e próximos passos relacionados.
- Links entre casos, contatos, documentos, tarefas e comunicação funcionam ponta a ponta.

### Exemplo mínimo de prova do motor unificado

Uma demonstração válida deve conseguir executar este cenário completo:

1. Criar ou qualificar um contato.
2. Criar um caso associado a serviço e jornada.
3. Aplicar template de workflow.
4. Gerar tarefas e requisitos documentais.
5. Atribuir responsável e prazo.
6. Fazer upload ou registrar documento vinculado a requisito.
7. Validar ou recusar o documento com registro de decisão.
8. Atualizar uma tarefa e mover o caso por uma transição permitida.
9. Registrar evento na timeline.
10. Exibir no portal do cliente somente as pendências e informações autorizadas.
11. Mostrar no planner a próxima ação, o responsável e eventual bloqueio.

Se qualquer etapa depende de ajuste manual em planilha, edição direta de banco, mock, console do navegador ou explicação verbal, a prova está incompleta.

---

## 11. Dados financeiros e Asaas

### Regra de enquadramento

O Asaas e seus dados podem ser úteis para registrar eventos financeiros ou integrações aprovadas, mas não são o motor da operação do Clube Ancestral. Reconciliação financeira não substitui planejamento, workflow, gestão de casos, CRM, documentos, tarefas ou comunicação.

### Limites obrigatórios

- A reconciliação antiga do Asaas pertence à camada legado/histórica.
- Não usar reconciliação antiga para derivar o estado atual de casos, clientes, planejamento ou desempenho operacional.
- Não misturar indicadores financeiros históricos com planejamento ativo sem segmentação temporal e sem rótulo explícito.
- Caso uma integração ativa seja aprovada, cada evento financeiro deve apontar para seu contexto de negócio, como cliente, caso, proposta ou contrato, respeitando permissões e regras definidas.
- Eventos financeiros devem ser auditáveis, mas não devem reescrever ou inferir automaticamente a jornada operacional sem regra explícita.

---

## 12. Dados legados e migração

### Princípio de não contaminação

Dados legados devem ser preservados sem contaminar a operação atual. A existência de informação antiga não autoriza a recriação do modelo antigo.

### Processo obrigatório de migração

Antes de migrar qualquer informação de matriz operacional legada, planilha mestre, DRE, Asaas ou outro arquivo histórico:

1. Definir objetivo da migração: consulta, histórico, contatos, casos, documentos, financeiro ou outro.
2. Classificar os campos como ativos, históricos, ambíguos, duplicados ou descartáveis.
3. Mapear origem para destino, com regra de transformação explícita.
4. Definir como o dado será marcado como legado ou como dado operacional validado.
5. Executar em ambiente de teste.
6. Produzir relatório de totais, erros, duplicidades e amostras verificadas.
7. Obter aprovação antes de aplicar em produção.
8. Manter mecanismo de reversão ou registro completo da carga.

### O que não fazer

- Não importar planilhas inteiras diretamente como tabelas ativas.
- Não usar descrições textuais antigas como estados de workflow sem normalização e validação.
- Não criar tarefas atuais automaticamente a partir de pendências históricas sem revisão humana.
- Não converter valor financeiro histórico em previsão atual.
- Não tratar coluna existente como requisito de produto aprovado.

---

## 13. Governança de requisitos e prompts

Todo prompt, pedido ou decisão relevante deve ser convertido em item rastreável. Conversa não é sistema de gestão de requisitos.

### Matriz obrigatória de rastreabilidade

Cada requisito deve possuir, no mínimo:

| Campo | Descrição |
|---|---|
| ID | Identificador único e permanente |
| Origem | Conversa, documento, decisão, reunião ou solicitação da proprietária do produto |
| Formulação do requisito | O que deve funcionar, em linguagem de negócio |
| Prioridade | Crítico, alto, médio ou baixo |
| Estado | Não iniciado, em especificação, em desenvolvimento, bloqueado, em teste, publicado, aceito, descartado com aprovação |
| Critério de aceite | Evidência objetiva de funcionamento |
| Componente | Banco, API, automação, front-end, integração, segurança, dados ou documentação |
| Implementação | Links ou referências a migration, arquivo, commit, PR, deploy e teste |
| Dependências | Dados, decisão, integração, design ou infraestrutura necessária |
| Observações | Limites, exceções e decisão tomada |

### Regra contra “abdução” de prompts

Nenhum prompt crítico pode desaparecer. Ele só pode ter um dos seguintes destinos:

- implementado e aceito;
- parcialmente implementado, com lacuna declarada;
- bloqueado, com bloqueio específico e responsável por resolvê-lo;
- substituído por decisão posterior explícita;
- descartado mediante aprovação explícita da proprietária do produto.

“Foi considerado”, “está implícito”, “já existe algo parecido”, “a IA interpretou diferente” e “ficou para depois” não são estados aceitáveis.

---

## 14. Critérios de aceite

Uma funcionalidade só pode ser apresentada como concluída quando cumprir todos os critérios aplicáveis.

### Checklist de conclusão

- Requisito rastreado e ligado a critério de aceite.
- Fluxo real implementado, não apenas desenhado.
- Dados persistidos e recuperados corretamente.
- Segurança e permissões verificadas.
- Estados de carregamento, vazio e erro tratados.
- Front-end integrado a back-end real.
- Migrações aplicadas e versionadas, quando aplicável.
- Testes executados para lógica crítica.
- Deploy realizado no ambiente indicado.
- Cenário ponta a ponta demonstrado.
- Limitações remanescentes declaradas de forma objetiva.
- Aceite da proprietária do produto registrado para itens críticos.

### Definições proibidas de “feito”

Não considerar concluído quando:

- existe apenas protótipo visual;
- existem apenas componentes front-end sem persistência;
- existe apenas schema sem fluxo utilizável;
- existe apenas endpoint sem interface ou teste;
- a funcionalidade só funciona com dados de demonstração;
- o teste depende de intervenção técnica manual fora do produto;
- as permissões ainda não estão implementadas;
- há erro conhecido no fluxo central;
- a função não foi publicada no ambiente combinado;
- não há como relacionar a entrega ao requisito original.

---

## 15. Protocolo de execução para IA e equipe

Antes de implementar qualquer solicitação, seguir esta sequência:

1. Ler este documento e identificar a ordem de autoridade.
2. Verificar se a solicitação se relaciona ao motor unificado, ao planejador, a legado, segurança, dados, front-end ou back-end.
3. Registrar ou localizar o requisito na matriz de rastreabilidade.
4. Declarar o impacto em entidades, fluxos, permissões, migrations, APIs, automações e telas.
5. Implementar o mínimo vertical completo, e não somente uma camada isolada.
6. Testar o caminho ponta a ponta com dados controlados.
7. Registrar evidências técnicas e funcionais.
8. Atualizar estado do requisito com lacunas e bloqueios reais.
9. Nunca reintroduzir como premissa a matriz operacional legada, planilha mestre, DRE ou reconciliação antiga do Asaas.
10. Em caso de conflito, preservar o planejador como fonte operacional ativa e solicitar decisão explícita antes de alterar regra crítica.

### Forma correta de responder sobre implementação

Relatos de progresso devem dizer:

- o que foi implementado;
- em qual camada;
- quais entidades e fluxos foram alterados;
- qual requisito isso atende;
- qual evidência demonstra funcionamento;
- o que permanece pendente;
- quais bloqueios existem;
- qual é o próximo passo concreto.

Evitar respostas vagas como “estrutura criada”, “base pronta”, “quase finalizado”, “integração encaminhada” ou “o restante é refinamento” sem evidência verificável.

---

## 16. Prioridade de recuperação

Quando houver produto fragmentado, a correção deve priorizar o núcleo antes de novas páginas, refinamentos estéticos ou recursos periféricos.

### Sequência recomendada

1. Consolidar o modelo canônico de cliente, contato, caso, serviço, jornada, etapa, tarefa, documento, requisito, evento e usuário.
2. Implementar ou corrigir o motor unificado de criação e condução de casos.
3. Conectar o planejador às próximas ações, responsabilidades, prazos, pendências e bloqueios.
4. Garantir timeline e auditoria.
5. Implementar gestão documental vinculada a requisitos e casos.
6. Implementar permissões internas e portal de cliente seguro.
7. Integrar comunicação e automações essenciais.
8. Criar dashboards a partir do dado operacional real.
9. Tratar dados legados apenas por trilha segregada e aprovada.
10. Executar melhorias visuais e expansões depois que o fluxo central estiver provado.

---

## 17. Perguntas de controle permanentes

Antes de aprovar qualquer tela, automação, integração ou entrega, perguntar:

1. Isto fortalece ou fragmenta o motor unificado?
2. Qual caso, pessoa, documento, tarefa ou evento é a fonte de verdade?
3. O planejador continua sendo a fonte válida para o trabalho ativo?
4. Algum dado ou lógica legada está sendo tratado indevidamente como operação atual?
5. A ação tem responsável, próxima ação, prazo e estado claros?
6. A informação está protegida para o perfil correto?
7. O usuário consegue concluir o fluxo sem planilha paralela, banco manual ou suporte técnico?
8. Existe evidência de persistência, integração e teste?
9. Se algo falhar, o sistema informa e permite tratamento?
10. O requisito original pode ser marcado como atendido com prova objetiva?

Se uma resposta for “não” ou “não sabemos”, a entrega não está pronta para ser apresentada como concluída.

---

## 18. Declaração final

O Clube Ancestral deve ser construído como uma plataforma operacional coerente, orientada por casos e jornadas, com o planejador como fonte válida de planejamento ativo e o motor unificado como núcleo de execução.

A matriz operacional legada, a planilha mestre, o DRE e a reconciliação antiga do Asaas pertencem ao passado e só podem ser tratados como histórico, auditoria ou migração controlada. Eles não definem a arquitetura, não dirigem o workflow e não substituem o planejamento atual.

Toda implementação futura deve produzir rastreabilidade entre pedido, requisito, dado, regra, código, teste, deploy e aceite. O objetivo é encerrar definitivamente a repetição de pedidos, a perda de contexto, a entrega de módulos desconectados e a confusão entre legado e operação ativa.

---

## 19. Adendo 2026-09-10 — artefatos 005–010

A destilação operacional destes artefatos vive em `AGENTS.md` e `.cursor/rules/clube-ancestral.mdc` (mesma superfície; não criar arquivo de memória paralelo).

Resumo normativo, sem contradizer as seções 1–18:

- App Cliente: 7 abas (`Home, Jornada, Radar, Árvore, Documentos, Legado, Conta`). Sem Entregas / Fase 01 / Fase 02 na nav.
- Desk: 8 grupos operacionais (CA-UX-03); seis núcleos = composição, não menu. Fichas Pessoa / Núcleo / Lead / Caso / Pesquisa / Contrato são entidades distintas.
- Mockup de 17 páginas = visual normativo. PDF de 47 páginas e PDFs de distorção/comparação = auditoria, não redesign.
- “Entregue” exige fonte + escritor + persistência + consumidor + CTA + reload. Não inventar vocabulário de `CHECK`.
- PR #85 mesclada: não regredir `documentos_minimos_ok`, convite/login oficial, RLS, isolamento. Merge futuro só com autorização explícita.
