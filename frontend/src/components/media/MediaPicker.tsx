import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedia, uploadMedia } from '../../api/media';
import type { MediaItem } from '../../types';

interface Props {
  onSelect: (url: string, item?: MediaItem) => void;
  onClose: () => void;
}

export function MediaPicker({ onSelect, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['media', 'picker'],
    queryFn: () => getMedia({ limit: 40 }),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] }),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadMutation.mutateAsync(file);
      setSelected(result.media);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-3xl max-w-4xl mx-4 flex flex-col" style={{ height: '70vh' }}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Select Media</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading…</div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {/* Upload slot */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs">Upload</span>
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*,application/pdf" />

              {data?.items?.filter((item) => item.mimeType.startsWith('image/')).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors ${
                    selected?.id === item.id ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={item.url} alt={item.alt ?? item.originalName} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          {selected ? (
            <span className="text-sm text-gray-600 truncate">{selected.originalName}</span>
          ) : (
            <span className="text-sm text-gray-400">No file selected</span>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              type="button"
              onClick={() => selected && onSelect(selected.url, selected)}
              disabled={!selected}
              className="btn-primary"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
