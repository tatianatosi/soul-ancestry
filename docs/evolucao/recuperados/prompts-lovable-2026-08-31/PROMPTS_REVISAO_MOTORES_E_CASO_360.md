# Prompts de Revisão — Motores Operacionais e Caso 360

**Projeto:** Clube Ancestral  
**Repositório:** `tatianatosi/soul-ancestry`  
**Destino:** Claude Code  
**Objetivo:** incluir na lista de trabalho revisões de implementação dos motores que deveriam estar conectados: Marketing, Financeiro, Onboarding/Cadências, Planejador, Pesquisa Documental, Contratos e Caso 360.

> **Regra para todos os prompts:** revisar primeiro; não criar feature, migration, componente, tabela, mock, regra de governança ou deploy enquanto não houver um diagnóstico objetivo da implementação atual. Cada revisão deve indicar o que existe no código, o que persiste no Supabase, o que é apenas interface/lista e o que não está conectado.

---

# R00 — Revisão-mãe: cadeia operacional completa

```markdown
# R00 — REVISÃO-MÃE DA CADEIA OPERACIONAL DO CLUBE ANCESTRAL

Repositório: tatianatosi/soul-ancestry
Objetivo: mapear o estado real da cadeia operacional que já deveria estar implantada.

Não implementar nada nesta tarefa.
Não criar migration.
Não alterar RLS.
Não criar prompt novo.
Não criar lista de requisitos.
Não remover arquivos.
Não fazer deploy.

## Pergunta de revisão

A cadeia abaixo funciona com dados persistidos ou é composta por telas/listas independentes?

Lead externo/manual
→ Cliente
→ Caso
→ Proposta
→ Contrato
→ Financeiro
→ Onboarding
→ Cadências/Tarefas
→ Planejador
→ Pesquisa documental
→ Portal do cliente

## Para cada seta, informar

- evento de entrada;
- arquivo/rota que executa a ação;
- função client/server chamada;
- tabela Supabase lida/escrita;
- dado de saída persistido;
- qual tela seguinte o consome;
- se existe integração real, parcial, mock ou nenhuma;
- erro/bloqueio conhecido;
- correção mínima necessária.

## Formato obrigatório

| De | Para | Evento real | Arquivo/Função | Tabelas | Dado persistido | Consumido por | Estado | Bloqueio | Correção mínima |
|---|---|---|---|---|---|---|---|---|---|

## Fechamento obrigatório

Listar, em ordem de dependência, somente:

1. os fluxos realmente funcionais;
2. os fluxos parcialmente conectados;
3. os fluxos que são somente listas/telas;
4. o primeiro ponto que impede a cadeia de operar ponta a ponta.
```

---

# R01 — Revisão de Marketing e conversão

```markdown
# R01 — REVISÃO DO MOTOR DE MARKETING E CONVERSÃO

Repositório: tatianatosi/soul-ancestry

Não implementar nada. Não criar migration, tabela, card, dashboard, automação, integração de anúncios ou nova tela.

## Objetivo

Verificar se Marketing é um motor real de entrada e conversão ou apenas uma coleção de listas/telas.

Leads podem chegar por canais externos: WhatsApp, indicação, Google Ads, Meta Ads, LinkedIn, Instagram, site, e-mail, parceiros, eventos e importação manual.

A origem externa não precisa ser integrada agora. O sistema interno precisa aceitar o lead e conduzi-lo.

## Cadeia que deve ser verificada

Origem/campanha
→ lead
→ atividade/atendimento
→ qualificação
→ diagnóstico
→ proposta
→ cliente
→ caso
→ receita atribuída

## Responder para cada etapa

- qual rota existe;
- qual componente existe;
- qual função grava/lê;
- qual tabela real é usada;
- quais campos são obrigatórios;
- se o dado persiste depois de refresh;
- se cria tarefa/follow-up/cadência;
- se gera proposta ou vincula cliente/caso;
- se calcula métricas apenas com dados reais;
- se é funcional, parcial, mock, lista ou ausente.

## Revisar especificamente

1. Cadastro manual de lead com nome, contato opcional, origem e interesse.
2. Definição/alteração de estágio do funil.
3. Registro de atividade de atendimento.
4. Próximo contato e tarefa de follow-up.
5. Conversão de lead em cliente.
6. Criação de caso a partir de lead convertido.
7. Vínculo de proposta ao lead/cliente/caso.
8. Registro de campanha e gasto manual.
9. Métricas: leads, qualificados, propostas, ganhos, receita, CPL e CAC apenas quando houver dados suficientes.
10. Integração do status de proposta com a cadência de follow-up.

## Formato obrigatório

| Capacidade | Rota/Arquivo | Função | Tabela | Persiste? | Aciona próximo passo? | Estado atual | Bloqueio ou lacuna | Correção mínima |
|---|---|---|---|---|---|---|---|---|

## Critério de conclusão

Não dizer que Marketing está implantado se ele não consegue, na prática, receber um lead manual e levá-lo a cliente/caso/proposta com dados persistidos.
```

