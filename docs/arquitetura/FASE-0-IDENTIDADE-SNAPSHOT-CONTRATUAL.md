# Identidade e snapshot contratual — contrato canônico (Fase 0, 27/09/2026)

```yaml
status: executado (código); migration de imutabilidade proposta, NÃO aplicada
fase: 0 de 6 — "Prompt Canônicos — Fichas, Evidências, Identidade e Contrato v1.0"
responsável pela decisão: Proprietária do Clube Ancestral
```

## 0.1 — Revogação de "P30": nome exato nunca é suficiente para fundir

**Decisão vigente**: nenhuma fusão automática de Pessoa, Lead, Contato,
Membro de Caso ou Perfil Genealógico por nome, CPF, e-mail ou telefone
isoladamente — CPF e e-mail continuam com força "confirmado" (decisão
anterior, não revogada); **nome exato deixa de ser "confirmado"** e passa a
ter a mesma força que telefone ("provavel") — sempre gera só um sinal de
possível duplicidade, nunca funde sozinho, mesmo quando há um único
candidato.

**Achado**: a decisão anterior ("P30", 26/09/2026) tinha feito o oposto —
tratava nome normalizado idêntico como "confirmado" (mesmo nível de CPF/
e-mail), fundindo automaticamente `decidirClienteDoHandoff` quando havia
exatamente um candidato. Isso contradizia diretamente a "regra crítica" já
registrada em outro documento desta mesma sessão ("Lead, Pessoa e Caso não
se fundem por nome") e o próprio comentário original da função
`evidenciaDeMesmaPessoa` ("Nunca devolve 'confirmado' por nome").

**Corrigido**: `src/lib/pessoa-identidade.ts#evidenciaDeMesmaPessoa` —
bloco de nome exato agora devolve `{ forca: "provavel", motivo: "mesmo nome
— confirme, porque homônimos existem" }`. `decidirClienteDoHandoff`
(`src/lib/handoff-discovery.ts`) não precisou de nenhuma mudança — já cai
automaticamente no ramo `provaveis` → `acao: "confirmar"` quando a força é
"provavel", em vez do ramo `confirmados` (que exigia `podeTratarComoMesmaPessoa`,
só verdadeiro para "confirmado").

## 0.2 — Reconciliação Pessoa Canônica × snapshot `contract_parties`

**Achado**: `contract_parties` grava `person_name`/`document_number`/
`address`/`email`/`phone` como texto livre copiado de
`contract_parameter_values` no momento de `enviarParaAssinatura`
(`contrato-parametros.functions.ts`), mesmo quando `client_id` já aponta
para a Pessoa Canônica (`clientes`) — nunca lido ao vivo. Já existia
reconciliação para CPF (`sincronizarPessoaDoCaso`, desde 06/09/2026,
"Fase 3 da unificação de pessoa") — generalizado aqui para nome/e-mail/
telefone.

**Novo**: `src/lib/contratos.functions.ts#sincronizarContatoPartesDoCaso` —
mesma filosofia sem dedup já usada para os 6 campos civis de `case_members`
(P32b, 26/09/2026): só preenche o que está vazio a partir de `clientes`;
valor já preenchido e divergente vira só sinal passivo (nunca um botão de
"usar o canônico"); nunca mexe em parte de contrato já assinado (checagem
de app, `if (contrato.signed_at) throw ...`, preservada). Componente
`src/components/contrato/reconciliar-contato-partes.tsx`
(`ReconciliarContatoPartesContrato`), wireado em
`casos.$caseId.contrato.preparar.tsx` ao lado do já existente
`ReconciliarCpfPartes`.

**Atualização (Corte 4, 27/09/2026)**: o gap de endereço declarado acima foi
fechado. `montarEnderecoCanonico` (`contratos.functions.ts`) compõe uma
string única a partir do endereço estruturado de `clientes`
(logradouro/número/complemento/bairro/cidade/UF/CEP — exige ao menos
logradouro, cidade e UF preenchidos) e `sincronizarContatoPartesDoCaso`
passou a aceitar `campo: "endereco"`, comparando-a contra
`contract_parties.address` (texto livre) com a mesma filosofia sem dedup —
diferença de formatação também vira só "conflito" passivo, nunca bloqueia
nem funde sozinho. `CAMPOS_CONTATO_PARTE_RECONCILIAVEIS` agora é
`["nome", "email", "telefone", "endereco"]`.

## 0.3 — Imutabilidade pós-assinatura (gap real, migration proposta, NÃO aplicada)

**Achado**: hoje nada no banco impede um `UPDATE` direto em
`contract_parties` depois de `contracts.status='signed'` — só a geração de
rascunho (`gerarRascunhoInterno`) e as duas funções de reconciliação acima
bloqueiam no nível do app. O trigger existente
(`fn_contract_parties_guard()`, migration `20260816155807`) só valida
representação de menor, nunca imutabilidade.

**Proposto, não aplicado**:
`supabase/migrations/20260927100000_contract_parties_imutabilidade_pos_assinatura.sql`
— estende (aditivamente, `CREATE OR REPLACE FUNCTION`) a mesma função já
existente: em qualquer `UPDATE`, busca `contracts.signed_at` do
`contract_id` e recusa a escrita se já assinado. **Não aplicada ao banco
nesta rodada** — mudança de trigger em tabela com dado de contrato já
assinado exige confirmação explícita antes de `supabase db push` ou
aplicação manual, por regra já estabelecida nesta sessão para qualquer
migration de schema.

## Verificação

`tsc --noEmit` limpo. Testes atualizados:
`pessoa-identidade.test.ts`, `p1-identidade-conversao-lead-cliente.test.ts`,
`p29-fusao-nome-exato-e-mascaras-leitura-2026-09-26.test.ts` (revogação de
P30) — 3 arquivos, comportamento de nome-exato invertido, CPF/e-mail/
telefone confirmados como não-regressão. Novo
`src/lib/__tests__/fase0-identidade-snapshot-contratual-2026-09-27.test.ts`
para a reconciliação de contato. Suíte completa e `vite build` — ver
rodapé do commit.

## Prova Lovable pós-push

1. Em `/calls` ou no handoff de um lead: um nome exato igual a um cliente já
   cadastrado, sem CPF/e-mail/telefone em comum, agora sempre pede
   confirmação — nunca funde sozinho, mesmo com um único candidato.
2. Em `/casos/$caseId/contrato/preparar`, seção "2. Formalização & Anexos":
   conferir o novo painel "Conferir nome, e-mail e telefone das partes com
   o cadastro canônico", ao lado do painel de CPF já existente — 3 blocos
   compactos, "Preencher pendentes" só quando há campo vazio.
3. Para um contrato já assinado: o novo painel mostra o aviso "Contrato já
   assinado... snapshot permanece imutável" e o botão de preencher fica
   oculto.
4. A migration de imutabilidade (item 0.3) **não** deve ser aplicada sem
   confirmação explícita da Proprietária — este item fica pendente de
   decisão.
