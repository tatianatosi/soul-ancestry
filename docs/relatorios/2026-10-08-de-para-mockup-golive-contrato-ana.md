# De-para — mockup, v4, go-live e cobrança da Ana

Status: rascunho
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: GitHub tatianatosi/soul-ancestry @ c2f0f57 (produção READY, 08/10 15:13 BRT); Vercel dpl_6GXn5qR81z8BNjv19c6yscDmEBZw; Space (CA-EVO-05A, CA-10A1, conversas de mockup 02–04); Drive (dossiê Ana de 14/08). Estudo de 119 páginas não localizado.
Substitui: nenhum. Não substitui a taxonomia canônica nem o go-live.

## Escopo

Separar o que cada fonte governa e o que impede cobrar a Ana hoje. Não redesenha tela, não grava SKU e não publica perfil.

## Premissas

- A confirmação desta gravação não decide SKU nem produto-pai.
- Mockup de 17 páginas governa só o visual do App Cliente.
- Desk aprovado governa a operação.
- Mockup v4 é pré-estudo, sem força de produção.
- Go-live rege o que o cliente pode ver. Dedup rege a identidade. Nenhum dos dois autoriza cobrança sozinho.

## Autoridade

| Fonte | Governa | Não governa |
| --- | --- | --- |
| Mockup aprovado de 17 páginas | Visual do App Cliente: 7 abas. Página extra é estado, não aba nova | Desk, contrato, preço, dado do cliente |
| Desk aprovado | Caso, contrato, publicação, go-live | Face do cliente |
| Mockup v4 | Pré-estudo: cidadanias europeias, árvore híbrida, Familiar Conectado. Fonte, API e base mestre ficam fora do cliente | Produção |
| Série go-live | Dado vivo do caso Ana: contrato, prévia, SKU, publicações | Visual das 17 páginas |
| Dedup / Pessoa 360 | Uma pessoa, um clientes.id. Alias antigo preservado | O que a cliente vê antes de publicação |
| Estudo Lovable de rotas | Mapa do que existe e do que falta, quando o arquivo for lido | Autoridade visual ou comercial |

## Lovable hoje, contra o mockup

Registro: docs/lovable/canos-faltando.md, releitura 08/10 14:52 UTC, SHA 7699250. Sete abas na visão da Proprietária, caso Ana, em 375/768/1280. 21 combinações sem overflow. Não é login da cliente e não prova isolamento.

Conteúdo lido no Cloud nessa releitura:

- Árvore: 6 publicações G3–G7, só nome, sem vínculo de projeção.
- 1 assinatura publicada e 1 microentrega publicada.
- Nenhuma publicação de país, ramo, plano, canal ou acervo.
- Documentos ativos, liberados e recebidos: 0. Pedidos documentais ativos: 0. Zero não significa universo documental vazio.

A casca das 7 abas pode estar fiel ao mockup. O conteúdo que a Ana veria não está. O preview Corrigiu respiro das 7 abas (5ae621c, branch lovable-sync-1791476864) não entrou na main.

## Contrato — o que trava a assinatura

Produção já tem os cortes do Claude de 08/10. Nenhum grava decisão comercial.

1. SKU. O campo da Ana guarda CA-CID-AT-001 e um nome que o catálogo não emitiu. O nome vivo no feed é Consultoria e Acompanhamento de Cidadania Austríaca. Trocar é decisão da Proprietária. A tela mostra a divergência e não reescreve sozinha.
2. Produto-pai. O planejador aponta PP-03 (Pesquisa Genealógica por Ramo Familiar). O SKU está no feed sob PP-02 (Diagnóstico de Cidadania por Etapas). Qual governa a jornada é decisão da Proprietária.
3. Prévia. v1–v6 foram arquivadas porque nasceram sem corpo contratual. A única com contrato inteiro é o rascunho editável. PDF de prévia sem corpo ou defasada está travado no servidor. A regeneração continua sendo clique da Proprietária, na sessão autenticada.
4. País em três grafias: feed AT, caso austria, rota Áustria. O seletor só lê. Não unifica o cadastro.

Enquanto 1 e 2 não forem decididos, não há documento único para mandar assinar.

## Três perfis para cobrar

Fonte: docs/arquitetura/2026-10-01_FICHA-MASTER-54-CAMPOS-DE-PARA.md e auditoria de 04/09. Um caso, três titulares, um dependente.

| Pessoa | Papel | App | Estado conhecido |
| --- | --- | --- | --- |
| Ana Luiza Gomes Silveira Rodrigues | Contratante e titular principal, assinante 1 | Acesso familiar + perfil próprio | Nome curto em clientes (Ana Luiza) não batia com o nome completo; vínculo reconciliado em 02/09. Confirmar se o app usa o nome completo |
| Adair | Contratante e titular, assinante 2 | Acesso familiar + perfil próprio | Bateu por nome completo. Apelido do deck versus cadastro já tratado como apelido aprovado, não como erro |
| Alice | Contratante e titular, assinante 3 | Acesso familiar + perfil próprio | Bateu por nome completo. Login dela no app não foi aberto |
| Felipe | Dependente menor, não assina | Só o que a regra de menor liberar | Representação documentada em 07/10. O corte de hoje lê o registro vigente |

Os três perfis de cobrança são Ana, Adair e Alice. Felipe não é o terceiro assinante.

Antes de cobrar, cada titular precisa de:

- Login real, não a visão administrativa.
- Perfil com nome civil completo, papel e só o que já foi publicado para aquela pessoa.
- O mesmo contrato visível, com SKU e produto-pai já decididos.
- Nenhuma aba vazia vendida como entrega.

## Dedup e sobreposição

- Aliases históricos ficam em case_aliases. Não apagar.
- nucleo_membros e contract_parties já apontam para clientes de Ana, Adair e Alice, segundo o de-para de 02/09. Isso é vínculo interno, não perfil publicado.
- A ficha de 54 campos é narrativa do app. Não é coluna de clientes e não tem derivação automática. Sem texto curado, a aba nasce vazia.
- Go-live rege visibilidade. Dedup rege identidade. Não se substituem.

## O que não foi verificado

- PDF de 17 páginas, página a página, contra a tela ao vivo. O arquivo não estava legível nesta sessão.
- Estudo Lovable de 119 páginas. docs/lovable só tem canos-faltando.md (28.502 bytes). O Drive indexado não devolveu esse estudo.
- Login da Ana, do Adair e da Alice.
- Parcela reconfirmada no banco vivo hoje. O valor já registrado na proposta é R$ 9.600,00, três assinaturas de R$ 320, 10 meses.

## Próximos passos

1. Proprietária decide o SKU: manter o nome gravado ou aceitar o nome do catálogo.
2. Proprietária decide se a jornada segue PP-02 ou PP-03.
3. Proprietária regenera a prévia vigente e só então gera o PDF.
4. Abrir o app como Ana, como Adair e como Alice.
5. Anexar o PDF de 17 páginas e o estudo de 119 páginas se a comparação visual tiver de ser literal.

## Critério de aceite para cobrar

- Uma prévia vigente, com corpo, SKU e produto-pai decididos pela Proprietária, PDF gerado dessa prévia.
- Três logins (Ana, Adair, Alice) mostram o mesmo caso, o próprio nome completo e só o que foi publicado.
- Felipe não aparece como assinante.
- Nenhuma aba vazia é descrita como entrega já feita.

## Limites

Este documento não executa as duas decisões, não envia contrato e não cria usuário. A comparação visual contra as 17 páginas fica incompleta até o PDF aprovado estar legível nesta sessão.
