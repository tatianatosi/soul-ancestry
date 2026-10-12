# Decisão Normativa: Homologação da PR #144, Ajustes de Exceção e Regra Geral para Dependentes

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: decisão de arquitetura, segurança de dados e governança de permissões
caminho_sugerido_no_repositorio: docs/arquitetura/2026-10-12-homologacao-pr144-regra-dependentes.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main)
  - PR #144 (fix(portal): impedir emissão de convite para dependentes sob representação legal)
  - Head commit 5dc8587 (CI verde: typecheck-and-test e label)
  - src/lib/__tests__/corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts (10/10 testes passando)
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
escopo: >
  Homologação das alterações implementadas na PR #144 pelo Claude Code,
  aprovação dos dois desvios técnicos fundamentados e definição da regra canônica
  para dependentes do caso (com ou sem representação registrada) no fluxo de convites.
premissas:
  - Dependente em núcleo familiar é beneficiário processual, não operador do App.
  - O App Cliente é contratado e gerido pelos Titulares Requerentes adultos.
  - Fail-closed: na dúvida ou ausência de maioridade comprovada, o convite não é disparado.
criterio_de_aceite: >
  Aceite formal do lançamento de Error em vez de { ok: false };
  aceite dos status documentada/confirmada;
  diretriz clara para fechar a lacuna de reenvio e menores sem cadastro completo;
  autorização para retirar PR #144 de draft e mesclar em main.
```

## 1. Homologação das Alterações Técnicas da PR #144

A Proprietária do Clube Ancestral aprova integralmente as duas decisões técnicas tomadas pelo Claude Code na PR #144:

### 1.1. Lançamento de Exceção (`throw new Error`) em vez de `{ ok: false }`
- **Decisão**: **APROVADO**.
- **Justificativa**: A UI do Desk trata chamadas via React Query disparando o toast de "Convite criado" em `onSuccess`. O retorno silencioso de `{ ok: false }` enganaria a operação interna, gerando falsa confirmação de disparo. O lançamento de `Error` com a mensagem amigável é a conduta correta de segurança (*fail-closed*), capturada pelo bloco `onError` da interface.

### 1.2. Lista de Status Ativos (`documentada` e `confirmada`)
- **Decisão**: **APROVADO**.
- **Justificativa**: O alinhamento com a semântica já validada no teste de regressão (`corte-c-felipe-representacao-reconciliada-2026-10-07.test.ts`) confere coerência e consistência às 10 asserções automatizadas.

---

## 2. Resolução das Três Lacunas Apontadas

### Lacuna 1: Regra para Dependente Sem Representação Registrada (Decisão Principal)
- **Pergunta**: Bloquear todo dependente do caso sem acesso ao app ou esperar a representação ser registrada?
- **Decisão Normativa**: **BLOQUEAR TODO DEPENDENTE CADASTRADO NO NÚCLEO**.
- **Fundamento Jurídico e de Produto**:
  - No Clube Ancestral, a entidade `dependente` (registrada em `case_dependents` ou no núcleo familiar com papel de dependente/menor) **nunca é contratante e não opera a conta**.
  - O titular responsável (no caso piloto, Ana Luiza) responde por todos os dependentes de sua linhagem.
  - **Regra Canônica**: Qualquer registro existente em `case_dependents` vinculado àquele caso **está bloqueado para emissão de convite do portal**, independentemente de o cartório já ter emitido ou não a certidão de tutela/guarda. A condição de dependente por si só exclui credencial direta de acesso ao app.

### Lacuna 2: Blindagem no `reenviarConvitePortal`
- **Decisão Normativa**: **APLICAR O MESMO BLOQUEIO**.
- **Instrução**: Reutilizar a função helper `representacaoLegalAtiva` dentro de `reenviarConvitePortal` em `portal.functions.ts`. Se o convite original pertencia a um dependente (ou se o status mudou), o reenvio deve falhar fechado com a mesma mensagem de bloqueio.

### Lacuna 3: Cruzamento Confiável
- **Decisão Normativa**: Manter o cruzamento seguro por `case_id` + normalização de nome (`trim().toLowerCase()`) já adotado na PR #144, complementado pelo `cliente_id` em `nucleo_membros` onde existir. Zero migrações no banco.

---

## 3. Instrução de Liberação para o Claude Code

```markdown
RESPOSTA NORMATIVA: HOMOLOGAÇÃO DA PR #144 E EXTENSÃO PARA REENVIO
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Repositório: tatianatosi/soul-ancestry | PR: #144

Decisões da Proprietária:

1. [DESVIOS APROVADOS]:
   - Aprovado o lançamento de `throw new Error` para acionar onError no React Query.
   - Aprovada a regra de status (`documentada` e `confirmada`).

2. [REGRA GERAL PARA DEPENDENTES]:
   - Regra: Todo dependente vinculado a `case_dependents` NÃO recebe acesso ao app. O acesso é exclusivo do titular responsável.
   - Não esperar registro formal de representação: se é dependente no caso, o convite não sai.

3. [AJUSTE NO REENVIO]:
   - Adicione a mesma checagem em `reenviarConvitePortal`.

4. [MERGE AUTORIZADO]:
   - Atualize a branch da PR #144 com a blindagem de reenvio.
   - Retire a PR #144 de Draft.
   - Faça o MERGE no main.

Retorne a confirmação do merge no main.
```
