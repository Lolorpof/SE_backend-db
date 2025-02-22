import "dotenv/config";
import { nanoid } from "nanoid";
import { catchError, randomNumberRange } from "../utilities/utilFunctions";
import { adminModels } from "../models/adminsModels";
import { adminServiceInterfaces } from "../interfaces/userServiceInterfaces";
import bcrypt from "bcryptjs";
import { IVerifyOptions } from "passport-local";
import {
  approvedRequestSchema,
  TApprovedRequest,
} from "../validators/usersValidator";
import { registrationApprovalModels } from "../models/registrationApprovalModels";
import { jobSeekerModels } from "../models/jobSeekerModels";
import { employerModels } from "../models/employerModels";
import { companyModels } from "../models/companyModels";
import { ServicesResponse } from "../types/responseTypes";

export class adminServices implements adminServiceInterfaces {
  static adminService: adminServices | undefined;
  static instance() {
    if (!this.adminService) {
      this.adminService = new adminServices();
    }
    return this.adminService;
  }

  // logged in admin
  async getCurrent(
    user: Express.User | undefined
  ): Promise<ServicesResponse<TAdminSession>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    let userObj: TAdminSession;
    try {
      userObj = user as TAdminSession;
      if (userObj.type !== "ADMIN") {
        throw Error();
      }
    } catch (error) {
      return { success: false, status: 401, msg: "User isn't logged in" };
    }

    return {
      success: true,
      status: 200,
      msg: "Successfully retrieve user",
      data: userObj as TAdminSession,
    };
  }

  // for logout
  async checkCurrent(
    user: Express.User | undefined,
    type: string
  ): Promise<ServicesResponse<any>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    let userObj: TAdminSession;
    try {
      userObj = user as TAdminSession;
    } catch (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    if (userObj.type !== type) {
      return { success: false, status: 401, msg: "User isn't logged in" };
    }

    return {
      success: true,
      status: 200,
      msg: "Sucessfully retrieve checked user",
      data: { id: userObj.id, username: userObj.username },
    };
  }

  // approve or unapprove 'user'
  async approvingUser(
    approvalRequest: any,
    adminId: string
  ): Promise<ServicesResponse<TApproveResponse>> {
    // validation
    try {
      approvedRequestSchema.parse(approvalRequest);
    } catch (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Invalid data" };
    }

    const validatedApprovalRequest = approvalRequest as TApprovedRequest;

    // updating registration approval
    const [error, result] = await catchError<TApproveReturn>(
      registrationApprovalModels
        .instance()
        .approveUser(validatedApprovalRequest, adminId)
    );

    if (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    const approvingUser: TApprovingUser = {
      id: result.userId,
      status: validatedApprovalRequest.status,
    };

    // updating user status to approved or unapproved(delete)
    let err2: any, res2: TApproveUser | undefined;
    if (result.userType === "JOBSEEKER") {
      const [error2, result2] = await catchError<TApproveUser>(
        jobSeekerModels.instance().approved(approvingUser, result.isOauth)
      );
      err2 = error2;
      res2 = result2;
    } else if (result.userType === "EMPLOYER") {
      const [error2, result2] = await catchError<TApproveUser>(
        employerModels.instance().approved(approvingUser, result.isOauth)
      );
      err2 = error2;
      res2 = result2;
    } else {
      const [error2, result2] = await catchError<TApproveUser>(
        companyModels.instance().approved(approvingUser)
      );
      err2 = error2;
      res2 = result2;
    }

    if (err2 || !res2) {
      console.log(err2);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    const data: TApproveResponse = { approvedId: res2.id, adminId: adminId };

    return {
      success: true,
      status: 200,
      msg: "Successfully approved user",
      data: data,
    };
  }

  async getAllApproveRequest(): Promise<
    ServicesResponse<TRegistrationApproval[]>
  > {
    const [error, users] = await catchError<TRegistrationApproval[]>(
      registrationApprovalModels.instance().getAllApproveRequest()
    );

    if (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    return {
      success: true,
      status: 200,
      msg: "Successfully retrieve all approve request",
      data: users,
    };
  }

  async login(
    username: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ): Promise<void> {
    // get users with same name or email
    const [error, users] = await catchError<TMatchNameEmail[]>(
      adminModels.instance().matchNameEmail(username)
    );
    if (error) {
      console.log(error);
      return done(error, false, { message: "Something went wrong" });
    }

    if (users.length === 0) {
      return done(null, false, { message: "User doesn't existed" });
    }

    let exactUser: TMatchNameEmail | undefined;
    let approvedExisted = false;
    try {
      for (const user of users) {
        if (user.approvalStatus === "APPROVED") {
          approvedExisted = true;
        }
        const matched = await bcrypt.compare(password, user.password);

        if (matched) {
          exactUser = user;
          break;
        }
      }
    } catch (error) {
      console.log(error);
      return done(error, false, { message: "Something went wrong" });
    }

    // no match
    if (!exactUser) {
      if (approvedExisted) {
        return done(null, false, { message: "Wrong password" });
      } else {
        return done(null, false, {
          message: "User doesn't existed",
        });
      }
    }

    // not approved
    if (exactUser.approvalStatus === "UNAPPROVED") {
      return done(null, false, { message: "User isn't approved yet" });
    }

    // format user
    const formattedUser: TUserSession = { id: exactUser.id, type: "ADMIN" };

    done(null, formattedUser, { message: "Successfully login" });
  }

  // create new admin
  async create(): Promise<ServicesResponse<any>> {
    const username = nanoid(randomNumberRange(8, 16));
    const password = nanoid(randomNumberRange(10, 16));

    // hash password
    let hashedPassword: string | undefined;
    try {
      hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALTROUNDS as string)
      );
    } catch (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    // insert into database
    let result: TAdmin;
    try {
      result = await adminModels.instance().create(username, hashedPassword);
    } catch (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    return {
      success: true,
      status: 201,
      msg: "Successfully created admin",
      data: { id: result.id, username: username, password: password },
    };
  }

  async deserializer(id: string): Promise<ServicesResponse<any>> {
    let user: TAdmin | undefined;
    // getting user
    try {
      user = await adminModels.instance().getById(id);
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }

    if (!user) {
      return { success: false, msg: "Something went wrong", status: 403 };
    }

    return {
      success: true,
      msg: "Retrieve user successfully",
      data: user,
      status: 200,
    };
  }
}
