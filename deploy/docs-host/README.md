# Docs host

One static container (`tavric-docs-web`) serves every `*.tavric-labs.net` docs site on the docs host, chosen by hostname from `/opt/tavric-docs/sites/<host>/current`. Each site has its own deploy key that can only publish to that site.

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

1. **DNS:** `<name>.tavric-labs.net` A record to the docs host.
2. **Key:** `ssh-keygen -t ed25519 -N "" -C docs-<name> -f docs-<name>`.
3. **Register (as root on the host):**
   `/opt/tavric-docs/add-site.sh <name>.tavric-labs.net "$(cat docs-<name>.pub)"`
4. **Edge:** add a block to the edge Caddy config (see `Caddyfile.edge.fragment`), validate it, then reload Caddy. Add DNS first, or certificate issuance backs off for hours.
5. **Repo:** set secrets `DOCS_DEPLOY_SSH_KEY` (private key) and `DOCS_DEPLOY_KNOWN_HOSTS` (the host's public key line), variables `DOCS_DEPLOY_HOST`, `DOCS_DEPLOY_USER`, `DOCS_DEPLOY_PORT` and `DOCS_DEPLOY_ENABLED=true`.
6. **Workflow:** build the site, tar it with `index.html` at the archive root, then on `main`:
   `ssh -i key <deploy-user>@<host> "publish $GITHUB_SHA" < site.tgz`
   and verify `https://<host>/_deployment.json` reports the commit.

## Notes

- `publish.sh` runs as a forced command (`command="/opt/tavric-docs/publish.sh <host>",restrict`), so a key has no shell and cannot choose its site.
- Unknown hostnames get 404. `/healthz` is the container health check.
- `mcp-auth.tavric-labs.net` predates this host and has its own container (`mcp-auth-docs-web`, versioned docs under `/docs/`).
