#!/usr/bin/env bash
set -euo pipefail

# Prevent merge/deploy while unresolved conflicts still exist.

unmerged_files="$(git diff --name-only --diff-filter=U || true)"
if [[ -n "$unmerged_files" ]]; then
  echo "❌ Unmerged files detected (resolve before deployment):"
  echo "$unmerged_files"
  exit 1
fi

# Search conflict markers in tracked files across the repository,
# excluding common binary/lock/generated paths.
conflict_markers="$(
  git grep -nE '^(<<<<<<<|=======|>>>>>>>)' -- \
    ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' ':!*.pdf' \
    ':!*.gz' ':!*.zip' ':!pnpm-lock.yaml' ':!package-lock.json' ':!yarn.lock' \
    ':!dist/**' ':!node_modules/**' || true
)"

if [[ -n "$conflict_markers" ]]; then
  echo "❌ Conflict markers found in tracked files:"
  echo "$conflict_markers"
  exit 1
fi

echo "✅ Pre-deploy check passed: no merge conflicts detected."
