# Prompt de Implantação — Política Unificada de Casos Familiares, App, Comunicação e Jornada

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio + Vercel + GitHub  
**Base de referência:** política operacional desenhada para o caso familiar de Ana Luiza — cidadania austríaca, §58c StbG  
**Objetivo:** transformar a política familiar já desenhada para Ana Luiza em padrão único para todos os casos do Clube Ancestral, eliminando duplicidades de IDs, jornadas e cadastros paralelos.

---

## 0. Objetivo central

O Clube Ancestral deve trabalhar com uma política única, independente de país, rota, produto ou composição familiar:

```text
Lead/cliente
→ Caso canônico
→ Núcleo familiar, quando houver
→ Discovery e diagnóstico
→ Proposta e aceite
→ Contrato e financeiro
→ Grupo familiar/WhatsApp, quando aplicável
→ App do cliente
→ Onboarding único
→ Jornada individual e/ou familiar
→ Pesquisa, documentos e micro-entregas
→ Comunicação e cadências
→ Protocolo, pós-reconhecimento e legado
```

Nenhum caso deve ter duas identidades, dois IDs, dois cadastros, duas jornadas ou duas fontes operacionais concorrentes.

Não criar uma política exclusiva para Ana Luiza. O caso dela deve ser apenas uma referência de **padrão replicável**.

---

## 1. Pré-requisito

Executar somente depois que a proprietária tiver acesso estável e o CRUD básico estiver funcionando no Supabase próprio:

```text
Login
→ cliente
→ caso
→ atualização
→ proposta
→ contrato em rascunho
→ pagamento manual
→ dados persistidos após refresh
```

Não introduzir esta política por meio de listas estáticas, cards sem dados, mocks, arrays locais ou novas abas desconectadas.

---

## 2. Regra-mãe: um caso canônico

### Definição

Todo atendimento, individual ou familiar, possui **um único `case_id` canônico**. Esse ID é a fonte de verdade para:

```text
CRM
Discovery
Diagnóstico
Proposta
Contrato
Financeiro
Onboarding
Cadências
Documentos
Pesquisa
Micro-entregas
Planejador
App cliente
Portal/visão do cliente
Comunicação
Pós-reconhecimento
```

### Proibido

- Criar novo ID para o mesmo caso em cada módulo.
- Criar ID de go-live diferente do ID do dossiê.
- Criar ID diferente para Drive, app, proposta, contrato, financeiro ou tarefa.
- Fazer o cliente aparecer duas vezes por importação, lead convertido ou cadastro manual.
- Criar uma jornada no app independente da jornada do caso no Desk.
- Criar uma cópia de caso apenas para exibir ao cliente.

### Regra de exibição

```text
case_id = chave técnica imutável
case_code = código humano visível e editável apenas por owner/admin
```

Exemplo de código humano:

```text
CA-CID-AT-FAM-2026-001
```

O mesmo `case_code` deve aparecer em proposta, contrato, pasta, financeiro, app e comunicações. Se houver necessidade de migração de código, manter alias/histórico; não duplicar caso.

---

## 3. Correção de duplicidade — Ana Luiza como primeiro caso

### Situação conhecida

Há referência concorrente para o mesmo caso familiar:

```text
CA-CID-AT-FAM-2026-001
CA-AUT-ANALUIZA-FAM-2026-001
```

### Objetivo desta correção

Não criar outro caso. Não apagar dados. Não fazer merge cego.

Criar uma rotina de reconciliação que:

1. Localize todos os registros ligados aos dois códigos.
2. Identifique qual `case_id` contém a maior quantidade de vínculos reais.
3. Defina um único `case_id` canônico e um `case_code` humano oficial.
4. Reaponte os registros relacionados ao caso canônico, sem perder dados.
5. Grave o código antigo como alias/histórico de migração.
6. Marque a duplicidade antiga como `merged`/`archived`, sem exclusão física.
7. Garanta que app, Desk, proposta, contrato, documentos, financeiro e comunicações consultem somente o caso canônico.

