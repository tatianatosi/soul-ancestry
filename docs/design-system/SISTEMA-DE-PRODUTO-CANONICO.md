# Sistema de Produto Canônico

- Status: rascunho
- Versão: v1.1
- Data: 2026-09-19
- Responsável pela decisão: Proprietária do Clube Ancestral
- Fonte(s) de evidência: os 11 arquivos de `docs/design-system/` listados na seção 8.1 (SHA por arquivo ali); mais, confirmados por `git ls-tree origin/main` no commit `06477fe26bdb17a0ffc75e7e09626495077344ff` (2026-09-19), fora de `docs/design-system/`: os arquivos de `docs/arquitetura/` e `.lovable/plan/` listados na seção 8.3. **Nota de proveniência desta versão**: um documento chamado `2026-09-19-validacao-inventario-fontes-documentais.md` foi citado como fonte [1] no pedido que motivou esta revisão; verificado por `git ls-tree -r origin/main | grep` nesta sessão e **não encontrado** em nenhum caminho de `origin/main`, nem anexado à conversa — não é tratado como fonte. As reclassificações desta versão se apoiam apenas na verificação independente já registrada nas seções 8.1 e 8.3.
- Escopo: instrumento de leitura que localiza e relaciona a documentação canônica de identidade/pessoas, casos/pesquisa, contrato, CRM, produtos/jornadas, cobrança, App do Cliente, Desk, CTAs, máscaras, validações, visibilidade, sanitização e auditoria — sem inventar regra nova.
- Premissas: fonte canônica é o que está publicado em `origin/main` ou fornecido integralmente pela Proprietária nesta conversa; arquivo presente só em worktree/branch local não publicado não tem status canônico, ainda que tecnicamente correto.
- Limites: não altera código, schema, migration, RLS, dado, rota, componente, teste, variável de ambiente ou documento-fonte. Não aprova arquitetura, regra jurídica ou publicação. A única escrita realizada é este próprio arquivo, no worktree onde a tarefa foi executada.
- Próximos passos: revisão pela Proprietária; decisão sobre publicar (ou não) o conteúdo hoje preso em `docs/design-system/` não versionado neste branch local (seção 8.2); resolução das pendências da seção 9 caso a caso, com dono e prazo.
- Critério de aceite: ver seção 10.

---

## 1. Objetivo e função do documento-mestre

Este documento responde a três perguntas operacionais, sem duplicar o conteúdo das fontes:

1. Onde está a regra canônica aplicável a uma decisão de interface, dado, visibilidade, CTA, contrato ou cobrança?
2. Qual superfície é afetada — App do Cliente, Desk, contrato, CRM, Planejador, motores — e qual documento em `origin/main` já governa essa superfície?
3. Quando uma informação não está documentada em `origin/main`, como registrar a lacuna como pendência com dono e próximo passo, em vez de inventar regra ou tratar rascunho de sessão como fonte?

Nenhuma afirmação aqui prevalece sobre decisão explícita e atual da Proprietária, exigência jurídica validada, documento aprovado em `origin/main`, ou implementação já publicada e comprovada.

## 2. Hierarquia de fontes e regra de resolução de conflitos

1. Decisão explícita e mais recente da Proprietária do Clube Ancestral.
2. Exigência jurídica válida e orientação profissional formalmente adotada.
3. Documento aprovado em `origin/main`, no caminho canônico (`docs/design-system/`), e schema/migrations/código efetivamente publicados em `origin/main`.
4. Mockup aprovado de 17 páginas (`docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf`) como contrato visual normativo.
5. Demais políticas aprovadas em `docs/politicas/` de `origin/main`.
6. Documento presente apenas em branch local, worktree ou sessão de agente — nunca fonte, apenas registro de trabalho até publicação e aprovação.
7. Materiais legados — histórico/auditoria, nunca motor de priorização atual.

