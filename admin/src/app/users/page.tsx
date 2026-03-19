"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, formatRelativeTime, getInitials, stringToColor, cn } from "@/lib/utils";
import api, { endpoints } from "@/lib/api";
import {
  Search,
  UserPlus,
  Shield,
  MoreVertical,
  Power,
  PowerOff,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import type { User } from "@/types";

const mockUsers: User[] = [
  {
    id: "u1",
    email: "admin@propertyauction.in",
    name: "Priya Patel",
    role: "super_admin",
    isActive: true,
    lastLogin: new Date(Date.now() - 300000).toISOString(),
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "u2",
    email: "vikram@propertyauction.in",
    name: "Vikram Singh",
    role: "admin",
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "u3",
    email: "anita@propertyauction.in",
    name: "Anita Sharma",
    role: "moderator",
    isActive: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "u4",
    email: "rajesh.kumar@gmail.com",
    name: "Rajesh Kumar",
    role: "viewer",
    isActive: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "u5",
    email: "sunita.devi@yahoo.com",
    name: "Sunita Devi",
    role: "viewer",
    isActive: false,
    lastLogin: new Date(Date.now() - 2592000000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: "u6",
    email: "amit.jain@propertyauction.in",
    name: "Amit Jain",
    role: "moderator",
    isActive: true,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "u7",
    email: "deepa.menon@gmail.com",
    name: "Deepa Menon",
    role: "viewer",
    isActive: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "viewer", label: "Viewer" },
];

const roleBadge = (role: string) => {
  const map: Record<string, { variant: "danger" | "warning" | "info" | "default"; label: string }> = {
    super_admin: { variant: "danger", label: "Super Admin" },
    admin: { variant: "warning", label: "Admin" },
    moderator: { variant: "info", label: "Moderator" },
    viewer: { variant: "default", label: "Viewer" },
  };
  const config = map[role] || { variant: "default" as const, label: role };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.get(endpoints.users.list, {
          params: { search, role: filterRole, page },
        });
        setUsers(res.data.data);
      } catch {
        // Use mock data
      }
    }
    fetchUsers();
  }, [search, filterRole, page]);

  const handleToggleActive = async (user: User) => {
    try {
      await api.post(endpoints.users.toggleActive(user.id));
    } catch {
      // Toggle locally
    }
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      )
    );
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(endpoints.users.update(userId), { role: newRole });
    } catch {
      // Update locally
    }
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, role: newRole as User["role"] } : u
      )
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">
              Manage admin users, roles, and permissions
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-600/10 p-3">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="stat-card-label">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-600/10 p-3">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="stat-card-label">Active</p>
                <p className="text-2xl font-bold text-slate-900">
                  {activeUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-600/10 p-3">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="stat-card-label">Inactive</p>
                <p className="text-2xl font-bold text-slate-900">
                  {inactiveUsers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-40">
            <Select
              options={roleOptions}
              placeholder="All Roles"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                            stringToColor(user.name)
                          )}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="default" dot>
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {user.lastLogin
                        ? formatRelativeTime(user.lastLogin)
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setDetailOpen(true);
                          }}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(user)}
                          title={
                            user.isActive ? "Deactivate user" : "Activate user"
                          }
                        >
                          {user.isActive ? (
                            <PowerOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Power className="h-4 w-4 text-emerald-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>

        {/* User Detail Dialog */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          className="max-w-md"
        >
          <DialogHeader onClose={() => setDetailOpen(false)}>
            User Details
          </DialogHeader>
          {selectedUser && (
            <DialogBody>
              <div className="flex flex-col items-center pb-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white",
                    stringToColor(selectedUser.name)
                  )}
                >
                  {getInitials(selectedUser.name)}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
                <div className="mt-2">{roleBadge(selectedUser.role)}</div>
              </div>

              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Role
                  </label>
                  <Select
                    options={roleOptions}
                    value={selectedUser.role}
                    onChange={(e) => {
                      handleRoleChange(selectedUser.id, e.target.value);
                      setSelectedUser({
                        ...selectedUser,
                        role: e.target.value as User["role"],
                      });
                    }}
                  />
                </div>

                <dl className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      {selectedUser.isActive ? (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="default" dot>
                          Inactive
                        </Badge>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-slate-500">Last Login</dt>
                    <dd className="text-slate-700">
                      {selectedUser.lastLogin
                        ? formatRelativeTime(selectedUser.lastLogin)
                        : "Never"}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-slate-500">Joined</dt>
                    <dd className="text-slate-700">
                      {formatDate(selectedUser.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
