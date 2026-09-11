# Clube Ancestral — Registro Mestre de Sincronização, Implementação e Lacunas

**Versão:** 1.0  
**Data:** 19/08/2026  
**Objetivo:** tornar este registro a referência curta e versionada para continuidade entre Perplexity mobile/web/desktop, Lovable, GitHub, Vercel, Supabase e documentos operacionais.  
**Regra:** decisões não viram implementação automaticamente. Toda implementação precisa de evidência técnica, teste, changelog e gate humano quando houver dados reais, assinatura, cobrança, pesquisa externa, comunicação ou acesso de cliente.

---

## 1. Diagnóstico de sincronização

A thread contém decisões relevantes, mas os repositórios GitHub disponíveis não refletem o estado recente do produto. O repositório `recriacao-do-clube-ancestral` tem apenas histórico de junho de 2026 e representa um mockup/Desk inicial, enquanto o repositório `clube-ancestral-intelligence-desk` está vazio. Não há evidência, neste momento, de que as decisões recentes estejam versionadas em código, ligadas a deploy Vercel ou aplicadas em Supabase. [github_mcp_direct:1][github_mcp_direct:2]

A tentativa de listar projetos Vercel não retornou inventário utilizável com o identificador informado; portanto, não foi possível confirmar projetos, deploys, proteção, logs ou erros em Vercel nesta revisão. O conector Supabase não está disponível na lista de integrações atual, logo não é possível inspecionar schema, migrations, RLS, Edge Functions ou logs de banco por aqui.

### Estado por ambiente

| Camada | Estado verificável | Decisão |
|---|---|---|
| Perplexity thread | Decisões extensas, fragmentadas e em risco de perda de contexto operacional | Este registro passa a ser o resumo de continuidade |
| Artefatos gerados | Existem registros e prompts criados nesta conversa, além de documentos anexos/projeto | Consolidar no repositório de governança antes de novas mudanças |
| Lovable | Implementações foram relatadas, mas não são verificáveis pelo código GitHub inspecionado | Auditar no Lovable antes de alterar/reconstruir |
| GitHub `recriacao-do-clube-ancestral` | App Next/TypeScript de mockup; último commit disponível em 25/06/2026 | Tratar como referência visual/legado, não como fonte do produto real |
| GitHub `clube-ancestral-intelligence-desk` | Repositório vazio | Não usar como evidência de implementação; preparar como repositório de governança ou conectar ao código real |
| Vercel | Inventário não resolvido nesta inspeção | Obter teamId/projeto correto e auditar deploys/logs/proteção |
| Supabase | Não acessível via conector atual | Auditar pelo projeto/console ou conectar a integração apropriada |
| Drive/Dropbox/Canva | Há fontes de propostas, dossiês, checklists e mockups | Definir master/versionamento e evitar cópias paralelas |

---

## 2. Arquitetura e decisões vigentes

```text
Painel de Calls
  → Brief/Roteiro de Discovery
  → CRM Mestre / Oportunidade
  → Proposta Canva/Ordem de Serviço aprovada
  → Motor Contratual / MODELO-ESTUDO
  → Assinatura externa, quando aplicável
  → Financeiro / Asaas
  → Onboarding e acesso sem senha autorizado
  → Caso / Desk Intelligence
      └─ Memória de Bases Genealógicas (módulo nativo)
  → Pesquisa, Biblioteca, documentos e entregas
  → Projeção autorizada no App Cliente
```

### Fontes de verdade

| Tema | Fonte canônica | Nunca usar como fonte final |
|---|---|---|
| Escopo, entregas, prazos, condição do caso | Proposta/OS master aprovada, páginas 1–7 | CRM, transcrição, WhatsApp, campo livre ou mockup |
| Texto institucional do contrato | Modelo jurídico institucional versionado e aprovado | Texto copiado em caso individual ou proposta antiga |
| Preço, SKU, condição, cobrança | Planilha mestre/fonte financeira homologada e Asaas reconciliado | Mockup, proposta antiga, dado DEMO ou valor inferido |
| Caso, documentos, evidência, pesquisa | Desk/Dossiê/Biblioteca com RLS | App Cliente, resposta de IA ou narrativa não confirmada |
| Algoritmos, prompts e fontes por país | Memória de Bases Genealógicas no Desk, corpus aprovado/versionado | Gem/app separado, resposta sem citação ou fonte externa não homologada |
| Portal/App | Projeções client-facing autorizadas por caso | Tabelas internas, CRM, Desk, fontes, logs ou dados de outros casos |

