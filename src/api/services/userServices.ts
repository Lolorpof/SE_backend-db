import { ServicesResponse } from "../types/responseTypes";
import { CurrentUserResponse, UnifiedUserData } from "../types/usersTypes";
import { jobSeekerServices } from "./jobSeekerServices";
import { employerServices } from "./employerServices";
import { companyServices } from "./companyServices";

type OAuthProvider = "GOOGLE" | "LINE";

export class userServices {
  private static userService: userServices | undefined;

  static instance() {
    if (!this.userService) {
      this.userService = new userServices();
    }
    return this.userService;
  }

  async getCurrentUser(user: Express.User | undefined): Promise<ServicesResponse<CurrentUserResponse["data"]>> {
    if (!user) {
      return {
        success: false,
        status: 401,
        msg: "User isn't logged in"
      };
    }

    try {
      const userSession = user as { id: string; type: string; isOauth?: boolean; provider?: OAuthProvider };
      let userData: UnifiedUserData | undefined;
      let role: 'company' | 'employer' | 'jobseeker';
      let isOauth = !!userSession.isOauth;

      // Determine user type and fetch data accordingly
      switch (userSession.type.toUpperCase()) {
        case 'JOBSEEKER':
          role = 'jobseeker';
          const jobSeekerResult = await jobSeekerServices.instance().deserializer(userSession.id, userSession.provider);
          if (jobSeekerResult.success && jobSeekerResult.data) {
            userData = this.mapJobSeekerToUnifiedData(jobSeekerResult.data);
          }
          break;

        case 'EMPLOYER':
          role = 'employer';
          const employerResult = await employerServices.instance().deserializer(userSession.id, userSession.provider);
          if (employerResult.success && employerResult.data) {
            userData = this.mapEmployerToUnifiedData(employerResult.data);
          }
          break;

        case 'COMPANY':
          role = 'company';
          const companyResult = await companyServices.instance().deserializer(userSession.id);
          if (companyResult.success && companyResult.data) {
            userData = this.mapCompanyToUnifiedData(companyResult.data);
          }
          break;

        default:
          return {
            success: false,
            status: 403,
            msg: "Invalid user type"
          };
      }

      if (!userData) {
        return {
          success: false,
          status: 403,
          msg: "Failed to retrieve user data"
        };
      }

      return {
        success: true,
        status: 200,
        msg: "Successfully retrieved user data",
        data: {
          role,
          type: isOauth ? 'oauth' : 'normal',
          isOauth,
          userData
        }
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return {
        success: false,
        status: 500,
        msg: "Internal server error"
      };
    }
  }

  private mapJobSeekerToUnifiedData(jobSeeker: any): UnifiedUserData {
    return {
      id: jobSeeker.id,
      username: jobSeeker.username,
      email: jobSeeker.email,
      firstName: jobSeeker.firstName,
      lastName: jobSeeker.lastName,
      about: jobSeeker.about,
      address: jobSeeker.address,
      provinceAddress: jobSeeker.provinceAddress,
      contact: jobSeeker.contact,
      profileImageUrl: jobSeeker.profileImageUrl,
      approvalStatus: jobSeeker.approvalStatus,
      createdAt: jobSeeker.createdAt,
      updatedAt: jobSeeker.updatedAt
    };
  }

  private mapEmployerToUnifiedData(employer: any): UnifiedUserData {
    return {
      id: employer.id,
      username: employer.username,
      email: employer.email,
      firstName: employer.firstName,
      lastName: employer.lastName,
      about: employer.about,
      address: employer.address,
      provinceAddress: employer.provinceAddress,
      contact: employer.contact,
      profileImageUrl: employer.profileImageUrl,
      approvalStatus: employer.approvalStatus,
      createdAt: employer.createdAt,
      updatedAt: employer.updatedAt
    };
  }

  private mapCompanyToUnifiedData(company: any): UnifiedUserData {
    return {
      id: company.id,
      email: company.email,
      officialName: company.officialName,
      about: company.about,
      address: company.address,
      provinceAddress: company.provinceAddress,
      contact: company.contact,
      profileImageUrl: company.profileImageUrl,
      approvalStatus: company.approvalStatus,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }
} 