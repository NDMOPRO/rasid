#!/usr/bin/env bash
set -euo pipefail

# Prevent merge/deploy while conflicts still exist.

unmerged_files="$(git diff --name-only --diff-filter=U || true)"
if [[ -n "$unmerged_files" ]]; then
  echo "❌ Unmerged files detected (resolve before deployment):"
  echo "$unmerged_files"
  exit 1
fi

conflict_markers="$(rg -n "^(<<<<<<<|=======|>>>>>>>)" drizzle server --glob '!**/*.gz' || true)"
if [[ -n "$conflict_markers" ]]; then
  echo "❌ Conflict markers found in source files:"
  echo "$conflict_markers"
  exit 1
fi

echo "✅ Pre-deploy check passed: no merge conflicts detected."
