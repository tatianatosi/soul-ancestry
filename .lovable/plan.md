# CA-LOVABLE-DESK-CANONICO-v1.0 — Corte vertical canônico do Desk

Antes de qualquer código: o inventário mostra que a maior parte do modelo pedido **já existe**. O trabalho é de complemento e consolidação, não de nova construção. Nenhuma aba principal nova, nenhum redesenho.

## 1. Estado atual (verificado no banco)

Já existem, com quase todos os campos pedidos:

| Pedido | Tabela existente | Situação |
|---|---|---|
| contacts | `contacts` | completa |
| conversations | `crm_interactions` | equivalente (`corrige_interacao_id` = supersedes) |
| opportunities | `opportunities` | completa |
| conversion_events | `conversion_events` | completa (validar lista de 16 tipos) |
| families | `nucleos_familiares` | equivalente |
| family_members | `nucleo_membros` | faltam campos de papel/representação |
| case_plans | `case_plans` | completa |
| client_deliverables | `client_deliverables` | completa |
| legacy_imports | `import_batches` | equivalente |
| legacy_record_links | `legacy_record_links` | completa |
| migration_exceptions | `migration_exceptions` | completa |

Decisão: **não duplicar tabelas**. Usar as canônicas existentes e registrar o mapeamento de nomes na Governança.

## 2. Migrations (incrementais, nenhuma migration existente é editada)

**M1 — participantes e núcleos**
- `nucleo_membros`: adicionar `contact_id`, `papel_no_caso` (contratante | titular | dependente | representante | interlocutor_externo), `representacao_necessaria`, `representacao_documentada`, `status_cadastral`.
- `nucleos_familiares`: adicionar `contratante_contact_id`, `status`.

**M2 — casos (campos mínimos ausentes em `crm_casos`)**
- Apenas o que faltar entre: `eixo_comercial`, `eixo_formalizacao_operacao`, `status_caso_derivado`, `responsavel_principal`, `supervisor`, `proxima_acao`, `prazo_proxima_acao`, `citizenship_track_id`, `dossie_mae_referencia_interna`, `origem_do_brief`, `resumo_interno`, `riscos_controlados`, `estado_de_autorizacao_pesquisa` (default `nao_autorizada`).

**M3 — regras de integridade**
- Trigger de imutabilidade em `crm_interactions` (só `archived_at`/`archive_motivo` mudam; correção cria novo registro com `corrige_interacao_id`).
- Trigger em `conversion_events`: imutável + tipo restrito à lista de 16 eventos.
- Trigger em `opportunities`: etapa ativa exige `responsavel_user_id`, `proxima_acao` e `prazo_proxima_acao`.
- Trigger em `conversion_events`: eventos sensíveis (aceite verbal, confirmação formal, contrato assinado, pagamento, onboarding, caso ativo) exigem `evidencia_referencia_interna`.
- Bloqueio de DELETE físico nas 11 entidades (arquivamento lógico com motivo).

**M4 — grants e RLS**
- GRANT para `authenticated` e `service_role` em toda coluna/tabela alterada; sem `anon`.
- Políticas por `organization_id` + papel de equipe; nenhuma política concede acesso ao portal do cliente nessas tabelas.
- Auditoria sanitizada via `fn_audit_campos` nas tabelas novas/alteradas (sem PII, sem preço).

Nenhum INSERT de dado real da Ana ou do João nas migrations.

## 3. Rotas e telas (sem nova aba principal)

As rotas privadas pedidas já têm equivalentes; serão **reaproveitadas**, não duplicadas:

- `/equipe/hoje` → `painel.tsx` (Painel Hoje)
- `/equipe/contatos` → nova sub-seção dentro de `leads.tsx` (CRM Vivo → Leads e triagem)
- `/equipe/oportunidades` → nova sub-seção dentro de `leads.tsx`
- `/equipe/casos` → `casos.index.tsx`
- `/equipe/planejador` → sub-seção da Ficha em `casos.$caseId.index.tsx`
- `/equipe/importacoes` → `importacoes.tsx`

Nenhum item de menu global é adicionado.

## 4. Componentes

- `src/components/crm/form-conversa.tsx` — registro de conversa (tipo, data/hora, resumo validado, responsável, próxima ação, prazo, vínculo obrigatório a contato/oportunidade/caso). Sem envio externo.
- `src/components/crm/registrar-evento-funil.tsx` — botão controlado: tipo manual, responsável, data/hora, referência à conversa; diálogo de confirmação para eventos sensíveis.
- `src/components/crm/painel-contatos.tsx` e `painel-oportunidades.tsx` — listas com responsável/próxima ação/prazo e destaque de itens sem esses campos.
- `src/components/importacoes/importador-placego.tsx` — upload CSV privado, preview, mapeamento manual, deduplicação por telefone normalizado + e-mail, revisão humana, gravação de lote e de `legacy_record_links`. Sem API externa, sem importação automática, só contatos.

## 5. Lógica de servidor

- `src/lib/desk-canonico.functions.ts` — server fns com `requireSupabaseAuth` para: registrar conversa, registrar evento de funil, criar/atualizar oportunidade, importar lote CSV, derivar próxima ação/alerta.
- `src/lib/desk-canonico.ts` — regras puras: lista dos 16 eventos, gates de onboarding (contrato + pagamento + núcleo + dossiê + responsável + plano + checklist + acesso), derivação de `status_caso_derivado`, cadência D7/D10/D14.

## 6. Ana e João

- Ana (`CA-CID-AT-FAM-2026-001`, alias `CA-AUT-ANALUIZA-FAM-2026-001`): apenas leitura/derivação. Estado permanece `pre_onboarding_bloqueado`, pesquisa externa `nao_autorizada`, App Cliente inativo, bloqueios preservados. Nada é criado nem enviado.
- João: **não será criado**. Não há dado autorizado; a estrutura fica vazia e o fluxo é demonstrado apenas pela escada de eventos já existente na Governança.

## 7. Testes

- `src/lib/__tests__/desk-canonico.test.ts`: lista de eventos fechada; aceite verbal não gera cliente ativo/contrato/cobrança; confirmação formal só libera preparação interna; gates de onboarding; oportunidade ativa sem responsável/próxima ação/prazo é rejeitada; dedupe de telefone/e-mail do CSV; sanitização (nenhuma entrega não publicada visível ao App).
- Verificação de RLS por consulta: papel sem permissão não lê as tabelas internas.
- Build + typecheck limpos.

## 8. Rollback

Cada migration é isolada e reversível: M1/M2 são `ADD COLUMN` (drop das colunas reverte), M3 são triggers nomeados (`DROP TRIGGER`), M4 são políticas nomeadas (`DROP POLICY`). Componentes e rotas novos são aditivos — remover os arquivos restaura o comportamento atual. Nenhum dado existente é alterado ou apagado.
