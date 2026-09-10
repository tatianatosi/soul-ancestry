# Pente-fino — Ana como primeira cliente (10/09/2026)

Nota para Tatiana. Sem “pronto” fictício. Homologação autenticada continua pendente.

## Onde Ana vive

| Peça | Onde |
|---|---|
| Caso canônico | `CA-CID-AT-FAM-2026-001` · id `a11a0000-0000-4000-8000-000000000002` |
| Código e aliases | `src/lib/decisao-ana-canonica.ts` — selo operacional **Primeira cliente** (o valor de banco `papel_registro = piloto_real` não muda: é CHECK) |
| Núcleo | Ana Luiza, Adair, Alice, Felipe — `src/lib/piloto-ana.ts`, seeds em `supabase/migrations/` |
| Planejador / cadastro | `src/lib/planejador-parametros.ts` (`CADASTRO_PLANEJADOR`) |
| Contrato | Preparar em `/casos/CA-CID-AT-FAM-2026-001/contrato/preparar` — modelos `MODELO-ESTUDO` + `BASE-GEN-V2` |
| Pesquisa viva | `/pesquisa-modulo` (grupo Pesquisa). Dossiê antigo `/pesquisa` saiu do grupo e foi para Conta |
| App Cliente | Home `/portal` — projeção do mesmo caso, quando o acesso estiver autorizado |

A sessão DEMO (Sophia) **não** é mais item do grupo Cliente. Continua em Conta e administração, com selo de dado fictício. Ana não é apagada nem virada fixture.

## Contrato

O escritor de preparação (`abrirPreparacaoContrato`) agora, ao abrir a ficha:

1. Preenche campos **vazios** com texto já homologado no Planejador (objeto, resumo de escopo, fases, partes, SKU da convenção AT-FAM).
2. Se `escopo_resumo` ainda estiver vazio, copia o escopo da proposta aprovada.
3. Status desses preenchimentos: `importado_a_confirmar` — a proprietária confirma; não pulamos revisão humana.
4. Cláusulas do corpo continuam as 16 fixas de `CLAUSULAS_FIXAS` (MODELO-ESTUDO + BASE-GEN-V2). Nenhum texto jurídico novo. Felipe permanece dependente menor, não signatário.

O que **não** inventamos: ancestral de referência com nome que o Planejador não tem. Esse campo, se vazio no banco, continua pendência humana.

Estado conhecido no banco (08/09, relatório P0): proposta v1 aprovada, ficha existente, contrato `ready_for_review`, 28/30 campos validados. Esta sessão **não** reconsultou o Supabase (MCP sem auth). Conferir no Desk, com login, se os dois campos humanos (`ancestral_referencia` e confirmação de `escopo_resumo`) fecharam depois do reload.

## Legado fora do visual

| O quê | O que fizemos | URL / dado |
|---|---|---|
| Dossiê `/pesquisa` vs módulo vivo | Grupo Pesquisa entra em `/pesquisa-modulo`. Dossiê legado no menu da conta, com aviso na própria tela | URL `/pesquisa` preservada; tabelas não apagadas |
| Sessão demo do App | Saiu do grupo Cliente; foi para Conta | `/app-cliente-demo` |
| Entregas / Fase 01 / Fase 02 | Continuam fora da barra de 7 abas | Rotas de arquivo, não nav |
| README de 6 abas | Texto atual descreve 7+8; briefing antigo em `archive/README-prototipo-visual-2026-08.md` | Sem reescrever git |
| “Piloto real” na ficha | Rótulo operacional **Primeira cliente** | CHECK `piloto_real` intacto |
| Comentário “mockup Fase 01” no Painel | Removido | — |

## FE / BE desta rodada

- Primeira aba do App: `COPY_TELAS.home.navegacao = "Home"`; barra usa esse rótulo; aba ativa em dourado.
- Jornada do cliente lê a **mesma** próxima ação do motor (`projetarProximaAcaoCliente`), com CTA “Abrir” e linha do tempo publicada. Sem segundo motor.
- Home do portal: próximo passo + CTA para o destino (documentos / conta / jornada).
- `research_cases.status`: escritor normaliza PT→EN do CHECK (`em_andamento` → `internal_research`). Valor inventado é recusado.
- Variantes de nome na cadeia de pesquisa: leitura escopada às pessoas do caso (não mais org-wide).
- Contrato: pré-carga dos parâmetros vazios a partir do Planejador / proposta, na abertura da preparação.

## O que ainda precisa de homologação (auth)

Não há sessão autenticada nesta VM. Não abri o Desk logada, não cliquei em Salvar no contrato da Ana, não provei magic link nem o App Cliente com o acesso dela.

Roteiro curto, quando você estiver logada:

1. `/casos` — Ana aparece como primeira cliente, não como DEMO.
2. `/casos/CA-CID-AT-FAM-2026-001/contrato/preparar` — ficha carrega; confirmar campos importados; recarregar (F5).
3. `/pesquisa-modulo` — o grupo Pesquisa doura este módulo, não o dossiê.
4. `/app-cliente-como-pessoa` com o caso da Ana — Home e Jornada mostram a mesma próxima ação.
5. Convite / login da Ana no App — PR #85 não deve ter regressão; esta sessão não repetiu esse clique.

Pendências honestas: ancestral de referência se o banco ainda estiver vazio; revisão humana da prévia final do contrato; magic link vivo; RLS do portal só se prova com o usuário cliente.
