# Protocolo de Desbloqueio e Sincronização Bidirecional: Lovable e Claude Code

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 16:15 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: governança de integração Git, resolução de conflitos de sincronização e CI
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-protocolo-sincronizacao-lovable-claude.md
fontes:
  - Repositório tatianatosi/soul-ancestry (main)
  - Commits Lovable: 0befe79, 98cc3e9, 41ad658, d9b09f3
  - Commits Claude: ac5fa10, ac14b05, 31c05ad8
  - AGENTS.md (Regras de Convivência e Não-Regressão)
escopo: >
  Diagnóstico da causa do bloqueio de push/pull entre o Lovable e o Claude Code,
  definição da fronteira de arquivos de cada ferramenta e regras para evitar sobrescritas.
premissas:
  - O Lovable é a autoridade visual de frontend (src/components/portal, src/routes/portal, styles).
  - O Claude Code é a autoridade de backend e testes (src/lib/server-functions, src/integrations, tests).
  - A branch main é o ponto único de verdade.
criterio_de_aceite: >
  Instruções claras para o Claude Code aceitar commits do bot do Lovable (gpt-engineer-app[bot]);
  instruções para o Lovable sincronizar a branch antes de disparar push;
  eliminação de conflitos de rebase/pull no repositório.
```

## 1. Diagnóstico do Bloqueio entre Lovable e Claude Code

A verificação do log do Git em `main` revela a dinâmica que gerou o travamento:
1. **Pushes Concorrentes no Main**:
   - O bot do Lovable (`gpt-engineer-app[bot]`) enviou commits diretamente ao `main` (`0befe79` e `98cc3e9` - *"Publicou site com resiliência"*, tocando em `roadmap.md` e metadados).
   - Quase simultaneamente, PRs do Claude Code (#144, #145) foram mescladas no `main`.
2. **Causa da Rejeição pelo Claude Code**:
   - O Claude Code em ambiente local trabalha com uma branch desatualizada ou com hooks rigorosos de CI (`bun run test` e `typecheck`) configurados no `AGENTS.md`.
   - Quando o Claude tenta dar `git pull` ou `git rebase` em uma branch de trabalho, o Git alerta sobre diverged branches (*non-fast-forward*), fazendo o Claude recusar o merge para proteger o repositório contra regressões.

---

## 2. Divisão Normativa de Fronteiras de Arquivos

Para que o Lovable consiga fazer push e o Claude Code aceite as alterações sem conflito, fica estabelecida a **separação de autoridade**:

```
┌──────────────────────────────────────────────────┐      ┌──────────────────────────────────────────────────┐
│           TERRITÓRIO LOVABLE (Frontend)          │      │           TERRITÓRIO CLAUDE (Backend/CI)         │
├──────────────────────────────────────────────────┤      ├──────────────────────────────────────────────────┤
│ • src/routes/portal/* (Telas do App Cliente)     │      │ • src/lib/server-functions/* (Funções de servidor)│
│ • src/components/portal/* (Componentes do App)   │      │ • src/integrations/supabase/* (Types e conexões) │
│ • src/styles.css e tokens visuais                │      │ • src/lib/__tests__/* (Suíte de 5.384 testes)   │
│ • roadmap.md e documentação de rascunho          │      │ • docs/politicas, docs/arquitetura, docs/prompts │
└──────────────────────────────────────────────────┘      └──────────────────────────────────────────────────┘
```

---

## 3. Comandos de Destravamento

### Para o Claude Code (Terminal): Aceitar e Incorporar o Lovable
O Claude deve rodar no terminal um pull com estratégia de rebase/merge que reconheça o bot do Lovable:
```bash
git checkout main
git fetch origin
git pull --rebase origin main
bunx tsc --noEmit
bun run test
```
*Se houver divergência em `roadmap.md` ou arquivos de documentação, aceitar a versão vinda do Lovable (`--ours`/`--theirs` a favor do Lovable para docs visuais).*

### Para o Lovable: Sincronização Pré-Push
No Lovable, antes de disparar o push/deploy:
- O Lovable deve sincronizar com o GitHub puxando as novidades do `main` (especialmente as novas server functions e testes mesclados nas PRs #144 e #145).
- Tocar exclusivamente em arquivos de componentes e rotas da sua pasta (`src/components/portal` e `src/routes/portal`).
