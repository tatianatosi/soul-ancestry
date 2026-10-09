# Checklist de homologação — App Cliente no Lovable

Status: rascunho; versão v1.0; decisão de aceite: **pendente**. Todos os itens começaram não executados; estados abaixo são resultados de execução, não aprovação.

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

## Aceite por aba

| ID | Aba | Composição/respiro | Cores/formas | Imagens/recortes | Estados/dados | Funcional | Evidência |
|---|---|---|---|---|---|---|---|
| A01 | Home | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 1/8, 01-home-375/1280-depois.png |
| A02 | Jornada | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 2/9, 02-jornada-375/1280-depois.png |
| A03 | Radar | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 3/10, 03-radar-375/1280-depois.png |
| A04 | Árvore | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 4/11, 04-árvore-375/1280-depois.png |
| A05 | Documentos | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 5/12, 05-documentos-375/1280-depois.png |
| A06 | Legado | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 6/13, 06-legado-375/1280-depois.png |
| A07 | Conta | bloqueado: paridade parcial | bloqueado: cotejo incompleto | bloqueado: assets | passou: reais preservados, exemplos rotulados | bloqueado: somente leitura/local | G3 páginas 7/14, 07-conta-375/1280-depois.png |

## Checklist íntegro de critérios e resultados

| ID | Critério | Resultado | Evidência / motivo |
|---|---|---|---|
| R01 | Mockup do App identificado, separado do mockup do Desk. | passou | PDF original páginas 3–9; Desk não usado como referência App. |
| R02 | Paleta/tipografia/raios vinculados à página/elemento real; sem HEX antigo imposto. | bloqueado | Tokens canônicos ativos e cores amostradas do PDF divergem; geometria não medida integralmente. |
| R03 | Imagens e logos são assets existentes no Lovable; nenhum substituto não aprovado. | bloqueado | Logos existentes listados; inventário exato das imagens aprovadas não resolvido. Esquema ilustrativo não equivale a asset aprovado. |
| R04 | Tokens/CSS locais; nenhuma alteração visual em tema global ou default compartilhado do Desk. | passou | Seletores novos sob data-app-cliente; nenhum default shared editado. |
| R05 | Comparação usa mesma sessão/caso/conteúdo; exemplo do mockup não virou dado real. | passou | Mesmo caso administrativo; exemplos adicionais marcados, fora de métricas. |
| R06 | Não houve SQL de escrita, migration, RLS ou publicação de conteúdo. | passou | Somente apresentação e evidências. |
| J01 | Jornada mantém sequência, estados e fonte da próxima ação; distinção de etapas acompanha referência. | bloqueado | Sequência real intacta; linhas ilustrativas separadas. Paridade da referência ainda parcial. |
| RA01 | Radar mantém valores/eixos reais; sem percentual fictício; gráfico e legenda legíveis nos dois tamanhos. | passou | Cálculo existente intocado; mapa/heatmap exclusivamente ilustrativos e rotulados. |
| AR01 | Árvore mantém mesmos nós, vínculos e gerações; nenhuma pessoa não publicada ou menor exposto por redesign. | passou | Seis pessoas após recarga; conexões apenas no genograma genérico separado. |
| D01 | Documentos distingue recebido de validado; nomes longos, upload, abrir e baixar sem regressão, quando já disponíveis. | bloqueado | Estados diferentes no exemplo; inexistência de arquivo liberado impede prova de download real. |
| L01 | Legado mostra somente material publicado; narrativa e capa seguem referência sem inventar acervo. | bloqueado | Real preservado; exceção autorizada de exemplos rotulados. Capas aprovadas ainda não mapeadas. |
| C01 | Conta mostra valores reais; validação, salvar e sair mantêm o comportamento. | bloqueado | Assinatura real preservada; sem escrita, logout ou validação de formulário nesta execução. |
| H01 | Home não inventa KPI/data/status; próximo passo corresponde à fonte existente. | passou | Exemplos de achados e checklist separados; métricas e próxima ação reais intocadas. |
| T01 | 14 capturas depois registradas, referência e antes correspondentes; sem exposição pública de dados privados. | bloqueado | 14 prontas em staging; Files indisponível. Não houve publicação pública. |
| T02 | Vazio honesto, loading e erro testados separadamente, sem mascarar falha de acesso como vazio. | bloqueado | Vazios visitados; erro/loading não induzidos e comparados separadamente. |
| T03 | Textos longos não cortam ações; nenhum CTA existe somente no desktop. | bloqueado | Conteúdo corrente sem overflow; casos extremos de texto longo não exercitados. |
| T04 | 320/768/1440 verificados por amostra; sem overflow global, exceto container gráfico justificado. | passou | Sete abas nas três larguras complementares, evidências registradas. |
| T05 | Último conteúdo não fica sob nav; safe-area e teclado mobile verificados. | bloqueado | Continuações capturadas; teclado físico/mobile e safe-area de dispositivo não verificados. |
| T06 | Texto a 200%, foco, teclado, labels e modal testados. | bloqueado | Zoom sem overflow e primeira tabulação; percurso completo e modais não comprovados. |
| T07 | Contraste medido: texto comum >=4,5:1, grande >=3:1; controles/gráficos relevantes >=3:1. Documentar exceção/desvio. | falhou | Texto/fundo 10,89; navy/fundo 12,52; topo 12,12; selo 6,22. Dourado/fundo 2,01: abaixo do alvo; auditoria completa pendente. |
| T08 | Cor nunca é único indicador; label/ícone preserva compreensão. | passou | Exemplos de estados e heatmap têm texto; Radar tem leitura textual existente. |
| T09 | Imagens não distorcem nem deslocam layout; focal point, alt e acesso corretos. | bloqueado | Inventário das imagens aprovadas incompleto; SVG esquemático não prova paridade. |
| T10 | Rotas secundárias já acessíveis cotejadas, sem novos acessos. | bloqueado | Entregas visitada; fases/detalhe/faturas/proposta/mensagens não integralmente testados. |
| T11 | Build/tipos/lint/testes disponíveis executados; resultado anexado, sem passou presumido. | bloqueado | 43 testes e build automático OK; tipos/lint independentes não executados. |
| T12 | Contextos de múltiplos casos não são substituídos por Ana fixa. | bloqueado | Nenhum hardcode da Ana introduzido; navegação real multicase não executada. |
| ND01 | Shell, navegação, topo e item ativo iguais ao baseline aprovado do Desk. | bloqueado | Depois de cinco telas capturado; baseline antes equivalente não disponível. |
| ND02 | Comercial e casos preservam paleta, cards, tabelas e formulários. | bloqueado | Telas visitadas sem raiz App; comparação antes/depois integral não executada. |
| ND03 | Pesquisa, contratos e demais famílias disponíveis preservam gráficos, inputs e estados. | bloqueado | Pesquisa/contratos visitados sem raiz App; demais estados não exercitados. |
| ND04 | Modal/alerta shared no Desk não herdou variante do App. | bloqueado | Nenhum default shared editado; modal/alerta não aberto. |
| ND05 | Diff explica escopo das mudanças; nenhum estilo global do App importado fora da raiz. | passou | 11 arquivos de apresentação; CSS novo escopado, zero arquivo Desk editado. |
| P01 | Preview Lovable real identificado, sem chamar preview de produção. | passou | URL do rascunho acima; prova local, não smoke externo. |
| P02 | Proprietária aprovou evidências e pendências; registrar decisão e data, não presumir. | bloqueado | Aguardando decisão. |
| P03 | Autorização específica de publicação obtida. | bloqueado | Não autorizada. |
| P04 | Após autorização, lançamento realizado no Lovable, versão/data e URL final registradas. | não executado | Publicação pendente. |
| P05 | Smoke test na URL publicada: acesso autorizado, sete abas, navegação/asset real, ações existentes, proteção de acesso e ausência de regressão do Desk. | não executado | Publicação pendente; isolamento A×B não comprovado. |
| P06 | Rollback/recuperação usa procedimento efetivamente disponível no projeto; não prometer mecanismo não verificado. | não executado | Sem integração/publicação; procedimento de produção não verificado. |

