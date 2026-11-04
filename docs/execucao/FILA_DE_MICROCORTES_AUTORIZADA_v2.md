# FILA DE MICROCORTES AUTORIZADA v2 — Clube Ancestral (soul-ancestry)
Prevalece DECISOES_JA_TOMADAS_E_AJUSTES_FILA.md onde houver diferença.

## AUTORIZAÇÃO PERMANENTE
A Proprietária autoriza, para TODOS os itens, sem pedir nova aprovação item a item: criar branch claude/<id>, commitar, abrir PR e mesclar na main (merge comum) quando tsc, suíte, build, guard e label estiverem verdes; e seguir ao item seguinte.
Continua exigindo a palavra dela, e só estes: migration, RLS, convite, publicação no Lovable, envio externo, cobrança, assinatura, exclusão de dado.
Proibido: auditoria, inventário, relatório, plano, "PARE PARA APROVAÇÃO", responder que o escopo é grande. Item já feito: JÁ FEITO com o link do commit. Item que falhar: uma linha com a causa e siga ao próximo independente.
Matriz do PR: só critérios que o CI prova. Cada item: até 3 arquivos e um teste que falha antes e passa depois.
Regra de nomes: antes de gravar qualquer literal (status, papel, tipo), conferir o vocabulário real no CHECK da migration e em types.ts. Nunca inventar valor nem criar CHECK novo (AGENTS.md).

## BLOCO A — Autoridade: a proprietária nunca é bloqueada
A01 modo-proprietaria.ts: ehProprietariaAdministradora aceita "admin" e "proprietaria_administradora" (como o servidor). Conferir antes modo-proprietaria.test.ts.
A02 [FEITO nesta PR] autoridade.server.ts: proprietariaOperando lê todas as linhas de staff_access.
A03 [FEITO nesta PR] pesquisa-assistente.ts: aceita autorizada_interna e autorizada_externa.
A04 saas.functions.ts getContexto: staff_access sem maybeSingle, linha ativa mais recente, erro legível.
A05 escopo-conferencia.server.ts exigirGate: a proprietária assume a pendência com auditoria (conferir se já existe).
A06 Log de negação: ação bloqueada (decidirAcao=bloquear, gate recusado, 409) grava audit_logs com usuário, ação, motivo e tela.
A07 Ficha do caso: componente RegistrarAutorizacaoPesquisa; incluir estado_de_autorizacao_pesquisa em CAMPOS_PERMITIDOS de crm_casos.
A08 Teste do invariante: para a proprietária nenhum caminho devolve "bloquear" salvo falta de identidade ou organização.
A09 /qualidade legível para a proprietária: preparar o SQL de RLS e pedi-lo ao Lovable.

## BLOCO B — Contrato: criar, ler, salvar, enviar, cancelar, liberar para assinatura
B01 Texto integral (HTML da versão atual) + PDF/DOCX. B02 Salvar rascunho = salvar edição; Nova versão separada. B03 Cancelar contrato com motivo (distinto de Arquivar). B04 Enviar ao cliente leva a /atendimento?rascunho=<id>. B05 Card "Decisão humana atual" e selo "sem atos externos" acima da dobra. B06 Sete cards (Partes, Escopo e entregas, Condições e vigência, Anexos e OS, Texto do contrato, Assinatura, Histórico). B07 375 px em uma coluna. B08 registrarAssinatura cumprindo os triggers; crm_casos.contrato_assinado consistente. B09 Criar contrato a partir do caso. B10 Liberar para assinatura pelo portal (o contrato não aparece nas 7 abas do App).

