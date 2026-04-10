import { useState, useRef, useEffect, forwardRef } from "react";
import { Send, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  useChatMessages,
  useSendMessage,
  useCreateOrFindThread,
  useOwnerWhatsAppStatus,
  useChatThreads,
} from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

interface ConversationViewProps {
  threadId: string | null;
  initialListingId?: string | null;
  initialOwnerId?: string | null;
  initialListingName?: string | null;
  onThreadCreated?: (threadId: string) => void;
}

export const ConversationView = forwardRef<HTMLDivElement, ConversationViewProps>(
  function ConversationView(
    {
      threadId,
      initialListingId = null,
      initialOwnerId = null,
      initialListingName = null,
      onThreadCreated,
    },
    ref
  ) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [localThreadId, setLocalThreadId] = useState(threadId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: messages, isLoading: messagesLoading } = useChatMessages(
      localThreadId || threadId
    );
    const sendMessage = useSendMessage();
    const createOrFindThread = useCreateOrFindThread();
    const { data: waStatus } = useOwnerWhatsAppStatus(initialOwnerId || undefined);
    const { data: threads } = useChatThreads();

    // Update local thread ID when prop changes
    useEffect(() => {
      setLocalThreadId(threadId);
    }, [threadId]);

    // Scroll to bottom when messages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Set default message for new conversations
    useEffect(() => {
      if (initialListingName && !threadId && !localThreadId) {
        setMessage(
          t("chat.defaultInquiryMessage", { listingName: initialListingName })
        );
      }
    }, [initialListingName, localThreadId, t, threadId]);

    const handleSend = async () => {
      if (!message.trim()) return;

      let targetThreadId = localThreadId || threadId;

      // If no thread exists, create one first
      if (!targetThreadId && initialListingId && initialOwnerId) {
        try {
          const newThread = await createOrFindThread.mutateAsync({
            listingId: initialListingId,
            ownerId: initialOwnerId,
          });
          if (!newThread) return;
          targetThreadId = newThread.id;
          setLocalThreadId(newThread.id);
          onThreadCreated?.(newThread.id);
        } catch (error) {
          console.error("Failed to create thread:", error);
          return;
        }
      }

      if (!targetThreadId) return;

      try {
        await sendMessage.mutateAsync({
          threadId: targetThreadId,
          messageText: message.trim(),
        });
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleOpenWhatsApp = () => {
      if (waStatus?.phone) {
        const encodedMessage = encodeURIComponent(
          message ||
            t("chat.defaultWhatsAppMessage", {
              listingName:
                initialListingName || t("chat.listingFallbackName"),
            })
        );
        window.open(`https://wa.me/${waStatus.phone.replace(/\D/g, "")}?text=${encodedMessage}`, "_blank");
      }
    };

    // Empty state - no thread selected and no listing to start new thread
    if (!threadId && !localThreadId && !initialListingId) {
      return (
        <div ref={ref} className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Send className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-serif font-medium text-xl mb-2">{t("chat.selectConversation")}</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            {t("chat.selectConversationDescription")}
          </p>
        </div>
      );
    }

    const thread = threads?.find(t => t.id === (localThreadId || threadId));
    const isViewer = thread?.viewer_id === user?.id;
    const isOwner = thread?.owner_id === user?.id;

    return (
      <div ref={ref} className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messagesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-2/3 ml-auto" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
              const ownSenderType = isViewer ? "viewer" : (isOwner ? "owner" : null);
              const isOwnMessage = msg.sender_type === ownSenderType;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwnMessage}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-sm text-muted-foreground mb-2">
                {initialListingName ? (
                  <>
                    {t("chat.startConversationAbout")} <strong>{initialListingName}</strong>
                  </>
                ) : (
                  t("chat.noMessagesYet")
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("chat.sendMessageToStart")}
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp Fallback Banner */}
        {initialOwnerId && waStatus?.phone && (
          <div className="px-4 py-2 bg-green-500/10 border-t border-green-500/20">
            <button
              onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{t("chat.openWhatsApp")}</span>
          </button>
        </div>
      )}

        {/* Composer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.messagePlaceholder")}
              disabled={sendMessage.isPending || createOrFindThread.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={
                !message.trim() ||
                sendMessage.isPending ||
                createOrFindThread.isPending
              }
              size="icon"
              aria-label={t("chat.sendMessage")}
            >
              {sendMessage.isPending || createOrFindThread.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
