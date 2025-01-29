import { Request, Response } from "express";

export interface adminControllerInterfaces {
  login(req: Request, res: Response): Promise<void>;

  logout(req: Request, res: Response): Promise<void>;

  getCurrent(req: Request, res: Response): Promise<void>;
}

export interface userControllerInterfaces extends adminControllerInterfaces {
  register(req: Request, res: Response): Promise<void>;
}

export interface userOauthControllerInterfaces {
  googleLogin(req: Request, res: Response): Promise<void>;
}
