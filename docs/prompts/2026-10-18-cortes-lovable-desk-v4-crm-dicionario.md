# Propostas e cortes para o Lovable — CRM Mestre é dicionário

Status: rascunho  
Versão: v1.0  
Data: 2026-10-18  
Responsável pela decisão: Proprietária do Clube Ancestral  
Fonte(s) de evidência: determinação da Proprietária nesta mensagem; de-para-completo-91-telas-e-jornada-2026-10-18.pdf, pp. 2–10; de-para-desk-v4-revisado-2026-10-18.pdf; mapa-rotas-desk-v4-2026-10-18.mmd; desk-vivo-v3-jornada-guiada-2026-10-18.pdf (versão disponível com 18 páginas, relida nesta rodada); leituras anteriores de código nesta conversa, sem nova certificação de estado atual.

Escopo: corrigir propostas/documentação, organizar cortes de UX/navegação e separar mudanças de lógica. Preparação para encaminhamento ao Lovable, sem executar mudanças remotas.

Premissas: /crm-mestre era e permanece dicionário/referência CA04; não é CRM de atendimento nem banco alternativo de leads. /leads é CRM Vivo; /calls é Mesa de Discovery; Caso360 dá visão geral da vida do caso e abre controles especializados; Pessoa360 trata identidade/vínculos. Nenhum acesso ou dado pode ser removido por mera semelhança de tela.

Limites: propostas não são aprovação de implementação. Não foram exercitados writers, banco ativo ou sessão autenticada nesta emissão. Números de snapshots não se tornam contadores atuais. Diagramas não demonstram integração. Nenhuma sessão externa de agente foi iniciada.

Substitui: nomenclatura equivocada de “CRM Vivo /crm-mestre” nos mapas recentes; não substitui decisões da Proprietária sobre primeiro nível do menu.

Destino preparado para repositório: docs/prompts/2026-10-18-cortes-lovable-desk-v4-crm-dicionario.md. Não publicado no GitHub/Drive nesta emissão.

Próximos passos: revisar L00 e priorizar L01; conferir dependências no código corrente; apresentar diff de cada corte, aprovar implementação específica, executar testes e retornar resultados por item.

Critério de aceite geral: preservar entidade/IDs/versão, abrir destino correto, não perder edição, mostrar erro versus vazio, salvar/reler/recarga quando houver escrita; capturas 375/1280 com ambiente e SHA; nenhuma declaração de lançamento integral por render/build.

## 1. Correção de autoridade para todos os materiais

Trocar “CRM Vivo (/crm-mestre) — ficha completa do lead” por “Dicionário CA04 (/crm-mestre) — referência e listas de apoio”. A ficha operacional permanece em /leads; a Mesa em /calls. Não chamar o dicionário de tela morta: referência humana, opção de campo e regra executada têm papéis diferentes.

Corrigir PDFs, Mermaid, títulos, CTAs e índice do checklist na mesma nomenclatura, separando situação atual e proposta. Não promover dicionário como segunda ficha, não adicionar writer de lead ali e não substituir seus conteúdos por números operacionais.

Dicionário deve mostrar onde suas listas são efetivamente usadas. “Alimenta” não significa transformar todo texto normativo em bloqueio de salvamento.

## 2. Bases que prevalecem nesta proposta

A v3 (p. 1) corrige 12 leads organizacionais versus 3 filtrados, proíbe soma 10+63 e preserva Operação/Exceções com gravadores. As pp. 17–18 explicitam: código identificado não é comprovado em uso; lógica e visual têm cortes distintos; marketing sem writer localizado é pendência; abrir preparador pode gravar.

Adotar essas ressalvas. Não executar a sugestão antiga de recolher seis/oito rotas como não operacionais. A PR168 já registrou preservar cálculos GoLive: não reabrir essa aprovação como se nunca tivesse ocorrido; ainda falta reconciliar capacidades/destinos.

As fontes chamam de 91 o total de 90 URLs + layout; não tratar como 91 telas de produto nem usar falta de menu como sinônimo de falta de acesso contextual.

## 3. Prompt-base para o Lovable — pronto para encaminhar, não enviado

