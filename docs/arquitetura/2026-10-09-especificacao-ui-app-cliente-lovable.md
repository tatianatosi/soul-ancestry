# Especificação de implementação visual — App Cliente no Lovable

Versão v1.0 · 09/10/2026 · status: execução parcial, não homologada.

## Autoridade e limites

Decisão recente da Proprietária permite exemplos genéricos exclusivamente visuais, com selo e data-exemplo-visual, sobrepondo a proibição anterior de ilustrar vazios apenas neste rascunho. Nunca gravar, publicar, misturar com dado real no mesmo bloco ou expor Felipe/conteúdo interno. Sete abas e rotas existentes preservadas. Desk tem referência própria e está excluído.

## Registro G0

- Mockup usado: docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf, páginas 3–9. PDF renderizado e cotejado. Referência mobile complementar/kit exato não localizado.
- Imagem amostrada: cream #F5F0E8 e navy #1B2B4B; não são iguais aos tokens canônicos ativos #F0EEE9/#13294B. Não declarar correspondência pixel a pixel ou trocar globais por dedução.
- Ativos: navy #13294B, hero #1B365D, gold #C2A84D, tinta #28334A, cream #F0EEE9, branco #FFFFFF, terracota #9A3A2F. Cormorant Garamond e Montserrat; aliases locais, sem editar tokens globais.
- Assets listados: public/marca/logo-variante-1.svg, logo-variante-2.svg, logo-variante-3.svg; src/assets/clube-ancestral-logo.svg.asset.json. Lista não comprova o de-para aprovado das imagens por aba. Sem download/geração de imagens novas.
- Geometria usa ca-radius/ca-space/ca-touch-target existentes; medidas completas por elemento do PDF não concluídas.

## De-para por aba, topo ao rodapé

| Aba | Preservado | Apresentação adicionada | Dependência residual |
|---|---|---|---|
| Home | Marca, narrativa, ação, valores publicados, nav | achados/checklist/canais ilustrativos nos vazios | resumo/ação/documento prioritário reais e imagens aprovadas |
| Jornada | fontes/ordem reais, expansão, nav | linhas ancestral/processo, encontro genérico rotulado | eventos/trilhas/datas/encontros publicados; paridade dos conectores |
| Radar | seis eixos/cálculo/leitura textual | mapa/heatmap/checklist genéricos separados | origem/denominador geográfico e asset aprovado |
| Árvore | seis pessoas/gerações/vínculos reais | genograma ilustrativo separado, filtros locais/fichas | relações estruturadas publicadas; exemplo não é árvore real |
| Documentos | pedidos/recebidos/liberados/entregas e gates | checklist com quatro estados, upload/download desabilitados | arquivo autorizado e universo real para prova funcional |
| Legado | materiais reais e classificação existente | coleções genéricas individualmente marcadas | capas/recortes aprovados, acervo real categorizado |
| Conta | perfil/assinatura reais e ações existentes | plano sem preço e canais ilustrativos desabilitados | PP-03/vigência/canais aprovados; salvar/sair não testados |

## Implementação e isolamento G1/G2

Uma fonte de fixtures em exemplos-visuais-mockup.ts; apresentação em bloco-exemplo-visual.tsx. Kit usado sem editar seus defaults. CSS novo apenas sob [data-app-cliente]; não há novo root/body/tema global. Condições de renderização mantêm reais separados e substituem o exemplo quando a categoria real existe. Rotas secundárias herdam shell existente; somente Entregas foi aberta nesta prova, portanto não declarar todas completas.

## Registro factual — execução no rascunho isolado

