import { skillServices } from "../services/skillServices";
import { BaseEntity } from "../services/services";
import { skillType } from "../schemas/requestBodySchema";
import { Controllers } from "./controllers";

type TSkill = BaseEntity;

class SkillControllers extends Controllers<TSkill, skillType, skillServices> {
  protected constructor() {
    super(skillServices.instance());
  }

  static instance(): SkillControllers {
    return Controllers.getInstance.call(SkillControllers);
  }
}

// Create a single instance
const controller = SkillControllers.instance();

// Export bound methods
export const getAllSkills = controller.getAll.bind(controller);
export const getSkillById = controller.getById.bind(controller);
export const createSkill = controller.create.bind(controller);
export const updateSkill = controller.update.bind(controller);
export const deleteSkill = controller.delete.bind(controller);






