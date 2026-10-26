# Plano de execução para o lançamento — 26/10/2026

Lê `AUDITORIA-COMPLETA-197-PRS.md` (195 PRs, sem amostragem) e `AUDITORIA-IDIOMA-PT-BR.md`
e prioriza pelo que afeta o lançamento esta semana — não pela ordem em que os
achados apareceram. Dois achados dos relatórios foram **verificados e
descartados** nesta rodada antes de entrar aqui (ver seção 0): não eram lacunas.

## 0. Dois falsos-positivos descartados antes de agir

Os relatórios foram feitos por agentes sem sessão de banco e sem grep pelo
nome da função (só pelo nome do módulo). Dois achados que pareciam graves não
são:

1. **PR #186 / `selo-caso-cliente.ts` não está órfã.** `elementos-mockup.tsx`
   importa e chama `rotuloSeloCaso` (linha 88), e esse arquivo é importado por
   `portal/index.tsx`, `conta.tsx`, `portal-shell.tsx` — todos alcançáveis.
   Já funciona para a Ana. Confirmado por grep do nome da função, não do módulo.
2. **PR #124 ("proposta usa invoices real") não está perdida.** Entregue fora
   da PR: `portal.functions.ts` (`portalProposta`) já lê `invoices` com RLS
   própria. O relatório já tinha descartado este.

Isso deixa o resto da auditoria mais confiável, não menos — os achados que
seguem foram confirmados por grep, não por suposição.

## 1. Executado nesta sessão, antes deste plano (contexto)

- Contrato: PDF/DOCX na tela do instrumento + "Gerar documento com o dado
  atual" (parametriza do cadastro canônico, só preenche vazio, regera a
  prévia persistida antes do download). Commits `bf368f3d`, `fc6d186d`,
  `5900888d`.
- Idioma: 5 valores em inglês traduzidos na tela de contratos (com trava de
  regressão contra o CHECK), "Close"→"Fechar", máscara de CPF unificada na
  decisão de 22/10, 3ª máscara órfã removida. Commit `0fca9cda`.
- `leads.tsx`: troca de lead nunca descarta rascunho sem aviso (3 pontos,
  mesmo guard, sem `window.confirm`). Commit `cf0ab168`.

## 2. Prioridade 1 — afeta o que a Ana vê esta semana (App Cliente)

Confirmado por grep específico da função (não repetindo o erro da seção 0):

| Item | Verificação | Decisão |
|---|---|---|
| **Duas fontes de navegação do App** (`PORTAL_ABAS_CANONICAS` em `portal-navegacao.ts` vs. lista escrita à mão em `portal-shell.tsx:133-141`) | As duas listam os MESMOS 7 rótulos, na mesma ordem — não é uma divergência de conteúdo, é redundância de arquivo. `portal-shell.tsx` já usa `COPY_TELAS` (a copy viva, rastreada nesta sessão). | **Não religar, não apagar.** Trocar a navegação viva do App por um import novo às vésperas do lançamento é risco sem benefício — a tela que a Ana usa já está certa. Registrar classificação (igual ao padrão de `orfaos-classificados.ts`) numa sessão futura, fora da janela de lançamento. |
| **Gate do App Cliente não ligado** (`app-cliente-gate.ts::podeLerConteudo/telasVisiveis` vs. `portal-visibilidade.tsx::useVisibilidade/BlocoVisibilidade`, que é o caminho vivo) | Confirmado: são dois mecanismos paralelos para a mesma decisão. O vivo (`portal-visibilidade.tsx`) é o que hoje decide o que a Ana vê. | **Não trocar o gate agora.** Trocar qual mecanismo decide visibilidade de conteúdo sanitizado é exatamente o tipo de mudança que não se faz sem prova extensa antes de um lançamento real — o custo de errar é expor conteúdo não aprovado a uma família real. Fica para decisão com tempo, não esta semana. |
| **Árvore do cliente: dois motores** (`arvore-cliente-projecao.ts` morto vs. `arvore-publicacao` + `genograma-familiar`, que é o vivo) | O vivo já cumpre a regra do AGENTS.md ("um SVG genograma, sem lista repetida"). O morto não adiciona nada que falte. | **Nenhuma ação.** O motor certo já está no ar. |
| **PR #185 / #194** (documentos reais da Ana — SQL, "aguarda metadado real") | Só migration, nenhum arquivo em `src/`. | **Bloqueado por autorização explícita** (AGENTS.md: sem migration sem autorização). Fora do que posso decidir sozinho — preciso que você diga "autorizo aplicar #185/#194" depois de ver o SQL. |

