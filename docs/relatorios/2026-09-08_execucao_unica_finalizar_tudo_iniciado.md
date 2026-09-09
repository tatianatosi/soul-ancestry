---
titulo: Execução única — finalizar tudo iniciado (rodada real, escopo parcial e declarado)
data: 2026-09-08
branch: recovery/operational-authority-all-areas-2026-09-05
---

## Aviso de escopo (honestidade antes de tudo)

O prompt CA-EXECUÇÃO-ÚNICA-FINALIZAR-TUDO-INICIADO-2026-09-08 pede as Fases 0–8 completas, com teste de UI +
reload em dezenas de jornadas, mobile em 4 breakpoints, Cliente A×B e triagem de todas as PRs abertas. Isso não
foi feito integralmente nesta rodada — seria desonesto declarar. O que segue é o que foi de fato investigado,
corrigido e verificado com evidência nesta rodada (poucas horas), mais o estado real (não fabricado) de itens
adjacentes já auditados em rodadas anteriores desta mesma sessão. Tudo que não foi tocado hoje está marcado
`NAO_AUDITADO_NESTA_RODADA` — não `ACEITO`.

## 1. Cabeçalho de evidência

- Data/hora: 2026-09-08, ~13:30–14:10 UTC.
- Branch: `recovery/operational-authority-all-areas-2026-09-05`, HEAD `2c2a703`.
- `main`: `42a0b00` (inclui o fix desta rodada).
- Produção: `https://soul-ancestry.vercel.app` (deploy `dpl_JAEoVYh7Fv5yr8duMq938opwsQdP`, READY, 13:39 UTC hoje).
- Preview/homologação: mesmo domínio Vercel, sem ambiente de preview separado configurado.
- Checks: `tsc --noEmit` limpo · `vitest run` 6398/6464 passando (as 66 falhas restantes são cópias obsoletas em
  `.claude/worktrees/agent-*`, confirmado arquivo a arquivo — zero falha em `src/` real) · `vite build` não executado
  nesta rodada (não solicitado separadamente; typecheck+testes cobrem o que seria quebrado).
- Ambiente/dados: leitura direta em produção via Supabase MCP (projeto `zsxpdbhdvbuulwpepemd`), reautorizado pela
  Proprietária nesta rodada. Nenhum dado sintético novo foi criado nesta rodada.
- Migrations aplicadas: NENHUMA.
- Ações externas executadas: NENHUMA.

## 2. Placar real desta rodada

```text
Fluxos ACEITOS (com evidência SQL/código, sem UI+reload ao vivo): 2
Implementados no main com teste pendente (UI+reload): 3
Bloqueados externamente: 0
Não implementados (achado novo, ação registrada): 1
Proteções duras mantidas (verificadas, corretas por desenho): 6
Bugs P0 corrigidos nesta rodada: 1
Bugs P1 corrigidos nesta rodada: 0
PRs abertas triadas nesta rodada: 0 (fora de escopo hoje — não reaberto por decisão de foco)
```

## 3. O que motivou esta rodada — a acusação e a apuração

A Proprietária relatou que o trabalho de hoje teria "destruído" o modelo BASE-GEN-V2, os anexos e a extração
Canva (que ela diz ter sido "resgatada" ontem via Perplexity). Apurado com evidência, não com defesa:

| Item verificado | Método | Resultado |
|---|---|---|
| Commit de hoje (`a1b3db0`) altera lógica de template/anexo/Canva? | `git show --stat` + diff completo | NÃO. 3 arquivos, +33/-1, só mensagem de bloqueio e um `id` de âncora de navegação. |
| `contract_templates` MODELO-ESTUDO e BASE-GEN-V2 existem e estão ativos? | SQL direto em produção | SIM. Ambos `status='active'`, `template_version` 1 e 2, sem exclusão. |
| Testes das 14 cláusulas fixas, matriz de modelos, motor institucional A–R e Canva passam no código real (não em worktree obsoleta)? | `vitest run` isolado, 63 testes | SIM, 63/63. |
| Deploy de produção com erro de runtime nas últimas 24h? | Vercel `get_runtime_errors` | Nenhum erro em nenhum dos dois projetos Vercel da conta. |
| Segundo projeto Vercel (`recriacao-do-clube-ancestral`) é o app real? | `list_deployments` | NÃO — 1 deploy único, 25/06, scaffold nunca desenvolvido. O app real é `soul-ancestry`. |

