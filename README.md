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
