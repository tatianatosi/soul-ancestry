# Desk Simples — Arquitetura Visual e Operacional

**Projeto:** Clube Ancestral Desk Intelligence  
**Objetivo:** simplificar a navegação diária sem apagar capacidades, mantendo a arquitetura completa como cobertura funcional e concentrando o trabalho em poucas portas operacionais claras.

---

## Princípio

O Desk não deve ser uma coleção de abas técnicas, gates, matrizes ou telas isoladas. Ele deve permitir que a equipe responda rapidamente:

```text
O que precisa acontecer agora?
Quem é a pessoa/família?
Qual caso estamos conduzindo?
Qual evidência sustenta a jornada?
Como atraímos/nutrimos novos clientes?
Como a operação é administrada com segurança?
```

A simplificação não elimina rotas, dados ou motores. Ela tira complexidade do menu principal e leva detalhes para o contexto certo — principalmente o Caso 360 e Pessoa 360.

---

## Menu principal

```text
HOJE
COMERCIAL
CASOS
PESSOAS & FAMÍLIAS
PESQUISA
MARKETING
CONFIGURAÇÃO
```

---

## Hoje

**Pergunta que responde:** o que precisa acontecer agora — e com quem?

### Itens

```text
- Painel Hoje
- Minhas tarefas
- Próximas ações
- Alertas operacionais
- Atividade recente
- Pessoas acompanhadas
- Pessoa 360 rápida
```

### Pessoa 360 rápida

O grupo Hoje deve permitir buscar ou abrir rapidamente uma pessoa — por exemplo, Ana Luiza — e consultar seu contexto completo sem procurar em vários grupos.

```text
Ana Luiza
Caso: CA-CID-AT-FAM-2026-001
Fase: [fase atual]
Próxima ação: [descrição]
Responsável: [nome/papel]
Tarefas abertas: [número]
Documentos pendentes: [número]
Contrato: [rascunho/em revisão/pronto]
Última atualização: [data/hora]

[Ver Pessoa 360] [Abrir Caso 360]
```

### Pessoa 360

Pessoa 360 é uma visão agregada, não uma nova identidade, novo cliente, novo caso ou novo núcleo.

```text
Pessoa 360
- Dados e contatos
- Casos vinculados
- Núcleo e participantes
- Jornada atual
- Tarefas e próximas ações
- Propostas e contratos
- Ordens de Serviço
- Documentos e solicitações
- Pesquisa, fontes, achados e linhagens
- Micro-entregas e relatórios
- Comunicações e acesso ao app
- Histórico de alterações
```

---

## Comercial

**Pergunta que responde:** quem está entrando, sendo qualificado ou se tornando caso?

```text
- Leads e oportunidades
- Discovery
- Propostas
- Clientes
- Condições comerciais
- Financeiro do caso
- Conversão e origem do lead
```

### Regra

```text
Campanha/formulário
→ lead
→ discovery
→ oportunidade
→ proposta
→ aceite
→ caso canônico
```

Não criar novo caso para proposta, pagamento, contrato, portal, app ou comunicação.

---

## Casos

**Pergunta que responde:** o que estamos executando para esta pessoa/família?

```text
- Todos os casos
- Caso 360
- Onboarding
- Ordens de Serviço
- Entregas e relatórios
```

### Caso 360

O Caso 360 é a porta principal de trabalho. Ele deve abrir mesmo que ainda não existam Planejador, proposta, SKU, condição comercial, contrato assinado, pagamento confirmado, portal, checklist completo ou onboarding ativado.

#### Abas principais

```text
- Visão geral
- Pessoas
- Tarefas
- Pesquisa
- Documentos
- Comercial
- Execução
```

#### Visão geral

```text
Cliente/contato principal
Código humano do caso
Tipo: individual ou familiar
Fase operacional
Próxima ação
Responsável
Núcleo vinculado
Dossiê vinculado, quando houver
Piloto real ou Demonstração, quando aplicável
```

#### Pessoas

```text
Contratantes
Participantes
Dependentes
Representantes legais
Relações familiares
Pessoa 360
```

#### Tarefas

```text
Próxima ação
Tarefas abertas
Pendências com responsável
Ações compartilhadas e individuais
Prazos e reprogramações
```

#### Pesquisa

```text
Achados
Evidências
Hipóteses
Linhagens
Fontes relacionadas
Solicitações documentais
```

#### Documentos

```text
Documentos internos
Arquivos liberados
Solicitações
Anexos
Entregáveis documentais
```

#### Comercial

```text
Discovery
Proposta
SKU/produto
Condição comercial
Financeiro
Acesso de revisão do portal, quando existir
```

#### Execução

```text
Contrato
Cláusulas
Anexos contratuais
Ordem de Serviço
Onboarding
Micro-entregas
Marcos
Comunicação operacional
```

---

## Pessoas & Famílias

**Pergunta que responde:** para quem e com quem estamos trabalhando?

```text
- Pessoa 360
- Núcleos familiares
- Participantes
- Relações e linhagens familiares
- Dossiês familiares
```

### Princípios

- Caso familiar possui um caso canônico e núcleo associado quando aplicável.
- Participantes pertencem ao mesmo caso/núcleo, com papéis e visibilidades compreensíveis.
- Não criar um cadastro paralelo para app, contrato, proposta ou tarefa.
- Não usar “canônico” como sinônimo de registro novo.
- Possíveis duplicidades são alerta para revisão humana, não merge automático.

---

## Pesquisa

**Pergunta que responde:** qual evidência sustenta a jornada e o que precisamos descobrir?

