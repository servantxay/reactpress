import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const { isAuthenticated, initAuth } = useAuth();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      initAuth().finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, initAuth]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
