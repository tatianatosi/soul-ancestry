# Backlog — Fechamento do piloto da Ana

**Versão:** v2.0  
**Data:** 20 de agosto de 2026  
**Ambiente prioritário:** Claude Code + GitHub. Lovable somente em contingência justificada.

## P0 — Antes do contrato

### ANA-01 — Rodar fluxo principal ponta a ponta
- **Objetivo:** validar criação/início, salvamento, consulta, edição e resultado final do fluxo da Ana.
- **Critério de aceite:** o caminho crítico termina sem bloqueador.
- **Status:** pendente de execução assistida.

### ANA-02 — Classificar achados do último check
- **Objetivo:** registrar cada achado como bloqueador, relevante ou posterior.
- **Critério de aceite:** itens possuem evidência, impacto e próxima ação.
- **Status:** pendente.

### ANA-03 — Corrigir bloqueadores
- **Objetivo:** corrigir exclusivamente falhas que impedem o fluxo principal.
- **Critério de aceite:** fluxo completo passa após a correção.
- **Status:** condicionado ao resultado de ANA-01.

### ANA-04 — Smoke test pós-alteração
- **Objetivo:** conferir produção após mudança relevante.
- **Critério de aceite:** aplicação responde e o fluxo prioritário funciona.
- **Status:** condicionado a alteração publicada.

### ANA-05 — Registrar aceite operacional
- **Objetivo:** confirmar que o piloto está rodado redondo ou explicitar ressalvas não bloqueantes.
- **Critério de aceite:** status APROVADO ou APROVADO COM RESSALVAS sem bloqueador.
- **Status:** pendente.

### ANA-06 — Finalizar contrato
- **Objetivo:** revisar partes, escopo, valores, prazo, aceite, LGPD, IP e assinaturas.
- **Critério de aceite:** versão final pronta para assinatura.
- **Status:** pendente.

### ANA-07 — Encaminhar contrato para assinatura
- **Objetivo:** disponibilizar a versão final à Ana.
- **Critério de aceite:** data, canal, versão e responsável registrados.
- **Status:** bloqueado por ANA-05 e ANA-06.

## P1 — Após o aceite

### ANA-08 — Documentar itens pós-piloto
- **Objetivo:** consolidar melhorias sem ambiguidade.
- **Critério de aceite:** backlog com prioridade e critério de aceite.
- **Status:** pendente.

### ANA-09 — Congelar escopo no Lovable
- **Objetivo:** interromper evolução rotineira na plataforma de alto consumo de crédito.
- **Critério de aceite:** nenhuma nova demanda ativa no Lovable; exceções são justificadas.
- **Status:** pendente.

## P2 — Evolução posterior

- Criar suíte mínima de testes para o fluxo crítico.
- Instituir release notes por versão.
- Realizar backup e revisão de RLS/migrations antes de mudanças estruturais.

## Regra de infraestrutura

Vercel e Supabase estão funcionais. Não criar tarefas recorrentes de reimplantação ou revalidação sem falha nova, reproduzível e documentada.
