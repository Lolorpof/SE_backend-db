import "dotenv/config";
import { drizzlePool } from "../../db/conn";
import { jobSeekerTable } from "../../db/schema";
import * as usersSchemas from "../validators/usersSchemas";
import bcrypt from "bcrypt";
import "../types/usersTypes";
import { and, eq } from "drizzle-orm";

export class usersModels {
  // {Job Seeker}
  static async duplicatedJobSeekerNameCheck(user: formattedUserType) {
    let userName: Object | undefined;
    // getting duplicated first name & last name
    try {
      userName = drizzlePool
        .select({
          name: jobSeekerTable.firstName,
          lastName: jobSeekerTable.lastName,
        })
        .from(jobSeekerTable)
        .where(
          and(
            eq(jobSeekerTable.firstName, user.firstName),
            eq(jobSeekerTable.lastName, user.lastName)
          )
        )[0];
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Something went wrong" };
    }
  }

  static async jobSeekerRegister(user: formattedUserType) {
    // hash password w/ bcrypt
    let hashedPassword: string | undefined;
    try {
      hashedPassword = await bcrypt.hash(
        user.password,
        process.env.BCRYPT_SALTROUNDS as string
      );
    } catch (error) {
      console.log(error);
      return -1;
    }

    const registeredQuery = drizzlePool.insert(jobSeekerTable).values({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.firstName,
      email: user.email,
      password: hashedPassword,
    });
  }

  // {Employer}

  // {Company}
}
