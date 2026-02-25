import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { authRegisterLimiter, authLoginLimiter } from '../config/rateLimit';
import { RegisterSchema, LoginSchema } from '@reactpress/shared';

export const authRouter = Router();

authRouter.post('/register', authRegisterLimiter, validate(RegisterSchema), AuthController.register);
authRouter.post('/login', authLoginLimiter, validate(LoginSchema), AuthController.login);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);