## BLOCO C — Máscaras e design system
C01 contratos.$id.tsx Partes: CPF, telefone, e-mail por validacao-pessoa.ts e CpfMascarado; validar no cliente e no servidor. C02 contrato.preparar. C03 portal/conta e portal/index. C04 golive.leads, golive.comercial, golive.painel-caso, golive.pessoas (um item por arquivo). C05 Teste que falha com campo de CPF, telefone, CEP ou e-mail sem formatadores (baseline atual). C06 CaCard e tokens em alertas e tarefas; C07 em nucleos e atendimento; C08 em integracoes, proximas-acoes e ops. Cores só por token (Pantone: #13294B, #C2A84D, #F0EEE9).

## BLOCO D — Pesquisa genealógica (coração do app)
D01 Catálogo de fontes com filtros por país, período, tipo de acervo, acesso e grau de automação. D02 Importar a planilha "clube-ancestral-bases-repositorios-intelligence-desk-fase01.xlsx" (21 repositórios, 13 países; Itália 102); "[Verificare]" entra como "Revisar". D03 Recomendação de fonte por caso. D04 Cadeia pergunta, hipótese, fonte, evidência, achado, documento, citação, próxima ação, cada elo gravando e relendo. D05 Só achado confirmado e liberado vai à Árvore e ao Legado.

## BLOCO E — Produtos-pai, famílias, proposta e orçamento
E01 Família de oferta (7 famílias da Arquitetura Única) como texto em product_catalog.familia_comercial, sem CHECK novo. E02 País como parâmetro de proposta e orçamento. E03 Orçamento = produto-pai PP-01..09 + família + composição; preço só do catálogo homologado; pendência visível quando faltar parâmetro. E04 Natureza de cobrança (pontual/recorrente) e tipo_oferta sazonal como atributos. E05 Aposentar o Top 30 da interface (painel-top30.tsx, COMPLEMENTOS_TOP30, governanca.catalogo-operacional-30 como histórico); nada apagado.

## BLOCO F — Painel de Calls e Roteiro de Discovery
F01 SPIN grava por pergunta e relê. F02 Campos do Painel de Calls gravam no lead/call. F03 "Pedido de Proposta" abre handoff para caso e proposta por executarHandoffDiscovery. F04 Marcos Jurídicos por nacionalidade alimentam citizenship_tracks/versioned_legal_rules; não verificado = "Revisar". F05 Próxima ação e prazo do lead no Hoje.

## BLOCO G — Planejador e financeiro
G01 sincronizarPlanejador promove case_plans a ativo. G02 conciliarPagamento só libera com pagamento conciliado e cobrindo a fatura. G03 RPC de bloqueios com erro aparece como erro. G04 gravarComVerificacao: releitura divergente é erro; retry filtra organization_id. G05 Texto humano no lugar de sem_nova_acao_necessaria. G06 a G15: itens abertos do BACKLOG-TAREFAS-AUDITORIAS-2026-11-02.md, fase G (G1.2 a G4.8), um por arquivo.

## BLOCO H — App Cliente, 7 abas
H01 Home, H02 Jornada, H03 Radar, H04 Árvore, H05 Documentos, H06 Legado, H07 Conta. Entregas, Fase 01 e Fase 02 saem do menu; rotas ficam. Cada aba: só o publicado do caso, erro vira aviso, vazio honesto, teste de renderização.

## BLOCO I — Desk (8 grupos de GRUPOS_DESK)
I01 Manter os 8 grupos; atualizar contrato-interface-desk.md e os testes que citam 6 ou 7. I02 a I07 um item por grupo: criar, salvar, publicar e cancelar funcionando e erro de escrita visível. I08 Painel Hoje aponta para as telas do menu, não para /golive.* (conferir hoje); o botão "Nova tela do Desk" sai da home pública.

## BLOCO J — Pessoa unificada e ficha progressiva
J01 Pessoa 360 lê as pessoas de pesquisa pelo vínculo auditado perfil→cliente. J02 Tela de decisão dos três elos de identidade abertos: perfil→cliente, evidência→pessoa, achado→pessoa (decisão humana, nunca por nome). J03 Ficha Única progressiva primeiro na aba Pesquisa do Caso 360; rótulos antigos redirecionam. J04 Ocultar do menu Cliente, Perfil, Participante e Membro como cadastros separados. J05 Painéis de reconciliação de CPF, telefone e CEP visíveis na Pessoa 360.

## BLOCO K — Tabelas e nomes
K01 Mesclar a PR #232 e rodar scripts/reconciliar-vocabulario-banco.mjs; cada achado vira um microcorte. K02 Estender o script para comparações de leitura contra os CHECKs (teria pego "autorizada"). K03 Nada lê research_hypotheses nem evidencias; tudo usa research_case_hypotheses e research_evidence_items. K04 Acesso: uma função só sobre staff_access, user_roles e organization_members. K05 Teste de glossário: rótulos contra docs/design-system/taxonomia-canonica.md. K06 Regenerar types.ts pelo Lovable.

## BLOCO L — Sincronia Lovable, GitHub, Claude
L01 Registrar no AGENTS.md: Lovable publica o branch selecionado; Claude e demais agentes abrem PR contra main, nunca push em main; após "pode publicar", merge comum do SHA publicado de volta; prova /api/saude.sha = origin/main. L02 Remover restos da Vercel e do banco antigo (zsxpd).

## BLOCO M — Guard e PRs
M01 scripts/pr-evidence.mjs: critério de uso real da Proprietária deixa de reprovar o guard. M02 Mesclar #231, #222, #212; fechar #202 e #215. M03 PRs de setembro: conferir se o conteúdo já está na main; portar o que falta; só então fechar. #125 não entra.

## BLOCO N — Erros engolidos
N01 Aplicar o resultado do K01 por arquivo. N03 Escritas com erro engolido (contrato-parametros 1225/1618, jornada-cliente 286, achados-genealogicos 165-172, pessoas-linhagens 354, onboarding 290, handoff-discovery 242), um item por arquivo.

## BLOCO O — Atos da Proprietária (desbloqueiam a Ana depois do Bloco A)
Retirar do App os 3 documentos internos da Ana; decidir os 8 vínculos (padrão P2); registrar a próxima ação real, ativar o plano e enviar o contrato; arquivar o acesso antigo e reconvidar a Ana.

## Ordem
A, depois B, D e J em paralelo; depois C, K e M; depois E, F e G; depois H, I, L e N. Bloco Q (órfãos, PRs e documentos) em paralelo ao Bloco A. O fica com a Proprietária assim que A estiver mesclado.
