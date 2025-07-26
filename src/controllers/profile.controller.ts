// src/controllers/profile.controller.ts
import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import { IProfile } from "../interfaces/profile.interface";

export class ProfileController {
  static async getProfile(req: any, res: Response) {
    try {
      const profile = await ProfileService.getProfile(req.user._id);

      if (!profile) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch profile",
      });
    }
  }

  static async getProfileStatus(req: any, res: Response) {
    try {
      const status = await ProfileService.getProfileStatus(req.user._id);

      if (!status) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch profile status",
      });
    }
  }

  static async updateBasicDetails(req: any, res: Response) {
    try {
      const profile = await ProfileService.updateBasicDetails(
        req.user._id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: profile,
        message: "Basic details updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update basic details",
      });
    }
  }

  static async updateContactDetails(req: any, res: Response) {
    try {
      const { address, emergencyContact } = req.body;
      const profile = await ProfileService.updateContactDetails(req.user._id, {
        address,
        emergencyContact,
      } as any);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
        message: "Contact details updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update contact details",
      });
    }
  }

  static async updateJobDetails(req: any, res: Response) {
    try {
      const {
        jobTitle,
        employmentType,
        startDate,
        workMode,
      } = req.body;
  
      const profile = await ProfileService.updateJobDetails(req.user._id, {
        jobTitle,
        employmentType,
        startDate: startDate ? new Date(startDate) : undefined,
        workMode,
      } as any);
  
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }
  
      res.status(200).json({
        success: true,
        data: profile,
        message: "Job details updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update job details",
      });
    }
  }

  static async updateBankDetails(req: any, res: Response) {
    try {
      const { bankName, accountNumber, accountHolderName, branchCode, taxId } =
        req.body;

      if (!bankName || !accountNumber || !accountHolderName) {
        return res.status(400).json({
          success: false,
          message:
            "Bank name, account number and account holder name are required",
        });
      }

      const profile = await ProfileService.updateBankDetails(req.user._id, {
        bankName,
        accountNumber,
        accountHolderName,
        branchCode,
        taxId,
      } as any);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Mask account number in response
      const responseData = {
        ...profile.toObject(),
        bankDetails: {
          ...profile.bankDetails,
          // accountNumber:
          //   "••••••••" + profile.bankDetails?.accountNumber?.slice(-4),
        },
      };

      res.status(200).json({
        success: true,
        data: responseData,
        message: "Bank details updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update bank details",
      });
    }
  }

  static async uploadDocuments(req: any, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const { idProofType, idProofNumber } = req.body;

      if (!files?.length && !idProofType) {
        return res.status(400).json({
          success: false,
          message: "Either documents or ID proof must be provided",
        });
      }

      const profile = await ProfileService.uploadDocuments(
        req.user._id,
        files,
        idProofType ? { type: idProofType, number: idProofNumber } : undefined
      );

      res.status(200).json({
        success: true,
        data: profile,
        message: "Documents uploaded successfully",
      });
    } catch (error) {
      // Clean up uploaded files if error occurs
      if (req.files) {
        await ProfileService.cleanupFiles(req.files);
      }
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload documents",
      });
    }
  }

  static async getProfileSection(req: any, res: Response) {
    try {
      const { section } = req.params;
      const validSections = [
        "basicDetails",
        "contactDetails",
        "jobDetails",
        "bankDetails",
        "documents",
      ];

      if (!validSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid profile section",
        });
      }

      const result = await ProfileService.getProfileSection(
        req.user._id,
        section as keyof IProfile
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      res.status(200).json({
        success: true,
        data: result.sectionData,
        completionPercentage: result.completionPercentage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch profile section",
      });
    }
  }
}
