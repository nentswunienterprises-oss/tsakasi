export type DocumentKind = "letter" | "proposal" | "quotation";

export type LetterContentBlockType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "bullet"
  | "subBullet";

export type LetterContentBlock = {
  text: string;
  type: LetterContentBlockType;
};

export type QuotationRow = {
  amount: string;
  description: string;
  item: string;
};

export type DocumentComposerState = {
  clientName: string;
  date: string;
  documentTitle: string;
  footer: string;
  kind: DocumentKind;
  letter: {
    closing: string;
    greeting: string;
    introduction: string;
    bodyBlocks: LetterContentBlock[];
    senderPhone: string;
    senderName: string;
    senderTitle: string;
    senderWebsite: string;
    signOff: string;
    subject: string;
  };
  proposal: {
    deliverySteps: string[];
    executiveSummary: string;
    nextStep: string;
    valuePoints: string[];
  };
  quotation: {
    closing: string;
    introduction: string;
    notes: string[];
    rows: QuotationRow[];
  };
};

export const documentKindOptions: Array<{
  description: string;
  label: string;
  value: DocumentKind;
}> = [
  {
    value: "letter",
    label: "Letter",
    description: "Professional correspondence and merchant follow-up.",
  },
  {
    value: "proposal",
    label: "Proposal",
    description: "Structured partnership proposal with sections and steps.",
  },
  {
    value: "quotation",
    label: "Quotation",
    description: "Commercial quotation with a clean table and notes.",
  },
];

const DEFAULT_FOOTER =
  "Tsa Kasi Logistics (Pty) Ltd | Merchant support, delivery operations, and strategic growth under Waterberg.";

export function createDocumentComposerState(
  kind: DocumentKind = "letter",
): DocumentComposerState {
  const base = createBaseState();

  return {
    ...base,
    kind,
    documentTitle: defaultTitleFor(kind),
  };
}

export function hydrateDocumentComposerState(
  value: unknown,
  fallbackKind: DocumentKind = "letter",
): DocumentComposerState {
  const fallback = createDocumentComposerState(fallbackKind);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<DocumentComposerState> & {
    letter?: Partial<DocumentComposerState["letter"]> & {
      bodyBlocks?: unknown;
    };
    proposal?: Partial<DocumentComposerState["proposal"]>;
    quotation?: Partial<DocumentComposerState["quotation"]> & {
      rows?: unknown;
    };
  };
  const nextKind = isDocumentKind(candidate.kind) ? candidate.kind : fallback.kind;
  const kindDefaults = createDocumentComposerState(nextKind);

  return {
    ...kindDefaults,
    clientName: readString(candidate.clientName, kindDefaults.clientName),
    date: readString(candidate.date, kindDefaults.date),
    documentTitle: readString(candidate.documentTitle, kindDefaults.documentTitle),
    footer: readString(candidate.footer, kindDefaults.footer),
    kind: nextKind,
    letter: {
      ...kindDefaults.letter,
      subject: readString(candidate.letter?.subject, kindDefaults.letter.subject),
      greeting: readString(
        candidate.letter?.greeting,
        kindDefaults.letter.greeting,
      ),
      introduction: readString(
        candidate.letter?.introduction,
        kindDefaults.letter.introduction,
      ),
      bodyBlocks: readLetterBodyBlocks(
        candidate.letter?.bodyBlocks,
        kindDefaults.letter.bodyBlocks,
      ),
      closing: readString(candidate.letter?.closing, kindDefaults.letter.closing),
      signOff: readString(candidate.letter?.signOff, kindDefaults.letter.signOff),
      senderName: readString(
        candidate.letter?.senderName,
        kindDefaults.letter.senderName,
      ),
      senderTitle: readString(
        candidate.letter?.senderTitle,
        kindDefaults.letter.senderTitle,
      ),
      senderWebsite: readString(
        candidate.letter?.senderWebsite,
        kindDefaults.letter.senderWebsite,
      ),
      senderPhone: readString(
        candidate.letter?.senderPhone,
        kindDefaults.letter.senderPhone,
      ),
    },
    proposal: {
      ...kindDefaults.proposal,
      executiveSummary: readString(
        candidate.proposal?.executiveSummary,
        kindDefaults.proposal.executiveSummary,
      ),
      valuePoints: readStringList(
        candidate.proposal?.valuePoints,
        kindDefaults.proposal.valuePoints,
      ),
      deliverySteps: readStringList(
        candidate.proposal?.deliverySteps,
        kindDefaults.proposal.deliverySteps,
      ),
      nextStep: readString(
        candidate.proposal?.nextStep,
        kindDefaults.proposal.nextStep,
      ),
    },
    quotation: {
      ...kindDefaults.quotation,
      introduction: readString(
        candidate.quotation?.introduction,
        kindDefaults.quotation.introduction,
      ),
      rows: readQuotationRows(
        candidate.quotation?.rows,
        kindDefaults.quotation.rows,
      ),
      notes: readStringList(candidate.quotation?.notes, kindDefaults.quotation.notes),
      closing: readString(
        candidate.quotation?.closing,
        kindDefaults.quotation.closing,
      ),
    },
  };
}

