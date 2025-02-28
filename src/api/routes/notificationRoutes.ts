import express from "express";
import { NotificationController } from "../controllers/notificationController";
import { checkAuthenticated } from "../middlewares/auth";

const router = express.Router();

// Get all notifications with optional status filter
router.get("/", checkAuthenticated, NotificationController.getNotifications);

// Mark a specific notification as read
router.post("/:id/read", checkAuthenticated, NotificationController.markAsRead);

// Mark all notifications as read
router.post("/mark-all-read", checkAuthenticated, NotificationController.markAllAsRead);

export default router; 