## Decisão de aceite

Pendente. Aprovadora: Proprietária. Nenhum desvio aceito automaticamente; G4/G5 não executados. Falha de autorização/privacidade, mudança indevida no Desk, exemplo como fato ou ausência de evidência impedem conformidade integral.


---

<<<<<<< /tmp/m
<!-- Registro do rascunho “App Cliente — fases 1–3 e Jornada piloto” -->

# Checklist de homologação — registro do rascunho

Status: rascunho, não homologado.

# Execução fases 1–3 — App Cliente (rascunho)

Status: execução parcial verificável; **não homologado / não publicado**. Encerramento UTC: 2026-10-09T20:10:22.996317+00:00.

## Origem e ambiente
- Rascunho `drft_01m4h3sbyfe1yvybcrj9rdpb36`, thread `thr_egbqg2391a8j`.
- Base salva de main: `0c0fdf193ce9ce0774a72623df87ddc80bff3e7e`. Revisão final disponível do CSS: `2a1b7f284ed3723b9c8412bc212095fa0ab22c7e`. Commits automáticos não são aprovação.
- Não contém automaticamente o rascunho anterior `thr_zb5ond3psp8n`; evidências anteriores não foram reutilizadas como execução deste rascunho.
- Preview real: https://id-preview-3--1a628b61-ec68-454f-85e1-671d6f297370.lovable.app . Captura executada no servidor local http://localhost:8080 do rascunho.
- Visão administrativa autorizada da Proprietária, `/app-cliente-como-pessoa?casoId=a11a0000-0000-4000-8000-000000000002`; título observado “Projeto familiar — Ana Luiza”, código fornecido CA-CID-AT-FAM-2026-001. Nenhum token em evidências.
- Não é login real da cliente, prova A×B, persistência, homologação dos dados ou publicação.

