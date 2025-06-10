import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { IUser } from '../interfaces/user.interface';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      
      res.status(200).json({
        success: true,
        data: { user, token }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const userData: Partial<IUser> = req.body;
      const user = await UserService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      // req.user is set by the auth middleware
      const user = await UserService.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user'
      });
    }
  }
}