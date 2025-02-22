import { and, eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  employerTable,
  oauthEmployerTable,
  registrationApprovalTable,
} from "../../db/schema";
import "../types/usersTypes";
import {
  employerModelInterfaces,
  userModelInterfaces,
  userOauthModelInterfaces,
} from "../interfaces/userModelInterfaces";
import { Profile } from "passport-google-oauth20";
import { TApprovedRequest } from "../validators/usersValidator";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditPasswordResponse,
  TEditUsernameResponse,
} from "../types/editUserProfile";
import bcrypt from "bcryptjs";
import { saltRounds } from "../utilities/env";

export class employerModels implements employerModelInterfaces {
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
  async matchNameEmail(nameEmail: string): Promise<TMatchNameEmail[]> {
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
  ): Promise<TRegisterUser> {
    const loginUser = await drizzlePool
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

    // insert into registration approval
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "OAUTHEMPLOYER", oauthEmployerId: loginUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format registered user
    const registered: TRegisterUser = {
      userId: loginUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  // update oauth employer, if profile is changed
  async oauthUserUpdate(
    profile: Profile,
    currentUser: TEmployer,
    provider: "GOOGLE" | "LINE"
  ): Promise<TEmployer> {
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

    const user: TEmployer = updateUser[0] as TEmployer;
    return user;
  }

  // register employer
  async register(user: TFormattedSingleUserRegister) {
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
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "EMPLOYER", employerId: registeredUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format registered user
    const registered: TRegisterUser = {
      userId: registeredUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  //get by id
  async getById(
    idOrProviderId: string,
    getByProviderId?: boolean,
    provider?: "GOOGLE" | "LINE"
  ) {
    let user: TEmployer | undefined;
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

  // upload register image
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

  // user approved by admin
  async approved(
    user: TApprovingUser,
    isOauth: boolean
  ): Promise<TApproveUser> {
    let result: TApproveUser[];
    if (user.status === "APPROVED") {
      if (isOauth) {
        result = await drizzlePool
          .update(oauthEmployerTable)
          .set({ approvalStatus: user.status })
          .where(eq(oauthEmployerTable.id, user.id))
          .returning({ id: oauthEmployerTable.id });
      } else {
        result = await drizzlePool
          .update(employerTable)
          .set({ approvalStatus: user.status })
          .where(eq(employerTable.id, user.id))
          .returning({ id: employerTable.id });
      }
    } else {
      if (isOauth) {
        result = await drizzlePool
          .delete(oauthEmployerTable)
          .where(eq(oauthEmployerTable.id, user.id))
          .returning({ id: oauthEmployerTable.id });
      } else {
        result = await drizzlePool
          .delete(employerTable)
          .where(eq(employerTable.id, user.id))
          .returning({ id: employerTable.id });
      }
    }

    return result[0];
  }

  // check if approval id existed
  async approvalExisted(approvalId: string): Promise<boolean> {
    const approval =
      await drizzlePool.query.registrationApprovalTable.findFirst({
        columns: { id: true },
        where: eq(registrationApprovalTable.id, approvalId),
      });

    if (!approval) return false;

    return true;
  }

  // upload profile image and return link, no oauth
  async uploadProfilePicture(
    imageUrl: string,
    user: TGenericUserSession
  ): Promise<TProfileImage> {
    const formattedUser = user as TEmployerSession;

    await drizzlePool
      .update(employerTable)
      .set({ profilePicture: imageUrl })
      .where(eq(employerTable.id, formattedUser.id));

    return { url: imageUrl, userId: formattedUser.id };
  }

  // credentials auth only
  async editUsername(
    username: string,
    password: string,
    user: TGenericUserSession
  ): Promise<TEditUsernameResponse | null> {
    const formattedUser = user as TEmployerSession;
    // check for true duplicate
    const currentUserPassword = await drizzlePool.query.employerTable.findFirst(
      {
        columns: { password: true },
        where: eq(employerTable.id, user.id),
      }
    );

    // password check
    if (!currentUserPassword) {
      return null;
    }
    const passwordMatched = await bcrypt.compare(
      password,
      currentUserPassword.password
    );
    if (!passwordMatched) {
      return null;
    }

    // username is empty string
    if (username.length === 0) {
      return {
        userId: formattedUser.id,
        username: username,
        case: "empty username",
      };
    }

    // duplicate username check
    const dupedUsernames = await drizzlePool.query.employerTable.findMany({
      columns: { username: true, password: true },
      where: eq(employerTable.username, username),
    });

    // exact dupe check
    for (const dupedUsername of dupedUsernames) {
      const exactDuped = await bcrypt.compare(password, dupedUsername.password);

      if (exactDuped) {
        return {
          userId: user.id,
          username: dupedUsername.username,
          case: "exact dupe",
        };
      }
    }

    // no dupe
    await drizzlePool
      .update(employerTable)
      .set({ username: username })
      .where(eq(employerTable.id, user.id));
    return {
      userId: user.id,
      username: username,
    };
  }

  async editEmail(
    email: string,
    user: TGenericUserSession
  ): Promise<TEditEmailResponse | null> {
    // duplicate email check
    const dupeEmail = await drizzlePool.query.employerTable.findFirst({
      columns: { email: true },
      where: eq(employerTable.email, email),
    });

    if (dupeEmail) {
      return null;
    }

    // editable email
    await drizzlePool
      .update(employerTable)
      .set({ email: email })
      .where(eq(employerTable.id, user.id));

    return { email: email, userId: user.id };
  }

  async editFullName(
    firstName: string,
    lastName: string,
    user: TGenericUserSession
  ): Promise<TEditFullNameResponse | null> {
    const formattedUser = user as TEmployerSession;

    // check dupe
    const dupedName = await drizzlePool.query.employerTable.findFirst({
      columns: { firstName: true, lastName: true },
      where: and(
        eq(employerTable.firstName, firstName),
        eq(employerTable.lastName, lastName)
      ),
    });
    if (dupedName) {
      return null;
    }

    // no dupe
    await drizzlePool
      .update(employerTable)
      .set({ firstName: firstName, lastName: lastName })
      .where(eq(employerTable.id, formattedUser.id));

    return {
      userId: formattedUser.id,
      firstName: firstName,
      lastName: lastName,
    };
  }

  async editAbout(
    about: string,
    user: TGenericUserSession
  ): Promise<TEditAboutResponse | null> {
    const formattedUser = user as TEmployerSession;
    // new about is empty
    if (about.length === 0) {
      return null;
    }

    // oauth check
    if (formattedUser.isOauth) {
      await drizzlePool
        .update(oauthEmployerTable)
        .set({ aboutMe: about })
        .where(eq(oauthEmployerTable.id, formattedUser.id));
    } else {
      await drizzlePool
        .update(employerTable)
        .set({ aboutMe: about })
        .where(eq(employerTable.id, formattedUser.id));
    }

    return { userId: formattedUser.id, about: about };
  }

  async editAddress(
    address: string,
    provinceAddress: string,
    user: TGenericUserSession
  ): Promise<TEditAddressResponse | null> {
    const formattedUser = user as TEmployerSession;

    // check empty string
    if (address.length === 0 || provinceAddress.length === 0) {
      return null;
    }

    // oauth check
    if (formattedUser.isOauth) {
      await drizzlePool
        .update(oauthEmployerTable)
        .set({ address: address, provinceAddress: provinceAddress })
        .where(eq(oauthEmployerTable.id, formattedUser.id));
    } else {
      await drizzlePool
        .update(employerTable)
        .set({ address: address, provinceAddress: provinceAddress })
        .where(eq(employerTable.id, formattedUser.id));
    }

    return {
      userId: formattedUser.id,
      address: address,
      provinceAddress: provinceAddress,
    };
  }

  async editContact(
    contact: string,
    user: TGenericUserSession
  ): Promise<TEditContactResponse | null> {
    const formattedUser = user as TEmployerSession;

    // contact empty string
    if (contact.length === 0) {
      return null;
    }

    // oauth check
    if (formattedUser.isOauth) {
      await drizzlePool
        .update(oauthEmployerTable)
        .set({ contact: contact })
        .where(eq(oauthEmployerTable.id, formattedUser.id));
    } else {
      await drizzlePool
        .update(employerTable)
        .set({ contact: contact })
        .where(eq(employerTable.id, formattedUser.id));
    }

    return { userId: formattedUser.id, contact: contact };
  }

  async editPassword(
    password: string,
    oldPassword: string,
    user: TGenericUserSession
  ): Promise<TEditPasswordResponse | null> {
    const formattedUser = user as TEmployerSession;

    // empty string check
    if (password.length === 0) {
      return null;
    }

    // old password check
    const userPassword = await drizzlePool.query.employerTable.findFirst({
      columns: { password: true },
      where: eq(employerTable.id, formattedUser.id),
    });
    if (!userPassword) {
      console.error("***No user found***");
      return {
        userId: formattedUser.id,
        case: "no user",
      };
    }
    const correct = await bcrypt.compare(oldPassword, userPassword.password);
    if (!correct) {
      return {
        userId: formattedUser.id,
        case: "wrong password",
      };
    }

    // dupe check
    const dupedUsernames = await drizzlePool.query.employerTable.findMany({
      columns: { username: true, password: true },
      where: eq(employerTable.username, formattedUser.username),
    });
    for (const du of dupedUsernames) {
      const exactMatch = await bcrypt.compare(password, du.password);

      if (exactMatch) {
        return {
          userId: formattedUser.id,
          case: "exactDupe",
        };
      }
    }

    // password changeable
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await drizzlePool
      .update(employerTable)
      .set({ password: hashedPassword })
      .where(eq(employerTable.id, formattedUser.id));

    return { userId: formattedUser.id };
  }
}
