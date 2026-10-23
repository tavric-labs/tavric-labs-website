# Docs host

One static container (`tavric-docs-web`) serves every `*.tavric-labs.net` docs site on devbox1, chosen by hostname from `/opt/tavric-docs/sites/<host>/current`. Each site has its own deploy key that can only publish to that site.

```
browser -> edge Caddy (TLS) -> tavric-docs-web:8080 -> /srv/<host>/current
```

Layout on the host:

```
/opt/tavric-docs/
  Caddyfile  compose.yaml  publish.sh  add-site.sh
  sites/<host>/releases/<sha>/   immutable releases (newest five kept)
  sites/<host>/current           symlink to the live release
```

## Add a site

1. **DNS:** `<name>.tavric-labs.net` A record to `103.181.176.61`.
2. **Key:** `ssh-keygen -t ed25519 -N "" -C docs-<name> -f docs-<name>`.
3. **Register (as root on the host):**
   `/opt/tavric-docs/add-site.sh <name>.tavric-labs.net "$(cat docs-<name>.pub)"`
4. **Edge:** append to `/opt/workspace/Caddyfile` (see `Caddyfile.edge.fragment`), validate, then `docker exec workspace-caddy caddy reload --config /etc/caddy/Caddyfile`. Add DNS first, or certificate issuance backs off for hours.
5. **Repo:** set secrets `DOCS_DEPLOY_SSH_KEY` (private key) and `DOCS_DEPLOY_KNOWN_HOSTS` (`103.181.176.61 ssh-ed25519 ...`), variables `DOCS_DEPLOY_HOST=103.181.176.61`, `DOCS_DEPLOY_USER=tavricdocs`, `DOCS_DEPLOY_PORT=22`, `DOCS_DEPLOY_ENABLED=true`.
6. **Workflow:** build the site, tar it with `index.html` at the archive root, then on `main`:
   `ssh -i key tavricdocs@host "publish $GITHUB_SHA" < site.tgz`
   and verify `https://<host>/_deployment.json` reports the commit.

## Notes

- `publish.sh` runs as a forced command (`command="/opt/tavric-docs/publish.sh <host>",restrict`), so a key has no shell and cannot choose its site.
- Unknown hostnames get 404. `/healthz` is the container health check.
- `mcp-auth.tavric-labs.net` predates this host and has its own container (`mcp-auth-docs-web`, versioned docs under `/docs/`).
