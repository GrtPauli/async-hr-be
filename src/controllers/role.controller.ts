import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
  static async createRole(req: Request, res: Response) {
    try {
      const role = await RoleService.createRole(req.body);
      res.status(201).json({
        success: true,
        data: role
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create role'
      });
    }
  }

  static async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await RoleService.getAllRoles();
      res.status(200).json({
        success: true,
        data: roles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch roles'
      });
    }
  }

  static async getRoleById(req: Request, res: Response) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      res.status(200).json({
        success: true,
        data: role
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch role'
      });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const role = await RoleService.updateRole(req.params.id, req.body);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      res.status(200).json({
        success: true,
        data: role
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update role'
      });
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      const role = await RoleService.deleteRole(req.params.id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete role'
      });
    }
  }
}