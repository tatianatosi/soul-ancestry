# Plano de tarefas — 31/10/2026

Fila de trabalho até o lançamento. Estado e decisões estão em
`docs/PLANO-MESTRE-LANCAMENTO-2026-10-30.md` (revisado em 31/10). Os números abaixo
foram medidos hoje no banco (só `SELECT`) e no código; onde não remedi, está escrito
"não remedido".

**Dono:** **C** = Claude Code (em branch e PR) · **L** = chat do Lovable (aplica banco) ·
**P** = Proprietária. Dado real só entra por SQL proposto em `supabase/pendentes/` e
aplicado pelo Lovable, ou pela ferramenta de banco com autorização explícita. Merge,
migration e Publish só com autorização, por item. Prova autenticada sua continua
obrigatória para marcar motor como comprovado.

## 0. Ordem recomendada

1. **Agora, sem esperar você (C):** H1, H2, H3 (preparar o contrato), J9 (flags do
   §58c), O1, O4, O5 (órfãs), E3 (`pipeline.py`), R2, R3.
2. **Suas decisões que destravam o resto:** J1 (3 documentos) → J2 (acesso da Ana);
   J5 (nome do pai) → H5 (aprovar parâmetros) → H6 (prévia final).
3. **Contrato:** H5 → H6 → H7 → H8 → H9, na sua sessão autenticada.
4. **Publicar** (R5) quando você parar de editar no Lovable.

## 1. R — Repositório e publicação

