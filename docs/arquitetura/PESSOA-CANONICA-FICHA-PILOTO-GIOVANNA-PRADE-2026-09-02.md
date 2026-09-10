# Anexo — Ficha do Caso Real Piloto: Giovanna da Veiga Prade

**Fonte:** planilha `clube_ancestral_ficha_caso_real_piloto_Giovanna_Veiga_Prade.xlsx`, enviada pela proprietária em 02/09/2026.

**Natureza:** ficha padrão de preenchimento do primeiro caso real do App Cliente mobile-first — 3 abas: `Caso_Piloto` (54 campos, input/output por tela/bloco), `Referencias` (mapa tela→bloco→uso), `Instrucoes` (regras de preenchimento).

Reproduzida aqui na íntegra, sem edição de conteúdo, para servir de evidência ao estudo de Pessoa Canônica / Pessoa 360. Ver cruzamento com o restante do estudo em `PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`, seção 1.2.

---


## Aba Caso_Piloto — seção: metadados

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 1 | geral | ID do caso | texto_curto | sim | CA-CID-IT-2026-001 | usar identificador único |
| 2 | geral | Nome do caso | texto_curto | sim | Caso Giovanna Prade — linha paterna Prade | nome para uso interno |
| 3 | geral | Nome do cliente | texto_curto | sim | Giovanna da Veiga Prade | pode anonimizar no piloto |
| 4 | geral | Status do caso | lista | sim | em leitura | status resumido |

## Aba Caso_Piloto — seção: home

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 5 | Home > Painel inicial | Rota provável | texto_curto | sim | Itália | vai para card principal |
| 6 | Home > Painel inicial | Documento foco | texto_curto | sim | Ato de nascimento italiano de Alessandro Prade | vai para card principal |
| 7 | Home > Painel inicial | Etapa atual do caso | texto_curto | sim | linha Prade mapeada; origem italiana em validação | resumo da etapa |
| 8 | Home > Contexto | Resumo do caso | texto_longo | sim | A linha paterna Prade foi mapeada até Alessandro Prade e Margherita Maiocchi. Registros de referência identificam Erwin Prade, avô paterno, nascido em Rodeio/SC em 1917. O próximo passo é validar a cadeia documental e localizar o ato italiano de Alessandro. | texto principal do contexto |
| 9 | Home > Contexto | Hipótese principal | texto_medio | sim | Há forte aderência à cidadania italiana pelo ramo paterno Prade, mas a origem de Alessandro e o eventual registro consular da cliente ainda exigem prova documental. | aparece no contexto |
| 10 | Home > Contexto | Trilha origem | texto_medio | sim | A árvore paterna alcançou Alessandro Prade e Margherita Maiocchi; agora a pesquisa busca comprovar local de origem e rota migratória. | bullet/contexto |
| 11 | Home > Contexto | Trilha cidadania | texto_medio | sim | A prioridade é confirmar registros na Comune e no Consulado e validar, documento a documento, a linha Alessandro → Erwin → Péricles → Giovanna. | bullet/contexto |
| 12 | Home > Contexto | Trilha memória | texto_medio | sim | O ramo Prade revela uma família ampla em Santa Catarina e abre caminho para reconstruir a história ancestral além do passaporte. | bullet/contexto |
| 13 | Home > Heatmap | País 1 | texto_curto | sim | Itália | usar top aderência |
| 14 | Home > Heatmap | Aderência país 1 | numero_pct | sim | 88 | sem % no preenchimento |
| 15 | Home > Heatmap | País 2 | texto_curto | não | deixar vazio | opcional |
| 16 | Home > Heatmap | Aderência país 2 | numero_pct | não | deixar vazio | opcional |
| 17 | Home > Heatmap | País 3 | texto_curto | não | deixar vazio | opcional |
| 18 | Home > Heatmap | Aderência país 3 | numero_pct | não | deixar vazio | opcional |
| 19 | Home > Genograma | Pessoa central 1 | texto_curto | sim | Alessandro Prade — bisavô paterno e elo de origem | bloco familiar |
| 20 | Home > Genograma | Pessoa central 2 | texto_curto | não | Erwin Prade — avô paterno, registro localizado | bloco familiar |
| 21 | Home > Genograma | Pessoa central 3 | texto_curto | não | Péricles Luiz Medeiros Prade — pai e elo geracional | bloco familiar |
| 22 | Home > Árvore dinâmica | Conexão-chave | texto_medio | sim | A linha paterna foi conectada de Giovanna até Alessandro Prade por meio de Péricles e Erwin Prade. | card árvore |
| 23 | Home > Árvore dinâmica | Conexão territorial | texto_medio | sim | Rodeio e Timbó, em Santa Catarina, concentram registros de Erwin Prade; a origem italiana de Alessandro segue em validação. | card árvore |
| 24 | Home > Árvore dinâmica | Lacuna crítica | texto_medio | sim | Faltam o ato italiano de Alessandro Prade e os documentos civis que comprovem integralmente a transmissão até Giovanna. | card árvore |
| 25 | Home > Aviso importante | Título do alerta | texto_curto | sim | Um novo ramo da sua história foi conectado | alerta de engajamento |
| 26 | Home > Aviso importante | Texto do alerta | texto_longo | sim | Localizamos referências para seu avô Erwin Prade e conectamos seus pais, Alessandro Prade e Margherita Maiocchi. Agora vamos validar os documentos que ligam essa história à sua rota italiana. | mensagem de engajamento |
| 27 | Home > Documentos | Documento principal | texto_curto | sim | Diagnóstico Inicial — Linha Prade | nome do arquivo lógico |
| 28 | Home > Documentos | Pendência principal | texto_curto | sim | Ato de nascimento italiano de Alessandro Prade | item faltante |
| 29 | Home > Documentos | Status documental | texto_curto | sim | 3 referências-chave localizadas; certidões oficiais pendentes | resumo operacional |