## Fase 1 — materiais e antes
**Executado:** AGENTS e memórias pertinentes lidos; referências verificadas (referencias.json); páginas 3–9 reais rasterizadas; complemento mobile e Desk identificados separadamente. Sete abas capturadas em 375/1280, 14 vistas iniciais + versões do elemento App completo. Comparativo anterior localizado, não usado como fonte de dados.
**Inventário:** logo efetivamente servido `/clube-ancestral-logo.svg` carregou nas 14 vistas; pointer e três variantes disponíveis registrados em assets.json. Nenhuma nova imagem buscada, gerada ou substituída. Não localizado asset fotográfico/mapa/acervo correspondente autorizado para preencher detalhes; bloqueios ASSET-RETRATO, ASSET-MAPA, ASSET-ACERVO, sem inventar nomes/pessoas.
**Medidas:** cores dominantes extraídas do raster de Jornada (p.4) em tokens-medidos.csv. PDF extraído tem DejaVu Sans regular/bold e Helvetica embutidos: não prova Cormorant/Montserrat no PDF. App usa famílias canônicas existentes; correspondência exata de tipografia da referência permanece **BLOQUEADO_POR_REFERÊNCIA**. Raios, bordas, sombras e espaços não foram mensurados pixel a pixel da referência: estes valores são tokens existentes usados na implementação, não falsa medição.
**Desk antes:** cinco tentativas capturadas. Parte saiu vazia/em carregamento, portanto baseline ANTES está **FALHOU / não comparável integralmente**. Preservada como evidência de limite, não como prova de não regressão.

## Fase 2 — tema e shell existentes
**Executado:** reutilizado `[data-app-cliente]` e shell/nav existentes, sem shell paralelo. Aliases medidos definidos apenas nesse ancestral; max-width local 65rem, friso/nav/cor ativa e foco ajustados. CSS integralmente escopado; nenhum :root/body/global/Desk alterado; imports intactos. 14 vistas intermediárias fase2.
**Sete abas:** Home → Jornada → Radar → Árvore → Documentos → Legado → Conta; nenhuma rota, nome, contexto ou comportamento alterado. Origem permanece transversal.
**Isolamento:** diff do produto somente portal-v11.css; nenhuma query, fórmula, reader/writer, teste, dado, dependência ou regra alterada. Navegação Desk somente leitura refeita após espera; comparação visual estrita antes/depois **BLOQUEADA pelo baseline antes**. Ausência de edição e seletor escopado são prova de isolamento de código, não prova integral de não regressão.

