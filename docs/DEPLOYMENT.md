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
