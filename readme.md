# ReactPress

A WordPress blog clone built with a React frontend and Node.js backend.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React + Vite + TypeScript + TailwindCSS + React Query + Zustand + React Router v6 + Tiptap |
| **Backend** | Express.js + TypeScript + Prisma + PostgreSQL |
| **Auth** | JWT access tokens + refresh token rotation (httpOnly cookies) |
| **Validation** | Zod schemas shared between frontend and backend |

---

## Project Structure

```
reactPress/
├── shared/          # Shared Zod schemas (auth, post, page, user, media, category, tag)
├── backend/         # Express API server
└── frontend/        # React + Vite app
```

### What's Included

**Shared (`shared/`)**
- 7 Zod schemas shared between frontend and backend for consistent validation

**Backend (`backend/`)**
- Config: Zod env validation, CORS whitelist, tiered rate limiters, Multer upload config
- Prisma: Full schema (8 models) + seed script with admin/editor users and sample content
- Middleware: JWT authenticate, role-based authorize, Zod validate, centralized error handler, magic-bytes file upload scanner
- Services: token (JWT sign/verify/rotate), auth, post (with sanitize-html), page, media (with sharp optimization)
- 8 resource routers wired to controllers with proper auth guards

**Frontend (`frontend/`)**
- Vite + Tailwind + React Router v6 scaffolding
- Zustand auth store — access token in memory only, never localStorage
- Axios client with Bearer token injection + silent 401 refresh interceptor
- 9 API modules (auth, posts, pages, media, categories, tags, users, settings)
- Admin pages: Dashboard, Posts list/edit, Pages list/edit, Media library, Users management, Settings
- Public pages: Home (with category filter + pagination), Post detail, Page detail
- TiptapEditor with full toolbar (bold/italic/headings/lists/links/images)
- MediaPicker modal for inserting images into the editor

---

## Security

- **Helmet.js** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **express-rate-limit** — tiered limits per route group
- **CORS** — whitelist frontend origin only
- **bcrypt** — cost factor 12 for password hashing
- **JWT** — 15-min access tokens; 7-day refresh tokens stored as bcrypt hashes in DB
- **File uploads** — MIME + magic bytes check, 10MB max, sharp for image processing
- **sanitize-html** — strips dangerous HTML from post/page content
- **Prisma ORM** — parameterized queries prevent SQL injection
- **httpOnly + Secure + SameSite=Strict** cookies for refresh tokens
- **DOMPurify** — sanitizes HTML before rendering on the frontend

---

## Getting Started

### 1. Set Up PostgreSQL

**Install PostgreSQL (if not already installed):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Create a database and user:**
```bash
sudo -u postgres psql
```

Inside the PostgreSQL terminal, run the following (replace `your_project_db`, `your_user`, and `your_password` with your own values):

```sql
-- Create database and user
CREATE DATABASE your_project_db;
CREATE USER your_user WITH PASSWORD 'your_password';
ALTER USER your_user CREATEDB;

-- Configure user settings
ALTER ROLE your_user SET client_encoding TO 'utf8';
ALTER ROLE your_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_user SET default_transaction_deferrable TO on;
ALTER ROLE your_user SET default_transaction_read_only TO off;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE your_project_db TO your_user;

-- Connect to the database and grant schema permissions
\c your_project_db
GRANT USAGE ON SCHEMA public TO your_user;
GRANT CREATE ON SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO your_user;

\q
```

**Verify the connection:**
```bash
psql -U your_user -d your_project_db -h localhost
```

---

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database URL and JWT secrets.

---

### 3. Install Dependencies

```bash
cd shared && npm install && npm run build
cd ../backend && npm install
cd ../frontend && npm install
```

---

### 4. Set Up the Database

```bash
cd backend && npm run db:migrate && npm run db:seed
```

This seeds the database with two default accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@reactpress.dev | Admin1234! |
| Editor | editor@reactpress.dev | Editor1234! |

---

### 5. Start the Servers

Open two terminals:

```bash
# Terminal 1 — API server (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend dev server (port 5173)
cd frontend && npm run dev
```

Visit [http://localhost:5173/login](http://localhost:5173/login) and log in with `admin@reactpress.dev` / `Admin1234!`.

---

## API Overview

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public (rate: 5/15m) |
| POST | `/api/auth/login` | Public (rate: 10/15m) |
| POST | `/api/auth/refresh` | Public (cookie) |
| POST | `/api/auth/logout` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/posts` | Public (published) / Auth (all) |
| POST | `/api/posts` | Author+ |
| PUT | `/api/posts/:id` | Author (own) / Editor+ |
| DELETE | `/api/posts/:id` | Editor+ |
| PATCH | `/api/posts/:id/publish` | Editor+ |
| GET | `/api/pages` | Public (published) |
| POST | `/api/pages` | Editor+ |
| PUT/DELETE | `/api/pages/:id` | Editor+ / Admin |
| GET/POST | `/api/media` | Authenticated / Author+ |
| DELETE | `/api/media/:id` | Owner or Admin |
| GET | `/api/users` | Admin |
| PUT | `/api/users/:id/role` | Admin |
| GET/POST/PUT | `/api/categories` | Public / Editor+ |
| GET/POST/PUT | `/api/tags` | Public / Author+ |
| GET/PUT | `/api/settings` | Public (GET) / Admin (PUT) |