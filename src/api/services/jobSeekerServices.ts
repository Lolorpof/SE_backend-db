import "dotenv/config";
import { jobSeekerModels } from "../models/jobSeekerModels";
import * as usersSchemas from "../validators/usersValidator";
import { fromError } from "zod-validation-error";
import "../types/usersTypes";
import bcrypt from "bcryptjs";
import { IVerifyOptions } from "passport-local";
import "../types/usersTypes";
import "../interfaces/userServiceInterfaces";
import {
  jobSeekerServiceInterfaces,
  userOauthServiceInterfaces,
  userServiceInterfaces,
} from "../interfaces/userServiceInterfaces";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { ServicesResponse } from "../types/responseTypes";
import { catchError } from "../utilities/utilFunctions";
import {
  createBucketIfNotExisted,
  minioClient,
} from "../utilities/minio/minio";
import { registrationApprovalImageBucket } from "../utilities/minio";
import { minioUrlExpire } from "../utilities/env";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditJobSeekerSkillResponse,
  TEditJobSeekerVulnerabilityResponse,
  TEditPasswordResponse,
  TEditUsernameResponse,
} from "../types/editUserProfile";
import {
  editAboutSchema,
  editAddressSchema,
  editContactSchema,
  editEmailSchema,
  editFullNameSchema,
  editJobSeekerSkillSchema,
  editJobSeekerVulnerabilitySchema,
  editPasswordSchema,
  editUsernameSchema,
  TEditAboutSchema,
  TEditAddressSchema,
  TEditContactSchema,
  TEditEmailSchema,
  TEditFullNameSchema,
  TEditJobSeekerSkillSchema,
  TEditJobSeekerVulnerabilitySchema,
  TEditPasswordSchema,
  TEditUsernameSchema,
} from "../validators/profileValidator";

export class jobSeekerServices implements jobSeekerServiceInterfaces {
  // singleton design
  private static jobSeekerService: jobSeekerServices | undefined;
  static instance() {
    if (!this.jobSeekerService) {
      this.jobSeekerService = new jobSeekerServices();
    }
    return this.jobSeekerService;
  }