### Decisões estruturais

- Desk Intelligence é cockpit operacional soberano.
- Memória Italiana passa a ser **Base Itália** dentro da **Memória de Bases Genealógicas**, nativa do Desk, preparada para Áustria, Portugal, Espanha, Polônia e outras bases homologadas.
- A Memória de Bases é consultiva: não confirma fatos, não conclui juridicamente, não cria dados, tarefas, e-mails ou pesquisas externas sem confirmação humana.
- “Elegibilidade” é uma leitura interna de triagem/hipótese; nunca direito confirmado, percentual de chance ou promessa cliente-facing.
- O App Cliente é projeção autorizada: Painel, Jornada, Documentos, Origem/Radar da Jornada, Árvore, Descobertas, Biblioteca/Legado e Conta.
- O App nunca mostra fontes cruas, prompts, regras internas, hipótese, risco, auditoria, RLS, preço técnico, margem, dados de terceiros ou documentos não liberados.

---

## 3. Contratos, comercial e Go-Live

### Contratada e contrato-base

A regra contratada prevista para o motor é o **Contrato de Serviços de Pesquisa Genealógica — Clube Ancestral**, com o subtítulo **Contrato-Base de Prestação de Serviços Genealógicos e Jornada Documental**.

Dados institucionais a usar somente por perfil institucional versionado:

- razão empresarial: TATIANA MELANI TOSI – ME;
- nome de operação: Clube Ancestral;
- CNPJ: 10.448.812/0001-58;
- endereço institucional: Rua Nova York, 822, Apt. 142, Brooklin, CEP 04560-001, São Paulo–SP, Brasil;
- e-mail: atendimento@clubeancestral.com.br;
- site: https://clubeancestral.com.br;
- WhatsApp: somente referência ao canal institucional homologado.

Não incluir CPF, RG, nascimento, e-mails pessoais ou contatos pessoais da responsável em contrato padrão, preview, log ou App.

### Regras do motor

- `MODELO-ESTUDO` é gerável apenas se texto-base e perfil institucional estiverem ativos/aprovados.
- Proposta/OS válida, aprovada e vinculada ao mesmo caso é gate obrigatório.
- Escopo deriva da proposta Canva/OS aprovada, páginas 1–7.
- Proposta arquivada, recusada, substituída, expirada ou de outro caso não satisfaz gate.
- Um rascunho editável por caso/modelo; snapshots imutáveis em eventos de revisão, aprovação, envio e assinatura.
- Caso familiar: adultos aplicáveis como signatários; menor como dependente, com representação em anexo quando necessário.
- Despesas de terceiros são do cliente, comunicadas e aprovadas previamente; antecipação excepcional exige autorização, teto e regra de reembolso.
- Nenhuma cobrança, assinatura, pesquisa externa, portal ou comunicação é disparada automaticamente.

### Conversão e Go-Live

- Acesso sem login tradicional deve ser link mágico/OTP de uso único, curta duração, revogável, vinculado a identidade, organização, caso e RLS; nunca URL pública por case_id.
- Checkout/pagamento contextual exige SKU, preço e condição homologados; pagamento muda estado apenas após confirmação da fonte transacional.
- Fluxo alvo: proposta/OS aceita → reconciliação comercial → contrato quando aplicável → cobrança autorizada → comunicação consentida → pagamento confirmado → onboarding/acesso autorizado.
- CA-06: KPIs/SLA internos e complementares ao Desk.
- CA-07: saneamento, RLS, DEMO, fontes, auditoria e erros.
- CA-08: Go-Live, onboarding, suporte, observabilidade, revogação e rollback.

---

## 4. Caso Ana Luiza — estado consolidado