### Tabela de aliases/migração

Usar tabela existente equivalente ou criar apenas se não houver:

```sql
create table case_code_aliases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  alias_code text not null,
  alias_type text not null default 'legacy',
  valid_from timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, alias_code)
);
```

### Resultado obrigatório do caso Ana Luiza

```text
Um único cliente/núcleo familiar.
Um único case_id canônico.
Um case_code oficial.
Aliases preservados para busca/histórico.
Nenhum dado apagado.
Nenhuma tela exibindo dois casos para a mesma família.
```

---

## 4. Modelo de caso individual e familiar

### Caso individual

```text
Cliente contratante
→ Caso canônico
→ pessoa requerente
→ linha familiar/documentos/pesquisa
→ proposta/contrato/financeiro
→ app individual
```

### Caso familiar

```text
Cliente ou contato principal
→ Caso familiar canônico
→ núcleo familiar
→ participantes individuais
→ trilhas individuais
→ visão compartilhada de jornada
→ contrato e financeiro conforme o escopo
→ grupo familiar/WhatsApp quando aplicável
→ app com permissões por pessoa
```

### Entidades necessárias

Usar as existentes ou criar somente se faltarem:

```text
clients
citizenship_cases / cases
family_groups / case_family_units
case_participants
persons
person_relationships
case_lineages
```

### Tabela de participantes

```sql
create table case_participants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  client_id uuid,
  person_id uuid,
  full_name text not null,
  participant_role text not null,
  relationship_to_primary text,
  is_contracting_party boolean not null default false,
  is_financial_responsible boolean not null default false,
  is_portal_contact boolean not null default false,
  is_minor boolean not null default false,
  representation_status text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Papéis de participante

```text
primary_applicant
co_applicant
dependent
parent
sibling
spouse_observer
contracting_party
financial_responsible
portal_contact
legal_representative
other
```

Uma pessoa pode ter mais de um papel lógico, mas o sistema deve exibir de forma compreensível.

---

## 5. Política de grupo familiar e WhatsApp

### Princípio

O grupo familiar é um canal de coordenação humana. Não substitui contrato, proposta, financeiro, dossiê, documentos, pesquisa, app ou portal.

### Quando criar/ativar grupo

Criar ou registrar um grupo familiar somente quando houver:

1. Caso canônico definido.
2. Núcleo/participantes identificados.
3. Contato principal definido.
4. Pauta inicial concreta: coleta de dados, documentos, reunião de abertura ou orientação de jornada.
5. Consentimento/contexto para participação dos membros.

### Objetivo do grupo

```text
Orientações breves
Atualizações familiares relevantes
Alinhamento de documentos compartilhados
Convite para reuniões
Celebração de marcos/achados autorizados
Encaminhamento ao app para ações e histórico
```

### O que não deve ocorrer no grupo

```text
Contrato completo ou dados cadastrais sensíveis
Documentos pessoais de outro membro sem necessidade
Informações jurídicas privadas de uma pessoa
Detalhamento financeiro individual sem autorização
Substituição do portal/documentos
Cobrança excessiva ou cadência automática sem contexto
```

### Regra comercial

Atualizações em grupo de WhatsApp são parte do relacionamento e da comunicação prevista no processo; não devem ser cobradas como serviço adicional separado.

### Registro do grupo no caso

```sql
create table case_communication_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null,
  channel text not null default 'whatsapp',
  group_name text,
  external_reference text,
  purpose text not null,
  status text not null default 'planned',
  primary_contact_participant_id uuid,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  archived_at timestamptz
);
```

Não automatizar criação real de grupo no WhatsApp nesta etapa. Registrar a existência e o propósito no Caso 360; a criação externa é feita pela proprietária quando decidir.

### Mensagem-base de abertura

```text
Olá, [nomes]! 😊

