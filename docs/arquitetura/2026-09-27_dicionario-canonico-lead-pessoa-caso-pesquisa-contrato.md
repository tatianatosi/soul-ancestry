# Dicionário canônico executável — Lead → Pessoa → Caso → Pesquisa → Contrato (Fase A, 27/09/2026)

```yaml
status: executado
fase: A de 6 (A-F) — "Cadeia canônica executável" (autorização explícita da Proprietária, 27/09/2026)
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Transforma o mapa de campos (extraído nesta sessão, ver
`docs/arquitetura/MAPA-DADOS-LEAD-A-CLIENTE-2026-09-27.md`) numa cadeia
canônica executável: para cada grupo de campos, declara dono, writer,
readers, propagação permitida, regra de snapshot, regra de conflito,
visibilidade e estado de migração. Nenhuma tabela paralela é criada aqui;
nenhuma fusão automática é introduzida. Isto é o dicionário — a execução
de código que ele referencia está nas Fases B-F (mesmo documento raiz do
plano desta sessão).

## Regra absoluta (vale para todo grupo abaixo, não repetida linha a linha)

- Nome, CPF, e-mail e telefone são **sinais de reconciliação**; nunca
  fazem merge automático (revogado explicitamente na Fase 0 desta sessão,
  27/09/2026 — antes disso, nome exato podia "confirmar" fusão).
- `clientes` é a **Pessoa Canônica** — fonte viva de dados civis
  pós-handoff.
- `case_members` é **papel/vínculo no caso** — seus dados civis são
  compatibilidade (preenchimento local, reconciliável), nunca fonte
  concorrente da Pessoa Canônica.
- `research_people` e `genealogical_person_profiles` **não são** Pessoa
  Canônica — vínculo com `clientes` só por escolha humana
  (`client_id`/`cliente_id` nullable, nunca preenchido por fusão
  automática de nome).
- `contract_parties` é **snapshot de uma versão** — reconcilia antes de
  congelar/enviar; depois de assinado, não reescreve (trigger
  `fn_contract_parties_guard`, Fase 0 + aplicado nesta sessão).
- O **App nunca lê**: `leads`, `research_*` (pesquisa crua), Pessoa 360
  (`clientes` direto), `case_members`, `genealogical_person_profiles`,
  CPF/documento, snapshot de contrato, dados de triagem, score, hipótese
  ou evidência interna — só `portal_casos`, `portal_projecoes`,
  documentos liberados e dados já sanitizados/aprovados (Fase F valida
  isso por teste de fronteira).

## Grupos de campos

### 1. Identificação básica (nome, e-mail, telefone)

| | |
|---|---|
| Dono | `leads` (pré-handoff) → `clientes` (Pessoa Canônica, pós-handoff) |
| Writer | `leads`: Discovery/Mesa de Calls (`salvarLeadDesk`). `clientes`: handoff (cópia única, `handoff-discovery.functions.ts`) + edição direta em Pessoa 360 |
| Readers | Telas Desk (`/leads`, `/calls`, `pessoas.$clienteId.tsx`, `/nucleos`, Caso 360). App nunca lê |
| Propagação permitida | Cópia única no handoff (`leads`→`clientes`, nunca reversa); sinal de divergência (nunca merge) entre `clientes`↔`case_members` (`conferirDivergenciaCampoCivilMembrosCaso`) e `clientes`↔`contract_parties` (`sincronizarContatoPartesDoCaso`) |
| Snapshot | `contract_parties.person_name/email/phone` — reconciliado antes de congelar; imutável pós-assinatura |
| Regra de conflito | Só sinal passivo; nunca fusão automática (Fase 0, 27/09/2026) |
| Visibilidade | Interna (Desk) |
| Estado de migração | **Executado** (Fase 0 + Corte 4 desta sessão) |

### 2. CPF / documento

| | |
|---|---|
| Dono | `clientes.cpf` (Pessoa Canônica) |
| Writer | Pessoa 360; `case_members.cpf` é compatibilidade local |
| Readers | Desk; `contract_parties.document_number` (snapshot) |
| Propagação permitida | `sincronizarPessoaDoCaso` (preenche vazio, nunca sobrescreve divergente); dependente **nunca** herda CPF do responsável |
| Snapshot | `contract_parties`, imutável pós-assinatura |
| Regra de conflito | Divergência = sinal; decisão humana registra motivo |
| Visibilidade | Interna — App nunca lê CPF |
| Estado de migração | **Executado** |

### 3. Endereço estruturado

| | |
|---|---|
| Dono | `clientes.endereco_*` (Pessoa Canônica) |
| Writer | Pessoa 360; `case_members.endereco` (texto único, compatibilidade) |
| Readers | Desk; `contract_parties.address` (snapshot, texto livre) |
| Propagação permitida | `montarEnderecoCanonico` + `sincronizarContatoPartesDoCaso` (Corte 4, preenche vazio, nunca sobrescreve) |
| Snapshot | `contract_parties.address`, imutável pós-assinatura |
| Regra de conflito | Divergência de formatação também é só sinal |
| Visibilidade | Interna |
| Estado de migração | **Executado** (Corte 4, 27/09/2026) |

### 4. Papel no caso (parentesco/vínculo)

| | |
|---|---|
| Dono | `case_members.papel_no_caso` (CHECK real, 5 valores: contratante/titular/dependente/representante/interlocutor_externo) |
| Writer | `/nucleos`, Caso 360 (seção Pessoas e família) |
| Readers | `/nucleos`, Caso 360, Pessoa 360 — todos via `PAPEIS_PESSOA` (mesmo rótulo, unificado na Fase 2 desta sessão) |
| Propagação permitida | Nenhuma — é local ao caso, não migra pra `clientes` nem `research_people` |
| Snapshot | `contract_parties.role` (vocabulário próprio, diferente — mapeado, não copiado 1:1) |
| Regra de conflito | N/A — fonte única |
| Visibilidade | Interna |
| Estado de migração | **Executado** (Fase 2 desta sessão) |

### 5. Dados de pesquisa/genealogia (`research_people`, `genealogical_person_profiles`)

| | |
|---|---|
| Dono | `research_people` (pessoa pesquisada) — **não é Pessoa Canônica** |
| Writer | Ficha Piloto/Pesquisa (`/pesquisas-linhagens`, `/pesquisa-modulo`) |
| Readers | Ficha Piloto, Ficha Genealógica, hub de Pesquisa |
| Propagação permitida | Vínculo com `clientes`/`case_members` **só por escolha humana** (`genealogical_person_profiles.client_id`, nullable) — nunca fusão automática por nome |
| Snapshot | Não aplicável — pesquisa é viva, não versionada como contrato |
| Regra de conflito | Vínculo/desvínculo é ação humana auditada; nunca uma segunda fonte de identidade civil |
| Visibilidade | Interna. Achado/publicação sanitizada pode chegar ao App só via `client_deliverables`/`app_projections` aprovados |
| Estado de migração | **Executado** — vínculo manual já existe; Fase D revisa se a auditoria de vínculo/desvínculo está completa |

### 6. SPIN, objeção, hipótese, score, pesquisa interna, evidência

| | |
|---|---|
| Dono | `leads` (campos SPIN/objeção/nível de intenção) e `research_*` (hipótese/evidência) |
| Writer | Mesa Discovery (SPIN); módulo de Pesquisa (hipótese/evidência) |
| Readers | Só Desk — Mesa Discovery, Ficha Piloto, hub de Pesquisa |
| Propagação permitida | **NENHUMA** — estes campos nunca são copiados para `clientes`, `case_members`, `contract_parties` nem para o App. Terminam a jornada onde nasceram. |
| Snapshot | N/A |
| Regra de conflito | N/A |
| Visibilidade | Estritamente interna |
| Estado de migração | **Executado** (nunca teve propagação — este dicionário só formaliza a regra já vigente) |

### 7. Contrato (`contract_parties`) — snapshot de versão

| | |
|---|---|
| Dono | Snapshot da versão do contrato — nunca fonte mestre |
| Writer | `enviarParaAssinatura` (cópia inicial); reconciliação (Fase 0 + Corte 4) antes de congelar |
| Readers | `/contratos/*`, Caso 360 (seção Formalização) |
| Propagação permitida | Reconciliação Pessoa Canônica → snapshot, só enquanto não assinado (`sincronizarPessoaDoCaso`/`sincronizarContatoPartesDoCaso`) |
| Snapshot | É o próprio conceito do grupo — trigger `fn_contract_parties_guard` recusa `UPDATE` após `contracts.signed_at` |
| Regra de conflito | Antes de assinar: reconcilia (preenche vazio, sinaliza divergente). Depois de assinar: **não reescreve** — correção vira aditivo/complementar |
| Visibilidade | Interna — App nunca lê `contract_parties` |
| Estado de migração | **Executado** (Fase 0 migration `20260927100000`, aplicada nesta sessão) |

### 8. Visibilidade do App (fronteira)

| | |
|---|---|
| Dono | `portal_casos`, `portal_projecoes`, documentos liberados, achados aprovados |
| Writer | Projeção/aprovação humana (Biblioteca Mestre, publicação de achado) |
| Readers | `/portal/*` (App Cliente, 7 abas fixas) |
| Propagação permitida | Só dado já sanitizado e aprovado explicitamente para publicação |
| Snapshot | N/A |
| Regra de conflito | N/A |
| Visibilidade | Pública ao cliente autenticado do próprio caso |
| Estado de migração | Parcialmente executado — Fase F desta rodada estende o teste de fronteira para cobrir todos os módulos deste dicionário |

## Campos que NÃO podem ser copiados entre camadas (proibição explícita)

- SPIN (situação/problema/implicação/necessidade), objeção predominante,
  nível de intenção — nascem e morrem em `leads`.
- Hipótese (`research_hypotheses`/`research_case_hypotheses`/
  `internal_hypothesis`), score/confiança de triagem
  (`confianca_triagem`, `elegibilidade_preliminar`).
- Dados de pesquisa crua (`research_people`, `genealogical_person_profiles`)
  — nunca viram campo de `clientes` nem `case_members`.
- Evidência interna (`research_evidence_items`, `evidencias`) — nunca
  aparece fora de Desk/Pesquisa.

## Verificação

Documento puro — sem código nesta fase. Testes de comportamento das
regras acima já existem, distribuídos pelas fases anteriores desta
sessão (Fase 0: revogação de fusão por nome; Corte 4: reconciliação de
endereço; migration de imutabilidade pós-assinatura). Fase F (adiante)
adiciona o teste de fronteira consolidado.
