# CORREÇÃO URGENTE — ADMIN NÃO CONSEGUE ABRIR VISÃO DO CLIENTE

**Repositório:** `tatianatosi/soul-ancestry`  
**Destino:** Claude Code  
**Tipo de tarefa:** correção pontual de acesso/contexto; sem migração, sem apagar dados, sem criar governança.

---

## Objetivo único

Permitir que uma pessoa com papel `owner` ou `admin` abra o portal de qualquer cliente pertencente à mesma organização diretamente pelo Desk.

O acesso deve acontecer sem logout, sem troca de conta, sem criar conta de cliente, sem precisar que o administrador seja cliente, sem reconfirmar propriedade e sem passar por Modo Proprietária, Auditoria, Governança ou qualquer tela de aprovação.

---

## Fluxo obrigatório

```text
Admin/proprietária entra no Desk
  → abre cliente ou caso
  → clica em “Abrir visão do cliente”
  → aplicativo abre o portal do cliente selecionado em leitura
  → admin vê somente os dados liberados daquele cliente/caso
  → admin volta ao Desk
  → sessão administrativa continua ativa
```

---

## Comportamento obrigatório

### No Desk

Adicionar ou corrigir o botão:

```text
Abrir visão do cliente
```

O botão deve existir:

- na ficha do cliente;
- na tela de detalhe do caso;
- somente para `owner` e `admin`.

Ao clicar, ele deve passar explicitamente:

```text
clientId = ID do cliente aberto no Desk
caseId = ID do caso aberto, quando existir
mode = admin_preview
```

### No portal

O portal deve carregar em modo somente leitura:

```text
mode = admin_preview
```

O administrador deve ver a mesma experiência liberada ao cliente:

- casos ativos;
- fase/jornada;
- próximos passos;
- atualizações marcadas como visíveis ao cliente;
- documentos marcados como visíveis ao cliente;
- proposta liberada;
- contrato liberado;
- pagamentos/informações financeiras liberadas;
- descobertas/entregas liberadas.

Não mostrar informações internas, notas privadas, indicadores administrativos, dados de outros clientes ou ações de edição do Desk.

No topo, exibir apenas um aviso discreto:

```text
Visualização administrativa — você está vendo o portal de [Nome do Cliente].
[Voltar ao Desk]
```

---

## Regras de autorização

### Cliente comum

```text
Pode ler somente o próprio portal.
A associação deve usar o usuário autenticado do portal e o client_id correspondente.
```

### Owner/admin

```text
Pode abrir o portal de qualquer cliente da mesma organization_id.
Não precisa possuir registro na tabela de clientes.
Não precisa ter caso próprio.
Não pode acessar cliente de outra organização.
```

### Regra de código esperada

```ts
type PortalContext =
  | {
      mode: "self";
      clientId: string;
      caseId?: string;
    }
  | {
      mode: "admin_preview";
      clientId: string;
      caseId?: string;
    };

const eAdminDaOrganizacao =
  membership?.role === "owner" || membership?.role === "admin";

const podeAbrirPortal =
  portalContext.mode === "self"
    ? client.user_id === authUser.id
    : eAdminDaOrganizacao &&
      membership.organization_id === client.organization_id;
```

### Proibição importante

No modo `admin_preview`, **não usar `auth.uid()` ou `session.user.id` como se fosse o `clientId` do portal**.

O administrador autenticado é quem está visualizando. O cliente selecionado é quem fornece os dados da visualização.

```text
admin autenticado ≠ cliente visualizado
```

---

## Rotas aceitas

Usar uma rota interna existente ou criar uma rota simples. Preferência:

```text
/clientes/:clientId/visao-cliente
```

Também pode usar:

```text
/casos/:caseId/visao-cliente
```

Se usar a rota por caso, resolver o `clientId` pelo caso no servidor e garantir que o caso pertença à organização da sessão administrativa.

Não redirecionar para rota de login de cliente.

Não redirecionar para:

```text
/modo-proprietaria
/reconfirmar-propriedade
/auditoria
/governanca/varredura-administracao
```

---

## Remover bloqueios desse fluxo

Remover somente no fluxo de preview administrativo qualquer dependência de:

```text
Modo Proprietária
Reconfirmar propriedade
owner_override_events
audit_logs
Gates de override
Varredura de administração
Aprovação em lote
Perfil de cliente do admin
SUPABASE_SERVICE_ROLE_KEY para leitura normal do portal
```

O preview administrativo deve usar a sessão autenticada e o membership normal. Não depender de service role para uma leitura que pode ser autorizada por organização/role.

---

## Escopo proibido

Não fazer nesta tarefa:

- Não criar ou alterar tabelas.
- Não executar migrations.
- Não alterar RLS globalmente.
- Não remover dados existentes.
- Não mudar o login de clientes.
- Não mexer no motor de contratos, financeiro, documentos, pesquisa ou Planejador.
- Não criar novos módulos de governança.
- Não criar mocks, listas, cards decorativos ou páginas paralelas.
- Não alterar design fora do botão e do aviso de visualização administrativa.

---

## Critérios de aceite

Executar usando uma conta `owner` ou `admin` e um cliente que não seja a pessoa administradora.

1. Entrar no Desk normalmente.
2. Abrir a ficha de um cliente.
3. Clicar em `Abrir visão do cliente`.
4. Confirmar que o portal abre sem logout.
5. Confirmar que não há login de cliente.
6. Confirmar que não aparece Modo Proprietária, Auditoria, Governança, Reconfirmar propriedade, Aprovação ou Sem Permissão.
7. Confirmar que o aviso mostra o nome correto do cliente visualizado.
8. Confirmar que jornada, atualizações e documentos exibidos pertencem ao cliente selecionado.
9. Confirmar que dados internos não aparecem.
10. Clicar em `Voltar ao Desk`.
11. Confirmar que o admin continua autenticado e retorna ao mesmo cliente/caso.
12. Recarregar a visualização administrativa e confirmar que ela continua abrindo.

Só declarar concluído se os 12 passos funcionarem com dados persistidos e sem mock.

---

## Entrega esperada

Entregar somente:

1. Correção no repositório em branch isolada.
2. Preview Vercel.
3. Resumo curto contendo:
   - rota usada;
   - arquivos corrigidos;
   - como o `clientId` é passado;
   - resultado dos 12 critérios de aceite;
   - falhas reais restantes, se existirem.

Não entregar documento de arquitetura, nova auditoria, nova governança ou lista de funcionalidades futuras no lugar da correção.