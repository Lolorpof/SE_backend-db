import { Request, Response } from "express";
import { companyServices } from "../services/companyServices";
import {
  companyControllerInterfaces,
  userControllerInterfaces,
} from "../interfaces/userControllerInterfaces";
import passport from "../middlewares/passport";
import { catchError } from "../utilities/utilFunctions";

export class companyControllers implements companyControllerInterfaces {
  // singleton design
  private static companyController: companyControllers | undefined;
  static instance() {
    if (!this.companyController) {
      this.companyController = new companyControllers();
    }
    return this.companyController;
  }

  // register company route handler
  async register(req: Request, res: Response) {
    const userForm = req.body;
    const result = await companyServices.instance().register(userForm);

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

  // login company route handler
  async login(req: Request, res: Response): Promise<void> {
    passport.authenticate("local-company", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(403).json({ success: false, msg: info.message });
      }
      if (!user) {
        return res.status(401).json({ success: false, msg: info.message });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(403).json({
            success: false,
            msg: "Something went wrong when logging in",
          });
        }

        res
          .status(200)
          .json({ success: true, msg: "Successfully logged in", data: user });
      });
    })(req, res);
  }

  // logout route handler
  async logout(req: Request, res: Response): Promise<void> {
    // check current user type
    const result = await companyServices
      .instance()
      .checkCurrent(req.user, "COMPANY");
    if (!result.success || !result.data) {
      res.status(result.status).json({
        success: false,
        msg: result.msg,
      });
      return;
    }

    req.logOut((err) => {
      if (err) {
        res.status(403).json({
          success: false,
          msg: "Something went wrong when logging out",
        });
        return;
      }

      // destroy session cookie
      req.session.destroy((err) => {
        if (err) {
          res.status(403).json({
            success: false,
            msg: "Something went wrong when removing session cookie",
          });
          return;
        }

        res.clearCookie("sid");
        res.status(200).json({
          success: true,
          msg: "Successfuly logged out",
          data: result.data,
        });
      });
    });
  }

  // get current company route handler
  async getCurrent(req: Request, res: Response): Promise<void> {
    const result = await companyServices.instance().getCurrent(req.user);
    if (!result.success || !result.data) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }

  // upload register image route handler
  async uploadRegistrationImage(req: Request, res: Response): Promise<void> {
    if (!req.params || !req.params.approvalId) {
      res.status(400).json({ success: false, msg: "Credential is missing" });
      console.error("params missing");
      return;
    }
    const { approvalId } = req.params;
    const [error, result] = await catchError(
      companyServices
        .instance()
        .uploadRegistrationImage(approvalId, req.file as Express.Multer.File)
    );

    if (error) {
      console.log(error);
      res.status(403).json({ success: false, msg: "Credential is missing" });
      return;
    }

    if (!result.success || !result.data) {
      res
        .status(result.status)
        .json({ success: result.success, msg: result.msg });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }
}
