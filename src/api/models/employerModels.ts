import { and, eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import {
  employerTable,
  oauthEmployerTable,
  registrationApprovalTable,
} from "../../db/schema";
import "../types/usersTypes";
import { userModelInterfaces } from "../interfaces/userModelInterfaces";

export class employerModels implements userModelInterfaces {
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
  async getById(id: string, isOauth: boolean) {
    let user: employerType | undefined;
    if (!isOauth) {
      user = await drizzlePool.query.employerTable.findFirst({
        columns: { password: false, createdAt: false, updatedAt: false },
        where: eq(employerTable.id, id),
      });
    } else {
      user = await drizzlePool.query.oauthEmployerTable.findFirst({
        columns: { createdAt: false, updatedAt: false },
        where: eq(oauthEmployerTable.id, id),
      });
    }

    return user;
  }
}
