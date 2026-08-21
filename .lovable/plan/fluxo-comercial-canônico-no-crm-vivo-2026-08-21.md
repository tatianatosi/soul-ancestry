# Fluxo comercial canônico no CRM Vivo

Sem novas abas principais: tudo dentro das subáreas existentes **Leads e triagem** (`/leads`), **Propostas** (`/propostas`) e **Clientes e núcleos** (`/clientes`).

## 1. Banco de dados (uma migration)

Novas tabelas, todas com `organization_id`, RLS por organização, bloqueio de exclusão física e arquivamento lógico:

- `contacts` — nome, e-mail, telefone, origem, origem_detalhe, responsável, status, arquivamento.
- `opportunities` — contato, caso opcional, objetivo declarado, país/linha prioritária, trilha, via preliminar, etapa comercial, responsável, próxima ação e prazo, resumo interno.
- `discovery_assessments` — vinculada a interação e oportunidade, com objetivo principal, estrutura familiar, ascendente/geração, linha de transmissão, estado documental, complexidade, país, via preliminar, sinal de aderência, confiança de triagem, riscos e notas internas.

Ajustes aditivos nas tabelas existentes (nada é removido):

- `crm_interactions` — acrescentar `contact_id`, `opportunity_id`, `origem_referencia_interna`, `consentimento_gravacao`; manter imutabilidade (correção cria novo registro apontando para o anterior).
- `conversion_events` — acrescentar `contact_id`, `opportunity_id`; travar a lista de eventos permitidos (16 tipos, de `lead_criado` a `perdido`) e manter imutabilidade.

Regras aplicadas por trigger:

- Oportunidade em etapa ativa exige responsável, próxima ação e prazo.
- `aceite_verbal_confirmado` não cria cliente ativo nem libera contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente; define próxima ação padrão "solicitar confirmação formal por escrito".
- `confirmacao_formal_recebida` exige referência interna verificável e libera apenas preparação interna de formalização.
- Toda mudança de etapa, aceite, responsável ou próxima ação grava evento auditável sanitizado (sem CPF completo nem conteúdo de documento).

## 2. Código

- `src/lib/crm-fluxo.ts` — etapas comerciais, os 16 eventos permitidos, transições válidas, validação de "sem responsável/próxima ação/prazo", regras de aceite verbal x confirmação formal e o que cada estado **não** libera.
- `src/lib/crm-fluxo.functions.ts` — leitura consolidada (contatos, oportunidades, interações, discovery, eventos) e gravações auditadas: registrar contato, oportunidade, interação, Discovery, aceite verbal, confirmação formal e mudança de etapa.
- `src/routes/_authenticated/leads.tsx` — painel de contatos e oportunidades com origem, responsável, etapa, país/trilha, próxima ação e prazo, alerta de ação vencida, filtros (etapa, responsável, origem, próxima ação, bloqueio) e botões de registro.
- `src/routes/_authenticated/propostas.tsx` — proposta como referência interna: oportunidade vinculada, escopo resumido, produto só se homologado, condição e homologação em somente leitura, estado de aceite, estado de formalização, bloqueios e histórico de eventos.
- `src/routes/_authenticated/clientes.tsx` — pessoas, núcleos e casos; contratante, titulares, dependentes e representação; estado cadastral, trilha, formalização, onboarding e próxima ação, sem CPF ou documento civil na listagem.

## 3. Caso Ana (CA-CID-AT-FAM-2026-001)

Somente registro interno do que já existe: confirmação formal como referência interna, formalização em preparação, estado bloqueado, proposta vencida/incompleta como bloqueio, gates separados (cadastro, condição comercial, case_service, critérios de aceite, matriz jurídica) e Felipe sem contrato, App Cliente ou anexo individual enquanto a representação não estiver documentada. Nenhum contrato, OS, cobrança, mensagem, onboarding, pesquisa externa ou ativação de App.

## 4. Testes

`src/lib/__tests__/crm-fluxo.test.ts`: lista fechada de eventos, obrigatoriedade de responsável/próxima ação/prazo, aceite verbal não libera formalização, confirmação formal exige referência interna e não dispara contrato/cobrança/onboarding, e sanitização da auditoria. Mais typecheck e build.
