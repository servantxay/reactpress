import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { CreateCategorySchema, UpdateCategorySchema } from '@reactpress/shared';

export const categoryRouter = Router();

categoryRouter.get('/', CategoryController.listCategories);
categoryRouter.get('/:slug', CategoryController.getCategory);
categoryRouter.post('/', authenticate, authorize('EDITOR'), validate(CreateCategorySchema), CategoryController.createCategory);
categoryRouter.put('/:id', authenticate, authorize('EDITOR'), validate(UpdateCategorySchema), CategoryController.updateCategory);
categoryRouter.delete('/:id', authenticate, authorize('ADMIN'), CategoryController.deleteCategory);