- Caso: `a11a0000-0000-4000-8000-000000000002`; visão administrativa autorizada da Proprietária, não login da cliente.
- Revisão consultada: `02671b2c47495f28f51ac1bc33b36d1390e26ed2`. Branch observada: `edit/edt-d83d7ee3-5ae6-4cd2-98da-c9cc6f7b7127`. Commit automático não é aprovação.
- Preview do rascunho: https://id-preview-4--1a628b61-ec68-454f-85e1-671d6f297370.lovable.app. Navegação de prova no ambiente local correspondente; URL externa não submetida a smoke test.
- 43 testes existentes passaram. Última compilação automática consultada: 09/10/2026 20:42:13 UTC, build OK. Tipos/lint separados: não executados.
- 42 verificações registradas, sete abas em 375/1280 e amostras 320/768/1440, mais zoom: sem overflow global ou erro de página nos percursos executados.
- Exemplos com `data-exemplo-visual` e selo “Exemplo do layout — ainda sem dados publicados”; sem nomes reais, preços ou datas reais dentro dos exemplos. Seis pessoas reais preservadas após recarga, sem vínculos inferidos.
- Filtro do genograma ilustrativo: todos os ramos 9 nós, ramo A 5 nós. Canais/upload/download ilustrativos desabilitados: não simulam sucesso.
- Nenhuma escrita de banco, publicação de conteúdo, integração em main, envio, assinatura ou cobrança. Nenhuma edição em Desk, src/lib, testes, migrations, dependências ou tokens globais.
- G0 parcial: referência do repositório identificada, mas assets aprovados e correspondência exata ainda não resolvidos. G1 executado, isolamento verificado nas cinco superfícies visitadas. G2 parcial: sete abas trabalhadas; secundárias e estados não integralmente exercitados. G3 parcial: comparação e testes executados, pendências abaixo. G4/G5 aguardam exclusivamente a Proprietária.
- PDFs G0/G1/G2/G3: comparação referência/antes/fase; 14 capturas finais nomeadas por aba e largura. Todas as 86 páginas renderizadas e inspecionadas em seis folhas de contato: sem páginas vazias acidentais, títulos cortados ou sobreposições na paginação. As capturas de topo não substituem prova do fim; G3 inclui continuações.
- Files indisponível: mkdir/stat em /mnt/documents expiraram. Pacote preparado em área temporária; não declarar entrega no destino nem coleção atualizada até cópia bem-sucedida.


---

<!-- Registro do rascunho “App Cliente — fases 1–3 e Jornada piloto” -->

# Especificação visual — registro fases 1–3

Status: rascunho, não homologado.

Base 0c0fdf193ce9ce0774a72623df87ddc80bff3e7e; revisão CSS 2a1b7f284ed3723b9c8412bc212095fa0ab22c7e.

Reutilizar shell e raiz data-app-cliente; aliases somente nessa raiz. Sem shell paralelo, mudanças globais, dados ou Desk. Nenhuma decisão arquitetural nova: folha existente e import existente preservados.

Referências e inventários: /mnt/documents/app-fases-1-3-2026-10-09/. A especificação integral anterior não estava presente neste rascunho; não foi reconstruída por suposição. Fases futuras e gates pendentes.
## Registro do rascunho “App Cliente — homologação visual v1.0”

# Especificação UI App Cliente — rascunho isolado

Status: RASCUNHO; decisão da Proprietária PENDENTE. Data 09/10/2026 UTC. Não integrar ou publicar.

## Referências verificadas

App: PDF real de 17 páginas `clube-ancestral-mockup.pdf` nos uploads; recorte acessível em Files `kit-app-mockup-2026-10-08-v1/sete-telas-app-paginas-3-a-9.pdf`, sete páginas renderizadas e inspecionadas. Ordem Home, Jornada, Radar, Árvore, Documentos, Legado, Conta. Complemento acessível `prancha-app-cliente-mobile.png` nos uploads: prancha anterior de sete telas, não substitui o mockup nem autoriza retornar a pirâmide estática.

Desk: `prancha-visual-desk-clube-ancestral-v1_3.pdf` dos uploads, prancha separada com quinze superfícies. A versão v4/v6 exata não pôde ser autenticada pelo nome/metadata desta prancha: BLOQUEADO_POR_REFERENCIA, não usar App para dirigir Desk. Baselines de /painel, /comercial, /casos, /pesquisa e /contratos preservados em leitura.

