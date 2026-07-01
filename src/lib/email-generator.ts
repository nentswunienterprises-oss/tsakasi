import { marked } from "marked";

export type EmailDocumentVariables = {
  clientName: string;
  date: string;
  documentTitle: string;
  footer: string;
  referenceNumber: string;
};

export type ParsedEmailDocument = {
  body: string;
  htmlBody: string;
  variables: EmailDocumentVariables;
};

type SampleDocumentKey = "letter" | "proposal" | "quotation";
type EmailDocumentFrontmatter = Partial<EmailDocumentVariables> &
  Record<string, string>;

const DEFAULT_VARIABLES: EmailDocumentVariables = {
  clientName: "Valued Partner",
  date: formatDocumentDate(new Date()),
  documentTitle: "General Letter",
  footer:
    "Tsa Kasi Logistics | Merchant support, delivery operations, and strategic growth under Nenterprises.",
  referenceNumber: "TKL-GEN-001",
};

const SAMPLE_DOCUMENTS: Record<SampleDocumentKey, string> = {
  letter: `---
documentTitle: Merchant Follow-Up Letter
clientName: Romans Pizza Modimolle
referenceNumber: TKL-2026-001
footer: Tsa Kasi Logistics | Merchant support, delivery operations, and strategic growth under Nenterprises.
---

Dear Romans Pizza Modimolle Team,

Thank you for taking the time to review the Tsa Kasi Logistics opportunity. We appreciate the role your store plays in local commerce and believe there is strong potential to create a delivery partnership that improves convenience for customers while strengthening your store's order capacity.

Our operating focus is simple:

- Extend your delivery reach without forcing you to build the full delivery layer internally.
- Protect your brand experience with a structured, professional communication flow.
- Create a dependable local logistics partner that understands township and regional trade realities.

We would welcome a short follow-up meeting to align on rollout requirements, expected volumes, and the service model that best fits your branch. If useful, we can also prepare a branch-specific activation outline covering staffing, delivery radius, and communication expectations.

Please let us know a suitable time for a discussion this week or next week.

Kind regards,

**Tsa Kasi Logistics**`,
  proposal: `---
documentTitle: Partnership Proposal
clientName: Independent Merchant Network
referenceNumber: TKL-2026-002
---

## Executive Summary

Tsa Kasi Logistics proposes a structured partnership model for merchants that need reliable delivery execution, stronger local market access, and a more coordinated customer service layer around fulfilment.

## Proposed Value

- Branded last-mile delivery aligned to merchant reputation.
- Faster operational response for local and township delivery routes.
- A scalable partnership format that can expand from pilot stores to multi-location operations.

## Delivery Model

1. Store receives and confirms the order.
2. Tsa Kasi dispatches rider capacity according to agreed service windows.
3. Merchant and customer receive fulfilment updates through a simple communication flow.

## Next Step

We recommend a pilot phase with a clearly defined service radius, success metrics, and review cadence after the first operating month.`,
  quotation: `---
documentTitle: Service Quotation
clientName: Prospective Retail Partner
referenceNumber: TKL-2026-003
---

Thank you for requesting a quotation from Tsa Kasi Logistics. The outline below provides a sample commercial structure that can be refined once route density, order frequency, and branch requirements are confirmed.

## Quotation Summary

| Item | Description | Amount |
| --- | --- | ---: |
| Monthly Base Support | Rider coordination, dispatch oversight, merchant support | R4,500 |
| Delivery Fee per Drop | Last-mile delivery within agreed radius | R28 |
| Peak Support Buffer | Optional surge capacity allocation | R1,200 |

## Notes

- Final pricing may change based on average order volumes and delivery distance bands.
- Weekend and holiday service windows can be quoted separately.
- A formal service schedule will be attached once operational scope is approved.

We remain available to adjust this quotation to match your branch and trading environment.`,
};

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function getSampleDocument(key: SampleDocumentKey) {
  return SAMPLE_DOCUMENTS[key];
}

export function parseEmailDocument(source: string): ParsedEmailDocument {
  const { body, frontmatter } = splitFrontmatter(source);

  const variables: EmailDocumentVariables = {
    documentTitle: frontmatter.documentTitle || DEFAULT_VARIABLES.documentTitle,
    clientName: frontmatter.clientName || DEFAULT_VARIABLES.clientName,
    referenceNumber:
      frontmatter.referenceNumber || DEFAULT_VARIABLES.referenceNumber,
    footer: frontmatter.footer || DEFAULT_VARIABLES.footer,
    date: normalizeDateValue(frontmatter.date) || DEFAULT_VARIABLES.date,
  };

  return {
    body,
    htmlBody: marked.parse(body.trim()) as string,
    variables,
  };
}

