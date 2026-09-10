---
titulo: Fechar o elo Planejador Universal → Proposta → Condição Comercial
data: 2026-09-08
branch: claude/planejador-proposta-condicao-2026-09-08
---

## 0. Escopo desta rodada, com honestidade

O prompt pediu para fechar Caso → Planejador → Produto-Pai → Proposta → Condição Comercial → Contrato → OS.
A descoberta (leitura de código + banco, antes de qualquer alteração) mostrou algo que muda a natureza da tarefa:
**esse elo já existe, já é testado internamente e já está ligado** — `materializarProposta()` e
`aprovarPropostaEstruturada()`, em `src/lib/cadeia-operacional.server.ts`, já levam Planejador → Proposta →
Condição Comercial → OS/Anexo I, com idempotência por hash, versionamento e conciliação contra o catálogo
homologado. Isto não estava documentado corretamente no artefato de ontem (07/09), que concluiu "Planejador não
alimenta Proposta" — conclusão incompleta: eu tinha checado só `planner_catalog_feed`/`/catalogo` (o catálogo
canônico de leitura dos Produtos-Pai) e não tinha visto `blueprint_parameters` nem a cadeia em
`cadeia-operacional.server.ts`. Registro isso como correção de um achado anterior meu, não como conflito entre
documentos — a implementação de 05/09 é mais nova e mais completa do que eu tinha visto.

O que estava genuinamente quebrado, e é o que esta rodada corrigiu: **dois bugs concretos na ligação entre as
duas fontes reais do Planejador**, não a ausência do elo.

## 1. Cabeçalho de evidência

- HEAD inicial: `main` `5a7148c` (o mesmo informado no prompt).
- Branch de trabalho criada: `claude/planejador-proposta-condicao-2026-09-08`, a partir de `origin/main`.
- HEAD final: `58c3496` (1 commit).
- Empurrado para `origin/claude/planejador-proposta-condicao-2026-09-08` — **não mesclado em `main`, nenhuma PR
  aberta**, por instrução explícita do prompt.
- Produção: `https://soul-ancestry.vercel.app` (não recebeu este commit — está só na branch de trabalho).
- Preview/homologação separado: indisponível (mesmo do artefato de ontem).
- Checks: `tsc --noEmit` limpo · `npx vitest run --exclude '**/.claude/**'` → **176 arquivos, 1682 testes, 100%
  passando** (esse comando, sugerido pelo próprio prompt, é o correto — filtra as 3 cópias obsoletas de
  `.claude/worktrees/agent-*` que inflam a contagem para ~6467 quando rodado sem filtro) · `vite build` concluído
  sem erro.
- Banco: só leitura (Supabase MCP reautorizado). Nenhuma escrita, nenhuma migration.
- Ações externas: NENHUMA.
- Dados sintéticos criados: NENHUM.

## 2. Inventário escritor → leitor (como realmente é hoje, não como o `README`/comentário antigo diz)

| Camada | Tabela real | Quem escreve | Quem lê | Tela |
|---|---|---|---|---|
| Catálogo de Produtos-Pai (taxonomia) | `planner_catalog_feed` | migration 04/09 | `/catalogo`, dropdown de produto no caso | `/catalogo` |
| Planejador por caso (formulário real, testado) | `case_plans` | `PlanejadorOperacional` → `salvarPlanejadorOperacional` → `sincronizarPlanejador` | `materializarProposta` (elo 2) | painel "Planejador do caso" em `/casos/$caseId/contrato/preparar` |
| Planejador por caso (dado seed, sem tela) | `blueprint_parameters` | **nenhuma tela** — só inserção direta (achado: 0 escritores em `src/`) | `caso-ficha.functions.ts` (leitura para Ficha 360) e `materializarProposta` | — |
| Proposta estruturada | `proposals.escopo_estruturado`/`plan_id`/`product_catalog_id` | `materializarProposta` | tela de proposta, `aprovarPropostaEstruturada` | (sem tela dedicada de visualização da proposta estruturada — achado, ver seção 5) |
| Condição comercial | `commercial_conditions` | `aprovarPropostaEstruturada` → `derivarCondicaoComercial` | `emitirOSAnexoI`, telas comerciais | — |
| OS/Anexo I | `service_orders` + `contract_scope_items` | `emitirOSAnexoI` + `sincronizarEscopoContratual` | preparação de contrato | `/casos/$caseId/contrato/preparar` |

