#!/usr/bin/env bash
# sweep-history.sh — PHASE-0 §3 · git-history scrub AFTER rotation (operator, clean machine)
#
# ⛔ אל תריצו את זה לפני הרוטציה! הארכיונים בהיסטוריה הם הגיבוי היחיד של
#    מפתחות-חיים עד שהרוטציה מושלמת ומאומתת. רוטציה קודם → אימות → אז סריקה.
#
# Usage (one repo at a time, on a fresh clone):
#   cd steem && bash ../phase0-kit/sweep-history.sh
#   cd <other-affected-repo> && bash ../phase0-kit/sweep-history.sh
#
# Affected paths (from the 2026-09-28 audit):
#   agent/vault/KEYS-BACKUP-2026-09-09.tar.enc
#   agent/vault/KEYS-ZIP-2026-09-10.zip.enc
#   agent/vault/*README*            (documentation only — keep, optional remove)
#   agent/recovery-meta.json        (passphrases at HEAD until c26c3c5 untracked it)
#   + R11 root passphrase occurrences across 8 repo histories (see BFG pass below)

set -euo pipefail

REPO="$(pwd)"
NAME="$(basename "$REPO")"
echo "── sweep-history on: $NAME ──"
echo "PRECONDITION (must be true): rotation DONE and verified on steem+hive for all 12 accounts."
read -r -p "Type the repo name to confirm: " CONFIRM
[ "$CONFIRM" = "$NAME" ] || { echo "aborted"; exit 1; }

# 0. fresh clone safety
[ -d .git ] || { echo "run inside the repo root"; exit 1; }

# 1. pip tool
python3 -m pip install --user git-filter-repo 2>/dev/null || pipx install git-filter-repo

# 2. path-based scrub (the archives + passphrases)
git filter-repo --force \
  --invert-paths \
  --path agent/vault/KEYS-BACKUP-2026-09-09.tar.enc \
  --path agent/vault/KEYS-ZIP-2026-09-10.zip.enc \
  --path agent/recovery-meta.json

# 3. content-based scrub (R11 root passphrase — put the OLD burned passphrase in a file, never in shell history)
if [ -f ../phase0-kit/.r11-burned-pass ]; then
  echo "── BFG pass for R11 passphrase across all branches ──"
  # BFG: bfg --replace-text expects literal lines; run once per repo
  java -jar bfg.jar --replace-text ../phase0-kit/.r11-burned-pass .
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  rm -f ../phase0-kit/.r11-burned-pass   # burn the burn-list itself
else
  echo "skip BFG pass (no .r11-burned-pass provided)"
fi

# 4. coordinated force-push (see AGENTS.md §4 — coordinate with the other agents FIRST)
echo "── ready to force-push ──"
echo "git push --force origin main"
echo "(after push: re-clone all working copies; old clones retain the history locally)"
