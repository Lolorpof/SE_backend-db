import { fromError } from "zod-validation-error";
import { employerModels } from "../models/employerModels";
import {
  singleUserRegisterType,
  singleUserRegisterSchema,
} from "../validators/usersValidator";
import bcrypt from "bcrypt";
import { userServiceInterfaces } from "../interfaces/userServiceInterfaces";
import { IVerifyOptions } from "passport-local";
import "../types/usersTypes";

export class employerServices implements userServiceInterfaces {
  // singleton design
  private static employerService: employerServices | undefined;
  static instance() {
    if (!this.employerService) {
      this.employerService = new employerServices();
    }
    return this.employerService;
  }

  // register employer
  async register(userForm: any): Promise<SerivcesResponse<any>> {
    // {Business Logic}
    // user form validation
    try {
      singleUserRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError, status: 403 };
    }

    const validatedUserForm: singleUserRegisterType = userForm;
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
    let users: matchNameEmailType[] | undefined;
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

    let exactUser: matchNameEmailType | undefined;
    try {
      for (const user of users) {
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

    // wrong password
    if (!exactUser) {
      return done(null, false, { message: "Wrong password" });
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

  // check current user, for logout
  async checkCurrent(
    user: Express.User | undefined,
    isOauth: boolean,
    type: string
  ): Promise<SerivcesResponse<any>> {
    if (!user) {
      return { success: false, status: 403, msg: "Something went wrong" };
    }
    let userObj: employerSessionType;
    try {
      userObj = user as employerSessionType;
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
  ): Promise<SerivcesResponse<employerSessionType>> {
    if (!user) {
      return { status: 403, success: false, msg: "Something went wrong" };
    }
    let userObj: employerSessionType;
    try {
      userObj = user as employerSessionType;
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
      data: user as employerSessionType,
    };
  }

  // deserialize user (passport calls)
  async deserializer(
    id: string,
    isOauth: boolean
  ): Promise<SerivcesResponse<any>> {
    let user: employerType | undefined;
    // getting user
    try {
      user = await employerModels.instance().getById(id, isOauth);
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
