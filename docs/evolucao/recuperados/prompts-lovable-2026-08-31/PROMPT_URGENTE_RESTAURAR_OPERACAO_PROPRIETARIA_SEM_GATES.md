# URGENTE — Restaurar Operação da Proprietária sem Gates de Governança

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura-alvo:** Supabase próprio + Vercel + GitHub  
**Branch de trabalho obrigatória:** `fix/acesso-proprietaria-operacao`  
**Objetivo único:** fazer a proprietária voltar a entrar e trabalhar no Desk completo imediatamente, sem depender de Modo Proprietária, reconfirmação, auditoria, governança, aprovação em lote, override, checklist institucional ou qualquer bloqueio de interface.

---

## 1. Contexto obrigatório

A proprietária continua sem conseguir usar a própria plataforma. Isso é um incidente de operação, não uma melhoria futura.

A remoção ampla dos arquivos de governança foi recusada por um classificador de segurança automático por envolver código de acesso. Portanto, **não tentar apagar em massa 53 arquivos, rotas ou módulos**.

Em vez disso, aplicar uma correção cirúrgica de comportamento:

```text
A sessão autenticada da proprietária deve ter acesso operacional total.
Os módulos de governança podem continuar existindo no repositório,
mas não podem ser chamados, consultados, renderizados, exigidos,
nem usados como condição de navegação, leitura ou salvamento.
```

O objetivo não é apagar histórico ou segurança de dados. O objetivo é deixar essas camadas completamente fora do caminho de trabalho da proprietária.

---

## 2. Resultado obrigatório

Ao entrar com a conta da proprietária já cadastrada, o aplicativo deve executar isto:

```text
Login Supabase válido
→ identificar membership da organização
→ reconhecer role owner/admin
→ carregar diretamente /painel
→ liberar todo o Desk
→ permitir criar, editar e salvar dados
```

Sem nenhuma segunda etapa.

Sem redirecionamento.

Sem modal.

Sem tela de Modo Proprietária.

Sem tela de Reconfirmar Propriedade.

Sem auditoria.

Sem aprovação.

Sem “ação ignorada”.

Sem “perfil institucional pendente”.

Sem depender de `SUPABASE_SERVICE_ROLE_KEY` para o CRUD cotidiano.

---

## 3. Regra única de autorização

Implementar uma única função canônica de acesso interno. Ela deve substituir as dependências de gates no caminho de trabalho.

```ts
export type AcessoOperacional = {
  authenticated: boolean;
  organizationId: string | null;
  role: string | null;
  canAccessDesk: boolean;
  canOperate: boolean;
};

export function acessoOperacionalDaSessao(
  userId: string | null,
  membership: { organization_id: string; role: string; status?: string } | null,
): AcessoOperacional {
  const authenticated = Boolean(userId);
  const organizationId = membership?.organization_id ?? null;
  const role = membership?.role ?? null;
  const membershipAtivo = Boolean(organizationId) && membership?.status !== "inactive";
  const canAccessDesk = authenticated && membershipAtivo;
  const canOperate = canAccessDesk && (role === "owner" || role === "admin");

  return {
    authenticated,
    organizationId,
    role,
    canAccessDesk,
    canOperate,
  };
}
```

### Regras obrigatórias

```text
Sem sessão → login.
Sessão + membership ativo → Desk.
Role owner/admin → CRUD total nas rotas internas.
Sessão sem membership → mensagem curta e humana.
```

Mensagem permitida para usuário sem membership:

```text
Sua conta ainda não está vinculada à organização. Fale com a equipe responsável pelo acesso.
```

### Proibido na função de acesso

Não consultar, não importar e não depender de:

```text
modo-proprietaria
modo-proprietaria.functions
gates-override
varredura-autorizacoes
varredura-administracao
owner_override_events
audit_logs
reconfirmar-propriedade
perfil institucional
lote de aprovações
checklist de lançamento
SUPABASE_SERVICE_ROLE_KEY
```

---

## 4. Correção de navegação e rotas

Aplicar o guard simples acima em todas as rotas internas de trabalho:

