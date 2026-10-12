# Relatório Diário de Fechamento Operacional e Prontidão de Execução

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatório diário de governança, prontidão financeira e consolidação de produto
caminho_sugerido_no_repositorio: docs/relatorios/2026-10-12-fechamento-operacional-e-prontidao.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main)
  - PRs #142, #140, #139, #138
  - Asaas Painel de Assinaturas (resgate/04_asaas_dre_operacao.md)
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
  - docs/arquitetura/2026-10-12-decisao-representacao-menor-felipe.md
escopo: >
  Consolidação das frentes técnicas, financeiras e de produto para a tarde de 12/10/2026.
  Organização da esteira P0 do caso piloto Ana Luiza, scraping pontual de pesquisa e merges no GitHub.
premissas:
  - O Caso Piloto da Ana Luiza possui 3 assinaturas ativas de R$ 320/mês no Asaas.
  - Felipe Silveira Rodrigues é menor representado e não recebe convite próprio.
  - O Desk opera estritamente nos 6 setores canônicos (SETORES_DESK_V5).
criterio_de_aceite: >
  Instruções claras para ingestão dos IDs do Asaas na tabela public.invoices;
  roteiro de scraping pontual (Issue #133);
  ordem de merges das PRs #139 e #140 sem regressão de CI.
```

## 1. Sumário Executivo

Na manhã e início de tarde de 12 de outubro de 2026, o Clube Ancestral atingiu a estabilização completa de sua governança de engenharia:
1. **Contratos e Arquitetura**: A PR #138 foi mesclada em `main`, consolidando a autoridade de `SETORES_DESK_V5` (6 setores vigentes) no `AGENTS.md`.
2. **Blindagem do Código**: As PRs #139 (tipagem estrita de calls e estabilização de hooks) e #140 (sanitização de wildcards no `ilike`) foram preparadas com 5.384 testes verdes.
3. **Representação do Menor**: Decisão normativa aprovada proibindo migrations desnecessárias e protegendo a integridade jurídica do menor Felipe via derivação lógica no backend.

---

## 2. Ações Prioritárias da Tarde (Blocos A, B e C)

### Bloco A: Financeiro e Ativação do Piloto Ana Luiza (Prioridade P0)
- **Ingestão dos IDs do Asaas**:
  - Com os 3 IDs gerados no Asaas (`sub_...` ou identificadores das faturas de Ana Luiza, Adair e Alice), alimentar a tabela `public.invoices` associando-os ao `case_id` `a11a0000-0000-4000-8000-000000000002`.
  - Campos a preencher: `case_id`, `client_id`, `asaas_subscription_id`, `valor: 320.00`, `status: pending/paid`, `parcelas_total: 10`.
- **Formalização do Estudo v2 (`2026-CB-0001`)**:
  - Assinatura digital via Gov.br / ZapSign com os 3 titulares adultos (Ana Luiza assina por si e pelo menor Felipe).
- **Virada de Chave no Supabase**:
  - Confirmado o primeiro pagamento e assinatura, atualizar em `crm_casos`:
    - `contrato_assinado = true`
    - `pagamento_confirmado = true`
    - `status = 'em_andamento'`

### Bloco B: Inteligência Multipaís e Pesquisa Pontual (Issue #133)
- **Dumps de WhatsApp**:
  - Processamento via `ca-client-go-live` dos dados já coletados dos casos de Itália (Giovanna Prade e João Marcelo) e Croácia (Danilo Croácia / Núcleo Ivan Klujber).
- **Serviço de Scraping Pontual (`Issue #133`)**:
  - Submeter no Desk a interface de `[Captura Rápida de Evidência]` em **Pesquisa & Intelligence -> Acervo**, permitindo ingestão rápida de certidões do FamilySearch, APESP e Portale Antenati.

### Bloco C: GitHub & CI (Claude Code)
- **Merges Aprovados**:
  - Retirar do modo Draft e mesclar as PRs #139 e #140 no `main`.
- **Restauração do CI**:
  - Aplicar a atualização da asserção em `radar-reconciliado-6-app-4-desk-2026-10-03.test.ts:154` via branch isolada `fix/test-radar-seis-eixos-assertion`.
- **Limpeza de Fila**:
  - Fechar formalmente sem merge as PRs legadas #119 e #123.

---

## 3. Matriz de Execução do Dia

| Frente | Responsável | Ação Crítica | Dependência |
|---|---|---|---|
| **Financeiro** | Tatiana | Fornecer os 3 IDs do Asaas para inserção em `invoices` | Nenhuma |
| **Backend** | Claude Code | Merge das PRs #139 e #140; correção de teste do radar | Autorização dada |
| **Frontend** | Lovable | Expurgo de mocks da Home e régua de 10 etapas | Estabilidade do main |
| **Pesquisa** | Operação | Varredura de dumps de Itália e Croácia | Extrator ca-client-go-live |
