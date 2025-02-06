import { drizzlePool as db } from "../../db/conn";
import { jobCategoryTable } from "../../db/schema";
import { categoryType } from "../schemas/requestBodySchema";
import { SerivcesResponse } from "../types/responseTypes";
import { BaseEntity, Services } from "./services";

type TJobCategory = BaseEntity;

export class categoryServices extends Services<TJobCategory, categoryType> {
  private constructor() {
    super(jobCategoryTable);
  }

  static instance(): categoryServices {
    return Services.getInstance.call(categoryServices);
  }

  async getAll(): Promise<SerivcesResponse<TJobCategory[]>> {
    return super.getAll();
  }

  async getById(id: string): Promise<SerivcesResponse<TJobCategory>> {
    return super.getById(id);
  }

  async create(categoryData: categoryType): Promise<SerivcesResponse<TJobCategory>> {
    return super.create(categoryData);
  }

  async update(id: string, categoryData: categoryType): Promise<SerivcesResponse<TJobCategory>> {
    return super.update(id, categoryData);
  }

  async delete(id: string): Promise<SerivcesResponse<TJobCategory>> {
    return super.delete(id);
  }
}
