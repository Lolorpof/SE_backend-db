import { Router } from "express";
import { skillServices } from "../services/skillServices";
import { skillSchema } from "../schemas/requestBodySchema";
import { validateData } from "../middlewares/validationMiddleware";
import { checkAuthenticated } from "../middlewares/auth";
import { checkAdmin } from "../middlewares/rolesChecker";
import { getAllSkills, getSkillById, createSkill, updateSkill, deleteSkill } from "../controllers/skillControllers";

const skillRoutes = Router();

skillRoutes.route('/')
  .get(checkAuthenticated, getAllSkills)
  .post(checkAuthenticated, checkAdmin, validateData(skillSchema), createSkill);
skillRoutes.route('/:id')
  .get(checkAuthenticated, getSkillById)
  .put(checkAuthenticated, checkAdmin, validateData(skillSchema), updateSkill)
  .delete(checkAuthenticated, checkAdmin, deleteSkill);

export default skillRoutes;













