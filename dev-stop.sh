#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
pkill -f "python3 -m http.server 8080" 2>/dev/null || true
SB="${SUPABASE_CMD:-supabase}"
command -v "$SB" >/dev/null || SB="npx supabase"
$SB stop
echo "Dev stack parado."
