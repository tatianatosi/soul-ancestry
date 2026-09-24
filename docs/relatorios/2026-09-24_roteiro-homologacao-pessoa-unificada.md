# Roteiro de homologação autenticada — Pessoa Unificada, Núcleo/Dossiê, Perfil e D7

Data: 2026-09-24 · Executora: Proprietária autenticada (`tati@pluggedresearch.com`)
Registro dos resultados: `docs/relatorios/2026-09-11_registro-prova-autenticada.md` · Prints: `docs/provas/`

## Como usar

- Este roteiro **não** prova nada sozinho. Cada fluxo só muda de
  `CODIGO_E_TESTE_SEM_HOMOLOGACAO` para `IMPLEMENTADO_EM_FLUXO_REAL` em
  `src/lib/motores-tabelas.ts` depois que a Proprietária, logada, executar os
  passos, salvar os prints e o campo `provaAutenticada` apontar para eles.
  Teste, build, fixture ou relato de agente não contam.
- Use **dado sintético reversível** (caso e pessoas de homologação, nomes
  claramente fictícios). Nunca dado real de cliente.
- Prints obrigatórios em cada fluxo: **inicial**, **ação**, **confirmação**,
  **releitura** (depois de recarregar a página) e **integração** (a mesma
  informação vista em outra tela). Salvar como
  `docs/provas/2026-09-XX_<fluxo>_<etapa>.png`.
- Resultado de cada fluxo: `PASSOU` · `FALHOU` · `BLOQUEADO_POR_DADO` ·
  `BLOQUEADO_POR_DECISAO` · `ERRO_DE_FONTE` · `NAO_LOCALIZADO`.
- Permissão geral: usuária da equipe com escrita na organização (admin ou
  editor). A trilha de auditoria em `/configuracoes` é só para admin.

## Massa sintética mínima

| Item | Como preparar |
|---|---|
| Caso H1 | Caso de homologação com núcleo e pelo menos 2 membros não dependentes |
| Pessoa P1 | Cadastro em `/clientes` com CPF sintético preenchido e ligada ao caso H1 como membro |
| Pessoa P2 | Outro membro do caso H1 com CPF **diferente** no membro do caso (gera conflito) |
| Caso H2 | Segundo caso de homologação, com uma pessoa P3 que **não** está em H1 |
| Perfil G1 | Perfil genealógico em `/pessoas-linhagens/<H1>` ainda sem vínculo |

---

<a id="r2"></a>
## R2 — CPF dos membros conferido contra o cadastro canônico

Motor P1 · Writer `conferirDivergenciaCpfMembrosCaso` (`src/lib/caso-canonico.functions.ts`) · Tabela `case_members`

| Passo | Conteúdo |
|---|---|
| URL | `/casos/<H1>#pessoas` (seção "Pessoa e família") |
| Pré-condição | P2 tem CPF no cadastro canônico diferente do CPF gravado no membro do caso H1. Anotar o CPF atual de **todos** os membros de H1 e de H2 (print inicial). |
| Ação | No bloco "Conferir CPF dos membros com o cadastro canônico", no membro em conflito, clicar **Usar o CPF do cadastro canônico**, escrever o motivo e confirmar. |
| Resultado esperado | Mensagem de sucesso; o membro sai de "conflito" e passa a "já sincronizado". Sem motivo, a confirmação não é aceita. |
| Dado relido | Recarregar a página: o CPF do membro é o do cadastro canônico e o estado continua "já sincronizado". |
| Auditoria / timeline | `/configuracoes` → **Abrir trilha de auditoria**: evento `cpf_conflito_resolvido_pelo_canonico` com valor anterior/posterior e o motivo. Caso H1 → "Linha do tempo": evento da resolução. |
| Integração | `/pessoas/<P2>`: o sinal de CPF do caso H1 não mostra mais conflito. |
| Permissão | Escrita na organização. Auditoria: admin. |
| Isolamento | Os outros membros de H1 e todos os membros de H2 mantêm exatamente o CPF anotado no print inicial. O cadastro canônico de P2 (`/clientes`) não muda. Nenhuma pessoa é fundida. |
| Resultado | ☐ |

<a id="nucleo"></a>
## Núcleo e Dossiê-mãe

Motor P1 · Writers `adicionarMembroNucleo` e `salvarDossieNucleo` (`src/lib/nucleos-desk.functions.ts`) · Tabelas `nucleo_membros`, `nucleos_familiares`

