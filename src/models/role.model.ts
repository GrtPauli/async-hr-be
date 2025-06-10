import { model, Schema, Document } from 'mongoose';
import { IRole } from '../interfaces/role.interface';

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: { type: [String], required: true },
  description: { type: String },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Role = model<IRole>('Role', roleSchema);