Regra de resolução: a existência de um caminho é testada por `git ls-tree`/`git show` contra `origin/main`, nunca presumida por memória de sessão ou por relato de outro agente. Um documento sem essa prova é `NÃO LOCALIZADO APÓS VERIFICAÇÃO` ou, se existir apenas localmente, é listado na seção 8.2 sem status canônico. Teste verde, build, PR aberto ou declaração de agente não promovem um documento a canônico.

## 3. Mapa de domínios

| Domínio | Entidades reais (schema, conforme `AGENTS.md` e fontes abaixo) | Documento(s) em `origin/main` | Estado |
|---|---|---|---|
| Identidade / pessoas | `leads`, `contacts`, `clientes`, `case_members`, `nucleo_membros`, `research_people`, `genealogical_person_profiles`, `contract_parties`, `authorized_portal_emails`, `client_portal_access` | `taxonomia-canonica.md`, `de-para-pessoa-unificada.md`, `mascaras-e-validadores.md` | VERIFICADO |
| Casos / pesquisa | `crm_casos` (eixo), `casos` (não tratar como segundo eixo sem decisão), `research_cases`, `research_sources`, `case_members` | `taxonomia-canonica.md` §2; `AGENTS.md` (tabela de schema) | VERIFICADO |
| Contrato | `contracts`, `contract_parties`, `contract_case_parameters`, `contract_parameter_previews`, `service_orders` | `contrato-cta-contexto-e-prova.md` (regras de CTA/estado); modelo de dados detalhado do contrato não tem documento dedicado em `docs/design-system/` de `origin/main` | PARCIAL — modelo de estados/CTA VERIFICADO; modelo de dados fino PENDENTE DE DECISÃO (ver 9.3) |
| CRM / produtos / jornadas | `leads`, `crm_casos`, Planejador (camada de dados, não rota própria) | Sem documento dedicado em `docs/design-system/`; **verificado em `origin/main`** em `docs/arquitetura/` (Planejador, produtos-pai, trilhas jurídicas, motores, CRM Vivo, Discovery — caminhos completos na seção 8.3) | VERIFICADO EM `origin/main` (fora do caminho canônico `docs/design-system/` — ver 8.3) |
| Cobrança | `invoices`, `payments`, `eventos_financeiros` (não o Asaas legado) | Citado em `contrato-interface-app-cliente.md` (linha "Conta") e em `AGENTS.md`; sem documento dedicado de regras financeiras em `docs/design-system/` | PARCIAL — ver 9.3 |
| Operação / auditoria | `audit_logs`, `owner_override_events`, `case_timeline_events`, `case_phase_history` | Citado em `AGENTS.md`; tratamento operacional em `contrato-cta-contexto-e-prova.md` ("Estados de entrega") | PARCIAL |
| App do Cliente | Projeção autorizada sobre os domínios acima | `contrato-interface-app-cliente.md`, `visibilidade-e-sanitizacao.md` | VERIFICADO |
| Desk | Operação, decisão humana, evidência, auditoria | `contrato-interface-desk.md`, `componentes.md`, `regras-de-uso.md` | VERIFICADO |

## 4. Contrato entre App do Cliente e Desk

**Fonte de verdade**: o Desk é soberano; o App é projeção autorizada, nunca uma segunda base (`visibilidade-e-sanitizacao.md` §1). Nada aparece no App por consequência de existir no Desk — aparece porque alguém publicou, com autor, data, caso e estado registrados.

**Navegação imutável** (`contrato-interface-app-cliente.md`, `contrato-interface-desk.md`, `regras-de-uso.md` regra 6):

```text
App Cliente: Home → Jornada → Radar → Árvore → Documentos → Legado → Conta   (exatamente 7 abas)
Desk:        Visão Geral → Casos 360 → Checklist → Validação Jurídica → Radar Interno → Alertas → Biblioteca Mestre
Grupos internos do Desk (contexto/filtro, não navegação paralela): Hoje · Comercial · Casos & Pessoas · Pesquisa · Formalização · Governança
```

**Dados exibidos ao cliente** (por aba, `contrato-interface-app-cliente.md`): cabeçalho e progresso do caso, etapas públicas e marcos publicados, seis dimensões do Radar já publicadas, relações genealógicas aprovadas e publicadas, documentos publicados com nome legível, narrativa de Legado aprovada, identidade da própria pessoa/contrato/faturas registradas em Conta.

