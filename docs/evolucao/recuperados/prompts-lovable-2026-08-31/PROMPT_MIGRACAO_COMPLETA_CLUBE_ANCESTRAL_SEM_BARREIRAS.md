# Prompt de Implementação — Clube Ancestral Completo, Próprio e Operável

**Projeto GitHub:** `tatianatosi/soul-ancestry`  
**Hospedagem:** Vercel  
**Banco, autenticação e arquivos:** Supabase próprio do Clube Ancestral  
**Branch obrigatória:** `refactor/plataforma-completa-sem-barreiras`  
**Objetivo:** consolidar o aplicativo completo do Clube Ancestral fora do fluxo de desenvolvimento do Lovable, preservando todas as funcionalidades necessárias à operação e removendo somente os mecanismos que bloqueiam a proprietária de trabalhar.

---

## 0. Ordem de prioridade

Esta tarefa não é um redesign, não é uma prova de conceito e não é um novo MVP reduzido.

É uma intervenção de estabilização e conclusão de uma plataforma operacional completa. A proprietária precisa recuperar e manter acesso contínuo às funções de trabalho sem reconfirmação, modo especial, auditoria visível, gates de interface, aprovações em lote ou telas intermediárias.

### Resultado obrigatório

> A proprietária entra com sua conta normal, abre qualquer área do Desk, cria, edita, salva, corrige, emite proposta, gera contrato, registra pagamento, organiza documentos e conduz casos sem precisar provar que é proprietária, sem passar por governança e sem encontrar bloqueios artificiais.

---

## 1. Arquitetura definitiva

```text
GitHub privado: tatianatosi/soul-ancestry
        ↓
Branch de trabalho + Pull Request
        ↓
Vercel: preview para validação da proprietária
        ↓
Merge em main somente após aceite funcional
        ↓
Vercel: produção
        ↓
Supabase próprio do Clube Ancestral
  ├── Auth
  ├── PostgreSQL
  ├── Storage de documentos
  └── funções server-side somente para integrações reais
```

### Regra de independência

- Não usar Lovable como fonte de código, banco, deploy, autenticação, regra de acesso ou publicação.
- Não apagar o repositório existente.
- Não apagar dados de clientes, pesquisas, documentos, propostas, contratos, pagamentos, produtos ou arquivos.
- Não recriar o banco se o Supabase atual contém os dados corretos.
- Não executar migração destrutiva.
- Fazer backup lógico antes de qualquer migration que altere esquema/dados.

---

## 2. Regra única de acesso

Manter apenas uma barreira de acesso às áreas internas:

```text
Sessão autenticada no Supabase
  + vínculo ativo do usuário com a organização Clube Ancestral
  = acesso ao Desk.
```

Para a proprietária e administradora, o papel `owner` ou `admin` deve liberar todas as telas e operações internas.

```ts
const temSessao = Boolean(session?.user);
const temOrganizacao = Boolean(membership?.organization_id);
const eProprietariaOuAdmin = membership?.role === "owner" || membership?.role === "admin";

const podeEntrarNoDesk = temSessao && temOrganizacao;
const podeOperarTudo = podeEntrarNoDesk && eProprietariaOuAdmin;
```

### Comportamento obrigatório

- Sem sessão: direcionar somente para login.
- Com sessão e vínculo ativo: carregar o Desk.
- Proprietária/admin: permitir todos os CRUDs internos e todas as rotas internas.
- Sem vínculo: exibir uma única mensagem objetiva: **“Sua conta não está vinculada a uma organização. Solicite suporte administrativo.”**
- Se houver erro de banco/API: exibir mensagem clara e ação de tentativa; nunca falhar silenciosamente.
- A identificação de papel deve ocorrer uma vez por sessão e não pode redirecionar a usuária para outra tela durante o trabalho.

### Não usar como condição de acesso

```text
modo proprietária
reconfirmação de propriedade
auditoria
aprovação em lote
governança
varredura administrativa
gate institucional
perfil institucional confirmado
checklist de lançamento
SKU homologado
link Asaas configurado
contrato assinado
pagamento conciliado
fase da jornada
checklist documental
justificativa de override
```

---

## 3. Remoção definitiva dos bloqueios

Desativar do fluxo de navegação, das ações, dos guards, dos loaders e dos componentes todos os mecanismos abaixo:

```text
/modo-proprietaria
/reconfirmar-propriedade
/governanca/varredura-administracao
/auditoria
```

Remover imports, chamadas, queries, mutations, redirecionamentos, feature flags, links de menu, cards, modais e dependências funcionais relacionadas a:

