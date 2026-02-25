import { Router } from 'express';
import * as PageController from '../controllers/page.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { CreatePageSchema, UpdatePageSchema } from '@reactpress/shared';

export const pageRouter = Router();

pageRouter.get('/', PageController.listPages);
pageRouter.get('/:slug', PageController.getPage);
pageRouter.post('/', authenticate, authorize('EDITOR'), validate(CreatePageSchema), PageController.createPage);
pageRouter.put('/:id', authenticate, authorize('EDITOR'), validate(UpdatePageSchema), PageController.updatePage);
pageRouter.delete('/:id', authenticate, authorize('EDITOR'), PageController.deletePage);
