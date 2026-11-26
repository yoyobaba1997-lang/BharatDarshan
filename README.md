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
🚧 Early foundation. Compatibility adapters, providers, UI, and tests will be built and verified incrementally.
