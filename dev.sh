#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

SB="${SUPABASE_CMD:-supabase}"
if ! command -v "$SB" >/dev/null 2>&1; then
  SB="npx supabase"
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker não está a correr. Abre Docker Desktop."
  exit 1
fi

$SB start

if [[ ! -f config.local.js ]]; then
  echo "Criando config.local.js a partir do example..."
  cp config.local.example.js config.local.js
fi

echo "Editor: http://127.0.0.1:8080/index.html"
echo "Admin:  http://127.0.0.1:8080/admin.html"
echo "Studio: http://127.0.0.1:54323"
python3 -m http.server 8080 --bind 127.0.0.1
