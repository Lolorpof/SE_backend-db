import { and, eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  employerTable,
  oauthEmployerTable,
  registrationApprovalTable,
} from "../../db/schema";
import "../types/usersTypes";
import {
  userModelInterfaces,
  userOauthModelInterfaces,
} from "../interfaces/userModelInterfaces";
import { Profile } from "passport-google-oauth20";

export class employerModels implements userOauthModelInterfaces {
  // singleton design
  private static employerModel: employerModels | undefined;
  static instance() {
    if (!this.employerModel) {
      this.employerModel = new employerModels();
    }
    return this.employerModel;
  }

  // duplicate name check
  async duplicateNameEmail(firstName: string, lastName: string, email: string) {
    // getting duplicated first name & last name
    const duplicatedNameOrEmail = await drizzlePool
      .select({
        firstName: employerTable.firstName,
        lastName: employerTable.lastName,
        email: employerTable.email,
      })
      .from(employerTable)
      .where(
        or(
          and(
            eq(employerTable.firstName, firstName),
            eq(employerTable.lastName, lastName)
          ),
          eq(employerTable.email, email)
        )
      );

    return duplicatedNameOrEmail[0];
  }

  // {login}
  async matchNameEmail(nameEmail: string): Promise<matchNameEmailType[]> {
    const users = await drizzlePool.query.employerTable.findMany({
      columns: { id: true, approvalStatus: true, password: true },
      where: or(
        eq(employerTable.username, nameEmail),
        eq(employerTable.email, nameEmail)
      ),
    });

    return users;
  }

  // insert new employer for oauth
  async oauthUserInsert(
    profile: Profile,
    provider: "GOOGLE" | "LINE"
  ): Promise<registerUserType> {
    let user: registerUserType[];
    // ***remove true***
    if (provider === "GOOGLE" || true) {
      user = await drizzlePool
        .insert(oauthEmployerTable)
        .values({
          firstName: profile._json.given_name as string,
          lastName: profile._json.family_name as string,
          email: profile._json.email as string,
          provider: "GOOGLE",
          providerId: profile.id,
          username: profile._json.given_name as string,
        })
        .returning({ id: oauthEmployerTable.id });
    } else {
    }

    // insert into registration approval
    await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "OAUTHEMPLOYER", oauthEmployerId: user[0].id });

    return user[0];
  }

  // update oauth employer, if profile is changed
  async oauthUserUpdate(
    profile: Profile,
    currentUser: employerType,
    provider: "GOOGLE" | "LINE"
  ): Promise<employerType> {
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
          .update(oauthEmployerTable)
          .set({
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            email: profile._json.email,
            profilePicture: profile._json.picture,
          })
          .where(eq(oauthEmployerTable.id, currentUser.id))
          .returning();
      }
    }

    // no updated done
    if (!updateUser) {
      return currentUser;
    }

    const user: employerType = updateUser[0] as employerType;
    return user;
  }

  // register employer
  async register(user: formattedSingleUserRegisterType) {
    const registeredUser = await drizzlePool
      .insert(employerTable)
      .values({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.firstName,
        email: user.email,
        password: user.hashedPassword,
      })
      .returning({ id: employerTable.id });

    //registration approval
    await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "EMPLOYER", employerId: registeredUser[0].id });

    return registeredUser[0];
  }

  //get by id
  async getById(
    idOrProviderId: string,
    getByProviderId?: boolean,
    provider?: "GOOGLE" | "LINE"
  ) {
    let user: employerType | undefined;
    if (!provider) {
      user = await drizzlePool.query.employerTable.findFirst({
        columns: { password: false, createdAt: false, updatedAt: false },
        where: eq(employerTable.id, idOrProviderId),
      });
    } else if (!getByProviderId) {
      user = await drizzlePool.query.oauthEmployerTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: eq(oauthEmployerTable.id, idOrProviderId),
      });
    } else {
      user = await drizzlePool.query.oauthEmployerTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: and(
          eq(oauthEmployerTable.providerId, idOrProviderId),
          eq(oauthEmployerTable.provider, provider)
        ),
      });
    }

    return user;
  }
}
