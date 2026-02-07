"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldAlert, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { user, login } = useAuth(); // login needed? maybe not.
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    // Basic role check - detailed check should happen in backend/middleware too
    // But we don't have role in auth-provider 'user' object yet maybe? 
    // Let's assume user object is updated or we fetch it.
    // For now, let's just fetch users and handle 403.
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.admin.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // If 403, maybe redirect?
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user? Action cannot be undone.")) return;
    setActionLoading(id);
    try {
      await api.admin.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromote = async (id: number) => {
    if (!confirm("Promote this user to ADMIN?")) return;
    setActionLoading(id);
    try {
      await api.admin.promote(id);
      setUsers(users.map(u => u.id === id ? { ...u, role: "ADMIN" } : u));
    } catch (error) {
       console.error("Failed to promote user", error);
       alert("Failed to promote user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (id: number) => {
    if (!confirm("Demote this user to USER?")) return;
    setActionLoading(id);
    try {
      await api.admin.demote(id);
      setUsers(users.map(u => u.id === id ? { ...u, role: "USER" } : u));
    } catch (error) {
       console.error("Failed to demote user", error);
       alert("Failed to demote user");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="flex-1 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
                Total: {users.length}
            </Badge>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className="flex w-fit items-center gap-1"
                  >
                    {user.role === "ADMIN" ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(user.email)}
                      >
                        Copy Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.role === "USER" ? (
                         <DropdownMenuItem onClick={() => handlePromote(user.id)} disabled={actionLoading === user.id}>
                            <Shield className="mr-2 h-4 w-4 text-blue-500" />
                            Promote to Admin
                         </DropdownMenuItem>
                      ) : (
                         <DropdownMenuItem onClick={() => handleDemote(user.id)} disabled={actionLoading === user.id}>
                            <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" />
                            Demote to User
                         </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} disabled={actionLoading === user.id} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
