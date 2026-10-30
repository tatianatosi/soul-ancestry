#!/usr/bin/env bash
# Verificação local de sincronização. SOMENTE LEITURA.
# Não faz checkout, switch, stash, add, commit, push, merge, rebase, publish nem deploy.
# Uso:  scripts/sync-check.sh          (verifica estado Git)
#       scripts/sync-check.sh --full   (também roda typecheck, test e build)
set -u
FULL=0
[ "${1:-}" = "--full" ] && FULL=1
PROBLEMAS=0
ok()   { echo "OK     $*"; }
aviso(){ echo "AVISO  $*"; }
erro() { echo "ERRO   $*"; PROBLEMAS=$((PROBLEMAS+1)); }

git rev-parse --git-dir >/dev/null 2>&1 || { echo "ERRO: execute dentro do repositório."; exit 2; }
git fetch origin --prune --quiet || { echo "ERRO: git fetch falhou."; exit 2; }

BR=$(git branch --show-current)
HEAD_SHA=$(git rev-parse --short HEAD)
echo "Branch: ${BR:-HEAD destacado}   HEAD: $HEAD_SHA   origin/main: $(git rev-parse --short origin/main)"

[ -z "$BR" ] && erro "HEAD destacado."
case "$BR" in main|master) aviso "Você está na $BR. Trabalhe em branch claude/* ou fix/*.";; esac

if git merge-base origin/main HEAD >/dev/null 2>&1; then
  read BEHIND AHEAD < <(git rev-list --left-right --count origin/main...HEAD)
  [ "$BEHIND" -gt 0 ] && aviso "Branch $BEHIND commit(s) atrás da main. Faça: git merge origin/main (merge commit, sem rebase)." || ok "Branch em dia com a main."
  echo "       À frente da main: $AHEAD commit(s)."
  BASE=$(git merge-base origin/main HEAD)
  CHANGED=$(git diff --name-only "$BASE" HEAD)
  N=$(printf '%s\n' "$CHANGED" | grep -c . || true)
  [ "$N" -gt 60 ] && aviso "$N arquivos alterados. Divida em PRs menores." || ok "$N arquivo(s) alterado(s) desde a main."
  BAD=$(printf '%s\n' "$CHANGED" | grep -E '^(supabase/migrations|drizzle/migrations)/' || true)
  [ -n "$BAD" ] && { erro "Alteração em migrations (proibido para agentes):"; echo "$BAD"; }
else
  erro "Sem ancestral comum com origin/main (histórias independentes). Não abra PR desta branch; recrie a partir de origin/main."
fi

U=$(git diff --name-only --diff-filter=U)
[ -n "$U" ] && { erro "Arquivos com conflito não resolvido:"; echo "$U"; } || ok "Sem conflitos pendentes."
[ -f "$(git rev-parse --git-dir)/MERGE_HEAD" ] && aviso "Merge em andamento (ainda sem commit)."

MARK=$(git grep -nE '^(<<<<<<<|>>>>>>>) ' -- 'src' 'supabase' 2>/dev/null | head -5)
[ -n "$MARK" ] && { erro "Marcadores de conflito no código:"; echo "$MARK"; } || ok "Sem marcadores de conflito."

ENVF=$(git ls-files | grep -E '(^|/)\.env(\..*)?$' | grep -v '\.env\.example$' || true)
[ -n "$ENVF" ] && { erro ".env versionado (rotacione chaves expostas):"; echo "$ENVF"; } || ok "Nenhum .env versionado."

for f in $(git ls-files 'supabase/pendentes/*.sql'); do
  head -n 5 "$f" | grep -q 'ESTADO:' || erro "$f sem cabeçalho ESTADO."
done

DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
[ "$DIRTY" -gt 0 ] && aviso "$DIRTY arquivo(s) com alteração local não commitada." || ok "Diretório de trabalho limpo."

if [ "$FULL" -eq 1 ]; then
  PM=npm; command -v bun >/dev/null 2>&1 && [ -f bun.lock ] && PM=bun
  for s in typecheck test build; do
    echo "--- $PM run $s"
    $PM run "$s" || erro "$s falhou."
  done
fi

echo
[ "$PROBLEMAS" -eq 0 ] && echo "Resultado: sem bloqueios. Isso NÃO confirma Publish no Lovable nem migrations aplicadas." || echo "Resultado: $PROBLEMAS bloqueio(s)."
exit $([ "$PROBLEMAS" -eq 0 ] && echo 0 || echo 1)
