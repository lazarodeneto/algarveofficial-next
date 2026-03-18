import { forwardRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import ListingImage from "@/components/ListingImage";

type ChatThread = Tables<"chat_threads"> & {
  listings?: { name: string; featured_image_url: string | null } | null;
};

interface ThreadListProps {
  threads: ChatThread[];
  isLoading: boolean;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export const ThreadList = forwardRef<HTMLDivElement, ThreadListProps>(
  function ThreadList({ threads, isLoading, activeThreadId, onSelectThread }, ref) {
    if (isLoading) {
      return (
        <div ref={ref} className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (threads.length === 0) {
      return (
        <div ref={ref} className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Start a conversation from any listing page to connect with owners.
          </p>
        </div>
      );
    }

    return (
      <div ref={ref} className="h-full overflow-y-auto">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={cn(
              "w-full flex gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b border-border",
              activeThreadId === thread.id && "bg-muted"
            )}
          >
            {/* Listing Image */}
            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
              <ListingImage
                src={thread.listings?.featured_image_url}
                listingId={thread.listing_id ?? thread.id}
                alt={thread.listings?.name || "Listing"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thread Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-sm truncate">
                  {thread.listings?.name || "Unknown Listing"}
                </h4>
                {thread.last_message_at && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(thread.last_message_at), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {thread.status === "active" ? "Active conversation" : "Archived"}
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }
);
