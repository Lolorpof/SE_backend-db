"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSeekerControllers = void 0;
const jobSeekerServices_1 = require("../services/jobSeekerServices");
const passport_1 = __importDefault(require("../middlewares/passport"));
require("../interfaces/userControllerInterfaces");
const utilFunctions_1 = require("../utilities/utilFunctions");
class jobSeekerControllers {
    // singleton design
    static userController;
    static instance() {
        if (!this.userController) {
            this.userController = new jobSeekerControllers();
        }
        return this.userController;
    }
    // register route handler
    async register(req, res) {
        const userForm = req.body; // frontend sent in body user object
        const result = await jobSeekerServices_1.jobSeekerServices.instance().register(userForm);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    // login route handler
    async login(req, res) {
        passport_1.default.authenticate("local-jobSeeker", (err, user, info) => {
            if (err) {
                return res.status(403).json({ success: false, msg: info.message });
            }
            if (!user) {
                return res.status(401).json({ success: false, msg: info.message });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(403).json({
                        success: false,
                        msg: "Something went wrong when logging in",
                    });
                }
                return res
                    .status(200)
                    .json({ success: true, msg: "Successfully logged in", data: user });
            });
        })(req, res);
    }
    // google oauth 2.0 route handler
    async googleLogin(req, res) {
        passport_1.default.authenticate("google-jobSeeker", (err, user, info) => {
            if (err) {
                console.log(err);
                return res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/signin?msg=${info.message}`);
            }
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/signUp/job-seeker?msg=Not+approved+yet&approvalId=${info.approvalId}`);
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    return res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/signin?msg=login`);
                }
                res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=success`);
            });
        })(req, res);
    }
    // logout route handler
    async logout(req, res) {
        const formattedUser = req.user;
        // check current user type
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .checkCurrent(req.user, "JOBSEEKER", formattedUser.isOauth);
        if (!result.success || !result.data) {
            res.status(result.status).json({
                success: false,
                msg: result.msg,
            });
            return;
        }
        req.logOut((err) => {
            if (err) {
                res.status(403).json({
                    success: false,
                    msg: "Something went wrong when logging out",
                });
                return;
            }
            // destroy session cookie
            req.session.destroy((err) => {
                if (err) {
                    res.status(403).json({
                        success: false,
                        msg: "Something went wrong when removing session cookie",
                    });
                    return;
                }
                res.clearCookie("sid");
                res.status(200).json({
                    success: true,
                    msg: "Successfuly logged out",
                    data: result.data,
                });
            });
        });
    }
    // get all route handler
    async getAll(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices.instance().getAll();
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    // get current user route handler
    async getCurrent(req, res) {
        const responseUser = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .getCurrent(req.user);
        if (!responseUser.success || !responseUser.data) {
            res
                .status(responseUser.status)
                .json({ success: responseUser.success, msg: responseUser.msg });
            return;
        }
        if (responseUser.data.type !== "JOBSEEKER") {
            res
                .status(responseUser.status)
                .json({ success: responseUser.success, msg: responseUser.msg });
            return;
        }
        res.status(responseUser.status).json({
            success: responseUser.success,
            msg: responseUser.msg,
            data: responseUser.data,
        });
    }
    // upload registration image route handler (not done)
    async uploadRegistrationImage(req, res) {
        if (!req.params || !req.params.approvalId) {
            res.status(400).json({ success: false, msg: "Credential is missing" });
            console.error("params missing");
            return;
        }
        const { approvalId } = req.params;
        const [error, result] = await (0, utilFunctions_1.catchError)(jobSeekerServices_1.jobSeekerServices
            .instance()
            .uploadRegistrationImage(approvalId, req.file));
        if (error) {
            console.log(error);
            res.status(403).json({ success: false, msg: "Credential is missing" });
            return;
        }
        if (!result.success || !result.data) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    // upload profile picture route handler (not done)
    async uploadProfilePicture(req, res) {
        const [error, result] = await (0, utilFunctions_1.catchError)(jobSeekerServices_1.jobSeekerServices
            .instance()
            .uploadProfilePicture(req.file, req.user));
        if (error) {
            res.status(403).json({ success: false, msg: "Credential is missing" });
            return;
        }
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    // // upload resume image route handler
    async uploadResume(req, res) {
        const [error, result] = await (0, utilFunctions_1.catchError)(jobSeekerServices_1.jobSeekerServices
            .instance()
            .uploadResume(req.file, req.user));
        if (error) {
            res.status(403).json({ success: false, msg: "Credential is missing" });
            return;
        }
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    // edit username route handler
    async editUsername(req, res) {
        // get response
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editUsername(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: formattedResultData,
        });
    }
    // edit email route handler
    async editEmail(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editEmail(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
    // edit full name route handler
    async editFullName(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editFullName(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
    // edit about route handler
    async editAbout(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editAbout(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
    // edit address route handler
    async editAddress(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editAddress(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
    // edit contact route handler
    async editContact(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editContact(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
    // edit password route handler
    async editPassword(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editPassword(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: formattedResultData,
        });
    }
    // edit job seeker skills route handler
    async editSkill(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editSkill(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
    // edit job seeker vulnerabilities route handler
    async editVulnerability(req, res) {
        const result = await jobSeekerServices_1.jobSeekerServices
            .instance()
            .editVulnerability(req.body, req.user);
        if (!result.success) {
            res
                .status(result.status)
                .json({ success: result.success, msg: result.msg });
            return;
        }
        // const { case: _, ...formattedResultData } = result.data;
        res.status(result.status).json({
            success: result.success,
            msg: result.msg,
            data: result.data,
        });
    }
}
exports.jobSeekerControllers = jobSeekerControllers;
