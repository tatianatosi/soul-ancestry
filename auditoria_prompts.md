# Auditoria de prompts — Clube Ancestral / soul-ancestry

- **Data da varredura:** 29/10/2026
- **HEAD auditado:** `8736cb8` (branch `claude/exciting-euler-psrn4j`)
- **Fonte de verdade das fases:** `roadmap.md` (63 seções, 169 itens concluídos / 141 em aberto)
- **Método:** histórico git + árvore de diretórios em tempo de execução + execução real de typecheck, testes, build e do portão `pipeline.py`.

## Veredito em uma linha

Nada está preso localmente e nada divergiu do Lovable — mas **o portão de entrega do próprio projeto estava quebrado**, a suíte de testes está **vermelha em 13 testes**, e há **6 componentes órfãos** nunca renderizados, dois deles com integração abandonada no meio.

---

# Parte A — Auditoria cruzada (saída de `auditar_projeto.py`)

### 1. Alterações Locais Não Comitadas (Presas no PC/Claude)
Arquivos modificados localmente que ainda não foram para o repositório/Lovable:
```
M pipeline.py
?? auditar_projeto.py
?? auditoria_prompts.md
```

Todos são artefatos **desta** auditoria (script, relatório e a correção do `pipeline.py`). Antes dela, a árvore estava limpa.

### 2. Commits Locais Não Sincronizados com o Remote (Lovable)
Nenhum. Verificação explícita das quatro referências:

| Referência | Commit |
|---|---|
| `HEAD` | `8736cb8` |
| `origin/claude/exciting-euler-psrn4j` | `8736cb8` |
| `main` | `8736cb8` |
| `origin/main` | `8736cb8` |

`git log main..HEAD` e `git log HEAD..main` voltam vazios: **zero divergência**. O que está no código local é exatamente o que o Lovable recebeu.

### 3. Análise do Cartographer / Arquitetura
Nenhum artefato estático do Cartographer existe no repositório (`find` por `*cartographer*` não retorna nada; não há `cartographer.json` nem mapa gerado). O plugin está carregado na sessão, mas **nunca materializou um mapa neste projeto** — portanto não existe "árvore do Cartographer" para cotejar com o último commit. O mapeamento desta auditoria foi feito em tempo de execução sobre a árvore real.

**Consequência para a pergunta 2 do pedido:** a comparação "árvore do Cartographer × último commit no Lovable" é *inaplicável por ausência de fonte*, não "aprovada". O que foi possível comprovar — e está comprovado acima — é que árvore local, branch e `main` remota são o mesmo commit.

### 4. Códigos Parciais ou Abandonados (Placeholders/TODOs)
O varredor do script marca 140 arquivos, mas o critério (`"placeholder" in conteudo.lower()`) captura o atributo HTML `placeholder=` de qualquer input — ruído, não pendência. Depois de filtrar por marcador real de código (`TODO:` / `FIXME:` / marcador abrindo comentário), sobram **exatamente 2**:

| Arquivo | Linha | Marcador | Situação real |
|---|---|---|---|
| `src/components/painel/botao-testar-cliente.tsx` | 17 | `// TODO: Integrar com gerarLinkAcessoClienteDebug quando houver integração SSO` | **Órfão** — 0 importações. O helper `gerarLinkAcessoClienteDebug` existe (`src/lib/debug-cliente-access.ts`), mas nunca foi ligado. |
| `src/components/caso/descobertas-alertas.tsx` | 67 | `// TODO: Integrar com API de WhatsApp/notificações` | **Órfão** — 0 importações. `enviarAlerta` faz `console.log` em vez de enviar; `gerarAlertaAchado` existe, o envio não. |

---

# Parte B — Validação local executada (Fase 3)

| Verificação | Comando | Resultado |
|---|---|---|
| Typecheck | `tsc --noEmit` | **PASSA** (exit 0, zero erros) |
| Build de produção | `bun run build` | **PASSA** (exit 0, `✓ built in 2.89s`) |
| Testes | `vitest run` | **FALHA** — 13 testes falhos / 5761 passam / 8 skipped; 10 arquivos falhos de 599 |
| Portão do projeto | `python3 pipeline.py` | **ABORTAVA SEMPRE** (ver Parte C) |

`.github/workflows/ci.yml` roda `typecheck` **e** `test` em todo push para `main`. Como `main` é este mesmo commit e a suíte está vermelha, **o CI da `main` está vermelho** — e a branch continua sincronizando para o Lovable, porque o Lovable não depende do CI.

