import { Router } from "express";
import { validateData } from "../middleware/validationMiddleware";
import { getFindEmpSchema } from "../schemas/api-schema";
import { handleGetEmp } from "../controllers/postController";

const postRoutes = Router();

postRoutes.get("/findemp", validateData(getFindEmpSchema), handleGetEmp);

export default postRoutes;
