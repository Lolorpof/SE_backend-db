"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResumeImageMiddleware = exports.uploadProfileImageMiddleware = exports.uploadRegisterImageMiddleware = void 0;
const multer_1 = __importStar(require("multer"));
const allowedPictureMimeTypes = ["image/jpeg", "image/png"];
// registration approval multer
const uploadRegisterImage = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 3, files: 1 }, //3 MB
    fileFilter(req, file, callback) {
        // file type is correct (jpg/png)
        if (allowedPictureMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new multer_1.MulterError("LIMIT_UNEXPECTED_FILE", "Incorrect image format"));
        }
    },
});
const uploadRegisterImageMiddleware = (req, res, next) => {
    uploadRegisterImage.single("image")(req, res, (err) => {
        // file size error response
        const error = err;
        if (error) {
            console.log(`code: ${error.code}, msg: ${error.message}`);
            if (error.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({ success: false, msg: error.message });
                return;
            }
            else if (error.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({ success: false, msg: error.field });
                return;
            }
            else if (error.code === "LIMIT_FILE_COUNT") {
                res.status(400).json({
                    success: false,
                    msg: error.message,
                });
                return;
            }
            res.status(403).json({ success: false, msg: "Something went wrong" });
            return;
        }
        next();
    });
};
exports.uploadRegisterImageMiddleware = uploadRegisterImageMiddleware;
// user's profile image multer
const uploadProfileImage = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 7, files: 1 }, //7 MB
    fileFilter(req, file, callback) {
        // file type is correct (jpg/png)
        if (allowedPictureMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new multer_1.MulterError("LIMIT_UNEXPECTED_FILE", "Incorrect image format"));
        }
    },
});
const uploadProfileImageMiddleware = (req, res, next) => {
    uploadProfileImage.single("image")(req, res, (err) => {
        // file size error response
        const error = err;
        if (error) {
            console.log(`code: ${error.code}, msg: ${error.message}`);
            if (error.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({ success: false, msg: error.message });
                return;
            }
            else if (error.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({
                    success: false,
                    msg: error.field,
                });
                return;
            }
            else if (error.code === "LIMIT_FILE_COUNT") {
                res.status(400).json({
                    success: false,
                    msg: error.message,
                });
                return;
            }
            res.status(403).json({ success: false, msg: "Something went wrong" });
            return;
        }
        next();
    });
};
exports.uploadProfileImageMiddleware = uploadProfileImageMiddleware;
// job seeker's resume image multer
const uploadResumeImage = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 9, files: 1 }, //9 MB
    fileFilter(req, file, callback) {
        // file type is correct (jpg/png)
        if (allowedPictureMimeTypes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new multer_1.MulterError("LIMIT_UNEXPECTED_FILE", "Incorrect image format"));
        }
    },
});
const uploadResumeImageMiddleware = (req, res, next) => {
    uploadResumeImage.single("image")(req, res, (err) => {
        // file size error response
        const error = err;
        if (error) {
            console.log(`code: ${error.code}, msg: ${error.message}`);
            if (error.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({ success: false, msg: error.message });
                return;
            }
            else if (error.code === "LIMIT_UNEXPECTED_FILE") {
                res.status(400).json({ success: false, msg: error.field });
                return;
            }
            else if (error.code === "LIMIT_FILE_COUNT") {
                res.status(400).json({
                    success: false,
                    msg: error.message,
                });
                return;
            }
            res.status(403).json({ success: false, msg: "Something went wrong" });
            return;
        }
        next();
    });
};
exports.uploadResumeImageMiddleware = uploadResumeImageMiddleware;
