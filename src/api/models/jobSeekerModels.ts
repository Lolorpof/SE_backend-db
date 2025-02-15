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
  jobSeekerModelInterfaces,
  userModelInterfaces,
  userOauthModelInterfaces,
} from "../interfaces/userModelInterfaces";
import { Profile as GoogleProfile } from "passport-google-oauth20";
import { TApprovedRequest } from "../validators/usersValidator";

export class jobSeekerModels implements jobSeekerModelInterfaces {
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
  async register(user: TFormattedSingleUserRegister): Promise<TRegisterUser> {
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
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "JOBSEEKER", jobSeekerId: registeredUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format return data
    const registered: TRegisterUser = {
      userId: registeredUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  // oauth first time
  async oauthUserInsert(
    profile: GoogleProfile,
    provider: "GOOGLE" | "LINE"
  ): Promise<TRegisterUser> {
    const loginUser = await drizzlePool
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

    // insert into registration approval
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "OAUTHJOBSEEKER", oauthJobSeekerId: loginUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format return data
    const registered: TRegisterUser = {
      userId: loginUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  // update oauth profile
  async oauthUserUpdate(
    profile: GoogleProfile,
    currentUser: TJobSeeker,
    provider: "GOOGLE" | "LINE"
  ): Promise<TJobSeeker> {
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

    const user: TJobSeeker = updateUser[0] as TJobSeeker;
    return user;
  }

  // get approval id for oauth
  async oauthGetApprovalId(userId: string): Promise<TGetId> {
    const approvalId =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { id: true },
        where: eq(registrationApprovalTable.oauthJobSeekerId, userId),
      });
    if (!approvalId) {
      throw Error("No approval id existed");
    }

    return approvalId;
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
    let user: TJobSeeker | undefined;
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

  // user approved by admin
  async approved(
    user: TApprovingUser,
    isOauth: boolean
  ): Promise<TApproveUser> {
    let result: TApproveUser[];
    if (user.status === "APPROVED") {
      if (isOauth) {
        result = await drizzlePool
          .update(oauthJobSeekerTable)
          .set({ approvalStatus: user.status })
          .where(eq(oauthJobSeekerTable.id, user.id))
          .returning({ id: oauthJobSeekerTable.id });
      } else {
        result = await drizzlePool
          .update(jobSeekerTable)
          .set({ approvalStatus: user.status })
          .where(eq(jobSeekerTable.id, user.id))
          .returning({ id: jobSeekerTable.id });
      }
    } else {
      if (isOauth) {
        result = await drizzlePool
          .delete(oauthJobSeekerTable)
          .where(eq(oauthJobSeekerTable.id, user.id))
          .returning({ id: oauthJobSeekerTable.id });
      } else {
        result = await drizzlePool
          .delete(jobSeekerTable)
          .where(eq(jobSeekerTable.id, user.id))
          .returning({ id: jobSeekerTable.id });
      }
    }

    return result[0];
  }

  // upload registration image into approval table
  async uploadRegistrationImage(
    approvalId: string,
    imageUrl: string
  ): Promise<TRegisterImage> {
    // update approval table at approvalId with image
    await drizzlePool
      .update(registrationApprovalTable)
      .set({ imageUrl: imageUrl })
      .where(eq(registrationApprovalTable.id, approvalId));

    return { approvalId, url: imageUrl };
  }
}
