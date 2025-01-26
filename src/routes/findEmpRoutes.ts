import { Router } from "express";
import { validateData } from "../middleware/validationMiddleware";
import { getFindEmpSchema } from "../schemas/api-schema";
import { handleGet } from "../controllers/findEmpController";

const findEmpRoutes = Router();

findEmpRoutes.get("/", validateData(getFindEmpSchema), handleGet);

export default findEmpRoutes;
