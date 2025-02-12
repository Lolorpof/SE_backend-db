import multer, { MulterError } from "multer";
import { NextFunction, Request, Response } from "express";

const allowedPictureMimeTypes = ["image/jpeg", "image/png"];

// registration approval multer
const uploadRegisterImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 3 }, //3 MB
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
  uploadRegisterImage.single("image")(req, res, (err) => {
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
      }
      res.status(403).json({ msg: "Something went wrong", ok: false });
      return;
    }

    next();
  });
};