```text
modo-proprietaria.ts
modo-proprietaria.functions.ts
modo-proprietaria-cobertura.ts
gates-override.ts
varredura-autorizacoes.ts
varredura-administracao.ts
components/governanca/modo-proprietaria.tsx
components/governanca/varredura-administracao.tsx
components/governanca/lote-aprovacoes-s01-s05.tsx
components/governanca/decisao-proprietaria.tsx
components/governanca/cobertura-modulos.tsx
```

Se for necessário preservar arquivos por histórico, mover para:

```text
docs/arquivados/governanca-removida-2026-08-28/
```

Eles não podem ser importados pelo bundle, executados em produção, aparecer no menu, bloquear um formulário, afetar carregamento de rota nem ser pré-requisito de testes de aceite.

### Regra de salvamento

Todas as operações internas precisam aceitar rascunho e salvar com dados mínimos.

- Pendência informa; não bloqueia.
- Fase informa; não bloqueia.
- Checklist informa; não bloqueia.
- SKU/link/preço ausente informa; não bloqueia.
- Documento não revisado informa; não bloqueia.
- Contrato não assinado informa; não bloqueia.
- Integração externa indisponível informa; não bloqueia.

---

## 4. Módulos que devem permanecer e funcionar

**Não reduzir o produto. Não remover módulos de operação.** A simplificação é de acesso e fluxo, não de escopo.

| Módulo | Resultado operacional obrigatório |
|---|---|
| Hoje / Painel | Casos, tarefas, pendências, próximos contatos, pagamentos e ações rápidas |
| Leads e clientes | Criar, editar, buscar, arquivar, atribuir responsável e registrar origem/contato |
| Casos | Criar, editar, pausar, reabrir, concluir, mover fase e registrar atualização |
| Planejador | País, rota, fase, milestones, checklist, pendências, previsão em faixa e histórico da jornada |
| Pesquisa | Pessoas, nomes, relações, eventos, fontes, evidências, hipóteses, achados e pedidos |
| Documentos | Upload, vínculo com pessoa/caso, status, origem, pedido, recebimento, revisão, tradução, apostila e retificação |
| Produtos e SKUs | Catálogo, código SKU, escopo, preço, status, upgrade, upsell, versão e link de cobrança opcional |
| Propostas | Rascunho, itens/SKUs, escopo livre, desconto, entrada, parcelas, validade e conversão para contrato |
| Contratos | Modelo, campos parametrizados, cláusulas editáveis, anexos, versão, PDF, aceite e aditivo |
| Financeiro | Honorários, despesas, taxas, entradas, parcelas, vencimentos, pagamentos, saldo e conciliação posterior |
| Comunicação | Histórico de interação, templates, lembrete, follow-up, WhatsApp/e-mail manual e cadência opcional |
| App Cliente | Jornada, documentos liberados, entregas, descobertas, propostas, contratos, pagamentos e próximos passos |
| Equipe | Convite, membros, papéis e responsáveis por caso/tarefa |
| Configurações | Organização, dados institucionais, preferências, templates e integrações |
| KPIs | Pipeline, casos, SLA, pendências, ticket, receita por SKU, conversão e produtividade |

---

## 5. Fluxo de trabalho obrigatório

### 5.1 Cliente e caso

```text
Novo cliente
  → novo caso
  → registrar país/objetivo/linha quando houver
  → salvar rascunho imediatamente
  → adicionar pesquisa, documentos, tarefas e atualizações ao longo do tempo
  → mover fases manualmente quando a proprietária decidir
```

Campos mínimos para novo cliente:

```text
nome
telefone ou e-mail opcional
observação opcional
```

Campos mínimos para novo caso:

```text
cliente
nome/título do caso
país opcional
objetivo opcional
responsável opcional
```

Não exigir CPF, endereço, rota jurídica, produto, valor, checklist ou documento para criar um caso.

### 5.2 Pesquisa e documentos

```text
Criar/selecionar caso
  → registrar pessoa
  → registrar relação, evento, fonte ou hipótese
  → salvar mesmo que dados estejam incompletos
  → anexar documento/referência
  → status inicial: recebido ou em pesquisa
  → revisar/validar depois, sem impedir o trabalho
```

Permitir status simples:

```text
rascunho
pendente
em_pesquisa
solicitado
localizado
recebido
em_analise
validado
precisa_retificacao
concluido
```

### 5.3 Produtos, proposta e financeiro

```text
Criar proposta
  → selecionar cliente/caso
  → adicionar texto de escopo livre e/ou SKUs
  → informar valor total ou itens
  → definir entrada e parcelas manualmente
  → salvar rascunho
  → gerar PDF/visualização
  → enviar manualmente ou registrar aceite
  → registrar pagamento quando ocorrer
```

Regras:

- Uma proposta deve existir sem SKU, sem link Asaas e sem pagamento.
- Um SKU pode existir sem link Asaas enquanto a sincronização estiver pendente.
- Um pagamento pode ser registrado manualmente, mesmo sem webhook/integração.
- Conciliação, checkout e automação financeira são complementares; não são requisito para operar.

