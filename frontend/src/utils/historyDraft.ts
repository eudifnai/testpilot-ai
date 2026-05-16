const DRAFT_KEY = "testpilot-ai-history-draft";

export interface HistoryDraft {
  type: string;
  inputText: string;
}

export function saveHistoryDraft(draft: HistoryDraft) {
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function consumeHistoryDraft(): HistoryDraft | null {
  const raw = window.sessionStorage.getItem(DRAFT_KEY);
  if (!raw) {
    return null;
  }
  window.sessionStorage.removeItem(DRAFT_KEY);
  try {
    return JSON.parse(raw) as HistoryDraft;
  } catch {
    return null;
  }
}
