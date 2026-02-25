import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { UpdateUserSchema, UpdateUserRoleSchema, ChangePasswordSchema } from '@reactpress/shared';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/', authorize('ADMIN'), UserController.listUsers);
userRouter.get('/:id', UserController.getUser);
userRouter.put('/:id', validate(UpdateUserSchema), UserController.updateUser);
userRouter.put('/:id/role', authorize('ADMIN'), validate(UpdateUserRoleSchema), UserController.updateUserRole);
userRouter.put('/:id/password', validate(ChangePasswordSchema), UserController.changePassword);
userRouter.delete('/:id', authorize('ADMIN'), UserController.deleteUser);
