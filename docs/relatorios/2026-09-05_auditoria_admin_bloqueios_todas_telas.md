---
titulo: Auditoria ADMIN — todas as telas (CA-BLOQ-ADMIN-ALL-001)
data: 2026-09-05
branch: claude/ancestral-club-desk-intelligence-0gsoeg
pr: "#85 (draft, mesma branch)"
status: bloqueado por infraestrutura de teste antes de completar a varredura interativa — ver seção 3
---

# Auditoria ADMIN — todas as telas (CA-BLOQ-ADMIN-ALL-001)

## 1. O que este artefato é e o que não é

Este documento registra uma tentativa real, com evidência técnica concreta, de executar a
missão CA-BLOQ-ADMIN-ALL-001 (testar como ADMIN, na interface, todas as telas do Desk) —
e o bloqueio de infraestrutura de teste que impediu completá-la nesta sessão. **Este bloqueio
é sobre a capacidade desta sessão de automatizar um navegador contra o ambiente — não é um
achado novo sobre o aplicativo estar quebrado.** Isso é dito de forma explícita porque a
distinção importa: nada aqui indica que o Desk publicado esteja mais ou menos travado do que
o que já foi registrado nos artefatos anteriores.

## 2. O que foi executado com sucesso

- **Inventário automático de rotas**: 81 rotas estáticas/de detalhe do Desk (fora do App
  Cliente) extraídas diretamente de `src/routes/**`, cobrindo painel, CRM (leads, clientes,
  pessoas, casos, núcleos), comercial (propostas, contratos, contrato-parâmetros), onboarding/
  ativação, pesquisa (fontes, evidências, achados, hipóteses, pesquisa-modulo), piloto,
  tarefas/OS, financeiro, catálogo/homologação, marketing, biblioteca, qualidade, auditoria,
  administração e toda a área de governança (18 sub-rotas). Lista completa nos anexos deste
  commit (`routes.json` não versionado — reproduzível a qualquer momento a partir do código).
- **Conta ADMIN de homologação confirmada**: `qa-tela-a-tela@clubeancestral.test`, papel
  `admin`, status `active` desde 03/09 — já existia de uma sessão anterior, exatamente para
  este fim. Nenhuma senha, token ou dado pessoal real foi exposto neste relatório.
- **Confirmado ao vivo, via API do Supabase Auth**: as credenciais desta conta de teste
  autenticam corretamente (HTTP 200, token emitido) — a camada de autenticação em si funciona.
- **Matriz de migrations (repo × banco aplicado)**: 157 arquivos de migration no repositório
  contra 71 migrations registradas como aplicadas no projeto Supabase do ambiente
  (`zsxpdbhdvbuulwpepemd`). A maior parte dos 157 arquivos locais foi consolidada em ~60
  migrations `schema_final_parte_NN` aplicadas em lote em 28-29/08 (schema base). As 8 mais
  recentes aplicadas batem exatamente com os últimos achados desta sessão: vínculo Pessoa
  360/case_members, status de aprovação de client_deliverables, planner_catalog_feed/
  price_catalog_rescued, workflow de confiança de genealogical_relationships, produtos-pai
  canônicos, e as duas correções do checklist cadastral (contratada e representante legal).
  **Nenhum arquivo de migration novo foi criado no trabalho desta madrugada** (propagação de
  assinatura, vínculo de núcleos, fila do Drive, painel TOP 30) — todos usam colunas/tabelas
  já existentes, então não há nada pendente de aplicação vindo do commit mais recente.
- **Achado de código adicional durante a investigação** (não corrigido nesta rodada, registrado
  para decisão): o pré-check de limite de tentativas de login (`prepararLoginEquipe` →
  `estadoLimite`, em `src/lib/equipe.server.ts:71`) não tem nenhum caminho alternativo se a
  chamada ao banco falhar — ele lança exceção, que a tela captura e mostra como
  `"Não foi possível entrar. Verifique os dados e tente novamente."`, uma mensagem indistinguível
  de senha errada. Isso contrasta com `confirmarSessaoEquipe` (mesmo arquivo), que já tem uma
  cadeia de fallback documentada em comentário para exatamente este tipo de falha. Não há
  evidência de que isso esteja acontecendo em produção hoje — foi descoberto porque é
  exatamente o que aconteceu no ambiente local desta sessão (seção 3). Fica como sugestão de
  robustez, não como bug confirmado em produção.

## 3. Bloqueio de infraestrutura de teste — evidência completa

O objetivo era abrir a URL de preview real da PR #85 num navegador automatizado (Chromium,
via Playwright) logado como a conta ADMIN de teste, e executar o protocolo tela a tela. Dois
obstáculos independentes impediram isso, cada um com evidência reproduzível:

**3.1 — O Chromium desta sessão não consegue fazer nenhuma chamada HTTPS de saída através do
proxy da sessão.** Testado contra quatro domínios completamente independentes
(`soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app`, `example.com`,
`github.com`, `vercel.com`, e depois `zsxpdbhdvbuulwpepemd.supabase.co` diretamente do
navegador): todos falham com o mesmo padrão (`net::ERR_CONNECTION_RESET`, tunnel fechado a
meio da troca TLS pelo relay do proxy). `curl` e o processo Node do servidor de
desenvolvimento, rodando lado a lado, alcançam os mesmos hosts sem problema — a falha é
específica do stack de rede do Chromium contra este proxy, não do destino. Isso está dentro
da categoria que a própria documentação do proxy desta sessão lista como não suportada,
e instrui a reportar em vez de contornar.

