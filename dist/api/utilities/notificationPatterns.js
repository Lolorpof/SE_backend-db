"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPatterns = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationPatterns {
    // Job Application Related Notifications
    static async createJobApplicationNotification(jobSeekerId, employerId, companyName, jobTitle, isOAuthJobSeeker = false, isOAuthEmployer = false) {
        const notification = {
            title: "New Job Application",
            description: `A new application has been submitted for ${jobTitle} at ${companyName}`,
            userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
            ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
        };
        await notificationService_1.NotificationService.createNotification(notification);
        // Create notification for job seeker
        const seekerNotification = {
            title: "Application Submitted",
            description: `Your application for ${jobTitle} at ${companyName} has been submitted successfully`,
            userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
            ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
        };
        await notificationService_1.NotificationService.createNotification(seekerNotification);
    }
    // Application Status Update Notifications
    static async createApplicationStatusNotification(jobSeekerId, jobTitle, companyName, status, isOAuthJobSeeker = false) {
        const notification = {
            title: "Application Status Update",
            description: `Your application for ${jobTitle} at ${companyName} has been ${status}`,
            userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
            ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
        };
        await notificationService_1.NotificationService.createNotification(notification);
    }
    // Interview Related Notifications
    static async createInterviewNotification(jobSeekerId, employerId, companyName, jobTitle, interviewDate, isOAuthJobSeeker = false, isOAuthEmployer = false) {
        const notification = {
            title: "Interview Scheduled",
            description: `An interview has been scheduled for ${jobTitle} position at ${companyName} on ${interviewDate.toLocaleDateString()}`,
            userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
            ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
        };
        await notificationService_1.NotificationService.createNotification(notification);
        const employerNotification = {
            title: "Interview Confirmation",
            description: `Interview scheduled with candidate for ${jobTitle} position on ${interviewDate.toLocaleDateString()}`,
            userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
            ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
        };
        await notificationService_1.NotificationService.createNotification(employerNotification);
    }
    // Company Profile Update Notifications
    static async createCompanyUpdateNotification(companyId, employerId, updateType, isOAuthEmployer = false) {
        const notification = {
            title: "Company Profile Update",
            description: `Your company profile ${updateType} has been updated successfully`,
            userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
            ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
            companyId,
        };
        await notificationService_1.NotificationService.createNotification(notification);
    }
    // Job Posting Related Notifications
    static async createJobPostingNotification(employerId, companyId, jobTitle, action, isOAuthEmployer = false) {
        const notification = {
            title: "Job Posting Update",
            description: `Your job posting for ${jobTitle} has been ${action}`,
            userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
            ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
            companyId,
        };
        await notificationService_1.NotificationService.createNotification(notification);
    }
    // Profile Update Notifications
    static async createProfileUpdateNotification(userId, userType, updateType) {
        const notification = {
            title: "Profile Update",
            description: `Your ${updateType} has been updated successfully`,
            userType,
            ...(userType === "JOBSEEKER" ? { jobSeekerId: userId } :
                userType === "OAUTHJOBSEEKER" ? { oauthJobSeekerId: userId } :
                    userType === "EMPLOYER" ? { employerId: userId } :
                        userType === "OAUTHEMPLOYER" ? { oauthEmployerId: userId } :
                            { companyId: userId }),
        };
        await notificationService_1.NotificationService.createNotification(notification);
    }
    // System Notifications
    static async createSystemNotification(userId, userType, title, message) {
        const notification = {
            title,
            description: message,
            userType,
            ...(userType === "JOBSEEKER" ? { jobSeekerId: userId } :
                userType === "OAUTHJOBSEEKER" ? { oauthJobSeekerId: userId } :
                    userType === "EMPLOYER" ? { employerId: userId } :
                        userType === "OAUTHEMPLOYER" ? { oauthEmployerId: userId } :
                            { companyId: userId }),
        };
        await notificationService_1.NotificationService.createNotification(notification);
    }
    // Matching Related Notifications
    static async createHiringMatchNotification(jobSeekerId, employerId, oauthEmployerId, companyId, jobTitle, companyName, isOAuthJobSeeker = false) {
        // Notify job seeker
        const seekerNotification = {
            title: "Job Application Submitted",
            description: `You have applied for the position: ${jobTitle} at ${companyName}`,
            userType: isOAuthJobSeeker ? "OAUTHJOBSEEKER" : "JOBSEEKER",
            ...(isOAuthJobSeeker ? { oauthJobSeekerId: jobSeekerId } : { jobSeekerId }),
        };
        await notificationService_1.NotificationService.createNotification(seekerNotification);
        // Notify employer/company
        if (employerId) {
            const employerNotification = {
                title: "New Job Application",
                description: `A new candidate has applied for the position: ${jobTitle}`,
                userType: "EMPLOYER",
                employerId,
            };
            await notificationService_1.NotificationService.createNotification(employerNotification);
        }
        else if (oauthEmployerId) {
            const oauthEmployerNotification = {
                title: "New Job Application",
                description: `A new candidate has applied for the position: ${jobTitle}`,
                userType: "OAUTHEMPLOYER",
                oauthEmployerId,
            };
            await notificationService_1.NotificationService.createNotification(oauthEmployerNotification);
        }
        else if (companyId) {
            const companyNotification = {
                title: "New Job Application",
                description: `A new candidate has applied for the position: ${jobTitle}`,
                userType: "COMPANY",
                companyId,
            };
            await notificationService_1.NotificationService.createNotification(companyNotification);
        }
    }
    static async createFindingMatchNotification(jobSeekerId, oauthJobSeekerId, employerId, jobTitle, isOAuthEmployer = false) {
        // Notify employer
        const employerNotification = {
            title: "Job Finding Match",
            description: `You have matched with a job finding post for position: ${jobTitle}`,
            userType: isOAuthEmployer ? "OAUTHEMPLOYER" : "EMPLOYER",
            ...(isOAuthEmployer ? { oauthEmployerId: employerId } : { employerId }),
        };
        await notificationService_1.NotificationService.createNotification(employerNotification);
        // Notify job seeker
        if (jobSeekerId) {
            const seekerNotification = {
                title: "New Match Found",
                description: `An employer has matched with your job finding post for: ${jobTitle}`,
                userType: "JOBSEEKER",
                jobSeekerId,
            };
            await notificationService_1.NotificationService.createNotification(seekerNotification);
        }
        else if (oauthJobSeekerId) {
            const oauthSeekerNotification = {
                title: "New Match Found",
                description: `An employer has matched with your job finding post for: ${jobTitle}`,
                userType: "OAUTHJOBSEEKER",
                oauthJobSeekerId,
            };
            await notificationService_1.NotificationService.createNotification(oauthSeekerNotification);
        }
    }
    static async createMatchStatusUpdateNotification(userId, userType, jobTitle, status, companyName) {
        const notification = {
            title: "Match Status Update",
            description: companyName
                ? `Your application for ${jobTitle} at ${companyName} has been ${status}`
                : `The status for ${jobTitle} has been updated to ${status}`,
            userType,
            ...(userType === "JOBSEEKER" ? { jobSeekerId: userId } :
                userType === "OAUTHJOBSEEKER" ? { oauthJobSeekerId: userId } :
                    userType === "EMPLOYER" ? { employerId: userId } :
                        userType === "OAUTHEMPLOYER" ? { oauthEmployerId: userId } :
                            { companyId: userId }),
        };
        await notificationService_1.NotificationService.createNotification(notification);
    }
}
exports.NotificationPatterns = NotificationPatterns;
