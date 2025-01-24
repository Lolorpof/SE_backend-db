import { Request, Response } from "express";
import { employerServices } from "../services/employerServices";

export class employerControllers {
  // singleton design
  private static employerController: employerControllers | undefined;
  static instance() {
    if (!this.employerController) {
      this.employerController = new employerControllers();
    }
    return this.employerController;
  }

  // register
  async employerRegister(req: Request, res: Response) {
    const userForm = req.body; // frontend sent in body user object
    const result = await employerServices.instance().register(userForm);

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