---

# R02 — Revisão de Onboarding e cadências completas

```markdown
# R02 — REVISÃO DE ONBOARDING E CADÊNCIAS POR CENÁRIO

Repositório: tatianatosi/soul-ancestry

Não implementar nada nesta tarefa.
Não reduzir a revisão a D+0, D+1, D+7 ou D+15.
Não assumir que uma lista de mensagens representa uma cadência funcional.

## Objetivo

Verificar se o sistema possui jornadas completas de onboarding e cadências vinculadas a cenários reais, produtos/serviços, país, rota e eventos do caso.

## Princípio

Onboarding não é uma sequência universal curta. Cada cenário deve poder acionar tarefas, documentos, marcos, comunicações e próximos passos diferentes.

## Cenários a revisar

1. Diagnóstico/consultoria de cidadania.
2. Pesquisa genealógica e memória familiar.
3. Pedido unitário de certidão.
4. Combo de certidões.
5. Montagem de pasta documental.
6. Assessoria completa de cidadania.
7. Protocolo consular.
8. Via judicial.
9. Pós-reconhecimento: AIRE e passaporte.
10. Registro de filho/casamento.
11. Assinatura Essência.
12. Assinatura Memórias.
13. Assinatura Legado.

## Para cada cenário, verificar

- como o cenário é identificado: SKU, produto, país, rota, tipo de caso ou escolha manual;
- evento que inicia a jornada: pagamento, contrato, proposta aceita, criação manual ou outro;
- template/jornada associado;
- tarefas que são criadas de verdade;
- documentos/requisitos que são criados de verdade;
- milestones que são criados de verdade;
- mensagens/touchpoints que são agendados ou registrados;
- dono/responsável de cada ação;
- prazos e regras de reprogramação;
- condição de conclusão/pausa;
- telas que exibem essas informações para Desk e cliente;
- tabela e função responsáveis;
- se persiste e funciona ou se é apenas uma lista.

## Revisar a abrangência temporal

Não verificar somente os primeiros dias. Mapear toda a jornada prevista por cenário:

```text
entrada
→ coleta inicial
→ primeira entrega
→ pendências/documentos
→ execução/pesquisa
→ atualização recorrente
→ preparação final
→ protocolo/acompanhamento
→ conclusão
→ pós-venda/legado
```

## Formato obrigatório

| Cenário | Disparador | Jornada/template real | Tarefas reais | Documentos/requisitos reais | Milestones reais | Touchpoints reais | Persistência | Estado | Lacuna crítica |
|---|---|---|---|---|---|---|---|---|---|

## Fechamento obrigatório

Separar claramente:

- cenários com fluxo implantado;
- cenários parcialmente implantados;
- cenários reduzidos a sequência de dias/listas;
- cenários apenas documentados e não implementados;
- dependência mínima para transformar cada cenário em fluxo funcional.
```

---

# R03 — Revisão do Planejador de Cidadania

