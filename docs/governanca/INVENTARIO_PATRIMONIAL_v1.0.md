# Inventário patrimonial do Clube Ancestral — CA-INVENTARIO-PATRIMONIAL-v1.0

Data: 2026-08-22 · Responsável: Proprietária Administradora (Tati Tosi)

Etapa somente de leitura e documentação. Nenhum item foi criado, alterado, homologado, aprovado, arquivado, enviado, assinado, publicado, cobrado, migrado, integrado, movido ou excluído.

## 1. Inventário único (27 itens)

### Contrato-base e versões

**INV-001 — Contrato-base — Estudo Genealógico v2 (14 cláusulas)** · status `PARCIAL` · severidade media
- Finalidade: Corpo contratual fixo, versionado e não editável por caso.
- Origem: legado_2025_2026, documento, github
- Fonte de verdade atual: docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md
- Localização/ID: GitHub: docs/contratos + src/lib/corpo-contratual.ts, src/lib/contrato-base-leitor.ts
- Camadas presentes: 4/5 · ausentes: 4. instância de caso
- Versão/data/responsável: v2.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-002, INV-005, INV-010 · Dependências: Perfil institucional versionado, Ficha de parâmetros por caso
- Risco: Texto homologado existe, mas nenhum contrato de caso está assinado; leitura pode ser confundida com contrato pronto.
- Ação necessária: Manter como leitura; instanciar por caso apenas quando a ficha estiver completa.
- Proprietária pode agir internamente: sim · depende de: nenhum

**INV-002 — Motor contratual paramétrico (contracts / contract_versions)** · status `PARCIAL` · severidade alta
- Finalidade: Gerar versão do contrato a partir de parâmetros com hash de conteúdo e gates de assinatura.
- Origem: app, banco
- Fonte de verdade atual: Banco: public.contracts, public.contract_versions, public.contract_parameter_values
- Localização/ID: Banco (6 contratos, 1 versão) + src/lib/contrato-parametros.*, contratos.functions.ts
- Camadas presentes: 5/5 · ausentes: nenhuma
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-001, INV-003 · Dependências: Parâmetros completos do caso, Anexos homologados
- Risco: Instâncias existem em estado pending_data; assinatura e formalização não exercitadas.
- Ação necessária: Completar ficha de parâmetros do caso canônico antes de qualquer geração definitiva.
- Proprietária pode agir internamente: sim · depende de: dado_do_cliente

**INV-003 — Perfil institucional versionado (qualificação da contratada)** · status `SEM_HOMOLOGACAO` · severidade alta
- Finalidade: Bloco fixo de qualificação usado no contrato e procurações.
- Origem: documento, app
- Fonte de verdade atual: src/lib/perfil-institucional.ts + public.institutional_profiles
- Localização/ID: GitHub + banco
- Camadas presentes: 4/5 · ausentes: 2. conteúdo homologado
- Versão/data/responsável: v1.0 (em revisão) · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-001 · Dependências: Dados cadastrais oficiais da empresa
- Risco: Perfil marcado como referência/em revisão; uso em documento externo exigiria homologação.
- Ação necessária: Homologar o perfil com dados cadastrais oficiais.
- Proprietária pode agir internamente: sim · depende de: fonte_aprovada

### Anexos I, II, III, IV e V

**INV-004 — Anexo I — Ordem de Serviço** · status `PLACEHOLDER` · severidade critica
- Finalidade: Definir escopo executável e entregáveis do serviço contratado.
- Origem: app, banco
- Fonte de verdade atual: public.contract_annexes (annex_code ANEXO_I_ORDEM_SERVICO)
- Localização/ID: Banco: instância vinculada ao caso técnico CA-TESTE-VAL-2026-001 (266 caracteres, descritivo)
- Camadas presentes: 2/5 · ausentes: 2. conteúdo homologado; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08-22 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-002, INV-016 · Dependências: Minuta jurídica homologada, Escopo aprovado da proposta
- Risco: Estrutura técnica existe sem minuta jurídica; não existe instância para o caso canônico de Ana.
- Ação necessária: Obter minuta jurídica homologada antes de instanciar por caso.
- Proprietária pode agir internamente: não · depende de: advogado, fonte_aprovada

