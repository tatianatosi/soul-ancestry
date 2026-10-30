# Plano mestre — lançamento deste fim de semana (30/10/2026)

Consolida três coisas que estavam em arquivos/conversas separadas: (1) o que
esta sessão mediu e executou hoje sobre a infraestrutura do repositório
(merge, migrations, `.env`, `pipeline.py`), (2) o plano de execução da
Jornada da Ana ponta a ponta que você trouxe (medido em 04/10, com duas
correções registradas), e (3) o que ainda depende só de você. Não substitui
`docs/PLANO-EXECUCAO-LANCAMENTO-2026-10-26.md` nem os laudos — é o ponto
único de entrada para decidir o que fazer até o lançamento.

**Aviso de frescor:** os números da seção 2 (páginas do Canva, completude da
ficha, relações genealógicas etc.) vêm do plano que você trouxe, medido em
04/10/2026 — não foram remedidos nesta sessão. Se a decisão de ir/não ir
deste fim de semana depender desses números, o primeiro passo é remedir
antes de executar os Cortes A–H (consulta direta ao banco, como fiz para as
migrations na seção 1).

---

## 1. Estado da infraestrutura — medido e executado hoje (30/10)

| Item                                                                                                                 | Estado                                                                                                                                                                                                                                                                  | Ação                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge `origin/main` → `claude/modest-carson-28pij2`                                                                  | **Feito e enviado** (commits `dad4bf46`, `49d6b119`). 5 conflitos resolvidos mantendo o lado desta branch (main reintroduzia bugs já corrigidos: achado-22 em Documentos, achado-24 em Radar). `tsc` limpo, 620 arquivos/5848 testes passando no momento do merge.      | Nenhuma — feito sob sua autorização explícita.                                                                                                                     |
| `main` avançou de novo depois do push (30 commits, agora em `74ebf6ce`)                                              | **Pendente.** 4 novos conflitos reais contra o head atual: `pipeline.py`, `src/components/portal/portal-v11.css`, `src/lib/conversao.functions.ts`, `src/lib/persistencia.server.ts` (este é a Peça B desta sessão — merece atenção extra).                             | **Decisão sua**: resolver agora (mesmo padrão: ler, decidir, não commitar/pushar sem autorização) ou aceitar que o PR #197 fique "dirty" até depois do lançamento. |
| `pipeline.py`                                                                                                        | Reescrito como validador local (branch/merge/typecheck/testes, sem checkout/commit/push). Testado e funcionando.                                                                                                                                                        | Nenhuma — mas é um dos arquivos em conflito acima; `main` pode ter outra versão concorrente.                                                                       |
| Journal de migrations (`supabase_migrations.schema_migrations`)                                                      | 4 lacunas confirmadas como só-registro (as migrations rodaram de fato; conferido via `pg_class`, função/tabela viva, e estado de linha exato). Nenhum schema divergente.                                                                                                | Documentado. Corrige o item #18 da sua fila com evidência, não suposição.                                                                                          |
| `supabase/pendentes/README.md`                                                                                       | 2 entradas que faltavam (`cerimonias_cedem_a_proprietaria`, `taxonomias_biblioteca_guard`, ambas já aplicadas) adicionadas.                                                                                                                                             | Feito, dentro do merge.                                                                                                                                            |
| `.env` commitado em 2 branches antigas (`docs/ajustes-telas-desk-2026-08-21`, `docs/g08-fontes-documentos-ana-v1-1`) | Removido (1 commit em cada, já enviado). Risco era baixo: só a chave publicável nova do Supabase (`sb_publishable_...`), que já vai em todo bundle de produção; nenhuma `service_role` encontrada. RLS com `FORCE ROW LEVEL SECURITY` confirmado ativo nas 167 tabelas. | Feito.                                                                                                                                                             |
| PR #173 (histórico do contrato antigo da Ana)                                                                        | Confirmado ainda não aplicado (`contract_history_imports` não existe no banco) — não é regressão, é o mesmo bloqueio de tamanho já registrado no README.                                                                                                                | Precisa ir ao chat do Lovable diretamente (colar o SQL ou apontar para a PR).                                                                                      |

