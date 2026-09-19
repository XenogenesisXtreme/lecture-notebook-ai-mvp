# Lecture Notebook AI

> **Beta · Version 1.04** — This project is actively evolving. Features may change, and bugs or unexpected browser-specific behavior may still occur. Please report issues through the repository issue tracker.

<p align="center"><img src="brand/logo.png" alt="Lecture Notebook AI logo" width="128"></p>

<p align="center"><img src="brand/repository-banner.jpg" alt="Lecture Notebook AI repository banner"></p>

**Lecture Notebook AI** is a privacy-first, transcript-centered study workspace for turning lectures into structured, reviewable notes. And my second repo! It combines timestamped transcripts, notebook rendering, visual highlights, browser-local media processing, and PDF-ready export in a dark neon academic interface.

![Public repository](https://img.shields.io/badge/repository-public-52e0bd?style=flat-square)
![Stage 5](https://img.shields.io/badge/stage-5%20review%20lab-5be7ff?style=flat-square)
![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-f4bd65?style=flat-square)

**Current release:** [Release Notes](RELEASE_NOTES.md) · [Complete Changelog](CHANGELOG.md) · [MIT License](LICENSE)

## Features

- Transcript-only workflow that works without live meeting access.
- Structured lecture notebook output with orientation, objectives, topics, definitions, formulas, common mistakes, worked examples, revision notes, and review questions.
- Searchable timestamped transcript with speaker labels and source grounding.
- Workspace navigation for Notebook, Transcript, Visuals, Audio, and Review.
- Editable notebook content with local save and reset controls.
- Markdown, HTML, JSON, and browser print-to-PDF export.
- Browser-local IndexedDB persistence for notebooks and media metadata.
- Consent-first screen and microphone capture using browser MediaRecorder APIs.
- Chrome speech-recognition support through SpeechRecognition and webkitSpeechRecognition when available.
- Video frame extraction through a canvas-based capture flow.
- Image OCR through native TextDetector when available, with a Tesseract.js browser fallback.
- Duplicate visual filtering and frame-importance scoring utilities.
- Stage 5 media review timeline with **All**, **Needs review**, and **Kept** filters.
- Per-asset approval controls so captured frames and uploaded visuals can be reviewed before study export.
- Language selection for browser speech recognition and Tesseract.js OCR in English, Hindi, Spanish, and French.
- Optional Chrome extension with the same repository logo, a two-action widget, and explicit tab/window/screen recording saved as a local WebM.
- Beta feedback button that opens a prefilled GitHub bug report without collecting lecture content.

## Screenshots

### Desktop workspace

![Lecture Notebook AI desktop workspace](brand/product-desktop.png)

### Responsive mobile workspace

![Lecture Notebook AI mobile workspace](brand/product-mobile.png)

## Privacy and safety

The app does not join Zoom, bypass waiting rooms, defeat CAPTCHAs, hide recording state, or bypass host controls. Capture starts only after the consent checklist and browser permission flow. The browser build keeps workspace data local using localStorage and IndexedDB. Media is not uploaded by the static frontend.

The Chrome extension requests `desktopCapture`, `downloads`, `offscreen`, and `storage` permissions. Its widget offers **Open website** and **Start recording**. Recording opens Chrome's native picker so the user can choose a tab, window, or screen; it begins only after that selection and saves a local WebM when stopped. It does not join meetings, read page content, or bypass host controls.

## Open the web app

[Open the deployed Lecture Notebook AI workspace](https://lecturenoteb-hxgiwwjj.manus.space/)

## Install the Chrome extension with Load unpacked

Chrome does not install a local extension by opening a ZIP directly. The ZIP contains the extension source, and Chrome’s developer mode uses the **extracted folder**.

1. Download the version-labelled `lecture-notebook-ai-extension.zip` from the web app’s **Chrome extension** action or from this repository’s release/download files. The website adds a version query to prevent an older cached ZIP from being reused after redeployment.
2. Extract the ZIP into a normal folder. On Windows, right-click the ZIP and choose **Extract All**. On macOS, double-click it. On Linux, use your archive manager or `unzip`.
3. Open Chrome and navigate to `chrome://extensions`.
4. Turn on **Developer mode** in the upper-right corner.
5. Click **Load unpacked**.
6. Select the extracted folder that directly contains `manifest.json`, `popup.html`, `popup.js`, `background.js`, and `offscreen.html`. Do not select the ZIP file and do not select a parent folder containing the extracted folder.
7. Pin **Lecture Notebook AI** from Chrome’s extensions menu for quick access.
8. Click the extension icon to open the widget. Choose **Open website** to launch the workspace, or choose **Start recording** to open Chrome's native picker and select a tab, window, or screen. Stop the recording from the widget; Chrome saves a local WebM file and opens the workspace's review view with the recording handed into the browser-local media queue.
9. In the workspace, review or remove the received recording, then add/import a timestamped transcript to generate grounded notebook sections. The current static build does not yet transcribe raw WebM files automatically.

The extension-to-workspace handoff is browser-local: after a recording finishes, the extension downloads the WebM and opens the workspace review flow with the recording queued in the Media Review section. The current static frontend does not call an external AI transcription service, so raw WebM-to-transcript and AI note generation require an explicit transcript or a future AI-enabled backend; the app will not pretend that a recording has been transcribed when it has not.

### Updating the extension during development

Users do **not** need to uninstall and reinstall the widget after downloading an updated version. For a Load unpacked installation, replace the contents of the local extension folder with the updated files, open `chrome://extensions`, find **Lecture Notebook AI**, and click its **Reload** button. If you changed the manifest, also refresh any open tabs. A Load unpacked extension does not auto-update because it is a developer copy, but the **Reload** button applies the update in place.

For normal users, publish the extension through the Chrome Web Store. Chrome checks installed Web Store extensions for updates automatically, so users receive later versions without reinstalling. Each release should increment the manifest version and be submitted as a new Web Store package. A private/self-hosted installation can also use Chrome Enterprise’s update manifest, but a plain ZIP cannot update itself.

### Removing the extension

Open `chrome://extensions`, find **Lecture Notebook AI**, and click **Remove**. Removing the extension does not delete the notebook data stored by the website; use the app’s **Delete local data** action separately if you want to clear the workspace.

## Local development

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
pnpm test
pnpm run check
pnpm run build
```

### Synchronize the version number

Use the version-bump script whenever a release version changes. It updates the extension manifest, package metadata, README beta badge, and latest release-notes heading/date together:

```bash
pnpm version:bump 1.03
# or: node scripts/bump-version.mjs 1.03
```

The public website exposes the current user-facing version as `1.03`, while Chrome-compatible package versions use the equivalent `1.3.0` format. Review `RELEASE_NOTES.md` after bumping and add the new change summary before committing.

### Report a beta bug

Use **Report beta bug** in the top bar or the **Report a beta bug** quick action. The button opens a prefilled GitHub Issue template with fields for the behavior, reproduction steps, browser, device, and supporting details. Do not include private lecture content in a report.

## Use the GitHub repository

Clone the repository with GitHub CLI:

```bash
gh repo clone XenogenesisXtreme/lecture-notebook-ai-mvp
cd lecture-notebook-ai-mvp
pnpm install
pnpm dev
```

Or clone it with Git:

```bash
git clone https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp.git
cd lecture-notebook-ai-mvp
pnpm install
```

After making changes, run the checks and push them to the `main` branch:

```bash
pnpm test
pnpm run check
pnpm run build
git add .
git commit -m "Describe the change"
git push origin main
```

The repository is maintained by **Xenogenesis Xtreme** (`@XenogenesisXtreme`). To make future commits display your GitHub identity, configure your local repository with the name and a GitHub-associated email address:

```bash
git config user.name "Xenogenesis Xtreme"
git config user.email "YOUR_GITHUB_EMAIL_OR_NO_REPLY_EMAIL"
```

The repository owner and public maintainer identity are controlled by the GitHub account, while individual commit authors are controlled by the Git author configuration. Existing commits retain their original author metadata; new commits will use the identity configured above.

The extension files are in `extension/`. To recreate the downloadable archive locally:

```bash
rm -f client/public/lecture-notebook-ai-extension.zip
cd extension && zip -r ../client/public/lecture-notebook-ai-extension.zip manifest.json popup.html popup.js background.js offscreen.html offscreen.js privacy-policy.md store-listing.md icons
```

## Project structure

```text
client/src/pages/Home.tsx       Main workspace UI and browser flows
client/src/lib/lecture.ts       Lecture schema, notebook generation, and exports
client/src/lib/media.ts         Media classification, OCR, capture, persistence, and frames
client/src/lib/media.test.ts    Media utility tests
extension/                      MV3 Chrome extension source and icons
brand/                          Repository banner, logo, and product screenshots
STAGE3.md                       Stage 3 implementation notes
STAGE4.md                       Stage 4 implementation notes
STAGE5.md                       Stage 5 media review notes
STAGE6.md                       Stage 6 grounding and publishing notes
RELEASE_NOTES.md                Latest Beta v1.02 release notes only
CHANGELOG.md                    Complete historical change record
LICENSE                         MIT License
```

## Current limitations

Speech recognition and screen capture still vary by browser and operating system, and Tesseract.js may be slower on large images; language packs are cached after their first successful scan. The extension records the user-selected desktop source locally but does not transcribe the recording or inject controls into video-conferencing applications. Production-distribution metadata and a public privacy policy are included at [`/privacy.html`](https://lecturenoteb-hxgiwwjj.manus.space/privacy.html). Chrome Web Store submission remains a release step.

## License

MIT

## Stage 6 upgrades

- **Transcript-to-topic alignment:** imported, restored, demo, and captured transcript moments are assigned to the notebook section whose timestamp range contains them. The transcript drawer shows a topic chip and links directly to that section.
- **OCR language-pack caching:** the selected OCR language is cached locally after its first successful scan. The media lab reports whether the language pack is cached and shows live OCR progress during a scan.
- **Chrome Web Store preparation:** `extension/store-listing.md` contains the short description, detailed listing copy, permission justifications, category, tags, support URL, and publishing checklist. `extension/privacy-policy.md` documents the local-first data model and safety boundaries.

Before submitting to the Chrome Web Store, publish the privacy policy at a stable public URL and add that URL to the Developer Dashboard listing. The current extension is intentionally a launcher and does not automatically read page content or record tabs.

## License

This project is released under the **MIT License**. See [LICENSE](LICENSE). Copyright © 2026 Xenogenesis Xtreme.

The MIT License permits reuse, modification, distribution, sublicensing, and commercial use as long as the copyright and permission notice are retained. The software is provided without warranty.
