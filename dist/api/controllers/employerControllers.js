"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerControllers = void 0;
const employerServices_1 = require("../services/employerServices");
const passport_1 = __importDefault(require("../middlewares/passport"));
const utilFunctions_1 = require("../utilities/utilFunctions");
class employerControllers {
    // singleton design
    static employerController;
    static instance() {
        if (!this.employerController) {
            this.employerController = new employerControllers();
        }
        return this.employerController;
    }
    // register employer route handler
    async register(req, res) {
        const userForm = req.body; // frontend sent in body user object
        const result = await employerServices_1.employerServices.instance().register(userForm);
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
    // login employer route handler
    async login(req, res) {
        passport_1.default.authenticate("local-employer", (err, user, info) => {
            if (err) {
                console.log(err);
                return res.status(403).json({ success: false, msg: info.message });
            }
            if (!user) {
                return res.status(401).json({ success: false, msg: info.message });
            }
            req.logIn(user, (err) => {
                if (err) {
                    res.status(400).json({
                        success: false,
                        msg: "Something went wrong when logging in",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    msg: "Successfully logged in",
                    data: user,
                });
            });
        })(req, res);
    }
    // google oauth route handler
    async googleLogin(req, res) {
        passport_1.default.authenticate("google-employer", (err, user, info) => {
            if (err) {
                console.log(err);
                return res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/signin?msg=${info.message}`);
            }
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/singUp/employer?msg=Not+approved+yet&approvalId=${info.approvalId}`);
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
        const result = await employerServices_1.employerServices
            .instance()
            .checkCurrent(req.user, "EMPLOYER", formattedUser.isOauth);
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
    // get logged in controller
    async getCurrent(req, res) {
        const result = await employerServices_1.employerServices.instance().getCurrent(req.user);
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
    // upload register image
    async uploadRegistrationImage(req, res) {
        if (!req.params || !req.params.approvalId) {
            res.status(400).json({ success: false, msg: "Credential is missing" });
            console.error("params missing");
            return;
        }
        const { approvalId } = req.params;
        const [error, result] = await (0, utilFunctions_1.catchError)(employerServices_1.employerServices
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
    // upload profile picture route handler
    async uploadProfilePicture(req, res) {
        const [error, result] = await (0, utilFunctions_1.catchError)(employerServices_1.employerServices
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
    // edit username route handler
    async editUsername(req, res) {
        // get response
        const result = await employerServices_1.employerServices
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
        const result = await employerServices_1.employerServices
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
        const result = await employerServices_1.employerServices
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
        const result = await employerServices_1.employerServices
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
        const result = await employerServices_1.employerServices
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
        const result = await employerServices_1.employerServices
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
        const result = await employerServices_1.employerServices
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
}
exports.employerControllers = employerControllers;
