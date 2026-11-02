# Plano de execução: 49 órfãos, mapa real × fictício e sincronia Lovable ↔ GitHub

Gerado em 01/11/2026 pela skill `/understand`. Dados: `docs/grafo/classificacao-arquivos.csv`,
`docs/grafo/orfaos-priorizados.json`, `docs/grafo/grafo-dominios.mmd`.
Nada aqui altera código de produção, banco, workflow ou o projeto no Lovable. Cada item marcado **[auth]**
precisa da sua autorização antes de eu executar.

## 1. Os 1.648 arquivos: real × fictício (medido agora)

Classificação por **padrão de texto** (nomes e códigos no arquivo) e por pasta. Não prova a origem do
dado: é um mapa para triagem, e a contagem de "real fixo" pode incluir falso positivo (ex.: "Felipe").

| Classe | Arquivos | O que é |
| --- | ---: | --- |
| Teste | 649 | `__tests__` e `*.test.*` |
| Biblioteca de UI | 51 | `components/ui` (shadcn) |
| Gerado | 2 | `routeTree.gen.ts`, tipos do Supabase |
| **Fictício / demo / modelo / seed** | **16** | `src/data/*`, todos já classificados como não-reais em `classificacao-dados.ts` |
| **Produção com nome fictício fixo** | **24** | Giovanna, Sophia, "Maria da Silva"… dentro de código de produção |
| **Produção com dado real fixo** | **57** | Ana Luiza, Adair, Alice, Friedmann, `CA-CID-AT-FAM-2026-001`… dentro de código (39 citam "Ana Luiza") |
| Produção lendo o banco | 408 | `createServerFn`, Supabase, queries: dado vem do caso |
| Produção lógica ou UI sem dado | 441 | componentes e regras puras |

Leitura: dos 946 arquivos de produção (1.648 − 649 − 51 − 2), **97 (10%) carregam dado de pessoa escrito no
código**. Esse é o risco de privacidade da religação: religar um desses sem reescrever por caso mostra a
família errada em outro caso.

**41 domínios** (por arquivos): `lib` 1.166 (648 são teste), `routes/desk` 91, `components/contrato` 51,
`components/ui` 51, `components/caso` 46, `components/painel` 22, `components/portal` 20, `routes/outras` 20,
`components/desk` 19, `components/crm` 18, `components/pesquisa` 17, `data` 16, `routes/portal` 15,
`components/clube-ancestral-kit` 14, e 27 domínios com 1 a 10 arquivos. Tabela completa por classe:
`classificacao-arquivos.csv`. Mapa de dependências: `grafo-dominios.mmd`.
Concentração de dado fixo: `lib` (51 real, 14 fictício), `routes/portal` (7 fictício), `routes/desk` (3 real).

## 2. Os 49 órfãos: ordem de execução

Estado: 14 `AGUARDA_DECISAO`, 12 `CASCA_DUPLICADA`, 6 `APOSENTADA`, 10 `APOSENTADA+risco`, 3 `CASCA+risco`,
2 `AGUARDA+risco`, 2 sem veredicto. **18 têm risco de vazamento de dado de família.**

Você decidiu em 31/10 religar todos. Duas travas continuam valendo e ordenam o plano:
(a) `AGENTS.md` ainda diz "`painel-dia.tsx` não tocar" (item N7); (b) religar com dado fixo **sem reescrever por caso** quebra a regra de privacidade.
Por isso a ordem vai do que protege ao que é só leitura, e deixa por último o que carrega dado fixo.

| Onda | Módulos | Por quê primeiro | Pronto quando |
| --- | --- | --- | --- |
| **0. Porteiros** (5) | `lib/classificacao-dados.ts`, `lib/app-visibilidade-registro.ts`, `lib/portal-navegacao.ts`, `lib/portal-mapa-kit.ts`, `lib/rotulos-humanos.ts` | Os dois primeiros são a regra "só dado `real` chega ao cliente" e hoje nada de produção os importa. Os outros dois são a navegação única do portal (N3). Baixo risco, sem dado fixo (exceto o risco do `app-visibilidade-registro`, revisar) | cada um com chamador real e teste de renderização (N8) |
| **1. Reescrever por caso** (7) | `portal-experiencia-integral`, `portal-fallback-canonico`, `rascunhos-comunicacao-governados`, `debug-cliente-access`, `decisao-ana-canonica`, `demo-cliente-helper`, `corte-vertical` | Têm dado da Ana escrito no código. Antes de religar, o dado passa a vir do caso (N3). Preservar "R$ 9.600,00" e "R$320" que os testes de rateio leem | nenhum nome de família no arquivo; testes de rateio verdes |
| **2. Painel Hoje** (9) | `painel-dia`, `painel-top30`, `painel-hoje`, `painel-desk-hoje`, `painel-cadencia`, `metricas-jornada`, `cards-alertas-centrais`, `kanban-tarefas`, `modulos-contextuais`, `descobertas-alertas` | Frente W4a parada no limite de uso; trabalho parcial nos worktrees. `painel-dia` só depois de N7 | montados em `/painel`, entradas saem do registro |
| **3. Governança** (14) | `canvas-audit`, `criterios-aceite`, `indicadores-governanca`, `matriz-capacidades-jornada`, `matriz-conformidade`, `matriz-equivalencia`, `inventario-campos-abas`, `inventario-recuperacao`, `varredura-completude`, `aceite-e2e-passos`, `fontes-documentos-rls`, `motores-primordiais`, `agenda-assistida`, `saneamento` | Só leitura, valor operacional menor. Frente W4b. `inventario-recuperacao` e `varredura-completude` têm risco de vazamento: revisar | aba em Governança, com teste |
| **4. Aposentadas** (16 + 2 sem veredicto) | `relatorio-visual`, `relatorio-fase02`, `entrega-*`, `plano-acao-demo`, `kit-consolidado`, `faixa-historica`, `desk-arvore-canonica`, `useActiveCase`, `botao-testar-cliente` e demais | Você mandou religar; mas todas têm substituto ativo e 10 carregam dado de família. Só religa onde o substituto não cobrir; o resto fica classificado. `botao-testar-cliente` tem `TODO:` que derruba o `pipeline.py` (O7) | veredicto final por arquivo; nenhum apagado |
| **5. Sem veredicto** (2) | `data/saneamento.ts`, `lib/orfaos-modulos-classificados.ts` | O segundo é o próprio registro (esperado). O primeiro entra no N2 | `saneamento` com contagens ao vivo (N2) |

