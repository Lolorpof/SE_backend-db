import { Router } from "express";
import { validateData } from "../middleware/validationMiddleware";
import {
  getFindEmpSchema,
  createJobHiringPostSchema,
  getJobSeekerSchema,
} from "../schemas/api-schema";
import {
  handleGetEmp,
  createJobHiringPost,
  handleGetJobSeeker,
} from "../controllers/postController";

const postRoutes = Router();

// Job hiring routes
postRoutes.post(
  "/postemp",
  validateData(createJobHiringPostSchema),
  createJobHiringPost
);

// Legacy routes - consider updating these names to be more RESTful
postRoutes.get("/findemp", validateData(getFindEmpSchema), handleGetEmp);
postRoutes.get(
  "/jobseeker",
  validateData(getJobSeekerSchema),
  handleGetJobSeeker
);

export default postRoutes;
