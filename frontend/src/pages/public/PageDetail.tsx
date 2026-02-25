import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getPageBySlug } from '../../api/pages';

export function PageDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPageBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">Loading…</div>;
  if (isError || !data?.page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Page not found.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  const page = data.page;
  const cleanContent = DOMPurify.sanitize(page.content ?? '');

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </div>
  );
}