export function switchDocumentKind(
  current: DocumentComposerState,
  nextKind: DocumentKind,
): DocumentComposerState {
  const currentDefaultTitle = defaultTitleFor(current.kind);
  const nextDefaultTitle = defaultTitleFor(nextKind);

  return {
    ...current,
    kind: nextKind,
    documentTitle:
      !current.documentTitle.trim() || current.documentTitle === currentDefaultTitle
        ? nextDefaultTitle
        : current.documentTitle,
  };
}

export function buildMarkdownFromComposer(state: DocumentComposerState) {
  const frontmatterLines = [
    `documentTitle: ${state.documentTitle}`,
    `clientName: ${state.clientName}`,
    `date: ${state.date}`,
    `footer: ${state.footer}`,
  ];

  return `---\n${frontmatterLines.join("\n")}\n---\n\n${buildBodyMarkdown(state)}`;
}

function buildBodyMarkdown(state: DocumentComposerState) {
  switch (state.kind) {
    case "proposal":
      return buildProposalMarkdown(state);
    case "quotation":
      return buildQuotationMarkdown(state);
    case "letter":
    default:
      return buildLetterMarkdown(state);
  }
}

function buildLetterMarkdown(state: DocumentComposerState) {
  const { letter } = state;
  const blocks: string[] = [];

  if (letter.subject.trim()) {
    blocks.push(
      `<h3 style="margin: 0; text-align: center;">${escapeInlineHtml(
        letter.subject.trim(),
      )}</h3>`,
    );
  }

  blocks.push(letter.greeting.trim() || `Dear ${state.clientName} Team,`);

  if (letter.introduction.trim()) {
    blocks.push(letter.introduction.trim());
  }

  const bodyBlockMarkdown = buildLetterBodyBlocksMarkdown(letter.bodyBlocks);

  if (bodyBlockMarkdown) {
    blocks.push(bodyBlockMarkdown);
  }

  if (letter.closing.trim()) {
    blocks.push(letter.closing.trim());
  }

  blocks.push(buildLetterSignatureMarkdown(letter));

  return blocks.filter(Boolean).join("\n\n");
}

function buildProposalMarkdown(state: DocumentComposerState) {
  const { proposal } = state;
  const blocks: string[] = [];

  if (proposal.executiveSummary.trim()) {
    blocks.push(`## Executive Summary\n\n${proposal.executiveSummary.trim()}`);
  }

  if (proposal.valuePoints.some((item) => item.trim())) {
    blocks.push(
      `## Proposed Value\n\n${proposal.valuePoints
        .filter(Boolean)
        .map((item) => `- ${item.trim()}`)
        .join("\n")}`,
    );
  }

  if (proposal.deliverySteps.some((item) => item.trim())) {
    blocks.push(
      `## Delivery Model\n\n${proposal.deliverySteps
        .filter(Boolean)
        .map((item, index) => `${index + 1}. ${item.trim()}`)
        .join("\n")}`,
    );
  }

  if (proposal.nextStep.trim()) {
    blocks.push(`## Next Step\n\n${proposal.nextStep.trim()}`);
  }

  return blocks.filter(Boolean).join("\n\n");
}

