# Desk — Sistema operacional do dia (2026-09-11)

**Branch:** `cursor/desk-sistema-operacional-dia-5722`  
**Escopo:** converter o Desk Interno de superfície contextual em entrada operacional diária no `/painel`, sem escrita de dados reais, migration, RLS, deploy ou integração externa.

## Resultado executivo

| Classificação | Qtd (inventário) | Nota |
|---|---|---|
| OPERACIONAL | 5 | Fila canônica, próxima ação+rota, comercial rascunho, override auditável, contrato/OS prep |
| LEITURA_DERIVADA | 4 | Gates, agenda, financeiro leitura, pesquisa/evidências |
| PENDENTE_DE_DADO | 1 | Card SLA em risco (= null) |
| PENDENTE_DE_DECISAO_PROPRIETARIA | 1 | Taxonomia Desk 6 vs 8 |
| PENDENTE_DE_VALIDACAO_PUBLICADA | 1 | Portal autenticado no domínio publicado |

Fonte: `INVENTARIO_CAPACIDADES_DIA` em `src/lib/sistema-operacional-dia.ts`.

**Não** declarar go-live, cobrança ativa, portal homologado em produção ou calendário integrado.

## De–para

| Capacidade | Antes | Depois | Evidência | Rota | Testes | Estado | Lacuna residual |
|---|---|---|---|---|---|---|---|
| Fila do dia | Filas + consolidação sem contrato de categoria | `ItemOperacionalDia` + 10 categorias + precedência | `montarFilaCanonicaOperacional` | `/painel` | `sistema-operacional-dia.test.ts` | OPERACIONAL | Unificar 100% via RPC |
| Item prioritário | Ação + prazo + responsável | + categoria, estado, evidência, tipoAção, origem, rota | `Linha` enriquecida | `/painel` | idem | OPERACIONAL | — |
| Dedup | `consolidarDia` / `chavesExibidas` | Mantido + fila operacional 1 id | `idsDuplicadosNaFila` | `/painel` | idem | OPERACIONAL | — |
| Falha de leitura | Erro na UI | Item `falhas_dado_integracao` crítico; nunca “completo” | `falhaLeitura` | `/painel` | idem | OPERACIONAL | — |
| Agenda | Módulo puro órfão do Painel | Bloco `agenda` com RASCUNHO_INTERNO | `derivarAgendaDoPainel` | `/painel` | agenda + sod | LEITURA_DERIVADA | Criar evento externo |
| Override | Política + funções | Exposto no inventário; ações jamais liberadas testadas | `overrideNuncaLiberaAcaoExterna` | `/contratos` | sod + override-* | OPERACIONAL | Sem gravar nesta fatia |
| Financeiro | Contagem derivada | `somente_leitura` na categoria | tipoAcao | `/financeiro` | sod | LEITURA_DERIVADA | Sem cobrança |
| Comercial | Calls/propostas | Mantido; fixtures Ana/João/Lara = CONTEXTO | `followUpParaOperacional` | `/calls` | sod | OPERACIONAL / CONTEXTO | Sem criar leads |
| Portal | Guardas existentes | Matriz de validação autenticada | `matrizValidacaoPortal` | `/portal` | sod | PENDENTE_DE_VALIDACAO_PUBLICADA | Sessão dona |
| SLA card | `null` | Declarado PENDENTE_DE_DADO | `cardsHoje` | `/ops` | existente | PENDENTE_DE_DADO | Fonte SLA |

## Arquivos alterados

| Arquivo | Finalidade |
|---|---|
| `src/lib/sistema-operacional-dia.ts` | Contrato canônico do sistema do dia |
| `src/lib/__tests__/sistema-operacional-dia.test.ts` | Caracterização, dedup, falha, agenda, override, portal |
| `src/components/painel/painel-dia.tsx` | UI: metadados operacionais + bloco agenda |
| `src/lib/painel-dia.ts` | MAPA_BLOCOS + agenda |
| `src/lib/painel-ordem.ts` | ORDEM_BLOCOS + agenda (fila: false) |
| `src/lib/__tests__/ca-ux-03-fase-b.test.ts` | Permitir bloco `agenda` |
| `docs/relatorios/…` | Circuito manhã/fim + este de–para |

## Validação técnica (este turno)

| Comando | Resultado |
|---|---|
| `bunx vitest run` (suite `src/lib/__tests__/`) | 227 arquivos OK; 1 falha pré-existente em `onboarding-jornada.test.ts` (fora do escopo) |
| Testes do sistema do dia + painel/ordem/agenda/par | Passaram |
| `bun run build` | Passou |
| `bunx tsc --noEmit` | 25 erros pré-existentes em `pessoas.$clienteId.tsx` (main); **zero** nos arquivos desta fatia |

## Proibições confirmadas

Não houve: deploy; migration/RLS; INSERT/UPDATE/DELETE de dados reais; criação de lead/caso/proposta/contrato/cobrança; envio WhatsApp/e-mail/SMS; evento Google Calendar; Meta/pixel; pesquisa externa; alteração de preço/SKU/Asaas.

## Decisões pendentes da Proprietária

1. Unificar próxima ação 100% via RPC no filtro do Painel (hoje texto RPC só em pendência documental).
2. Autorizar (ou não) conector de calendário após confirmação.
3. Certificar taxonomia Desk 6 vs 8 grupos.
4. Carregar fonte SLA para o 5º card (sem inventar zero).
5. Rodar matriz portal autenticada e registrar no registro vivo.

## Próxima ação recomendada

1. Abrir preview `/painel` autenticada e conferir categoria/evidência/agenda.  
2. Preencher matriz portal com sessão de homologação.  
3. Decidir sobre unificação RPC + taxonomia Desk.  
4. Só então autorizar merge (branch + SHA + se dispara produção).
