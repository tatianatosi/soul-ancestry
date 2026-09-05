---
titulo: Execução de desbloqueio operacional total (CA-RECUPERACAO-OPERACIONAL-003)
data: 2026-09-05
branch: claude/ancestral-club-desk-intelligence-0gsoeg
pr: "#85 (draft, mesma branch)"
---

Rotas/abas/ações cobertas: 10/muitas dezenas (ver seção 3 — não é o app inteiro, ver seção 4)
Ações aprovadas após reload: 0 (ver seção 2 — reteste visual real não foi possível nesta sessão)
Bloqueios internos removidos: 0
Convertidos em rascunho/aviso/override: 2 (exceção comercial de SKU; override interno da Proprietária)
Bugs P0 corrigidos e retestados (por teste automatizado + leitura de código/schema, não clique real): 5
Bugs P0 ainda abertos: 0 identificados e não corrigidos nesta sessão
Bugs P1/gaps ainda abertos: ver seção 4
Migrations pendentes que bloqueiam ações: 0 identificadas com impacto nominal confirmado nesta sessão
ADMIN ainda bloqueada: ver seção 4 (não é zero — listado, sem a palavra "pronto")
CLIENTE bloqueado indevidamente ou com vazamento: 0 identificados como pendentes agora (1 bloqueio indevido grave corrigido nesta sessão — item 6 da tabela)
Preview: https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app
Branch / SHA / PR draft: claude/ancestral-club-desk-intelligence-0gsoeg / `44ea44e` / PR #85 (draft)

## 1. O que este documento é

Registro consolidado de toda a correção de código real, testada e publicada nesta branch/PR ao
longo desta madrugada de 05/09 — não um novo mapa, não uma nova auditoria. Cobre o pedido de
CA-RECUPERACAO-OPERACIONAL-003 na parte que é honesta fazer agora: código corrigido, testado
automaticamente e verificado por leitura direta de schema/trigger onde não há acesso de banco ao
vivo nesta sessão.

## 2. O que este documento não consegue provar, e por quê — sem eufemismo

O critério de aceite pedido é clique real no preview: abrir, criar, salvar, recarregar, reencontrar.
Isso continua tecnicamente impossível nesta sessão de automação especificamente — o Chromium desta
sessão não completa nenhuma chamada HTTPS de saída através do proxy do ambiente (testado contra
múltiplos domínios independentes; `curl` e o servidor Node alcançam os mesmos hosts sem problema).
Isso não é um achado sobre o aplicativo publicado — é um limite desta ferramenta de automação. Já
documentado com evidência em `docs/relatorios/2026-09-05_auditoria_admin_e2e_todas_as_telas.md` e
`docs/relatorios/2026-09-05_auditoria_admin_bloqueios_todas_telas.md`; não reaberto aqui.

Por isso "Ações aprovadas após reload" está zerado com honestidade: o reload real, na sua própria
sessão de navegador (que não tem esse bloqueio de rede), é o único jeito de fechar esse critério
específico agora. O roteiro da seção 6 existe exatamente para isso.

## 3. O que foi corrigido nesta madrugada — tabela consolidada

