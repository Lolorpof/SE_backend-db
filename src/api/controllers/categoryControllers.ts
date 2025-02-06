import { Request, Response } from "express";
import { categoryServices } from "../services/categoryServices";
import { BaseEntity } from "../services/services";
import { categoryType } from "../schemas/requestBodySchema";
import { Controllers } from "./controllers";

type TJobCategory = BaseEntity;

export class categoryControllers extends Controllers<TJobCategory, categoryType, categoryServices> {
  private constructor() {
    super(categoryServices.instance());
  }

  static instance(): categoryControllers {
    return Controllers.getInstance.call(categoryControllers);
  }

  async getAllCategories(req: Request, res: Response) {
    return this.getAll(req, res);
  }

  async getCategoryById(req: Request, res: Response) {
    return this.getById(req, res);
  }

  async createCategory(req: Request, res: Response) {
    return this.create(req, res);
  }

  async updateCategory(req: Request, res: Response) {
    return this.update(req, res);
  }

  async deleteCategory(req: Request, res: Response) {
    return this.delete(req, res);
  }
}

export const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = categoryControllers.instance(); 