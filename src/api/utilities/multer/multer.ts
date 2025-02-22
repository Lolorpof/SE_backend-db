import multer, { MulterError } from "multer";
import { NextFunction, Request, Response } from "express";

const allowedPictureMimeTypes = ["image/jpeg", "image/png"];

// registration approval multer
const uploadRegisterImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 3, files: 1 }, //3 MB
  fileFilter(req, file, callback) {
    // file type is correct (jpg/png)
    if (allowedPictureMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new MulterError("LIMIT_UNEXPECTED_FILE", "Incorrect image format")
      );
    }
  },
});
export const uploadRegisterImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadRegisterImage.single("image")(req, res, (err: any) => {
    // file size error response
    const error = err as MulterError;
    if (error) {
      console.log(`code: ${error.code}, msg: ${error.message}`);
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ success: false, msg: error.message });
        return;
      } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({ success: false, msg: error.field });
        return;
      } else if (error.code === "LIMIT_FILE_COUNT") {
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

// user's profile image multer
const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 7, files: 1 }, //7 MB
  fileFilter(req, file, callback) {
    // file type is correct (jpg/png)
    if (allowedPictureMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new MulterError("LIMIT_UNEXPECTED_FILE", "Incorrect image format")
      );
    }
  },
});
export const uploadProfileImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadProfileImage.single("image")(req, res, (err: any) => {
    // file size error response
    const error = err as MulterError;
    if (error) {
      console.log(`code: ${error.code}, msg: ${error.message}`);
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ success: false, msg: error.message });
        return;
      } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({
          success: false,
          msg: error.field,
        });
        return;
      } else if (error.code === "LIMIT_FILE_COUNT") {
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

// job seeker's resume image multer
const uploadResumeImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 9, files: 1 }, //9 MB
  fileFilter(req, file, callback) {
    // file type is correct (jpg/png)
    if (allowedPictureMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new MulterError("LIMIT_UNEXPECTED_FILE", "Incorrect image format")
      );
    }
  },
});
export const uploadResumeImageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadResumeImage.single("image")(req, res, (err: any) => {
    // file size error response
    const error = err as MulterError;
    if (error) {
      console.log(`code: ${error.code}, msg: ${error.message}`);
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ success: false, msg: error.message });
        return;
      } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({ success: false, msg: error.field });
        return;
      } else if (error.code === "LIMIT_FILE_COUNT") {
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
