import "dotenv/config";
import { drizzlePool } from "../../db/conn";
import {
  jobSeekerTable,
  oauthJobSeekerTable,
  registrationApprovalTable,
} from "../../db/schema";
import "../types/usersTypes";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export class jobSeekerModels {
  // singleton design
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
  async register(user: formattedSingleUserRegisterType) {
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

    return registeredUser[0];
  }

  // {login}
  async matchNameEmail(nameEmail: string, password: string) {
    // find users with name or email
    const users = await drizzlePool.query.jobSeekerTable.findMany({
      columns: { id: true, password: true, approvalStatus: true },
      where: or(
        eq(jobSeekerTable.username, nameEmail),
        eq(jobSeekerTable.email, nameEmail)
      ),
    });

    return users;
  }

  // get all
  async getAll() {
    // get all user's info
    const result = await drizzlePool.query.jobSeekerTable.findMany({
      columns: {
        id: false,
        password: false,
        createdAt: false,
        updatedAt: false,
        approvalStatus: false,
      },
      with: {
        skills: { with: { toSkill: { columns: { name: true } } } },
        vulnerabilities: {
          with: { toVulnerabilityType: { columns: { name: true } } },
        },
      },
    });

    return result;
  }

  // get by id
  async getById(id: string, isOauth: boolean) {
    let user: jobSeekerType | undefined;
    if (!isOauth) {
      user = await drizzlePool.query.jobSeekerTable.findFirst({
        columns: {
          id: false,
          password: false,
          createdAt: false,
          updatedAt: false,
        },
        where: eq(jobSeekerTable.id, id),
        with: {
          skills: {
            with: { toSkill: { columns: { name: true, description: true } } },
          },
          vulnerabilities: {
            with: {
              toVulnerabilityType: {
                columns: { name: true, description: true },
              },
            },
          },
        },
      });
    } else {
      user = await drizzlePool.query.oauthJobSeekerTable.findFirst({
        columns: { id: false, createdAt: false, updatedAt: false },
        where: eq(oauthJobSeekerTable.id, id),
        with: {
          skills: {
            with: { toSkill: { columns: { name: true, description: true } } },
          },
          vulnerabilities: {
            with: {
              toVulnerabilityType: {
                columns: { name: true, description: true },
              },
            },
          },
        },
      });
    }

    return user;
  }
}
