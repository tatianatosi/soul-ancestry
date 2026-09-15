# Revisão v6 — decisões registradas e primeiro corte de execução

## O que fica decidido

As sete decisões do documento ficam aprovadas e passam a valer como contrato de arquitetura:

1. Cada superfície tem uma rota dona.
2. Kanban por prazo pertence a `/tarefas`.
3. Painel do caso vira porta de entrada dentro do Caso 360, não uma segunda ficha.
4. `/qualidade` é o único Radar interno; o Radar de seis dimensões continua sendo só do App.
5. Formalização tem uma rota orquestradora, com fronteira clara para contratos.
6. "Validação Jurídica da Trilha" substitui "Auditoria Jurídica" na experiência principal.
7. Portal cuida de acesso e publicação por caso; Configurações cuida da organização.

Os endereços não mudam nesta rodada: as prévias e as telas operacionais continuam as duas no ar, lado a lado. A migração de endereços fica para uma decisão futura.

O alcance do padrão visual em todo o Desk fica em aberto. Nesta fase, o padrão v6 aparece apenas dentro do corte aprovado — nenhuma casca comum, nenhum menu e nenhuma outra tela são alterados.

## Primeiro corte: Caso 360 — cabeçalho decisório e tela única do contrato

Somente o endereço do caso. Duas entregas.

### 1. Cabeçalho decisório do caso

No topo do Caso 360, um bloco único que responde à pergunta do documento — etapa, responsável, próxima ação, prazo e bloqueio real — no padrão v6 (navy, creme, linha dourada).

Regras:

- identidade sempre pelo caso, nunca por nome;
- faixa com no máximo quatro números, cada um com fonte real: etapa atual, ações vencidas, documentos pendentes, entregas em revisão;
- sem dado, o texto é honesto: "Não registrado" para etapa e `0` para contagens;
- nada de percentual de completude, chance de êxito ou estimativa.

Para o caso da Ana isso significa hoje: etapa de preparação, responsável Tatiana, próxima ação vencida, pesquisa e financeiro travados pelo contrato.

### 2. Tela única do contrato

Dentro do caso, o contrato em fluxo contínuo, sem repetir a ficha do caso:

- cabeçalho com número, título, situação e assinatura;
- origem no Canva: referência registrada, páginas e situação da extração. Sem referência gravada, o texto é "Link do Canva não registrado" — nunca um botão morto;
- de-para página do deck → campo do contrato, mostrando o que está preenchido e o que está em branco;
- o que falta para avançar;
- versões e anexos;
- o que está travado por este contrato (financeiro, pesquisa, ordem de serviço);
- ações do fluxo, e cada ação indisponível diz o motivo.

Sem "revisão contratual" reaparecendo como bloqueio recorrente e sem juízo de mérito.

## Fronteiras respeitadas neste corte

- O contrato mostra validação e pendência; o parecer de risco continua no Jurídico.
- Publicação não acontece aqui: o caso só aponta para o Portal.
- Financeiro continua registrando fatura e pagamento como fatos próprios.
- Arquivados e dados de teste ficam fora da tela, sem exclusão.

## Fora deste corte

Nenhuma criação ou alteração de dado, nenhuma publicação, envio, convite ou link mágico, nenhuma mudança de banco, permissão, integração ou endereço, nenhum deploy. As outras treze superfícies não são tocadas.

## Entrega e parada

Prévia navegável com prints em desktop e 375 px do cabeçalho e da tela do contrato, com o estado real do caso da Ana. Depois disso eu paro e aguardo seu aceite antes de qualquer corte seguinte.

## Detalhes técnicos

- Superfície do corte: rota do caso (`/casos/$caseId`) e a aba de contrato do caso; as prévias `/golive/*` permanecem intactas.
- Leitura somente: caso, plano, ações, documentos, microentregas, proposta e contrato já existentes, sempre filtrados por organização e pelo identificador do caso.
- Nenhum leitor novo com filtro por texto, nome, DEMO/TESTE ou palavra-chave; exclusão de arquivados por campo estruturado.
- Sem migration, sem RLS, sem writer, sem novo componente de menu.
- Verificação: tipos, testes e build, além dos prints nas duas larguras.
