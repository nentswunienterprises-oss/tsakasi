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

export type ActiveComposerDraft = {
  name: string;
  updatedAt: string;
  state: DocumentComposerState;
};

const STORAGE_KEY = "tsa-kasi-internal-document-drafts-v1";
const ACTIVE_DRAFT_STORAGE_KEY = "tsa-kasi-internal-document-active-draft-v1";
const REMOTE_DRAFTS_ENDPOINT = "/api/document-drafts";

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
      .map(normalizeSavedDraft)
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

export function loadActiveComposerDraft() {
  if (typeof window === "undefined") {
    return null as ActiveComposerDraft | null;
  }

  try {
    const rawValue = window.localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    const candidate = parsedValue as Partial<ActiveComposerDraft>;

    if (
      typeof candidate.name !== "string" ||
      typeof candidate.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      name: candidate.name,
      updatedAt: candidate.updatedAt,
      state: hydrateDocumentComposerState(candidate.state),
    };
  } catch {
    return null;
  }
}

export function writeActiveComposerDraft(
  name: string,
  state: DocumentComposerState,
) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ActiveComposerDraft = {
    name,
    updatedAt: new Date().toISOString(),
    state,
  };

  window.localStorage.setItem(
    ACTIVE_DRAFT_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function buildDraftNameFromState(state: DocumentComposerState) {
  const title = state.documentTitle.trim();
  const clientName = state.clientName.trim();

  if (title && clientName) {
    return `${title} - ${clientName}`;
  }

  return title || clientName || "Untitled Draft";
}

export async function loadRemoteDocumentDrafts() {
  try {
    const response = await fetch(REMOTE_DRAFTS_ENDPOINT, {
      method: "GET",
    });

    if (!response.ok) {
      return null as SavedDocumentDraft[] | null;
    }

    const payload = (await response.json()) as { drafts?: unknown };

    if (!Array.isArray(payload.drafts)) {
      return [] as SavedDocumentDraft[];
    }

    return payload.drafts
      .map(normalizeSavedDraft)
      .filter((item): item is SavedDocumentDraft => Boolean(item))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch {
    return null;
  }
}

export async function writeRemoteDocumentDraft(draft: SavedDocumentDraft) {
  try {
    const response = await fetch(REMOTE_DRAFTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draft }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteRemoteDocumentDraft(draftId: string) {
  try {
    const response = await fetch(REMOTE_DRAFTS_ENDPOINT, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

function normalizeSavedDraft(item: unknown) {
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
}
