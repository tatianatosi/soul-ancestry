# P0-1 — Encerrar o "Validando seu acesso…" infinito

Escopo fechado: apenas a tela de confirmação de acesso. Nada de assinar, enviar,
liberar o caso da Ana, criar link/convite, ou alterar dados, permissões,
contrato, anexos, cobrança, publicação ou publicação do app.

## O que está confirmado na leitura

- A tela é `src/routes/acesso/confirmar` e executa: obter sessão → chamar o
  servidor → decidir destino.
- A obtenção da sessão hoje **não tem prazo máximo**: as chamadas de leitura de
  sessão e de troca do link podem ficar pendentes para sempre. Se isso acontece,
  o servidor nunca é chamado e a tela fica no texto de validação — exatamente o
  que a prova real mostrou.
- Há uma trava de "executar uma única vez" combinada com um cancelamento na
  desmontagem. Em montagem dupla, a trava impede a segunda execução enquanto a
  primeira já foi marcada como cancelada — nenhum resultado é aplicado à tela.
- Só existem dois estados visíveis: "validando" e "negado". Não há estado de
  acesso confirmado aguardando liberação de caso, nem de erro temporário com
  nova tentativa segura.

Causa exata ainda **não confirmada** entre as duas hipóteses acima; o primeiro
passo mede qual delas ocorre, com registro no console durante o teste.

## O que será feito

1. **Medir antes de corrigir**: instrumentar temporariamente o caminho para
   registrar se a leitura de sessão retorna, se a troca do link ocorre e se o
   servidor é chamado. O resultado fica no relatório.
2. **Prazo máximo de 12 segundos** para todo o caminho, e prazo curto para cada
   leitura de sessão. Vencido o prazo, a tela sempre sai do estado de validação.
3. **Uma execução por sessão/link, sem cancelamento indevido**: a montagem dupla
   deixa de descartar a única execução válida; o resultado sempre chega à tela.
4. **Estados finais explícitos**, cada um com texto humano:
   - sessão ausente;
   - link expirado ou já usado;
   - erro temporário de leitura (com "Verificar novamente");
   - e-mail sem autorização;
   - acesso confirmado, aguardando liberação do caso;
   - acesso confirmado com caso liberado → segue para o app do cliente.
5. **"Verificar novamente"** apenas relê sessão e elegibilidade. Nunca consome o
   link nem pede um novo automaticamente. "Solicitar novo link" continua sendo
   uma ação separada e explícita da pessoa.
6. **Nunca voltar em silêncio** para a tela de acesso quando já existe sessão.

Sem mudança de endereços de retorno, domínio de autenticação ou configuração do
provedor. Se algum item externo impedir o teste, ele é registrado, não alterado.

## Prova antes de qualquer commit

- Tipos, build e os testes relevantes de acesso/portal, com as falhas
  preexistentes identificadas como tais.
- Teste com sessão real: abrir a confirmação, registrar se o servidor foi
  chamado, confirmar saída do carregamento em até 12 segundos, F5 mantendo a
  sessão, mensagem explícita quando não há caso liberado, e nenhum novo link
  gerado ou solicitado.
- Prints desktop e 375 px de cada estado que ocorrer naturalmente, com dados
  sensíveis mascarados.
- Lista de arquivos, diff resumido e falhas preexistentes.

Depois disso, parada para sua aprovação explícita.

## Detalhes técnicos

- Arquivo principal: `src/routes/acesso.confirmar.tsx`.
- Caminho de leitura no servidor: `confirmarAcessoPortal` em
  `src/lib/portal.functions.ts` — mantido como está, inclusive a regra que evita
  queimar o link em releitura da mesma sessão. Sem alteração de servidor prevista;
  se a medição indicar necessidade, ela volta para aprovação antes.
- A obtenção de sessão passa a ter tempo limite por tentativa e teto global,
  cobrindo os três formatos de retorno (código, token e fragmento).
- O estado da tela deixa de ser `"validando" | "negado"` e passa a nomear cada
  situação final da lista acima, mantendo os textos já aprovados e acrescentando
  apenas os que faltam.

## Contrato da Ana — só inventário de leitura, fora deste corte

Não entra nesta execução. Depois do P0-1, em leitura, levantar onde estão o
Contrato de Estudo Genealógico v2, a versão que puxava escopo/entregas do Canva,
os Anexos I–V e a OS aplicável, marcando cada item como pronto, não registrado,
não aplicável, pendente de decisão, bloqueado por dado real ou erro de fonte —
sem deduzir escopo, exclusões ou anexos, e sem transformar a tela em formulário
longo.
