import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPages, deletePage } from '../../../api/pages';

export function PagesList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['pages'], queryFn: getPages });

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link to="/admin/pages/new" className="btn-primary">New Page</Link>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.pages?.map((page) => (
                <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/pages/${page.slug}/edit`} className="font-medium hover:text-primary-600">
                      {page.title}
                    </Link>
                    <p className="text-xs text-gray-400">{page.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{page.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/pages/${page.slug}/edit`} className="text-xs btn-secondary px-2 py-1">Edit</Link>
                      <button
                        onClick={() => { if (confirm('Delete this page?')) deleteMutation.mutate(page.id); }}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
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
