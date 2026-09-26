# P28 — Verificação ao vivo de P12/P13/P15/P16/P17 + reconciliação de telefone (Pessoa Unificada) (2026-09-26)

```yaml
status: P12-P17 confirmados intactos (consulta direta ao banco real) + 1 gap fechado (telefone)
  + 2 gaps declarados, aguardando decisão
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Execute o plano já aprovado anteriormente p12, p13,p15. P16 e p17 e verifique
  e execute veja se está sendo corretamente aplicado caso seja necessário agregue ao design
  system... faça uma varredura novamente entre máscaras, validações... veja em de para e retire
  sobreposições entre ficha operacional pois lembre-se a Ana e a mesma pessoa iniciada no lead
  até virar cliente!"
```

## Parte 1 — Verificação ao vivo de P12, P13, P15, P16 e P17

Em vez de reexecutar migrations já aplicadas (o que duplicaria trabalho e arriscaria sobrescrever
evolução legítima de cortes posteriores), consultei o banco real
(`mcp__Lovable__query_database`, projeto `1a628b61-ec68-454f-85e1-671d6f297370`) e comparei contra
cada afirmação verificável dos 5 documentos.

| Corte | Afirmação verificável | Consulta | Resultado |
|---|---|---|---|
| P12 | 1 linha ativa por país em `citizenship_tracks`, incluindo NL/EE/LV/LT | `select pais, count(*) ... group by pais` | ✅ Confirmado — 22 países, 1 linha ativa cada, Países Baixos/Estônia/Letônia/Lituânia presentes |
| P12 | Ana Luiza: `crm_casos.citizenship_track_id` = `case_services.citizenship_track_id` = `TRK-AT-58C` | join `crm_casos`/`case_services`/`citizenship_tracks` | ✅ Confirmado — ambos apontam para `adc77966-0aaf-44f0-a822-94bbba326903` |
| P13 | Divergências de preço IT/PT | `count(*) where price_status='DIVERGENTE'` | ✅ Zero hoje — resolvidas em cortes posteriores (P19/P21/P22), não uma regressão |
| P15 | `legacy_catalog_import` = 62 linhas (espelho 1:1 de `price_catalog_rescued` na época) | `count(*)` das duas tabelas | ⚠️ **Achado**: `legacy_catalog_import` continua com 62; `price_catalog_rescued` cresceu para 72 (10 novas linhas de cortes posteriores nunca replicadas). Ver "Gap declarado" abaixo |
| P16/P17 | `planner_catalog_feed` sem nenhum item em `ESPECIFICACAO_PENDENTE` nem `LEGADO_RECONCILIAR` | `select status_dictionary, count(*) group by status_dictionary` | ✅ Confirmado — só `ATIVO_SEM_PRECO_HOMOLOGADO` (68), `CONDICIONAL_POR_CASO` (16), `ATIVO_HOMOLOGADO` (14, cresceu de 1 por homologações posteriores) e `ARQUIVADO_DECISAO_PROPRIETARIA` (1) |

**Conclusão**: os 5 cortes continuam corretamente aplicados em produção — nenhuma reversão, nenhum
drift silencioso (o tipo de risco que a investigação do painel-dia.tsx/painel-desk-hoje.tsx no P26
já tinha exposto como possível, dado o histórico de edições diretas no editor do Lovable). As
diferenças de contagem encontradas são evolução legítima de cortes posteriores (P18-P22), não
regressão.

## Parte 2 — Varredura de máscaras, validações e sobreposições ("ficha operacional")

O Design System **já tem exatamente o documento que a Proprietária lembrava**:
`docs/design-system/mascaras-e-validadores.md` (matriz campo a campo com dona/espelhos/
duplicidade/ação futura) e `docs/design-system/de-para-pessoa-unificada.md` (Ficha Piloto ×
Pesquisa Genealógica, com um plano de migração em 7 cortes crescentes de risco, cada um exigindo
aprovação explícita antes do próximo). Nenhum dos dois precisou ser criado — precisavam ser lidos
e ter o que já estava marcado como "Ação futura" avaliado item a item.

### Gap fechado: telefone (Corte 2 do plano, mesmo nível de risco já aprovado para CPF)

