import { fromError } from "zod-validation-error";
import { employerModels } from "../models/employerModels";
import {
  singleUserRegisterType,
  singleUserRegisterSchema,
} from "../validators/usersSchemas";
import bcrypt from "bcrypt";

export class employerServices {
  // singleton design
  private static employerService: employerServices | undefined;
  static instance() {
    if (!this.employerService) {
      this.employerService = new employerServices();
    }
    return this.employerService;
  }

  async employerRegister(userForm: any) {
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
        .duplicatedEmployerCheck(firstName, lastName, validatedUserForm.email);
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
      registeredUser = await employerModels
        .instance()
        .employerRegister(formattedUser);
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
}
