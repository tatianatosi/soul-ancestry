# Pente-fino — Prompts, Artefatos e o que Está Realmente Implantado

Versão 1.0 — 24/08/2026. Atualiza `INVENTARIO_SERIE_CA_E_EVO_v1.0.md` e
`MANIFESTO_AUSENCIAS_E_RECUPERACAO_v1.0.md` (ambos de 23/08, nunca revisados
desde então) com verificação nova, feita lendo código e histórico do git,
não por memória. Nenhuma alteração de código, dado, RLS, integração ou
navegação foi executada aqui.

## 0. O que este estudo faz diferente do anterior

O `MANIFESTO_AUSENCIAS_E_RECUPERACAO` listava o que **nunca foi
encontrado**. Esta rodada foi além: também procurei o oposto — trabalho que
**foi executado em código mas nunca virou documento nem entrou em
changelog**. Os dois problemas pioram a mesma coisa por caminhos opostos:
um não existe e ninguém sabe; o outro existe e ninguém sabe.

## 1. Prompts genuinamente perdidos — reverificado hoje, situação inalterada

| Item | Status em 23/08 (Manifesto) | Status verificado hoje | Mudou? |
|---|---|---|---|
| CA-01 a CA-08 (série original solicitada pelo projeto) | NÃO_LOCALIZADA | Ainda não aparece em nenhum arquivo do repositório | **Não** — segue perdida |
| CA-EVO-01 (primeira etapa EVO) | NÃO_LOCALIZADO | Idem | **Não** |
| CA-EVO-Go-live final (ativação efetiva) | NÃO_CONFIRMADO | `CA-GOV-01` (mesmo commit de 23/08) ainda registra o caso Ana Luiza como **NO-GO para ativação**; nenhum documento posterior contradiz isso | **Não** — ativação real segue sem confirmação |
| REC-004 — Anexos jurídicos II, IV e V | Ausentes/incompletos | `src/lib/anexos-i-v.ts` tem o **motor e as regras** dos Anexos III, IV e V implementados, mas o próprio código declara: "texto jurídico aprovado; **instância técnica pendente de materialização/preenchimento**" (linhas 243, 298, 339) | **Parcialmente** — o motor existe, o preenchimento por caso real, não |
| REC-005 — fonte operacional única de CRM | Duplicidade não resolvida | `CA-GOV-01` ainda pede "eliminação de duplicidade entre CRMs concorrentes" como bloqueador de go-live | **Não** |
| REC-006 — bases e skills genealógicas | A classificar | Não verificado nesta rodada (fora do escopo de UX/artefatos deste pente-fino) | Não verificado |
| REC-007 — mockups/figmas comparáveis a rota real | Pendente | **Resolvido em 23/08 pela CA-UX-04**: todo o protótipo de 14 abas foi movido para `archive/mockups/` (fora de `src/`, não compilado), com tabela de equivalência em `docs/historico/mockups/README.md` | **Sim — fechado** |

Conclusão da seção: dos 7 itens do Manifesto original, **1 foi fechado**
(REC-007), **1 está parcialmente resolvido** (REC-004 — motor pronto,
preenchimento real pendente), e **os demais continuam exatamente como
estavam há um dia** — inclusive os mais graves (CA-01 a CA-08 e CA-EVO-01
seguem irrecuperáveis por nome; a ativação real do primeiro caso segue sem
confirmação).

## 2. Achado novo: prompts executados em código, sem nenhum documento

Bati a lista de identificadores `CA-UX-*`, `CA-OPS-*` e `CA-PORTAL-*`
citados dentro do próprio código-fonte contra a lista de documentos em
`docs/`. Cinco specs foram implementadas e **nunca ganharam arquivo em
`docs/` nem entrada em `docs/changelog/`**:

