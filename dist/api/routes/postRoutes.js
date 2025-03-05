"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const requestBodySchema_1 = require("../schemas/requestBodySchema");
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middlewares/auth");
const rolesChecker_1 = require("../middlewares/rolesChecker");
const postRoutes = (0, express_1.Router)();
// Job hiring routes
postRoutes.route('/job-posts/employer')
    .post((0, validationMiddleware_1.validateData)(requestBodySchema_1.jobPostSchema), auth_1.checkAuthenticated, rolesChecker_1.checkEmployer, postController_1.handleCreateJobPostFromEmp);
postRoutes.route('/job-posts/company')
    .post((0, validationMiddleware_1.validateData)(requestBodySchema_1.jobPostSchema), auth_1.checkAuthenticated, rolesChecker_1.checkCompany, postController_1.handleCreateJobPostFromCompany);
postRoutes.route('/job-posts')
    .get((0, validationMiddleware_1.validateData)(requestBodySchema_1.getAllJobPostsSchema), postController_1.handleGetAllJobPosts);
postRoutes
    .route('/job-posts/:id')
    .get(postController_1.handleGetJobPost)
    .put((0, validationMiddleware_1.validateData)(requestBodySchema_1.jobPostSchema), auth_1.checkAuthenticated, postController_1.handleUpdateJobPost)
    .delete((0, validationMiddleware_1.validateData)(requestBodySchema_1.dummySchema), auth_1.checkAuthenticated, postController_1.handleDeleteJobPost);
postRoutes.route('/user/job-posts')
    .get(rolesChecker_1.checkEmployer, postController_1.handleGetEmployerJobPosts);
postRoutes.route('/company/job-posts')
    .get(rolesChecker_1.checkCompany, postController_1.handleGetCompanyJobPosts);
postRoutes.route('/user/finding-posts')
    .get(postController_1.handleGetUserJobFindingPosts);
postRoutes
    .route('/finding-posts')
    .get((0, validationMiddleware_1.validateData)(requestBodySchema_1.getAllJobPostsSchema), postController_1.handleGetAllJobFindingPosts)
    .post((0, validationMiddleware_1.validateData)(requestBodySchema_1.jobFindingPostSchema), auth_1.checkAuthenticated, postController_1.handleCreateJobFindingPost);
postRoutes
    .route('/finding-posts/:id')
    .get(postController_1.handleGetJobFindingPost)
    .put((0, validationMiddleware_1.validateData)(requestBodySchema_1.jobFindingPostSchema), auth_1.checkAuthenticated, postController_1.handleUpdateJobFindingPost)
    .delete(auth_1.checkAuthenticated, postController_1.handleDeleteJobFindingPost);
exports.default = postRoutes;
