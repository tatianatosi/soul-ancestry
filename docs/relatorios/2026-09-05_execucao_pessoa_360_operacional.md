---
titulo: Pessoa 360 operacional — camada sobre tabelas existentes (execução, não decisão)
data: 2026-09-05
branch: claude/ancestral-club-desk-intelligence-0gsoeg
---

Arquitetura usada (a já definida pela Proprietária, não redecidida aqui): `clientes` é a Pessoa Canônica;
`crm_casos` é a relação operacional; `nucleo_membros`/`case_members`/`contract_parties` são participações;
`genealogical_person_profiles`/`research_people` são pesquisa interna, nunca expostas ao App Cliente.
Nenhuma tabela nova foi criada. Rota única: `/pessoas/$clienteId` — evoluída, não duplicada.

## 1. O que mudou em `/pessoas/$clienteId` nesta rodada

Blocos que já existiam: Quem é (identidade/contato), Casos, Antes de virar cliente (candidatos de lead),
Linha do tempo (jornada/eventos do caso).

Blocos adicionados (mesma rota, mesmos dados, sem tabela nova):
- **Núcleo familiar e papéis** — lê `nucleo_membros` por `cliente_id`.
- **Propostas, contratos e documentos** — lê `proposals`/`contracts`/`contract_parties`/`documents` por `client_id`.
- **Conteúdo publicado para o App Cliente** — lê `app_projections` dos casos desta pessoa, com estado (`published`/outro).
- **Pesquisa genealógica interna (restrita ao Desk)** — correspondência por nome em `genealogical_person_profiles`,
  claramente rotulada como não-vínculo-confirmado e nunca exposta ao portal (a própria seção só existe na tela do Desk).

Link "Ver perfil 360" adicionado em **Propostas** (`propostas.tsx`, drawer de detalhe). Já existia em **Clientes**,
**Núcleos** e **Casos** (aba "Pessoa e família", corrigido em rodada anterior desta sessão).

## 2. Matriz de vínculo

| Origem | Registro | Identificador | Vínculo atual | Destino Pessoa 360 | Ação aplicada | Automático/manual | Risco | Rota de origem | Resultado após reload | Visível no App Cliente? | Commit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Clientes | `clientes` | `id` | É a Pessoa Canônica | — (é o destino) | Nenhuma (já correto) | — | Nenhum | `/clientes` | — | Não diretamente; é a origem das projeções | — |
| Núcleos | `nucleo_membros` | `cliente_id` | Existente e consumido (backfill de rodada anterior) | `/pessoas/$clienteId` | Lido no novo bloco "Núcleo familiar e papéis" | Automático (já vinculado) | Nenhum | `/nucleos` | Perfil mostra papel e vínculo | Não (é dado interno de papel, não projeção) | pendente de push |
| Casos | `case_members` | `cliente_id` | **Vínculo ausente por desenho**: linhas desta pessoa estão arquivadas desde 21/08 (migration `20260821152043`, motivo "fonte de verdade é Núcleos"), então `cliente_id` nunca foi preenchido para elas | `/pessoas/$clienteId` (via núcleo, não via case_members) | Nenhuma nesta rodada — achado, não corrigido | — | **Médio**: `cadastro-checklist.functions.ts`, `escopo-conferencia.server.ts`, `case-service-consolidacao.functions.ts` e `contrato-preparar.functions.ts` ainda leem só `case_members` (arquivado = vazio) e não foram redirecionados para `nucleo_membros` | `/casos/$caseId` (checklist cadastral, preparação de contrato) | Não testado — achado só confirmado por SQL | Não | — |
| Contratos | `contracts`/`contract_parties` | `client_id` | Existente e consumido (novo bloco) | `/pessoas/$clienteId` | Lido no novo bloco | Automático | Nenhum | `/contratos` (não linka ainda — não expõe `client_id` na tela, só código/caso) | Perfil mostra status/assinatura | Não (dado comercial interno) | pendente de push |
| Propostas | `proposals` | `client_id` | Existente e consumido | `/pessoas/$clienteId` | Lido no novo bloco + link "Ver perfil 360" adicionado | Automático + link manual novo | Nenhum | `/propostas` | Perfil mostra status/valor; link abre o perfil | Não | pendente de push |
| Documentos | `documents` | `client_id` | Existente e consumido | `/pessoas/$clienteId` | Lido no novo bloco | Automático | Nenhum | `/documentos` (não linka ainda) | Perfil mostra título + liberado/não | Só o que já é `liberado_cliente=true`, via portal, não via este perfil (este perfil é Desk) | pendente de push |
| App Cliente (publicação) | `app_projections` | `case_id` (via casos da pessoa) | Existente e consumido | `/pessoas/$clienteId` | Novo bloco "Conteúdo publicado para o App Cliente" | Automático | Nenhum | — | Perfil mostra tipo + estado de aprovação | Sim — é exatamente o que o cliente vê, mostrado aqui em espelho | pendente de push |
| Pesquisa | `genealogical_person_profiles` | nenhum (sem `cliente_id`/`client_id` por desenho — isolamento deliberado) | Ambíguo por natureza — nunca vínculo automático | `/pessoas/$clienteId` | Novo bloco, correspondência por nome, rotulado "não é vínculo confirmado" | Manual (a decisão de que é a mesma pessoa continua humana) | Baixo — não funde nem expõe ao portal | `/pesquisa`, `/pessoas-linhagens` (não linkam para o perfil ainda) | Perfil mostra achados por nome | Não — bloco existe só na visão Desk | pendente de push |
| Leads | `leads` | nenhum (`case_id` nulo em todo o banco) | Ambíguo — evidência por e-mail/telefone/nome, nunca fusão automática | `/pessoas/$clienteId` | Já existia (bloco "Antes de virar cliente") | Manual | Baixo | `/leads` (não linka para o perfil ainda) | Sem mudança nesta rodada | Não | — |

