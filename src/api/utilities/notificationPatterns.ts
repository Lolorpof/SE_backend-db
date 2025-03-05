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
      title: "ใบสมัครงานใหม่",
      description: `มีการส่งใบสมัครงานใหม่สำหรับตำแหน่ง ${jobTitle} ที่ ${companyName}`,
      userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
      ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
    };
    await NotificationService.createNotification(notification);

    // Create notification for job seeker
    const seekerNotification: TNotificationCreate = {
      title: "ส่งใบสมัครงานแล้ว",
      description: `คุณได้ส่งใบสมัครงานสำหรับตำแหน่ง ${jobTitle} ที่ ${companyName} เรียบร้อยแล้ว`,
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
      title: "อัปเดตสถานะใบสมัครงาน",
      description: `สถานะใบสมัครงานของคุณสำหรับตำแหน่ง ${jobTitle} ที่ ${companyName} ได้รับการ${status}`,
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
      title: "นัดหมายสัมภาษณ์",
      description: `มีการนัดหมายสัมภาษณ์สำหรับตำแหน่ง ${jobTitle} ที่ ${companyName} ในวันที่ ${interviewDate.toLocaleDateString()}`,
      userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
      ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
    };
    await NotificationService.createNotification(notification);

    const employerNotification: TNotificationCreate = {
      title: "ยืนยันการสัมภาษณ์",
      description: `นัดหมายสัมภาษณ์กับผู้สมัครสำหรับตำแหน่ง ${jobTitle} ในวันที่ ${interviewDate.toLocaleDateString()}`,
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
      title: "อัปเดตโปรไฟล์บริษัท",
      description: `โปรไฟล์บริษัทของคุณ ${updateType} ได้รับการอัปเดตเรียบร้อยแล้ว`,
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
    const actionMap = {
      created: "สร้าง",
      updated: "อัปเดต",
      expired: "หมดอายุ",
      deleted: "ลบ"
    };

    const notification: TNotificationCreate = {
      title: "อัปเดตประกาศรับสมัครงาน",
      description: `ประกาศรับสมัครงานตำแหน่ง ${jobTitle} ได้รับการ${actionMap[action]}`,
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
      title: "อัปเดตโปรไฟล์",
      description: `${updateType} ของคุณได้รับการอัปเดตเรียบร้อยแล้ว`,
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

  // Matching Related Notifications
  static async createHiringMatchNotification(
    jobSeekerId: string,
    employerId: string | null,
    oauthEmployerId: string | null,
    companyId: string | null,
    jobTitle: string,
    companyName: string,
    isOAuthJobSeeker = false
  ) {
    // Notify job seeker
    const seekerNotification: TNotificationCreate = {
      title: "ส่งใบสมัครงานแล้ว",
      description: `คุณได้สมัครงานตำแหน่ง ${jobTitle} ที่ ${companyName}`,
      userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
      ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
    };
    await NotificationService.createNotification(seekerNotification);

    // Notify employer/company
    if (employerId) {
      const employerNotification: TNotificationCreate = {
        title: "ใบสมัครงานใหม่",
        description: `มีผู้สมัครใหม่สำหรับตำแหน่ง ${jobTitle}`,
        userType: "EMPLOYER",
        employerId,
      };
      await NotificationService.createNotification(employerNotification);
    } else if (oauthEmployerId) {
      const oauthEmployerNotification: TNotificationCreate = {
        title: "ใบสมัครงานใหม่",
        description: `มีผู้สมัครใหม่สำหรับตำแหน่ง ${jobTitle}`,
        userType: "OAUTHEMPLOYER",
        oauthEmployerId,
      };
      await NotificationService.createNotification(oauthEmployerNotification);
    } else if (companyId) {
      const companyNotification: TNotificationCreate = {
        title: "ใบสมัครงานใหม่",
        description: `มีผู้สมัครใหม่สำหรับตำแหน่ง ${jobTitle}`,
        userType: "COMPANY",
        companyId,
      };
      await NotificationService.createNotification(companyNotification);
    }
  }

  static async createFindingMatchNotification(
    jobSeekerId: string | null,
    oauthJobSeekerId: string | null,
    employerId: string,
    jobTitle: string,
    isOAuthEmployer = false
  ) {
    // Notify employer
    const employerNotification: TNotificationCreate = {
      title: "พบการจับคู่หางาน",
      description: `คุณได้จับคู่กับประกาศหางานตำแหน่ง ${jobTitle}`,
      userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
      ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
    };
    await NotificationService.createNotification(employerNotification);

    // Notify job seeker
    if (jobSeekerId) {
      const seekerNotification: TNotificationCreate = {
        title: "พบการจับคู่ใหม่",
        description: `มีนายจ้างจับคู่กับประกาศหางานของคุณสำหรับตำแหน่ง ${jobTitle}`,
        userType: "JOBSEEKER",
        jobSeekerId,
      };
      await NotificationService.createNotification(seekerNotification);
    } else if (oauthJobSeekerId) {
      const oauthSeekerNotification: TNotificationCreate = {
        title: "พบการจับคู่ใหม่",
        description: `มีนายจ้างจับคู่กับประกาศหางานของคุณสำหรับตำแหน่ง ${jobTitle}`,
        userType: "OAUTHJOBSEEKER",
        oauthJobSeekerId,
      };
      await NotificationService.createNotification(oauthSeekerNotification);
    }
  }

  static async createMatchStatusUpdateNotification(
    userId: string,
    userType: TUserType,
    jobTitle: string,
    status: string,
    companyName?: string
  ) {
    const notification: TNotificationCreate = {
      title: "อัปเดตสถานะการจับคู่",
      description: companyName 
        ? `ใบสมัครงานของคุณสำหรับตำแหน่ง ${jobTitle} ที่ ${companyName} ได้รับการ${status}`
        : `สถานะสำหรับตำแหน่ง ${jobTitle} ได้รับการอัปเดตเป็น ${status}`,
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