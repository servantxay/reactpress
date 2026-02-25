import { Router } from 'express';
import * as TagController from '../controllers/tag.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { CreateTagSchema, UpdateTagSchema } from '@reactpress/shared';

export const tagRouter = Router();

tagRouter.get('/', TagController.listTags);
tagRouter.post('/', authenticate, authorize('AUTHOR'), validate(CreateTagSchema), TagController.createTag);
tagRouter.put('/:id', authenticate, authorize('AUTHOR'), validate(UpdateTagSchema), TagController.updateTag);
tagRouter.delete('/:id', authenticate, authorize('ADMIN'), TagController.deleteTag);
