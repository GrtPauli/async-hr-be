// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth.middleware";

const router = Router();

// All routes require admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Employee management
router.get("/employees", AdminController.getAllEmployees);
router.get("/employees/:id", AdminController.getEmployeeDetails as any);
router.get("/employees/:id/attendance", AdminController.getEmployeeAttendance);
router.get('/attendance/today', authMiddleware, adminMiddleware, AdminController.getTodayAttendance);

// Dashboard
router.get("/dashboard/stats", AdminController.getDashboardStats);
router.get("/dashboard/top-performers", AdminController.getTopPerformers);

export default router;
