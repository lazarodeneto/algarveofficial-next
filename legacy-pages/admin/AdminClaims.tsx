import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useListingClaims, useUpdateClaimStatus, useDeleteClaim, type ListingClaim } from "@/hooks/useListingClaims";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Check, X, MoreHorizontal, Trash2, Mail, Phone, Building, Globe, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ApproveAssignDialog } from "@/components/admin/ApproveAssignDialog";

export default function AdminClaims() {
  if (typeof window === "undefined") {
    return null;
  }
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>('pending');
  const [selectedClaim, setSelectedClaim] = useState<ListingClaim | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveAssignOpen, setApproveAssignOpen] = useState(false);
  const [claimToApprove, setClaimToApprove] = useState<ListingClaim | null>(null);

  const { data: claims = [], isLoading } = useListingClaims(statusFilter);
  const updateStatusMutation = useUpdateClaimStatus();
  const deleteMutation = useDeleteClaim();

  const openApproveAssign = (claim: ListingClaim) => {
    setClaimToApprove(claim);
    setApproveAssignOpen(true);
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    try {
      await updateStatusMutation.mutateAsync({ 
        claimId: selectedClaim.id, 
        status: 'rejected',
        rejectionReason 
      });
      toast.success('Claim rejected');
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedClaim(null);
    } catch (error) {
      toast.error('Failed to reject claim');
    }
  };

  const handleDelete = async (claimId: string) => {
    try {
      await deleteMutation.mutateAsync(claimId);
      toast.success('Claim deleted');
    } catch (error) {
      toast.error('Failed to delete claim');
    }
  };

  const openRejectDialog = (claim: ListingClaim) => {
    setSelectedClaim(claim);
    setRejectDialogOpen(true);
  };

  const openDetailsDialog = (claim: ListingClaim) => {
    setSelectedClaim(claim);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    return type === 'claim-business' ? (
      <Badge variant="secondary">Claim Business</Badge>
    ) : (
      <Badge variant="default">New Listing</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Partner Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage business claims and new listing requests from partners
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-box">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold">
                  {claims.filter(c => c.status === 'pending').length || '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-box">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-box">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-semibold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Filter */}
      <Tabs value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? undefined : v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Claims Table */}
      <Card className="glass-box">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {statusFilter || ''} requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetailsDialog(claim)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{claim.business_name}</p>
                        {claim.business_website && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {claim.business_website}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{claim.contact_name}</p>
                        <p className="text-xs text-muted-foreground">{claim.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getRequestTypeBadge(claim.request_type)}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(claim.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {claim.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() => openApproveAssign(claim)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => openRejectDialog(claim)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(claim.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request. This will be stored for reference.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedClaim?.business_name}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {selectedClaim && getRequestTypeBadge(selectedClaim.request_type)}
              {selectedClaim && getStatusBadge(selectedClaim.status)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact Name</p>
                  <p className="font-medium">{selectedClaim.contact_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Submitted</p>
                  <p className="font-medium">{format(new Date(selectedClaim.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedClaim.email}`} className="text-primary hover:underline">
                    {selectedClaim.email}
                  </a>
                </div>
                {selectedClaim.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedClaim.phone}`} className="text-primary hover:underline">
                      {selectedClaim.phone}
                    </a>
                  </div>
                )}
                {selectedClaim.business_website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={selectedClaim.business_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedClaim.business_website}
                    </a>
                  </div>
                )}
              </div>

              {selectedClaim.message && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </p>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm">
                    {selectedClaim.message}
                  </div>
                </div>
              )}

              {selectedClaim.rejection_reason && (
                <div>
                  <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Rejection Reason</p>
                  <div className="p-3 rounded-lg bg-red-500/10 text-sm text-red-400">
                    {selectedClaim.rejection_reason}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedClaim?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    openRejectDialog(selectedClaim);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    openApproveAssign(selectedClaim);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Assign
                </Button>
              </>
            )}
            {selectedClaim?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve & Assign Dialog */}
      <ApproveAssignDialog
        open={approveAssignOpen}
        onOpenChange={setApproveAssignOpen}
        claim={claimToApprove}
      />
    </div>
  );
}