## 3. Os dois bugs reais corrigidos

### Bug 1 — precedência fixa entre duas fontes de Planejador

`materializarProposta` sempre preferia `blueprint_parameters` quando existia, e só caía em `case_plans` quando
`blueprint_parameters` não existia (decisão do achado de 05/09). Como **`case_plans` tem zero linhas em toda a
base hoje** (confirmado por `select count(*) from case_plans` em produção), e o caso da Ana tem uma linha de
`blueprint_parameters` parada desde 20/08 (nunca mais tocada), a consequência é: se a proprietária abrir o
formulário real "Planejador do caso" hoje e salvar dados novos e corretos para o caso da Ana, esse dado cairia
em `case_plans` e **seria ignorado para sempre**, porque `blueprint_parameters` sempre venceria por existir.

Corrigido: agora vence quem tem `updated_at` mais recente entre as duas tabelas, não uma tabela fixa. Sem
impacto em nenhum caso hoje (nenhum tem `case_plans` preenchido ainda), e corrige o comportamento futuro no
momento em que a tela real for usada.

### Bug 2 — mapeamento de campo assumia o schema errado

`entradaDoPlano()` lia `plano.entregas` (campo que só existe em `case_plans`) mesmo quando a fonte era
`blueprint_parameters` (que usa `entregas_previstas` — mesmo conceito, nome de coluna diferente). Resultado:
o dado real de entregas da Ana (`["Relatório F1", "Relatório F2", "Micro-entregas documentais", "Dossiê
familiar"]`, confirmado por SQL) era descartado silenciosamente, e a proposta estruturada nasceria com
`entregas: []` mesmo com dado real disponível.

Corrigido: `entradaDoPlano` agora aceita `entregas_previstas` como equivalente de `entregas`. Os demais campos
que `blueprint_parameters` genuinamente não tem (objetivo, etapa, composição, rota, marcos, checklist,
perguntas, responsável, próxima ação/prazo) continuam `null`/`[]` — isso é pendência real e correta (o motor não
inventa o que a fonte não declara), não foi "corrigido" porque não é bug.

## 4. O que NÃO foi alterado (conforme exigido)

Produtos-Pai (`planner_catalog_feed`, PP-01–PP-09): intocado. Planilha Mestre: continua fora do fluxo, não
reativada. SKUs: nenhum arquivado/alterado. Preço homologado: `bloqueiosAprovacaoProposta` e
`derivarCondicaoComercial` continuam exigindo `sku.preco_sugerido` e nunca aceitam preço livre — não mexi nessa
regra. Canva, contrato-base, RLS, permissões: não tocados. Nenhuma migration foi proposta ou aplicada.

## 5. O que ficou sem implementação nesta rodada, e por quê

1. **`blueprint_parameters` continua sem nenhuma tela que escreva nela.** Ela hoje só existe por dado inserido
   direto (SQL/seed) em casos de homologação como o da Ana. Decisão pendente da Proprietária: (a) deprecar
   `blueprint_parameters` como fonte viva e consolidar tudo em `case_plans` (a única com formulário real), o que
   simplificaria a arquitetura mas exigiria migrar/backfillar os poucos casos que hoje só têm blueprint; ou
   (b) manter as duas e um dia dar a `blueprint_parameters` sua própria tela. Não decidi isso por inferência —
   é exatamente o tipo de fork que o prompt pede para registrar, não resolver sozinho. Minha recomendação: (a),
   porque `case_plans` é a única com schema completo e testado; mas a decisão é da Proprietária.
2. **Sem tela dedicada de "revisar escopo importado do Planejador" na Proposta** — hoje `proposals.escopo_estruturado`
   existe e é gravado, mas não encontrei um componente que mostre à proprietária, na tela de proposta, "este
   escopo veio do Planejador, versão X, hash Y" de forma legível (o `escopo_estruturado` fica só no banco).
   Construir essa UI é trabalho novo, não uma correção — não estava no "elo quebrado", é a próxima peça de UX.
   Não implementado nesta rodada por ser fora do escopo mínimo ("fechar o elo", não "melhorar a experiência").
