# Formalização em cinco cartões · modelo aprovado × conferência da instância

Versão 1 · 09/10/2026 · decisão da Proprietária (instrução de 09/10/2026). Não cria modelo concorrente.

## Decisão
- O **Contrato de Estudo Genealógico v2** é o contrato principal. Modelos e matriz já passaram por revisão jurídica; a estrutura de cartões é **operacional**.
- **Aprovação do modelo/versão** (feita, vigente desde 22/08/2026) é separada da **conferência operacional da instância** (dados, partes, representação, assinatura).
- Revisão jurídica só volta para **alteração material fora do conteúdo aprovado** (override de cláusula no contrato do caso), com motivo e trecho identificados.
- Quando não há evidência histórica vinculada, a tela diz **"referência de aprovação a vincular"** — não inventa referência nem trata como não aprovado.

## O que mudou no código (implementado)
| Peça | Arquivo |
|---|---|
| Aprovação do modelo e escalada excepcional | `src/lib/aprovacao-modelo.ts` |
| Cinco cartões, estados, orçamento 10/10/20/15/5 min | `src/lib/formalizacao-cartoes.ts` |
| Adaptador único payload de preparação → cartões | `src/lib/formalizacao-cartoes-adapter.ts` |
| Leitura/gravação do checklist + auditoria automática | `src/lib/formalizacao-cartoes.functions.ts` |
| Componente compartilhado | `src/components/contrato/cartoes-formalizacao.tsx` |
| Gate jurídico escopado ao modelo | `src/lib/escopo-conferencia.server.ts`, `escopo-conferencia.ts`, `gates-formalizacao.ts` |
| Montagem nas duas superfícies | `casos.$caseId.contrato.preparar.tsx`, `golive.formalizacao.tsx` |

## Estados do checklist
pendente · em andamento · concluído · não aplicável · bloqueado por pendência externa.
Persistidos apenas `pendente`, `cumprido`, `nao_aplicavel` (CHECK existente de `case_checklist_items`, fase `formalizacao`); "em andamento" e "bloqueado" são derivados dos fatos. Nenhum CHECK novo. Só itens de conferência humana são marcáveis (whitelist no servidor); fato derivado nunca é marcado à mão.

## Gates
- `revisao_juridica`: satisfeito por revisão humana **ou** por instrumento dentro do modelo aprovado e sem override de cláusula.
- `matriz_juridica`: temas bloqueantes deixam de bloquear quando o instrumento está dentro do modelo aprovado.
- Continuam bloqueando: dados de partes, representação de menor, cobertura contratual, assinatura, alteração fora do modelo.

## Anexos I–V (inalterado, reafirmado)
I incorporado ao corpo; II só com despesa concreta; III só com autorização específica; IV só com exigência de órgão/país/poderes; V só após mudança de escopo. Nunca "aprovado" para esconder ausência; nada é apagado.

## Permanecem como estavam (não substituídos globalmente)
`ADENDOS_TEXTUAIS` (cancelamento, canais oficiais) e demais ocorrências de `under_legal_review` — são estados de adendos específicos, não do modelo v2. Conferência humana ≠ reabertura jurídica.

## Verificação — o que é e o que não é
- Implementado no código e testado: `src/lib/__tests__/formalizacao-cartoes-2026-10-09.test.ts` (21 testes: caso completo sem nova revisão; incompleto bloqueado por pendência concreta; anexo não aplicável concluído com justificativa; alteração fora do modelo identifica motivo e trecho; checklist recuperável ao reabrir; duas superfícies sobre o mesmo modelo; assinatura/contrato assinado não alterados).
- **Não verificado**: interface em desktop e mobile, comportamento autenticado, tempo real de 60 min em cenário controlado, ambiente publicado. O relatório e2e (`output/aceite-e2e/relatorio.md`) segue `NAO_VERIFICADO`.
- A gravação via servidor (`marcarItemFormalizacao`) é coberta por teste de estrutura, não por execução contra o banco.
