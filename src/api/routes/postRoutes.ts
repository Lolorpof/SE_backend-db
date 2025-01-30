import { Router } from "express";
import { validateData } from "../middlewares/validationMiddleware";
import {
  jobPostSchema,
  dummySchema,
  getAllJobPostsSchema,
} from "../schemas/api-schema";
import {
  dummyHandler,
  handleCreateJobPostFromCompany,
  handleCreateJobPostFromEmp,
  handleGetAllJobPosts,
  handleGetJobPost,
  handleUpdateJobPost,
} from "../controllers/postController";
import { checkAuthenticated } from "../middlewares/auth";

const postRoutes = Router();

// Job hiring routes
/**
 * @openapi
 * /api/post/job-posts/employer:
 *   post:
 *     tags:
 *       - Job Post from Employer
 *     summary: Create a new job post as an employer
 *     security:
 *       - sessionAuth: []
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
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 maxLength: 540
 *                 example: "Looking for an experienced developer"
 *               jobLocation:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Bangkok"
 *               salary:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50000
 *               workDates:
 *                 type: string
 *                 maxLength: 1024
 *                 example: "Monday-Friday"
 *               workHoursRange:
 *                 type: string
 *                 maxLength: 255
 *                 example: "9:00-18:00"
 *               hiredAmount:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Job post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     jobLocation:
 *                       type: string
 *                     salary:
 *                       type: integer
 *                     workDates:
 *                       type: string
 *                     workHoursRange:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: ["UNMATCHED", "MATCHED", "MATCHED_INPROG"]
 *                     hiredAmount:
 *                       type: integer
 *                     jobHirerType:
 *                       type: string
 *                       enum: ["EMPLOYER", "OAUTHEMPLOYER", "COMPANY"]
 *                     employerId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     oauthEmployerId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     companyId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: "Job hiring post created successfully"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create job hiring post"
 */
postRoutes.route('/job-posts/employer')
  .post(validateData(jobPostSchema), checkAuthenticated, handleCreateJobPostFromEmp);

postRoutes.route('/job-posts/company')
  .post(validateData(jobPostSchema), checkAuthenticated, handleCreateJobPostFromCompany);
/**
 * @openapi
 * /api/post/job-posts:
 *   get:
 *     tags:
 *       - Job Post from Employer
 *     summary: Get all job posts with filtering, sorting, and pagination
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by job title (case-insensitive partial match)
 *       - in: query
 *         name: provinces
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Filter by multiple provinces
 *       - in: query
 *         name: jobCategories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         style: form
 *         explode: true
 *         description: Filter by job category IDs
 *       - in: query
 *         name: salaryRange
 *         schema:
 *           type: number
 *         description: Filter jobs with salary less than or equal to this value
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         default: desc
 *         description: Sort by creation date
 *       - in: query
 *         name: salarySort
 *         schema:
 *           type: string
 *           enum: [high-low, low-high]
 *         description: Sort by salary
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Successfully retrieved job posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                         nullable: true
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
 *                       status:
 *                         type: string
 *                         enum: [UNMATCHED, MATCHED, MATCHED_INPROG]
 *                       jobHirerType:
 *                         type: string
 *                         enum: [EMPLOYER, OAUTHEMPLOYER, COMPANY]
 *                       companyId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       employerId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       oauthEmployerId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       companyName:
 *                         type: string
 *                         nullable: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 48
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags:
 *       - Job Post from Employer
 *     summary: Create a new job post
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobPostRequest'
 *     responses:
 *       201:
 *         description: Job post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobPostResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
postRoutes.route('/job-posts')
  .get(validateData(getAllJobPostsSchema), checkAuthenticated, handleGetAllJobPosts);

/**
 * @openapi
 * /api/post/job-posts/{id}:
 *   get:
 *     tags:
 *       - Job Post from Company/Employer
 *     summary: Get a specific job post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job post ID
 *     responses:
 *       200:
 *         description: Successfully retrieved job post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     jobLocation:
 *                       type: string
 *                     salary:
 *                       type: number
 *                     workDates:
 *                       type: string
 *                     workHoursRange:
 *                       type: string
 *                     hiredAmount:
 *                       type: number
 *                     companyName:
 *                       type: string
 *       404:
 *         description: Job post not found
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Job Post from Company/Employer
 *     summary: Update a specific job post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job post ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               jobLocation:
 *                 type: string
 *               salary:
 *                 type: number
 *               workDates:
 *                 type: string
 *               workHoursRange:
 *                 type: string
 *               hiredAmount:
 *                 type: number
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
 *       200:
 *         description: Job post updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Job post not found
 *       500:
 *         description: Server error
 *   delete:
 *     tags:
 *       - Job Post from Company/Employer
 *     summary: Delete a specific job post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job post ID to delete
 *     responses:
 *       200:
 *         description: Job post deleted successfully
 *       404:
 *         description: Job post not found
 *       500:
 *         description: Server error
 */
