import express from "express";
import { jobSeekerControllers } from "../controllers/jobSeekerControllers";
import { employerControllers } from "../controllers/employerControllers";
import { Controllers } from "../controllers/controllers";
import { checkAuthenticated, checkUnauthenticated } from "../middlewares/auth";
import "../types/usersTypes";
import "../validators/usersValidator";
import { singleUserRegisterType } from "../validators/usersValidator";
import { companyControllers } from "../controllers/companyControllers";

const userRouter = express.Router();

// {/api/user}

// [Job Seeker]

// job seeker, register(POST)
/**
 * @openapi
 * /api/user/job-seeker:
 *   post:
 *     summary: register a job seeker
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: a name
 *                example: Borwonpak Duangjun
 *              email:
 *                type: string
 *                description: an email
 *                example: duangjun123@gmail.com
 *              password:
 *                type: string
 *                description: a password
 *                example: duangjun1234
 *              confirmPassword:
 *                type: string
 *                description: match password above
 *                example: duangjun1234
 *     responses:
 *       201:
 *         description: Return the job seeker id.
 */
userRouter
  .route("/job-seeker")
  .post(checkUnauthenticated, jobSeekerControllers.instance().register);

// job seeker, login(POST), get current user(GET)
/**
 * @openapi
 * /api/user/job-seeker/auth:
 *   post:
 *     summary: login as a job seeker
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              nameEmail:
 *                type: string
 *                description: username or email of user
 *                example: Duangjun
 *              password:
 *                type: string
 *                description: a password of user
 *                example: dunjuang9876
 *     responses:
 *       200:
 *         description: Return the user's id, type, and oauthStats.
 *   get:
 *     summary: get logged-in job seeker info
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Return the job seeker's infos.
 */
userRouter
  .route("/job-seeker/auth")
  .post(checkUnauthenticated, jobSeekerControllers.instance().login)
  .get(checkAuthenticated, jobSeekerControllers.instance().getCurrent);

// job seeker, get user by id(GET), edit current user(PUT), logout current user(POST)
/**
 * @openapi
 * /api/user/job-seeker/:id:
 *   post:
 *     summary: register a job seeker
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: a name
 *                example: Borwonpak Duangjun
 *              email:
 *                type: string
 *                description: an email
 *                example: duangjun123@gmail.com
 *              password:
 *                type: string
 *                description: a password
 *                example: duangjun1234
 *              confirmPassword:
 *                type: string
 *                description: match password above
 *                example: duangjun1234
 *     responses:
 *       201:
 *         description: Return the job seeker id.
 *   get:
 *     summary: fetch all job seekers with infos
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Return the job seekers infos.
 */
userRouter.route("/job-seeker/auth/:id");

// [Employer]
/**
 * @openapi
 * /api/user/employer:
 *   post:
 *     summary: register an employer
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: a name
 *                example: Borwonpak Duangjun
 *              email:
 *                type: string
 *                description: an email
 *                example: duangjun123@gmail.com
 *              password:
 *                type: string
 *                description: a password
 *                example: duangjun1234
 *              confirmPassword:
 *                type: string
 *                description: match password above
 *                example: duangjun1234
 *     responses:
 *       201:
 *         description: Return the employer id.
 */
userRouter
  .route("/employer")
  .post(checkUnauthenticated, employerControllers.instance().employerRegister);

/**
 * @openapi
 * /api/user/company:
 *   post:
 *     summary: register a company
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              officialName:
 *                type: string
 *                description: a name
 *                example: The Company 3000
 *              email:
 *                type: string
 *                description: an email
 *                example: company69@gmail.com
 *              password:
 *                type: string
 *                description: a password
 *                example: dunjuang9876
 *              confirmPassword:
 *                type: string
 *                description: match password above
 *                example: dunjuang9876
 *     responses:
 *       201:
 *         description: Return the company id.
 */
userRouter
  .route("/company")
  .post(checkUnauthenticated, companyControllers.instance().register);

export { userRouter };
