# Novas pranchas visuais: App Cliente e Desk, conferidas contra a prancha original

Objetivo: mostrar como as telas ficaram hoje, com dados reais do piloto, em duas pranchas novas — primeiro o App Cliente (como o cliente vê), depois o Desk — e comparar cada prancha com a prancha original v3, elemento por elemento.

Nada de código de produto, banco, publicação, convite ou envio nesta rodada. Só captura de tela e material visual.

## Etapa 1 — Prancha do App Cliente (desktop e celular)

- Abrir a prévia autenticada e capturar as sete abas do App: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
- Duas capturas por aba: desktop (1440 px) e celular (375 px), sempre a primeira dobra e, quando houver, a área de estado vazio.
- Montar `02-prancha-app-cliente-v4.pdf`: capa com marca, uma página por aba com as duas larguras lado a lado, legenda curta dizendo o que está preenchido e o que está vazio por falta de conteúdo publicado.
- Conferir página a página em imagem antes de entregar: sem corte de texto, sem sobreposição, sem barra lateral interna aparecendo no App.

## Etapa 2 — Conferência do App contra a prancha original

- Tabela por aba: elemento previsto na prancha v3 · presente hoje · diferença · o que falta para ficar igual.
- Marcar como "aguardando conteúdo" o que só está vazio por não haver publicação aprovada, e como "diferença visual" o que existe mas está diferente do desenho.

## Etapa 3 — Prancha do Desk (depois do App alinhado)

- Capturar as superfícies do Desk go-live em desktop e 375 px: Hoje, Comercial, Leads, Kanban, Caso 360, Pessoa 360, Pessoas & Famílias, Pesquisa/Biblioteca, Radar, Jurídico & Financeiro, Portal/Configuração e o espelho interno do App.
- Montar `03-prancha-desk-v6.pdf` no mesmo padrão de capa, página por superfície e legenda.
- Incluir as telas novas do Comercial desta rodada: roteiro de atendimento, gráficos de situação da call e resultado do Discovery, e o quadro de próximas ações por prazo.

## Etapa 4 — Conferência do Desk contra a prancha original

- Mesma tabela de comparação, agrupada pelos seis grupos do Desk, apontando elemento faltante, elemento a mais e diferença de leitura.
- Fechar com uma lista curta e priorizada do que ainda não bate com a prancha.

## Entrega

- `02-prancha-app-cliente-v4.pdf`, `03-prancha-desk-v6.pdf` e as duas tabelas de conferência, em Arquivos.
- Parar para sua revisão antes de qualquer ajuste de tela.

## Detalhes técnicos

- Capturas por Playwright em `localhost:8080` com a sessão de equipe; App visto pelo espelho interno em `/golive/app` e rotas `/golive/*` para o Desk.
- PDFs gerados por script em `/tmp`, salvos em `/mnt/documents`; QA por conversão de cada página em imagem.
- Sem migration, RLS, escrita, publicação, convite, link mágico ou deploy.
- Registros marcados como demo/teste continuam fora do recorte, como já acontece no shell de go-live.
