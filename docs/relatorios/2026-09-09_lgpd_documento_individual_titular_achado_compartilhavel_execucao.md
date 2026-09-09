# LGPD — Documento individual por titular e achado compartilhável — execução (09/09/2026)

## 1. Decisão da Proprietária (resumo)

> Pessoa é única na jornada. Documento é individual por padrão. Achado é compartilhável apenas quando sanitizado e autorizado.

Pipeline confirmado e implementado: **documento pessoal restrito → equipe analisa em ambiente interno → pode gerar achado/síntese/microentrega → síntese passa por revisão → cliente decide se deseja compartilhar → App mostra só a versão sanitizada e autorizada.**

## 2. Causa raiz encontrada e corrigida

`documents.client_id` (o "titular") já existia como coluna e já era usado pela RLS do portal (`documents_sel_portal`, `client_id = portal_meu_cliente()`) — a arquitetura de acesso por pessoa **já existia**. O problema real: `fn_documents_guard` e o formulário de upload (`painel.tsx`) **preenchiam esse campo automaticamente com o cliente CONTRATANTE do caso** sempre que ninguém escolhia uma pessoa. Um documento de um dependente (ex.: certidão de nascimento de um menor) virava, por padrão, gravado com `client_id` do contratante — e portanto visível no portal dele, nunca por decisão de ninguém, só por omissão.

Confirmado com um teste real no banco (transação revertida, sem alterar dado real):
- Categoria sensível sem titular → **bloqueado** ("exige o titular").
- Categoria sensível com titular → inserido, mas forçado para `visibilidade='interno_restrito'`, `status='pendente'`, `entrega_cliente=false`, mesmo que o formulário pedisse liberado — "individual por padrão" é trava de banco, não opção de tela.
- Tentar liberar (`status='liberado'`) sem consentimento ativo → **bloqueado**.
- Com consentimento ativo registrado → liberação funciona normalmente.
- Categoria não-sensível (contrato, entrega, interno) sem titular escolhido → **preserva o comportamento anterior** (cai no contratante do caso) — não era o problema relatado e não podia regredir.

## 3. O que mudou

### `fn_documents_guard` (trigger em `documents`)
- Não infere mais `client_id` para as 4 categorias sensíveis (identificação, certidão, documento civil, documento financeiro) — exige titular explícito, com mensagem de erro clara.
- Documento sensível nasce sempre `interno_restrito`/`pendente`/`entrega_cliente=false`, independente do que o formulário enviar — "guardar restrito, sem uso externo" é permitido sem consentimento prévio (a decisão explícita da Proprietária).
- Consentimento/exceção formal passam a ser exigidos **só para sair do estado restrito**: liberar ao cliente (`status='liberado'`) **e**, agora também, marcar como entrega (`entrega_cliente=true`) — antes só a primeira transição era guardada.
- Categoria não-sensível mantém o comportamento anterior (default ao contratante do caso) — mudança cirúrgica, não uma reescrita geral.

### Rastreabilidade
- Nova coluna `documents.finalidade` (para que o documento foi recebido) — exigida pela aplicação para categoria sensível.

### Achado (`app_projections`) — visibilidade por pessoa
- Nova coluna `titular_client_id` (pessoa viva/`clientes.id` que vê o achado por padrão quando `visibility_scope='titular'`). Antes, a RLS do portal (`app_proj_select_portal`) não verificava pessoa nenhuma para `visibility_scope='titular'` — qualquer acesso de portal do caso via o achado. `visibility_scope='nucleo'` continua correto e case-wide (é a definição dele, não o bug).
- Achados antigos (sem `titular_client_id` preenchido) mantêm o comportamento de hoje — sem regressão.

