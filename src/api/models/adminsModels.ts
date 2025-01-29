import { eq, or } from "drizzle-orm";
import { drizzlePool } from "../../db/conn";
import { adminTable } from "../../db/schema";
import { adminModelInterfaces } from "../interfaces/userModelInterfaces";

export class adminModels implements adminModelInterfaces {
  static adminModel: adminModels | undefined;
  static instance() {
    if (!this.adminModel) {
      this.adminModel = new adminModels();
    }
    return this.adminModel;
  }

  async getById(
    id: string
  ): Promise<TJobSeeker | TEmployer | TCompany | TAdmin | undefined> {
    const user = await drizzlePool.query.adminTable.findFirst({
      columns: { password: false, createdAt: false, updatedAt: false },
      where: eq(adminTable.id, id),
    });

    return user as TAdmin | undefined;
  }

  async matchNameEmail(nameEmail: string): Promise<TMatchNameEmail[]> {
    const users = await drizzlePool.query.adminTable.findMany({
      columns: { id: true, password: true },
      where: or(
        eq(adminTable.username, nameEmail),
        eq(adminTable.email, nameEmail)
      ),
    });

    return users;
  }

  async create(username: string, hashedPassword: string): Promise<TAdmin> {
    const user = await drizzlePool
      .insert(adminTable)
      .values({ username: username, password: hashedPassword })
      .returning({ id: adminTable.id, username: adminTable.username });

    return user[0] as TAdmin;
  }

  async getCurrent() {}
}
