# Revisão visual da prancha — paridade e experiência de Origem

Status: em revisão  
Versão: v1.1  
Data: 2026-10-07  
Responsável pela decisão: Proprietária do Clube Ancestral

## Fonte e limites

Revisão da Proprietária às 19:56 UTC, baseada nas pranchas `prancha-375-v2-1-2.jpg` e `prancha-375-v2-5.jpg`, no mockup de 17 páginas, no histórico e no resgate `eb3d89e9-da6f-48c9-a12c-07f59d1209d0-3.md`. As imagens citadas não comprovam estado do código atual, reversão, contraste medido ou operação no navegador. Não restaurar lógica antiga pela imagem. PP-03 e preços permanecem; sete abas, sem publicação.

## Direção vinculante

Manter marca, serif, fundo claro e tokens existentes. Navy orienta, dourado destaca conexão/ação. Melhorar hierarquia, respiro e formatos, não apenas arredondar ou pintar cartões. Não usar caixa dentro de caixa nem sucessão de placeholders. Preservar local útil da função com ausência compacta e pedido ao Claude. Sem fotos, mapas, acervo, parentescos ou dados simulados.

Origem é função distribuída, não oitava aba: família/relações/lacunas na Árvore; países/ramos históricos no Radar; fatos, migrações e hábitos documentados na Jornada; fontes, originais, entrevistas e memória em Documentos/Legado; síntese na Home. Relação interna não vira confirmada por desenho. Heatmap depende de métrica publicada, nunca sangue, chance ou nacionalidade inferida.

## Sequência de cortes

1. Home, Árvore e Radar no mesmo caso e conteúdo: pessoa não é achado; nomes nas gerações reais; sem pirâmide anônima nem barra fictícia. Cálculos e leitores do Claude preservados.
2. Depois do aceite: Jornada, Documentos, Legado e Conta. Não afirmar ritmo em dia sem sinal nem ausência de necessidade documental pela falta de pedido. Conta consome PP-03 da publicação vigente; nome antigo exige reconciliação, não substituição hardcoded ou mudança de preço.

## Matriz de composição, fonte e distância

| Aba / referência | Composição neste corte | Fonte / CTA | Distância restante |
|---|---|---|---|
| Home / mockup página 1 | Hero navy existente; próximo passo em faixa, família em seção própria, achado editorial; vazios sem cartões sucessivos | Leitores existentes; Árvore, Jornada, Documentos, Conta | Resumo, prioridade, próxima ação e canal publicados ausentes; nenhuma nova publicação |
| Árvore / mockup página 4 | Faixas de geração com pessoa expansível; G1 âncora, G4 neutro; sem leques inferindo relações | `pessoasDaArvore`, geração publicada, notas existentes; expansão da pessoa e Jornada | Genograma, ramos e vínculos reais não chegam; não declarar árvore relacional concluída |
| Radar / mockup página 3 | Gráfico sem caixa, maior; seis resumos por linha; cálculo em expansão; Origem reservada compactamente | `radarSeisDimensoes` intacto; abrir Como calculamos | Checklist integral, países/ramos e métrica geográfica faltam; Conexões 6/10 não comprova coerência entre universos |
| Jornada | Corte posterior | Eventos/marcos publicados | Pessoas como Passado, classificação/trilhas e datas exigem reconciliação |
| Documentos | Corte posterior | Universo/checklist/estados/arquivos autorizados | Recebidos não equivale a em conferência; falta de pedido não prova dispensa |
| Legado | Corte posterior | Categoria editorial explícita e artefato liberado | Não deduzir coleção por regex |
| Conta | Corte posterior | Assinatura vigente, canal, acesso e preferências | PP-03 deve vir da fonte publicada sem alteração de preço; ação persistente depende do Claude |

## Registro de execução — primeiro corte

SHA-base: `5b6f64a8888c6da032e6a12497af17f3ddc434f9`. Capturas antes e depois identificadas separadamente; não podem ter o mesmo SHA, pois o código mudou. A mesma base de conteúdo da Ana foi conferida em ambos: seis pessoas, microentrega, sem achado, checklist ou canal publicados. Nenhum dado foi escrito.

Arquivos do produto: `src/routes/portal/index.tsx`, `src/routes/portal/arvore.tsx`, `src/routes/portal/radar.tsx`, `src/components/portal/radar-seis-eixos.tsx`. Sem biblioteca, teste, Desk, writer, migration, RLS ou dependência alterados.

Tokens reutilizados: `navy`, `navy-800`, `cream`, `gold`, `border`, `card`, `terracotta` e acento `plum` já existente; `font-serif` e fonte de corpo vigentes. Nenhum valor de cor ou fonte novo.

Testes existentes: 56 casos distintos passaram entre os conjuntos executados (33 no primeiro conjunto; 27 no segundo, com 4 repetidos). Compilação da plataforma OK. Navegação administrativa autenticada em 375×1800, 768×1800 e 1280×1800, nove superfícies por estado; sem overflow de documento ou erro JavaScript. Isto não é prova de login cliente, isolamento, escrita/releitura ou publicação.

As dependências de conteúdo permanecem em `docs/lovable/canos-faltando.md`. Paridade completa e genograma NÃO concluídos. Parar neste corte antes das demais abas e aguardar avaliação da Proprietária.