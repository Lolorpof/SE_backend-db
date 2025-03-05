"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const jobSeekerServices_1 = require("./jobSeekerServices");
const employerServices_1 = require("./employerServices");
const companyServices_1 = require("./companyServices");
class userServices {
    static userService;
    static instance() {
        if (!this.userService) {
            this.userService = new userServices();
        }
        return this.userService;
    }
    async getCurrentUser(user) {
        if (!user) {
            return {
                success: false,
                status: 401,
                msg: "User isn't logged in"
            };
        }
        try {
            const userSession = user;
            let userData;
            let role;
            let isOauth = !!userSession.isOauth;
            // Determine user type and fetch data accordingly
            switch (userSession.type.toUpperCase()) {
                case 'JOBSEEKER':
                    role = 'jobseeker';
                    const jobSeekerResult = await jobSeekerServices_1.jobSeekerServices.instance().deserializer(userSession.id, userSession.provider);
                    if (jobSeekerResult.success && jobSeekerResult.data) {
                        userData = this.mapJobSeekerToUnifiedData(jobSeekerResult.data);
                    }
                    break;
                case 'EMPLOYER':
                    role = 'employer';
                    const employerResult = await employerServices_1.employerServices.instance().deserializer(userSession.id, userSession.provider);
                    if (employerResult.success && employerResult.data) {
                        userData = this.mapEmployerToUnifiedData(employerResult.data);
                    }
                    break;
                case 'COMPANY':
                    role = 'company';
                    const companyResult = await companyServices_1.companyServices.instance().deserializer(userSession.id);
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
        }
        catch (error) {
            console.error('Error in getCurrentUser:', error);
            return {
                success: false,
                status: 500,
                msg: "Internal server error"
            };
        }
    }
    mapJobSeekerToUnifiedData(jobSeeker) {
        return {
            id: jobSeeker.id,
            userType: "JOBSEEKER",
            username: jobSeeker.username,
            email: jobSeeker.email,
            firstName: jobSeeker.firstName,
            lastName: jobSeeker.lastName,
            about: jobSeeker.about,
            address: jobSeeker.address,
            contact: jobSeeker.contact,
            profileImageUrl: jobSeeker.profileImageUrl,
            approvalStatus: jobSeeker.approvalStatus,
            createdAt: jobSeeker.createdAt,
            updatedAt: jobSeeker.updatedAt
        };
    }
    mapEmployerToUnifiedData(employer) {
        return {
            id: employer.id,
            userType: "EMPLOYER",
            username: employer.username,
            email: employer.email,
            firstName: employer.firstName,
            lastName: employer.lastName,
            about: employer.about,
            address: employer.address,
            contact: employer.contact,
            profileImageUrl: employer.profileImageUrl,
            approvalStatus: employer.approvalStatus,
            createdAt: employer.createdAt,
            updatedAt: employer.updatedAt
        };
    }
    mapCompanyToUnifiedData(company) {
        return {
            id: company.id,
            userType: "COMPANY",
            email: company.email,
            officialName: company.officialName,
            about: company.about,
            address: company.address,
            contact: company.contact,
            profileImageUrl: company.profileImageUrl,
            approvalStatus: company.approvalStatus,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        };
    }
}
exports.userServices = userServices;