**INV-005 — Anexo II — Despesas Externas** · status `PLACEHOLDER` · severidade critica
- Finalidade: Registrar despesas de terceiros repassáveis ao cliente.
- Origem: app, banco
- Fonte de verdade atual: public.contract_annexes (ANEXO_II_DESPESAS_EXTERNAS)
- Localização/ID: Banco: instância no caso técnico de validação (277 caracteres, descritivo)
- Camadas presentes: 2/5 · ausentes: 2. conteúdo homologado; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08-22 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-019 · Dependências: Tabela de despesas homologada
- Risco: Sem minuta e sem instância de caso; risco de cobrança indevida se usado como está.
- Ação necessária: Homologar minuta e tabela de despesas.
- Proprietária pode agir internamente: não · depende de: advogado, fonte_aprovada

**INV-006 — Anexo III — Autorização de Pesquisa** · status `PLACEHOLDER` · severidade critica
- Finalidade: Autorizar pesquisa genealógica em nome do cliente.
- Origem: app, banco
- Fonte de verdade atual: public.contract_annexes (ANEXO_III_AUTORIZACAO_PESQUISA)
- Localização/ID: Banco: estrutura presente, status not_applicable no caso de validação
- Camadas presentes: 2/5 · ausentes: 2. conteúdo homologado; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08-22 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-017 · Dependências: Minuta jurídica, Consentimento do cliente
- Risco: Sem este anexo homologado, pesquisa externa permanece bloqueada por regra.
- Ação necessária: Homologar minuta e coletar consentimento no caso real.
- Proprietária pode agir internamente: não · depende de: advogado, dado_do_cliente

**INV-007 — Anexo IV — Procuração** · status `PLACEHOLDER` · severidade critica
- Finalidade: Instrumento de representação para atos junto a órgãos e cartórios.
- Origem: app, banco
- Fonte de verdade atual: public.contract_annexes (ANEXO_IV_PROCURACAO)
- Localização/ID: Banco: estrutura presente (239 caracteres, descritivo)
- Camadas presentes: 2/5 · ausentes: 2. conteúdo homologado; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08-22 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-003, INV-014 · Dependências: Minuta jurídica, Qualificação completa do outorgante
- Risco: Documento de efeito externo sem minuta homologada.
- Ação necessária: Homologar minuta com advogado.
- Proprietária pode agir internamente: não · depende de: advogado, dado_do_cliente

**INV-008 — Anexo V — Alteração de Escopo** · status `PLACEHOLDER` · severidade alta
- Finalidade: Formalizar aditivos de escopo e preço.
- Origem: app, banco
- Fonte de verdade atual: public.contract_annexes (ANEXO_V_ALTERACAO_ESCOPO)
- Localização/ID: Banco: estrutura presente (261 caracteres, descritivo)
- Camadas presentes: 2/5 · ausentes: 2. conteúdo homologado; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08-22 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-010, INV-011 · Dependências: Minuta jurídica, Catálogo com preço homologado
- Risco: Aditivos hoje não têm instrumento válido.
- Ação necessária: Homologar minuta.
- Proprietária pode agir internamente: não · depende de: advogado

**INV-009 — Registros legados de anexo (ANEXO-I vazio, ANX-ESCOPO, ANX-COMERCIAL, ANX-PRIVACIDADE)** · status `LEGADO` · severidade media
- Finalidade: Rascunhos anteriores ao vocabulário canônico de anexos.
- Origem: legado_2025_2026, banco
- Fonte de verdade atual: public.contract_annexes (4 registros em drafting/arquivado)
- Localização/ID: Banco
- Camadas presentes: 2/5 · ausentes: 1. fonte documental; 2. conteúdo homologado; 5. validação autenticada
- Versão/data/responsável: legado · 2026 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-004 · Dependências: —
- Risco: Podem ser lidos como anexos válidos em relatórios antigos.
- Ação necessária: Manter apenas como histórico; não usar como fonte.
- Proprietária pode agir internamente: sim · depende de: nenhum