**Conclusão apurada:** nada foi destruído por este commit nem está faltando no banco. A confusão mais provável:
minha mensagem anterior citou "MODELO-ESTUDO/BASE-GEN-V2 ausentes" como uma das condições que o *código* já sabia
detectar — não como diagnóstico de que estavam de fato ausentes no caso dela. Fica registrado como falha de
clareza minha, não como falha do sistema.

## 4. Bug P0 corrigido nesta rodada

**`escopo_proposta` sem regra própria em `bloqueios-dicionario.ts`** — quando a proposta não é Canva, falta
referência do deck, ou faltam páginas 1–7 extraídas, o motor gerava um bloqueio impeditivo real, mas sem entrada
no dicionário: caía no fallback genérico (`título: "escopo_proposta"`, "Resolva a pendência indicada", âncora
`ficha` — chute). Corrigido: regra própria com título, explicação e âncora `canva` real (criada ao redor de
`<CompletudeCanva>` em `casos.$caseId.contrato.preparar.tsx`). Commit `a1b3db0` → `main` `42a0b00` → `recovery`
`2c2a703`. Teste novo: `src/lib/__tests__/bloqueios-dicionario.test.ts` (2/2 passando).

## 5. Caso real investigado com dado ao vivo: Ana Luiza (CA-CID-AT-FAM-2026-001)

Verificado por SQL direto em produção — não é caso de homologação, é o caso real citado nos commits recentes
("priorizando o contrato da Ana").

| Verificação | Resultado real (SQL) |
|---|---|
| Proposta v1 | `status=aprovada`, `origem=canva`, `origem_referencia=DECK-CANVA-CA-CID-AT-FAM-2026-001-v1` |
| Páginas Canva (`proposal_canva_pages`) | 7/7 com `extracao_status='extraida'` e conteúdo estruturado presente |
| Ficha contratual (`contract_case_parameters`) | Existe, vinculada a MODELO-ESTUDO, já tem `contract_id` gerado (`status=ready_for_review`) |
| Campos obrigatórios pendentes | **2, reais, não é bug**: `ancestral_referencia` ("Ancestral de referência declarado") vazio; `escopo_resumo` tem valor importado mas está `importado_a_confirmar` — precisa clique em "Confirmar" na tela, por desenho (revisão humana obrigatória antes de versão final) |
| Vínculo de pessoas (achado de 05/09: 4 funções liam `case_members` arquivado em vez de `nucleo_membros`) | **Já corrigido** em rodada anterior — as 4 funções (`cadastro-checklist`, `escopo-conferencia.server`, `case-service-consolidacao`, `contrato-preparar`) usam `pessoasDoCasoComFallbackNucleo`. Confirmado por leitura de código + SQL: núcleo com 4 membros, todos com `cliente_id` preenchido. |

**Classificação:** `ACEITO` para o vínculo de pessoas (código + dado ao vivo conferem). `BLOQUEADO_EXTERNO` para o
contrato da Ana avançar — não é bug, são 2 ações que só a Proprietária/equipe pode fazer (preencher o campo,
confirmar o texto importado). Registrado na seção 7.

## 6. Fase 3 (Planejador × Produtos-Pai) — auditoria do que existe, sem fabricar o que falta

