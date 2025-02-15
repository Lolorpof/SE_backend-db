import { Request, Response } from "express";
import { employerServices } from "../services/employerServices";
import {
  employerControllerInterfaces,
  userControllerInterfaces,
  userOauthControllerInterfaces,
} from "../interfaces/userControllerInterfaces";
import passport from "../middlewares/passport";
import { catchError } from "../utilities/utilFunctions";

export class employerControllers implements employerControllerInterfaces {
  // singleton design
  private static employerController: employerControllers | undefined;
  static instance() {
    if (!this.employerController) {
      this.employerController = new employerControllers();
    }
    return this.employerController;
  }

  // register employer route handler
  async register(req: Request, res: Response) {
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

  // login employer route handler
  async login(req: Request, res: Response): Promise<void> {
    passport.authenticate(
      "local-employer",
      (err: any, user: any, info: any) => {
        if (err) {
          console.log(err);
          return res.status(403).json({ success: false, msg: info.message });
        }
        if (!user) {
          return res.status(401).json({ success: false, msg: info.message });
        }

        req.logIn(user, (err) => {
          if (err) {
            res.status(400).json({
              success: false,
              msg: "Something went wrong when logging in",
            });
            return;
          }
          res.status(200).json({
            success: true,
            msg: "Successfully logged in",
            data: user,
          });
        });
      }
    )(req, res);
  }

  // google oauth route handler
  async googleLogin(req: Request, res: Response): Promise<void> {
    passport.authenticate(
      "google-employer",
      (err: any, user: any, info: any) => {
        if (err) {
          console.log(err);
          return res.redirect(
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=${info.message}`
          );
        }
        if (!user) {
          return res.redirect(
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=${info.message}`
          );
        }

        req.logIn(user, (err) => {
          if (err) {
            console.log(err);
            return res.redirect(
              `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}/login?msg=login`
            );
          }

          res.redirect(
            `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}?msg=success`
          );
        });
      }
    )(req, res);
  }

  // logout route handler
  async logout(req: Request, res: Response): Promise<void> {
    // check current user type
    const result = await employerServices
      .instance()
      .checkCurrent(req.user, "EMPLOYER", false);
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

  // get logged in controller
  async getCurrent(req: Request, res: Response): Promise<void> {
    const result = await employerServices.instance().getCurrent(req.user);
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

  // upload register image
  async uploadRegistrationImage(req: Request, res: Response): Promise<void> {
    if (!req.params || !req.params.approvalId) {
      res.status(400).json({ success: false, msg: "Credential is missing" });
      console.error("params missing");
      return;
    }
    const { approvalId } = req.params;
    const [error, result] = await catchError(
      employerServices
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
