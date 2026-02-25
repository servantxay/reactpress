import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, deleteUser } from '../../../api/users';
import { useAuth } from '../../../hooks/useAuth';
import type { UserRole } from '../../../types';

const ROLES: UserRole[] = ['SUBSCRIBER', 'AUTHOR', 'EDITOR', 'ADMIN'];

export function UsersList() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Posts</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {u.id === currentUser?.id ? (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{u.role}</span>
                    ) : (
                      <select
                        value={u.role}
                        className="text-sm border border-gray-200 rounded px-2 py-1"
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(u as any)._count?.posts ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => { if (confirm(`Delete user ${u.username}?`)) deleteMutation.mutate(u.id); }}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
