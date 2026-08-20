# ANA-SAVE-SEC-01B — Persistência conferida da Aba Casos

Conclusão da conexão e validação da persistência. Nenhuma regra comercial,
contratual, de preço, matriz jurídica, pesquisa, App Cliente ou navegação foi
alterada. Nenhum contrato, ordem de serviço, assinatura, cobrança, mensagem,
pasta, pesquisa externa, integração ou publicação foi criado.

## A. Verificação pós-save
Todo caminho de gravação da Aba Casos passa por `gravarComVerificacao`
(`src/lib/persistencia.server.ts`): grava → relê do banco → compara campo a
campo (`compararPersistencia`). Divergência, ausência de linha ou bloqueio de
RLS viram erro explícito; a tela nunca exibe sucesso falso.

Caminhos conectados:
- `atualizarRegistro` (`src/lib/saas.functions.ts`)
- `salvarCaseService`, `aplicarEtiqueta`, `removerEtiqueta`, `atualizarAlerta`,
  `aprovarRascunho`, `atualizarItemOnboarding` (`src/lib/caso-canonico.functions.ts`)

## B. Autoria e auditoria
`updated_by` é sempre preenchido pelo servidor. O registro em `caso_log` usa
`linhasDeLog`, com mascaramento de campos sensíveis (`persistencia-mascara.ts`):
CPF, documentos, telefone, e-mail, endereço, data de nascimento, consentimentos.

## C. Alterações não salvas
A ficha bloqueia recarregar/fechar (`beforeunload`) e navegação interna
(`useBlocker`) enquanto houver alteração pendente.

## D. Feedback visual
Estados: "Salvando…", "Alterações não salvas", "Salvo às HH:MM", "Não salvo".
Erros são traduzidos por `classificarErroPersistencia` em código estável +
texto humano, com toast. Após salvar, a ficha lista os campos conferidos no
banco.

## E. Fixtures
`data_origin = 'fixture_demo'` marca dado de demonstração. `semFixtures`
remove fixtures de Painel Hoje, filas e métricas (`conversao.functions.ts`,
`crm-desk.functions.ts`). A ficha exibe o selo "DEMONSTRAÇÃO/FIXTURE".

## F. Próxima ação
`exigirProximaAcaoCompleta` é aplicado no servidor sempre que a tela toca um
campo da ação e no registro do alerta: exige responsável, prazo, público,
visibilidade, canal e aprovação humana quando o público é externo. Rascunho
permanece interno; nenhum envio é executado.

## G. Testes
`src/lib/__tests__/persistencia-aba-casos.test.ts` — 8 casos: confirmação por
releitura, divergência, campo não mapeado, bloqueio sem sucesso silencioso,
próxima ação incompleta, ação externa sem aprovação, mascaramento de auditoria
e exclusão de fixtures das listas operacionais.
