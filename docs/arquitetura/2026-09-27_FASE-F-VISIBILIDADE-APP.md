# Fase F — Visibilidade do App (27/09/2026)

Fecha o diretório A-F ("REGRA ABSOLUTA": o App nunca lê Lead, contrato,
snapshot, condição comercial, proposta interna, Canva, hipótese, evidência
interna nem motores do Desk).

## O que foi verificado (percurso real de imports a partir de `src/routes/portal/**`)

- 15 tabelas internas e 13 módulos do Desk proibidos no caminho do App:
  nenhum achado.
- `portal.functions.ts` mistura leitores do App e funções internas de gestão
  de acesso (seção "ÁREA INTERNA", guardadas por `organizacaoDo` — cliente do
  portal não é membro de organização). As leituras de `proposals`,
  `clientes` e `crm_casos` existem só nessa seção, e nenhuma tela do App
  importa essas funções. Travado por teste — não é vazamento, e não pode
  virar.
- `audit_logs` no caminho do App: só inserção (registro de ação do cliente).
- `crm-desk.ts` (alcançado por módulos puros) não lê banco.

## App de boas-vindas

As 7 abas canônicas já têm estado vazio próprio e acolhedor
(`src/lib/portal-copy.ts`); a Home abre com "Uma história em construção".
Nenhuma mudança de tela foi necessária — travado por teste (texto próprio e
distinto por aba, sem ID nem data prometida).

Teste: `src/lib/__tests__/fasef-fronteira-app-regra-absoluta-2026-09-27.test.ts`.
