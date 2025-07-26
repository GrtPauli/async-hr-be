// src/services/attendance.service.ts
import { Attendance } from "../models/attendance.model";
import { Types } from "mongoose";
import {
  IAttendance,
  AttendanceStats,
} from "../interfaces/attendance.interface";
import { subDays, startOfDay, endOfDay, isSameDay } from "date-fns";

export class AttendanceService {
  static async clockIn(userId: Types.ObjectId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      user: userId,
      date: today,
      clockOut: { $exists: false },
    });

    if (existing) {
      throw new Error("You have already clocked in today");
    }

    return Attendance.create({
      user: userId,
      date: today,
      clockIn: new Date(),
      status: "present",
    });
  }

  static async clockOut(userId: Types.ObjectId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
      clockOut: { $exists: false },
    });

    if (!attendance) {
      throw new Error("You need to clock in first");
    }

    attendance.clockOut = new Date();
    return attendance.save();
  }

  static async getAttendanceStats(userId: Types.ObjectId): Promise<AttendanceStats> {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Get all records for the period grouped by day
    const dailySummaries = await Attendance.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          date: { $first: "$date" },
          totalHours: { $sum: "$totalHours" },
          records: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          date: 1,
          totalHours: 1,
          status: {
            $cond: [
              { $gte: ["$totalHours", 6] }, // Threshold for full day
              "present",
              { $cond: [
                { $gt: ["$totalHours", 0] }, // At least some hours
                "half-day",
                "absent"
              ]}
            ]
          }
        }
      }
    ]);

    // Calculate stats from daily summaries
    const presentDays = dailySummaries.filter(d => d.status === "present").length;
    const halfDays = dailySummaries.filter(d => d.status === "half-day").length;
    const absentDays = dailySummaries.filter(d => d.status === "absent").length;

    // Calculate time-based stats (using original records)
    const allRecords = await Attendance.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    });

    const averageClockIn = this.calculateAverageTime(
      allRecords.filter(a => a.clockIn).map(a => a.clockIn)
    );
    const averageClockOut = this.calculateAverageTime(
      allRecords.filter(a => a.clockOut).map(a => a.clockOut) as any
    );

    // Calculate period totals
    const dailyHours = dailySummaries
      .find(d => isSameDay(d.date, now))?.totalHours || 0;
    
    const weeklyHours = dailySummaries
      .filter(d => d.date >= subDays(now, 7))
      .reduce((sum, d) => sum + d.totalHours, 0);
    
    const monthlyHours = dailySummaries
      .reduce((sum, d) => sum + d.totalHours, 0);

    return {
      averageClockIn,
      averageClockOut,
      dailyHours,
      weeklyHours,
      monthlyHours,
      presentDays,
      absentDays,
      halfDays
    };
  }

  static async getTodayStatus(userId: Types.ObjectId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Attendance.find({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).sort({ clockIn: -1 });
  }

  private static async getDailyHours(userId: Types.ObjectId): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      user: userId,
      date: today,
      clockOut: { $exists: true },
    });

    return records.reduce((sum, record) => sum + (record.totalHours || 0), 0);
  }

  private static async getWeeklyHours(userId: Types.ObjectId): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const records = await Attendance.find({
      user: userId,
      date: { $gte: oneWeekAgo },
      clockOut: { $exists: true },
    });

    return records.reduce((sum, record) => sum + (record.totalHours || 0), 0);
  }

  private static async getMonthlyHours(
    userId: Types.ObjectId
  ): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const records = await Attendance.find({
      user: userId,
      date: { $gte: oneMonthAgo },
      clockOut: { $exists: true },
    });

    return records.reduce((sum, record) => sum + (record.totalHours || 0), 0);
  }

  private static calculateAverageTime(times: Date[]): string {
    if (times.length === 0) return "N/A";

    const totalMs = times.reduce((sum, time) => {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      return sum + (hours * 60 + minutes) * 60 * 1000;
    }, 0);

    const avgMs = totalMs / times.length;
    const avgDate = new Date(avgMs);

    return avgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
