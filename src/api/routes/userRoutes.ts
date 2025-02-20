import express, { NextFunction, Response } from "express";
import { jobSeekerControllers } from "../controllers/jobSeekerControllers";
import { employerControllers } from "../controllers/employerControllers";
import { Controllers } from "../controllers/controllers";
import {
  checkAuthenticated,
  checkUnauthenticated,
  checkUnauthenticatedOauth,
  checkUploadedSingleFile,
} from "../middlewares/auth";
import "../types/usersTypes";
import "../validators/usersValidator";
import { TSingleUserRegister } from "../validators/usersValidator";
import { companyControllers } from "../controllers/companyControllers";
import { uploadRegisterImageMiddleware } from "../utilities/multer";

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
 *                  example: {userId: 69, approvalId: 123}
 */
userRouter
  .route("/job-seeker")
  .post(checkUnauthenticated, jobSeekerControllers.instance().register);

// job seeker, upload registration image
/**
 * @openapi
 * /api/user/job-seeker/registration-image/{approvalId}:
 *   post:
 *     summary: upload register proof image
 *     tags: [Job Seeker]
 *     parameters:
 *       - in: path
 *         name: approvalId
 *         required: true
 *         schema:
 *           type: string
 *         description: registration approval id from registering
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                format: binary
 *                description: image file
 *     responses:
 *       201:
 *         description: Return the job seeker id.
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
 *                  example: {approvalId: 123, url: image's presignedUrl}
 */
userRouter
  .route("/job-seeker/registration-image/:approvalId")
  .post(
    checkUnauthenticated,
    uploadRegisterImageMiddleware,
    checkUploadedSingleFile,
    jobSeekerControllers.instance().uploadRegistrationImage
  );

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
 *                  example: {id: 69, type: JOBSEEKER, isOauth: false}
 *   get:
 *     summary: get logged-in job seeker info
 *     tags: [Job Seeker]
 *     responses:
 *       200:
 *         description: Return the job seeker's infos.
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
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: job seeker's id
 *                      example: 123
 *                    username:
 *                      type: string
 *                      description: job seeker's username
 *                      example: Palm
 *                    firstName:
 *                      type: string
 *                      description: job seeker's first name
 *                      example: Palm
 *                    lastName:
 *                      type: string
 *                      description: job seeker's last name
 *                      example: Duangjun
 *                    email:
 *                      type: string
 *                      description: job seeker's email
 *                      example: duangjun@gmail.com
 *                    profilePicture:
 *                      type: string
 *                      description: job seeker's profile picture link
 *                      example: duangjun.img
 *                    aboutMe:
 *                      type: string
 *                      description: job seeker's self description
 *                      example: A very long about me
 *                    contact:
 *                      type: string
 *                      description: job seeker's contact info
 *                      example: 0123456789
 *                    resume:
 *                      type: string
 *                      description: job seeker's resume link
 *                      example: http://duangjun-resume.com
 *                    address:
 *                      type: string
 *                      description: job seeker's address
 *                      example: 69 Borwon rd. Gambler district, Duangjun province, NongPalm country, Uranus, 696969
 *                    approvalStatus:
 *                      type: string
 *                      description: job seeker's approval status
 *                      example: APPROVED
 *                    skills:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          name:
 *                            type: string
 *                            description: name of job seeker's vulnerability
 *                            example: Documents
 *                          description:
 *                            type: string
 *                            description: description of job seeker's vulnerability
 *                            example: able to use document apps like word and excel
 *                    vulnerabilities:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          name:
 *                            type: string
 *                            description: name of job seeker's vulnerability
 *                            example: Blindness
 *                          description:
 *                            type: string
 *                            description: description of job seeker's vulnerability
 *                            example: the person can't see very well
 *                          severity:
 *                            type: string
 *                            description: job seeker's vulnerability severity
 *                            example: LOW
 *                    providerId:
 *                      type: string
 *                      description: job seeker's oauth provider id (only when auth with oauth)
 *                      example: 987
 *                    provider:
 *                      type: string
 *                      description: job seeker's oauth provider (only when auth with oauth)
 *                      example: GOOGLE
 *   delete:
 *     summary: logout job seeker if logged in
 *     tags: [Job Seeker]
 *     responses:
 *       200:
 *         description: Return the job seeker's id, username.
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
 *                  example: {id: 69, username: Duangjun}
 */
