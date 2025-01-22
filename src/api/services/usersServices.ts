import { usersModels } from "../models/usersModels";
import * as usersSchemas from "../validators/usersSchemas";
import { fromError } from "zod-validation-error";
import "../types/genericTypes";
import "../types/usersTypes";

export class usersServices {
  // {Job Seeker}
  static async jobSeekerRegister(userForm: any) {
    // user form validation
    try {
      usersSchemas.jobSeekerRegisterSchema.parse(userForm);
    } catch (error) {
      const formattedError = fromError(error).toString();
      console.log(formattedError);
      return { success: false, msg: formattedError };
    }

    const validatedUserForm: usersSchemas.jobSeekerRegisterType = userForm;
    // split to first name and last name
    const [firstName, lastName] = validatedUserForm.name.split(" ");
    // format user
    const { name, confirmPassword, ...formattedUser } = {
      firstName,
      lastName,
      ...validatedUserForm,
    };

    // insert into database
    return usersModels.jobSeekerRegister(formattedUser);
  }

  // {Employer}

  // {Company}
}
