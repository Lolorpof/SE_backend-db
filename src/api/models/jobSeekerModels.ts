import "dotenv/config";
import { drizzlePool } from "../../db/conn";
import {
  jobSeekerTable,
  oauthJobSeekerTable,
  registrationApprovalTable,
} from "../../db/schema";
import "../types/usersTypes";
import { and, eq, or } from "drizzle-orm";
import {
  userModelInterfaces,
  userOauthModelInterfaces,
} from "../interfaces/userModelInterfaces";
import { Profile as GoogleProfile } from "passport-google-oauth20";

export class jobSeekerModels implements userOauthModelInterfaces {
  // singleton design
  private static jobSeekerModel: jobSeekerModels | undefined;
  static instance() {
    if (!this.jobSeekerModel) {
      this.jobSeekerModel = new jobSeekerModels();
    }
    return this.jobSeekerModel;
  }

  // duplicate name or email check
  async duplicateNameEmail(firstName: string, lastName: string, email: string) {
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
  async register(
    user: formattedSingleUserRegisterType
  ): Promise<registerUserType> {
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

  // oauth first time
  async oauthUserInsert(
    profile: GoogleProfile,
    provider: "GOOGLE" | "LINE"
  ): Promise<registerUserType> {
    let user: registerUserType[];
    // ***remove true***
    if (provider === "GOOGLE" || true) {
      user = await drizzlePool
        .insert(oauthJobSeekerTable)
        .values({
          firstName: profile._json.given_name as string,
          lastName: profile._json.family_name as string,
          email: profile._json.email as string,
          provider: "GOOGLE",
          providerId: profile.id,
          username: profile._json.given_name as string,
        })
        .returning({ id: oauthJobSeekerTable.id });
    } else {
    }

    // insert into registration approval
    await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "OAUTHJOBSEEKER", oauthJobSeekerId: user[0].id });

    return user[0];
  }

  // update oauth profile
  async oauthUserUpdate(
    profile: GoogleProfile,
    currentUser: jobSeekerType,
    provider: "GOOGLE" | "LINE"
  ): Promise<jobSeekerType> {
    // remove true if done
    let updateUser;
    if (provider === "GOOGLE" || true) {
      if (
        currentUser.lastName !== profile._json.family_name ||
        currentUser.firstName !== profile._json.given_name ||
        currentUser.email !== profile._json.email ||
        currentUser.profilePicture !== profile._json.picture
      ) {
        updateUser = await drizzlePool
          .update(oauthJobSeekerTable)
          .set({
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            profilePicture: profile._json.picture,
          })
          .where(eq(oauthJobSeekerTable.id, currentUser.id))
          .returning();
      }
    }

    // no updated done
    if (!updateUser) {
      return currentUser;
    }

    const user: jobSeekerType = updateUser[0] as jobSeekerType;
    return user;
  }

  // {login}
  async matchNameEmail(nameEmail: string) {
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

  // get user by id
  async getById(
    idOrProviderId: string,
    getByProviderId?: boolean,
    provider?: "GOOGLE" | "LINE"
  ) {
    let user: jobSeekerType | undefined;
    if (!provider) {
      user = await drizzlePool.query.jobSeekerTable.findFirst({
        columns: {
          password: false,
          createdAt: false,
          updatedAt: false,
        },
        where: eq(jobSeekerTable.id, idOrProviderId),
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
    } else if (getByProviderId) {
      user = await drizzlePool.query.oauthJobSeekerTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: and(
          eq(oauthJobSeekerTable.providerId, idOrProviderId),
          eq(oauthJobSeekerTable.provider, provider)
        ),
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
        columns: { createdAt: false, updatedAt: false },
        where: eq(oauthJobSeekerTable.id, idOrProviderId),
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
