# P31 — Comercial + Consentimentos em Pessoa 360, máscaras/validações completas e CEP unificado (2026-09-26)

```yaml
pedido literal: "Pode executar comercial, consentimentos da pessoa 360, verifique também
  os cards do visao app cliente, todos os documentos Rg, cpf, passaporte, endereço
  completo, cidade, estado, uf, pais, telefone 55 11 também aplicar se é o WhatsApp ou
  não, e-mail, comprovante residencial, tudo deve ser estruturado com máscaras e
  validações em todas as abas revise mais uma vez seja minicioso não presuma que já
  fez quando não fez, aplique e unifique cep conferência será mesmo necessário
  verificar três vezes o mesmo dado? Verifique nos contratos e em cada prompt tem
  especificações que não lembro de cor e que devem ser feitas e executadas"
```

## Ground-truth primeiro (lição da rodada anterior, aplicada aqui)

Antes de escrever qualquer linha, reconferi o schema real (`information_schema.columns`,
não a documentação) para cada campo citado:

| Campo pedido | Já existe? | Onde |
|---|---|---|
| RG número/órgão-UF | **Sim** — `clientes.rg_numero`, `clientes.rg_orgao_uf` | Já editável em Pessoa 360 desde antes desta rodada. Os cortes P28/P29/P30 declararam repetidamente "não existe hoje" — **falso**, corrigido nesta rodada (ver seção "Correção de claim falsa" abaixo) |
| CPF | Sim | `clientes.cpf`, `case_members.cpf` |
| Passaporte | Não é coluna — é **tipo de documento** | `TIPOS_DOCUMENTO` (`fontes-documentos.ts`) já lista `passaporte` como documento uploadável; correto como está, não precisa virar coluna de texto |
| Endereço completo (cidade/estado/UF/país) | **Sim, já estruturado** | `clientes.endereco_logradouro/numero/complemento/bairro/cidade/uf/pais` — já editável, UF já valida contra `UFS_BRASIL` |
| Telefone com DDI/DDD | Sim | `formatarTelefone`/`telefoneValido` (`validacao-pessoa.ts`) |
| WhatsApp sim/não | **Não existia** — lacuna genuína | Fechada nesta rodada (migration aditiva) |
| E-mail | Sim (coluna), mas sem validador de conteúdo | Fechado nesta rodada |
| Comprovante de residência | Não é coluna — é **tipo de documento** | `TIPOS_DOCUMENTO` já lista `comprovante_residencia`; correto como está |

## 1. Correção de claim falsa (P28→P30, corrigida agora)

Três cortes seguidos (P28, P29, P30) declararam "RG órgão/UF não existe hoje — exige
decisão de schema". Consulta direta ao banco mostrou que isso sempre foi falso: as
colunas já existiam. O erro real nunca foi "coluna ausente" — foi eu confiar na
documentação (`mascaras-e-validadores.md`) sem reconferir contra o schema vivo, e
repetir a mesma frase entre cortes sem verificar de novo. Corrigido:

- `docs/design-system/mascaras-e-validadores.md` — linhas de RG/Órgão emissor/UF
  reescritas com o estado real; parágrafo novo em §1 documentando a correção.
- `docs/arquitetura/2026-09-26_P30-...md` — parágrafo da lacuna substituído por uma
  nota de correção explícita, sem apagar o histórico do que foi escrito por engano.

O que faltava de verdade (agora fechado): **validação** da UF dentro do texto do
órgão emissor. `rgOrgaoUfValido` (`validacao-pessoa.ts`) extrai a UF do fim do texto
(ex.: "SSP/SP", "SSP-MT", "SESP SP") e confere contra `UFS_BRASIL`/`ufValida` — nunca
confunde o fim de uma palavra do nome do órgão (ex.: "...Pública") com uma sigla,
porque só reconhece par de letras maiúsculas separado por `/`, `-` ou espaço. Órgão
sem UF reconhecível (RG estrangeiro) não é tratado como erro.

## 2. E-mail e telefone ganham validação de conteúdo (nunca tinham)

`telefoneValido` já existia desde antes desta sessão mas nunca era chamado antes de
gravar — só a máscara (`formatarTelefone`) era aplicada. `emailValido` é novo (formato
`algo@dominio.tld`, trim, rejeita string vazia/sem `@`/sem domínio). Aplicados nos
dois únicos formulários que gravam esses campos:

