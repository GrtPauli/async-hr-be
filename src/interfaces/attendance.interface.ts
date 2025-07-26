// src/interfaces/attendance.interface.ts
import { Document } from "mongoose";
import { IUser } from "./user.interface";

export interface IAttendance extends Document {
  user: IUser["_id"];
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  status: "present" | "absent" | "half-day" | "leave";
  totalHours?: number;
  notes?: string;
}

export interface AttendanceStats {
  averageClockIn: string;
  averageClockOut: string;
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
}

export interface TodayStatus {
  clockIn?: Date;
  clockOut?: Date;
  status?: 'present' | 'absent' | 'half-day' | 'leave';
}
