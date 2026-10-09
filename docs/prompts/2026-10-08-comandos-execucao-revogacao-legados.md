# Comandos de execução — revogação dos legados

Status: aprovado
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: política aprovada `docs/politicas/2026-10-08-legados-sem-autoridade-operacional.md`; auditoria aprovada `docs/auditorias/2026-10-08-impacto-revogacao-legados-no-codigo.md`; decisão explícita da Proprietária nesta conversa.
Escopo: execução em branch, sem merge, deploy, banco, assinatura, cobrança ou publicação externa.
Premissas: Planejador, produto-pai, jornada, país/rota, proposta aprovada, CRM vivo, Calls e Discovery governam o fluxo atual. Planilha Mestre, CRM Mestre, Painel Mestre OPS e SKUs legados não são gates nem fonte operacional.
Limites: não apagar histórico, não remover rotas por nome, não alterar autorização, RLS, consentimento, representação de menor, instrumento jurídico ou condição comercial aprovada.
Próximos passos: executar C1; parar para prova; só então executar C2 e C3 em cortes separados.
Critério de aceite: fonte → função → componente → rota → ação → persistência → histórico/estado → F5, com testes relevantes. Documento não equivale a implementação.

## C1 — contrato da Ana sem fallback de SKU

```text
MODO EXECUÇÃO CONTROLADA — C1.

Trabalhe somente na branch atual. Não criar relatório, plano, auditoria, de-para, migration, rota, tabela, dado demo, push para main, PR, merge ou deploy.

Objetivo: remover a autoridade do fallback de catálogo/SKU no fluxo contratual atual, sem remover a guarda de proposta Canva, escopo, condição particular, prévia vigente, revisão, assinatura, acesso ou representação de menor.

Fonte de autoridade: caso com produto-pai no `case_plans` e proposta de origem Canva aprovada. Produto-pai é contexto do caso; SKU legado não valida, não bloqueia e não decide PP-02 versus PP-03.

Leia antes de editar:
- `src/lib/conciliacao-catalogo.server.ts`
- `src/lib/conciliacao-catalogo.ts`
- `src/lib/contratos.functions.ts`
- `src/lib/resgate-contrato-planejador.ts`
- `src/lib/__tests__/resgate-ana-contrato-v2-2026-09-27.test.ts`
- `src/lib/__tests__/conciliacao-catalogo.test.ts`

Implementação mínima:
1. Em `conciliacaoDoContrato`, quando houver contrato/proposta vinculados a caso, a decisão de bloqueio deve depender da proposta Canva e da governança do Planejador; não voltar a `conciliarPropostaComCatalogo` por ausência, divergência ou não homologação de SKU.
2. Se faltar produto-pai, proposta Canva, aprovação, vínculo com o caso ou completude das páginas, devolver bloqueio com o motivo factual correspondente. Não escrever "SKU", "catálogo" ou "homologação de SKU" como motivo de bloqueio no caminho contratual atual.
3. Em `aprovarParaEnvio`, preservar os demais impedimentos reais e a nomenclatura factual da proposta, prévia, revisão e assinatura.
4. Não alterar valores, condição comercial, contrato, partes, anexos, proposta ou banco.
5. Atualizar/remover apenas testes que exigem SKU como gate do contrato atual; adicionar teste que prova: caso com produto-pai e proposta Canva completa é liberado mesmo sem SKU; proposta ausente/incompleta continua bloqueando por motivo de proposta; regra de menor e revisão continuam independentes.

Limite: máximo quatro arquivos de produção e três testes. Se a alteração exigir migration, pare e reporte a necessidade sem aplicar.

Provar antes de responder:
- `npx tsc --noEmit`
- testes focados alterados
- `npx vite build`
- diff por arquivo
- declaração explícita de que não houve migration, merge, deploy, assinatura ou cobrança.

Não dizer pronto: devolver `CODIFICADO` e `TESTADO`, com comandos e saídas reais. Pare.
```

## C2 — preço e condição sem Planilha Mestre

Executar só depois do aceite de C1.

```text
MODO EXECUÇÃO CONTROLADA — C2.

Objetivo: retirar Planilha Mestre e SKU legado como fonte/gate de preço do fluxo contratual atual; preservar a condição particular aprovada do caso e a rastreabilidade de sua origem.

Não criar produto, SKU, preço, exceção comercial, link de pagamento, cobrança, Asaas, migration, documento, PR, merge ou deploy.

Ler antes de editar:
- `src/lib/precos-sku.ts`
- `src/lib/preco-canonico.ts`
- `src/lib/regra-comercial.functions.ts`
- `src/lib/anexos-i-v.ts`
- `src/components/contrato/regra-comercial.tsx`
- `src/lib/resgate-contrato-planejador.ts`

Implementar só no caminho de contrato atual:
1. condição particular aprovada do caso/proposta é a fonte de leitura;
2. nenhuma referência à Planilha Mestre ou SKU legado aparece como fonte oficial ou bloqueio;
3. ausência de condição particular mostra estado honesto e impede apenas a formalização financeira, não cria preço nem consulta planilha;
4. histórico e referências legadas permanecem leitura/auditoria.

Provar types, testes focados, build, diff e que não houve escrita externa. Pare.
```

## C3 — Planejador e jornada sem derivação pelo SKU

Executar só depois do aceite de C2.

```text
MODO EXECUÇÃO CONTROLADA — C3.

Objetivo: Planejador e `case_plans` governam país/rota, marco, cadência, responsável e microentrega; SKU legado não deriva produto-pai nem bloqueia a jornada.

Não criar jornada, produto-pai, país, tarefa, migration, dado demo, PR, merge ou deploy.

Ler antes de editar:
- `src/lib/jornada-planejador.server.ts`
- `src/lib/sku-produto-pai.ts`
- `src/lib/planejador-produtos-pai.ts`
- `src/lib/motor-cidadania.functions.ts`
- testes de jornada e Planejador relacionados.

Implementar a alteração mínima: ler produto-pai do `case_plans`; não usar SKU como fallback decisório. Se o plano estiver incompleto, declarar estado honesto e ação contextual, sem inventar PP-02/PP-03. Preservar case_id, histórico, cadência, responsáveis e microentregas.

Provar types, testes focados, build e roteiro de F5. Pare.
```

## Provas obrigatórias após C1–C3

- Cada corte traz SHA da branch, diff e comandos executados.
- Não chamar decisão comercial a divergência herdada de SKU.
- Não apagar snapshots e CRM/OPS históricos.
- Não tratar nome `ops` como critério de remoção; preservar tarefas, microentregas, onboarding e permissões que possuam consumidores reais.
- Para o caso da Ana, validar em sessão autenticada antes de afirmar que contrato, assinatura ou cobrança estão liberados.
