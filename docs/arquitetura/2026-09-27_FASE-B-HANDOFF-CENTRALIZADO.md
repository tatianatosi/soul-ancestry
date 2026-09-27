# Fase B — Handoff Lead → Pessoa/Caso centralizado (27/09/2026)

```yaml
status: executado
fase: B de 6 (A-F) — "Cadeia canônica executável"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Confirmar/fechar a centralização do handoff Lead→Pessoa/Caso: um único
writer, cópia única dos campos permitidos, registro de origem (sem
sincronização bidirecional automática) e a divisão de papéis pós-conversão
(`/leads` = histórico comercial; Pessoa 360 = cadastro civil; Caso 360 =
operação).

## 1. Writer único — já centralizado, confirmado

`executarHandoffDiscovery` (`src/lib/handoff-discovery.functions.ts:147`)
já era, antes desta fase, o único ponto de escrita que cria/reaproveita
`clientes` e `crm_casos` a partir de um lead. Não existe segundo caminho
de conversão em nenhum outro arquivo (confirmado por busca — nenhuma outra
função insere em `crm_casos` a partir de `leads`). Nada a centralizar de
novo; só fechar o que faltava dentro dele.

## 2. Cópia única dos campos permitidos — gap fechado

`payloadClienteDoLead` (`src/lib/handoff-discovery.ts:189`) copiava nome/
email/telefone/origem/pais_interesse, mas **faltava `indicado_por`**
(existe em `leads` desde `20260821140549`, nunca existiu em `clientes`).
Fechado: migration aditiva `20260927120000_clientes_indicado_por.sql` +
`payloadClienteDoLead` + insert em `executarHandoffDiscovery` agora
incluem `indicado_por`. Cópia única, no momento da criação — sem
sincronização contínua depois (mesma regra do dicionário da Fase A).

## 3. Registro de origem sem sincronização bidirecional — já coberto pelo Corte A

`lead_id` (Corte A, mesmo commit anterior desta sessão) já registra, na
criação, de qual lead o cliente/caso se originou — sem criar nenhum
mecanismo de sincronização contínua de volta para `leads`. Satisfaz o
item 3 da Fase B sem código adicional.

## 4. Divisão de papéis pós-conversão

Confirmado por leitura: nenhum escritor no repositório grava de volta em
`leads.nome`/`email`/`telefone` depois que `leads.estagio = 'ganho'`
(promovido por `promoverLeadParaGanho`, chamado sempre no fim do handoff).
A partir daí:
- **`/leads`** — vira contexto/histórico comercial do relacionamento
  anterior à conversão (a Mesa Discovery não reabre um lead já convertido
  para edição civil).
- **Pessoa 360** (`clientes`) — governa cadastro civil dali em diante.
- **Caso 360** (`crm_casos`) — governa a operação do caso.

Isto já era verdade antes desta fase (nenhum código violava); esta fase
só formaliza a regra no dicionário canônico (Fase A) e a confirma aqui.

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/faseb-handoff-centralizado-2026-09-27.test.ts`
(writer único, indicado_por copiado, gate de confirmação sempre antes de
qualquer insert — prova estrutural de "cancelamento sem escrita",
reaproveitamento vs. criação nunca duplica caso dentro da janela de 60s
já existente). Suíte completa e `vite build` — ver rodapé do commit.
Migration aplicada e registrada em `schema_migrations`.

## Prova Lovable pós-push

1. Abrir um lead sem case_id, sem e-mail/telefone/nome batendo com
   cliente existente, e confirmar handoff → conferir que o novo cliente em
   Pessoa 360 mostra "Como entrou" e o campo indicado_por (se o lead
   tinha) preenchidos.
2. Tentar handoff de um lead cujo nome bate com um cliente existente sem
   confirmação → tela pede confirmação, nada é criado ainda.
