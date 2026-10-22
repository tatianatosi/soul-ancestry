# PR #171 — preparação para o lançamento pelo Lovable (ordem v1.1, 21/10/2026)

Branch `claude/casca-v4-desk-v4-00`. Nada aplicado em banco, nada publicado, nenhum redeploy na Vercel. O banco congelado `zsxpdbhdvbuulwpepemd` não foi lido nem gravado.

## Tarefa 1 — main na PR #171

Merge (não rebase) dos 11 commits de `main` até `129c8f1b`, sem conflito (commit `a353a47a`). `src/integrations/supabase/previewAuthStorage.ts` ficou idêntico ao da `main`. Em 21/10, depois do merge, a `main` não tinha commits novos.

## Tarefa 2 — auditoria de não regressão

Método: extração por AST (TypeScript) do texto JSX, dos atributos de texto e das chaves de rótulo (`titulo`, `label`, `eyebrow`, `descricao`...). Foram 55 rotas de `src/routes/_authenticated` e 2 de `src/routes/portal` que diferem da `main`. Na primeira passada saíram 67 textos da `main` ausentes no mesmo arquivo da branch. Conferi cada um no contexto.

### Removidos sem substituto → devolvidos

| Rota | Texto da main | Situação na branch | Ação |
|---|---|---|---|
| /leads | "Quadro por etapa" (título do kanban). A `main` tem 3 ocorrências: 2 em comentário e 1 no título. | O kanban existia, mas sem o título visível (commit ee52c328) | Título h3 devolvido sobre o kanban |
| /configuracoes | `GovernancaConectada` + faixa "Resumo de acesso master": Membros (Contas operacionais vinculadas), Papéis disponíveis (Perfis internos controlados), Modo Proprietária (Autoridade confirmada no servidor) | Removidos na composição V4 (1c61540b) | Devolvidos, com os mesmos `KpiCard`, só leitura |
| /financeiro | "Ver lista →" nos indicadores | Só restava o tooltip | Devolvido |

### Itens citados pela Proprietária → nome da main devolvido

| Rota | Texto da main | Estava como | Agora |
|---|---|---|---|
| /leads | "Quadro por etapa" | sem título | devolvido |
| Caso 360 | "Núcleo familiar e participantes" | `titulo="Participantes"` (cartão do Lote B) | "Núcleo familiar e participantes" (mesmo cartão, mesmo order-N) |
| /pesquisa-modulo | "Pesquisa Genealógica e Evidências" | `titulo="Pesquisa"` | "Pesquisa Genealógica e Evidências" |

### Renomeados (mesma função e mesmo dado; mantidos)

| Rota | Texto da main | Onde está agora |
|---|---|---|
| /calls | "CRM Vivo & Discovery Calls" (shell e meta title) | "Mesa de Discovery" (calls.tsx, título e meta) |
| /leads | "+ Novo lead" | "Novo lead" (mesmo `setNovoLeadAberto`) |
| /leads | "Qualidade por canal" | fundido em "Origem e qualidade" (mesmo `qualidadePorCanal`) |
| /painel | "Onde o sinal começou" | "Alertas por origem · onde o sinal começou" |
| /tarefas | "Tarefas: pendências e próximos passos da equipe." | "Tarefas dos casos: próxima ação, responsável, prazo e bloqueio por status real." |
| Caso 360 | "Nenhum participante registrado." / "Próximo passo publicado" | "…registrado ainda." / "…publicado ao cliente" |
| /pesquisa-modulo | descrição, "Produção de evidências (6 meses)", textos de confiança | descrição do Dossiê; "Produção de evidências" (teste exige); anel "Confiança da cadeia" |
| /nucleos | "Núcleos familiares" (shell) e descrição | "Pessoas & Famílias"; descrição com o mesmo conteúdo |
| /configuracoes | "Configuração & Acesso Master", "Acesso Master", "Política operacional", "Confirmação externa obrigatória", texto de auditoria | "Configuração & Acesso"; abas de `configuracao-acesso-v4.tsx` |
| /acessos-portal | "Acessos ao portal" + descrição | "Portal do cliente (visão interna)"; o rótulo antigo segue na aba V4 |
| /financeiro | "Parcela"/"Situação", "Situação das faturas", "Conciliar", textos de conciliação | "Entrada/Parcela N", "Situação das parcelas", "Confirmar pagamento" (mesma `acaoExterna`) |
| /contratos | "Inventário patrimonial · leitura de" | eyebrow + "Leitura de {data}" |
| /conciliacao-catalogo, /escopo-origem, /fontes-genealogicas | contadores em frase | KPIs com os mesmos números |

