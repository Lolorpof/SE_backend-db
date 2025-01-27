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
/**
 * @openapi/api/post/hiring:
 *   post:
 *     tags:
 *       - Jobs
 *     summary: Create a new job hiring post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - jobLocation
 *               - salary
 *               - workDates
 *               - workHoursRange
 *               - hiredAmount
 *               - skills
 *               - jobCategories
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "Looking for an experienced developer"
 *               jobLocation:
 *                 type: string
 *                 example: "Bangkok"
 *               salary:
 *                 type: number
 *                 example: 50000
 *               workDates:
 *                 type: string
 *                 example: "Monday-Friday"
 *               workHoursRange:
 *                 type: string
 *                 example: "9:00-18:00"
 *               hiredAmount:
 *                 type: number
 *                 example: 2
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               jobCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Job post created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
postRoutes
  .route('/hiring')
  .post(validateData(createJobHiringPostSchema), createJobHiringPost);

// Job finding routes  
postRoutes
  .route('/finding')
  .get(validateData(getFindEmpSchema), handleGetEmp);

// Job seeker routes
postRoutes
  .route('/seeker')
  .get(validateData(getJobSeekerSchema), handleGetJobSeeker);

export default postRoutes;
