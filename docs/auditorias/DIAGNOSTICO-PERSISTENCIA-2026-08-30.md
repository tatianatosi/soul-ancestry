# Diagnóstico de persistência real — 30/08/2026

## Limite honesto desta investigação

Esta sessão **não tem credencial ativa no Supabase** (o servidor MCP do Supabase
está anexado mas não autorizado neste ambiente). Por isso, tudo abaixo foi
apurado por **leitura completa e literal do código** — rota, componente,
handler, server function, tabela, RLS — e não por execução ao vivo dos dois
testes que a proprietária pediu (A: Fontes Genealógicas; B: Pessoa/Núcleo).

O que isto significa na prática:
- Os pontos 1–4 e 7 do roteiro pedido (rota, componente, handler, mutation,
  payload, tabela/comando) estão confirmados por leitura de código.
- Os pontos 5, 6, 8, 9 e 10 (qual projeto Supabase respondeu de fato, o
  resultado real do INSERT/UPDATE, o erro real devolvido, a releitura pós-save
  e o antes/depois no banco) **não puderam ser executados por mim** — só a
  proprietária, ou uma sessão com acesso ao Supabase, pode rodar os dois testes
  A/B fim-a-fim e confirmar contra dados reais.
- O que eu *pude* fazer, e fiz: achar e corrigir a causa mais provável por
  auditoria de código, e transformar qualquer falha futura de "parece que não
  salvou" em um erro explícito na tela — para que, se o problema persistir
  depois deste fix, ele apareça como mensagem, não como silêncio.

## Causa-raiz encontrada

Dois padrões de gravação coexistem neste repositório:

1. **Padrão verificado** (`gravarComVerificacao`/`inserirComVerificacao`,
   `src/lib/persistencia.server.ts`, já testado em
   `src/lib/__tests__/persistencia-aba-casos.test.ts`): grava, confirma que
   pelo menos uma linha foi afetada, **relê do banco** e compara campo a campo
   antes de devolver sucesso. Hoje só é usado por `caso-canonico.functions.ts`
   e pela CRUD genérica em `saas.functions.ts`.
2. **Padrão não verificado**: `supabase.from(t).update(payload).eq("id", id)`
   seguido só de `if (error) throw ...`. **Este é o bug.** No Postgres/PostgREST,
   um `UPDATE` que bate em **zero linhas** — porque a RLS filtrou por
   organização/papel, ou o `id` não existe mais, ou pertence a outra
   organização — **não gera erro nenhum**. `error` continua `null`. A função
   devolve sucesso, a tela mostra "salvo", e nenhuma linha foi de fato alterada.
   No próximo carregamento (inclusive após F5), a leitura traz o valor antigo,
   porque o valor antigo é o único que sempre existiu no banco.

Esse segundo padrão está em **46 arquivos** de `src/lib/*.functions.ts` (lista
completa ao final). Corrigir os 46 de uma vez, sem testar cada um com a
proprietária, seria trocar um risco por outro. Por isso esta entrega corrige
**só os dois fluxos que a proprietária pediu para testar (A e B)**, usando o
padrão verificado que já existe e já é testado — e documenta o restante como
risco conhecido, não como resolvido.

## Teste A — Fontes Genealógicas → "Próxima ação"

| Etapa | Onde |
|---|---|
| Rota | `/fontes-genealogicas` (`src/routes/_authenticated/fontes-genealogicas.tsx`) |
| Componente | `EditarFonte` (form de edição por fonte, dentro de `CartaoFonte`) |
| Handler do botão Salvar | `onClick` → mutation que chama `salvarFonte` |
| Server function | `salvarFonte`, `src/lib/fontes-genealogicas.functions.ts` |
| Tabela | `genealogical_sources_catalog` |
| Usuário/organização | `requireSupabaseAuth` (JWT do usuário logado, nunca service-role) → `contextoRg`/`autorizarEscrita` resolve `organization_id` e exige papel em `admin/operacoes/pesquisador` |
| RLS na tabela | SELECT: `is_org_member(organization_id)`. **UPDATE: `can_write(organization_id)`** — política mais estreita que a de leitura |
| Comando antes do fix | `.update(valores).eq("id", data.id).select("id").maybeSingle()` — **sem checar se `data` voltou `null`** |
| Resultado antes do fix | Se o `UPDATE` batesse em zero linhas por qualquer motivo (RLS, id errado), a função devolvia `{ id: undefined }` como sucesso — nenhum erro, nenhuma indicação de falha |
| Releitura após refresh | `painelFontes` volta a fazer `SELECT * FROM genealogical_sources_catalog WHERE organization_id = ...` — traria o valor antigo, porque o valor antigo é o único que já existiu |