## Aba Caso_Piloto — seção: origem

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 30 | Origem | Pessoas conectadas | numero_int | sim | 26 | contagem |
| 31 | Origem | Gerações lidas | numero_int | sim | 4 | contagem |
| 32 | Origem | Base externa 1 | url | não | https://www.familysearch.org/pt/tree/person/LBK7-D99 | link consultado |
| 33 | Origem | Base externa 2 | url | não | https://www.familysearch.org/pt/tree/person/LBK7-47N | link consultado |
| 34 | Origem | Base externa 3 | url | não | https://www.familysearch.org/pt/tree/person/LBK7-CT5 | link consultado |
| 35 | Origem > Radar | Resumo do radar | texto_longo | sim | A Itália lidera com aderência alta pelo ramo Prade e pelos registros familiares já conectados. A confirmação depende do ato italiano de Alessandro e da validação da cadeia documental brasileira. | texto de apoio |
| 36 | Origem > Árvore completa | Resumo da árvore | texto_longo | sim | A árvore cobre quatro gerações da linha direta — Giovanna, Péricles, Erwin e Alessandro — e inclui Margherita Maiocchi, Áurea Medeiros, a linha materna e ramos colaterais relevantes para pesquisa. | resumo visual |

## Aba Caso_Piloto — seção: jornada

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 37 | Jornada | Linha ancestral | texto_medio | sim | Erwin Prade, nascido em Rodeio/SC em 1917, foi conectado a Alessandro Prade e Margherita Maiocchi. | timeline |
| 38 | Jornada | Linha do cliente | texto_medio | sim | O caso entrou pelo WhatsApp com o objetivo de entender a possibilidade de cidadania e reconstruir a história familiar. | timeline |
| 39 | Jornada | Interseção 1 | texto_medio | sim | A identificação de Erwin conecta a memória familiar à primeira trilha documental verificável da linha Prade. | timeline |
| 40 | Jornada | Interseção 2 | texto_medio | não | A localização do ato italiano de Alessandro deve definir se a rota documental seguirá pela Comune, Consulado ou outra via aplicável. | timeline |

## Aba Caso_Piloto — seção: descobertas

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 41 | Descobertas | Achado 1 | texto_medio | sim | A linha paterna alcançou Alessandro Prade e Margherita Maiocchi, bisavós paternos de Giovanna. | biblioteca |
| 42 | Descobertas | Achado 2 | texto_medio | não | Erwin Prade foi localizado com nascimento em 16/08/1917, em Rodeio/SC, e batismo em 19/08/1917 na Paróquia de São Francisco de Assis. | biblioteca |
| 43 | Descobertas | Entregável | texto_curto | sim | Mapa de linha ancestral Prade e checklist documental inicial | biblioteca |

