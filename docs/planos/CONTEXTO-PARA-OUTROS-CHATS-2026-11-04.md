# Contexto do projeto Clube Ancestral, para outros chats (04/11/2026)

Cole este arquivo no início de qualquer chat novo (Claude, Lovable, Cursor). Ele diz o que é o projeto, as regras, o estado de hoje e o que está em andamento. Fatos conferidos em 03 e 04/11/2026 no banco vivo (só leitura), no GitHub e na produção.

## 1. O que é

- **Produto:** Clube Ancestral, com Desk (equipe) e App Cliente (portal), sobre o caso em `crm_casos`. Cidadania europeia com pesquisa genealógica.
- **Lançamento:** com UMA cliente, a Ana (caso `CA-CID-AT-FAM-2026-001`, id `a11a0000-0000-4000-8000-000000000002`).
- **Proprietária:** Tatiana. Ela decide e autoriza. Não pedir prints nem provas para o que já se sabe; executar.

## 2. Onde as coisas estão

| Item        | Valor                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Repositório | `tatianatosi/soul-ancestry` (GitHub)                                                             |
| Lovable     | projeto `1a628b61-ec68-454f-85e1-671d6f297370` (Ancestral Canvas)                                |
| Produção    | `https://soul-ancestry.lovable.app` — saúde em `/api/saude` (mostra o sha publicado e `bancoOk`) |
| Banco       | Supabase do Lovable Cloud, `liiqqibnirnpnvjmjrpj`. O projeto `zsxpd…` é o banco ANTIGO: não usar |
| Vercel      | os dois projetos foram pausados. Lançamento só no Lovable                                        |
| Stack       | TanStack Start (`createServerFn`), TanStack Query, Supabase (RLS, CHECKs, triggers), vitest, bun |

## 3. Regras que valem para todos

