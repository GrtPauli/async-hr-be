import { Document } from "mongoose";
import { Role } from "../models/role.model";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role["_id"];
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserWithToken extends IUser {
  token: string;
}
