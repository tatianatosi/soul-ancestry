# Artefato do Dia — Clube Ancestral

```yaml
status: rascunho — registro de encerramento do dia, sem merge autorizado
versão: 1.0
data: 2026-09-04
projeto: Clube Ancestral
classificação: relatório diário / registro de sessão
responsável pela decisão: Proprietária do Clube Ancestral
base normativa: docs/relatorios/2026-09-03_artefato_do_dia_clube_ancestral.md (formato, lido via
  git show origin/docs/artefato-do-dia-2026-09-03 — branch não mesclada nesta); Política obrigatória —
  Entrega de artefatos e versionamento no GitHub
repositório: tatianatosi/soul-ancestry
fontes/evidências: PRs #79–#85, leitura direta de código, migrations Supabase reais, dois agentes de
  exploração somente-leitura desta sessão, conversa com a proprietária
documento substituído: nenhum
```

## 1. Objetivo e escopo

Registrar o que foi decidido, corrigido, verificado e ainda está pendente no repositório
`tatianatosi/soul-ancestry` em 04/09/2026. Este artefato é o índice do dia — não substitui nenhuma
das PRs ou documentos individuais citados.

## 2. Contexto

O dia teve seis frentes, a maior parte encadeada a partir de achados do dia anterior (03/09) e de
pedidos sucessivos da proprietária: (a) destravar de verdade o motor de cadência unificando os
limiares D10/D14 e corrigindo uma fila que lia dado morto; (b) responder ao pedido "verifique se nada
foi executado" com um de-para de CRM caso, micro-entrega, onboarding, Operação Viva e Núcleos
Unificados; (c) receber e reconciliar, em rodadas sucessivas, três desenhos diferentes de
produtos-pai (P01–P09, depois PP-01–PP-08 por fase de vida, depois PP-01–PP-14) contra os 35 SKUs
reais ativos hoje; (d) corrigir um painel que a proprietária apontou como "não puxava o dado" mas na
verdade só sumia silenciosamente em erro; (e) auditar calculadoras/radares/cadência/Centro de
Inteligência e, a partir de uma observação direta da proprietária, confirmar que a "duplicidade de 3
tabelas de evidência" é na prática 1 ciclo de vida partido em 3 tabelas com vocabulários de status
divergentes entre telas; (f) investigar um bug relatado em Núcleos (clique em pessoa/dossiê-mãe não
leva a lugar nenhum) e, a partir dele, mapear Pessoa Canônica/360, ficha piloto × pesquisa
genealógica real, o fluxo de contrato e as travas de acesso ao App Cliente — achando, nessa última
frente, o que é hoje a suspeita mais forte de causa raiz para "acesso travado para entrada real de
cliente".

## 3. Decisões e regras confirmadas no dia

- **Limiares de cadência D10/D14 unificados em módulo único, comportamento preservado.** `onboarding-jornada.ts`
  e `jornada-cliente.ts` declaravam os mesmos números de forma independente (achado original do PR #75,
  03/09). Criado `src/lib/cadencia-limiares.ts`; os dois módulos passam a importar dali — PR #80,
  aprovado pela proprietária antes de executar.
- **Fila de cadência do TOP 30 lia dado morto — corrigido.** `case_plans.dias_sem_touchpoint` nunca era
  recalculado por ninguém; o `??` do código antigo nunca caía no cálculo real porque `0` não é
  nullish. As filas "10+ dias sem touchpoint" e "14+ dias sem atualização" ficavam **sempre vazias**,
  escondendo caso parado. `catalogo-top30.functions.ts` passa a calcular sempre a partir de
  `crm_casos.ultimo_touchpoint_em` — PR #80, mesmo pacote.
