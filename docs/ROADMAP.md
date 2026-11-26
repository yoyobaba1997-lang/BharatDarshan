# BharatDarshan Roadmap

## Foundation
- [x] Repository and project scope
- [x] Starter catalogue categories
- [x] Language registry (growing starter list)
- [x] Metadata schema and catalogue core
- [x] Search/filter functions and validation
- [x] Initial API endpoints

## Catalogue & UI
- [x] Metadata provider interface starter and source attribution documentation
- [x] Search filters (type, language, genre, region, year) in core
- [ ] Responsive streaming-style web UI
- [x] Anime classification and audio/dub/subtitle fields in model

## Metadata ingestion\n- [x] TMDB trending metadata importer starter\n- [x] Normalized source IDs, dates, ratings, images and genre mapping\n- [ ] Provider availability ingestion (terms/attribution review required)\n- [ ] Scheduled refresh and incremental update pipeline\n\n## Integrations
- [ ] Adapter contract and fixture tests
- [ ] Nuvio adapter (verify current interface first)
- [ ] Stremio-compatible adapter (verify official spec)
- [x] Generic catalogue API starter

## Quality
- [x] Catalogue unit tests added
- [x] Unit tests added for catalogue and provider normalization\n- [ ] Run tests in CI and verify results
- [ ] Source/legal review
- [ ] Deployment configuration
