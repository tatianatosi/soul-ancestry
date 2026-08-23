# CA-UX-04 — Separação entre protótipo e produto

**Data:** 23/08/2026 · **Decisão:** Proprietária Administradora · **Escopo:** interno, sem ação externa.

## Decisão

O protótipo/mockup histórico não permanece em nenhuma superfície pública,
autenticada, operacional ou navegável. Ele é preservado apenas como código e
documentação arquivados, sem rota, menu, link, feature flag ou import de runtime.

## Antes → depois

| Superfície | Antes | Depois |
| --- | --- | --- |
| `/` (visitante) | Faixa "Demonstração / dados não operacionais", link "Módulos internos", `AppSwitcher`, `ClienteApp`/`DeskApp` | Vitrine institucional limpa: marca, proposta de valor, acesso do cliente e acesso da equipe |
| `/prototipo` | Protótipo App Cliente + Desk | Rota inexistente → 404 do roteador, sem importar mockup |
| `/mockup` | Mockup v2 (6 abas cliente / 7 abas desk) | Rota inexistente → 404 |
| `/referencia-mockup-desk` | Desk histórico de 14 abas para papéis internos | Rota inexistente → 404 |
| Menu Governança | Item "Mockup original — 14 abas (referência)" | Item removido; rótulo da matriz passa a "Matriz de equivalência — rota → dado → estado" |
| Bloco "Encontrar no Desk" | 6 módulos + 1 referência histórica | 6 módulos operacionais, campo `referencia` eliminado |
| `src/components/brand.tsx` | Exportava `AppSwitcher` (controle de protótipo) | Export removido, com nota de arquivamento |

## Verificação de imports

- `tsconfig.json` inclui apenas `src/**`; `archive/` está fora do typecheck e do bundler.
- Nenhum arquivo de `src/` importa `@/components/desk-app`, `@/components/cliente-app`
  ou `@/components/mockup/*` (teste automatizado
  `src/lib/__tests__/ca-ux-04-prototipo-fora-do-runtime.test.ts`).
- Não há lazy import, feature flag ou import condicional que reabilite o protótipo.

## Rotas históricas removidas do runtime

`/prototipo`, `/mockup`, `/referencia-mockup-desk`.

Não foi criado redirecionamento: qualquer tentativa cai no `notFoundComponent`
do roteador, sem carregar componente de mockup, para visitante, cliente ou
usuário interno.

## Preservação

Código em `archive/mockups/`, índice em `docs/historico/mockups/README.md`.
Nenhum PDF, captura ou documento foi apagado.

## Regra permanente

O mockup só retorna ao runtime com novo documento de decisão, atualização da
matriz de equivalência e aceite explícito da Proprietária Administradora.

## Fora de escopo (não alterado)

Banco, dados, migrations, RLS, autenticação, sessão, permissões, integrações,
APIs, regras comerciais, contratos, cobranças, assinatura, App Cliente
autenticado e os 8 grupos do Desk mapeados na CA-UX-03.