- **"Nada foi executado" é parcialmente correto — a espinha dorsal existe, a camada de unificação não.**
  De-para do PR #81 confirma: `client_deliverables.case_id` é decisão histórica real (não acidente);
  Núcleos Unificados tem só a Fase 1 (detecção, somente leitura) construída, deliberadamente pausada
  pela própria proprietária na PR #30 aguardando convergência com a PR #36 — fases 3–6 (fusão real)
  nunca foram construídas; Operação Viva rodou a disciplina de prontidão uma vez (25/08) e não foi
  repetida; "Motores Unificados" já tinha sido respondido pelos PRs #67/#79.
- **`prioridade-matriz.ts` é um terceiro lugar independente com os mesmos limiares 10/14** — achado
  novo do PR #84, não coberto pela unificação do PR #80 (esse arquivo não foi tocado pelo commit de
  unificação). Mesmo depois do PR #80 mesclado, o valor continuará existindo em 3 lugares por
  coincidência de digitação, não por importação — registrado como P0 no PR #84.
- **A reconciliação PP-01–PP-14 confirma cobertura parcial da terceira proposta de produto-pai.**
  20 de 35 SKUs ativos batem com a seção 5 do documento recebido hoje; 15 linhas citam código sem
  existência real; 15 SKUs ativos (famílias `CA-HIST-*`, `CA-IND-*`, `CA-MEM-*`, `CA-COMBO-001`,
  `CA-FAM-002`, `CA-WPP-002`) não aparecem na proposta nova — PR #85, parte 1.
- **A duplicidade de evidência é 1 ciclo de vida, não 3 tabelas — confirmado por observação direta da
  proprietária, seguida até o código.** `/biblioteca-evidencias` e `/pesquisa-evidencias` leem e
  escrevem a mesma coluna (`evidences.workflow_status`), mas usam dois vocabulários de rótulo escritos
  à mão que não batem em 4 dos 11 estados — a mesma evidência muda de aparência conforme a tela que a
  editou por último. `document_requests`, numa aba vizinha, modela quase o mesmo ciclo de vida de novo,
  com uma coluna `evidence_id` prevista no schema e nunca usada por nenhum formulário — PR #84, seção 14.

## 4. Achados verificados em código e banco (evidência, não fabricação)

