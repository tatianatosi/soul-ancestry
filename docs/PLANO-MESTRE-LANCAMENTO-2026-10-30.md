# Plano mestre — lançamento (revisado em 31/10/2026)

Ponto de entrada para saber **onde estamos**. A fila de trabalho, com dono e
critério de pronto, está em `docs/PLANO-TAREFAS-2026-10-31.md`. O relatório
`docs/relatorios/2026-10-30-plano-mestre-jornada-ana.md` continua como medição
de 30/10; onde este documento diverge dele, vale este (remedido em 31/10).

**Correções desta revisão** (o plano anterior, de 30/10, estava errado ou
desatualizado nestes pontos):

1. **Corte C não estava "feito".** Eu havia escrito que os 76 itens do plano de ação
   tinham custo ou aprovação preenchidos. Medido hoje: **0 de 76 com custo estimado,
   0 com prazo**; 76 com pagador; aprovação de despesa `nao_submetida` em 64 e
   `nao_aplicavel` em 12. A estrutura existe, os valores não.
2. **Corte H não está em zero.** Parâmetros do contrato em **95%**, status
   `rascunho`, revisão humana de 05/10, **sem aprovação**. Prévias: 1 congelada e 1
   editável, **nenhuma `final`**. Contrato `pending_data`, não assinado.
3. **#197, #199 e #204 já foram mesclados.** Os 13 testes vermelhos foram resolvidos
   pelo #204; o `pipeline.py` da `main` já opera na branch atual.
4. **O #173 foi aplicado em 30/10** (`contract_history_imports`, 110 linhas).
5. **Publicação:** o painel de sincronização (issue #208) registra `8574598` como
   publicado, mas esse commit nunca foi verificado por mim; ver a skill `/lancar`.

---

## 1. Estado medido em 31/10/2026

| Frente                               | Estado                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`                               | Recebe um commit do editor do Lovable a cada 1–2 min; o CI cancela o run anterior a cada commit. Último CI verde: `aa9069fc`.                                                                                                                                                                                    |
| Publicação                           | Deploy às 14:17 UTC (`soul-ancestry.lovable.app`, `/api/saude` ok, `sha: null` por limite do ambiente). Versão no ar **não comprovada**.                                                                                                                                                                         |
| PR #207 (Sentry + `/lancar`)         | Draft, 4 checks verdes. Falta você mesclar. Sentry só funciona com `SENTRY_DSN` no ambiente do Lovable.                                                                                                                                                                                                          |
| PRs #202, #203, #205                 | Draft, CI vermelho. No #205 a causa é confirmada: são os testes que o #204 corrigiu (base anterior ao #204). Em #202 e #203 não conferi a causa. O #201 está em conflito com a `main`.                                                                                                                           |
| PRs antigas                          | 14 abertas, de agosto a outubro (#32, #97 a #125 e #142), paradas há 18 a 61 dias. Nenhuma tocada.                                                                                                                                                                                                               |
| Banco — propostas                    | Nenhuma bloqueia o código. Cabeçalho de `20261026230000` corrigido. `20261020150000` ainda contradiz o README. `20261030180000` (despublicar docs da Ana) só pelo Desk.                                                                                                                                          |
| Órfãs registradas (`createServerFn`) | 24 funções: 13 `AGUARDA_DECISAO`, 7 `CASCA_DUPLICADA`, 4 `APOSENTADA_CLASSIFICADA`, 0 `RELIGAR`. Em 31/10 Discovery e Call do GoLive passaram a `CASCA_DUPLICADA`, então a conta atual é 11 aguardando, 9 casca e 4 aposentadas.                                                                                 |
| Módulos órfãos (componentes e libs)  | **66 classificados em 31/10** (`orfaos-modulos-classificados.ts`): 21 casca duplicada, 23 aposentada, 21 aguardam decisão, 1 RELIGAR. Teste novo falha se aparecer módulo órfão sem veredicto. `fontes-por-pais` foi religado. 18 carregam dado de família e não devem ser religados sem revisão de privacidade. |

## 2. Jornada da Ana — situação dos cortes (medido em 31/10)

| Corte                            | Situação                                     | Evidência / o que falta                                                                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Canva alimenta os parâmetros | **Feito**                                    | `preencherParametrosDoCanva`; parâmetros em 95%.                                                                                                                                                                                        |
| B — Partes canônicas e anexos    | **Feito, com resto**                         | `contract_parties` como fonte. Resto (relatório de 30/10, não remedido): ANEXO_II duplicado.                                                                                                                                            |
| C — Checklist §58c               | **Parcial: estrutura feita, faltam valores** | 76 itens, **0 com custo, 0 com prazo**, 64 `nao_submetida`. As flags existem em `ACAO_POR_ITEM` como `despesaEsperada` e `instituicao`; falta você informar custo e prazo, só onde houver fonte.                                        |
| D — Genealogia                   | **Feito**, salvo encontros                   | 8 relações (todas `aprovada`), 7 eventos. `lineage_encounters` = 0.                                                                                                                                                                     |
| E — Discovery e origem           | **Feito**, consentimento aberto              | Lead real ligado; consentimento `nao_solicitado`.                                                                                                                                                                                       |
| F — Religar órfãos               | **Feito**                                    | Fila `RELIGAR` zerada. Mas surgiu uma classe de órfãs fora do registro (ver tarefas O).                                                                                                                                                 |
| G — Tabela de campos e rotas     | **Feito (31/10)**                            | 34 de 34 abas com descrição por campo; teste verde.                                                                                                                                                                                     |
| H — Contrato de Uma Hora         | **Parcial, parado em você**                  | 95%. `ancestral_referencia` já está preenchido, falta você confirmar. 4 conflitos nos parâmetros (um com texto velho). ANEXO_II com uma só linha viva. Falta aprovar parâmetros, gerar a prévia **final**, aprovar a revisão e assinar. |

Outros números da Ana: acesso do cliente ao portal **0**, documentos-fonte **0**,
3 documentos liberados ao cliente (conteúdo ainda sem curadoria), histórico do
contrato antigo importado (110 linhas).

## 3. Decisões que só você toma

| #   | Decisão                                                                               | Por quê                                         |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1   | Os 3 documentos da Ana: manter, trocar por versão sanitizada ou retirar do App        | conteúdo interno não chega ao App sem curadoria |
| 2   | "Adair Gomes Silveira" (Canva) × "Adair Pinto Silveira Júnior" (cadastro)             | nome real não se funde por semelhança           |
| 3   | Aprovar parâmetros, prévia final e revisão; assinar                                   | atos seus                                       |
| 4   | Acesso da Ana ao portal e consentimento do lead                                       | efeito externo e LGPD                           |
| 5   | Representação do Felipe e publicação dos perfis restantes                             | documento real; visibilidade                    |
| 6   | Piloto 5A.1 e piloto da Ana: tela própria ou absorvidos no Caso 360 (8 funções órfãs) | religar antes criaria segundo caminho           |
| 7   | Pagamento manual no GoLive (`registrarPagamentoGoLive`)                               | confirma pagamento à mão; financeiro            |
| 8   | `painel-dia.tsx` × `/painel`                                                          | segue aguardando decisão (`AGENTS.md`)          |
| 9   | `COMPROVADO_EM_USO` com prints autenticados                                           | só você                                         |

Nada aqui commita, mescla, aplica migration ou publica sem autorização explícita,
por item.
