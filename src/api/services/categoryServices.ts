import { jobCategoryTable } from "../../db/schema";
import { categoryType } from "../schemas/requestBodySchema";  
import { BaseEntity, Services } from "./services";

// Extend BaseEntity with additional fields specific to job categories
type TJobCategory = BaseEntity & {
  name: string;
  description: string | null;
};

export class categoryServices extends Services<TJobCategory, categoryType> {
  private constructor() {
    super(jobCategoryTable);
  }

  static instance(): categoryServices {
    return Services.getInstance.call(categoryServices);
  }
}
