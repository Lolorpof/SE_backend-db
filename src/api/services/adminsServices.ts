import { nanoid } from "nanoid";
import { randomNumberRange } from "../utilities/utilFunctions";
import { adminModels } from "../models/adminsModels";
import { adminServiceInterfaces } from "../interfaces/userServiceInterfaces";
import bcrypt from "bcrypt";
import { IVerifyOptions } from "passport-local";

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
  ): Promise<SerivcesResponse<adminSessionType>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    let userObj: adminSessionType;
    try {
      userObj = user as adminSessionType;
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
      data: userObj as adminSessionType,
    };
  }

  // for logout
  async checkCurrent(
    user: Express.User | undefined,
    type: string
  ): Promise<SerivcesResponse<any>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    let userObj: adminSessionType;
    try {
      userObj = user as adminSessionType;
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

  // approve 'user'
  async approve(user: any): Promise<SerivcesResponse<any>> {
    // validation
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
    let users: matchNameEmailType[];

    // get users with same name or email
    try {
      users = await adminModels.instance().matchNameEmail(username);
    } catch (error) {
      console.log(error);
      return done(error, false, { message: "Something went wrong" });
    }

    if (users.length === 0) {
      return done(null, false, { message: "User doesn't existed" });
    }

    let exactUser: matchNameEmailType | undefined;
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
    const formattedUser: userSessionType = { id: exactUser.id, type: "ADMIN" };

    done(null, formattedUser, { message: "Successfully login" });
  }

  // create new admin
  async create(): Promise<SerivcesResponse<any>> {
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
    let result: adminType;
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

  async deserializer(id: string): Promise<SerivcesResponse<any>> {
    let user: adminType | undefined;
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