Você deve revisar as propostas e cortes do Desk V4 respeitando a definição da Proprietária: CRM Mestre é somente dicionário CA04, não CRM operacional. CRM Vivo é /leads; Calls é /calls. Comece por L00 (retificar documentação); apresente L01 como próximo corte mínimo de código. Não executar todos os cortes de uma vez.

Antes de alterar: ler regras do repositório, branch/SHA correntes e os componentes consumidores. Se o Claude estiver alterando o mesmo arquivo, interromper a escrita concorrente e delimitar responsável. Alteração de código inteiro reconstruído de resposta truncada é proibida; preservar arquivo integral e aplicar diff mínimo. Não trocar verificadores por return[]/null nem apagar testes para produzir verde.

Em cada entrega: ID/nome/versão do corte, arquivos e diff, rotas afetadas, campos preservados, fonte e consumidor, testes executados, limite de autenticação, ambiente/SHA, capturas completas antes/depois e checklist separado em implementado/integrado/publicado/comprovado em uso. Render não é teste de gravação.

Nenhuma exclusão, nova rota, mudança global de navegação, migration/RLS, convite, envio, assinatura, cobrança ou publicação ao App por esta proposta. App permanece congelado e 14 itens documentais reservados. Manter vida completa do cliente no conjunto Caso360/Pessoa360/módulos existentes, preservando a capacidade GoLive até destino equivalente comprovado.

Se faltar campo aceito pelo gravador, registrar PEDIDO_AO_CLAUDE com pergunta→campo→valor→writer→leitor e caso afetado, sem inventar schema ou fingir integração. Não impor ao usuário nova auditoria genérica: cada pendência deve ter saída concreta e teste.

## 4. Sequência de trabalho proposta

Trilha rápida e independente: L00→L01→L02, mantendo a operação.

Trilha de atendimento: L03/L04 de apresentação, depois L05/L06 com compatibilidade confirmada pela engenharia.

Prioridade funcional paralela à trilha rápida: L08 (minuta/anexos aplicáveis e retorno ao mesmo caso), sem mexer nos mesmos arquivos simultaneamente.

Antes de eliminar indicadores: L09. Antes de arquivar capacidades: L10 e L12. L07 e L11 por subcortes aprovados.

L12 nunca é justificativa para esconder funcionalidades ainda sem substituto.

## 5. Especificação de cada corte

### L00 — Retificar mapas e nomenclatura
Natureza: Documental. Escopo: /crm-mestre, /leads, /calls; PDF91 e mapa MMD.

Proposta: Corrigir CRM Mestre para dicionário/referência CA04; CRM Vivo operacional em /leads; Calls em /calls. Separar estado atual e destino proposto. Contar 90 URLs + layout como arquivos, não telas independentes.

Não fazer: Nenhuma alteração de menu, banco ou comportamento.

Aceite: Todos os mapas usam a mesma identificação; registro das correções e versão.

Estado: Proposta preparada; não executada.

### L01 — Biblioteca: corrigir portas de entrada
Natureza: Navegação local. Escopo: /biblioteca.

Proposta: Conferir CTAs Trilhas Jurídicas e Referências; corrigir destino e manter filtro/contexto; expor dez subáreas existentes com índice visível e nomenclatura do acervo real.

Não fazer: Não criar coleção, tabela, motor ou publicar. Não assumir caso ativo: quando exigido, selecionar caso explicitamente.

Aceite: Cada CTA abre subárea/objeto correto; voltar/recarregar preserva contexto; antes/depois 375/1280.

Estado: Depende de L00 e aprovação específica.

### L02 — Mostrar alimento e consumidor
Natureza: Apresentação rastreável. Escopo: /biblioteca, /crm-mestre, /governanca/dicionario-calls-crm.

Proposta: Cada cartão/lista mostra o que contém, contador/unidade/recorte, consumidor rastreado e efeito; distinguir referência humana, opção de formulário e regra executada.

Não fazer: Não declarar conexão por intenção; sem consumidor identificado, marcar integração pendente. Nenhuma migração.

