import "dotenv/config";
import { companyModels } from "../models/companyModels";
import {
  companyRegisterSchema,
  TCompanyRegister,
} from "../validators/usersValidator";
import { fromError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import {
  companyServiceInterfaces,
  userServiceInterfaces,
} from "../interfaces/userServiceInterfaces";
import { IVerifyOptions } from "passport-local";
import "../types/usersTypes";
import {
  createBucketIfNotExisted,
  minioClient,
  registrationApprovalImageBucket,
  userProfileImageBucket,
} from "../utilities/minio";
import { minioUrlExpire } from "../utilities/env";
import { catchError } from "../utilities/utilFunctions";
import { ServicesResponse } from "../types/responseTypes";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditOfficialNameResponse,
  TEditPasswordResponse,
} from "../types/editUserProfile";
import {
  editAboutSchema,
  editAddressSchema,
  editContactSchema,
  editEmailSchema,
  editFullNameSchema,
  editOfficialNameSchema,
  editPasswordSchema,
  TEditAboutSchema,
  TEditAddressSchema,
  TEditContactSchema,
  TEditEmailSchema,
  TEditFullNameSchema,
  TEditOfficialNameSchema,
  TEditPasswordSchema,
} from "../validators/profileValidator";

export class companyServices implements companyServiceInterfaces {
  // singleton design
  private static companyService: companyServices | undefined;
  static instance() {
    if (!this.companyService) {
      this.companyService = new companyServices();
    }
    return this.companyService;
  }

  // {Business Logic}
  // register company
  async register(userForm: any): Promise<ServicesResponse<any>> {
    // user form validation
    try {
      companyRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError, status: 403 };
    }

    const validatedUserForm: TCompanyRegister = userForm;

    // Duplicated name or email check
    let duplicatedUserCheck;
    try {
      duplicatedUserCheck = await companyModels
        .instance()
        .duplicateNameEmail(
          validatedUserForm.officialName,
          validatedUserForm.email
        );
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong", status: 403 };
    }
    // there's duped user of some kind
    if (duplicatedUserCheck) {
      // duped name
      if (
        validatedUserForm.officialName ===
          (duplicatedUserCheck.officialName as string) &&
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
    const { password, confirmPassword, ...formattedUser } = {
      hashedPassword,
      ...validatedUserForm,
    };

    // insert into database
    let registeredUser: TRegisterUser;
    try {
      registeredUser = await companyModels.instance().register(formattedUser);
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

  // login company (passport form)
  async login(
    username: string,
    password: string,
    done: (
      error: any,
      user?: Express.User | false,
      options?: IVerifyOptions
    ) => void
  ): Promise<void> {
    let users: TMatchNameEmail[];
    // get all match name or email
    try {
      users = await companyModels.instance().matchNameEmail(username);
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

    // wrong password
    if (!exactUser) {
      return done(null, false, { message: "Wrong password" });
    }

    // not approved
    if (exactUser.approvalStatus === "UNAPPROVED") {
      return done(null, false, { message: "User isn't approved yet" });
    }

    // format user
    const formattedUser: TUserSession = {
      id: exactUser.id,
      type: "COMPANY",
    };

    done(null, formattedUser, { message: "Successfully logged in" });
  }

  async checkCurrent(
    user: Express.User | undefined,
    type: string
  ): Promise<ServicesResponse<any>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }

    let userObj: TCompanySession;
    try {
      userObj = user as TCompanySession;
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
      data: { id: userObj.id, officialName: userObj.officialName },
    };
  }

  // get current user
  async getCurrent(
    user: Express.User | undefined
  ): Promise<ServicesResponse<TCompanySession>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }
    let userObj: TCompanySession;
    try {
      userObj = user as TCompanySession;
      if (userObj.type !== "COMPANY") {
        throw Error();
      }
    } catch (error) {
      return { success: false, status: 400, msg: "User isn't logged in" };
    }

    return {
      success: true,
      status: 200,
      msg: "Successfully retrieve user",
      data: user as TCompanySession,
    };
  }

  // upload register proof image
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
      companyModels.instance().uploadRegistrationImage(approvalId, imageUrl)
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

  // deserialized user (passport calls)
  async deserializer(id: string): Promise<ServicesResponse<TCompany>> {
    let user: TCompany | undefined;
    // getting user
    try {
      user = await companyModels.instance().getById(id);
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
    const formattedUser = user as TCompanySession;
    if (formattedUser.type !== "COMPANY") {
      return { status: 400, success: false, msg: "User isn't logged in" };
    }

    // insert into minio
    const imageName = `${formattedUser.id}_company_profile`;
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
      companyModels.instance().uploadProfilePicture(imageUrl, formattedUser)
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
  async editOfficialName(
    body: any,
    user: Express.User
  ): Promise<ServicesResponse<TEditOfficialNameResponse>> {
    let parsedBody: TEditOfficialNameSchema;
    try {
      parsedBody = editOfficialNameSchema.parse(body);
    } catch (error) {
      console.error(error);
      return { status: 400, success: false, msg: "Wrong credentials format" };
    }

    const formattedUser = user as TCompanySession;

    // wrong user type
    if (formattedUser.type !== "COMPANY") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      companyModels
        .instance()
        .editOfficialName(
          parsedBody.officialName,
          parsedBody.password,
          formattedUser
        )
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

    const formattedUser = user as TCompanySession;

    // wrong user type
    if (formattedUser.type !== "COMPANY") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    // check dupe email
    const [error, result] = await catchError(
      companyModels.instance().editEmail(parsedBody.email, formattedUser)
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

    const formattedUser = user as TCompanySession;

    if (formattedUser.type !== "COMPANY") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      companyModels.instance().editAbout(parsedBody.about, formattedUser)
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

    const formattedUser = user as TCompanySession;

    if (formattedUser.type !== "COMPANY") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      companyModels
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

    const formattedUser = user as TCompanySession;

    if (formattedUser.type !== "COMPANY") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      companyModels.instance().editContact(parsedBody.contact, formattedUser)
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

    const formattedUser = user as TCompanySession;

    if (formattedUser.type !== "COMPANY") {
      return { status: 401, success: false, msg: "User isn't logged in" };
    }

    const [error, result] = await catchError(
      companyModels
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
