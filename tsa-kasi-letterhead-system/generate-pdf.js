import { parseCliOptions } from './render-utils.js';
import { generateAndWritePdfDocument } from './pdf-service.js';

async function main() {
  const options = parseCliOptions();
  const result = await generateAndWritePdfDocument({
    inputPath: options.inputPath,
    outputPath: options.outputPath,
    overrides: options.overrides,
    useReferenceBackground: options.useReferenceBackground
  });
  console.log(`PDF generated: ${result.outputPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
