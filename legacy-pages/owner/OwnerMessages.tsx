import { useState } from "react";
import { m } from "framer-motion";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Search,
  User,
  Clock,
  Send,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useOwnerChatThreads, type OwnerChatThread } from "@/hooks/useOwnerChatThreads";
import { useChatMessages, useSendMessage, useMarkThreadMessagesAsRead } from "@/hooks/useChat";

export default function OwnerMessages() {
  const { t } = useTranslation();
  const { data: threads = [], isLoading } = useOwnerChatThreads();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [openedThreadIds, setOpenedThreadIds] = useState<Set<string>>(new Set());

  const selectedThread = threads.find(t => t.id === selectedThreadId) || null;
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(selectedThreadId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkThreadMessagesAsRead();
  
  const getDisplayUnreadCount = (thread: OwnerChatThread) =>
    openedThreadIds.has(thread.id) ? 0 : thread.unread_count;

  const unreadCount = threads.reduce((acc, thread) => acc + getDisplayUnreadCount(thread), 0);
  
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredThreads = normalizedQuery.length === 0
    ? threads
    : threads.filter((thread) => {
        const viewerName = thread.viewer?.full_name?.toLowerCase() ?? "";
        const listingName = thread.listing?.name?.toLowerCase() ?? "";
        return viewerName.includes(normalizedQuery) || listingName.includes(normalizedQuery);
      });
  
  const handleSelectThread = (thread: OwnerChatThread) => {
    setSelectedThreadId(thread.id);
    setOpenedThreadIds((previous) => new Set(previous).add(thread.id));
    if (getDisplayUnreadCount(thread) > 0) {
      markAsRead.mutate(thread.id);
    }
  };
  
  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedThreadId) return;
    
    try {
      await sendMessage.mutateAsync({
        threadId: selectedThreadId,
        messageText: replyContent,
      });
      setReplyContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
            {t('owner.messages.title')}
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? t('owner.messages.unreadCount', { count: unreadCount })
              : t('owner.messages.allRead')}
          </p>
        </div>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 min-h-0 lg:min-h-[600px]">
        {/* Threads List */}
        <Card className={cn(
          "bg-card border-border lg:col-span-1 overflow-hidden",
          selectedThread && "hidden lg:block"
        )}>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('owner.messages.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-auto lg:h-[500px] overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {threads.length === 0 ? t('owner.messages.noConversations') : t('owner.messages.noMatching')}
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const displayUnreadCount = getDisplayUnreadCount(thread);
                  return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={cn(
                      "w-full text-left px-3 py-5 sm:px-4 sm:py-5 lg:py-6 border-b border-border hover:bg-muted/50 transition-colors last:border-b-0 flex flex-col gap-3 lg:gap-4",
                      selectedThreadId === thread.id && "bg-muted",
                      displayUnreadCount > 0 && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 pr-1">
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            displayUnreadCount > 0 && "font-semibold"
                          )}>
                            {thread.viewer?.full_name || t('owner.messages.unknownUser')}
                          </p>
                          <p className="truncate pr-2 text-xs text-muted-foreground">
                            {thread.listing?.name || t('owner.messages.unknownListing')}
                          </p>
                        </div>
                      </div>
                      {displayUnreadCount > 0 && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          {displayUnreadCount}
                        </Badge>
                      )}
                    </div>
                    {thread.last_message && (
                      <p className={cn(
                        "truncate pr-2 pt-1 text-sm leading-5",
                        displayUnreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {thread.last_message.body_text}
                      </p>
                    )}
                    <div className="flex items-center gap-1 pt-1 pb-2 text-xs text-muted-foreground lg:pb-3">
                      <Clock className="h-3 w-3" />
                      {thread.last_message_at
                        ? format(new Date(thread.last_message_at), 'MMM d, HH:mm')
                        : format(new Date(thread.created_at), 'MMM d, HH:mm')}
                    </div>
                  </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation Detail */}
        <Card className={cn(
          "bg-card border-border lg:col-span-2 overflow-hidden",
          !selectedThread && "hidden lg:flex lg:items-center lg:justify-center"
        )}>
          {selectedThread ? (
            <div className="flex flex-col h-full">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedThreadId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{selectedThread.viewer?.full_name || t('owner.messages.unknownUser')}</span>
                      <Badge variant="outline" className={cn(
                        selectedThread.status === "active" && "border-green-500/30 text-green-400",
                        selectedThread.status === "closed" && "border-muted text-muted-foreground",
                        selectedThread.status === "blocked" && "border-destructive/30 text-destructive"
                      )}>
                        {t(`owner.messages.status.${selectedThread.status}`)}
                      </Badge>
                    </div>
                    {selectedThread.listing && (
                      <Link
                        href={`/listing/${selectedThread.listing.slug}`}
                        target="_blank"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 truncate"
                      >
                        {t('owner.messages.about')}: {selectedThread.listing.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="h-auto p-4 lg:flex-1">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{t('owner.messages.noMessages')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwner = message.sender_type === "owner";
                      return (
                        <div key={message.id} className="flex gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            isOwner ? "bg-primary/10" : "bg-muted"
                          )}>
                            <User className={cn(
                              "h-4 w-4",
                              isOwner ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {isOwner ? t('owner.messages.you') : (selectedThread.viewer?.full_name || t('owner.messages.viewer'))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'MMM d, HH:mm')}
                              </span>
                              {message.delivery_status && message.delivery_status !== "delivered" && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  {message.delivery_status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">
                              {message.body_text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              
              {/* Reply Input */}
              {selectedThread.status === "active" && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={t('owner.messages.typeReply')}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendReply} 
                      disabled={!replyContent.trim() || sendMessage.isPending}
                      className="self-end"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedThread.status !== "active" && (
                <div className="p-4 border-t border-border text-center text-muted-foreground text-sm">
                  {t('owner.messages.conversationStatus', { status: t(`owner.messages.status.${selectedThread.status}`) })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('owner.messages.selectConversation')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
