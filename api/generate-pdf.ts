type GeneratePdfBody = {
  fileName?: string;
  markdown?: string;
  overrides?: Record<string, string>;
  useReferenceBackground?: boolean;
};

type VercelLikeRequest = {
  method?: string;
  body?: GeneratePdfBody;
};

type VercelLikeResponse = {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => VercelLikeResponse;
  send?: (body: Buffer | string) => void;
  json: (body: unknown) => void;
};

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = req.body;

  if (!body?.markdown?.trim()) {
    res.status(400).json({ error: "Markdown content is required." });
    return;
  }

  try {
    const pdfServicePath = "../tsa-kasi-letterhead-system/pdf-service.js";
    const { generatePdfDocument } = await import(pdfServicePath);
    const result = await generatePdfDocument({
      markdownSource: body.markdown,
      fileBaseName: sanitizeBaseName(body.fileName),
      overrides:
        body.overrides && typeof body.overrides === "object"
          ? body.overrides
          : {},
      useReferenceBackground: body.useReferenceBackground === true,
    });

    res.setHeader?.("Content-Type", "application/pdf");
    res.setHeader?.(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );
    res.setHeader?.("Cache-Control", "no-store");

    if (typeof res.send === "function") {
      res.status(200);
      res.send(result.pdfBuffer);
      return;
    }

    res.status(500).json({
      error: "PDF response streaming is not available in this runtime.",
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({
      error:
        "PDF generation failed. Confirm Puppeteer dependencies are installed for this environment.",
    });
  }
}

function sanitizeBaseName(value?: string) {
  if (!value?.trim()) {
    return "tsa-kasi-document";
  }

  return (
    value
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_ ]+/g, "")
      .trim() || "tsa-kasi-document"
  );
}
