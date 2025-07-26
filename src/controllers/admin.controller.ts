// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Attendance } from "../models/attendance.model";
import { Profile } from "../models/profile.model";
import { Types } from "mongoose";
import { subDays, startOfDay, endOfDay } from "date-fns";

export class AdminController {
  static async getAllEmployees(req: Request, res: Response) {
    try {
      // Get all employees with their profile completion status
      const employees = await User.aggregate([
        {
          $match: { userType: "employee" }
        },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "user",
            as: "profile"
          }
        },
        {
          $unwind: {
            path: "$profile",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            userType: 1,
            isActive: 1,
            lastLogin: 1,
            createdAt: 1,
            updatedAt: 1,
            profileStatus: {
              $cond: {
                if: { $ifNull: ["$profile", false] },
                then: {
                  completed: "$profile.profileCompleted",
                  completionPercentage: "$profile.completionPercentage"
                },
                else: {
                  completed: false,
                  completionPercentage: 0
                }
              }
            }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);
  
      res.status(200).json({
        success: true,
        data: employees,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch employees",
      });
    }
  }

  static async getEmployeeDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employee = await User.findById(id).select("-password").lean();

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const profile = await Profile.findOne({ user: id }).lean();
      const attendanceRecords = await Attendance.find({ user: id })
        .sort({ date: -1 })
        .limit(10)
        .lean();

      res.status(200).json({
        success: true,
        data: {
          ...employee,
          profile,
          recentAttendance: attendanceRecords,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch employee details",
      });
    }
  }

  static async getEmployeeAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const query: any = { user: id };
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }

      const attendance = await Attendance.find(query).sort({ date: -1 }).lean();

      res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch attendance records",
      });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const today = startOfDay(new Date());
      const weekStart = subDays(today, 7);
      const monthStart = subDays(today, 30);

      // Total employees
      const totalEmployees = await User.countDocuments({
        userType: "employee",
      });

      // Employees with completed profiles
      const employeesWithCompletedProfiles = await Profile.countDocuments({
        profileCompleted: true,
      });

      // Today's stats
      const todayStats = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: today },
            clockOut: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$totalHours" },
            count: { $sum: 1 },
          },
        },
      ]);

      // This week's stats
      const weekStats = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: weekStart },
            clockOut: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$totalHours" },
            count: { $sum: 1 },
          },
        },
      ]);

      // This month's stats
      const monthStats = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: monthStart },
            clockOut: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$totalHours" },
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalEmployees,
          employeesWithCompletedProfiles,
          todayHours: todayStats[0]?.totalHours || 0,
          weekHours: weekStats[0]?.totalHours || 0,
          monthHours: monthStats[0]?.totalHours || 0,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
      });
    }
  }

  static async getTopPerformers(req: Request, res: Response) {
    try {
      const { period } = req.query;
      let dateFilter = {};
  
      const now = new Date();
      switch (period) {
        case "day":
          dateFilter = { $gte: startOfDay(now) };
          break;
        case "week":
          dateFilter = { $gte: subDays(startOfDay(now), 7) };
          break;
        case "month":
          dateFilter = { $gte: subDays(startOfDay(now), 30) };
          break;
        // No date filter for "all"
      }
  
      const matchStage: any = { clockOut: { $exists: true } };
      if (period !== "all") {
        matchStage.date = dateFilter;
      }
  
      const topPerformers = await Attendance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              user: "$user",
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
            },
            totalHours: { $sum: "$totalHours" }
          }
        },
        {
          $group: {
            _id: "$_id.user",
            totalHours: { $sum: "$totalHours" },
            daysWorked: { $sum: 1 } // Now counts unique days
          }
        },
        { $sort: { totalHours: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: "$user._id",
            name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
            totalHours: 1,
            daysWorked: 1
          }
        }
      ]);
  
      res.status(200).json({
        success: true,
        data: topPerformers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch top performers",
      });
    }
  }

  static async getTodayAttendance(req: Request, res: Response) {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
  
      // Get all employees with their today's attendance
      const employeesWithAttendance = await User.aggregate([
        {
          $match: { userType: "employee" }
        },
        {
          $lookup: {
            from: "attendances",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user", "$$userId"] },
                      { $gte: ["$date", todayStart] },
                      { $lte: ["$date", todayEnd] }
                    ]
                  }
                }
              },
              {
                $sort: { clockIn: -1 } // Still sort to get most recent record first
              }
            ],
            as: "todayAttendance"
          }
        },
        {
          $unwind: {
            path: "$todayAttendance",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$_id",
            firstName: { $first: "$firstName" },
            lastName: { $first: "$lastName" },
            email: { $first: "$email" },
            isActive: { $first: "$isActive" },
            totalHours: { $sum: "$todayAttendance.totalHours" },
            lastClockedIn: { $first: "$todayAttendance.clockIn" },
            lastClockedOut: { $first: "$todayAttendance.clockOut" },
            status: { $first: "$todayAttendance.status" },
            allAttendance: { $push: "$todayAttendance" }
          }
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            isActive: 1,
            totalHours: {
              $cond: {
                if: { $eq: ["$totalHours", null] },
                then: null,
                else: "$totalHours"
              }
            },
            status: 1,
            lastClockedIn: 1,
            lastClockedOut: 1
          }
        },
        {
          $sort: { firstName: 1 }
        }
      ]);
  
      res.status(200).json({
        success: true,
        data: employeesWithAttendance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch today's attendance",
      });
    }
  }
}
