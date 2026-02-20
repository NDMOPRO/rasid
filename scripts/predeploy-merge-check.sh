#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"

if [[ "${1:-}" == "--base" ]]; then
  BASE_REF="${2:-origin/main}"
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "❌ Not a git repository with commits."
  exit 1
fi

if [[ "$BASE_REF" == origin/* ]]; then
  if git remote get-url origin >/dev/null 2>&1; then
    git fetch origin "${BASE_REF#origin/}" >/dev/null 2>&1 || true
  else
    echo "⚠️ No 'origin' remote configured; using local refs only."
  fi
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "❌ Base ref '$BASE_REF' not found."
  echo "   Try: bash scripts/predeploy-merge-check.sh --base <existing-ref>"
  exit 1
fi

merge_base="$(git merge-base HEAD "$BASE_REF")"
merge_preview="$(git merge-tree "$merge_base" HEAD "$BASE_REF")"

if printf '%s\n' "$merge_preview" | rg -n '^<{7}|^={7}|^>{7}' >/dev/null; then
  echo "❌ Merge conflicts are expected with base '$BASE_REF'."
  echo "   Resolve by updating your branch first:"
  echo "   git fetch origin"
  echo "   git merge $BASE_REF"
  exit 1
fi

echo "✅ Merge check passed: no conflicts expected with '$BASE_REF'."
