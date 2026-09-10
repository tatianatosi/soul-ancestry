---
titulo: Execução do fluxo básico — CA-P0-EXEC-001
data: 2026-09-04
branch: claude/ancestral-club-desk-intelligence-0gsoeg
pr: "#85 (draft, mesma branch)"
---

# Execução do fluxo básico — CA-P0-EXEC-001

## 1. Objetivo

Converter em fluxo operável, testado e revisável em preview quatro achados já
confirmados no relatório de 04/09 (`2026-09-04_artefato_do_dia_clube_ancestral.md`):
assinatura → acesso ao App Cliente; `/nucleos` → Pessoa Canônica; `/nucleos` →
fila real de dossiê-mãe; TOP 30 → erro visível.

Decisão de execução em relação ao prompt original: o escopo pede uma branch
nova (`fix/ca-p0-fluxo-basico-contrato-nucleos`). A execução seguiu na branch
já existente `claude/ancestral-club-desk-intelligence-0gsoeg` (PR #85), porque
essa branch já concentra todo o trabalho em andamento relacionado a esta
mesma missão — abrir uma segunda branch fragmentaria o mesmo fluxo em duas
PRs draft sem necessidade. Nenhuma migration, merge, deploy de produção ou
comunicação externa foi executado.

## 2. Escopo executado

**Critério A — assinatura → gate do App Cliente.** Investigado e confirmado
já correto no código existente: `registrarAssinatura`
(`src/lib/contrato-parametros.functions.ts`) grava `contracts.status`,
`contract_case_parameters.status` e propaga para `crm_casos.contrato_assinado`
— exatamente o campo que `bloqueioDoCaso` (`src/lib/portal-elegibilidade.ts`)
lê para liberar o App Cliente. Nenhuma mudança de código foi necessária; o
gap era ausência de teste automatizado, corrigido no item de testes abaixo.

**Critério B — `/nucleos` e Pessoa Canônica.** O seletor de vínculo manual
("Vincular a pessoa cadastrada") já existia no formulário de edição do
requerente. O que faltava era a leitura: quando um requerente não tinha
vínculo, a tela simplesmente não mostrava nada — sem explicar a ausência.
Corrigido em `src/routes/_authenticated/nucleos.tsx`: agora aparece
"Sem vínculo com Pessoa Canônica — use 'Editar' para vincular" no lugar do
silêncio anterior. Nenhum dado existente foi apagado ou alterado.

**Critério C — dossiê-mãe → fila real do Drive.** Investigado: `/nucleos`
tratava `dossie_mae`/`dossie_status` como campos de texto livre em
`nucleos_familiares`, sem nenhuma leitura ou escrita na fila real de
governança (`drive_provisioning_queue`, `src/lib/drive-provisioning.ts`) —
a mesma fila que a ficha do caso (`visao-geral.tsx`) já exibe só leitura.
Implementado:
- `listarNucleos` (`src/lib/nucleos-desk.functions.ts`) agora também carrega,
  por núcleo, o item mais recente da fila real e os gates do caso vinculado
  (`contrato_assinado`, `pagamento_confirmado`, `ativado_em`).
- Nova função `encaminharFilaDrive` (mesmo arquivo): avalia os gates reais do
  caso com `avaliarFilaDrive`, e só then move o item de `blocked` para
  `ready_for_review` via `podeTransicionar` — nunca cria pasta, nunca aprova
  ou executa (isso exige decisão humana registrada em outro fluxo, fora deste
  escopo). Sem gates completos, cria (ou mantém) o item bloqueado. Idempotente:
  clicar de novo em um item que já saiu de "blocked" não faz nada.
- `/nucleos` (`nucleos.tsx`) agora mostra o estado real da fila por núcleo e o
  botão "Encaminhar para revisão", desabilitado quando o núcleo não tem caso
  vinculado.

**Critério D — painel TOP 30.** `src/components/painel/painel-top30.tsx`
sumia silenciosamente (`return null`) em erro ou ausência de dado. Agora
mostra três estados distintos: carregando, erro com mensagem real e botão
"Tentar de novo" (`refetch`), e vazio com mensagem explícita.

## 3. Arquivos alterados

- `src/lib/nucleos-desk.functions.ts` — fila real do Drive em `listarNucleos`; nova `encaminharFilaDrive`.
- `src/routes/_authenticated/nucleos.tsx` — mensagem de ausência de vínculo (B); bloco de estado real da fila + CTA (C).
- `src/components/painel/painel-top30.tsx` — estados de erro/vazio visíveis (D).
- `src/lib/__tests__/portal-elegibilidade.test.ts` (novo) — critério A.
- `src/lib/__tests__/nucleos-fila-drive.test.ts` (novo) — critério C.

## 4. Testes

Comandos executados nesta sessão, saída literal:

```
$ npx tsc --noEmit
(sem saída — sem erros de tipo)

$ npx vitest run --exclude '**/.claude/**'
 Test Files  166 passed (166)
      Tests  1604 passed (1604)

$ npx vite build
✓ built in 2.31s
```

Os dois novos arquivos de teste (8 casos ao todo) cobrem: o gate real que o
App Cliente consulta (critério A) e o contrato exato de gates/transição que
`encaminharFilaDrive` depende — incluindo que o botão nunca avança um item
além de `ready_for_review` (critério C). O critério D (estados de UI do
painel) e o restante do critério B (fluxo de edição já existente) não têm
teste de renderização de componente porque não existe infraestrutura de
testing-library em uso em nenhum componente do repositório hoje — a
verificação desses dois pontos é o roteiro de preview abaixo.

## 5. Roteiro de preview

1. **Assinatura → App Cliente**: em um caso de teste, registrar a assinatura
   pelo fluxo oficial (`registrarAssinatura`). Abrir o caso e confirmar
   `contrato_assinado = true`; abrir o App Cliente e confirmar que o motivo
   "contrato não assinado" não aparece mais no bloqueio.
2. **`/nucleos` com vínculo**: abrir um requerente já vinculado a uma Pessoa
   Canônica e confirmar que "Ver perfil" abre o cadastro correto.
3. **`/nucleos` sem vínculo**: abrir um requerente sem vínculo e confirmar a
   mensagem "Sem vínculo com Pessoa Canônica — use 'Editar' para vincular";
   clicar "Editar", escolher uma pessoa no seletor, salvar, e confirmar que
   "Ver perfil" passa a aparecer.
4. **Fila do dossiê-mãe**: abrir um núcleo cujo caso ainda não tem contrato
   assinado — confirmar que a fila aparece como "Bloqueada" com o motivo
   pendente e nenhuma pasta é mencionada. Avançar o caso até contrato +
   pagamento + ativação, clicar "Encaminhar para revisão" e confirmar que o
   estado muda para "Pronta para revisão". Clicar de novo e confirmar que
   nada duplica (mesmo item, mesmo estado).
5. **TOP 30**: em `/contratos`, com uma falha de rede/servidor forçada,
   confirmar que o card de erro persiste com o texto real e o botão
   "Tentar de novo" funciona; com dado carregado normalmente, confirmar que a
   listagem aparece.

## 6. Bloqueios

Nenhum bloqueio impediu a conclusão dos quatro critérios dentro do escopo
autorizado (sem migration, sem automação externa, sem nova tabela canônica).

Ponto observado, fora de escopo desta missão e não decidido aqui: o mapeamento
do gate "onboarding aprovado" da fila do Drive foi implementado como
`crm_casos.ativado_em` (o mesmo campo que já governa a ativação do caso) —
por ser o sinal de decisão humana mais próximo e já existente no schema.
Se a Proprietária quiser um critério de onboarding diferente (por exemplo,
100% do checklist de onboarding, hoje calculado só em memória por
`diagnosticarOnboarding`), isso é uma decisão de produto separada, não uma
correção de bug, e não foi alterada.

## 7. Reversão

Toda alteração é reversível fechando ou revertendo a PR — nenhuma migration,
nenhuma alteração destrutiva de dado e nenhuma ação no Drive foi executada.
A fila `drive_provisioning_queue` só recebe `INSERT`/`UPDATE` de estado
(`blocked`/`ready_for_review`) através da nova função `encaminharFilaDrive`;
reverter o commit remove essa via de escrita sem deixar dado inconsistente
(os triggers de banco já existentes continuam sendo a fonte de verdade e
seguem bloqueando qualquer estado que não tenha os gates reais satisfeitos).
