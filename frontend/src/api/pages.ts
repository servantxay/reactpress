import apiClient from './client';
import type { Page } from '../types';
import type { CreatePageInput, UpdatePageInput } from '@reactpress/shared';

export async function getPages(): Promise<{ pages: Page[] }> {
  const res = await apiClient.get('/pages');
  return res.data;
}

export async function getPageBySlug(slug: string): Promise<{ page: Page }> {
  const res = await apiClient.get(`/pages/${slug}`);
  return res.data;
}

export async function createPage(data: CreatePageInput): Promise<{ page: Page }> {
  const res = await apiClient.post('/pages', data);
  return res.data;
}

export async function updatePage(id: string, data: UpdatePageInput): Promise<{ page: Page }> {
  const res = await apiClient.put(`/pages/${id}`, data);
  return res.data;
}

export async function deletePage(id: string): Promise<void> {
  await apiClient.delete(`/pages/${id}`);
}
