"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.checkPermissionHeader = exports.checkUploadedSingleFile = exports.checkUnauthenticatedOauth = exports.checkUnauthenticated = exports.checkAuthenticated = void 0;
require("dotenv/config");
const checkAuthenticated = async (req, res, next) => {
    try {
        if (!req.isAuthenticated()) {
            res.status(401).json({ success: false, msg: "User isn't logged in" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ success: false, msg: "Something went wrong" });
        return;
    }
    next();
};
exports.checkAuthenticated = checkAuthenticated;
const checkUnauthenticated = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            res
                .status(400)
                .json({ success: false, msg: "User is already logged in" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ success: false, msg: "Something went wrong" });
        return;
    }
    next();
};
exports.checkUnauthenticated = checkUnauthenticated;
const checkUnauthenticatedOauth = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=Already logged in`);
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.redirect(`${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=error`);
        return;
    }
    next();
};
exports.checkUnauthenticatedOauth = checkUnauthenticatedOauth;
const checkUploadedSingleFile = async (req, res, next) => {
    if (!req.file) {
        res.status(400).json({ success: false, msg: "No picture was uploaded" });
        return;
    }
    next();
};
exports.checkUploadedSingleFile = checkUploadedSingleFile;
const checkPermissionHeader = async (req, res, next) => {
    const header = req.headers["permission_key"];
    try {
        if (!header) {
            res
                .status(401)
                .json({ success: false, msg: "You don't have permission" });
            return;
        }
        else if (header !== process.env.CREATE_ADMIN_PERMISSIONKEY) {
            res
                .status(401)
                .json({ success: false, msg: "You don't have permission" });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(403).json({ success: false, msg: "Something went wrong" });
        return;
    }
    next();
};
exports.checkPermissionHeader = checkPermissionHeader;
const checkAdmin = async (req, res, next) => {
    if (req.user.type !== "ADMIN") {
        res
            .status(401)
            .json({ success: false, msg: "User doesn't have permission" });
        return;
    }
    next();
};
exports.checkAdmin = checkAdmin;
