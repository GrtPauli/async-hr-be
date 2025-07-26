// src/models/attendance.model.ts
import { Schema, model, Document } from "mongoose";
import { IUser } from "../interfaces/user.interface";

export interface IAttendance extends Document {
  user: IUser["_id"];
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  status: "present" | "absent" | "half-day" | "leave";
  totalHours?: number;
  notes?: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, index: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "half-day", "leave"],
      default: "present",
    },
    totalHours: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

// Calculate total hours before saving
attendanceSchema.pre<IAttendance>("save", function (next) {
  if (this.clockOut) {
    const diffMs = this.clockOut.getTime() - this.clockIn.getTime();
    this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    // Auto-set status based on hours
    if (this.totalHours < 4) {
      this.status = "half-day";
    }
  }
  next();
});

// Index for faster queries
attendanceSchema.index({ user: 1, date: 1 });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
