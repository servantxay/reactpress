import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPosts } from '../../api/posts';
import { getCategories } from '../../api/categories';

export function Home() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'public', { page, categoryId }],
    queryFn: () => getPosts({ page, limit: 10, status: 'PUBLISHED', categoryId }),
  });

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="col-span-2">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading posts…</div>
        ) : data?.posts?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No posts yet.</div>
        ) : (
          <div className="space-y-8">
            {data?.posts?.map((post) => (
              <article key={post.id} className="card p-6">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt ?? post.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <div className="flex gap-2 mb-2">
                  {post.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id === categoryId ? undefined : cat.id)}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        categoryId === cat.id ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  <Link to={`/post/${post.slug}`} className="hover:text-primary-600">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>By {post.author.username}</span>
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                </div>
                <Link to={`/post/${post.slug}`} className="mt-3 inline-block text-sm text-primary-600 hover:underline">
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-3 py-1">
              ← Prev
            </button>
            <span className="py-1 px-3 text-sm text-gray-600">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages} className="btn-secondary px-3 py-1">
              Next →
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`block w-full text-left text-sm px-2 py-1 rounded ${!categoryId ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All Posts
            </button>
            {categoriesData?.categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id === categoryId ? undefined : cat.id)}
                className={`block w-full text-left text-sm px-2 py-1 rounded ${categoryId === cat.id ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {cat.name} <span className="text-gray-400">({cat._count?.posts ?? 0})</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
