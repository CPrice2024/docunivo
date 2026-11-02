# Docunivo — browser document and image tools

## Run locally

Install Node.js 22.18+ or 24+ and use a terminal in this folder:

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

The home page links to five dedicated tool pages: `/image-to-text/`,
`/image-to-excel/`, `/receipt-to-csv/`, `/pdf-ocr/`, and
`/background-remover/`. Each page has its own title and description.
Navigating to another tool opens a fresh workspace; download your results first.
The production build generates an `index.html` in each tool directory so direct
links and refreshes work on static hosts without custom rewrite rules.

## Languages

The core tool interface supports English, Hindi, French and Spanish. English
is the initial default. A non-blocking suggestion uses browser language preferences,
not GPS or IP geolocation. An explicit choice (including staying in English) is
saved locally when browser storage is available. Unsupported browser languages
fall back to English. Detailed guides, legal pages, editor controls and some
processing messages currently remain in English.

Image and PDF OCR have a separate document-language selector for these four
languages, defaulting to English. Receipt parsing remains English-only. Each OCR
language downloads its own language data on first use.

## Build

```bash
npm run build
```

Deploy the generated `dist/` directory to a static host.

For GitHub and Render setup, see [DEPLOYMENT.md](DEPLOYMENT.md).
The included `render.yaml` configures a Render Static Site for `docunivo.online`.

## Current features

- Image upload/drag-drop and preview (PNG/JPEG/WEBP/BMP, 12MB max)
- English text recognition with Tesseract.js 7 in the browser
- Editable OCR result, clipboard copy, TXT download
- Crop by dragging or entering percentages, rotate 90 degrees in either direction, and reset to the original image. Apply crop before OCR; recognition uses the edited image. Edits stay in the browser and clear prior OCR results.
- Recognition quality screening uses word confidence and symbol density. Empty results disable exports; uncertain results require explicit review before copy/download. Raw results remain editable. This is a heuristic and cannot prove that an image contains no text or determine whether an image was AI-generated.
- Image to Excel uses OCR word positions to group rows and infer shared column gaps, with an editable cell preview. Blank cells are retained. Review results: merged cells, wrapped text, rotated scans and complex layouts are not reliably reconstructed. Image to Text exports still use basic spacing separation.
- No file upload endpoint or external paid inference API
- Background Remover beta: ORMBG (`onnx-community/ormbg-ONNX`, Apache-2.0) with Transformers.js in a dedicated worker. Local processing, first-use model/runtime download, cancellation, original/cutout previews, checkerboard or solid preview backgrounds, transparent PNG download. Images up to 12 MB are resized to a maximum 2048-pixel edge. Fine edges and complex scenes are not guaranteed. Model source and attribution: https://huggingface.co/onnx-community/ormbg-ONNX and https://github.com/schirrmacher/ormbg. Transformers.js: https://github.com/huggingface/transformers.js. Keep upstream license/notice files when distributing.
- Scanned PDF OCR beta: local PDF.js rendering and sequential English Tesseract recognition. PDFs up to 30 MB; select up to 20 pages per run. Editable per-page text, review warnings, cancellation retaining completed pages, copy and TXT download. Rendering is bounded to approximately 4 million pixels per page. No searchable PDF export, original layout preservation or password prompt yet.
- Receipt to CSV beta: extracts English item lines with trailing decimal-point amounts, explicit quantities/unit prices, subtotal, tax, discount and total. Edit items and metadata, add/remove items, inspect unmatched lines and acknowledge review before download. Dates and currencies are entered manually. Decimal-comma formats, complex receipts and wrapped descriptions need manual correction. Totals checks warn but do not invent missing values.
- Table repair: select a cell, insert/delete rows and columns, merge adjacent columns, split by space/tab/comma/semicolon/vertical bar, and undo the last 20 edits. Merge joins values as text; it does not create Excel merged-cell formatting.
- CSV download uses the edited table, UTF-8 BOM, quoted fields, and formula-prefix neutralization for spreadsheet apps. XLSX and CSV downloads respect the OCR review requirement.

## Important before public launch

- Add a proper Privacy Policy, Terms, Contact and About pages and verify accuracy of privacy disclosures.
- Test for security, large-image performance, mobile memory limits and accessibility.
- Verify licensing and dependency security before publishing; SheetJS is installed from the official versioned CDN distribution.
- Language data and OCR worker are downloaded on first use; a network connection is initially required.
- Improve complex table recognition and PDF OCR accuracy in future iterations.

## Table detector checks

With Node.js 22.18+ or 24+, run `node --experimental-strip-types --test src/table.test.mjs`.
- Add page-specific SEO content, analytics and consider AdSense only after content and eligibility review.