## Os 13 testes vermelhos

Todos são testes de *contrato de apresentação*: leem o arquivo-fonte da rota e exigem um texto literal. Não são falhas de lógica — são divergências entre a cópia aprovada hoje e a que o teste congelou.

| Arquivo de teste | Falhas | Exige |
|---|---|---|
| `a5-documentos-quatro-estados-canonicos.test.ts` | 2 | `data-documentos-entregas`; Entregas como atalho para Legado |
| `a5-documentos-separacao-semantica.test.ts` | 2 | atalho para `/portal/legado`; não somar listas |
| `entrega-1-sistema-visual-app-home.test.ts` | 2 | stepper compacto; títulos em sans |
| `mockup4-presentation.test.ts` | 1 | condições como previstas |
| `a7-assinatura-upsell-com-preco-2026-10-03.test.ts` | 1 | nenhum rastro de upsell na Conta |
| `acabamento-visual-2026-10-22.test.ts` | 1 | esqueleto de carregamento |
| `app-p0-checklist-documental-2026-10-24.test.ts` | 1 | envio visível no estado vazio e com pedidos |
| `fidelidade-visual-2026-09-23.test.ts` | 1 | exatamente 4 caixas do §7 |
| `l3-selo-caso-vocabulario-cliente-2026-10-24.test.ts` | 1 | sem rótulo operacional nem 'Não registrado' |
| `l4-regua-preparacao-texto-2026-10-24.test.ts` | 1 | `">Preparação do caso</span>` |

Isto **não é achado novo**: o `roadmap.md` já registra o conflito em 12/10 ("`a5-documentos-separacao-semantica` exige copy antiga; `a1-home-card-microentrega` exige border-plum legado. **Testes inalterados**") e em 18/10 ("4 falhas de teste restantes são a divergência V4×V5 de menu, **decisão pendente da Proprietária**"). O que a auditoria acrescenta é a medida: o débito cresceu de 2–4 para **13**, e passou a manter o CI da `main` vermelho.

---

# Parte C — Onde o código falhou ou parou pela metade

## C1. O portão de entrega estava permanentemente quebrado — CORRIGIDO

`pipeline.py` é o portão documentado antes do push para a `main`/Lovable. Ele abortava em **10 achados, 8 deles falsos positivos**: em português, "TODO" em maiúsculas é a palavra *todo* ("TODO campo", "TODO o perfil", "TODO payload"), e o varredor a tratava como tarefa pendente.

O commit `347c109` ("fix: pipeline não trata a palavra portuguesa todo como tarefa incompleta") **tentou e não resolveu**: trocou a comparação por `re.compile(r"\bTODO\b")`, que continua casando a palavra em maiúsculas. Resultado: desde 27/10 o portão nunca podia passar — e um portão que nunca passa deixa de ser portão.

**Correção aplicada neste corte** (`pipeline.py`): o marcador só conta na forma de código — `TODO:` / `FIXME(` ou o marcador abrindo a linha de comentário — e os próprios varredores (`pipeline.py`, `auditar_projeto.py`) ficam fora da varredura, como já ocorria com `pipeline.py`. Os 8 falsos positivos desapareceram; os 2 marcadores reais permaneceram, que é o comportamento correto.

## C2. Dois recursos abandonados no meio da integração — NÃO corrigidos, por decisão

Os dois marcadores reais são código morto com integração interrompida. **Não os completei**, e o motivo é de escopo, não de esforço:

- **`botao-testar-cliente.tsx`** — navega para `/portal/casos/$id` com o id **fixo `"ana-luiza"`**. O `AGENTS.md` determina que o admin vê o App **só** via `/app-cliente-como-pessoa?casoId=` e que nunca se seleciona caso por nome. Ligar este componente criaria um segundo caminho privilegiado ao dado do cliente, contra a regra canônica. Reviver exige decisão da Proprietária.
- **`descobertas-alertas.tsx`** — completar significa enviar WhatsApp de verdade. Efeito externo: o `AGENTS.md` proíbe sem autorização explícita.

Ambos têm **0 importações** — nenhum usuário alcança essas telas hoje. Não os removi porque "nada arquiva sem `COMPROVADO_EM_USO`".

## C3. Componentes órfãos (nunca importados nem renderizados)