## Aba Caso_Piloto — seção: conta

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 44 | Conta | Produto atual | texto_curto | sim | Diagnóstico inicial gratuito | conta |
| 45 | Conta | Status da jornada | texto_curto | sim | origem em análise; linha Prade mapeada; documentos oficiais pendentes | conta |
| 46 | Conta | Última atualização | texto_curto | sim | Erwin Prade foi conectado a Alessandro Prade e Margherita Maiocchi | conta |
| 47 | Conta > Histórico | Marco 1 | texto_medio | sim | Caso criado a partir do contato via WhatsApp e da busca por cidadania italiana. | histórico |
| 48 | Conta > Histórico | Marco 2 | texto_medio | sim | Árvore paterna expandida até Alessandro Prade e Margherita Maiocchi com referências FamilySearch. | histórico |
| 49 | Conta > Histórico | Marco 3 | texto_medio | não | Próxima etapa: validar atos civis e eclesiásticos e verificar registros na Comune e no Consulado. | histórico |
| 50 | Conta > Upgrade | Texto do upgrade | texto_longo | sim | Quando a cadeia documental estiver validada, a próxima etapa poderá organizar a busca de certidões, a estratégia de rota e as ações necessárias para o processo. | upgrade |

## Aba Caso_Piloto — seção: anexos

| # | Tela/bloco | Campo | Tipo | Obrigatório | Valor preenchido | Observações |
|---|---|---|---|---|---|---|
| 51 | geral | Pasta principal de documentos | url | não | deixar vazio até criar/vincular a pasta oficial da cliente | pasta principal |
| 52 | geral | Pasta de imagens do caso | url | não | deixar vazio até criar/vincular pasta de scans e fotos | fotos, scans |
| 53 | geral | Links de fontes extras | lista_urls | não | https://www.familysearch.org/pt/tree/person/GZ1D-YYB | links auxiliares |
| 54 | geral | Regra de input/output | texto_longo | sim | Input registra dados brutos, nomes, datas, links e anexos. Output traduz apenas fatos já localizados em linguagem clara para a cliente. Toda origem italiana, elegibilidade e rota de cidadania deve aparecer como “em validação” até confirmação por documento oficial. | governança do caso |

---

## Aba Referencias — mapa de telas e uso dos dados

| Tela | Bloco | Campos principais | Uso no app |
|---|---|---|---|
| Home | Painel inicial | rota provável, documento foco, etapa atual | prova de valor imediata |
| Home | Contexto | resumo, hipótese, trilhas | explicar leitura do caso |
| Home | Heatmap | países e aderência | mostrar rota principal |
| Home | Genograma/Árvore | pessoas centrais, conexão, lacuna | valor genealógico visual |
| Home | Aviso importante | título e texto do alerta | engajamento recorrente |
| Home | Documentos | documento principal, pendência, status | ação prioritária |
| Origem | Radar e bases | pessoas conectadas, gerações, links externos | profundidade de pesquisa |
| Jornada | Linha do tempo dupla viva | linha ancestral, linha do cliente, interseções | narrativa viva do caso |
| Descobertas | Biblioteca | achados e entregável | consulta de valor |
| Conta | Histórico e upgrade | status, histórico, upgrade | continuidade comercial |

---

## Aba Instrucoes — regras de preenchimento (texto original)

- Ficha padrão do caso real — piloto Fase 1
- Use esta planilha como base única para preencher os dados do primeiro caso real do app cliente mobile-first.
- Fluxo recomendado: preencher input bruto, consolidar links/anexos e depois redigir o output resumido que vai aparecer no app.
- Regras rápidas
- • Input = informação bruta, link, nome de documento, contagem, fonte externa, observação operacional.
- • Output = texto já limpo para aparecer no app do cliente.
- • Campos obrigatórios marcados com "sim" devem ser preenchidos primeiro.
- • Percentuais do heatmap devem ser digitados sem o símbolo %.
- • Links devem ser completos, começando com https://.
- • Anexos podem ficar em Drive, Dropbox ou pasta equivalente; use o link principal no campo apropriado.
- • Se houver sigilo, anonimizar o nome do cliente e manter o ID do caso estável.
