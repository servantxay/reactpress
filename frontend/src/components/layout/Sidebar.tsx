import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/admin/posts', label: 'Posts', icon: '📝' },
  { to: '/admin/pages', label: 'Pages', icon: '📄' },
  { to: '/admin/media', label: 'Media', icon: '🖼' },
  { to: '/admin/users', label: 'Users', icon: '👥', adminOnly: true },
  { to: '/admin/settings', label: 'Settings', icon: '⚙', adminOnly: true },
];

export function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <span className="text-white font-bold text-lg">ReactPress</span>
      </div>
      <nav className="flex-1 p-2">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
