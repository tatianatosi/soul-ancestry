# Decisão Normativa: Escolha de Execução do Prompt v3.0 (Três Perfis) e Desbloqueio da PR #144

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 14:30 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: decisão de governança, permissão de execução e homologação de PR
caminho_sugerido_no_repositorio: docs/prompts/2026-10-12-decisao-execucao-prompt-v3.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main)
  - PR #144 (head ce73f5f)
  - docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md
  - docs/arquitetura/2026-10-12-homologacao-pr144-regra-dependentes.md
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
escopo: >
  Resolução sobre a escolha apresentada pelo Claude Code para o Prompt v3.0 (três perfis da família Silveira)
  e autorização formal para o merge da PR #144 com a blindagem de reenvio concluída.
premissas:
  - Escolha combinada 1 + 3 (modo somente-leitura e levantamento em P0).
  - Escrita em produção, envio de convites ou cobranças reais permanecem bloqueados até autorização explícita da dona.
  - A PR #144 já possui CI verde e fecha a lacuna de representação do menor Felipe.
criterio_de_aceite: >
  Salvamento de docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md no main;
  execução da etapa P0 exclusivamente em modo somente-leitura;
  merge imediato da PR #144 no main.
```

## 1. Decisão da Proprietária sobre o Prompt v3.0

Em resposta à consulta do Claude Code, a Proprietária determina a **opção combinada (1 + 3 em Modo Leitura)**:

### 1.1. Ação 1: Salvar o Prompt no Repositório
- **Comando**: Salvar o arquivo em `docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md` exatamente como especificado.
- **Status do Documento**: Manter o status formal de rastreabilidade.

### 1.2. Ação 3: Executar a Etapa P0 (Somente Leitura e Levantamento)
- **Escopo Autorizado**:
  - Conferir a integridade da branch e levantar os dados existentes dos 3 perfis da família Silveira:
    1. **Ana Luiza Gomes Silveira Rodrigues** (Titular Âncora, representante do menor Felipe).
    2. **Adair Pinto Silveira Júnior** (Pai, Requerente adulto).
    3. **Alice Gomes Silveira** (Irmã, Requerente adulta).
- **Limites e Travas Rígidas**:
  - **PROIBIDO**: Criar ou alterar registros em `clientes`, disparar convites, gerar cobranças no Asaas ou assinar contratos. A etapa P0 é estritamente analítica e preparatória.

---

## 2. Desbloqueio e Merge da PR #144

- **Status da PR #144**: O commit `ce73f5f` concluiu a extensão da blindagem para `reenviarConvitePortal` e os testes de regressão estão 100% verdes (10/10 no caso Felipe).
- **Autorização Formal**: **APROVADO O MERGE NO MAIN**.
- **Instrução**: Aplicar o merge da PR #144 no `main` imediatamente.

---

## 3. Mensagem Pronta para o Claude Code

```markdown
RESPOSTA NORMATIVA: ESCOLHA 1 + 3 (P0 SOMENTE LEITURA) E MERGE DA PR #144
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Repositório: tatianatosi/soul-ancestry

Decisões da Proprietária:

1. [ESCOLHA DO PROMPT v3.0]:
   - Opção 1: Salve o documento em `docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md`.
   - Opção 3: Execute a etapa P0 em modo SOMENTE LEITURA. Faça a conferência de branch e o levantamento cadastral dos perfis de Ana Luiza, Adair e Alice.
   - TRAVA: Nenhuma gravação em banco, disparo de convite ou ato formal sem aprovação posterior.

2. [MERGE DA PR #144 AUTORIZADO]:
   - O CI do head ce73f5f foi homologado.
   - Aplique o MERGE da PR #144 no `main` agora.
   - Retorne o SHA resultante do main.
```
