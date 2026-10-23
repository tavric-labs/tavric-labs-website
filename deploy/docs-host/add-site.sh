#!/bin/sh
# Register a docs site and the deploy key allowed to publish to it. Run as root
# on the host. Idempotent: running it again for a site replaces that site's key.
#
#   /opt/tavric-docs/add-site.sh <site-hostname> "<ssh public key>"
#
# The site still needs a DNS record and an edge Caddy block that proxies the
# hostname to tavric-docs-web:8080 (see README.md).
set -eu
BASE=/opt/tavric-docs
SITE=${1:-}; KEY=${2:-}
case "$SITE" in ""|.*|*[!a-z0-9.-]*|*..*) echo "bad site" >&2; exit 2;; esac
case "$SITE" in *.tavric-labs.net) ;; *) echo "site must end in .tavric-labs.net" >&2; exit 2;; esac
case "$KEY" in ssh-ed25519\ *) ;; *) echo "key must be an ssh-ed25519 public key" >&2; exit 2;; esac
case "$KEY" in *[\"\\]*) echo "bad key" >&2; exit 2;; esac

id tavricdocs >/dev/null 2>&1 || useradd -m -s /bin/sh tavricdocs
install -d -o tavricdocs -g tavricdocs "$BASE/sites" "$BASE/sites/$SITE" "$BASE/sites/$SITE/releases"
install -d -m 700 -o tavricdocs -g tavricdocs /home/tavricdocs/.ssh
AK=/home/tavricdocs/.ssh/authorized_keys
touch "$AK"
grep -vF "publish.sh $SITE\"" "$AK" > "$AK.new" || true
echo "command=\"$BASE/publish.sh $SITE\",restrict $KEY" >> "$AK.new"
mv "$AK.new" "$AK"
chown tavricdocs:tavricdocs "$AK"; chmod 600 "$AK"
echo "registered $SITE"