## Fase 3 — Jornada piloto
**Executado:** abertura editorial não enquadrada; trilhas ancestral/processo sem cards; evento real expansível com marcador/conector curto; painel Momentos de União com borda suave; espaçamento e tipografia por tokens existentes. Fontes/ordem/ações/datas/calculadores preservados.
**Conteúdo observado:** uma microentrega de 15/09/2026 (publicação, não previsão); nenhuma história ancestral/união factual disponível. Pessoas permanecem na Árvore. Sem trilha ancestral completa fictícia. Demais seis abas só recebem tema do shell, não reconstrução integral de suas composições.
**Evidência:** 14 capturas depois + 14 fim + 14 completas; antes/depois têm texto idêntico em 14/14. PDF mostra referência/antes/depois e cinco pares Desk com a limitação descrita.

## Verificação realmente executada
| Verificação | Resultado | Evidência/limite |
|---|---|---|
| 4 arquivos Vitest / 23 testes antes e depois | PASSOU | tests-before.txt, tests-after.txt |
| Build automático | PASSOU | último sinal build OK 20:06 UTC; nenhum build/typecheck manual |
| Tipos separados | NÃO REALIZADO | não há sinal distinto de typecheck nos logs disponíveis |
| Lint seletivo de shell/Jornada | FALHOU | 179 erros + 1 warning, formatação preexistente em arquivos não alterados; sem --fix/teste alterado |
| Navegação 7 abas, 375/1280 | PASSOU | visão administrativa por botões do provider, não navegação cliente real |
| Overflow 320/375/768/1280/1440 | PASSOU | 35 combinações; nenhum overflow horizontal |
| Toque >=44px em controles visíveis, 375/1280 | PASSOU | dimensões em accessibility.json; não é auditoria de todos os estados |
| Foco/teclado amostra Conta | PASSOU | outline 2px, acionamento e navegação amostrados |
| Reduced-motion | PASSOU | transição computada 0s na seta e regra local |
| Texto 200% na Jornada | PARCIAL | tamanhos computados dobrados por CSS; sem overflow, textos de navegação quebram. Não equivale a zoom nativo, nem valida sete abas |
| Último conteúdo fora da nav | PASSOU nas vistas normais | capturas fim; Radar completo também registrado |
| Contraste texto principal 12,39; secundário 5,53; ativo 5,70; ouro/navy 6,15 | PASSOU amostras | contrast.json, não auditoria integral |
| Conector dourado 2,01/3 | CORRIGIDO parcialmente | trilha Jornada usa accent ink; gráficos/decoração restantes não auditados integralmente |
| Borda suave união 1,34/3 | NÃO APLICÁVEL como decoração | informações em texto de alto contraste; não é controle ou estado único |
| Carregando/vazio/erro | PARCIAL | vazios reais vistos; não forçar falhas ou dados; estados erro/loading não exercitados |
| Desk não regressão visual integral | BLOQUEADO | antes com carga incompleta; depois capturado e navegação utilizável |
| Download documental, cliente A×B, escrita/F5 | NÃO REALIZADO | sem arquivo e fora de escopo; nada persistido para testar |

## Inventário de implementação
- Produto: `src/components/portal/portal-v11.css` apenas; diff em alteracoes.diff.
- Aliases locais medidos: navy #1B2B4B, hero #233659, gold #C9A84C, cream #F5F0E8, ink #3D444B, superfície #EFE7DD, borda #D9D1BF; accent-ink #80621E é ajuste local acessível, não cor medida.
- Tokens existentes: título Cormorant Garamond; corpo Montserrat; espaços 4/8/12/16/24/32/48/64px; raios 6/8/12/16px; sombras canônicas preservadas. Uso concreto difere por região; não se alegam medidas exatas do mockup.
- Dependências: nenhuma instalação/remoção. AGENTS/roadmap, src/lib, testes, schema/RLS, dados, preços e Desk intocados.
- Metadata de todas as rotas portal inspecionada (metadata.txt), não reescrita; eventuais lacunas preexistentes de head ficam fora deste corte visual.