`mascaras-e-validadores.md` §3.2 já apontava telefone com **5 grafias** (`leads.telefone`,
`clientes.telefone`, `case_members.telefone`, `contacts.telefone`, `contract_parties.phone`) e
"Ação futura: Consolidar em Pessoa" — a mesma classe de sobreposição que o CPF (Corte R2,
21/09/2026) já resolveu, no mesmo nível de risco baixo ("Corte 2: relatório com sugestão para
revisão humana, sem ação em lote"). Estendido agora, ponto a ponto:

- `estadoTelefoneMembroCaso`/`sinalTelefoneDaPessoaPorCaso` (`src/lib/pessoa-vinculo.ts`) — mesma
  forma da função de CPF, comparação por dígitos, dependente nunca herda.
- `conferirDivergenciaTelefoneMembrosCaso` (`src/lib/caso-canonico.functions.ts`) — mesmo padrão:
  só preenche telefone vazio a partir de `clientes.telefone`; conflito nunca é sobrescrito
  automaticamente, só com confirmação humana e motivo registrado (auditoria + timeline).
- `ReconciliarTelefoneMembrosCaso` (novo componente, mesmo desenho de
  `ReconciliarCpfMembrosCaso`) — ligado em Caso 360 nos dois ramos (com e sem núcleo vinculado).
- Sinal em Pessoa 360 (`data-pessoa360-sinal-telefone`), ao lado do sinal de CPF já existente.

**Nunca fundido, nunca sobrescrito automaticamente** — mesmas garantias do CPF, mesmo nível do
plano de `de-para-pessoa-unificada.md` (Corte 2, risco baixo, reversível).

### Achado de sobreposição pré-existente corrigido nesta rodada (não fabricado, achado por leitura)

A tabela de leitura de membros do caso (`pessoasDoCasoComFallbackNucleo`, usada tanto pelo
servidor de reconciliação quanto pelo sinal da Pessoa 360) **não carregava `telefone`** — só
`cpf` e os demais campos já usados. Adicionado `telefone` ao `select` e ao tipo `PessoaDoCaso`
(placeholder `null` para membros projetados de Núcleo, mesmo padrão de `cpf`). Sem esse campo, o
sinal de telefone teria classificado todo membro como "preencher" mesmo quando já tinha telefone —
um bug que teria nascido junto com a funcionalidade se não fosse conferido antes de publicar.

### Gaps declarados, aguardando decisão (não executados — mesma cautela do CPF/telefone)

1. **Nome (6 grafias)** — `mascaras-e-validadores.md` já marca "Eleger `case_members` como dona e
   tornar os demais leitura". Diferente de CPF/telefone (comparação exata por dígitos), nome é
   texto livre: duas grafias podem ser a mesma pessoa com variação de escrita OU duas pessoas
   diferentes por coincidência. Uma regra de normalização (trim/case/acento, "nome social não
   compete com nome civil") precisa ser decidida pela Proprietária antes de eu implementar
   qualquer comparação automática — decidir sozinho aqui seria o mesmo erro que o `AGENTS.md`
   proíbe ("fusão automática por nome, e-mail ou telefone coincidentes... no máximo, sugestão de
   revisão humana", já escrito em `de-para-pessoa-unificada.md` §4.6).
2. **E-mail (5 grafias)** — mesma classe de decisão do Nome (normalização de maiúsculas/minúsculas
   e domínio já existe como regra de formatação, mas "qual é o e-mail canônico quando há mais de
   um registrado" ainda não foi decidido).
3. **`legacy_catalog_import` desatualizado (62 vs 72 linhas de `price_catalog_rescued`)** — achado
   nesta verificação, não fabricado. Backfill das 10 linhas novas é aditivo e de baixo risco, mas
   fica registrado para autorização explícita antes de tocar em uma tabela de rastreabilidade de
   preços.
4. **RG (órgão emissor/UF), endereço estruturado, WhatsApp como campo próprio** — já registrados
   como "Lacuna"/"Ação futura" em `mascaras-e-validadores.md`, todos exigindo coluna nova
   (decisão de schema, fora do escopo de "Corte 2").

## Verificação

`tsc --noEmit` limpo. 14 testes novos
(`p28-reconciliacao-telefone-e-verificacao-p12-p17-2026-09-26.test.ts`) cobrindo as funções puras,
o servidor e a UI dos dois lados (Caso 360 e Pessoa 360). 1 teste existente atualizado
(`r2-conflito-cpf-case-members.test.ts` — import combinado de `estadoCpfMembroCaso` +
`estadoTelefoneMembroCaso`, mesmo módulo). Suíte completa idêntica à baseline estável (7
arquivos/11 testes pré-existentes). `vite build` limpo.

## Prova Lovable pós-push

Em `/casos/$caseId` de um caso com membro vinculado a uma pessoa cadastrada: conferir o novo
painel "Conferir telefone dos membros com o cadastro canônico", logo abaixo do painel de CPF —
"Ver o que será feito" mostra o plano; "Preencher telefones pendentes" só preenche vazios; um
telefone divergente aparece como conflito, resolvido membro a membro com motivo. Em
`/pessoas/$clienteId`: conferir o sinal "Telefone deste registro no caso..." ao lado do sinal de
CPF já existente, com o mesmo link "Conferir" de volta ao Caso 360.
