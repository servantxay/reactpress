import apiClient from './client';
import type { Settings } from '../types';

export async function getSettings(): Promise<{ settings: Settings }> {
  const res = await apiClient.get('/settings');
  return res.data;
}

export async function updateSettings(data: Partial<Settings>): Promise<{ settings: Settings }> {
  const res = await apiClient.put('/settings', data);
  return res.data;
}
