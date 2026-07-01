import {
  createDocumentComposerState,
  documentKindOptions,
  switchDocumentKind,
  type LetterContentBlockType,
  type DocumentComposerState,
  type DocumentKind,
} from "@/lib/document-composer";
import { type SavedDocumentDraft } from "@/lib/document-drafts";

type DocumentComposerPanelProps = {
  draftName: string;
  draftStatus: string;
  drafts: SavedDocumentDraft[];
  onDeleteDraft: (draftId: string) => void;
  previewHref: string;
  onDraftNameChange: (value: string) => void;
  onLoadDraft: (draftId: string) => void;
  onSaveDraft: () => void;
  state: DocumentComposerState;
  toolsId: string;
  onChange: (nextState: DocumentComposerState) => void;
};

export function DocumentComposerPanel({
  draftName,
  draftStatus,
  drafts,
  onDeleteDraft,
  previewHref,
  onDraftNameChange,
  onLoadDraft,
  onSaveDraft,
  state,
  toolsId,
  onChange,
}: DocumentComposerPanelProps) {
  const letterBlockTypeOptions: Array<{
    description: string;
    label: string;
    value: LetterContentBlockType;
  }> = [
    {
      value: "paragraph",
      label: "Paragraph",
      description: "Plain body text you can fully control.",
    },
    {
      value: "heading",
      label: "Heading",
      description: "Large section heading in the branded output.",
    },
    {
      value: "subheading",
      label: "Subheading",
      description: "Smaller section heading under a main heading.",
    },
    {
      value: "bullet",
      label: "Point",
      description: "Standard bullet point.",
    },
    {
      value: "subBullet",
      label: "Sub-Bullet",
      description: "Indented bullet under a main point.",
    },
  ];
  const primaryLetterBlockTypeOptions = letterBlockTypeOptions.filter(
    (option) => option.value !== "subBullet",
  );

  function updateRootField<
    Key extends "clientName" | "date" | "documentTitle" | "footer",
  >(key: Key, value: DocumentComposerState[Key]) {
    onChange({
      ...state,
      [key]: value,
    });
  }

  function updateLetterField<
    Key extends keyof DocumentComposerState["letter"],
  >(key: Key, value: DocumentComposerState["letter"][Key]) {
    onChange({
      ...state,
      letter: {
        ...state.letter,
        [key]: value,
      },
    });
  }

  function updateProposalField<
    Key extends keyof DocumentComposerState["proposal"],
  >(key: Key, value: DocumentComposerState["proposal"][Key]) {
    onChange({
      ...state,
      proposal: {
        ...state.proposal,
        [key]: value,
      },
    });
  }

  function updateQuotationField<
    Key extends keyof DocumentComposerState["quotation"],
  >(key: Key, value: DocumentComposerState["quotation"][Key]) {
    onChange({
      ...state,
      quotation: {
        ...state.quotation,
        [key]: value,
      },
    });
  }

  function updateStringList(
    section: "proposal" | "quotation",
    field: string,
    index: number,
    value: string,
  ) {
    const currentList = (state[section] as Record<string, unknown>)[field] as string[];
    const nextList = currentList.map((item, itemIndex) =>
      itemIndex === index ? value : item,
    );

    if (section === "proposal" && field === "valuePoints") {
      updateProposalField("valuePoints", nextList);
      return;
    }

    if (section === "proposal" && field === "deliverySteps") {
      updateProposalField("deliverySteps", nextList);
      return;
    }

    updateQuotationField("notes", nextList);
  }

  function addStringListItem(
    section: "proposal" | "quotation",
    field: string,
  ) {
    const currentList = (state[section] as Record<string, unknown>)[field] as string[];
    const nextList = [...currentList, ""];

    if (section === "proposal" && field === "valuePoints") {
      updateProposalField("valuePoints", nextList);
      return;
    }

    if (section === "proposal" && field === "deliverySteps") {
      updateProposalField("deliverySteps", nextList);
      return;
    }

    updateQuotationField("notes", nextList);
  }

  function removeStringListItem(
    section: "proposal" | "quotation",
    field: string,
    index: number,
  ) {
    const currentList = (state[section] as Record<string, unknown>)[field] as string[];
    const nextList = currentList.filter((_, itemIndex) => itemIndex !== index);

    if (section === "proposal" && field === "valuePoints") {
      updateProposalField("valuePoints", nextList.length ? nextList : [""]);
      return;
    }

    if (section === "proposal" && field === "deliverySteps") {
      updateProposalField("deliverySteps", nextList.length ? nextList : [""]);
      return;
    }

    updateQuotationField("notes", nextList.length ? nextList : [""]);
  }

  function updateLetterBodyBlockText(index: number, value: string) {
    updateLetterField(
      "bodyBlocks",
      state.letter.bodyBlocks.map((block, blockIndex) =>
        blockIndex === index
          ? {
              ...block,
              text: value,
            }
          : block,
      ),
    );
  }

  function updateLetterBodyBlockType(index: number, value: LetterContentBlockType) {
    updateLetterField(
      "bodyBlocks",
      state.letter.bodyBlocks.map((block, blockIndex) =>
        blockIndex === index
          ? {
              ...block,
              type: value,
            }
          : block,
      ),
    );
  }

  function addLetterBodyBlock(type: LetterContentBlockType) {
    updateLetterField("bodyBlocks", [
      ...state.letter.bodyBlocks,
      {
        type,
        text: "",
      },
    ]);
  }

  function insertLetterBodyBlock(index: number, type: LetterContentBlockType) {
    const nextBlocks = [...state.letter.bodyBlocks];

    nextBlocks.splice(index, 0, {
      type,
      text: "",
    });

    updateLetterField("bodyBlocks", nextBlocks);
  }

  function addSubBulletAfterBullet(index: number) {
    let insertAt = index + 1;

    while (state.letter.bodyBlocks[insertAt]?.type === "subBullet") {
      insertAt += 1;
    }

    insertLetterBodyBlock(insertAt, "subBullet");
  }

  function addBodyAfterHeading(index: number) {
    let insertAt = index + 1;

    while (state.letter.bodyBlocks[insertAt]?.type === "paragraph") {
      insertAt += 1;
    }

    insertLetterBodyBlock(insertAt, "paragraph");
  }

  function removeLetterBodyBlock(index: number) {
    const nextBlocks = state.letter.bodyBlocks.filter(
      (_, blockIndex) => blockIndex !== index,
    );

    updateLetterField("bodyBlocks", nextBlocks);
  }

  function updateQuotationRow(
    index: number,
    key: "amount" | "description" | "item",
    value: string,
  ) {
    const nextRows = state.quotation.rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [key]: value,
          }
        : row,
    );

    updateQuotationField("rows", nextRows);
  }

  function addQuotationRow() {
    updateQuotationField("rows", [
      ...state.quotation.rows,
      {
        item: "",
        description: "",
        amount: "",
      },
    ]);
  }

  function removeQuotationRow(index: number) {
    const nextRows = state.quotation.rows.filter((_, rowIndex) => rowIndex !== index);
    updateQuotationField(
      "rows",
      nextRows.length
        ? nextRows
        : [
            {
              item: "",
              description: "",
              amount: "",
            },
          ],
    );
  }

  function applyDocumentKind(kind: DocumentKind) {
    onChange(switchDocumentKind(state, kind));
  }

  function resetCurrentKind() {
    const nextState = createDocumentComposerState(state.kind);

    onChange({
      ...state,
      documentTitle: nextState.documentTitle,
      letter: nextState.letter,
      proposal: nextState.proposal,
      quotation: nextState.quotation,
    });
  }

  return (
    <aside className="generator-tools-shell" id={toolsId}>
      <article className="generator-panel generator-tools-panel">
        <div className="section-head section-head-tight">
          <p className="eyebrow">Internal Tools</p>
          <h2>Parsed variables</h2>
          <p>
            Use structured fields only. The generator builds the underlying
            document format for you.
          </p>
        </div>

        <div className="generator-kind-switcher">
          {documentKindOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`generator-kind-button${
                state.kind === option.value ? " generator-kind-button-active" : ""
              }`}
              onClick={() => applyDocumentKind(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>

        <div className="generator-inline-actions">
          <button
            type="button"
            className="button button-ghost"
            onClick={resetCurrentKind}
          >
            Reset {documentKindOptions.find((option) => option.value === state.kind)?.label}
          </button>
          <a className="button button-primary" href={previewHref}>
            Go to Preview
          </a>
        </div>

        <section className="generator-drafts-panel">
          <div className="generator-section-head">
            <h3>Drafts</h3>
            <p>Save named working versions, then reload them any time on this device.</p>
          </div>

          <div className="generator-draft-controls">
            <label className="generator-field">
              <span>Draft Name</span>
              <input
                type="text"
                value={draftName}
                onChange={(event) => onDraftNameChange(event.target.value)}
                placeholder="Merchant follow-up - Romans Pizza"
              />
            </label>
            <div className="generator-inline-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={onSaveDraft}
              >
                Save Draft
              </button>
            </div>
          </div>

          {draftStatus ? <p className="generator-draft-status">{draftStatus}</p> : null}

          {drafts.length > 0 ? (
            <div className="generator-draft-list">
              {drafts.map((draft) => (
                <div className="generator-draft-card" key={draft.id}>
                  <div className="generator-draft-card-copy">
                    <strong>{draft.name}</strong>
                    <span>
                      {capitalize(draft.state.kind)} | Updated{" "}
                      {formatDraftTimestamp(draft.updatedAt)}
                    </span>
                  </div>
                  <div className="generator-inline-actions">
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => onLoadDraft(draft.id)}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="generator-remove-button"
                      onClick={() => onDeleteDraft(draft.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="generator-draft-empty">
              No saved drafts yet. Save one to keep this work-in-progress.
            </p>
          )}
        </section>

        <div className="generator-field-grid">
          <label className="generator-field">
            <span>Document Title</span>
            <input
              type="text"
              value={state.documentTitle}
              onChange={(event) =>
                updateRootField("documentTitle", event.target.value)
              }
            />
          </label>
          <label className="generator-field">
            <span>Client Name</span>
            <input
              type="text"
              value={state.clientName}
              onChange={(event) => updateRootField("clientName", event.target.value)}
            />
          </label>
          <label className="generator-field">
            <span>Date</span>
            <input
              type="text"
              value={state.date}
              onChange={(event) => updateRootField("date", event.target.value)}
            />
          </label>
          <label className="generator-field generator-field-full">
            <span>Footer</span>
            <textarea
              rows={3}
              value={state.footer}
              onChange={(event) => updateRootField("footer", event.target.value)}
            />
          </label>
        </div>

        {state.kind === "letter" ? (
          <section className="generator-section-stack">
            <div className="generator-section-head">
              <h3>Letter Content</h3>
              <p>Structured correspondence fields for professional letters.</p>
            </div>

            <div className="generator-field-grid">
              <label className="generator-field">
                <span>Subject</span>
                <input
                  type="text"
                  value={state.letter.subject}
                  onChange={(event) =>
                    updateLetterField("subject", event.target.value)
                  }
                />
              </label>
              <label className="generator-field generator-field-full">
                <span>Greeting</span>
                <input
                  type="text"
                  value={state.letter.greeting}
                  onChange={(event) =>
                    updateLetterField("greeting", event.target.value)
                  }
                />
              </label>
              <label className="generator-field generator-field-full">
                <span>Introduction</span>
                <textarea
                  rows={5}
                  value={state.letter.introduction}
                  onChange={(event) =>
                    updateLetterField("introduction", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="generator-list-editor">
              <div className="generator-list-head">
                <div>
                  <h4>Structured Body Blocks</h4>
                  <p>Headings, bullets, and support lines stay fully editable here.</p>
                </div>
              </div>
              <div className="generator-inline-actions generator-inline-actions-wrap">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addLetterBodyBlock("paragraph")}
                >
                  Add Paragraph
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addLetterBodyBlock("heading")}
                >
                  Add Heading
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addLetterBodyBlock("subheading")}
                >
                  Add Subheading
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addLetterBodyBlock("bullet")}
                >
                  Add Point
                </button>
              </div>
              {state.letter.bodyBlocks.map((block, index) => (
                <div
                  className="generator-list-row generator-list-row-block"
                  key={`letter-block-${index}`}
                >
                  <div className="generator-block-editor">
                    <label className="generator-field">
                      <span>Block Type</span>
                      <select
                        value={block.type}
                        onChange={(event) =>
                          updateLetterBodyBlockType(
                            index,
                            event.target.value as LetterContentBlockType,
                          )
                        }
                      >
                        {(block.type === "subBullet"
                          ? letterBlockTypeOptions
                          : primaryLetterBlockTypeOptions
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <textarea
                      rows={2}
                      value={block.text}
                      onChange={(event) =>
                        updateLetterBodyBlockText(index, event.target.value)
                      }
                    />
                    <p className="generator-block-hint">
                      {
                        letterBlockTypeOptions.find(
                          (option) => option.value === block.type,
                        )?.description
                      }
                    </p>
                  </div>
                  {block.type === "bullet" ? (
                    <button
                      type="button"
                      className="button button-ghost generator-inline-block-button"
                      onClick={() => addSubBulletAfterBullet(index)}
                    >
                      Add Sub-Bullet
                    </button>
                  ) : null}
                  {block.type === "heading" || block.type === "subheading" ? (
                    <button
                      type="button"
                      className="button button-ghost generator-inline-block-button"
                      onClick={() => addBodyAfterHeading(index)}
                    >
                      Add Body
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="generator-remove-button"
                    onClick={() => removeLetterBodyBlock(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="generator-field-grid">
              <label className="generator-field generator-field-full">
                <span>Closing Paragraph</span>
                <textarea
                  rows={5}
                  value={state.letter.closing}
                  onChange={(event) =>
                    updateLetterField("closing", event.target.value)
                  }
                />
              </label>
              <label className="generator-field">
                <span>Sign-Off</span>
                <input
                  type="text"
                  value={state.letter.signOff}
                  onChange={(event) =>
                    updateLetterField("signOff", event.target.value)
                  }
                />
              </label>
              <label className="generator-field">
                <span>Sender Name</span>
                <input
                  type="text"
                  value={state.letter.senderName}
                  onChange={(event) =>
                    updateLetterField("senderName", event.target.value)
                  }
                />
              </label>
              <label className="generator-field">
                <span>Sender Title</span>
                <input
                  type="text"
                  value={state.letter.senderTitle}
                  onChange={(event) =>
                    updateLetterField("senderTitle", event.target.value)
                  }
                />
              </label>
              <label className="generator-field">
                <span>Website</span>
                <input
                  type="text"
                  value={state.letter.senderWebsite}
                  onChange={(event) =>
                    updateLetterField("senderWebsite", event.target.value)
                  }
                />
              </label>
              <label className="generator-field">
                <span>Phone</span>
                <input
                  type="text"
                  value={state.letter.senderPhone}
                  onChange={(event) =>
                    updateLetterField("senderPhone", event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        ) : null}

        {state.kind === "proposal" ? (
          <section className="generator-section-stack">
            <div className="generator-section-head">
              <h3>Proposal Content</h3>
              <p>Use sections and ordered delivery steps instead of freeform copy.</p>
            </div>

            <div className="generator-field-grid">
              <label className="generator-field generator-field-full">
                <span>Executive Summary</span>
                <textarea
                  rows={5}
                  value={state.proposal.executiveSummary}
                  onChange={(event) =>
                    updateProposalField("executiveSummary", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="generator-list-editor">
              <div className="generator-list-head">
                <h4>Proposed Value Points</h4>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addStringListItem("proposal", "valuePoints")}
                >
                  Add Value Point
                </button>
              </div>
              {state.proposal.valuePoints.map((item, index) => (
                <div className="generator-list-row" key={`proposal-value-${index}`}>
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(event) =>
                      updateStringList(
                        "proposal",
                        "valuePoints",
                        index,
                        event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="generator-remove-button"
                    onClick={() =>
                      removeStringListItem("proposal", "valuePoints", index)
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="generator-list-editor">
              <div className="generator-list-head">
                <h4>Delivery Steps</h4>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addStringListItem("proposal", "deliverySteps")}
                >
                  Add Step
                </button>
              </div>
              {state.proposal.deliverySteps.map((item, index) => (
                <div className="generator-list-row" key={`proposal-step-${index}`}>
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(event) =>
                      updateStringList(
                        "proposal",
                        "deliverySteps",
                        index,
                        event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="generator-remove-button"
                    onClick={() =>
                      removeStringListItem("proposal", "deliverySteps", index)
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="generator-field-grid">
              <label className="generator-field generator-field-full">
                <span>Next Step</span>
                <textarea
                  rows={4}
                  value={state.proposal.nextStep}
                  onChange={(event) =>
                    updateProposalField("nextStep", event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        ) : null}

        {state.kind === "quotation" ? (
          <section className="generator-section-stack">
            <div className="generator-section-head">
              <h3>Quotation Content</h3>
              <p>Quotation rows are structured here so the output table stays clean.</p>
            </div>

            <div className="generator-field-grid">
              <label className="generator-field generator-field-full">
                <span>Introduction</span>
                <textarea
                  rows={5}
                  value={state.quotation.introduction}
                  onChange={(event) =>
                    updateQuotationField("introduction", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="generator-table-editor">
              <div className="generator-list-head">
                <h4>Quotation Rows</h4>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={addQuotationRow}
                >
                  Add Row
                </button>
              </div>
              <div className="generator-quote-table">
                <div className="generator-quote-table-head">Item</div>
                <div className="generator-quote-table-head">Description</div>
                <div className="generator-quote-table-head">Amount</div>
                <div className="generator-quote-table-head">Action</div>
                {state.quotation.rows.map((row, index) => (
                  <FragmentRow
                    key={`quote-row-${index}`}
                    amount={row.amount}
                    description={row.description}
                    item={row.item}
                    onAmountChange={(value) =>
                      updateQuotationRow(index, "amount", value)
                    }
                    onDescriptionChange={(value) =>
                      updateQuotationRow(index, "description", value)
                    }
                    onItemChange={(value) =>
                      updateQuotationRow(index, "item", value)
                    }
                    onRemove={() => removeQuotationRow(index)}
                  />
                ))}
              </div>
            </div>

            <div className="generator-list-editor">
              <div className="generator-list-head">
                <h4>Notes</h4>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addStringListItem("quotation", "notes")}
                >
                  Add Note
                </button>
              </div>
              {state.quotation.notes.map((item, index) => (
                <div className="generator-list-row" key={`quotation-note-${index}`}>
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(event) =>
                      updateStringList(
                        "quotation",
                        "notes",
                        index,
                        event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="generator-remove-button"
                    onClick={() => removeStringListItem("quotation", "notes", index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="generator-field-grid">
              <label className="generator-field generator-field-full">
                <span>Closing</span>
                <textarea
                  rows={4}
                  value={state.quotation.closing}
                  onChange={(event) =>
                    updateQuotationField("closing", event.target.value)
                  }
                />
              </label>
            </div>
          </section>
        ) : null}
      </article>
    </aside>
  );
}

type FragmentRowProps = {
  amount: string;
  description: string;
  item: string;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onItemChange: (value: string) => void;
  onRemove: () => void;
};

function FragmentRow({
  amount,
  description,
  item,
  onAmountChange,
  onDescriptionChange,
  onItemChange,
  onRemove,
}: FragmentRowProps) {
  return (
    <>
      <input type="text" value={item} onChange={(event) => onItemChange(event.target.value)} />
      <textarea
        rows={2}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
      />
      <input
        type="text"
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
      />
      <button
        type="button"
        className="generator-remove-button generator-remove-button-compact"
        onClick={onRemove}
      >
        Remove
      </button>
    </>
  );
}

function formatDraftTimestamp(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