Criei este grupo para centralizarmos as orientações e atualizações da jornada de vocês com o Clube Ancestral.

Por aqui, vamos compartilhar próximos passos, alinhar documentos, avisar sobre marcos importantes e facilitar a comunicação entre todos. Os documentos e informações organizadas ficarão no espaço da família no app, para que cada etapa permaneça registrada com clareza.

Para começarmos, o primeiro passo é [próxima ação]. 🌿
```

---

## 6. Política do App Cliente

### Papel do app

O app é a fonte de verdade visível para a família/cliente. O grupo é apoio humano; o app guarda contexto, histórico, documentos, jornada, entregas e próximos passos.

```text
Grupo WhatsApp = acolhe, orienta, lembra e celebra.
App Cliente = organiza, registra, mostra, centraliza e permite agir.
Desk = opera, controla e acompanha o caso.
```

### Convite ao app

Liberar convite/acesso quando houver, no mínimo:

```text
Caso canônico ativo
Participante/contato principal definido
Fase inicial da jornada definida
Pelo menos uma próxima ação ou requisito visível
Dados mínimos organizados para a visualização
```

O acesso ao app não deve depender de contrato, Asaas, integração externa, auditoria, modo proprietária ou checklist perfeito. Informações sensíveis podem ficar ocultas; a jornada básica deve poder aparecer assim que houver conteúdo útil.

### Estrutura de app para caso familiar

```text
Visão da família
├── Jornada compartilhada
├── Próximo passo familiar
├── Documentos compartilhados
├── Atualizações e micro-entregas liberadas
├── Reuniões/marcos familiares
└── Informações comerciais permitidas

