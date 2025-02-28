import { normalUserTypeEnum, notificationStatusEnum } from "../../db/schema";

export type TNotificationStatus = typeof notificationStatusEnum.enumValues[number];
export type TUserType = typeof normalUserTypeEnum.enumValues[number];

export type TNotification = {
  id: string;
  status: TNotificationStatus;
  title: string;
  description: string;
  userType: TUserType;
  jobSeekerId?: string;
  oauthJobSeekerId?: string;
  employerId?: string;
  oauthEmployerId?: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TNotificationQuery = {
  status?: TNotificationStatus | "all";
};

export type TNotificationCreate = {
  title: string;
  description: string;
  userType: TUserType;
  jobSeekerId?: string;
  oauthJobSeekerId?: string;
  employerId?: string;
  oauthEmployerId?: string;
  companyId?: string;
}; 