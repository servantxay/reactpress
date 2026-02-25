import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPosts, deletePost, publishPost } from '../../../api/posts';
import type { PostStatus } from '../../../types';

export function PostsList() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PostStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'admin', { status, page }],
    queryFn: () => getPosts({ status: status || undefined, page }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  const publishMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link to="/admin/posts/new" className="btn-primary">New Post</Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex gap-2">
          {(['', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1 rounded-full text-sm ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.posts?.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/posts/${post.slug}/edit`} className="font-medium text-gray-900 hover:text-primary-600">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{post.author.username}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/posts/${post.slug}/edit`} className="text-xs btn-secondary px-2 py-1">Edit</Link>
                      {post.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => publishMutation.mutate(post.id)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Delete this post?')) deleteMutation.mutate(post.id);
                        }}
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

        {data && data.totalPages > 1 && (
          <div className="p-4 flex justify-center gap-2">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm ${page === p ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
