import apiClient from './client';
import type { Post, PaginatedResponse } from '../types';
import type { CreatePostInput, UpdatePostInput } from '@reactpress/shared';

export async function getPosts(params?: Record<string, unknown>): Promise<PaginatedResponse<Post>> {
  const res = await apiClient.get('/posts', { params });
  return res.data;
}

export async function getPostBySlug(slug: string): Promise<{ post: Post }> {
  const res = await apiClient.get(`/posts/${slug}`);
  return res.data;
}

export async function createPost(data: CreatePostInput): Promise<{ post: Post }> {
  const res = await apiClient.post('/posts', data);
  return res.data;
}

export async function updatePost(id: string, data: UpdatePostInput): Promise<{ post: Post }> {
  const res = await apiClient.put(`/posts/${id}`, data);
  return res.data;
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}

export async function publishPost(id: string): Promise<{ post: Post }> {
  const res = await apiClient.patch(`/posts/${id}/publish`);
  return res.data;
}