```markdown
# R03 — REVISÃO DO MOTOR DO PLANEJADOR DE CIDADANIA

Repositório: tatianatosi/soul-ancestry

Não implementar nesta tarefa.
Não criar novas regras legais.
Não criar checklist, motor, tabela ou cenário fictício.
Não tratar uma aba, card, linha do tempo ou lista de fases como motor implantado sem verificar persistência e conexões.

## Objetivo

Verificar se o Planejador de Cidadania realmente organiza e move um caso por dados reais ou se é apenas uma interface de cenários/fases.

## Fluxo mínimo a verificar

Caso
→ país/objetivo/rota
→ fase atual
→ diagnóstico/hipótese
→ requisitos documentais
→ tarefas
→ milestones
→ próxima ação
→ estimativa em faixa
→ avanço/recuo de fase
→ dados visíveis ao cliente

## Capacidades que precisam ser verificadas

1. Criar caso real e vincular ao cliente.
2. Definir país, rota, objetivo e responsável.
3. Alterar fase manualmente.
4. Registrar histórico de mudança de fase.
5. Criar e concluir milestones.
6. Criar requisitos e pendências por caso/pessoa.
7. Identificar próxima ação a partir de tarefa, pendência ou definição manual.
8. Salvar previsão mínima/máxima e premissas.
9. Registrar diagnóstico/avaliação com evidências/alertas.
10. Conectar requisitos a documentos e pesquisa.
11. Conectar produtos/proposta/contrato ao caso sem bloquear uso.
12. Alimentar a visão do cliente com jornada, marcos, próximos passos e atualizações liberadas.
13. Permitir que owner/admin avance ou recue fase sem auditoria, gate ou reconfirmação.

## Formato obrigatório

| Capacidade | Rota/Arquivo | Função | Tabela | Entrada | Saída persistida | Consumido por | Estado | Bloqueio/lacuna |
|---|---|---|---|---|---|---|---|---|

## Diagnóstico obrigatório

Ao final, responder objetivamente:

- o Planejador calcula/deriva alguma coisa ou só exibe dados/listas?
- quais eventos reais modificam uma fase, milestone ou próxima ação?
- quais ações estão desconectadas de documentos, tarefas, proposta, contrato e portal?
- qual é a primeira correção mínima para fazer um caso avançar de ponta a ponta?
```

---

# R04 — Revisão da Pesquisa Documental e Genealógica

```markdown
# R04 — REVISÃO DO MOTOR DE PESQUISA DOCUMENTAL E GENEALÓGICA

Repositório: tatianatosi/soul-ancestry

Não implementar nada nesta tarefa.
Não criar novas tabelas ou mudar constraints antes de mapear as tabelas e vocabulários já existentes.

## Objetivo

Verificar se a Pesquisa permite registrar e recuperar trabalho genealógico/documental real vinculado a um caso, ou se está limitada a formulários/listas sem persistência e sem ligação com a jornada.

## Fluxo mínimo a verificar

Caso
→ pessoa
→ relação
→ evento
→ fonte
→ pedido documental
→ documento localizado/recebido
→ upload ou referência
→ evidência
→ hipótese
→ pendência/tarefa
→ atualização liberada ao cliente

## Capacidades obrigatórias de revisão

1. Criar/editar pessoa e variantes de nome.
2. Criar relação familiar e verificar vocabulários aceitos pelo banco.
3. Criar evento histórico com data/local/precisão.
4. Criar fonte com repositório, citação, código e URL.
5. Criar pedido documental com local, órgão, prazo e status.
6. Alterar status de pedido documental sem quebrar constraint.
7. Registrar documento localizado/recebido.
8. Fazer upload real ao Supabase Storage e recuperar o arquivo.
9. Salvar referência externa quando não houver arquivo.
10. Criar evidência vinculada a fonte/documento/pessoa.
11. Criar hipótese, alterar status e salvar conclusão.
12. Gerar pendência/tarefa quando documento exigir tradução, apostila, retificação ou novo pedido.
13. Vincular achado ao Planejador e/ou atualização do cliente.
14. Exibir dados persistidos após refresh.

## Checar especialmente

- mocks e arrays locais;
- formulários que exibem sucesso mas não gravam;
- selects com valores incompatíveis com constraints reais;
- upload sem `storage_path` persistido;
- telas que consultam tabela diferente daquela que recebe o INSERT;
- dados de caso, pessoa e documento sem vínculo entre si;
- bloqueios de permissão que impedem owner/admin de salvar.

## Formato obrigatório

| Capacidade | Rota/Arquivo | Função | Tabela/Bucket | Persistência | Vínculo com caso | Integração com tarefa/planejador | Estado | Falha/lacuna |
|---|---|---|---|---|---|---|---|---|

## Conclusão

Indicar, sem generalidades:

- quais blocos de pesquisa já são utilizáveis hoje;
- quais são apenas UI/lista;
- qual é o primeiro ponto técnico que impede pesquisa real;
- quais correções são de vocabulário/constraint, permissões, função ou interface.
```

