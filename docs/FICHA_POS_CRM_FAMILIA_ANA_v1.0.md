# Ficha operacional pós-CRM — Família Ana Luiza

Caso canônico: **CA-CID-AT-FAM-2026-001** (alias histórico `CA-AUT-ANALUIZA-FAM-2026-001`)
Trilha: Áustria — § 58c StbG · Responsável: Tatiana Melani Tosi
Versão: 1.0 · Data: 20/08/2026 · Natureza: **auditoria somente de leitura**

> Nenhuma pessoa, contrato, documento, pasta, mensagem, pagamento, pesquisa externa ou integração
> foi criada, alterada ou executada nesta auditoria. Todas as consultas ao banco foram `SELECT`.

---

## 1. Entidades, campos e vínculos encontrados

### 1.1 Modelo confirmado

| Camada | Tabela | Estado atual do piloto |
| --- | --- | --- |
| Caso familiar | `crm_casos` (`codigo = CA-CID-AT-FAM-2026-001`) | 1 registro — "Projeto familiar — Ana Luiza (piloto real)" |
| Núcleo familiar | `nucleos_familiares` | 1 registro ativo — "Núcleo familiar Silveira / Friedmann-Reimer" |
| Membros do núcleo | `nucleo_membros` | 4 — Ana Luiza, Adair, Alice (`contratante_signatario`, ordem 1–3, com `cliente_id`) e Felipe (`dependente`, ordem 4, `cliente_id = NULL`) |
| Pessoas adultas no CRM | `clientes` | 3 — Ana Luiza Gomes Silveira Rodrigues, Adair Pinto Silveira Júnior, Alice Gomes Silveira (todos `pre_onboarding`) |
| Dependente | `case_dependents` | 1 — Felipe, `vinculo_com_titular = filho`, titular responsável Ana Luiza |
| Contrato-base | `contracts` (`contract_type = contract_base`) | 1 — não assinado |
| Partes contratuais | `contract_parties` | 5 — Clube Ancestral (`provider`), Ana (`contracting_client`), Adair e Alice (`co_contractor`), Felipe (`dependent`, `minor`, `signature_required = false`) |
| Checklist cadastral | `checklist_cadastral` | 38 itens — 33 `pendente`, 5 `aguarda_fonte_societaria` (contratada) |

**Conclusão:** o modelo "um núcleo, um caso familiar, três pessoas adultas no CRM e Felipe como
dependente/beneficiário do Processo A de Ana" está materializado e íntegro no banco. Felipe **não**
possui registro em `clientes`, **não** é signatário e **não** tem acesso ao App.

### 1.2 Camada de código

| Módulo | Papel | Observação |
| --- | --- | --- |
| `src/lib/crm-desk.ts` | Catálogos fechados de eixo comercial, formalização, origem, objetivo, próxima ação; tipo `LeadDesk`; `validarLead` | Preço/SKU/link de pagamento proibidos como texto livre |
| `src/lib/crm-desk.functions.ts` | CRUD de leads e dependentes (`case_dependents`); sincroniza parâmetro `dependentes` a cada gravação | Escreve 9 campos do dependente |
| `src/lib/caso-ficha.ts` | Eixos do caso, `derivarStatusCaso`, `gatesClienteAtivo`, `MAPA_ACOES` | Catálogo próprio, distinto do CRM |
| `src/lib/caso-ficha.functions.ts` | Carrega ficha: `crm_casos`, `case_members`, `caso_log`, `clientes`, `nucleos_familiares`, `tarefas`, `case_timeline_events`, `blueprint_parameters`, `drive_provisioning_queue` | Escopo por `organization_id` |
| `src/lib/ficha-familiar.ts` | Blocos A–E da ficha familiar e regras de origem (`bruta` ⇒ `a_confirmar`, `proibida` ⇒ bloqueio) | **Descritivo, sem tabela própria** |
| `src/lib/nucleo-familiar.functions.ts` | `conferirEstruturaFamiliar` — 5 critérios de conformidade CA-DEC-2026-08-17-01 | Somente leitura |
| `src/lib/dependentes.ts` | Tipo `Dependente`, `STATUS_REPRESENTACAO`, `bloqueiosDependentes` | Espelha o trigger do banco |
| `src/lib/dependentes.server.ts` | `sincronizarParametroDependentes` grava resumo textual em `contract_parameter_values` | `origem = crm`, `status = importado_a_confirmar` |
| `src/components/contrato/painel-dependentes.tsx` | CRUD e exibição de bloqueios/anexos impactados | — |
| `src/components/contrato/estrutura-familiar.tsx` | Painel de conferência da estrutura familiar | Declara explicitamente que não cria caso, contrato, cobrança, assinatura, portal ou pesquisa |

