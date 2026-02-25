import apiClient from './client';
import type { Category } from '../types';
import type { CreateCategoryInput, UpdateCategoryInput } from '@reactpress/shared';

export async function getCategories(): Promise<{ categories: Category[] }> {
  const res = await apiClient.get('/categories');
  return res.data;
}

export async function createCategory(data: CreateCategoryInput): Promise<{ category: Category }> {
  const res = await apiClient.post('/categories', data);
  return res.data;
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<{ category: Category }> {
  const res = await apiClient.put(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
