import { eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import { companyTable, registrationApprovalTable } from "../../db/schema";
import { userModelInterfaces } from "../interfaces/userModelInterfaces";
import { TApprovedRequest } from "../validators/usersValidator";

export class companyModels implements userModelInterfaces {
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
    await drizzlePool
      .insert(registrationApprovalTable)
      .values({ userType: "COMPANY", companyId: registeredUser[0].id });

    return registeredUser[0];
  }

  // get by id
  async getById(id: string) {
    const user = await drizzlePool.query.companyTable.findFirst({
      columns: { password: false, createdAt: false, updatedAt: false },
      where: eq(companyTable.id, id),
    });

    return user as TCompany | undefined;
  }

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
}