| Spec | Onde vive no código | Do que trata | Data (primeiro commit) | Doc em `docs/`? | Changelog? |
|---|---|---|---|---|---|
| CA-UX-01.2 | `app-visibilidade.ts`, `portal-visibilidade.tsx`, `portal-navegacao.ts` | Visibilidade progressiva do App Cliente; mapa das 10 telas do spec para rotas reais | 23/08 | **Não** | **Não** |
| CA-UX-01.3 | `desk-modulos.ts`, `desk-arvore-canonica.ts` | Arquitetura contextual de módulos do Desk; árvore canônica de abas | 23/08 | **Não** | **Não** |
| CA-UX-01.4 | `arvore-cliente-projecao.ts` | Projeção da árvore genealógica no App Cliente | 23/08 | **Não** | **Não** |
| CA-UX-02 | `descoberta-desk.ts` | Descoberta e nomenclatura humana do Desk (rótulos como "Radar Interno", atalhos de descoberta usados em `/painel`) | 23/08 | **Não** | **Não** |
| CA-UX-05 | `legado-visibilidade.ts` | Visibilidade e sanitização de dados legados | 23/08 | **Não** | **Não** |
| CA-OPS-03 | `consolidacao-catalogos-templates.ts` | Resolve a duplicidade Biblioteca de Mensagens × "Modelos institucionais" (era pendência aberta em CA-OPS-02) | **24/08 — hoje** | **Não** | **Não** |
| CA-PORTAL-04 | `portal-linguagem-viva.ts` | Camada de apresentação de dados vivos ao cliente | **24/08 — hoje** | **Não** | **Não** |

Duas dessas (CA-OPS-03 e CA-PORTAL-04) foram implementadas **hoje**, no
mesmo dia deste pente-fino, por outra sessão de trabalho — antes mesmo de
eu terminar de auditar o dia anterior. Isso é bom sinal de ritmo, mas
reforça o problema real: o repositório está evoluindo mais rápido do que a
documentação consegue registrar, e sem changelog não há como você
acompanhar o que mudou sem pedir uma auditoria como esta a cada vez.

**Boa notícia concreta:** CA-OPS-03 fecha uma pendência que eu havia
citado no meu próprio estudo anterior (Fase C) como "decisão humana
pendente" — a duplicidade entre a Biblioteca de Mensagens e "Modelos
institucionais". Está resolvida: `bib-templates-com` agora é só um
apontador histórico, sem conteúdo próprio, e a Biblioteca de Mensagens é a
fonte única. Isso não exige mais decisão sua.

## 3. Artefatos do CA-ART-01 — ainda ausentes do repositório

Reconferi hoje, por busca direta de arquivo, os 3 artefatos binários
declarados no manifesto de 23/08:

| Artefato | Declarado em CA-ART-01 | Encontrado no repositório hoje? |
|---|---|---|
| `inventario-patrimonial.csv` | Preservado na fonte local; inclusão binária no GitHub pendente | **Não encontrado** |
| `relatorio-inventario-patrimonial.pdf` | Idem | **Não encontrado** |
| `resumo-escopo-contratual.pdf` | Idem, com QA visual também pendente | **Não encontrado** |

Existem CSVs correlatos, mas não são os mesmos artefatos declarados:
`output/catalogo/divergencias-a-resolver.csv`,
`output/catalogo/precos-a-homologar.csv`, `output/skus_snapshot.csv` e
`output/casos_financeiro_snapshot.csv` — nenhum se chama
`inventario-patrimonial.csv` nem é um PDF. Ou seja: a pendência registrada
em 23/08 ("inclusão binária no GitHub pendente") **segue exatamente igual
um dia depois**. Isso não é um problema de código — precisa que alguém
faça upload dos arquivos originais (provavelmente vindos do Canva/Drive) no
repositório, ou aceite formalmente que eles continuam vivendo só na fonte
local/Drive.

## 4. Mapa consolidado de toda a série de specs de produto (CA-UX / CA-OPS / CA-PORTAL / CA-GOV / CA-ART / CA-EVO)

Exclui códigos de catálogo/caso (`CA-CID-*`, `CA-DOC-*`, `CA-AC-*` etc.) —
esses são SKUs e critérios de aceite comercial, não prompts de UX/produto.

