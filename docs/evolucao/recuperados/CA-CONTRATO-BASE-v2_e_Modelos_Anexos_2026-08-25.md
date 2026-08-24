# CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2 e modelos de Anexos I–V

## Proveniência

Colados no chat pela Proprietária, 25/08/2026: o texto completo do
"CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2" (cláusulas fixas A–N, variáveis
permitidas, mapa de anexos, gates, matriz de renderização) e os cinco
modelos de Anexo (I — Ordem de Serviço, II — Despesas Externas, III —
Autorização de Pesquisa, IV — Procuração, V — Alteração de Escopo).

## Natureza — importante

Os cinco modelos de anexo são **formulários com placeholders**
(`[CASE_ID]`, `[NOME]`, `[DATA]`, `[DESCREVER]`), não texto jurídico
preenchido e aprovado. Não foram materializados como conteúdo de nenhum
caso real — isso violaria a regra do próprio PROMPT 04 ("nunca inventar
informação pessoal, preço, escopo, data ou assinatura"). Ficam registrados
aqui como especificação de estrutura de campo, para cotejo com o motor.

## Cotejo com o código atual

- **Contrato-base**: `src/lib/contrato-base-consolidado.ts` declara
  `CONTRATO_BASE_VERSAO = "v1.0"`, `CONTRATO_BASE_STATUS = "under_legal_review"`.
  O documento colado se autodenomina "v2.0", mesma data 2026-08-22 do
  código. **Divergência de versão não resolvida** — ver
  `docs/auditoria/CA-AUD-10_Fechamento_Prontidao_Operacional_2026-08-25.md`.
  As cláusulas A–N, a matriz de renderização e a ordem de precedência de
  fontes (Planejador homologado → proposta/OS aprovada → CRM confirmado →
  documento → importado a confirmar) batem estruturalmente com o que já
  existe em `contrato-base-consolidado.ts` (seções numeradas, fonte única de
  texto jurídico) — não fiz comparação campo a campo do texto integral.
- **Anexo I (Ordem de Serviço)**: estrutura de campos (escopo, entregáveis,
  investimento/pagamento, condições, aceite) é compatível com o que
  `anexos-i-v.ts`/`contrato-parametros.functions.ts` já derivam da ficha —
  confirma que o Anexo I é gerado, não um documento estático.
- **Anexos II, IV, V**: mapa de campos (política de despesas, procuração
  por país/órgão, alteração de escopo com impacto de prazo/financeiro) é
  compatível com `DespesaExternaAnexo`/`procuracao-europeia.ts`/motor de
  impactos controlados já existentes — nenhuma incompatibilidade
  encontrada, mas os campos ainda estão vazios nestes modelos.
- **Anexo III (Autorização de pesquisa)**: estrutura (finalidade, órgão,
  pessoa relacionada, custo estimado, teto, prazo) compatível com o gate
  `ANEXO_III_AUTORIZACAO_PESQUISA` já implementado.

## O que não fiz

Não materializei nenhum destes anexos para nenhum caso real — os campos
estão em branco. Quando o conteúdo preenchido e aprovado chegar (mesmo
caminho dos outros documentos: upload direto), aplico a mesma rotina de
materialização (`ressincronizarAnexosDoCaso` para o Anexo I,
`materializarAnexosRevisados` para II/IV/V) sem reescrever texto jurídico.