- Pessoa 360 (`pessoas.$clienteId.tsx#salvarComValidacao`): e-mail e telefone entram
  no mesmo bloco de validação que já bloqueava CPF/CEP inválido — campo vazio
  continua permitido, só valor preenchido e malformado bloqueia.
- Formulário de pessoa do Caso 360 (`casos.$caseId.index.tsx#CartaoPessoa`): mesma
  regra, mesmos dois campos.

## 3. CEP unificado — fim da verificação tripla (pedido direto)

Achado real, confirmado por `information_schema.columns`: CEP existe em **3 lugares**
sem nunca terem sido reconciliados — `clientes.endereco_cep` (canônico),
`case_members.cep` (por membro do caso) e o texto livre de `case_members.endereco`.
Isso é exatamente o "verificar três vezes o mesmo dado" que a Proprietária apontou.

Fechado com o mesmo padrão exato já usado para CPF (R2, 21/09) e Telefone (P28,
26/09) — reconciliação, nunca fusão automática:

- `estadoCepMembroCaso`/`sinalCepDaPessoaPorCaso` (novo, `pessoa-vinculo.ts`) — mesma
  assinatura e mesmos 5 estados (`preencher`/`conflito`/`ja_sincronizado`/
  `sem_dado_canonico`/`dependente_nao_sincronizado`) que CPF/telefone.
- `conferirDivergenciaCepMembrosCaso` (novo, `caso-canonico.functions.ts`) — só
  preenche CEP vazio a partir de `clientes.endereco_cep`; conflito nunca é
  sobrescrito sem confirmação humana + motivo (audit_logs + timeline).
- `ReconciliarCepMembrosCaso` (novo componente) — ligado em Caso 360 nos dois ramos
  (caso com núcleo e caso sem núcleo), ao lado dos painéis de CPF e telefone.
- Sinal em Pessoa 360 (`sinalCepDaPessoaPorCaso`), mesmo padrão visual do sinal de
  CPF/telefone, com link "Conferir" de volta para o Caso 360.
- `pessoasDoCasoComFallbackNucleo` (`pessoa-vinculo.ts`) passou a selecionar `cep` de
  `case_members`, igual já fazia com `telefone`.

Depois desta rodada, CEP tem uma única tela de conferência (Caso 360) em vez de três
edições desconectadas — a mesma pessoa não precisa mais ter o CEP corrigido três
vezes em três lugares diferentes.

## 4. WhatsApp — lacuna genuína, fechada com migration aditiva

Confirmado por grep em `types.ts`: não existia nenhuma coluna "este telefone é
WhatsApp" (só `whatsapp_configurado`, de integração, e `fallback_whatsapp_enviado`,
de cadência — nada sobre o telefone da pessoa). Migration
`20260926190000_telefone_whatsapp_flag.sql` (aditiva, aplicada e registrada em
`schema_migrations`):

```sql
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS telefone_whatsapp boolean;
ALTER TABLE public.case_members ADD COLUMN IF NOT EXISTS telefone_whatsapp boolean;
```

Nullable, três estados (`null` = não informado ainda) — nunca inferido
automaticamente a partir do telefone. Select "Sim"/"Não" ao lado do campo Telefone
em Pessoa 360 e no formulário de pessoa do Caso 360. `atualizarPessoa`
(`pessoa.functions.ts`) tratava todo campo como string forçada
(`typeof v === "string" ? v.trim() || null : null` — um boolean `true`/`false` virava
`null` silenciosamente); corrigido com `CAMPOS_BOOLEANOS`, tratando este campo à
parte dos demais (texto). `case_members` (allowlist genérico de
`saas.functions.ts`) ganhou `telefone_whatsapp` na lista de campos editáveis.

## 5. Comercial — seção nova em Pessoa 360 (nunca tinha sido construída)

`clientes.classificacao`/`status_comercial`/`origem`/`data_origin`/
`ativacao_decidida_em`/`ativacao_justificativa` já existiam desde 21/08 (migration
`20260821184733`) mas nenhuma tela os lia. `CaCard titulo="Comercial"` novo, logo
após "Quem é": classificação (vocabulário fechado real do CHECK —
pré_cliente/cliente_ativo/participante_familiar), status comercial (os 6 valores
reais citados pelo próprio trigger `fn_cliente_classificacao_guard`: proposta
enviada/aprovada, aceite verbal, contrato assinado, pagamento confirmado,
onboarding), como entrou, origem do dado, data e justificativa da ativação. Não
duplica CRM Vivo/Mesa Discovery — só lê o que essas rotas já gravam.

## 6. Consentimentos — seção nova em Pessoa 360 (LGPD, nunca tinha sido construída)

