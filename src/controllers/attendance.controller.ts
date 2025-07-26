// src/controllers/attendance.controller.ts
import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";
import { Types } from "mongoose";
import { Attendance } from "../models/attendance.model";

export class AttendanceController {
  static async clockIn(req: any, res: Response) {
    try {
      const attendance = await AttendanceService.clockIn(req.user._id);
      res.status(201).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to clock in",
      });
    }
  }

  static async clockOut(req: any, res: Response) {
    try {
      const attendance = await AttendanceService.clockOut(req.user._id);
      res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to clock out",
      });
    }
  }

  static async getStats(req: any, res: Response) {
    try {
      const stats = await AttendanceService.getAttendanceStats(req.user._id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get attendance stats",
      });
    }
  }

  static async getAttendanceHistory(req: any, res: Response) {
    try {
      const { startDate, endDate, employeeId } = req.query;
      
      // Determine which user ID to use
      let userId;
      if (employeeId && req.user.userType === 'admin') {
        // If employeeId is provided and requester is admin, use that
        userId = employeeId;
      } else {
        // Otherwise use the authenticated user's ID
        userId = req.user._id;
      }
  
      const query: any = { user: userId };
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
  
      const history = await Attendance.find(query).sort({
        date: -1,
        clockIn: -1,
      });
  
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get attendance history",
      });
    }
  }

  static async getTodayStatus(req: any, res: Response) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const attendanceRecords = await Attendance.find({
        user: req.user._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
        }
      }).sort({ clockIn: -1 }); // Sort by most recent first
  
      res.status(200).json({
        success: true,
        data: attendanceRecords
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get today's status"
      });
    }
  }
}
