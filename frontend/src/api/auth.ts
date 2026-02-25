import apiClient from './client';
import type { User } from '../types';
import type { RegisterInput, LoginInput } from '@reactpress/shared';

export async function register(data: RegisterInput): Promise<{ user: User }> {
  const res = await apiClient.post('/auth/register', data);
  return res.data;
}

export async function login(data: LoginInput): Promise<{ accessToken: string; user: User }> {
  const res = await apiClient.post('/auth/login', data);
  return res.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getMe(): Promise<{ user: User }> {
  const res = await apiClient.get('/auth/me');
  return res.data;
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const res = await apiClient.post('/auth/refresh');
  return res.data;
}
