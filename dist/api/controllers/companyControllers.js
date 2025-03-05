"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyControllers = void 0;
const companyServices_1 = require("../services/companyServices");
const passport_1 = __importDefault(require("../middlewares/passport"));
const utilFunctions_1 = require("../utilities/utilFunctions");
class companyControllers {
    // singleton design
    static companyController;
    static instance() {
        if (!this.companyController) {
            this.companyController = new companyControllers();
        }
        return this.companyController;
    }
    // register company route handler
    async register(req, res) {
        const userForm = req.body;
        const result = await companyServices_1.companyServices.instance().register(userForm);
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
    // login company route handler
    async login(req, res) {
        passport_1.default.authenticate("local-company", (err, user, info) => {
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
                res
                    .status(200)
                    .json({ success: true, msg: "Successfully logged in", data: user });
            });
        })(req, res);
    }
    // logout route handler
    async logout(req, res) {
        // check current user type
        const result = await companyServices_1.companyServices
            .instance()
            .checkCurrent(req.user, "COMPANY");
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
    // get current company route handler
    async getCurrent(req, res) {
        const result = await companyServices_1.companyServices.instance().getCurrent(req.user);
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
    // upload register image route handler
    async uploadRegistrationImage(req, res) {
        if (!req.params || !req.params.approvalId) {
            res.status(400).json({ success: false, msg: "Credential is missing" });
            console.error("params missing");
            return;
        }
        const { approvalId } = req.params;
        const [error, result] = await (0, utilFunctions_1.catchError)(companyServices_1.companyServices
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
        const [error, result] = await (0, utilFunctions_1.catchError)(companyServices_1.companyServices
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
    async editOfficialName(req, res) {
        // get response
        const result = await companyServices_1.companyServices
            .instance()
            .editOfficialName(req.body, req.user);
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
        const result = await companyServices_1.companyServices
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
    // edit about route handler
    async editAbout(req, res) {
        const result = await companyServices_1.companyServices
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
        const result = await companyServices_1.companyServices
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
        const result = await companyServices_1.companyServices
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
        const result = await companyServices_1.companyServices
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
exports.companyControllers = companyControllers;
