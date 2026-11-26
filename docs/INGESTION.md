# Metadata ingestion

## Starter provider: TMDB

The ingestion CLI fetches weekly trending, popular, top-rated, and Indian-language discovery results for movies and TV series from TMDB (selected through environment variables), then writes normalized metadata to `packages/catalog/src/ingested-catalog.json`. The API automatically uses this file when it exists; otherwise it serves the demo fixture.

### Setup

1. Obtain an API credential from TMDB and review the current terms/attribution requirements.
2. Set one environment variable: `TMDB_READ_ACCESS_TOKEN` (preferred) or `TMDB_API_KEY`.
3. Run from the repository root: `npm run ingest --workspace @bharatdarshan/api`.
4. Start the API: `npm start --workspace @bharatdarshan/api`.

Optional environment variables:
- `INGEST_PAGES`: pages per source/type, capped at 10.
- `INGEST_TYPES`: comma-separated types; defaults to `movie,tv`.
- `INGEST_MODES`: comma-separated modes; defaults to `trending,popular,top_rated,indian_languages`. Supported modes are `trending`, `popular`, `top_rated`, and `indian_languages`.
- `INGEST_LANGUAGES`: comma-separated TMDB language codes for Indian-language discovery; defaults to `hi,ta,te,ml,kn,bn,mr,gu,pa,or,as`.
- `PORT`: API port, defaults to 3000.

This is a starter importer, not a complete or continuously updated catalogue. Run it manually to refresh. No secret should be committed into Git. The ingestion currently does not import streaming availability/watch-provider data; that requires separate terms/attribution review and provider data handling.

TMDB is used as an external metadata source. Follow TMDB's current attribution rules and do not imply endorsement. Confirm commercial-use licensing before monetization.
