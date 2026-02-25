import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create settings singleton
  await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      siteTitle: 'ReactPress',
      siteDescription: 'A modern WordPress clone',
      siteUrl: 'http://localhost:5173',
      postsPerPage: 10,
      allowRegistration: true,
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reactpress.dev' },
    update: {},
    create: {
      email: 'admin@reactpress.dev',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      bio: 'Site administrator',
    },
  });

  // Create editor user
  const editorPassword = await bcrypt.hash('Editor1234!', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@reactpress.dev' },
    update: {},
    create: {
      email: 'editor@reactpress.dev',
      username: 'editor',
      passwordHash: editorPassword,
      role: 'EDITOR',
      bio: 'Site editor',
    },
  });

  // Create categories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Technology', slug: 'technology', description: 'Tech articles' },
  });

  const newsCategory = await prisma.category.upsert({
    where: { slug: 'news' },
    update: {},
    create: { name: 'News', slug: 'news', description: 'Latest news' },
  });

  // Create tags
  const reactTag = await prisma.tag.upsert({
    where: { slug: 'react' },
    update: {},
    create: { name: 'React', slug: 'react' },
  });

  const typescriptTag = await prisma.tag.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: { name: 'TypeScript', slug: 'typescript' },
  });

  // Create sample posts
  await prisma.post.upsert({
    where: { slug: 'welcome-to-reactpress' },
    update: {},
    create: {
      title: 'Welcome to ReactPress',
      slug: 'welcome-to-reactpress',
      content: '<h2>Welcome to ReactPress!</h2><p>This is your first post. Edit or delete it, then start writing!</p>',
      excerpt: 'Welcome to ReactPress, your new blogging platform.',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      categories: { connect: [{ id: newsCategory.id }] },
      tags: { connect: [{ id: reactTag.id }] },
    },
  });

  await prisma.post.upsert({
    where: { slug: 'getting-started-with-react-and-typescript' },
    update: {},
    create: {
      title: 'Getting Started with React and TypeScript',
      slug: 'getting-started-with-react-and-typescript',
      content: '<h2>React + TypeScript</h2><p>A powerful combination for building modern web applications.</p>',
      excerpt: 'Learn how to set up a React project with TypeScript.',
      status: 'PUBLISHED',
      authorId: editor.id,
      publishedAt: new Date(),
      categories: { connect: [{ id: techCategory.id }] },
      tags: { connect: [{ id: reactTag.id }, { id: typescriptTag.id }] },
    },
  });

  // Create sample page
  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'About',
      slug: 'about',
      content: '<h1>About ReactPress</h1><p>ReactPress is a modern blogging platform built with React and Node.js.</p>',
      status: 'PUBLISHED',
      authorId: admin.id,
      order: 1,
    },
  });

  console.log('Seed complete!');
  console.log('Admin: admin@reactpress.dev / Admin1234!');
  console.log('Editor: editor@reactpress.dev / Editor1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
