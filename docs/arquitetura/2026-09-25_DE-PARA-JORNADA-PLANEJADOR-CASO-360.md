# De-para — Jornada do Planejador no Caso 360 (P4)

- Data: 2026-09-25
- Ordem: "P4 — Executar e publicar: Jornada do Planejador no Caso 360" (aprovada, publicação em `main`).
- Estado: código, teste e migration aplicados; **falta a prova autenticada** da Proprietária no Lovable. Nada promovido a `IMPLEMENTADO_EM_FLUXO_REAL`.

## 1. O gap real (antes)

`case_plans` já tinha **todos** os campos pedidos — Produto-Pai (`produto_pai_id`, PP-01–09), país/via (`rota_confirmada`), etapa (`etapa`), marco (`marco_atual`), responsável (`responsavel_user_id`), bloqueio (`motivos_bloqueio`, já espelhado pelo gate D7/onboarding), próxima ação (`proxima_acao`/`prazo_proxima_acao`) e micro-entrega (`proxima_microentrega`, já escrita pelo reconciliador D7 do P3). O que faltava não era schema — era **leitor**.

A única tela que tocava esses campos era `PlanejadorOperacional` (`src/components/contrato/planejador-operacional.tsx`): um formulário que abre fechado, pede tudo de novo em texto livre e grava uma **versão nova** de `case_plans` via `sincronizarPlanejador` (hash + `versao`, elo 1 da cadeia comercial). Depois de salvo, nada na tela mostrava o que ficou persistido — escrever no escuro, sem reload, sem origem do dado.

`case_plans.product_catalog_id` (SKU do plano — diferente do SKU técnico de `case_services` que `AbaProdutoTrilha` já edita) já alimentava a proposta (`materializarProposta`) mas só como item informativo de um checklist (`contrato-checklist-pre.ts`), nunca como gate — a condição 4 do P4 já valia antes desta execução.

## 2. O que foi construído

**Módulo puro** `src/lib/jornada-planejador.ts`: `bloqueiosDoPlano` (normaliza `motivos_bloqueio` jsonb), `patchJornada`/`jornadaMudou` (só os 7 campos editáveis), `prazoValido`, `origemJornada` ("Atualizado por X em dd/mm/aaaa (versão N)").

**Servidor** `src/lib/jornada-planejador.server.ts` (lógica testável) + `jornada-planejador.functions.ts` (wrappers finos `createServerFn`):
- `lerJornadaDoCaso`/`lerJornadaPlanejador`: lê a última linha não arquivada de `case_plans` do caso, resolve nome do responsável (`profiles`) e rótulo do Produto-Pai (`PRODUTOS_PAI_CANONICOS`), lê o SKU só para exibir (nunca gate). Sem plano: devolve `existe:false` — não cria nada.
- `salvarJornadaDoCaso`/`atualizarJornadaPlanejador`: grava só os 7 campos da jornada (`etapa`, `rota_confirmada`, `produto_pai_id`, `marco_atual`, `responsavel_user_id`, `proxima_acao`, `prazo_proxima_acao`) via `gravarComVerificacao` na linha **existente** — **nunca cria linha, nunca toca `plano_hash`/`versao`/`status`**. Sem plano: recusa com mensagem clara ("preencha o planejador primeiro"), não finge persistência. Mesmo padrão do reconciliador D7 do P3 (`d7-microentrega.server.ts`), que já grava `proxima_microentrega` direto na linha sem entrar na máquina de versão.

**UI** `src/components/caso/jornada-planejador.tsx` (`<PainelJornadaPlanejador>`), montada em Caso 360 **antes** de `PlanejadorOperacional` (que continua existindo, sem mudança). Mostra e edita os 7 campos, mais bloqueio (só leitura) e próxima micro-entrega (só leitura, com link para Ops). Rodapé: origem do dado (quem/quando/versão). Salvar invalida a query e relê — prova de reload embutida na própria tela.

## 3. SKU nunca é gate (item 4)

O SKU informativo do plano (`product_catalog_id`) aparece como texto só leitura no cartão, com link para a seção "Produto-pai e trilha técnica" (onde o SKU técnico de `case_services` já é editado). O cartão renderiza e permite editar etapa/marco/responsável/próxima ação mesmo sem nenhum SKU definido — nunca bloqueia a leitura nem a escrita dos demais campos.

## 4. App — decisão sobre "próximo marco" e "pendência humana" (item 5)

`case_plans` está na lista `TABELAS_PROIBIDAS` do teste de fronteira do App (`app-fronteira-pessoa-unificada-2026-09-24.test.ts`) — o App nunca lê a tabela direto, só a view sanitizada `portal_casos`.

`marco_atual` é **texto livre de uso interno** (ex.: "D0 — boas-vindas e alinhamento"), sem vocabulário controlado. Em nenhum ponto do App, até hoje, um texto digitado pelo staff chegou cru ao cliente — etapa vem de `fase_jornada` (enum fechado de 8 valores, `etapaDoCasoCliente`), a próxima entrega (P3) é só uma data. **Decisão da Proprietária**: não expor `marco_atual` cru nesta rodada. "Próximo marco" fica Desk-only — gap intencional, não arquivado, à espera de um passo de curadoria/publicação (como o P4 declara: "se schema faltar, não fingir persistência" — aqui o schema existe, mas falta a etapa de sanitização que o padrão do App exige).

