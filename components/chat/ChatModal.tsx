import { useState, useEffect } from "react";
import { X, MessageCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useChatThreads } from "@/hooks/useChat";
import { ThreadList } from "./ThreadList";
import { ConversationView } from "./ConversationView";
import { cn } from "@/lib/utils";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialThreadId?: string | null;
  initialListingId?: string | null;
  initialOwnerId?: string | null;
  initialListingName?: string | null;
}

export function ChatModal({
  isOpen,
  onClose,
  initialThreadId = null,
  initialListingId = null,
  initialOwnerId = null,
  initialListingName = null,
}: ChatModalProps) {
  const { user } = useAuth();
  const { data: threads, isLoading } = useChatThreads();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId);
  const [showConversation, setShowConversation] = useState(!!initialThreadId);

  // Reset to initial state when modal opens with new props
  useEffect(() => {
    if (isOpen) {
      setActiveThreadId(initialThreadId);
      setShowConversation(!!initialThreadId || !!initialListingId);
    }
  }, [isOpen, initialThreadId, initialListingId]);

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setShowConversation(true);
  };

  const handleBack = () => {
    setActiveThreadId(null);
    setShowConversation(false);
  };

  const handleThreadCreated = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  if (!user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden",
              // Desktop: centered modal with two columns
              "lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[900px] lg:h-[600px] lg:max-h-[80vh]",
              // Mobile: full screen
              "inset-0 lg:inset-auto"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                {showConversation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="font-serif font-medium text-lg">Messages</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100%-57px)]">
              {/* Thread List - Desktop: always visible, Mobile: hidden when conversation active */}
              <div
                className={cn(
                  "w-full lg:w-80 border-r border-border flex-shrink-0",
                  showConversation && "hidden lg:block"
                )}
              >
                <ThreadList
                  threads={threads || []}
                  isLoading={isLoading}
                  activeThreadId={activeThreadId}
                  onSelectThread={handleSelectThread}
                />
              </div>

              {/* Conversation View */}
              <div
                className={cn(
                  "flex-1 flex flex-col",
                  !showConversation && "hidden lg:flex"
                )}
              >
                <ConversationView
                  threadId={activeThreadId}
                  initialListingId={initialListingId}
                  initialOwnerId={initialOwnerId}
                  initialListingName={initialListingName}
                  onThreadCreated={handleThreadCreated}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
