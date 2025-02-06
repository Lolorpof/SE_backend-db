import { Request, Response } from "express";
import { skillServices } from "../services/skillServices";
import { BaseEntity } from "../services/services";
import { skillType } from "../schemas/requestBodySchema";
import { Controllers } from "./controllers";

type TSkill = BaseEntity;

export class skillControllers extends Controllers<TSkill, skillType, skillServices> {
  private constructor() {
    super(skillServices.instance());
  }

  static instance(): skillControllers {
    return Controllers.getInstance.call(skillControllers);
  }

  async getAllSkills(req: Request, res: Response) {
    return this.getAll(req, res);
  }

  async getSkillById(req: Request, res: Response) {
    return this.getById(req, res);
  }

  async createSkill(req: Request, res: Response) {
    return this.create(req, res);
  }

  async updateSkill(req: Request, res: Response) {
    return this.update(req, res);
  }

  async deleteSkill(req: Request, res: Response) {
    return this.delete(req, res);
  }
}

export const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} = skillControllers.instance();






