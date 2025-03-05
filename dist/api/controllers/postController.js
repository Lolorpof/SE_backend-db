"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetAllJobPosts = handleGetAllJobPosts;
exports.handleCreateJobPostFromEmp = handleCreateJobPostFromEmp;
exports.handleCreateJobPostFromCompany = handleCreateJobPostFromCompany;
exports.handleUpdateJobPost = handleUpdateJobPost;
exports.handleGetJobPost = handleGetJobPost;
exports.handleDeleteJobPost = handleDeleteJobPost;
exports.dummyHandler = dummyHandler;
exports.handleGetAllJobFindingPosts = handleGetAllJobFindingPosts;
exports.handleCreateJobFindingPost = handleCreateJobFindingPost;
exports.handleUpdateJobFindingPost = handleUpdateJobFindingPost;
exports.handleGetJobFindingPost = handleGetJobFindingPost;
exports.handleDeleteJobFindingPost = handleDeleteJobFindingPost;
exports.handleGetUserJobFindingPosts = handleGetUserJobFindingPosts;
exports.handleGetEmployerJobPosts = handleGetEmployerJobPosts;
exports.handleGetCompanyJobPosts = handleGetCompanyJobPosts;
const requestBodySchema_1 = require("../schemas/requestBodySchema");
const postServices_1 = require("../services/postServices");
const errorServices_1 = require("../services/errorServices");
const controllerUtils_1 = require("../utilities/controllerUtils");
async function handleGetAllJobPosts(req, res) {
    try {
        const result = await postServices_1.postServices.instance().getAllJobPosts(req.query);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleCreateJobPostFromEmp(req, res) {
    try {
        const validatedData = requestBodySchema_1.jobPostSchema.parse(req.body);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .createJobPostFromEmp(validatedData, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleCreateJobPostFromCompany(req, res) {
    try {
        // Validate request body against schema
        const validatedData = requestBodySchema_1.jobPostSchema.parse(req.body);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .createJobPostFromCompany(validatedData, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleUpdateJobPost(req, res) {
    try {
        // Validate request params (job post ID)
        const validatedId = requestBodySchema_1.validUidSchema.parse(req.params);
        // Validate request body against schema
        const validatedData = requestBodySchema_1.jobPostSchema.parse(req.body);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .updateJobPost(validatedId.id, validatedData, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleGetJobPost(req, res) {
    try {
        const validatedId = requestBodySchema_1.validUidSchema.parse(req.params);
        const result = await postServices_1.postServices.instance().getJobPost(validatedId.id);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleDeleteJobPost(req, res) {
    try {
        const validatedId = requestBodySchema_1.validUidSchema.parse(req.params);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .deleteJobPost(validatedId.id, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
// Empty handlers for job posts
async function dummyHandler(req, res) {
    res.json({
        success: true,
        message: "Dummy handler",
    });
}
async function handleGetAllJobFindingPosts(req, res) {
    // const result = await postServices.instance().getAllJobFindingPosts(req.query);
    // res.status(result.status).json({
    //   success: result.success,
    //   data: result.data,
    //   message: result.msg,
    // });
    try {
        const result = await postServices_1.postServices
            .instance()
            .getAllJobFindingPosts(req.query);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleCreateJobFindingPost(req, res) {
    try {
        const validatedData = requestBodySchema_1.jobFindingPostSchema.parse(req.body);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .createJobFindingPost(validatedData, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleUpdateJobFindingPost(req, res) {
    try {
        const validatedId = requestBodySchema_1.validUidSchema.parse(req.params);
        const validatedData = requestBodySchema_1.jobFindingPostSchema.parse(req.body);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .updateJobFindingPost(validatedId.id, validatedData, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleGetJobFindingPost(req, res) {
    try {
        const validatedId = requestBodySchema_1.validUidSchema.parse(req.params);
        const result = await postServices_1.postServices
            .instance()
            .getJobFindingPost(validatedId.id);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleDeleteJobFindingPost(req, res) {
    try {
        const validatedId = requestBodySchema_1.validUidSchema.parse(req.params);
        const user = req.user;
        const result = await postServices_1.postServices
            .instance()
            .deleteJobFindingPost(validatedId.id, user);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleGetUserJobFindingPosts(req, res) {
    try {
        const user = req.user;
        if (!user) {
            throw errorServices_1.errorServices.handleAuthError();
        }
        const result = await postServices_1.postServices
            .instance()
            .getJobFindingPostsByUser(user.id, user.isOauth);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleGetEmployerJobPosts(req, res) {
    try {
        const user = req.user;
        if (!user) {
            throw errorServices_1.errorServices.handleAuthError();
        }
        const result = await postServices_1.postServices
            .instance()
            .getJobPostsByEmployer(user.id, user.isOauth);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
async function handleGetCompanyJobPosts(req, res) {
    try {
        const user = req.user;
        if (!user) {
            throw errorServices_1.errorServices.handleAuthError();
        }
        const result = await postServices_1.postServices.instance().getJobPostsByCompany(user.id);
        res.status(result.status).json({
            success: result.success,
            data: result.data,
            message: result.msg,
        });
    }
    catch (error) {
        (0, controllerUtils_1.handleControllerError)(error, res);
    }
}
