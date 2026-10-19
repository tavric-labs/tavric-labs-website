# Contributor guidance

- Read README.md for source provenance and local build commands. Deployment configuration lives in deploy/ and scripts/deploy.sh.
- Keep this a static site with no runtime dependencies. All core content and links must work without JavaScript.
- Verify project claims against current public repository READMEs. Do not include private repositories, fabricated metrics, or unshipped capabilities.
- Keep public assets local, and preserve the strict Content Security Policy in deploy/Caddyfile.
- Before publishing, run `node --check public/app.js`, `bash -n scripts/deploy.sh`, and `npm run build`. Check desktop/mobile layouts and filters if the UI changes.
- Commit before deployment. Preserve unrelated services and edge Caddy routes on the shared VM. Never commit credentials.
