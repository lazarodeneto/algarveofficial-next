import { forwardRef, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Building2, MessageSquare, ExternalLink, Shield, Send, Loader2, Trash2 } from "lucide-react";
import { ChatThread, ChatMessage, useAdminChatMessages, useUpdateThreadStatus, useAdminSendMessage, useMarkThreadAsRead, useDeleteThread, useDeleteChatMessage } from "@/hooks/useAdminChat";
import { cn } from "@/lib/utils";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { normalizeThreadStatus, type ThreadStatus } from "@/lib/chatThreadStatus";

interface ThreadDetailDialogProps {
  thread: ChatThread | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThreadDetailDialog = forwardRef<HTMLDivElement, ThreadDetailDialogProps>(
  function ThreadDetailDialog({ thread, open, onOpenChange }, ref) {
    const threadId = thread?.id ?? null;
    const { data: messages = [], isLoading } = useAdminChatMessages(threadId);
    const updateStatus = useUpdateThreadStatus();
    const sendMessage = useAdminSendMessage();
    const markThreadAsRead = useMarkThreadAsRead();
    const deleteThread = useDeleteThread();
    const deleteMessage = useDeleteChatMessage();
    const [replyContent, setReplyContent] = useState("");
    const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
    const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
    const hasMarkedForOpenRef = useRef<string | null>(null);
    const normalizedStatus = normalizeThreadStatus(thread?.status);

    const handleStatusChange = (status: string) => {
      if (!threadId) return;
      updateStatus.mutate({ threadId, status: status as ThreadStatus });
    };

    const handleSend = () => {
      if (!threadId || !replyContent.trim() || sendMessage.isPending) return;

      sendMessage.mutate(
        { threadId, messageText: replyContent.trim() },
        {
          onSuccess: () => {
            setReplyContent("");
          },
        }
      );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    useEffect(() => {
      if (!open || !threadId) return;
      if (hasMarkedForOpenRef.current === threadId) return;

      hasMarkedForOpenRef.current = threadId;
      markThreadAsRead.mutate(threadId);
    }, [open, threadId, markThreadAsRead]);

    const handleDialogOpenChange = (nextOpen: boolean) => {
      if (!nextOpen) {
        hasMarkedForOpenRef.current = null;
        setMessageToDelete(null);
        setConfirmDeleteThread(false);
      }
      onOpenChange(nextOpen);
    };

    if (!thread) return null;

    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent ref={ref} className="flex max-h-[90dvh] w-[calc(100vw-1rem)] flex-col p-4 sm:max-w-2xl sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-10 top-4 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDeleteThread(true)}
              aria-label="Delete conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Thread Info */}
          <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/30 p-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Viewer</p>
                  <p className="font-medium truncate">{thread.viewer?.full_name || thread.contact_name || "Guest"}</p>
                  {thread.contact_email && !thread.viewer && (
                    <p className="text-xs text-muted-foreground truncate">{thread.contact_email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="font-medium truncate">{thread.owner?.full_name || "Unknown"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Listing</p>
                  {thread.listing ? (
                    <LocaleLink
                      href={`/listing/${thread.listing.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 truncate font-medium hover:text-primary"
                    >
                      {thread.listing.name}
                      <ExternalLink className="h-3 w-3" />
                    </LocaleLink>
                ) : (
                  <p className="text-muted-foreground italic">General Inquiry</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Select value={normalizedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32 h-8" disabled={updateStatus.isPending}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{format(new Date(thread.created_at), "PPp")}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Messages */}
          <div className="flex-1 min-h-0">
            <p className="text-sm font-medium mb-2">Messages ({messages.length})</p>
            <ScrollArea className="h-[45dvh] pr-2 sm:h-[250px] sm:pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No messages in this conversation
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onDelete={() => setMessageToDelete(message)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Admin Reply Composer */}
          {normalizedStatus === "active" && (
            <>
              <Separator />
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 text-amber-500" />
                  <span>Replying as Platform Admin</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!replyContent.trim() ?? sendMessage.isPending}
                    size="icon"
                    className="h-10 w-full shrink-0 sm:h-auto sm:w-10"
                    aria-label="Send admin reply"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {normalizedStatus !== "active" && (
            <div className="text-center py-3 text-sm text-muted-foreground bg-muted/30 rounded-lg">
              This conversation is {normalizedStatus}. Change status to Active to reply.
            </div>
          )}
        </DialogContent>
        <ConfirmDialog
          open={confirmDeleteThread}
          onOpenChange={setConfirmDeleteThread}
          title="Delete thread"
          description="This will permanently delete this conversation and all associated messages."
          confirmLabel={deleteThread.isPending ? "Deleting..." : "Delete"}
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={() => {
            if (!threadId) return;
            deleteThread.mutate(threadId, {
              onSuccess: () => {
                setConfirmDeleteThread(false);
                onOpenChange(false);
              },
            });
          }}
        />
        <ConfirmDialog
          open={!!messageToDelete}
          onOpenChange={(open) => !open && setMessageToDelete(null)}
          title="Delete message"
          description="This will permanently delete this message."
          confirmLabel={deleteMessage.isPending ? "Deleting..." : "Delete"}
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={() => {
            if (!messageToDelete || !threadId) return;
            deleteMessage.mutate(
              { messageId: messageToDelete.id, threadId },
              { onSuccess: () => setMessageToDelete(null) }
            );
          }}
        />
      </Dialog >
    );
  }
);

ThreadDetailDialog.displayName = "ThreadDetailDialog";

function MessageItem({ message, onDelete }: { message: ChatMessage; onDelete: () => void }) {
  const isOutbound = message.direction === "outbound";
  const isAdmin = message.sender_type === "admin";

  return (
    <div
      className={cn(
        "flex flex-col max-w-full rounded-lg p-3 sm:max-w-[80%]",
        isAdmin
          ? "ml-auto bg-amber-500/10 text-foreground border border-amber-500/30"
          : isOutbound
            ? "ml-auto bg-primary/20 text-foreground"
            : "bg-muted"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-1.5 py-0",
            isAdmin && "bg-amber-500/10 text-amber-500 border-amber-500/30"
          )}
        >
          {isAdmin ? (
            <span className="flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" />
              Admin
            </span>
          ) : message.sender_type}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {format(new Date(message.created_at), "PPp")}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap break-words">{message.body_text}</p>
      <div className="flex items-center justify-between gap-1 mt-1">
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-1.5 py-0",
            message.delivery_status === "delivered" && "text-green-400",
            message.delivery_status === "failed" && "text-destructive"
          )}
        >
          {message.delivery_status}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