| #   | Tarefa                                                                                                                                        | Dono                        | Pronto quando                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| R1  | Mesclar o #207 (Sentry, `/lancar`, planos). Depois criar o projeto no Sentry e pôr `SENTRY_DSN` no ambiente de servidor do Lovable            | P                           | erro de teste aparece no Sentry                |
| R2  | Atualizar #202, #203 e #205 com a `main` (merge commit) e conferir a causa do CI vermelho; só o #205 tem causa confirmada (base antiga)       | C, com ok                   | CI verde nos três                              |
| R3  | #201: resolver o conflito, depois de conferir se o tradutor de recusa já está na `main`; se estiver, fechar com motivo                        | C                           | conflito resolvido ou PR fechada com motivo    |
| R4  | 14 PRs antigas (#32, #97 a #125, #142): fechar uma a uma depois de conferir que a casca V4 as superou; apagar as 5 `lovable-sync` redundantes | P decide, C prepara a lista | PRs fechadas com motivo                        |
| R5  | Publicar com a skill `/lancar` e conferir que o painel (#208) registra o commit verificado (hoje registra `8574598`, não verificado)          | P avisa, C executa          | "Último Publish" no painel = commit verificado |
| R6  | PR #32 (aberta, limpa): a releitura estrita (via #199) e a decisão pós-salvamento já estão na `main`. Só estão na #32: `TarefasDoCaso` no Caso 360, `safe-area` do assistente do Desk e os cartões mobile de Partes em `contratos.$id.tsx`. Portar essas 3 peças ou fechar a #32 com motivo | P decide, C porta | #32 fechada com motivo |

## 2. J — Jornada da Ana

| #   | Tarefa                                                                                                                                                                             | Dono                         | Pronto quando                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| J1  | 3 documentos liberados ao cliente: manter, trocar por versão sanitizada ou retirar do App (ação "Retirar do App" já existe no Desk). Alinhar `evidencias` com `documents`          | P                            | mesma visibilidade nas duas tabelas, com prints                  |
| J2  | Acesso da Ana ao portal (`client_portal_case_access` = 0), depois de J1; convite de Adair e Alice (falta o CPF real da Alice)                                                      | P                            | 1 acesso ativo e prova autenticada                               |
| J3  | Consentimento do lead (`nao_solicitado` → coletado)                                                                                                                                | P                            | consentimento registrado                                         |
| J4  | Representação do Felipe: documento real de representação do menor                                                                                                                  | P                            | status documentado                                               |
| J5  | Nome do pai: "Adair Gomes Silveira" (Canva) × "Adair Pinto Silveira Júnior" (cadastro). Decidir; o sistema declara a divergência e não funde                                       | P                            | decisão registrada                                               |
| J6  | Perfis genealógicos: 8 de 11 aprovados para o cliente (relatório de 30/10, não remedido); decidir os outros 3                                                                      | P                            | decisão registrada                                               |
| J7  | Documentos-fonte (`case_source_documents` = 0): inventário da pasta do caso no Drive, depois envio por Pesquisa → Fontes                                                           | C inventaria, P/equipe envia | cada documento com tipo, pessoa e arquivo na plataforma          |
| J8  | Encontros de linha (`lineage_encounters` = 0): registrar só com evidência, nada inferido                                                                                           | equipe                       | encontros com evidência                                          |
| J9  | **Reabre o Corte C.** Flags `exigeCusto`, `exigeAprovacaoDespesa` e `instituicaoProvavel` em `dossie-58c.ts`; depois custo e prazo nos 76 itens (hoje 0 e 0), só onde houver fonte | C (código), P (valores)      | teste cobre o template; itens com custo ou "sem fonte" declarado |
| J10 | Publicar o `resumo_caso` pendente da Ana                                                                                                                                           | P (autorização nominal)      | publicado                                                        |
| J11 | Auditoria de paridade visual App/Desk × mockups: faltam as imagens dos mockups ou um acesso de teste                                                                               | P fornece, C audita          | relatório de diferenças                                          |
| J12 | Prints autenticados dos motores para `COMPROVADO_EM_USO`                                                                                                                           | P                            | prova registrada por motor                                       |

## 3. H — Contrato de Uma Hora (Corte H)

Hoje: parâmetros **95%**, `rascunho`, revisão humana de 05/10, sem aprovação; contrato
`pending_data` (mais um arquivado); prévias: 1 congelada e 1 editável, **nenhuma
`final`**; histórico do contrato antigo importado.

| #   | Fase                                                                                                                                                                                                                                                      | Dono                 | Pronto quando                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------- |
| H1  | Recalcular os 5 conflitos dos parâmetros (`beneficiarios`, `contratante_contato`, `escopo_resumo`, `partes_signatarias`, `representacao_legal`); parte cita telefone antigo e "nascimento não informado", corrigidos no banco em 30/10. Não remedido hoje | C                    | conflito vazio onde a divergência sumiu; o resto declarado |
| H2  | Preencher `ancestral_referencia` (único obrigatório vazio) a partir do dossiê e da árvore cadastrada                                                                                                                                                      | C propõe, P confirma | completude 100%                                            |
| H3  | ANEXO_II duplicado (`not_applicable` × `drafting`): arquivar o que sobra, com motivo, sem apagar. Não remedido hoje                                                                                                                                       | C, com autorização   | um ANEXO_II vivo                                           |
| H4  | Fechar J5 (nome do pai) antes de aprovar                                                                                                                                                                                                                  | P                    | J5 decidida                                                |
| H5  | Aprovar os parâmetros (`rascunho` → aprovado)                                                                                                                                                                                                             | P                    | `aprovado_em` preenchido                                   |
| H6  | Gerar a prévia **final** (`gerarPrevia({ tipo: "final" })`) na sua sessão autenticada e congelar. Não faço isso por SQL: pularia `exigirCoerencia` num contrato real                                                                                      | P                    | prévia `final` congelada                                   |
| H7  | Registrar a revisão humana da prévia final                                                                                                                                                                                                                | P                    | revisão aprovada                                           |
| H8  | Enviar ao cliente como rascunho real em `communication_queue`, com aprovação humana (#205); abrir o contrato pelo Caso 360 (#203); observações internas no Resumo (#202). Depende de R2                                                                   | C prepara, P aprova  | rascunho `awaiting_approval` visível no Caso 360           |
| H9  | Assinatura: ato externo, parado no seu nome                                                                                                                                                                                                               | P                    | estado de assinatura registrado                            |
| H10 | Depois da assinatura: ativar contrato e cobrança. Autorização separada, nada automático                                                                                                                                                                   | P                    | por item                                                   |

## 4. O — Órfãs

Registro `src/lib/orfaos-classificados.ts`: **24 funções**, 13 `AGUARDA_DECISAO`,
7 `CASCA_DUPLICADA`, 4 `APOSENTADA_CLASSIFICADA`, 0 `RELIGAR`. Reverificadas hoje: todas
continuam sem chamador. Fora do registro há **62 candidatos**: 40 sem uso de produção
(29 sem nenhum uso, 11 só em testes) e 22 sem importador direto, cujas únicas
referências por nome são homônimos ou comentários (10 conferidos à mão, 12 a conferir).
Os primitivos `ui/*` do shadcn ficam de fora (biblioteca).

| #   | Tarefa                                                                                                                                                                                                                                                                                                                                                                                          | Dono                | Pronto quando                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| O1  | GoLive: o motivo "canonicidade não decidida" está velho (decisão de 23/10). `registrarDiscoveryGoLive` e `registrarCallGoLive` parecem cobertas por `registrarAtendimentoGoLive`, que grava `status_call`, `resumo_call`, `discovery_resultado` e `crm_interactions`; conferir `resolverPessoaGoLive` na tela de pessoa. Pagamento fica em decisão                                              | C propõe, P aprova  | 4 entradas com veredicto e motivo atuais                                |
| O2  | Piloto 5A.1 (5 funções) e piloto da Ana (3): tela própria ou absorvidos no Caso 360                                                                                                                                                                                                                                                                                                             | P decide, C executa | 8 funções com veredicto final                                           |
| O3  | `radarMarcosJuridicosDoPainel`: ganha tela/aba própria ou fica fora do Desk                                                                                                                                                                                                                                                                                                                     | P                   | veredicto final                                                         |
| O4  | Classificar os 62 candidatos com a skill `classificar-orfao`, em lotes: (a) Painel Hoje antigo (`painel/*`); (b) painéis de contrato (`painel-instrumentos`, `painel-preparacao`, `painel-estado-contratual`, `timeline-contratual`, `kit-contratual`, `anexos-tres-camadas`), **decidir antes se o Contrato de Uma Hora precisa deles**; (c) kits, demos e relatórios; (d) libs; (e) `ui/ca-*` | C                   | cada módulo com veredicto escrito; nada apagado sem `COMPROVADO_EM_USO` |
| O5  | Estender o teste de órfãs para componentes e módulos (hoje só cobre `createServerFn`), com lista de exceções para `ui/*` e arquivos de rota                                                                                                                                                                                                                                                     | C                   | módulo novo sem importador e sem veredicto falha o teste                |
| O6  | `src/data/*` (13 arquivos de dado fictício, do relatório de 26/10, não remedido): classificar para que ninguém os religue e vaze família fictícia numa tela real                                                                                                                                                                                                                                | C                   | veredicto por arquivo                                                   |
| O7  | `painel/botao-testar-cliente.tsx` tem um `TODO:` e o `pipeline.py` aborta nele; resolver junto com o lote (a) de O4                                                                                                                                                                                                                                                                             | C                   | `pipeline.py` passa o passo 1                                           |

## 5. E — Esteira e produção

| #   | Tarefa                                                                                                                                                                                                                                                                                               | Dono                                        | Pronto quando                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------- |
| E1  | Journal do Drizzle (#18): 3 entradas, em sincronia com o banco, mas 4 mudanças de schema foram aplicadas direto (`contract_history_imports`, `user_roles.archived_at`, 2 correções de função/trigger) e `drizzle/schema.ts` está vazio. Decidir: documentar o limite ou fazer baseline do banco real | P decide, C propõe em `supabase/pendentes/` | decisão registrada                           |
| E2  | `pipeline.py`: o argumento de commit entra num `shell=True` (injeção); adicionar `--dry-run`, tratar `--help` e mandar erros para stderr                                                                                                                                                             | C                                           | teste cobrindo as três                       |
| E3  | `gravarComVerificacao`/`inserirComVerificacao` só avisam no console quando a releitura diverge (56 arquivos); decidir o caminho tolerante fora da organização                                                                                                                                        | P decide, C por módulo                      | divergência vira erro, com testes por módulo |
| E4  | Cabeçalhos `ESTADO:` de `supabase/pendentes/`: `20261020150000` diz "BLOQUEADO_POR_TAMANHO" e o README diz "aplicado em 30/10"; alinhar README e cabeçalhos                                                                                                                                          | C, com sua confirmação                      | `sync-check.sh` e painel coerentes           |

## 6. O que espera por você, por impacto

1. **R1**: mesclar o #207 (e depois o `SENTRY_DSN`).
2. **J1 e J5**: documentos da Ana e nome do pai. Sem eles, J2, H5 e H6 não andam.
3. **H5, H6, H7**: aprovar parâmetros, gerar a prévia final e registrar a revisão.
4. **O1, O2, O3**: aprovar a reclassificação do GoLive e decidir piloto e radar.
5. **R4**: fechar as 14 PRs antigas.
6. **R5**: me avisar quando parar de editar no Lovable, para publicar.
7. **J2, J3, J4, J10**: acesso da Ana, consentimento, Felipe, `resumo_caso`.
8. **E1, E3**: Drizzle e verificação de gravação.
