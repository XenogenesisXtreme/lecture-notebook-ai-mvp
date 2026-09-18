# Lecture Notebook AI Privacy Policy

**Effective date: September 17, 2026**

Lecture Notebook AI is maintained by **Xenogenesis Xtreme**. This policy describes the Chrome extension and its connected local-first web workspace.

## Information handled

The extension does not sell personal information, serve behavioral advertising, or build a browsing profile. The current extension provides a popup launcher and a small `LN` shortcut. It does not read page text, collect URLs, record tabs, capture microphone input, or join meetings automatically.

The web workspace can process information that a user intentionally provides, including transcript files, images, audio, video, screen-capture streams, speech-recognition results, OCR output, notebook edits, and review decisions. Capture and microphone access begin only after the user completes the consent checklist and accepts the browser’s permission prompt.

## Local storage

Notebook drafts, media metadata, review statuses, OCR language-cache markers, and captured media may be stored in the browser’s localStorage, IndexedDB, or in-memory object URLs. The static web app does not upload those files to a project backend. A user can remove local workspace data with the app’s **Delete local data** action or by clearing site storage in the browser.

Tesseract.js language and worker assets may be downloaded by the browser on a first OCR scan and then reused through normal browser caching. Native browser speech recognition and OCR behavior is controlled by the browser and operating system.

## Permissions

The extension declares `activeTab`, `storage`, and host permissions for the deployed workspace domains. These permissions support the extension launcher and future local preferences. The extension does not use them to monitor browsing activity or automatically access content.

## Third parties

The app uses browser APIs and Tesseract.js for optional OCR. The app does not use analytics or advertising trackers in the extension. Browser vendors and hosting providers may process requests according to their own policies when the user loads the web app or downloads language assets.

## Safety boundaries

Lecture Notebook AI does not bypass meeting controls, waiting rooms, CAPTCHAs, consent requirements, or host restrictions. Users are responsible for obtaining any permissions required to record or process a lecture.

## Changes and contact

This policy may be updated when the extension’s capabilities change. For questions or issues, use the public repository issue tracker:

<https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp/issues>