---

# R05 — Revisão do Financeiro, propostas e contratos

```markdown
# R05 — REVISÃO DE PROPOSTAS, CONTRATOS E FINANCEIRO

Repositório: tatianatosi/soul-ancestry

Não implementar nada nesta tarefa.
Não criar migration, não alterar precificação, não integrar Asaas e não gerar contratos novos.

## Objetivo

Determinar se o sistema já permite uma operação comercial real:

Cliente/Caso
→ proposta
→ itens/escopo
→ preço/parcelamento
→ contrato editável
→ PDF
→ pagamento manual
→ saldo
→ visão financeira no caso

## Verificar propostas

- criação de proposta;
- vínculo com cliente/caso;
- itens livres e SKUs;
- preço, desconto, entrada, parcelas e validade;
- persistência após refresh;
- duplicação/edição;
- conversão ou criação de contrato;
- follow-up associado à proposta.

## Verificar contratos

- modelos existentes e origem dos textos;
- criação a partir de proposta ou caso;
- preenchimento real de dados de cliente/caso/escopo/valores;
- editor de cláusulas;
- versões;
- prévia;
- geração de PDF real;
- upload/armazenamento e abertura do PDF;
- status: rascunho, enviado, aceito, assinado, ativo;
- aceite/assinatura manual;
- aditivo;
- ligação com financeiro e caso.

## Verificar financeiro

- plano financeiro;
- lançamento de entrada/parcelas;
- pagamento manual/partial/paid;
- saldo por caso/contrato/cliente;
- despesas e taxas externas separadas;
- vencidos;
- uso de dados reais no dashboard;
- integração Asaas existente versus pendente;
- ausência de bloqueio caso Asaas não esteja pronto.

## Formato obrigatório

| Capacidade | Rota/Arquivo | Função | Tabela/Storage | Persiste? | Conecta a | Estado | Falha/lacuna | Correção mínima |
|---|---|---|---|---|---|---|---|---|

## Conclusão obrigatória

Responder:

1. É possível hoje criar uma proposta e recuperá-la depois?
2. É possível hoje gerar contrato com dados reais e PDF acessível?
3. É possível hoje registrar uma entrada e parcelas manualmente?
4. O saldo é calculado com dados persistidos?
5. Qual ponto interrompe a cadeia comercial primeiro?
```

---

# R06 — Revisão de Caso 360 e visão do cliente

