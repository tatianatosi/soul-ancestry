# Decisão Normativa: Representação do Menor Felipe e Blindagem de Convites no Portal

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: decisão de arquitetura, segurança de dados e governança de permissões
caminho_sugerido_no_repositorio: docs/arquitetura/2026-10-12-decisao-representacao-menor-felipe.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main)
  - src/lib/__tests__/corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts
  - src/lib/server-functions/portal.functions.ts (criarConvitePortal:520)
  - src/integrations/supabase/types.ts (case_dependents, nucleo_membros)
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
escopo: >
  Resolução normativa sobre as 3 perguntas do Claude Code acerca da representação legal
  do menor Felipe Silveira Rodrigues, blindagem do fluxo de convites do Portal
  e proibição estrita de migrações não autorizadas.
premissas:
  - Felipe Silveira Rodrigues é menor de idade (dependente representado pela mãe Ana Luiza).
  - Felipe NÃO recebe login, e-mail próprio, cobrança ou convite para o App Cliente.
  - A representação legal é exercida exclusivamente por Ana Luiza Gomes Silveira Rodrigues.
  - Obediência estrita ao AGENTS.md: zero migrations sem necessidade comprovada; zero CHECK novo.
criterio_de_aceite: >
  Bloqueio no backend de convites do portal para dependentes representados em case_dependents;
  preservação da integridade do schema sem colunas inventadas;
  manutenção dos testes de regressão do caso Felipe 100% verdes.
```

## 1. Respostas Vinculantes às 3 Perguntas do Claude Code

Em resposta à consulta formulada pelo Claude Code sobre a representação do menor e a checagem em `portal.functions.ts:520`:

### Decisão 1: Bloqueio Cirúrgico de Convite para Menores/Dependentes em `criarConvitePortal`
- **Autorização**: **SIM, AUTORIZADO DE FORMA CIRÚRGICA**.
- **Como implementar SEM quebra de schema**:
  - Em `src/lib/server-functions/portal.functions.ts`, dentro da função `criarConvitePortal`, adicionar uma checagem que consulta a tabela `case_dependents` (ou `nucleo_membros` onde `representacao_necessaria = true`).
  - Se a pessoa vinculada ao convite estiver registrada como dependente que requer representação (`status_representacao` preenchido ou `representacao_necessaria = true` no núcleo do caso), o backend deve **recusar o envio do convite** e retornar `{ ok: false, erro: "Menores e dependentes sob representação não possuem credencial própria de acesso ao portal." }`.
  - **Não é necessário cruzar com `research_people`**: A autoridade civil do caso está em `case_dependents` e `nucleo_membros`.

### Decisão 2: Criação de Migration para `representante_id`
- **Autorização**: **NÃO AUTORIZADO. ZERO MIGRATIONS**.
- **Motivo e Diretriz**:
  - O sistema já funciona com estabilidade e possui o teste `corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts` passando (7 de 7) baseado exclusivamente em `case_dependents.status_representacao` e `nucleo_membros.representacao_necessaria`.
  - Criar `representante_id` via migration violaria a regra de ouro do `AGENTS.md` e colocaria em risco a estabilidade do schema ativo. A mãe já é a titular âncora do caso (`crm_casos.cliente_id`), sendo a representante jurídica natural do menor em todas as instâncias.

### Decisão 3: Criação da flag `requer_credencial_portal`
- **Autorização**: **DERIVAR EM TEMPO DE EXECUÇÃO (SEM COLUNA NOVA)**.
- **Como implementar**:
  - `requer_credencial_portal` **deve ser uma propriedade calculada/derivada** em memória/TypeScript, nunca uma coluna física no banco de dados.
  - Regra lógica:
    ```typescript
    const requerCredencialPortal = !(membro.representacao_necessaria || membro.status_representacao);
    ```
  - Adultos titulares requerem credencial (`true`). Dependentes e menores sob representação recebem `false`.

---

## 2. Instrução Normativa Pronta para o Claude Code

```markdown
RESPOSTA NORMATIVA: REPRESENTAÇÃO DO MENOR E BLINDAGEM DE CONVITES
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Repositório: tatianatosi/soul-ancestry | Branch: fix/blindagem-convite-menor-portal

Decisões da Proprietária sobre suas 3 perguntas:

1. [CHECAGEM EM criarConvitePortal: AUTORIZADA]
   - Em `src/lib/server-functions/portal.functions.ts:520`:
   - Adicione verificação antes de disparar o convite: verifique se o membro consta em `case_dependents` com representação ativa ou em `nucleo_membros` com `representacao_necessaria = true`.
   - Se for dependente representado, bloqueie e retorne erro amigável: "Menores e dependentes sob representação legal não possuem credencial própria; o acesso é realizado pelo titular responsável."
   - Não invente cruzamentos com research_people.

2. [MIGRATION PARA representante_id: PROIBIDA]
   - Mantenha a regra de AGENTS.md intacta: ZERO migrations.
   - A representação continua exatamente como validada no teste `corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts` (lendo `case_dependents.status_representacao` e `nucleo_membros.representacao_necessaria`).

3. [requer_credencial_portal: CALCULAR EM CÓDIGO]
   - Não crie coluna física no banco.
   - Derive a propriedade em TypeScript: false se for dependente com representação ativa; true para titulares adultos.

Validação:
- Execute `bun test` e confirme que `corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts` continua passando 7/7.
- Sem novas colunas, sem quebra de types.
```