## 3. O que este achado muda no diagnóstico de "Ana some/trava"

O ponto mais sério não é falta de vínculo — é que **o vínculo certo (`nucleo_membros`) existe e está correto**, mas
4 funções do Desk (`cadastro-checklist.functions.ts`, `escopo-conferencia.server.ts`, `case-service-consolidacao.functions.ts`,
`contrato-preparar.functions.ts`) continuam lendo `case_members`, que foi **deliberadamente esvaziado** (arquivado) em
21/08 a favor de Núcleos como fonte única — decisão correta, nunca propagada para quem consumia a tabela antiga.
Resultado real, verificado por SQL nesta rodada: para o caso de Ana (`CA-CID-AT-FAM-2026-001`), essas 4 telas
hoje leem uma lista de pessoas vazia, porque as 4 linhas de `case_members` (Ana, Adair, Alice, Felipe) estão
arquivadas desde então. Isto explica sintomas de "cadastro não avança"/"preparação de contrato sem gente" que
não são fragmentação de identidade — são leitura da tabela errada. **Não corrigido nesta rodada** (achado, com
os 4 arquivos e a ação exata para a próxima rodada: trocar a origem de leitura de `case_members` para
`nucleo_membros` nessas 4 funções, mapeando os campos equivalentes).

## 4. Cliente A/B de homologação e isolamento

Não executado nesta rodada. O Cliente A de homologação já existe (`docs/relatorios/2026-09-05_acesso_cliente_homologacao.md`)
e agora, com a conexão do Supabase restabelecida, pode ser reaproveitado para abrir seu próprio `/pessoas/$clienteId`
e ver os blocos novos. Criar o Cliente B e testar isolamento A×B de conteúdo publicado fica como próximo passo —
não fabricado aqui para não misturar achado com prova.

## 5. O que NÃO está entregue (sem meio-termo)

- Links para o perfil ainda faltam em: Contratos (a tela não expõe `client_id` hoje — precisa de join com o caso),
  Documentos, Leads e Pesquisa/Pessoas e Linhagens.
- O bug de leitura de `case_members` arquivado (seção 3) não foi corrigido nesta rodada — é o próximo passo mais
  concreto e de maior impacto real para o caso de Ana.
- Cliente B de homologação e teste de isolamento A×B não foram feitos.
- `tsc --noEmit`, `vitest run` (1613/1613) e `vite build` passam com as mudanças desta rodada.