  // register
  async register(userForm: any): Promise<ServicesResponse<TRegisterUser>> {
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
      hashedPassword = await bcrypt.hash(
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
    let registeredUser: TRegisterUser;
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
    let insertUser: TRegisterUser | undefined;
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
        approvalId: insertUser.approvalId,
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

      // get registration approval id of oauth job seeker
      const [err, res] = await catchError(
        jobSeekerModels.instance().oauthGetApprovalId(user.id)
      );
      if (err) {
        return done(err, false, {
          message: "Something went wrong",
        });
      }

      // user isn't approved yet
      if (user.approvalStatus === "UNAPPROVED") {
        return done(null, false, {
          message: "User isn't approved yet",
          approvalId: res.id,
        });
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
  ): Promise<ServicesResponse<TCheckUser>> {
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
  async getAll(): Promise<ServicesResponse<any>> {
    let jobSeekers;
    try {
      jobSeekers = await jobSeekerModels.instance().getAll();
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }

    if (jobSeekers.length === 0) {
      return {
        success: true,
        msg: "There's no job seekers",
        status: 200,
        data: null,
      };
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
  ): Promise<ServicesResponse<TJobSeeker>> {
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
  ): Promise<ServicesResponse<TJobSeekerSession>> {
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

  // upload registration image for approval
  async uploadRegistrationImage(
    approvalId: string,
    image: Express.Multer.File
  ): Promise<ServicesResponse<TRegisterImage>> {
    // upload iamge to minio and get image url
    await createBucketIfNotExisted(registrationApprovalImageBucket);
    await minioClient.putObject(
      registrationApprovalImageBucket,
      `${approvalId}_register`,
      image.buffer,
      image.size,
      { "Content-Type": image.mimetype }
    );

    const imageUrl = await minioClient.presignedUrl(
      "GET",
      registrationApprovalImageBucket,
      `${approvalId}_register`,
      minioUrlExpire // url is valid for 3 hours
    );

    // insert into approval table
    const [error, result] = await catchError(
      jobSeekerModels.instance().uploadRegistrationImage(approvalId, imageUrl)
    );

    if (error) {
      console.error(error);
      return {
        success: false,
        status: 400,
        msg: "Something went wrong",
      };
    }

    return {
      success: true,
      status: 201,
      msg: "Successfully upload and insert registraion approval image",
      data: result,
    };
  }

  // edit username, no oauth
  async editUsername(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditUsernameResponse>> {
    let parsedBody: TEditUsernameSchema;
    try {
      parsedBody = editUsernameSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credentials format" };
    }

    const formattedUser: TJobSeekerSession = user as TJobSeekerSession;

    // wrong user type
    if (formattedUser.type !== "JOBSEEKER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels
        .instance()
        .editUsername(parsedBody.username, parsedBody.password, formattedUser)
    );

    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }

    // wrong password
    if (!result) {
      return {
        status: 400,
        success: false,
        msg: "Wrong password",
      };
    }

    // special case
    if (result.case) {
      if (result.case === "empty username") {
        return {
          status: 400,
          success: false,
          msg: "User field is empty",
        };
      } else if (result.case === "exact dupe") {
        return {
          status: 400,
          success: false,
          msg: "Username can't be used",
        };
      }
      delete result.case;
    }

    const { case: _, ...formattedResult } = result;

    return {
      status: 200,
      success: true,
      msg: "Successfully editted username",
      data: formattedResult,
    };
  }

  // edit email, no oauth
  async editEmail(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditEmailResponse>> {
    // validate body
    let parsedBody: TEditEmailSchema;
    try {
      parsedBody = editEmailSchema.parse(body);
    } catch (error) {
      console.error(error);
      return {
        status: 400,
        success: false,
        msg: "Wrong credentials format",
      };
    }

    const formattedUser = user as TJobSeekerSession;

    // wrong user type
    if (formattedUser.type !== "JOBSEEKER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    // check dupe email
    const [error, result] = await catchError(
      jobSeekerModels.instance().editEmail(parsedBody.email, formattedUser)
    );

    if (error) {
      console.error(error);
      return {
        status: 403,
        success: false,
        msg: "Something went wrong",
      };
    }

    // dupe email
    if (!result) {
      return { status: 400, success: false, msg: "Email is already used" };
    }

    return {
      status: 200,
      success: true,
      msg: "Successfully updated email",
      data: result,
    };
  }

  // edit fullname, no oauth
  async editFullName(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditFullNameResponse>> {
    let parsedBody: TEditFullNameSchema;
    try {
      parsedBody = editFullNameSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    // wrong user type
    if (formattedUser.type !== "JOBSEEKER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    // call models
    const [error, result] = await catchError(
      jobSeekerModels
        .instance()
        .editFullName(parsedBody.firstName, parsedBody.lastName, formattedUser)
    );
    if (error) {
      console.error(error);
      return { status: 403, msg: "Something went wrong", success: false };
    }

    if (!result) {
      return { status: 400, msg: "Name is already used", success: false };
    }

    return {
      status: 200,
      msg: "Successfully updated full name",
      success: true,
      data: result,
    };
  }

  // edit about
  async editAbout(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditAboutResponse>> {
    let parsedBody: TEditAboutSchema;
    try {
      parsedBody = editAboutSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    if (formattedUser.type !== "JOBSEEKER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels.instance().editAbout(parsedBody.about, formattedUser)
    );
    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }

    // about is empty string
    if (!result) {
      return { status: 400, success: false, msg: "Field is empty" };
    }

    return {
      status: 200,
      success: true,
      msg: "Successfully updated about user",
      data: result,
    };
  }

  // edit address
  async editAddress(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditAddressResponse>> {
    let parsedBody: TEditAddressSchema;
    try {
      parsedBody = editAddressSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    if (formattedUser.type !== "JOBSEEKER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels
        .instance()
        .editAddress(
          parsedBody.address,
          parsedBody.provinceAddress,
          formattedUser
        )
    );
    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }

    // address is empty string
    if (!result) {
      return { status: 400, success: false, msg: "Field is empty" };
    }

    return {
      status: 200,
      success: true,
      msg: "Successfully updated address",
      data: result,
    };
  }

  // edit contact
  async editContact(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditContactResponse>> {
    let parsedBody: TEditContactSchema;
    try {
      parsedBody = editContactSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    if (formattedUser.type !== "JOBSEEKER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels.instance().editContact(parsedBody.contact, formattedUser)
    );
    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }
    if (!result) {
      return { status: 400, success: false, msg: "Contact field is empty" };
    }

    return {
      status: 200,
      success: true,
      msg: "Successfully updated contact",
      data: result,
    };
  }

  // edit password, no oauth
  async editPassword(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditPasswordResponse>> {
    let parsedBody: TEditPasswordSchema;
    try {
      parsedBody = editPasswordSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    if (formattedUser.type !== "JOBSEEKER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels
        .instance()
        .editPassword(
          parsedBody.password,
          parsedBody.oldPassword,
          formattedUser
        )
    );
    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }
    if (!result) {
      return { status: 400, success: false, msg: "Password field is empty" };
    }
    if (result.case) {
      if (result.case === "no user") {
        return { status: 403, success: false, msg: "Something went wrong" };
      } else if (result.case === "wrong password") {
        return { status: 401, success: false, msg: "Wrong old password" };
      } else if (result.case === "exactDupe") {
        return { status: 400, success: false, msg: "Password can't be use" };
      }

      delete result.case;
    }

    const { case: _, ...formattedResult } = result;

    return {
      status: 200,
      success: true,
      msg: "Successfully updated password",
      data: { userId: formattedResult.userId },
    };
  }

  // edit job seeker skills
  async editSkill(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditJobSeekerSkillResponse>> {
    let parsedBody: TEditJobSeekerSkillSchema;
    try {
      parsedBody = editJobSeekerSkillSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    if (formattedUser.type !== "JOBSEEKER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels.instance().editSkill(parsedBody.skillsId, formattedUser)
    );
    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }
    if (result.case) {
      if (result.case === "not exist") {
        return {
          status: 200,
          success: true,
          msg: "Some skill doesn't existed, so that skill won't be add",
          data: { skillsId: result.skillsId, userId: formattedUser.id },
        };
      }

      delete result.case;
    }

    const { case: _, ...formattedResult } = result;

    return {
      status: 200,
      success: true,
      msg: "Successfully editted skills",
      data: formattedResult,
    };
  }

  // edit job seeker vulnerabilities
  async editVulnerability(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditJobSeekerVulnerabilityResponse>> {
    let parsedBody: TEditJobSeekerVulnerabilitySchema;
    try {
      parsedBody = editJobSeekerVulnerabilitySchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credential format" };
    }

    const formattedUser = user as TJobSeekerSession;

    if (formattedUser.type !== "JOBSEEKER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      jobSeekerModels
        .instance()
        .editVulnerability(parsedBody.vulnerabilitiesId, formattedUser)
    );
    if (error) {
      console.error(error);
      return { status: 403, success: false, msg: "Something went wrong" };
    }
    if (result.case) {
      if (result.case === "not exist") {
        return {
          status: 200,
          success: true,
          msg: "Some vulnerability doesn't existed, so that vulnerability won't be add",
          data: {
            vulnerabilitiesId: result.vulnerabilitiesId,
            userId: formattedUser.id,
          },
        };
      }

      delete result.case;
    }

    const { case: _, ...formattedResult } = result;

    return {
      status: 200,
      success: true,
      msg: "Successfully editted skills",
      data: formattedResult,
    };
  }
}