### Propostas, escopo e fontes Canva

**INV-010 — Proposta Canva — páginas 1 a 7 (escopo canônico)** · status `SEM_VALIDACAO_AUTENTICADA` · severidade alta
- Finalidade: Fonte única do escopo comercial apresentado ao cliente.
- Origem: canva, legado_2025_2026, banco
- Fonte de verdade atual: public.proposals + public.proposal_canva_pages
- Localização/ID: Banco (4 propostas) + arquivos originais no Canva (externo)
- Camadas presentes: 4/5 · ausentes: 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-011, INV-016 · Dependências: Arquivo Canva original preservado
- Risco: Fonte original vive fora do app; perda do Canva quebra rastreabilidade do escopo.
- Ação necessária: Exportar e preservar cópia imutável das páginas 1–7.
- Proprietária pode agir internamente: sim · depende de: fonte_aprovada

### Planejador, fases, marcos e dependências

**INV-012 — Planejador de fases, marcos e dependências (case_plans)** · status `SEM_INSTANCIA` · severidade alta
- Finalidade: Plano operacional por caso com fases, marcos e gates.
- Origem: documento, app, banco
- Fonte de verdade atual: public.case_plans + src/lib/cadeia-operacional.ts
- Localização/ID: Banco: 0 registros; motor e regras existem no código
- Camadas presentes: 3/5 · ausentes: 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-016, INV-018 · Dependências: Caso ativado com escopo aprovado
- Risco: Não há planejador operacional em uso: modelo sem dados canônicos.
- Ação necessária: Instanciar o plano do caso canônico quando o escopo estiver conferido.
- Proprietária pode agir internamente: sim · depende de: nenhum

### Catálogo comercial, SKUs, preços e vigências

**INV-011 — Catálogo canônico de SKUs (Base Top 30 + importações)** · status `PARCIAL` · severidade critica
- Finalidade: Fonte homologada de produtos, preços, condições e vigências.
- Origem: legado_2025_2026, documento, banco
- Fonte de verdade atual: public.product_catalog
- Localização/ID: Banco: 113 SKUs — 13 homologados, 84 bloqueados, 16 em revisão; sku_catalog vazio
- Camadas presentes: 5/5 · ausentes: nenhuma
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-010, INV-019 · Dependências: Tabela de preços homologada pela proprietária
- Risco: Maioria dos SKUs bloqueada ou sem preço; usar catálogo hoje como 'ativo' seria falso.
- Ação necessária: Sanear fila de homologação de preço e vigência (84 bloqueados, 16 em revisão).
- Proprietária pode agir internamente: sim · depende de: fonte_aprovada

### Pessoas, famílias, dependentes e representação

**INV-013 — Pessoas, núcleos familiares e dependentes** · status `PARCIAL` · severidade media
- Finalidade: Modelar requerentes, dependentes e representação por caso.
- Origem: app, banco
- Fonte de verdade atual: public.clientes, case_members, nucleos_familiares, case_dependents
- Localização/ID: Banco: 6 clientes, 7 membros, 1 núcleo familiar
- Camadas presentes: 5/5 · ausentes: nenhuma
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-016 · Dependências: Documentos civis do cliente
- Risco: Qualificação incompleta impede emitir contrato e procuração.
- Ação necessária: Completar qualificação do núcleo do caso canônico.
- Proprietária pode agir internamente: sim · depende de: dado_do_cliente

**INV-014 — Representação e atos (procuração, consentimento)** · status `SEM_INSTANCIA` · severidade alta
- Finalidade: Registrar quem representa quem e sob qual instrumento.
- Origem: app, banco
- Fonte de verdade atual: public.consent_records, atos de representação
- Localização/ID: Banco + src/lib/atos-representacao.functions.ts
- Camadas presentes: 2/5 · ausentes: 2. conteúdo homologado; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-007 · Dependências: Anexo IV homologado
- Risco: Sem instrumento válido não há representação formal.
- Ação necessária: nenhuma nesta etapa
- Proprietária pode agir internamente: não · depende de: advogado, dado_do_cliente

