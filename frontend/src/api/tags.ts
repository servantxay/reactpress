import apiClient from './client';
import type { Tag } from '../types';
import type { CreateTagInput } from '@reactpress/shared';

export async function getTags(): Promise<{ tags: Tag[] }> {
  const res = await apiClient.get('/tags');
  return res.data;
}

export async function createTag(data: CreateTagInput): Promise<{ tag: Tag }> {
  const res = await apiClient.post('/tags', data);
  return res.data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}
