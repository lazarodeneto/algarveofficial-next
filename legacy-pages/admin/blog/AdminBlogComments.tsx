import { useState, useMemo } from "react";
import {
  Search,
  Check,
  X,
  Trash2,
  MessageSquare,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBlogCommentsAdmin } from "@/hooks/useBlogCommentsAdmin";
import { format } from "date-fns";

export default function AdminBlogComments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { comments, isLoading, approveComment, rejectComment, deleteComment } = useBlogCommentsAdmin();

  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesSearch =
        comment.content.toLowerCase().includes(search.toLowerCase()) ||
        (comment.user?.full_name || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && comment.is_approved) ||
        (statusFilter === "pending" && !comment.is_approved);
      return matchesSearch && matchesStatus;
    });
  }, [comments, search, statusFilter]);

  const pendingCount = comments.filter((c) => !c.is_approved).length;
  const approvedCount = comments.filter((c) => c.is_approved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Comment Moderation</h1>
        <p className="text-muted-foreground">Review and moderate blog comments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Total Comments</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{comments.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <Check className="h-4 w-4" />
            <span className="text-sm">Approved</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search comments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No comments found</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {comment.user?.avatar_url ? (
                      <img src={comment.user.avatar_url} alt={comment.user.full_name || ''} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{comment.user?.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
                <Badge variant={comment.is_approved ? "default" : "secondary"}>{comment.is_approved ? "Approved" : "Pending"}</Badge>
              </div>
              <div className="pl-13">
                <p className="text-sm text-muted-foreground mb-2">On: <span className="text-foreground">{comment.post?.title || 'Unknown Post'}</span></p>
                <p className="text-foreground">{comment.content}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {!comment.is_approved && (
                  <Button size="sm" variant="outline" className="text-green-400 hover:text-green-500" onClick={() => approveComment(comment.id)}>
                    <Check className="h-4 w-4 mr-1" />Approve
                  </Button>
                )}
                {comment.is_approved && (
                  <Button size="sm" variant="outline" className="text-amber-400 hover:text-amber-500" onClick={() => rejectComment(comment.id)}>
                    <X className="h-4 w-4 mr-1" />Reject
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => deleteComment(comment.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
