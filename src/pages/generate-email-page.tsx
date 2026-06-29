import { useEffect, useState } from "react";

import { DocumentComposerPanel } from "@/components/document-composer-panel";
import {
  buildMarkdownFromComposer,
  createDocumentComposerState,
} from "@/lib/document-composer";
import { buildEmailHtml, parseEmailDocument } from "@/lib/email-generator";

export function GenerateEmailPage() {
  const [composer, setComposer] = useState(createDocumentComposerState("letter"));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [logoDataUri, setLogoDataUri] = useState("");
  const markdownSource = buildMarkdownFromComposer(composer);
  const parsedDocument = parseEmailDocument(markdownSource);
  const emailHtml = buildEmailHtml(parsedDocument, logoDataUri);
  const downloadFileName = `${slugify(parsedDocument.variables.documentTitle) || "tsa-kasi-email"}.html`;

  useEffect(() => {
    let cancelled = false;

    async function loadLogo() {
      try {
        const response = await fetch("/brand/tsa-kasi-logo.png");
        const blob = await response.blob();

        if (cancelled) {
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === "string") {
            setLogoDataUri(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        if (!cancelled) {
          setLogoDataUri("");
        }
      }
    }

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopyState("idle"), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  async function copyHtmlToClipboard() {
    try {
      const parser = new DOMParser();
      const documentNode = parser.parseFromString(emailHtml, "text/html");
      const richHtml = documentNode.body.innerHTML;
      const plainText =
        documentNode.body.textContent?.replace(/\s+\n/g, "\n").trim() ||
        emailHtml;

      if (
        "ClipboardItem" in window &&
        typeof navigator.clipboard.write === "function"
      ) {
        const clipboardItem = new ClipboardItem({
          "text/html": new Blob([richHtml], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });

        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  function downloadHtml() {
    const blob = new Blob([emailHtml], { type: "text/html;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = downloadFileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="page-stack">
      <section className="generator-page-intro">
        <div className="generator-page-intro-copy">
          <p className="eyebrow">Internal Communications Tool</p>
          <h1>Compose branded Tsa Kasi emails.</h1>
          <p className="generator-page-intro-text">
            This internal composer keeps letters, proposals, and quotations clean,
            structured, and consistent without exposing raw Markdown to the user.
          </p>
          <div className="generator-chip-row">
            <span className="generator-chip">Internal only</span>
            <span className="generator-chip">Structured inputs</span>
            <span className="generator-chip">Rich email copy</span>
          </div>
        </div>

        <div className="generator-page-intro-card">
          <p className="hero-card-label">Current output</p>
          <h2 className="generator-page-intro-title">
            {parsedDocument.variables.documentTitle}
          </h2>
          <p className="generator-page-intro-meta">
            {parsedDocument.variables.clientName} |{" "}
            {parsedDocument.variables.referenceNumber}
          </p>
          <div className="generator-metadata-list">
            <p>
              <strong>Type:</strong> {capitalize(composer.kind)}
            </p>
            <p>
              <strong>Date:</strong> {parsedDocument.variables.date}
            </p>
            <p>
              <strong>Preview:</strong> Branded email render
            </p>
          </div>
        </div>
      </section>

      <section className="generator-workbench">
        <DocumentComposerPanel
          previewHref="#email-preview"
          state={composer}
          toolsId="generator-tools"
          onChange={setComposer}
        />

        <section className="generator-preview-column">
          <article className="generator-preview-panel" id="email-preview">
            <div className="generator-preview-topbar">
              <div className="section-head section-head-tight">
                <p className="eyebrow">Preview</p>
                <h2>Branded output view</h2>
                <p>
                  Review the final branded email, then copy the rich HTML straight
                  into your email composer.
                </p>
              </div>

              <div className="generator-preview-actions">
                <a className="button button-ghost" href="#generator-tools">
                  Back to Tools
                </a>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={downloadHtml}
                >
                  Download HTML
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void copyHtmlToClipboard()}
                >
                  {copyState === "copied"
                    ? "Rich email copied"
                    : copyState === "error"
                      ? "Copy failed"
                      : "Copy Rich HTML"}
                </button>
              </div>
            </div>

            <div className="generator-preview-shell">
              <iframe
                className="generator-preview-frame"
                srcDoc={emailHtml}
                title="Generated Tsa Kasi email preview"
              />
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
