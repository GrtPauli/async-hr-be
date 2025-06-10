import { Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
  description?: string;
  isDefault: boolean;
}