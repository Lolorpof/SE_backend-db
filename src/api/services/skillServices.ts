import { drizzlePool } from "../../db/conn";
import { SerivcesResponse } from "../types/responseTypes";
import { skillTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { skillType } from "../schemas/requestBodySchema";
import { BaseEntity, Services } from "./services";

type TSkill = BaseEntity;

export class skillServices extends Services<TSkill, skillType> {
  private constructor() {
    super(skillTable);
  }

  static instance(): skillServices {
    return Services.getInstance.call(skillServices);
  }

  async getAllSkills(): Promise<SerivcesResponse<TSkill[]>> {
    return this.getAll();
  }

  async getSkillById(id: string): Promise<SerivcesResponse<TSkill>> {
    return this.getById(id);
  }

  async createSkill(skill: skillType): Promise<SerivcesResponse<TSkill>> {
    return this.create(skill);
  }

  async updateSkill(id: string, skill: skillType): Promise<SerivcesResponse<TSkill>> {
    return this.update(id, skill);
  }

  async deleteSkill(id: string): Promise<SerivcesResponse<TSkill>> {
    return this.delete(id);
  }
}
