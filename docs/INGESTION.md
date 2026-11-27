# Metadata ingestion

## Starter provider: TMDB

The ingestion CLI fetches weekly trending, popular, top-rated, and Indian-language discovery results for movies and TV series from TMDB (selected through environment variables), then writes normalized metadata to `packages/catalog/src/ingested-catalog.json`. The API automatically uses this file when it exists; otherwise it serves the demo fixture.

### Setup

1. Obtain an API credential from TMDB and review the current terms/attribution requirements.
2. Set one environment variable: `TMDB_READ_ACCESS_TOKEN` (preferred) or `TMDB_API_KEY`.
3. Run from the repository root: `npm run ingest --workspace @bharatdarshan/api`.
4. Start the API: `npm start --workspace @bharatdarshan/api`.

Optional environment variables:
- `INGEST_PAGES`: pages per source/type, capped at 20.
- `INGEST_TYPES`: comma-separated types; defaults to `movie,tv`.
- `INGEST_MODES`: comma-separated modes; defaults to `trending,popular,top_rated,indian_languages`. Supported modes are `trending`, `popular`, `top_rated`, and `indian_languages`.
- `INGEST_LANGUAGES`: comma-separated TMDB language codes for Indian-language discovery; defaults to `hi,ta,te,ml,kn,bn,mr,gu,pa,or,as,ur`.
- `PORT`: API port, defaults to 3000.

## Automated refresh via GitHub Actions

The repository includes **BharatDarshan Catalogue Refresh**:
- Scheduled weekly refresh (artifact-only by default).
- Manual run from Actions supports optional bounded watch-provider enrichment.
- The workflow validates that the `TMDB_READ_ACCESS_TOKEN` secret is configured before ingesting.
- It runs project checks and tests, ingests a fresh snapshot, and audits it before upload.
- Manual runs include an explicit `commit_snapshot` option. It defaults to `false`; select `true` only after reviewing the generated catalogue. A commit is created only when the snapshot changed.
- Snapshots are also uploaded as a 30-day workflow artifact.

### Owner setup

1. Open the repository's **Settings → Secrets and variables → Actions**.
2. Add repository secret `TMDB_READ_ACCESS_TOKEN` (do not paste it into chat, source files, or logs).
3. Open **Actions → BharatDarshan Catalogue Refresh → Run workflow**.
4. Keep `commit_snapshot` set to `false` for the first run; download/review the artifact.
5. If the audit and attribution/terms review are satisfactory, rerun manually and opt into `commit_snapshot=true` to publish the snapshot to `main`.

This importer is not a complete catalogue. Its scope is bounded by source modes, language list, page cap and TMDB API results. No credential is stored in Git. Each imported source mode is tagged (`trending`, `popular`, or `top-rated`) so discovery shelves can be built from imported source records. Duplicate titles from overlapping modes are merged and their tags/metadata lists are preserved. Indian-language discovery records receive source and language collection tags. Provider availability enrichment is optional and bounded; review current TMDB terms/attribution before using or publishing it.

TMDB is used as an external metadata source. Follow TMDB's current attribution rules and do not imply endorsement. Confirm commercial-use licensing before monetization.


## Indian-language coverage notes

The language registry is broader than TMDB's discover-by-language API. Registry entries represent languages and variants the app can display, search, filter, and label; they do **not** guarantee that TMDB has a discoverable film/series corpus or accepts that code for discovery. The default ingestion list intentionally uses a conservative set of language codes currently configured for TMDB discovery: `hi,ta,te,ml,kn,bn,mr,gu,pa,or,as,ur`. Do not blindly pass every registry code to TMDB. For each additional code, verify it against TMDB's current language/discovery support and test returned results before expanding the ingestion workflow. Languages not available through TMDB discovery may still be added through a separately licensed/authorized metadata source or curated records.

**Coverage is not completeness:** a successful ingestion is a bounded snapshot based on source modes, page limits, API support, and returned results. The app's language registry and catalogue UI should remain inclusive even when ingestion sources are incomplete.
