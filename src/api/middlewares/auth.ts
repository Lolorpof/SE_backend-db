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
