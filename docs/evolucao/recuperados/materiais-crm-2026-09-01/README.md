# Materiais CRM — 10-11/08/2026, recebidos e arquivados em 01/09/2026

Três documentos enviados pela proprietária, preservados aqui na íntegra (um quarto arquivo, `Bloco_CRM_Ciclo_de_Vida_Clube_Ancestral.md`, veio duplicado byte-a-byte — só uma cópia foi mantida).

- `Bloco_CRM_Ciclo_de_Vida_Clube_Ancestral.md` (10/08/2026) — arquitetura conceitual do CRM Mestre: funil canônico Contato→Lead→Oportunidade→Proposta→Caso→Cliente Ativo→Pós-entrega→Legado, matriz de campos obrigatórios por estágio, regras de legado.
- `Adendo_Ficha_Piloto_CRM_App_Cliente_Clube_Ancestral.md` (11/08/2026) — matriz Ficha Piloto (Giovanna) → CRM/Desk/App/Biblioteca de Evidências, bloco "Perfil do Caso e Dados para App Cliente", regras de visibilidade/consentimento/LGPD, template reutilizável de ficha.
- `Auditoria_Final_SPIN_Esquema_CRM_Clube_Ancestral.md` (11/08/2026) — auditoria do Manual SPIN Selling, guia SPIN oficial, esquema completo de 8 entidades do CRM (Contato, Lead, Discovery, Oportunidade, Proposta, Caso Operacional, Legado, Interação/Tarefa), 17 campos faltantes do Painel de Calls, biblioteca WhatsApp.

## Status

**Não processados individualmente antes deste commit.** Confrontados agora contra o código real (branch `main`, commit `573c990`, 01/09/2026) a pedido da proprietária — resultado abaixo.

## O que já foi aplicado em código real (verificado, não presumido)

Estes três documentos são de 10-11/08. Uma migration real de **21/08** (`20260821122741_25391a5c...sql`) criou schema que corresponde de perto a boa parte do esquema de 8 entidades proposto na Auditoria SPIN (seção E):

| Entidade proposta (10-11/08) | Tabela real criada (21/08) | Campos que batem |
|---|---|---|
| Contato (E.1) | `contacts` | `nome`, `email`, `telefone`, `origem`, `status`, `data_origin` |
| Oportunidade (E.4) | `opportunities` | `contact_id`, `lead_id`, `case_id`, `objetivo_declarado`, `pais_linha_prioritaria`, `via_preliminar`, `etapa_comercial`, `responsavel_nome`, `proxima_acao` |
| Discovery (E.3) | `discovery_assessments` | `opportunity_id`, `objetivo_principal`, `estrutura_familiar`, `linha_transmissao`, `sinal_aderencia_preliminar` (= "hipótese de rota" proposta aqui), `confianca_triagem`, `via_preliminar` |
| Interação (E.8) | `crm_interactions` | vinculada a `discovery_assessments.interaction_id` |
| SPIN-S/P/I/N (Auditoria, seção B/D) | `leads.spin_situacao/spin_problema/spin_implicacao/spin_necessidade` | Boolean, não o dropdown OK/Pendente proposto, mas a mesma ideia — já existe desde a criação de `leads` (16/08) |

**Também real, e batendo com o proposto:** `crm_casos.app_access_status` (Bloco "Perfil do Caso", seção B do Adendo) — o campo existe de verdade na tabela do caso.

**Achado importante:** o dicionário do CA-04 (`docs/arquitetura/CA04-CRM-MESTRE-DISCOVERY-HANDOFF-2026-08-13.md`, já arquivado) usa terminologia quase idêntica a este schema real de 21/08 (`sinal_aderencia_preliminar`/"Sinal de aderência preliminar", `confianca_triagem`/"Confiança da triagem") — ou seja, o CA-04 (13/08) provavelmente já incorporava conhecimento do que veio a ser implementado depois, ou foi a base para a implementação. Não dá para afirmar qual vem de qual sem mais evidência, mas a terminologia não é coincidência.

## O que NÃO foi aplicado

- **Sem UI.** `salvarOportunidade`, `registrarContato`, `registrarDiscovery`, `registrarAceiteVerbal`, `arquivarOportunidade` (`src/lib/crm-fluxo.functions.ts`) existem como funções de servidor reais, mas **nenhuma rota do Desk as importa** — é exatamente o padrão `SEM_UI_PARA_FUNCAO_EXISTENTE` já catalogado no Mapa de Autoridade Admin, agora confirmado também para este módulo.
- **Consentimentos separados (4 tipos, Adendo §C.4 e Auditoria §Adendo corretivo item 3)** — não encontrado nenhum campo `consentimento_dados`/`data_sharing_consent`/`consentimento_uso_dados` em nenhuma tabela real. Proposto, não implementado.
- **`app_display_name`/`journey_stage` (Bloco "Perfil do Caso", Adendo §B)** — não encontrados em nenhuma tabela real. O campo real equivalente mais próximo é só `app_access_status` em `crm_casos`.
- **`maturidade`/`urgencia_declarada` como campos próprios de Lead/Oportunidade** — não encontrados como colunas reais (o texto aparece só em módulos não relacionados, como fontes genealógicas).
- **Legado como ambiente separado (Bloco, seção 3 e 7)** — não encontrada nenhuma tabela ou flag `status = Legado`/ambiente Teste/Demo isolado no schema real; `classificacao-dados.ts` existe e resolve um problema adjacente (real vs. demo/mock), mas não implementa a lógica de "Legado" proposta aqui.
- **Biblioteca Jurídica Interna (Auditoria §H)** — nenhuma tabela `knowledge_id`/schema equivalente encontrada.
- **17 campos faltantes do Painel de Calls (Auditoria §F)** — não verificados individualmente nesta rodada; a maioria dos nomes técnicos propostos (`origem_lead`, `linha_investigada`, `hipotese_rota` como campo de Lead) não aparece em `leads`/`opportunities` sob esse nome exato.

## Por que isso importa para a Pessoa Canônica (pedido da proprietária, 01/09)

A proprietária pediu para revisar a estrutura da ficha piloto e os dados, com o objetivo de fechar uma Pessoa Canônica única que inclua todas as nuances, incluindo o comercial. A matriz do Adendo (seção A) e o esquema de 8 entidades da Auditoria (seção E) são a fonte mais completa já recebida do lado comercial/CRM da pessoa — usados para estender `docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md` nesta mesma sessão (ver revisão de 01/09 nesse documento).
