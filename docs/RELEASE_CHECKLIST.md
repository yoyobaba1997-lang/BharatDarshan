# Release checklist

## Source/CI
- [x] GitHub Actions run 45893141187 passes tests, checks, and both Docker builds
- [ ] `npm test` passes
- [ ] `npm run check` passes
- [ ] Catalogue audit reviewed

## Data
- [ ] TMDB credential configured securely
- [ ] Ingestion executed and snapshot generated
- [ ] Metadata source attribution reviewed
- [ ] Duplicate and completeness issues reviewed
- [ ] Provider availability sources/terms reviewed

## Deployment
- [ ] Web and API deployed
- [ ] `GET /health` returns healthy response and catalogue count
- [ ] `GET /stats` returns expected catalogue distribution
- [ ] `GET /export` schema checked
- [ ] Browser API URL and CORS configured
- [ ] HTTPS configured for production PWA

## UX/runtime
- [ ] Mobile browser tested
- [ ] Desktop browser tested
- [ ] Fire TV/Android TV remote navigation tested
- [ ] PWA install tested on supported browser
- [ ] Offline app shell tested
- [ ] Accessibility keyboard/focus tested

**Do not mark production-ready until the above checks are performed and documented.**


## Expanded Stage 30 Release Verification
- [ ] Latest main commit passes CI (tests, checks, API/web Docker builds).
- [ ] Review dependency audit and lockfile.
- [ ] Configure production ALLOWED_ORIGIN and HTTPS.
- [ ] Configure API/web URLs and health checks.
- [ ] Confirm generated catalogue snapshot is included in deployment image.
- [ ] Run ingestion with TMDB credentials and review output/audit.
- [ ] Verify provider metadata coverage and freshness.
- [ ] Review current TMDB attribution requirements and approved logo placement.
- [ ] Test desktop, Android, Android TV/Fire TV remote navigation.
- [ ] Test PWA install/offline shell/cache, local My List, import/export.
- [ ] Test all search and catalogue filters.
- [ ] Review privacy policy, source terms, and legal/content policy.
- [ ] Confirm refresh workflow and deployment artifact process.
- [ ] Release only after all external checks are complete.
