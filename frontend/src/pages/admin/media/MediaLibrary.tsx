import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedia, uploadMedia, deleteMedia } from '../../../api/media';
import type { MediaItem } from '../../../types';

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['media', page],
    queryFn: () => getMedia({ page, limit: 20 }),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['media'] }); setSelected(null); },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      await uploadMutation.mutateAsync(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
          Upload Files
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {uploadMutation.isPending && (
        <div className="mb-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm">Uploading…</div>
      )}

      <div className="flex gap-6">
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center p-8 text-gray-500">Loading…</div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {data?.items?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    selected?.id === item.id ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  {item.mimeType.startsWith('image/') ? (
                    <img src={item.url} alt={item.alt ?? item.originalName} className="w-full h-24 object-cover" />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-2xl">
                      {item.mimeType.includes('pdf') ? '📄' : item.mimeType.includes('video') ? '🎬' : '📎'}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 p-1 truncate">{item.originalName}</p>
                </div>
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${page === p ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="w-64 card p-4 space-y-3">
            <h3 className="font-medium">File Details</h3>
            {selected.mimeType.startsWith('image/') && (
              <img src={selected.url} alt={selected.alt ?? ''} className="w-full rounded" />
            )}
            <div className="space-y-1 text-sm">
              <p className="text-gray-500">Name: <span className="text-gray-900">{selected.originalName}</span></p>
              <p className="text-gray-500">Type: <span className="text-gray-900">{selected.mimeType}</span></p>
              <p className="text-gray-500">Size: <span className="text-gray-900">{formatSize(selected.size)}</span></p>
              {selected.width && <p className="text-gray-500">Dimensions: <span className="text-gray-900">{selected.width}×{selected.height}</span></p>}
            </div>
            <div>
              <label className="label text-xs">URL</label>
              <input className="input text-xs" readOnly value={selected.url} onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
            <button
              onClick={() => { if (confirm('Delete this file?')) deleteMutation.mutate(selected.id); }}
              className="btn-danger w-full text-xs"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
