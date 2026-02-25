import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import * as authApi from '../api/auth';
import type { LoginInput, RegisterInput } from '@reactpress/shared';

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(
    async (data: LoginInput) => {
      const result = await authApi.login(data);
      setAuth(result.accessToken, result.user);
      return result;
    },
    [setAuth]
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      return authApi.register(data);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const initAuth = useCallback(async () => {
    try {
      const { data } = await import('../api/client').then((m) =>
        m.default.post('/auth/refresh')
      );
      const { accessToken } = data;
      const meResult = await authApi.getMe();
      setAuth(accessToken, meResult.user);
    } catch {
      clearAuth();
    }
  }, [setAuth, clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isAdmin: user?.role === 'ADMIN',
    isEditor: user?.role === 'ADMIN' || user?.role === 'EDITOR',
    isAuthor: user?.role === 'ADMIN' || user?.role === 'EDITOR' || user?.role === 'AUTHOR',
    login,
    register,
    logout,
    initAuth,
  };
}
