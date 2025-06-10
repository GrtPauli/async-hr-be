import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants';
import { IUser } from '../interfaces/user.interface';

export class AuthService {
  static async login(email: string, password: string) {
    // Find user by email and select password
    const user = await User.findOne({ email }).select('+password').populate('role');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    // Remove password before returning
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  static generateToken(user: IUser) {
    return jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      const user = await User.findById(decoded.id).populate('role');
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}