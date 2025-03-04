import { ServicesResponse } from "../types/responseTypes";
import { 
  TJobSeeker, 
  TEmployer, 
  TCompany,
  TUserSession,
  UnifiedUserData
} from "../types/usersTypes";
import { jobSeekerServices } from "./jobSeekerServices";
import { employerServices } from "./employerServices";
import { companyServices } from "./companyServices";
import { drizzlePool } from "../../db/conn";
import { and, eq } from "drizzle-orm";
import { 
  jobSeekerTable, 
  oauthJobSeekerTable, 
  employerTable, 
  oauthEmployerTable, 
  companyTable 
} from "../../db/schema";

export class internalUserServices {
  private static internalUserService: internalUserServices | undefined;

  static instance() {
    if (!this.internalUserService) {
      this.internalUserService = new internalUserServices();
    }
    return this.internalUserService;
  }

  async queryUserById(userId: string, isOauth: boolean = false): Promise<TJobSeeker | TEmployer | TCompany | null> {
    try {
      let user: any;

      // Try to find user in appropriate tables based on isOauth flag
      if (isOauth) {
        // Check oauth tables first
        user = await drizzlePool.query.oauthJobSeekerTable.findFirst({
          where: eq(oauthJobSeekerTable.id, userId)
        });
        
        if (!user) {
          user = await drizzlePool.query.oauthEmployerTable.findFirst({
            where: eq(oauthEmployerTable.id, userId)
          });
        }
      } else {
        // Check normal user tables
        user = await drizzlePool.query.jobSeekerTable.findFirst({
          where: eq(jobSeekerTable.id, userId)
        });
        
        if (!user) {
          user = await drizzlePool.query.employerTable.findFirst({
            where: eq(employerTable.id, userId)
          });
        }
        
        if (!user) {
          user = await drizzlePool.query.companyTable.findFirst({
            where: eq(companyTable.id, userId)
          });
        }
      }

      if (!user) {
        return null;
      }

      // Convert Date objects to strings
      if (user.createdAt) user.createdAt = user.createdAt.toISOString();
      if (user.updatedAt) user.updatedAt = user.updatedAt.toISOString();

      return user;
    } catch (error) {
      console.error('Error in queryUserById:', error);
      throw error;
    }
  }

  async getUserData(userId: string, isOauth: boolean = false, provider?: "GOOGLE" | "LINE"): Promise<ServicesResponse<UnifiedUserData>> {
    try {
      // Try to get user from each service
      const jobSeekerResult = await jobSeekerServices.instance().deserializer(userId, provider);
      if (jobSeekerResult.success && jobSeekerResult.data) {
        return {
          success: true,
          status: 200,
          msg: "Successfully retrieved user data",
          data: this.mapJobSeekerToUnifiedData(jobSeekerResult.data)
        };
      }

      const employerResult = await employerServices.instance().deserializer(userId, provider);
      if (employerResult.success && employerResult.data) {
        return {
          success: true,
          status: 200,
          msg: "Successfully retrieved user data",
          data: this.mapEmployerToUnifiedData(employerResult.data)
        };
      }

      const companyResult = await companyServices.instance().deserializer(userId);
      if (companyResult.success && companyResult.data) {
        return {
          success: true,
          status: 200,
          msg: "Successfully retrieved user data",
          data: this.mapCompanyToUnifiedData(companyResult.data)
        };
      }

      return {
        success: false,
        status: 404,
        msg: "User not found"
      };
    } catch (error) {
      console.error('Error in getUserData:', error);
      return {
        success: false,
        status: 500,
        msg: "Internal server error"
      };
    }
  }

  async getUserSession(userId: string, isOauth: boolean = false, provider?: "GOOGLE" | "LINE"): Promise<ServicesResponse<TUserSession>> {
    try {
      const userData = await this.getUserData(userId, isOauth, provider);
      
      if (!userData.success || !userData.data) {
        return {
          success: false,
          status: 404,
          msg: "User not found"
        };
      }
      console.log("userData", userData);

      // Determine user type based on the userType field
      let userType: string;
      if (userData.data.userType === "JOBSEEKER") {
        userType = isOauth ? 'OAUTH_JOBSEEKER' : 'JOBSEEKER';
      } else if (userData.data.userType === "EMPLOYER") {
        userType = isOauth ? 'OAUTH_EMPLOYER' : 'EMPLOYER';
      } else {
        userType = 'COMPANY';
      }
      
      console.log("userType", userType);
      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved user session",
        data: {
          id: userId,
          type: userType,
          provider: provider
        }
      };
    } catch (error) {
      console.error('Error in getUserSession:', error);
      return {
        success: false,
        status: 500,
        msg: "Internal server error"
      };
    }
  }

  private mapJobSeekerToUnifiedData(jobSeeker: TJobSeeker): UnifiedUserData {
    return {
      id: jobSeeker.id,
      userType: "JOBSEEKER",
      username: jobSeeker.username,
      email: jobSeeker.email,
      firstName: jobSeeker.firstName || undefined,
      lastName: jobSeeker.lastName || undefined,
      about: jobSeeker.aboutMe || undefined,
      address: jobSeeker.address || undefined,
      contact: jobSeeker.contact || undefined,
      profileImageUrl: jobSeeker.profilePicture || undefined,
      approvalStatus: jobSeeker.approvalStatus,
      createdAt: jobSeeker.createdAt ? new Date(jobSeeker.createdAt) : undefined,
      updatedAt: jobSeeker.updatedAt ? new Date(jobSeeker.updatedAt) : undefined
    };
  }

  private mapEmployerToUnifiedData(employer: TEmployer): UnifiedUserData {
    return {
      id: employer.id,
      userType: "EMPLOYER",
      username: employer.username,
      email: employer.email,
      firstName: employer.firstName || undefined,
      lastName: employer.lastName || undefined,
      about: employer.aboutMe || undefined,
      address: employer.address || undefined,
      contact: employer.contact || undefined,
      profileImageUrl: employer.profilePicture || undefined,
      approvalStatus: employer.approvalStatus,
      createdAt: employer.createdAt ? new Date(employer.createdAt) : undefined,
      updatedAt: employer.updatedAt ? new Date(employer.updatedAt) : undefined
    };
  }

  private mapCompanyToUnifiedData(company: TCompany): UnifiedUserData {
    return {
      id: company.id,
      userType: "COMPANY",
      email: company.email,
      officialName: company.officialName,
      about: company.aboutMe || undefined,
      address: company.address || undefined,
      contact: company.contact || undefined,
      profileImageUrl: company.profilePicture || undefined,
      approvalStatus: company.approvalStatus,
      createdAt: company.createdAt ? new Date(company.createdAt) : undefined,
      updatedAt: company.updatedAt ? new Date(company.updatedAt) : undefined
    };
  }
} 