| Dimensão | Estado conhecido | Ação/gate |
|---|---|---|
| Caso canônico | `CA-CID-AT-FAM-2026-001` | Resolver aliases antigos sem duplicar caso/contrato/cobrança |
| Núcleo | Ana, Adair, Alice; Felipe é dependente de Ana | Conferir qualificação, papéis, acesso e representação do menor |
| Adriel | Fora do escopo de cidadania familiar por padrão | Incluir só por nova OS/processo específico |
| Rota austríaca | §58c é hipótese em validação | Não tratar como direito confirmado ou promessa |
| Dossiê/Checklist | Há Dossiê Consolidado e Checklist §58c existentes | Revisar fontes, documentos, lacunas e estados; não recriar |
| Propostas | Há proposta familiar no Canva e múltiplas cópias/versões; proposta individual também foi localizada | Eleger uma única proposta/OS master por revisão humana |
| Proposta individual | Referência `CA-CID-AT-20026-001`, validade declarada até 12/08/2026 e inconsistência editorial | Não usar automaticamente para contrato familiar; tratar como versão/referência |
| Aceite | Registro anterior: verbalmente aprovado, formal pendente | Confirmar evidência escrita; não inferir |
| Contrato | Contrato-Mãe existia como placeholder no inventário anterior | Localizar estado atual; preencher apenas pelo modelo aprovado |
| Cobrança/pesquisa externa | Condicionadas no registro anterior a contrato/primeira cobrança | Confirmar que não houve ativação indevida |
| Último prompt pausado | Auditoria de escopo motor vs proposta/OS | Próxima tarefa Lovable do caso, sem alteração |

---

## 5. Implementado, relatado e não verificado

### Evidência no repositório GitHub legado

O repositório `tatianatosi/recriacao-do-clube-ancestral` contém uma aplicação Next/TypeScript com entrada em `app/page.tsx`, shell de Desk e componentes de módulos. O histórico mostra alterações de junho de 2026 para atributos de caso/linhagem, layout `DeskShell` e estilos; não há commits recentes que comprovem as decisões de agosto. [github_mcp_direct:2][github_mcp_direct:4][github_mcp_direct:6][github_mcp_direct:7]

Componentes existentes identificados:

- `components/dashboard/desk-shell.tsx`;
- `components/dashboard/sidebar.tsx`;
- `components/dashboard/topbar.tsx`;
- `components/modules/visao-360.tsx`;
- `components/modules/dossie-documental.tsx`;
- `components/modules/memoria-italiana.tsx`;
- `authority-audit`, `risco-consular`, `playbooks` e `objecoes-conversao`.

Esses arquivos demonstram uma base de **mockup/Desk inicial** e devem ser auditados, preservados ou adaptados. Eles não comprovam backend, Supabase, RLS, APIs, auditoria persistente, contrato, pagamento, autenticação, App Cliente ou Go-Live. [github_mcp_direct:5]

### Matriz de estado

| Frente | Estado declarado na conversa | Evidência técnica atual | Status de verdade |
|---|---|---|---|
| Estrutura familiar Ana | Reportada como materializada/testada | Não confirmada no GitHub legado | Requer auditoria Lovable/Supabase |
| Motor contratual e parâmetros | Reportado como implementado/testado em rodadas anteriores | Não localizado no repositório inspecionado | Requer auditoria Lovable/Supabase |
| Portal/RLS/views seguras | Reportado como implementado/testado | Não confirmadas no código legado | Requer auditoria Supabase/Lovable |
| Pré-carga comercial da proposta | Reportada como implementada/testada | Não localizada no GitHub legado | Requer auditoria Lovable/Supabase |
| Painel Calls → Brief | Marcado como pendente | Não confirmado | Pendente |
| Memória Italiana | Componente de UI identificado | Backend/corpus/RLS/auditoria não confirmados | Adaptar após auditoria CA-05 |
| Memória de Bases multi-país | Decidida | Não implementada por evidência | Pendente |
| App Cliente/Dashboard | Mockups e decisões existem | Não confirmado no repositório inspecionado | Auditoria necessária |
| Acesso sem senha | Prioridade Go-Live | Não confirmado | Pendente |
| Checkout/Asaas | Prioridade e regras definidas | Não confirmado | Pendente/auditar |
| Logo em Canvas | Reportado como aplicado | Não confirmado no código legado | Auditoria visual necessária |
| Logo Blueprint | Pendente | Não confirmado | Pendente |

---

## 6. Lacunas de governança e código

1. **Repositório real não identificado:** o GitHub inspecionado é antigo e o repositório com nome do Desk está vazio.
2. **Sem conexão Supabase:** schema, migrations, RLS, Edge Functions, storage, auth e logs não foram inspecionados.
3. **Vercel não resolvido:** sem teamId/projeto correto, não houve validação de deploy, ambiente, proteção ou erros.
4. **Decisões não versionadas no código:** contratos, CA-05, App, Go-Live e Ana constam em artefatos, mas não em repositório auditável.
5. **Thread como fonte operacional:** a conversa longa é inadequada como fonte de verdade; o registro deve substituir isso.
6. **Touchpoints de onboarding dispersos:** Call/Brief, proposta, contrato, cobrança, primeiro acesso, jornada, próxima ação e suporte precisam de um catálogo único e rastreável.