**Dados proibidos no App** (`visibilidade-e-sanitizacao.md` §3, `contrato-interface-app-cliente.md` coluna "Conteúdo proibido"): dado sensível de terceiros fora da relação do caso; hipótese apresentada como fato (`asserted`, `under_review`, `tentative`, `conflicting`, `a_confirmar`); evidência bruta; token e material de acesso; SKU e catálogo técnico; preço técnico fora do valor da proposta aprovada; nome de gate (`STATUS_GATE_PESQUISA` e equivalentes); nota interna (`notes_internal`, `internal_notes`, `observacao_interna`, `observacoes_protegidas`, `motivo_recusa`, `revocation_reason`, `suspension_reason`); juízo de mérito (chance, probabilidade, "hipótese forte"); dado de outro caso/cliente, inclusive agregado; nome técnico de tabela/coluna/rota/função; cobrança não confirmada.

**Responsabilidades**: Desk publica e despublica com autor/data/caso/estado, sem SQL manual; salvar nunca publica; publicar não envia; enviar não assina; assinar não cobra (`contrato-cta-contexto-e-prova.md`).

## 5. Padrão de entidades, estados, gates de decisão humana, evidência e auditoria

Cadeia mínima verificável, já fixada em `AGENTS.md`: entrada → decisão → criação/atualização do caso → plano → execução → evidência → comunicação → acompanhamento → encerramento. Um caso ativo precisa responder qual é a próxima ação concreta, quem executa, quando, o que bloqueia — "sem informação" não é estado aceitável (usar aguardando / pausado / encerrado / cancelado).

**Publicação como cadeia de decisões humanas** (`visibilidade-e-sanitizacao.md` §2):

```text
dado interno → reescrita sanitizada → revisão humana → aprovada → publicação (autor, data, caso) → App Cliente
```

**Estados de entrega de um corte de produto** (`contrato-cta-contexto-e-prova.md`): `DOCUMENTADO` → `CODIFICADO` → `TESTADO` → `MESCLADO` → `DEPLOYADO` → `PROVADO` → `ACEITO`. Somente `ACEITO` (confirmação explícita da Proprietária) encerra um corte; nenhum estado anterior o substitui.

**Vocabulário CHECK gravável** (`AGENTS.md`, não repetido por extenso aqui): `status_pesquisa`, `evidences.workflow_status`, `case_plans.fase_jornada`, `client_visibility` (`interna` | `sanitizada` | `aprovada`, coerente com `visibilidade-e-sanitizacao.md` §2). Não inventar sinônimo fora dessas listas.

**Auditoria**: colunas de auditoria já existentes (`created_by`/`updated_by`, `updated_at`) e tabelas `audit_logs`, `owner_override_events`, `case_phase_history`, `case_timeline_events` — nenhum campo novo é necessário para registrar autoria/data de uma decisão.

## 6. Catálogo de CTAs críticos

Regras gerais já fixadas (`contrato-cta-contexto-e-prova.md`): um CTA principal por estado; contexto (`case_id`, pessoa/titular, objeto) nunca é perdido silenciosamente; CTA só existe com rota/função/persistência real; verbos não se confundem (salvar ≠ publicar ≠ enviar ≠ assinar ≠ cobrar); ação irreversível exige confirmação; todo erro é recuperável e preserva contexto.

