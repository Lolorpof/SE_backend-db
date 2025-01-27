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
 * @openapi
 * /api/post/hiring:
 *   post:
 *     tags:
 *       - Post
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

/**
 * @openapi
 * /api/post/finding:
 *   get:
 *     tags:
 *       - Post
 *     summary: Get job finding posts with filters
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by job title
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province
 *       - in: query
 *         name: jobLocation
 *         schema:
 *           type: string
 *         description: Filter by job location
 *       - in: query
 *         name: salaryRange
 *         schema:
 *           type: string
 *         description: Filter by salary range (JSON string with min and max)
 *         example: '{"min": 30000, "max": 50000}'
 *       - in: query
 *         name: workHoursRange
 *         schema:
 *           type: string
 *         description: Filter by work hours range
 *     responses:
 *       200:
 *         description: Successfully retrieved job finding posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       jobLocation:
 *                         type: string
 *                       expectedSalary:
 *                         type: number
 *                       workDates:
 *                         type: string
 *                       workHoursRange:
 *                         type: string
 *                       status:
 *                         type: string
 *                       jobSeekerType:
 *                         type: string
 *                       jobSeekerName:
 *                         type: string
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
postRoutes
  .route('/finding')
  .get(validateData(getFindEmpSchema), handleGetEmp);

/**
 * @openapi
 * /api/post/seeker:
 *   get:
 *     tags:
 *       - Post
 *     summary: Get job hiring posts for job seekers with filters
 *     parameters:
 *       - in: query
 *         name: officialName
 *         schema:
 *           type: string
 *         description: Filter by company name
 *       - in: query
 *         name: jobCategories
 *         schema:
 *           type: string
 *         description: Comma-separated list of job category IDs
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated list of skill IDs
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province
 *       - in: query
 *         name: jobLocation
 *         schema:
 *           type: string
 *         description: Filter by job location
 *       - in: query
 *         name: salaryRange
 *         schema:
 *           type: string
 *         description: Filter by salary range (JSON string with min and max)
 *         example: '{"min": 30000, "max": 50000}'
 *       - in: query
 *         name: workHoursRange
 *         schema:
 *           type: string
 *         description: Filter by work hours range
 *     responses:
 *       200:
 *         description: Successfully retrieved job hiring posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       jobLocation:
 *                         type: string
 *                       salary:
 *                         type: number
 *                       workDates:
 *                         type: string
 *                       workHoursRange:
 *                         type: string
 *                       hiredAmount:
 *                         type: number
 *                       companyName:
 *                         type: string
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
postRoutes
  .route('/seeker')
  .get(validateData(getJobSeekerSchema), handleGetJobSeeker);

export default postRoutes;
