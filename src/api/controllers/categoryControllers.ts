import { categoryServices } from "../services/categoryServices";
import { BaseEntity } from "../services/services";
import { categoryType } from "../schemas/requestBodySchema";
import { Controllers } from "./controllers";

type TJobCategory = BaseEntity;

class CategoryControllers extends Controllers<TJobCategory, categoryType, categoryServices> {
  protected constructor() {
    super(categoryServices.instance());
  }

  static instance(): CategoryControllers {
    return Controllers.getInstance.call(CategoryControllers);
  }
}

// Create a single instance
const controller = CategoryControllers.instance();

// Export bound methods
export const getAllCategories = controller.getAll.bind(controller);
export const getCategoryById = controller.getById.bind(controller);
export const createCategory = controller.create.bind(controller);
export const updateCategory = controller.update.bind(controller);
export const deleteCategory = controller.delete.bind(controller); 