export function updateEmailDocumentVariable(
  source: string,
  key: keyof EmailDocumentVariables,
  value: string,
) {
  const { body, frontmatter, hasFrontmatter } = splitFrontmatter(source);
  const nextFrontmatter: EmailDocumentFrontmatter = { ...frontmatter };
  const trimmedValue = value.trim();

  if (trimmedValue) {
    nextFrontmatter[key] = trimmedValue;
  } else {
    delete nextFrontmatter[key];
  }

  return composeEmailDocumentSource({
    body,
    frontmatter: nextFrontmatter,
    includeFrontmatter: hasFrontmatter || Object.keys(nextFrontmatter).length > 0,
  });
}

export function updateEmailDocumentBody(source: string, nextBody: string) {
  const { frontmatter, hasFrontmatter } = splitFrontmatter(source);

  return composeEmailDocumentSource({
    body: nextBody,
    frontmatter,
    includeFrontmatter: hasFrontmatter || Object.keys(frontmatter).length > 0,
  });
}

export function buildEmailHtml(
  document: ParsedEmailDocument,
  logoMarkup: string,
) {
  const brandedBody = buildEmailClipboardHtml(document, logoMarkup);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(document.variables.documentTitle)}</title>
  </head>
  <body style="margin:0;padding:16px 10px;background-color:#eef3f7;font-family:Aptos, 'Segoe UI', Arial, sans-serif;color:#0f1720;">
    <div style="max-width:700px;margin:0 auto;">${brandedBody}</div>
  </body>
</html>`;
}

export function buildEmailClipboardHtml(
  document: ParsedEmailDocument,
  logoMarkup: string,
) {
  const { variables, htmlBody } = document;
  const inlineStyledBody = inlineEmailContentHtml(htmlBody);
  const resolvedLogoMarkup =
    logoMarkup ||
    `<div style="display: inline-block; color: #ff9b05; font-size: 26px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;">Tsa Kasi</div>`;

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:0; border-collapse:collapse; background-color:#ffffff; border:1px solid #d8e0e8; font-family:Aptos, 'Segoe UI', Arial, sans-serif; color:#0f1720; table-layout:fixed;">
  <tr>
    <td style="padding:24px 18px 20px; background-color:#050505; text-align:center;">
      <div style="padding-bottom:12px;">${resolvedLogoMarkup}</div>
      <div style="font-size:30px; line-height:1.15; font-weight:800; color:#ffffff; letter-spacing:-0.03em; padding-bottom:12px; word-break:break-word;">${escapeHtml(variables.documentTitle)}</div>
      <div style="font-size:0; text-align:center;">
        <span style="display:inline-block; margin:4px; padding:7px 12px; border:1px solid rgba(255,255,255,0.12); border-radius:999px; background:rgba(255,255,255,0.05); font-size:12px; line-height:1.4; color:#d2deea; vertical-align:top;">${escapeHtml(variables.clientName)}</span>
        <span style="display:inline-block; margin:4px; padding:7px 12px; border:1px solid rgba(255,255,255,0.12); border-radius:999px; background:rgba(255,255,255,0.05); font-size:12px; line-height:1.4; color:#d2deea; vertical-align:top;">${escapeHtml(variables.referenceNumber)}</span>
        <span style="display:inline-block; margin:4px; padding:7px 12px; border:1px solid rgba(255,255,255,0.12); border-radius:999px; background:rgba(255,255,255,0.05); font-size:12px; line-height:1.4; color:#d2deea; vertical-align:top;">${escapeHtml(variables.date)}</span>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 18px 12px; background-color:#ffffff; word-break:break-word; overflow-wrap:anywhere;" class="content">${inlineStyledBody}</td>
  </tr>
  <tr>
    <td style="padding:0 18px 22px; background-color:#ffffff;">
      <div style="border-top:1px solid #d8e0e8; padding-top:14px; font-size:13px; line-height:1.65; color:#5d7081; word-break:break-word; overflow-wrap:anywhere;">${escapeHtml(variables.footer)}</div>
    </td>
  </tr>
</table>`;
}

