import { Router } from 'express';
import { authRouter } from './auth.routes';
import { postRouter } from './post.routes';
import { pageRouter } from './page.routes';
import { categoryRouter } from './category.routes';
import { tagRouter } from './tag.routes';
import { mediaRouter } from './media.routes';
import { userRouter } from './user.routes';
import { settingsRouter } from './settings.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/posts', postRouter);
router.use('/pages', pageRouter);
router.use('/categories', categoryRouter);
router.use('/tags', tagRouter);
router.use('/media', mediaRouter);
router.use('/users', userRouter);
router.use('/settings', settingsRouter);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
