#!/usr/bin/env bash
# Detecta commit na main que perdeu ou reverteu trabalho (caso 00ab0cc5, 31/10/2026).
# SOMENTE LEITURA. Uso: scripts/detectar-regressao-merge.sh [SHA] [LIMITE]
#   Saída: linha "PERDIDOS=<n>" e a lista dos arquivos (um por linha, prefixo PERDEU/REVERTEU).
#   Código de saída: 0 sem alerta; 3 com alerta (>= LIMITE arquivos); 2 erro de uso.
# Merge: arquivo que um dos lados alterou desde a base comum e que o resultado devolveu à versão da base
#        (ou apagou), ou seja, a alteração sumiu inteira. Resolução de conflito normal não conta.
# Commit simples: arquivos apagados.
set -u
SHA=${1:-HEAD}; LIMITE=${2:-10}
git rev-parse --verify -q "$SHA^{commit}" >/dev/null || { echo "ERRO: commit inválido: $SHA" >&2; exit 2; }
PAIS=$(git rev-list --parents -n1 "$SHA" | cut -d' ' -f2-)
N=$(echo "$PAIS" | wc -w)
LISTA=$(mktemp); trap 'rm -f "$LISTA"' EXIT
blob() { git rev-parse -q --verify "$1:$2" 2>/dev/null || echo "-"; }
if [ "$N" -ge 2 ]; then
  P1=$(echo "$PAIS" | cut -d' ' -f1); P2=$(echo "$PAIS" | cut -d' ' -f2)
  BASE=$(git merge-base "$P1" "$P2" 2>/dev/null) || { echo "PERDIDOS=0"; echo "AVISO: sem base comum" >&2; exit 0; }
  { git diff --name-only "$BASE" "$P1"; git diff --name-only "$BASE" "$P2"; } | sort -u | while IFS= read -r f; do
    m=$(blob "$SHA" "$f"); b=$(blob "$BASE" "$f"); a=$(blob "$P1" "$f"); c=$(blob "$P2" "$f")
    # perdeu: algum lado mudou o arquivo e o resultado voltou à base
    if [ "$m" = "$b" ] && { [ "$a" != "$b" ] || [ "$c" != "$b" ]; }; then
      [ "$m" = "-" ] && echo "PERDEU $f" || echo "REVERTEU $f"
    fi
    # sumiu: o resultado não tem um arquivo que existe nos dois lados
    if [ "$m" = "-" ] && [ "$a" != "-" ] && [ "$c" != "-" ]; then echo "PERDEU $f"; fi
  done | sort -u > "$LISTA"
else
  git diff --diff-filter=D --name-only "$SHA^" "$SHA" 2>/dev/null | sed 's/^/PERDEU /' > "$LISTA"
fi
T=$(grep -c . "$LISTA" || true)
echo "PERDIDOS=$T"; cat "$LISTA"
[ "$T" -ge "$LIMITE" ] && exit 3
exit 0
