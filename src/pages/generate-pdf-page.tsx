import { useEffect, useState } from "react";

import { DocumentComposerPanel } from "@/components/document-composer-panel";
import { useDocumentDrafts } from "@/hooks/use-document-drafts";
import {
  buildMarkdownFromComposer,
  createDocumentComposerState,
} from "@/lib/document-composer";
import { parseEmailDocument } from "@/lib/email-generator";

export function GeneratePdfPage() {
  const [composer, setComposer] = useState(createDocumentComposerState("letter"));
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [useReferenceBackground, setUseReferenceBackground] = useState(false);
  const {
    draftName,
    draftStatus,
    drafts,
    setDraftName,
    saveDraft,
    loadDraft,
    deleteDraft,
  } = useDocumentDrafts(composer, setComposer);
  const markdownSource = buildMarkdownFromComposer(composer);
  const parsedDocument = parseEmailDocument(markdownSource);
  const downloadFileName = `${slugify(parsedDocument.variables.documentTitle) || "tsa-kasi-document"}.pdf`;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function generatePdf() {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown: markdownSource,
          fileName: `${downloadFileName.replace(/\.pdf$/, "")}.md`,
          useReferenceBackground,
        }),
      });

      if (!response.ok) {
        const payload = (await safeParseJson(response)) as { error?: string } | null;
        throw new Error(payload?.error || "PDF generation failed.");
      }

      const pdfBlob = await response.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);

      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }

        return objectUrl;
      });

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = downloadFileName;
      link.click();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "PDF generation failed.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="generator-page-intro">
        <div className="generator-page-intro-copy">
          <p className="eyebrow">Internal Letterhead Tool</p>
          <h1>Generate branded Tsa Kasi PDFs.</h1>
          <p className="generator-page-intro-text">
            Use the same internal document composer for letters, proposals, and
            quotations, then render a formal A4 PDF on the branded letterhead.
          </p>
          <div className="generator-chip-row">
            <span className="generator-chip">Internal only</span>
            <span className="generator-chip">Structured quotation tables</span>
            <span className="generator-chip">A4 PDF output</span>
          </div>
        </div>

        <div className="generator-page-intro-card">
          <p className="hero-card-label">Current output</p>
          <h2 className="generator-page-intro-title">
            {parsedDocument.variables.documentTitle}
          </h2>
          <p className="generator-page-intro-meta">{parsedDocument.variables.clientName}</p>
          <div className="generator-metadata-list">
            <p>
              <strong>Type:</strong> {capitalize(composer.kind)}
            </p>
            <p>
              <strong>Date:</strong> {parsedDocument.variables.date}
            </p>
            <p>
              <strong>Preview:</strong> PDF output view
            </p>
          </div>
        </div>
      </section>

      <section className="generator-workbench">
        <DocumentComposerPanel
          draftName={draftName}
          draftStatus={draftStatus}
          drafts={drafts}
          onDeleteDraft={deleteDraft}
          onDraftNameChange={setDraftName}
          onLoadDraft={loadDraft}
          onSaveDraft={saveDraft}
          previewHref="#pdf-preview"
          state={composer}
          toolsId="generator-tools"
          onChange={setComposer}
        />

        <section className="generator-preview-column">
          <article className="generator-preview-panel" id="pdf-preview">
            <div className="generator-preview-topbar">
              <div className="section-head section-head-tight">
                <p className="eyebrow">Preview</p>
                <h2>Branded output view</h2>
                <p>
                  Generate the latest A4 file, then review it here without losing
                  your place in the tools panel.
                </p>
              </div>

              <div className="generator-preview-actions">
                <a className="button button-ghost" href="#generator-tools">
                  Back to Tools
                </a>
                <label className="generator-toggle-card">
                  <input
                    type="checkbox"
                    checked={useReferenceBackground}
                    onChange={(event) =>
                      setUseReferenceBackground(event.target.checked)
                    }
                  />
                  <span>Use Canva fallback layer</span>
                </label>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void generatePdf()}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating PDF..." : "Generate PDF"}
                </button>
              </div>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="generator-preview-shell generator-preview-shell-pdf">
              {previewUrl ? (
                <iframe
                  className="generator-preview-frame generator-preview-frame-pdf"
                  src={previewUrl}
                  title="Generated Tsa Kasi PDF preview"
                />
              ) : (
                <div className="generator-preview-empty">
                  Generate a PDF to preview the branded output here.
                </div>
              )}
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
