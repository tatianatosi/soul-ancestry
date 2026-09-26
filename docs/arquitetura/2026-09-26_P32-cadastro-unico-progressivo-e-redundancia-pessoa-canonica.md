# P32 — Cadastro único progressivo: o que se repete, complementa e é redundante na Pessoa Canônica (2026-09-26)

```yaml
pedido literal: "Verifique quais deles podem ser validados em todos os campos o que se
  complementam o que se repete e o que é redundante na pessoa canônica e novamente até
  hoje não houve a unificação entre ficha piloto ficha genealógica e os demais cadastros
  criados o que eu preciso é algo simples um cadastro do lead que permeia em toda a sua
  jornada do call e com o roteiro de discovery spin sem forms infinitos que esse mesmo
  cadastro somente se complemente ao caminhar para aba... revise pois o centro de
  inteligência e a vida do Clube do Ancestral e ele também traz motores que ajudam
  nessa jornada"
```

## Boa notícia primeiro — o mecanismo que a senhora está pedindo já existe e já funciona

Investigação por leitura direta de código (agente Explore) confirmou: **Ficha Piloto e
Ficha Genealógica não duplicam cadastro.** `carregarFichaPiloto`
(`src/lib/ficha-piloto-genealogica.functions.ts`) é **só leitura** — nenhuma escrita —
sobre as mesmas 6 tabelas que a Ficha Genealógica usa (`research_cases`,
`research_people`, `genealogical_relationships`, `research_hypotheses`,
`research_pending_items`, `research_sources`). São duas *telas* sobre o mesmo dado
(uma resumo, outra edição completa) — não dois cadastros.

O "cadastro que permeia a jornada sem forms infinitos" também já existe, ponta a
ponta, e está testado:

1. **Lead nasce uma vez** (`leads`, `salvarLeadDesk`). O roteiro de Discovery SPIN
   (`discovery-roteiro.ts`) **não cria formulário novo** — cada pergunta do roteiro é
   uma "lupa" sobre uma coluna que já existe em `leads`; a Mesa de Calls escreve
   sempre na mesma linha.
2. **Handoff Lead → Cliente não re-pergunta dado.** `decidirClienteDoHandoff`
   (`handoff-discovery.ts`) decide `reusar` (pessoa já existe, mesmo CPF/e-mail/nome
   exato) ou `criar` (copiando nome/e-mail/telefone/origem/país automaticamente,
   `payloadClienteDoLead`) — nunca pede de novo o que o lead já informou.
3. **Perfil de pesquisa é vínculo, não recadastro.** `genealogical_person_profiles.client_id`
   (nullable) liga o perfil de pesquisa à Pessoa Canônica só por escolha humana
   explícita, nunca fusão automática — o mesmo princípio que a senhora já aprovou
   para CPF/telefone/CEP, aplicado a um vínculo de identidade inteiro.
4. **Marcos históricos, encontros de linhagem, relatórios, fases e entregas são
   genuinamente complementares** — confirmado campo a campo: nenhum deles recaptura
   nome, CPF, e-mail, telefone ou qualquer dado de identidade. `lineage_paths`/
   `lineage_encounters` só têm `pessoa_ancora_id` (uma referência, não uma cópia);
   `case_reports`/`client_deliverables` são registros de FASE/ENTREGA do caso, não
   de pessoa. "Fase 1"/"Fase 2" mapeiam para `case_plans.fase_jornada`
   (`pesquisa_inicial`/`pesquisa_e_validacao`) — fonte única, sem coluna duplicada em
   nenhum outro lugar.

## O problema real: 6 pares de campos duplicados, nunca comparados

CPF, telefone e CEP já tinham reconciliação `case_members` × `clientes` (cortes
anteriores desta sessão). A auditoria confirmou **6 pares que ainda não tinham**:
e-mail, RG, nacionalidade, data de nascimento, profissão e estado civil — mesmo
conceito em duas tabelas, sem nenhuma função comparando os dois.

Em vez de copiar o padrão de CPF/telefone/CEP mais 6 vezes — exatamente o "forms
infinitos" que a senhora está apontando —, este corte generalizou o mecanismo:

- **Um único escritor**: `conferirDivergenciaCampoCivilMembrosCaso`
  (`caso-canonico.functions.ts`), parametrizado pelo campo. Mesmas garantias de
  sempre: nunca funde sozinho, só preenche vazio, conflito exige confirmação humana
  com motivo, dependente nunca herda do responsável.
