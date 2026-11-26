# BharatDarshan Architecture

## Core principles
1. One normalized catalogue model.
2. Metadata/discovery first; playback remains with authorized providers or client integrations.
3. Language, script, region, audio, subtitle, and dub fields are extensible.
4. Client adapters are isolated from the catalogue core.
5. No client-specific assumptions in the core data model.

## Proposed layers
- **Catalogue Core:** titles, people, genres, languages, regions, release dates, ratings, images, aliases, audio/subtitle/dub metadata.
- **Discovery:** search, filters, trending/popular shelves, collections, pagination.
- **Metadata Providers:** pluggable and documented provider interfaces; source attribution and caching rules.
- **Adapters:** Nuvio adapter, Stremio-compatible adapter, generic add-on/API adapter.
- **Client UI:** responsive web/mobile/TV discovery interface.

## Normalized title model (initial)
`id`, `type` (movie/series/anime/episode), `title`, `originalTitle`, `aliases`, `overview`, `releaseDate`, `year`, `genres`, `languages`, `regions`, `audioLanguages`, `subtitleLanguages`, `dubLanguages`, `poster`, `backdrop`, `rating`, `sourceIds`, `seasonNumber`, `episodeNumber`.

## Compatibility strategy
Build and test each adapter against official/public specifications and supported app APIs. Do not promise compatibility until integration tests pass.