postRoutes
  .route('/job-posts/:id')
  .get(checkAuthenticated, handleGetJobPost)
  .put(validateData(jobPostSchema),checkAuthenticated, handleUpdateJobPost)
  .delete(validateData(dummySchema),checkAuthenticated, dummyHandler);

/**
 * @openapi
 * /api/post/finding-post:
 *   post:
 *     tags:
 *       - Job Finding Post from Job Seeker
 *     summary: Create a new job finding post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - jobLocation
 *               - expectedSalary
 *               - workDates
 *               - workHoursRange
 *               - status
 *               - jobSeekerType
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Software Developer"
 *                 description: Title of the job finding post
 *               description:
 *                 type: string
 *                 example: "Looking for a position as a software developer"
 *                 description: Detailed description of the job seeker's requirements
 *               jobLocation:
 *                 type: string
 *                 example: "Bangkok"
 *                 description: Preferred job location
 *               expectedSalary:
 *                 type: number
 *                 example: 45000
 *                 description: Expected monthly salary
 *               workDates:
 *                 type: string
 *                 example: "Monday-Friday"
 *                 description: Preferred working days
 *               workHoursRange:
 *                 type: string
 *                 example: "9:00-18:00"
 *                 description: Preferred working hours
 *               status:
 *                 type: string
 *                 enum: ["OPEN", "CLOSED", "PENDING"]
 *                 example: "OPEN"
 *                 description: Current status of the job finding post
 *               jobSeekerType:
 *                 type: string
 *                 enum: ["NORMAL", "OAUTH"]
 *                 example: "NORMAL"
 *                 description: Type of job seeker account
 *     responses:
 *       201:
 *         description: Job finding post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     jobLocation:
 *                       type: string
 *                     expectedSalary:
 *                       type: number
 *                     workDates:
 *                       type: string
 *                     workHoursRange:
 *                       type: string
 *                     status:
 *                       type: string
 *                     jobSeekerType:
 *                       type: string
 *                     jobSeekerName:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *   get:
 *     tags:
 *       - Job Finding Post from Job Seeker
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
  .route('/finding-post')
  .post(validateData(dummySchema), dummyHandler)
  .get(validateData(dummySchema), dummyHandler);  
/**
 * @openapi
 * /api/post/finding-post/{id}:
 *   get:
 *     tags:
 *       - Job Finding Post from Job Seeker
 *     summary: Get a specific job finding post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job finding post ID
 *     responses:
 *       200:
 *         description: Successfully retrieved job finding post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     jobLocation:
 *                       type: string
 *                     expectedSalary:
 *                       type: number
 *                     workDates:
 *                       type: string
 *                     workHoursRange:
 *                       type: string
 *                     status:
 *                       type: string
 *                     jobSeekerType:
 *                       type: string
 *                     jobSeekerName:
 *                       type: string
 *       404:
 *         description: Job finding post not found
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Job Finding Post from Job Seeker
 *     summary: Update a specific job finding post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job finding post ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               jobLocation:
 *                 type: string
 *               expectedSalary:
 *                 type: number
 *               workDates:
 *                 type: string
 *               workHoursRange:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job finding post updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Job finding post not found
 *       500:
 *         description: Server error
 *   delete:
 *     tags:
 *       - Job Finding Post from Job Seeker
 *     summary: Delete a specific job finding post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job finding post ID to delete
 *     responses:
 *       200:
 *         description: Job finding post deleted successfully
 *       404:
 *         description: Job finding post not found
 *       500:
 *         description: Server error
 */
postRoutes
  .route('/finding-post/:id')
  .get(validateData(dummySchema), dummyHandler)
  .put(validateData(dummySchema), dummyHandler)
  .delete(validateData(dummySchema), dummyHandler);

export default postRoutes;
