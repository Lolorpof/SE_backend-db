import { Request, Response } from "express";

export interface baseUserControllerInterfaces {
  login(req: Request, res: Response): Promise<void>;

  logout(req: Request, res: Response): Promise<void>;

  getCurrent(req: Request, res: Response): Promise<void>;
}

export interface adminControllerInterfaces
  extends baseUserControllerInterfaces {
  approvingUser(req: Request, res: Response): Promise<void>;

  getAllApproveRequest(req: Request, res: Response): Promise<void>;
}

export interface userControllerInterfaces extends baseUserControllerInterfaces {
  register(req: Request, res: Response): Promise<void>;

  uploadRegistrationImage(req: Request, res: Response): Promise<void>;
}

export interface userOauthControllerInterfaces
  extends userControllerInterfaces {
  googleLogin(req: Request, res: Response): Promise<void>;
}
