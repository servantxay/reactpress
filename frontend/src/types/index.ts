export type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface Author {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  _count?: { posts: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  uploadedById: string;
  uploadedBy?: { id: string; username: string };
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string | null;
  status: PostStatus;
  author: Author;
  featuredImage?: { id: string; url: string; alt?: string | null } | null;
  categories: Category[];
  tags: Tag[];
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  status: PostStatus;
  author: Author;
  parentId?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  postsPerPage: number;
  allowRegistration: boolean;
}

export interface PaginatedResponse<T> {
  items?: T[];
  posts?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
