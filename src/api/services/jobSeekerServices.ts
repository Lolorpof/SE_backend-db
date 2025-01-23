import { jobSeekerModels } from "../models/jobSeekerModels";
import * as usersSchemas from "../validators/usersValidator";
import { fromError } from "zod-validation-error";
import "../types/usersTypes";
import bcrypt from "bcrypt";

export class jobSeekerServices {
  // singleton design
  private static jobSeekerService: jobSeekerServices | undefined;
  static instance() {
    if (!this.jobSeekerService) {
      this.jobSeekerService = new jobSeekerServices();
    }
    return this.jobSeekerService;
  }

  // register
  async jobSeekerRegister(userForm: any) {
    // {Business Logic}
    // user form validation
    try {
      usersSchemas.singleUserRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError, status: 403 };
    }

    const validatedUserForm: usersSchemas.singleUserRegisterType = userForm;
    // split to first name and last name
    const [firstName, lastName] = validatedUserForm.name.split(" ");

    // Duplicated name or email check
    let duplicatedNameUser;
    try {
      duplicatedNameUser = await jobSeekerModels
        .instance()
        .duplicatedJobSeekerCheck(firstName, lastName, validatedUserForm.email);
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
    let registeredUser;
    try {
      registeredUser = await jobSeekerModels
        .instance()
        .jobSeekerRegister(formattedUser);
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

  // get all
  async getAll() {
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
}
