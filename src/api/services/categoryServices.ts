import { jobCategoryTable } from "../../db/schema";
import { categoryType } from "../schemas/requestBodySchema";  
import { BaseEntity, Services } from "./services";

type TJobCategory = BaseEntity;

export class categoryServices extends Services<TJobCategory, categoryType> {
  private constructor() {
    super(jobCategoryTable);
  }

  static instance(): categoryServices {
    return Services.getInstance.call(categoryServices);
  }
}