| ID | Área | Rota | Aba/ação | Resultado inicial | Causa técnica | Classificação | Decisão de desbloqueio | Arquivos/commit | Teste automatizado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Contrato → App Cliente | `/casos/$caseId/contrato/preparar` | Assinar contrato | Assinatura gravava `contracts.status="signed"` mas o gate de acesso do App Cliente lia outro campo, nunca atualizado | Bug de wiring (UI×dado real) | P0 | Corrigir a propagação | `contrato-parametros.functions.ts` | suíte de contratos |
| 2 | Núcleos → Pessoa | `/nucleos` | Abrir pessoa do núcleo | Clique não levava a lugar nenhum; `cliente_id` existia no banco e era buscado, mas descartado na tela | Bug de wiring | P0 | Linkar para `/pessoas/$clienteId` | `nucleos.tsx`, `nucleos-desk.functions.ts` — commit `509cdc0` | `nucleos-fila-drive.test.ts` |
| 3 | Núcleos → dossiê-mãe | `/nucleos` | Encaminhar dossiê à revisão | UI não tinha ação real; fila do Drive existia no banco sem consumidor | Gap de wiring | P1→corrigido | Nova ação `encaminharFilaDrive`, nunca auto-aprova | idem | idem |
| 4 | Comercial | `/contratos` | TOP 30 | Painel sumia silenciosamente em qualquer erro | Bug de wiring (estado de erro ausente) | P1→corrigido | Estados carregando/vazio/erro com retry | `painel-top30.tsx` — commit `509cdc0` | `portal-elegibilidade.test.ts` |
| 5 | Onboarding/Ativação | `/onboarding/$id` | Isentar consentimento | Isentar na tela não gravava a exceção formal que o trigger real verifica — ativação continuava recusando | Bug de wiring | P0 | Corrigir a gravação da exceção formal | `onboarding.functions.ts` | suíte de onboarding |
| 6 | App Cliente (CLIENTE, não staff) | Home, detalhe do caso, Documentos, Faturas, Jornada | Ver caso/documento/fatura próprios | **Todo cliente real, sempre, via lista vazia** — caso, documento e fatura nunca apareciam, mesmo liberados | Bug de wiring: filtro de proteção de dado (`filtrarParaCliente`) aplicado contra 3 tabelas que nunca tiveram a coluna de que ele depende | P0 (bloqueio indevido de CLIENTE) | Trocar para `semFixtures`/`ehFixtureLinha`, o sinal que essas tabelas realmente carregam | `portal-cliente.functions.ts`, `portal-jornada.functions.ts` — commit `0ad82af` | `portal-cliente-fixtures.test.ts` (regressão dedicada) |
| 7 | Comercial — preço/SKU | `/casos/$caseId/contrato/preparar` | Preço/SKU não homologado | Bloqueava proposta/contrato sem nenhuma ação disponível, mesmo a regra já prevendo exceção comercial como fonte válida | Processo interno sem override | Convertido | Botão "Assumir exceção comercial" (motivo, preço, condição, validade) | `regra-comercial.functions.ts`, `precos-sku.ts`, `regra-comercial.tsx` — commit `d584af7` | `regra-comercial.test.ts` |
| 8 | Comercial — override interno | mesma tela acima | Registrar/revogar override da Proprietária | Gravação sempre falhava, para todo mundo, desde a criação do módulo — violava CHECK do banco | Bug de wiring | P0 | Corrigir `categoria` para o valor que o banco aceita | `override-proprietaria-comercial.ts/.functions.ts` — commit `d584af7` | `override-proprietaria-comercial.test.ts` |
| 9 | Painel Hoje | `/painel` | Qualquer erro de leitura das filas | Tela ficava com texto vermelho sem nenhuma ação — só F5 resolvia | Erro sem ação (UX, não regra) | P1→corrigido | Botão "Tentar novamente" ligado ao `refetch()` já disponível | `painel-dia.tsx` — commit `be78bbd` | validado por tsc+suíte completa |
| 10 | Ficha do caso, Pessoa 360, Catálogo, Homologação de SKUs | `/casos/$id`, `/pessoas/$clienteId`, `/catalogo`, `/homologacao-skus` | Erro de leitura | Mesmo padrão: erro sem ação; Pessoa 360 confundia "erro de rede" com "pessoa não existe" | Erro sem ação / mensagem errada | P1→corrigido | Novo componente compartilhado `BotaoTentarNovamente` + `EstadoVazio` aceita `acao`; Pessoa 360 agora distingue erro de "não encontrado" | `shell.tsx`, `casos.$caseId.index.tsx`, `pessoas.$clienteId.tsx`, `catalogo.tsx`, `homologacao-skus.tsx` — commit `44ea44e` | validado por tsc+suíte completa |

