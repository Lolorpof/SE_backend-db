import { TApprovedRequest } from "../validators/usersValidator";
import { registrationApprovalTable } from "../../db/schema";
import { drizzlePool } from "../../db/conn";
import { and, eq } from "drizzle-orm";
import { catchError } from "../utilities/utilFunctions";
import e from "express";

export class registrationApprovalModels {
  static registrationApprovalModel: registrationApprovalModels | undefined;
  static instance() {
    if (!this.registrationApprovalModel) {
      this.registrationApprovalModel = new registrationApprovalModels();
    }
    return this.registrationApprovalModel;
  }

  // for admin to approve user
  async approveUser(
    approvedRequest: TApprovedRequest,
    adminId: string
  ): Promise<TApproveReturn> {
    // update user status to approved
    const checkExisted =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { id: true },
        where: eq(registrationApprovalTable.id, approvedRequest.id),
      });

    if (!checkExisted) {
      throw new Error("User not found");
    }

    const status =
      approvedRequest.status === "APPROVED" ? "ACCEPTED" : "DENIED";

    await drizzlePool
      .update(registrationApprovalTable)
      .set({ status: status, adminId: adminId, approvedAt: new Date() })
      .where(eq(registrationApprovalTable.id, approvedRequest.id))
      .returning({ id: registrationApprovalTable.id });

    const updatedUser =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: eq(registrationApprovalTable.id, approvedRequest.id),
      });
    if (!updatedUser) {
      throw new Error("User not found");
    }

    let finalUser: TApproveReturn;
    if (updatedUser.jobSeekerId) {
      finalUser = {
        userId: updatedUser.jobSeekerId,
        userType: "JOBSEEKER",
        isOauth: false,
      };
    } else if (updatedUser.oauthJobSeekerId) {
      finalUser = {
        userId: updatedUser.oauthJobSeekerId,
        userType: "JOBSEEKER",
        isOauth: true,
      };
    } else if (updatedUser.employerId) {
      finalUser = {
        userId: updatedUser.employerId,
        userType: "EMPLOYER",
        isOauth: false,
      };
    } else if (updatedUser.oauthEmployerId) {
      finalUser = {
        userId: updatedUser.oauthEmployerId,
        userType: "EMPLOYER",
        isOauth: true,
      };
    } else {
      finalUser = {
        userId: updatedUser.companyId as string,
        userType: "COMPANY",
        isOauth: false,
      };
    }

    return finalUser;
  }

  async getAllApproveRequest(): Promise<TRegistrationApproval[]> {
    const response = await drizzlePool.query.registrationApprovalTable.findMany(
      { columns: { createdAt: false, updatedAt: false } }
    );

    if (response.length === 0) {
      return [];
    }

    const formattedResponse: TRegistrationApproval[] = [];
    for (const r of response) {
      if (r.oauthJobSeekerId) {
        formattedResponse.push({
          id: r.id,
          userId: r.oauthJobSeekerId,
          userType: r.userType,
          status: r.status,
          adminId: r.adminId,
        });
      } else if (r.jobSeekerId) {
        formattedResponse.push({
          id: r.id,
          userId: r.jobSeekerId,
          userType: r.userType,
          status: r.status,
          adminId: r.adminId,
        });
      } else if (r.oauthEmployerId) {
        formattedResponse.push({
          id: r.id,
          userId: r.oauthEmployerId,
          userType: r.userType,
          status: r.status,
          adminId: r.adminId,
        });
      } else if (r.employerId) {
        formattedResponse.push({
          id: r.id,
          userId: r.employerId,
          userType: r.userType,
          status: r.status,
          adminId: r.adminId,
        });
      } else if (r.companyId) {
        formattedResponse.push({
          id: r.id,
          userId: r.companyId,
          userType: r.userType,
          status: r.status,
          adminId: r.adminId,
        });
      }
    }

    return formattedResponse;
  }

  // for admin to reject user
  async rejectUser(user: TApprovedRequest, adminId: string) {}

  async getById(id: string) {
    const response =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: eq(registrationApprovalTable.id, id),
      });

    return response;
  }
}
