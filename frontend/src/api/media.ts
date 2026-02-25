import apiClient from './client';
import type { MediaItem, PaginatedResponse } from '../types';

export async function getMedia(params?: Record<string, unknown>): Promise<PaginatedResponse<MediaItem>> {
  const res = await apiClient.get('/media', { params });
  return res.data;
}

export async function uploadMedia(file: File): Promise<{ media: MediaItem }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateMedia(id: string, data: { alt?: string }): Promise<{ media: MediaItem }> {
  const res = await apiClient.put(`/media/${id}`, data);
  return res.data;
}

export async function deleteMedia(id: string): Promise<void> {
  await apiClient.delete(`/media/${id}`);
}