Aceite: Tabela fonte→função→consumidor→resultado com caminho no código; tela mostra somente vínculos confirmados.

Estado: Depende de rastreio de código.

### L03 — CRM Vivo: trabalho do dia e ficha
Natureza: UX preservando lógica. Escopo: /leads.

Proposta: Fila com filtros existentes, identidade/contexto, ação de abrir ficha, uma seção de edição em foco com resumos visíveis; preservar 36 campos, Scan, templates, writes e abertura contextual existentes.

Não fazer: Não mudar fórmula, etapas gravadas, fazer outro CRM, apagar campos ou fechar gaveta descartando rascunho. Não reduzir tudo a sem próxima ação.

Aceite: Abrir/editar/salvar/reabrir/recarga; cancelar/voltar/fechar com rascunho protegido; filtros/posição preservados.

Estado: UX depende de aprovação; lógica compartilhada ao Claude.

### L04 — Calls: preparar, conversar e revisar
Natureza: UX em rota existente. Escopo: /calls.

Proposta: Três momentos locais visíveis: antes, durante, revisão. SPIN próximo das respostas; dicionário acessível como ajuda; síntese mostra valores anteriores, novos e destino.

Não fazer: Não substituir gravação por campo por lote silenciosamente. Rascunho/confirmar precisa contrato de persistência explícito antes de mudar writer. Sem consentimento, não anexar gravação/transcrição; isso não bloqueia toda edição.

Aceite: Mesma identidade e lead ao alternar; resposta persiste/reaparece; revisão não cria proposta/contrato automaticamente.

Estado: Mudança de lógica requer corte separado.

### L05 — Dicionários nos campos e glossário
Natureza: UI sobre valores canônicos. Escopo: /leads, /calls; dicionários CA04/Calls.

Proposta: Mapear campo→lista→valor técnico aceito→gravador→leitor. Usar chips quando adequados, seleção clara e ajuda do glossário no campo. CRM Mestre continua dicionário, sem ficha de lead própria.

Não fazer: Não copiar enum de desenho nem criar CHECK novo. Não impor consentimento de gravação como barreira ao rascunho interno.

Aceite: Toda opção salva e relê mesmo valor; PT-BR é rótulo, identificador preservado; ausência/erro explícitos.

Estado: Mapeamento obrigatório antes de UI.

### L06 — Discovery: corrigir destinos de respostas
Natureza: Contrato de dados/formulário. Escopo: Perguntas 5/6/17/18; recomendação 20.

Proposta: Verificar nome/geração de ascendente, atributos conhecidos e próxima ação com responsável/data. Preparar proposta de recomendação comercial pós-fechamento sem excluir registros já salvos.

Não fazer: Não inventar coluna nem perder narrativa. Se faltar schema, abrir decisão técnica separada. Não mover pergunta 20 sem aprovação.

Aceite: De-para pergunta→campo→writer→releitura; cobertura das respostas existentes e teste do mesmo lead em Calls/CRM.

Estado: Engenharia/Claude; Lovable aplica apresentação aprovada.

### L07 — Etiquetas, taxonomias e filtros
Natureza: Descoberta e seleção. Escopo: /etiquetas, /biblioteca e listas que usam rótulos.

Proposta: Expor etiquetas na Biblioteca com origem e consumidores; filtros clicáveis somente quando associados à entidade certa; distinguir etiquetas 109, taxonomias 61, glossário e listas de domínio.

Não fazer: Não fundir fontes por nomes semelhantes nem mudar IDs/tabelas. Acesso unificado não é migração física.

Aceite: Filtro abre conjunto correto; vocabulários distintos e vínculos preservados; teste com/sem etiqueta.

Estado: Depende de mapeamento de consumidores.

### L08 — Formalização: contrato encontrável
Natureza: UX/contexto com prioridade P0. Escopo: Caso360 Formalização; /contratos/$id; preparador existente.

Proposta: Reaproveitar cinco cartões, leitura contínua e exportador; link ao campo de origem/retorno preserva case_id e contract_id. Mostrar apenas anexos aplicáveis por versão, sem nova exigência genérica para Ana.

