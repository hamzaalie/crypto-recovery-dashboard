import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDate, cn } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  X,
  Loader2,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt: string;
}

const roleColors: Record<string, string> = {
  user: 'bg-gray-100 text-gray-800',
  support_agent: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.patch(`/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User updated', description: 'User has been updated successfully.' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User deleted', description: 'User has been deleted successfully.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });

  const users = usersData?.data || [];

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    updateUserMutation.mutate({ id: userId, data: { status: newStatus } });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({ id: userId, data: { role: newRole } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage all platform users
          </p>
        </div>
        <Button onClick={() => { setModalMode('create'); setSelectedUser(null); setIsModalOpen(true); }} className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold">{usersData?.total || 0}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Active</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {users.filter((u: User) => u.status === 'active').length}
                </p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Agents</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {users.filter((u: User) => u.role === 'support_agent').length}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Admins</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {users.filter((u: User) => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="support_agent">Support Agent</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2FA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', roleColors[user.role])}>
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[user.status])}>
                          {user.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isTwoFactorEnabled ? (
                          <Shield className="h-5 w-5 text-green-600" />
                        ) : (
                          <ShieldOff className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{modalMode === 'create' ? 'Create User' : 'Edit User'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUser && (
                <>
                  <div>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                      value={selectedUser.role}
                      onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="support_agent">Support Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                      value={selectedUser.status}
                      onChange={(e) => handleStatusChange(selectedUser.id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
