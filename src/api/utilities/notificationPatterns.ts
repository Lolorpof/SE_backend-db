import { TNotificationCreate, TUserType } from "../types/notification";
import { NotificationService } from "../services/notificationService";

export class NotificationPatterns {
  // Job Application Related Notifications
  static async createJobApplicationNotification(
    jobSeekerId: string,
    employerId: string,
    companyName: string,
    jobTitle: string,
    isOAuthJobSeeker = false,
    isOAuthEmployer = false
  ) {
    const notification: TNotificationCreate = {
      title: "New Job Application",
      description: `A new application has been submitted for ${jobTitle} at ${companyName}`,
      userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
      ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
    };
    await NotificationService.createNotification(notification);

    // Create notification for job seeker
    const seekerNotification: TNotificationCreate = {
      title: "Application Submitted",
      description: `Your application for ${jobTitle} at ${companyName} has been submitted successfully`,
      userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
      ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
    };
    await NotificationService.createNotification(seekerNotification);
  }

  // Application Status Update Notifications
  static async createApplicationStatusNotification(
    jobSeekerId: string,
    jobTitle: string,
    companyName: string,
    status: string,
    isOAuthJobSeeker = false
  ) {
    const notification: TNotificationCreate = {
      title: "Application Status Update",
      description: `Your application for ${jobTitle} at ${companyName} has been ${status}`,
      userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
      ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
    };
    await NotificationService.createNotification(notification);
  }

  // Interview Related Notifications
  static async createInterviewNotification(
    jobSeekerId: string,
    employerId: string,
    companyName: string,
    jobTitle: string,
    interviewDate: Date,
    isOAuthJobSeeker = false,
    isOAuthEmployer = false
  ) {
    const notification: TNotificationCreate = {
      title: "Interview Scheduled",
      description: `An interview has been scheduled for ${jobTitle} position at ${companyName} on ${interviewDate.toLocaleDateString()}`,
      userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
      ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
    };
    await NotificationService.createNotification(notification);

    const employerNotification: TNotificationCreate = {
      title: "Interview Confirmation",
      description: `Interview scheduled with candidate for ${jobTitle} position on ${interviewDate.toLocaleDateString()}`,
      userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
      ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
    };
    await NotificationService.createNotification(employerNotification);
  }

  // Company Profile Update Notifications
  static async createCompanyUpdateNotification(
    companyId: string,
    employerId: string,
    updateType: string,
    isOAuthEmployer = false
  ) {
    const notification: TNotificationCreate = {
      title: "Company Profile Update",
      description: `Your company profile ${updateType} has been updated successfully`,
      userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
      ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
      companyId,
    };
    await NotificationService.createNotification(notification);
  }

  // Job Posting Related Notifications
  static async createJobPostingNotification(
    employerId: string,
    companyId: string,
    jobTitle: string,
    action: "created" | "updated" | "expired" | "deleted",
    isOAuthEmployer = false
  ) {
    const notification: TNotificationCreate = {
      title: "Job Posting Update",
      description: `Your job posting for ${jobTitle} has been ${action}`,
      userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
      ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
      companyId,
    };
    await NotificationService.createNotification(notification);
  }

  // Profile Update Notifications
  static async createProfileUpdateNotification(
    userId: string,
    userType: TUserType,
    updateType: string
  ) {
    const notification: TNotificationCreate = {
      title: "Profile Update",
      description: `Your ${updateType} has been updated successfully`,
      userType,
      ...(userType === "JOBSEEKER" ? { jobSeekerId: userId } :
          userType === "OAUTHJOBSEEKER" ? { oauthJobSeekerId: userId } :
          userType === "EMPLOYER" ? { employerId: userId } :
          userType === "OAUTHEMPLOYER" ? { oauthEmployerId: userId } :
          { companyId: userId }),
    };
    await NotificationService.createNotification(notification);
  }

  // System Notifications
  static async createSystemNotification(
    userId: string,
    userType: TUserType,
    title: string,
    message: string
  ) {
    const notification: TNotificationCreate = {
      title,
      description: message,
      userType,
      ...(userType === "JOBSEEKER" ? { jobSeekerId: userId } :
          userType === "OAUTHJOBSEEKER" ? { oauthJobSeekerId: userId } :
          userType === "EMPLOYER" ? { employerId: userId } :
          userType === "OAUTHEMPLOYER" ? { oauthEmployerId: userId } :
          { companyId: userId }),
    };
    await NotificationService.createNotification(notification);
  }
} 