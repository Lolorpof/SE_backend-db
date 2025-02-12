import "dotenv/config";
import { Request, Response, NextFunction } from "express";

export const checkAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({ success: false, msg: "User isn't logged in" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, msg: "Something went wrong" });
    return;
  }

  next();
};

export const checkUnauthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.isAuthenticated()) {
      res
        .status(400)
        .json({ success: false, msg: "User is already logged in" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, msg: "Something went wrong" });
    return;
  }

  next();
};

export const checkUnauthenticatedOauth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.isAuthenticated()) {
      res.redirect(
        `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=Already logged in`
      );
      return;
    }
  } catch (error) {
    console.log(error);
    res.redirect(
      `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=error`
    );
    return;
  }

  next();
};

export const checkUploadedSingleFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    res.status(400).json({ success: false, msg: "No picture was uploaded" });
    return;
  }

  next();
};

export const checkPermissionHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["permission_key"];
  try {
    if (!header) {
      res
        .status(401)
        .json({ success: false, msg: "You don't have permission" });
      return;
    } else if (header !== process.env.CREATE_ADMIN_PERMISSIONKEY) {
      res
        .status(401)
        .json({ success: false, msg: "You don't have permission" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({ success: false, msg: "Something went wrong" });
    return;
  }

  next();
};

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if ((req.user as TUserSession).type !== "ADMIN") {
    res
      .status(401)
      .json({ success: false, msg: "User doesn't have permission" });
    return;
  }

  next();
};
