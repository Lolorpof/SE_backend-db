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
} from "../utilities/minio";
import { minioUrlExpire } from "../utilities/env";
import { catchError } from "../utilities/utilFunctions";
import { ServicesResponse } from "../types/responseTypes";

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
}
