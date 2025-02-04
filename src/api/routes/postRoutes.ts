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
  handleDeleteJobPost,
  handleGetAllJobPosts,
  handleGetJobPost,
  handleUpdateJobPost,
} from "../controllers/postController";
import { checkAuthenticated } from "../middlewares/auth";

const postRoutes = Router();

// Job hiring routes
/**
 * @openapi
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174010"
 *         name:
 *           type: string
 *           example: "JavaScript"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Programming language for web development"
 *     JobCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174020"
 *         name:
 *           type: string
 *           example: "Software Development"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Development of software applications"
 *     JobPost:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         title:
 *           type: string
 *           example: "Senior Software Engineer"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Looking for an experienced developer"
 *         jobLocation:
 *           type: string
 *           example: "Bangkok"
 *         salary:
 *           type: integer
 *           example: 50000
 *         workDates:
 *           type: string
 *           example: "Monday-Friday"
 *         workHoursRange:
 *           type: string
 *           example: "9:00-18:00"
 *         hiredAmount:
 *           type: integer
 *           example: 2
 *         status:
 *           type: string
 *           enum: ["MATCHED", "UNMATCHED", "MATCHED_INPROG"]
 *           example: "UNMATCHED"
 *         jobHirerType:
 *           type: string
 *           enum: ["EMPLOYER", "OAUTHEMPLOYER", "COMPANY"]
 *           example: "EMPLOYER"
 *         jobPostType:
 *           type: string
 *           enum: ["FULLTIME", "PARTTIME", "FREELANCE"]
 *           example: "FULLTIME"
 *         employerId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         oauthEmployerId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: null
 *         companyId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T15:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T15:30:00.000Z"
 *         companyName:
 *           type: string
 *           nullable: true
 *           example: null
 *         skills:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Skill'
 *         jobCategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JobCategory'
 *     SinglePostResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         status:
 *           type: integer
 *           example: 200
 *         msg:
 *           type: string
 *           example: "Successfully retrieved job post"
 *         data:
 *           $ref: '#/components/schemas/JobPost'
 *     MultiplePostsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         status:
 *           type: integer
 *           example: 200
 *         msg:
 *           type: string
 *           example: "Successfully retrieved job posts"
 *         data:
 *           type: object
 *           properties:
 *             jobPosts:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobPost'
 *             pagination:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalItems:
 *                   type: integer
 *                   example: 48
 *                 itemsPerPage:
 *                   type: integer
 *                   example: 10
 */

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
 *               $ref: '#/components/schemas/SinglePostResponse'
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
 *                         example: "salary"
 *                       message:
 *                         type: string
 *                         example: "Salary must be greater than 0"
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
 *                 data:
 *                   type: null
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
 *                 data:
 *                   type: null
 */
postRoutes.route('/job-posts/employer')
  .post(validateData(jobPostSchema), checkAuthenticated, handleCreateJobPostFromEmp);

/**
 * @openapi
 * /api/post/job-posts/company:
 *   post:
 *     tags:
 *       - Job Post from Company
 *     summary: Create a new job post as a company
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobPost'
 *     responses:
 *       201:
 *         description: Job post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SinglePostResponse'
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
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
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
 *                 data:
 *                   type: null
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
 *                 data:
 *                   type: null
 */
postRoutes.route('/job-posts/company')
  .post(validateData(jobPostSchema), checkAuthenticated, handleCreateJobPostFromCompany);

/**
 * @openapi
 * /api/post/job-posts:
 *   get:
 *     tags:
 *       - Job Post from Company/Employer
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
 *               $ref: '#/components/schemas/MultiplePostsResponse'
 *       401:
 *         description: Unauthorized
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobPosts:
 *                       type: array
 *                       items: []
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 0
 *                         totalPages:
 *                           type: integer
 *                           example: 0
 *                         totalItems:
 *                           type: integer
 *                           example: 0
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 0
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
 *                   example: "Failed to fetch job posts"
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobPosts:
 *                       type: array
 *                       items: []
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 0
 *                         totalPages:
 *                           type: integer
 *                           example: 0
 *                         totalItems:
 *                           type: integer
 *                           example: 0
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 0
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
 *               $ref: '#/components/schemas/SinglePostResponse'
 *       404:
 *         description: Job post not found
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
 *                   example: "Job post not found"
 *                 data:
 *                   type: null
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
 *                   example: "Failed to fetch job post"
 *                 data:
 *                   type: null
 *   put:
 *     tags:
 *       - Job Post from Company/Employer
 *     summary: Update a specific job post
 *     security:
 *       - sessionAuth: []
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
 *             $ref: '#/components/schemas/JobPost'
 *     responses:
 *       200:
 *         description: Job post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SinglePostResponse'
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
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
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
 *                 data:
 *                   type: null
 *       403:
 *         description: Not authorized to update this job post
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
 *                   example: "You are not authorized to update this job post"
 *                 data:
 *                   type: null
 *       404:
 *         description: Job post not found
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
 *                   example: "Job post not found"
 *                 data:
 *                   type: null
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
 *                   example: "Failed to update job post"
 *                 data:
 *                   type: null
 *   delete:
 *     tags:
 *       - Job Post from Company/Employer
 *     summary: Delete a specific job post
 *     security:
 *       - sessionAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SinglePostResponse'
 *       401:
 *         description: Unauthorized
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
 *                 data:
 *                   type: null
 *       403:
 *         description: Not authorized to delete this job post
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
 *                   example: "You are not authorized to delete this job post"
 *                 data:
 *                   type: null
 *       404:
 *         description: Job post not found
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
 *                   example: "Job post not found"
 *                 data:
 *                   type: null
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
 *                   example: "Failed to delete job post"
 *                 data:
 *                   type: null
 */
postRoutes
  .route('/job-posts/:id')
  .get(checkAuthenticated, handleGetJobPost)
  .put(validateData(jobPostSchema),checkAuthenticated, handleUpdateJobPost)
  .delete(validateData(dummySchema),checkAuthenticated, handleDeleteJobPost);

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
