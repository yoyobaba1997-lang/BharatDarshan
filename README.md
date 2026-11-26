# 🇮🇳 BharatDarshan

**One India. Every Language. Every Story.**

BharatDarshan is a multilingual entertainment discovery catalogue and standards-based add-on project designed for Nuvio, Stremio, and compatible media applications. It focuses on metadata, discovery, search, and authorized integrations—not hosting or redistributing copyrighted streams.

## Vision
- Indian cinema and series across languages and regions
- Extensible Indian-language coverage and regional variants
- Anime: series, films, trending, and dubbed-language metadata
- Korean, international, English, and classic collections
- Streaming-app-inspired discovery shelves
- Adapter-based compatibility for Nuvio, Stremio, and other compatible clients

## Planned shelves
Trending Today · Popular Movies · Popular Series · Latest Releases · Recently Added · Continue Watching (client-side) · Top Rated · Indian Cinema · Regional Cinema · Anime Trending · Anime Films · Anime Series · Hindi-Dubbed Anime · Korean Drama · International Cinema · Classics · Genre Collections

## Metadata ingestion

The starter importer uses TMDB metadata. Setup and run instructions are in [docs/INGESTION.md](docs/INGESTION.md). Configure credentials through environment variables; never commit API keys. The importer writes a normalized catalogue snapshot, and the API prefers it when present.

## Catalogue classification

Metadata-based classification provides Indian-content, anime, animation, Hindi-audio, and Hindi-dub tags. Hindi dubbing is only labeled when the catalogue explicitly contains Hindi dub/audio metadata; it is never guessed. The API exposes `/shelves` for counts by supported classification shelf.

## OTT platform coverage

Catalogue coverage targets Netflix, Prime Video, JioHotstar, Sony LIV, ZEE5, Amazon MX Player, aha, hoichoi, Sun NXT, ManoramaMAX, Chaupal, ShemarooMe, Eros Now, Lionsgate Play, Planet Marathi OTT, KLiKK, Simply South, Viki, iQIYI, Crunchyroll, Apple TV and more. This is a platform coverage target, not a claim that all catalogues are currently indexed.

## Web discovery interface

A responsive web interface is available in `apps/web` with a catalogue-driven featured hero, search, type/language/genre/year/region filters, sorting, expandable shelves, and TV remote-friendly navigation. Discovery shelves include Indian Cinema, Regional Gems, Anime, Hindi-Dubbed, Hindi Audio, World Stories, Critically Acclaimed, Family & Feel-Good, Documentaries & Reality, Timeless Classics, and Korean & Asian Stories. Start it with `npm run start:web` (port 4173). Start the API separately with `npm run start:api` (port 3000). If the API is unavailable, the UI shows clearly labeled demo data.


## Language-first browsing

The web discovery interface includes an Indian-language browser with native-script display, searchable language names/scripts, metadata-record counts, and dedicated shelves for Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, Odia, Punjabi, and Gujarati. Counts are based on the currently ingested metadata and are not claims of catalogue completeness or provider availability.

## API starter

A dependency-free Node API starter is available in `apps/api`. Initial routes: `/health`, `/languages`, `/categories`, and `/catalog` with query/filter/pagination parameters. Sample data is fixture-only and not a live provider catalogue.

## Project structure
- `packages/catalog`: normalized metadata, language registry, categories, filters
- `packages/adapters`: client-specific compatibility adapters
- `apps/api`: catalogue API
- `apps/web`: responsive discovery interface
- `docs`: architecture, language coverage, source policy

## Languages
Language coverage is registry-driven, not limited to a hard-coded list. Starter coverage includes major Indian languages and can be expanded with ISO identifiers, native names, scripts, regional variants, and aliases.

## Legal/source policy
BharatDarshan is metadata and discovery-first. Stream integrations must be authorized and comply with providers' terms and applicable law. No piracy link lists or circumvention features.

## Status
🚧 Early foundation. Catalogue ingestion still requires configured TMDB credentials and runtime verification. Streaming-provider availability is not yet populated. UI source changes are committed incrementally; browser, Android, and Fire TV runtime testing is pending.

## Stage 8
- Indian language discovery browser
- Search improvements for aliases, original titles, genres, keywords and language metadata


## Stage 9 — Catalogue Quality Audit
- Audit catalogue metadata for missing poster, synopsis, release year, genres and primary language.
- Detect possible duplicate title/year/type records and ratings outside the 0–10 range.
- Quality report available from API route `/quality`.
- Run local audit with `npm run audit --workspace @bharatdarshan/api`.
- Completeness percentage is a simple metadata-field metric, not a quality judgement about the content itself.


## Stage 10 — Catalogue Insights Dashboard
- New Insights navigation section with catalogue summary metrics.
- Type distribution and top-language charts (metadata-derived).
- Poster coverage and catalogue completeness score cards.
- Missing metadata and possible duplicate review list.
- API stats endpoint: `GET /stats` returns total, Indian title count, type counts, language counts and audit report.
- Dashboard values are derived from the loaded catalogue snapshot; they are not claims of complete provider coverage.
