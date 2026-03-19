import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, MoreHorizontal, Shield, Edit, Mail, UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";

type UserRole = "admin" | "editor" | "owner" | "viewer_logged";

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: "Admin",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  editor: {
    label: "Editor",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  owner: {
    label: "Owner",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  viewer_logged: {
    label: "Viewer",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);

  // Fetch users with their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      return (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'viewer_logged',
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep in garbage collection for 15 minutes
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // First check if user has a role entry
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("User role updated");
      setConfirmDialogOpen(false);
      setSelectedUser(null);
      setNewRole(null);
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (selectedUser && newRole) {
      // Check if trying to remove last admin
      const adminCount = users.filter((u: any) => u.role === "admin").length;
      if (selectedUser.role === "admin" && newRole !== "admin" && adminCount <= 1) {
        toast.error("Cannot remove the last admin!");
        return;
      }
      setRoleDialogOpen(false);
      setConfirmDialogOpen(true);
    }
  };

  const applyRoleChange = () => {
    if (selectedUser && newRole) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  const columns: Column<any>[] = [
    {
      key: "user",
      label: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {user.full_name || "No name"}
            </p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (user) => {
        const config = roleConfig[user.role as UserRole] || roleConfig.viewer_logged;
        return (
          <Badge variant="outline" className={config.className}>
            <Shield className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      className: "hidden md:table-cell",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-12",
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleRoleChange(user)}>
              <UserCog className="h-4 w-4 mr-2" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground">
          Users & Roles
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="viewer_logged">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="text-sm">
          <span className="font-medium text-foreground">Roles:</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span><strong className="text-primary">Admin</strong> — Full control</span>
          <span><strong className="text-blue-400">Editor</strong> — Content editing</span>
          <span><strong className="text-green-400">Owner</strong> — Own listings only</span>
          <span><strong>Viewer</strong> — Browse + favorites</span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyMessage="No users found"
      />

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredUsers.length} of {users.length} users
      </p>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                value={newRole || undefined}
                onValueChange={(value) => setNewRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — Full control</SelectItem>
                  <SelectItem value="editor">Editor — Content editing</SelectItem>
                  <SelectItem value="owner">Owner — Own listings only</SelectItem>
                  <SelectItem value="viewer_logged">Viewer — Browse + favorites</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange} disabled={!newRole || newRole === selectedUser?.role}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Confirm Role Change"
        description={`Are you sure you want to change ${selectedUser?.email}'s role from "${selectedUser?.role}" to "${newRole}"? This will affect their permissions immediately.`}
        confirmLabel="Confirm"
        onConfirm={applyRoleChange}
      />
    </div>
  );
}