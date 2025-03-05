"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// Get all notifications with optional status filter
router.get("/", auth_1.checkAuthenticated, notificationController_1.NotificationController.getNotifications);
// Mark a specific notification as read
router.post("/:id/read", auth_1.checkAuthenticated, notificationController_1.NotificationController.markAsRead);
// Mark all notifications as read
router.post("/mark-all-read", auth_1.checkAuthenticated, notificationController_1.NotificationController.markAllAsRead);
exports.default = router;
