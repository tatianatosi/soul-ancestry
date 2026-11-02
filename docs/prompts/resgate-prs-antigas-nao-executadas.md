# Resgate das PRs antigas — continuidade conferida
Status: em revisão
Versão: v2.0
Data: 2026-11-02
Responsável pela decisão: Proprietária do Clube Ancestral
Fontes: leituras GitHub das PRs #200, #173, #151, #199 e #32; main: supabase/pendentes/README.md; src/lib/__tests__/g02-releitura-estrita-2026-10-30.test.ts.
Escopo: recuperar capacidades sem repetir entregas ou descartar PRs por antiguidade. Produção exclusivamente no Lovable.
Premissas: conflito não prova obsolescência; preservar mockups, dados e requisitos aprovados.
Limites: esta conferência é do GitHub, não do banco vivo ou navegador. Nenhum teste foi executado nesta sessão. Este documento não autoriza automaticamente merge, SQL, fechamento de PR ou publicação.

## Etapas já integradas
- #200 mesclada em 30/10 às 15:11:43Z. Não repetir merge. Sync Guard não garante impedir todo push direto; conferir proteções efetivas.
- #173 mesclada em 30/10 às 15:33:18Z. README registra aplicação do SQL em 30/10 com policy adaptada para has_org_role, porque has_role não existe no banco. Arquivo de migration ainda contém has_role: não reaplicar literalmente. Banco aplicado é registro documental, não nova verificação do Postgres.
- #151 mesclada em 30/10 às 15:13:12Z. Não repetir merge nem restaurar placeholders de documentos. Validar comportamento atual e arquivos autorizados sem publicação automática.
- #199 mesclada em 30/10 às 18:49:27Z, incluindo resgate da releitura estrita da #32 e pipeline na branch atual. Teste dedicado existe em main. Retirada a ordem de fechar #199 como redundante.

## Pendência de resgate
A #32 continua aberta e sua base é fix/caso-canonico-salvamento-operacional, não main. Não mesclar cegamente: cotejar suas oito alterações contra main, inclusive releitura, decisão pós-salvamento, tarefas do caso, abertura de contrato e ajustes mobile. Reaproveitar o que já existe; resgatar somente diferenças necessárias em branch de integração. Não fechar PRs ou arquivar branches enquanto faltar destino comprovado para cada capacidade.

## Banco e lançamento
README registra três documentos liberados com curadoria pendente e ausência de acesso de cliente na medição de 30/10. Não extrapolar isso para o estado de hoje. Conferir conteúdo e permissões atuais no Lovable; não recriar documentos ou reaplicar SQL por checklist. Publicação não congela código nem comprova integração.

## Próximos passos e critério de aceite
Para cada capacidade da #32: registrar origem, estado em main, diferença necessária, teste e prova de uso. Executar testes pertinentes sem apagá-los para obter verde; demonstrar salvamento, releitura após F5 e tarefa no mesmo caso em Ops/Hoje. Submeter escritas resolvidas à aprovação específica. Sem force-push, descarte por idade ou nova auditoria geral em lugar da implementação.