Todos os itens: `tsc --noEmit` limpo e suíte de testes 100% passando a cada commit (1613/1613 no
último). `vite build` concluído.

## 4. ADMIN ainda bloqueada / CLIENTE ainda bloqueado indevidamente ou com vazamento — sem "pronto"

**CLIENTE**: nenhum bloqueio indevido identificado como pendente agora. O único achado grave desta
categoria (item 6 da tabela) foi corrigido nesta sessão.

**ADMIN — o que não foi coberto ainda, com nome e motivo**, para não virar lista genérica:

- ~~Vários pequenos widgets do Painel Hoje falhavam em silêncio~~ — **corrigido nesta mesma rodada**,
  commit seguinte a este relatório: `fila-sla-operacional.tsx`, `painel-hoje.tsx`, `painel-catalogo.tsx`,
  `pendencias-criticas-pesquisa.tsx`, `painel-formalizacao.tsx`, `catalogo-saneamento.tsx` — todos
  agora mostram erro com "Tentar novamente" em vez de sumir. `conversao.tsx`, `etiquetas.tsx`,
  `divergencias-catalogo.tsx`, `plano-acao.$caseId.tsx` e `fluxo-canonico.tsx` já mostravam a
  mensagem de erro mas sem ação — mesma correção aplicada.
- ~~"Assumir exceção comercial" só estava acessível na tela de preparação de contrato~~ — **corrigido
  nesta mesma rodada**: o mesmo componente (`RegraComercial`, sem duplicar nada) agora também aparece
  no detalhe da proposta em `/propostas`, quando a proposta tem caso vinculado.
- CRM (Leads, Clientes, Pipeline, Timeline, Cadência, Microentregas), Núcleos/Pessoa 360 além do
  vínculo já corrigido, Pesquisa (fontes/evidências/hipóteses/achados), Marketing e Administração
  (usuários/papéis/configurações/integrações) foram auditados em rodadas anteriores desta mesma
  madrugada (ver `docs/relatorios/2026-09-05_desbloqueio_operacional_admin_todas_as_areas.md`, seções
  3–4 e 9) e não tiveram bloqueio interno indevido encontrado — mas não foram re-testados nesta rodada
  especificamente à procura do padrão "erro em silêncio" do item acima. Não estou afirmando que estão
  livres desse padrão especificamente; estou afirmando que não procurei ainda.
- Nenhuma migration pendente com impacto nominal em rota/ação foi identificada nesta rodada. Isso não
  é a mesma coisa que "não existe" — é o estado real da varredura feita até agora.

## 5. Roteiro curto de reteste da Proprietária (preview, não código)

Preview: `https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app`

1. Abrir um caso real → aba de contrato → SKU não homologado → clicar "Assumir exceção comercial" →
   preencher motivo/preço/condição → confirmar → recarregar a página → o preço deve continuar liberado.
2. No mesmo caso, usar "Assumir e liberar mesmo assim" em qualquer gate interno de formalização →
   recarregar → decisão deve persistir, visível no histórico.
3. Abrir `/pessoas/$clienteId` de uma pessoa real → se der erro de rede, o botão "Tentar novamente"
   deve aparecer (antes, a tela dizia só "não encontrada", igual a um erro de verdade).
4. Abrir `/nucleos` → clicar numa pessoa do núcleo → deve abrir a Pessoa 360 real, não ficar parado.
5. Entrar no App Cliente com uma conta de cliente real (não staff) que já tenha documento liberado ou
   fatura emitida → Documentos e Faturas devem mostrar os registros reais agora (antes desta correção,
   apareciam sempre vazios, mesmo liberados).

## 6. Reversão

Toda alteração é reversível fechando/revertendo a PR #85 ou revertendo os commits individuais listados
na tabela. Nenhuma migration foi aplicada, nenhum dado real de cliente foi alterado, nenhuma pasta foi
criada no Drive.
