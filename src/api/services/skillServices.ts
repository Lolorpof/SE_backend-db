import { skillTable } from "../../db/schema";
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
}
