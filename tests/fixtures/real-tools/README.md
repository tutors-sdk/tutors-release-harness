# Real tool output

Captured on 2026-09-21 from the real tools, run on Windows without admin rights, against the local image
`node:22-bookworm-slim` (its root filesystem, because syft 1.52.0 cannot read a docker image on Windows: it fails
to place layer files whose names contain a colon):

- `syft-1.52.0-dir.trimmed.spdx.json`: `syft dir:<rootfs> -o spdx-json`, trimmed to five packages and their relationships
- `grype-0.119.0-sbom.trimmed.json`: `grype sbom:<that SBOM> -o json`, trimmed to four matches, without `configuration`
  and `providers`, with the database directory replaced by `<db dir>`
- `grype-0.119.0-db-status*.json`: `grype db status -o json` for a fresh database, none, and one older than the limit

They exist so the parsers in `src/image-static` and `src/local/vuln-db.ts` are held to what the tools really print,
not to what the parsers' authors assumed. Regenerate them when the pinned grype or syft version changes.
