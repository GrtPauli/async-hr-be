// src/interfaces/user.interface.ts
import { Document } from "mongoose";

export enum UserType {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: UserType; // Simple enum instead of Role reference
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}