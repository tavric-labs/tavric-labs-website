#!/usr/bin/env bash
# Usage: bash scripts/deploy.sh [SSH-host]
# Requires an existing workspace_workspace Docker network and edge Caddy.
set -euo pipefail
target="${1:-devbox1}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
npm run build
revision="$(git rev-parse --short=12 HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Commit changes before deploying so the release identifies exact source.' >&2
  exit 1
fi
ssh "$target" 'install -d -m 755 /opt/tavric-labs/site/releases'
scp deploy/compose.yaml deploy/Caddyfile "$target:/opt/tavric-labs/"
tar -C dist -czf - . | ssh "$target" "set -eu; release=/opt/tavric-labs/site/releases/$revision; test ! -e \"\$release\" || { echo 'Release already exists; use rollback instructions to reactivate it.' >&2; exit 1; }; mkdir \"\$release\"; tar -xzf - -C \"\$release\"; test -f \"\$release/index.html\"; cd /opt/tavric-labs/site; ln -s \"releases/$revision\" current.next; mv -Tf current.next current"
ssh "$target" 'docker compose --project-name tavric-labs --file /opt/tavric-labs/compose.yaml up -d; docker exec workspace-caddy wget -q -O /dev/null http://tavric-labs-web:8080/'
echo "Deployed revision $revision. Edge routing is configured separately; see README.md."