## De-para topo → rodapé

### Home
Topo: manter logo, friso e contexto. Corpo: preservar narrativa, próxima ação e achados separados. Família: seis pessoas já publicadas. Rodapé: prioridades/contato dependem de publicação. Composição narrativa ainda não idêntica à referência.

### Jornada
Topo: abertura sem caixa navy, trilhas preservadas. Corpo: linha ancestral e processo em trilhas não enquadradas; evento real expansível com marcador; união em painel suave contornado; memória no fim. Nenhuma pessoa convertida em fato, data ou encontro. Só um evento real permite conector curto; timeline ancestral completa depende de publicação.

### Radar
Topo: manter seis eixos e explicação. Corpo: bases/percentuais já calculados, Lacuna quando ausente. Países/ramos sem mapa fictício. Gráfico e percentuais não foram recalculados. Cores/gráficos precisam auditoria integral de contraste futura.

### Árvore
Topo: gerações/pessoas e foco existentes. Corpo: seis nomes em G3–G7, G1 âncora, G2 lacuna. Preservar rótulos neutros. Relações/conectores individuais e ramos dependem de vínculos publicados; não desenhados.

### Documentos
Topo: documentação em lacuna. Corpo: Solicitados/Recebidos/Liberados/Entregas com ações existentes; sem arquivo para provar download. Texto de dispensa permanece dívida bloqueada por teste; ausência de solicitação não comprova dispensa. Checklist completo depende de fonte.

### Legado
Topo editorial, coleções e uma microentrega já existente. Categorias explícitas, fontes, fotos, entrevistas e arquivos ausentes bloqueiam detalhe. Não gerar capas/retratos; ícones existentes preservados. Classificação legada não homologada.

### Conta
Topo/perfil, assinatura publicada preservada R$320/mês aguardando confirmação. Plano não publicado e canais não disponíveis. Não substituir por PP-03 hardcoded nem conferir pagamento. Contrato e proposta fora das sete abas.

## Bloqueios / próximo passo sem autorização externa
- REFERENCIA-TIPOGRAFIA / medidas: mapear fonte visual exata, raios/sombras/espaços; não afirmar pixel-paridade.
- DADO-VINCULOS / ORIGEM / CHECKLIST / ACERVO / PLANO-CANAL: fontes reais dependem de Claude/Proprietária; não alterar leitores ou publicar por este rascunho.
- TESTE-DISPENSA: PEDIDO AO CLAUDE para retirar pressuposto de dispensa baseado em ausência de pedido; teste `a5-documentos-separacao-semantica.test.ts:62` preservado.
- BASELINE-DESK: antes não comparable; repetir comparação controlada em próxima janela, sem trocar main/commits por ferramenta git stateful.
- A11Y-INTEGRAL: gráficos, todos os estados, zoom nativo e navegação completa por teclado ainda não homologados.
- Fases futuras, aceite da Proprietária, integração do rascunho e publicação continuam PENDENTES. Nada publicado ou integrado. Evidências contêm dados autorizados: somente Files privados, não assets públicos do App.
=======
## Registro do rascunho “App Cliente — homologação visual v1.0”

# Aceite UI App Cliente — rascunho

Inicial: todos os itens NÃO EXECUTADO. Resultados abaixo não são aceite da Proprietária. G4/G5 permanecem PENDENTES.

