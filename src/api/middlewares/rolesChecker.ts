import { Request, Response, NextFunction } from "express";

export const checkEmployer = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as TEmployerSession;
  if (!user || user.type !== "EMPLOYER") {
    res.status(403).json({ success: false, msg: "Access denied. Only employers can perform this action.", data: null });
    return;
  }
  next();
};


export const checkJobSeeker = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as TJobSeekerSession;
  if (!user || user.type !== "JOBSEEKER") {
    res.status(403).json({ success: false, msg: "Access denied. Only job seekers can perform this action.", data: null });
    return;
  }
  next();

};

export const checkCompany = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as TCompanySession;
  if (!user || user.type !== "COMPANY") {
    res.status(403).json({ success: false, msg: "Access denied. Only companies can perform this action.", data: null });
    return;
  }
  next();
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as TAdminSession;
  if (!user || user.type !== "ADMIN") {
    res.status(403).json({ success: false, msg: "Access denied. Only admins can perform this action.", data: null });
    return;
  }
  next();
};


    
