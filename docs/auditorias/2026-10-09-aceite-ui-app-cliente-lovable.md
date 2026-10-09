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