| Item | Resultado | Evidência ou motivo |
|---|---|---|
| R01 | PASSOU parcialmente | App real 17 páginas/recorte 3–9 inspecionado; Desk separado, versão exata v4/v6 bloqueada |
| R02 | BLOQUEADO parcialmente | tabela literal versus tokens na especificação; pesos/raios exatos não homologados |
| R03 | PASSOU parcialmente | BrandLogo existente carregado; imagens de cliente indisponíveis, nenhuma fabricada |
| R04 | PASSOU | todos os seletores locais sob raiz App; sem shared default alterado |
| R05 | PASSOU | mesma sessão/caso, publicações textuais iguais após descontar título movido |
| R06 | PASSOU no escopo executado | nenhuma escrita backend/publicação; sem comprovar isolamento do backend |
| A01 Home | PASSOU parcial | 375/1280 topo/fim/composição; imagem/resumo completos bloqueados |
| A02 Jornada | PASSOU parcial | duas linhas, marcadores, sequência preservada; fatos/encontros ausentes |
| A03 Radar | PASSOU parcial | seis eixos, sem falso polígono; mapa/heatmap bloqueados |
| A04 Árvore | PASSOU parcial | mesmos nós/gerações, foco disponível; relações publicadas ausentes |
| A05 Documentos | BLOQUEADO | visual aplicado; frase de dispensa exige alteração de teste pelo Claude; checklist/arquivo ausentes |
| A06 Legado | PASSOU parcial | material real preservado; categorias/fontes/capas dependentes |
| A07 Conta | PASSOU parcial | assinatura existente preservada; PP-03 completo/canal dependentes |
| J01 | PASSOU parcial | sequência e próxima ação existentes preservadas, nenhum evento inventado |
| RA01 | PASSOU | números/eixos existentes intactos, não é homologação da fórmula |
| AR01 | PASSOU no escopo | sem alterar nós/vínculos/gerações/privacidade; A×B não testado |
| D01 | BLOQUEADO_POR_DADO | recebido/liberado separados; download/upload real não executado |
| L01 | PASSOU no escopo | só conteúdo já entregue pelo leitor; nenhuma publicação |
| C01 | PASSOU parcial | sem escrita casual; plano e contato ausentes |
| H01 | PASSOU parcial | fonte preservada; resumo real completo não publicado |
| T01 | PASSOU | 14 capturas depois + topo/fim/composição e referência/antes, Files autorizado |
| T02 | BLOQUEADO parcialmente | estados não simulados; Conta e faturas têm dívida de erro/ausência, PEDIDO AO CLAUDE |
| T03 | NÃO EXECUTADO integral | sem criar longos sintéticos; mobile/nav e texto existente conferidos |
| T04 | PASSOU | 320/768/1440, sete abas sem overflow global |
| T05 | PASSOU parcial | último bloco/nav/área segura capturados; teclado virtual não executado |
| T06 | PASSOU parcial | Tab e 200% Árvore; modal integral não executado |
| T07 | NÃO EXECUTADO integral | sem medição completa de todos os contrastes; não declarar WCAG |
| T08 | PASSOU parcial | estados e percentuais têm rótulos textuais; auditoria integral não executada |
| T09 | PASSOU parcial | marca carregada/alt/proporção; thumbnails reais bloqueados |
| T10 | BLOQUEADO parcialmente | sete secundárias inspecionadas no código e herdando shell; ausência de IDs/arquivos autorizados impede teste integral; não abrir acessos |
| T11 | PASSOU | 64 testes existentes; logs automáticos build OK; lint/typecheck manual não executados |
| T12 | NÃO EXECUTADO | nenhum segundo caso autorizado selecionado/criado |
| ND01 | PASSOU | /painel antes/depois sem diferença de pixels |
| ND02 | PASSOU | /comercial e /casos sem diferença de pixels |
| ND03 | PASSOU parcial | /pesquisa e /contratos sem diferença; outras famílias não executadas |
| ND04 | NÃO EXECUTADO | modal/alerta Desk compartilhado não acionado |
| ND05 | PASSOU | diff apenas portal/docs, CSS sem seletor global |

## Gates

G0 referências/assets PARCIAL/BLOQUEADO: versão Desk exata e assets/clientes ausentes. G1 isolamento visual PASSOU nas cinco amostras, não prova banco isolado. G2 sete abas PASSOU parcial/secundárias BLOQUEADAS. G3 comparação/regressão PARCIAL. G4 aceite explícito Proprietária PENDENTE. G5 publicação/smoke PENDENTE, NÃO AUTORIZADO.

Responsáveis pelos bloqueios: Claude — contratos de dados, checklist/texto/testes, erros/ausências e publicações estruturadas; Proprietária — autoridade visual de cores divergentes/Desk versão, aprovação de fontes/conteúdo e aceite deste rascunho. Lovable — finalizar QA visual após disponibilização, sem aceitar/publicar automaticamente.
>>>>>>> /tmp/d
