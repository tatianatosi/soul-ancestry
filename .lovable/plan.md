# Ficha única Ana Luiza — leitura do que existe hoje

Caso canônico `CA-CID-AT-FAM-2026-001` (id `a11a…0002`), titular `Ana Luiza Gomes Silveira Rodrigues` (cliente `a11a…0001`), responsável `Tatiana Melani Tosi`, fase `preparacao`, status `rascunho`, próxima ação "Solicitar dados cadastrais" com prazo 22/08/2026 (vencido). Nada foi criado, editado, publicado ou enviado nesta leitura.

## A. Identidade, pessoa e núcleo

| Campo | Fonte | Valor hoje | Estado | Visibilidade |
|---|---|---|---|---|
| Pessoa/cliente canônico | clientes | Ana Luiza, e-mail e telefone gravados (exibir mascarado) | confirmado | interno |
| Consentimento de contato | crm_casos | compartilhamento e liberação ao cliente = não | ausente | interno |
| Núcleo Silveira / Friedmann-Reimer | nucleo_membros | 5 pessoas ativas: Maria, Ana Luiza, Adair Jr., Alice, Felipe | relatado | interno |
| Composição 1 titular / 2 participantes / 1 dependente | nucleo_membros | os 4 adultos estão gravados com o mesmo papel "contratante_signatario"; só Felipe é dependente | divergente | interno |
| Cadastro das pessoas | nucleo_membros | todos com cadastro "pendente" | solicitado | interno |
| Fichas arquivadas | case_members | 4 registros, todos arquivados; permanecem arquivados | não aplicável | interno |
| Felipe / responsável legal | nucleo_membros | dependente sem cliente vinculado e sem representação documentada | reconciliação pendente | interno |
| Relações genealógicas | genealogical_relationships | nenhuma | ausente | — |

## B. Caso e planejador

| Campo | Fonte | Valor hoje |
|---|---|---|
| Plano / D0–D365 | case_plans | nenhum plano gravado — planejador vazio por ausência de dado |
| Próxima ação e prazo | crm_casos | "Solicitar dados cadastrais", 22/08/2026, vencida |
| Linha do tempo | case_timeline_events | 9 eventos internos: discovery 10/08, proposta 12/08, aceite verbal 13/08, confirmação formal 14/08, case service 15/08, conferência Canva, formalização, contrato e onboarding previstos (4 sem data) |
| Microentregas | ops_microentregas | 2 registros do mesmo título "Prancha 1 — Linha materna Silveira": um pendente (prazo 30/09) e um concluído em 15/09 — duplicidade a decidir |
| Consome | Hoje, Operação/Kanban, Caso 360 e Radar leem exatamente esses campos |

## C. Pesquisa genealógica

| Elo | Fonte | Valor hoje |
|---|---|---|
| Perguntas | research_hypotheses | 3 abertas, confiança baixa: linha austríaca por ascendência direta; enquadramento §58c; documentação civil da geração intermediária |
| Fontes | research_sources | 3 referenciadas, nenhuma consultada: documentos declarados pelo núcleo, catálogos austríacos, registros civis brasileiros |
| Evidência | research_evidence_items | 1: "Certidão de casamento Silveira 1912", estado coletada, confiança baixa, visibilidade "nunca" ao cliente |
| Achado | genealogical_findings | 2 registros com o mesmo título "Vínculo materno Silveira documentado", ambos em revisão, não projetados, não elegíveis ao cliente — duplicidade a decidir |
| Revisão / publicação | — | nenhuma revisão concluída; nada aprovado para o cliente |
| Semana de 17/08 | os 3 itens do gráfico são entidades diferentes (pergunta, fonte, evidência) e precisam de rótulo separado, não soma |
| Árvore | sem relação aprovada: vazio honesto é o comportamento correto |

## D. Proposta, Canva e escopo

Proposta v1 aprovada, origem Canva, páginas 1 a 7 registradas, valor R$ 9.600 (referência interna, sem cobrança). O caso repete esse valor em texto livre no campo de referência da proposta — texto técnico/preço na face interna, sinalizado, não corrigido. Escopo estruturado e exclusões: a conferir por página; o contrato ainda não tem escopo aprovado como fonte contratual. CTA de proposta hoje abre a tela interna de Formalização, não uma rota cliente-facing.

## E. Contrato, anexos, OS e financeiro

Contrato-base familiar Silveira / Friedmann-Reimer, status "pending_data", sem assinatura. Anexos: 10 registros — 6 em elaboração (autorização, estrutura familiar, cronograma financeiro, privacidade, escopo), 3 não aplicáveis, 2 ausentes (despesas externas e ordem de serviço). Nenhuma ordem de serviço, nenhuma fatura, nenhum pagamento. Definições a manter na tela: contratado só com contrato assinado; em aberto é fatura emitida e não paga; vencido é fatura em aberto após o vencimento; recebido/pagamento confirmado só com pagamento registrado. Proposta não é receita, fatura não é pagamento. Para Ana só poderiam aparecer metadados do contrato e parcelas efetivamente pagas.

## F. Portal e App Cliente

Ana não tem e-mail autorizado, acesso ao portal nem autorização por caso — nenhum registro nas três tabelas de acesso. Projeções do caso: 1 rascunho interno (resumo do caso) e 1 marco arquivado após a prova de despublicação. Resultado: as 7 abas mostram vazio canônico, que hoje é o comportamento correto.

| Aba | Conteúdo publicado | Vazio correto |
|---|---|---|
| Home | nenhum | sim |
| Jornada | nenhum marco publicado | sim |
| Radar | nenhuma projeção | sim |
| Árvore | nenhuma relação aprovada | sim |
| Documentos | nenhum documento liberado; a única evidência é interna e marcada "nunca" | sim |
| Legado | nenhum achado revisado/publicado | sim |
| Conta | contrato sem assinatura, sem parcela paga; "Ver proposta e escopo" precisa de rota cliente-facing ou vazio | ajustar destino |

## G. CTAs e provas

Comprovado: despublicar projeção sem apagar. Parcial: cadastro de lead (grava, mas sem prova formal aprovada). Só navegação: proposta, escopo, contrato, caso, pessoa, pesquisa. Bloqueado/ausente: publicar microentrega pela ficha, criar acesso da Ana, enviar link mágico, emitir fatura, registrar pagamento e assinatura.

## Prioridades

**P0 — impede o lançamento da Ana**
1. Decidir a composição real do núcleo: hoje 4 pessoas têm o mesmo papel de contratante; falta distinguir titular e participantes.
2. Resolver as duas duplicidades: microentrega "Prancha 1" e achado "Vínculo materno Silveira".
3. Definir o plano do caso e a próxima ação vigente (a atual venceu em 22/08).
4. Autorizar, quando a Proprietária decidir, o acesso da Ana e a primeira publicação — nada existe hoje.
5. Corrigir o destino do botão "Ver proposta e escopo" na Conta do cliente.

**P1 — completa o dossiê**
6. Reconciliar o dependente Felipe e o responsável legal com IDs ativos.
7. Concluir a revisão da evidência e dos achados antes de qualquer projeção.
8. Completar os anexos em elaboração e criar a ordem de serviço.
9. Tirar preço e texto técnico do campo de referência da proposta.
10. Rotular por entidade o gráfico de produção da semana de 17/08.

**P2 — evolução posterior**
11. Registrar consulta das 3 fontes e consentimento de contato.
12. Fatura, pagamento e assinatura quando houver decisão comercial.
13. Radar do App com as seis dimensões.

Nada será implementado sem sua aprovação.
