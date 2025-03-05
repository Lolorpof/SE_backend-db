"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalUserServices = void 0;
const jobSeekerServices_1 = require("./jobSeekerServices");
const employerServices_1 = require("./employerServices");
const companyServices_1 = require("./companyServices");
const conn_1 = require("../../db/conn");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
class internalUserServices {
    static internalUserService;
    static instance() {
        if (!this.internalUserService) {
            this.internalUserService = new internalUserServices();
        }
        return this.internalUserService;
    }
    async queryUserById(userId, isOauth = false) {
        try {
            let user;
            // Try to find user in appropriate tables based on isOauth flag
            if (isOauth) {
                // Check oauth tables first
                user = await conn_1.drizzlePool.query.oauthJobSeekerTable.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.oauthJobSeekerTable.id, userId)
                });
                if (!user) {
                    user = await conn_1.drizzlePool.query.oauthEmployerTable.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.oauthEmployerTable.id, userId)
                    });
                }
            }
            else {
                // Check normal user tables
                user = await conn_1.drizzlePool.query.jobSeekerTable.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.jobSeekerTable.id, userId)
                });
                if (!user) {
                    user = await conn_1.drizzlePool.query.employerTable.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.employerTable.id, userId)
                    });
                }
                if (!user) {
                    user = await conn_1.drizzlePool.query.companyTable.findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.companyTable.id, userId)
                    });
                }
            }
            if (!user) {
                return null;
            }
            // Convert Date objects to strings
            if (user.createdAt)
                user.createdAt = user.createdAt.toISOString();
            if (user.updatedAt)
                user.updatedAt = user.updatedAt.toISOString();
            return user;
        }
        catch (error) {
            console.error('Error in queryUserById:', error);
            throw error;
        }
    }
    async getUserData(userId, isOauth = false, provider) {
        try {
            // Try to get user from each service
            const jobSeekerResult = await jobSeekerServices_1.jobSeekerServices.instance().deserializer(userId, provider);
            if (jobSeekerResult.success && jobSeekerResult.data) {
                return {
                    success: true,
                    status: 200,
                    msg: "Successfully retrieved user data",
                    data: this.mapJobSeekerToUnifiedData(jobSeekerResult.data)
                };
            }
            const employerResult = await employerServices_1.employerServices.instance().deserializer(userId, provider);
            if (employerResult.success && employerResult.data) {
                return {
                    success: true,
                    status: 200,
                    msg: "Successfully retrieved user data",
                    data: this.mapEmployerToUnifiedData(employerResult.data)
                };
            }
            const companyResult = await companyServices_1.companyServices.instance().deserializer(userId);
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
        }
        catch (error) {
            console.error('Error in getUserData:', error);
            return {
                success: false,
                status: 500,
                msg: "Internal server error"
            };
        }
    }
    async getUserSession(userId, isOauth = false, provider) {
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
            let userType;
            if (userData.data.userType === "JOBSEEKER") {
                userType = isOauth ? 'OAUTH_JOBSEEKER' : 'JOBSEEKER';
            }
            else if (userData.data.userType === "EMPLOYER") {
                userType = isOauth ? 'OAUTH_EMPLOYER' : 'EMPLOYER';
            }
            else {
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
        }
        catch (error) {
            console.error('Error in getUserSession:', error);
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
    mapEmployerToUnifiedData(employer) {
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
    mapCompanyToUnifiedData(company) {
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
exports.internalUserServices = internalUserServices;