**Conclusão da Prioridade 1: nenhuma mudança de código era segura executar sem
supervisão nesta janela — e a verificação evitou duas trocas que teriam
risco real (navegação e gate) sem ganho nenhum para a Ana.** O trabalho
certo aqui era verificar, não religar às pressas.

## 3. Prioridade 2 — fila de decisão (não é falta de código, é merge)

Não mesclo PR de terceiro sem sua instrução explícita — são mudanças de
produto concorrentes, não bugs meus para corrigir.

- **Navegação do Desk**: 5 PRs abertas disputando a mesma superfície (#99,
  #111, #112, #115, #116; #119 fechada sem merge). `main` já cumpre a regra
  do AGENTS.md hoje (`SETORES_DESK` única lista) — nenhuma urgência técnica,
  só decisão de qual proposta vira a próxima versão do menu, se alguma.
- **PR #170** (FORCE ROW LEVEL SECURITY em 167 tabelas): PR de segurança de 1
  arquivo SQL, parada há mais de uma semana sem motivo técnico. Recomendo
  mesclar — é estritamente aditivo (idempotente, não cria política nova, não
  afeta `service_role`) — mas migration exige sua autorização explícita por
  escrito no próprio AGENTS.md. Me diga "autorizo #170" e eu concilio
  com `main`, confirmo testes e mesclo.
- **Contrato**: #35 (reconciliação `contratos.$id.tsx`), #40 (remover botões
  redundantes), #173 (histórico do contrato da Ana — só SQL). Mesma regra:
  preciso de autorização para a parte SQL da #173.

## 4. Prioridade 3 — dívida confirmada, sem urgência de lançamento

Real, mas não bloqueia a Ana esta semana:

- **Contrato/Formalização** tem uma camada de painéis inteira fora de rota
  (`painel-instrumentos.tsx`, `painel-preparacao.tsx`, `painel-estado-contratual.tsx`,
  `timeline-contratual.tsx`, `kit-contratual.tsx`, `anexos-tres-camadas.tsx`)
  — é a superfície mais afetada do relatório, mas religar 6 painéis e seus
  motores é trabalho de dias, não de hoje, e não impede o contrato da Ana
  (que usa o caminho que eu já corrigi na Prioridade 0).
- **122 módulos de produção mortos**, concentrados no Painel Hoje antigo
  (16 de 22 componentes, substituídos pela PR #168) e em `src/data/*`
  (13 arquivos de dado fictício formando ilha fechada). Risco real declarado
  pelo próprio relatório: enquanto ficarem no `src/`, um agente futuro pode
  religá-los por engano e vazar dado de família fictícia numa tela real.
  **Isto não se apaga em silêncio** (regra do AGENTS.md — `COMPROVADO_EM_USO`
  antes de arquivar) — fica registrado como pendência de classificação formal,
  não como ação desta semana.
- Pesquisa e Financeiro: lacunas menores, a maioria já classificada em
  `orfaos-classificados.ts` como `AGUARDA_DECISAO` ou `CASCA_DUPLICADA` — ou
  seja, já têm veredicto, só não têm decisão de produto.

## 5. O que fica de fora deste plano e por quê

- **Idioma, Faixa 2 e 3** (qual camada é canônica em `name_variants` vs.
  `research_name_variants`; tradução de vocabulário CHECK) — decisão de
  schema, não código; precisa de você escolher o lado canônico antes de eu
  tocar.
- **Remover papel apaga `user_roles`** — exige migration (coluna de
  arquivamento não existe).
- **Duas máquinas de contrato + preços no código** — decisão de arquitetura
  grande, não cabe "sem aprovação" com segurança.

## 6. Resumo para decidir rápido

Preciso de três "sim" seus para desbloquear o resto, cada um pontual:

1. "Autorizo #170" → concilio e mesclo a PR de segurança parada.
2. "Autorizo #185/#194" (depois de ver o SQL, se quiser) → documentos reais
   da Ana aparecem no App.
3. Uma decisão sobre qual das 5 PRs de navegação do Desk (se alguma) deve
   virar o menu — ou "nenhuma, manter como está".

Sem essas três respostas, não há mais código seguro para eu executar sozinho
nesta fila — o resto é merge de decisão de produto ou migration, as duas
coisas que o seu próprio AGENTS.md trava atrás de autorização explícita.
