# P0 Acesso — fechar os seis pontos com prova

Escopo fechado. Nada de assinar contrato, liberar o caso da Ana, criar convite ou
link mágico, alterar dados, permissões, cobrança, publicação ou deploy.

## O que já está no código (confirmado em leitura)

- Confirmação de acesso (`/acesso/confirmar`) já tem prazo por leitura (4 s),
  teto global de 12 s e estados finais: sem sessão, aguardando liberação do
  caso, negado, erro temporário. "Verificar novamente" só relê; não consome nem
  pede link novo.
- As duas portas (equipe e cliente) já releem a sessão antes de expulsar, então
  falha momentânea de rede não devolve a pessoa para a tela de acesso.
- A visão master abre as sete abas reais do App com dado real do caso escolhido,
  somente leitura.

Falta: fechar a lacuna da visão master quando o caso escolhido não tem conteúdo
liberado, e produzir a prova autenticada no Lovable.

## O que será feito

1. **Callback e confirmação** — reconferir os três formatos de retorno de link
   (código, token e fragmento) e garantir que cada um termina em estado final
   visível, nunca em carregamento.
2. **Sessão persistente** — confirmar que, depois de entrar, F5 e troca de aba
   mantêm a pessoa dentro, sem retorno silencioso à tela de acesso.
3. **Destino correto** — quem tem caso liberado vai direto para o App; quem é da
   equipe vai para o Desk; ninguém entra na área errada por endereço digitado.
4. **Estado sem caso liberado** — a mensagem "Acesso confirmado, aguardando
   liberação do caso" fica como estado final legítimo, sem prometer prazo e sem
   oferecer ação que a pessoa não pode executar.
5. **Visão master completa** — na tela de ver o App como pessoa: mostrar as sete
   abas mesmo quando o caso ainda não tem conteúdo publicado, cada aba com vazio
   honesto e específico ("nada publicado ainda" com o motivo real), em vez de um
   bloco de erro genérico. Nenhuma aba extra, nenhuma oitava.
6. **Prova no Lovable** — sessão autenticada da proprietária, prints desktop e
   375 px de: confirmação em cada estado que ocorrer naturalmente, App após F5,
   estado sem caso liberado e as sete abas na visão master. Dados sensíveis
   mascarados.

## Detalhes técnicos

- Arquivos previstos: `src/routes/acesso.confirmar.tsx` (apenas se a medição
  apontar necessidade), `src/routes/_authenticated/app-cliente-como-pessoa.tsx`
  (vazios por aba em vez do bloco de erro único) e, se necessário, o provedor de
  fonte do portal para distinguir "sem conteúdo publicado" de "falha de leitura".
- Nada de servidor, migration, RLS ou writer novo. `confirmarAcessoPortal`
  permanece como está, inclusive a regra que não queima o link em releitura.
- Validação: tipos, build e os testes de acesso/portal, com as falhas
  preexistentes identificadas como tais.

## Parada

Depois dos prints, paro para sua aprovação explícita. Nenhum registro de
assinatura ou liberação do caso da Ana entra neste corte.
