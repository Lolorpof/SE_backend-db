"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationController {
    static async getNotifications(req, res) {
        try {
            const user = req.user;
            const status = req.query.status;
            const notifications = await notificationService_1.NotificationService.getNotifications(user.id, user.type, { status });
            res.status(200).json({
                success: true,
                data: notifications,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve notifications",
            });
        }
    }
    static async markAsRead(req, res) {
        try {
            const user = req.user;
            const { id } = req.params;
            const notification = await notificationService_1.NotificationService.markAsRead(id, user.id, user.type);
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Failed to mark notification as read",
            });
        }
    }
    static async markAllAsRead(req, res) {
        try {
            const user = req.user;
            const notifications = await notificationService_1.NotificationService.markAllAsRead(user.id, user.type);
            res.status(200).json({
                success: true,
                data: notifications,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Failed to mark all notifications as read",
            });
        }
    }
}
exports.NotificationController = NotificationController;
