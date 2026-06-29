declare module "../tsa-kasi-letterhead-system/pdf-service.js" {
  export function generatePdfDocument(options: {
    fileBaseName?: string;
    inputPath?: string;
    markdownSource?: string;
    outputPath?: string;
    overrides?: Record<string, string>;
    useReferenceBackground?: boolean;
  }): Promise<{
    documentInfo: {
      inputBaseName: string;
      variables: {
        clientName: string;
        date: string;
        documentTitle: string;
        footer: string;
        referenceNumber: string;
      };
    };
    fileName: string;
    outputPath: string;
    pdfBuffer: Buffer;
    renderedHtml: string;
  }>;
}