### Compartilhamento explícito e granular de achado
- Nova tabela `app_projection_shares`: quem autorizou (titular ou equipe em nome dele), com quem, quando, e data de revogação. RLS: equipe lê/escreve dentro da organização; **o titular autoriza e revoga pelo próprio portal** (a RLS só aceita o insert quando `app_projections.titular_client_id` é o próprio titular logado).
- Compartilhar um achado nunca expõe o documento original — só o `content_sanitized` já aprovado/publicado.
- Novas funções: `registrarCompartilhamentoAchado`/`revogarCompartilhamentoAchado`/`listarCompartilhamentosAchado` (equipe, `biblioteca-evidencias.functions.ts`) e `autorizarCompartilhamentoAchado`/`revogarCompartilhamentoAchadoPortal`/`meusCompartilhamentosDeAchado` (titular, `portal-cliente.functions.ts`).

### Formulário de upload (`components/privacidade/painel.tsx`)
- Adicionado seletor de titular (obrigatório para categoria sensível) e campo de finalidade — antes o formulário nem oferecia escolha de pessoa, só usava o contratante do caso silenciosamente.

## 4. O que NÃO foi alterado

- RLS/consentimento existentes não foram enfraquecidos em nenhum ponto — só o momento em que passam a ser exigidos mudou (guardar vs. liberar).
- `visibilidade`/`status` de documentos já liberados não foram tocados retroativamente — nenhuma migração de dado real, só a trava de escrita daqui em diante.
- Nenhuma tabela de "dossiê" nova foi criada — o dossiê individual já é, na prática, o conjunto de `documents` filtrado por `client_id`; a correção foi garantir que esse filtro reflita a pessoa real.

## 5. Testes

- `src/lib/__tests__/documento-titular-lgpd.test.ts` (5 testes, TypeScript puro): exige titular e finalidade para as 4 categorias sensíveis; categoria não-sensível não exige nada.
- Validação direta no banco (SQL, transação revertida — sem dado real alterado): os 5 cenários da seção 2, todos corretos.
- `npx tsc --noEmit`: limpo. `npx vitest run`: 180 arquivos / 1708 testes, todos passando.

`TESTE_UI_PENDENTE_DE_HOMOLOGACAO` (não executado nesta rodada — sem ambiente de homologação autenticado; nenhum caso real/pagante usado como laboratório):
1. Upload real de documento sensível pelo formulário, escolhendo o titular certo, e confirmar no banco que `client_id` bate com a pessoa escolhida (não com o contratante).
2. Login no portal como um segundo membro da família (não o contratante) e confirmar que não vê o documento sensível do outro.
3. Fluxo completo de compartilhamento de achado: titular autoriza pelo portal, destinatário passa a ver o achado, titular revoga e o destinatário deixa de ver.
4. Nenhuma UI foi construída nesta rodada para o titular acionar `autorizarCompartilhamentoAchado` a partir do App Cliente — as funções de servidor existem e estão protegidas por RLS, mas o botão/tela ainda não existe. Registrado como pendência.

## 6. Reversão

- Migration `20260909040000_lgpd_documento_individual_titular_e_achado_compartilhavel.sql` (+ ajuste `updated_by` em `app_projection_shares`): toda aditiva (colunas nullable, tabela nova, funções/policies substituídas). Reversão possível via `DROP TABLE app_projection_shares`, `DROP COLUMN` nas duas colunas novas, e restaurar a versão anterior de `fn_documents_guard`/`app_proj_select_portal` a partir do histórico de migrations.
- Nenhum dado real foi alterado — só a trava de escrita e a leitura via RLS mudaram.

## 7. Pendências para a Proprietária

1. UI no App Cliente para o titular acionar/ver compartilhamento de achado (funções de servidor prontas, tela pendente).
2. Documentos sensíveis já existentes cujo `client_id` foi silenciosamente atribuído ao contratante (antes desta correção) **não foram corrigidos retroativamente** — um levantamento de quais documentos reais precisam de reatribuição ao titular certo exigiria revisão caso a caso, não uma migração automática (risco de atribuir errado sem confirmação humana).