Não fazer: Não disparar preparador em auditoria só leitura: abertura pode gravar. Sem nova minuta, assinatura, cobrança ou aprovação automática. Não atestar Elo3/Elo7 corretos sem evidência de instância.

Aceite: Abrir instrumento correto, ler/exportar prévia vigente, corrigir internamente e reler; modelo/instância separados.

Estado: P0; lógica ao Claude, UX ao Lovable.

### L09 — Métricas: separar repetição e conflito
Natureza: Reconciliação lógica antes da UX. Escopo: /painel, /ops, /tarefas, /microentregas, /metricas, /conversao, /leads, /calls, /marketing, Caso360, /golive/*.

Proposta: Catalogar cada indicador por entidade, fórmula, período, filtro, demo/real, escopo e fonte. Preservar resumo/atalho onde legítimo e detalhe na área dona. Rotular estoque versus eventos e previsto versus confirmado.

Não fazer: Não somar tarefas 10+planejador 63, lead≠caso, editorial≠operacional. Não congelar /metricas nem substituir motor por desenho.

Aceite: Planilha indicador→fórmula→origem→tela dona→detalhe; valores reconciliados ou diferença justificada.

Estado: Engenharia antes de reordenar/apagar cards.

### L10 — Pesquisa, Caso360 e GoLive: continuidade
Natureza: Preservação de capacidades. Escopo: /pesquisa-modulo, detalhe, /pessoas-linhagens/$caseId, /golive/* e Caso/Pessoa360.

Proposta: Preservar oito seções Caso360, subáreas de pesquisa, módulos históricos e proveniência. Comparar 19 GoLive por leitura, comando e destino; sem equivalência, capacidade fica pendente e acessível.

Não fazer: Não chamar todos GoLive de laboratório, não arquivar globalmente. Não criar terceiro Caso360 nem publicar hipótese. Manter motores existentes.

Aceite: Cada capacidade tem objeto/ID, entrada, ação, leitor/writer e teste no destino; lista integral sem encerramento só por build.

Estado: Dependência de inventário por capacidade.

### L11 — Outras áreas: organização por registro
Natureza: UX restrita. Escopo: /catalogo, /fontes-genealogicas, /matriz-juridica, /biblioteca-mensagens, /marketing, /equipe, /integracoes, /financeiro.

Proposta: Paginação/filtros e detalhe do registro selecionado, mantendo títulos e acessos visíveis; erros distintos de vazio; revisar cadastros/CTAs de investimento/campanha não localizados pelo estudo.

Não fazer: Não inventar integração ativa, campanha gravável ou recebimento. Não incluir convites, envios ou alterações de papel no teste visual.

Aceite: Antes/depois completo, conteúdo preservado e teste individual do controle; operações reais só autorizadas.

Estado: Um subcorte por rota, não pacote simultâneo.

### L12 — Histórico e encerramento
Natureza: Somente após equivalência. Escopo: Referências substituídas e candidatos a arquivo.

Proposta: Revisar dependências, preservar conteúdo e motivo; sanitizar PII apenas na cópia histórica; classificar nos diretórios canônicos existentes. App permanece congelado e 14 itens sem nova liberação.

Não fazer: Não recolher /ops ou /ops-excecoes com writer; não esvaziar telas antes de consumidor funcional; nenhuma publicação por este plano.

Aceite: Item só encerra com origem, substituto, prova e aprovação da Proprietária; legado sem substituto continua pendência.

Estado: Último corte; não autorizado.

## 6. Portas de encerramento, sem novo ritual

- Documentação retificada: lista e mapa coerentes; ainda não significa código alterado.
- Código implementado: diff específico e testes técnicos; ainda não significa deploy.
- Publicado: domínio/ambiente resolve o SHA; ainda não significa operação homologada.
- Comprovado em uso: sequência real de abrir→agir→confirmar→reabrir→reler e resultado contextual.
- Dado ausente: origem/consulta/escopo identificado; não preencher por demonstração.
- Bloqueado: causa e próximo passo específico; não chamar pendência de decisão quando é defeito de código.

Nenhuma das propostas deste documento altera esses estados por si só.
