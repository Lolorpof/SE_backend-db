import { companyModels } from "../models/companyModels";
import {
  companyRegisterSchema,
  companyRegisterType,
} from "../validators/usersValidator";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";

export class companyServices {
  // singleton design
  private static companyService: companyServices | undefined;
  static instance() {
    if (!this.companyService) {
      this.companyService = new companyServices();
    }
    return this.companyService;
  }

  async companyRegister(userForm: any) {
    // {Business Logic}
    // user form validation
    try {
      companyRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError, status: 403 };
    }

    const validatedUserForm: companyRegisterType = userForm;

    // Duplicated name or email check
    let duplicatedUserCheck;
    try {
      duplicatedUserCheck = await companyModels
        .instance()
        .duplicatedCompanyCheck(
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
    let registeredUser;
    try {
      registeredUser = await companyModels
        .instance()
        .companyRegister(formattedUser);
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
