# Estado operacional atual — Clube Ancestral

**Vigente em:** 2026-09-11  
**Git `main` de referência:** `18981e5a` — commit no Git **não** é prova de deploy nem de banco.  
**Produção pretendida:** `https://soul-ancestry.vercel.app` (deployment desta sessão: não confirmado).  
**Índice histórico:** `docs/resgate/Mapa_de_Resgate_Prompts_Clube_Ancestral_ate_2026-09-10.csv`  
**Ordem de execução:** `docs/resgate/ORDEM_UNICA_EXECUCAO_CURSOR_RESGATE.md`  
**Adendo de continuidade:** `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
**Registro de prova autenticada:** `docs/relatorios/2026-09-11_registro-prova-autenticada.md`

## Como ler (git ≠ banco ≠ produção)

- **Bom e deve ficar:** Planejador, próxima ação canônica, Caso 360, pessoa/caso, LGPD por titular, Canva aprovada protegida, mockup de 17 telas, memória permanente.
- **Executado em parte / quarentena:** motor unificado, onboarding, cadência, pesquisa, portal, contratos — código pode existir; falta prova na interface e no banco.
- **Só documento:** de-paras e artefatos mestres — histórico pesquisável, não funcionalidade.
- **Lixo lógico, não exclusão física:** zero travas, migração ampla, SKU como premissa, planilha mestre/DRE/Asaas como motor. Retirar autoridade operacional; **não** apagar arquivo e **não** arquivar o contexto até `COMPROVADO_EM_USO`.
- **Supabase:** o mapa indica migrations aplicadas até **09/09 05:53 UTC**. No Git há alteração posterior, inclusive `20260910184500_timeline_operacional_e_rls_portal.sql` — **não aplicar** até a proprietária ver o SQL, o efeito e a reversibilidade.
- **PRs:** as listadas no mapa como perigosas (#30 #42 #48 #50 #53 #54 #66 #68 #74 #76 #80) já estão em `main` no Git (10/09). Isso é “existe no Git”. Restam abertas **#32 #35 #40** — quarentena, sem merge automático.

Premissa: `case_plans` + `salvarPlanejadorOperacional` governam o ativo.

| Núcleo | Fonte canônica | Arquivo / rota | Banco / RPC | Status | Próxima ação técnica |
| --- | --- | --- | --- | --- | --- |
| Pessoa / cliente | `clientes` via `criarRegistro` | `/clientes`, `/pessoas/$clienteId` | `clientes` | parcial | Provar criar/selecionar e recarregar |
| Caso | `crm_casos` via `abrirCasoOperacional` | `/casos`; ficha `/casos/$caseId` | `crm_casos` | executado no Git; não comprovado em produção | Provar abrir caso com cliente + serviço |
| Serviço / jornada / planejador | `case_plans` via `salvarPlanejadorOperacional` | `PlanejadorOperacional` na ficha e em contrato/preparar | `case_plans` (não `planner_tarefas`) | parcial | Gravar plano e recarregar; SKU não é trava |
| Tarefas | `tarefas` + `caso_id` via `salvarTarefa` | `FormularioTarefaCaso`; `/tarefas` | `tarefas` | parcial | Responsável, prazo, prioridade, recarga |
| Próxima ação | RPC já existente | Ficha, lista, Painel Hoje | `proxima_acao_prioritaria` / `_lote` | ativo no código; pendente de validação | O mesmo texto na ficha e no painel; sem segunda narrativa |
| Pendência / bloqueio | `tarefas.status=bloqueada` | mesmo formulário da ficha | `motivo_bloqueio` | parcial | Registrar bloqueio visível; sem tabela nova |
| Timeline | `registrarTimelineCaso` | ficha | `case_timeline_events`; trigger no SQL pendente | pendente de migration | App grava; trigger/RLS só com autorização |
| Painel de Calls | tabela `leads` | `/calls`; atalho Visão Geral e Comercial | `leads` | ativo no código; pendente de validação | Não esconder. Varredura: sinal → rascunho sem quebrar `onAchadosMudaram` (correção nesta branch) |
| Cadeia proposta / condição / OS | planejador vigente; Canva histórico | contrato/preparar, OS | `case_plans`, propostas, `service_orders` | parcial | Não sobrescrever Canva aprovada |
| Portal / RLS | `portal_casos`; 7 abas | `/portal/*` | view + `app_projections` | pendente de validação | Dois clientes; `casos_select` ainda `is_org_member` |
| Pesquisa | `research_cases` / evidências | menu `/pesquisa-modulo` | `research_cases`, `evidences` | legado + parcial | Um achado no caso certo; `/pesquisa` isolada |
| Biblioteca Mestre | curadoria, grupo Governança | `GRUPOS_DESK.governanca` | — | ativo como nav | Não virar dashboard paralelo |
| Legado isolado | dump / planilha / DRE / Asaas antigo | `src/data/casos.ts` | `legacy_record_links` | legado | Não apagar; não comandar |
| PRs em quarentena | mapa P56 + ordem §6 | GitHub | — | pendente de decisão | #32 #35 #40 abertas. Não mergear. Lista curta antes de fechar |

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```
