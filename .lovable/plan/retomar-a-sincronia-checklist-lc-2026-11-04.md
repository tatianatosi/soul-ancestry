# Retomar a sincronia (checklist LC)

O painel de agentes no Desk fica para depois. A prioridade volta a ser o checklist de sincronia.

## Estado atual (já conferido)
- LC-01 testada: `AGENTS.md` não manda mais depender do reservation-sync removido.
- Checklist LC registrado em `docs/prompts/2026-11-04-lovable-sincronia-checklist-executavel.md`.
- LC-02 e LC-04 parados: a fila oficial e o script de triagem só existem nas PRs #233/#231, ainda fora da `main` do Lovable.
- LC-03 parado: daqui não dá para ler o registro do erro da PR #233.

## Próximos passos
1. Ler de novo a `main` sincronizada. Se a fila oficial (`docs/execucao/FILA_DE_MICROCORTES_AUTORIZADA_v2.md`) já tiver chegado, levar as linhas LC para ela e marcar LC-02 como testada.
2. Se o script de triagem tiver chegado, executar a LC-04 só como classificador, tratando erros de Git como erro e sem restaurar peças aposentadas.
3. Escolher o primeiro item de A a O que não esteja reservado em PR aberta e corrigir a causa com teste (LC-05).
4. Atualizar o checklist depois de cada passo, com estados separados: código, `main`, banco e site publicado.
5. Se a fila ainda não tiver chegado, registrar esse bloqueio no checklist e parar sem criar fila paralela.

## Limites
- Não recriar o reservation-sync, não criar branch fixa e não ativar mescla automática.
- Nada de banco, permissões, convites ou publicação sem a sua confirmação específica.
