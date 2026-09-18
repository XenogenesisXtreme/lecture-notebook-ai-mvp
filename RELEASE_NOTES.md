# Lecture Notebook AI · v1.02 Beta

**Release date:** September 18, 2026

> This is a beta release. Browser support, OCR downloads, screen capture, and extension behavior can vary by platform. Please report bugs through the public GitHub issue tracker.

## Latest changes

### Versioning and beta feedback

- Added `scripts/bump-version.mjs` and the `pnpm version:bump` command to synchronize package metadata, the Chrome manifest, README version text, and release-notes version/date.
- Added a visible **Report beta bug** button and a prefilled GitHub Issue template so beta users can report reproducible problems quickly.

### Documentation and project status

- Added a prominent **Beta · Version 1.02** status notice to the README.
- Added a permanent link from the README to this latest-only release notes page, the complete changelog, and the MIT License.
- Added a complete historical [`CHANGELOG.md`](CHANGELOG.md) covering every repository change since the initial project bootstrap.

### Release and licensing

- Added the MIT License with **Xenogenesis Xtreme** as copyright holder.
- Added Chrome Web Store listing copy, permission justification, and privacy-policy documentation.
- Added a public privacy-policy route for the deployed app.

### Grounding and OCR

- Added automatic timestamp-based transcript-to-topic alignment for demo, imported, restored, and captured transcript moments.
- Added topic chips and direct links from transcript lines to the matching notebook sections.
- Added browser-local OCR language-pack cache markers and visible OCR scan progress.
- Added tests covering topic alignment and safe OCR cache behavior.

### Chrome extension

- Added publish-ready manifest metadata, branded icons, extension documentation, and a refreshed downloadable ZIP archive.

## Verification

- 13 automated tests passing.
- TypeScript check passing.
- Production build passing.
- Chrome extension ZIP integrity verified.
- Live browser workspace verified.

## Known beta limitations

Speech recognition and screen capture depend on browser and operating-system support. Tesseract.js can take longer on first use while a language pack loads. The extension remains intentionally consent-gated and does not automatically join meetings, read page content, or bypass host controls.
