// src/routes/attendance.routes.ts
import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/clock-in", AttendanceController.clockIn);
router.post("/clock-out", AttendanceController.clockOut);
router.get("/stats", AttendanceController.getStats);
router.get("/history", AttendanceController.getAttendanceHistory);
router.get("/today", AttendanceController.getTodayStatus); // Add this new route

export default router;