import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePostSchema, type CreatePostInput } from '@reactpress/shared';
import { getPostBySlug, createPost, updatePost } from '../../../api/posts';
import { getCategories } from '../../../api/categories';
import { getTags } from '../../../api/tags';
import { TiptapEditor } from '../../../components/editor/TiptapEditor';

export function PostEdit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: getTags });

  const { data: postData, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPostBySlug(id!),
    enabled: !isNew,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: { status: 'DRAFT', categoryIds: [], tagIds: [], content: '' },
  });

  useEffect(() => {
    if (postData?.post) {
      const p = postData.post;
      reset({
        title: p.title,
        slug: p.slug,
        content: p.content ?? '',
        excerpt: p.excerpt ?? '',
        status: p.status,
        categoryIds: p.categories.map((c) => c.id),
        tagIds: p.tags.map((t) => t.id),
        featuredImageId: p.featuredImage?.id,
      });
    }
  }, [postData, reset]);

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['posts'] }); navigate('/admin/posts'); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreatePostInput) => updatePost(postData!.post.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['posts'] }); navigate('/admin/posts'); },
  });

  const onSubmit = (data: CreatePostInput) => {
    if (isNew) createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  if (!isNew && isLoading) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card p-4 space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input" {...register('title')} placeholder="Post title" />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input" {...register('slug')} placeholder="post-slug (auto-generated if empty)" />
            </div>
            <div>
              <label className="label">Excerpt</label>
              <textarea className="input" rows={2} {...register('excerpt')} placeholder="Short summary…" />
            </div>
          </div>

          <div className="card p-4">
            <label className="label mb-2">Content</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TiptapEditor content={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="font-medium">Publish</h3>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Saving…' : isNew ? 'Create Post' : 'Update Post'}
            </button>
          </div>

          <div className="card p-4">
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {categoriesData?.categories?.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={cat.id}
                    {...register('categoryIds')}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium mb-3">Tags</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {tagsData?.tags?.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={tag.id}
                    {...register('tagIds')}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
