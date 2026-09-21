# Inventário de legado — linha ativa × preservação

- Status: vivo (atualizar a cada remoção)
- Data: 2026-09-21
- Ponto de retorno: branch `archive/legacy-pre-mockup-17p` → `9886eb8e`
- Origem: §25 do "De–Para Completo App × Desk"

## Como este inventário foi feito

O §25 pede para tirar da linha ativa o que não pertence às telas aprovadas. Isso só vale se "não pertence" for **provado**, não presumido. O critério aplicado, em ordem:

1. Rota fora de todo menu **e** sem nenhuma referência de entrada no código.
2. Componente sem nenhum importador.
3. Constante/módulo sem consumidor.

Nada foi removido por "parecer antigo". **Não se toca** em migrations, RLS, políticas, auditoria e serviços de backend — regra da proprietária e do próprio §25.

## Achado que muda o resultado: quase nada estava morto

A suspeita natural era que as rotas fora do menu fossem legado. **Não são.** Medido por referências de entrada no código:

| Rota | Fora do menu | Referências de entrada | Veredito |
|---|---|---|---|
| `/golive` | sim | 3 | **Viva** — o Painel linka |
| `/golive/app` | sim | 3 | Viva |
| `/golive/caso` | sim | **14** | Viva |
| `/golive/comercial` | sim | 5 | Viva |
| `/golive/configuracoes` | sim | 2 | Viva |
| `/golive/formalizacao` | sim | 6 | Viva |
| `/golive/pesquisa` | sim | 8 | Viva |
| `/golive/kanban` | sim | 5 | Viva |
| `/governanca/decisoes` | sim | 1 | Viva |
| `/historico/fluxo-comercial-canonico` | sim | 2 | Viva — histórico deliberado, travado por teste |
| `/studio-devolutivas` | sim | 0 | Sem link, mas alcançável por URL e protegida por autenticação numa rodada anterior desta sessão — **não é lixo, é decisão de produto**. Fica. |

Remover as rotas `golive.*` teria quebrado o Painel. "Fora do menu" não é sinônimo de morto.

Os primitivos sem importador em `src/components/ui/` (`progress`, `chart`, `ca-progress`, `ca-badge`, `carousel`, `drawer`…) **também ficam**: são a biblioteca do Design System, e as telas que faltam construir contra o mockup — barra de progresso da Home, gráficos do Hoje, selos — precisam exatamente deles. Removê-los agora seria desfazer trabalho que a próxima fatia refaz.

## Removido da linha ativa nesta rodada

| Caminho | Finalidade | Motivo da remoção | Substituto |
|---|---|---|---|
| `src/components/governanca/varredura-completude.tsx` (274 linhas) | Tela só-leitura da varredura de completude | Nenhum importador, e a rota `/governanca/varredura-completude` **não existe** | O módulo `src/lib/varredura-completude.ts` permanece e segue coberto por teste |
| `src/components/governanca/inventario-patrimonial.tsx` (367 linhas) | Apresentação só-leitura do inventário patrimonial | Nenhum importador, e a rota `/governanca/inventario-patrimonial` **não existe** | `src/lib/inventario-patrimonial.ts` permanece, usado por `ca13-contrato-v2-e-anexos.test.ts` |
| `src/components/cliente/estado-visibilidade.tsx` (28 linhas) | Faixa de estado dentro da tela do App | Nenhuma referência em lugar nenhum | `BlocoVisibilidade` (`components/portal/portal-visibilidade.tsx`), em uso nas abas do App |

Os três eram componentes sem tela: código que nunca chega ao usuário.

## Defeito de documentação corrigido junto

`src/lib/matriz-equivalencia.ts:136` declarava as rotas `/governanca/inventario-patrimonial` e `/governanca/varredura-completude` como **"implementado"**. Elas não existem — não há arquivo de rota. Declarar feito o que não existe é exatamente o que a memória permanente proíbe; o estado foi corrigido para refletir a realidade.

## O que continua fora desta rodada

Remoção de rota, mudança de navegação, migration, RLS, auditoria e serviço de backend. Qualquer um desses exige decisão explícita da proprietária, e nenhum entra em "limpeza".
