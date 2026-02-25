import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getPostBySlug } from '../../api/posts';

export function PostDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading…</div>;
  if (isError || !data?.post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  const post = data.post;
  const cleanContent = DOMPurify.sanitize(post.content ?? '');

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">← Back</Link>

      {post.featuredImage && (
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.alt ?? post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex gap-2 mb-3">
        {post.categories.map((cat) => (
          <Link key={cat.id} to={`/?categoryId=${cat.id}`} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
            {cat.name}
          </Link>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
        <span>By {post.author.username}</span>
        {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
        <div className="flex gap-1">
          {post.tags.map((tag) => (
            <span key={tag.id} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">#{tag.name}</span>
          ))}
        </div>
      </div>

      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </div>
  );
}