function buildLetterBodyBlocksMarkdown(blocks: LetterContentBlock[]) {
  const normalizedBlocks = blocks
    .map((block) => ({
      ...block,
      text: block.text.trim(),
    }))
    .filter((block) => block.text);

  if (normalizedBlocks.length === 0) {
    return "";
  }

  const lines: string[] = [];

  normalizedBlocks.forEach((block, index) => {
    if (index > 0) {
      const previousBlock = normalizedBlocks[index - 1];
      const currentIsList = isListBlock(block.type);
      const previousIsList = isListBlock(previousBlock.type);

      if (!currentIsList || !previousIsList) {
        lines.push("");
      }
    }

    lines.push(formatLetterBodyBlock(block));
  });

  return lines.join("\n");
}

function buildLetterSignatureMarkdown(letter: DocumentComposerState["letter"]) {
  const lines: string[] = [];

  lines.push(letter.signOff.trim() || "Kind regards");

  if (letter.senderName.trim()) {
    lines.push(`**${letter.senderName.trim()}**`);
  }

  if (letter.senderTitle.trim()) {
    lines.push(letter.senderTitle.trim());
  }

  if (letter.senderWebsite.trim()) {
    const website = normalizeWebsiteUrl(letter.senderWebsite);
    lines.push("", `[${letter.senderWebsite.trim()}](${website})`);
  }

  if (letter.senderPhone.trim()) {
    lines.push("", letter.senderPhone.trim());
  }

  return lines.filter((line, index, source) => {
    if (line !== "") {
      return true;
    }

    const previousLine = source[index - 1];
    const nextLine = source[index + 1];
    return Boolean(previousLine) && Boolean(nextLine);
  }).join("\n\n");
}

function buildQuotationMarkdown(state: DocumentComposerState) {
  const { quotation } = state;
  const blocks: string[] = [];

  if (quotation.introduction.trim()) {
    blocks.push(quotation.introduction.trim());
  }

  const populatedRows = quotation.rows.filter(
    (row) => row.item.trim() || row.description.trim() || row.amount.trim(),
  );

  if (populatedRows.length > 0) {
    const header = "| Item | Description | Amount |\n| --- | --- | ---: |";
    const rows = populatedRows.map(
      (row) =>
        `| ${sanitizeTableCell(row.item)} | ${sanitizeTableCell(
          row.description,
        )} | ${sanitizeTableCell(row.amount)} |`,
    );

    blocks.push(`## Quotation Summary\n\n${[header, ...rows].join("\n")}`);
  }

  if (quotation.notes.some((item) => item.trim())) {
    blocks.push(
      `## Notes\n\n${quotation.notes
        .filter(Boolean)
        .map((item) => `- ${item.trim()}`)
        .join("\n")}`,
    );
  }

  if (quotation.closing.trim()) {
    blocks.push(quotation.closing.trim());
  }

  return blocks.filter(Boolean).join("\n\n");
}