userRouter
  .route("/job-seeker/auth")
  .post(checkUnauthenticated, jobSeekerControllers.instance().login)
  .get(checkAuthenticated, jobSeekerControllers.instance().getCurrent)
  .delete(checkAuthenticated, jobSeekerControllers.instance().logout);

// job seeker, edit username(put)
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/username:
 *   post:
 *     summary: edit job seeker's username
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: new username of job seeker
 *                example: New Username
 *              password:
 *                type: string
 *                description: job seeker's current password
 *                example: secret123
 *     responses:
 *       200:
 *         description: Return the job seeker id, and username.
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
 *                  example: {userId: 123, username: New Username}
 */
userRouter
  .route("/job-seeker/auth/edit/username")
  .put(checkAuthenticated, jobSeekerControllers.instance().editUsername);
// job seeker, edit email(put)
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/email:
 *   post:
 *     summary: edit job seeker's email
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: new email of job seeker
 *                example: newemail@gmail.com
 *     responses:
 *       200:
 *         description: Return the job seeker id, and email.
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
 *                  example: {userId: 123, email: newemail@gmail.com}
 */
userRouter
  .route("/job-seeker/auth/edit/email")
  .put(checkAuthenticated, jobSeekerControllers.instance().editEmail);
// job seeker, edit full name(put)
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/full-name:
 *   post:
 *     summary: edit job seeker's full name
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                description: new first name of job seeker
 *                example: Wut
 *              lastName:
 *                type: string
 *                description: new last name of job seeker
 *                example: TheHeck
 *     responses:
 *       200:
 *         description: Return the job seeker id, and full name.
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
 *                  example: {userId: 123, firstName: Wut, lastName: TheHeck}
 */
userRouter
  .route("/job-seeker/auth/edit/full-name")
  .put(checkAuthenticated, jobSeekerControllers.instance().editFullName);
// job seeker, edit about(put)
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/about:
 *   post:
 *     summary: edit job seeker's about
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              about:
 *                type: string
 *                description: new about of job seeker
 *                example: This is my profile bro
 *     responses:
 *       200:
 *         description: Return the job seeker id, and about.
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
 *                  example: {userId: 123, about: This is my profile bro}
 */
userRouter
  .route("/job-seeker/auth/edit/about")
  .put(checkAuthenticated, jobSeekerControllers.instance().editAbout);
// job seeker, edit address(put)
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/address:
 *   post:
 *     summary: edit job seeker's address
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              address:
 *                type: string
 *                description: new address of job seeker
 *                example: 9876 Duangjun rd. Palm District
 *              provinceAddress:
 *                type: string
 *                description: new provinceAddress of job seeker
 *                example: Borwon Province
 *     responses:
 *       200:
 *         description: Return the job seeker id, and address, province.
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
 *                  example: {userId: 123, address: 12345 Hello rd. Qwerty district, provinceAddress: KeKekeke}
 */
userRouter
  .route("/job-seeker/auth/edit/address")
  .put(checkAuthenticated, jobSeekerControllers.instance().editAddress);
// job seeker, edit contact(put)
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/contact:
 *   post:
 *     summary: edit job seeker's contact
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              contact:
 *                type: string
 *                description: new contact of job seeker
 *                example: 0123456789
 *     responses:
 *       200:
 *         description: Return the job seeker id, and contact.
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
 *                  example: {userId: 123, contact: 0123456789}
 */
