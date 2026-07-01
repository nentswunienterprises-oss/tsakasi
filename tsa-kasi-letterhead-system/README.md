# Tsa Kasi Letterhead System

A reusable Node.js document engine for Tsa Kasi Logistics that turns Markdown content into:

- A branded A4 PDF letterhead.
- A lighter rich HTML email output.

The design recreates the downloaded Canva reference in code using HTML and CSS, with an optional image-based fallback layer if you later export a `canva-reference.png`.

## Folder layout

```text
tsa-kasi-letterhead-system/
  assets/
    tsa-kasi-logo.png
    canva-reference.pdf
    canva-reference.png   # optional fallback overlay asset
  content/
    sample-letter.md
    sample-proposal.md
    sample-quotation.md
  templates/
    tsa-kasi-letter-pdf.html
    tsa-kasi-email.html
  output/
  generate-pdf.js
  generate-email.js
  render-utils.js
  package.json
  README.md
```

## Setup

From the project root:

```bash
cd tsa-kasi-letterhead-system
npm install
```

## Generate outputs

PDF:

```bash
npm run pdf -- content/sample-letter.md
```

Email HTML:

```bash
npm run email -- content/sample-letter.md
```

Direct Node commands also work:

```bash
node generate-pdf.js content/sample-proposal.md
node generate-email.js content/sample-quotation.md
```

Generated files are written to `output/`.

## Frontmatter variables

Each Markdown file can include frontmatter like this:

```yaml
---
documentTitle: Partnership Proposal
clientName: Romans Pizza Modimolle
referenceNumber: TKL-2026-001
date: 29 June 2026
footer: Tsa Kasi Logistics (Pty) Ltd | Merchant support and delivery operations.
---
```

Supported template variables:

- `{{BODY}}`
- `{{DATE}}`
- `{{DOCUMENT_TITLE}}`
- `{{CLIENT_NAME}}`
- `{{REFERENCE_NUMBER}}`
- `{{FOOTER}}`

## Optional overrides

You can override metadata from the command line:

```bash
node generate-pdf.js content/sample-letter.md --title="Investor Update" --client="Nenterprises Stakeholders" --reference="TKL-2026-010"
```

Other supported flags:

- `--date="29 June 2026"`
- `--footer="Custom footer text"`
- `--output=output/custom-name.pdf`
- `--use-reference-background`

For email generation, use the same flags with `generate-email.js`.

## Asset replacement

Current seeded assets:

- `assets/tsa-kasi-logo.png` was copied from the local `Downloads` folder and is the closest available Tsa Kasi logo asset.
- `assets/canva-reference.pdf` was copied from the downloaded Canva file for reference.

To replace them:

1. Put the preferred transparent Tsa Kasi logo file at `assets/tsa-kasi-logo.png`.
2. If you want the optional background overlay mode, export the Canva design as a PNG and save it as `assets/canva-reference.png`.
3. Re-run the generator command.

## Design notes

- Brand colors and sizing controls live at the top of `templates/tsa-kasi-letter-pdf.html`.
- The PDF uses fixed-position layout layers so the black background, cyan stripe, orange accent, and logo repeat across Chromium-rendered pages as content flows.
- The email template intentionally uses a lighter canvas and table-based structure so it is easier to paste into email tools later.

## Troubleshooting

If `npm install` struggles with Chromium:

- Re-run the install while connected to the internet because Puppeteer downloads a browser dependency.
- If your environment already has Chrome installed and you want to use it instead, update `generate-pdf.js` to pass an `executablePath`.

If the PDF renders without the brand background:

- Confirm the command uses Chromium through Puppeteer.
- Make sure `printBackground: true` remains enabled in `generate-pdf.js`.

If an asset is missing:

- Confirm `assets/tsa-kasi-logo.png` exists.
- The fallback overlay mode only works when `assets/canva-reference.png` exists.

If a path fails:

- Run commands from inside `tsa-kasi-letterhead-system`.
- Use forward slashes in content paths, for example `content/sample-letter.md`.
