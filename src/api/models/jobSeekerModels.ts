import "dotenv/config";
import { drizzlePool } from "../../db/conn";
import { jobSeekerTable, registrationApprovalTable } from "../../db/schema";
import "../types/usersTypes";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export class jobSeekerModels {
  private static jobSeekerModel: jobSeekerModels | undefined;
  static instance() {
    if (!this.jobSeekerModel) {
      this.jobSeekerModel = new jobSeekerModels();
    }
    return this.jobSeekerModel;
  }

  // duplicate name check
  async duplicatedJobSeekerCheck(
    firstName: string,
    lastName: string,
    email: string
  ) {
    let duplicatedNameOrEmail;
    // getting duplicated first name & last name
    duplicatedNameOrEmail = await drizzlePool
      .select({
        firstName: jobSeekerTable.firstName,
        lastName: jobSeekerTable.lastName,
        email: jobSeekerTable.email,
      })
      .from(jobSeekerTable)
      .where(
        or(
          and(
            eq(jobSeekerTable.firstName, firstName),
            eq(jobSeekerTable.lastName, lastName)
          ),
          eq(jobSeekerTable.email, email)
        )
      );

    return duplicatedNameOrEmail[0];
  }

  // register
  async jobSeekerRegister(user: formattedUserType) {
    // job seeker
    const registeredUser = await drizzlePool
      .insert(jobSeekerTable)
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.firstName,
        email: user.email,
        password: user.hashedPassword,
      })
      .returning({ id: jobSeekerTable.id });

    //registration approval
    await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "JOBSEEKER", jobSeekerId: registeredUser[0].id });

    return registeredUser;
  }
}