### 5.4 Contrato paramétrico completo

Criar e concluir o módulo de contratos. A proprietária deve poder gerar contrato a partir de uma proposta ou diretamente de um cliente/caso.

Fluxo:

```text
Novo contrato
  → selecionar cliente e caso
  → selecionar modelo
  → puxar ou inserir escopo/itens/SKUs
  → preencher valores, entrada, parcelas, vencimentos e despesas
  → preencher país, via, objetivo e dados do caso
  → editar cláusulas, exclusões e observações livremente
  → salvar rascunho
  → gerar prévia
  → gerar PDF
  → enviar para assinatura ou registrar assinatura/aceite manual
  → vincular contrato ativo ao caso
  → criar aditivo quando necessário
```

#### Modelos mínimos

```text
Contrato individual de pesquisa genealógica
Contrato individual de cidadania
Contrato de casal/familiar
Contrato de núcleo familiar
Contrato de montagem documental/pasta
Contrato de assessoria completa/protocolo
Aditivo contratual
```

#### Campos obrigatórios no editor

| Bloco | Campos |
|---|---|
| Partes | Contratante, CPF opcional no rascunho, contato, endereço opcional, representante se aplicável |
| Caso | Código, objetivo, país, rota/via, requerente, linha ancestral, contexto do serviço |
| Escopo | Itens/SKUs, entregas, limite do serviço, exclusões e responsabilidades do cliente |
| Financeiro | Honorários, despesas, taxas externas, desconto, entrada, parcelas, vencimentos, modalidade de pagamento |
| Prazo | Estimativa em faixa, marcos, dependências externas e ausência de garantia de resultado |
| Cláusulas | Confidencialidade, LGPD, obrigações, cancelamento, rescisão, foro e comunicações |
| Controle | Modelo, versão, status, data de geração, PDF, assinatura/aceite, observações internas |

#### Status de contrato

```text
rascunho
em_revisao
enviado
aceito
assinado
ativo
encerrado
cancelado
substituido_por_aditivo
```

#### Regra crucial

- Salvar rascunho, editar cláusula, gerar prévia e gerar PDF não requerem auditoria, aprovação, gate institucional ou reconfirmação.
- Enviar para um serviço externo de assinatura é uma ação externa explícita e pode pedir confirmação apenas no momento do envio.
- O contrato deve guardar uma cópia do escopo/preço da data de emissão; mudanças posteriores em SKU/preço não alteram contrato já aceito.

### 5.5 Planejador e jornada

A jornada deve ser operacional e editável, nunca uma prisão de fluxo.

```text
Descoberta
Diagnóstico
Pesquisa e Documentos
Validação e Pasta
Protocolo e Acompanhamento
Reconhecimento e Legado
```

Permitir:

- Avançar, recuar ou pular fase pela proprietária.
- Criar milestone manual.
- Criar pendência sem prazo.
- Mostrar previsão em intervalo, não promessa de data.
- Exibir checklist como orientação.
- Registrar micro-entrega a qualquer tempo.

---

## 6. Navegação final do Desk

Remover menus de Governança/Auditoria/Modo Proprietária. O menu deve conter somente trabalho real.

```text
Hoje
Clientes
Casos
Pesquisa
Documentos
Planejador
Propostas
Contratos
Financeiro
Produtos
Comunicação
Relatórios
Equipe
Configurações
```

### Painel “Hoje”

Criar ou preservar atalhos funcionais:

```text
Novo cliente
Novo caso
Registrar atualização
Adicionar pessoa
Adicionar documento
Criar pendência
Criar proposta
Criar contrato
Registrar pagamento
Mover fase
```

Cada ação deve permitir salvar e retornar apenas:

```text
“Salvo.”
```

Ou, em caso de falha:

```text
“Não foi possível salvar: [mensagem objetiva]. Tente novamente.”
```

Nunca usar mensagens como:

```text
Ação ignorada
Aprovação necessária
Reconfirme sua propriedade
Modo Proprietária
Auditoria pendente
Governança pendente
Gate institucional
```

---

## 7. Supabase: configuração e segurança sem bloquear operação

### Configuração obrigatória da Vercel

Validar no ambiente **Production** e no Preview:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Regras:

1. URL e chaves devem pertencer ao mesmo projeto Supabase do Clube Ancestral.
2. Não manter variáveis antigas ou duplicadas apontando para outro projeto.
3. A service role só pode ser usada em funções server-side; nunca no cliente.
4. CRUDs normais devem operar com a sessão do usuário e as políticas RLS adequadas; não depender de service role para criar/editar caso, cliente, documento, pesquisa, proposta ou contrato.
5. Se a service role estiver ausente/inválida, mostrar erro claro somente na função administrativa que realmente precisa dela; não derrubar o Desk todo.

