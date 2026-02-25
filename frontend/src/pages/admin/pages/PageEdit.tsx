import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePageSchema, type CreatePageInput } from '@reactpress/shared';
import { getPageBySlug, createPage, updatePage } from '../../../api/pages';
import { TiptapEditor } from '../../../components/editor/TiptapEditor';

export function PageEdit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', id],
    queryFn: () => getPageBySlug(id!),
    enabled: !isNew,
  });

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<CreatePageInput>({
    resolver: zodResolver(CreatePageSchema),
    defaultValues: { status: 'DRAFT', content: '', order: 0 },
  });

  useEffect(() => {
    if (pageData?.page) {
      const p = pageData.page;
      reset({ title: p.title, slug: p.slug, content: p.content ?? '', status: p.status, order: p.order });
    }
  }, [pageData, reset]);

  const createMutation = useMutation({
    mutationFn: createPage,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pages'] }); navigate('/admin/pages'); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreatePageInput) => updatePage(pageData!.page.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pages'] }); navigate('/admin/pages'); },
  });

  const onSubmit = (data: CreatePageInput) => {
    if (isNew) createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  if (!isNew && isLoading) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'New Page' : 'Edit Page'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card p-4 space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input" {...register('title')} placeholder="Page title" />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input" {...register('slug')} placeholder="page-slug" />
            </div>
          </div>

          <div className="card p-4">
            <label className="label mb-2">Content</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => <TiptapEditor content={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4 space-y-3">
            <h3 className="font-medium">Settings</h3>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register('status')}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="label">Order</label>
              <input type="number" className="input" {...register('order', { valueAsNumber: true })} />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Saving…' : isNew ? 'Create Page' : 'Update Page'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
