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
 *     tags: [Job Seeker]
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

// job seeker, login(POST), get current user(GET), edit current user(PUT), logout current user(DELETE)
/**
 * @openapi
 * /api/user/job-seeker/auth:
 *   post:
 *     summary: login as a job seeker
 *     tags: [Job Seeker]
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
 *     tags: [Job Seeker]
 *     responses:
 *       200:
 *         description: Return the job seeker's infos.
 *   delete:
 *     summary: logout job seeker if logged in
 *     tags: [Job Seeker]
 *     responses:
 *       200:
 *         description: Return the job seeker's id, username.
 */
userRouter
  .route("/job-seeker/auth")
  .post(checkUnauthenticated, jobSeekerControllers.instance().login)
  .get(checkAuthenticated, jobSeekerControllers.instance().getCurrent)
  .delete(checkAuthenticated, jobSeekerControllers.instance().logout);

// job seeker, get user by id(GET) {Not implemented cuz no usage yet}
userRouter.route("/job-seeker/auth/:id");

// [Employer]
// employer, register(POST)
/**
 * @openapi
 * /api/user/employer:
 *   post:
 *     summary: register an employer
 *     tags: [Employer]
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
  .post(checkUnauthenticated, employerControllers.instance().register);

// employer, login(POST), get current user(GET)
/**
 * @openapi
 * /api/user/employer/auth:
 *   post:
 *     summary: login as an employer
 *     tags: [Employer]
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
 *     summary: get logged-in employer info
 *     tags: [Employer]
 *     responses:
 *       200:
 *         description: Return the employer's infos.
 *   delete:
 *     summary: logout employer if logged in
 *     tags: [Employer]
 *     responses:
 *       200:
 *         description: Return the employer's id, username.
 */
userRouter
  .route("/employer/auth")
  .post(checkUnauthenticated, employerControllers.instance().login)
  .get(checkAuthenticated, employerControllers.instance().getCurrent)
  .delete(checkAuthenticated, employerControllers.instance().logout);

// [Company]
// company, register(POST)
/**
 * @openapi
 * /api/user/company:
 *   post:
 *     summary: register a company
 *     tags: [Company]
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

// company, login(POST), get current user(GET)
/**
 * @openapi
 * /api/user/company/auth:
 *   post:
 *     summary: login as a company
 *     tags: [Company]
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
 *     summary: get logged-in company info
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Return the company's infos.
 *   delete:
 *     summary: logout company if logged in
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Return the company's id, username.
 */
userRouter
  .route("/company/auth")
  .post(checkUnauthenticated, companyControllers.instance().login)
  .get(checkAuthenticated, companyControllers.instance().getCurrent)
  .delete(checkAuthenticated, companyControllers.instance().logout);

export { userRouter };
