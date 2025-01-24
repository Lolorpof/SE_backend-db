import { drizzlePool } from "../../db/conn";
import { jobSeekerTable } from "../../db/schema";

export class Models<T> {
  // boilerplate
  private static ModelsInstances: Map<string, Models<any>> = new Map();
  private table: string;

  private constructor(table: string) {
    this.table = table;
  }

  static instances<T>(table: string): Models<T> {
    if (!this.ModelsInstances.get(table)) {
      this.ModelsInstances.set(table, new Models(table));
    }
    return this.ModelsInstances.get(table) as Models<T>;
  }

  // real part
  // get all
  async getAll() {
    let result;
    if (this.table === "jobSeeker") {
      result = await drizzlePool.query.jobSeekerTable.findMany({
        columns: {
          id: false,
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
    }

    return result;
  }

  // getUser
  async getUser(id: string) {}
}
