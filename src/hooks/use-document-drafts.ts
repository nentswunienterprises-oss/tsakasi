import { useEffect, useState } from "react";

import { type DocumentComposerState } from "@/lib/document-composer";
import {
  buildDraftNameFromState,
  loadSavedDocumentDrafts,
  writeSavedDocumentDrafts,
  type SavedDocumentDraft,
} from "@/lib/document-drafts";

export function useDocumentDrafts(
  composer: DocumentComposerState,
  onLoadComposer: (nextState: DocumentComposerState) => void,
) {
  const [draftName, setDraftName] = useState(() => buildDraftNameFromState(composer));
  const [draftStatus, setDraftStatus] = useState("");
  const [drafts, setDrafts] = useState<SavedDocumentDraft[]>([]);

  useEffect(() => {
    setDrafts(loadSavedDocumentDrafts());
  }, []);

  useEffect(() => {
    if (draftName.trim()) {
      return;
    }

    setDraftName(buildDraftNameFromState(composer));
  }, [composer, draftName]);

  useEffect(() => {
    if (!draftStatus) {
      return;
    }

    const timeoutId = window.setTimeout(() => setDraftStatus(""), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [draftStatus]);

  function saveDraft() {
    const normalizedName = draftName.trim() || buildDraftNameFromState(composer);
    const existingDraft = drafts.find((draft) => draft.name === normalizedName);
    const nextDraft: SavedDocumentDraft = {
      id: existingDraft?.id || createDraftId(),
      name: normalizedName,
      updatedAt: new Date().toISOString(),
      state: composer,
    };

    const nextDrafts = [nextDraft, ...drafts.filter((draft) => draft.id !== nextDraft.id)]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    setDraftName(normalizedName);
    setDrafts(nextDrafts);
    writeSavedDocumentDrafts(nextDrafts);
    setDraftStatus(existingDraft ? "Draft updated." : "Draft saved.");
  }

  function loadDraft(draftId: string) {
    const nextDraft = drafts.find((draft) => draft.id === draftId);

    if (!nextDraft) {
      setDraftStatus("Draft not found.");
      return;
    }

    onLoadComposer(nextDraft.state);
    setDraftName(nextDraft.name);
    setDraftStatus("Draft loaded.");
  }

  function deleteDraft(draftId: string) {
    const nextDrafts = drafts.filter((draft) => draft.id !== draftId);
    setDrafts(nextDrafts);
    writeSavedDocumentDrafts(nextDrafts);
    setDraftStatus("Draft deleted.");
  }

  return {
    draftName,
    draftStatus,
    drafts,
    setDraftName,
    saveDraft,
    loadDraft,
    deleteDraft,
  };
}

function createDraftId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