| Rótulo | Intenção | Alvo | Ator | Pré-condição | Efeito | Confirmação | Falha | Fonte |
|---|---|---|---|---|---|---|---|---|
| Publicar | Tornar visível ao App | Projeção do caso | Equipe (Desk) | Conteúdo revisado e sanitizado | Muda `client_visibility` para `aprovada`; registra autor/data/caso | Ação distinta de "salvar rascunho" | Se sanitização/revisão ausente, CTA não aparece | `visibilidade-e-sanitizacao.md` §2, §7 |
| Confirmar documentos mínimos | Registrar que o mínimo documental do caso foi conferido | Caso | Equipe (Desk) | — | Grava `crm_casos.documentos_minimos_ok`; gate do portal consulta esse campo | Preservação exigida por `AGENTS.md` (não regredir PR #85) | Não especificado nesta leitura | `AGENTS.md` §"PR #85 e entrega real" |
| Enviar para assinatura | Formalizar contrato | Contrato | Equipe (Desk) | Perfil institucional/parte contratante válidos | Muda estado do contrato; aciona fluxo de assinatura | Ação distinta de "assinar" | Risco de violação de constraint em `contract_parties.role = "contratante"` já registrado como pendência não verificada nesta rodada — ver 9.4 | `contrato-cta-contexto-e-prova.md`; achado de sessão anterior, não re-verificado aqui |
| Demais CTAs por aba do App/Desk | Ver colunas "CTA permitido" | Por aba/tela | Equipe ou cliente, conforme aba | Fonte real publicada | Ver contrato de cada aba/tela | Ver contrato de cada aba/tela | Ver estado vazio canônico de cada aba/tela | `contrato-interface-app-cliente.md`, `contrato-interface-desk.md` |

Catálogo não é exaustivo: qualquer CTA fora desta lista deve ser verificado contra o documento de contrato da aba/tela correspondente antes de ser tratado como regra.

## 7. Regras de máscaras, validação, normalização e sanitização

**Regra central**: máscara se reutiliza, não se recria (`mascaras-e-validadores.md` §1). Módulos únicos e fonte de verdade: `src/lib/validacao-pessoa.ts` (`formatarCpf`, `cpfValido`, `formatarCep`, `cepValido`, `UFS_BRASIL`, `ufValida`, `formatarTelefone`, `telefoneValido`) e `src/lib/persistencia-mascara.ts` (`CAMPOS_SENSIVEIS`, `ehCampoSensivel`, `mascararValor`, `mascararParaLog`). Anti-padrões proibidos: `replace(/\D/g,'')` solto em componente, `maxLength` como substituto de validação, máscara só no envio, validação só no cliente para campo que o servidor grava, segundo validador de CPF copiado.

**Visibilidade por campo** usa três graus (`interna`, `sanitizada`, `protegida` — este último nunca sai do Desk, nem mascarado em log), com matriz por campo (nome, contato, documentos civis, endereço, nascimento/óbito, atributos civis, papéis, consentimentos, identificadores) já fechada em `mascaras-e-validadores.md` §3. Não repetida linha a linha aqui — qualquer novo campo de pessoa deve ser conferido contra essa matriz antes de ganhar formulário próprio.

**Regra de ouro de sanitização** (`visibilidade-e-sanitizacao.md` §3, §5): hipótese nunca vira fato; vínculo genealógico só é desenhado quando aprovado e publicado; data aproximada nunca vira data exata; nenhuma fusão de pessoa por semelhança de nome, e-mail ou telefone — apenas sugestão para revisão humana.

## 8. Matriz de fontes

**Padrão de redação desta seção**: toda linha `VERIFICADO` segue o formato `VERIFICADO EM origin/main — SHA de referência: 06477fe2 (ou SHA de último toque do arquivo, quando mais preciso) — Verificação: git ls-tree / git show em 2026-09-19`. Toda linha pendente segue `PENDENTE DE DECISÃO DA PROPRIETÁRIA — há candidato remoto identificado, mas nome/versão/data/contagem não confirmados; o candidato não deve ser tratado como equivalência canônica`. Fonte externa ao Git segue `FONTE AUXILIAR EXTERNA AO GIT — não verificável pelo repositório — uso permitido: contexto auxiliar — uso proibido: declarar como política versionada ou decisão canônica sem registro explícito`.

### 8.1 Confirmadas em `origin/main`, caminho canônico `docs/design-system/` (commit `06477fe26bdb17a0ffc75e7e09626495077344ff`, 2026-09-19)

| Caminho | Existe em `origin/main` | SHA do último commit que tocou o arquivo | Assunto governado | Estado de leitura | Lacuna / conflito |
|---|---|---|---|---|---|
| `docs/design-system/README.md` | Sim | `9b04461b` (2026-09-18) | Índice do conjunto | Lido integralmente | Nenhuma |
| `docs/design-system/taxonomia-canonica.md` | Sim | `73767b9b` (2026-09-16) | Identidade única da pessoa, ciclo completo, vocabulário de interface | Lido integralmente | Dívida declarada no próprio doc: 8 grafias de nome sem chave comum; não é conflito, é dívida assumida |
| `docs/design-system/mascaras-e-validadores.md` | Sim | `d17d51bf` (2026-09-16) | Máscaras, validadores, matriz de campo por campo | Lido integralmente | Lacunas explícitas: nome, RG, órgão emissor, UF emissora sem validador único; WhatsApp sem campo dedicado |
| `docs/design-system/visibilidade-e-sanitizacao.md` | Sim | `28f19b45` (2026-09-16) | O que pode/não pode chegar ao App | Lido integralmente | Nenhuma |
| `docs/design-system/contrato-interface-app-cliente.md` | Sim | `9b04461b` (2026-09-18) | Contrato das 7 abas do App | Lido integralmente | Nenhuma |
| `docs/design-system/contrato-interface-desk.md` | Sim | `9b04461b` (2026-09-18) | Contrato das 7 telas / 6 grupos do Desk | Lido integralmente | Nenhuma |
| `docs/design-system/contrato-cta-contexto-e-prova.md` | Sim | `9b04461b` (2026-09-18) | CTA, contexto, persistência, prova | Lido integralmente | Nenhuma |
| `docs/design-system/componentes.md` | Sim | `4272151b` (2026-09-16) | Componentes, cópias a consolidar, sequência de cortes | Lido integralmente | Nenhuma |
| `docs/design-system/tokens.md` | Sim | `4272151b` (2026-09-16) | Tokens de marca, estado semântico, valores legados | Lido integralmente | Nenhuma |
| `docs/design-system/regras-de-uso.md` | Sim | `4272151b` (2026-09-16) | Regras obrigatórias de cor, KPI, selo, vazio, CTA, navegação | Lido integralmente | Nenhuma |
| `docs/design-system/de-para-pessoa-unificada.md` | Sim | `aab3a58c` (2026-09-16) | De-para e roteiro de evolução da Pessoa Unificada | Confirmado presente; conteúdo já verificado em rodada anterior desta mesma sessão (spot-check ainda válido) | Nenhuma nesta verificação |
| `docs/design-system/SISTEMA-DE-PRODUTO-CANONICO.md` | **Não** | — | — | — | Este próprio documento não existe em `origin/main`; existe apenas como rascunho local nesta tarefa, com status `RASCUNHO_LOCAL` até publicação e aprovação |

### 8.3 Confirmadas em `origin/main`, fora do caminho canônico `docs/design-system/`

Verificado por `git ls-tree -r --name-only origin/main` nesta sessão (2026-09-19), commit `06477fe2`. Existência confirmada; leitura de conteúdo integral **não** foi feita para todos — só caracterização por título/caminho, suficiente para classificar como `VERIFICADO EM origin/main` quanto à **existência**, não quanto ao conteúdo detalhado (marcado abaixo onde a diferença importa).

| Assunto | Caminho(s) em `origin/main` | Verificação |
|---|---|---|
| Planejador, produtos-pai | `docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`, `2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md`, `2026-09-03_DE-PARA-PLANEJADOR-CIDADANIA-PRODUTO-PAI-MOTORES-UNIFICADOS.md`, `2026-09-04_MATRIZ-HOMOLOGACAO-PRODUTOS-PAI-PP01-PP08.md` | Existência confirmada; conteúdo não relido nesta sessão |
| Trilhas jurídicas | `docs/arquitetura/2026-09-09_DE-PARA-PLANEJADOR-MARCOS-JURIDICOS-CRM-VIVO-vs-PRECOS-RESGATADOS.md` | Existência confirmada; conteúdo não relido nesta sessão |
| Motores e varreduras | `docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md`, `MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md`, `contexto-motor-cidadania-v1.0.md` | Existência confirmada; conteúdo não relido nesta sessão |
| CRM Vivo e Discovery | `docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md`, `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md`; código: `src/lib/discovery-roteiro.ts`, `src/lib/handoff-discovery.ts` | Existência confirmada; conteúdo não relido nesta sessão |
| Wireframe do Contrato Ana | `.lovable/plan/contrato-da-ana-resgate-em-leitura-e-wireframe-contínuo-2026-09-17.md`, `.lovable/plan/wireframe-tela-única-de-contrato-da-ana-vinculada-ao-canva-2026-09-16.md`, `.lovable/plan/fechamento-de-evidência-p0-acesso-e-wireframe-do-contrato-da-2026-09-19.md` | Existência confirmada; conteúdo não relido nesta sessão — **nota**: são planos/registros de sessão do Lovable, não uma política aprovada equivalente aos contratos de `docs/design-system/` |
| Prancha Desk v6 | `.lovable/plan/correção-integral-do-desk-prancha-v6-2026-09-16.md`, `.lovable/plan/revisão-integral-das-15-superfícies-do-desk-prancha-v6-2026-09-15.md` | Existência confirmada; mesma nota acima — plano de sessão, não arquivo de imagem/prancha propriamente dita |
| De-para das 15 superfícies do Desk | `.lovable/plan/revisão-integral-das-15-superfícies-do-desk-prancha-v6-2026-09-15.md` | Existência confirmada; mesma nota acima |

Registro importante: os itens acima são `VERIFICADO EM origin/main` **quanto à existência do caminho**, mas são planos/registros de sessão do Lovable (`.lovable/plan/`) ou documentos de arquitetura históricos (`docs/arquitetura/`) — não substituem nem têm o mesmo peso normativo dos 11 documentos de `docs/design-system/` (seção 8.1), que são a política de design system efetivamente vigente. Tratar como fonte especializada complementar, não como equivalência 1:1.

### 8.4 Fontes locais não publicadas (sem status canônico)

Achado desta verificação: o checkout atual (branch `fix/p0-magic-link-master-invoices`, `HEAD` `0e7b3e1e`) tem um diretório `docs/design-system/` inteiramente **não rastreado pelo Git** (`git ls-tree HEAD -- docs/design-system` retorna vazio) — ou seja, nenhum destes arquivos existe em nenhum commit, branch publicada ou `origin/main`. São arquivos soltos em disco, produzidos em 17/09/2026 por uma sessão anterior de agente, nunca commitados:

| Caminho (não rastreado) | Assunto | Observação |
|---|---|---|
| `docs/design-system/README.md` | Índice de um pacote diferente do que está em `origin/main` | Mesmo nome, conteúdo divergente do `README.md` real |
| `docs/design-system/SISTEMA-DE-PRODUTO-CANONICO.md` (versão anterior a este arquivo) | Rascunho anterior deste mesmo documento-mestre | Citava `origin/main` em `bc3c9944`, hoje ultrapassado (`origin/main` avançou para `06477fe2`); citava dois commits locais (`ff754dcb`, `0e7b3e1e`) nunca publicados |
| `docs/design-system/conteudo-app-cliente-7-abas.md` | Conteúdo das 7 abas do App | Sobreposto, sem ser idêntico, a `contrato-interface-app-cliente.md` (real, em `origin/main`) |
| `docs/design-system/crm-vivo-e-roteiro-discovery.md` | CRM Vivo e roteiro de Discovery | Sem equivalente em `origin/main/docs/design-system` |
| `docs/design-system/de-para-desk-15-superficies.md` | De-para das 15 superfícies do mockup do Desk × rotas reais | Corresponde ao item "de-para das 15 superfícies" citado como pendência em rascunhos anteriores desta sessão |
| `docs/design-system/de-para-pessoa-unificada.md` | Pessoa Unificada, 13 entidades | **Mesmo nome** do arquivo real e diferente em `origin/main` — risco concreto de confusão de qual versão é lida |
| `docs/design-system/guia-prompts-cortes-finais.md` | Modelo de prompt para microcortes | Sem equivalente em `origin/main` |
| `docs/design-system/matriz-integral-rotas.md` | Matriz rota a rota (108 rotas declaradas) | `NÃO LOCALIZADO APÓS VERIFICAÇÃO` em `origin/main` — existe somente como arquivo local não rastreado neste checkout; **removido desta versão de qualquer lista de fontes verificáveis**. Não confundir com o candidato remoto de 9.6 (`CA-UX-03_Matriz_Rotas_e_Modulos.csv`), que é um arquivo diferente |
| `docs/design-system/motores-e-varreduras-como-apoio.md` | Motores e varreduras como apoio, não fonte paralela | Sem equivalente em `origin/main` |
| `docs/design-system/taxonomia-interface-ctas.md` | Taxonomia de interface e CTAs | Sobreposto, sem ser idêntico, a `contrato-cta-contexto-e-prova.md` (real, em `origin/main`) |
| `docs/design-system/trilhas-juridicas-planejador-e-produtos-pai.md` | Trilhas jurídicas, Planejador, produtos-pai | Sem equivalente em `origin/main` |

Todos datados de 17/09/2026, todos citando como autoridade primária o "Product Knowledge canônico do workspace Lovable" — uma fonte que não é arquivo de repositório e não pôde ser reverificada nesta tarefa (sem acesso à ferramenta Lovable nesta sessão). Nenhum deles é tratado como fonte canônica neste documento. Nenhum foi descartado, sobrescrito ou modificado por esta tarefa — apenas o arquivo-alvo (`SISTEMA-DE-PRODUTO-CANONICO.md`) foi atualizado, conforme autorizado.

Também presentes no `git status --short` do checkout, sem relação com esta tarefa e não tocados: 12 arquivos rastreados modificados (`src/components/...`, `src/lib/...`, `src/routes/...`, `src/styles.css`) e ~25 outros arquivos/diretórios não rastreados (`docs/README-SISTEMA-PRODUTO-CLUBE-ANCESTRAL.md`, `docs/contratos/`, vários `docs/relatorios/2026-09-1{3,4,6,7}-*.md`, `src/components/go-live/`, `src/routes/_authenticated/go-live.*.tsx`, testes) — WIP pré-existente e não relacionado, preservado intacto.

## 9. Registro de divergências e pendências

| ID | Pendência | Dono | Próximo passo |
|---|---|---|---|
| 9.1 | Existem dois arquivos de nome idêntico e propósito sobreposto — `de-para-pessoa-unificada.md` real (em `origin/main`) e a versão local não publicada (8.2) — com risco de um agente futuro ler a versão errada neste checkout | Proprietária / próximo agente | Ao trabalhar neste checkout específico, sempre confirmar com `git show origin/main:<caminho>` antes de tratar o conteúdo como fonte |
| 9.2 | O corpo de 11 arquivos locais não publicados (8.2) cobre lacunas reais do rascunho anterior (matriz de rotas, de-para de 15 superfícies, CRM/Discovery, trilhas jurídicas) mas nunca foi revisado nem publicado pela Proprietária | Proprietária | Decidir: publicar (todo ou em parte, com revisão prévia) em `origin/main`, ou descartar como rascunho superado — nenhuma das duas ações foi tomada nesta tarefa |
| 9.3 | Não existe, em `docs/design-system/` de `origin/main`, um documento dedicado ao modelo de dados fino de contrato (`contract_case_parameters`, `contract_parameter_previews`, `service_orders`) nem a regras de cobrança (`invoices`, `payments`, `eventos_financeiros`) equivalente em detalhe aos documentos de App/Desk | Proprietária | Decidir se um documento assim deve ser criado, e a partir de qual fonte (schema real, não o rascunho local de 17/09) |
| 9.4 | Risco de `enviarParaAssinatura` gravar `role: "contratante"` em desacordo com o CHECK de `contract_parties`, achado em rodada anterior desta sessão (`src/lib/contrato-parametros.functions.ts`) — não re-verificado nesta tarefa, que foi só leitura de `docs/design-system/` | Proprietária | Pedido específico de leitura de código para confirmar ou descartar, fora do escopo desta tarefa |
| 9.5 | **Prancha App v4** — `PENDENTE DE DECISÃO DA PROPRIETÁRIA`: há candidatos em `.lovable/plan/` (`alinhamento-visual-completo-do-app-cliente-à-prancha-aprovad-2026-09-15.md`, `novas-pranchas-visuais-app-cliente-e-desk-conferidas-contra-2026-09-15.md`), mas nome/versão "v4" não confirmado em nenhum deles | Proprietária | Confirmar qual candidato (se algum) é "v4", ou declarar que o rótulo é só do Product Knowledge |
| 9.6 | **Matriz "108 rotas"** — `PENDENTE DE DECISÃO DA PROPRIETÁRIA`: candidato único `docs/arquitetura/CA-UX-03_Matriz_Rotas_e_Modulos.csv`, existente e `VERIFICADO EM origin/main`, mas a contagem "108" não está confirmada no arquivo | Proprietária | Confirmar se este CSV é a matriz citada e se a contagem procede |
| 9.7 | **Backlog P0/P1/P2 de 17/09/2026** — `NÃO LOCALIZADO APÓS VERIFICAÇÃO`: candidatos existem com datas diferentes (`BACKLOG_PROMPTS_LOVABLE_P0_P2_v1.0.md`, sem data; `2026-09-11_backlog-p11-app-cliente-vs-mockup.md`, 11/09) — nenhum é substituto válido do backlog "17/09" sem confirmação | Proprietária | Fornecer o caminho exato, se existir, ou confirmar que a data citada estava incorreta |
| 9.8 | **Product Knowledge do workspace Lovable** — `FONTE AUXILIAR EXTERNA AO GIT`: localização é o workspace Lovable (`Ancestral Canvas`); não verificável por este repositório nesta sessão (sem acesso à ferramenta Lovable). Uso permitido: contexto auxiliar. Uso proibido: declará-la política versionada ou decisão canônica sem registro explícito | Proprietária | Se necessário como fonte formal, registrar seu conteúdo relevante em documento versionado de `origin/main` |
| 9.9 | Matriz "papel × superfície × ação permitida" no Desk não está consolidada em nenhum documento de `origin/main` lido nesta tarefa | Proprietária | Pedido futuro específico, se a Proprietária considerar prioritário |
| 9.10 | O documento `2026-09-19-validacao-inventario-fontes-documentais.md`, citado como fonte [1] no pedido que motivou a v1.1 deste documento, não foi localizado em `origin/main` (`git ls-tree` sem resultado) nem anexado à conversa | Proprietária | Fornecer o caminho exato ou o conteúdo integral, se o documento existir fora do que foi verificável nesta sessão |

Nenhuma divergência de regra (conteúdo contraditório entre dois documentos de `origin/main`) foi encontrada nesta leitura — as divergências acima são todas de proveniência (local × remoto) ou de lacuna (documento inexistente), não de conflito de conteúdo entre fontes aprovadas.

## 10. Critérios de aceite para transformar este documento de rascunho em aprovado

- [ ] Proprietária revisou a seção 8.1 e confirma que a lista de fontes está completa e correta.
- [ ] Proprietária decidiu o destino do material da seção 8.2 (publicar com revisão, ou descartar) — este documento não decide isso por conta própria.
- [ ] Cada pendência da seção 9 tem decisão registrada (mesmo que a decisão seja "aguardar").
- [ ] Nenhuma nova pendência crítica foi identificada desde a data deste rascunho.
- [ ] Proprietária autoriza, com escopo de arquivo(s), mensagem de commit e destino explícitos, a publicação deste documento em `origin/main`.

Até que todos os itens acima estejam marcados, este documento permanece `Status: rascunho` e não deve ser citado como autoridade por nenhum outro agente.
