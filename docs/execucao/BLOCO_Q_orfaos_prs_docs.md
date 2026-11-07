# BLOCO Q — Órfãos, PRs e documentos sem execução (acrescenta-se à FILA v2; roda em paralelo ao Bloco A)

## Escala real (GitHub, 03/11/2026)
- 232 números de PR: 195 mesclados (63 com o rótulo "documentação"), 15 fechados sem mesclar, cerca de 18 abertos. Mais cerca de 100 branches.
- Documentos: 227 arquivos em docs/ com a marca [PLANEJADO] e 186 com "Próximos passos".
- Módulos órfãos de arquivo: 30 (15 aposentados, 9 cascas duplicadas, 4 aguardando decisão, 2 sem veredito); a decisão dos 4 está em DECISOES_JA_TOMADAS.

## Regra
Nada é apagado. Um item só sai da lista como ENTREGUE, SUPERADO (com o commit que o supera) ou PORTADO (com a PR). Documento mesclado nunca conta como execução.

## Itens (até 3 arquivos cada)
Q01 Rodar scripts/triagem-branches-e-docs.mjs na raiz do clone. Gera docs/triagem/triagem-branches.csv (JA_NA_MAIN, ENTREGUE, DOC_SEM_EXECUCAO, PORTAR_ARQUIVOS_NOVOS, PORTAR_OU_SUPERADO_REVISAR) e docs/triagem/pendencias-em-documentos.csv.
Q02 PORTAR_ARQUIVOS_NOVOS: uma PR por branch trazendo os arquivos novos para a main atual (se quebrar o tsc, registrar a causa e seguir).
Q03 PORTAR_OU_SUPERADO_REVISAR: comparar cada arquivo divergente com a main. Se a main já tem a função por outro caminho, registrar SUPERADO com o commit; se não tem, portar a parte que falta. Prioridade: planejador (#118), Pessoa 360 em cards (#114), cadeia do Caso 360 (#117), CRM Journey e Painel de Calls (#110), Mesa Discovery SPIN (#102), quadro de tarefas (#108).
Q04 DOC_SEM_EXECUCAO: do CSV de pendências, converter cada [PLANEJADO] e cada checkbox aberto em uma linha da fila, com arquivo e linha de origem. Já feito = JÁ FEITO com o commit. Não escrever documento novo.
Q05 Fechar com comentário de motivo as PRs abertas já cobertas: #202 e #215; #125 (reverte a paleta Pantone); cada PR de setembro só depois de PORTADA ou SUPERADA. Mesclar #231, #222 e #212.
Q06 Órfãos: registrar o veredito dos 4 pendentes em docs/grafo/classificacao-arquivos.csv (preview-fixtures, painel-top30 e fontes-documentos-rls aposentados; agenda-assistida fora do lançamento) e dar veredito a src/data/saneamento.ts. Aposentar = perde só a importação de produção.
Q07 Teste de órfãos cobrindo todo o src.
Q08 Rodar Q01 de novo ao fim de cada bloco e anexar a contagem ao comentário da última PR do bloco (uma linha).
