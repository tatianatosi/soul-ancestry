# Fase 1 — Mapear sem modificar (Política Unificada de Casos Familiares)

**Data:** 30 de agosto de 2026 (atualizado após acesso real ao Supabase)
**Documento de origem:** `docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md`, seção 14, Fase 1.
**Branch:** `feat/politica-unificada-casos-familiares`

## Resumo — a maior parte do que este documento previa já não se aplica

A primeira versão deste arquivo (antes do acesso ao Supabase real) presumia que a duplicidade de código do caso da Ana Luiza ainda existia e propunha criar uma tabela `case_code_aliases`. As consultas reais abaixo mostram que isso **já estava corrigido antes desta sessão**. A migration `case_code_aliases` foi removida — criaria uma tabela redundante.

## O que as consultas reais confirmaram (30/08, projeto `zsxpdbhdvbuulwpepemd`)

### 1. Duplicidade de case_code: zero

```sql
select codigo, count(*) from public.crm_casos where archived_at is null group by codigo having count(*) > 1;
-- 0 linhas
```

### 2. O caso da Ana Luiza já está reconciliado, com aliases preservados

Existe **um único** `crm_casos` com código `CA-CID-AT-FAM-2026-001` (id `a11a0000-0000-4000-8000-000000000002`). O código `CA-AUT-ANALUIZA-FAM-2026-001` citado no documento de origem como duplicidade **não existe mais como caso separado** — já é um alias histórico.

A tabela de aliases já existe (não é `case_code_aliases`, é **`case_aliases`** — já no schema, com colunas `case_id`, `alias`, `alias_type`, `source`, `reason`, `superseded_by`) e já tem 3 registros para este caso:

| Alias | Tipo | Origem | Motivo registrado |
|---|---|---|---|
| `CA-AUT-ANALUIZA-FAM-2026-001` | histórico | `migracao_g01` | "Referência legada resolvida... Decisão da Proprietária Administradora em 2026-08-22" |
| `CA-2026-ANA-001` | histórico | `migracao_g01` | idem |
| `CA-CID-AT-2026-002` | histórico | `saneamento_cadeia_ana` | "Consolidação de cadeia real após auditoria de identidade" |

Conclusão: a Fase 2 do documento de origem ("Corrigir Ana Luiza em branch isolada") **já foi feita**, antes desta sessão, por um processo anterior. Não há reconciliação de caso pendente para ela.

### 3. Zero duplicidade de cliente por telefone ou e-mail

Ambas as consultas (`group by telefone`/`group by email having count(*) > 1`) retornaram vazio.

### 4. Zero nome de parte repetido em mais de um contrato

`contract_parties` agrupado por `person_name` normalizado: vazio.

### 5. A família da Ana está de fato ligada, na prática, apesar do schema não ter FK formal

`nucleo_membros.cliente_id` já aponta para `clientes.id` para os 3 signatários (Ana, Adair, Alice) — só o dependente Felipe (menor) não tem `cliente_id`, o que é esperado. O contrato `2026-CB-0001` já tem `contract_parties` completo e correto: Ana como `contracting_client` com CPF preenchido, Adair e Alice como `co_contractor` com CPF, Felipe como `dependent`, e "Clube Ancestral" como `provider` com CNPJ `10.448.812/0001-58`.

**Correção ao que este documento e o Mapa de Autoridade Admin registraram antes deste acesso real:** a hipótese de que a parte contratante do caso da Ana estava vazia/sem CNPJ **não se confirmou no dado real** — ela já estava corretamente preenchida. O bug de constraint (`role: "contratante"` inválido) corrigido na PR #35 é real e continua correto de corrigir — mas não foi a causa do bloqueio relatado neste caso específico, porque este contrato não passou por aquele caminho quebrado.

## O achado que continua real: identidade de pessoa sem ID comum, estruturalmente

Mesmo com os dados de Ana consistentes na prática, a ausência de uma coluna `person_id` compartilhada entre `clientes`, `nucleo_membros`, `contract_parties`, `case_members`, `research_people` e `genealogical_person_profiles` continua sendo um risco estrutural real — só não está causando dano visível no caso da Ana hoje. Vale registrar dois números adicionais encontrados por consulta real:

- **`genealogical_person_profiles` tem 0 linhas em produção.** Ninguém — nem Ana — tem hoje um perfil G-02 criado. A tela "Pessoas e Linhagens" aparecer com o formulário de criação em branco (print enviado pela proprietária) não é um bug: é o estado real, ninguém preencheu essa ficha ainda.
- **`institutional_profiles` existe no schema (colunas `versao`, `status`, `campos` jsonb, `whatsapp_configurado`) mas também tem 0 linhas.** Essa tabela parece ter sido desenhada para substituir o perfil institucional hoje hardcoded como constante no código (`PERFIL_INSTITUCIONAL` em `contrato-base-consolidado.ts`, incluindo o CNPJ `10.448.812/0001-58` da própria Clube Ancestral) — mas nunca foi povoada nem conectada. **Esta é a explicação mais provável para "o CNPJ não muda":** se a proprietária estava tentando editar o CNPJ da própria Clube Ancestral (não o de um cliente), não existe UI nenhuma para isso hoje — o valor está escrito direto no código-fonte, só muda com deploy. Precisa de confirmação dela para saber se é isso mesmo antes de qualquer mudança.

## Próximo passo

Não seguir para Fase 3 (motor `case_participants`) sem antes: (1) confirmar com a proprietária se "CNPJ da contratante" se referia à Clube Ancestral (perfil institucional hardcoded) ou a um cliente específico; (2) decidir, com ela, se vale a pena mover `PERFIL_INSTITUCIONAL` para a tabela `institutional_profiles` já existente e torná-lo editável — isso sozinho pode já resolver o bloqueio relatado, sem precisar da unificação completa de `case_participants`.