`consent_records` já é uma entidade real e estruturada (client_id, case_id, tipo,
status, escopo de compartilhamento, coleta, revogação) — já fazia parte da lista de
entidades genéricas de criar/atualizar em `saas.functions.ts`, mas nunca tinha
leitor agregado por pessoa (só existia disperso por caso). `CaCard
titulo="Consentimentos"` novo: lista por pessoa (`client_id`), vocabulário fechado
real (CHECK `consent_records_tipo_chk`: tratamento_dados/
compartilhamento_terceiros/comunicacoes; `consent_records_status_chk`:
coletado/ativo/revogado/expirado), com data de coleta, método, escopo, e motivo/data
de revogação quando aplicável. Nenhuma tabela nova, nenhum escritor novo.

Pessoa 360 passa de 12 para **14** `CaCard` (contagem travada em
`dsa8-pessoa360-cacard.test.ts`, atualizada).

## 7. Cards da Visão Administrativa do Cliente — verificados, sem bug encontrado

Revisão pedida ("verifique também os cards do visao app cliente"): conferidos os
dois pontos que já existiam (`resumoVisaoClienteCaso`, corte P27) — o card "Visão do
cliente" em Caso 360 e "Experiência no App" em Pessoa 360. Ambos leem a mesma fonte,
mostram acesso/próximo passo/último acesso/documentos disponíveis, e a rota
`app-cliente-como-pessoa.tsx` (Visão Administrativa real, 7 abas do App) segue
projetando só dado sanitizado — nenhum CPF/RG aparece ali, corretamente (o App nunca
mostra documento interno, por regra já vigente). Nenhuma correção necessária.

## 8. O que não foi tocado (declarado, não escondido)

- Reconciliação R2-like para RG (`case_members.rg` × `clientes.rg_numero`) — não foi
  pedida nesta rodada; ficou de fora, diferente de CPF/telefone/CEP.
- `case_members.endereco` (texto corrido) continua sem estrutura — diferente do
  endereço já estruturado de `clientes`; não foi pedido migrar/estruturar esta
  rodada.
- Contratos (`contract_parties`) — a varredura desta rodada focou Pessoa 360/Caso 360
  (onde estavam os gaps reais apontados); o pente-fino de contratos citado no pedido
  ("Verifique nos contratos") já tinha sido feito no corte P26 desta sessão
  (`docs/politicas/ADENDO-CONTRATOS-3-DOCUMENTOS-REDESENHO-DESK-2026-09-26.md`) —
  não reaberto aqui sem achado novo.

## Verificação

`tsc --noEmit` limpo. 27 testes novos (`p31-comercial-consentimentos-mascaras-cep-whatsapp-2026-09-26.test.ts`,
20 testes; `validacao-pessoa.test.ts`, 7 testes novos para `emailValido`/
`rgOrgaoUfValido`). 3 testes existentes corrigidos por mudança de import/formatação,
não por regressão (`r2-conflito-cpf-case-members.test.ts`, `pessoa-unica-vinculos.test.ts`,
`dsa8-pessoa360-cacard.test.ts` — contagem 12→14). Suíte completa: 405/412 arquivos,
3824/3843 testes — 7 arquivos/11 testes em falha, idêntico à baseline estável
pré-existente (visual/portal, não relacionados a este corte). `vite build` limpo.
Migration aplicada no banco conectado (Lovable) e registrada em
`supabase_migrations.schema_migrations`.

## Prova Lovable pós-push

- **Comercial/Consentimentos**: abrir `/pessoas/$clienteId` de uma pessoa qualquer —
  conferir os dois cards novos logo abaixo de "Quem é", com dado real (classificação,
  status comercial, consentimentos já registrados se houver).
- **RG/e-mail/telefone/WhatsApp**: em Pessoa 360, clicar "Editar" — RG (órgão/UF)
  aceita "SSP/SP" e recusa "SSP/XX"; e-mail sem "@" é recusado ao salvar; telefone
  incompleto é recusado; novo campo "É WhatsApp?" (Sim/Não) ao lado de Telefone,
  salva e recarrega mantendo o valor.
- **CEP unificado**: em Caso 360, seção "Pessoas do caso", conferir o novo painel
  "Conferir CEP dos membros com o cadastro canônico" — mesmo padrão visual dos
  painéis de CPF/telefone já existentes; "Ver o que será feito" mostra o plano sem
  gravar nada; "Preencher CEPs pendentes" só preenche vazio; conflito exige motivo.