"Pendência humana" foi implementada com o **mesmo padrão** já usado para documento/pagamento pendente: um **booleano**, nunca o texto. Migration `20260925130000_portal_casos_pendencia_cliente.sql` recria `portal_casos` idêntica à de `20260925120000` (mesmas reloptions, mesmo filtro `portal_caso_permitido`) e acrescenta `pendencia_cliente_pendente` = true quando o plano ativo do caso tem `dependencias_cliente` não vazio (`cardinality(...) > 0`). `motor-caso.ts#projetarProximaAcaoCliente` ganha um novo nível fixo, entre pagamento pendente e "equipe avançando": *"Há uma pendência que depende de você — a equipe vai detalhar no próximo contato."* Nenhum texto de `case_plans` atravessa a fronteira.

Aplicada em 25/09/2026 pelo conector do Lovable e registrada em `schema_migrations`. Conferido: reloptions `{security_barrier=true,security_invoker=false}`, 18 colunas (a nova no fim), sem `SELECT` para `anon`. O leitor do App relê sem a coluna se um banco mais antigo ainda não a tiver (mesmo padrão tolerante do P3).

## 5. O que não mudou

- `sincronizarPlanejador`/`PlanejadorOperacional`: intactos, sem alteração de comportamento.
- `AbaProdutoTrilha`/`case_services`: SKU técnico, tabela diferente, sem alteração.
- Versionamento/hash de `case_plans`: intacto — a jornada nunca cria versão nova.
- Nenhuma RLS alterada, nenhuma tabela nova.

## 6. Achado à parte, não tocado (fora do escopo do P4)

`npx tsc --noEmit` na baseline (`origin/main`, antes desta execução) já falhava em `src/routes/portal/index.tsx` (`<PainelHomeMockup>` recebendo `identidade`/`statusRotulo`/`marcos`/`casoCodigo`/`fase`/`composicao`, que o componente não aceita mais) — drift introduzido por commits do Lovable ("Adequou UI do App Cliente", "Preparou prévia com cortes visuais") depois do push do P3. Confirmado por reprodução em worktree limpo, sem nenhuma mudança do P4: o mesmo erro de tipo e as mesmas 7 suítes/11 testes falham (`a4-arvore-conectadas-de-31`, `a4-arvore-ligacao-jornada`, `app-isolamento-por-caso`, `app-sem-texto-tecnico-interno`, `composicao-caso-home-jornada`, `d18-biblioteca-mestre-conteudo-editorial`, `entrega-1-sistema-visual-app-home`) — todos sobre o sistema visual do App Cliente (Home/Árvore/Radar), nenhum sobre `case_plans`/planejador. Não fiz nenhuma correção ali: é dívida de outro agente, em outro escopo, e mexer sem pedido seria "corrigir a realidade inventando" fora do que foi autorizado aqui. Declarado, não escondido.

## 7. Testes

`src/lib/__tests__/p4-jornada-planejador-2026-09-25.test.ts` (18 casos): regras puras; leitura sem plano (`existe:false`, nada criado) e com plano (todos os campos, incluindo bloqueio e micro-entrega); escrita recusa sem plano e com prazo mal formado; escrita grava só os campos enviados e nunca toca `versao`/`plano_hash`/`status`; reenviar sem mudança não duplica timeline; SKU nunca condiciona leitura/escrita dos demais campos; Caso 360 monta o painel antes do formulário grande; fronteira do App continua sem `case_plans`; migration expõe só um booleano; frase de pendência é fixa e respeita a prioridade (documento > pagamento > pendência do plano > "equipe avançando"). Ajustado `motor-caso.test.ts` (5 literais ganharam o novo campo obrigatório `pendenciaClientePendente`, comportamento inalterado).

## 8. Prova no Lovable (sessão autenticada da Proprietária)

1. Caso 360 → Jornada → cartão "Jornada do planejador": deve mostrar o Produto-Pai, país/via, etapa, marco atual, responsável e próxima ação já persistidos (se o formulário grande já foi preenchido alguma vez neste caso).
2. Mudar etapa e marco atual, clicar "Gravar jornada". Aviso de sucesso; recarregar a página.
3. Conferir: os novos valores persistem, e o rodapé mostra a mesma versão de antes (não criou versão nova) — a prova de que a edição pontual não entrou na máquina do formulário grande.
4. Conferir o cartão de bloqueio: deve mostrar o que já vem do gate D7/onboarding, sem inventar nada novo.
5. App (cliente com acesso ao caso): Home/Jornada devem mostrar só a etapa (rótulo fixo) e, se o plano ativo do caso tiver `dependencias_cliente` preenchida, a frase "Há uma pendência que depende de você" — nunca o texto que o Desk escreveu.

Prints: inicial, ação, confirmação, releitura e integração, em `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.