```markdown
# R06 — REVISÃO DO CASO 360 E DA VISÃO ADMINISTRATIVA DO CLIENTE

Repositório: tatianatosi/soul-ancestry

Não implementar nada nesta tarefa.
Não criar nova tela paralela, não criar migration e não alterar dados.

## Objetivo

Verificar se existe uma mesa de trabalho única por caso — Caso 360 — que reúna os dados que a proprietária precisa sem depender de memória, de múltiplas abas isoladas ou de listas desconectadas.

Também verificar se owner/admin consegue abrir a visão do cliente selecionado sem sair da sessão administrativa.

## O Caso 360 deve reunir

```text
Cliente
Caso e fase
Próxima ação
Pendência principal
Responsável
Produto/proposta
Contrato
Financeiro: saldo e próxima parcela
Onboarding/cadência ativa
Tarefas de hoje/atrasadas
Documentos: resumo e críticos
Pesquisa: pessoas, fontes e achados
Milestones/jornada
Última atualização
Ações rápidas
```

## Verificar

1. Existe uma rota de caso que consolida esses dados?
2. Quais blocos usam consulta real e quais usam mock/lista?
3. Quais tabelas são consultadas?
4. Há links entre os módulos ou cada aba é isolada?
5. Há uma ação “próxima melhor ação” calculada ou manualmente persistida?
6. As ações rápidas realmente criam/alteram dados?
7. Owner/admin consegue abrir “visão do cliente” de um cliente escolhido?
8. A visão administrativa passa `clientId` explicitamente, em vez de confundir `auth.uid()` do admin com o cliente?
9. O admin volta ao Desk sem logout?
10. O portal mostra somente dados liberados daquele cliente?

## Formato obrigatório

| Bloco do Caso 360 | Rota/Componente | Fonte de dados | Tabela/Função | Dado real ou mock? | Atualiza após ação? | Estado | Lacuna |
|---|---|---|---|---|---|---|---|

## Conclusão obrigatória

- O que uma proprietária vê hoje ao abrir um caso?
- Quais informações ainda exigem procurar em outras abas ou lembrar de cabeça?
- O que está impedindo uma visão de cliente pelo admin?
- Qual é a menor sequência de correções para transformar Caso 360 em mesa de trabalho real?
```

---

# R07 — Revisão de acesso sem bloqueio operacional

```markdown
# R07 — REVISÃO DE ACESSO, SESSÃO E BLOQUEIOS OPERACIONAIS

Repositório: tatianatosi/soul-ancestry

Não implementar nada. Não remover arquivos, não mudar RLS, não alterar roles e não fazer deploy nesta tarefa.

## Objetivo

Mapear de maneira precisa tudo que ainda pode impedir a proprietária/admin de entrar, permanecer no Desk, abrir a visão de cliente, criar, editar ou salvar dados operacionais.

## Revisar estas situações

1. Login da proprietária.
2. Refresh no painel.
3. Nova aba em Casos.
4. Acesso a Clientes, Pesquisa, Documentos, Propostas, Contratos, Financeiro, Marketing, Planejador, Equipe e Configurações.
5. Criação e salvamento de dado simples em cada módulo.
6. Abertura do portal de cliente em preview administrativo.

## Identificar qualquer dependência de

```text
modo proprietária
reconfirmar propriedade
auditoria
varredura administrativa
gates de override
aprovação em lote
perfil institucional
service role para CRUD comum
variável inválida
RLS sem policy correta
membership inconsistente
redirect de rota
feature flag
estado local/cache stale
```

## Formato obrigatório

| Operação | Rota | Guard/arquivo | Fonte de papel/permissão | Dependência de banco/API | Bloqueio encontrado | Efeito para owner/admin | Correção mínima |
|---|---|---|---|---|---|---|---|

## Saída final

Listar em ordem de impacto:

1. bloqueios que impedem login/acesso;
2. bloqueios que impedem salvar;
3. bloqueios que impedem visão do cliente;
4. bloqueios que são apenas ruído visual/documentação;
5. correção mínima para assegurar: proprietária autenticada trabalha sem provar nada.
```

---

# Ordem de execução das revisões

Executar uma revisão por vez, sem mudar código durante a revisão.

```text
R07 — Acesso, sessão e bloqueios operacionais
R00 — Cadeia operacional completa
R05 — Propostas, contratos e financeiro
R02 — Onboarding e cadências por cenário
R03 — Planejador de Cidadania
R04 — Pesquisa documental e genealógica
R01 — Marketing e conversão
R06 — Caso 360 e visão administrativa do cliente
```

## Entrega consolidada esperada

Após todas as revisões, consolidar apenas uma tabela final:

| Motor | Funciona ponta a ponta? | O que persiste | O que é tela/lista | Quebra principal | Primeira correção necessária | Dependência anterior |
|---|---|---|---|---|---|---|

Não implementar correções sem uma instrução posterior explícita da proprietária.
