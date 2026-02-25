import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Home } from './pages/public/Home';
import { PostDetail } from './pages/public/PostDetail';
import { PageDetail } from './pages/public/PageDetail';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/admin/Dashboard';
import { PostsList } from './pages/admin/posts/PostsList';
import { PostEdit } from './pages/admin/posts/PostEdit';
import { PagesList } from './pages/admin/pages/PagesList';
import { PageEdit } from './pages/admin/pages/PageEdit';
import { MediaLibrary } from './pages/admin/media/MediaLibrary';
import { UsersList } from './pages/admin/users/UsersList';
import { SettingsPage } from './pages/admin/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/page/:slug" element={<PageDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<PostsList />} />
          <Route path="posts/new" element={<PostEdit />} />
          <Route path="posts/:id/edit" element={<PostEdit />} />
          <Route path="pages" element={<PagesList />} />
          <Route path="pages/new" element={<PageEdit />} />
          <Route path="pages/:id/edit" element={<PageEdit />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersList />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
