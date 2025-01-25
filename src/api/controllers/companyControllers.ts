import { Request, Response } from "express";
import { companyServices } from "../services/companyServices";
import { userControllerInterfaces } from "../interfaces/userControllerInterfaces";
import passport from "../middlewares/passport";

export class companyControllers implements userControllerInterfaces {
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
      .checkCurrent(req.user, false, "COMPANY");
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
}
