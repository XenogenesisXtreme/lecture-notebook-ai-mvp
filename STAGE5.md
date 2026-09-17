# Lecture Notebook AI · Stage 5

Stage 5 adds a review gate between browser capture/media intake and the final study notebook.

## Implemented

- **Media review timeline:** each uploaded or captured asset now carries a review status and timestamp when available. The media lab exposes All, Needs review, and Kept filters.
- **Approval controls:** students can keep or return an asset to the review queue. Removing an uploaded image also removes its generated visual highlight.
- **Language selector:** the media lab language control synchronizes browser speech recognition and Tesseract.js OCR language selection for English, Hindi, Spanish, and French.
- **OCR status:** OCR continues to use native TextDetector when available and falls back to Tesseract.js with progress notifications.
- **Extension branding:** the MV3 extension now includes generated 16, 32, 48, and 128 pixel icons.
- **Repository branding:** the public GitHub README now includes a branded banner, logo, desktop screenshot, responsive mobile screenshot, feature badges, and Stage 5 documentation.

## Review model

Media is not treated as study-ready immediately. New uploads and captures enter the `pending` queue. Keeping an item marks it as approved for the student’s working set, while removing it deletes the local media asset and any generated uploaded-image visual highlight. All state remains browser-local through the existing IndexedDB workspace persistence.

## Language notes

Speech recognition availability depends on the browser and operating system. Chrome’s prefixed and unprefixed recognition APIs are supported when available. OCR language packs are loaded by Tesseract.js on demand, so the first scan in a language can take longer and requires network access to fetch the worker/language assets unless they are cached.

## Verification

```bash
pnpm test
pnpm run check
pnpm run build
```

The existing test suite continues to cover lecture schema, timestamp utilities, media classification, uploaded visual creation, duplicate filtering, and frame scoring. Browser verification should confirm the review filters, language selector, extension download, and responsive mobile layout.