### Casos, dossiês, documentos e entregas

**INV-015 — Caso canônico CA-CID-AT-FAM-2026-001 — Projeto familiar Ana Luiza** · status `PARCIAL` · severidade media
- Finalidade: Piloto real do ciclo completo.
- Origem: conversa, app, banco
- Fonte de verdade atual: public.crm_casos (codigo CA-CID-AT-FAM-2026-001)
- Localização/ID: Banco; referências legadas CA-AUT-ANALUIZA-FAM-2026-001 e CA-2026-ANA-001 resolvem para o mesmo caso
- Camadas presentes: 5/5 · ausentes: nenhuma
- Versão/data/responsável: decisão canônica v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-004, INV-012, INV-020 · Dependências: Contrato instanciado, Anexos homologados
- Risco: Baixo quanto à identidade; alto quanto à formalização pendente.
- Ação necessária: Não reabrir a decisão de identificador.
- Proprietária pode agir internamente: sim · depende de: nenhum

**INV-016 — Dossiês, documentos e entregas do cliente** · status `SEM_INSTANCIA` · severidade alta
- Finalidade: Guarda de documentos com URL assinada, auditoria e entregas.
- Origem: app, banco, drive
- Fonte de verdade atual: public.documents, case_source_documents, client_deliverables
- Localização/ID: Banco: documents 3, case_source_documents 0, client_deliverables 0
- Camadas presentes: 3/5 · ausentes: 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-015, INV-021 · Dependências: Documentos enviados pelo cliente
- Risco: Documentos históricos ainda vivem em Drive/Dropbox fora do app.
- Ação necessária: Mapear e importar o acervo documental legado.
- Proprietária pode agir internamente: sim · depende de: dado_do_cliente

### Pesquisa, fontes, evidências, hipóteses e microentregas

**INV-017 — Ficha Piloto Genealógica (13 módulos históricos)** · status `PARCIAL` · severidade media
- Finalidade: Estrutura canônica de fontes, evidências, hipóteses e achados.
- Origem: documento, app, banco
- Fonte de verdade atual: public.research_cases, evidencias, genealogical_findings + src/lib/achados-genealogicos.ts
- Localização/ID: Banco: research_cases 3, evidencias 3
- Camadas presentes: 4/5 · ausentes: 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-006, INV-018 · Dependências: Autorização de pesquisa (Anexo III)
- Risco: Volume de evidências é de fixture/validação, não de pesquisa real.
- Ação necessária: Manter achados como hipóteses até validação.
- Proprietária pode agir internamente: sim · depende de: confirmacao_externa

**INV-018 — Microentregas e publicação de progresso** · status `SEM_VALIDACAO_AUTENTICADA` · severidade media
- Finalidade: Entregar progresso ao cliente em blocos auditáveis.
- Origem: app, banco
- Fonte de verdade atual: public.microentregas (6) e ops_microentregas (0)
- Localização/ID: Banco
- Camadas presentes: 4/5 · ausentes: 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-021 · Dependências: Sanitização validada
- Risco: Duas tabelas concorrentes de microentrega podem divergir.
- Ação necessária: Declarar tabela canônica de microentrega antes de publicar.
- Proprietária pode agir internamente: sim · depende de: nenhum

### Financeiro, condições, faturas, cobrança e conciliação

**INV-019 — Financeiro: condições comerciais, faturas e conciliação** · status `SEM_INSTANCIA` · severidade alta
- Finalidade: Registrar condição comercial, fatura, pagamento e conciliação em regime de caixa.
- Origem: app, banco
- Fonte de verdade atual: public.commercial_conditions, invoices, payments, eventos_financeiros
- Localização/ID: Banco: invoices 1, payments 0, eventos_financeiros 0
- Camadas presentes: 3/5 · ausentes: 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-011, INV-022 · Dependências: Contrato assinado, Preço homologado
- Risco: Nenhum ciclo financeiro real percorrido ponta a ponta.
- Ação necessária: Não emitir cobrança antes de contrato assinado e preço homologado.
- Proprietária pode agir internamente: não · depende de: confirmacao_externa