### Precisam de decisão da Proprietária

| Rota | Texto da main | Agora | Por que não mexi |
|---|---|---|---|
| /portal/conta | "Projeto Familiar (3 assinaturas ativas)" (só no caso `a11a0000-…-0002`) | "Projeto Familiar · condição prevista" | A própria `main` se contradiz. O commit `d8ea953c` (19/10) trocou para "condição prevista" e criou teste proibindo "3 assinaturas ativas" (`mockup4-presentation.test.ts:33-34`). O `917739fe` (19/10) voltou o código sem mudar o teste, e a `main` ficou vermelha. Além disso, o App está congelado fora de `documentos.tsx`. |
| /pessoas-linhagens/$caseId | "Miniárvore familiar", "Derivada", "Sem relações suficientes…" | "Relações entre pessoas" (Casca V4 de 18/10), com o vazio "A árvore só nasce de vínculo gravado." | Substituído de propósito, com o mesmo propósito e dado real |

### Falsos positivos (texto igual, só mudou a forma no código)

/clientes (3 títulos), /plano-acao (2), /microentregas (4 vazios unidos), /biblioteca-evidencias, /relatorios-fase, /pesquisa-modulo (3), /financeiro "Sem fatura carregada".

## Tarefa 3 — acervo de documentos no App (`src/routes/portal/documentos.tsx`)

- **Não apliquei a branch `claude/saneamento-documentos-ficticios`.** O nome dela está errado: os 3 itens não são fictícios. São evidências reais do dossiê da Ana Luiza, e a branch os apagaria.
- Vazamento corrigido: a lista só aparece quando o caso ativo do App é `CA-CID-AT-FAM-2026-001`. O código é lido do próprio caso ativo (`crm_casos.codigo`), com a sessão do usuário, e a RLS decide o acesso (`casos_select_portal` para a família, `casos_select` para a equipe na prévia). Não depende de UUID solto. Para qualquer outro caso, ou sem caso ativo, aparece "Seu acervo está em preparação".
- Títulos, detalhes, ordem e o selo "Acervo sob conferência técnica" estão sem nenhuma alteração. Continua sem botão de ver ou baixar.
- Comentário atualizado com o texto da ordem.
- Teste novo `src/lib/__tests__/portal-acervo-ana-2026-10-21.test.tsx`, com renderização real (jsdom): **4/4 verdes.**
  - O caso da Ana vê os 3 itens na ordem e com os 3 selos. Não há link nem botão, e o vazio não aparece.
  - Outro caso não vê nenhum título nem detalhe, e vê "Seu acervo está em preparação".
  - Os dois pontos de uso (prévia da equipe e família autenticada) passam a visibilidade do caso ativo.
  - O comentário novo está no código.
- Arquivos tocados: só `documentos.tsx` e o teste.

## Tarefa 4 — Caso 360 para qualquer cliente

Diff resumido:
- `src/lib/golive.functions.ts`: `carregarGoLive` ganha `inputValidator({ casoId?: string })`. Com UUID filtra `crm_casos.id`; com outro texto filtra `crm_casos.codigo`; sem `casoId`, usa `CA-CID-AT-FAM-2026-001`. Sempre filtra por organização. O retorno passa a usar o código real do caso. O título de reserva "Projeto familiar — Ana Luiza" agora só vale no caso-piloto; nos outros, "Caso sem título registrado". As rotas /golive-* chamam sem argumento e continuam iguais.
- `casos.$caseId.index.tsx`: a ficha dos 4 lotes chama `carregarGoLive({ casoId })` com o id do caso da rota (`queryKey ["go-live","caso",casoId]`). Saíram a trava "só caso-piloto" e a mensagem "disponível… para o caso-piloto… não recebe caseId ainda".
- A Visão Concreta e a esteira de pesquisa já liam pelo `caseId` da rota (`VisaoConcretaCaso caseId`, `cadeiaPesquisaDoCaso`). Só o comentário desatualizado foi corrigido.
- Único arquivo golive-* tocado: `golive.functions.ts`.

## Tarefa 5 — Marketing (`marketing.tsx`)

Diff resumido: o bloco "Atribuição e origem" (Catálogo de origem + Casos por origem com pagamentos confirmados, ou seja, os casos pagos por canal) e "Aprendizados das campanhas" saíram do `<details>` e estão na página principal. "Campanhas registradas" já ficava na página principal, em "Canais e campanhas". Com 0 linhas:
- campanhas: vazio declarado;
- origens: "Sem leads no recorte para classificar origem.";
- casos pagos: "Sem dados: nenhum caso está ligado a uma origem catalogada…";
- aprendizados: "nenhum aprendizado de canal ainda é derivável".

