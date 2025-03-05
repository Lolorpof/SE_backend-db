"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const conn_1 = require("../../db/conn");
const schema_1 = require("../../db/schema");
class NotificationService {
    static async createNotification(data) {
        try {
            const [notification] = await conn_1.drizzlePool
                .insert(schema_1.notificationTable)
                .values(data)
                .returning();
            return notification;
        }
        catch (error) {
            throw new Error("Failed to create notification");
        }
    }
    static async getNotifications(userId, userType, query) {
        try {
            let userField;
            switch (userType) {
                case "JOBSEEKER":
                    userField = "jobSeekerId";
                    break;
                case "OAUTHJOBSEEKER":
                    userField = "oauthJobSeekerId";
                    break;
                case "EMPLOYER":
                    userField = "employerId";
                    break;
                case "OAUTHEMPLOYER":
                    userField = "oauthEmployerId";
                    break;
                case "COMPANY":
                    userField = "companyId";
                    break;
                default:
                    throw new Error("Invalid user type");
            }
            const conditions = [(0, drizzle_orm_1.eq)(schema_1.notificationTable[userField], userId)];
            if (query?.status && query.status !== "all") {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.notificationTable.status, query.status));
            }
            const notifications = await conn_1.drizzlePool
                .select()
                .from(schema_1.notificationTable)
                .where((0, drizzle_orm_1.and)(...conditions))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.notificationTable.status), (0, drizzle_orm_1.desc)(schema_1.notificationTable.createdAt));
            return notifications;
        }
        catch (error) {
            throw new Error("Failed to retrieve notifications");
        }
    }
    static async markAsRead(notificationId, userId, userType) {
        try {
            let userField;
            switch (userType) {
                case "JOBSEEKER":
                    userField = "jobSeekerId";
                    break;
                case "OAUTHJOBSEEKER":
                    userField = "oauthJobSeekerId";
                    break;
                case "EMPLOYER":
                    userField = "employerId";
                    break;
                case "OAUTHEMPLOYER":
                    userField = "oauthEmployerId";
                    break;
                case "COMPANY":
                    userField = "companyId";
                    break;
                default:
                    throw new Error("Invalid user type");
            }
            const [notification] = await conn_1.drizzlePool
                .update(schema_1.notificationTable)
                .set({ status: "READ" })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notificationTable.id, notificationId), (0, drizzle_orm_1.eq)(schema_1.notificationTable[userField], userId)))
                .returning();
            return notification;
        }
        catch (error) {
            throw new Error("Failed to mark notification as read");
        }
    }
    static async markAllAsRead(userId, userType) {
        try {
            let userField;
            switch (userType) {
                case "JOBSEEKER":
                    userField = "jobSeekerId";
                    break;
                case "OAUTHJOBSEEKER":
                    userField = "oauthJobSeekerId";
                    break;
                case "EMPLOYER":
                    userField = "employerId";
                    break;
                case "OAUTHEMPLOYER":
                    userField = "oauthEmployerId";
                    break;
                case "COMPANY":
                    userField = "companyId";
                    break;
                default:
                    throw new Error("Invalid user type");
            }
            const notifications = await conn_1.drizzlePool
                .update(schema_1.notificationTable)
                .set({ status: "READ" })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notificationTable[userField], userId), (0, drizzle_orm_1.eq)(schema_1.notificationTable.status, "UNREAD")))
                .returning();
            return notifications;
        }
        catch (error) {
            throw new Error("Failed to mark all notifications as read");
        }
    }
}
exports.NotificationService = NotificationService;
