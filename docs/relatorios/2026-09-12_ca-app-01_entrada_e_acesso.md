# CA-APP-01 — Entrada e acesso

**Status:** concluída
**Data:** 2026-09-12
**Série:** RESGATE DO APP CLIENTE — ACESSO, VISÃO DO PRODUTO E VISÃO DO CLIENTE (prompt de 2026-09-09, aprovado)

## Fontes vivas usadas

- `src/lib/portal.functions.ts` (backend do Espaço do Cliente: acesso, elegibilidade, auditoria, dados de proposta)
- `src/routes/acesso.tsx`, `src/routes/acesso.confirmar.tsx`, `src/routes/acesso.sem-permissao.tsx` (telas públicas de acesso)
- `src/components/portal/portal-shell.tsx` (bypass de prévia de equipe)
- `src/routes/portal/proposta.tsx` (Portal de proposta)
- Migrações já existentes: `invoices` + RLS `invoices_sel_portal` (organização, caso autorizado via `portal_caso_permitido`, `liberada_cliente = true`, cliente do próprio acesso) — motor pronto, nunca ligado até esta CA.

## Escopo revisado (regra de acesso)

Confirmado, por leitura direta do código, que o fluxo já implementado satisfaz a "REGRA DE ACESSO" do prompt em vigor:

- Magic link de uso único (`magic_link_max_uses: 1`), janela curta (`LINK_LOGIN_VALIDADE_MINUTOS`), reenvio invalida o anterior.
- `solicitarLinkAcesso` sempre responde `{ ok: true }`, mesmo quando o e-mail não existe ou não está elegível — proteção contra enumeração, com aviso explícito na UI ("nunca informamos se um e-mail está ou não cadastrado").
- Elegibilidade por caso (`client_portal_case_access` + `crm_casos.contrato_assinado && pagamento_confirmado && documentos_minimos_ok`) já gatilha o acesso, não a existência de conta.
- `/acesso/sem-permissao` usa linguagem genérica e sanitizada ("Fale com a sua consultora"), sem `case_id`, `organization_id` ou qualquer status técnico.
- Acesso negado a caso não autorizado é auditado com `tipo: "access_denied"` e `motivo: "caso_nao_autorizado"` — nunca grava dado do caso nos metadados.
- Login de equipe em modo prévia (`previa`) não é redirecionado para a tela de permissão do cliente (bypass no `useEffect` de `portal-shell.tsx`).

Nenhuma dessas peças foi alterada nesta CA — já estavam corretas.

## Alteração feita

Uma lacuna real: `portalProposta` lia `eventos_financeiros` — tabela legada, sem linha real (confirmado na CA16 anterior desta série) — para a seção "Condições" do Portal de proposta. O cliente nunca via a fatura de verdade, mesmo quando ela existia.

- `src/lib/portal.functions.ts`: `portalProposta` passa a ler `invoices` (`id, numero, valor, moeda, status, vencimento`), que já tem RLS própria e específica do portal (`invoices_sel_portal`).
- `src/routes/portal/proposta.tsx`: renderização trocada de `f.descricao` (campo inexistente em `invoices`) para `f.numero`.

Nenhuma migration, RLS ou schema foi tocado — a política `invoices_sel_portal` já existia e já era segura; só passou a ser consumida.

## Itens preservados

- Contrato de Estudo Genealógico v2, anexos, matrizes, propostas, Planilha Mestre — não tocados.
- Nomenclatura do App (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta) — não tocada nesta CA (rota tratada aqui é `/acesso*` e `/portal/proposta`, fora da taxonomia das 7 abas).
- Nenhuma conta, magic link, convite ou dado de teste foi criado.
- RLS, contratos, matrizes, catálogo, preço, Asaas e integrações externas — não tocados.

## Testes

- Novo arquivo `src/lib/__tests__/ca-app-01-entrada-e-acesso.test.ts`: 8 testes (2 cobrindo a correção, 6 de regressão da regra de acesso). Todos passando.
- Full suite: `npx vitest run --exclude '**/.claude/**'` → 210 arquivos / 2017 testes, ok.
- `npx tsc --noEmit` → limpo.
- `npx vite build` → concluído sem erros.

## Limites

- Não foi feita inspeção visual autenticada nesta CA (fora de escopo — CA-APP-01 é sobre regra de acesso e fonte de dado, não sobre pixel).
- A pergunta de discrepância visual levantada na CA24B permanece em aberto, sem retomada nesta CA (fora do escopo desta série).

## Próximos passos

Prosseguir para CA-APP-02 (Home e visão do cliente), conforme a ordem definida no prompt em vigor.

## Critério de aceite

Cliente com acesso liberado ao Portal de proposta passa a ver a fatura real (número, valor, status, vencimento) quando ela existir e estiver liberada para o caso — em vez de uma seção estruturalmente incapaz de mostrar dado real.
