import { Request, Response } from "express";

export class employerControllers {
  private static employerController: employerControllers | undefined;
  static instance() {
    if (!this.employerController) {
      this.employerController = new employerControllers();
    }
    return this.employerController;
  }

  // register
  async employerRegister(req: Request, res: Response) {
    const userForm = req.body;
  }
}
