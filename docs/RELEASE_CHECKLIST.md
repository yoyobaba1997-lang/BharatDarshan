# Release checklist

## Source/CI
- [ ] GitHub Actions latest push/PR run passes
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
