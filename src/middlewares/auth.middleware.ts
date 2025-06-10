import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Authentication required');
    }

    // Validate token
    const user = await AuthService.validateToken(token);

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};

export const roleMiddleware = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('Authentication required');
      }

      const userRole = req.user.role.name;

      if (!requiredRoles.includes(userRole)) {
        throw new Error('Insufficient permissions');
      }

      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        message: error instanceof Error ? error.message : 'Authorization failed'
      });
    }
  };
};