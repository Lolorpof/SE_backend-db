import "dotenv/config";
import { jobSeekerModels } from "../models/jobSeekerModels";
import * as usersSchemas from "../validators/usersValidator";
import { fromError } from "zod-validation-error";
import "../types/usersTypes";
import bcrypt from "bcrypt";
import bcryptjs from "bcryptjs";
import { IVerifyOptions } from "passport-local";
import "../types/usersTypes";
import "../interfaces/userServiceInterfaces";
import {
  userOauthServiceInterfaces,
  userServiceInterfaces,
} from "../interfaces/userServiceInterfaces";
import { Profile, VerifyCallback } from "passport-google-oauth20";

export class jobSeekerServices implements userOauthServiceInterfaces {
  // singleton design
  private static jobSeekerService: jobSeekerServices | undefined;
  static instance() {
    if (!this.jobSeekerService) {
      this.jobSeekerService = new jobSeekerServices();
    }
    return this.jobSeekerService;
  }

  // register
  async register(userForm: any): Promise<SerivcesResponse<any>> {
    // {Business Logic}
    // user form validation
    try {
      usersSchemas.singleUserRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError, status: 403 };
    }

    const validatedUserForm: usersSchemas.TSingleUserRegister = userForm;
    // split to first name and last name
    const [firstName, lastName] = validatedUserForm.name.split(" ");

    // Duplicated name or email check
    let duplicatedNameUser;
    try {
      duplicatedNameUser = await jobSeekerModels
        .instance()
        .duplicateNameEmail(firstName, lastName, validatedUserForm.email);
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }
    // there's duped user of some kind
    if (duplicatedNameUser) {
      // duped name
      if (
        firstName === (duplicatedNameUser.firstName as string) &&
        lastName === (duplicatedNameUser.lastName as string) &&
        validatedUserForm.email !== (duplicatedNameUser.email as string)
      ) {
        return {
          success: false,
          msg: "Name was already used",
          status: 400,
        };
      }
      // duped email
      else if (
        validatedUserForm.email === (duplicatedNameUser.email as string)
      ) {
        return {
          success: false,
          msg: "Email was already used",
          status: 400,
        };
      }
    }

    // password  & confirmPassword should be the same
    if (validatedUserForm.password !== validatedUserForm.confirmPassword) {
      return {
        success: false,
        msg: "Password does not match",
        status: 400,
      };
    }

    // {Done with Business Logic}
    // hash password
    let hashedPassword: string | undefined;
    try {
      hashedPassword =
        (process.env.BCRYPT_LIBRARY as string) === "bcryptjs"
          ? await bcryptjs.hash(
              validatedUserForm.password,
              Number(process.env.BCRYPT_SALTROUNDS)
            )
          : await bcrypt.hash(
              validatedUserForm.password,
              Number(process.env.BCRYPT_SALTROUNDS)
            );
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }

    // format user
    const { name, password, confirmPassword, ...formattedUser } = {
      firstName,
      lastName,
      hashedPassword,
      ...validatedUserForm,
    };

    // insert job seeker into database
    let registeredUser;
    try {
      registeredUser = await jobSeekerModels.instance().register(formattedUser);
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }

    return {
      success: true,
      msg: "Successfully registered",
      data: registeredUser,
      status: 201,
    };
  }

  // login (passport format)
  async login(
    username: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ): Promise<void> {
    // match name or email, and approved
    let users: TMatchNameEmail[];
    try {
      users = await jobSeekerModels.instance().matchNameEmail(username);
    } catch (error) {
      console.log(error);
      return done(error, false, { message: "Something went wrong" });
    }

    if (users.length === 0) {
      return done(null, false, { message: "User doesn't existed" });
    }

    // match password
    let exactUser: TMatchNameEmail | undefined;
    let approvedExisted = false;
    try {
      for (const user of users) {
        if (user.approvalStatus === "APPROVED") {
          approvedExisted = true;
        }
        const matched =
          (process.env.BCRYPT_LIBRARY as string) === "bcryptjs"
            ? await bcryptjs.compare(password, user.password)
            : await bcrypt.compare(password, user.password);

        if (matched) {
          exactUser = user;
          break;
        }
      }
    } catch (error) {
      console.log(error);
      return done(error, false, { message: "Something went wrong" });
    }

    if (!exactUser) {
      // wrong password
      if (approvedExisted) {
        return done(null, false, { message: "Wrong password" });
      }
      // none of the username is approved
      else {
        return done(null, false, { message: "User doesn't existed" });
      }
    }

    // not approved yet
    if (exactUser.approvalStatus === "UNAPPROVED") {
      return done(null, false, { message: "User isn't approved yet" });
    }

    // formatting
    const formattedUser = {
      id: exactUser.id,
      type: "JOBSEEKER",
    };

    return done(null, formattedUser, { message: "Successfully logged in" });
  }

  // google oauth (passport format)
  async googleLogin(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    // check if user existed
    let user: TJobSeeker | undefined;
    try {
      user = await jobSeekerModels
        .instance()
        .getById(profile.id, true, "GOOGLE");
    } catch (error) {
      console.log(error);
      done(error, false, { message: "Something went wrong" });
    }

    // first time oauth login
    let insertUser: TRegisterUser;
    if (!user) {
      try {
        insertUser = await jobSeekerModels
          .instance()
          .oauthUserInsert(profile, "GOOGLE");
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Something went wrong",
        });
      }

      return done(null, false, {
        message:
          "Detecting that you have logged in for the first time, please wait until your account is approved",
      });
    }

    // user already existed
    else {
      // update user info, if there's any change made
      try {
        user = await jobSeekerModels
          .instance()
          .oauthUserUpdate(profile, user, "GOOGLE");
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Something went wrong",
        });
      }

      // user isn't approved yet
      if (user.approvalStatus === "UNAPPROVED") {
        return done(null, false, { message: "User isn't approved yet" });
      }

      // format user
      const formattedUser: TUserSession = {
        id: user.id,
        type: "JOBSEEKER",
        provider: "GOOGLE",
      };

      // user is approved
      done(null, formattedUser, { message: "Successfully login" });
    }
  }

  // check current user, for logout
  async checkCurrent(
    user: Express.User | undefined,
    type: string,
    isOauth: boolean
  ): Promise<SerivcesResponse<TCheckUser>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }
    let userObj: TJobSeekerSession;
    try {
      userObj = user as TJobSeekerSession;
    } catch (error) {
      console.log(error);
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    if (userObj.isOauth !== isOauth || userObj.type !== type) {
      return { success: false, status: 401, msg: "User isn't logged in" };
    }

    return {
      success: true,
      status: 200,
      msg: "Successfully retrieve checked user",
      data: { id: userObj.id, username: userObj.username },
    };
  }

  // get all
  async getAll(): Promise<SerivcesResponse<any>> {
    let jobSeekers;
    try {
      jobSeekers = await jobSeekerModels.instance().getAll();
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }

    if (jobSeekers.length === 0) {
      return { success: true, msg: "There's no job seekers", status: 200 };
    }

    return {
      success: true,
      msg: "Successfully get all job seekers",
      data: jobSeekers,
      status: 200,
    };
  }

  // deserialized user (passport calls)
  async deserializer(
    id: string,
    provider?: "GOOGLE" | "LINE"
  ): Promise<SerivcesResponse<TJobSeeker>> {
    let user: TJobSeeker | undefined;
    // getting user
    try {
      if (!provider) {
        user = await jobSeekerModels.instance().getById(id);
      } else {
        user = await jobSeekerModels.instance().getById(id, false, provider);
      }
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

  // get current
  async getCurrent(
    user: Express.User | undefined
  ): Promise<SerivcesResponse<TJobSeekerSession>> {
    if (!user) {
      return { success: false, msg: "Something went wrong", status: 403 };
    }
    let userObj: TJobSeekerSession;
    try {
      userObj = user as TJobSeekerSession;
      if (userObj.type !== "JOBSEEKER") {
        throw Error();
      }
    } catch (error) {
      return { success: false, status: 400, msg: "User isn't logged in" };
    }

    return {
      success: true,
      msg: "Successfully retrieve current user",
      data: user as TJobSeekerSession,
      status: 200,
    };
  }
}