### CRM Vivo, Leads, interações, Painel Hoje e relatórios

**INV-020 — CRM Vivo, Leads e Painel Hoje** · status `PARCIAL` · severidade media
- Finalidade: Operação diária: fila única, sinais derivados e ações rápidas auditadas.
- Origem: app, banco
- Fonte de verdade atual: public.leads, crm_casos, tarefas + PainelHoje
- Localização/ID: Banco: leads 7 (1 real, 6 teste), crm_casos 4, tarefas 8, crm_interactions 0
- Camadas presentes: 5/5 · ausentes: nenhuma
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-015 · Dependências: Uso diário real
- Risco: Base ainda majoritariamente de teste; zero interações registradas.
- Ação necessária: Registrar interações reais para o CRM deixar de ser majoritariamente fixture.
- Proprietária pode agir internamente: sim · depende de: nenhum

### App Cliente, projeções, sanitização e publicação

**INV-021 — App Cliente — projeções autorizadas e sanitização** · status `SEM_VALIDACAO_AUTENTICADA` · severidade alta
- Finalidade: Projetar ao cliente apenas conteúdo sanitizado e aprovado.
- Origem: app, banco
- Fonte de verdade atual: public.app_projections + src/lib/canvas-sanitize.ts, app-visibilidade.ts
- Localização/ID: Banco: 1 projeção (resumo_caso, draft, equipe_interna)
- Camadas presentes: 4/5 · ausentes: 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-018, INV-015 · Dependências: Aprovação da projeção, Fluxo de magic link validado
- Risco: Nada publicado ao cliente; declarar App Cliente pronto seria falso.
- Ação necessária: Validar prévia autenticada da projeção antes de qualquer publicação.
- Proprietária pode agir internamente: sim · depende de: nenhum

### Governança, RLS, auditoria, overrides, papéis e migração

**INV-022 — Governança: RLS, auditoria, overrides e papéis** · status `COMPLETO` · severidade baixa
- Finalidade: Isolamento por organização, trilha de auditoria e override auditado da proprietária.
- Origem: app, banco
- Fonte de verdade atual: Políticas RLS + public.audit_logs, owner_override_events, user_roles
- Localização/ID: Banco: audit_logs 676, owner_override_events 2
- Camadas presentes: 5/5 · ausentes: nenhuma
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-023 · Dependências: —
- Risco: Baixo; manter cobertura ao criar novas tabelas.
- Ação necessária: nenhuma nesta etapa
- Proprietária pode agir internamente: sim · depende de: nenhum

**INV-023 — Backup e migração permanente** · status `PARCIAL` · severidade critica
- Finalidade: Preservar banco, repositório e fontes externas do patrimônio.
- Origem: github, banco, documento
- Fonte de verdade atual: docs/migracao + docs/governanca
- Localização/ID: GitHub
- Camadas presentes: 2/5 · ausentes: 3. estrutura no app; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-010, INV-016 · Dependências: Exportação de Canva, Drive e Dropbox
- Risco: Fontes externas não versionadas são o maior risco de perda.
- Ação necessária: Executar checklist de preservação das fontes externas.
- Proprietária pode agir internamente: sim · depende de: fonte_aprovada

**INV-027 — Biblioteca mestre e modelos de mensagem** · status `PARCIAL` · severidade media
- Finalidade: Conteúdo institucional versionado com estados de vigência.
- Origem: legado_2025_2026, banco
- Fonte de verdade atual: public.master_library_items (6), message_templates
- Localização/ID: Banco
- Camadas presentes: 4/5 · ausentes: 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-021 · Dependências: Homologação de vigência
- Risco: Uso de item não vigente em comunicação com cliente.
- Ação necessária: Revisar estado de vigência antes de qualquer uso externo.
- Proprietária pode agir internamente: sim · depende de: nenhum

### Integrações ativas e fora do escopo

