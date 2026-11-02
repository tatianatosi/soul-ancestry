# Roadmap

## 02/11 — Publicação SEO, liberação Ana e revisão de sincronização
- [ ] Pedido 15:27: tentativa autenticada pela ação real Aprovar para envio devolveu erro `column reference "status" is ambiguous` na validação; contrato permanece pending_data e v6 pending. Exceção atual registra gate de ativação, não dispensa a validação de envio. Bloqueado por correção da função de validação no banco (mudança exige autorização específica); nenhum envio/assinatura/liberação executado. Git sync não é verificável/controlável pelo agente; integração existente deve ser conferida em Configurações → Git, preservando revisão independente e sem criar repositório paralelo. Conector GitHub API acessível não está ligado ao projeto e não equivale ao Git sync.
- [ ] Completar datas dos quatro familiares (02/11 15:16): conferidas as 12 páginas dos dois PDFs disponíveis e Auditoria-Mãe recuperada §10.4. Histórico confirma os três anexos enviados em 13/10 12:54 (#2634); documentos/evidências do caso contêm os mesmos dois PDFs e texto. Busca ampliada em PDFs do projeto/Arquivos/uploads e PDFs dentro de ZIPs não localizou PDF Auditoria-Mãe nem datas familiares adicionais; referências de mockup rejeitadas. Heinrich/Lotte/Rudolf/Otto já têm datas/anos no perfil; Ana Maria/Cleusa/Adair seguem sem data nas fontes; quarto familiar não identificado. Proprietária recusou reenvio: não solicitar novamente. Bloqueado por fonte não acessível no acervo atual; nenhum dado gravado/inferido nem publicação executada.
- [x] Reutilizar papéis existentes: preparação admin/operações/comercial/financeiro preservada; aprovações protegidas no servidor e em nove tabelas por triggers INSERT/UPDATE, negando autorização nula. Migrations Drizzle 0003/0004 aplicadas; 14 testes passam; Proprietária autenticada confirma preparar/aprovar=true e organização alheia=false; contrato continua pending_data. Nenhuma conta criada/promovida; nenhum contrato aprovado/enviado/publicado.
- [ ] Atribuir papéis a novas contas: aguarda nomes/e-mails e papéis escolhidos pela Proprietária; não criar identidades não identificadas. Teste de escrita direta por contas não-admin não exercitado; testes focais usam autorização simulada, não sessões reais desses papéis.
- [ ] Publicar contrato autorizado em 02/11 14:46 e reiterado 15:13: v6 autenticada confirma R$3.200/adulto, ausência de rateio antigo, R$9.600 e proposta válida até 30/11/2026; permanece working/pending_data/review pending. UI confirma prévia desatualizada, qualificação incompleta, fonte Canva de escopo inválida e case service não configurado. Liberação aguarda correção desses dados e aprovação humana; nenhum envio/assinatura/status fabricado. “Enviar ao cliente” apenas cria rascunho na fila, não envia e-mail automaticamente.
- [ ] Integrar GitHub/Lovable existente e publicar exclusivamente versão aprovada; conferir proteção remota e PR autorizada sem reconectar/recriar repositório. Seleção do branch no editor exige ação da Proprietária.
- [x] Heinrich 15/05/1837 e Lotte 16/05/1902 salvos pelo editor autenticado com fonte declarada e citação Auditoria-Mãe §10.4; F5/SELECT confirmam precisão exata e verificação pendente. Árvore mostra n.1837/n.1902. Histórico v1–v6 já existente conferido com geração/autoria, sem duplicar versões.
- [ ] Registrar anos reais/estimados de Ana Maria, Cleusa e Adair: bloqueado por ausência de ano/idade com fonte nos perfis, pesquisa, eventos, Dossiê Consolidado p.2 e Registro Unificado p.2–3. Adair 1961 é fallback sem fonte e não foi usado. Aceita relato familiar identificado sem certidão original; aguarda anos e origem.
- [x] Robots.txt, sitemap sem lastmod artificial e título institucional conferidos; publicação solicitada com aviso de segurança aceito pela Proprietária. Link público retornou 200 nos três destinos, sitemap só / e título correto.
- [x] Liberar caso da Ana pela gestão de acessos existente, confirmado após recarga e SELECT app_access_status=liberado. Convite continua invited; login independente da Ana não exercitado. Adair/Alice sem e-mails autorizados.
- [x] Revisão de banco/código e solução de sincronização apresentada: reservas declaradas não travam edição; base SHA não comparada; publicação é separada. Banco 195 tabelas/35 MB, estatísticas acessíveis em extensions; sem evidência suficiente para criar índices ou alterar schema. Skill database-optimization não disponível no catálogo ativo. Sem novas alterações de permissões, integração ou schema.

## 02/11 — v6 e seleção de branch
- [ ] Convite Ana criado pelo botão e confirmação autenticada: acesso 820b628e-685d-406e-83c2-d6aa8690db42 invited, auth vinculado, validade 03/11 14:25 UTC, relido UI após F5. Entrega de e-mail não comprovada; evento não localizado. App do caso ainda bloqueado, não alterado.
- [ ] Aprovar PR #222 e publicar solicitado em 02/11 14:23: tentativa de APPROVE retornou 422 Cannot approve your own pull request; precisa revisor distinto da conexão Tati e CI aprovado. Nenhuma proteção contornada nem publicação da PR.
- [ ] Publicar contrato solicitado em 02/11 14:23: bloqueios de documentos/anexos/revisão ainda abertos; verificar integração existente sem reconectar ou duplicar repositório.
- [ ] Preparar contrato da Ana: validade persistida 30/11/2026; v6 ainda pending review, prévia desatualizada, duas partes sem documento e anexos I–V ausentes segundo tela autenticada; não marcar prontidão nem inventar dados.
- [x] Proteção clássica main aplicada PUT 200 e relida GET 200: guard/typecheck-test-build strict, revisão 1/último push, admins sujeitos, conversas resolvidas, sem force/exclusão. Não bloqueia Publicar no Lovable.
- [ ] PR real #222 aberta no branch claude/exemplo-integracao-evidencias-2026-11-02, commit 7c806a805db04e9dda6d9a7c6fcf2c83754a736d; atrás da main, sem revisão e sem evidências de CI aprovado/publicação. Não integrada.
- [ ] Corte de leitura tipada iniciado no draft Revisão incremental — leitura de clientes e integração protegida; código isolado, nenhum writer/dado/contrato alterado; aguarda resultado do draft e revisão humana independente.
- [x] Automação implementada: template PR, validador puro e CLI, reservas de arquivos, guard por SHA, resumo CI e auditoria retrospectiva paginada no painel existente; sem merge/deploy.
- [x] Comparação de duplicidade compartilhada em Clientes/Leads, preservando CPF, fixtures, queries e erros; 48 testes focais passaram, 3 workflows com sintaxe válida e compilação automática OK; consulta autenticada da Ana pediu decisão humana sem criar registro.
- [x] GitHub lido via conexão Tati: 201 PRs fechadas, 187 integradas; integração confirmada não prova execução nem publicação.
- [x] Ativar checks obrigatórios na main: autorizado e aplicado em 02/11, conferido por releitura REST.
- [ ] Rodar a nova auditoria remota integral: arquivos ainda não integrados à base confiável; precisa da integração autorizada e workflow em operação. PRs antigas sem evidência não serão marcadas como concluídas.
- [ ] Teste antigo detectar-regressao-merge: execução bloqueada pelo sandbox ao usar git add; executar no CI externo, sem contornar restrições.
- [x] Revisados os três dossiês anexados, histórico recuperado, 40 PDFs e imagens candidatas: Heinrich 15/05/1837 e Lotte 16/05/1902 na Auditoria-Mãe seção 10.4; PDF confirma Lotte 1902. Originais citados não estão nos anexos disponíveis. Nenhuma data gravada nesta revisão.
- [x] Gerar v6 pelo botão existente, autenticada como Proprietária; seis versões confirmadas após F5, rascunho interno sem envio/assinatura.
- [x] Prévia interna da v6 conferida: R$ 3.200 e R$ 9.600 e parcelas R$ 320 presentes; rateios antigos R$ 4.800/R$ 2.400 ausentes no documento renderizado.
- [x] Consultar documentação oficial sobre selecionar/criar branches e requisitos do seletor.

## 01/11 — Histórico contratual e anos dos familiares
- [x] Revisão de código: seis padrões confirmados com referências e sequência incremental; nenhuma refatoração executada.
- [x] Esclarecido: publicar captura a versão atual do projeto Lovable, sincronizada com o branch selecionado, não necessariamente main; troca de branch não republica.
- [x] Histórico existente do contrato v1–v5 com botão de abertura, geração/última atualização em São Paulo, autoria e apresentação 375/1280 conferidas; sem criar versão contratual.
- [x] Editor existente do perfil recebe fonte e precisão no payload; botão no contrato abre a ficha contextual.
- [x] Lotte: 1902, Registro Unificado p. 2, fonte vinculada e citação interna; salvo pelo editor, relido após F5 e exibido como n. c. 1902 em 375/1280. Sem mês/dia fabricados.
- [ ] Heinrich/Lotte: datas completas localizadas na Auditoria-Mãe, mas sem original disponível nem citação individual; registro com esse grau de evidência aguarda decisão da Proprietária. Não tratar como certidão verificada.
- [ ] Ana Maria, Cleusa e Adair: ainda sem datas nas fontes textuais inspecionadas; 1961 de Adair pertence a fallback rejeitado, não usar.
- [ ] Publicar a Árvore: aguardando decisão explícita sobre o achado grave de permissões contratuais ainda aberto; não publicar datas inventadas.

## 20/10 — Desk V4 c4d3bef9, corte aprovado neste rascunho
- [ ] Reconciliar apresentação do corte anterior sem App, rotas novas, golive-* ou painel-dia; matriz vazia = Dados insuficientes.
- [x] Executar testes relevantes e classificar sete falhas: todas preexistentes em origin/HEAD 03ecf78c, por comparação das fontes/assertivas com a610de15; testes do App/Pesquisa preservados. Compilação automática OK em 20/10 às 13:26 UTC.
- [ ] Capturar produto principal e rascunho autenticados em 375/1440, abas/subabas seguras; contrato autorizado, demais escritas não.
- [ ] Comparar com prancha aprovada por página/elemento e entregar PDF com QA integral, arquivos/SHA/pendências. Sem publicar, aceitar, merge ou deploy.
## 31/10 — Prontidão para o lançamento do fim de semana
- [x] Suíte completa: 625 arquivos / 5.869 testes passam. Teste de inventário ganhou limite de 30 s (lento sob carga); dois testes atualizados para textos aplicados pela Proprietária em 31/10 ("Dados insuficientes", título do Desk menor no celular).
- [x] Desk diário: 41 telas da lateral + Caso 360 e contrato da Ana + 18 telas GoLive no caso da Ana abrem em 1280/375 sem erro, HTTP >=400 ou rolagem lateral; telas alteradas pela versão aplicada em 31/10 reconferidas.
- [x] App Cliente da Ana: sete abas 375/1280 sem erro/overflow; Conta 3×R$ 320/10 meses, R$ 3.200/adulto, R$ 9.600; Árvore 8 pessoas/8 ligações.
- [x] Árvore: filiação publicada Ana Maria → Cleusa (confirmada 13/10) estava desenhada na mesma geração; layout agora põe pai/mãe acima do filho (G7→G1), cada linha cai direto, sem passar sobre outra pessoa. Banco não alterado; números de geração publicados (Ana Maria G3, acima dela G4–G6) seguem divergentes da relação e devem ser corrigidos no Desk pela equipe.
- [x] Segurança profunda 31/10: 4 achados. Corrigido no código: histórico de acesso ao portal só para gestão e da própria organização. Três abertos aguardam definição de papéis pela Proprietária.
- [x] Publicado em 01/11; link público conferido: sete abas 375/1280 sem erro (Árvore G7→G1, 8 pessoas/8 ligações) e nove telas principais do Desk abrindo.
- [ ] Lançamento — ações da Proprietária (efeito externo, não executadas): liberar o caso da Ana no App (hoje bloqueado, informação ao cliente não liberada) e enviar o convite ao e-mail já aprovado analuizabox@gmail.com em Acessos ao App; Adair e Alice sem e-mail autorizado/convite.
- Bloqueios conhecidos: três achados de permissão (aprovar preço, pendências de contrato de outra organização, preparar contrato para assinatura) aguardam a Proprietária definir papéis; anos de Heinrich, Lotte, Ana Maria, Cleusa e Adair sem fonte; pedidos documentais e relatórios não registrados.

## 27/10 — Correção focal da Árvore (sem publicação)
- [x] Raiz por par autorizado caso/pessoa (Otto publicado no caso Ana), corte visual G10 removido; abertura/restauração compartilham enquadramento com margem/centro.
- [x] 18 testes passam; oito pessoas e oito relações persistidas conferidas em 375/1280; restauração repete quadro inicial e nomes reais cabem; PDF original p.6 comparado com antes/candidata. Nomes extremos testados por função, não por caso real inventado.
- [x] Comparativo entregue; build automático OK; dados, cores e outras abas intocados. Publicação/homologação visual e acesso cliente independente não autorizados neste corte.

## 26/10 — Paleta rica e densidade editorial do App
- [x] Cores funcionais exatas nos chips, borda navy 6%, cartões brancos/sombra suave, números em ouro, teia dourada e grade compacta 3x2 desktop/2x3 mobile com barras de presença de registros (não percentuais inventados); perfil com membro desde persistido e WhatsApp direto. Árvore existente já põe cônjuges lado a lado na geração registrada; oito nós e treze relações preservados.
- [x] Sete abas em 375/1280 sem overflow/pageerrors/HTTP >=400; 27 testes passam, build automático OK. Capturas /tmp/browser/app-integral; visual não publicado neste corte.
- [ ] Agrupamento documental Ana/Adair/Alice/Felipe bloqueado por fonte: checklist sem pedidos, sem titular sanitizado por item; nenhum grupo ou pedido inferido. Upload existente destacado no acesso cliente; prévia administrativa não recebe permissão de envio.

## 26/10 — Dossiês e Relatórios reais do Legado da Ana
- [x] Conferidas fontes persistidas e repositório: Ana tem zero case_reports/client_deliverables/projeções de Legado ou relatório; único research_reports é rascunho DEMO de outro caso, sem aprovação. Os três documents liberados são evidências de pesquisa, sem revisão, resumo aprovado ou classificação de entrega; não convertidos em relatórios.
- [x] Resumo sanitizado do dossiê aprovado expressamente pela Proprietária e publicado pelo escritor autenticado existente (d9d5b074-3800-4a4f-a913-894019feafc1), com aprovadora/data/auditoria. Dossiês mostra um material em 375/1280 após F5; PDF integral reservado. Relatórios permanecem em preparação, pois ainda não estão prontos.
- [x] Após esclarecimento da Proprietária, localizado e lido o PDF original Dossie-Consolidado-Ana-Luiza-Projeto-Familiar-Austria.pdf (enviado em 13/10). Contém hipóteses jurídicas, condições técnicas proibidas no App, status históricos e automações propostas; não deve ser publicado integralmente. Relatórios ainda não estão prontos, confirmado pela Proprietária.

## 26/10 — Experiência integral das sete abas
- [x] Apresentação local com paleta completa, sete abas e fontes sanitizadas existentes; autorização preservada. app-visibilidade já mantém as sete abas disponíveis mesmo com zero entregas, comprovado por teste.
- [x] Quatro grupos de Documentos, genograma SVG com 8 pessoas/13 relações publicadas sem lista plana, zoom/pan/foco; Radar com seis nomes solicitados sem parecer/score inventado; Conta com condição prevista exclusiva da Ana. Home com país real, WhatsApp e estado contextual.
- [x] Sete abas na sessão da Proprietária via prévia administrativa, 375/1280 sem overflow/pageerrors/HTTP >=400; quatro grupos, três arquivos, cinco coleções e valores conferidos; recarga mantém caso. 44 testes passaram; tsgo sem erros; compilação sem erros (typecheck automático excedeu tempo). Capturas /tmp/browser/app-integral. Nada publicado.
- [ ] Conteúdo não registrado: fotos/novos achados, três certidões específicas, pedidos com prazos e Dossiês/Relatórios aprovados não fornecidos por leitores existentes. Três arquivos disponíveis são dossiê/registro PDF/texto-fonte, não certidões; nenhum conteúdo criado/publicado para preencher espaços.
- [ ] Download na prévia administrativa: leitor não fornece URL liberada; nenhuma nova função privilegiada criada neste corte. Download do cliente permanece no mecanismo autorizado existente, não exercitado como Ana.

## 25/10 — Fechamento v4.0 e conteúdo real da Ana (15:43 UTC)
- [x] Base com PR #171 presente; migrations financeiro/telemetria já registradas em Drizzle 0000/0001, função/tabela/privilégios/RLS conferidos. Nenhum pull ou migration repetida.
- [x] Checklist aparece na prévia também com arquivos; Documentação deixa de mostrar 100% por arquivos liberados e usa somente pedidos aceitos/total. Recarga seguida de reabertura confirmada.
- [ ] Pedidos reais da equipe: BLOQUEADO_POR_DADO — zero portal_document_requests e document_requests no caso; 18 case_checklist_items são preparação interna, não pedidos à família. Pesquisa nos uploads/repositório não localizou solicitação documental comprovada; não inventar 14 itens ou contador 0/0.
- [ ] Legado: BLOQUEADO_POR_DADO — zero case_reports/client_deliverables/research_reports e nenhuma projeção de relatório aprovada. Arquivos de trabalho existentes não possuem resumo final sanitizado aprovado; não duplicados nem publicados como relatório.
- [x] Sete abas reais em 375/1280: sem overflow, pageerrors ou HTTP >=400; checklist após F5/reabrir, seletor universal troca e mantém Ana após F5. 35 testes passaram; build automático OK. Capturas em /tmp/browser/fechamento-v4. Inspeção administrativa, não login independente da Ana.
- [ ] Paridade integral das onze telas Desk e PDF oficial de 16 cláusulas/8 páginas: não comprovados neste corte; dependem de validação integral e arquivo contratual final. Sem redesign ou publicação do site.

## 25/10 — Resgate da experiência rica do App Cliente
- [ ] Cruzar prompts aprovados e comparativo editorial indicado com as sete abas atuais; separar ausências visuais de falta de conteúdo publicado.
- [ ] Executar os refinamentos faltantes nas telas existentes, preservando leitores, dados, sete abas e privacidade; sem publicação.
- [ ] Conferir sete abas autenticadas em 375/1280, interações, testes relevantes e erros; registrar diferenças e bloqueios restantes.

## 25/10 — PDF: sete abas atuais × mockup de 17 páginas
- [x] Capturar as sete abas do App Cliente como estão agora (375 px e desktop), pela prévia administrativa oficial, com selo de origem e data.
- [x] Localizar o mockup aprovado de 17 páginas e comparar aba a aba: o que coincide, o que falta, o que é dado atual e não estilo.
- [x] Montar PDF com os prints e o comparativo; salvar em Arquivos.

## 25/10 — Conferência e aplicação de migrations pendentes
- [x] Comparados 234 arquivos históricos e cinco propostas com os dois históricos do banco: 231 registrados no histórico anterior, dois no Drizzle e saneamento de dados já refletido. Três hashes Drizzle conferidos; funções de ativação retornam true/true. Nenhum schema pendente identificado; nada reaplicado.
- [x] Separadas propostas de dados: as três de 23/10 já estão refletidas no banco. Todas as 194 tabelas e seus conjuntos de colunas correspondem aos tipos gerados. Inventário atualizado em supabase/pendentes/README.md.
- [ ] Proposta 20261024120000_documentos_reais_ana_liberados.sql: BLOQUEADO_POR_DADO — publica materiais internos, não altera schema; faltam versões sanitizadas e correspondência comprovada com os documentos pretendidos. Não executada.

## 24/10 — Publicação Desk V4 e documentos da Ana (11:47 UTC)
- [x] Publicação solicitada para soul-ancestry.lovable.app após varredura básica sem achados; conclusão do deploy não confirmada e análise profunda não realizada.
- [ ] Liberação dos documentos: três arquivos recebidos localizados nos uploads, já vinculados à Ana em evidencias (Registro Unificado PDF/texto e Dossiê Consolidado PDF); não duplicados. PDFs conferidos (426500/432805 bytes, 5/7 páginas): contêm condições comerciais/hipóteses e são material interno, não certidões nem entregas sanitizadas. Nenhum registro em documents/case_source_documents. Leitura/assinatura dos objetos privados retornou NoSuchKey nesta sessão; bytes disponíveis nos uploads. BLOQUEADO_POR_DADO: não localizadas certidões/versões sanitizadas próprias para a família; não solicitar reenvio genérico nem liberar material interno. Os 14 itens do checklist não são arquivos.

## 22/10 — Fechamento aprovado v4.0 (sem redesign/publicação)
- [x] PR #171 já presente na base bdab2ec0; nenhum pull, merge ou alteração visual executado.
- [x] Aplicadas as duas migrations existentes de suporte financeiro e telemetria; função, RLS, políticas e privilégios conferidos no banco.
- [x] 80 testes passaram; compilação automática OK; seletor de caso troca entre dois casos e mantém Ana após F5.
- [x] Sete abas conferidas em 1280/375 na prévia administrativa oficial: zero overflow, erros de página ou respostas HTTP com erro. Sessão da Proprietária, não login independente da Ana.
- [ ] Aceite cliente real: bloqueado por vínculo do acesso da Ana à identidade da Proprietária; nenhum acesso/login alterado.
- [ ] Três documentos: não encontrados ativos em documents para o caso canônico; prévia mostra acervo em preparação. Não liberar checklist reservado ou inventar arquivos.
- [ ] Contrato 8 páginas: versão 2 contém 16 cláusulas e RASCUNHO, sem arquivo renderizado; PDF oficial precisa ser fornecido/verificado pelo Claude.
- [ ] Validação integral das onze telas e homologação pessoal: não executadas nesta conferência limitada às sete abas e ao seletor. App congelado e nada publicado.

## 20/10 — Sugestões completas de jornada guiada (somente documento)
- [x] Revisar estudo v3-v2, inventário integral de 19/10 e código local 731f666c por área/subárea; separar observação histórica, código e proposta. Auditoria de todos os filhos/writers não exercitada; estado online atual do Claude não recapturado.
- [x] PDF de 80 páginas: 29 composições, 90 entradas Desk históricas, 12 subabas de pesquisa, 11 de linhagens, 10 alimentos da Biblioteca, cinco cartões/seis atos, jornada 375, legado/sanitização e achados citados ao Claude.
- [x] Todas as páginas renderizadas e inspecionadas em folhas de contato; corrigida sobreposição de interpretação/ação na pesquisa. PDF salvo em Arquivos para a coleção existente; nenhum src, dado, trabalho do Claude, App ou publicação alterado. Testes/build do produto não aplicáveis a este corte documental.

## 19/10 — Atualização da recomposição densa do App
- [x] Restaurar Documentos e reconciliar os ajustes exclusivos de Home, Árvore, Conta e aparência local com a versão principal.
- [x] Preservar leitores, permissões, sete abas, grade móvel atual e botão institucional; sem edição do Desk ou dados.
- [x] Validar 43 testes seletivos e sete abas autenticadas em 375/1280: sem overflow, zero erros de página, régua preservada após F5; compilação automática OK.
- [ ] Aprovação da Proprietária; sem aceitar ou publicar.

## Caso 360 V4 — rascunho isolado (13/10, 13:25 UTC)
- [x] Comparar painel/kit existentes com desk-04-caso360.png; capturas autenticadas antes em 375/1280/1440.
- [x] Ajustar somente a Visão existente em três colunas; preservar oito seções, blocos recolhidos, dados e App.
- [x] Validar 39 testes existentes e validação automática OK; capturas depois em 375/1280/1440, navegação e releitura sem overflow.
- [x] Entregar diff, hash e limitações nas capturas e relatório.
- [ ] Aprovação visual da Proprietária; sem integrar, aceitar, publicar ou marcar COMPROVADO_EM_USO.
- [ ] PEDIDO AO CLAUDE: conciliar papéis dos adultos (leitor entrega Titular), estado da formalização e evidências legadas/canônicas; decisão da Proprietária sobre textos 1941/2026. Sem alteração de dados neste corte.

## 18/10 — CRM Mestre é dicionário (L00–L12, proposta v1.0)
- [x] L00 documental: proposta v1.0 registrada no destino solicitado; mapas/cobertura v2 e PDFs com errata vigente entregues na coleção, preservando originais históricos (não reeditados internamente).
- [x] L01: portas de entrada conferidas em leitura; diff mínimo de identificação das regras jurídicas apresentado, Referências mantém acervo compartilhado.
- [ ] L01 implementação/índice de dez subáreas/contexto/recarga: bloqueado por aprovação específica da Proprietária e coordenação do arquivo; nenhuma UI alterada.
- L02–L12 não autorizados; App congelado, 14 itens reservados; sem mudanças de produto ou efeitos externos.

## 18/10 — pedidos para aprovação, sem publicação
- [x] Sugestões UX/UI do Desk entregues no de-para de 18/10: organização contextual de onze superfícies e mapa de alimentos → motores → resultados; proposta não implementada, App em pausa.
- [ ] Documentos na versão separada: área de envio existente, checklist com selos e Entregas do caso; 14 itens permanecem não compartilhados até autorização.
- [ ] PDF da versão leve em três vias (original, App no ar, versão nova), sete abas em celular/computador; identificar data e origem de cada captura.
- [x] De-para do Desk de 18/10: 33 telas, 66 vistas 1280/375, 319 segmentos, 68 destinos sondados, PDF de análise e caderno integral; leitura separada de ações não executadas.
- [x] Rodada 3 do Desk vivo (18/10): PDF de 11 páginas com KPIs sem sobreposição (dono único por número), GoLive como leitura "como a família vê" no Caso 360, cards com paleta completa, resgates das pranchas v1–v6, microentregas em duas entidades e planejador como alimento; 3 pedidos de decisão à Proprietária.
- [x] Correção de typecheck (18/10): restaurados itemNavAtivo, grupoNavAtivo e LACUNAS_CONHECIDAS em navegacao-desk.ts; 4 falhas de teste restantes são a divergência V4×V5 de menu, decisão pendente da Proprietária.
- [ ] PEDIDO AO CLAUDE: comprovar persistência/releitura, conexões dos alimentos aos motores e resultado autorizado no App; depende de autorização de escrita e execução contextual, não realizada nesta auditoria.
- Não executar escritas, convites, liberação, cobrança, integração ou publicação nesta auditoria.
## Mockup 4 — rascunho isolado (13/10/2026 16:55 UTC)
Checklist inicial: **NÃO EXECUTADO**. Sem integração, publicação, dados ou permissões; itens históricos abaixo não autorizam trabalho fora deste corte.

| Página | Tela existente | Fonte preservada | Interação a conferir |
|---|---|---|---|
| 3 | `/portal` | projeções e próxima ação sanitizadas | expansão achado, Jornada, WhatsApp |
| 4 | `/portal/jornada` | jornada publicada | duas linhas, destinos contextuais |
| 5 | `/portal/radar` | seis eixos existentes | detalhes da base real |
| 6 | `/portal/arvore` | pessoas e relações publicadas | foco, expansão, modos |
| 7 | `/portal/documentos` | pedidos/arquivos autorizados | categorias, seletor sem envio |
| 8 | `/portal/legado` | materiais aprovados | prateleiras/expansão |
| 9 | `/portal/conta` | perfil e condição sanitizados | histórico, WhatsApp |
| 11 | `/painel` | implementação atual preservada | filtros/destinos, sem mudar motor |
| 12 | `/casos` | lista atual de casos | busca/filtros/abrir caso |
| 13 | `/tarefas` | tarefas existentes | filtros/detalhes, sem salvar |
| 14 | `/matriz-juridica` | regras existentes | busca/abas, sem revisão fictícia |
| 15 | `/qualidade` | radar existente | matriz/radar individual |
| 16 | `/alertas` | alertas com origem | filtros/abrir contexto, sem envio |
| 17 | `/biblioteca` | acervo real | busca/abas/abrir conteúdo |

- [x] Capturas ANTES 375/1440, sessão Proprietária; App só via prévia oficial.
- [x] Cortes locais Home/Jornada/Árvore/Radar/Legado/Conta e sete superfícies Desk; Documentos preservado por falta de PDFs, kit e leitores mantidos.
- [x] Detalhe Caso 360: quatro lotes A–D existentes, cabeçalhos sequenciais reforçados; nunca três colunas.
- [x] Testes seletivos: 45/45; rodada anterior 45/46, teste antigo A2 exige duas colunas no celular e conflita com a ordem atual. Sem alterar teste bloqueador.
- [x] Capturas DEPOIS 375/1440; 14 telas, foco/expansão/filtros/releitura; nenhuma operação submetida. Correção de tipagem feita; plataforma build OK 17:15:15 UTC.
- [x] Capturas finais após expansões de Radar/Legado e revisão visual; Hoje recapturado esperando os dados.
- [x] Relatório IMPLEMENTADO / TESTADO / PENDENTE HOMOLOGAÇÃO: `docs/relatorios/2026-10-13-mockup4-rascunho-visual.md`; PEDIDO AO CLAUDE explícito.
- [ ] Homologação visual da Proprietária (não COMPROVADO_EM_USO).

PEDIDO AO CLAUDE neste corte: revisar projeção master de pessoas (ancestrais aparecem como núcleo; Cleusa/Ana Maria compartilham G3 registrada), reconciliar timeline interna versus marcos publicados no resumo do Caso, expor títulos/datas/URLs autorizadas no leitor de Documentos antes de leitura física, reconciliar seis grupos solicitados versus oito entradas atuais sem mudança unilateral de navegação, adequar teste A2 à última ordem mobile de uma coluna. Não inferir/regravar dados aqui. Contrato/Gov.br/OS, narrativas/fotos/achados/FAQ ausentes continuam sem conteúdo fabricado.

## Polimento de luxo 12/10 (pedido 16:38)
- [ ] Jornada: texto editorial Graz (1895) no lugar de Lacuna (autorizado)
- [ ] Árvore com linhas: BLOQUEADO_POR_DADO (zero vínculos publicados)
- [ ] Certidão 1895 nos Documentos: BLOQUEADO_POR_DADO (nenhum documento liberado)
- [ ] Família na Home: só membros publicados

## Refinamento editorial — quatro abas oficiais (12/10/2026)
- [x] Refinar Home, Jornada, Árvore e Documentos apenas na apresentação; sete abas, fontes existentes e dados preservados.
- [x] Executar nove suítes existentes: 82 testes passaram, 2 conflitos de apresentação; build da plataforma OK 19:24:46 UTC.
- [x] Capturar antes/depois autenticado em 375/1280, foco/perfil da Árvore e reabertura de Documentos; zero overflow/pageerrors; relatório entregue.
- [ ] PEDIDO AO CLAUDE: a5-documentos-separacao-semantica exige copy antiga; a1-home-card-microentrega exige border-plum legado. Testes inalterados.
- [ ] Metadados e download no espelho administrativo bloqueados por fonte: leitor entrega só id/liberação/origem; sem título, data ou emissor. Nenhum arquivo liberado no caso para prova real de download.
- [ ] Aceite da Proprietária; rascunho não publicado nem integrado. Inspeção do agente não é prova pessoal de uso.

## Publicação do site principal (12/10/2026)
- [x] Publicação solicitada pela Proprietária: resiliência de rede, botão Reenviar, Conta nova e sete abas canônicas no site principal.
- [x] Conferência de segurança antes de publicar: varredura executada, sem problemas nas checções básicas; análise profunda do último commit está desatualizada.
- [ ] Nomes Painel · Descobertas · Biblioteca nunca chegaram ao site principal: a barra do App no ar ainda mostra Home · Radar · Legado (rotas e contagem corretas).
- [ ] Aceite visual da Conta nova, prova autenticada pessoal e varredura profunda atualizada antes de compartilhar amplamente.

## Auditoria 10/10 — quatro correções visuais finais (12/10/2026)
- [x] Inspecionar Radar Individual/heatmap da Ana em 375/1280; nenhuma sobreposição, margem/reserva/Assistente preservados.
- [x] Conferir legenda humana da Jornada e aviso legal padrão do Legado; ajustes existentes preservados. Estado vazio de encontros NAO_LOCALIZADO pelo seletor, sem deduzir ausência na fonte.
- [x] Acrescentar na Conta apenas do caso canônico o descritivo autorizado da condição familiar, preservando prevista/aguardando confirmação.
- [x] Capturar antes/depois da Conta, Jornada, Legado e heatmap; F5 visual confirmado. Ficha civil/CaseHealthHero NAO_LOCALIZADO, sem alegar mascaramento.
- [x] Preparar relatório, diff e 92 testes existentes; plataforma build OK 14:19:57 UTC. Inspeção administrativa do agente não comprova motores.
- [ ] Aprovação da Proprietária e prova operacional pessoal; nada integrado/publicado, nenhum contexto arquivado.

## Homologação final — Desk V4 e App Cliente (11/10/2026)
- [ ] Ajustar `/painel` na implementação Go Live: retirar a sessão demo do menu e alimentar o cockpit pela fila real de próxima ação prioritária.
- [ ] Corrigir Assistente × heatmap e apresentar cinco leituras financeiras com dados reais ou vazio honesto.
- [ ] Refinar Conta, Árvore e Radar sem afirmar Asaas, fatura individual, parentesco ou percentual não comprovado.
- [ ] Executar o checklist do App nas sete abas e a não regressão do Desk; capturas 375/1280 e relatório, sem publicar.
- Bloqueios conhecidos: zero faturas no caso; nenhuma integração Asaas no App; zero relações genealógicas publicadas; acessos individuais de Adair/Alice ausentes.

## Telemetria de permanência por aba (11/10/2026)
- [ ] Validar a proposta `client_tab_dwell_events` contra schema, funções de acesso, privacidade, retenção e política de dados — bloqueada até autorização explícita de migration/RLS.
- [ ] Aplicar migration somente após autorização explícita da Proprietária em corte separado; nenhuma alteração de banco neste corte visual.

## Experiência familiar — pedido ao Claude (11/10/2026)
- [x] Registrar a solicitação e a decisão explícita da Proprietária de manter navegação, acesso familiar e faturas sob responsabilidade do Claude; nenhum código ou dado alterado pelo Lovable.
- [ ] Claude: ajustar exatamente sete abas para Painel · Jornada · Árvore · Descobertas · Documentos · Biblioteca · Conta, reutilizando destinos existentes e esclarecendo a correspondência de Descobertas com Radar.
- [ ] Claude: comprovar fatura individual por pessoa autenticada em todos os leitores e RLS, sem expor pagamentos familiares; R$320/Asaas somente com fonte vigente, sem cobrança ou integração automática.
- [ ] Claude: conferir e vincular as três identidades solicitadas ao núcleo do caso canônico sem convites ou criação de credenciais.
- [ ] Claude: conferir identidade e responsável legal de Felipe, representação persistida e conteúdo autorizado para Ana; sem login/cobrança do menor. Prova autenticada e releitura pendentes.
- Handoff detalhado: docs/prompts/2026-10-11-pedido-claude-experiencia-familiar.md. Bloqueio deste corte: responsabilidade mantida com Claude; fontes e isolamento ainda não comprovados.

## Núcleo — formulário pai e irmã da Ana (10/10/2026)
- [x] Ajustar apenas adicionar/editar membro na rota existente, com campos e writers atuais.
- [x] Documentar PEDIDO AO CLAUDE: requerente não é gravável; nenhum papel substituído.
- [x] Capturar formulários autenticados em 375/1280; build OK, sem overflow/erros de página, sem salvar dados, integrar ou publicar.
- [ ] Gravação de requerente — bloqueada pelos contratos/restrições atuais; adequação a cargo do Claude em branch própria.

## Desk — aplicação do de-para v4 (07/10/2026)
- [x] Primeiro corte: Caso 360 com linha do tempo, participantes e rosca do dossiê reutilizados do kit; cabeçalho legível; dados e oito seções preservados.
- [x] Validar testes e capturas do primeiro corte em desktop e 375 px: 55 testes passaram, build OK, releitura e ausência de overflow conferidas; parada para aprovação antes das outras superfícies.
- [ ] Próximos cortes: Checklist, Pessoa, Radar, Pesquisa, Financeiro/Jurídico, Famílias, Acesso, Marketing/Alertas/Biblioteca; Hoje aguarda decisão sobre a fonte viva.

## Revisão da prancha enviada (05/10/2026)
- [x] Padronizar o rótulo de microentrega para “Da nossa jornada”, título Legado e subtítulo neutro da Árvore; melhorar legibilidade da barra sem mudar as sete abas.
- [x] Árvore com conteúdo exibe somente gerações publicadas e G1; sem conteúdo mantém a estrutura visual de espera, sem nomes inventados.
- [x] Conferidas sete telas autenticadas em 375/1280 e recarga: 49 testes, build OK, zero overflow/pageerrors e toque mínimo 52 × 64 px. Seis nomes aparecem nas publicações; assinatura publicada aparece na Conta. Data 15/09 é de publicação, não previsão.
- [ ] Nós nomeados/Pessoas conectadas no espelho: leitor master não seleciona pessoa_id/geracao_cliente; correção do reader é corte separado, não inferir posições a partir de nomes. Não comprovada ausência desses dados na fonte.
- [ ] G6/G7: limite de publicação e leitura atual é G1–G5; ampliação depende de corte separado do responsável pelo banco, sem alterar validação neste corte de UI.

## Revisão do App da Ana e publicação familiar (01/10/2026)
- [x] Conferir quatro perfis, vínculos e gerações entre cadastro, pesquisa e projeções: quatro perfis internos, três identidades não revisadas, uma relação declarada sem prova e nenhuma geração registrada.
- [x] Alinhar apresentação e texto das sete abas ao roteiro sem transformar exemplos do mockup em parentescos, eventos, datas ou marcos reais.
- [ ] Publicar pessoas na Árvore e marco na Jornada — bloqueado por perfis não aprovados, vínculos sem validação, gerações ausentes e marco não liberado; requer decisão humana individual e fonte.
- [ ] Após publicação verificável da Ana: prova de salvar/recarregar no Desk e prévia do contrato v2; não criar/assinar/enviar contrato sem aprovação separada.

## App Cliente fiel ao mockup de 17 páginas (30/09/2026)
- [x] Primeiro corte, Home: cabeçalho com nome da aba, cartão da história real da Ana e estados de espera próprios para próximo passo e achados não publicados; conferir 375 px e desktop.
- [ ] Validar compilação integral: bloqueada por erros de tipo preexistentes em `__root` e rotas internas do Desk após atualização de dependências, fora deste corte visual.
- [ ] Após aprovação visual da Home, avançar uma tela por vez: Jornada, Radar, Árvore, Documentos, Legado e Conta, sem criar dados ou publicações.

## Jornada do App fiel ao mockup (30/09/2026)
- [x] Unir Linha Ancestral, Momentos de União e Linha do Processo por eixo dourado em 375 px e desktop, com vazios únicos e links só para material liberado.
- [x] Conferir testes, compilação e capturas autenticadas nas duas larguras; parar para aprovação visual.

## Shell global do App Cliente (28/09/2026)
- [x] Alinhar a moldura das sete telas ao celular 375 px e à coluna central no computador, sem alterar dados ou rotas.
- [x] Conferir Home e Jornada nas duas larguras e entregar capturas para aprovação.

## Revisão textual e capturas do App Cliente (26/09/2026)
- [x] Comparar textos das sete telas com o roteiro aprovado e ajustar cartões narrativos sem alterar fontes ou permissões.
- [x] Capturar sete telas em 375 px e desktop com sessão master e caso real, distinguindo conteúdo do caso de estados vazios, e entregar imagens para aprovação.
- [ ] Capturas de conteúdo publicado em todas as telas dependem de material real já aprovado e liberado; não criar conteúdo apenas para preencher a prévia.

- [x] Consolidar o kit visual exportável aprovado, com tokens Pantone isolados e componentes reutilizáveis.
- [x] Preservar as 15 prévias e as 7 telas canônicas do App Cliente.
- [x] Conectar Hoje, CRM, Caso 360, Pesquisa, Biblioteca, Financeiro e Jurídico aos dados reais existentes, sem criar registros fictícios.
- [x] Gerar pacote exportável com código, assets locais e dependências mínimas.
- [x] Validar compilação e integridade do pacote exportável. A validação autenticada de navegador depende de uma sessão de proprietária disponível.
- [x] Aplicar o kit em Pessoas & Famílias com resumo visual derivado dos registros reais.
- [x] Aplicar o kit em Configuração & Acesso Master sem alterar autoridade ou papéis.
- [x] Aplicar o kit na área de Documentos mantendo fonte, evidência e publicação separadas.
- [x] Centralizar cadências vencidas, casos sem próxima ação e leads parados em Alertas, preservando as fontes de origem.
- [x] Conectar a fila editorial da Biblioteca a uma tela de Microentregas com status, responsável, prazo e detalhe real.
- [x] Validar compilação, rotas e estados de leitura das novas superfícies.
- [x] Ligar os cartões de Hoje e a fila da Biblioteca às fontes reais do Desk.
- [ ] Publicar o App Cliente e conferir etapa, próxima ação e microentrega publicada em tela real.
- [x] Completar o pente-fino visual das 15 prévias contra o mockup aprovado de 17 páginas, preservando 6 grupos do Desk e 7 telas do App Cliente.
- [x] Validar visualmente as prévias atualizadas em desktop e mobile.
- [x] Aplicar no Desk os modelos gráficos aprovados de família, marketing, comercial, pesquisa, acervo, financeiro e jurídico, sem alterar o App Cliente.
- [x] Gerar prancha visual das 15 superfícies do Desk e pacote reutilizável com tokens, gráficos, assets e instruções.
- [x] Revisar App Cliente e Desk tela a tela contra o mockup de 17 páginas, validar os radares e entregar PDF comparativo da versão anterior versus publicação verificável.
- [ ] Unificar, na tela Radar Interno, a matriz geral e o Radar Individual por caso conforme a página 15 do mockup, validar em sessão autenticada e publicar para revisão.
- [x] Conectar o Radar Individual de cada Caso 360 aos dados reais, com status e ações, atualizar o PDF comparativo anterior × atual e publicar ambos para revisão.
- [x] Consolidar o Kit Visual de aprovação com a nova paleta, componentes TSX/CSS e 13 superfícies do Desk, sem backend ou publicação.
- [x] Gerar a exportação única final com pranchas A3, componentes, tokens, logos, exemplos, mapas, licenças e checksums.
- [x] Atualizar a prancha visual do Desk com o Radar Individual aprovado e a matriz nominal por urgência e elegibilidade.
- [x] Gerar ZIP do Kit Visual do Desk e ZIP do Kit Visual do App Cliente (7 telas) para aprovação.
- [x] Revisar o kit final contra o Radar atual, incluindo matriz nominal e Radar Individual operacional, sem alterar dados ou regras.

## Kit visual ligado a dados reais (13/09/2026)
- Caso 360, Pessoa, Microentregas e Radar usam componentes do kit lendo tabelas canônicas (crm_casos, clientes/nucleo_membros/documents, app_projections). Sem tabela nova.
- Pendente: prova autenticada na UI pela Proprietária (sessão de teste do agente cai em /equipe/entrar por falta de acesso de equipe).

## Limpeza do Desk publicado (14/09/2026)
- [x] Remover a montagem empilhada entre o kit visual novo e as telas antigas em Hoje, Comercial, Pesquisa/Biblioteca, Formalização & Financeiro e Governança.
- [x] Retirar da operação diária inventários técnicos, motores P0–P11 e fases explicativas, preservando as ações e leituras reais.
- [x] Substituir a primeira leitura das cinco superfícies pelo novo Desk conectado, deixando as rotinas reais em áreas operacionais recolhidas e sem sobreposição.
- [x] Retirar do Hoje a composição histórica longa (`PainelDia`), que ainda podia reabrir Caso em destaque, Jornada, cadência, revisão jurídica e filas antigas abaixo da superfície nova.
- [ ] Validar as cinco superfícies em celular e desktop, sem sobreposição, dados demonstrativos ou regressão de acesso.

## Patch global de responsividade do Desk (14/09/2026)
- [x] Escopar contenção horizontal ao shell autenticado, sem alterar dados ou rotas.
- [x] Manter sidebar em drawer fechado abaixo de 768px e ocultar launchers flutuantes no mobile.
- [x] Tornar bases de cards, inputs, grids, filtros, textos longos e tabelas resilientes entre 320–430px.
- [ ] Capturar e comparar as seis rotas autenticadas; bloqueado enquanto a sessão de teste redirecionar para `/equipe/entrar`.

## Superfície de go-live (14/09/2026)
- [x] Shell novo `/golive` (Hoje, Caso Ana, Pesquisa, Formalização, Configurações, App Cliente) lendo só `CA-CID-AT-FAM-2026-001`
- [x] Publicação manual de microentrega reaproveitando `publicarProjecaoApp`
- [ ] Prova autenticada da Proprietária (prints inicial/ação/confirmação/releitura)

## Mapa Ana: Lead → App Cliente (14/09/2026, somente leitura)
- [ ] Mapear os 12 marcos (Lead → Portal/App) com rota, CTA entrada/saída, o que se vê, estado vazio, estado visual e print mobile.
- [ ] Conferir as 11 superfícies do Desk e as 7 abas do App da prancha v3, marcando lacunas e telas com demo/teste/alerta técnico/catálogo/blocos repetidos.
- [ ] Entregar `mapa-ana-lead-app-visual` (Markdown + PDF). Sem implementar, sem corrigir.
- [ ] Revisar a proposta contra a prancha v3 (contrato): Desk cobre 11 contextos (Hoje, Comercial, Kanban, Caso 360, Pessoa 360, Radar, Pesquisa, Financeiro, Jurídico, Pessoas, Portal/Config Master) e App mantém 7 abas. Nada removido: Discovery/Calls, funil/handoff, Kanban, Pessoa 360, Pessoas/núcleos, Radar, Financeiro próprio, Jurídico completo e convite real do cliente.

## Pesquisa e Biblioteca (15/09/2026)
- [ ] Pesquisa do caso: 3 blocos (cobertura por fonte, produção de evidência, fila editorial) na cadeia Pergunta → Fonte → Evidência → Achado → Revisão → Publicação
- [ ] Biblioteca como acervo/fila editorial, nunca segundo motor de pesquisa

## Prova funcional + 7 abas do App (15/09/2026)
- [ ] Prova Lead→App do caso Ana com antes/depois
- [ ] Verificar e completar as 7 abas do App Cliente

## Aceite P0 Comercial (2026-09-15)
- [ ] Conferir diff e execução dos testes P0 no main
- [ ] Testes extras P0: sobrenome legítimo com "Teste", call remarcada, no-show, call só com data (timezone da organização), proposta com contato anterior/posterior, aviso de limite 200
- [ ] Prova controlada Novo Lead -> id -> reload -> Funil/Kanban/Discovery/Calls (requer autorização explícita; cria registro)
- [ ] Depois da prova: patch Discovery + Call no mesmo lead (writer único, roteiro progressivo)

## App Cliente — fidelidade à prancha aprovada (2026-09-15)
- [ ] Revisar cor e layout do App Cliente (desktop e mobile) contra a prancha "Prancha de aceite · App Cliente" (7 telas canônicas)
- [ ] Cabeçalho navy com marca, subtítulo "Aplicativo da família" e título/descrição por aba
- [ ] Cartões creme com rótulo dourado em maiúsculas e títulos em serifa

## Ficha Ana — papéis, duplicidades e próxima ação (2026-09-15)
- [ ] Papéis operacionais do núcleo (titular, participantes signatários, dependente, pessoa em revisão) — sem inferir parentesco genealógico
- [ ] Duplicidades: mostrar IDs e fontes de Prancha 1 e Vínculo materno Silveira ANTES de arquivar
- [ ] Próxima ação sucessora da vencida em 22/08 — aguardando título, responsável, prazo e estado
- [ ] Acesso/primeira projeção — aguardando escolha de autorização (nenhuma caixa marcada)

## Papéis do núcleo e duplicados (15/09/2026)
- [ ] Atualizar papéis de Ana, Adair, Alice e Felipe no App e mostrar Árvore, Documentos e Legado.
- [ ] Comparar os dois registros "Prancha 1" e os dois "Vínculo materno Silveira" com IDs, fontes e recomendação de arquivar/manter.
- [ ] Conferir o App Cliente contra a prancha visual e o mockup mobile.

## Desk — Hoje, navegação e Biblioteca (15/09/2026)
- [x] Consolidar em Hoje os quatro KPIs reais de Hoje, Comercial, Kanban, Pesquisa, Financeiro, Jurídico e Portal.
- [x] Aplicar cabeçalho navy e menu móvel dos seis grupos em duas colunas, preservando permissões e subitens.
- [x] Criar as seis entradas da Biblioteca Mestre com contagens reais ou vazio honesto: Acervo, Bases Genealógicas, Dicionários, Trilhas Jurídicas, Modelos e Referências.
- [ ] Validar `/painel` e `/biblioteca` em desktop e 375 px, sem rolagem horizontal — bloqueado temporariamente pela manutenção do acesso autenticado.

## Desk — mais cards, padrão aprovado (16/09/2026)
- [x] Manter o shell e o padrão visual já aprovados do Desk; nenhuma troca de grade global.
- [x] Acrescentar apenas cards, com fonte real e vazio honesto, em Hoje, Pesquisa e Financeiro (Comercial já tinha oito cards).
- [x] Entregar antes/depois em desktop, 390 px e 375 px.

## Desk — correção integral da prancha v6 (16/09/2026)
- [x] Aplicar faixas de até quatro KPIs nas 15 superfícies, com fonte, fórmula, período e estado recolhidos.
- [x] Remover gráficos indevidos e duplicações entre telas donas; corrigir Radar, nomenclatura jurídica e numeração da Formalização.
- [x] Consolidar a Biblioteca Mestre em seis entradas, declarando vazios e fontes compartilhadas sem criar coleções.
- [x] Converter o contrato em superfície única e sequencial, preservando dados e ações existentes.
- [x] Validar as 15 superfícies autenticadas em desktop, 390 px e 375 px, sem overflow nem erros de console.

## Acesso App Cliente (16/09/2026)
- [ ] Corrigir `/acesso/confirmar` preso em “Validando seu acesso” após autenticação e comprovar abertura dos dados.

## P0-1B — callback/sessão/elegibilidade (16/09/2026)
- [x] Auditar, somente leitura, Site URL e Redirect URLs autorizadas para o preview e `/acesso/confirmar`.
- [x] Mapear parâmetros do callback, criação da sessão, timeout, elegibilidade, consulta pendente e falhas engolidas.
- [x] Entregar logs seguros e mascarados com domínio, path, presença de parâmetro, sessão, usuário, elegibilidade e destino.
- [ ] Parar para aprovação antes de nova alteração, configuração Auth, RLS, dados, permissões, convite ou magic link.

## Sistema único: matrizes, App e jornada da Ana (21/09/2026)
- [ ] Consolidar matrizes únicas App e Desk no Design System com referências visuais aprovadas.
- [ ] Alinhar Home, Jornada e Radar às páginas aprovadas sem alterar dados reais.
- [ ] Corrigir e validar Jornada, Radar, Árvore, Legado e Conta no caso real.
- [ ] Fechar a jornada da Ana na superfície contratual contínua, com efeitos separados.
- [ ] Gerar wireframes desktop e 375 px do contrato com inventário real.
- [ ] Validar tipos, testes, build, console e overflow; parar antes de versionar/publicar.

## Corte visual — prancha v4, mockup 17 páginas e contrato Ana (23/09/2026)
- [ ] Gerar nova proposta do wireframe completo da Ana, mais arejada, em desktop e 375 px, sem alterar produto ou dados.
- [ ] Aplicar a prancha visual v4 ao shell e às superfícies oficiais do Desk, preservando seis grupos e toda a lógica existente.
- [ ] Aplicar o mockup aprovado de 17 páginas às rotas oficiais do App, preservando sete abas, estado real e vazios honestos.
- [ ] Começar o acabamento do App por Home e Radar e completar as demais superfícies representadas nas 17 páginas, sem novas rotas.
- [ ] Validar Home, Jornada, Radar, Árvore, Documentos e Conta em desktop e 375 px com sessão master, sem overflow ou erros de console.
- [ ] Registrar cada seção do wireframe completo da Ana em desktop e 375 px, somente leitura.

## Sanear o Desk V4 (02/10/2026)
- [x] Passo 0 — sincronização confirmada
- [x] Passo 1 — menu V4 de 7 itens (aguarda aprovação)
- [ ] Passo 2 — um único Painel Hoje
- [ ] Passo 3 — hipóteses num só bloco
- [ ] Passo 4 — demonstração fora do caso real (interruptor)
- [ ] Passo 5 — opções controladas nos campos
- [ ] Passo 6 — Configuração e Governança reduzidas
- [ ] Pedido anterior (cortes 1–4: gravação Passo 5, dicionário, hipótese só leitura no servidor, arquivar DEMO) — fundido nos passos acima

## Paridade visual final do App Cliente (04/10/2026)
- [x] Conferir as sete telas oficiais em 375 e 1280 px, sem inventar publicações nem alterar navegação, dados ou regras de acesso.
- [x] Ajustar Home, Radar, Árvore e Legado onde havia divergência visual ou texto interno; preservar as demais telas e os estados honestos.
- [x] Capturar as 14 telas autenticadas, validar ausência de overflow e erros de página, e executar testes visuais direcionados.
- [ ] Aprovação visual das 14 capturas pela Proprietária; não publicar sem aprovação.

## Elementos faltantes do App Cliente (05/10/2026)
- [x] Usar somente leituras existentes e publicações autorizadas nas sete abas; sem gravar dados, criar rotas ou liberar conteúdos.
- [x] Home: pedido documental e microentrega publicados, aviso de achado e progresso existente; Jornada: marcos já aprovados na linha do processo; Radar: resumos dos seis eixos; Árvore: detalhe expansível de pessoa publicada; Documentos: contagem de pedidos abertos; Legado: materiais já publicados classificados nas coleções; Conta: manter plano e origem somente quando disponíveis.
- [ ] Heatmap por país, aderência, vínculos/estado do elo, datas/localidades/lacunas/correções, originais da Biblioteca, entrevistas, acessos individuais e pagamentos: exigem projeções sanitizadas e permissões específicas; não inferir de dados internos nem simular publicação.
- [ ] Aprovação visual da Proprietária antes de qualquer publicação.

## Pranchas comparativas do App (05/10/2026)
- [x] Conferir as sete abas em 375 e 1280 px com o mockup real; retirar texto interno de microentrega/marco e o teto teórico do Radar.
- [x] Entregar sete pranchas comparativas sem publicar novo conteúdo.
- [ ] Conferir os ajustes finais de composição visual em 375 e 1280 px; aguardar aprovação visual antes de publicar conteúdo.

## Paridade UI do App P1–P4 (05/10/2026)
- [x] Corte isolado 11/10: apresentação de adicionar/editar membro do núcleo da Ana verificada em sessão da Proprietária, quatro capturas 375/1280, sem salvar dados; gravação de Requerente permanece com Claude, aprovação visual aguarda a Proprietária.
- [x] P1 Home: progresso condicional, grade desktop e documento/microentrega somente com conteúdo disponível.
- [x] P2 Jornada: história, união e processo em sequência conectada; régua somente com fase visível.
- [x] P3 Radar e Árvore: hexágono e seis dimensões preservados, nós expansíveis com vínculo publicado ou ausência explícita. Heatmap não exibido sem projeção autorizada.
- [x] P4 Documentos, Legado e Conta: coleções diferenciadas por token existente; itens e plano continuam condicionais, sem ações falsas.
- [x] Validados 68 testes direcionados, compilação registrada OK e 14 capturas a 375/1280 sem overflow ou erro de página. Heatmap de países/ramos, correção na árvore e preferências permanecem ocultos: não há projeção autorizada ou ação existente para sustentá-los. Sem publicação.

## WhatsApp e publicação (13/10/2026)
- [x] Botão WhatsApp 11 98838-4907 na Conta do App e no Caso 360 (fonte única).
- [x] Etapa Jurídica "Em andamento" aprovada pela Proprietária.
- [ ] P0 fixtures (árvore Otto/Elsa, 5 certidões, régua 60%, #F8F9FA): não aplicado — contradiz dados aprovados.

## 13/10 — Desk V4 / caso Ana
- [ ] Marcos 1895/1938–39/1941/2026 publicados (aguarda: Otto x Franz em 1895)
- [ ] Vínculos (aguarda: Cristiane x Ana Maria como mãe de Ana Luiza)
- [ ] Documentos liberados (aguarda: arquivos enviados)
- [ ] Paleta antiga x aprovada; Franz/Ruth na Árvore (aguarda decisão)
- [x] Marco 1895: Franz Friedmann → Otto Reimer (linha direta)
- [ ] Régua 60% + cartões de documentos do fallback — bloqueado: dados não registrados no caso (decisão da Proprietária)

- [x] Desk: novo de-para de conteúdo com prints de todas as telas atuais (topo ao rodapé); App em pausa
- [x] Desk: localizar mockup da tela de Marketing (V4) — wireframes-desk-13

- [x] Rodada 4 (varredura WhatsApp, brief Discovery, GoLive, marcos jurídicos na Validação Jurídica, paleta ampliada) — PDF entregue
- [x] Prancha V4 com telas reais (7 grupos V4, decisão 18/10) — PDF entregue, sem mudar telas

- [x] De-para Desk V4 revisado (18/10): inventário das 91 telas, Biblioteca Mestre como alimento vivo, dicionários, ordem Discovery — PDF de-para-desk-v4-revisado-2026-10-18.pdf na coleção de estudos
- [ ] Decisões da Proprietária: GoLive no de-para, modelos contratuais no lote C, etiquetas na Biblioteca, pergunta 20 fora da call, autorização do Corte 1
- [x] De-para completo 91 telas + jornada do cliente (18/10): de-para-completo-91-telas-e-jornada-2026-10-18.pdf em Arquivos e na coleção; GoLive marcado como painel interno
- [ ] Drive/Perplexity: conector não envia binário — Proprietária arrasta o PDF para a pasta do Drive
- [x] Mapa de rotas V4 + canos da jornada 8 fases (18/10): dois diagramas .mmd em Arquivos e na coleção

## 18/10/2026 — Jornada viva da Ana (novo pedido)
- [x] Corte isolado L03: filtros no início, identidade/resumo e uma seção da ficha em foco, mantendo campos montados, Scan, templates e gravadores.
- [x] Corte isolado L04: Antes/Durante/Revisão locais com o lead persistido, SPIN e ajuda existentes; gravação por campo preservada.
- [x] L08 parcial: contexto read-only do instrumento, versões, assinatura não registrada e retorno ao Caso360; leitura móvel corrigida sem alterar shell/menu global.
- [x] Lead canônico da Ana conferido por vínculo de caso; Calls, validação jurídica, proposta aprovada, Caso360 e contrato em revisão abertos sem acionar escritores.
- [x] Testes focados: 5 arquivos / 75 testes; capturas autenticadas 375/1280 antes/depois; build automático OK. Comparação com V4 distingue proposta visual de dados atuais.
- [ ] PEDIDO AO CLAUDE — L08: leitor da cadeia busca o contrato mas não retorna seu ID; expor vínculo canônico para ponte Caso360→instrumento sem selecionar por nome.
- [ ] PEDIDO AO CLAUDE — L08: cinco cartões exigem payload do preparador que pode inserir/atualizar ao abrir; fornecer leitura pura compatível antes de montá-los no Caso360.
- [ ] PEDIDO AO CLAUDE — CRM: clique de saída contextual não concluiu em ficha limpa no teste; destino por URL confirmado, sem alterar bloqueador/rascunhos neste corte.
- [ ] Prova de gravação, exportação vigente e COMPROVADO_EM_USO: dependem de autorização específica e conferência pessoal da Proprietária; não executados.
- App congelado, documentos reservados; nada aceito, integrado, publicado ou assinado por este corte. Demais tarefas históricas abaixo permanecem fora do escopo autorizado.
- L02 entregue. Leitura atual confirmou lead vinculado ao caso, proposta v1 aprovada e contrato vigente em revisão humana, sem assinatura. Preparador excluído da auditoria por gravar na abertura; alterações de lógica L05/L06 e demais cortes não incluídas neste corte visual.

## 18/10/2026 — Mockup V4 do dia a dia (11 telas) — revisão após a jornada da Ana
- [ ] Revisar o último mockup após concluir a jornada da Ana: rejeitado pela Proprietária às 22:04 UTC por não corresponder às sugestões anteriores nem às cascas originais do Desk V4. A entrega anterior não comprova paridade.
- [ ] Comparar peça a peça as 11 telas com as cascas V4 originais e sugestões das rodadas 1–4; apresentar cobertura, divergências e novas capturas para aprovação, sem publicar ou integrar.

## 18/10/2026 às 23:18 UTC — Todas as telas com cascas V4 reais
- [ ] Recompor o mockup de todas as superfícies e estados contextuais do Desk, não limitado às onze principais nem à prancha aprovada: resgatar cascas/componentes/estudos V4 reais por tela. Em execução no rascunho isolado “Desk — todas as telas com cascas V4 reais” (drft_01m58n10hyefm9sz2m3rz46dxh), sem integrar/publicar.
- [ ] Entregar inventário completo com origem da casca e comparação antes/depois em 375/1280, PDF e imagens conferidas; distinguir captura atual, referência histórica e proposta.
- App congelado; sem produto paralelo, integração, escrita de dados, assinatura ou publicação. Telas não recuperadas devem constar como pendências explícitas, nunca cobertura presumida.

- [ ] 19/10/2026 00:04 UTC — Comparar mockup (drft_01m58n10hyefm9sz2m3rz46dxh) com prancha V4 tela a tela, sem publicar; contrato autorizado a gravar rascunho interno da Ana. Aguarda o draft terminar.

## 19/10 — Mockup Desk V4 completo (draft drft_01m58xcem1fgk9dyps5y780yh9) — ENTREGUE
- [x] Contrato: 6 marcos em cards + resumo familiar (cards-fluxo-contrato.tsx)
- [x] L08: marcos no Caso 360 Formalização (cards-contrato-caso.tsx, leitura pura)
- [x] L03: identidade visível + área única de edição em leads.tsx
- [x] L04: três momentos (Antes/Durante/Revisão) em calls.tsx
- [x] Contexto como alimento: FonteAlimento em 9 superfícies
- [x] Kanban de tarefas por status (leitura) em tarefas.tsx
- [x] Antes/depois 375/1280 + PDF MOCKUP (30 págs) entregue; typecheck limpo; 53 testes OK; build OK; HEAD 9d4eba54
- [ ] Falta: gavetas abertas, árvore com linhas ligadas, radar/matriz, funil, fluxo de publicação, L01 (aguarda aprovação)
- [ ] Bug pré-existente: título do contrato quebra verticalmente a 375 px (já existia antes)

## 19/10 — Mockup Desk V4 completo (draft drft_01m58xcem1fgk9dyps5y780yh9)
- [ ] Modelos V4 próprios por tela do Desk (cascas reais: previa-desk-telas, desk-mockup, clube-ancestral-kit).
- [ ] Capturas: gavetas abertas, árvore com linhas, radar/matriz, funil, fluxo de publicação.
- [ ] Contrato da Ana: 6 marcos em cards + resumo com leitura familiar (pode gravar rascunho interno; nunca enviar/assinar/cobrar).
- [ ] Cortes de ficha: L03 (leads), L04 (Calls Antes/Durante/Revisão + SPIN), L08 (cards do contrato no Caso 360).
- [ ] Contextos como alimento visível (dicionários, gavetas, Biblioteca, planejador): origem e consumidor em cada superfície.
- [ ] Entrega: antes/depois 375/1280/1440 autenticado, PDF com selo MOCKUP, typecheck + testes, SHA e pendências.
- Regras: sem rotas novas, sem dados inventados, 14 itens reservados, R$ 9.600 = previsão, sem migration/RLS/publicação/merge; não tocar painel-dia.tsx nem golive-*; App /portal congelado.

## 18/10/2026 23:18 UTC — Recomposição de todas as superfícies Desk
- [x] Inventário fonte-referenciado: 90 padrões + layout, 87 padrões Desk incluídos; 213 estados listados, não todos capturados.
- [ ] Resgatar cascas originais V4 e rodadas 1–4, com fonte por composição; preservar mockup rejeitado como histórico.
- [ ] Produzir proposta isolada em PNG/PDF 1280/375 com antes autenticado, referência original, depois e matriz de cobertura; inspecionar cada página.
- [ ] Organizar na coleção existente e entregar cobertura exata e bloqueios; nenhum produto, dado, App ou publicação alterado.
- Jornada anterior: L03/L04 apresentação no draft separado f8aae013; L08 bloqueado pela abertura escritora, contrato não assinado. Não incorporado.
- [x] Entrega parcial v2: 174 propostas PNG 1280/375 e PDF de 212 páginas; todas vistas em 14 folhas de contato. Matriz explicita faltas; não declarar recomposição integral.
- [ ] Antes/depois público: bloqueado pela verificação de privacidade incompleta nos pixels; comparativos retidos em /tmp, não compartilhados.
- [ ] Paridade peça a peça: faltam timeline/rosca Caso 360, funil CRM, matriz nominal/radar, árvore com arestas confirmadas, contrato contínuo e gavetas/subáreas específicas; templates de família não substituem essas cascas.
- [ ] PEDIDO AO CLAUDE: preparador grava na carga; separar leitura somente com autorização própria. Pesquisa módulo tem erro de hooks; Pesquisa/Privacidade em carregamento. Nenhuma correção no produto neste turno.

- [x] 19/10/2026 14:32 UTC — Inventário tela a tela (topo→rodapé): online × código × estático, áreas incorporadas, motores migrados, Vercel × Lovable, canos. Mockup completo em pausa (Claude sobe o mockup).
- [x] 19/10/2026 14:43 UTC — Caderno de 24 páginas com propostas visuais por sistema, contextos visíveis e formatos variados; leitura de código não equivale a integração executada.
- [x] 19/10/2026 15:08 UTC — PDF exclusivo do Desk: 34 páginas de capturas DEPOIS arquivadas e complementos, com carregamentos incompletos explicitados. Sem retomar mockup ou publicar.
- [x] 19/10/2026 15:08 UTC — Caderno sistêmico cobre rotas e subabas de pesquisa/contrato em código, cadeia alimento → ação → writer → releitura → consumidor; proposta, não implementação nem prova de uso.
- [x] 19/10/2026 15:17 UTC — Inventário v2 entregue na mesma pasta: 117 endereços, alturas de documento e conteúdo main em 1280/375, gavetas prioritárias abertas, categoria vazio/bloqueado, sessão da Proprietária identificada, erros reconciliados. V1 122 páginas e V2 284 páginas renderizadas e conferidas por folhas de contato; sem submissão manual. Preparador pode escrever automaticamente na carga, não auditado como ausência de escrita.
- [ ] Prova de gravação com F5/releitura, login cliente e equivalência Vercel atual: não executadas nesta auditoria de leitura; exigem teste autorizado e configuração atual comparável.

## Plano executável App/Desk (24/10/2026) — `docs/prompts/2026-10-24-plano-executavel-app-desk-lovable.md`
- [x] EXEC-00 plano registrado no histórico
- [x] EXEC-01 `resolverBloqueioPiloto` já montado em `/onboarding/$id` (12 testes ok); prova autenticada pendente da Proprietária
- [x] EXEC-05 `/golive/app`: "Ver proposta" abre a prévia do mesmo caso; pendência `/piloto-ana` → `/casos`
- [ ] EXEC-02 contrato/cobrança — bloqueado: envio para assinatura e cobrança exigem autorização específica
- [ ] EXEC-03 documentos reais — acervo recebido localizado nos uploads e já vinculado à Ana; PDFs internos conferidos, sem certidões ou versões sanitizadas localizadas. Não duplicar nem publicar material interno; recuperação da leitura no armazenamento ainda pendente
- [ ] EXEC-04 sete abas do App — aguarda conteúdo do EXEC-03 e liberação do congelamento por aba
- [ ] EXEC-07 homologação final — depende de login real da Ana
- [x] Acervo recebido (24/10): localizados Registro Unificado PDF/texto e Dossiê Consolidado PDF em uploads/mirror; mesmos nomes/conteúdos/tamanhos das três referências de evidencias já vinculadas à Ana. Nenhuma duplicação, upload ou alteração de acesso executada.
- [ ] Mostrar acervo em Documentos: BLOQUEADO_POR_DADO — os três recebidos são material interno; não localizadas certidões nem versões sanitizadas para entrega à família. Leitura temporária do armazenamento retornou NoSuchKey nesta sessão; sem substituir diagnóstico por exposição de conteúdo interno.

- [x] 30/10: Rascunho interno v3 do contrato da Ana gerado pelo botão Salvar rascunho. Aberto: itens de escopo ainda trazem o rateio antigo 4.800/2.400 (aguarda decisão da Proprietária).
- [x] 30/10: Trocar o rateio do escopo (3 linhas → R$ 3.200 com nome completo) e gerar a v4
- [x] 30/10: Árvore inteira no celular + publicar
