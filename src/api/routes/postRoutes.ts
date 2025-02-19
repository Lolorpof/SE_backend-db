import { Router } from "express";
import { validateData } from "../middlewares/validationMiddleware";
import {
  jobPostSchema,
  jobFindingPostSchema,
  getAllJobPostsSchema,
  validUidSchema,
  dummySchema,
} from "../schemas/requestBodySchema";
import {
  dummyHandler,
  handleCreateJobPostFromCompany,
  handleCreateJobPostFromEmp,
  handleDeleteJobPost,
  handleGetAllJobPosts,
  handleGetJobPost,
  handleUpdateJobPost,
  handleCreateJobFindingPost,
  handleGetAllJobFindingPosts,
  handleGetJobFindingPost,
  handleUpdateJobFindingPost,
  handleDeleteJobFindingPost,
  handleGetEmployerJobPosts,
  handleGetCompanyJobPosts,
  handleGetUserJobFindingPosts,
} from "../controllers/postController";
import { checkAuthenticated } from "../middlewares/auth";
import { checkEmployer, checkCompany } from "../middlewares/rolesChecker";
const postRoutes = Router();

// Job hiring routes
postRoutes.route('/job-posts/employer')
  .post(validateData(jobPostSchema), checkAuthenticated,checkEmployer, handleCreateJobPostFromEmp);

postRoutes.route('/job-posts/company')
  .post(validateData(jobPostSchema), checkAuthenticated,checkCompany, handleCreateJobPostFromCompany);

postRoutes.route('/job-posts')
  .get(validateData(getAllJobPostsSchema), handleGetAllJobPosts);

postRoutes
  .route('/job-posts/:id')
  .get(handleGetJobPost)
  .put(validateData(jobPostSchema),checkAuthenticated, handleUpdateJobPost)
  .delete(validateData(dummySchema),checkAuthenticated, handleDeleteJobPost);

postRoutes.route('/user/job-posts')
  .get(checkEmployer, handleGetEmployerJobPosts);

postRoutes.route('/company/job-posts')
  .get(checkCompany, handleGetCompanyJobPosts);

postRoutes.route('/user/finding-posts')
  .get(handleGetUserJobFindingPosts);

postRoutes
  .route('/finding-posts')
  .get(validateData(getAllJobPostsSchema), handleGetAllJobFindingPosts)
  .post(validateData(jobFindingPostSchema), checkAuthenticated, handleCreateJobFindingPost);

postRoutes
  .route('/finding-posts/:id')
  .get(handleGetJobFindingPost)
  .put(validateData(jobFindingPostSchema), checkAuthenticated, handleUpdateJobFindingPost)
  .delete(checkAuthenticated, handleDeleteJobFindingPost);

export default postRoutes; 