| Componente | Refs | Leitura |
|---|---|---|
| `src/components/painel/botao-testar-cliente.tsx` | 0 | abandonado com TODO (C2) |
| `src/components/caso/descobertas-alertas.tsx` | 0 | abandonado com envio falso (C2) |
| `src/components/biblioteca/motores-primordiais.tsx` | 0 | órfão |
| `src/components/painel/cards-alertas-centrais.tsx` | 0 | órfão |
| `src/components/painel/metricas-jornada.tsx` | 0 | órfão |
| `src/components/relatorio-visual.tsx` | 0 | órfão (a única menção aponta para `src/data/relatorio-visual.ts`, outro arquivo) |

Fora da lista, por serem deliberados e documentados: `painel-dia.tsx` (27 refs; retirado da superfície em 14/09, arquivo mantido — `AGENTS.md`: "continua aguardando decisão; não tocar"), `desk-go-live.tsx` (fixture histórico lido por teste) e `src/components/ui/*` (biblioteca shadcn, uso sob demanda).

## C4. Divergência local × implantado: o ponto real é o banco, não o código

O código não divergiu. O schema pode. `supabase/pendentes/README.md` registra a regra de 23/10: **o Lovable não executa migrações que chegam pelo GitHub**, então migração escrita em `supabase/migrations/` "só criaria a ilusão de que foi aplicada".

Estado atual: 235 arquivos em `supabase/migrations/` (histórico), 3 no journal do Drizzle, 5 propostas em `supabase/pendentes/` — 4 marcadas `JÁ APLICADO`, e uma em aberto:

- `20261024120000_documentos_reais_ana_liberados.sql` — **NÃO APLICADO; BLOQUEADO_POR_DADO**. Publica material interno; faltam versões sanitizadas. Correto que não tenha subido.

Nenhum schema pendente foi identificado na conferência de 25/10 (194 tabelas conferidas contra os tipos gerados). O risco aqui não é divergência silenciosa — é que o arquivo em `pendentes/` **parece** entregue e não é.

## C5. Invariantes do `AGENTS.md`: todas presentes no código

| Invariante | Arquivos |
|---|---|
| `SETORES_DESK` | 5 |
| `GRUPOS_DESK` | 24 |
| `SUPERFICIES_PRANCHA_V4` | 3 |
| `proxima_acao_prioritaria` | 23 |
| `confirmarDocumentosMinimos` | 6 |
| `documentos_minimos_ok` | 26 |
| `portal_sou_contratante_financeiro` | 3 |
| `legacy_record_links` | 5 |
| `restritoAoContratante` | 4 |

O `PortalShell` expõe exatamente as 7 abas canônicas. As 7 rotas `/portal/*` fora da navegação (`casos.$id`, `entregas`, `mensagens.$id`, `fase-01`, `fase-02`, `faturas`, `proposta`) **têm referências internas** (12 a 21 cada) — são destinos contextuais, não órfãs.

---

# Parte D — Classificação das 63 fases do `roadmap.md`

| Categoria | Fases |
|---|---|
| **[CONCLUÍDO TOTAL]** | 9 |
| **[PARCIAL]** | 36 |
| **[ARQUIVADO/IGNORADO]** | 17 |
| **[SEM CHECKLIST]** | 1 |

Critério: todos os itens marcados = CONCLUÍDO TOTAL; mistura = PARCIAL; nenhum item marcado = ARQUIVADO/IGNORADO.

## [CONCLUÍDO TOTAL]

| Fase | Itens |
|---|---|
| 27/10 — Correção focal da Árvore (sem publicação) | 3 |
| 26/10 — Dossiês e Relatórios reais do Legado da Ana | 3 |
| 25/10 — PDF: sete abas atuais × mockup de 17 páginas | 3 |
| 20/10 — Sugestões completas de jornada guiada (somente documento) | 3 |
| Jornada do App fiel ao mockup (30/09/2026) | 2 |
| Shell global do App Cliente (28/09/2026) | 2 |
| Desk — mais cards, padrão aprovado (16/09/2026) | 3 |
| Desk — correção integral da prancha v6 (16/09/2026) | 5 |
| Paridade UI do App P1–P4 (05/10/2026) | 6 |

## [ARQUIVADO/IGNORADO] — iniciadas e abandonadas sem nenhum item entregue

Estas são a resposta direta à pergunta "onde o código parou pela metade": nenhuma tem um único item concluído.

