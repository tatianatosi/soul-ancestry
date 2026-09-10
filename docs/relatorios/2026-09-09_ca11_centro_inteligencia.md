# CA11-CENTRO-INTELIGENCIA — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0. Nenhuma oitava aba, pesquisa paralela ou base duplicada criada — organização e correção de leitura sobre o que já existe.

## Localização e fonte concorrente real (item 1)

Mapeados leitores/escritores das 9 áreas. Achado central: **duas famílias de tabelas competem pelo mesmo conceito**, sem ponte entre elas:
- **Sistema legado, ainda navegável**: `/pesquisa` + `/pesquisa/$id` (`pesquisa.functions.ts`) grava em `pesquisa` (blob por bloco), `evidencias`, `evidencia_acessos` — desconectado do resto.
- **Sistema atual**: `/pesquisa-modulo`, `/pesquisa-evidencias/$caseId`, `/achados/$caseId`, `/pessoas-linhagens/$caseId`, `/biblioteca-evidencias/$caseId` giram em torno de `research_cases`/`research_people`/`genealogical_findings`/`lineage_encounters`.
- Dentro do próprio sistema atual, **duas tabelas de evidência coexistem** (`evidences` vs `research_evidence_items`) e **duas de variante de nome** (`name_variants` vs `research_name_variants`) — nenhuma unificada nesta rodada, apenas declaradas.

`genealogical_sources_catalog` (bases) NÃO é duplicado: Biblioteca Mestre e `/fontes-genealogicas` leem a mesma tabela — só a primeira mostrava menos campos que a segunda já gravava.

## Casa de cada núcleo (Biblioteca Mestre → Centro de Inteligência)

Novo mapa `MAPA_CENTRO_INTELIGENCIA` (`biblioteca-mestre.ts`), renderizado como seção fixa no topo de `/biblioteca`: as 9 áreas, a casa real de cada uma e a fonte concorrente onde existe. Bases/trilhas/dicionários/modelos já moravam em Biblioteca Mestre; evidências/pessoas/hipóteses continuam caso-scoped e abertas por link (nunca copiadas — item 2 já era respeitado por Casos 360, confirmado por teste). "Bases" ganhou os campos `proxima_acao` e `citizenship_track_id` (vínculo à trilha) que já existiam em `genealogical_sources_catalog` e nunca eram lidos aqui (item 3).

## Ações (item 5)

`salvarAchado`/`arquivarRegistroG06` (`genealogical_findings`) nunca acionavam nada: `eligible_for_client_deliverable`/`client_deliverable_id` existiam sem leitor. Agora `prepararConsequenciaAchado` abre (ou atualiza, idempotente por caso) um `case_alerts` pendente quando o achado é elegível e ainda não tem microentrega vinculada — e resolve o alerta sozinho quando deixa de ser elegível, ganha entrega ou é arquivado. Nunca publica, projeta ou cria contrato.

## Assistente (item 4)

`AssistentePesquisa` (componente único, reaproveitado em `/pesquisa-modulo/$id`, `/pesquisa/$id` e no widget global `AssistenteTransversal`) já bloqueia pesquisa externa, não confirma cidadania, não publica e não cria contrato — confirmado por leitura do prompt mestre e da trava de suficiência; nenhuma mudança necessária.

## App bloqueado sem projeção

Alerta criado é só interno (`case_alerts`); nenhuma escrita em `app_projections`/`client_deliverables` acontece nesta rodada — a decisão de gerar microentrega continua humana.

## Testes

`ca11-centro-inteligencia.test.ts` (15): consequência do achado (idempotente, resolve sozinha, nunca publica, exige case_id), mapa cobre as 9 áreas e declara a fonte concorrente real, navegação não apresenta mais `/pesquisa` como equivalente ao sistema atual (rota mantida, só rerotulada), Biblioteca Mestre lê os campos que faltavam. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (195 arquivos, 1896 testes) e `npx vite build` — todos limpos.

## Pendência

Unificação de `evidences`/`research_evidence_items` e de `name_variants`/`research_name_variants`, e decisão sobre desativar de vez `/pesquisa` (legado) — ambos fora do escopo deste corte, declarados no mapa para decisão futura da Proprietária.

Commit: branch temporária → main → recovery.
