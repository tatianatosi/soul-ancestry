# Inventário de travas operacionais — Desk e App Cliente

Status: aprovado
Versão: v1.0
Data: 2026-09-05
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: varredura do repositório `tatianatosi/soul-ancestry` no commit `0a0b81d`; consultas diretas ao Supabase `zsxpdbhdvbuulwpepemd`; suíte de testes (167 arquivos, 1613 casos)
Substitui: —

## Escopo

Responder, com número verificado, à pergunta: o que exatamente impede a proprietária de operar o próprio aplicativo. A varredura cobriu as 82 rotas do Desk, as 14 telas do App Cliente, os módulos de gate em `src/lib` e as políticas de acesso das 185 tabelas do banco.

## Conclusão principal

**O banco nunca foi o problema. O bloqueio era todo na camada de aplicação.**

Verificado no Supabase:

| Verificação | Resultado |
| --- | --- |
| `auth.users` → papel da proprietária | `admin` |
| `staff_access` → status | `active`, organização Clube Ancestral, não arquivado |
| `organization_members` | vínculo presente |
| Tabelas com RLS | 185 de 185 |
| Tabelas sem política de SELECT | 2 (`auth_throttle`, `bootstrap_lock` — infraestrutura) |
| Tabelas sem política de UPDATE | 24, todas append-only de auditoria (`audit_logs`, `caso_log`, `conversion_events`…) — desenho correto |

Todas as listas de permissão do código (`PAPEIS_EDITA`, `PAPEIS_EDICAO`, `PAPEIS_ESCRITA`, `PAPEIS_COMERCIAL`) já incluíam `admin`. Em `useSaas()`, a conta da proprietária resolvia `podeEscrever = true`, `somenteLeitura = false`, `ehAdmin = true`.

Ou seja: a autorização estava correta em toda a pilha, e mesmo assim a operação não acontecia.

## Contagem das travas

Varredura sobre `src/routes` e `src/components`:

| Classe | Ocorrências | Natureza |
| --- | --- | --- |
| A. `disabled={}` por pendência ou gate de domínio | 98 | **Trava real** |
| B. `disabled={}` por estado transitório (salvando, carregando, campo vazio) | 138 | UX legítima — remover causaria duplo envio |
| C. Leitura silenciosa (`?? []`, `|| []`) sobre resultado de consulta | 393 | **Trava percebida** |
| D. `catch` vazio | 38 | **Trava percebida** |
| E. Referências a gate em `src/lib`, rotas e componentes | 1925 | Superfície total do vocabulário de gate |

Total das classes A + C + D: **529 pontos de obstrução real ou percebida.** A estimativa de "700 travas" estava na ordem de grandeza certa.

## Causa raiz

A infraestrutura de autoridade da proprietária **já existia e estava correta**: `src/lib/modo-proprietaria.ts` (16 capacidades), `src/lib/gates-override.ts` (override auditado em três estados), `src/lib/override-proprietaria-comercial.ts`.

Estava ligada a **1 componente de 82 rotas** — apenas `src/components/painel/painel-dia.tsx`.

O resto do aplicativo nunca consultou essa camada. Cada tela decidiu sozinha, por conta própria, desabilitar o controle. Daí a sensação exata de "tenho autoridade no papel e nenhuma na prática".

A segunda causa, independente da primeira: em 393 pontos o resultado de uma consulta com falha virava lista vazia. A tela mostrava "nenhum registro" — indistinguível de base vazia. Telas que pareciam mortas estavam apenas falhando em silêncio.

## Correção aplicada

Commit `e2bace5` na branch `recovery/operational-authority-all-areas-2026-09-05`.

1. `src/lib/autoridade-operacional.ts` — decisão canônica única: `permitir` | `confirmar` | `bloquear`. Para a proprietária, `bloquear` só existe por falta de identidade ou de organização ativa.
2. `src/components/saas/autoridade.tsx` — `useAutoridade()`, ponto único de consulta das telas.
3. `src/components/saas/acao-operacional.tsx` — controle só desabilita em `bloquear`; pendência vira janela de confirmação com motivo obrigatório.
4. `src/components/saas/estado-dados.tsx` — erro sempre visível, com causa e caminho de correção; fim do vazio silencioso.
5. `src/lib/estados-edicao.ts` — avanço da proprietária liberado com pendência preservada e efeito `avanco_por_decisao_proprietaria`.
6. `src/lib/gates-formalizacao.ts` — `podeExecutar` passa a aceitar papel; `exigeAceiteExplicito` separa o que confirma do que bloqueia.

## Limites

- A correção é da camada de decisão. A ligação tela a tela das 98 ocorrências da classe A e das 393 da classe C ainda não foi feita — é o próximo bloco da PR #87.
- As 138 ocorrências da classe B permanecem intocadas por decisão técnica: são proteções contra duplo envio e corrupção de dado, não travas de autoridade.
- Nada foi mesclado no `main`.

## Critério de aceite

Por aba do Desk e do App Cliente:

1. Abre para o papel de administração, sem bloqueio de permissão.
2. Lê dado real da base.
3. Escreve e persiste, sobrevivendo a recarga.
4. Falha de carga aparece na tela com causa e correção.
5. Confirmação apenas em ação externa, irreversível ou com pendência superada.
6. Ação registrada com autora, data e objeto.

## Próximos passos

1. Ligar `useAutoridade` e `EstadoDados` nas 98 + 393 ocorrências, por bloco: Administração → Comercial → Operação → Pesquisa → Marketing → App Cliente.
2. Registrar cada avanço por decisão da proprietária em `owner_override_events`.
3. Varredura tela a tela contra os seis critérios de aceite.
