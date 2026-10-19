# Tavric Labs website

The public organization website at **https://tavric-labs.net**, showcasing MCP Runtime, Cully, MCP Mobile, and the supporting open-source tools.

Buildless HTML, CSS, and JavaScript. No third-party scripts, analytics, fonts, runtime dependencies, or external API requests. The project filters progressively enhance a complete, readable page; all projects remain visible without JavaScript. Project illustrations are stylized diagrams, not live product status.

## Work locally

Requires Node.js 22+ and Python 3 for the preview server. There are no npm dependencies to install.

```sh
npm run dev
# Open http://127.0.0.1:4173
node --check public/app.js
bash -n scripts/deploy.sh
npm run build
```

Edit `public/index.html`, `public/styles.css`, and `public/app.js`. The build validates local asset references and navigation anchors, then copies `public/` to `dist/`. Check desktop and mobile layout, keyboard focus, reduced motion, and every filter after interaction changes.

## Content sources

Content was checked against the [organization profile](https://github.com/tavric-labs/.github/blob/main/profile/README.md) and each public project's README on 2026-10-19. The existing organization logo is from `.github/profile/brand/tavric-labs-avatar.jpg`, copied locally to `public/assets/tavric-labs.jpg`.

Three featured projects: `mcp-runtime`, `cully`, `mcp-mobile`. Seven toolbox projects: `py-mcp`, `mcp-auth`, `mcp-server-fuzzer`, `mcpsnoop`, `mcp-smoke`, `mcpfz-probe`, `onepassword-mcp-plugin`. The `.github` profile is linked in the footer. Private repositories are excluded. Verify current features before changing marketing copy; mobile SDKs and the 1Password gateway are labeled preview. If adding toolbox projects, update the filter count.

## Hosting and DNS

The site shares the existing Cully VM and edge proxy:

| Setting | Value |
| --- | --- |
| SSH alias | `devbox1` |
| VM hostname | `devbox-2` |
| IPv4 | `103.181.176.61` |
| Root directory | `/opt/tavric-labs` |
| Container | `tavric-labs-web` |
| Docker network | `workspace_workspace` |
| Existing edge proxy | `workspace-caddy` |
| Edge config | `/opt/workspace/Caddyfile` |

DNS records:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `103.181.176.61` |
| CNAME | `www` | `tavric-labs.net` |

Replace registrar parking A records. Leave AAAA unset unless IPv6 is separately configured. Caddy provisions and renews HTTPS after DNS points here. `www` redirects to the apex domain. Direct-IP preview: http://103.181.176.61/.

## Deploy

Commit source changes first, then:

```sh
bash scripts/deploy.sh devbox1
```

The script builds, copies the service configuration, uploads an immutable release named for the Git revision, switches the `site/current` symlink, starts the container, and checks it from the existing proxy. Caddy mounts the parent `site` directory so atomic symlink changes are visible without restarting the edge. Previous releases are retained. The deploy identity must have SSH and Docker access; keep credentials out of this repository.

First-time edge setup: append `deploy/Caddyfile.edge.fragment` to the existing edge Caddyfile, taking a backup first. Preserve existing Cully, docs, and Keycloak routes. Write to the existing file in place because Docker bind mounts its inode. Validate and reload:

```sh
ssh devbox1 'docker exec workspace-caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile'
ssh devbox1 'docker exec workspace-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile'
curl -I http://103.181.176.61/
curl -I https://tavric-labs.net/
curl -I https://www.tavric-labs.net/
```

The origin container exposes no host port. It serves files on port 8080 within the existing Docker network with a read-only filesystem and a 64 MB memory limit. Unknown paths return 404. HTML revalidates; CSS, JavaScript, and images cache for one hour.

## Roll back

List retained revisions and point the current symlink to one:

```sh
ssh devbox1 'ls /opt/tavric-labs/site/releases'
# Replace REVISION with one of those directory names.
ssh devbox1 'cd /opt/tavric-labs/site && ln -s releases/REVISION current.next && mv -Tf current.next current'
```

Then verify the page and assets through the public URL. Edge routing changes require restoring the saved edge config in place, validating, and reloading. Check the existing websites after any edge configuration change.