```text
/painel
/clientes
/casos
/pesquisa
/documentos
/planejador
/propostas
/contratos
/financeiro
/produtos
/marketing
/onboarding
/cadencias
/equipe
/configuracoes
```

### Comportamento obrigatório para owner/admin

- Carregar a rota solicitada diretamente.
- Nunca redirecionar para uma rota administrativa intermediária.
- Nunca exigir confirmação de “poder total”, reconfirmação de propriedade ou registro de decisão.
- Nunca exibir bloqueio baseado em auditoria, status institucional, etapa do caso, checklist, SKU, pagamento, contrato ou link Asaas.

### Remover do menu e dos redirecionamentos

```text
/modo-proprietaria
/reconfirmar-propriedade
/governanca/varredura-administracao
/auditoria
```

Essas rotas podem permanecer fisicamente no repositório por histórico, mas:

- não podem estar no menu;
- não podem ser destino automático;
- não podem ser importadas por `/painel`, ações rápidas, componentes de casos, contratos, financeiro ou navegação;
- não podem decidir acesso;
- não podem bloquear uma mutation;
- não podem impedir renderização de qualquer módulo operacional.

---

## 5. Desacoplamento sem apagar arquivos

Como a remoção em massa foi recusada, fazer o desacoplamento em vez da exclusão.

### Substituir imports ativos

Procurar no código por imports/chamadas para:

```text
@/lib/modo-proprietaria
@/lib/modo-proprietaria.functions
@/lib/modo-proprietaria-cobertura
@/lib/gates-override
@/lib/varredura-autorizacoes
@/lib/varredura-administracao
```

Em rotas e componentes operacionais, substituir por:

```text
@/lib/acesso-operacional
```

ou equivalente, usando somente sessão + membership + role.

### Arquivos que podem permanecer

Arquivos de governança, auditoria e varredura podem continuar no repositório, sem import ativo, até uma limpeza posterior. Eles não devem ser apagados nesta tarefa.

### Arquivos que precisam ser corrigidos primeiro

Priorizar os pontos já conhecidos por influenciarem o trabalho diário:

```text
src/components/painel/painel-dia.tsx
src/components/painel/acoes-rapidas.tsx
src/components/painel/verificador-admin.tsx
src/lib/modo-proprietaria.functions.ts
src/lib/gates-override.ts
src/lib/navegacao-desk.ts
src/routes/_authenticated/*
src/routes/_authenticated/casos.*
src/routes/_authenticated/*contrato*
src/lib/app-cliente-como-pessoa.functions.ts
```

A regra é: esses componentes podem usar uma função de sessão/membership simples, mas não podem chamar a cadeia de governança como pré-condição de uso.

---

## 6. Salvar rascunho sem bloqueio

Para a proprietária/admin, todas as operações internas devem aceitar rascunho e salvar com os campos mínimos.

### Deve salvar sem exigir

```text
checklist completo
fase correta
contrato assinado
pagamento confirmado
SKU homologado
link Asaas
perfil institucional
auditoria
justificativa
aprovação
reconfirmação
modo proprietária
```

### Aplicar a

```text
Clientes
Casos
Atualizações de caso
Tarefas
Pesquisa
Pessoas, fontes e documentos
Propostas
Contratos em rascunho
Financeiro manual
Produtos e SKUs
Cadências e mensagens em rascunho
```

### Erros

Toda falha de banco/API deve retornar uma mensagem visível e objetiva:

```text
Não foi possível salvar: [erro retornado]. Tente novamente.
```

Nunca retornar:

```text
Ação ignorada
Aprovação necessária
Reconfirme sua propriedade
Sem poder interno
Auditoria pendente
Gate institucional
```

---

## 7. Supabase próprio e variáveis Vercel

O novo banco próprio deve ser a fonte do acesso e dos dados operacionais. Não depender de credencial exportável do Lovable Cloud.

### Conferir em Vercel — Production e Preview

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Regras

