import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../../../api/settings';
import type { Settings } from '../../../types';

export function SettingsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<Settings>();

  useEffect(() => {
    if (data?.settings) reset(data.settings);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const onSubmit = (formData: Settings) => mutation.mutate(formData);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Site Settings</h2>

          <div>
            <label className="label">Site Title</label>
            <input className="input" {...register('siteTitle')} />
          </div>

          <div>
            <label className="label">Site Description</label>
            <textarea className="input" rows={2} {...register('siteDescription')} />
          </div>

          <div>
            <label className="label">Site URL</label>
            <input className="input" type="url" {...register('siteUrl')} />
          </div>

          <div>
            <label className="label">Posts Per Page</label>
            <input className="input" type="number" min={1} max={100} {...register('postsPerPage', { valueAsNumber: true })} />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="allowRegistration" {...register('allowRegistration')} className="rounded" />
            <label htmlFor="allowRegistration" className="text-sm font-medium text-gray-700">
              Allow new user registration
            </label>
          </div>

          {mutation.isSuccess && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm">Settings saved!</div>
          )}

          <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
            {isSubmitting ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
