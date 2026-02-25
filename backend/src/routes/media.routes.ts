import { Router } from 'express';
import * as MediaController from '../controllers/media.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { upload } from '../config/multer';
import { uploadScan } from '../middleware/uploadScan';
import { uploadLimiter } from '../config/rateLimit';
import { MediaQuerySchema, UpdateMediaSchema } from '@reactpress/shared';

export const mediaRouter = Router();

mediaRouter.use(authenticate);

mediaRouter.get('/', validate(MediaQuerySchema, 'query'), MediaController.listMedia);
mediaRouter.post(
  '/upload',
  uploadLimiter,
  authorize('AUTHOR'),
  upload.single('file'),
  uploadScan,
  MediaController.uploadMedia
);
mediaRouter.put('/:id', validate(UpdateMediaSchema), MediaController.updateMedia);
mediaRouter.delete('/:id', MediaController.deleteMedia);
