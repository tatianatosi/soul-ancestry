# Roteiro local — executar C1 com Claude Code

Status: aprovado
Versão: v1.0
Data: 2026-10-10
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: `docs/prompts/2026-10-10-claude-lovable-execucao-legados.md`; política e auditoria aprovadas em 08/10.
Escopo: executar C1 localmente em branch isolada.
Limites: sem main, merge, deploy, Supabase, migration, assinatura, cobrança, mensagem ou publicação.
Critério de aceite: branch, SHA, diff, tsc, testes focados, build e declaração de limites respeitados.

## Pré-requisitos

- Git configurado e acesso ao repositório privado `tatianatosi/soul-ancestry`.
- Node e o gerenciador de pacotes definido pelo repositório.
- Claude Code instalado e autenticado. A documentação oficial orienta iniciar Claude Code dentro da pasta do projeto com `claude`.

## Comandos de terminal

```bash
# 1. Clone uma única vez. Se já existe uma cópia local, pule para o passo 2.
git clone git@github.com:tatianatosi/soul-ancestry.git
cd soul-ancestry

# 2. Atualize referências e crie/troque para a branch C1.
git fetch origin

git switch main
git pull --ff-only origin main

git switch -c c1-contrato-sem-fallback-sku origin/main

# Se a branch já existir localmente:
# git switch c1-contrato-sem-fallback-sku
# git rebase origin/main

# 3. Confirme que o diretório está limpo e a branch é a correta.
git status --short --branch
git log -1 --oneline

# 4. Instale dependências conforme o lockfile existente.
# Preferir pnpm quando houver pnpm-lock.yaml; usar npm somente se o projeto já usar package-lock.json.
pnpm install --frozen-lockfile

# 5. Abra Claude Code interativo dentro da raiz do repositório.
claude
```

## Texto para colar no Claude

Cole integralmente o prompt C1 em `docs/prompts/2026-10-10-claude-lovable-execucao-legados.md`, seção "Prompt para Claude". Não acrescente pedidos paralelos.

## Depois da resposta do Claude

O Claude deve ter modificado somente o corte C1 e devolvido provas. Antes de qualquer commit, confira:

```bash
git status --short
git diff --stat
git diff -- src/lib/conciliacao-catalogo.server.ts src/lib/conciliacao-catalogo.ts src/lib/contratos.functions.ts src/lib/resgate-contrato-planejador.ts
git diff -- src/lib/__tests__
```

Só aceite continuar se ele trouxer saídas reais para:

```bash
npx tsc --noEmit
# Executar apenas os testes focados que o Claude alterou.
npx vite build
```

## Commit local após sua revisão

Não peça ao Claude merge, PR ou deploy. Depois de revisar manualmente o diff e as provas:

```bash
git add <somente-os-arquivos-revisados>
git commit -m "fix(contrato): remover fallback de SKU do caminho governado"
git push -u origin c1-contrato-sem-fallback-sku
```

Abra um PR separado para `main`. Não faça merge até sua revisão e aceite explícitos.

## Parada obrigatória

Pare e não faça commit se ocorrer qualquer um dos itens:

- necessidade de migration, RLS ou mudança no Supabase;
- alteração de preço, condição, proposta, contrato, partes ou anexos;
- criação de dado demo, rota nova ou refatoração ampla;
- ausência de testes/build ou mudança além do limite do C1.
