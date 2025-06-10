import { Role } from '../models/role.model';
import { IRole } from '../interfaces/role.interface';

export class RoleService {
  static async createRole(roleData: Partial<IRole>) {
    const role = new Role(roleData);
    return await role.save();
  }

  static async getRoleById(id: string) {
    return await Role.findById(id);
  }

  static async getRoleByName(name: string) {
    return await Role.findOne({ name });
  }

  static async getAllRoles() {
    return await Role.find();
  }

  static async updateRole(id: string, updateData: Partial<IRole>) {
    return await Role.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async deleteRole(id: string) {
    return await Role.findByIdAndDelete(id);
  }

  static async getDefaultRole() {
    return await Role.findOne({ isDefault: true });
  }
}