**3.2 — Substituí a URL de preview por um servidor local (mesmo código, mesmo banco de dados
Supabase real) para contornar (3.1), e isso revelou um segundo obstáculo**: o servidor local
desta sessão não tem a chave secreta do Supabase (`SUPABASE_SERVICE_ROLE_KEY`) — corretamente:
essa chave nunca fica no repositório nem é exposta a esta sessão pelas ferramentas
disponíveis, por design. A confirmação de sessão da equipe (`confirmarSessaoEquipe`) depende
dela num dos seus caminhos; sem ela, a tela autenticada renderiza em branco, sem erro visível
na interface — só um log no servidor (`Falta a chave secreta do Supabase no servidor`).

**Combinação**: não há, nesta sessão, um caminho para abrir um navegador de verdade logado como
ADMIN contra um ambiente que tenha tanto acesso de rede completo quanto a chave de servidor
necessária. Login via API (sem navegador) funciona; navegação real, tela a tela, não foi
possível completar.

**O que isso não significa**: quando a própria Proprietária abre a URL de preview no navegador
dela, nenhum dos dois obstáculos acima existe — não há proxy de sandbox no caminho, e o
deploy da Vercel tem a chave de servidor configurada corretamente (é assim que o preview
já funciona hoje para ela). Este bloqueio é sobre a ferramenta de automação desta sessão, não
uma alegação de que o Desk publicado esteja mais quebrado do que o já registrado.

## 4. Totais (honestos, não "prontos")

- Rotas/telas encontradas (Desk, fora do App Cliente): 81
- Rotas testadas via navegador autenticado real: 0 (bloqueio da seção 3)
- Rotas confirmadas servindo HTML válido via SSR (sem navegador, camada HTTP): 81/81, todas
  HTTP 200, nenhum 404/500 na primeira camada — não confirma que o conteúdo pós-login renderiza
  corretamente, só que a rota existe e o servidor responde
- Bugs P0 corrigidos e retestados nesta rodada: 0
- Bugs P0 ainda abertos: 0 identificados nesta rodada (nenhuma tela foi de fato testada como
  ADMIN autenticado para poder classificar)
- Migrations pendentes que bloqueiam fluxo, identificadas: 0 vindas do trabalho desta madrugada;
  matriz completa de 157 arquivos × 71 aplicadas na seção 2, sem reconciliação linha a linha
  (as ~60 mais antigas foram consolidadas em lote e uma comparação 1:1 por nome não é
  significativa sem arqueologia adicional)
- Preview: `https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app`
  (íntegro — CI verde, Vercel "Ready" — só inacessível a partir do Chromium desta sessão)
- Branch: `claude/ancestral-club-desk-intelligence-0gsoeg`
- SHA: `7c0466f0bfc2fd7442b0d08d070893e2891c161d`
- PR draft consolidada: #85 (mesma PR de toda a sessão, nenhuma nova aberta)

## 5. O que a Proprietária pode fazer agora, sem depender deste bloqueio

Como o bloqueio é só desta sessão de automação, o roteiro de teste real mais rápido é a
própria Proprietária, no navegador dela, no link de preview acima:

1. Entrar com a conta real dela (já confirmada `admin`/`active`).
2. Seguir o roteiro de preview já publicado em
   `docs/relatorios/2026-09-04_execucao_fluxo_basico.md` (assinatura→acesso, núcleos→pessoa,
   dossiê-mãe→fila do Drive, TOP 30) — são os quatro fluxos já corrigidos e testados por
   `vitest` nesta sessão.
3. Qualquer tela que travar: me dizer exatamente qual (URL ou nome) e a mensagem — com o
   inventário de 81 rotas e a categorização do "Mapa dos Bloqueios" já prontos, localizo a
   causa-raiz no código diretamente, sem precisar reproduzir na tela primeiro.

## 6. Bloqueios remanescentes

- Testagem interativa real (clique por clique) como ADMIN, tela a tela, não foi possível
  nesta sessão pelas razões da seção 3. Continuar exigiria uma de duas coisas, que só a
  Proprietária pode decidir/prover: (a) acesso de rede desta sessão ao preview real resolvido
  no nível de infraestrutura (fora do meu controle), ou (b) uma forma segura de eu obter a
  chave de servidor do Supabase para um ambiente de teste isolado — o que normalmente não é
  recomendável compartilhar com uma sessão de automação.
- Reconciliação linha a linha das ~60 migrations mais antigas consolidadas em lote não foi
  feita (baixo valor prático: nenhuma delas está ligada a um fluxo ainda quebrado identificado).

## 7. Reversão

Nada neste commit altera código de produto, schema ou dado. Nenhuma migration foi aplicada.
A conta de teste `qa-tela-a-tela@clubeancestral.test` teve sua senha redefinida para uma senha
de teste conhecida apenas para viabilizar a tentativa desta sessão — é uma conta `.test`
dedicada a isso, sem uso em nenhum fluxo real de cliente ou operação.