1. Ler `AGENTS.md` e `CLAUDE.md` antes de editar. Eles mandam.
2. **Banco:** só o Lovable aplica schema. Agentes não escrevem em `supabase/migrations` nem `drizzle/migrations`. SQL proposto vai em `supabase/pendentes/` com o cabeçalho `ESTADO: NÃO APLICADO`. Nunca criar tabela nem CHECK novo. Antes de gravar qualquer literal (status, tipo, papel), conferir o CHECK da migration e `src/integrations/supabase/types.ts`.
3. **Git:** trabalhar em branch `claude/*` (ou `cursor/*`), abrir PR contra `main`, merge comum (sem squash, sem rebase). A `main` é protegida: exige PR e os checks `guard` e `typecheck-test-build`.
4. **Corpo da PR:** precisa de um bloco ```json com a matriz de evidências: `agent` (Claude ou Lovable), `base_sha`, `tested_sha` igual ao SHA da cabeça da PR, `files` igual à lista exata de arquivos alterados, e `criteria` com `status` "PASSOU", `kinds` dentro de `code|ui|write|access|contract|payment|publication` e `evidence.test` com URL https. Cada push muda o SHA: reenviar o corpo. A guard também reprova se um arquivo estiver em outra PR aberta.
5. **Lovable ↔ GitHub:** o Lovable sincroniza só a `main`. Quando o editor do Lovable diverge, ele cria branches `lovable-sync-*`; a sincronização volta à `main` por PR. Branch `claude/*` que leva migration do Lovable é barrada pela guard: use o nome `lovable-sync-*`.
6. **Publicar** é sempre ato separado e precisa do "pode publicar" da Proprietária. Depois de publicar, conferir `/api/saude` (sha) e ler `audit_logs` com `acao='erro_app'`.
7. **Sempre com a palavra dela:** migration, RLS, convite, publicação, envio externo, cobrança, assinatura e exclusão de dado.
8. **Classe de defeito principal ("nada salva"):** o supabase-js não lança exceção. Por isso: checar `error` em toda leitura e escrita, não esconder erro com `data ?? []`, tratar UPDATE de 0 linhas como falha, não fazer chamada sem esperar, e não dizer "Salvo" sem linha gravada. Auditoria usa `registrarAuditoria` (`src/lib/auditoria-segura.server.ts`).

## 4. Estado de hoje

| Item                     | Estado                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Produção                 | sha `7dbf5716` (publicado em 03/11), `bancoOk`                                                                                                        |
| `main`                   | `4dcf374a`: depois da produção entraram #230 (retira a regra reservation-sync) e #217 (tela de aprovação da fila de comunicação). Ainda não publicado |
| Erros desde a publicação | 0 linhas `erro_app` até 03/11 17h UTC; o app quase não foi usado depois disso                                                                         |

### Progresso (o que já está pronto)

```
Auditorias (16 relatórios)          ████████████████████ 100%  12 da rodada 1 + 4 da rodada 2
Fase A  Autoridade e erro visível   ████████████████░░░░  80%  A1–A3 no ar; A4 em parte
Fase B  Gravações que falhavam      ████████████████████ 100%  B1–B9 no ar
Fase C  Portal, convite, genograma  ████████████████████ 100%  C1–C8 no ar
Fase D  Documentos                  ░░░░░░░░░░░░░░░░░░░░   0%  D1–D5 (D5 é ato da Proprietária)
Fase E  Órfãos, planejador, infra   ████░░░░░░░░░░░░░░░░  20%  E5 feito
Fase F  16 achados sem tarefa       ░░░░░░░░░░░░░░░░░░░░   0%
Fase G  Rodada 2 (45 microtarefas)  ██░░░░░░░░░░░░░░░░░░  10%  em execução desde 04/11 (seção 6)
Lançamento com a Ana                ░░░░░░░░░░░░░░░░░░░░   0%  8 bloqueios (seção 5)
```

"No ar" significa mesclado na `main` e publicado (`7dbf5716`). Nenhum item tem ainda prova de uso real pela Proprietária.

## 5. Bloqueios do lançamento com a Ana (conferidos no banco em 03/11)

| #   | Bloqueio                                                           | Estado                                                                                      | Dono                                                          |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | 3 documentos internos da Ana liberados ao cliente                  | continuam liberados                                                                         | Proprietária: Desk → Privacidade → "Retirar do App"           |
| 2   | 8 vínculos familiares aprovados ao cliente com pesquisa `pendente` | publicados                                                                                  | Proprietária decide: só confirmados, ou "provável" com rótulo |
| 3   | Contrato                                                           | `approved_for_send` desde 02/11, sem assinatura; `crm_casos.contrato_assinado=true` diverge | Proprietária                                                  |
| 4   | Plano do caso (`case_plans`)                                       | `rascunho` (o App mostra fase vazia)                                                        | Proprietária ativa                                            |
| 5   | Próxima ação                                                       | "sem_nova_acao_necessaria" com prazo vencido                                                | código (G4.4) + Proprietária                                  |
| 6   | Convite da Ana                                                     | venceu em 03/11 14h25 UTC sem login; há um acesso antigo ativo sem caso                     | reconvite só depois de 1 e 2                                  |
| 7   | Pagamento parcial ou divergente libera portal e OS                 | em correção (G1.1)                                                                          | código                                                        |
| 8   | Uso real depois das correções                                      | sem uso                                                                                     | Proprietária                                                  |

## 6. Em andamento agora (04/11)

Correções da rodada 2 em branches separadas (cada uma vira PR com a matriz):

| Branch                              | Conteúdo                                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `claude/g1a-pagamento-os`           | G1.1 conciliar pagamento, G1.2 pagamento no GoLive, G1.3 "Ativar OS", G1.4 próxima parcela, G1.6 resumo financeiro, G1.8 estorno         |
| `claude/g1b-financeiro-proposta`    | G1.5 KPIs, G1.7 `parcialmente_paga`, G1.9 `/portal/proposta`, G1.10 valor pt-BR, G1.11 instrumento, G1.12 proposta, G1.14 contrato       |
| `claude/g2-caso360-verdade`         | Caso 360: consolidação, bloqueios, botões escondidos, próxima ação manual, timeline, duplicações, "Salvo" falso, leituras sem erro       |
| `claude/g3-leads-calls`             | calls e leads: botão gravar, consentimento, aceite, erros engolidos, campos ignorados                                                    |
| `claude/g4-touchpoint-proxima-acao` | `dias_sem_touchpoint`, próxima ação, `gravarComVerificacao`, DELETE em `contract_validation_results`, cabeçalhos de `supabase/pendentes` |

### PRs abertas

- **#231:** docs (realidade do lançamento, backlog G, checklist).
- **#232:** script de reconciliação de vocabulário contra os CHECKs.
- **#233:** de outro chat. Corrige o bloqueio da Proprietária (409 da pesquisa e `proprietariaOperando`) e cria a fila `docs/execucao/` (`LEIA-ME`, `DECISOES_JA_TOMADAS`, `FILA_DE_MICROCORTES_AUTORIZADA_v2`, `BLOCO_Q`). **Atenção:** os blocos G02 a G05 dessa fila são os mesmos itens das branches acima; quem pegar um item confere antes se ele já tem branch.
- **Antigas:** #222, #215, #212, #202 (já está na `main` por outra via), #125, #121, #120, #118, #117, #114, #110, #108, #105, #104, #102, #97, #32. A Proprietária decide fechar.

## 7. Documentos de referência (no repositório)

| Arquivo                                                              | Para quê                                                                      |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `docs/planos/REALIDADE-LANCAMENTO-2026-11-03.md`                     | bloqueios, órfãos e tarefas não executadas dos planos anteriores (na PR #231) |
| `docs/planos/BACKLOG-TAREFAS-AUDITORIAS-2026-11-02.md`               | backlog completo: fases A–G e F1–F16                                          |
| `docs/planos/CHECKLIST-EXECUCAO-AUDITORIAS-2026-11-02.md`            | estado de cada tarefa em código, banco/produção e uso                         |
| `docs/planos/PLANO-AUDITORIAS-CARTOGRAPHER-UNDERSTAND-2026-11-02.md` | plano das auditorias por fase                                                 |
| `docs/grafo/PENDENCIAS-LANCAMENTO-2026-11-02.md`                     | órfãos e PRs antigas                                                          |
| `src/lib/orfaos-modulos-classificados.ts`                            | veredito de cada módulo órfão                                                 |
| `docs/execucao/` (PR #233)                                           | fila única proposta pelo outro chat                                           |

Os 16 relatórios de auditoria ficam numa pasta local da sessão (`.cartographer/reports/`), fora do git. Os achados deles estão no backlog.

## 8. Órfãos

30 módulos sem uso em produção (grafo de 03/11):

- 15 aposentados;
- 9 cascas duplicadas de telas que já existem;
- 2 sem veredito (`src/data/saneamento.ts` e o próprio registro);
- **4 aguardam a Proprietária:** `preview-fixtures.ts` (recomendação: aposentar), `painel-top30.tsx` (religar no Painel Hoje), `agenda-assistida.ts` (só se a agenda entrar), `fontes-documentos-rls.ts` (aposentar).

## 9. Decisões que só a Proprietária toma

1. Os 8 vínculos familiares (bloqueio 2).
2. Os 4 órfãos acima.
3. Nome do pai: "Adair Gomes Silveira" × "Adair Pinto Silveira Júnior".
4. Documento de representação do Felipe (menor).
5. Fechar as PRs antigas.
6. Sentry: criar o projeto e pôr `SENTRY_DSN` no Lovable.
7. SQL propostos para o Lovable aplicar: SLA para prioridade `critica`; a RPC `proxima_acao_prioritaria` isolada por organização; pedidos de documento do portal no motor de próxima ação.