userRouter
  .route("/job-seeker/auth/edit/contact")
  .put(checkAuthenticated, jobSeekerControllers.instance().editContact);
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/password:
 *   post:
 *     summary: edit job seeker's password
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                description: new password of job seeker
 *                example: hello69xD
 *     responses:
 *       200:
 *         description: Return the job seeker id.
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
 *                  example: {userId: 123}
 */
userRouter
  .route("/job-seeker/auth/edit/password")
  .put(checkAuthenticated, jobSeekerControllers.instance().editPassword);
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/skill:
 *   post:
 *     summary: edit job seeker's skill
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              skillsId:
 *                type: array
 *                description: all skills id of job seeker
 *                example: ["1234", "5678"]
 *     responses:
 *       200:
 *         description: Return the job seeker id, and skills Id.
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
 *                  example: {userId: 123, skillsId: ["1234", "5678"]}
 */
userRouter
  .route("/job-seeker/auth/edit/skill")
  .put(checkAuthenticated, jobSeekerControllers.instance().editSkill);
/**
 * @openapi
 * /api/user/job-seeker/auth/edit/vulnerability:
 *   post:
 *     summary: edit job seeker's vulnerability
 *     tags: [Job Seeker]
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              vulnerabilitiesId:
 *                type: array
 *                description: all vulnerabilities id of job seeker
 *                example: ["1234", "5678"]
 *     responses:
 *       200:
 *         description: Return the job seeker id, and vulnerabilities Id.
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
 *                  example: {userId: 123, vulnerabilitiesId: ["1234", "5678"]}
 */
userRouter
  .route("/job-seeker/auth/edit/vulnerability")
  .put(checkAuthenticated, jobSeekerControllers.instance().editVulnerability);

// job seeker, google oauth login(GET)
/**
 * @openapi
 * /api/user/job-seeker/oauth/google:
 *   get:
 *     summary: google login as job seeker (call by 'window.open()')
 *     tags: [Job Seeker]
 *     responses:
 *       200:
 *         description: Redirect user to home page
 */
userRouter.get(
  "/job-seeker/oauth/google",
  checkUnauthenticatedOauth,
  jobSeekerControllers.instance().googleLogin
);
userRouter.get(
  "/job-seeker/oauth/google/callback",
  jobSeekerControllers.instance().googleLogin
);

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
 *                  example: {id: 69}
 */
userRouter
  .route("/employer")
  .post(checkUnauthenticated, employerControllers.instance().register);

// employer, upload register image proof
/**
 * @openapi
 * /api/user/employer/registration-image/{approvalId}:
 *   post:
 *     summary: upload register proof image
 *     tags: [Employer]
 *     parameters:
 *       - in: path
 *         name: approvalId
 *         required: true
 *         schema:
 *           type: string
 *         description: registration approval id from registering
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                format: binary
 *                description: image file
 *     responses:
 *       201:
 *         description: Return the job seeker id.
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
 *                  example: {approvalId: 123, url: image's presignedUrl}
 */
