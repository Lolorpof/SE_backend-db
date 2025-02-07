import { Router } from "express";
import { categoryServices } from "../services/categoryServices";
import { categorySchema } from "../schemas/requestBodySchema";
import { validateData } from "../middlewares/validationMiddleware";
import { checkAuthenticated } from "../middlewares/auth";
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/categoryControllers";
import { checkAdmin } from "../middlewares/rolesChecker";


const categoryRoutes = Router();

categoryRoutes.route('/')
  .get(checkAuthenticated, getAllCategories)
  .post(checkAuthenticated, checkAdmin, validateData(categorySchema), createCategory);
categoryRoutes.route('/:id')
  .get(checkAuthenticated, getCategoryById)
  .put(checkAuthenticated, checkAdmin, validateData(categorySchema), updateCategory)
  .delete(checkAuthenticated, checkAdmin, deleteCategory);

export default categoryRoutes;  