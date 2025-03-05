"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationApprovalModels = void 0;
const schema_1 = require("../../db/schema");
const conn_1 = require("../../db/conn");
const drizzle_orm_1 = require("drizzle-orm");
class registrationApprovalModels {
    static registrationApprovalModel;
    static instance() {
        if (!this.registrationApprovalModel) {
            this.registrationApprovalModel = new registrationApprovalModels();
        }
        return this.registrationApprovalModel;
    }
    // for admin to approve user
    async approveUser(approvedRequest, adminId) {
        // update user status to approved
        const checkExisted = await conn_1.drizzlePool.query.registrationApprovalTable.findFirst({
            columns: { id: true },
            where: (0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, approvedRequest.id),
        });
        if (!checkExisted) {
            throw new Error("User not found");
        }
        const status = approvedRequest.status === "APPROVED" ? "ACCEPTED" : "DENIED";
        await conn_1.drizzlePool
            .update(schema_1.registrationApprovalTable)
            .set({ status: status, adminId: adminId, approvedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, approvedRequest.id))
            .returning({ id: schema_1.registrationApprovalTable.id });
        const updatedUser = await conn_1.drizzlePool.query.registrationApprovalTable.findFirst({
            columns: { createdAt: false, updatedAt: false },
            where: (0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, approvedRequest.id),
        });
        if (!updatedUser) {
            throw new Error("User not found");
        }
        let finalUser;
        if (updatedUser.jobSeekerId) {
            finalUser = {
                userId: updatedUser.jobSeekerId,
                userType: "JOBSEEKER",
                isOauth: false,
            };
        }
        else if (updatedUser.oauthJobSeekerId) {
            finalUser = {
                userId: updatedUser.oauthJobSeekerId,
                userType: "JOBSEEKER",
                isOauth: true,
            };
        }
        else if (updatedUser.employerId) {
            finalUser = {
                userId: updatedUser.employerId,
                userType: "EMPLOYER",
                isOauth: false,
            };
        }
        else if (updatedUser.oauthEmployerId) {
            finalUser = {
                userId: updatedUser.oauthEmployerId,
                userType: "EMPLOYER",
                isOauth: true,
            };
        }
        else {
            finalUser = {
                userId: updatedUser.companyId,
                userType: "COMPANY",
                isOauth: false,
            };
        }
        return finalUser;
    }
    async getAllApproveRequest() {
        const response = await conn_1.drizzlePool.query.registrationApprovalTable.findMany({ columns: { createdAt: false, updatedAt: false } });
        if (response.length === 0) {
            return [];
        }
        const formattedResponse = [];
        for (const r of response) {
            if (r.oauthJobSeekerId) {
                formattedResponse.push({
                    id: r.id,
                    userId: r.oauthJobSeekerId,
                    userType: r.userType,
                    status: r.status,
                    adminId: r.adminId,
                    imageUrl: r.imageUrl,
                });
            }
            else if (r.jobSeekerId) {
                formattedResponse.push({
                    id: r.id,
                    userId: r.jobSeekerId,
                    userType: r.userType,
                    status: r.status,
                    adminId: r.adminId,
                    imageUrl: r.imageUrl,
                });
            }
            else if (r.oauthEmployerId) {
                formattedResponse.push({
                    id: r.id,
                    userId: r.oauthEmployerId,
                    userType: r.userType,
                    status: r.status,
                    adminId: r.adminId,
                    imageUrl: r.imageUrl,
                });
            }
            else if (r.employerId) {
                formattedResponse.push({
                    id: r.id,
                    userId: r.employerId,
                    userType: r.userType,
                    status: r.status,
                    adminId: r.adminId,
                    imageUrl: r.imageUrl,
                });
            }
            else if (r.companyId) {
                formattedResponse.push({
                    id: r.id,
                    userId: r.companyId,
                    userType: r.userType,
                    status: r.status,
                    adminId: r.adminId,
                    imageUrl: r.imageUrl,
                });
            }
        }
        return formattedResponse;
    }
    // for admin to reject user
    async rejectUser(user, adminId) { }
    async getById(id) {
        const response = await conn_1.drizzlePool.query.registrationApprovalTable.findFirst({
            columns: { createdAt: false, updatedAt: false },
            where: (0, drizzle_orm_1.eq)(schema_1.registrationApprovalTable.id, id),
        });
        return response;
    }
}
exports.registrationApprovalModels = registrationApprovalModels;
