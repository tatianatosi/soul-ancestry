# Canos faltando — App Cliente (06/10/2026)

Elementos do mockup que ainda não têm projeção publicada com os campos sanitizados necessários. O App mostra somente conteúdo liberado ou um estado vazio honesto.

Publicado hoje no caso da Ana: `arvore` (6), `microentrega` (1), `assinatura` (1). Há também um `resumo_caso` em rascunho, que não pode ser mostrado.

| Elemento | Aba | Projeção esperada | Campos sanitizados necessários | Estado atual no App |
|---|---|---|---|---|
| Contexto do caso | Home | `contexto_caso` | titulo, resumo_cliente, effective_from | Não publicado; aparece apenas o título autorizado do caso. |
| Alerta de achado | Home | `achado` | ano, tipo, titulo, resumo_cliente, pessoa_id | Não publicado; a área mantém vazio específico. |
| Documentos prioritários | Home / Documentos | `documento_prioritario` | titulo_cliente, pessoa_id, estado_cliente, prazo_cliente | Não publicado; pedidos existentes não são tratados como prioridade. |
| Próximo passo | Home / Jornada / Radar | `proxima_acao` | conteudo, data_prevista_cliente | Não publicado; as três telas mantêm vazio coordenado. |
| Vínculo de cada pessoa | Árvore | `arvore` | vínculo em `content_sanitized`, pessoa_id, geracao_cliente | Seis nomes e gerações publicados; vínculo ainda ausente. |
| Lacunas e pessoas mapeadas | Árvore | `arvore_lacuna` | geracao_cliente, rotulo_cliente | Não publicado; o App não inventa posições ou nomes. |
| Genograma | Árvore | `uniao_ramos` | pessoa_id_a, pessoa_id_b, tipo_vinculo_cliente | Não publicado; nenhum conector pessoa a pessoa é simulado. |
| Países da sua origem | Radar | `origem_pais` | pais, ramo, intensidade, fonte_cliente | Não publicado; heatmap não é renderizado. |
| Linha Ancestral | Jornada | `linha_tempo` | ano, local, titulo, narrativa_cliente, pessoa_id | Não publicada; há vazio próprio na linha histórica. |
| Trilhas Origem → Cidadania → Memória | Jornada | `marco` | trilha, titulo, data_publicacao | Não publicadas; Processo e Memória mantêm estados honestos. |
| Checklist e quatro estados | Documentos | `documento_checklist` | titulo_cliente, estado_cliente, pessoa, data | Lista completa não publicada; não há contagem N de M. |
| Originais liberados | Documentos | `documents` | titulo_cliente, arquivo liberado, data | Nenhum documento liberado; download não aparece. |
| Descobertas interpretadas | Documentos / Legado | `achado` | titulo, resumo_cliente, tipo_documento, ano | Não publicadas. |
| Bases e fontes contextualizadas | Documentos / Legado | `fonte_contextualizada` | titulo_cliente, contexto_cliente, tipo, ano | Não publicadas; nomes técnicos de fontes não aparecem. |
| Narrativas e memória | Legado | `narrativa` | titulo, resumo_cliente, data, link_cliente | Não publicadas. |
| Acervo | Legado | `acervo` | titulo, resumo_cliente, tipo, data, link_cliente | Não publicado. |
| Entrevistas | Legado | `entrevista` | titulo, resumo_cliente, data, link_cliente | Não publicadas. |
| Membros conectados | Conta | `membro_conta` | nome_cliente, papel_cliente, visibilidade | Não publicados; a Conta não lista membros. |
| Canal da equipe | Conta | `canal_contato` | rotulo, destino_cliente, disponibilidade | Não publicado; nenhuma ação de contato falsa é criada. |
| Preferências de aviso | Conta | `preferencias_aviso` | canal, ativo, rotulo_cliente | Não publicadas. |
| Privacidade | Conta | `privacidade_conta` | titulo, resumo_cliente, vigencia | Não publicada. |
| Continuidade com preço | Conta | `oferta_continuidade` | titulo, descricao_cliente, preco_cliente, periodicidade | Não publicada; a oferta não aparece. |
| Plano sanitizado | Conta | `plano` | nome, situacao, vigencia | Não publicado; a assinatura publicada continua separada. |

Contrato e proposta não entram no App. `/portal/proposta` e `/portal/faturas` não aparecem na barra nem em links das sete abas.
