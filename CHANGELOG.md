# Lecture Notebook AI · Complete Changelog

This file records every repository change since the project was started. For only the latest release, see [RELEASE_NOTES.md](RELEASE_NOTES.md).

## Initial project bootstrap · `b01e129` · September 15, 2026

Created the Lecture Notebook AI static React workspace, including the WebDev scaffold, base routing, theme system, reusable UI components, error boundary, and initial Home/Not Found pages.

## Stage 1–2 foundation · `a481c02` · September 15, 2026

Added the transcript-only demonstration, strict lecture-note schema, timestamp utilities, notebook generation, editable notebook renderer, searchable timestamped transcript, visual highlight cards, consent-first live-capture shell, local save/delete actions, and Markdown, HTML, and JSON export. Added Vitest, TypeScript, production-build, and connected-browser verification.

## Workspace navigation and dark neon theme · `c7214b5` · September 15, 2026

Connected workspace tabs to the Notebook, Transcript, Visuals, Audio, and Review sections. Added the Audio tab and transcript-status anchor. Reworked the interface into a dark neon academic theme with accessible contrast and verified the interaction flow. Stage 3 media processing remained intentionally paused pending approval.

## Stage 3 media intake and PDF export · `84b001c` · September 15, 2026

Added media metadata and utilities for audio, video, image, transcript, subtitle, and structured uploads; visual frame scoring and deduplication; uploaded visual cards; media status handling; and browser print-to-PDF export. Added Stage 3 documentation and tests.

## Stage 4 browser media lab · `a803ee9` · September 16, 2026

Added browser-local IndexedDB persistence, capture helpers, visible capture preview, video frame extraction, native OCR hooks, Tesseract.js fallback OCR, Chrome speech-recognition compatibility, persistent workspace status, and local-data clearing across storage layers. Added Stage 4 documentation and tests.

## Chrome extension download and setup documentation · `6c61314` · September 16, 2026

Added the MV3 Chrome extension source, popup launcher, page helper, downloadable extension ZIP, load-unpacked instructions, privacy notes, and the first GitHub README extension workflow.

## GitHub usage and maintainer instructions · `4ad1782` · September 16, 2026

Added repository cloning, local development, commit, push, maintainer identity, and GitHub usage instructions. Updated local Git author configuration guidance for Xenogenesis Xtreme.

## Stage 5 review lab and repository branding · `368a0dd` · September 17, 2026

Added the media review timeline with All, Needs review, and Kept filters; per-asset keep/remove controls; multilingual speech and OCR selection for English, Hindi, Spanish, and French; generated repository branding; desktop and mobile product screenshots; extension icons; README badges and visuals; and Stage 5 documentation.

## Optimized repository branding assets · `3442522` · September 17, 2026

Reduced the logo and repository banner to checkpoint-safe web sizes, updated README asset references, and added a repeatable branding-optimization script.

## Project description update · `f30f509` · September 17, 2026

Updated the project description in the README and documented the related repository context.

## MIT License added · `7f60d19` · September 17, 2026

Added the MIT License to the repository, later finalized with Xenogenesis Xtreme as the copyright holder.

## Extension limitations and branding alignment · `bdde69b` · September 17, 2026

Aligned extension behavior and documentation with the privacy-first product boundary, clarified the consent-gated media-page controls, and synchronized extension branding.

## Public privacy policy route · `7b2038e` · September 17, 2026

Added a public privacy-policy route to the deployed app and supporting server/client routing so the policy can be referenced during extension publishing.

## Stage 6 grounding and publish-ready metadata · `1526903` · September 18, 2026

Added deterministic timestamp-based transcript-to-topic alignment for demo, imported, restored, and live-captured transcript lines. Added aligned topic chips and direct notebook links in the transcript drawer. Added local OCR language-pack cache markers and visible scan-progress UI. Added Chrome Web Store listing copy, privacy-policy documentation, manifest author/homepage/minimum-version metadata, Stage 6 documentation, and tests for alignment and OCR cache behavior.

## Refreshed extension archive after merge · `84aedc3` · September 18, 2026

Rebuilt the downloadable extension ZIP after merging the public privacy-policy route and remote extension updates. Verified the public repository, extension archive, tests, typecheck, and production build.

## Beta v1.02 release documentation · current

Marked the project as **Beta · Version 1.02** in the README. Added latest-only `RELEASE_NOTES.md`, linked release notes, complete changelog, and MIT License from the README, and documented the remaining beta limitations and verification status.
