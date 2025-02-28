import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";
import { TUserSession } from "../types/auth";
import { TNotificationStatus } from "../types/notification";

export class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TUserSession;
      const status = req.query.status as TNotificationStatus | "all" | undefined;

      const notifications = await NotificationService.getNotifications(
        user.id,
        user.type,
        { status }
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
      });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TUserSession;
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(
        id,
        user.id,
        user.type
      );

      if (!notification) {
        res.status(404).json({
          success: false,
          message: "Notification not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TUserSession;

      const notifications = await NotificationService.markAllAsRead(
        user.id,
        user.type
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  }
} 