**INV-024 — Integrações registradas (7 chaves, 14 registros)** · status `SEM_INSTANCIA` · severidade media
- Finalidade: WhatsApp Meta, gateway financeiro, armazenamento, CRM externo, calls, formulários.
- Origem: app, banco
- Fonte de verdade atual: public.integrations
- Localização/ID: Banco: todas com status desligada e modo_simulado = true
- Camadas presentes: 3/5 · ausentes: 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: v1.0 · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-025 · Dependências: Credenciais e confirmação externa
- Risco: Duplicidade de registros por chave pode confundir ativação futura.
- Ação necessária: Nenhuma integração deve ser ativada nesta etapa.
- Proprietária pode agir internamente: não · depende de: confirmacao_externa

**INV-025 — Asaas (cobrança) — fora do escopo desta etapa** · status `FORA_DO_ESCOPO` · severidade media
- Finalidade: Emissão de cobrança e conciliação bancária.
- Origem: conversa, outro
- Fonte de verdade atual: Referência apenas em campos status_link_asaas do catálogo
- Localização/ID: Banco (campo de status), sem integração ativa
- Camadas presentes: 0/5 · ausentes: 1. fonte documental; 2. conteúdo homologado; 3. estrutura no app; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: — · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-019 · Dependências: Contrato assinado, Decisão comercial
- Risco: Campos de link podem sugerir integração inexistente.
- Ação necessária: nenhuma nesta etapa
- Proprietária pode agir internamente: não · depende de: confirmacao_externa

**INV-026 — Tasks e Calendar externos** · status `FORA_DO_ESCOPO` · severidade baixa
- Finalidade: Gestão de tarefas e agenda fora do Desk.
- Origem: conversa
- Fonte de verdade atual: Decisão canônica: CRM Vivo e Painel Hoje são os sistemas canônicos
- Localização/ID: —
- Camadas presentes: 0/5 · ausentes: 1. fonte documental; 2. conteúdo homologado; 3. estrutura no app; 4. instância de caso; 5. validação autenticada
- Versão/data/responsável: — · 2026-08 · Proprietária Administradora (Tati Tosi)
- Vínculos: INV-020 · Dependências: —
- Risco: Nenhum; decisão fechada.
- Ação necessária: nenhuma nesta etapa
- Proprietária pode agir internamente: não · depende de: nenhum

## 2. Mapa de-para (2025 → 18/08/2026 → hoje)

| Origem legada | Onde vivia | Destino atual | Item | Observação |
| --- | --- | --- | --- | --- |
| Contrato de estudo genealógico (versões 2025) | Drive / documento Word | docs/contratos/CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2.md + motor contratual | INV-001 | Texto consolidado em 14 cláusulas; instância por caso ainda não assinada. |
| Anexos avulsos do contrato | Documento / conversa | public.contract_annexes (estrutura técnica) | INV-004 a INV-008 | Estrutura migrada; minuta jurídica não migrada. |
| Proposta comercial Canva (páginas 1–7) | Canva | public.proposals + proposal_canva_pages | INV-010 | Arquivo original permanece no Canva; exportação imutável pendente. |
| Planilha de preços e serviços | Drive / planilha | public.product_catalog (113 SKUs) | INV-011 | Importado; 84 bloqueados e 16 em revisão. |
| Planejador de fases (modelo em planilha) | Drive | src/lib/cadeia-operacional.ts + public.case_plans (vazio) | INV-012 | Regras migradas; nenhum plano instanciado. |
| Ficha da família Ana Luiza | Conversa / documento | public.crm_casos CA-CID-AT-FAM-2026-001 | INV-015 | Referências legadas preservadas como alias. |
| Pastas de documentos de clientes | Drive / Dropbox | public.documents (3 registros) | INV-016 | Acervo legado majoritariamente não importado. |
| Controles financeiros manuais | Planilha | public.invoices / payments / eventos_financeiros | INV-019 | Estrutura pronta, histórico não importado. |

## 3. Matriz de lacunas por severidade

