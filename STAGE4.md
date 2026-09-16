# Lecture Notebook AI · Stage 4

Stage 4 upgrades the static media intake into a browser-native, privacy-first media lab.

## Implemented

- **Browser-local persistence:** notebooks, media metadata, and captured blobs are stored in IndexedDB. Reloading the app restores the latest workspace without a server account.
- **Browser capture:** the consent-first flow now calls `getDisplayMedia` when available, falling back to microphone capture. A visible MediaRecorder bar shows the live preview, timer, pause state, audio meter, and save-frame action.
- **Speech recognition hook:** browsers exposing `SpeechRecognition` / `webkitSpeechRecognition` receive continuous interim transcript capture. The result is appended as a timestamped captured-audio transcript line when capture stops.
- **Video frame extraction:** the live preview can be sampled into JPEG assets through a canvas. Captured frames become visual candidates that can be reviewed alongside uploaded slides.
- **Image OCR:** uploaded images first use the native `TextDetector` API when available, then fall back to the bundled Tesseract.js browser worker. The extracted text is stored with the media asset and appended to the corresponding visual highlight. OCR progress is surfaced through the app toast.
- **Stage 4 status:** the sidebar and media lab now show Upload + OCR, Browser-local, and IndexedDB workspace status.
- **PDF export:** the existing print-ready workflow remains available through **PDF / Print**.

## Privacy model

No media is uploaded by this Stage 4 browser flow. Display/microphone permission is requested only after the user completes the consent checklist. Captured data stays in the browser’s IndexedDB until the user removes local data or clears site storage. The app never joins a meeting or bypasses host controls.

## Browser support notes

`MediaRecorder`, `getDisplayMedia`, and `SpeechRecognition` vary by browser and operating system. The UI detects unavailable capabilities and keeps the transcript-only workflow usable. Chrome’s `webkitSpeechRecognition` prefix is supported. Native `TextDetector` is experimental, while Tesseract.js provides the browser-local OCR fallback. A future Stage 5 can add a configured server-side transcription provider for higher accuracy and language coverage.

## Verification

```bash
pnpm test
pnpm run check
pnpm run build
```

The current suite covers the lecture schema, timestamp handling, media classification, uploaded visual generation, visual deduplication, and frame scoring.
