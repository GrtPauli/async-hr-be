// src/interfaces/profile.interface.ts
import { Document } from "mongoose";
import { IUser } from "./user.interface";

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IEmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface IIdProof {
  type?: "Passport" | "Driver License" | "National ID";
  number?: string;
  fileUrl?: string;
}

export interface ICertificate {
  name?: string;
  fileUrl?: string;
}

export interface IBasicDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  completed: boolean;
}

export interface IContactDetails {
  address?: IAddress;
  emergencyContact?: IEmergencyContact;
  completed: boolean;
}

export interface IJobDetails {
  jobTitle?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  startDate?: Date;
  workMode?: 'Onsite' | 'Remote' | 'Hybrid';
  completed: boolean;
}

export interface IBankDetails {
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  branchCode?: string;
  taxId?: string;
  completed: boolean;
}

export interface IDocuments {
  idProof?: IIdProof;
  resume?: string;
  certificates?: ICertificate[];
  completed: boolean;
}

export interface IProfile extends Document {
  user: IUser["_id"];
  basicDetails: IBasicDetails;
  contactDetails: IContactDetails;
  jobDetails: IJobDetails;
  bankDetails: IBankDetails;
  documents: IDocuments;
  completionPercentage: number;
  profileCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
