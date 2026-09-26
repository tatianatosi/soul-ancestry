# P5 — Executar e publicar: cadeia de pesquisa até o App (2026-09-26)

```yaml
status: APROVADO PARA EXECUÇÃO E PUBLICAÇÃO CONTROLADA EM main — executado
objetivo: "fonte → documento → evidência → validação → achado → relatório →
  projeção App deve persistir, ter histórico e respeitar visibilidade"
```

## Investigação primeiro (agente Explore, leitura direta de código — não de commit/doc antigo)

Antes de tocar em qualquer linha, mapeei o estado real dos 7 estágios contra
4 critérios (escritor+releitura, reader, histórico/proveniência, gate de
publicação humana, isolamento/sanitização, despublicar sem apagar origem).
Achados que mudaram o escopo do corte:

| Estágio | Veredito antes deste corte |
|---|---|
| 1. Fonte/Documento | Escritor real, mas sem releitura campo-a-campo (`gravarComVerificacao`) e **sem nenhum evento em `case_timeline_events`** |
| 2. Evidência | Já completo (releitura, `evidence_validations`, timeline, isolamento) — não tocado |
| 3. Validação | Mesmo mecanismo da Evidência — já completo, não tocado |
| 4. Achado | Escritor+releitura reais, mas **sem evento de timeline** (só existia o alerta operacional de `prepararConsequenciaAchado`, que é outra coisa) |
| 5. Relatório | **Gap crítico confirmado**: `case_reports.publicado_no_app` tinha validação real (`visivelNoApp`) mas **nenhuma rota do Portal lia `case_reports`** — marcar "publicado no App" nunca tinha consequência visível |
| 6. Projeção App | Já completo (RLS dupla, view sanitizada, `despublicarProjecao` real e testado) — só o motivo digitado na confirmação de aprovar/despublicar era descartado, nunca persistido |
| "Despublicar" | **Já existia e funcionava** — não era o gap (hipótese refutada pela leitura do código) |

## Executado

### 1. Estágio 1 (Fonte/Documento) — `src/lib/fontes-documentos.functions.ts`
- `registrarFonteDocumento`: `insert` cru → `inserirComVerificacao` (grava e
  relê campo a campo).
- `editarMetadadosFonte`: `update` cru → `gravarComVerificacao`.
- `arquivarFonteDocumento`: `update` cru → `gravarComVerificacao`.
- As três agora chamam `registrarTimelineCaso` — criar, editar e arquivar uma
  fonte documental passam a deixar rastro no histórico do caso, igual já
  acontecia com evidência/achado/projeção.

### 2. Estágio 4 (Achado) — `src/lib/achados-genealogicos.functions.ts`
- `salvarAchado` e `arquivarRegistroG06` passam a chamar `registrarTimelineCaso`
  (evento próprio do achado), sem nunca depender do alerta de
  `prepararConsequenciaAchado` para isso — são coisas diferentes: alerta é
  consequência operacional (falta microentrega vinculada), timeline é
  histórico de mudança do próprio achado.

### 3. Estágio 5 (Relatório) — o gap mais concreto, fechado
`case_reports.publicado_no_app` continua existindo e validado (`visivelNoApp`),
mas agora tem consequência real: nova ponte `projetarRelatorioParaApp`
(`src/lib/relatorios-fase.functions.ts`), no mesmo padrão já testado de
`projetarMicroentregaParaApp` (achado→microentrega→App, corte anterior desta
sessão):
- Só executa quando `visivelNoApp(relatorio)` é verdadeiro (entregue,
  publicado no App marcado, resumo aprovado preenchido).
- Dedup por origem (`source_entity_type = "case_report"` +
  `source_entity_id`): um relatório nunca gera duas projeções.
- Cria a projeção em **rascunho** (`approval_status: "draft"`) — a publicação
  de fato continua exigindo a mesma revisão/aprovação humana já existente na
  Biblioteca Mestre (`aprovarProjecao`). Nunca publica sozinho.
- Passa pelo mesmo filtro de sanitização (`conteudoProjetavel`) que toda
  projeção já passa.
- Novo rótulo `relatorio_fase: "Relatório da fase"` em `TIPO_PROJECAO_ROTULO`
  (`projecoes-cliente.ts`) — texto real ao cliente, nunca o tipo cru.
- Botão "Projetar para o App" em `/relatorios-fase/$caseId`, visível só
  quando `visivelNoApp` é verdadeiro.
- `salvarRelatorioFase` também ganhou `registrarTimelineCaso` (criar/editar).

### 4. Estágio 6 (Projeção App) — motivo da confirmação deixa de ser descartado
Achado real: o diálogo de confirmação (`AcaoOperacional`, `acaoExterna`)
exige "Motivo da decisão" antes de publicar/despublicar, mas nem
`aprovarProjecao` nem `despublicarProjecao` recebiam esse texto — e as duas
telas que chamam essas mutations (`biblioteca-evidencias.$caseId.tsx`,
`conteudo-editorial-conectado.tsx`) ignoravam o argumento `motivo` do
callback. Corrigido nos dois lados:
- `aprovarProjecao`/`despublicarProjecao` ganham `motivo?: string`, persistem
  em `audit_logs` (ação `achado_publicado_no_app` /
  `achado_aprovado_aguardando_publicacao` / `achado_despublicado_do_app`) e
  incluem o motivo no próprio evento de timeline.
