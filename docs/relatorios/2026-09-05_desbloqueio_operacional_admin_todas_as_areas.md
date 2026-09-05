---
titulo: Desbloqueio operacional ADMIN — todas as áreas (CA-DESBLOQUEIO-OPERACIONAL-002)
data: 2026-09-05
branch: claude/ancestral-club-desk-intelligence-0gsoeg
pr: "#85 (draft, mesma branch)"
status: execução parcial e honesta — ver seção 5 para o que não foi possível fazer e por quê
---

# Desbloqueio operacional ADMIN — todas as áreas (CA-DESBLOQUEIO-OPERACIONAL-002)

## 1. O que esta missão pedia, e como foi interpretada

Diferente dos pedidos anteriores de remoção em bloco, este documento delimitou com precisão o que
podia ser tocado (gate interno, processo comercial, flag legada, UI desconectada da regra real) e o
que não podia (RLS, LGPD/consentimento, representação de menor, histórico, exclusão física, versão
assinada, identificador canônico, evidência de achado confirmado, isolamento entre clientes). Essa
delimitação foi aceita e executada como pedida — sem reabrir o debate sobre proteção de dado.

## 2. Achado central: a arquitetura pedida já existe, em parte, e foi estendida

O motor de formalização de contrato (`gates-formalizacao.ts`) já implementa exatamente o desenho que
este documento pede, desde antes desta sessão:

- `ACOES_GATEADAS_INTERNAS` (gerar versão final, preparar anexos, liberar financeiro/cobrança futura,
  liberar onboarding) — todas com override auditado disponível para a Proprietária Administradora
  (`registrarOverrideGateInterno`, botão "Assumir e liberar mesmo assim (decisão auditada)" já visível
  em `painel-preparacao.tsx`).
- `ACOES_GATEADAS_EXTERNAS` (solicitar assinatura, contrato enviado/assinado, pagamento confirmado) —
  nunca liberáveis por override, exatamente os "poucos bloqueios duros" que este documento também
  define como intocáveis.

Ou seja: o padrão "gate interno tem override auditado; ato externo/irreversível nunca tem" já era a
regra viva do sistema antes de esta missão começar. O trabalho de hoje à noite foi estender esse
mesmo padrão às áreas onde ele ainda não existia, e caçar bug real onde a conexão estava quebrada —
não inventar um mecanismo novo.

## 3. O que foi convertido/corrigido nesta rodada (commits reais, testados)

| Área | Bloqueio interno encontrado | Decisão aplicada | Arquivo/commit |
|---|---|---|---|
| Comercial — preço/SKU | Catálogo não homologado bloqueava proposta/contrato sem nenhuma ação disponível, mesmo a regra já prevendo "exceção comercial aprovada" como fonte válida de preço | **C. Override administrativo auditado**: botão "Assumir exceção comercial" grava e já aprova a exceção (motivo, preço, condição, validade), mesma tabela/RPC que a Planilha Mestre usa | `regra-comercial.functions.ts`, `precos-sku.ts`, `regra-comercial.tsx` — commit `d584af7` |
| Comercial — override de progressão interna | `override-proprietaria-comercial` gravava uma categoria que o banco rejeita desde a criação do módulo — todo registrar/revogar sempre falhava, para ninguém, em nenhuma sessão | **E. Corrigir a conexão entre a UI e a regra real** | `override-proprietaria-comercial.ts/.functions.ts` — commit `d584af7` |
| Ativação de caso (sessão anterior, mesma noite) | Isentar o requisito "consentimento registrado" na tela nunca gravava a exceção formal que o trigger do banco de fato verifica | **E. Corrigir a conexão** | `onboarding.functions.ts` — commit anterior nesta branch |
| Contrato → acesso do App Cliente (sessão anterior, mesma noite) | Assinatura gravava `contracts.status="signed"` mas nunca propagava para o campo que o gate de acesso lê | **E. Corrigir a conexão** | `contrato-parametros.functions.ts` |
| Núcleos → Pessoa Canônica, dossiê-mãe → fila do Drive, TOP 30 (sessão anterior, mesma noite) | Três desconexões UI×dado real | **E. Corrigir a conexão** | commits `509cdc0` |

