# BharatDarshan adapters

## Generic metadata export

`@bharatdarshan/adapters` provides `toGenericCatalogue(items)` and emits schema version `1.0` metadata. This is a metadata-only adapter. It does not include stream URLs, unauthorized source links, or playback controls.

## Planned compatibility adapters
- Nuvio: pending verification of current public interface/specification and version.
- Stremio catalog metadata: pending official-spec verification. Stream endpoints are deliberately excluded.

Every compatibility adapter must include target version, feature mapping, limitations, and fixture tests. Never treat provider availability as verified without source attribution and region/date.
