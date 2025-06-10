import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users'
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
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

  static async updateUser(req: Request, res: Response) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
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
        message: error instanceof Error ? error.message : 'Failed to update user'
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user = await UserService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user'
      });
    }
  }
}