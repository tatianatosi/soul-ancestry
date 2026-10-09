# Impacto da revogação dos legados no código

Status: aprovado
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Escopo da aprovação: revogação dos legados; não certifica execução ou completude da inspeção.
Estado: inspeção estática executada; correções, testes e validação no banco atual não executados.
Fontes: anexo d1181b0cbeacaacf556a5121d8b9aa85f062b672.md; política no commit 00b620f; main c2f0f57e6c4cf5e7026f8ed29b364278215b22a5; patch cced8afbaa54585470bd8ba8e4a65ebba7de0170 e buscas GitHub desta rodada.
Substitui: conclusão anterior não comprovada de que SKU e divergência PP-02/PP-03 necessariamente impedem assinatura da Ana.

## Escopo e premissas

Contrato, parâmetros, preço, jornada, CRM, OPS, migrações e testes. SKU legado não governa contratação. Preservar escopo e condição aprovados, revisão, prévia íntegra, assinatura, acesso e representação de menor. Aprovar política não muda o comportamento do programa.

## Impactos verificados

1. Contrato já possui bypass condicional: src/lib/conciliacao-catalogo.server.ts chama governancaPlanejadorCanva antes de conciliarPropostaComCatalogo. Patch de 27/09 confirma o retorno sem SKU quando há produto-pai no plano e proposta Canva, com verificações de organização/vínculo e validação da proposta/páginas. Quando retorna null, volta ao catálogo. Não foi comprovado qual caminho a Ana toma hoje no banco.
2. src/lib/contratos.functions.ts consome a conciliação em aprovarParaEnvio. src/components/contrato/cadeia-formalizacao.tsx oculta BloqueioEmissaoOS no caminho governado. Isso é implementação real, não apenas documentação.
3. src/lib/conciliacao-catalogo.ts ainda classifica SEM_SKU e SKU_FORA_CATALOGO como bloqueantes. Não basta ocultar seletor; remover autoridade do fallback nos fluxos atuais.
4. contrato-preparar.functions.ts, contrato-parametros.functions.ts e motor-cidadania.functions.ts chamam skuHomologadoParaCaso. São chamadas reais, não só imports. Não foi comprovado que cada chamada bloqueia.
5. O corte c2f0f57 mantém catálogo no seletor: catalogo-opcoes-contrato.ts/.server.ts, linha-parametro.tsx e parametros-catalogos.ts. Código e nome vêm do feed; comparação de produto-pai depende de nome. Divergência visual não foi comprovada como gate de assinatura.
6. precos-sku.ts ainda declara Planilha Mestre oficial. Consumidores: regra-comercial.functions.ts, anexos-i-v.ts e components/contrato/regra-comercial.tsx. preco-canonico.ts já classifica a planilha como legado, mas mantém catálogo homologado: há gerações de autoridade convivendo.
7. jornada-planejador.server.ts importa produtoPaiDoSku e retorna skuCodigo. Dependência a rastrear antes de corrigir; fluxo completo não lido.
8. __tests__/motores-primordiais.test.ts exige skuHomologadoParaCaso nos leitores e product_catalog no helper. Esses testes podem forçar manutenção da premissa revogada. resgate-ana-contrato-v2-2026-09-27.test.ts já cobre bypass sem SKU, com banco simulado.
9. CRM histórico ainda tem routes/_authenticated/crm-mestre.tsx, lib/ca04-crm-mestre.ts e crm-mestre-export.ts. Snapshots em data/catalogo-fonte-mestre.ts, data/propostas.ts e data/saneamento.ts. Existência não prova uso atual nem autoriza apagar história.
10. discovery-roteiro-mestre.ts já exclui catálogo/SKU/Planilha Mestre da call e é usado por components/crm/mesa-roteiro-mestre.tsx. Não apagar a Discovery por conter mestre no nome.

## OPS: não apagar por palavra-chave

lib/ops.functions.ts consulta v_ops_tarefas e v_ops_microentregas; lib/ops.server.ts define permissões; routes/_authenticated/ops.tsx monta DeskOperacional e PainelOnboardingJornada. lib/d7-microentrega.ts usa ops_microentregas como fonte. Retirar a autoridade do Painel Mestre OPS não autoriza quebrar essas funções sem substituição no fluxo aprovado.

## SQL e limites

Migrações antigas contêm produto_sku obrigatório, validações de sku_referencia e guards comerciais; há redefinições posteriores. Isso não prova quais guards estão instalados hoje. Projeto atual declarado liiqqibnirnpnvjmjrpj teve acesso negado em consulta anterior; zsxpdbhdvbuulwpepemd é legado. Não migrar o banco antigo para corrigir o piloto.

Inspeção focal por trechos indexados e patch, não inventário exaustivo. Não houve testes/build, fluxo autenticado, mudança funcional ou consulta atual ao banco. Contagens de busca não são contagens de travas ativas.

## Próximos passos

Conferir governança efetiva da Ana; retirar fallback SKU dos fluxos atuais e ajustar parâmetros/preço/jornada; preservar história; atualizar testes; verificar SQL no projeto correto. O contrato não deve exigir decisão PP-02/PP-03 apenas para satisfazer SKU antigo.

## Critério de aceite

Contrato/proposta/jornada com escopo e condição aprovados funcionam sem SKU legado ou mestres. Validação no servidor e testes executados, preservando prévia íntegra, revisão, assinatura, acesso, menor, Discovery, CRM vivo e microentregas necessárias. Não declarar cobrança liberada só pela existência deste relatório.
