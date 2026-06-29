export type DocumentKind = "letter" | "proposal" | "quotation";

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
    focusPoints: string[];
    greeting: string;
    introduction: string;
    recipient: string;
    senderName: string;
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
  referenceNumber: string;
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
  "Tsa Kasi Logistics | Merchant support, delivery operations, and strategic growth under Nenterprises.";

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
    `referenceNumber: ${state.referenceNumber}`,
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

  if (letter.recipient.trim()) {
    blocks.push(`**To:** ${letter.recipient}`);
  }

  if (letter.subject.trim()) {
    blocks.push(`**Subject:** ${letter.subject}`);
  }

  blocks.push(letter.greeting.trim() || `Dear ${state.clientName} Team,`);

  if (letter.introduction.trim()) {
    blocks.push(letter.introduction.trim());
  }

  if (letter.focusPoints.some((item) => item.trim())) {
    blocks.push(
      ["Our operating focus is simple:", ...letter.focusPoints.filter(Boolean).map((item) => `- ${item.trim()}`)].join(
        "\n",
      ),
    );
  }

  if (letter.closing.trim()) {
    blocks.push(letter.closing.trim());
  }

  blocks.push(
    [letter.signOff.trim() || "Kind regards", `**${letter.senderName.trim() || "Tsa Kasi Logistics"}**`].join(
      "\n\n",
    ),
  );

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
      recipient: "Romans Pizza Modimolle Team",
      subject: "Merchant Follow-Up Letter",
      greeting: "Dear Romans Pizza Modimolle Team,",
      introduction:
        "Thank you for taking the time to review the Tsa Kasi Logistics opportunity. We appreciate the role your store plays in local commerce and believe there is strong potential to create a delivery partnership that improves convenience for customers while strengthening your store's order capacity.",
      focusPoints: [
        "Extend your delivery reach without forcing you to build the full delivery layer internally.",
        "Protect your brand experience with a structured, professional communication flow.",
        "Create a dependable local logistics partner that understands township and regional trade realities.",
      ],
      closing:
        "We would welcome a short follow-up meeting to align on rollout requirements, expected volumes, and the service model that best fits your branch. If useful, we can also prepare a branch-specific activation outline covering staffing, delivery radius, and communication expectations.",
      signOff: "Kind regards",
      senderName: "Tsa Kasi Logistics",
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
    referenceNumber: "TKL-2026-001",
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
