import apiClient from './client';
import type { User } from '../types';

export async function getUsers(): Promise<{ users: User[] }> {
  const res = await apiClient.get('/users');
  return res.data;
}

export async function updateUserRole(id: string, role: string): Promise<{ user: User }> {
  const res = await apiClient.put(`/users/${id}/role`, { role });
  return res.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