### RLS mínimo

- Usuário autenticado com membership ativo pode acessar registros da organização correspondente.
- `owner` e `admin` podem criar, editar, arquivar e restaurar registros da organização.
- Usuário cliente só visualiza seus próprios dados liberados no portal.
- Não misturar RLS com componentes de aprovação no frontend.

---

## 8. Integrações: desacopladas da operação

| Integração | Regra |
|---|---|
| Asaas | Link e webhook são complementares; proposta, contrato e registro manual de pagamento funcionam sem integração |
| WhatsApp | Comunicação manual sempre disponível; automações não podem bloquear tarefa/caso |
| E-mail | Envio é opcional; registrar interação manual se necessário |
| Assinatura digital | Contrato pode ser PDF/aceite manual; integração externa vem depois |
| Storage | Upload deve retornar confirmação clara; se houver falha, permitir salvar referência/pendência sem perder o formulário |
| Analytics/KPIs | Leitura e melhoria contínua; não condicionar operação a dados perfeitos |

---

## 9. Critérios de aceite da proprietária

Criar preview na Vercel e não fazer merge em `main` antes de a proprietária testar e aprovar.

### Roteiro completo de teste

1. Entrar com a conta da proprietária.
2. Abrir `/painel` e recarregar a página.
3. Abrir uma nova aba em `/casos`.
4. Criar um cliente com apenas nome.
5. Criar um caso com apenas cliente e título.
6. Editar o caso e salvar uma observação.
7. Criar pessoa, fonte, relação ou achado de pesquisa.
8. Fazer upload de documento ou registrar referência documental.
9. Criar pendência sem prazo.
10. Criar produto/SKU como rascunho ou editar preço.
11. Criar proposta em rascunho, com valor e parcelas manuais.
12. Converter ou criar diretamente um contrato em rascunho.
13. Editar cláusula, escopo e valores do contrato.
14. Gerar prévia e PDF do contrato.
15. Registrar pagamento manual.
16. Avançar e recuar a fase do caso.
17. Abrir Planejador, Financeiro, Produtos, Contratos, Equipe e Configurações.
18. Abrir o portal do cliente em modo de visualização, sem sair da sessão da proprietária.
19. Sair e entrar novamente; repetir criação/salvamento simples.

### Aceite somente se

- Todos os passos salvarem ou apresentarem erro técnico explícito e recuperável.
- Não houver `401`, `403`, `500`, tela branca, erro silencioso, redirecionamento indevido ou perda de sessão.
- Não existir “Modo Proprietária”, “Reconfirmar propriedade”, “Auditoria”, “Governança”, “Aprovação”, “Override” ou qualquer gate visível na navegação normal.
- Nenhum formulário comum exigir contrato, pagamento, checklist, link Asaas, SKU homologado ou fase específica para salvar rascunho.
- A proprietária tiver acesso contínuo após refresh, nova aba e novo login.
- Contratos possam ser criados, editados e exportados sem bloqueio.

---

## 10. Entregáveis

1. Branch `refactor/plataforma-completa-sem-barreiras`.
2. Pull Request com descrição de mudanças e sem alterações destrutivas de dados.
3. Preview Vercel funcional.
4. Relatório técnico curto com:
   - variáveis de ambiente verificadas, sem expor segredos;
   - arquivos/rotas de governança removidos do caminho de execução;
   - módulos preservados e testados;
   - resultado dos 19 passos de aceite;
   - falhas remanescentes, se existirem, com causa e ação concreta;
   - URL do preview.
5. Merge em `main` somente após validação explícita da proprietária.
6. Deploy de produção somente após merge.

---

## 11. Proibições finais

Não fazer nesta rodada:

- Não apagar dados, tabelas, arquivos, contratos, produtos, pagamentos ou clientes.
- Não rodar `DROP TABLE`, `TRUNCATE`, reset de banco ou migração destrutiva.
- Não apagar o repositório, domínio ou projeto Vercel.
- Não criar um novo produto reduzido em substituição ao sistema completo.
- Não introduzir novo framework, novo SaaS ou nova camada de autorização.
- Não criar auditoria, checklist de governança, modo de proprietário, aprovações, confirmação de override ou bloqueio visual.
- Não esconder falhas com mock, fallback silencioso ou dados inventados.
- Não declarar sucesso sem executar o roteiro de aceite da proprietária.

---

## Regra final de produto

> O Clube Ancestral precisa funcionar como uma mesa de trabalho completa para a proprietária: clientes, casos, pesquisa, documentos, propostas, contratos, financeiro, jornada e comunicação.
>
> A plataforma pode alertar sobre pendências, mas jamais transformar pendências em barreiras de trabalho.
>
> A proprietária autenticada não precisa provar nada para exercer as funções de proprietária.