import { Request, Response } from "express";
import { adminServices } from "../services/adminsServices";
import { adminControllerInterfaces } from "../interfaces/userControllerInterfaces";
import passport from "../middlewares/passport";

export class adminControllers implements adminControllerInterfaces {
  static adminController: adminControllers | undefined;
  static instance() {
    if (!this.adminController) {
      this.adminController = new adminControllers();
    }
    return this.adminController;
  }

  async getCurrent(req: Request, res: Response): Promise<void> {
    const result = await adminServices.instance().getCurrent(req.user);

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

  async login(req: Request, res: Response): Promise<void> {
    passport.authenticate("local-admin", (err: any, user: any, info: any) => {
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

  async logout(req: Request, res: Response): Promise<void> {
    // check current user type
    const result = await adminServices
      .instance()
      .checkCurrent(req.user, "ADMIN");
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

  async approvingUser(req: Request, res: Response): Promise<void> {
    const result = await adminServices
      .instance()
      .approvingUser(req.body, (req.user as TAdminSession).id);

    if (!result.success || !result.data) {
      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
      });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }

  async getAllApproveRequest(req: Request, res: Response): Promise<void> {
    const result = await adminServices.instance().getAllApproveRequest();

    if (!result.success || !result.data) {
      res.status(result.status).json({
        success: result.success,
        msg: result.msg,
      });
      return;
    }

    res
      .status(result.status)
      .json({ success: result.success, msg: result.msg, data: result.data });
  }

  // handle create new admin (backend only)
  async create(req: Request, res: Response): Promise<void> {
    const result = await adminServices.instance().create();

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
