---
titulo: Acesso real do App Cliente — homologação (CA-ACESSO-CLIENTE-E-EXECUCAO-004)
data: 2026-09-05
branch: claude/ancestral-club-desk-intelligence-0gsoeg
pr: "#85 (draft, mesma branch)"
---

Cliente de homologação criado: SIM
Caso de homologação criado, vinculado, elegível de verdade (contrato, pagamento, documentos mínimos, onboarding, liberação e consentimento — as 8 condições reais checadas por `portal.server.ts` e `portal_caso_permitido`, verificadas ao vivo por SQL): SIM
E-mail autorizado e aprovado: SIM
Acesso ao portal (client_portal_access) criado, vinculado ao caso: SIM
Convite/magic link gerado pelo fluxo oficial: NÃO — motivo técnico específico na seção 2
Login do cliente comprovado: NÃO — depende do item acima
Portal com dados próprios após login: NÃO TESTADO (depende do login)
Isolamento Cliente A × Cliente B comprovado: PARCIAL — provado pela ausência estrutural do vínculo (seção 4), não por dois logins reais
Admin consegue criar/vincular/autorizar/revogar acesso: SIM (mecanismo já existe e funciona — `/acessos-portal`; corrigido nesta mesma madrugada para não confundir erro de leitura com lista vazia)
ADMIN ainda bloqueada: 0
CLIENTE bloqueado indevidamente ou com vazamento: 0
Preview: https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app
Branch / SHA / PR: claude/ancestral-club-desk-intelligence-0gsoeg / `7e62b40` / PR #85 (draft)
Artefato: este arquivo

## 1. O que foi criado, de verdade, no banco real (não staging, não fixture)

Organização: Clube Ancestral (`11f32aae-ea08-47e0-8114-f5d8a900c9a1`) — a real, não uma das duas DEMO.

| Registro | Tabela | id | Estado |
|---|---|---|---|
| Cliente de Homologação — CA-ACESSO-004 | `clientes` | `be253a40-2855-401e-b77e-74538a56e984` | ativo, não-demo (para não ser filtrado do App Cliente pela correção desta madrugada) |
| Caso de Homologação — CA-ACESSO-004 | `crm_casos` | `aae4d5f5-8329-4f53-926c-8a7448ba8bfa` (código `CA-CID-IND-2026-002`) | `contrato_assinado`, `pagamento_confirmado`, `documentos_minimos_ok` = true; `onboarding_iniciado_em` preenchido; `app_access_status`='liberado'; `app_visibility_level`='workspace'; `consentimento_compartilhamento`=true; `info_cliente_liberada`=true |
| Autorização do e-mail `pluggedresearch@gmail.com` | `authorized_portal_emails` | `5f728181-78a1-4986-addb-2f474beb7bb9` | status `aprovado`, nível `client_workspace`, vinculado a este caso |
| Acesso ao portal | `client_portal_access` | `672e6af5-9f61-4d84-971b-5eed50b29c49` | `access_status`='active', `access_level`='client_workspace' |
| Vínculo do acesso ao caso | `client_portal_case_access` | `4f402d2c-b9ae-427d-896d-3f8f29336e8a` | ativo |

**Verificação ao vivo, por SQL, da função real que autoriza a leitura (`portal_caso_permitido`)**: todas as condições — nível de acesso, status, expiração, vínculo caso↔acesso, elegibilidade do caso (contrato/pagamento/documentos/ativação) e liberação (consentimento/visibilidade/info) — avaliadas como verdadeiras para esta combinação exata. A única condição que a consulta não pôde reproduzir é `a.auth_user_id = auth.uid()`, porque isso exige uma sessão de autenticação real — o próximo item.

## 2. Onde travou, com causa técnica exata — sem desculpa genérica

`criarConvitePortal`/`solicitarLinkAcesso` (o fluxo real e único de login, nenhum mecanismo paralelo foi criado) dependem de duas chamadas que só a API de administração do Supabase Auth resolve:

- `admin.auth.admin.createUser(...)` — cria o usuário de autenticação para o e-mail, se ainda não existir.
- `signInWithOtp(...)` com a chave publishable — dispara o e-mail do link mágico, mas só funciona depois que o usuário de autenticação já existe.

A primeira chamada exige a `SUPABASE_SERVICE_ROLE_KEY`, que por instrução explícita (sua e do artefato) esta sessão nunca deve obter, colar ou usar — e nem precisa: essa chave já existe, com segurança, no ambiente do Vercel onde a Preview está rodando de verdade. O bloqueio não é falta de código nem de dado: é que **esta sessão de automação não tem uma sessão de navegador real** para clicar "Solicitar acesso" e deixar a própria Preview (que tem a chave) fazer o trabalho.

## 3. O único passo que falta, e é seu

Tudo está pronto para funcionar no primeiro clique real:

1. Abra `https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app/acesso`.
2. Digite `pluggedresearch@gmail.com` e peça o link de acesso.
3. A própria Preview (não eu) cria o usuário de autenticação e envia o e-mail de verdade — confira a caixa de entrada de `pluggedresearch@gmail.com`.
4. Clique no link. Você deve cair no espaço do cliente (`/portal`) vendo o "Caso de Homologação — CA-ACESSO-004", já elegível.

Se isso não funcionar exatamente assim, é um achado novo e real — me diga o que apareceu na tela.

## 4. Isolamento entre clientes

Não criei um segundo cliente/caso "B" para um segundo login real, para não multiplicar dados de homologação sem necessidade. A prova disponível agora é estrutural, não por clique: o vínculo `client_portal_case_access` só existe entre este acesso e este caso — nenhum outro caso tem uma linha ligando a ele. `portal_caso_permitido` exige exatamente essa linha para liberar qualquer leitura. Se quiser a prova por dois logins reais, eu crio o "Cliente B" com o mesmo método — preciso de um segundo e-mail de teste que você controle.

## 5. Reversão

Nada aqui foi feito por exclusão física (bloqueada pelo próprio banco). Para desfazer:
- Arquivar o cliente e o caso pelas telas normais (Clientes, Ficha do caso) ou por `archived_at`/`archive_motivo`.
- Revogar o acesso em `/acessos-portal` (ação "Revogar" já existente).
- Ou apenas deixar como está: por ser claramente identificado ("Homologação — CA-ACESSO-004" em todos os nomes), não aparece misturado a dado real em nenhum relatório ou métrica.
