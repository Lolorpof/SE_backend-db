import { and, eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  companyTable,
  registrationApprovalRelation,
  registrationApprovalTable,
} from "../../db/schema";
import {
  companyModelInterfaces,
  userModelInterfaces,
} from "../interfaces/userModelInterfaces";
import { TApprovedRequest } from "../validators/usersValidator";
import {
  TEditAboutResponse,
  TEditAddressResponse,
  TEditContactResponse,
  TEditEmailResponse,
  TEditFullNameResponse,
  TEditOfficialNameResponse,
  TEditPasswordResponse,
} from "../types/editUserProfile";
import bcrypt from "bcryptjs";
import { saltRounds } from "../utilities/env";

export class companyModels implements companyModelInterfaces {
  // singleton design
  private static companyModel: companyModels | undefined;
  static instance() {
    if (!this.companyModel) {
      this.companyModel = new companyModels();
    }
    return this.companyModel;
  }

  // check for same name or email
  async duplicateNameEmail(officialName: string, email: string) {
    // getting duplicated name or email
    const duplicatedNameOrEmail = await drizzlePool
      .select({
        officialName: companyTable.officialName,
        email: companyTable.email,
      })
      .from(companyTable)
      .where(
        or(
          eq(companyTable.officialName, officialName),
          eq(companyTable.email, email)
        )
      );

    return duplicatedNameOrEmail[0];
  }

  // get users with matched name or email
  async matchNameEmail(nameEmail: string): Promise<TMatchNameEmail[]> {
    const users = await drizzlePool.query.companyTable.findMany({
      columns: { id: true, approvalStatus: true, password: true },
      where: or(
        eq(companyTable.officialName, nameEmail),
        eq(companyTable.email, nameEmail)
      ),
    });

    return users;
  }

  async register(user: TFormattedCompanyRegister) {
    const registeredUser = await drizzlePool
      .insert(companyTable)
      .values({
        officialName: user.officialName,
        email: user.email,
        password: user.hashedPassword,
      })
      .returning({ id: companyTable.id });

    //registration approval
    const registeredApproval = await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "COMPANY", companyId: registeredUser[0].id })
      .returning({ id: registrationApprovalTable.id });

    // format registered user
    const registered: TRegisterUser = {
      userId: registeredUser[0].id,
      approvalId: registeredApproval[0].id,
    };

    return registered;
  }

  // get by id
  async getById(id: string) {
    const user = await drizzlePool.query.companyTable.findFirst({
      columns: { password: false, createdAt: false, updatedAt: false },
      where: eq(companyTable.id, id),
    });

    return user as TCompany | undefined;
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
  async approved(user: TApprovingUser): Promise<TApproveUser> {
    let result: TApproveUser[];
    if (user.status === "APPROVED") {
      result = await drizzlePool
        .update(companyTable)
        .set({ approvalStatus: user.status })
        .where(eq(companyTable.id, user.id))
        .returning({ id: companyTable.id });
    } else {
      result = await drizzlePool
        .delete(companyTable)
        .where(eq(companyTable.id, user.id))
        .returning({ id: companyTable.id });
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
    const formattedUser = user as TCompanySession;

    await drizzlePool
      .update(companyTable)
      .set({ profile_picture: imageUrl })
      .where(eq(companyTable.id, formattedUser.id));

    return { url: imageUrl, userId: formattedUser.id };
  }

  // credentials auth only
  async editOfficialName(
    officialName: string,
    password: string,
    user: TGenericUserSession
  ): Promise<TEditOfficialNameResponse | null> {
    const formattedUser = user as TCompanySession;
    // check for true duplicate
    const currentUserPassword = await drizzlePool.query.companyTable.findFirst({
      columns: { password: true },
      where: eq(companyTable.id, user.id),
    });

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
    if (officialName.length === 0) {
      return {
        userId: formattedUser.id,
        officialName: officialName,
        case: "empty username",
      };
    }

    // duplicate username check
    const dupedOfficialnames = await drizzlePool.query.companyTable.findMany({
      columns: { officialName: true, password: true },
      where: eq(companyTable.officialName, officialName),
    });

    // exact dupe check
    for (const dupedOfficialname of dupedOfficialnames) {
      const exactDuped = await bcrypt.compare(
        password,
        dupedOfficialname.password
      );

      if (exactDuped) {
        return {
          userId: user.id,
          officialName: dupedOfficialname.officialName,
          case: "exact dupe",
        };
      }
    }

    // no dupe
    await drizzlePool
      .update(companyTable)
      .set({ officialName: officialName })
      .where(eq(companyTable.id, user.id));
    return {
      userId: user.id,
      officialName: officialName,
    };
  }

  async editEmail(
    email: string,
    user: TGenericUserSession
  ): Promise<TEditEmailResponse | null> {
    // duplicate email check
    const dupeEmail = await drizzlePool.query.companyTable.findFirst({
      columns: { email: true },
      where: eq(companyTable.email, email),
    });

    if (dupeEmail) {
      return null;
    }

    // editable email
    await drizzlePool
      .update(companyTable)
      .set({ email: email })
      .where(eq(companyTable.id, user.id));

    return { email: email, userId: user.id };
  }

  async editAbout(
    about: string,
    user: TGenericUserSession
  ): Promise<TEditAboutResponse | null> {
    const formattedUser = user as TCompanySession;
    // new about is empty
    if (about.length === 0) {
      return null;
    }

    await drizzlePool
      .update(companyTable)
      .set({ aboutUs: about })
      .where(eq(companyTable.id, formattedUser.id));

    return { userId: formattedUser.id, about: about };
  }

  async editAddress(
    address: string,
    provinceAddress: string,
    user: TGenericUserSession
  ): Promise<TEditAddressResponse | null> {
    const formattedUser = user as TCompanySession;

    // check empty string
    if (address.length === 0 || provinceAddress.length === 0) {
      return null;
    }

    await drizzlePool
      .update(companyTable)
      .set({ address: address, provinceAddress: provinceAddress })
      .where(eq(companyTable.id, formattedUser.id));

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
    const formattedUser = user as TCompanySession;

    // contact empty string
    if (contact.length === 0) {
      return null;
    }

    await drizzlePool
      .update(companyTable)
      .set({ contact: contact })
      .where(eq(companyTable.id, formattedUser.id));

    return { userId: formattedUser.id, contact: contact };
  }

  async editPassword(
    password: string,
    oldPassword: string,
    user: TGenericUserSession
  ): Promise<TEditPasswordResponse | null> {
    const formattedUser = user as TCompanySession;

    // empty string check
    if (password.length === 0) {
      return null;
    }

    // old password check
    const userPassword = await drizzlePool.query.companyTable.findFirst({
      columns: { password: true },
      where: eq(companyTable.id, formattedUser.id),
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
    const dupedOfficialnames = await drizzlePool.query.companyTable.findMany({
      columns: { officialName: true, password: true },
      where: eq(companyTable.officialName, formattedUser.officialName),
    });
    for (const du of dupedOfficialnames) {
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
      .update(companyTable)
      .set({ password: hashedPassword })
      .where(eq(companyTable.id, formattedUser.id));

    return { userId: formattedUser.id };
  }
}
