import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

marked.setOptions({
  breaks: true,
  gfm: true
});

function decodeArgValue(rawValue) {
  return rawValue?.replace(/^['"]|['"]$/g, '').trim();
}

function parseOriginalNpmArgs() {
  try {
    const payload = process.env.npm_config_argv;

    if (!payload) {
      return [];
    }

    const parsed = JSON.parse(payload);
    return parsed.original ?? [];
  } catch {
    return [];
  }
}

export function parseCliOptions(argv = process.argv.slice(2)) {
  const args = [...argv];
  const originalArgs = parseOriginalNpmArgs();
  const options = {
    inputPath: '',
    outputPath: '',
    useReferenceBackground: false,
    overrides: {}
  };

  while (args.length > 0) {
    const token = args.shift();

    if (!token) {
      continue;
    }

    if (token === '--use-reference-background') {
      options.useReferenceBackground = true;
      continue;
    }

    if (token.startsWith('--output=')) {
      options.outputPath = decodeArgValue(token.split('=').slice(1).join('=')) ?? '';
      continue;
    }

    if (token === '--output') {
      options.outputPath = decodeArgValue(args.shift()) ?? '';
      continue;
    }

    if (token.startsWith('--date=')) {
      options.overrides.date = decodeArgValue(token.split('=').slice(1).join('='));
      continue;
    }

    if (token === '--date') {
      options.overrides.date = decodeArgValue(args.shift());
      continue;
    }

    if (token.startsWith('--title=')) {
      options.overrides.documentTitle = decodeArgValue(token.split('=').slice(1).join('='));
      continue;
    }

    if (token === '--title') {
      options.overrides.documentTitle = decodeArgValue(args.shift());
      continue;
    }

    if (token.startsWith('--client=')) {
      options.overrides.clientName = decodeArgValue(token.split('=').slice(1).join('='));
      continue;
    }

    if (token === '--client') {
      options.overrides.clientName = decodeArgValue(args.shift());
      continue;
    }

    if (token.startsWith('--reference=')) {
      options.overrides.referenceNumber = decodeArgValue(token.split('=').slice(1).join('='));
      continue;
    }

    if (token === '--reference') {
      options.overrides.referenceNumber = decodeArgValue(args.shift());
      continue;
    }

    if (token.startsWith('--footer=')) {
      options.overrides.footer = decodeArgValue(token.split('=').slice(1).join('='));
      continue;
    }

    if (token === '--footer') {
      options.overrides.footer = decodeArgValue(args.shift());
      continue;
    }

    if (!options.inputPath) {
      options.inputPath = decodeArgValue(token) ?? '';
    }
  }

  if (!options.inputPath) {
    const npmInput = process.env.npm_config_input;

    if (npmInput) {
      options.inputPath = decodeArgValue(npmInput) ?? '';
    }
  }

  if (!options.inputPath && originalArgs.length > 2) {
    const candidate = originalArgs.find((value, index) => index > 1 && !value.startsWith('--'));

    if (candidate) {
      options.inputPath = decodeArgValue(candidate) ?? '';
    }
  }

  return options;
}

export function ensureInputPath(inputPath) {
  if (!inputPath) {
    throw new Error(
      'Missing content path. Use `npm run pdf -- content/sample-letter.md` or `node generate-pdf.js content/sample-letter.md`.'
    );
  }

  return path.isAbsolute(inputPath) ? inputPath : path.join(ROOT_DIR, inputPath);
}

export async function readMarkdownDocument(inputPath, overrides = {}) {
  const absolutePath = ensureInputPath(inputPath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  const inputBaseName = path.parse(absolutePath).name;

  return parseMarkdownSource(raw, inputBaseName, overrides, {
    absolutePath
  });
}

export function parseMarkdownSource(rawSource, fallbackName = 'document', overrides = {}, extraFields = {}) {
  const parsed = matter(rawSource);
  const frontmatter = parsed.data ?? {};
  const markdown = parsed.content.trim();
  const htmlBody = marked.parse(markdown);

  return {
    ...extraFields,
    inputBaseName: fallbackName,
    htmlBody,
    markdown,
    variables: buildTemplateVariables(frontmatter, overrides, fallbackName)
  };
}

function buildTemplateVariables(frontmatter, overrides, inputBaseName) {
  const merged = {
    documentTitle: frontmatter.documentTitle || humanizeFileName(inputBaseName),
    clientName: frontmatter.clientName || 'Valued Partner',
    referenceNumber: frontmatter.referenceNumber || 'TKL-GEN-001',
    footer:
      frontmatter.footer ||
      'Tsa Kasi Logistics (Pty) Ltd | Professional delivery, merchant enablement, and growth support under Nenterprises.',
    date: normalizeDateValue(frontmatter.date) || formatDocumentDate(new Date())
  };

  return {
    documentTitle: overrides.documentTitle || merged.documentTitle,
    clientName: overrides.clientName || merged.clientName,
    referenceNumber: overrides.referenceNumber || merged.referenceNumber,
    footer: overrides.footer || merged.footer,
    date: overrides.date || merged.date
  };
}

export async function renderTemplate(templateName, variables) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  let template = await fs.readFile(templatePath, 'utf8');

  for (const [key, value] of Object.entries(variables)) {
    template = template.replaceAll(`{{${key}}}`, String(value ?? ''));
  }

  return template;
}

export async function writeOutput(outputFileName, contents) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  await fs.writeFile(outputPath, contents, 'utf8');
  return outputPath;
}

export async function writeBinaryOutput(outputFileName, buffer) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

export async function getAssetDataUri(assetName) {
  const assetPath = path.join(ASSETS_DIR, assetName);
  const fileBuffer = await fs.readFile(assetPath);
  return `data:${mimeTypeFor(path.extname(assetName))};base64,${fileBuffer.toString('base64')}`;
}

export async function tryGetReferenceBackgroundDataUri() {
  const pngPath = path.join(ASSETS_DIR, 'canva-reference.png');

  try {
    const fileBuffer = await fs.readFile(pngPath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  } catch {
    return '';
  }
}

export function resolveOutputName(documentInfo, extension, explicitOutputPath = '') {
  if (explicitOutputPath) {
    return path.isAbsolute(explicitOutputPath)
      ? explicitOutputPath
      : path.join(ROOT_DIR, explicitOutputPath);
  }

  return path.join(OUTPUT_DIR, `${documentInfo.inputBaseName}${extension}`);
}

export async function writeResolvedOutput(targetPath, contents, isBinary = false) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  if (isBinary) {
    await fs.writeFile(targetPath, contents);
  } else {
    await fs.writeFile(targetPath, contents, 'utf8');
  }

  return targetPath;
}

function humanizeFileName(fileName) {
  return fileName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDocumentDate(date) {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function normalizeDateValue(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return formatDocumentDate(value);
  }

  return String(value);
}

function mimeTypeFor(extension) {
  switch (extension.toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export { ASSETS_DIR, OUTPUT_DIR, ROOT_DIR };