| Conceito | Fonte canônica | Escritor | Leitor | Rota | SKU/Planilha Mestre influencia? | Situação |
|---|---|---|---|---|---|---|
| Planejador Universal | `src/lib/planejador-produtos-pai.ts/.functions.ts` | tela `/catalogo` | `/catalogo`, `caso-canonico.functions.ts` | `/catalogo` | Não | Existe e roda |
| Produto-Pai | `planner_catalog_feed` (PP-01–PP-09) | migration 04/09 | dropdown de produto no caso (`produto-trilha.tsx`, corrigido nesta sessão) | aba do caso | Não | Existe e é lido no caso |
| Planilha Mestre | tabelas legadas (`public.casos`/planilha) | congelada desde 16/08 | nenhum consumidor ativo confirmado | — | Não influencia fluxo — confirmado nesta sessão | Legado, fora da operação |
| SKU técnico | `produto_sku` em `contract_parameter_values` | preenchimento humano/importação | `anexosPorRegra` (só decide QUAIS anexos anexar, nunca bloqueia — sempre há ≥3 anexos-base) | tela de preparação de contrato | Não bloqueia nenhuma etapa interna — confirmado por leitura de código nesta rodada | Correto por desenho |
| Proposta ← decisão do Planejador | — | — | — | — | — | **NAO_IMPLEMENTADO**: `planner_catalog_feed`/decisão do Planejador não é lida por `proposals`/comercial hoje. A proposta ainda é montada por fora (Canva + preenchimento manual), sem herdar a decisão do Planejador. Achado novo desta rodada, não corrigido — é a lacuna real mais importante da Fase 3. |
| Condição comercial ← Proposta | `regra-comercial.functions.ts` | lê `contract_parameter_values` | tela de preparação | tela de preparação | Não | Existe, mas não citado à decisão do Planejador (mesmo gap acima) |

```text
Planejador Universal é fonte da decisão comercial: NÃO (existe e roda, mas ainda não alimenta Proposta/Condição — gap registrado acima)
Produtos-Pai preservados sem mudança de taxonomia: SIM
Planilha Mestre fora do fluxo operacional: SIM
SKU bloqueia qualquer preparação interna: NÃO
```

## 7. Pendências que exigem a Proprietária (máximo 10)

1. **Contrato da Ana Luiza — 2 ações que só humano faz.** Ação exata: abrir `/casos/.../contrato/preparar`, preencher
   "Ancestral de referência declarado" (grupo Membros) e clicar "Confirmar" no campo "Resumo do escopo aprovado"
   (texto já importado, só precisa da revisão humana). Motivo: campo real vazio + regra institucional de revisão
   humana antes de versão final (não é bug, é proteção). Ambiente: produção, caso real. Risco de aprovar: nenhum,
   é preenchimento de dado real. Risco de não aprovar: contrato da Ana continua parado. Reversão: nenhuma
   necessária (edição normal). Resposta esperada: nenhuma decisão — é execução direta na tela.

2. **Proposta/Condição Comercial não herdam a decisão do Planejador (gap da seção 6).** Decisão: priorizar isso
   na próxima rodada (é o elo que falta para a Fase 3 ficar `ACEITO` de ponta a ponta) ou manter como está por
   ora. Risco de aprovar priorização: consome a próxima rodada inteira nisso. Risco de não aprovar: Planejador
   continua "decorativo" para o fluxo comercial. Reversão: não aplicável (é feature nova, não muda nada existente).

3. **Fases 4–8 do prompt de hoje (matriz jurídica, onboarding/portal, App Cliente, pesquisa/evidências, mobile,
   triagem de PRs) não foram auditadas nesta rodada** — não por decisão de pular, mas porque a apuração da
   acusação de hoje e o bug P0 do escopo Canva tomaram o tempo disponível. Decisão: qual destas fases entra na
   próxima rodada primeiro? Recomendação: seção 6 (Planejador→Proposta) por ser o maior gap arquitetural aberto,
   seguida da Fase 5 (App Cliente/portal) por já ter o Radar de 6 eixos entregue nesta sessão.

## 8. Reversão e dados de homologação

- Commits desta rodada: `a1b3db0` (bug P0 do escopo Canva) → `main` `42a0b00` → `recovery` `2c2a703` (merge, sem
  conflito, trouxe também 4 commits de sessão paralela já auditados como não-destrutivos).
- Reversão: `git revert a1b3db0` no `main` desfaz o fix (não recomendado — é uma correção pura, sem risco
  identificado).
- Dados sintéticos criados nesta rodada: NENHUM.