Trilha individual de cada participante
├── Documentos próprios
├── Pendências pessoais
├── Linha/fonte/pesquisa aplicável
├── Atualizações individuais autorizadas
└── Próximas ações pessoais
```

### Permissões

- Participante/cliente vê apenas o que foi liberado para seu perfil/núcleo.
- Contato principal pode ver a visão familiar compartilhada.
- Owner/admin pode abrir a visão de qualquer participante ou família da mesma organização sem logout e sem se tornar cliente.
- App não expõe notas internas, valores internos, dados de terceiros, dados de menor sem autorização ou documentos pessoais de um membro a outro sem necessidade.

---

## 7. Onboarding unificado para todos os casos

### Regra

Não criar onboarding separado por grupo, pessoa, país ou aba. Criar um motor único, no Caso 360, parametrizado por contexto.

```text
Onboarding = um motor
Templates = variações por serviço, país, rota, escopo e composição familiar
```

### Contextos de template

```text
service_type
SKU/categoria de serviço
country_code
route
case_type: individual | family
family_scope
participant_role
current_phase
```

### Estrutura padrão do onboarding

```text
1. Entrada e boas-vindas
2. Dados e documentos iniciais
3. Primeira entrega/leitura inicial
4. Pendências do cliente/família
5. Execução interna/pesquisa
6. Atualizações recorrentes
7. Preparação de próxima etapa
8. Conclusão do escopo
9. Continuidade/pós-venda/legado
```

### Regras para casos familiares

- Criar uma ação compartilhada quando todos os membros precisam agir.
- Criar ação individual quando apenas uma pessoa é responsável por documento, cadastro ou decisão.
- A visão familiar mostra o progresso global sem expor detalhes privados desnecessários.
- A proprietária pode criar, concluir, reprogramar, pausar e reativar ações sem bloqueios de governança artificiais.

---

## 8. Jornada, Planejador e micro-entregas

### Fases canônicas

```text
discovery
diagnosis
research
legal_preparation
filing
post_recognition
```

### Regra de caso familiar

O caso tem uma fase global e os participantes podem ter substatus individuais.

```text
Fase global: representa a jornada do núcleo/processo.
Substatus individual: representa documento, linha, pendência ou ação de cada pessoa.
```

### Micro-entregas

Toda micro-entrega deve ter:

```text
case_id
participante opcional
visibilidade: interna | família | participante
fonte: documento, pesquisa, diagnóstico, contrato, milestone etc.
próxima ação relacionada quando aplicável
```

Exemplos:

```text
Checklist familiar inicial organizado
Linha ancestral de Ana Luiza mapeada
Documento de Adair localizado
Dados de Alice recebidos
Representação de Felipe documentada
Proposta familiar aceita
Contrato familiar gerado
Primeira parcela confirmada
Pasta em revisão
Marco de protocolo registrado
```

### Atualizações

- Atualização compartilhada vai para o app da família e, quando apropriado, grupo de WhatsApp.
- Atualização individual vai apenas ao participante/contato adequado.
- Atualização interna fica somente no Desk.

---

## 9. Proposta, contrato e financeiro: política por núcleo

### Proposta

A proposta deve apontar para o `case_id` canônico e especificar:

```text
Participantes incluídos
Participantes observadores/dependentes
Escopo por pessoa e escopo compartilhado
Produtos/SKUs vinculados
Valores por item, pessoa ou família
Forma de pagamento
Validade
Contato financeiro responsável
```

### Contrato

O contrato deve derivar do caso canônico e manter:

```text
Contratantes
Participantes
Responsável financeiro
Representação de menor quando aplicável
Escopo individual e compartilhado
Anexos aplicáveis
Versão e aditivos
```

### Financeiro

O financeiro pode ser familiar ou individual, mas não pode criar outro caso.

```text
financeiro.case_id = case_id canônico
receivable.participant_id = opcional, quando cobrança individual
responsável financeiro = participante marcado
```

### Caso Ana Luiza — referência histórica

O histórico do caso registra uma proposta familiar de R$ 9.600, com três parcelas/assinaturas mensais de R$ 320 ao longo de 10 meses ou referência agregada de R$ 960 mensais, início previsto em 01/10/2026. Essa informação deve ser reconciliada no caso canônico e não replicada em casos ou lançamentos paralelos.

---

## 10. Discovery como início formal da jornada

Todo caso deve começar com um registro estruturado de Discovery, sem depender de memória, gravação solta ou mensagem de WhatsApp.

### Dados mínimos

```text
Origem do lead
Objetivo principal
País(es) de interesse
Pessoas/ascendentes mencionados
Composição familiar
Documentos já existentes
Dúvidas e hipóteses
Riscos/pendências iniciais
Resumo da conversa
Link de gravação/transcrição quando houver
Próxima ação
Responsável
Data de retorno
```

### Em caso familiar

Registrar:

```text
Contato principal
Participantes convidados
Participantes confirmados
Participantes contratantes
Dependentes/menores
Representantes legais quando aplicável
Decisão sobre grupo de WhatsApp
Decisão sobre acesso ao app
```

Após salvar Discovery:

```text
Criar/atualizar caso canônico
Criar participantes
Criar tarefas e requisitos iniciais
Criar próxima ação
Criar onboarding quando houver contratação/ativação
Criar rascunho de proposta/devolutiva quando aplicável
```

---

## 11. Cadências e comunicação

### Eventos que devem acionar tarefas/rascunhos

```text
lead_created
discovery_completed
proposal_sent
proposal_accepted
contract_sent
contract_signed
payment_registered
onboarding_started
document_requested
document_received
research_finding_created
case_phase_changed
milestone_completed
recognition_confirmed
subscription_renewal_due
```

### Regra familiar

| Situação | Canal/visibilidade | Ação |
|---|---|---|
| Orientação comum à família | Grupo + app familiar | Mensagem breve + atualização persistida |
| Documento individual | Mensagem individual + app pessoal | Tarefa/requisito por participante |
| Marco compartilhado | Grupo + app familiar | Micro-entrega e próxima etapa |
| Financeiro familiar | Contato financeiro | Mensagem individual/contextual |
| Documento de menor | Representante legal | Nunca enviar para participante inadequado |
| Descoberta individual | Participante/contato autorizado | Atualização individual ou familiar conforme decisão |

### Regra de interrupção

```text
Resposta, pagamento, envio de documento ou aceite
→ encerra a cadência equivalente
→ atualiza próxima ação
→ evita mensagens duplicadas
```

---

## 12. Indicadores reais e visão de carteira

### Indicadores de integridade

| Indicador | Regra |
|---|---|
| Casos com código duplicado | Deve ser zero para casos ativos |
| Participantes sem caso canônico | Deve ser zero |
| Propostas sem `case_id` | Deve ser zero após migração |
| Contratos sem `case_id` | Deve ser zero após migração |
| Financeiro sem `case_id` | Deve ser zero após migração |
| Documentos/pesquisa sem `case_id` | Deve ser zero após migração |
| Casos sem próxima ação | Alertar no Painel Hoje |
| Casos familiares sem contato principal | Alertar no Painel Hoje |
| Casos familiares sem participantes definidos | Alertar no Painel Hoje |
| Duplicidade por nome/telefone/e-mail | Sugerir revisão, não bloquear cadastro |

### Indicadores de jornada

```text
Casos por fase
Onboardings ativos/pausados/concluídos
Ações familiares pendentes
Ações individuais pendentes
Documentos críticos por núcleo
Micro-entregas por caso
Tempo até primeira entrega
Casos sem atualização recente
```

Não exibir números simulados. Se não houver dados, mostrar “Sem dados suficientes”.

---

## 13. Caso 360 — interface obrigatória

No detalhe de qualquer caso, exibir:

```text
Cliente / contato principal
Case code único
Tipo: individual ou familiar
Participantes e papéis
Fase global
Próxima ação
Responsável
Discovery
Proposta
Contrato
Financeiro
Onboarding
Cadência
Documentos
Pesquisa
Micro-entregas
Milestones
Atualizações
Acesso ao app/visão do cliente
Grupo familiar, quando aplicável
```

### Ações rápidas

```text
Adicionar participante
Definir contato principal
Abrir/registrar grupo familiar
Registrar Discovery
Criar proposta
Criar contrato
Registrar pagamento
Iniciar onboarding
Criar tarefa
Adicionar documento
Registrar descoberta
Liberar atualização no app
Abrir visão do cliente/família
```

Nenhuma dessas ações pode depender de Modo Proprietária, reconfirmação, auditoria, checklist de governança ou outra trava de interface artificial.

---

## 14. Plano de migração e adoção

### Fase 1 — Mapear sem modificar

1. Listar casos, clientes, propostas, contratos, documentos, tarefas, financeiro, pesquisa e registros de app.
2. Localizar duplicidades por `case_code`, cliente, família, telefone, e-mail e proposta.
3. Produzir uma matriz de reconciliação:

| Registro antigo | Entidade | Caso de destino | Ação | Confiança | Observação |
|---|---|---|---|---|---|

4. Não mover, apagar ou reatribuir dados nesta fase.

### Fase 2 — Corrigir Ana Luiza em branch isolada

1. Definir `case_id` canônico e `case_code` oficial.
2. Migrar/reapontar registros apenas após apresentar matriz à proprietária.
3. Preservar aliases e histórico.
4. Validar Caso 360, visão familiar, participantes, contrato/proposta/financeiro e app em preview.
5. Não criar novo caso para fazer a correção.

### Fase 3 — Aplicar política a todos os casos

1. Rodar detector de duplicidade.
2. Criar `case_code` canônico quando faltar.
3. Vincular entidades órfãs ao caso correto.
4. Criar participantes para casos familiares.
5. Criar onboarding único e próxima ação.
6. Ligar Desk, app, comunicação e financeiro ao mesmo `case_id`.
7. Corrigir uma família/caso por vez, com preview e confirmação da proprietária.

---

## 15. Critérios de aceite

### Ana Luiza

1. Existe apenas um caso ativo da família no Desk.
2. Ambos os códigos históricos encontram o mesmo caso por alias, sem criar duplicidade visual.
3. Ana Luiza, Adair, Alice e Felipe estão vinculados ao mesmo caso com papéis definidos.
4. Contato principal e responsável financeiro estão identificados.
5. Proposta, contrato, financeiro, documentos, tarefas, onboarding e app usam o mesmo `case_id`.
6. Grupo familiar, se criado, está registrado como canal de coordenação e não como banco de dados.
7. Owner/admin abre a visão da família no app sem logout.
8. Cada participante vê apenas dados liberados para seu contexto.
9. Existe uma próxima ação única no Caso 360.
10. O caso persiste e permanece único após refresh.

### Todos os casos

1. Todo caso novo nasce com `case_id` e `case_code` único.
2. Todo caso tem cliente/contato principal e próxima ação.
3. Caso familiar tem participantes, papéis e regras de visibilidade.
4. Proposta, contrato, financeiro, onboarding, pesquisa, documento e micro-entrega usam o mesmo `case_id`.
5. App Cliente é uma visualização do caso, não um caso separado.
6. Grupo WhatsApp é opcional e registrado; não substitui app ou Desk.
7. Não há onboarding por aba/cenário isolado; existe um motor único parametrizado.
8. Não há duplicidade de código ativo para a mesma família/serviço.
9. Não há mock, lista estática ou dado fictício apresentado como estado real.
10. Nenhuma ação interna exige Modo Proprietária, reconfirmação, auditoria ou gate institucional.

---

## 16. Proibições

Não fazer nesta tarefa:

- Não apagar dados, casos, documentos, contratos, propostas, pagamentos ou histórico.
- Não executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migrations destrutivas.
- Não mesclar casos automaticamente sem matriz de reconciliação e validação da proprietária.
- Não criar casos novos para contornar duplicidade.
- Não criar app, grupo ou onboarding separado para cada pessoa/cenário.
- Não expor dados pessoais de um membro familiar a outro sem necessidade/visibilidade definida.
- Não criar novas camadas de governança, Modo Proprietária, reconfirmação, auditoria bloqueante, override ou aprovação em lote.
- Não começar integração externa de WhatsApp, Asaas, e-mail ou fontes genealógicas antes de a política interna funcionar com dados persistidos.
- Não declarar concluído por haver arquivos, rotas, telas, listas ou testes unitários; demonstrar funcionamento no preview com dados reais de teste.

---

## 17. Entregáveis

1. Branch: `feat/politica-unificada-casos-familiares`.
2. Documento de matriz de reconciliação de duplicidades — leitura antes de qualquer migração.
3. Correção do caso Ana Luiza em preview, com um único caso canônico e aliases preservados.
4. Motor único de caso individual/familiar, participantes, onboarding e visibilidade de app.
5. Caso 360 com todas as relações pelo mesmo `case_id`.
6. Preview Vercel conectado ao Supabase próprio.
7. Relatório curto contendo:
   - caso canônico definido para Ana Luiza;
   - aliases preservados;
   - registros vinculados/reapontados;
   - política aplicada a novos casos;
   - resultado dos critérios de aceite;
   - falhas reais restantes;
   - URL de preview.
8. Não fazer merge em `main` sem aprovação explícita da proprietária.

---

## Regra final

> Ana Luiza não é uma exceção operacional. É o primeiro caso de uma política que deve servir a toda pessoa, família, proposta, contrato, documento, pagamento, jornada e acesso ao app do Clube Ancestral.
>
> **Um caso. Um código canônico. Uma jornada. Uma fonte de verdade. Uma próxima ação.**