| Spec | Documentado em `docs/` | Implementado em código | Changelog | Situação |
|---|---|---|---|---|
| CA-UX-01 (.2/.3/.4) | Não | Sim (23/08) | Não | Implementado sem rastro documental |
| CA-UX-02 | Não | Sim (23/08) | Não | Implementado sem rastro documental |
| CA-UX-03 | Sim | Sim | Sim | Completo, mas com divergências já registradas nas Fases C e D |
| CA-UX-03 Fase B | Sim | Parcial (ver Fase D) | Sim | Documentado; aplicação real só parcial |
| CA-UX-04 | Sim | Sim | Sim | Completo |
| CA-UX-05 | Não | Sim (23/08) | Não | Implementado sem rastro documental |
| CA-OPS-01 | Sim | Sim, testado | Sim | Completo |
| CA-OPS-02 | Sim | Sim, testado | Sim | Completo |
| CA-OPS-03 | Não | Sim (**24/08**) | Não | Implementado sem rastro documental, resolve pendência da Fase C |
| CA-PORTAL-01 | Sim (24/08) | Presumido (não auditado em profundidade aqui) | Não | Documentado sem changelog |
| CA-PORTAL-02 | Sim | Sim | Sim | Completo |
| CA-PORTAL-03 | Sim | Sim | Sim | Completo |
| CA-PORTAL-04 | Não | Sim (**24/08**) | Não | Implementado sem rastro documental |
| CA-GOV-01 | Sim | N/A (documento de estado, não módulo) | Não | Documento de governança; bloqueadores de go-live seguem abertos |
| CA-ART-01 | Sim | N/A | Não | 3 artefatos declarados, 0 preservados no repositório |
| CA-EVO-01 | Não | Não | Não | **Perdido** — nunca localizado |
| CA-EVO-02 a 05B, CA-RESET-01, CA-CONN-01, CA-10A1 | Localizados como histórico (`INVENTARIO_SERIE_CA_E_EVO`) | Referência apenas, não specs vigentes | Não | Histórico preservado, não é trabalho pendente |
| CA-01 a CA-08 | Não | Não | Não | **Perdidos** — nunca localizados |

## 5. O que isso significa na prática

1. **Nada do que foi implementado está "faltando" tecnicamente** — CA-UX-01/02/05, CA-OPS-03 e CA-PORTAL-04 funcionam no código. O problema é 100% de rastreabilidade: sem documento nem changelog, ninguém fora de quem escreveu consegue saber que existem, o que fazem, ou revisar se estão certos.
2. **Os únicos prompts realmente perdidos** são a série original CA-01 a CA-08 e CA-EVO-01. Não há mais nenhum lugar novo para procurar além do que o Manifesto de 23/08 já listou (Drive, Dropbox, transcrições, histórico do Lovable) — ou se aceita a perda formalmente, ou alguém confirma se esses arquivos existem fora do que este ambiente consegue acessar.
3. **O go-live real do primeiro caso (Ana Luiza) continua não confirmado** — isso é o item de maior risco de todo o levantamento: presença de preparação extensa (contrato, checklist, motor) sem evidência de ativação, cobrança ou assinatura real.
4. **Os 3 artefatos binários do CA-ART-01 seguem fora do GitHub** — mesma pendência de 23/08, sem progresso.

## 6. Proposta (sem implementar)

1. Escrever, retroativamente, um changelog curto para CA-UX-01/02/05,
   CA-OPS-03 e CA-PORTAL-04 — não é preciso redesenhar nada, só registrar
   o que já existe (isso evita repetir esta auditoria toda vez).
2. Decidir sobre CA-01 a CA-08 e CA-EVO-01: procurar uma última vez fora
   deste repositório (Drive/Dropbox/Lovable) ou declarar oficialmente
   perdidos e seguir sem eles.
3. Confirmar, com evidência externa (Asaas, e-mail, assinatura), se o caso
   Ana Luiza teve ou não ativação real — isso não se resolve por leitura de
   código, precisa de checagem fora do repositório.
4. Fazer upload dos 3 artefatos binários do CA-ART-01 ao repositório (ou
   declarar formalmente que ficam só no Drive/Canva, atualizando o
   manifesto para não ficar como "pendente" indefinidamente).
5. Preencher de fato os Anexos II, IV e V para pelo menos um caso real,
   já que o motor está pronto e só falta a materialização (REC-004).

## 7. Aceite necessário

Aprovar: (a) se vale a pena escrever os changelogs retroativos do item 1;
(b) prazo/responsável para a última tentativa de recuperação de CA-01 a
CA-08; (c) quem confirma o estado real de ativação do caso Ana Luiza fora
do repositório; (d) quem faz o upload dos artefatos do CA-ART-01.