1. URL e chaves precisam pertencer ao mesmo projeto Supabase próprio do Clube Ancestral.
2. Remover ou sobrescrever variáveis duplicadas/antigas que apontem para ambiente anterior.
3. O frontend usa apenas URL + chave pública.
4. A service role só pode ser usada no servidor para ações administrativas reais; nunca para autorizar o CRUD normal da proprietária.
5. Se a service role estiver inválida, uma função opcional deve falhar de modo explícito, mas o Desk, login, casos, propostas e salvamentos comuns devem continuar funcionando.
6. Não imprimir chaves ou segredos em logs, commits, previews ou relatórios.

---

## 8. RLS mínima, sem governança de interface

A política deve proteger dados entre organizações e entre clientes, sem colocar barreira extra para owner/admin.

```text
Owner/admin autenticado com membership ativo:
- SELECT, INSERT, UPDATE, archive/restore em registros da própria organização.

Usuário cliente:
- apenas leitura de seus próprios registros liberados no portal.
```

Não criar políticas RLS que dependam de:

```text
owner_override_events
audit_logs
reconfirmação
checklist de lançamento
perfil institucional
status de aprovação de governança
```

Não alterar RLS globalmente sem necessidade. Corrigir apenas a política que estiver impedindo owner/admin de ler ou escrever registros da própria organização.

---

## 9. Critério de conclusão — provar operação, não arquitetura

Esta tarefa termina somente quando a proprietária conseguir fazer, em um preview Vercel conectado ao Supabase próprio:

1. Fazer login.
2. Ir diretamente para `/painel`.
3. Recarregar a página sem perder acesso.
4. Abrir nova aba em `/casos` sem ser redirecionada.
5. Abrir Clientes, Casos, Pesquisa, Documentos, Planejador, Propostas, Contratos, Financeiro, Produtos, Marketing, Onboarding, Cadências, Equipe e Configurações.
6. Criar um cliente com apenas nome.
7. Criar um caso com cliente e título.
8. Salvar uma atualização no caso.
9. Criar uma tarefa/pendência.
10. Criar uma proposta em rascunho.
11. Criar contrato em rascunho.
12. Registrar pagamento manual.
13. Abrir a visão de um cliente sem logout da sessão admin, se essa rota já existir.
14. Fechar/recarregar e confirmar que todos os dados continuam visíveis.

### Resultado exigido

```text
Todas as ações salvam ou mostram erro técnico explícito.
Nenhuma rota mostra Modo Proprietária, Reconfirmar Propriedade,
Auditoria, Governança, Aprovação, Override ou bloqueio institucional.
Nenhuma ação interna exige prova adicional de que a proprietária é proprietária.
```

---

## 10. Escopo proibido

Não fazer nesta correção:

- Não apagar arquivos em massa.
- Não apagar tabelas, dados de clientes, documentos, contratos, propostas, pagamentos ou pesquisa.
- Não executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migração destrutiva.
- Não implementar novos motores, dashboards, landing pages, automações ou conteúdo.
- Não redesenhar telas.
- Não alterar catálogo, SKUs, preços ou links Asaas.
- Não criar auditoria, nova camada de autorização, novo “modo”, nova reconfirmação, override ou aprovação.
- Não declarar concluído com teste unitário, print de código, lista de arquivos ou build verde apenas.

---

## 11. Entrega esperada

1. Branch: `fix/acesso-proprietaria-operacao`.
2. Pull request apenas com desacoplamento de gates e restauração de acesso operacional.
3. Preview Vercel conectado ao Supabase próprio.
4. Relatório curto com:
   - função canônica de acesso usada;
   - rotas que deixaram de depender de governança;
   - variáveis de ambiente conferidas sem expor segredos;
   - resultado dos 14 passos de operação;
   - falhas remanescentes, se houver, com causa técnica objetiva;
   - URL do preview.
5. Aguardar a proprietária entrar e operar antes de merge em `main`.

---

## Regra final

> A proprietária não precisa provar que é proprietária para trabalhar no próprio Clube Ancestral.
>
> Sessão válida + vínculo ativo + papel owner/admin devem ser suficientes para entrar, navegar, criar, editar e salvar no Desk.
>
> Governança pode existir em arquivo; ela não pode existir no caminho de trabalho.
