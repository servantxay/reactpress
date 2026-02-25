import { Router } from 'express';
import * as PostController from '../controllers/post.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { CreatePostSchema, UpdatePostSchema, PostQuerySchema } from '@reactpress/shared';

export const postRouter = Router();

postRouter.get('/', validate(PostQuerySchema, 'query'), PostController.listPosts);
postRouter.get('/:slug', PostController.getPost);
postRouter.post('/', authenticate, authorize('AUTHOR'), validate(CreatePostSchema), PostController.createPost);
postRouter.put('/:id', authenticate, authorize('AUTHOR'), validate(UpdatePostSchema), PostController.updatePost);
postRouter.delete('/:id', authenticate, authorize('EDITOR'), PostController.deletePost);
postRouter.patch('/:id/publish', authenticate, authorize('EDITOR'), PostController.publishPost);
