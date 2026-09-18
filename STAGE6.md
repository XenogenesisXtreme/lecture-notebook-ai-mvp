# Lecture Notebook AI · Stage 6

Stage 6 turns the media review flow into a more grounded and publishable student tool.

## Grounding upgrades

Transcript lines now receive a `sectionId` based on timestamp inclusion in a notebook topic range. The alignment runs for demo data, imported transcripts, restored workspaces, and live browser-captured speech. The transcript drawer renders a topic chip and a direct link to the aligned notebook section. Lines outside the known topic ranges remain unassigned rather than being forced into an invented topic.

## OCR caching and progress

OCR language selections are cached in localStorage after a successful Tesseract.js scan. The media lab reports whether the selected language pack is cached, warns when the first scan will load it, and shows scan progress. English, Hindi, Spanish, and French remain supported by the language selector. Browser-native OCR can still take precedence when available.

## Chrome Web Store preparation

The extension manifest now includes author, homepage, minimum Chrome version, icons, and host metadata. `extension/store-listing.md` contains draft listing copy and permission justification. `extension/privacy-policy.md` documents the local-first data model, browser permissions, capture boundaries, and third-party OCR asset behavior. A stable public privacy-policy URL must be configured in the Chrome Web Store Developer Dashboard before submission.

## License

The repository is distributed under the MIT License with Xenogenesis Xtreme as copyright holder. The full text is in `LICENSE`.

## Verification

```bash
pnpm test
pnpm run check
pnpm run build
```
