import {
  createDocumentComposerState,
  documentKindOptions,
  switchDocumentKind,
  type DocumentComposerState,
  type DocumentKind,
} from "@/lib/document-composer";

type DocumentComposerPanelProps = {
  previewHref: string;
  state: DocumentComposerState;
  toolsId: string;
  onChange: (nextState: DocumentComposerState) => void;
};

export function DocumentComposerPanel({
  previewHref,
  state,
  toolsId,
  onChange,
}: DocumentComposerPanelProps) {
  function updateRootField<
    Key extends
      | "clientName"
      | "date"
      | "documentTitle"
      | "footer"
      | "referenceNumber",
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
    section: "letter" | "proposal" | "quotation",
    field: string,
    index: number,
    value: string,
  ) {
    const currentList = (state[section] as Record<string, unknown>)[field] as string[];
    const nextList = currentList.map((item, itemIndex) =>
      itemIndex === index ? value : item,
    );

    if (section === "letter") {
      updateLetterField("focusPoints", nextList);
      return;
    }

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
    section: "letter" | "proposal" | "quotation",
    field: string,
  ) {
    const currentList = (state[section] as Record<string, unknown>)[field] as string[];
    const nextList = [...currentList, ""];

    if (section === "letter") {
      updateLetterField("focusPoints", nextList);
      return;
    }

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
    section: "letter" | "proposal" | "quotation",
    field: string,
    index: number,
  ) {
    const currentList = (state[section] as Record<string, unknown>)[field] as string[];
    const nextList = currentList.filter((_, itemIndex) => itemIndex !== index);

    if (section === "letter") {
      updateLetterField("focusPoints", nextList.length ? nextList : [""]);
      return;
    }

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
            <span>Reference Number</span>
            <input
              type="text"
              value={state.referenceNumber}
              onChange={(event) =>
                updateRootField("referenceNumber", event.target.value)
              }
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
                <span>Recipient</span>
                <input
                  type="text"
                  value={state.letter.recipient}
                  onChange={(event) =>
                    updateLetterField("recipient", event.target.value)
                  }
                />
              </label>
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
                <h4>Focus Points</h4>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => addStringListItem("letter", "focusPoints")}
                >
                  Add Point
                </button>
              </div>
              {state.letter.focusPoints.map((item, index) => (
                <div className="generator-list-row" key={`letter-point-${index}`}>
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(event) =>
                      updateStringList(
                        "letter",
                        "focusPoints",
                        index,
                        event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="generator-remove-button"
                    onClick={() => removeStringListItem("letter", "focusPoints", index)}
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
