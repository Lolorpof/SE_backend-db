import { Router } from "express";
import { validateData } from "../middleware/validationMiddleware";
import {
  getFindEmpSchema,
  createJobHiringPostSchema,
} from "../schemas/api-schema";
import { handleGetEmp, handlePost } from "../controllers/postController";

const postRoutes = Router();

postRoutes.get("/findemp", validateData(getFindEmpSchema), handleGetEmp);
postRoutes.post(
  "/postemp",
  validateData(createJobHiringPostSchema),
  handlePost
);
postRoutes.get("/jobseeker", validateData(getFindEmpSchema), handleGetEmp);

export default postRoutes;