3. **Fases 4-8** do prompt "EXECUÇÃO ÚNICA" de ontem seguem não auditadas (matriz jurídica, portal/App Cliente,
   pesquisa/evidências, mobile, triagem de PRs) — este prompt de hoje pediu explicitamente para não abrir essa
   auditoria antes de fechar este elo.

## 6. Evidências completas

```text
tsc --noEmit: limpo (0 erros)
vitest run --exclude '**/.claude/**': 176 arquivos, 1682 testes, 1682 passando
vite build: concluído sem erro (.output gerado, wrangler config gerado)
```

Testes novos: `src/lib/__tests__/cadeia-operacional-planejador-fonte.test.ts` (3 testes, todos passando):
mapeamento correto lendo `case_plans` completo; mapeamento correto lendo `blueprint_parameters` reduzido, com
`entregas_previstas` preservado e os campos genuinamente ausentes como `null`/`[]`; precedência de `entregas`
sobre `entregas_previstas` quando os dois coexistem na mesma linha (não deveria acontecer na prática, mas o
comportamento é definido e testado).

Não há suíte automatizada para `materializarProposta`/`aprovarPropostaEstruturada` em si (funções `.server.ts`
que tocam banco) — o mesmo padrão já usado no resto do repositório para esse tipo de função (nenhuma delas tem
teste unitário direto, só as funções puras que consomem). A correção de precedência (Bug 1) foi verificada por
leitura de código + dado real via SQL, não por teste automatizado; fica classificada como
`IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE`.

## 7. Verificação de banco (só leitura, nenhuma escrita)

Confirmado por SQL em produção (projeto `zsxpdbhdvbuulwpepemd`):
- `case_plans`: 0 linhas em toda a base.
- `blueprint_parameters` do caso da Ana (`a11a0000-0000-4000-8000-000000000002`): 1 linha, `entregas_previstas`
  com 4 itens reais, `updated_at` parado em 20/08 — nunca mais tocada.
- `contract_templates` MODELO-ESTUDO/BASE-GEN-V2: ativos (reconfirmado, não alterado).

## 8. Roteiro de validação manual para a Proprietária (máximo 10 passos)

1. Abrir `/casos/CA-CID-AT-FAM-2026-001/contrato/preparar` (caso da Ana).
2. Localizar o painel "Planejador do caso" e clicar "Preencher planejador".
3. Preencher objetivo, etapa, composição, país/rota, SKU, entregas, microentregas, marcos, checklist, próxima
   ação e prazo com dado real do caso da Ana.
4. Clicar "Salvar planejador" — deve aparecer "Planejador salvo (v1)" com a contagem de pendências restantes.
5. Recarregar a página inteira (F5).
6. Confirmar que os dados preenchidos continuam lá (persistência real, não só na sessão).
7. Usar a ação de gerar/materializar a proposta estruturada a partir do planejador (elo 2 da cadeia operacional,
   já existente na tela).
8. Confirmar que a proposta gerada reflete objetivo/etapa/composição/entregas do formulário — não do
   `blueprint_parameters` antigo de 20/08.
9. Alterar um campo no Planejador (ex.: adicionar uma entrega) e salvar de novo.
10. Confirmar que a nova versão da proposta reflete a mudança (idempotência: se nada mudou, não deveria versionar
    de novo; se mudou, deveria).

## 9. Reversão

`git revert 58c3496` na branch `claude/planejador-proposta-condicao-2026-09-08` desfaz os dois fixes. Nenhuma
reversão de dado é necessária — não houve escrita em banco nesta rodada.

## 10. Migrations

Nenhuma migration foi proposta ou aplicada nesta rodada. Se a Proprietária decidir pela opção (a) da seção 5
(consolidar tudo em `case_plans`), a próxima rodada precisaria: 1) confirmar que nenhum outro consumidor depende
de `blueprint_parameters` continuar existindo (achado: só `caso-ficha.functions.ts` lê, para a Ficha 360 —
precisa decidir se essa leitura também migra), 2) uma migration que copie as poucas linhas reais de
`blueprint_parameters` para `case_plans` mapeando os campos equivalentes (não automática, precisa de decisão
humana sobre o que fica pendente vs. inventado para os campos que blueprint não tem).