### 1.3 Estado operacional vivo

`eixo_comercial = confirmacao_formal_recebida` · `eixo_formalizacao = formalizacao_em_preparacao` ·
`contrato_assinado = false` · `pagamento_confirmado = false` · `documentos_minimos_ok = false` ·
`ativo = false` · `archived_at = NULL`. Situação operacional coerente com **NO_GO**.

---

## 2. Regra de unicidade para pessoas no CRM

1. **Núcleo por caso** — índice único `nucleos_familiares_caso_unico (case_id) WHERE archived_at IS NULL`:
   um único núcleo ativo por caso familiar.
2. **Pessoa por núcleo** — índice único `nucleo_membros_unico (nucleo_id, lower(nome))`: nome
   case-insensitive único dentro do núcleo; impede duplicar Ana/Adair/Alice/Felipe.
3. **Caso canônico** — `fn_caso_alias_guard` + `codigos_legados` impedem criar um segundo caso com
   código que já seja alias de outro; `resolver_case_canonico` resolve alias histórico para o id canônico.
4. **Signatários** — `conferirEstruturaFamiliar` exige exatamente 3 nomes distintos com papel
   `contratante_signatario` e `cliente_id` preenchido, e exatamente 3 `contract_parties` com
   `signature_required = true` e `role <> 'provider'`.
5. **Checklist** — unicidade `(case_id, pessoa_tipo, pessoa_nome, campo)`. **É por string de nome, não
   por `pessoa_ref_id`** — ponto frágil (ver §6).

---

## 3. Regras de acesso individual e proteção de dados

- **Isolamento multi-tenant:** todas as tabelas do modelo têm RLS por `organization_id`, com políticas
  de leitura via `is_org_member` e escrita via `can_write` (`nucleos_sel/ins/upd`,
  `nucleo_membros_sel/ins/upd`, políticas equivalentes em `case_dependents`, `contract_parties`,
  `checklist_cadastral`).
- **Sem exclusão física:** `fn_block_delete` em `nucleos_familiares`/`nucleo_membros` e
  `trg_cdep_no_delete` em `case_dependents`; apenas arquivamento.
- **Hardening:** `EXECUTE` da função de guarda de dependentes revogado de `PUBLIC`, `anon` e
  `authenticated` (migração 20260819213652).
- **Dado pertence à pessoa:** cada item de `checklist_cadastral` carrega `pessoa_tipo`, `pessoa_nome`,
  `fonte`, `data_verificacao` e `acesso_restrito`; dados de Adair e Alice não são atribuídos a Ana.
- **Auditoria:** gravações passam por `fn_audit`/`fn_audit_status` e `caso_log`; a linha do tempo do
  caso registra marcos em `case_timeline_events`.
- **Projeção ao cliente:** nada da ficha (Bloco D — narrativa, lacunas, hipóteses) é cliente-facing;
  o App só exibe `client_deliverables` aprovados via `app_projection`.

---

## 4. Tratamento específico de Felipe

