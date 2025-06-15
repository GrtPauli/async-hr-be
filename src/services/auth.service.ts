// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants';
import { IUser, UserType } from '../interfaces/user.interface';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);

    // Remove password before returning
    const userObj: any = user.toObject();
    delete userObj?.password;

    return { user: userObj, token };
  }

  static generateToken(user: IUser) {
    return jwt.sign(
      { id: user._id, userType: user.userType } as any, 
      JWT_SECRET as any,
      { expiresIn: JWT_EXPIRES_IN } as any
    );
  }

  static async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: string; 
        userType: UserType 
      };
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}