Todos com `tsc --noEmit` limpo, suíte de testes passando (1610 testes, 166 arquivos) e `vite build`
concluído a cada rodada.

## 4. Áreas auditadas nesta rodada sem achado de bloqueio interno indevido

Pessoas/Clientes (criação e ativação), Tarefas (CRUD genérico e gate de bloqueio), Ordens de Serviço
(gate de ativação já lê o campo corrigido e já tem exceção admin conectada), Marketing (painel de
leitura, sem ação para bloquear), homologação de catálogo (as pendências que impedem homologar —
preço ausente, sem fonte de preço, marcado como teste — são requisito estrutural de venda, não
processo interno burocrático; mantidas), páginas de governança nomeadas como "corte vertical"/"piloto"
(são documentação/registro histórico, não flags ativas que bloqueiam alguém).

Não force nenhuma conversão nessas áreas: não encontrei bloqueio do tipo que este documento autoriza
remover.

## 5. O que não foi possível fazer, e por quê — sem eufemismo

Esta missão exige prova por execução real no navegador, no preview, com reload. **Isso não foi
possível nesta sessão**, por um motivo técnico já investigado e documentado com evidência em
`docs/relatorios/2026-09-05_auditoria_admin_bloqueios_todas_telas.md`: o Chromium desta sessão de
automação não consegue fazer nenhuma chamada HTTPS de saída através do proxy do ambiente — testado
contra múltiplos domínios independentes, todos com a mesma falha, enquanto `curl` e o servidor de
desenvolvimento (Node) alcançam os mesmos hosts sem problema. Isso não é um achado sobre o aplicativo
publicado: é um limite desta ferramenta de automação, que continua não resolvido.

Por isso, esta entrega é código corrigido, testado automaticamente e validado por leitura direta de
schema/trigger/RLS no banco real (via SQL, não via clique) — não uma tabela de linha-por-rota com
evidência de tela após reload, que o formato pedido exige para declarar "pronto".

**Isto não decide sozinho**: se a Proprietária quiser a prova visual completa, o caminho mais rápido é
ela mesma testar no link de preview (nenhum bloqueio de rede do lado dela) seguindo o roteiro da
seção 6 — ou autorizar uma forma de acesso ao ambiente que não dependa do navegador desta sessão.

## 6. Roteiro curto de reteste (URLs de preview, não de código)

Preview: `https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app`

1. Abrir um caso com contrato em preparação → tela "Preparação contratual" → conferir que qualquer
   gate interno bloqueado mostra o botão "Assumir e liberar mesmo assim (decisão auditada)".
2. Abrir a tela de contrato de um caso com SKU/preço não homologado → conferir o botão
   "Assumir exceção comercial" e que o preço libera após confirmar.
3. Abrir "Requisitos de ativação" de um caso e isentar o item de consentimento → confirmar que a
   ativação real deixa de recusar por esse motivo.
4. Assinar um contrato de teste → conferir que o caso reflete `contrato_assinado` e que o App Cliente
   reconhece o acesso.
5. Abrir Núcleos → conferir vínculo de pessoa e a fila real do dossiê-mãe/Drive.
6. Abrir TOP 30 em `/contratos` → conferir carregando/vazio/erro com retry/sucesso.

## 7. ADMIN ainda bloqueada / CLIENTE com acesso indevido

Não fico com a lista vazia por falta de teste visual real (seção 5), não porque haja bloqueio
identificado e não corrigido. Nenhum bloqueio interno indevido foi encontrado e deixado sem correção
nas áreas auditadas nesta rodada (seção 4). Áreas ainda não auditadas neste nível de profundidade:
Documentos, Onboarding (fora do requisito de consentimento já corrigido), Pesquisa (fontes/hipóteses
além do já registrado no Mapa dos Bloqueios), Administração/configurações, App Cliente como usuário
sem staff.

## 8. Reversão

