import { User } from '../models/user.model';
import { IUser, UserType } from '../interfaces/user.interface';

export class UserService {
  static async createUser(userData: Partial<IUser>) {
    // Set default userType if not provided
    if (!userData.userType) {
      userData.userType = UserType.EMPLOYEE;
    }

    const user = new User(userData);
    return await user.save();
  }

  static async getUserById(id: string) {
    return await User.findById(id);
  }

  static async getUserByEmail(email: string) {
    return await User.findOne({ email });
  }
  
  static async getAllUsers() {
    return await User.find();
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