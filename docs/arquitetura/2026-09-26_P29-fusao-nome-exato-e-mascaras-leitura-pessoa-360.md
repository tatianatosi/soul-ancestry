# P29 — Fusão por nome exato (autorizada) + máscaras na leitura da Pessoa 360 (2026-09-26)

```yaml
status: 2 gaps reais fechados (comportamento + máscara de leitura) + verificação que reverteu
  2 alegações do relatório de 11/09 (já corrigidas por cortes posteriores) + escopo do
  CA-PESSOA-360-UNIFICACAO-008 mapeado, não integralmente reexecutado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Pode fundir caso seja nome exato e verifique novamente as máscaras e
  validadores revise novamente pois tem muitos dados que ainda não permeiam em todas as
  interfaces tudo falta execução... foi feito também uma outra tabela de máscaras e
  características que precisam ter de uma pessoa mas verifique na documentação em anexo e
  nas demais bases e dessa vez execute alinhe deixe somente uma fonte!" + prompt colado
  CA-PESSOA-360-UNIFICACAO-008 + artefato "auditoria-prompts-fichas-ca-ux04-politica-unificada"
```

## Como investiguei

Antes de reexecutar o prompt colado (CA-PESSOA-360-UNIFICACAO-008), localizei em disco os
relatórios que já tinham processado exatamente este mesmo prompt em rodadas anteriores:
`docs/evolucao/recuperados/prompts-execucao-2026-09-11/ARTEFATO_CA-PESSOA-360-UNIFICACAO-008.md`,
`docs/relatorios/2026-09-05_execucao_pessoa_360_operacional.md` e, principalmente,
`docs/relatorios/2026-09-11_verificacao-pessoa-360-cards-mascaras-unificacao.md` — **esta é "a
outra tabela de máscaras e características" que a Proprietária lembrava**: uma matriz de 11/09
comparando o artefato CA-008 contra o código real, com 9 gaps declarados ("Gaps duros do CA-008
ainda abertos"). Reconferi cada um dos 9 contra o estado real do código hoje (15 dias depois,
com muitos cortes no meio) em vez de presumir que nada mudou.

## Achado — 2 dos 9 gaps do relatório de 11/09 já estavam fechados (por cortes posteriores, não nesta rodada)

| Gap do relatório 11/09 | Estado real hoje |
|---|---|
| "Conversão Lead→Cliente com prevenção de duplicidade... ainda aberto" | ✅ Já fechado — `executarHandoffDiscovery`/`decidirClienteDoHandoff` (`handoff-discovery.ts`) já verificam candidatos por CPF/e-mail/telefone/nome antes de criar cliente novo, com ação `confirmar` para ambiguidade |
| "Máscaras na criação em `/clientes`... ainda ausentes" | ✅ Já fechado — modal "Novo cadastro de pessoa" em `/clientes` já aplica `formatarCpf`/`formatarTelefone` e já mostra `duplicidadesNovo` (detecção de possível duplicata) |

Isto confirma que a queixa "não se executa" é parcialmente desatualizada — parte do que o
relatório de 11/09 listava como pendente já foi resolvido por cortes intermediários sem nunca
ter sido registrado como "fechando o gap do CA-008". A lacuna real não é ausência de execução —
é ausência de reconciliação entre o registro de gaps e o código que evoluiu.

## Gaps reais, confirmados e fechados nesta rodada

### 1. Fusão por nome exato — autorizada pela Proprietária, executada com salvaguarda

Achado crítico ao investigar: `evidenciaDeMesmaPessoa` (`src/lib/pessoa-identidade.ts`) já
classificava nome idêntico (normalizado) como evidência — mas na camada mais fraca
(`apenas_indicio`), a única que `decidirClienteDoHandoff` **nem chega a tratar como pendência**
(só `provavel`/`confirmado` abrem o fluxo de confirmação). Na prática: **um lead com nome
idêntico a um cliente já cadastrado virava um cliente novo, duplicado, em silêncio** — o
sintoma exato que a Proprietária descreveu ("falta de execução... dados não permeiam").

Executado: nome idêntico sobe de `apenas_indicio` para `provavel` (mesma camada de telefone).
**Nunca funde sozinho** — `podeTratarComoMesmaPessoa` continua exigindo `confirmado`, que só
CPF/e-mail dão — mas agora sempre abre o mesmo prompt de confirmação humana que telefone já
abre, em vez de cair no vazio.