Ambiente: Lovable, rascunho drft_01m4h1ekvzejst0zgfhzgmxgwh. URL https://id-preview-2--1a628b61-ec68-454f-85e1-671d6f297370.lovable.app. Testes no localhost:8080, sessão administrativa da Proprietária restaurada apenas nessa origem. Configuração conectada funcionou para a visão administrativa; isso não comprova isolamento do backend nem login cliente. Nenhuma credencial incluída.

## Paleta: observação literal versus autoridade vigente

Valores obtidos por amostragem dos pixels do recorte, não nova homologação de cores.

| Valor observado | Papel | Página do recorte | Token vigente usado |
|---|---|---|---|
| #1B2B4B | cabeçalho navy | 1–7 | --ca-navy #13294B |
| #F5F0E8 | fundo claro | 1–7 | --ca-cream #F0EEE9 |
| #C9A84C | progresso/conexão | 3 | --ca-gold #C2A84D |
| #FFFFFF | superfícies | 1,3–7 | --ca-surface-raised |
| tons sálvia e roxo observados | legenda e oferta | 2,6,7 | não copiados como tokens novos |

Referência literal e tokens homologados diferem. Não houve mudança global nem alegação de igualdade cromática. Cormorant Garamond em títulos, Montserrat no corpo; marca com BrandLogo canônico. Pesos usados 400/500/600, sem afirmar pesos exatos do bitmap. Raios por função: 6/8/12px já existentes, zero nas listas/faixas; não homologar 18/22px por observação. Borda 1px e sombra --ca-shadow-sm somente em itens genuinamente elevados. Intervalos 12/24px, conteúdo 16/24/32px via escala existente; medidas exatas do mockup dependem de arquivo-fonte vetorial.

## Assets reais

BrandLogo usa public/marca, variante principal definida pelo registro canônico existente, fundo navy, símbolo 40px nominal, proporção intrínseca, object-fit contain, sem recorte, centro como ponto focal; informativa, alt Clube Ancestral. Ponteiro preexistente src/assets/clube-ancestral-logo.svg.asset.json preservado, sem novo upload. Todas as imagens renderizadas carregaram. Nenhum retrato, capa, mapa, documento ou foto da Ana disponível nos componentes inspecionados; não converter imagem de referência em dado real. Detalhes dependentes: BLOQUEADO_POR_ASSET/PUBLICACAO.

## De-para topo → conteúdo → navegação

| Aba | Reproduzido | Preservado | Falta ou dependência |
|---|---|---|---|
| Home | marca, abertura, hero, faixa próxima ação, item pessoas, respiro | resumo, achados e ações dos leitores | imagem principal e resumo publicado completo |
| Jornada | título no corpo, duas linhas, marcadores, eventos sem moldura, união diferenciada | sequência real, datas e destinos existentes | fatos/local/precisão/trilhas e encontros publicados |
| Radar | gráfico em superfície, seis itens com hierarquia, desktop duas colunas | valores/eixos/fórmulas e explicação expansível | origem geográfica/heatmap; só bases reais representadas |
| Árvore | níveis espaçados, nós separados, âncora e controles locais | pessoas, gerações, filtro e privacidade | relações/ramos publicados; sem linhas inferidas |
| Documentos | títulos/estados e listas com respiro | recebido distinto de liberado, ações existentes | checklist integral, arquivos reais e thumbnails |
| Legado | abertura editorial, coleções e listas contínuas | material publicado e classificação existente | fontes, categorias explícitas, capas/acervo autorizado |
| Conta | perfil elevado, assinatura, plano separado, histórico e atendimento | nome/valor/situação publicados | PP-03 completo/vigência/canais/preferências |

Último bloco mantém distância da navegação fixa com área segura. Sete abas e destinos preservados. CSS exclusivo sob [data-app-cliente], sem :root/body/default global. PortalShell é componente exclusivo do portal, não shell do Desk; nenhuma mudança de shared BrandLogo/Button. Secundárias herdam somente acabamento do shell; sem acesso novo. Metadados, tratamento de erros e contratos de leitura das secundárias permanecem dívida registrada ao Claude.