| Dimensão | Estado | Mecanismo |
| --- | --- | --- |
| Natureza | Dependente/beneficiário do Processo A de Ana Luiza | `nucleo_membros.papel = dependente`, `cliente_id = NULL` |
| Cliente no CRM | **Não** | Sem registro em `clientes` |
| Signatário | **Não** | `contract_parties`: `role = dependent`, `legal_capacity_status = minor`, `signature_required = false`, `signature_status = not_required` |
| Representação | `status_representacao = pendente`, sem `documento_representacao_referencia_interna` | `case_dependents` |
| Participação | `participa_do_contrato = false`, `possui_acesso_app = false`, `anexo_individual_aplicavel = false` | `case_dependents` |
| Bloqueios ativos | `DEPENDENTE_REPRESENTACAO_PENDENTE` se qualquer flag de participação for ligada; `DEPENDENTE_APP_SEM_REPRESENTACAO` se acesso ao App for ligado sem representação documentada; `DEPENDENTE_DOCUMENTO_SEM_REFERENCIA` se marcar `documentada` sem referência | `bloqueiosDependentes` (TS) + `fn_case_dependent_guard` (banco) |

Observação normativa: como Felipe não é signatário, o guard `fn_contract_parties_guard` (menor
signatário exige `represented_by_party_id`) não é acionado — o bloqueio efetivo vem do
`fn_case_dependent_guard`. A dupla barreira TS + trigger está coerente.

---

## 5. Mapa de campos obrigatórios para o piloto

**Caso (`crm_casos`):** `codigo`, `titulo`, `pais`, `via`, `responsavel_principal`, `eixo_comercial`,
`eixo_formalizacao`, `contrato_assinado`, `pagamento_confirmado`, `documentos_minimos_ok`, `ativo`,
`demo = false`. — todos preenchidos.

**Núcleo:** `case_id`, `nome`, mínimo de 3 signatários + 1 dependente. — completo.

**Pessoas adultas (`clientes`):** `nome`, `documento`, `email`, `telefone`, `origem`, `status`.
— Ana completa; **Adair e Alice sem `documento` e contatos completos**.

**Dependente:** `nome_completo`, `vinculo_com_titular`, `titular_responsavel_legal_nome`,
`status_representacao`, e — para participar — `documento_representacao_referencia_interna`.
— pendente por decisão (representação não documentada).

**Partes contratuais:** 1 provider + 3 signatários adultos + 1 dependente sem assinatura. — completo.

**Gates de cliente ativo (`gatesClienteAtivo`):** contrato assinado, pagamento confirmado, responsável
principal, núcleo ok, plano inicial ok, não arquivado. — 4 de 6 pendentes (contrato e pagamento).

**Checklist cadastral:** 38 itens; 33 `pendente`, 5 `aguarda_fonte_societaria` (dados da contratada).

---

## 6. Campos ausentes, ambíguos ou não persistidos

1. **P0 — Divergência de nome de Adair.** `checklist_cadastral` usa `"Adair Gomes Silveira"` (12 linhas)
   enquanto `clientes`, `nucleo_membros` e `contract_parties` usam `"Adair Pinto Silveira Júnior"`.
   Como a unicidade é por string de nome, criou-se uma identidade paralela no checklist que não casa
   com o registro real por nenhum join. **Defeito de dado presente, não hipotético.**
2. **P1 — `dependent_person_id` e `titular_responsavel_legal_id` nunca gravados.** Existem na tabela
   `case_dependents` e no tipo `Dependente`, mas `salvarDependente` não os inclui na whitelist de
   escrita. O vínculo Felipe → Ana existe apenas por texto (`titular_responsavel_legal_nome`).
3. **P1 — Checklist sem FK efetiva.** `pessoa_ref_id` existe mas a unicidade e as junções operam por
   `pessoa_nome`, o que permitiu (1).