| Severidade | Item | Camada ausente | Impacto |
| --- | --- | --- | --- |
| critica | Anexos I, II, III e IV | Conteúdo jurídico homologado e instância de caso | Impede formalização, autorização de pesquisa e representação. |
| critica | Catálogo comercial | Homologação de preço e vigência (84 bloqueados, 16 em revisão) | Impede proposta e contrato com preço válido. |
| critica | Fontes externas (Canva, Drive, Dropbox) | Preservação versionada | Risco de perda irreversível do patrimônio documental. |
| alta | Perfil institucional | Homologação | Qualificação da contratada em revisão bloqueia documento externo. |
| alta | Planejador operacional | Instância de caso | Nenhum plano canônico em execução. |
| alta | App Cliente | Validação autenticada de prévia e publicação | Não é possível afirmar que o App Cliente está pronto. |
| alta | Ciclo financeiro | Instância real (0 pagamentos, 0 eventos) | Conciliação nunca exercitada ponta a ponta. |
| media | CRM Vivo | Uso real (0 interações, 6 de 7 leads de teste) | Base ainda predominantemente fixture. |
| media | Microentregas | Definição de tabela canônica única | Risco de divergência entre microentregas e ops_microentregas. |
| baixa | Registros legados de anexo | — | Ruído histórico em relatórios antigos. |

## 4. Fontes a preservar ou importar

| Ação | Prioridade | Fonte | Onde está |
| --- | --- | --- | --- |
| preservar | critica | Proposta Canva páginas 1–7 | Canva |
| importar | critica | Minutas jurídicas dos Anexos I–V | Advogado / não localizado |
| preservar | critica | Planilha de preços e condições | Drive |
| importar | alta | Acervo documental de clientes | Drive / Dropbox |
| importar | alta | Histórico financeiro manual | Planilha |
| preservar | media | Contrato-base v2 consolidado | GitHub (docs/contratos) |
| preservar | critica | Banco de dados do app | Lovable Cloud |
| preservar | critica | Repositório do aplicativo | GitHub |

## 5. Checklist único de migração e backup

1. Exportar dump completo do banco e guardar cópia datada fora do ambiente do app.
2. Garantir espelho do repositório no GitHub com a tag do inventário v1.0.
3. Exportar as páginas 1–7 da proposta Canva em PDF imutável e anexar como fonte.
4. Inventariar pastas de Drive e Dropbox por cliente antes de qualquer importação.
5. Guardar cópia dos documentos em docs/contratos e docs/governanca com hash.
6. Registrar a lista de SKUs e preços homologados em arquivo versionado.
7. Exportar audit_logs e owner_override_events como evidência de trilha.
8. Documentar as chaves de integração existentes sem expor credenciais.
9. Revalidar restauração do backup em ambiente separado antes de qualquer migração.

## 6. Ações exclusivas da Proprietária

- Homologar preços, condições e vigências dos SKUs bloqueados e em revisão.
- Homologar o perfil institucional com os dados cadastrais oficiais.
- Declarar a tabela canônica única de microentregas.
- Instanciar o plano operacional do caso canônico de Ana Luiza.
- Aprovar internamente a projeção de App Cliente ainda em rascunho.
- Exportar e preservar as fontes externas (Canva, Drive, Dropbox).
- Manter a decisão canônica de identificador de Ana sem reabertura.
- Registrar interações reais no CRM Vivo para sair do estado de fixture.

## 7. Ações dependentes de fonte jurídica, dado do cliente ou confirmação externa

- Homologar as minutas dos Anexos I, II, III, IV e V — Advogado
- Emitir procuração válida — Advogado e dados civis do cliente
- Coletar consentimento e autorização de pesquisa — Dado e assinatura do cliente
- Completar a qualificação do núcleo familiar — Documentos do cliente
- Assinar o contrato do caso canônico — Confirmação externa do cliente
- Emitir cobrança ou ativar gateway financeiro — Confirmação externa e contrato assinado
- Ativar qualquer integração hoje desligada — Credenciais e confirmação externa
- Publicar conteúdo no App Cliente — Confirmação externa explícita da proprietária

## Confirmação

“O inventário patrimonial distinguiu legado, fonte documental, conteúdo homologado, estrutura no aplicativo, instância de caso e validação autenticada. Nenhum item foi declarado completo apenas por existir virtualmente. Nenhum dado, documento, integração ou ação externa foi alterado.”