function createBaseState(): Omit<DocumentComposerState, "documentTitle" | "kind"> {
  return {
    clientName: "Romans Pizza Modimolle",
    date: formatDocumentDate(new Date()),
    footer: DEFAULT_FOOTER,
    letter: {
      subject: "Merchant Follow-Up Letter",
      greeting: "Dear Romans Pizza Modimolle Team,",
      introduction:
        "Thank you for taking the time to review the Tsa Kasi Logistics opportunity. We appreciate the role your store plays in local commerce and believe there is strong potential to create a delivery partnership that improves convenience for customers while strengthening your store's order capacity.",
      bodyBlocks: [
        {
          type: "paragraph",
          text: "Our operating focus is simple:",
        },
        {
          type: "bullet",
          text: "Extend your delivery reach without forcing you to build the full delivery layer internally.",
        },
        {
          type: "bullet",
          text: "Protect your brand experience with a structured, professional communication flow.",
        },
        {
          type: "bullet",
          text: "Create a dependable local logistics partner that understands township and regional trade realities.",
        },
      ],
      closing:
        "We would welcome a short follow-up meeting to align on rollout requirements, expected volumes, and the service model that best fits your branch. If useful, we can also prepare a branch-specific activation outline covering staffing, delivery radius, and communication expectations.",
      signOff: "Kind regards",
      senderName: "Thendo Nentswuni",
      senderTitle: "Founder & CEO, Tsa Kasi Logistics",
      senderWebsite: "www.tsakasilogistics.co.za",
      senderPhone: "065 067 9891",
    },
    proposal: {
      executiveSummary:
        "Tsa Kasi Logistics proposes a structured partnership model for merchants that need reliable delivery execution, stronger local market access, and a more coordinated customer service layer around fulfilment.",
      valuePoints: [
        "Branded last-mile delivery aligned to merchant reputation.",
        "Faster operational response for local and township delivery routes.",
        "A scalable partnership format that can expand from pilot stores to multi-location operations.",
      ],
      deliverySteps: [
        "Store receives and confirms the order.",
        "Tsa Kasi dispatches rider capacity according to agreed service windows.",
        "Merchant and customer receive fulfilment updates through a simple communication flow.",
      ],
      nextStep:
        "We recommend a pilot phase with a clearly defined service radius, success metrics, and review cadence after the first operating month.",
    },
    quotation: {
      introduction:
        "Thank you for requesting a quotation from Tsa Kasi Logistics. The outline below provides a sample commercial structure that can be refined once route density, order frequency, and branch requirements are confirmed.",
      rows: [
        {
          item: "Monthly Base Support",
          description:
            "Rider coordination, dispatch oversight, merchant support",
          amount: "R4,500",
        },
        {
          item: "Delivery Fee per Drop",
          description: "Last-mile delivery within agreed radius",
          amount: "R28",
        },
        {
          item: "Peak Support Buffer",
          description: "Optional surge capacity allocation",
          amount: "R1,200",
        },
      ],
      notes: [
        "Final pricing may change based on average order volumes and delivery distance bands.",
        "Weekend and holiday service windows can be quoted separately.",
        "A formal service schedule will be attached once operational scope is approved.",
      ],
      closing:
        "We remain available to adjust this quotation to match your branch and trading environment.",
    },
  };
}

function defaultTitleFor(kind: DocumentKind) {
  switch (kind) {
    case "proposal":
      return "Partnership Proposal";
    case "quotation":
      return "Service Quotation";
    case "letter":
    default:
      return "Merchant Follow-Up Letter";
  }
}

function formatDocumentDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function sanitizeTableCell(value: string) {
  return value.trim().replace(/\|/g, "\\|");
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function readStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value.filter((item): item is string => typeof item === "string");
  return normalized.length > 0 ? normalized : fallback;
}

function readLetterBodyBlocks(
  value: unknown,
  fallback: LetterContentBlock[],
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<LetterContentBlock>;

      if (
        !candidate.type ||
        !isLetterContentBlockType(candidate.type) ||
        typeof candidate.text !== "string"
      ) {
        return null;
      }

      return {
        type: candidate.type,
        text: candidate.text,
      } satisfies LetterContentBlock;
    })
    .filter((item): item is LetterContentBlock => Boolean(item));

  return normalized.length > 0 ? normalized : fallback;
}

function readQuotationRows(value: unknown, fallback: QuotationRow[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = item as Partial<QuotationRow>;

      return {
        item: typeof candidate.item === "string" ? candidate.item : "",
        description:
          typeof candidate.description === "string" ? candidate.description : "",
        amount: typeof candidate.amount === "string" ? candidate.amount : "",
      } satisfies QuotationRow;
    })
    .filter((item): item is QuotationRow => Boolean(item));

  return normalized.length > 0 ? normalized : fallback;
}

function isDocumentKind(value: unknown): value is DocumentKind {
  return value === "letter" || value === "proposal" || value === "quotation";
}

function isLetterContentBlockType(value: unknown): value is LetterContentBlockType {
  return (
    value === "paragraph" ||
    value === "heading" ||
    value === "subheading" ||
    value === "bullet" ||
    value === "subBullet"
  );
}

function escapeInlineHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function formatLetterBodyBlock(block: LetterContentBlock) {
  switch (block.type) {
    case "heading":
      return `## ${block.text}`;
    case "subheading":
      return `### ${block.text}`;
    case "bullet":
      return `- ${block.text}`;
    case "subBullet":
      return `    - ${block.text}`;
    case "paragraph":
    default:
      return block.text;
  }
}

function isListBlock(type: LetterContentBlockType) {
  return type === "bullet" || type === "subBullet";
}