---

## 7. Padrão de sincronização proposto

### Repositório de governança

Criar/usar diretório versionado `docs/governanca/` no repositório real e manter:

```text
docs/governanca/
  REGISTRO_MESTRE.md
  DECISOES.md
  TOUCHPOINTS_ONBOARDING.md
  ESTADO_IMPLEMENTACAO.md
  CASOS/
    CA-CID-AT-FAM-2026-001.md
  CONTRATOS/
    PERFIL_INSTITUCIONAL.md
    MODELO-ESTUDO.md
  CA05/
    MEMORIA_BASES_GENEALOGICAS.md
  GO_LIVE/
    CA06_CA07_CA08.md
  CHANGELOG.md
```

### Registro obrigatório por decisão

Cada decisão deve ter: ID, data, responsável, contexto, decisão, impacto em produto/dados/segurança, evidência, estado (`decidido`, `implementado`, `testado`, `bloqueado`, `pendente`), repositório/commit/migration/deploy e gate humano.

### Touchpoints de onboarding

| Touchpoint | Fonte de verdade | Saída autorizada | Gate |
|---|---|---|---|
| Discovery | Painel Calls + Brief | Campos estruturados revisados | Consentimento e revisão |
| Proposta | Canva/OS master | Escopo/comercial específico | Proposta válida e aceita |
| Contrato | MODELO-ESTUDO + anexos | Contrato versionado | Jurídico, partes, proposta, gates |
| Cobrança | Fonte financeira/Asaas | Link/status do próprio cliente | Condição reconciliada/contrato quando aplicável |
| Primeiro acesso | Auth sem senha + RLS | Sessão e projeção do próprio caso | Identidade, consentimento e acesso liberado |
| Onboarding | Desk → projeção App | Próxima ação, documentos, jornada | Conteúdo liberado |
| Pesquisa/entrega | Dossiê/Biblioteca | Achados/entregas curados | Evidência, revisão e autorização |
| Suporte/revogação | Operação | Atendimento, recuperação e encerramento | Papel e auditoria |

---

## 8. Plano imediato

### Fase 0 — descobrir a fonte de código real

- Identificar projeto Lovable e export/repo GitHub conectado ao ambiente ativo.
- Identificar projeto Supabase, ambientes e responsável por migrations/RLS.
- Obter teamId e projectId corretos no Vercel.
- Não fazer alterações até confirmar que os três apontam para o mesmo ambiente.

### Fase 1 — auditoria sem alteração

1. Motor contratual + perfil institucional + proposta/OS/anexos.
2. Caso Ana Luiza e auditoria do escopo do motor versus proposta/OS.
3. CA-05/Desk/Memória Italiana e caminho multi-base.
4. Auth, RLS, projeções client-facing e App/Dashboard.
5. SKU/preço/Asaas, proposta–checkout–comunicação.
6. CA-06/07/08 e critérios Go/No-Go.

### Fase 2 — commit de governança

Após identificar o repositório real, criar uma PR/commit somente de documentação com este registro, decisões, touchpoints e matriz de estado. Não commitar documentos de cliente, CPF, RG, dados financeiros, documentos sensíveis, tokens ou links assinados.

### Fase 3 — alterações controladas

Aplicar uma frente por vez: auditoria aprovada → plano → implementação → testes → changelog → revisão humana → próximo passo.

---

## 9. Changelog

### v1.0 — 19/08/2026

- Consolidado contexto de decisões da thread em registro de sincronização.
- Identificado desalinhamento entre decisões recentes e repositórios GitHub acessíveis.
- Registrado que o repositório de Desk nomeado está vazio e o repositório disponível contém apenas mockup/Desk inicial de junho.
- Registradas limitações de inspeção de Vercel e ausência de acesso Supabase.
- Consolidada arquitetura, contrato, CA-05, App, Go-Live, touchpoints e estado do caso Ana Luiza.
- Definido padrão de repositório de governança, matriz de implementação e plano de auditoria antes de mudanças.
