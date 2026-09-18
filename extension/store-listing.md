# Chrome Web Store listing draft

## Short description

Open a privacy-first lecture notebook workspace from any Chrome tab.

## Detailed description

Lecture Notebook AI helps students turn lectures into structured, timestamped study notes. The web workspace supports transcript-first notebook generation, searchable source transcripts, visual highlights, browser-local media capture, OCR, frame review, multilingual speech/OCR selection, and print-ready exports.

The extension provides a lightweight launcher. Its popup opens the Lecture Notebook AI workspace, while its small `LN` shortcut opens the workspace in a new tab. The extension does not automatically read page content, join meetings, record tabs, or bypass host controls.

## Permissions justification

- `activeTab`: reserved for the user-initiated extension action and future page-aware workflows; the current launcher does not automatically inspect page content.
- `storage`: reserved for extension preferences and future local settings; the current website stores notebook data in its own browser storage.
- Host permissions for the Manus deployment domains: allow the extension’s workspace launcher to open the deployed application.

## Category

Productivity / Education

## Suggested tags

lecture notes, study, transcript, OCR, education, student productivity, notebook

## Support and privacy URLs

- Support: `https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp/issues`
- Privacy policy: publish `privacy-policy.md` at a stable public URL before submitting to the Chrome Web Store.
- Homepage: `https://github.com/XenogenesisXtreme/lecture-notebook-ai-mvp`
