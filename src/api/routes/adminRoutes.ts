import { Request, Response, Router } from "express";
import {
  checkAdmin,
  checkAuthenticated,
  checkPermissionHeader,
  checkUnauthenticated,
} from "../middlewares/auth";
import { adminControllers } from "../controllers/adminsControllers";

const adminRouter = Router();

// {/api/admin}
// create admin(POST)
/**
 * @openapi
 * /api/admin:
 *   post:
 *     summary: add an admin by randomly generating username and password
 *     tags: [Admin]
 *     parameters:
 *       - in: header
 *         name: permission_key
 *         required: true
 *         schema:
 *           type: string
 *         description: key for adding admin
 *     responses:
 *       201:
 *         description: Return the admin's id, username, and password.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: is fetch successful
 *                  example: true
 *                msg:
 *                  type: string
 *                  description: response message
 *                  example: Successfully fetch api
 *                data:
 *                  type: object
 *                  description: response data
 *                  example: {id: 69, username: duangjun, password: something}
 */
adminRouter
  .route("/")
  .post(checkPermissionHeader, adminControllers.instance().create);

// login admin(POST), get current(GET)
/**
 * @openapi
 * /api/admin/auth:
 *   post:
 *     summary: login as an admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              nameEmail:
 *                type: string
 *                description: a name or email
 *                example: administratorXD
 *              password:
 *                type: string
 *                description: a password
 *                example: wow12345
 *     responses:
 *       200:
 *         description: Return the admin's id, username.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: is fetch successful
 *                  example: true
 *                msg:
 *                  type: string
 *                  description: response message
 *                  example: Successfully fetch api
 *                data:
 *                  type: object
 *                  description: response data
 *                  example: {id: 69, username: duangjun}
 *   get:
 *     summary: get logged-in admin info
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Return the admin's infos.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: is fetch successful
 *                  example: true
 *                msg:
 *                  type: string
 *                  description: response message
 *                  example: Successfully fetch api
 *                data:
 *                  type: object
 *                  description: response data
 *                  example: {id: 69, username: someone}
 *   delete:
 *     summary: logout admin if logged in
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Return the admin's id, username.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: is fetch successful
 *                  example: true
 *                msg:
 *                  type: string
 *                  description: response message
 *                  example: Successfully fetch api
 *                data:
 *                  type: object
 *                  description: response data
 *                  example: {id: 69, username: duangjun}
 */
adminRouter
  .route("/auth")
  .post(checkUnauthenticated, adminControllers.instance().login)
  .get(checkAuthenticated, adminControllers.instance().getCurrent)
  .delete(checkAuthenticated, adminControllers.instance().logout);

// approve user(POST)
/**
 * @openapi
 * /api/admin/approve:
 *   post:
 *     summary: approve or unapprove user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: string
 *                description: registration approval id
 *                example: "69"
 *              status:
 *                type: string
 *                description: approve or unapprove user
 *                example: "APPROVED"
 *     responses:
 *       200:
 *         description: Return the approved user's id and admin id.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: is fetch successful
 *                  example: true
 *                msg:
 *                  type: string
 *                  description: response message
 *                  example: Successfully fetch api
 *                data:
 *                  type: object
 *                  description: response data
 *                  example: {approvedId: 69, adminId: 123}
 *   get:
 *     summary: get all registration approval request
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Return the admin's id, username.
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                  description: is fetch successful
 *                  example: true
 *                msg:
 *                  type: string
 *                  description: response message
 *                  example: Successfully fetch api
 *                data:
 *                  type: array
 *                  description: response data
 *                  items:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        description: registration approval id
 *                        example: "987"
 *                      userId:
 *                        type: string
 *                        description: user id
 *                        example: "69"
 *                      userType:
 *                        type: string
 *                        description: user type
 *                        example: "JOBSEEKER"
 *                      status:
 *                        type: string
 *                        description: status to apply to user
 *                        example: "APPROVED"
 *                      adminId:
 *                        type: string
 *                        description: admin id
 *                        example: "123"
 *
 */
adminRouter
  .route("/approve")
  .post(
    checkAuthenticated,
    checkAdmin,
    adminControllers.instance().approvingUser
  )
  .get(
    checkAuthenticated,
    checkAdmin,
    adminControllers.instance().getAllApproveRequest
  );

export { adminRouter };
