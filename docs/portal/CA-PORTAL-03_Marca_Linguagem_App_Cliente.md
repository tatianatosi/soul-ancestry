# CA-PORTAL-03 — Marca, linguagem e experiência do App Cliente

## 1. Fonte de verdade consolidada

| Dimensão | Fonte de verdade | Onde vive |
| --- | --- | --- |
| Cor | Guia de Marca oficial (aceite 23/08/2026) | tokens em `src/styles.css` (`--navy #2F4B6E`, `--gold #FCB73A`, `--cream #ECDFCD`, `--terracotta #9A3A2F`, `--preto #101010`, fundo `#F7F1E7`, borda `#DCCDB6`) + espelho para superfícies sem CSS em `src/lib/marca.ts` |
| Logo | asset oficial único `src/assets/clube-ancestral-logo.svg.asset.json` | consumido só por `<BrandLogo />` (`src/lib/brand-asset.ts`) — nenhuma tela importa arquivo de logo |
| Tipografia | Cormorant Garamond (títulos) + Inter (corpo) | carregada por `<link>` em `src/routes/__root.tsx`; famílias e fallbacks em `@theme` e em `MARCA_TIPOGRAFIA` |
| Hierarquia | `TIPO_CLIENTE` em `src/lib/marca.ts` | título, subtítulo, seção, corpo, legenda, etiqueta, botão, cartão, aviso |
| Copy | `src/lib/portal-copy.ts` | navegação, títulos, descrições, vazios, estados, erro, indisponibilidade |

## 2. Conflito encontrado e correção aplicada

**Conflito:** a paleta antiga (`#1B2B4B`, `#C9A84C`, `#F5F0E8`, `#8B4513`) continuava fixada em código, fora dos tokens, em superfícies que o cliente recebe: os seis e-mails transacionais (`magic-link`, `invite`, `recovery`, `signup`, `email-change`, `reauthentication`) e o documento contratual gerado. O Guia de Marca prevalece.

**Correção:** substituição centralizada para a paleta oficial (`#2F4B6E`, `#FCB73A`, `#F7F1E7`, `#9A3A2F`), com texto sobre azul passando a branco puro para contraste. O azul antigo agora é proibido por teste automatizado (`AZUIS_RETIRADOS`), e as telas do portal não podem mais conter hex algum — cor só por token. Isso impede a divergência voltar por edição pontual.

## 3. Estados em linguagem de cliente

Copy único por estado, aplicado por `BlocoVisibilidade` em todas as telas:

- `available_empty` — o espaço será preenchido quando houver material apropriado para compartilhar;
- `in_preparation` — a equipe está preparando a etapa, sem prometer prazo;
- `contracted_not_released` — a etapa faz parte da jornada e ainda não foi disponibilizada;
- `released` — apenas conteúdo sanitizado e liberado (o bloco só renderiza filhos nos estados liberados);
- `not_applicable` — a etapa não faz parte do percurso combinado, dito de forma discreta;
- `hidden_by_permission` — não revela existência, conteúdo nem motivo sensível.

## 4. Coerência de copy

- Navegação, título de página e mensagem de estado passam a vir da mesma fonte, então não há mais divergência entre aba e tela ("Entregas" ↔ "Entregas da jornada", "Início" ↔ "Seu acompanhamento").
- "Portal do cliente" virou "Aplicativo do cliente"; "Meus casos" virou "Seu acompanhamento"; "Nenhuma fatura liberada para visualização" virou uma frase humana e contextual.
- Carregamento único (`PortalCarregando`) com `role="status"`, em vez de "Carregando…" solto em cada tela.
- Foco visível (anel dourado) em navegação, botões e ação de sair; ícones marcados como decorativos.

## 5. Verificação

`src/lib/__tests__/portal-marca-copy.test.ts` (9 testes) trava: azul retirado ausente de toda superfície de cliente, nenhum hex inline nas telas do portal, ausência de vocabulário interno (Desk, CRM, SLA, fila, SKU, hipótese, risco, upsell…), ausência de mensagem vaga, e Fase 02 sem linguagem de venda.