- **Um único componente**: `PainelDadosCivisMembrosCaso`
  (`reconciliar-dados-civis-membros-caso.tsx`) — um painel só em Caso 360, com um
  bloco compacto por campo (não 6 cards separados como CPF/telefone/CEP tinham).
- **Um único sinal** em Pessoa 360 (`sinalCampoCivilDaPessoaPorCaso`) — um aviso
  consolidado por caso, não 6 avisos empilhados.
- Normalização por campo: e-mail (case-insensitive), RG (ignora pontuação — não tem
  dígito nacional único, por isso nunca existiu `formatarRg`), data de nascimento
  (compara só a data, ignora hora), nacionalidade/profissão/estado civil (texto
  normalizado).

## Achados adicionais, corrigidos

1. **`leads.nacionalidades_interesse` (múltiplos países) não chegava à Pessoa
   Canônica.** Não era dado perdido — já ia para o resumo do CASO
   (`resumoHandoffDoLead` → `crm_casos.resumo`) — mas nunca aparecia em Pessoa 360.
   `payloadClienteDoLead` agora acrescenta às observações da pessoa quando há mais de
   uma nacionalidade de interesse. Sem coluna nova.
2. **Pessoa 360 lia uma coluna morta.** `research_people.birth_date`/`birth_place`
   nunca são escritas por nenhum escritor do repo (confirmado por leitura direta) —
   sempre nulas. O dado real de nascimento/óbito que a pesquisa de fato preenche mora
   em `genealogical_person_profiles.nascimento_data`/`nascimento_localidade`/
   `morte_data`/`morte_localidade`, ligado por `client_id` (vínculo humano já
   existente) — só nunca tinha sido lido para a Pessoa 360. Corrigido:
   `carregarPessoa` passa a ler essas 4 colunas do perfil vinculado, e a tela mostra
   nascimento/óbito no bloco "Perfil genealógico vinculado".

## Declarado, não tocado nesta rodada (decisão de escopo, não esquecimento)

- `research_people.birth_date/birth_place/death_date/death_place` continuam
  existindo como colunas mortas — retirá-las ou reconciliá-las com
  `genealogical_person_profiles` é decisão de schema (dropar coluna ou migrar dado),
  não feita sem autorização explícita.
- Não foi construída reconciliação campo-a-campo entre `research_people` e
  `genealogical_person_profiles` (o padrão usado é vínculo por `client_id`, não
  comparação de valor) — são conceitos de pesquisa (nome canônico, papel na
  linhagem), não de identidade civil; o mesmo mecanismo de CPF/telefone não se
  aplicaria sem reformular o que "conflito" significaria ali.
- `case_members.endereco` (texto livre) continua sem estrutura — diferente do
  endereço já estruturado de `clientes` (CEP já reconciliado, o texto corrido não).

## Verificação

`tsc --noEmit` limpo. 20 testes novos
(`p32-cadastro-unico-progressivo-2026-09-26.test.ts`) cobrindo o mecanismo genérico,
o painel único, o sinal consolidado, o handoff e a correção de leitura. 1 teste
existente corrigido por mudança de formatação de import, não regressão
(`r2-conflito-cpf-case-members.test.ts`). Suíte completa: 408/415 arquivos,
3870/3889 testes — 7 arquivos/11 testes em falha, idêntico à baseline estável
pré-existente (visual/portal, não relacionados a este corte). `vite build` limpo.

## Prova Lovable pós-push

1. Em Caso 360, seção "Pessoas do caso": conferir o novo painel "Conferir dados
   civis dos membros com o cadastro canônico" — 6 blocos compactos (e-mail, RG,
   nacionalidade, data de nascimento, profissão, estado civil), cada um com
   "Ver"/"Preencher pendentes" e resolução de conflito com motivo.
2. Em Pessoa 360: um único aviso consolidado (não 6) quando algum desses campos
   diverge ou está vazio no caso, com link "Conferir" de volta ao Caso 360.
3. Converter um lead com nacionalidade de interesse múltipla em cliente e conferir
   que a lista de países aparece nas observações da Pessoa 360.
4. Em Pessoa 360, para uma pessoa com perfil genealógico vinculado com nascimento/
   óbito preenchidos em `/pessoas-linhagens`: conferir que a data/local aparecem no
   bloco "Perfil genealógico vinculado".