userRouter
  .route("/employer/registration-image/:approvalId")
  .post(
    checkUnauthenticated,
    uploadRegisterImageMiddleware,
    checkUploadedSingleFile,
    employerControllers.instance().uploadRegistrationImage
  );

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
 *                  example: {id: 69, type: EMPLOYER, isOauth: false}
 *   get:
 *     summary: get logged-in employer info
 *     tags: [Employer]
 *     responses:
 *       200:
 *         description: Return the employer's infos.
 *
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
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: employer's id
 *                      example: 123
 *                    username:
 *                      type: string
 *                      description: employer's username
 *                      example: Palm
 *                    firstName:
 *                      type: string
 *                      description: employer's first name
 *                      example: Palm
 *                    lastName:
 *                      type: string
 *                      description: employer's last name
 *                      example: Duangjun
 *                    email:
 *                      type: string
 *                      description: employer's email
 *                      example: duangjun@gmail.com
 *                    profilePicture:
 *                      type: string
 *                      description: employer's profile picture link
 *                      example: duangjun.img
 *                    aboutMe:
 *                      type: string
 *                      description: employer's self description
 *                      example: A very long about me
 *                    contact:
 *                      type: string
 *                      description: employer's contact info
 *                      example: 0123456789
 *                    address:
 *                      type: string
 *                      description: employer's address
 *                      example: 69 Borwon rd. Gambler district, Duangjun province, NongPalm country, Uranus, 696969
 *                    approvalStatus:
 *                      type: string
 *                      description: employer's approval status
 *                      example: APPROVED
 *                    providerId:
 *                      type: string
 *                      description: employer's oauth provider id (only when auth with oauth)
 *                      example: 987
 *                    provider:
 *                      type: string
 *                      description: employer's oauth provider (only when auth with oauth)
 *                      example: GOOGLE
 *   delete:
 *     summary: logout employer if logged in
 *     tags: [Employer]
 *     responses:
 *       200:
 *         description: Return the employer's id, username.
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
userRouter
  .route("/employer/auth")
  .post(checkUnauthenticated, employerControllers.instance().login)
  .get(checkAuthenticated, employerControllers.instance().getCurrent)
  .delete(checkAuthenticated, employerControllers.instance().logout);

// employer, google oauth login(GET)
/**
 * @openapi
 * /api/user/employer/oauth/google:
 *   get:
 *     summary: google login as employer (call by 'window.open()')
 *     tags: [Employer]
 *     responses:
 *       200:
 *         description: Redirect user to home page
 */
userRouter.get(
  "/employer/oauth/google",
  checkUnauthenticatedOauth,
  employerControllers.instance().googleLogin
);
userRouter.get(
  "/employer/oauth/google/callback",
  employerControllers.instance().googleLogin
);

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
 *                  example: {id: 69}
 */
userRouter
  .route("/company")
  .post(checkUnauthenticated, companyControllers.instance().register);

// company, upload register image proof
/**
 * @openapi
 * /api/user/company/registration-image/{approvalId}:
 *   post:
 *     summary: upload register proof image
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: approvalId
 *         required: true
 *         schema:
 *           type: string
 *         description: registration approval id from registering
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                format: binary
 *                description: image file
 *     responses:
 *       201:
 *         description: Return the job seeker id.
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
 *                  example: {approvalId: 123, url: image's presignedUrl}
 */
userRouter
  .route("/company/registration-image/:approvalId")
  .post(
    checkUnauthenticated,
    uploadRegisterImageMiddleware,
    checkUploadedSingleFile,
    companyControllers.instance().uploadRegistrationImage
  );

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
 *
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
 *                  example: {id: 69, type: COMPANY, isOauth: false}
 *   get:
 *     summary: get logged-in company info
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Return the company's infos.
 *
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
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: company's id
 *                      example: 123
 *                    officialName:
 *                      type: string
 *                      description: company's username
 *                      example: Palm
 *                    email:
 *                      type: string
 *                      description: company's email
 *                      example: duangjun@gmail.com
 *                    profilePicture:
 *                      type: string
 *                      description: company's profile picture link
 *                      example: duangjun.img
 *                    aboutMe:
 *                      type: string
 *                      description: company's self description
 *                      example: A very long about me
 *                    contact:
 *                      type: string
 *                      description: company's contact info
 *                      example: 0123456789
 *                    address:
 *                      type: string
 *                      description: company's address
 *                      example: 69 Borwon rd. Gambler district, Duangjun province, NongPalm country, Uranus, 696969
 *                    approvalStatus:
 *                      type: string
 *                      description: company's approval status
 *                      example: APPROVED
 *   delete:
 *     summary: logout company if logged in
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: Return the company's id, username.
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
userRouter
  .route("/company/auth")
  .post(checkUnauthenticated, companyControllers.instance().login)
  .get(checkAuthenticated, companyControllers.instance().getCurrent)
  .delete(checkAuthenticated, companyControllers.instance().logout);

export { userRouter };
