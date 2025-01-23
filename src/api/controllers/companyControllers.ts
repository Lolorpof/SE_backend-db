import { Request, Response } from "express";
import { companyServices } from "../services/companyServices";

export class companyControllers {
  // singleton design
  private static companyController: companyControllers | undefined;
  static instance() {
    if (!this.companyController) {
      this.companyController = new companyControllers();
    }
    return this.companyController;
  }

  async companyRegister(req: Request, res: Response) {
    const userForm = req.body;
    const result = await companyServices.instance().companyRegister(userForm);

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