| Achado | Evidência | Estado |
|---|---|---|
| Painel TOP 30 em `/contratos` sumia sem mensagem em qualquer erro (RLS, rede, servidor) | `painel-top30.tsx:29`, `if (q.isError \|\| !q.data) return null;` | **Corrigido — PR #83** (torna o erro visível; causa raiz do erro em si ainda não identificada em produção) |
| `nucleo_membros.cliente_id` já existe e já é buscado por `listarNucleos`, mas o frontend de `/nucleos` descarta o campo | `nucleos-desk.functions.ts:49-50` (select real) × `nucleos.tsx:50` (tipo `Membro` sem o campo) | **Confirmado, não corrigido** — backlog P0 do relatório de núcleos/Pessoa 360 (seção 6) |
| Dossiê-mãe é hoje só texto/link externo, sem conteúdo navegável no Desk | `nucleos.tsx`, ajuda do campo `link_interno`: "Arquivos não são replicados no Desk" | Confirmado — decisão de arquitetura em aberto, não é bug |
| "Pessoa Canônica" é especificação sem código | `PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md` se autodeclara "nenhum código alterado"; tabela `pessoas_canonicas` não existe no banco | Confirmado — especificação pura |
| Existe proposta mais recente e mais completa de "Pessoa 360" | Branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03`, não mesclada na branch de trabalho de hoje | Confirmado — pendente de decisão se é a direção aprovada |
| Ficha piloto e módulo real de Pessoas e Linhagens divergem no vínculo familiar | Ficha piloto lê `research_relationships`; módulo real grava `genealogical_relationships` — tabelas e colunas diferentes | Confirmado — um vínculo criado num não aparece no outro |
| **Assinatura de contrato nunca propaga para o gate do App Cliente** | `registrarAssinatura` grava `contracts.status="signed"`; busca exaustiva confirma que nenhum código escreve `crm_casos.contrato_assinado`, campo que `portal-elegibilidade.ts`/`fn_portal_case_access_guard` de fato verificam | **Confirmado, não corrigido** — provável causa raiz do acesso travado ao App Cliente |
| Evidência de pesquisa em 3 tabelas, com vocabulário de status divergente entre 2 telas que leem a mesma coluna | `FLUXO_EVIDENCIA` (`biblioteca-evidencias.ts:22-34`) × `STATUS_EVIDENCIA` (`pesquisa-cadeia.ts:39-52`) — ids diferentes em 4 de 11 estados | Confirmado — PR #84, seção 14 |
| `CA-CURSO-001` descrito como "arquivado" no documento PP-01–PP-14 recebido hoje | Extração anterior confirmou zero linhas, ativas ou arquivadas, para `CA-CURSO-*` em `product_catalog` | Contradição factual registrada — PR #85, parte 1 |
| `CA-CID-001` reclassificado como PP-02 (consultoria) no documento de hoje | Campo real `papel_comercial` do banco = "Diagnóstico e direção", batendo com P01/PP-01 das duas rodadas anteriores | Divergência registrada — PR #85, parte 1 |

## 5. Pull requests abertas hoje

| PR | Título | Tipo | Estado |
|---|---|---|---|
| #79 | De-para planejador de cidadania × produto-pai × motores unificados (aberta 23:50 de 03/09, base do dia) | docs | draft, aberta |
| #80 | Unifica limiares de cadência D10/D14 em módulo único + corrige fila de cadência do TOP 30 (dado morto) | refactor/fix | draft, `tsc`/`vitest` (1595 testes)/`vite build` verdes |
| #81 | De-para CRM caso, micro-entrega, onboarding, Operação Viva, Motores e Núcleos Unificados | docs | draft, mergeable |
| #82 | De-para SKUs × produtos-pai × países novos, triagem da sub-aba de catálogo (35 SKUs ativos extraídos ao vivo) | docs | draft, mergeable |
| #83 | Painel TOP 30 em `/contratos` mostra erro em vez de sumir silenciosamente | fix | draft, `tsc`/`vitest`/`vite build` verdes |
| #84 | Pente-fino de calculadoras, radares, cadência e Centro de Inteligência + adendo confirmando a duplicidade de evidência como 1 ciclo de vida | docs | draft, deploy de preview Ready |
| #85 | Reconciliação PP-01-14 × 35 SKUs ativos + auditoria de núcleos/Pessoa 360/contrato/acesso App Cliente | docs | draft, mesclado com `main` nesta sessão para resolver conflito, `tsc` limpo, deploy de preview Ready |

Todas em draft, nenhuma mesclada de forma autônoma, aguardando teste em preview e autorização
explícita da proprietária para merge.

**Nota sobre a PR #85**: a branch designada desta sessão (`claude/ancestral-club-desk-intelligence-0gsoeg`)
havia divergido de `main` antes de vários commits já integrados lá — a PR nasceu com conflito de
merge. Resolvido mesclando `origin/main` e corrigindo dois pontos onde o merge automático não marcou
conflito textual mas produzia erro: `comercial.functions.ts` tinha `atualizarObservacaoOrdem`
redeclarada duas vezes (mantida a versão de `main`, que usa gravação verificada) e `nucleos.tsx` teve
a versão de `main` adotada (superset — já inclui a edição de membro desta branch, mais a sugestão de
tarefa de acompanhamento). Validado com `tsc --noEmit` limpo antes do push.

## 6. Núcleos → pessoa, dossiê-mãe, Pessoa 360, ficha piloto, contrato e acesso ao App Cliente

Investigação disparada por relato direto da proprietária (clique em pessoa do núcleo ou no dossiê-mãe
não leva a lugar nenhum) e por um pedido de panorama mais amplo. Registrada como parte 2 da PR #85,
documento completo em `docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md`.
Resumo dos achados na tabela da seção 4; backlog completo (P0: propagar assinatura para
`crm_casos.contrato_assinado`, ligar `cliente_id` a um link de perfil em `/nucleos`; P1/P2: trazer a
branch de Pessoa 360 não mesclada, decidir tabela canônica de vínculo familiar, especificar o destino
do dossiê-mãe) e perguntas de decisão estão no próprio documento — não repetidos aqui.

## 6.1. Atualização do fim do dia — correções da Proprietária e três fixes executados

Depois da primeira versão deste artefato, a Proprietária corrigiu três leituras e autorizou execução
de código diretamente ("ataque e execute todas as correções necessárias"). Tudo registrado em
`docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md` (atualizado) e num novo
documento, `docs/auditorias/2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md`:

- **Novo achado — pipeline evidência→achado→alerta→App Cliente não existe ponta a ponta.** A pedido da
  Proprietária, verificado se cada evidência nova vira achado, gera alerta ao cliente e aparece no app.
  Nenhum elo é automático: achado é sempre ação manual; `client_deliverable_id` não tem campo de UI;
  alerta ao cliente **não existe** (`alertas-whatsapp.ts` só gera template nunca enviado;
  `DescoberturasAlertas` é componente órfão, `console.log` em vez de envio real, não importado em
  nenhuma tela); a rota real `/portal/entregas` é estática (sempre "nenhuma entrega"); e
  `client_deliverables` está bloqueada por falta de policy de portal. O caminho que de fato funciona
  (`app_projections`) parte de evidência, não de achado.
- **Correção: dossiê-mãe não é decisão em aberto.** Já existe fila de governança real
  (`drive-provisioning.ts`, `CA-AC-10`, tabela `drive_provisioning_queue`) que só libera provisionamento
  de pasta após contrato+pagamento+onboarding, com execução sempre manual fora do Desk. O gap real é que
  `nucleos_familiares.link_interno` (o campo visível em `/nucleos`) nunca foi ligado a essa fila — duas
  peças corretas, nunca costuradas.
- **Correção: Pessoa 360 já está aprovada**, não pendente de decisão — protocolo de 5 camadas (PR #64,
  branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03`, ainda não mesclada aqui). Falta execução,
  não aprovação.
