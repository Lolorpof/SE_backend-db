import { Request, Response } from "express";

export interface userControllerInterfaces {
  register(req: Request, res: Response): Promise<void>;

  login(req: Request, res: Response): Promise<void>;

  logout(req: Request, res: Response): Promise<void>;

  // getById(req: Request, res: Response): Promise<void>;

  getCurrent(req: Request, res: Response): Promise<void>;
}
