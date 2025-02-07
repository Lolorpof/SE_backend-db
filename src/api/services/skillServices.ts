import { skillTable } from "../../db/schema";
import { skillType } from "../schemas/requestBodySchema";
import { BaseEntity, Services } from "./services";

// Extend BaseEntity with additional fields specific to skills
type TSkill = BaseEntity & {
  name: string;
  description: string | null;
};

export class skillServices extends Services<TSkill, skillType> {
  private constructor() {
    super(skillTable);
  }

  static instance(): skillServices {
    return Services.getInstance.call(skillServices);
  }
}