function splitFrontmatter(source: string): {
  body: string;
  frontmatter: EmailDocumentFrontmatter;
  hasFrontmatter: boolean;
} {
  const normalizedSource = source.replace(/\r\n/g, "\n");

  if (!normalizedSource.startsWith("---\n")) {
    return {
      body: normalizedSource.trim(),
      frontmatter: {},
      hasFrontmatter: false,
    };
  }

  const endIndex = normalizedSource.indexOf("\n---\n", 4);

  if (endIndex === -1) {
    return {
      body: normalizedSource.trim(),
      frontmatter: {},
      hasFrontmatter: false,
    };
  }

  const frontmatterBlock = normalizedSource.slice(4, endIndex);
  const body = normalizedSource.slice(endIndex + 5).trim();
  const frontmatter = Object.fromEntries(
    frontmatterBlock
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
          return [line, ""];
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value];
      }),
  );

  return {
    body,
    frontmatter,
    hasFrontmatter: true,
  };
}

function composeEmailDocumentSource({
  body,
  frontmatter,
  includeFrontmatter,
}: {
  body: string;
  frontmatter: EmailDocumentFrontmatter;
  includeFrontmatter: boolean;
}) {
  const normalizedBody = body.replace(/\r\n/g, "\n").trim();

  if (!includeFrontmatter) {
    return normalizedBody;
  }

  const orderedEntries = [
    "documentTitle",
    "clientName",
    "referenceNumber",
    "date",
    "footer",
  ]
    .map((key) => [key, frontmatter[key]])
    .filter((entry): entry is [string, string] => Boolean(entry[1]));

  const remainingEntries = Object.entries(frontmatter).filter(
    ([key, value]) =>
      !orderedEntries.some(([orderedKey]) => orderedKey === key) &&
      Boolean(value),
  );

  const frontmatterBlock = [...orderedEntries, ...remainingEntries]
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  if (!frontmatterBlock) {
    return normalizedBody;
  }

  return `---\n${frontmatterBlock}\n---\n\n${normalizedBody}`;
}

function formatDocumentDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeDateValue(value: string | undefined) {
  if (!value) {
    return "";
  }

  return String(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value);
}

function inlineEmailContentHtml(htmlBody: string) {
  if (typeof DOMParser === "undefined") {
    return htmlBody;
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(`<div>${htmlBody}</div>`, "text/html");
  const wrapper = documentNode.body.firstElementChild;

  if (!wrapper) {
    return htmlBody;
  }

  wrapper.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "p") {
      appendInlineStyle(
        element,
        "margin: 0 0 18px; font-size: 17px; line-height: 1.75; color: #243240;",
      );
    }

    if (tagName === "h2") {
      appendInlineStyle(
        element,
        "margin: 24px 0 12px; font-size: 28px; line-height: 1.2; color: #0b1825;",
      );
    }

    if (tagName === "h3") {
      appendInlineStyle(
        element,
        "margin: 22px 0 12px; font-size: 23px; line-height: 1.25; color: #0b1825;",
      );
    }

    if (tagName === "h4") {
      appendInlineStyle(
        element,
        "margin: 18px 0 10px; font-size: 19px; line-height: 1.3; color: #0b1825;",
      );
    }

    if (tagName === "ul") {
      const isNestedList = element.parentElement?.tagName.toLowerCase() === "li";
      appendInlineStyle(
        element,
        isNestedList
          ? "margin: 8px 0 10px; padding-left: 18px;"
          : "margin: 12px 0 18px; padding-left: 22px;",
      );
    }

    if (tagName === "ol") {
      appendInlineStyle(element, "margin: 12px 0 18px; padding-left: 22px;");
    }

    if (tagName === "li") {
      appendInlineStyle(
        element,
        "margin: 0 0 10px; padding-left: 2px; font-size: 17px; line-height: 1.7; color: #243240;",
      );
    }

    if (tagName === "a") {
      appendInlineStyle(
        element,
        "color: #0079b8; text-decoration: underline; word-break: break-word;",
      );
    }

    if (tagName === "strong") {
      appendInlineStyle(element, "color: #0b1825;");
    }

    if (tagName === "table") {
      appendInlineStyle(
        element,
        "width: 100%; border-collapse: collapse; margin: 20px 0; table-layout: fixed;",
      );
    }

    if (tagName === "th") {
      appendInlineStyle(
        element,
        "padding: 10px 12px; border: 1px solid #d6e2ea; text-align: left; background-color: #f2f9fd; color: #0b1825; font-size: 14px; line-height: 1.4;",
      );
    }

    if (tagName === "td") {
      appendInlineStyle(
        element,
        "padding: 10px 12px; border: 1px solid #d6e2ea; text-align: left; color: #243240; font-size: 14px; line-height: 1.6; word-break: break-word;",
      );
    }
  });

  return wrapper.innerHTML;
}

function appendInlineStyle(element: Element, styleText: string) {
  const existingStyle = element.getAttribute("style");

  element.setAttribute(
    "style",
    existingStyle ? `${existingStyle.trim()} ${styleText}` : styleText,
  );
}
