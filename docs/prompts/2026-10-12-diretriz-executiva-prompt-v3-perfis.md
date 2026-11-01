# Diretriz Executiva: Resposta ao Claude Code sobre Prompt v3.0 e Levantamento dos Três Perfis

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 14:55 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: diretriz de execução, governança de dados e levantamento cadastral
caminho_sugerido_no_repositorio: docs/prompts/2026-10-12-diretriz-executiva-prompt-v3-perfis.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main)
  - Commit ac14b05 (PR #144 mesclada com sucesso)
  - docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
  - docs/arquitetura/2026-10-12-decisao-execucao-prompt-v3.md
escopo: >
  Diretriz formal e instruções para o Claude Code sobre a opção combinada (1 + 3 em modo leitura),
  levantamento analítico dos três perfis familiares (Ana Luiza, Adair, Alice)
  e manutenção das travas de escrita em produção.
premissas:
  - A PR #144 já está mesclada no main (commit ac14b05).
  - A execução de P0 é estritamente em modo SOMENTE LEITURA.
  - Zero gravações, zero convites, zero cobranças desautorizadas.
criterio_de_aceite: >
  Salvamento de docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md;
  devolução do inventário de leitura dos dados existentes dos três perfis;
  confirmação de integridade do branch main.
```

## 1. Escolha Vinculante da Proprietária

Em resposta às três opções apresentadas pelo Claude Code sobre o **Prompt v3.0**, a Proprietária determina a **opção combinada (1 + 3 em Modo Leitura)**:

1. **Opção 1**: Salvar o arquivo canônico em `docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md`.
2. **Opção 3**: Executar a etapa **P0 exclusivamente em modo somente-leitura**.
   - Conferir o branch `main` atualizado (que já recebeu a PR #144 via commit `ac14b05`).
   - Fazer o levantamento analítico dos registros existentes no Supabase para os três perfis da família Silveira:
     - **Ana Luiza Gomes Silveira Rodrigues** (Titular Âncora, representante legal do menor Felipe).
     - **Adair Pinto Silveira Júnior** (Pai, Requerente).
     - **Alice Gomes Silveira** (Irmã, Requerente).
   - Devolver o quadro comparativo de campos civis (CPF, e-mail, telefone, vínculo com o caso e estado em `case_members`/`clientes`).

---

## 2. Travas Rígidas de Governança

- **PROIBIDO** nesta etapa:
  - Gravar ou alterar dados em tabelas de produção (`clientes`, `case_members`, `crm_casos`).
  - Disparar convites ou magic links para qualquer um dos perfis.
  - Emitir cobranças ou alterar status financeiro.
  - Criar migrações de banco.
- Toda e qualquer etapa posterior de escrita (P1, P2) dependerá de aprovação explícita e individualizada da Proprietária.

---

## 3. Mensagem Formatada para o Claude Code

```markdown
RESPOSTA NORMATIVA: PROMPT v3.0 (OPÇÃO 1 + 3 EM MODO LEITURA) E PR #144
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Repositório: tatianatosi/soul-ancestry | Head main: ac14b05

Decisões da Proprietária:

1. [PR #144 MESCLADA]:
   - A PR #144 já foi aprovada e mesclada no main com sucesso (commit ac14b05).
   - Dê `git checkout main && git pull origin main` para sincronizar seu ambiente local.

2. [ESCOLHA DO PROMPT v3.0: OPÇÃO 1 + 3 (P0 SOMENTE LEITURA)]:
   - Ação 1: Salve o documento em `docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md`.
   - Ação 3: Execute a etapa P0 em modo SOMENTE LEITURA:
     * Faça a conferência de branch no main atualizado.
     * Faça o levantamento analítico dos dados existentes no banco para os 3 perfis:
       1. Ana Luiza Gomes Silveira Rodrigues (Titular Âncora, representante do menor Felipe).
       2. Adair Pinto Silveira Júnior (Pai, Requerente adulto).
       3. Alice Gomes Silveira (Irmã, Requerente adulta).
     * Devolva o inventário com: ID, e-mail, telefone, vínculo familiar registrado e se há credencial/convite pendente.

3. [TRAVAS OBRIGATÓRIAS]:
   - Não grave em banco.
   - Não dispare e-mails, convites ou cobranças.
   - Não crie migrations.

Retorne o inventário dos três perfis para revisão da Proprietária.
```
