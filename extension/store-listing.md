# Chrome Web Store listing draft

## Short description

Open a privacy-first lecture notebook workspace from any Chrome tab.

## Detailed description

Lecture Notebook AI helps students turn lectures into structured, timestamped study notes. The web workspace supports transcript-first notebook generation, searchable source transcripts, visual highlights, browser-local media capture, OCR, frame review, multilingual speech/OCR selection, and print-ready exports.

The extension provides a lightweight widget with two actions: open the Lecture Notebook AI workspace, or start a user-confirmed recording. Recording opens Chrome's native picker so the user can choose a tab, window, or screen. The selected recording is handled locally, downloaded as a WebM file, and handed to the workspace's browser-local review queue when stopped. The extension does not automatically read page content, join meetings, or bypass host controls.

## Permissions justification

- `desktopCapture`: opens Chrome's source picker after the user clicks Start recording.
- `downloads`: saves the user's completed local WebM recording with their confirmation.
- `offscreen`: runs MediaRecorder outside the popup so recording continues after the widget closes.
- `storage`: keeps only the local recording-active state needed to update the widget.

## Category

Productivity / Education

## Suggested tags

lecture notes, study, transcript, OCR, education, student productivity, notebook

## Support and privacy URLs

- Support: `https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp/issues`
- Privacy policy: publish `privacy-policy.md` at a stable public URL before submitting to the Chrome Web Store.
- Homepage: `https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp`
