import express from "express";
import { jobSeekerControllers } from "../controllers/jobSeekerControllers";
import { employerControllers } from "../controllers/employerControllers";
import { checkAuthenticated, checkUnauthenticated } from "../middlewares/auth";

const userRouter = express.Router();

// {/api/user}

// job seeker, fetch(GET), register(POST), delete account(DELETE)
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
 *     responses:
 *       201:
 *         description: Return the job seeker id.
 */
userRouter
  .route("/job-seeker")
  .post(
    checkUnauthenticated,
    jobSeekerControllers.instance().jobSeekerRegister
  );

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
 *     responses:
 *       201:
 *         description: Return the employer id.
 */
userRouter
  .route("/employer")
  .post(checkUnauthenticated, employerControllers.instance().employerRegister);

// ีuserRouter.route("/company").post(checkUnauthenticated, )

export { userRouter };
