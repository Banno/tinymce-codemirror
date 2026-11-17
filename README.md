# Banno TinyMCE Distribution

Audited packaging repository for Banno's self-hosted `@banno/tinymce` distribution.

## Overview

This repository automates the ingestion, integrity verification, and Artifactory publishing of TinyMCE commercial self-hosted releases.

Upstream enterprise assets (`tinymce` core + `tinymce-premium` plugins) are fetched directly from the upstream npm registry, cryptographically cross-verified via SHA-256 manifests, assembled into `@banno/tinymce`, and published to Jack Henry Artifactory strictly via GitHub Actions OIDC.

## Security & Provenance Controls

1. **Cryptographic Verification:** Every upstream file and tarball is verified against `manifest.json`.
2. **Lifecycle Safety:** The generated distribution package enforces strictly zero install scripts (`scripts: {}`) to defend against Yarn 4 execution vectors.
3. **Machine-Only Publishing:** No developer credentials or local laptop uploads. Releases are signed and published via GitHub Actions OIDC.

## Usage

### Local Build & Verification

```bash
node scripts/ingest.mjs
```

This will download upstream packages, verify SHA-512 integrity, extract and assemble `@banno/tinymce` in `dist/`.
