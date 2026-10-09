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
