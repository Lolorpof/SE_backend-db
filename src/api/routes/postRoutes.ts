import { Router } from "express";
import { validateData } from "../middleware/validationMiddleware";
import {
  getFindEmpSchema,
  getJobSeekerSchema,
  jobPostSchema,
  dummySchema,
} from "../schemas/api-schema";
import {
  handleGetEmp,
  handleGetJobSeeker,
  dummyHandler,
  handleCreateJobPost,
} from "../controllers/postController";

const postRoutes = Router();

// Job hiring routes
/**
 * @openapi
 * /api/post/job-posts:
 *   post:
 *     tags:
 *       - Job Post from Company/Employer
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
 *               - status
 *               - hiredAmount
 *               - jobHireType
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Senior Software Engineer"
 *                 description: Title of the job post
 *               description:
 *                 type: string
 *                 maxLength: 540
 *                 example: "Looking for an experienced developer"
 *                 description: Detailed description of the job
 *               jobLocation:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Bangkok"
 *                 description: Location of the job
 *               salary:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50000
 *                 description: Monthly salary offered for the job
 *               workDates:
 *                 type: string
 *                 maxLength: 1024
 *                 example: "Monday-Friday"
 *                 description: Working days schedule
 *               workHoursRange:
 *                 type: string
 *                 maxLength: 255
 *                 example: "9:00-18:00"
 *                 description: Working hours range
 *               status:
 *                 type: string
 *                 enum: ["OPEN", "CLOSED", "PENDING"]
 *                 example: "OPEN"
 *                 description: Current status of the job post
 *               hiredAmount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *                 description: Number of people to be hired
 *               jobHireType:
 *                 type: string
 *                 enum: ["EMPLOYER", "COMPANY"]
 *                 example: "EMPLOYER"
 *                 description: Type of job hire
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: List of required skill IDs
 *               jobCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: List of job category IDs
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Unique identifier for the job post
 *                     title:
 *                       type: string
 *                       maxLength: 255
 *                     description:
 *                       type: string
 *                       maxLength: 540
 *                     jobLocation:
 *                       type: string
 *                       maxLength: 255
 *                     salary:
 *                       type: integer
 *                     workDates:
 *                       type: string
 *                       maxLength: 1024
 *                     workHoursRange:
 *                       type: string
 *                       maxLength: 255
 *                     status:
 *                       type: string
 *                       enum: ["OPEN", "CLOSED", "PENDING"]
 *                     hiredAmount:
 *                       type: integer
 *                     jobHireType:
 *                       type: string
 *                       enum: ["EMPLOYER", "COMPANY"]
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
 *       - Job Post from Company/Employer
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
  .route('/job-posts')
  .post(validateData(jobPostSchema), handleCreateJobPost)
  .get(validateData(getJobSeekerSchema), handleGetJobSeeker);

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
  .get(validateData(dummySchema), dummyHandler)
  .put(validateData(dummySchema), dummyHandler)
  .delete(validateData(dummySchema), dummyHandler);

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
  .get(validateData(getFindEmpSchema), handleGetEmp);  
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
