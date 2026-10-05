# Canos faltando — App Cliente (05/10/2026)

Elementos do mockup de 17 páginas que a tela já sabe desenhar, mas que não têm
projeção publicada (`app_projections`, destino `app`, `published`) com os campos
sanitizados necessários. A tela mostra estado vazio honesto; nada é simulado.

Publicado hoje no caso da Ana: `arvore` (6), `microentrega` (1), `assinatura` (1).

| Elemento | Aba | Projeção esperada | Campos que a tela precisa |
|---|---|---|---|
| Contexto do caso (frase narrativa) | Home | `contexto_caso` | titulo, resumo_cliente, effective_from |
| Alerta de achado | Home | `achado` | ano, tipo, titulo, resumo_cliente, pessoa_id |
| Documentos prioritários | Home / Documentos | `documento_prioritario` | titulo_cliente, pessoa_id, estado_cliente, prazo_cliente |
| Próximo passo publicado | Home / Jornada / Radar | `proxima_acao` | conteudo, data_prevista_cliente |
| Vínculo de cada pessoa na árvore | Árvore | `arvore` (já existe) | vínculo dentro de `content_sanitized` (`Nome · vínculo`) — hoje só nome |
| Lacunas / pessoas mapeadas não publicadas | Árvore | `arvore_lacuna` | geracao_cliente, rotulo_cliente |
| Genograma (relações entre nós) | Árvore | `uniao_ramos` | pessoa_id_a, pessoa_id_b, tipo_vinculo_cliente |
| Países da sua origem (heatmap) | Radar | `origem_pais` | pais, ramo (materno/paterno), intensidade 0–100, fonte_cliente |
| Rituais diários dos ancestrais | Jornada (Linha Ancestral) | `linha_tempo` | ano, local, titulo, narrativa_cliente, pessoa_id |
| Andamento por trilha Origem → Cidadania → Memória | Jornada | `marco` | trilha, titulo, data_publicacao |
| Checklist / recebidos / pendentes / em conferência / originais liberados | Documentos | `documents` liberados + `documento_checklist` | titulo_cliente, estado_cliente (4 estados), pessoa, data |
| Descobertas interpretadas e biblioteca de fontes contextualizadas | Documentos / Legado | `achado`, `fonte_contextualizada` | titulo, resumo_cliente, tipo_documento, ano |
| Narrativas, acervo, entrevistas, entregas de memória | Legado | `narrativa`, `acervo`, `entrevista` | titulo, resumo_cliente, tipo, data, link_cliente |
| Membros conectados e visibilidade | Conta | `membro_conta` | nome_cliente, papel_cliente, visibilidade |
| Upsell com preço | Conta | `oferta_continuidade` | titulo, descricao_cliente, preco_cliente, periodicidade |
| Plano sanitizado ("Áustria Provisória") | Conta | `plano` | nome, situacao, vigencia |

Contrato e proposta não entram no App (assinatura pelo portal); `/portal/proposta`
e `/portal/faturas` não aparecem na barra nem em links das sete abas.
