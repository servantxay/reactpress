import { Request, Response, NextFunction } from 'express';
import * as PostService from '../services/post.service';

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await PostService.listPosts(req.query as any, !!req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await PostService.getPostBySlug(req.params.slug, !!req.user);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await PostService.createPost(req.body, req.user!.id);
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await PostService.updatePost(req.params.id, req.body, req.user!.id, req.user!.role);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await PostService.deletePost(req.params.id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function publishPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await PostService.publishPost(req.params.id, req.user!.role);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}
