import {
  hydrateDocumentComposerState,
  type DocumentComposerState,
} from "@/lib/document-composer";

export type SavedDocumentDraft = {
  id: string;
  name: string;
  updatedAt: string;
  state: DocumentComposerState;
};

const STORAGE_KEY = "tsa-kasi-internal-document-drafts-v1";

export function loadSavedDocumentDrafts() {
  if (typeof window === "undefined") {
    return [] as SavedDocumentDraft[];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const candidate = item as Partial<SavedDocumentDraft>;

        if (
          typeof candidate.id !== "string" ||
          typeof candidate.name !== "string" ||
          typeof candidate.updatedAt !== "string"
        ) {
          return null;
        }

        return {
          id: candidate.id,
          name: candidate.name,
          updatedAt: candidate.updatedAt,
          state: hydrateDocumentComposerState(candidate.state),
        } satisfies SavedDocumentDraft;
      })
      .filter((item): item is SavedDocumentDraft => Boolean(item))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return [];
  }
}

export function writeSavedDocumentDrafts(drafts: SavedDocumentDraft[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export function buildDraftNameFromState(state: DocumentComposerState) {
  const title = state.documentTitle.trim();
  const clientName = state.clientName.trim();

  if (title && clientName) {
    return `${title} - ${clientName}`;
  }

  return title || clientName || "Untitled Draft";
}