| Fase | Itens em aberto | Primeiro bloqueio registrado |
|---|---|---|
| 25/10 — Resgate da experiência rica do App Cliente | 3 | Cruzar prompts aprovados e comparativo editorial indicado com as sete abas atuais; separar ausências visuais de falta de conteúdo publicado. |
| Polimento de luxo 12/10 (pedido 16:38) | 4 | Jornada: texto editorial Graz (1895) no lugar de Lacuna (autorizado) |
| Homologação final — Desk V4 e App Cliente (11/10/2026) | 4 | Ajustar `/painel` na implementação Go Live: retirar a sessão demo do menu e alimentar o cockpit pela fila real de próxima ação prioritária. |
| Telemetria de permanência por aba (11/10/2026) | 2 | Validar a proposta `client_tab_dwell_events` contra schema, funções de acesso, privacidade, retenção e política de dados — bloqueada até autorização e |
| Mapa Ana: Lead → App Cliente (14/09/2026, somente leitura) | 4 | Mapear os 12 marcos (Lead → Portal/App) com rota, CTA entrada/saída, o que se vê, estado vazio, estado visual e print mobile. |
| Pesquisa e Biblioteca (15/09/2026) | 2 | Pesquisa do caso: 3 blocos (cobertura por fonte, produção de evidência, fila editorial) na cadeia Pergunta → Fonte → Evidência → Achado → Revisão → Pu |
| Prova funcional + 7 abas do App (15/09/2026) | 2 | Prova Lead→App do caso Ana com antes/depois |
| Aceite P0 Comercial (2026-09-15) | 4 | Conferir diff e execução dos testes P0 no main |
| App Cliente — fidelidade à prancha aprovada (2026-09-15) | 3 | Revisar cor e layout do App Cliente (desktop e mobile) contra a prancha "Prancha de aceite · App Cliente" (7 telas canônicas) |
| Ficha Ana — papéis, duplicidades e próxima ação (2026-09-15) | 4 | Papéis operacionais do núcleo (titular, participantes signatários, dependente, pessoa em revisão) — sem inferir parentesco genealógico |
| Papéis do núcleo e duplicados (15/09/2026) | 3 | Atualizar papéis de Ana, Adair, Alice e Felipe no App e mostrar Árvore, Documentos e Legado. |
| Acesso App Cliente (16/09/2026) | 1 | Corrigir `/acesso/confirmar` preso em “Validando seu acesso” após autenticação e comprovar abertura dos dados. |
| Sistema único: matrizes, App e jornada da Ana (21/09/2026) | 6 | Consolidar matrizes únicas App e Desk no Design System com referências visuais aprovadas. |
| Corte visual — prancha v4, mockup 17 páginas e contrato Ana (23/09/2026) | 6 | Gerar nova proposta do wireframe completo da Ana, mais arejada, em desktop e 375 px, sem alterar produto ou dados. |
| 18/10/2026 — Mockup V4 do dia a dia (11 telas) — revisão após a jornada da Ana | 2 | Revisar o último mockup após concluir a jornada da Ana: rejeitado pela Proprietária às 22:04 UTC por não corresponder às sugestões anteriores nem às c |
| 18/10/2026 às 23:18 UTC — Todas as telas com cascas V4 reais | 3 | Recompor o mockup de todas as superfícies e estados contextuais do Desk, não limitado às onze principais nem à prancha aprovada: resgatar cascas/compo |
| 19/10 — Mockup Desk V4 completo (draft drft_01m58xcem1fgk9dyps5y780yh9) | 6 | Modelos V4 próprios por tela do Desk (cascas reais: previa-desk-telas, desk-mockup, clube-ancestral-kit). |

## [PARCIAL] — entregues pela metade

