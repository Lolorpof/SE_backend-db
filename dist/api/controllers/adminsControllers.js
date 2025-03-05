"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminControllers = void 0;
const adminsServices_1 = require("../services/adminsServices");
const passport_1 = __importDefault(require("../middlewares/passport"));
class adminControllers {
    static adminController;
    static instance() {
        if (!this.adminController) {
            this.adminController = new adminControllers();
        }
        return this.adminController;
    }
    async getCurrent(req, res) {
        const result = await adminsServices_1.adminServices.instance().getCurrent(req.user);
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
    async login(req, res) {
        passport_1.default.authenticate("local-admin", (err, user, info) => {
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
    async logout(req, res) {
        // check current user type
        const result = await adminsServices_1.adminServices
            .instance()
            .checkCurrent(req.user, "ADMIN");
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
    async approvingUser(req, res) {
        const result = await adminsServices_1.adminServices
            .instance()
            .approvingUser(req.body, req.user.id);
        if (!result.success || !result.data) {
            res.status(result.status).json({
                success: result.success,
                msg: result.msg,
            });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    async getAllApproveRequest(req, res) {
        const result = await adminsServices_1.adminServices.instance().getAllApproveRequest();
        if (!result.success || !result.data) {
            res.status(result.status).json({
                success: result.success,
                msg: result.msg,
            });
            return;
        }
        res
            .status(result.status)
            .json({ success: result.success, msg: result.msg, data: result.data });
    }
    // handle create new admin (backend only)
    async create(req, res) {
        const result = await adminsServices_1.adminServices.instance().create();
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
}
exports.adminControllers = adminControllers;
