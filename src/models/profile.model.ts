// src/models/profile.model.ts
import { Schema, model, Document } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

export interface IProfile extends Document {
  user: IUser['_id'];
  basicDetails: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    bio?: string;
    completed: boolean;
  };
  contactDetails: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
    completed: boolean;
  };
  jobDetails: {
    jobTitle?: string;
    employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
    startDate?: Date;
    workMode?: 'Onsite' | 'Remote' | 'Hybrid';
    completed: boolean;
  };
  bankDetails: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    branchCode?: string;
    taxId?: string;
    completed: boolean;
  };
  documents: {
    idProof?: {
      type?: 'Passport' | 'Driver License' | 'National ID';
      number?: string;
      fileUrl?: string;
    };
    resume?: string;
    certificates?: Array<{
      name?: string;
      fileUrl?: string;
    }>;
    completed: boolean;
  };
  completionPercentage: number;
  profileCompleted: boolean;
}

const profileSchema = new Schema<IProfile>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  basicDetails: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    bio: { type: String },
    completed: { type: Boolean, default: false }
  },
  contactDetails: {
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String }
    },
    completed: { type: Boolean, default: false }
  },
  jobDetails: {
    jobTitle: { type: String },
    employmentType: { 
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern']
    },
    startDate: { type: Date },
    workMode: {
      type: String,
      enum: ['Onsite', 'Remote', 'Hybrid']
    },
    completed: { type: Boolean, default: false }
  },
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    branchCode: { type: String },
    taxId: { type: String },
    completed: { type: Boolean, default: false }
  },
  documents: {
    idProof: {
      type: { type: String, enum: ['Passport', 'Driver License', 'National ID'] },
      number: { type: String },
      fileUrl: { type: String }
    },
    resume: { type: String },
    certificates: [{
      name: { type: String },
      fileUrl: { type: String }
    }],
    completed: { type: Boolean, default: false }
  },
  completionPercentage: { type: Number, default: 0 },
  profileCompleted: { type: Boolean, default: false }
}, { timestamps: true });

// Calculate completion before saving
profileSchema.pre<IProfile>('save', function(next) {
  const sections = ['basicDetails', 'contactDetails', 'jobDetails', 'bankDetails', 'documents'];
  const completedCount = sections.filter((section: any) => (this as any)[section]?.completed).length;
  this.completionPercentage = Math.round((completedCount / sections.length) * 100);
  this.profileCompleted = this.completionPercentage === 100;
  next();
});

export const Profile = model<IProfile>('Profile', profileSchema);