- **Fragmentação da Ana, localizada com precisão**: `contract_parties` já vincula corretamente a
  `clientes.id` (`contrato-parametros.functions.ts:1204-1208`); `nucleo_membros` não, mesmo a coluna
  existindo — a materialização do piloto (`piloto-ana.functions.ts:167-176`) cria membros só por nome,
  sem `cliente_id`. `genealogical_person_profiles` (pesquisa genealógica) não tem — e não deveria ter —
  esse vínculo: é isolamento deliberado da Camada 3 do protocolo aprovado, não fragmentação.
- **De-para campo a campo `research_relationships` × `genealogical_relationships`**: a ficha piloto tem
  4 campos de confiança/workflow que o módulo real não tem (`confidence_level`, `status`,
  `directionality`, `supporting_evidence_count`); o módulo real tem `client_visibility` (sanitização
  para o App Cliente) e vínculo direto a evidência/fonte que a ficha piloto não tem. Recomendação:
  unificar em `genealogical_relationships`, somando os 4 campos que faltam nele.

**Três correções executadas** (commits `d06227e`, `46290af`, branch `claude/ancestral-club-desk-intelligence-0gsoeg`,
`tsc --noEmit` limpo + 1595/1595 testes + `vite build` limpo em cada uma):
1. `registrarAssinatura` agora grava `crm_casos.contrato_assinado = true` junto com `contracts.status = "signed"`
   — a lacuna que impedia o portal de reconhecer um contrato assinado no motor novo.
2. `/nucleos` ganhou link "Ver perfil" (`/pessoas/$clienteId`) para todo membro com `cliente_id`
   preenchido, mais um seletor "Vincular a pessoa cadastrada" no formulário de edição (nova função
   `listarClientesParaVinculo`) — corrige a fragmentação da Ana de forma geral, não só pontual.
