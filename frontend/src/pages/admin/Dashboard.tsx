import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPosts } from '../../api/posts';
import { getPages } from '../../api/pages';
import { getMedia } from '../../api/media';
import { useAuth } from '../../hooks/useAuth';

export function Dashboard() {
  const { user, isAdmin } = useAuth();

  const { data: postsData } = useQuery({ queryKey: ['posts', 'admin'], queryFn: () => getPosts({ limit: 100 }) });
  const { data: pagesData } = useQuery({ queryKey: ['pages'], queryFn: getPages });
  const { data: mediaData } = useQuery({ queryKey: ['media'], queryFn: () => getMedia({ limit: 1 }) });

  const stats = [
    { label: 'Posts', value: postsData?.total ?? '—', to: '/admin/posts' },
    { label: 'Pages', value: pagesData?.pages?.length ?? '—', to: '/admin/pages' },
    { label: 'Media Files', value: mediaData?.total ?? '—', to: '/admin/media' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.username}!</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="card p-6 hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/admin/posts/new" className="btn-primary block text-center">New Post</Link>
            <Link to="/admin/pages/new" className="btn-secondary block text-center">New Page</Link>
            <Link to="/admin/media" className="btn-secondary block text-center">Upload Media</Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Recent Posts</h2>
          <div className="space-y-2">
            {postsData?.posts?.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between">
                <Link to={`/admin/posts/${post.id}/edit`} className="text-sm text-primary-600 hover:underline truncate">
                  {post.title}
                </Link>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