- As 4 chamadas de UI (`onConfirmar`) passam a repassar o `motivo` recebido
  do diálogo em vez de descartá-lo.

### 5. Isolamento/sanitização — filtro automático de CPF
Achado real: `conteudoProjetavel` (o filtro que decide se um texto pode virar
projeção ao App) tinha regras contra URL/link interno e juízo de mérito
("hipótese", "risco" etc.), mas nenhuma contra CPF — a proteção dependia
inteiramente de o humano não digitar isso. Adicionado `contemCpf` (novo, em
`biblioteca-evidencias.ts`): detecta formato pontuado (`000.000.000-00`,
inconfundível) e sequências de 11 dígitos crus que realmente batem o dígito
verificador (reaproveita `cpfValido` de `validacao-pessoa.ts` — não duplica
validador, e evita falso positivo em número de 11 dígitos que não é CPF).

### 6. Mockup 17p aplicado à superfície afetada (Legado)
A auditoria tela-a-tela de 12/09/2026
(`docs/relatorios/2026-09-12_verificacao-tela-a-tela-mockup17-auditoria47.md`)
já apontava a tela Legado (`/portal/legado`) como "Parcial: lista existe;
falta o cartão 'continuidade da jornada — próxima etapa'". Fechado: novo
card "Continuidade da jornada" em `src/routes/portal/legado.tsx`,
reaproveitando `vivo.proximaAcao` — a mesma projeção sanitizada que a Home já
usa (`portal-dados-vivos`/`motor-caso.ts#projetarProximaAcaoCliente`),
nenhum dado novo nem fonte paralela. Nota: "prancha Desk v4" (citada no
pedido) não existe como termo em nenhum arquivo do repositório — o artefato
visual real e vinculante é o mockup de 17 páginas ("mockup 17p"), já aplicado
aqui; "Prancha Desk v6" existe só como planos de sessão do Lovable
(`.lovable/plan/`), não como imagem/prancha.

## Não tocado (fora do escopo confirmado, declarado)

- Fragmentação `evidencias`/`evidences` e `case_source_documents`/
  `research_sources` (duas tabelas paralelas em cada par) — dívida
  estrutural já documentada (`docs/relatorios/2026-09-11_auditoria-fim-tarde-checklist.md`,
  item BE-09), não criar quarta cópia nem resolver sem decisão explícita.
- `salvarRelatorioFase`/`vincularEvidenciaRelatorio`/
  `vincularMicroentregaRelatorio` continuam com comparação de divergência ad
  hoc (não `gravarComVerificacao`) — mudar isso trocaria a semântica de
  "salvo com ajuste do banco" que a tela já promete; fora do escopo deste
  corte.
- Item FE-07 (paridade visual tipografia/atmosfera do App vs. mockup 17p) —
  já declarado "para depois do motor" em 11/09/2026, não reaberto aqui.

## Verificação

`tsc --noEmit` limpo. 48 testes novos/atualizados
(`p5-cadeia-pesquisa-ate-app-2026-09-26.test.ts`, 14 testes; 4 testes novos
em `biblioteca-evidencias.test.ts` para detecção de CPF). Suíte completa:
406/413 arquivos, 3842/3861 testes — 7 arquivos/11 testes em falha, idêntico
à baseline estável pré-existente (visual/portal, não relacionados a este
corte). `vite build` limpo.

## Prova Lovable pós-push

1. Em `/pesquisa-evidencias/$caseId` (Fontes e documentos): criar/editar/
   arquivar uma fonte → conferir na timeline do caso (Caso 360) que os três
   eventos aparecem.
2. Em `/achados/$caseId`: salvar um achado → conferir evento na timeline,
   distinto de qualquer alerta em `/alertas`.
3. Em `/relatorios-fase/$caseId`: criar um relatório, marcar como "entregue",
   preencher resumo aprovado e marcar "publicado no App" → botão "Projetar
   para o App" aparece → clicar → abrir a Biblioteca Mestre
   (`/biblioteca-evidencias/$caseId` ou fila conectada) e confirmar que a
   projeção chegou em rascunho, com o rótulo "Relatório da fase".
4. Aprovar (sem publicar) e depois "Aprovar e publicar" essa projeção,
   digitando um motivo real no diálogo → conferir em `/configuracoes` →
   "Abrir trilha de auditoria" que o motivo aparece no evento
   `achado_publicado_no_app`.
5. Despublicar a mesma projeção com um motivo → confirmar que ela some do
   App Cliente (`portal_projecoes`) mas a evidência/achado de origem
   continua intacta — nunca apagada.
6. Em `/portal/legado` (App Cliente, caso com próxima ação real): conferir
   o novo card "Continuidade da jornada" com o mesmo texto que já aparece na
   Home.
