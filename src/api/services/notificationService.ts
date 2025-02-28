import { eq, desc, and, asc } from "drizzle-orm";
import { drizzlePool as db } from "../../db/conn";
import { notificationTable } from "../../db/schema";
import { TNotificationCreate, TNotificationQuery, TUserType } from "../types/notification";

export class NotificationService {
  static async createNotification(data: TNotificationCreate) {
    try {
      const [notification] = await db
        .insert(notificationTable)
        .values(data)
        .returning();
      return notification;
    } catch (error) {
      throw new Error("Failed to create notification");
    }
  }

  static async getNotifications(userId: string, userType: TUserType, query?: TNotificationQuery) {
    try {
      let userField: string;
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

      const conditions = [eq(notificationTable[userField], userId)];
      if (query?.status && query.status !== "all") {
        conditions.push(eq(notificationTable.status, query.status));
      }

      const notifications = await db
        .select()
        .from(notificationTable)
        .where(and(...conditions))
        .orderBy(
          desc(notificationTable.status),
          desc(notificationTable.createdAt)
        );

      return notifications;
    } catch (error) {
      throw new Error("Failed to retrieve notifications");
    }
  }

  static async markAsRead(notificationId: string, userId: string, userType: TUserType) {
    try {
      let userField: string;
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

      const [notification] = await db
        .update(notificationTable)
        .set({ status: "READ" })
        .where(and(
          eq(notificationTable.id, notificationId),
          eq(notificationTable[userField], userId)
        ))
        .returning();

      return notification;
    } catch (error) {
      throw new Error("Failed to mark notification as read");
    }
  }

  static async markAllAsRead(userId: string, userType: TUserType) {
    try {
      let userField: string;
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

      const notifications = await db
        .update(notificationTable)
        .set({ status: "READ" })
        .where(and(
          eq(notificationTable[userField], userId),
          eq(notificationTable.status, "UNREAD")
        ))
        .returning();

      return notifications;
    } catch (error) {
      throw new Error("Failed to mark all notifications as read");
    }
  }
} 