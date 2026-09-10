# CA03-PESSOA-UNICA-VINCULOS — execução (09/09/2026)

Aplicada obrigatoriamente `docs/politicas/fonte-de-verdade-design-e-execucao.md` (criada nesta rodada, conteúdo fornecido pela Proprietária). Nenhuma regra dela foi violada: nenhuma tela/aba/taxonomia nova, nenhuma tabela nova, Planilha Mestre não usada como fonte operacional, SKU não usado como bloqueio.

## Ponto de partida

Artefato de Pessoa 360/Pessoa Unificada já existente, confirmado íntegro:
- `pessoa-identidade.ts` — `evidenciaDeMesmaPessoa()`: confirmado só por e-mail/telefone normalizado; nome sozinho é sempre `apenas_indicio`, nunca vínculo.
- `pessoa-vinculo.ts` — `pessoasDoCasoComFallbackNucleo()`: leitor único de participantes do caso (case_members OU núcleo, nunca funde as duas); `clienteCorrespondentePorNome()` nunca escolhe por ambiguidade.
- `pessoa.functions.ts` — `carregarPessoa`/`atualizarPessoa`: já documentava a lacuna corrigida nesta rodada ("a leitura não... preenche o case_id que falta nos leads — vínculo de identidade é decisão de gente").

## Achado corrigido: vínculo ausente real

`leads.case_id` existe na tabela desde sempre mas **nenhum escritor gravava nele** (`case_id` não estava em `CAMPOS_LEAD`, o allowlist de `salvarLeadDesk`) — confirmado nulo em todo o banco (já documentado em `2026-09-05_execucao_pessoa_360_operacional.md`). A tela `/pessoas/$clienteId` já mostrava a evidência de candidato ("Antes de virar cliente") mas não tinha nenhuma ação para confirmar o vínculo.

Corrigido: `case_id` entrou em `CAMPOS_LEAD` (mesmo escritor, `salvarLeadDesk` — nenhuma função nova); a tela ganhou "Confirmar vínculo" por candidato, que só aparece quando a pessoa já tem ao menos um caso, exige escolher explicitamente QUAL caso (nunca automático, mesmo com evidência forte) e grava só `case_id` — nenhum outro campo do lead é tocado, preservando origem, Discovery e atividades.

## Achado corrigido: leitor divergente (UF)

`pessoas.$clienteId.tsx` tinha uma lista de 27 UFs digitada à mão, separada de `UFS_BRASIL` (`validacao-pessoa.ts`) — duas fontes da mesma taxonomia fechada, risco de divergência silenciosa. Trocado por `UFS_BRASIL.map(...)`; mesmo select, sem nenhuma mudança visual.

## Achado corrigido: máscaras existentes não reusadas (item 7)

O formulário de edição de Pessoa já edita CPF, telefone e CEP (formulário ativo), mas nenhum dos três usava `formatarCpf`/`formatarTelefone`/`formatarCep` (`validacao-pessoa.ts`) — digitação livre sem máscara. Os três campos passaram a formatar no `onChange`, reusando as funções puras já existentes. Nenhuma frente visual nova.

## Achados já corrigidos em rodada anterior (confirmado, não reaberto)

O relatório de 05/09 apontava 4 funções (`cadastro-checklist.functions.ts`, `escopo-conferencia.server.ts`, `case-service-consolidacao.functions.ts`, `contrato-preparar.functions.ts`) lendo `case_members` (esvaziado desde a migration de 21/08 em favor de Núcleos) sem fallback. Verificado nesta rodada: **já convergiram** — todas as 4, mais `caso-ficha.functions.ts`, `fontes-documentos.functions.ts`, `pesquisa.functions.ts` e `cadeia-operacional.server.ts`, usam hoje `pessoasDoCasoComFallbackNucleo()`. Não corrigido de novo — já estava certo.

## O que NÃO foi criado

Nenhuma tabela de pessoa, Perfil 360, caso, núcleo, CRM ou layout. Nenhum motor novo de conversão lead→cliente (confirmado: não existe automação alguma disso hoje — cada conversão já era e continua sendo manual; isto não é uma lacuna desta missão, é a política vigente de nunca fundir automaticamente). Nenhuma migration, nenhum dado real alterado.

## Testes

`src/lib/__tests__/pessoa-unica-vinculos.test.ts` (novo, 11 testes): `case_id` em `CAMPOS_LEAD`; nenhuma tabela nova; vínculo só grava com caso explicitamente escolhido; a mutação grava só `case_id` (nada mais do lead é tocado); ação só aparece quando há caso; evidência fraca continua exigindo a mesma confirmação humana (não é bloqueada nem automática); leitor único de participantes nunca funde fontes; `clienteCorrespondentePorNome` nunca escolhe por acaso; UF reusa `UFS_BRASIL`; CPF/telefone/CEP aplicam máscara existente; nenhuma frente visual nova. `npx tsc --noEmit`, `npx vitest run` (183 arquivos, 1746 testes) e `npx vite build` — todos limpos.

RLS: não alterada — a gravação de `case_id` usa o mesmo caminho já existente (`salvarLeadDesk` → `gravarComVerificacao`, filtrado por `organization_id`), nenhuma policy nova ou modificada.

Não testado nesta rodada (requer navegador real): reload confirmando persistência do vínculo na tela; comportamento tátil da máscara em campo de celular.

## Pendências (0 de até 5)

Nenhuma lacuna nova encontrada fora do escopo desta missão.
