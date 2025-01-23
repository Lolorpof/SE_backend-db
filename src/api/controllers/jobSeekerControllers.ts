import { jobSeekerServices } from "../services/jobSeekerServices";
import { Request, Response } from "express";

export class jobSeekerControllers {
  private static userController: jobSeekerControllers | undefined;
  static instance() {
    if (!this.userController) {
      this.userController = new jobSeekerControllers();
    }
    return this.userController;
  }

  // register
  async jobSeekerRegister(req: Request, res: Response) {
    const userForm = req.body; // frontend sent in body user object
    const result = await jobSeekerServices
      .instance()
      .jobSeekerRegister(userForm);

    if (result.data) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg, data: result.data });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg });
  }
}
