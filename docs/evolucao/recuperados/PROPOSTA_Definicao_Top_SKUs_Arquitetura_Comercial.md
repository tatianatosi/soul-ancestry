# Definição de Top SKUs e Arquitetura Comercial Enxuta — Clube Ancestral

**Status do próprio documento:** PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA. Não é
decisão automática, não cria/edita/desativa/publica/paga/integra/exclui nada.

## Proveniência

- **Origem:** colado no chat pela Proprietária, 24/08/2026, em duas partes: o
  texto completo desta proposta e o CSV companheiro
  `PROPOSTA_Matriz_Priorizacao_Top_SKUs_91.csv` (91 linhas, mesma pasta),
  enviado como upload separado.
- **Método declarado:** reclassificação dos 91 SKUs do
  `SANEAMENTO_DE_SKUS.csv` (fonte de verdade de existência, não deste
  repositório) por 10 critérios (A–J, 0–5), com nota baixa em H (segurança
  jurídica) ou I (maturidade de dados) rebaixando a recomendação
  independentemente da soma.
- **Natureza:** recomendação de priorização comercial (planejamento de
  produto/catálogo), não uma especificação de módulo de software já
  implementado — ao contrário de CA-06/Dicionário/Glossário, este documento
  é prospectivo, não retrospectivo.

## Resumo do conteúdo

- **10 CANDIDATO TOP 10** (núcleo): CA-CID-001, CA-CID-002, CA-CID-023,
  CA-CID-003, CA-HIST-001, CA-HIST-004, CA-MEM-003, CA-MEM-004, CA-IND-005,
  CA-ASS-002. Confiança mista (evidência direta / parcialmente validado /
  hipótese estratégica) — nenhum é "produto comercial definitivo".
- **+20 CANDIDATO TOP 30** adicionais, predominantemente hipótese
  estratégica.
- **61 itens fora dos candidatos**, com destino conceitual preservando
  rastreabilidade: ARQUIVAR/HISTÓRICO, NÃO PRIORITÁRIO ou PENDENTE DE
  VALIDAÇÃO HUMANA — nenhum é apagado.
- **Tronco comum de jornada em 7 etapas**: descoberta/diagnóstico →
  estratégia/pesquisa/documentação → execução/acompanhamento principal →
  pós-cidadania/registros → história/memória/legado → autonomia/educação →
  assinaturas/continuidade.
- **Matriz de exibição por sistema**: App Cliente/Canvas nunca mostra
  SKU/ranking/preço técnico; Desk/CRM concentra o catálogo técnico;
  Asaas só cobra item com SKU+escopo+preço+condição reconciliados.
- **Fila de 9 decisões humanas** (ratificar candidatos, reconciliar
  preço/escopo/links, resolver fusões CA-CID-001×024 e CA-CID-003×POS-001,
  validar assinaturas, validar capacidade de itens de memória/legado,
  definir CRM operacional, decidir país fora de catálogo, validar conteúdo
  de autonomia, decidir reativação de CA-CURSO-001 — hoje Arquivado).
- **Plano de execução em 6 ondas**, terminando em "fichas-modelo e bases
  genealógicas públicas" apenas após validação humana de fonte/direitos.
- Casos reais citados como evidência parcial (não prova de demanda):
  Giovanna, João Marcelo, Ana Luiza; Sophi é explicitamente caso-modelo,
  não evidência real; Danilo só sustenta necessidade croata a validar.

## Cotejo com o código atual — proposta ainda não refletida no código; infraestrutura já existe

Este documento **não** é a especificação de um módulo já construído (ao
contrário de CA-06/Dicionário/Glossário). O que já existe no código é a
**infraestrutura genérica** para hospedar exatamente este tipo de
classificação, mas os valores específicos de faixa por SKU vivem no banco
(Supabase), não neste repositório:

- `src/lib/catalogo-top30.functions.ts` — `painelTop30Planejador()` já lê de
  `product_catalog` os campos `faixa_prioridade` (`"TOP_10" | "TOP_30" |
  "HISTORICO"`) e `papel_comercial`, e agrupa `top10`/`top30`/`historico`.
  **Divergência de taxonomia**: o código usa 3 categorias; esta proposta usa
  5 rótulos (CANDIDATO TOP 10, CANDIDATO TOP 30, NÃO PRIORITÁRIO, PENDENTE
  DE VALIDAÇÃO HUMANA, ARQUIVAR/HISTÓRICO). Aplicar esta proposta ao banco
  exigiria decidir o mapeamento 5→3 ou estender o enum — decisão humana,
  não feita aqui.
- `src/routes/_authenticated/governanca.catalogo-operacional-30.tsx` —
  tela que consome o painel acima; já existe e está em uso.
- `output/catalogo/precos-a-homologar.csv` — já registra `status_homologacao`
  por SKU (`homologado`/`bloqueado`/`em_revisao`), mecanismo compatível com
  a "Fila de validação humana" desta proposta, mas com vocabulário próprio.
- A classificação de 91 SKUs em si (a tabela completa, os 10+20 candidatos,
  a pontuação A–J) **não está codificada em nenhum arquivo deste
  repositório** — é dado, não código, e pertence ao `product_catalog` no
  Supabase, que esta sessão não tem acesso de escrita/leitura direta.

## O que eu não fiz aqui

Não apliquei nenhuma faixa/rótulo desta proposta ao catálogo real (nem em
código, nem em CSV de homologação, nem no Supabase). O próprio documento é
explícito que isso depende de decisão humana explícita — mantive essa
barreira. O CSV companheiro (`PROPOSTA_Matriz_Priorizacao_Top_SKUs_91.csv`)
foi preservado nesta pasta como o dado tabular de referência.
