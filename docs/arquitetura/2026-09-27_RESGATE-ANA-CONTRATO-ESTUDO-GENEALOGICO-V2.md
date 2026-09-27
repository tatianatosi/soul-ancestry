# Resgate Ana — Contrato de Estudo Genealógico v2 (27/09/2026)

Autorização explícita da Proprietária ("RESGATE DO CONTRATO DA ANA").

## O que governa a Ana

Planejador de Cidadania + Produto-Pai (`case_plans.produto_pai_id`) + proposta
Canva aprovada (páginas 1–7, `proposal_canva_pages`) + composição familiar.
Nunca SKU técnico, `product_catalog` ou Planilha Mestre.

Regra única: `casoGovernadoPeloPlanejador` (`src/lib/resgate-contrato-planejador.ts`)
— Produto-Pai definido E proposta de origem Canva.

## Instrumento recuperado

Contrato de Estudo Genealógico v2 = o texto já vigente em
`src/lib/contrato-base-consolidado.ts` (MODELO-ESTUDO + BASE-GEN-V2). Nenhum
texto jurídico novo. Mudou só a apresentação: título das duas prévias, rótulo
do tipo `contract_base` e o título do contrato da Ana (migration
`20260927130000`, só se ainda "Contrato-base familiar" e não assinado).

## Escopo e OS

- `conciliacaoDoContrato` consulta `governancaPlanejadorCanva` antes do
  catálogo: caso governado só é bloqueado pela própria proposta Canva
  (aprovada, do caso, páginas 1–7), nunca por SKU. `aprovarParaEnvio` deixa
  de rotular esses bloqueios como "Conciliação de catálogo".
- Anexo I/OS: writer já existente `persistirAnexoI` ("Derivar Anexo I da
  proposta aprovada"), que lê só a proposta Canva. A conciliação de catálogo
  some da OS quando o caso é governado.

## Tela (mesma rota `/casos/$caseId/contrato/preparar`)

- Preparar: Proposta → Partes → Escopo → Condição particular → OS/Anexos →
  Pendências humanas → Salvar rascunho.
- Revisar: Contrato v2 completo → Anexo I/OS e anexos → versões → solicitar
  revisão / aprovar / assinatura (atos externos continuam guardados).
- Matriz, gates, fontes, auditoria, checklist e inventários: recolhidos em
  "Detalhes internos". Nada removido.

## Pendências humanas (calculadas dos dados reais, uma vez cada)

`pendenciasHumanasDoContrato`: telefone divergente entre contrato e cadastro
(escolha com motivo pela Fase E), documento ausente de parte assinante,
dependente com representação pendente, revisão da prévia. Divergência já
decidida com motivo não volta.

## Persistência

Salvar rascunho existe em Preparar e só mostra "salvo" com o rascunho relido
do servidor. Linha da ficha remonta com o valor persistido. Decisão sobre o
dependente atualiza a tela de contrato na hora.

## Não feito (fora do corte)

Nada criado, enviado, assinado, cobrado ou publicado. Nenhuma tabela nova.
