# Discovery + Call no lead: um único registro, com roteiro e próxima ação

Hoje o Discovery e a call são dois botões soltos: o Discovery grava só um resultado e joga o lead para "qualificado"; a call grava data e resumo. Nenhum dos dois registra a fonte de cada resposta, nem define o próximo passo, nem diferencia call marcada, realizada, remarcada ou não comparecida.

Este patch transforma os dois em um atendimento só, gravado nas tabelas que já existem.

## O que muda na tela

**Mesa de Discovery (em Comercial e em Leads)** passa a ser um roteiro progressivo sobre o lead escolhido:

1. Objetivo da família
2. Origem do contato
3. Consentimento (status, canal, data)
4. Situação da call: marcada / realizada / remarcada / não compareceu / cancelada, com data
5. Resultado do Discovery: seguir para proposta / precisa de mais informação / fora de perfil / sem resposta
6. Próxima ação: texto, responsável e prazo

Cada resposta mostra, ao lado: de onde veio (campo gravado do lead, registro de call, histórico) e o estado (respondida, pendente, não se aplica). Pergunta sem resposta não vira suposição — fica "sem registro" e é o que o roteiro pede a seguir.

No fim do roteiro um único botão grava tudo de uma vez e o lead reaparece já atualizado no Funil, no Kanban e nos gráficos.

## Onde os dados são gravados

Tudo em tabelas existentes, sem coluna, tabela ou migração nova:

- no lead: situação e datas da call, resultado do Discovery, etapa, próxima ação, prazo e responsável
- no histórico de interações: uma linha por atendimento registrado, com resumo interno, data e autor

Etapa continua limitada ao vocabulário já aceito pelo banco (novo, qualificado, proposta em preparo, proposta enviada, ganho, perdido, arquivado). Situação da call e resultado do Discovery passam a ser listas fixas na interface, no lugar de texto livre.

## Gráficos ligados aos dados reais

Na tela Comercial, sobre os mesmos leads já lidos:

- Funil por etapa, incluindo a etapa nova que o atendimento gravou
- Kanban por prazo da próxima ação: vencida, hoje, próximos 7 dias, sem prazo
- Situação das calls: marcadas, realizadas, remarcadas, não comparecidas
- Resultado do Discovery por leitura registrada
- Leads sem próxima ação e calls vencidas como contadores de atenção

Sem dado gravado, cada bloco mostra o vazio canônico com um único caminho de ação — nunca gráfico de enfeite.

## Sobre o App do cliente

Discovery e call são conversa interna de equipe. Não vão para o App em nenhuma aba — nem número, nem gráfico, nem resumo. Os gráficos deste patch ficam só no Desk. Se a intenção era outra, me diga antes que eu implemente.

## Detalhes técnicos

- `src/lib/golive-escritores.functions.ts`: unificar Discovery e call em um escritor autenticado por organização, gravando `leads` (`discovery_resultado`, `status_call`, `call_agendada_em`, `call_realizada_em`, `resumo_call`, `estagio`, `proxima_acao`, `proxima_acao_em`, `responsavel_nome`/`responsavel_user_id`) e uma linha em `crm_interactions` (`data_origin: "real"`, `visibilidade: "interna"`). Campos vazios não sobrescrevem valor existente.
- `src/lib/golive-comercial.ts`: listas fixas de situação da call e de resultado; cálculos puros de funil, situação de call, resultado e prazo da próxima ação, com data de referência injetável.
- `src/routes/_authenticated/golive.comercial.tsx` e `golive.leads.tsx`: roteiro progressivo com fonte e estado por resposta, gravação única e blocos de gráfico.
- Testes puros para etapa derivada, call vencida, call sem data, resultado não mapeado e próxima ação vencida/hoje/+7/sem prazo.
- Sem alteração de banco, RLS, migração, publicação, envio, convite ou deploy; nenhum dado de exemplo criado.
