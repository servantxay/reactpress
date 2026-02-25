import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary-600">
            ReactPress
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </NavLink>
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <span className="text-sm text-gray-500">{user?.username}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn-primary text-sm px-3 py-1.5">
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ReactPress
      </footer>
    </div>
  );
}