| Passo | Conteúdo |
|---|---|
| URL | `/nucleos` ("Núcleos familiares e dossiê-mãe") |
| Pré-condição | Núcleo do caso H1 visível; anotar membros e situação do dossiê (print inicial). |
| Ação 1 — membro | Clicar **+ Adicionar membro ao núcleo**, preencher nome sintético e papel, **Adicionar membro**. |
| Esperado 1 | Membro aparece na lista. Repetir com o mesmo nome: o sistema recusa duplicidade. |
| Ação 2 — dossiê | Preencher o dossiê-mãe com **Situação do dossiê** "em preparação" → **Salvar dossiê-mãe**. Depois completar os campos exigidos e mudar para "ativo" → salvar. |
| Esperado 2 | Com campo faltando, "ativo" é recusado com a lista do que falta. Completo, fica ativo. |
| Ação 3 — segundo ativo | Em outro núcleo não arquivado **do mesmo caso H1**, ou usando a **mesma referência** de dossiê, tentar marcar "ativo". |
| Esperado 3 | Recusa com mensagem explicando que já existe dossiê-mãe ativo. Nada é gravado. |
| Dado relido | Recarregar `/nucleos`: membro novo presente, dossiê ativo único, segundo núcleo continua não ativo. |
| Integração | Caso 360 de H1 (bloco do núcleo: dossiê e situação), `/pessoas/<P1>` (card do núcleo: "Dossiê-mãe do núcleo" + "Abrir em Núcleos"), `/clientes`. Painel "Onboarding e jornada" em `/ops`: se o dossiê-mãe era o único gate pendente de H1, o diagnóstico de H1 muda (esta tela mostra o estado geral, não o nome do gate). |
| Permissão | Escrita na organização. |
| Isolamento | Núcleos de H2 não mudam. O membro novo não aparece em outro núcleo. |
| Resultado | ☐ |

<a id="perfil"></a>
## Perfil genealógico vinculado

Motor P5 · Writer `salvarRegistroG02` (`src/lib/pessoas-linhagens.functions.ts`) · Tabela `genealogical_person_profiles`

| Passo | Conteúdo |
|---|---|
| URL | `/pessoas-linhagens/<H1>` (perfis) e `/pessoas/<P1>` |
| Pré-condição | Perfil G1 sem vínculo; `/pessoas/<P1>` sem "Perfil genealógico vinculado" (print inicial). |
| Ação 1 — vincular | Editar G1, em **Vincular a pessoa já cadastrada (opcional)** escolher P1, salvar. |
| Esperado 1 | Salva. Timeline de H1: "Perfil genealógico vinculado à pessoa cadastrada". Auditoria: `perfil_genealogico_vinculado_a_pessoa`. |
| Dado relido | Recarregar: o seletor mostra P1. `/pessoas/<P1>` mostra "Perfil genealógico vinculado: G1" com "Conferir vínculo". |
| Integração | `/pessoas/<P2>` **não** mostra G1 (antes o perfil aparecia para todos do caso). |
| Ação 2 — desvincular | Editar G1, escolher **Sem vínculo com pessoa cadastrada**, salvar. |
| Esperado 2 | Timeline "Perfil genealógico desvinculado da pessoa"; auditoria `perfil_genealogico_desvinculado`. `/pessoas/<P1>` deixa de mostrar G1 após reload. O perfil continua existindo. |
| Ação 3 — pessoa de fora | No seletor de G1 (caso H1), procurar P3 (de H2). |
| Esperado 3 | P3 **não** é oferecida. A recusa no servidor ("Só é possível vincular o perfil a uma pessoa cadastrada que já faz parte deste caso.") está coberta por teste automatizado; pela tela não dá para forçar — registrar como `PASSOU` para a parte visível e anotar que a recusa do servidor não tem prova de UI. |
| Permissão | Escrita na organização. |
| Isolamento | Cadastro de P1 em `/clientes` não muda (nenhuma fusão). Perfis de H2 não mudam. |
| Resultado | ☐ |

<a id="d7"></a>
## D7 — Primeira micro-entrega derivada do dado real

Motor P4 · Writer `criarPrimeiraMicroentregaOnboarding` (`src/lib/onboarding-plano.functions.ts`) · Tabela `ops_microentregas` · Leitor `obterPainelJornada`

| Passo | Conteúdo |
|---|---|
| URL | Caso 360 de H1 → seção "Jornada" (plano de onboarding) e `/ops` (painel de jornada) |
| Pré-condição | H1 sem nenhuma micro-entrega. No painel "Onboarding e jornada" de `/ops`, anotar o contador **Sem microentrega planejada** (H1 está incluído) e, se o onboarding de H1 começou há 7 dias ou mais, a linha de H1 mostra o alerta "Primeira microentrega não planejada até D7" (print inicial). |
| Negativo | Se houver texto de "próxima micro-entrega" no plano ou item marcado à mão no checklist, confirmar que isso **não** tira H1 do contador. |
| Ação 1 | No plano de onboarding de H1, clicar **Criar primeira micro-entrega (rascunho interno)**; depois **Recalcular gates, checklist e tarefas**. |
| Esperado 1 | Micro-entrega aparece na lista do plano como "Pendente". Item "Primeira micro-entrega planejada" do checklist fica ok sem nenhum clique no item. |
| Dado relido | Recarregar: micro-entrega e item ok continuam. Em `/ops`, o contador **Sem microentrega planejada** diminui em 1 e o alerta D7 some da linha de H1. |
| Ação 2 — concluir | Em `/ops`, editar a micro-entrega, preencher **critério de aceite** (mín. 5 caracteres) e evidência ou justificativa (o banco recusa concluir sem isso), status **Concluída**, salvar. Recarregar. |
| Esperado 2 | Status "Concluída" nas duas telas; o D7 continua atendido. |
| Ação 3 — cancelar | Mudar o status para **Cancelada**, salvar, recarregar `/ops` e recalcular o plano. |
| Esperado 3 | O contador **Sem microentrega planejada** volta a incluir H1; o item do checklist volta a pendente. Prova de que o D7 lê o dado, não um tick. |
| Permissão | Escrita na organização. |
| Isolamento | Contadores e micro-entregas de H2 não mudam. Nada é publicado no App Cliente. |
| Resultado | ☐ |