A tabela de CAC/ROI só aparece com linha real. Nada é estimado. Continuam recolhidos: "Conteúdo e CTAs" e "Funil de aquisição".

## Tarefa 6 — migrations para o Lovable aplicar (não aplicadas por mim)

| Migration | Objetivo | Dependência no código da branch | Lançamento precisa? |
|---|---|---|---|
| `20261010120000_portal_sou_contratante_financeiro.sql` | Função `portal_sou_contratante_financeiro(p_case_id uuid)`, security definer, `search_path=public`. Verdadeira quando o titular do portal é contratante do caso (`nucleo_membros.papel_no_caso='contratante'` ou `papel='contratante_signatario'`, ou `case_members.papel_no_caso='contratante'`). Grant só a authenticated. | `portal-cliente.functions.ts:556` e `portal.functions.ts:318` chamam a função para cada caso com fatura e lançam erro se ela falhar. | **App: sim.** Sem ela, a leitura de faturas dá erro quando houver fatura. A falha é fechada: não vaza fatura. |
| `20261011120000_client_tab_dwell_events.sql` | Tabela `client_tab_dwell_events`: tempo do titular em cada uma das 7 abas. RLS: select para membro da organização; insert só do próprio titular; sem delete. | `registrarTempoNaAba` (`portal-cliente.functions.ts:718`) insere e lança erro se a tabela não existir. | **App: sim**, para não gerar erro a cada troca de aba. |
| `20261011130000_saneamento_nucleo_ana_luiza.sql` | Caso Ana Luiza: arquiva a linha-fantasma sem nome (`74f628ed…`) e marca contratante em Ana (`f2b80016…`), Adair (`8871edd9…`) e Alice (`90d29bd9…`), cada update com guarda (id + nome). | Indireta: a função acima só reconhece a Ana como contratante se `papel_no_caso='contratante'`. | **App: sim, para a Ana ver a própria fatura.** Atenção: não verifiquei se esses ids existem no Lovable Cloud. Antes de aplicar, rodar `select id, nome, papel_no_caso from nucleo_membros where id in ('74f628ed-d7c3-44f4-814c-f78a9b99c6f5','f2b80016-b714-4915-93d0-0108c4b86d68','8871edd9-0623-473f-bf8f-6bf0bcb51c73','90d29bd9-269b-4f86-975d-051f35e8b6a3');`. Se não voltar nada, a migration não faz nada, e o contratante precisa ser marcado com os ids reais. |
| `20261020150000_ana_luiza_historico_contrato_banco_antigo.sql` (PR #173, ainda fora da #171) | Tabela `contract_history_imports` (RLS + FORCE RLS, select só admin/operações). Importa como histórico 6 versões, 84 validações e 20 revisões do contrato `a11a0000-…-c1`, sem ativar versão. Corrige o cadastro da Ana com guarda: telefone `(62) 98158-4015`, nascimento 27/06/2001 e quadra/lote. | Nenhum código da branch lê `contract_history_imports`. | **Não bloqueia App nem Desk.** É preservação de histórico e correção de cadastro. |

Ordem sugerida: 20261010120000 → 20261011120000 → 20261011130000 (conferir ids antes) → 20261020150000.

## Validação

- `tsc --noEmit`: limpo.
- Suíte completa: ver "Resultado final".
- Testes novos: `lancamento-lovable-2026-10-21.test.ts` (5 casos: golive por caso, Marketing, textos devolvidos) e `portal-acervo-ana-2026-10-21.test.tsx` (4 casos: acervo).
- Observação: rodando `vitest` puro, ele também lê 19 cópias antigas em `.claude/worktrees/` (fora do git) e gera centenas de falhas falsas. A suíte foi rodada com `--exclude '.claude/**'`.

## Resultado final

- `tsc --noEmit`: limpo.
- `vitest run --exclude ".claude/**"`: 580/580 arquivos, 5615 testes passando, 8 pulados, 0 falhas.
- `vite build`: concluído sem erro; a função `acervoDoCasoAtivo` aparece registrada no resolvedor de funções de servidor.
- Push na branch `claude/casca-v4-desk-v4-00`: `cee67db5` (textos devolvidos, golive por caso, Marketing) e `253853e2` (acervo da Ana, golive por UUID ou código). Sem merge na `main`.
