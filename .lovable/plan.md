# Caso Ana Luiza — marcos, vínculos e documentos nas telas oficiais do Desk

Nenhuma tela ou componente novo. O trabalho usa as telas que já existem: Atendimento / Caso 360 para os marcos, Pessoas e linhagens para os vínculos e Documentos do caso para os documentos. As rotas `/admin/desk/...` não existem no projeto e não serão criadas.

## 1. Vínculos da Árvore (já feito)
- Os 9 vínculos autorizados já estão registrados e liberados para a cliente.
- Ana Luiza e Adair já foram publicados na Árvore.
- O App já desenha as linhas douradas no preview, no celular e no computador.
- O site publicado ainda não recebeu essa mudança.
- Pendente: corrigir as gerações para seguirem os vínculos. Ana Maria passa a ser a geração 2; Cleusa, Lotte e Otto a 3; Rudolf a 4; Heinrich a 5. Isso só será feito se você aprovar.

## 2. Quatro marcos da Jornada
Serão publicados pelo mesmo caminho que o Desk usa ao publicar um marco da Jornada para o App:
1. 24/09/1895 — Nascimento de Franz Friedmann em Graz, Estíria (Áustria)
2. 1938–1939 — Perseguição e emigração de Viena para o Brasil
3. 1941 — Casamento e fixação no Brasil
4. 2026 — Processo de reparação histórica (§ 58c StbG)

Cada marco:
- fica registrado como autorizado por você, com data e auditoria;
- usa somente o texto acima, sem acrescentar fatos;
- pode ser despublicado depois, no próprio Desk.

Franz é parente colateral da pesquisa. Ele aparece só como texto do marco, não entra na Árvore.

## 3. Documentos
O caso da Ana não tem nenhum documento cadastrado hoje. Liberar os botões de ver e baixar exige o arquivo de verdade. Por isso:
- você envia os PDFs no Desk, no caso da Ana, pelo envio de documentos que já existe:
  - Geburtsbuch Graz 1895
  - Registro de Imigração
  - Dossiê Consular § 58c
- com os arquivos no caso, eu marco cada um como liberado para a cliente, e os botões passam a funcionar no App;
- sem arquivo, nada é criado. Um cartão sem arquivo seria um botão que não abre nada.

## 4. Conferência
- Abrir o App da Ana como administradora, em 375 e 1280 px: Jornada com os 4 marcos, Árvore com as linhas e as gerações, Documentos com os botões ativos se os arquivos já existirem.
- Rodar a checagem de tipos e os testes do App.
- Publicar o site só com a sua autorização.

## Detalhes técnicos
- Marcos: inserir em `app_projections` com `projection_type = 'jornada'`, `approval_status = 'published'` e `approved_by` = Proprietária, mais `audit_logs`. É o mesmo formato do escritor existente.
- Vínculos: `genealogical_relationships` com `client_visibility = 'aprovada'`. A leitura no App fica em `dadosVivosDoPortal` e `dadosPortalComoAdmin`, que só retornam vínculos cujas duas pontas estão publicadas.
- Gerações: atualizar `app_projections.geracao_cliente` das 6 projeções de árvore, só com aprovação.
- Documentos: `documents.liberado_cliente = true` somente em registros que já tenham arquivo no armazenamento.