### Pendências de decisão sua, só nesta seção

1. Resolver os 4 novos conflitos agora, ou deixar o PR #197 "dirty" até depois do fim de semana.
2. #16 (coletor de erro em produção): preciso do vendor/infra escolhido antes de implementar.
3. #18: já tem evidência (ver tabela acima) — decisão é só se vale registrar isso formalmente no journal do Supabase ou deixar como está (schema está correto; é cosmético).
4. #2 (Fila da Ana — convites/publicação): preciso do CPF real da Alice e autorização nominal para convite + publicação do `resumo_caso` pendente.

---

## 2. Jornada da Ana ponta a ponta — plano de execução (medido 04/10, trazido por você)

Mantido como você escreveu, por ser já detalhado e specificado a nível de
arquivo/função. Duas correções que você registrou contra entregas desta
sessão estão preservadas como estavam.

### O que a medição mostrou (04/10 — remedir se for base de decisão agora)

| O que                                                   | Medido em 04/10                                                                                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Páginas do Canva da Ana                                 | 7, todas `extraida`, com serviços excluídos, despesas externas, escopos individuais e as 5 etapas da jornada                                   |
| Parâmetros do contrato vazios                           | `servicos_excluidos`, `despesas_externas`, `prazos_referencia`, `produto_sku`, `dependentes` — conteúdo dos 3 primeiros está no Canva extraído |
| Completude da ficha contratual                          | 74%                                                                                                                                            |
| Contrato da Ana                                         | 1, status `rejected`, não assinado, 5 partes corretas                                                                                          |
| Anexos persistidos                                      | 5 vivos: I e II em `missing`, III/IV/V em `not_applicable`                                                                                     |
| Relações de pesquisa da Ana                             | 1 (a cadeia de 10 pessoas precisa de 9)                                                                                                        |
| Relações genealógicas / eventos / variantes de nome     | 0 / 0 / 0                                                                                                                                      |
| Documentos do caso / plano de ação / encontros de linha | 0 / 0 / 0                                                                                                                                      |
| Lead de origem do caso                                  | nenhum — `crm_casos.lead_id` nulo, os 10 leads da base são de teste                                                                            |
| Órfãos classificados RELIGAR                            | 10, cada um com destino já declarado                                                                                                           |
| Tabela de campos                                        | 34 abas / 570 campos, 0 descrições                                                                                                             |

### Duas correções contra entregas anteriores desta sessão

1. **Checklist §58c estava incompleto** — "custo estimado" e "aprovação de
   despesa" têm dono: `research_action_plan_items` já tem os campos
   (`estimated_cost_amount`, `estimated_cost_currency`,
   `expense_approval_status`, `payer`, `due_date`, `institution_id`,
   `document_request_id`, `evidence_id`, `internal_evidence_link`,
   `contacted_at`, `next_check_at`) — a tabela está com 0 linhas no caso.
2. **Divergência do nome do pai é de fonte, não de cadastro.**
   `contract_parties` está correto ("Adair Pinto Silveira Júnior"). O Canva e
   a condição comercial dizem "Adair Gomes Silveira". A correção é preferir
   a lista de partes registrada e **declarar** a divergência, nunca fundir
   por semelhança de nome.

### Ordem de execução (Cortes A–H)

Cada corte fecha com: `tsc` → teste novo → suíte completa → build → commit
→ push em `main`. Nada de envio, assinatura, cobrança, pesquisa externa ou
publicação sem autorização separada. Migration aditiva aplicada no banco
**antes** do commit, pelo canal já definido (`supabase/pendentes/` → Lovable
aplica — regra 3 da Decisão de Hospedagem Única, ainda em vigor).

- **Corte A — Canva autorizado alimenta os parâmetros do caso.** Escritor
  novo em `contrato-parametros.functions.ts`, de-para página→campo (p3
  serviços, p4 composição familiar, p5 fases, p6 valor/pagamento, p7
  despesas externas), só preenche campo vazio, nunca sobrescreve validado.