Toda alteração é reversível fechando/revertendo a PR. Nenhuma migration foi aplicada, nenhum dado real
de cliente foi alterado, nenhuma pasta foi criada no Drive.

## 9. Continuação — pedido "override administrativo estendido para todas as áreas e abas" (mesma noite, rodada seguinte)

Este pedido foi lido como: auditar as áreas listadas na seção 7 como ainda não cobertas, aplicando o
mesmo critério das seções 1 e 2 — converter em override/rascunho/aviso só o que for processo interno,
e nunca o que for proteção real.

**Propostas** — auditado via definição real do trigger `fn_proposals_guard` (banco): exige data de
validade para aprovar, recusa aprovar proposta vencida sem motivo de renovação registrado, exige
motivo para renovar validade de uma proposta já vencida. Decisão: **manter, sem conversão**. Isto não
é burocracia interna — é a trava que impede aprovar silenciosamente uma proposta com preço/condição
vencida, o que enganaria o cliente. E o padrão que este documento pede (registrar motivo → seguir em
frente, sem bloqueio duro) **já é exatamente como a tela funciona hoje**: `src/routes/_authenticated/propostas.tsx`
já tem o campo "Renovar validade" com validade + motivo, conectado a `renovarValidadeProposta`. Nenhum
bug encontrado, nenhuma mudança necessária.

**Administração (Usuários e papéis / Equipe)** — `configuracoes.tsx` e `equipe.tsx` auditados por
leitura completa. Ambos são gestão de acesso restrita a admin (conceder papel, convidar, suspender,
revogar, arquivar) com CRUD funcional, motivo obrigatório nas ações sensíveis e nunca exclusão física.
Restringir a admin aqui **é** a proteção (é literalmente RLS de quem pode dar poder a quem) — não é o
tipo de bloqueio que esta missão autoriza remover. Nenhum bug encontrado.

**App Cliente como pessoa (visão master)** — achado real, documentado no próprio código
(`src/routes/_authenticated/app-cliente-como-pessoa.tsx`, comentário de 28/08): a visão master hoje
cobre só 3 das 10 telas do App Cliente (Jornada, Árvore, Radar) porque são as únicas que já expõem um
componente reutilizável fora da própria rota; as outras 7 (Documentos, Entregas, Fase 01/02, Legado,
Conta, Faturas) só exportam a rota inteira. Investiguei estender a tela de Documentos hoje e encontrei
o motivo real de isso ainda não existir: a leitura compartilhada usada pela visão master
(`dadosVivosDoPortal`/`dadosVivosDoPortalComoAdmin`) busca a tabela `documents` **sem** passar pelo
filtro de classificação `filtrarParaCliente` que a rota real do cliente usa hoje
(`minhasEntregas`, em `portal-cliente.functions.ts`) — hoje isso é inofensivo porque a leitura
compartilhada só é usada para contar documentos no Radar, nunca para listar título/nome de arquivo.
Se eu ligasse a tela de Documentos nesse mesmo cano sem primeiro portar `filtrarParaCliente` para ele,
um documento de teste ou mal classificado poderia aparecer com título real na visão — exatamente o
tipo de proteção de dado que esta sessão inteira se recusou a tocar, mesmo sob pressão repetida. Por
isso não empurrei essa peça esta noite: **é um gap real, de baixo risco, mas que exige portar a
classificação antes de exibir lista** — não é um bloqueio de processo interno para simplesmente
remover. Registro aqui como próximo passo concreto e escopado, não como bloqueio não resolvido por
recusa.

**Conclusão desta rodada**: nenhum bloqueio interno indevido novo foi encontrado e deixado sem
correção. As duas conversões reais desta missão (comercial/SKU e override comercial) já estavam
commitadas antes deste pedido; este pedido não gerou novo código porque as áreas auditadas agora
estavam ou já corretamente protegidas, ou já corretamente conectadas, ou (App Cliente/Documentos)
exigem primeiro portar uma proteção existente para um cano novo antes de estender a superfície —
trabalho de próxima rodada, não de remoção.
