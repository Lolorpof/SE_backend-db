"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminServices = void 0;
require("dotenv/config");
const nanoid_1 = require("nanoid");
const utilFunctions_1 = require("../utilities/utilFunctions");
const adminsModels_1 = require("../models/adminsModels");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usersValidator_1 = require("../validators/usersValidator");
const registrationApprovalModels_1 = require("../models/registrationApprovalModels");
const jobSeekerModels_1 = require("../models/jobSeekerModels");
const employerModels_1 = require("../models/employerModels");
const companyModels_1 = require("../models/companyModels");
class adminServices {
    static adminService;
    static instance() {
        if (!this.adminService) {
            this.adminService = new adminServices();
        }
        return this.adminService;
    }
    // logged in admin
    async getCurrent(user) {
        if (!user) {
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        let userObj;
        try {
            userObj = user;
            if (userObj.type !== "ADMIN") {
                throw Error();
            }
        }
        catch (error) {
            return { success: false, status: 401, msg: "User isn't logged in" };
        }
        return {
            success: true,
            status: 200,
            msg: "Successfully retrieve user",
            data: userObj,
        };
    }
    // for logout
    async checkCurrent(user, type) {
        if (!user) {
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        let userObj;
        try {
            userObj = user;
        }
        catch (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        if (userObj.type !== type) {
            return { success: false, status: 401, msg: "User isn't logged in" };
        }
        return {
            success: true,
            status: 200,
            msg: "Sucessfully retrieve checked user",
            data: { id: userObj.id, username: userObj.username },
        };
    }
    // approve or unapprove 'user'
    async approvingUser(approvalRequest, adminId) {
        // validation
        try {
            usersValidator_1.approvedRequestSchema.parse(approvalRequest);
        }
        catch (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Invalid data" };
        }
        const validatedApprovalRequest = approvalRequest;
        // updating registration approval
        const [error, result] = await (0, utilFunctions_1.catchError)(registrationApprovalModels_1.registrationApprovalModels
            .instance()
            .approveUser(validatedApprovalRequest, adminId));
        if (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        const approvingUser = {
            id: result.userId,
            status: validatedApprovalRequest.status,
        };
        // updating user status to approved or unapproved(delete)
        let err2, res2;
        if (result.userType === "JOBSEEKER") {
            const [error2, result2] = await (0, utilFunctions_1.catchError)(jobSeekerModels_1.jobSeekerModels.instance().approved(approvingUser, result.isOauth));
            err2 = error2;
            res2 = result2;
        }
        else if (result.userType === "EMPLOYER") {
            const [error2, result2] = await (0, utilFunctions_1.catchError)(employerModels_1.employerModels.instance().approved(approvingUser, result.isOauth));
            err2 = error2;
            res2 = result2;
        }
        else {
            const [error2, result2] = await (0, utilFunctions_1.catchError)(companyModels_1.companyModels.instance().approved(approvingUser));
            err2 = error2;
            res2 = result2;
        }
        if (err2 || !res2) {
            console.log(err2);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        const data = { approvedId: res2.id, adminId: adminId };
        return {
            success: true,
            status: 200,
            msg: "Successfully approved user",
            data: data,
        };
    }
    async getAllApproveRequest() {
        const [error, users] = await (0, utilFunctions_1.catchError)(registrationApprovalModels_1.registrationApprovalModels.instance().getAllApproveRequest());
        if (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        return {
            success: true,
            status: 200,
            msg: "Successfully retrieve all approve request",
            data: users,
        };
    }
    async login(username, password, done) {
        // get users with same name or email
        const [error, users] = await (0, utilFunctions_1.catchError)(adminsModels_1.adminModels.instance().matchNameEmail(username));
        if (error) {
            console.log(error);
            return done(error, false, { message: "Something went wrong" });
        }
        if (users.length === 0) {
            return done(null, false, { message: "User doesn't existed" });
        }
        let exactUser;
        let approvedExisted = false;
        try {
            for (const user of users) {
                if (user.approvalStatus === "APPROVED") {
                    approvedExisted = true;
                }
                const matched = await bcryptjs_1.default.compare(password, user.password);
                if (matched) {
                    exactUser = user;
                    break;
                }
            }
        }
        catch (error) {
            console.log(error);
            return done(error, false, { message: "Something went wrong" });
        }
        // no match
        if (!exactUser) {
            if (approvedExisted) {
                return done(null, false, { message: "Wrong password" });
            }
            else {
                return done(null, false, {
                    message: "User doesn't existed",
                });
            }
        }
        // not approved
        if (exactUser.approvalStatus === "UNAPPROVED") {
            return done(null, false, { message: "User isn't approved yet" });
        }
        // format user
        const formattedUser = { id: exactUser.id, type: "ADMIN" };
        done(null, formattedUser, { message: "Successfully login" });
    }
    // create new admin
    async create() {
        const username = (0, nanoid_1.nanoid)((0, utilFunctions_1.randomNumberRange)(8, 16));
        const password = (0, nanoid_1.nanoid)((0, utilFunctions_1.randomNumberRange)(10, 16));
        // hash password
        let hashedPassword;
        try {
            hashedPassword = await bcryptjs_1.default.hash(password, Number(process.env.BCRYPT_SALTROUNDS));
        }
        catch (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        // insert into database
        let result;
        try {
            result = await adminsModels_1.adminModels.instance().create(username, hashedPassword);
        }
        catch (error) {
            console.log(error);
            return { success: false, status: 403, msg: "Something went wrong" };
        }
        return {
            success: true,
            status: 201,
            msg: "Successfully created admin",
            data: { id: result.id, username: username, password: password },
        };
    }
    async deserializer(id) {
        let user;
        // getting user
        try {
            user = await adminsModels_1.adminModels.instance().getById(id);
        }
        catch (error) {
            console.log(error);
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        if (!user) {
            return { success: false, msg: "Something went wrong", status: 403 };
        }
        return {
            success: true,
            msg: "Retrieve user successfully",
            data: user,
            status: 200,
        };
    }
}
exports.adminServices = adminServices;
