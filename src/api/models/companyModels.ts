import { and, eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  companyTable,
  oauthCompanyTable,
  registrationApprovalTable,
} from "../../db/schema";

export class companyModels {
  // singleton design
  private static companyModel: companyModels | undefined;
  static instance() {
    if (!this.companyModel) {
      this.companyModel = new companyModels();
    }
    return this.companyModel;
  }

  async duplicatedCompanyCheck(officialName: string, email: string) {
    // getting duplicated name or email
    const duplicatedNameOrEmail = await drizzlePool
      .select({
        officialName: companyTable.officialName,
        email: companyTable.email,
      })
      .from(companyTable)
      .where(
        or(
          and(eq(companyTable.officialName, officialName)),
          eq(companyTable.email, email)
        )
      );

    return duplicatedNameOrEmail[0];
  }

  async register(user: formattedCompanyRegisterType) {
    const registeredUser = await drizzlePool
      .insert(companyTable)
      .values({
        officialName: user.officialName,
        email: user.email,
        password: user.hashedPassword,
      })
      .returning({ id: companyTable.id });

    //registration approval
    await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "COMPANY", companyId: registeredUser[0].id });

    return registeredUser[0];
  }

  // get by id
  async getById(id: string, isOauth: boolean) {
    let user: companyType | undefined;
    if (!isOauth) {
      user = await drizzlePool.query.companyTable.findFirst({
        columns: { password: false, createdAt: false, updatedAt: false },
        where: eq(companyTable.id, id),
        with: {},
      });
    } else {
      user = await drizzlePool.query.oauthCompanyTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: eq(oauthCompanyTable.id, id),
        with: {},
      });
    }

    return user;
  }
}
