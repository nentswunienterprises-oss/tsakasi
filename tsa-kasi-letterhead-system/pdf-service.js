import puppeteer from 'puppeteer';
import path from 'node:path';
import {
  getAssetDataUri,
  parseMarkdownSource,
  readMarkdownDocument,
  renderTemplate,
  resolveOutputName,
  tryGetReferenceBackgroundDataUri,
  writeResolvedOutput
} from './render-utils.js';

export async function renderPdfHtml(documentInfo, useReferenceBackground = false) {
  const logoDataUri = await getAssetDataUri('tsa-kasi-logo.png');
  const referenceBackgroundDataUri = useReferenceBackground
    ? await tryGetReferenceBackgroundDataUri()
    : '';

  return renderTemplate('tsa-kasi-letter-pdf.html', {
    BODY: documentInfo.htmlBody,
    DATE: documentInfo.variables.date,
    DOCUMENT_TITLE: documentInfo.variables.documentTitle,
    CLIENT_NAME: documentInfo.variables.clientName,
    REFERENCE_NUMBER: documentInfo.variables.referenceNumber,
    FOOTER: documentInfo.variables.footer,
    LOGO_DATA_URI: logoDataUri,
    REFERENCE_BACKGROUND_STYLE: referenceBackgroundDataUri
      ? `background-image: url('${referenceBackgroundDataUri}');`
      : '',
    REFERENCE_BACKGROUND_CLASS: referenceBackgroundDataUri ? 'reference-enabled' : 'reference-disabled'
  });
}

export async function generatePdfDocument(options) {
  const {
    inputPath = '',
    markdownSource = '',
    fileBaseName = 'document',
    outputPath = '',
    overrides = {},
    useReferenceBackground = false
  } = options ?? {};

  const documentInfo = inputPath
    ? await readMarkdownDocument(inputPath, overrides)
    : parseMarkdownSource(markdownSource, fileBaseName, overrides);

  const renderedHtml = await renderPdfHtml(documentInfo, useReferenceBackground);
  const browser = await puppeteer.launch({
    headless: 'new'
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
    await page.setContent(renderedHtml, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');
    await page.waitForSelector('.content-card');
    await page.waitForFunction(() =>
      Array.from(document.images).every((image) => image.complete)
    );

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });

    const resolvedOutputPath = resolveOutputName(documentInfo, '.pdf', outputPath);

    return {
      documentInfo,
      fileName: path.basename(resolvedOutputPath),
      outputPath: resolvedOutputPath,
      pdfBuffer,
      renderedHtml
    };
  } finally {
    await browser.close();
  }
}

export async function generateAndWritePdfDocument(options) {
  const result = await generatePdfDocument(options);
  await writeResolvedOutput(result.outputPath, result.pdfBuffer, true);
  return result;
}
