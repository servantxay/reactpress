import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@reactpress/shared';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUBSCRIBER: 0,
  AUTHOR: 1,
  EDITOR: 2,
  ADMIN: 3,
};

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const requiredLevel = Math.min(...roles.map((r) => ROLE_HIERARCHY[r]));

    if (userLevel < requiredLevel) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