<a id="app"></a>
## App Cliente — nada disso atravessa a fronteira

| Passo | Conteúdo |
|---|---|
| URL | `/portal` com login de **cliente** de homologação ligado a H1 (fluxo oficial: convite/magic link, sem staff) |
| Ação | Percorrer as 7 abas: Home, Jornada, Radar, Árvore, Documentos, Legado, Conta. |
| Esperado | Nenhuma aba mostra CPF, dossiê-mãe, inventário documental interno, perfil genealógico, alerta interno, micro-entrega interna, conflito/reconciliação de CPF. Só aparece o que foi publicado. |
| Isolamento | Com um segundo cliente de H2, nada de H1 aparece. Isolamento A×B só vale com os dois logins. A parte estrutural (RLS) já foi conferida: `docs/auditorias/2026-09-24_rls-estrutural-app-cliente.md`. |
| Resultado | ☐ |

<a id="migration"></a>
## Migration de onboarding — aplicada em 2026-09-24

A migration `20260924190000_case_plans_gate_onboarding` foi aplicada no banco
conectado em 2026-09-24, com autorização explícita da Proprietária ("Pode
efetivar a migração"): 7 colunas nullable em `case_plans`
(`motivos_bloqueio` com default `[]`), 2 CHECKs, registro em
`supabase_migrations.schema_migrations`. Nenhum dado foi alterado; sem
backfill.

Regra de leitura: com `case_plans` (fase onboarding) e `onboarding_planos`
presentes, o gate só é considerado liberado quando **as duas** dizem
liberado — um `[]` ainda não espelhado não libera nada.

| Passo | Conteúdo |
|---|---|
| URL | `/governanca/migracao-onboarding-gate` |
| Ação 1 | **Ver o que será feito**. Esperado: nenhum aviso de coluna ausente; lista de casos com "Vai sincronizar", "Já sincronizado" ou "Sem case_plans (fase onboarding)". No dia da aplicação havia 1 plano de onboarding e nenhuma linha de `case_plans` na fase onboarding → 1 caso "sem case_plans". |
| Ação 2 | Se houver "Vai sincronizar": **Sincronizar agora**, recarregar e repetir a prévia (deve virar "Já sincronizado"). |
| Integração | No Caso 360 do caso, **Recalcular gates, checklist e tarefas** não mostra mais aviso de migration pendente (pode mostrar "o caso ainda não tem plano de jornada na fase de onboarding"). |
| Permissão | Escrita na organização. |
| Resultado | ☐ |

Verificação por SQL de leitura em 2026-09-24, depois da migration: 1 plano de
onboarding, 0 linhas de `case_plans` na fase onboarding → 1 "sem case_plans",
0 a sincronizar. Não há backfill a gravar hoje; a prévia na tela deve mostrar
exatamente isso.

<a id="visual"></a>
## Pendências visuais para o Lovable (o resto já está fechado em código)

Tudo abaixo exige tela, login real ou print — nada disso pode ser feito
nesta sessão. O que é técnico (writers com releitura, fronteira do App,
migration, RLS estrutural, backfill) já está fechado e testado.

| # | Onde | O que conferir | Seção |
|---|---|---|---|
| 1 | `/casos/<H1>#pessoas` | Resolver conflito de CPF com motivo; reload; trilha de auditoria e linha do tempo; outros membros intactos | [R2](#r2) |
| 2 | `/nucleos`, Caso 360, `/pessoas/<P1>`, `/clientes` | Adicionar membro; dossiê em preparação → ativo; segundo ativo recusado; leitores mostram o mesmo dossiê | [Núcleo](#nucleo) |
| 3 | `/pessoas-linhagens/<H1>`, `/pessoas/<P1>`, `/pessoas/<P2>` | Vincular, reler, desvincular; pessoa de outro caso não aparece no seletor | [Perfil](#perfil) |
| 4 | Caso 360 (Jornada) e `/ops` | Criar micro-entrega; contador e alerta D7; concluir; cancelar e ver o D7 voltar | [D7](#d7) |
| 5 | `/portal` com 2 logins de cliente | 7 abas sem dado interno; cliente A não vê nada de B | [App](#app) |
| 6 | `/governanca/migracao-onboarding-gate` | "Ver o que será feito" sem aviso de coluna ausente; 1 "sem case_plans" | [Migration](#migration) |

Cada item: prints inicial, ação, confirmação, releitura e integração em
`docs/provas/`, resultado no registro vivo. Só depois disso um fluxo pode ter
`provaAutenticada` preenchida em `src/lib/motores-tabelas.ts`.
