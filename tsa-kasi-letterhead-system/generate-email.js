import {
  getAssetDataUri,
  parseCliOptions,
  readMarkdownDocument,
  renderTemplate,
  resolveOutputName,
  writeResolvedOutput
} from './render-utils.js';

async function main() {
  const options = parseCliOptions();
  const documentInfo = await readMarkdownDocument(options.inputPath, options.overrides);
  const logoDataUri = await getAssetDataUri('tsa-kasi-logo.png');

  const renderedHtml = await renderTemplate('tsa-kasi-email.html', {
    BODY: documentInfo.htmlBody,
    DATE: documentInfo.variables.date,
    DOCUMENT_TITLE: documentInfo.variables.documentTitle,
    CLIENT_NAME: documentInfo.variables.clientName,
    REFERENCE_NUMBER: documentInfo.variables.referenceNumber,
    FOOTER: documentInfo.variables.footer,
    LOGO_DATA_URI: logoDataUri
  });

  const outputPath = resolveOutputName(documentInfo, '-email.html', options.outputPath);
  await writeResolvedOutput(outputPath, renderedHtml, false);
  console.log(`Email HTML generated: ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
