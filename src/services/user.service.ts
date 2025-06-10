import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import { RoleService } from './role.service';

export class UserService {
  static async createUser(userData: Partial<IUser>) {
    // If role is not provided, assign default role
    if (!userData.role) {
      const defaultRole = await RoleService.getDefaultRole();
      if (!defaultRole) {
        throw new Error('Default role not found');
      }
      userData.role = defaultRole._id;
    }

    const user = new User(userData);
    return await user.save();
  }

  static async getUserById(id: string) {
    return await User.findById(id).populate('role');
  }

  static async getUserByEmail(email: string) {
    return await User.findOne({ email }).populate('role');
  }

  static async getAllUsers() {
    return await User.find().populate('role');
  }

  static async updateUser(id: string, updateData: Partial<IUser>) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).populate('role');
  }

  static async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  static async changeUserPassword(id: string, newPassword: string) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.password = newPassword;
    return await user.save();
  }
}