```text
- Painel de pesquisa
- Achados genealógicos
- Pessoas da pesquisa
- Linhagens
- Hipóteses
- Evidências
- Solicitações documentais
- Biblioteca de documentos
- Bibliotecas genealógicas
- Fontes genealógicas
- Bases e repositórios
- Integrações de pesquisa
- Relatórios de pesquisa
```

### Fluxo de pesquisa

```text
Base/repositório
→ fonte genealógica
→ busca/consulta
→ evidência
→ achado
→ hipótese ou confirmação
→ linhagem
→ documento
→ relatório/micro-entrega
→ próxima ação ou tarefa
```

### Definições

| Item | Finalidade |
|---|---|
| Bibliotecas genealógicas | Acervos internos/externos, índices, coleções, livros, guias e materiais de referência. |
| Fontes genealógicas | Origem usada em uma investigação específica: arquivo, paróquia, registro civil, coleção, base, site ou pesquisador. |
| Bases e repositórios | Catálogo de provedores e acervos consultáveis, com contexto de acesso e viabilidade. |
| Evidências | Registro que sustenta ou contradiz dado, hipótese, pessoa ou vínculo. |
| Achados | Descobertas ligadas ao caso, pessoa ou linhagem. |
| Hipóteses | Possibilidades ainda não confirmadas; não devem ser exibidas como prova. |
| Solicitações documentais | Pedidos de certidão, imagem, transcrição, tradução, apostila ou outro documento. |
| Relatórios de pesquisa | Sínteses internas ou entregas liberadas à família. |

Pesquisa e integrações ficam no backend/Desk. O App Cliente recebe apenas resultado tratado, fonte/evidência apropriada, status, descoberta validada, documento liberado e próxima ação.

---

## Marketing

**Pergunta que responde:** como atraímos, nutrimos e convertemos pessoas em casos?

```text
- Dashboard de marketing
- Produtos e ofertas
- Campanhas
- Conteúdos
- Landing pages
- Formulários e captação
- Segmentos e públicos
- Automação e cadências
- Origem de leads
- Conversão e funil
- Biblioteca de mensagens
- Métricas de campanha
```

### Fluxo

```text
Conteúdo/campanha
→ landing page ou formulário
→ lead
→ segmentação
→ cadência
→ discovery
→ oportunidade
→ proposta
→ caso canônico
```

Marketing pode consultar catálogo e preços para montar oferta, mas não pode manter outra fonte de verdade para SKU, preço, link de cobrança ou condição comercial.

Envios externos por e-mail, WhatsApp ou outros canais continuam dependendo de infraestrutura real, destinatário resolvido e confirmação explícita quando a ação for irreversível.

---

## Configuração

**Pergunta que responde:** como a operação se mantém consistente, segura e administrável?

```text
- Perfil institucional
- Catálogo e preços
- Equipe e acessos
- Integrações operacionais
- Modelos e templates
- Parâmetros do sistema
- Dados técnicos
- Qualidade e auditoria
```

### Regra

Configuração não é Pesquisa.

Bibliotecas, fontes, bases e repositórios genealógicos pertencem a Pesquisa. Configuração guarda dados institucionais, equipe, acessos, modelos, parâmetros, integrações técnicas e relatórios administrativos.

---

## Dados técnicos e gates

Não apresentar como rota principal ou ponto de partida:

```text
NO_GO
GO_CONDICIONAL
Bloqueado pelo elo anterior
Gates A–H
Checklist de governança
Auditoria como pré-requisito
Portal bloqueado como estado dominante
```

Quando úteis, esses elementos devem existir em seção recolhida:

```text
Dados técnicos e validações
- requisitos de ativação;
- integridade de cadeia;
- auditoria;
- critérios de serviço;
- status de integração;
- diagnóstico de inconsistências.
```

Eles servem para diagnóstico e para o momento de ações formais/externalizadas. Não podem impedir o trabalho interno diário.

---

## Regras de trabalho

### Rascunhos internos

Devem ser possíveis com dados mínimos estruturais:

```text
Caso
Participante
Tarefa
Pesquisa
Fonte
Documento interno
Proposta rascunho
Contrato rascunho
Cláusula
Anexo
Ordem de Serviço
Micro-entrega
Próxima ação
```

### Validações no momento certo

| Ação | Quando validar |
|---|---|
| Rascunho interno | Apenas campos mínimos estruturais. |
| Assinatura | Partes, qualificação e representação realmente necessárias. |
| Cobrança | Dados financeiros necessários. |
| Convite externo | E-mail/contato autorizado, nível de acesso e confirmação. |
| Envio externo | Destinatário resolvido e confirmação explícita. |
| Ativação formal | Requisitos estritamente ligados à ativação. |
| Pesquisa externa | Integração, custo e autorização quando necessário. |

### Segurança

Manter:

- RLS.
- Login e sessão.
- Permissões por organização e usuário.
- Isolamento entre organizações.
- Auditoria em segundo plano.
- Confirmação explícita apenas para ações externas reais e irreversíveis.

---

## Regra final

```text
Hoje: o que precisa acontecer agora?
Comercial: quem está virando caso?
Casos: o que estamos executando?
Pessoas & Famílias: para quem e com quem?
Pesquisa: qual evidência sustenta a jornada?
Marketing: como atraímos e nutrimos?
Configuração: como a operação se mantém segura e consistente?
```

> O Desk simples não reduz o produto. Ele tira a arquitetura técnica do caminho e devolve a operação diária à proprietária e à equipe.
