import { Request, Response, Router } from "express";
import {
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
 */
adminRouter
  .route("/")
  .post(checkPermissionHeader, adminControllers.instance().create);

// login admin(POST), get current(GET)
/**
 * @openapi
 * /api/admin/auth:
 *   post:
 *     summary: add an admin
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
 *       201:
 *         description: Return the admin's id, username, and password.
 *   get:
 *     summary: get logged-in admin info
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Return the admin's infos.
 *   delete:
 *     summary: logout admin if logged in
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Return the admin's id, username.
 */
adminRouter
  .route("/auth")
  .post(checkUnauthenticated, adminControllers.instance().login)
  .get(checkAuthenticated, adminControllers.instance().getCurrent)
  .delete(checkAuthenticated, adminControllers.instance().logout);

export { adminRouter };