- **Corte B — Partes canônicas e anexos reconciliados.**
  `montarPessoasContratuais` passa a usar `contract_parties` como fonte
  primária; divergência de nome fica declarada, não funde pessoa.
  Anexos I/II saem de `missing` para `nao_aplicavel` com motivo.
- **Corte C — Checklist §58c com todos os campos** (correção 1 acima):
  `dossie-58c.ts`/`.functions.ts` ganham os campos de custo/aprovação,
  semeando `research_action_plan_items` para os itens que dependem de
  terceiro, com `DE_PARA_CAMPOS_CHECKLIST` corrigido.
- **Corte D — Árvore e dados genealógicos da Ana**, só com fonte declarada
  (9 relações, eventos nomeados pelo dossiê, variantes de nome do item 4.4),
  `client_visibility` interna até você publicar.
- **Corte E — Discovery e origem comercial**: lead de origem real
  (não-teste) com `discovery_registro` do histórico, consentimento como
  pendência explícita, `crm_casos.lead_id` ligado.
- **Corte F — Religar os 10 órfãos RELIGAR**, cada um no destino já
  declarado em `orfaos-classificados.ts`, com teste de uso real.
- **Corte G — Tabela de campos e tabela de rotas completas**: descrição do
  que cada campo coleta (hoje 0), abas faltantes, teste que falha se uma
  rota sumir.
- **Corte H — Contrato de Uma Hora, todas as fases** (depende de A, B, C):
  completude 74%→100%, prévia final congelada, revisão humana registrada,
  assinatura declarada como ato externo posterior, parado no seu nome.

### Decisões que só você toma (jornada da Ana)

| #   | Decisão                                                                            | Por quê                                                                                            |
| --- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | "Adair Gomes Silveira" (Canva/condição) × "Adair Pinto Silveira Júnior" (cadastro) | nome de pessoa real não se funde por semelhança                                                    |
| 2   | Publicar os 6 ascendentes na árvore do App                                         | visibilidade é decisão sua                                                                         |
| 3   | Representação do Felipe: `pendente` → documentada                                  | documento real de representação de menor                                                           |
| 4   | Consentimento dos leads (D-01)                                                     | efeito jurídico/LGPD                                                                               |
| 5   | `painel-dia.tsx` × `/painel`                                                       | qual é a fonte viva do Painel Hoje (já sinalizado como "continua aguardando decisão" no AGENTS.md) |
| 6   | `COMPROVADO_EM_USO` com prints autenticados                                        | só você — build/teste não é prova                                                                  |

---

## 3. Ordem recomendada para o fim de semana

Juntando as duas seções pelo que bloqueia o quê:

1. **Agora**: decidir os 4 conflitos novos do merge (seção 1) — ou aceitar
   adiar o PR #197 para depois do lançamento. Isso não bloqueia a Jornada da
   Ana, que vive em código já em `main`/nesta branch independentemente do
   PR estar mesclado.
2. **Antes de qualquer Corte A–H**: se os números de 04/10 forem a base da
   decisão de lançar este fim de semana, remedir rápido (Canva, completude,
   relações) — são consultas de leitura, sem risco.
3. **Cortes A, B, C** — desbloqueiam o contrato e corrigem as duas falhas
   que eu mesmo registrei. Sem autorização de migration nova (são escrita
   via writer existente + parâmetros), exceto onde o corte específico disser.
4. **Corte H** — só depois de A+B+C, fecha o Contrato de Uma Hora até o
   limite do que pode ser automatizado (resto fica parado no seu nome).
5. **Cortes D, E, F, G** — valor real, mas nenhum bloqueia o contrato da
   Ana nem o lançamento em si; podem seguir a semana que vem se o tempo
   apertar.
6. **#16/#18/#2** — dependem só de decisão/dado seu; não competem por tempo
   de execução comigo, competem por uma resposta sua.

Nenhum item desta lista commita, aplica migration ou publica nada sem
autorização explícita, por item — igual ao resto desta sessão.