**Nota importante sobre o preview:** este fluxo (`EditarFonte`) só existe na
branch `fix/caso-canonico-salvamento-operacional` (PR #29) — não está em
`main`. O fix de `salvarFonte` foi aplicado nesta branch nova a partir da
`main` e **também foi replicado como commit na PR #29**, para que o teste A
possa ser reproduzido no mesmo preview em que a proprietária já está.

## Teste B — Pessoa/Núcleo → observação

| Etapa | Onde |
|---|---|
| Rota | `/casos/$caseId` (aba "Pessoa e família" do Caso 360) |
| Componente | `AbaCadastro`, `src/components/caso/cadastro-checklist.tsx` — a mesma tela dos prints enviados pela proprietária (Adair, Felipe, Ana Luiza, contratada) |
| Handler do botão Salvar | `onChange` dos selects/inputs por linha → mutation que chama `salvarItemChecklist` |
| Server function | `salvarItemChecklist`, `src/lib/cadastro-checklist.functions.ts` |
| Tabela | `checklist_cadastral` |
| Usuário/organização | mesmo padrão (`requireSupabaseAuth`) |
| Comando antes do fix | `.update(patch).eq("id", data.id)` — **sem `.select()`, sem checar linha afetada** |
| Resultado antes do fix | Igual ao Teste A: `error` nulo em zero-linha-afetada, função devolvia `{ok:true}` sem nunca confirmar a gravação |

Esta tela **já está em `main`**, então o Teste B é reproduzível na `main` de
hoje — e o fix desta PR corrige exatamente o caminho que ela usa.

**Achado colateral no mesmo print (fora do escopo de persistência, registrado
à parte):** a tela também mostrava o CNPJ/razão social da contratada como
"pendência", como se nunca tivessem sido informados — mas esse dado já existe,
oficial e versionado, em `PERFIL_INSTITUCIONAL`
(`src/lib/contrato-base-consolidado.ts`), só com chave de campo diferente. Não
é bug de persistência (nada falhou ao salvar); é uma tela pedindo de novo um
dado que já existe em outro lugar do sistema. Esse achado e a queixa de UX
mobile específica (tabela horizontal, decisão do Felipe tratada como
pendência) ficam para uma PR separada, suspensa por instrução explícita da
proprietária até este P0 fechar.

## O que foi corrigido nesta PR

- `src/lib/fontes-genealogicas.functions.ts` — `salvarFonte`,
  `salvarAvaliacaoFonte`, `salvarBacklogFonte`, `arquivarRegistroG08` agora
  usam `gravarComVerificacao`/`inserirComVerificacao`
  (`src/lib/persistencia.server.ts`): exigem `organization_id` na cláusula do
  `UPDATE`, confirmam linha afetada, releem do banco e comparam campo a campo.
  Qualquer divergência agora **lança erro explícito** (`NENHUMA_LINHA_AFETADA`
  ou `DIVERGENCIA_PERSISTENCIA`) em vez de devolver sucesso.
- `src/lib/cadastro-checklist.functions.ts` — `salvarItemChecklist` mesma
  correção: busca `organization_id` da própria linha, usa
  `gravarComVerificacao`.

Nenhuma mudança em RLS, sessão, isolamento por organização, permissões ou
auditoria de fundo — os dois fixes só fecham o buraco de "sucesso sem
confirmação", reaproveitando a camada que já existe e já é testada.

## O que ainda não foi tocado (risco conhecido, não resolvido)

O mesmo padrão não verificado (`.update()` sem checar linha afetada) aparece
também nestes arquivos — nenhum foi alterado nesta PR, para não introduzir
mudança não testada em telas que a proprietária não pediu para verificar
agora:

```
achados-genealogicos.functions.ts       jornada-cliente.functions.ts
biblioteca-evidencias.functions.ts      message-library.functions.ts
biblioteca-mestre.functions.ts          migracao.functions.ts
case-service-consolidacao.functions.ts  nucleos-desk.functions.ts *
clientes.functions.ts                   onboarding-jornada.functions.ts
comercial.functions.ts                  onboarding-plano.functions.ts
contrato-parametros.functions.ts        onboarding.functions.ts
contrato-preparar.functions.ts          ops.functions.ts
contratos.functions.ts                  painel-hoje-acoes.functions.ts
conversao.functions.ts                  perfil-institucional-persistido.functions.ts
crm-desk.functions.ts                   pesquisa-cadeia.functions.ts
crm-fluxo.functions.ts                  pesquisa-modulo.functions.ts
crm.functions.ts                        pesquisa.functions.ts
desk-canonico.functions.ts              pessoas-linhagens.functions.ts
documentos-solicitacoes.functions.ts    piloto-ana.functions.ts
documentos.functions.ts                 piloto.functions.ts
equipe.functions.ts                     plano-acao-pesquisa.functions.ts
fontes-documentos-integracao.functions.ts  portal-atendimento.functions.ts
fontes-documentos.functions.ts          portal-cliente.functions.ts
governanca.functions.ts                 portal.functions.ts
homologacao-revisao.functions.ts        qualidade.functions.ts
integracoes.functions.ts                relatorios-fase.functions.ts
```

`* nucleos-desk.functions.ts` é um caso à parte: `salvarMembroNucleo` e
`salvarDossieNucleo` **já fazem verificação própria** (select + comparação
campo a campo, escrita à mão em vez de usar o helper compartilhado) — código
correto, só não usa a função central. Listado aqui por transparência, não por
estar quebrado.

**Recomendação:** varredura sistemática dos 46 arquivos, migrando cada
`.update()`/`.insert()` para `gravarComVerificacao`/`inserirComVerificacao`,
uma leva por vez, cada leva validada no preview antes da próxima — não como
uma PR única e grande.

## Regra aplicada nesta PR (vale para qualquer fix futuro de gravação)

- Nunca fechar formulário nem dizer "salvo" antes do `UPDATE`/`INSERT`
  confirmar linha afetada.
- Depois de confirmar, reler do banco e comparar — não confiar em estado local.
- Se a releitura não bater, erro explícito — nunca sucesso.
- Sem service-role no client, sem bypass de RLS, sem edição direta de dado de
  produção para "forçar" teste.

## Plano de teste que a proprietária pode rodar no preview

1. **Teste A**: `/fontes-genealogicas` → abrir uma fonte de teste → Editar →
   mudar só "Próxima ação" → Salvar → F5 completo → confirmar que o valor
   novo aparece. Se falhar agora, a tela deve mostrar um erro explícito (não
   silêncio) — copiar esse erro para investigação.
2. **Teste B**: Caso 360 de um caso de teste → aba "Pessoa e família" →
   mudar a observação de um item → Salvar → F5 completo → confirmar
   persistência.

Não mesclar esta PR nem a PR #29 até a proprietária validar os dois testes
acima no preview.
