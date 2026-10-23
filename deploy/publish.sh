#!/bin/sh
# Forced command for the website deploy key (see README.md). authorized_keys:
#
#   command="/opt/tavric-labs/publish.sh",restrict ssh-ed25519 ...
#
# The client's original command must be "publish <40-hex commit sha>" with a
# gzip tarball of the built site (index.html at its root) on stdin. The release
# is stored under releases/<first 12 chars of the sha>, the same naming that
# scripts/deploy.sh uses, then activated by switching the "current" symlink.
set -eu
ROOT=/opt/tavric-labs/site
set -- $SSH_ORIGINAL_COMMAND
[ "$#" -eq 2 ] && [ "$1" = publish ] || { echo "usage: publish <sha>" >&2; exit 2; }
case "$2" in *[!0-9a-f]*|"") echo "bad revision" >&2; exit 2;; esac
[ "${#2}" -eq 40 ] || { echo "bad revision" >&2; exit 2; }
REV=$(printf '%s' "$2" | cut -c1-12)
REL="$ROOT/releases/$REV"
TMP="$ROOT/releases/.tmp-$REV"
rm -rf "$TMP"; mkdir -p "$TMP"
tar -xzf - -C "$TMP" --no-same-owner
[ -f "$TMP/index.html" ] || { rm -rf "$TMP"; echo "tarball has no index.html" >&2; exit 1; }
printf '{"revision":"%s"}\n' "$2" > "$TMP/_deployment.json"
rm -rf "$REL"; mv "$TMP" "$REL"
ln -sfn "releases/$REV" "$ROOT/current.next"
mv -T "$ROOT/current.next" "$ROOT/current"
# keep the 10 newest releases (rollback = re-point current at an older one)
ls -1dt "$ROOT"/releases/*/ | tail -n +11 | xargs -r rm -rf
echo "published $REV"
