# BharatDarshan Roadmap

## Foundation
- [x] Repository and project scope
- [x] Starter catalogue categories
- [x] Language registry (expanding)
- [x] Metadata schema and catalogue core
- [x] Search/filter functions and validation
- [x] Initial API endpoints
- [x] Generic catalogue API

## Catalogue & UI
- [x] Streaming-style responsive web UI
- [x] Search, type, language, genre, region, year and sort filters
- [x] Anime classification and audio/dub/subtitle metadata
- [x] Dynamic hero and curated shelves
- [x] Indian-language discovery browser and dynamic language shelves
- [x] Catalogue insights dashboard and quality audit
- [x] PWA installability and offline app shell
- [x] Local My List/watchlist and JSON import/export
- [x] Accessibility labels and modal keyboard focus handling

## Metadata ingestion
- [x] TMDB trending/popular/top-rated importer
- [x] Normalized source IDs, dates, ratings, images and genre mapping
- [x] Incremental merge and snapshot validation
- [x] Retry/backoff for rate limits and transient errors
- [x] Optional region-aware watch-provider metadata enrichment
- [ ] Run ingestion with owner-provided credential and review the resulting snapshot
- [ ] Scheduled refresh automation (requires hosting/secret configuration)

## Integrations
- [x] Generic metadata adapter contract and fixture tests
- [x] Generic JSON metadata export endpoint
- [ ] Nuvio adapter (verify current interface/version first)
- [ ] Stremio catalog metadata adapter (official spec review required; stream endpoints excluded)

## Deployment & quality
- [x] Dockerfiles and Docker Compose
- [x] API and web health checks
- [x] GitHub Actions CI workflow (latest run still requires verification)
- [x] Release and deployment checklist documentation
- [ ] CI latest run verified green
- [ ] Source/legal/attribution review
- [ ] Production deployment and live health checks
- [ ] Browser/mobile/Fire TV runtime QA
- [ ] Provider metadata enrichment run and coverage review

## Stage Progress
- [x] Stage 10 — Catalogue insights dashboard
- [x] Stage 11 — Language registry corrections and dynamic Indian-language discovery
- [x] Stage 12 — PWA and offline app shell
- [x] Stage 13 — Incremental ingestion safeguards and provenance
- [x] Stage 14 — Deployment configuration and health checks
- [x] Stage 15 — Generic metadata adapter
- [x] Stage 16 — Accessibility improvements
- [x] Stage 17 — Release checklist and deployment guide created
- [x] Stage 18 — Personal local watchlist/My List
- [x] Stage 19 — Watchlist JSON import/export portability
- [x] Stage 20 — Optional TMDB provider-availability metadata integration

## Release status
**Source implementation:** substantially complete through Stage 20.

**Production release remains pending:** CI verification, TMDB credentials and ingestion, provider enrichment run, source/legal review, deployment configuration, and browser/mobile/Fire TV runtime QA.

## Future stages
- [ ] Stage 21 — Live browser/device QA and release verification
- [ ] Stage 22 — Secure account system and cloud watchlist sync (requires authentication/security design and hosting decision)
- [ ] Stage 23 — Final provider enrichment run and data coverage review

- [x] Stage 23 — TMDB attribution notice and licensing policy documented (approved logo asset integration still pending)
- [x] Stage 22 — Scheduled/manual catalogue refresh workflow created (requires TMDB secret; artifact only)

- [x] Stage 24 — API input validation, security headers, and integration test coverage

- [x] Stage 25 — Streaming platform discovery filters

- [x] Stage 26 — Provider availability details, region/category/source transparency

- [x] Stage 27 — Recently Viewed history and clear-history control

- [x] Stage 28 — Web server runtime smoke tests for PWA assets, API config, and security headers
