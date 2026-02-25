import { Router } from 'express';
import * as SettingsController from '../controllers/settings.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

export const settingsRouter = Router();

settingsRouter.get('/', SettingsController.getSettings);
settingsRouter.put('/', authenticate, authorize('ADMIN'), SettingsController.updateSettings);
