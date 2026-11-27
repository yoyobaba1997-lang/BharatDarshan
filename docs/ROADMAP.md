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
- [x] Scheduled/manual catalogue refresh workflow with artifact upload
- [x] Manual opt-in audited snapshot publishing (Stage 47; requires TMDB secret)

## Integrations
- [x] Generic metadata adapter contract and fixture tests
- [x] Generic JSON metadata export endpoint
- [ ] Nuvio adapter (verify current interface/version first)
- [ ] Stremio catalog metadata adapter (official spec review required; stream endpoints excluded)

## Deployment & quality
- [x] Dockerfiles and Docker Compose
- [x] API and web health checks
- [x] GitHub Actions CI workflow
- [x] Release and deployment checklist documentation
- [x] CI verified green for latest confirmed code (run #265; later commits require fresh status)
- [ ] Source/legal/attribution review
- [x] Render free-plan API and Web services deployed
- [x] Public API and Web smoke checks verified
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
**Source implementation:** substantially complete through Stage 47.

**Production release remains catalogue-data dependent:** TMDB secret setup and ingestion, catalogue snapshot review, source/legal/attribution review, provider enrichment review, and browser/mobile/Fire TV runtime QA.

## Future stages
- [ ] Stage 21 — Live browser/device QA and release verification
- [ ] Stage 22 — Secure account system and cloud watchlist sync (requires authentication/security design and hosting decision)
- [ ] Stage 23 — Final provider enrichment run and data coverage review

- [x] Stage 23 — TMDB attribution notice and licensing policy documented (approved logo asset integration still pending)
- [x] Stage 22 — Scheduled/manual catalogue refresh workflow created

- [x] Stage 24 — API input validation, security headers, and integration test coverage
- [x] Stage 25 — Streaming platform discovery filters
- [x] Stage 26 — Provider availability details in title modal, source links, region/category/timestamp and freshness disclaimer
- [x] Stage 27 — Bounded local catalogue cache with offline fallback
- [x] Stage 28 — Validate catalogue image and provider source URLs before rendering
- [x] Stage 29 — Expanded API integration coverage for security, filters, exports and validation
- [x] Stage 30 — Consolidated production release checklist
- [x] Stage 31 — Dependency-free API deployment smoke-test script
- [x] Stage 32 — Configurable deployment environment and compose ports
- [x] Stage 33 — Manual HTTPS release smoke-check workflow
- [x] Stage 34 — Catalogue provenance/freshness metadata endpoint
- [x] Stage 35 — Dashboard catalogue source and freshness indicators
- [x] Stage 36 — Provider metadata coverage and timestamp freshness audit
- [x] Stage 37 — Web smoke-test script and combined manual release verification workflow
- [x] Stage 38 — Process-local API per-IP rate limiting
- [x] Stage 39 — Configurable per-IP API rate limit and Retry-After response
- [x] Stage 40 — Automated rate-limit integration test and configuration edge-case coverage
- [x] Stage 41 — Roadmap consolidation and explicit CI/release status tracking
- [x] Stage 42 — API security/error-handling review and regression tests
- [x] Stage 43 — Strengthened API/web release smoke scripts, local-runtime integration test, and HTTPS endpoint validation
- [x] Stage 44 — Web/API security headers for errors and preflight; method policy and release-smoke coverage strengthened
- [x] Stage 45 — Render deployment, live smoke workflow, CORS-origin and API URL-injection checks
- [x] Stage 46 — Verify public production API and Web endpoints through GitHub Actions
- [x] Stage 47 — Safer catalogue refresh: fail-fast secret check, audited artifact, manual opt-in snapshot commit, and owner setup documentation

## Current verification status
- Stage 41 commit `e789f75` was screenshot-confirmed green in GitHub Actions run #242 (npm test, npm run check, API Docker build, Web Docker build).
- Stage 42 commit `0df48b4` was screenshot-confirmed green in GitHub Actions run #249.
- Stage 43 strengthened API/Web smoke scripts and added a local-server integration test that runs both smoke scripts inside CI.
- Stage 44 CI was screenshot-confirmed successful in GitHub Actions run #265 for commit `1f037b2` (npm test, npm run check, API Docker build, Web Docker build).
- Render services `bharatdarshan-api` and `bharatdarshan-web` are configured on the free plan in Singapore.
- API CORS is restricted to `https://bharatdarshan-web.onrender.com`; Web is configured with `https://bharatdarshan-api.onrender.com`.
- Production smoke run #45922237449 passed: public API 11 checks; public Web 8 checks.
- Latest confirmed commit before Stage 47 was `a4830d4`; both `ci/bharatdarshan` and `render/production-smoke` statuses were green.
- Catalogue data remains demo/sample until TMDB ingestion is run with the repository owner's secret.
