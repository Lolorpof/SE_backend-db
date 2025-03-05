"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.checkCompany = exports.checkJobSeeker = exports.checkEmployer = void 0;
const checkEmployer = (req, res, next) => {
    const user = req.user;
    if (!user || user.type !== "EMPLOYER") {
        res.status(403).json({ success: false, msg: "Access denied. Only employers can perform this action.", data: null });
        return;
    }
    next();
};
exports.checkEmployer = checkEmployer;
const checkJobSeeker = (req, res, next) => {
    const user = req.user;
    if (!user || user.type !== "JOBSEEKER") {
        res.status(403).json({ success: false, msg: "Access denied. Only job seekers can perform this action.", data: null });
        return;
    }
    next();
};
exports.checkJobSeeker = checkJobSeeker;
const checkCompany = (req, res, next) => {
    const user = req.user;
    if (!user || user.type !== "COMPANY") {
        res.status(403).json({ success: false, msg: "Access denied. Only companies can perform this action.", data: null });
        return;
    }
    next();
};
exports.checkCompany = checkCompany;
const checkAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.type !== "ADMIN") {
        res.status(403).json({ success: false, msg: "Access denied. Only admins can perform this action.", data: null });
        return;
    }
    next();
};
exports.checkAdmin = checkAdmin;
