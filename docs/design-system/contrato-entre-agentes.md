# Contrato entre agentes — execução, publicação e prova

**Status:** vigente
**Versão:** v1.0
**Data:** 2026-09-24
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Fonte:** decisão explícita da Proprietária na sessão de 2026-09-24.

Este contrato vale para todo agente que trabalhe no Clube Ancestral (Claude,
Cursor, Lovable ou outro), em qualquer sessão. Ele define como um pedido da
Proprietária vira trabalho publicado e onde a prova acontece. Não substitui
nem enfraquece os demais contratos deste diretório: ele diz **como executar**;
os outros dizem **o que** pode existir na interface e nos dados.

## Regras

| # | Regra | O que o agente faz |
|---|---|---|
| 1 | Todo prompt ou plano da Proprietária está aprovado, inclusive os marcados como rascunho. | Executa sem pedir nova aprovação para o que já foi pedido. |
| 2 | Ler além do cabeçalho. | Status, limites e contexto no topo não encerram a leitura: lê o pedido inteiro, faz só as leituras iniciais necessárias e então executa. Não para em inventário, plano ou auditoria quando o pedido é execução. |
| 3 | Corte a corte até a última linha. | Executa na ordem do pedido; ao terminar e verificar um corte, segue direto para o próximo, até concluir a última linha do prompt pedido e autorizado. |
| 4 | Publicar sempre em `main`. | Cada corte executado e verificado (tipos, testes, build) é publicado em `main` e o branch de trabalho designado é sincronizado em seguida. Vale também para planos anteriores já executados e ainda não publicados. Ao publicar, informa branch e SHA. |
| 5 | Prova visual é produzida no Lovable. | Depois de publicar, entrega as instruções de prova visual (tela, ação, resultado esperado, releitura) para conferência no Lovable. Teste, build ou print do agente não substituem essa prova, e nada vira `COMPROVADO_EM_USO` sem ela. |

## Limites que continuam valendo

- As **Proteções** do `AGENTS.md` (RLS e isolamento, LGPD e consentimento,
  representação de menor, histórico e auditoria, canônicos, contrato assinado,
  evidência para achado confirmado, bloqueio de exclusão física crítica).
- Nunca colar nem pedir `service_role` em chat, GitHub ou artefato.
- Os demais contratos deste diretório (navegação imutável, visibilidade e
  sanitização, CTA/contexto/prova, taxonomia, máscaras).
- **Bloqueios de permissão do ambiente**: quando o ambiente recusa uma ação,
  o agente não contorna por outro caminho — relata o que tentou, por quê, e
  deixa a decisão com a Proprietária.

## Relação com o `AGENTS.md`

O `AGENTS.md` ainda diz, em dois pontos, que merge exige aprovação explícita a
cada vez. Pela ordem de autoridade (item 1: decisão explícita e mais recente
da Proprietária), este contrato é essa aprovação, dada de forma permanente
para cortes executados e verificados. O texto do `AGENTS.md` não foi alterado
por agente: a atualização daquele arquivo cabe à Proprietária.

## Entrega esperada de cada corte

| Item | Conteúdo |
|---|---|
| O que foi feito | Arquivos, camada (UI, servidor, banco) e entidades reais tocadas |
| Verificação | Tipos, testes focados, suíte completa e build |
| Publicação | SHA em `main` e sincronização do branch designado |
| Prova visual | Roteiro para conferência no Lovable: tela, ação, resultado esperado, releitura |
| Pendências | Só o que depende de decisão da Proprietária ou de bloqueio do ambiente |
