# Parecer Técnico: Auditoria de Pipelines de Migração Legada Placego e Backfill

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:59 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: auditoria de pipelines de dados, saneamento de imports legados e gestao de risco
caminho_no_repositorio: docs/auditorias/2026-10-12-auditoria-pipelines-migracao-placego.md
fontes:
  - src/lib/migracao.functions.ts (Linhas 78-221)
  - src/lib/onboarding-gate-backfill.functions.ts (Linhas 61-89)
  - scripts/aceite-operacional-e2e.py
escopo: >
  Avaliação de risco e classificação operacional dos achados de pipelines de dados:
  importação do legado Placego e backfill de motivos_bloqueio em case_plans,
  determinando o impacto no Go-Live imediato e o plano de mitigação pós-lançamento.
premissas:
  - O repositório não utiliza pipelines de ciência de dados (sem pandas/numpy/treinamento).
  - A importação do legado Placego é uma rotina de carga histórica, não de operação viva da Ana Luiza.
criterio_de_aceite: >
  Isolamento do risco: confirmação de que falhas na migração Placego não afetam o App Cliente da Ana Luiza;
  proposta de patch seguro para os itens 1, 2 e 5 em lote futuro.
```

---

## 1. Veredito Executivo de Impacto no Go-Live

Os 6 apontamentos identificados na rotina de importação do Placego (`migracao.functions.ts`) são **dívidas técnicas de ferramentas administrativas de carga histórica**:
- **Impacto no Caso Ana Luiza e Faturamento de Amanhã:** **ZERO**. O caso piloto `CA-CID-AT-FAM-2026-001` já foi cadastrado, reconciliado e opera via dados nativos no Supabase e fallbacks canônicos, sem qualquer dependência da rotina de importação de CSV do Placego.
- **Congelamento Mantido:** Nenhuma alteração invasiva deve ser feita nessas funções nesta noite para evitar quebra transitória de testes antes do go-live.

---

## 2. Análise Técnica dos Achados de Migração

| Item | Gravidade | Descrição Técnica | Mitigação Proposta (Pós-Go-Live) |
|---|---|---|---|
| **1** | `[HIGH]` | Inserts em `migration_exceptions` sem verificação de `error`. | Capturar o `error` da promise do Supabase e empilhar no vetor `erros[]` para registro em `error_log`. |
| **2** | `[HIGH]` | Insert em `conversion_events` sem verificação de `error`. | Adicionar `await` com validação de erro antes de incrementar métricas de conversão. |
| **3** | `[MEDIUM]` | Reexecução sem checkpoint por linha. | Utilizar `upsert` baseado no `legacy_record_id` para garantir idempotência em reexecuções. |
| **4** | `[MEDIUM]` | Chamadas N+1 em série por linha do CSV. | Substituir inserts sequenciais por chamadas em lote (`insert([...])`) de até 100 registros. |
| **5** | `[LOW]` | Incremento `atualizados += 1` antes do vínculo. | Mover o incremento para após a confirmação de sucesso do vínculo. |
| **6** | `[LOW]` | `lista.find` dentro de laço O(n²) no backfill. | Indexar a lista em um `Map` chaveado por ID antes de iterar. |

---

## 3. Plano de Encaminhamento

1. **Para Amanhã de Manhã (Foco Comercial):**
   - Não rodar a importação de CSVs do Placego.
   - Manter o foco estrito no fechamento comercial da Ana Luiza (emissão no Asaas, assinatura Gov.br e acesso ao App).
2. **Para a Sprint de Saneamento de Dados (Pós-Lançamento):**
   - Quando você autorizar a abertura de commits de backend, aplicaremos a correção dos itens 1, 2 e 5 de uma só vez, com testes de regressão automatizados.
