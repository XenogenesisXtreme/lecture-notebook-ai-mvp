# Lecture Notebook AI · Stage 3

## What is implemented

Stage 3 adds a local media intake layer for audio, video, images, TXT/Markdown transcripts, VTT/SRT subtitles, and structured JSON. Uploaded images become editable visual-highlight cards with timestamps and captions. Audio and video files are retained only in the current browser session and are marked as requiring a transcript before notebook generation; this static build does not silently upload media or call an external transcription service.

The visual utility layer includes media type classification, file-size formatting, visual fingerprints, duplicate filtering, and a deterministic frame-importance score based on change detection, text density, equations, diagram-like content, and teacher emphasis proximity. OCR is represented as an explicit “OCR-ready visual placeholder” rather than invented text.

PDF export is provided through a print-ready notebook layout. Choose **PDF / Print** and select **Save to PDF** in the browser print dialog. Markdown, HTML, and JSON export remain available through the workspace actions.

## Run commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm run check
pnpm run build
```

The app works on Windows, macOS, and Linux with Node.js 22+ and pnpm. No API keys are required for the local transcript and media-intake flows.

## Supported uploads

| Type | Behavior |
| --- | --- |
| TXT / Markdown | Parsed as a timestamped transcript when lines use `[HH:MM:SS] Speaker: text`. |
| VTT / SRT | Accepted as subtitle source files and shown as transcript-ready assets. |
| JSON | Accepted as a structured lecture-note source when it matches the note shape. |
| PNG / JPG / WebP | Added as an editable visual highlight with caption and related topic. |
| MP3 / WAV / M4A / WebM | Added as a local media asset and marked transcript-required. |
| MP4 / MOV / MKV | Added as a local media asset and marked transcript-required. |

## Manual test checklist

1. Open the app and click **Transcript-only demo**.
2. Open the media card in the right rail and add a slide image.
3. Confirm the image appears in Selected visuals and the uploaded asset list.
4. Add an audio or video file and confirm it is marked **Media attached · transcript required**.
5. Add a TXT/VTT/SRT transcript and confirm the asset becomes transcript-ready.
6. Edit a visual caption or topic explanation.
7. Choose **PDF / Print**, then choose **Save to PDF**.
8. Run `pnpm test`, `pnpm run check`, and `pnpm run build`.

## Consent and privacy

Live capture still requires the consent checklist and browser permission. The app does not join Zoom, bypass waiting rooms, hide recording state, or impersonate a student. The static build keeps media metadata and image object URLs in the current browser session; it does not upload files to a third-party service.

## Known limitations

Actual audio transcription, video frame extraction, OCR execution, and server-side media persistence are not included in this static build. Those require a server-side media adapter or a local runtime such as FFmpeg plus an explicitly configured transcription/OCR engine. The interface is designed so those capabilities can be added without changing the structured notebook schema.
