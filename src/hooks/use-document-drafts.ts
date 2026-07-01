import { useEffect, useState } from "react";

import { type DocumentComposerState } from "@/lib/document-composer";
import {
  buildDraftNameFromState,
  deleteRemoteDocumentDraft,
  loadActiveComposerDraft,
  loadRemoteDocumentDrafts,
  loadSavedDocumentDrafts,
  writeActiveComposerDraft,
  writeRemoteDocumentDraft,
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
    const localDrafts = loadSavedDocumentDrafts();
    setDrafts(localDrafts);

    void (async () => {
      const remoteDrafts = await loadRemoteDocumentDrafts();

      if (!remoteDrafts) {
        return;
      }

      setDrafts(remoteDrafts);
      writeSavedDocumentDrafts(remoteDrafts);
    })();

    const activeDraft = loadActiveComposerDraft();

    if (!activeDraft) {
      return;
    }

    onLoadComposer(activeDraft.state);
    setDraftName(activeDraft.name || buildDraftNameFromState(activeDraft.state));
    setDraftStatus("Restored last working draft.");
    // Run once on mount only. The callback identity is stable in page components.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    const autosaveName = draftName.trim() || buildDraftNameFromState(composer);
    const timeoutId = window.setTimeout(() => {
      writeActiveComposerDraft(autosaveName, composer);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [composer, draftName]);

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
    void writeRemoteDocumentDraft(nextDraft);
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
    void deleteRemoteDocumentDraft(draftId);
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
