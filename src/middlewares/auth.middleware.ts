// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { IUser, UserType } from '../interfaces/user.interface';

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Authentication required');
    }

    const user = await AuthService.validateToken(token);
    req.user = user as IUser;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};

// Simplified role middleware (now userType check)
export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    if (req.user.userType !== UserType.ADMIN) {
      throw new Error('Admin access required');
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error instanceof Error ? error.message : 'Authorization failed'
    });
  }
};