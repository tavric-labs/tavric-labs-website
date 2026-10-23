#!/bin/sh
# Forced command for a docs deploy key. authorized_keys pins the site:
#
#   command="/opt/tavric-docs/publish.sh <site-hostname>",restrict ssh-ed25519 ...
#
# so a key can only ever publish to its own site. The client's original command
# must be "publish <40-hex commit sha>" with a gzip tarball of the built site
# (index.html at its root) on stdin. Each publish is an immutable release behind
# the site's "current" symlink; the five newest are kept.
set -eu
ROOT=/opt/tavric-docs/sites
SITE=${1:-}
case "$SITE" in ""|.*|*[!a-z0-9.-]*|*..*) echo "bad site" >&2; exit 2;; esac
[ -d "$ROOT/$SITE/releases" ] || { echo "unknown site" >&2; exit 2; }

set -- $SSH_ORIGINAL_COMMAND
[ "$#" -eq 2 ] && [ "$1" = publish ] || { echo "usage: publish <sha>" >&2; exit 2; }
case "$2" in *[!0-9a-f]*|"") echo "bad revision" >&2; exit 2;; esac
[ "${#2}" -eq 40 ] || { echo "bad revision" >&2; exit 2; }

DIR="$ROOT/$SITE"
TMP="$DIR/releases/.tmp-$2"
rm -rf "$TMP"; mkdir -p "$TMP"
tar -xzf - -C "$TMP" --no-same-owner
[ -f "$TMP/index.html" ] || { rm -rf "$TMP"; echo "tarball has no index.html" >&2; exit 1; }
printf '{"revision":"%s"}\n' "$2" > "$TMP/_deployment.json"
rm -rf "$DIR/releases/$2"; mv "$TMP" "$DIR/releases/$2"
ln -sfn "releases/$2" "$DIR/current.new"
mv -T "$DIR/current.new" "$DIR/current"
ls -1dt "$DIR"/releases/*/ | tail -n +6 | xargs -r rm -rf
echo "published $SITE $2"