4. **P1 — Blocos A–E sem persistência própria.** `ficha-familiar.ts` é módulo descritivo; não há tabela
   `ficha_familiar`. O estado dos blocos é recomputado em runtime a partir de fontes dispersas
   (`crm_casos`, `contract_parameter_values`, `case_dependents`), sem snapshot auditável por bloco.
5. **P2 — `nucleoOk` e `planoInicialOk` derivam de mera existência de linha** (`nucleos_familiares` e
   `tarefas`), não de completude ou status validado — um núcleo vazio contaria como "ok".
6. **P2 — Catálogos duplicados.** `caso-ficha.ts` possui `aceite_verbal`,
   `confirmacao_formal_recebida` e `formalizacao_em_preparacao`, ausentes em `crm-desk.ts`. O valor
   vivo do piloto (`confirmacao_formal_recebida`) ficaria "fora da lista controlada" se avaliado pelo
   catálogo do CRM. Risco latente de drift, sem inconsistência ativa hoje.
7. **P2 — Parâmetro `dependentes` apenas textual.** `sincronizarParametroDependentes` grava um resumo
   em `contract_parameter_values.valor`; não há estrutura por dependente para conferência automática
   de anexos e representação.

---

## 7. Checklist de aceitação antes de ampliar a ficha

- [ ] Nome de Adair reconciliado em `checklist_cadastral` com o registro canônico.
- [ ] Origem da divergência de nome identificada no caminho de escrita do checklist.
- [ ] `pessoa_ref_id` obrigatório e unicidade migrada de nome para referência de pessoa.
- [ ] `dependent_person_id` e `titular_responsavel_legal_id` gravados e verificados para Felipe.
- [ ] `documento` e contatos de Adair e Alice completos ou marcados com fonte e status explícitos.
- [ ] `nucleoOk` e `planoInicialOk` passam a exigir critério de completude, não só existência.
- [ ] Catálogos de eixos unificados ou divergência declarada por decisão registrada.
- [ ] Persistência (ou snapshot auditável) dos Blocos A–E definida.
- [ ] `conferirEstruturaFamiliar` retornando `conforme = true` nos 5 critérios.
- [ ] Representação de Felipe permanece `pendente` e todos os flags de participação em `false` até
      documento interno referenciado.
- [ ] Nenhuma cobrança, assinatura, pasta, mensagem ou pesquisa externa disparada pela ampliação.

---

## 8. Recomendações (modo plano — nada aplicado)

**P0 — Integridade de identidade de pessoa**
1. Reconciliar o nome de Adair no checklist e tornar `pessoa_ref_id` a chave de identidade,
   migrando a unicidade para `(case_id, pessoa_tipo, pessoa_ref_id, campo)`.
2. Adicionar validação de escrita que rejeite `pessoa_nome` divergente do nome canônico da pessoa
   referenciada.

**P1 — Vínculos estruturais**
3. Incluir `dependent_person_id` e `titular_responsavel_legal_id` na whitelist de `salvarDependente`
   e preencher para Felipe a partir do registro de Ana.
4. Substituir o parâmetro textual `dependentes` por estrutura por dependente (nome, vínculo, status
   de representação, anexos aplicáveis), mantendo o resumo apenas como projeção.

**P1 — Ficha familiar auditável**
5. Definir persistência de Blocos A–E (tabela própria ou snapshot versionado) com origem e status por
   campo, respeitando `REGRAS_ORIGEM` (`bruta` ⇒ `a_confirmar`, `proibida` ⇒ bloqueio).

**P2 — Coerência de estado**
6. Endurecer `nucleoOk`/`planoInicialOk` com critérios de completude.
7. Unificar os catálogos de eixos em fonte única compartilhada por `crm-desk.ts` e `caso-ficha.ts`.

**Ordem sugerida:** 1 → 2 → 3 → 4 → 6 → 7 → 5. Nenhuma recomendação deve ser aplicada antes do
checklist da §7 e da liberação dos gates de formalização do caso, que permanece **NO_GO**.
