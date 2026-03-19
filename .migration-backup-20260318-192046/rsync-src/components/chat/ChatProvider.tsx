import { createContext, useContext, useState, lazy, Suspense, ReactNode } from "react";

const ChatModal = lazy(() => import("./ChatModal").then(m => ({ default: m.ChatModal })));

interface ChatContextValue {
  openChat: (options?: {
    threadId?: string;
    listingId?: string;
    ownerId?: string;
    listingName?: string;
  }) => void;
  closeChat: () => void;
  isOpen: boolean;
}

// Default no-op context for graceful degradation
const defaultContextValue: ChatContextValue = {
  openChat: () => console.warn("ChatProvider not mounted yet"),
  closeChat: () => { },
  isOpen: false,
};

const ChatContext = createContext<ChatContextValue>(defaultContextValue);

export function useChatModal() {
  return useContext(ChatContext);
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialThreadId, setInitialThreadId] = useState<string | null>(null);
  const [initialListingId, setInitialListingId] = useState<string | null>(null);
  const [initialOwnerId, setInitialOwnerId] = useState<string | null>(null);
  const [initialListingName, setInitialListingName] = useState<string | null>(null);

  const openChat = (options?: {
    threadId?: string;
    listingId?: string;
    ownerId?: string;
    listingName?: string;
  }) => {
    setInitialThreadId(options?.threadId || null);
    setInitialListingId(options?.listingId || null);
    setInitialOwnerId(options?.ownerId || null);
    setInitialListingName(options?.listingName || null);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setInitialThreadId(null);
      setInitialListingId(null);
      setInitialOwnerId(null);
      setInitialListingName(null);
    }, 300);
  };

  return (
    <ChatContext.Provider value={{ openChat, closeChat, isOpen }}>
      {children}
      <Suspense fallback={null}>
        <ChatModal
          isOpen={isOpen}
          onClose={closeChat}
          initialThreadId={initialThreadId}
          initialListingId={initialListingId}
          initialOwnerId={initialOwnerId}
          initialListingName={initialListingName}
        />
      </Suspense>
    </ChatContext.Provider>
  );
}
