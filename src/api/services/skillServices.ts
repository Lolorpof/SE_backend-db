import { drizzlePool } from "../../db/conn";
import { skillTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { skillType } from "../schemas/requestBodySchema";
type TSkill = {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

export class skillServices {
  private static skillService: skillServices | undefined;
  static instance() {
    if (!skillServices.skillService) {
      skillServices.skillService = new skillServices();
    }
    return skillServices.skillService;
  }

  async getAllSkills(): Promise<SerivcesResponse<TSkill[]>> {
    try {
      const skills: TSkill[] = await drizzlePool.select().from(skillTable);
      return { success: true, status: 200, msg: "Skills fetched successfully", data: skills };
    } catch (error) {
      console.error("Error fetching skills:", error);
      return { success: false, status: 500, msg: "Failed to fetch skills" };
    }
  }
  async getSkillById(id: string): Promise<SerivcesResponse<TSkill>> {
    try {
      const [skill]: TSkill[] = await drizzlePool.select().from(skillTable).where(eq(skillTable.id, id));
      return { success: true, status: 200, msg: "Skill fetched successfully", data: skill };
    }catch(error){
      console.error("Error fetching skill by id:", error);
      return { success: false, status: 500, msg: "Failed to fetch skill by id" };
    }
  }
  async createSkill(skill: skillType): Promise<SerivcesResponse<TSkill>> {
    try {
      const [newSkill]: TSkill[] = await drizzlePool.insert(skillTable).values(skill).returning();
      return { success: true, status: 201, msg: "Skill created successfully", data: newSkill };

    }catch(error){
      console.error("Error creating skill:", error);
      return { success: false, status: 500, msg: "Failed to create skill" };
    }
  }
  async updateSkill(id: string, skill: skillType): Promise<SerivcesResponse<TSkill>> {
    try {
      const [updatedSkill]: TSkill[] = await drizzlePool.update(skillTable).set(skill).where(eq(skillTable.id, id)).returning();
      return { success: true, status: 200, msg: "Skill updated successfully", data: updatedSkill };
    }catch(error){
      console.error("Error updating skill:", error);
      return { success: false, status: 500, msg: "Failed to update skill" };
    }
  }
  async deleteSkill(id: string): Promise<SerivcesResponse<TSkill>> {
    try {
      await drizzlePool.delete(skillTable).where(eq(skillTable.id, id));
      return { success: true, status: 200, msg: "Skill deleted successfully" };
    }catch(error){
      console.error("Error deleting skill:", error);
      return { success: false, status: 500, msg: "Failed to delete skill" };
    }
  }
}