Regras de cada religação (do `AGENTS.md` e do plano): prova de uso (teste que **renderiza**, N8), nenhuma
tabela nem vocabulário novo, nada apaga, e `painel-dia`/RPC `portal_sou_contratante_financeiro` intocados até a decisão.
Cada onda vira um PR de um assunto só (limite do `sync-guard`: 60 arquivos).

**Decisões que só você toma antes das ondas 2 e 4:** N7 (atualizar a linha do `painel-dia` no `AGENTS.md`),
O2, O3 e O8 do plano.

## 3. Sincronia Lovable ↔ GitHub ↔ Claude: o que está quebrando

Medido nos últimos 7 dias: 143 commits do editor do Lovable (`gpt-engineer-app[bot]`), 109 do Claude, 26 seus.
O CI cancela o run anterior a cada commit (`concurrency: cancel-in-progress` em `ci.yml`), então o último
SHA verde fica para trás.

**Causa do incidente:** o commit `00ab0cc5` do Lovable mesclou a linha do editor (base antiga `76cec44d`) sobre
a `main` e perdeu 46 arquivos e reverteu 55 (101 no total, −7.355 linhas). Foi restaurado **duas vezes**
(`fc8c865` e #211) porque nada detectou o dano. A restauração foi feita a posteriori, por mim.

Ações, da mais barata à mais estrutural:

| # | Ação | Efeito | Dono |
| --- | --- | --- | --- |
| S1 | **Alarme de regressão na `main`**: workflow que, a cada push de `gpt-engineer-app[bot]`, conta arquivos removidos ou revertidos contra o pai e abre alerta (issue `painel-sync`) acima de 10 arquivos | o dano de 101 arquivos teria sido visto em minutos, não em horas | C propõe, **[auth]** para criar workflow |
| S2 | **Não cancelar o CI da `main`**: `cancel-in-progress` só em PR (`${{ github.event_name == 'pull_request' }}`); a `main` ganha um run por commit | sempre existe um "último SHA verde" real | C, **[auth]** (muda `ci.yml`; o #212 já mexe nesse arquivo, combinar) |
| S3 | **Instrução no Lovable**: pedir ao agente do Lovable que, antes de editar, puxe a `main`, e que não resolva merge de linha antiga (`set_project_knowledge`) | ataca a causa: base velha | **[auth]**: escreve no projeto do Lovable |
| S4 | **Janela de edição**: quando você edita no Lovable, eu só trabalho em branch `claude/*` e nunca empurro na `main`; o merge dos meus PRs só quando o editor está parado (skill `/lancar` já exige) | menos concorrência na mesma linha | combinado, sem código |
| S5 | **Separar territórios**: Lovable edita telas e dados de caso; Claude edita `src/lib`, testes e `docs`. Conflito nasce onde os dois tocam o mesmo arquivo; listar os 20 arquivos mais editados pelos dois | menos merge difícil | C levanta a lista, você decide |
| S6 | Rodar `scripts/sync-check.sh` e o painel (hoje 08:00, seg a sex) **também a cada push na main** | alerta mais cedo | C, **[auth]** |
| S7 | PRs menores, de um assunto, atrás da `main` por merge commit (já é a regra do `sync-guard`) | menos conflito | em vigor |

Recomendo começar por **S1 e S2**: são pequenos, só leem o repositório e resolvem a perda silenciosa.
S3 é a correção da causa, mas escreve no Lovable.

## 4. Ordem sugerida desta semana

1. Você: autorizar S1 e S2, decidir N7.
2. Eu: Onda 0 (porteiros) em um PR, com teste que renderiza.
3. Eu: Onda 1 (reescrever por caso), sem religar até passar o teste de rateio.
4. Você: decidir O2, O3, O8; eu sigo para as ondas 2 e 3.

## Não verificado

Se cada arquivo "real fixo" é de fato dado real (heurística de texto); o que os 49 órfãos fazem em runtime;
o estado do projeto no Lovable. Só 2 branches remotas apareceram neste clone, então a contagem de branches
`lovable-sync` abertas está subestimada.
