# CA02-CRM-VIVO-PAINEL-CALLS — execução (09/09/2026)

## Missão

Transformar o Painel de Calls (`/calls`) numa mesa de Discovery: o problema era "formulário sobre formulário e perguntas SPIN sem local evidente para resposta/destino". Sem reconstruir CRM, Caso, Planejador ou App — só o Painel de Calls.

## O que existia (achado, não corrigido em rodada anterior)

- `PainelCalls` tinha DUAS seções sobrepostas para os mesmos campos: "Qualificação preliminar" (grade de selects) e, logo abaixo, "Roteiro vivo de Discovery" — mas este último era só uma LISTA ESTÁTICA de perguntas, sem nenhum controle de resposta ao lado. A pessoa lia a pergunta ali e tinha que procurar o campo correspondente em outro lugar da tela.
- Vários campos do próprio roteiro (`objetivo`, `nacionalidades_interesse`, `pais_linha_prioritaria`, `estrutura_familiar`, `requerentes_potenciais`, `localidades_conhecidas`, `documentos_chave`, `status_via`, `trilha_referencia_id`, `marco_referencia_id`, `exige_idioma_entrevista`, `pesquisa_previa_autorizacao`, `pesquisa_previa_escopo`, `area_responsavel`) não tinham NENHUM controle no Painel de Calls — só apareciam como texto de pergunta, sem onde responder. Achado: a tela `/leads` (CRM de leads) já tinha esses campos com formulário completo, incluindo `MultiSelecao` e o contexto de trilha/marco jurídico — só não estavam no Painel de Calls.
- A Varredura de WhatsApp (achados candidatos, com trecho de evidência) já existia, mas era uma lista solta no topo da tela, sem nenhuma ligação com o campo do formulário que ela respondia.
- `elegibilidade_preliminar` (o sinal-síntese da qualificação) não estava em nenhum bloco do roteiro — ficava fora, sem pergunta, sem card.
- `proxima_acao`/`proxima_acao_em` apareciam duplicados em "Registro da call" E no bloco "decisão" do roteiro.

## O que foi feito

1. **`MultiSelecao` virou componente compartilhado** (`components/caso/campos.tsx`), usado por `/leads` e agora por `/calls` — antes só existia localmente em `leads.tsx`.
2. **`discovery-roteiro.ts`** ganhou `META_CAMPO_ROTEIRO` (por que importa, destino, consequência e tipo de controle, um por campo) e `ROTULO_CAMPO_ROTEIRO` (rótulo humano), cobrindo os 28 campos citados nos 5 blocos — nenhum campo novo, só o metadado que faltava para virar card. `elegibilidade_preliminar` foi adicionada ao bloco "Decisão e próximo passo" (correção de omissão, não campo novo). Nova função pura `estadoResposta()` deriva confirmado/informado-a-confirmar/hipótese/pendente sem persistir nada além do que já existe.
3. **`VarreduraWhatsApp`** ganhou uma prop opcional `onAchadosMudaram` — mesma varredura, mesma promessa de não persistir a conversa, só passa os achados para quem envolve a tela.
4. **`PainelCalls` reescrito**: a antiga "Qualificação preliminar" e a antiga lista estática viraram UMA seção "Roteiro vivo de Discovery" — um card por campo, dentro do bloco/pergunta correspondente, com: por que importa, o controle de resposta real (select/multi-seleção/texto/número/data/trilha/marco, cada um com o catálogo já existente), selo de estado, achado de WhatsApp (quando houver) com Confirmar/Virar hipótese/Ignorar, contexto interno resumido de trilha/marco jurídico (mesmo aviso de "uso interno, nunca ao App" já usado em `/leads`) e a frase de destino/consequência. Campo repetido entre blocos (`proxima_acao`, `responsavel_nome`, `estrutura_familiar`, `requerentes_potenciais`) aparece uma única vez, no primeiro bloco em que surge — fecha a duplicação. `proxima_acao`/`proxima_acao_em` saíram de "Registro da call" (ficam só no card de decisão).
5. **Consequência real (item 6)**: botão "Criar/atualizar tarefa desta próxima ação" no card de decisão, habilitado só quando o lead já tem `case_id` e a próxima ação tem prazo — reusa `salvarTarefa` (já deduplicado por caso+título+status, de rodada anterior), sem escritor novo. Antes do handoff, a própria "próxima ação" do lead é o registro; tarefa só faz sentido depois que existe caso.
6. **Salvar rascunho continua sem exigir o roteiro inteiro** (item 7) — o botão "Gravar registro da call" nunca dependeu de completude do roteiro; confirmado, não alterado.

## Testes

`src/lib/__tests__/discovery-roteiro.test.ts` (7 testes novos): todo campo do roteiro tem metadado de card completo, tem rótulo, todo campo `select` tem catálogo real de opções (nunca controle vazio), `elegibilidade_preliminar` agora está no roteiro, e as 4 combinações de `estadoResposta`. `src/lib/__tests__/painel-calls-roteiro-vivo.test.ts` (novo, 10 testes): formulário duplicado removido, dedupe de campo repetido presente, salvar-rascunho não exige roteiro completo, achado chega ao card certo e nunca duplica a conversa em observação, ações confirmar/virar hipótese/ignorar presentes, tarefa reusa `salvarTarefa` (nenhum escritor novo) só quando há caso e prazo real, contexto de trilha/marco com o aviso de não-exposição ao App, grid responsivo (uma coluna no celular). `npx tsc --noEmit`, `npx vitest run` (182 arquivos, 1735 testes) e `npx vite build` — todos limpos.

Não testado nesta rodada (requer navegador real): reload persistindo resposta salva, uso tátil em tela pequena.

## Pendências (0 de até 5)

Nenhuma lacuna nova encontrada fora do escopo desta missão.
