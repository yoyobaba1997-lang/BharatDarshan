# BharatDarshan deployment

## Local development
1. Install Node.js 22+.
2. Run `npm install` at repository root.
3. Start API: `npm run start:api` (port 3000).
4. Start web: `npm run start:web` (port 4173).
5. Open `http://localhost:4173`.

## Docker Compose
- `docker compose up --build -d`
- Web UI: `http://localhost:4173`
- API health: `http://localhost:3000/health`
- API stats: `http://localhost:3000/stats`
- Metadata export: `http://localhost:3000/export`

Set `BHARATDARSHAN_API` to the browser-reachable API URL when deploying to a remote host. Do not use an internal container hostname for the browser client unless the browser can resolve it. Set `ALLOWED_ORIGIN` on the API to the web origin when restricting CORS. TMDB credentials are required only for ingestion and must be kept server-side.

## Ingestion
- Copy `.env.example` to a private `.env` and add a TMDB credential.
- Set ingestion controls (`INGEST_PAGES`, `INGEST_TYPES`, `INGEST_MODES`, `INGEST_LANGUAGES`) as needed.
- Run `npm run ingest`.
- Default mode merges into the existing snapshot. Use `INGEST_REPLACE=1` for an intentional replacement.
- Review `npm run audit` before publishing.

## Operational limitations
- The default catalogue is sample/demo metadata until ingestion is run.
- Provider availability is not currently a complete verified dataset.
- Service-worker offline mode caches the app shell; API data and posters are not guaranteed offline.
- Live runtime and deployment checks must be performed after deployment.


## Scheduled catalogue refresh

`.github/workflows/catalogue-refresh.yml` runs weekly and can also be manually dispatched. It requires the repository secret `TMDB_READ_ACCESS_TOKEN`. The workflow creates and audits a fresh snapshot, then uploads it as a 30-day artifact. It does not automatically commit catalogue data or redeploy the live API. Manual runs can optionally enable bounded provider enrichment.


## Configurable local/container deployment
Copy `.env.example` to `.env` and set `API_PORT`, `WEB_PORT`, `ALLOWED_ORIGIN`, and `BHARATDARSHAN_API` for your environment. The web app's API URL is injected into the served HTML. For a public deployment, `BHARATDARSHAN_API` must be a browser-reachable HTTPS endpoint; a Docker-internal hostname alone will not work for browsers. Set `ALLOWED_ORIGIN` to the exact public web origin when CORS should be restricted.

Run configuration validation before launch:

```sh
docker compose config
docker compose up --build -d
docker compose ps
API_URL=https://your-api.example npm run smoke --workspace @bharatdarshan/api
WEB_URL=https://your-web.example npm run smoke --workspace @bharatdarshan/web
```

The API release smoke check validates health, catalogue provenance, language/category/platform registries, stats, quality, catalogue search, export, required security headers, and unsupported-method handling. The web smoke check validates the HTML, CSS, JavaScript, PWA manifest, service worker, security headers, and 404 handling. CI runs both checks against isolated local API and web servers via the API workspace test suite; live public endpoints still require a manual release-smoke workflow dispatch with HTTPS URLs.

## API rate limiting

The API applies a process-local per-IP request limit. Configure `API_RATE_LIMIT` (default 120 requests) and `API_RATE_WINDOW_MS` (default 60000 ms) in the deployment environment. Invalid values fall back to defaults; accepted ranges are 1–100000 requests and 1000–3600000 ms. A 429 response includes `Retry-After`. For multi-instance production deployments, use a shared gateway or distributed limiter.
