# Decisões — Piloto da Ana

**Versão:** v2.0  
**Data:** 20 de agosto de 2026

## D-ANA-01 — Fechar o piloto antes de expandir escopo
**Decisão:** concluir o fluxo principal da Ana antes de novas funcionalidades ou outro piloto.

**Regra operacional:** somente corrigir bloqueadores do fluxo crítico.

## D-ANA-02 — Contrato após aceite operacional
**Decisão:** preparar e encaminhar o contrato da Ana imediatamente após o aceite operacional do piloto.

**Regra operacional:** não enviar contrato sem registrar o resultado do smoke test do fluxo principal.

## D-ANA-03 — Lovable em contingência controlada
**Decisão:** deixar de usar Lovable como ambiente principal devido ao alto consumo de créditos.

**Regra operacional:** uso apenas excepcional, registrado e restrito a impeditivos que não possam ser resolvidos no código.

## D-ANA-04 — Claude Code como ambiente principal
**Decisão:** Claude Code passa a ser o ambiente prioritário de implementação, diagnóstico e refatoração.

**Regra operacional:** cada alteração parte do repositório GitHub e gera commit documentado.

## D-ANA-05 — GitHub como fonte de verdade
**Decisão:** GitHub concentra código e documentação operacional.

**Regra operacional:** decisões, pendências, prompts e handoff devem ser versionados no repositório.

## D-ANA-06 — Infraestrutura confirmada
**Decisão:** Vercel e Supabase já estão funcionais.

**Regra operacional:** não revalidar implantação como pré-requisito; executar somente smoke test após mudança relevante.

## D-ANA-07 — Regra anti-loop de implantação
**Decisão:** impedir retorno recorrente de tarefas já concluídas de implantação.

**Regra operacional:** uma etapa de infraestrutura só pode ser reaberta com evidência nova e reproduzível, contendo URL/ambiente, data/hora, ação, resultado observado, impacto e critério de aceite. Ausência de documentação anterior exige documentação, não repetição de implantação.
