#!/usr/bin/env bash
# Ignored Build Step untuk monorepo Studiva.
#
# Dipakai di Vercel: Settings > Git > Ignored Build Step > "Run my Bash script"
#   bash scripts/vercel-ignore-build.sh apps/digital     (project: rekah)
#   bash scripts/vercel-ignore-build.sh apps/sekolah     (project: studiva)
#
# Konvensi exit code Vercel:
#   exit 0 -> BATALKAN build (tidak ada perubahan relevan)
#   exit 1 -> LANJUTKAN build
#
# Tujuan: push yang hanya menyentuh apps/sekolah tidak memicu build Rekah,
# dan sebaliknya. Perubahan pada packages/shared atau lockfile memicu keduanya.

set -uo pipefail

APP_DIR="${1:-}"

if [ -z "$APP_DIR" ]; then
  echo "vercel-ignore-build: argumen app dir kosong -> build tetap dijalankan."
  exit 1
fi

# Path yang dianggap memengaruhi SEMUA app.
SHARED_PATHS=(
  "packages/"
  "pnpm-lock.yaml"
  "pnpm-workspace.yaml"
  "package.json"
  "tsconfig.base.json"
  ".npmrc"
  "scripts/vercel-ignore-build.sh"
)

WATCH_PATHS=("$APP_DIR/" "${SHARED_PATHS[@]}")

echo "vercel-ignore-build: memeriksa perubahan untuk '$APP_DIR'"
echo "  VERCEL_GIT_COMMIT_REF=${VERCEL_GIT_COMMIT_REF:-<unset>}"

# Kalau riwayat git tidak tersedia (shallow clone tanpa parent), aman-kan: build.
if ! git rev-parse HEAD^1 >/dev/null 2>&1; then
  echo "  Tidak ada commit induk (initial/shallow clone) -> build dijalankan."
  exit 1
fi

CHANGED="$(git diff --name-only HEAD^1 HEAD -- "${WATCH_PATHS[@]}")"

if [ -n "$CHANGED" ]; then
  echo "  Perubahan relevan terdeteksi:"
  echo "$CHANGED" | sed 's/^/    - /'
  echo "  -> build dijalankan."
  exit 1
fi

echo "  Tidak ada perubahan pada '$APP_DIR' atau file bersama -> build dibatalkan."
exit 0