3. A divergência proposta × Planejador (`preencherDeOrigens`/`conflitosProposta`) — que antes só
   aparecia uma vez num toast e desaparecia — agora grava a mesma marca de conflito por campo já usada
   para incoerência de país/rota, aparecendo de forma persistente nas duas telas de parâmetros
   contratuais e se resolvendo do mesmo jeito (editar o valor limpa o conflito).

## 7. Riscos, limites e itens fora de escopo

- Nenhuma migration foi aplicada hoje. Nenhuma escrita direta em produção fora do que já estava
  registrado nos documentos das rodadas anteriores.
- O MCP do Supabase está sem autorização nesta sessão (parte da conversa que gerou a PR #85) — a
  reconciliação PP-01-14 usou as duas extrações independentes já feitas hoje mais cedo (PR #82 e o
  documento da matriz PP-01-08), não uma nova consulta ao vivo.
- As três correções P0 do relatório de núcleos/contrato (seção 6.1) foram implementadas e validadas
  nesta rodada — deixam de ser risco em aberto.
- O pipeline evidência→achado→alerta→App Cliente não existe hoje (seção 6.1) — não foi corrigido nesta
  rodada, só documentado; decisão de canal/via de exposição é da Proprietária antes de qualquer código.
- A causa raiz do erro real por trás do painel TOP 30 (PR #83) não foi identificada — o fix só torna
  a falha visível; pode exigir um segundo ciclo depois que a proprietária vir a mensagem real.
- `prioridade-matriz.ts` continua com os limiares de cadência redeclarados por fora da unificação do
  PR #80 — backlog P0 do PR #84, não executado ainda.
- Nenhuma das três taxonomias de produto-pai (P01–P09, PP-01–PP-08, PP-01–PP-14) foi escolhida como
  final — decisão segue pendente da proprietária, registrada em três documentos diferentes agora.
- Divergência entre `research_relationships` e `genealogical_relationships` (vínculo familiar) e entre
  `evidencias`/`evidences`/`research_evidence_items` (evidência) seguem sem tabela canônica decidida.

## 8. Critérios de aceite deste artefato

- [x] Lista as PRs reais abertas no dia, com números e títulos conferidos via API do GitHub, sem inventar.
- [x] Separa achado verificado em código/banco de pendência ainda não resolvida.
- [x] Registra a resolução do conflito de merge da PR #85 com o que de fato foi decidido em cada arquivo.
- [x] Registra os limites do próprio trabalho do dia, incluindo o que ficou proposto mas não implementado.

## 9. Próximos passos

1. Proprietária testa em preview e decide merge das PRs #79–#85 — nenhuma altera dado de produção.
2. Decidir o canal de alerta ao cliente (e-mail, WhatsApp, notificação no app) e a via oficial de
   exposição de achado (`client_deliverables`/`/portal/entregas` ou `app_projections`) — seção 6.1.
3. Decidir se a branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03` (não mesclada) já é a
   direção aprovada para Pessoa 360, antes de desenhar qualquer unificação nova.
4. Decidir a tabela canônica de evidência (`evidencias` × `evidences` × `research_evidence_items`) e de
   vínculo familiar (`research_relationships` × `genealogical_relationships`) — mesma lógica de decisão,
   duas frentes pendentes.
5. Escolher a taxonomia final de produto-pai entre P01–P09, PP-01–PP-08 e PP-01–PP-14, e só então
   preencher o mapeamento 91/91 dos SKUs do saneamento contra a taxonomia escolhida.
6. Importar `CADENCIA_ATENCAO_DIAS`/`CADENCIA_CRITICA_DIAS` de `cadencia-limiares.ts` dentro de
   `prioridade-matriz.ts` (PR #80 mesclada primeiro), fechando o terceiro lugar independente achado no PR #84.
7. Aguardar a proprietária reproduzir o erro real do painel TOP 30 em produção (PR #83) para diagnosticar
   a causa raiz (RLS, organização, etc.).
8. Retomar a convergência das PRs #30/#36 (Núcleos Unificados) quando a proprietária decidir priorizar essa frente.

---

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
