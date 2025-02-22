import "dotenv/config";
import { fromError } from "zod-validation-error";
import { employerModels } from "../models/employerModels";
import {
  TSingleUserRegister,
  singleUserRegisterSchema,
} from "../validators/usersValidator";
import bcrypt from "bcryptjs";
import {
  employerServiceInterfaces,
  userOauthServiceInterfaces,
  userServiceInterfaces,
} from "../interfaces/userServiceInterfaces";
import { IVerifyOptions } from "passport-local";
import "../types/usersTypes";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import { ServicesResponse } from "../types/responseTypes";
import {
  createBucketIfNotExisted,
  minioClient,
  registrationApprovalImageBucket,
  userProfileImageBucket,
} from "../utilities/minio";
import { minioUrlExpire } from "../utilities/env";
import { catchError } from "../utilities/utilFunctions";
import {
  editAboutSchema,
  editAddressSchema,
  editContactSchema,
  editEmailSchema,
  editFullNameSchema,
  editPasswordSchema,
  editUsernameSchema,
  TEditAboutSchema,
  TEditAddressSchema,
  TEditContactSchema,
  TEditEmailSchema,
  TEditFullNameSchema,
  TEditPasswordSchema,
  TEditUsernameSchema,
} from "../validators/profileValidator";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditPasswordResponse,
  TEditUsernameResponse,
} from "../types/editUserProfile";

export class employerServices implements employerServiceInterfaces {
  // singleton design
  private static employerService: employerServices | undefined;
  static instance() {
    if (!this.employerService) {
      this.employerService = new employerServices();
    }
    return this.employerService;
  }

  // register employer
  async register(userForm: any): Promise<ServicesResponse<any>> {
    // {Business Logic}
    // user form validation
    try {
      singleUserRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError, status: 403 };
    }

    const validatedUserForm: TSingleUserRegister = userForm;
    // split to first name and last name
    const [firstName, lastName] = validatedUserForm.name.split(" ");

    // Duplicated name or email check
    let duplicatedUserCheck;
    try {
      duplicatedUserCheck = await employerModels
        .instance()
        .duplicateNameEmail(firstName, lastName, validatedUserForm.email);
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }
    // there's duped user of some kind
    if (duplicatedUserCheck) {
      // duped name
      if (
        firstName === (duplicatedUserCheck.firstName as string) &&
        lastName === (duplicatedUserCheck.lastName as string) &&
        validatedUserForm.email !== (duplicatedUserCheck.email as string)
      ) {
        return {
          success: false,
          msg: "Name was already used",
          status: 400,
        };
      }
      // duped email
      else if (
        validatedUserForm.email === (duplicatedUserCheck.email as string)
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

    // insert into database
    let registeredUser;
    try {
      registeredUser = await employerModels.instance().register(formattedUser);
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

  // login employer (passport form)
  async login(
    username: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ): Promise<void> {
    let users: TMatchNameEmail[] | undefined;
    try {
      // find user with same name or email
      users = await employerModels.instance().matchNameEmail(username);
    } catch (error) {
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

        // exact user found
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

    // user isn't approved yet
    if (exactUser.approvalStatus === "UNAPPROVED") {
      return done(null, false, {
        message: "User isn't approved yet",
      });
    }

    // format user
    const formattedUser = {
      id: exactUser.id,
      isOauth: false,
      type: "EMPLOYER",
    };

    console.log("pre done");
    return done(null, formattedUser, { message: "Successfully logged in" });
  }

  // google oauth login (passport form)
  async googleLogin(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    // check if user existed
    let user: TEmployer | undefined;
    try {
      user = await employerModels
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
        insertUser = await employerModels
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
        user = await employerModels
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
        type: "EMPLOYER",
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
  ): Promise<ServicesResponse<any>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }
    let userObj: TEmployerSession;
    try {
      userObj = user as TEmployerSession;
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

  // get current user (passport calls)
  async getCurrent(
    user: Express.User | undefined
  ): Promise<ServicesResponse<TEmployerSession>> {
    if (!user) {
      return { status: 403, success: false, msg: "Something went wrong" };
    }
    let userObj: TEmployerSession;
    try {
      userObj = user as TEmployerSession;
      if (userObj.type !== "EMPLOYER") {
        throw Error();
      }
    } catch (error) {
      return { success: false, status: 400, msg: "User isn't logged in" };
    }

    return {
      status: 200,
      success: true,
      msg: "Successfully retrieve user",
      data: user as TEmployerSession,
    };
  }

  // upload register image service
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
      employerModels.instance().uploadRegistrationImage(approvalId, imageUrl)
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

  // deserialize user (passport calls)
  async deserializer(
    id: string,
    provider?: "GOOGLE" | "LINE"
  ): Promise<ServicesResponse<any>> {
    let user: TEmployer | undefined;
    // getting user
    try {
      if (!provider) {
        user = await employerModels.instance().getById(id);
      } else {
        user = await employerModels.instance().getById(id, false, provider);
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

  // upload profile image, no oauth
  async uploadProfilePicture(
    image: Express.Multer.File,
    user: Express.User
  ): Promise<ServicesResponse<TProfileImage>> {
    const formattedUser = user as TEmployerSession;
    if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
      return { status: 400, success: false, msg: "User isn't logged in" };
    }

    // insert into minio
    const imageName = `${formattedUser.id}_employer_profile`;
    await createBucketIfNotExisted(userProfileImageBucket);
    await minioClient.putObject(
      userProfileImageBucket,
      imageName,
      image.buffer,
      image.size,
      { "Content-Type": image.mimetype }
    );

    // get image url (temp presigned)
    const imageUrl = `http://localhost:1982/profile/${imageName}`;

    // call model
    const [error, result] = await catchError(
      employerModels.instance().uploadProfilePicture(imageUrl, formattedUser)
    );
    if (error) {
      return { status: 403, success: false, msg: "Something went wrong" };
    }

    return {
      status: 201,
      success: true,
      msg: "Successfully uploaded profile image",
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

    const formattedUser = user as TEmployerSession;

    // wrong user type
    if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      employerModels
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

    const formattedUser = user as TEmployerSession;

    // wrong user type
    if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    // check dupe email
    const [error, result] = await catchError(
      employerModels.instance().editEmail(parsedBody.email, formattedUser)
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

    const formattedUser = user as TEmployerSession;

    // wrong user type
    if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    // call models
    const [error, result] = await catchError(
      employerModels
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

    const formattedUser = user as TEmployerSession;

    if (formattedUser.type !== "EMPLOYER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      employerModels.instance().editAbout(parsedBody.about, formattedUser)
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

    const formattedUser = user as TEmployerSession;

    if (formattedUser.type !== "EMPLOYER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      employerModels
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

    const formattedUser = user as TEmployerSession;

    if (formattedUser.type !== "EMPLOYER") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      employerModels.instance().editContact(parsedBody.contact, formattedUser)
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

    const formattedUser = user as TEmployerSession;

    if (formattedUser.type !== "EMPLOYER" || formattedUser.isOauth) {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      employerModels
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
}