| Fase | Feito | Em aberto |
|---|---|---|
| 13/10 — Desk V4 / caso Ana | 8 | 7 |
| 18/10/2026 23:18 UTC — Recomposição de todas as superfícies Desk | 7 | 7 |
| Sanear o Desk V4 (02/10/2026) | 2 | 6 |
| Plano executável App/Desk (24/10/2026) — `docs/prompts/2026-10-24-plano-executavel-app-desk-lovable.md` | 4 | 5 |
| 22/10 — Fechamento aprovado v4.0 (sem redesign/publicação) | 4 | 4 |
| Experiência familiar — pedido ao Claude (11/10/2026) | 1 | 4 |
| 18/10/2026 — Jornada viva da Ana (novo pedido) | 5 | 4 |
| 25/10 — Fechamento v4.0 e conteúdo real da Ana (15:43 UTC) | 3 | 3 |
| 18/10 — pedidos para aprovação, sem publicação | 4 | 3 |
| Refinamento editorial — quatro abas oficiais (12/10/2026) | 3 | 3 |
| Revisão textual e capturas do App Cliente (26/09/2026) | 25 | 3 |
| 26/10 — Experiência integral das sete abas | 3 | 2 |
| Caso 360 V4 — rascunho isolado (13/10, 13:25 UTC) | 4 | 2 |
| Publicação do site principal (12/10/2026) | 2 | 2 |
| Revisão da prancha enviada (05/10/2026) | 3 | 2 |
| Revisão do App da Ana e publicação familiar (01/10/2026) | 2 | 2 |
| App Cliente fiel ao mockup de 17 páginas (30/09/2026) | 1 | 2 |
| Elementos faltantes do App Cliente (05/10/2026) | 2 | 2 |
| 19/10 — Mockup Desk V4 completo (draft drft_01m58xcem1fgk9dyps5y780yh9) — ENTREGUE | 7 | 2 |
| 26/10 — Paleta rica e densidade editorial do App | 2 | 1 |
| 25/10 — Conferência e aplicação de migrations pendentes | 2 | 1 |
| 24/10 — Publicação Desk V4 e documentos da Ana (11:47 UTC) | 1 | 1 |
| 19/10 — Atualização da recomposição densa do App | 3 | 1 |
| 18/10 — CRM Mestre é dicionário (L00–L12, proposta v1.0) | 2 | 1 |
| Mockup 4 — rascunho isolado (13/10/2026 16:55 UTC) | 7 | 1 |
| Auditoria 10/10 — quatro correções visuais finais (12/10/2026) | 5 | 1 |
| Núcleo — formulário pai e irmã da Ana (10/10/2026) | 3 | 1 |
| Desk — aplicação do de-para v4 (07/10/2026) | 2 | 1 |
| Limpeza do Desk publicado (14/09/2026) | 4 | 1 |
| Patch global de responsividade do Desk (14/09/2026) | 3 | 1 |
| Superfície de go-live (14/09/2026) | 2 | 1 |
| Desk — Hoje, navegação e Biblioteca (15/09/2026) | 3 | 1 |
| P0-1B — callback/sessão/elegibilidade (16/09/2026) | 3 | 1 |
| Paridade visual final do App Cliente (04/10/2026) | 3 | 1 |
| Pranchas comparativas do App (05/10/2026) | 2 | 1 |
| WhatsApp e publicação (13/10/2026) | 2 | 1 |

## [SEM CHECKLIST]

| Fase | Itens |
|---|---|
| Kit visual ligado a dados reais (13/09/2026) | 0 |

---

# Parte E — O que foi corrigido e o que depende de decisão

## Corrigido neste corte

1. **`pipeline.py`** — varredor de marcadores reescrito; 8 falsos positivos eliminados, portão volta a ser informativo. Único defeito encontrado que era inequivocamente meu para corrigir: bug real, autocontido, sem efeito externo, em código de ferramenta.
2. **`auditar_projeto.py`** — script da auditoria versionado, para a varredura ser repetível.

## Depende de decisão da Proprietária (e por quê não agi)

| # | Pendência | Por que não foi corrigido agora |
|---|---|---|
| 1 | 13 testes de apresentação vermelhos | Fechar exige **ou** mudar cópia aprovada **ou** alterar teste bloqueador. O `roadmap.md` proíbe os dois sem decisão ("Testes inalterados", "Sem alterar teste bloqueador"). Mexer aqui é escolher sozinho qual verdade vence. |
| 2 | `botao-testar-cliente.tsx` | Ligar cria 2º caminho admin→dado do cliente por nome fixo, contra o `AGENTS.md`. Remover exige `COMPROVADO_EM_USO`. |
| 3 | `descobertas-alertas.tsx` | Completar = enviar WhatsApp real (efeito externo proibido sem autorização). |
| 4 | 4 outros componentes órfãos | Remoção precisa de `COMPROVADO_EM_USO`. |
| 5 | `20261024120000_documentos_reais_ana_liberados.sql` | `BLOQUEADO_POR_DADO`: faltam versões sanitizadas. |
| 6 | CI vermelho na `main` | Consequência de (1). |

## Recomendação de ordem

1. Decidir os 13 contratos de apresentação — é o que mantém o CI vermelho e esconde regressão futura no ruído.
2. Decidir os 6 órfãos: ligar ou arquivar. Hoje custam manutenção e entregam zero.
3. Só então tratar `pipeline.py` como portão de verdade — ele volta a reprovar por motivo legítimo.

> Nada foi publicado, nenhuma migração aplicada, nenhum dado alterado e nenhum efeito externo acionado nesta auditoria.
