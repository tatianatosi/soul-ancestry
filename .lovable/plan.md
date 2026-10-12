# App Cliente — paridade com o mockup (caso Ana Luiza)

O trabalho fica só nas 7 abas que já existem. Nada de aba, tela ou dado novo.

## O que será feito agora

**Geral**
- Barra do celular: as 7 abas com toque de 44 px e "Jornada" em uma linha já estão no preview. Será conferido de novo nas capturas.
- Cores e letras: manter os tokens de 16/09 (azul-marinho, dourado, creme, tinta; Cormorant e Montserrat). Ajustar só o que estiver fora deles.

**Home**
- Tirar as caixas de "Exemplo do layout".
- O "Núcleo familiar" passa a mostrar as pessoas já publicadas na Árvore (as 8 da família Friedmann-Reimer e Silveira), em vez do aviso de ausência.
- O cartão de Próxima Ação ganha acabamento editorial, sem texto novo inventado.
- Os "3 achados" aparecem só quando houver achados publicados. Hoje não há nenhum, então o espaço fica com um texto acolhedor curto.

**Jornada**
- Manter a Linha Dupla, que já existe: Linha Ancestral com 1895, 1938 e 1941, e Linha do Processo com 2026.
- Trocar o título genérico "Linha do tempo" por "Marco da história".
- Diminuir os vazios entre as duas linhas para a leitura ficar compacta.

**Árvore**
- Moldura editorial com fundo suave envolvendo as gerações e as ligações.
- Moldura dourada forte para Ana Luiza (Você), Lotte e Otto. Os demais ficam com borda neutra, para o destaque aparecer de verdade.
- As linhas douradas dos 9 vínculos continuam.

**Documentos**
- Juntar as seções repetidas de ausência num único "Cofre da família", com duas áreas:
  - "Acervo liberado": aparece vazia até haver arquivo.
  - "Em busca / em análise": mostra só os pedidos reais que estão abertos.
- A frase contraditória sobre dispensa de documentos está travada por um teste do Claude. Ela continua como pedido ao Claude.

**Radar**
- A teia passa a ocupar cerca de 70% do cartão, com menos espaço vazio.
- Onde não há base de cálculo, entra uma pílula editorial ("Em pesquisa") no lugar de "Lacuna". Nenhum percentual inventado.

**Legado**
- Sem mudança: prateleiras e aviso legal mantidos.

**Conta**
- O nome de demonstração já só existe na demonstração oficial.
- Titular, código do caso e assinatura de R$ 320 (prevista) já aparecem.
- Tirar o quadro "Exemplo do layout" de "Meu plano".

## O que fica bloqueado (sem dado ou fonte)
- **Documentos com botões ativos:** o caso não tem nenhum arquivo. Os botões aparecem quando os PDFs forem enviados e liberados no Desk.
- **Novos textos da Jornada:** "perseguição nazista", "chegada ao Rio de Janeiro" e "Submissão do processo" mudam os marcos que você aprovou há pouco. O processo de 2026 ainda não foi registrado como submetido. Só altero com a sua confirmação do texto exato.
- **"3 assinaturas familiares ativas":** a cobrança está registrada como prevista e aguardando confirmação. Continua aparecendo como "prevista" até a confirmação.
- **Botão do WhatsApp:** falta o número oficial da especialista.
- **Percentuais do Radar em Documentação e Origem:** não há base de cálculo registrada.

## Conferência
- Capturas completas das 7 abas em 375 px e 1280 px, como administradora.
- Checagem de tipos e testes do App.
- Publicar o site só com a sua autorização.

## Detalhes técnicos
- Arquivos: `src/routes/portal/{index,jornada,radar,documentos,conta}.tsx`, `src/components/portal/explorador-arvore.tsx` e `portal-v11.css`.
- Home, núcleo: ler `pessoasDaArvore(vivo.projecoes)` (fonte já sanitizada), sem consulta nova.
- Árvore: destaque = titular (G1) mais o casal que tem filiação direta com a mãe ou o pai da titular e um vínculo `conjuge` entre si (Lotte e Otto), calculado pelos vínculos e não por nome. O destaque amplo dos outros ascendentes sai.
- Documentos: só agrupamento visual. As fontes `documents.liberado_cliente` e `portal_document_requests` ficam como estão.
- Sem mudança de schema, permissões ou dados.