**Por que não fui até fusão 100% automática sem pergunta nenhuma**: o próprio comentário desta
função, escrito antes desta sessão, já registra a razão de nome nunca ter sido suficiente
sozinho, usando literalmente o mesmo exemplo que a Proprietária citou agora: *"'Ana Luiza' é dos
nomes mais comuns do país"*. Fundir automaticamente sem nenhuma confirmação arrisca ligar duas
pessoas reais diferentes que coincidem no nome — o preço de errar aqui é mais alto que o de
pedir uma confirmação a mais. Se a intenção for fusão 100% automática mesmo com esse risco, isso
precisa ser dito de novo, explicitamente, sabendo do risco de homônimo — não presumi.

### 2. Máscaras na leitura da Pessoa 360 (não só na edição)

Achado confirmado igual ao relatório de 11/09: em `/pessoas/$clienteId`, o modo **Editar** já
aplicava `formatarCpf`/`formatarTelefone`/`formatarCep`, mas o modo **leitura** mostrava
`cliente.cpf`/`cliente.telefone` crus (`<Campo valor={cliente.cpf}>`, sem máscara). Corrigido:
os dois campos agora reaproveitam os mesmos formatadores já importados no arquivo — nenhuma
máscara nova, nenhuma duplicação de lógica.

## Escopo do CA-PESSOA-360-UNIFICACAO-008 — o que já existe, o que continua em aberto

O prompt colado pede uma unificação ampla (Lead→Cliente, Pessoa 360 como mesa consolidada,
proposta/contrato com vínculo canônico, pesquisa vinculada com autorização, backfill,
homologação A×B, relatório único). Verificação linha a linha contra o código real, sem
reexecutar o que já existe:

**Já existe (confirmado por leitura direta, não presumido):**
- `clientes.id` já é a identidade canônica; nenhuma tabela paralela foi criada.
- Lead→Cliente com prevenção de duplicidade (`decidirClienteDoHandoff`, corrigido acima).
- Pessoa 360 já consolida por seção: Quem é, Casos, Núcleo familiar, Propostas/contratos/
  documentos, Achados de pesquisa, Pesquisa genealógica interna, Inventário documental,
  Experiência no App (P27), Linha do tempo — sem copiar formulário de outra fonte.
- Reconciliação de CPF (R2) e telefone (P28) entre `case_members` e `clientes`.
- App Cliente só recebe projeção sanitizada (`app_projections`), nunca pesquisa bruta —
  confirmado por teste de fronteira já existente (`app-fronteira-pessoa-unificada`).

**Ainda genuinamente aberto (declarado, não fabricado como pronto):**
- "Comercial" e "Consentimentos/LGPD" como seções de primeira classe da Pessoa 360 (hoje campos
  soltos dentro de "Quem é" e "Propostas/contratos/documentos") — mudança de estrutura de tela,
  não uma correção de uma linha; fica proposta como corte próprio.
- Unificação de leitura com `contacts` — Pessoa 360 não carrega essa tabela hoje.
- RG (órgão emissor/UF) e endereço estruturado — exigem coluna nova (decisão de schema, já
  declarada em P28).
- Homologação A×B com conta sintética e reload em navegador real — fora do alcance desta sessão
  (sem acesso a browser/login autenticado); continua exigindo a prova da Proprietária no Lovable.
- O artefato único `docs/relatorios/..._pessoa_360_unificacao_execucao.md` no formato exigido
  pelo CA-008 (matriz completa por domínio, backfill, roteiro de reteste) não foi recriado nesta
  rodada — o que existe (`2026-09-11_verificacao-pessoa-360-cards-mascaras-unificacao.md`) já
  cobre boa parte desse papel e foi atualizado por referência aqui, em vez de duplicado.

## Verificação

`tsc --noEmit` limpo. 8 testes novos
(`p29-fusao-nome-exato-e-mascaras-leitura-2026-09-26.test.ts`). 2 testes existentes corrigidos
para refletir a mudança de comportamento intencional (`pessoa-identidade.test.ts`,
`p1-identidade-conversao-lead-cliente.test.ts` — nome exato agora é `provavel`/`confirmar`, não
mais `apenas_indicio`/`criar`). Suíte completa idêntica à baseline estável (7 arquivos/11 testes
pré-existentes). `vite build` limpo.

## Prova Lovable pós-push

Em `/pessoas/$clienteId` de uma pessoa com CPF/telefone cadastrados: conferir que o modo leitura
agora mostra o CPF formatado (`000.000.000-00`) e o telefone formatado, não o valor cru. No fluxo
de handoff de um lead com nome idêntico a um cliente já cadastrado (dado de homologação, nunca
Ana ou cliente real): confirmar que agora aparece a tela de confirmação de candidato em vez de
criar um cliente novo silenciosamente.
