// src/services/profile.service.ts
import { Profile } from "../models/profile.model";
import { Types } from "mongoose";
import fs from "fs";
import { IProfile } from "../interfaces/profile.interface";

export class ProfileService {
  static async getProfile(userId: Types.ObjectId) {
    return Profile.findOne({ user: userId }).populate("user", "-password");
  }

  static async getProfileStatus(userId: Types.ObjectId) {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return null;

    return {
      completionPercentage: profile.completionPercentage,
      completedSections: {
        basicDetails: profile.basicDetails.completed,
        contactDetails: profile.contactDetails.completed,
        jobDetails: profile.jobDetails.completed,
        bankDetails: profile.bankDetails.completed,
        documents: profile.documents.completed,
      },
      nextRecommendedSection: this.getNextRecommendedSection(profile),
    };
  }

  private static validateBasicDetails(data: IProfile["basicDetails"]): boolean {
    return !!(
      data.firstName &&
      data.lastName &&
      data.email &&
      data.phoneNumber
    );
  }

  private static validateContactDetails(data: IProfile["contactDetails"]): boolean {
    const { address, emergencyContact } = data;
    return !!(
      address?.street &&
      address?.city &&
      address?.state &&
      address?.postalCode &&
      address?.country &&
      emergencyContact?.name &&
      emergencyContact?.relationship &&
      emergencyContact?.phone
    );
  }

  private static validateJobDetails(data: IProfile["jobDetails"]): boolean {
    return !!(
      data.jobTitle &&
      data.employmentType &&
      data.startDate &&
      data.workMode
    );
  }

  private static validateBankDetails(data: IProfile["bankDetails"]): boolean {
    return !!(
      data.bankName &&
      data.accountNumber &&
      data.accountHolderName
    );
  }

  private static validateDocuments(data: Partial<IProfile["documents"]>): boolean {
    // At least ID proof or resume must be provided
    return !!(
      (data.idProof?.type && data.idProof?.number && data.idProof?.fileUrl) ||
      data.resume
    );
  }

  private static async recalculateCompletionPercentage(userId: Types.ObjectId): Promise<void> {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return;
  
    const sections = ['basicDetails', 'contactDetails', 'jobDetails', 'bankDetails', 'documents'];
    const completedCount = sections.filter(section => (profile as any)[section as keyof IProfile]?.completed).length;
    
    const completionPercentage = Math.round((completedCount / sections.length) * 100);
    const profileCompleted = completionPercentage === 100;
  
    await Profile.updateOne(
      { user: userId },
      { 
        $set: { 
          completionPercentage,
          profileCompleted
        } 
      }
    );
  }
  
  static async updateBasicDetails(
    userId: Types.ObjectId,
    data: IProfile["basicDetails"]
  ) {
    const isCompleted = this.validateBasicDetails(data);
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: { basicDetails: { ...data, completed: isCompleted } } },
      { new: true }
    ).populate("user", "-password");
  
    await this.recalculateCompletionPercentage(userId);
    return updatedProfile;
  }

  static async updateContactDetails(
    userId: Types.ObjectId,
    data: IProfile["contactDetails"]
  ) {
    const isCompleted = this.validateContactDetails(data);
    await this.recalculateCompletionPercentage(userId);
    return Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          contactDetails: {
            ...data,
            completed: isCompleted,
          },
        },
      },
      { new: true }
    ).populate("user", "-password");
  }

  static async updateJobDetails(
    userId: Types.ObjectId,
    data: IProfile["jobDetails"]
  ) {
    const isCompleted = this.validateJobDetails(data);
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          jobDetails: {
            jobTitle: data.jobTitle,
            employmentType: data.employmentType,
            startDate: data.startDate,
            workMode: data.workMode,
            completed: isCompleted
          }
        }
      },
      { new: true }
    ).populate("user", "-password");
  
    await this.recalculateCompletionPercentage(userId);
    return updatedProfile;
  }

  static async updateBankDetails(
    userId: Types.ObjectId,
    data: IProfile["bankDetails"]
  ) {
    const isCompleted = this.validateBankDetails(data);
    await this.recalculateCompletionPercentage(userId);
    return Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          bankDetails: {
            ...data,
            completed: isCompleted,
          },
        },
      },
      { new: true }
    ).populate("user", "-password");
  }

  static async uploadDocuments(
    userId: Types.ObjectId,
    files: Express.Multer.File[],
    idProofData?: { type: string; number: string }
  ) {
    const updates: Partial<IProfile["documents"]> = {};

    if (idProofData) {
      updates.idProof = {
        type: idProofData.type as any,
        number: idProofData.number,
        fileUrl: files?.find((f) => f.fieldname === "idProof")?.path,
      };
    }

    const resumeFile = files?.find((f) => f.fieldname === "resume");
    if (resumeFile) {
      updates.resume = resumeFile.path;
    }

    const certificateFiles = files?.filter(
      (f) => f.fieldname === "certificates"
    );
    if (certificateFiles?.length) {
      updates.certificates = certificateFiles.map((file) => ({
        name: file.originalname,
        fileUrl: file.path,
      }));
    }

    // Only mark as completed if validation passes
    updates.completed = this.validateDocuments(updates);
    await this.recalculateCompletionPercentage(userId);
    return Profile.findOneAndUpdate(
      { user: userId },
      { $set: { documents: updates } },
      { new: true }
    ).populate("user", "-password");
  }

  static async getProfileSection(
    userId: Types.ObjectId,
    section: keyof IProfile
  ) {
    const profile = await Profile.findOne({ user: userId }).select(
      `${section} completionPercentage`
    );

    if (!profile) return null;

    // Mask sensitive bank info
    if (section === "bankDetails" && profile.bankDetails?.accountNumber) {
      profile.bankDetails.accountNumber =
        "••••••••" + profile.bankDetails.accountNumber.slice(-4);
    }

    return {
      sectionData: (profile as any)[section],
      completionPercentage: profile.completionPercentage,
    };
  }

  private static getNextRecommendedSection(profile: IProfile): string {
    if (!profile.basicDetails.completed) return "basicDetails";
    if (!profile.contactDetails.completed) return "contactDetails";
    if (!profile.jobDetails.completed) return "jobDetails";
    if (!profile.bankDetails.completed) return "bankDetails";
    if (!profile.documents.completed) return "documents";
    return "complete";
  }

  static async cleanupFiles(files: Express.Multer.File[]) {
    files.forEach((file) => {
      fs.unlink(file.path, () => {}); // Silent cleanup
    });
  }
}
