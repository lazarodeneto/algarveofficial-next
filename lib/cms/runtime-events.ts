export const CMS_RUNTIME_CHANGED_EVENT = "algarve:cms-runtime-changed";
const CMS_RUNTIME_CHANGED_CHANNEL = "algarve-cms-runtime";
const CMS_RUNTIME_CHANGED_STORAGE_KEY = "algarve:cms-runtime-changed-at";

export interface CmsRuntimeChangedDetail {
  changedAt: number;
  locale?: string;
  pageId?: string;
  source?: string;
}

function normalizeDetail(detail: Partial<CmsRuntimeChangedDetail> = {}): CmsRuntimeChangedDetail {
  return {
    ...detail,
    changedAt: typeof detail.changedAt === "number" ? detail.changedAt : Date.now(),
  };
}

function parseStorageDetail(value: string | null): CmsRuntimeChangedDetail | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<CmsRuntimeChangedDetail> | null;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeDetail(parsed);
  } catch {
    return null;
  }
}

export function notifyCmsRuntimeChanged(detail: Partial<CmsRuntimeChangedDetail> = {}) {
  if (typeof window === "undefined") return;

  const payload = normalizeDetail(detail);
  window.dispatchEvent(new CustomEvent(CMS_RUNTIME_CHANGED_EVENT, { detail: payload }));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(CMS_RUNTIME_CHANGED_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  }

  try {
    window.localStorage.setItem(CMS_RUNTIME_CHANGED_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function subscribeCmsRuntimeChanged(callback: (detail: CmsRuntimeChangedDetail) => void) {
  if (typeof window === "undefined") return () => {};

  const handleWindowEvent = (event: Event) => {
    callback(normalizeDetail((event as CustomEvent<Partial<CmsRuntimeChangedDetail>>).detail));
  };
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== CMS_RUNTIME_CHANGED_STORAGE_KEY) return;
    const detail = parseStorageDetail(event.newValue);
    if (detail) callback(detail);
  };

  let channel: BroadcastChannel | null = null;
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(CMS_RUNTIME_CHANGED_CHANNEL);
    channel.onmessage = (event: MessageEvent<Partial<CmsRuntimeChangedDetail>>) => {
      callback(normalizeDetail(event.data));
    };
  }

  window.addEventListener(CMS_RUNTIME_CHANGED_EVENT, handleWindowEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(CMS_RUNTIME_CHANGED_EVENT, handleWindowEvent);
    window.removeEventListener("storage", handleStorageEvent);
    channel?.close();
  };
}
